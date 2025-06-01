"use client"

import { useState, useEffect } from "react"

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
  "The first 1 GB hard disk drive was announced in 1980 and weighed 550 pounds.",
  "More Google searches are done on mobile devices than on computers.",
  "The Konami Code (↑ ↑ ↓ ↓ ← → ← → B A) was created in 1986.",
  "An average web page today requires over 87 HTTP requests.",
  "The first smartphone was created by IBM in 1992 called the Simon Personal Communicator.",
  "The first computer mouse was made of wood.",
  "YouTube was founded by former PayPal employees.",
  "The term 'robot' comes from the Czech word 'robota' meaning forced labor.",
  "The first computer game was created in 1961 called 'Spacewar!'",
  "75% of all JavaScript errors occur in Internet Explorer 6-8.",
]

const LoadingScreen = ({ duration = 250 }) => {
  const [fact, setFact] = useState("")
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Select a random fact
    const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)]
    setFact(randomFact)

    // Show the loader after a brief delay to avoid flickering on fast loads
    const showTimer = setTimeout(() => {
      setVisible(true)
    }, duration)

    // Animated progress bar
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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      {/* Main Content */}
      <div className="flex flex-col items-center space-y-12 max-w-md mx-auto px-8">
        {/* Brand */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-light tracking-tight text-gray-900">Kushi-Dash</h1>
          <p className="text-lg font-light text-gray-600">Preparing your experience</p>
        </div>

        {/* Loading Indicator */}
        <div className="relative">
          <div className="w-6 h-6 border border-gray-200 rounded-full animate-spin border-t-gray-900"></div>
        </div>

        {/* Progress Bar */}
        <div className="w-80 space-y-4">
          <div className="w-full bg-gray-100 rounded-full h-0.5 overflow-hidden">
            <div
              className="h-full bg-gray-900 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-center">
            <span className="text-sm font-light text-gray-500">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* Fun Fact - Bottom */}
      <div className="absolute bottom-16 left-0 right-0 px-8">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-sm font-light text-gray-400 leading-relaxed">{fact}</p>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
