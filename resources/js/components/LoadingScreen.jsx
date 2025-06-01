"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"

const funFacts = [
  "The first computer bug was an actual bug - a moth trapped in a Harvard Mark II computer in 1947.",
  "The world's first website is still online at info.cern.ch.",
  "A 1 GB flash drive would have cost $10,000 in the year 2000.",
  "The QWERTY keyboard layout was designed to slow typing and prevent typewriter jams.",
  "More than 90% of the world's currency is digital.",
  "The first computer programmer was a woman - Ada Lovelace.",
  "The average person blinks 20 times per minute, but only 7 times when using a computer.",
  "The first web browser was called 'WorldWideWeb' and was created by Tim Berners-Lee in 1990.",
  "The Firefox logo isn't a fox. It's actually a red panda.",
  "The term 'bug' to describe computer glitches was popularized by Grace Hopper.",
]

const LoadingScreen = ({ duration = 250 }) => {
  const [fact, setFact] = useState("")
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)]
    setFact(randomFact)

    const showTimer = setTimeout(() => {
      setVisible(true)
    }, duration)

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 - prev) * 0.08
        return newProgress > 99 ? 99 : newProgress
      })
    }, 100)

    return () => {
      clearTimeout(showTimer)
      clearInterval(progressInterval)
    }
  }, [duration])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/80 opacity-30  backdrop-blur-md">
      <Card className="text-center space-y-8 max-w-md mx-auto px-6 py-4">
        {/* Brand */}
        <div className="space-y-2">
          <h1 className="text-3xl font-light tracking-tight text-gray-900">Kushi-Dash</h1>
          <p className="text-sm text-gray-500">Loading your experience</p>
        </div>

        {/* Elegant Spinner */}
        <div className="flex justify-center">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 border-2 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-transparent border-t-gray-900 rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-3">
          <div className="w-64 h-px bg-gray-200 mx-auto overflow-hidden">
            <div
              className="h-full bg-gray-900 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400">{Math.round(progress)}% complete</p>
        </div>

        {/* Fun Fact */}
        <div className="pt-4">
          <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">{fact}</p>
        </div>
      </Card>
    </div>
  )
}

export default LoadingScreen
