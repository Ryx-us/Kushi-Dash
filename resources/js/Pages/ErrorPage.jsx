'use client'

import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Moon, Sun, AlertTriangle, ServerOff, ShieldAlert, AlertCircle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function ErrorPage({ status = 404 }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const darkModePreference = localStorage.getItem('dark-mode') === 'true';
    setIsDarkMode(darkModePreference);
    if (darkModePreference) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('dark-mode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Error configurations with improved icons and messages
  const errorConfig = {
    503: {
      title: 'Service Unavailable',
      description: 'Sorry, we are doing some maintenance. Please check back soon.',
      icon: ServerOff,
    },
    500: {
      title: 'Server Error',
      description: 'Whoops, something went wrong on our servers.',
      icon: ServerOff,
    },
    404: {
      title: 'Page Not Found',
      description: 'The link is either broken or doesn\'t exist on the server.',
      icon: AlertTriangle,
    },
    403: {
      title: 'Forbidden',
      description: 'Sorry, you are forbidden from accessing this page.',
      icon: ShieldAlert,
    },
  }[status] || {
    title: 'Error',
    description: 'An unexpected error occurred.',
    icon: AlertCircle,
  };

  const { title, description, icon: Icon } = errorConfig;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-900 text-foreground transition-colors p-4">
      <Head title={`${status} - ${title}`} />
      
      <Card className="w-full max-w-md p-8 text-center border-0 shadow-lg">
        <CardContent className="space-y-6 p-0">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800">
            <Icon className="h-8 w-8 text-zinc-700 dark:text-zinc-300" />
          </div>
          
          <h1 className="text-7xl font-bold text-zinc-900 dark:text-zinc-100">{status}</h1>
          
          <div className="space-y-2">
            <h2 className="text-xl font-medium text-zinc-800 dark:text-zinc-200">{title}</h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {description}
            </p>
          </div>
          
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => window.history.back()}
              variant="default"
              size="lg"
              className="w-full sm:w-auto border-zinc-300 dark:border-zinc-700"
            >
              Go Back
            </Button>
            
            
          </div>
          
          
        </CardContent>
      </Card>

      {/* Dark Mode Toggle */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={toggleTheme}
          className={`
            relative w-14 h-7 rounded-full transition-colors duration-300 ease-in-out
            ${isDarkMode ? 'bg-zinc-600' : 'bg-zinc-400'}
            focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-700
          `}
        >
          <span className="sr-only">Toggle dark mode</span>
          
          {/* Toggle Knob */}
          <div
            className={`
              absolute top-1 left-1 transform transition-transform duration-300 ease-in-out
              w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center
              ${isDarkMode ? 'translate-x-7' : 'translate-x-0'}
            `}
          >
            {isDarkMode ? (
              <Moon className="w-3 h-3 text-zinc-800" />
            ) : (
              <Sun className="w-3 h-3 text-zinc-800" />
            )}
          </div>
        </button>
      </div>
    </div>
  );
}