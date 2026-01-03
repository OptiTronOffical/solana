"use client"

import { useState } from "react"
import { Modals } from "@/components/modals"
import { Button } from "@/components/ui/button"

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0A001F] to-[#16003A] p-4 pb-20">
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 bg-gray-900/90 backdrop-blur-lg border-b border-gray-800/50 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center">
            <img 
              src="https://www.raydai.com/assets/raydai-logo-CmF4YvEe.png" 
              alt="RAYDAI" 
              className="h-8 w-auto"
              loading="lazy"
            />
            <div className="ml-2">
              <div className="text-xs text-gray-400 font-medium">AI STAKING PLATFORM</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 w-full max-w-sm mx-auto flex flex-col items-center space-y-8">
        
        {/* Giveaway Card */}
        <div className="w-full bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 shadow-xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-900/30 to-blue-800/30 px-4 py-2 rounded-full mb-6">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-300 text-sm font-semibold">EXCLUSIVE GIVEAWAY</span>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
            
            <div className="mb-8">
              <div className="text-6xl font-bold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
               Upto 50 Sol or unique NFTs
              </div>
              <div className="text-white font-semibold text-xl">SOLANA PRIZE</div>
              <div className="text-gray-400 text-sm mt-2">Connect wallet to automatically enter</div>
            </div>

            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
                <div>
                  <div className="font-semibold text-white">Instant Entry</div>
                  <div className="text-sm text-gray-400">Connect wallet to enter giveaway</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div>
                  <div className="font-semibold text-white">Instant Win</div>
                  <div className="text-sm text-gray-400">Prize paid immediately to winner</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                </div>
                <div>
                  <div className="font-semibold text-white">No Deposit Needed</div>
                  <div className="text-sm text-gray-400">Completely free to participate</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dark Blue Connect Button */}
        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="w-full py-6 rounded-xl shadow-2xl transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 50%, #1e3a8a 100%)',
            border: '2px solid rgba(30, 64, 175, 0.5)',
            fontSize: '18px',
            fontWeight: '700',
          }}
        >
          <div className="flex items-center justify-center gap-3">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-white text-lg">CONNECT WALLET & ENTER</span>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
        </Button>

        {/* RAYDAI Platform Features */}
        <div className="w-full space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-3">RAYDAI Platform Features</h2>
            <p className="text-gray-400 text-sm">Premium AI staking rewards</p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-xl p-5 border border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-lg">High Yield Staking</div>
                  <div className="text-sm text-gray-400">Earn up to 25% APY</div>
                </div>
                <div className="text-green-400 font-bold text-right">
                  <div className="text-2xl">25%</div>
                  <div className="text-xs">APY</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-xl p-5 border border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-lg">GPU AI Computing</div>
                  <div className="text-sm text-gray-400">Premium hardware access</div>
                </div>
                <div className="text-blue-400 font-bold text-right">
                  <div className="text-2xl">24/7</div>
                  <div className="text-xs">ACCESS</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-xl p-5 border border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-lg">Instant Rewards</div>
                  <div className="text-sm text-gray-400">Daily distribution</div>
                </div>
                <div className="text-purple-400 font-bold text-right">
                  <div className="text-2xl">DAILY</div>
                  <div className="text-xs">PAYOUTS</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="w-full grid grid-cols-3 gap-3">
          <div className="bg-black/40 rounded-xl p-4 text-center">
            <div className="text-xl font-bold text-blue-400">$2.4M+</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">STAKED</div>
          </div>
          <div className="bg-black/40 rounded-xl p-4 text-center">
            <div className="text-xl font-bold text-cyan-400">5K+</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">USERS</div>
          </div>
          <div className="bg-black/40 rounded-xl p-4 text-center">
            <div className="text-xl font-bold text-green-400">24/7</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">SUPPORT</div>
          </div>
        </div>

        {/* Terms & Info */}
        <div className="w-full space-y-4 pt-4 border-t border-gray-800/50">
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-2">
              Connect your wallet to automatically enter the 50 SOL giveaway
            </p>
            <p className="text-xs text-gray-500">
              By connecting, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
            <span>AI Staking</span>
            <span>•</span>
            <span>Web3</span>
            <span>•</span>
            <span>DeFi</span>
          </div>
        </div>
      </div>

      <Modals isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {/* Mobile bottom spacing */}
      <div className="h-20"></div>
    </main>
  )
      }
