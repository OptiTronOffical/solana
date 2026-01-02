"use client"

import { useState } from "react"
import { Modals } from "@/components/modals"
import { Button } from "@/components/ui/button"

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-6">
      <div className="container mx-auto max-w-md">
        <Button onClick={() => setIsModalOpen(true)} className="w-full" size="lg">
          Connect Wallet
        </Button>
      </div>

      <Modals isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  )
}
