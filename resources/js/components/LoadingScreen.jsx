import { useState, useEffect } from "react"

export const LoadingScreen = ({ duration = 250 }) => {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Show the loader after a brief delay
    const showTimer = setTimeout(() => {
      setVisible(true)
    }, duration)

    // Animate the progress
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
    <>
      {/* Top progress bar */}
      
      
      {/* Bottom left message */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-zinc-900/80 dark:bg-zinc-800/80 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-md backdrop-blur-sm flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Fetching content in the background...
        </div>
      </div>
    </>
  )
}

export default LoadingScreen