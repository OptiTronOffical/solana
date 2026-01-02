"use client"

import { useState } from "react"
import { Modals } from "@/components/modals"
import { Button } from "@/components/ui/button"
import { PhantomLogo } from "@/components/icons/phantom-logo"

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0A0B1F] via-[#161832] to-[#1A1D3E] flex items-center justify-center p-6">
      <div className="container mx-auto max-w-md">
        <div className="bg-gradient-to-br from-[#1A1D3E]/80 to-[#0A0B1F]/90 backdrop-blur-lg rounded-2xl p-8 border border-[#2D3280]/30 shadow-2xl shadow-[#2D3280]/10">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#AB9FF2] to-[#7B61FF] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-[#7B61FF]/30">
              <PhantomLogo className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#AB9FF2] via-[#7B61FF] to-[#5B43F5] bg-clip-text text-transparent mb-2">
              Welcome to SolPump.fun
            </h1>
            <p className="text-gray-300 mb-6">
              Connect your wallet to start using solpump.fun and explore the Solana ecosystem
            </p>
          </div>
          
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="w-full group relative overflow-hidden" 
            size="lg"
            style={{
              background: 'linear-gradient(135deg, #7B61FF 0%, #5B43F5 50%, #3A27E8 100%)',
              border: '1px solid rgba(123, 97, 255, 0.3)',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              padding: '16px',
              transition: 'all 0.3s ease'
            }}
          >
            <div className="flex items-center justify-center gap-3">
              <PhantomLogo className="w-5 h-5" />
              <span>Connect Phantom Wallet</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Button>
          
          <p className="text-sm text-gray-400 text-center mt-6">
            By connecting, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>

      <Modals isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  )
}