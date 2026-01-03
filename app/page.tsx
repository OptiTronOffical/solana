"use client"

import { useState } from "react"
import { Modals } from "@/components/modals"
import { Button } from "@/components/ui/button"
import { AiOutlineRocket, GpuCardIcon, GiftIcon, UsersIcon, AwardIcon } from "./icons"

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950/30 to-gray-950 p-4 flex flex-col items-center justify-center">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md mx-auto flex flex-col items-center space-y-8 px-4">
        
        {/* Logo & Title */}
        <div className="text-center mt-8">
          <div className="relative mx-auto mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-600/30">
              <AiOutlineRocket className="w-12 h-12 text-white" />
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 w-24 h-24 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 rounded-2xl blur-xl opacity-50"></div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent mb-2">
            RAYDAI
          </h1>
          <p className="text-lg text-gray-300 uppercase tracking-widest font-semibold">
            AI Staking Platform
          </p>
        </div>

        {/* Giveaway Card */}
        <div className="w-full bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 shadow-2xl shadow-purple-500/20 relative overflow-hidden">
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent -translate-x-full animate-shimmer"></div>
          
          {/* Badge */}
          <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-500 to-yellow-300 text-black font-bold px-4 py-1 rounded-full text-sm uppercase tracking-wider shadow-lg">
            EXCLUSIVE
          </div>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-300 rounded-xl flex items-center justify-center">
              <GiftIcon className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">$50 SOL GIVEAWAY</h2>
              <p className="text-gray-400 text-sm">Connect to Enter</p>
            </div>
          </div>

          {/* Giveaway Details */}
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/20">
              <div className="text-center mb-3">
                <div className="text-4xl font-bold bg-gradient-to-r from-yellow-300 to-yellow-100 bg-clip-text text-transparent">
                  $50
                </div>
                <div className="text-white font-bold text-lg">SOLANA PRIZE</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">One lucky winner gets $50 SOL</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-300">Drawing on March 15, 2024</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-300">No purchase necessary</span>
                </div>
              </div>
            </div>

            {/* Countdown timer placeholder */}
            <div className="bg-gray-900/70 rounded-xl p-4 text-center border border-gray-700">
              <div className="text-gray-400 text-sm mb-2">GIVEAWAY ENDS IN</div>
              <div className="flex justify-center gap-2">
                {[15, 8, 42, 30].map((num, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                      <span className="text-xl font-bold text-white">{num}</span>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      {['DAYS', 'HRS', 'MIN', 'SEC'][idx]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Connect Button */}
        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="w-full group relative overflow-hidden py-6 rounded-2xl shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)',
            border: '2px solid rgba(168, 85, 247, 0.5)',
            fontSize: '18px',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          <div className="flex items-center justify-center gap-3">
            <GiftIcon className="w-6 h-6" />
            <span className="text-white drop-shadow-lg">CONNECT TO ENTER GIVEAWAY</span>
            <AiOutlineRocket className="w-6 h-6" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </Button>

        {/* RAYDAI Features */}
        <div className="w-full space-y-4">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-white mb-2">Why Choose RAYDAI?</h3>
            <p className="text-gray-400">Premium AI Staking Platform</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center mb-3">
                <GpuCardIcon className="w-5 h-5 text-white" />
              </div>
              <div className="font-bold text-white">Premium GPU Access</div>
              <div className="text-sm text-gray-400">High-performance computing</div>
            </div>
            
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center mb-3">
                <AwardIcon className="w-5 h-5 text-white" />
              </div>
              <div className="font-bold text-white">Massive Rewards</div>
              <div className="text-sm text-gray-400">High APY staking</div>
            </div>
            
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mb-3">
                <UsersIcon className="w-5 h-5 text-white" />
              </div>
              <div className="font-bold text-white">Community First</div>
              <div className="text-sm text-gray-400">Governance & voting</div>
            </div>
            
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-lg flex items-center justify-center mb-3">
                <AiOutlineRocket className="w-5 h-5 text-white" />
              </div>
              <div className="font-bold text-white">Cutting-Edge AI</div>
              <div className="text-sm text-gray-400">Latest technology</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="w-full grid grid-cols-3 gap-3">
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 text-center border border-gray-800">
            <div className="text-lg font-bold text-purple-400">$2.4M+</div>
            <div className="text-xs text-gray-400">STAKED</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 text-center border border-gray-800">
            <div className="text-lg font-bold text-cyan-400">5K+</div>
            <div className="text-xs text-gray-400">USERS</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 text-center border border-gray-800">
            <div className="text-lg font-bold text-yellow-400">24/7</div>
            <div className="text-xs text-gray-400">SUPPORT</div>
          </div>
        </div>

        {/* Terms */}
        <div className="text-center space-y-2 pt-4">
          <p className="text-sm text-gray-400">
            Connect wallet to enter $50 SOL giveaway + get early access to RAYDAI platform
          </p>
          <p className="text-xs text-gray-500">
            By connecting, you agree to our Terms and Privacy Policy
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
            <span>AI Staking</span>
            <span>•</span>
            <span>GPU Computing</span>
            <span>•</span>
            <span>Web3</span>
          </div>
        </div>
      </div>

      <Modals isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {/* Mobile bottom space */}
      <div className="h-8"></div>
    </main>
  )
}