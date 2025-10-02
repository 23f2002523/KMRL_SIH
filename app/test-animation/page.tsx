"use client"

import { NetworkAnimation } from '@/components/network-animation'

export default function TestAnimationPage() {
  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      <NetworkAnimation />
      <div className="relative z-20 flex items-center justify-center min-h-screen">
        <div className="text-center text-white bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <h1 className="text-4xl font-bold mb-4">3D Network Animation Test</h1>
          <p className="text-xl">You should see animated nodes and connections in the background</p>
          <p className="text-sm mt-4 opacity-70">Move your mouse to interact with the nodes</p>
        </div>
      </div>
    </div>
  )
}