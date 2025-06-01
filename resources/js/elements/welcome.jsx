import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';




export default function Welcome() {
  // Get user data from SSR
 
  const appName = 'Laravel React App';
  
  const navigate = useNavigate();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [countdown, setCountdown] = useState(5);

  
    
  

  // Set document title


  return (
    <>
      <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a] relative overflow-hidden">
        
        {/* Graduation Cap SVG Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 dark:opacity-10 pointer-events-none">
          <svg viewBox="0 0 24 24" className="w-full h-screen">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {/* Graduation Cap Mortarboard */}
            <path 
              d="M2 10l10-5 10 5-10 5z" 
              style={{
                stroke: '#6366f1', 
                strokeWidth: 0.5,
                fill: 'none', 
                filter: 'url(#glow)',
                strokeDasharray: 100,
              }}
              className="animate-dash-in-out"
            />
            {/* Graduation Cap Tassel/Stand */}
            <path 
              d="M22 10v6M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" 
              style={{
                stroke: '#6366f1', 
                strokeWidth: 0.5,
                fill: 'none', 
                filter: 'url(#glow)',
                strokeDasharray: 100,
              }}
              className="animate-dash-in-out-delayed"
            />
          </svg>
        </div>
        
        <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl z-10">
          <nav className="flex items-center justify-end gap-4">
            
          </nav>
        </header>
        
        <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0 z-10">
          <main className="text-center max-w-3xl">
            
            <div className="flex justify-center items-center mb-8">
              <GraduationCap className="w-16 h-16 text-primary" />
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl dark:text-white mb-6">
              Welcome to <span className="text-primary">{appName}</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              A powerful Laravel and React application with SSR support. Build amazing web experiences with modern tools and technologies.
            </p>
            
            
            <div className="animate-bounce mt-5">
              <Badge>Open Source & Free Forever!</Badge>
            </div>
          </main>
        </div>
      </div>
      
      

      {/* Globe background */}
     
      
      {/* Footer */}
      <div className="fixed bottom-0 w-full bg-white dark:bg-black p-4 text-center text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 z-10">
        <p>© {new Date().getFullYear()} {appName}. All rights reserved.</p>
      </div>
    </>
  );
}