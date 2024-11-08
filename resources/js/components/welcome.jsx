import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export function Welcome({ companyName = "Our Company" }) {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogin = () => {
    router.push('/login')
  }

  if (!mounted) return null

  return (
    (<div
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 transition-colors duration-500">
      <div
        className="text-center space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-2xl transition-all duration-500">
        <Image
          src="/placeholder.svg?height=100&width=100"
          alt={`${companyName} logo`}
          width={100}
          height={100}
          className="mx-auto rounded-full" />
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
          Welcome to {companyName}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          We're excited to have you here. Let's get started!
        </p>
        <Button
          onClick={handleLogin}
          className="px-8 py-3 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors duration-300">
          Log In
        </Button>
      </div>
    </div>)
  );
}