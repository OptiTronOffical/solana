"use client"

import { useState } from "react"
import { Modals } from "@/components/modals"
import { Button } from "@/components/ui/button"

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0A001F] to-[#16003A] p-4 flex flex-col items-center justify-center">
      {/* Background gradient circles */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-lg mx-auto px-4">
        
        {/* RAYDAI Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              {/* Purple glow effect */}
              <div className="absolute inset-0 bg-purple-600 blur-xl opacity-50 rounded-full w-20 h-20"></div>
              {/* Main logo circle */}
              <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-2xl">
                <span className="text-2xl font-bold text-white">R</span>
              </div>
            </div>
            <div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                RAYDAI
              </h1>
              <div className="flex items-center justify-center gap-3 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-gray-300 text-lg uppercase tracking-[0.3em]">AI STAKING PLATFORM</p>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          
          {/* Tagline */}
          <p className="text-2xl text-white font-light max-w-xl mx-auto">
            The Ultimate AI-Powered Staking & GPU Computing Ecosystem
          </p>
        </div>

        {/* Main Giveaway Card */}
        <div className="relative bg-gradient-to-br from-[#0D0A2C]/90 to-[#1A1449]/90 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 shadow-2xl shadow-purple-500/20 mb-8">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-purple-500 rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-purple-500 rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-purple-500 rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-purple-500 rounded-br-lg"></div>
          
          {/* Giveaway Badge */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-300 text-black font-bold px-6 py-2 rounded-full text-sm uppercase tracking-wider shadow-lg">
              🎁 EXCLUSIVE GIVEAWAY
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-100">$50 SOL</span> GIVEAWAY
            </h2>
            <p className="text-gray-300 text-lg mb-6">
              Connect your wallet to automatically enter our exclusive giveaway
            </p>
            
            {/* Prize Display */}
            <div className="inline-flex items-center justify-center gap-4 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-2xl p-6 border border-purple-500/30 mb-6">
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-yellow-300 to-yellow-100 bg-clip-text text-transparent">
                  $50
                </div>
                <div className="text-white font-semibold">SOLANA</div>
              </div>
              <div className="text-gray-400">→</div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">1 LUCKY WINNER</div>
                <div className="text-sm text-gray-400">Selected Randomly</div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800/30 rounded-xl p-4 text-center border border-gray-700">
              <div className="text-green-400 font-bold mb-2">✓ INSTANT ENTRY</div>
              <div className="text-sm text-gray-400">Connect wallet to enter</div>
            </div>
            <div className="bg-gray-800/30 rounded-xl p-4 text-center border border-gray-700">
              <div className="text-blue-400 font-bold mb-2">✓ NO DEPOSIT</div>
              <div className="text-sm text-gray-400">Completely free to enter</div>
            </div>
            <div className="bg-gray-800/30 rounded-xl p-4 text-center border border-gray-700">
              <div className="text-purple-400 font-bold mb-2">✓ INSTANT WIN</div>
              <div className="text-sm text-gray-400">Prize paid immediately</div>
            </div>
          </div>
        </div>

        {/* Main Connect Button */}
        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="w-full group relative overflow-hidden py-6 rounded-2xl shadow-2xl mb-8"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)',
            border: '2px solid rgba(168, 85, 247, 0.5)',
            fontSize: '20px',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}
        >
          <div className="flex items-center justify-center gap-4">
            <span className="text-white drop-shadow-lg text-xl">CONNECT WALLET & ENTER GIVEAWAY</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </Button>

        {/* RAYDAI Platform Features */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 mb-8">
          <h3 className="text-2xl font-bold text-white text-center mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">RAYDAI</span> PLATFORM BENEFITS
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold">⚡</span>
                </div>
                <div>
                  <div className="font-bold text-white">Premium GPU Access</div>
                  <div className="text-gray-400 text-sm">High-performance AI computing infrastructure</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold">💰</span>
                </div>
                <div>
                  <div className="font-bold text-white">Massive Staking Rewards</div>
                  <div className="text-gray-400 text-sm">High APY returns on your holdings</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold">🤝</span>
                </div>
                <div>
                  <div className="font-bold text-white">Community Governance</div>
                  <div className="text-gray-400 text-sm">Vote on platform decisions</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-600 to-cyan-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold">🚀</span>
                </div>
                <div>
                  <div className="font-bold text-white">AI-Powered Growth</div>
                  <div className="text-gray-400 text-sm">Advanced algorithms maximizing returns</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-800">
            <div className="text-2xl font-bold text-purple-400">$2.4M+</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Total Value Staked</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-800">
            <div className="text-2xl font-bold text-cyan-400">5,200+</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Active Users</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-800">
            <div className="text-2xl font-bold text-green-400">99.8%</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Uptime</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-800">
            <div className="text-2xl font-bold text-yellow-400">24/7</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Support</div>
          </div>
        </div>

        {/* Terms & Footer */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-white transition-colors cursor-pointer">Disclaimer</span>
          </div>
          
          <p className="text-xs text-gray-600 max-w-md mx-auto">
            By connecting your wallet, you automatically enter the $50 SOL giveaway and agree to our terms.
            You must be 18+ to participate. Giveaway ends March 15, 2024.
          </p>
          
          <div className="pt-4 border-t border-gray-800/50">
            <p className="text-sm text-gray-500">
              RAYDAI © 2026 • Premium AI Staking & GPU Computing Platform
            </p>
          </div>
        </div>
      </div>

      <Modals isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {/* Mobile bottom spacing */}
      <div className="h-8"></div>
    </main>
  )
                }
