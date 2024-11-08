import React from 'react'

export default function Footer() {
    return (
        <div className="relative min-h-[calc(100vh-theme(spacing.16))]">
            <div className="pb-[100px]">
                {/* Main content wrapper */}
            </div>
            <footer className="absolute bottom-0 left-0 right-0 w-full py-6 px-4 bg-gray-100 dark:bg-black rounded-lg transition-colors duration-200">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Copyright © {new Date().getFullYear()} Nadhi.dev
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-2 md:mt-0">
                            Carefully crafted by Nadhi.dev in 2 weeks
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
