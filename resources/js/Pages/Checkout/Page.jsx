'use client'

import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Moon, Sun, CheckCircle2, XCircle, ArrowRight, PackageCheck, Home, ShoppingBag, CreditCard, Globe, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from 'lucide-react';

export default function CheckoutSuccess() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const props = usePage().props
  console.log(props)

  const [params, setParams] = useState({
    product: 'Product',
    icon: 'PackageCheck',
    type: 'success',
    price: '0.00',
    curre: 'USD',
    descrip: 'Thank you for your purchase!',
    id: '', // Custom order ID
    payment: '', // Payment method
    bg: '', // Background image URL
    img: '', // Product image URL
    ref: '' // Referrer information
  });
  const [referrer, setReferrer] = useState('');
  const [referrerDetails, setReferrerDetails] = useState({
    domain: '',
    platform: '',
    isAffiliate: false
  });

  // Format the referrer for display
  const formatReferrer = (ref) => {
    if (!ref) return '';
    
    // Remove protocol and www. prefix for cleaner display
    return ref.replace(/^https?:\/\/(www\.)?/i, '');
  };

  // Detect the platform based on referrer domain
  const detectPlatform = (domain) => {
    // Define known platforms
    const platforms = {
      'facebook.com': 'Facebook',
      'fb.com': 'Facebook',
      'instagram.com': 'Instagram',
      'twitter.com': 'Twitter',
      'x.com': 'Twitter',
      'linkedin.com': 'LinkedIn',
      'google.com': 'Google',
      'bing.com': 'Bing',
      'yahoo.com': 'Yahoo',
      'youtube.com': 'YouTube',
      'tiktok.com': 'TikTok',
      'pinterest.com': 'Pinterest',
      'reddit.com': 'Reddit',
      'linkvertise.com': 'Linkvertise',
      'github.com': 'GitHub'
    };
    
    // Check for known platforms
    for (const [key, value] of Object.entries(platforms)) {
      if (domain.includes(key)) {
        return value;
      }
    }
    
    // Check for affiliate networks
    if (domain.includes('aff') || 
        domain.includes('affiliate') || 
        domain.includes('partner') || 
        domain.includes('ref') ||
        domain.includes('linkvertise')) {
      return 'Affiliate';
    }
    
    return 'Direct Link';
  };

  useEffect(() => {
    // Parse URL params
    const searchParams = new URLSearchParams(window.location.search);
    const paramData = {};
    
    // First collect all URL parameters
    for (const [key, value] of searchParams.entries()) {
      paramData[key] = decodeURIComponent(value);
    }
    
    // Log request details for debugging
    console.log('Request Details:', {
      url: window.location.href,
      params: paramData,
      referrer: document.referrer,
      props: props
    });
    
    // Check for Cream checkout parameters first
    const creamCheckoutParams = {
      checkout_id: paramData.checkout_id,
      customer_id: paramData.customer_id,
      order_id: paramData.order_id,
      product_id: paramData.product_id,
      signature: paramData.signature
    };
    
    // Log Cream-specific parameters
    if (creamCheckoutParams.checkout_id) {
      console.log('Cream Checkout Details:', creamCheckoutParams);
    }
    
    // Check for referrer from multiple sources
    // 1. From URL parameter 'ref'
    // 2. From URL parameter 'utm_source'
    // 3. From URL parameter 'source'
    // 4. From document.referrer
    let extractedReferrer = '';
    let refSource = '';
    
    if (paramData.ref) {
      extractedReferrer = paramData.ref;
      refSource = 'url-ref';
      console.log('Referrer from URL ref param:', extractedReferrer);
    } else if (paramData.utm_source) {
      extractedReferrer = paramData.utm_source;
      refSource = 'url-utm';
      console.log('Referrer from URL utm_source param:', extractedReferrer);
    } else if (paramData.source) {
      extractedReferrer = paramData.source;
      refSource = 'url-source';
      console.log('Referrer from URL source param:', extractedReferrer);
    } else if (document.referrer) {
      try {
        const refUrl = new URL(document.referrer);
        extractedReferrer = refUrl.hostname;
        refSource = 'http-referrer';
        console.log('Referrer from document.referrer:', extractedReferrer);
      } catch (e) {
        console.log('Invalid referrer URL:', document.referrer);
      }
    }
    
    // Check if this is from a specific platform or an affiliate
    if (extractedReferrer) {
      const formattedDomain = formatReferrer(extractedReferrer);
      const platform = detectPlatform(formattedDomain.toLowerCase());
      const isAffiliate = platform === 'Affiliate' || 
                         formattedDomain.includes('aff') || 
                         formattedDomain.includes('linkvertise');
      
      setReferrerDetails({
        domain: formattedDomain,
        platform: platform,
        isAffiliate: isAffiliate,
        source: refSource
      });
      
      console.log('Referrer details:', {
        domain: formattedDomain,
        platform: platform,
        isAffiliate: isAffiliate,
        source: refSource
      });
    }
    
    // Store the referrer in state
    setReferrer(extractedReferrer);
    
    // Set parameters using Cream checkout data when available
    setParams({
      // Use Cream checkout product name or fallback to URL param
      product: paramData.product || 'Product',
      icon: paramData.icon || 'PackageCheck',
      type: paramData.type || 'success',
      
      // Use Cream price when available
      price: paramData.price || '0.00',
      curre: paramData.curre || 'USD',
      descrip: paramData.descrip || 'Thank you for your purchase!',
      
      // Use Cream checkout order ID when available
      id: paramData.order_id || paramData.checkout_id || generateOrderId(),
      payment: paramData.payment || '',
      bg: paramData.bg || '',
      img: paramData.img || '',
      ref: extractedReferrer || ''
    });
    
    // Set dark mode
    const darkModePreference = localStorage.getItem('dark-mode') === 'true';
    setIsDarkMode(darkModePreference);
    if (darkModePreference) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Generate a random order ID if not provided
  const generateOrderId = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

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

  // Dynamic Lucide icon component
  const DynamicIcon = params.icon && LucideIcons[params.icon] 
    ? LucideIcons[params.icon] 
    : params.type === 'success' ? CheckCircle2 : XCircle;

  // Payment method icon
  const PaymentIcon = params.payment && LucideIcons[params.payment]
    ? LucideIcons[params.payment]
    : CreditCard;

  // Currency formatter
  const formatCurrency = (price, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(price);
  };

  // Get referrer display text with platform info if available
  const getReferrerDisplayText = () => {
    if (!referrer) return '';
    
    if (referrerDetails.platform && referrerDetails.platform !== 'Direct Link') {
      return `${referrerDetails.platform}: ${formatReferrer(referrer)}`;
    }
    
    return formatReferrer(referrer);
  };

  const isSuccess = params.type === 'success';
  
  // Create background style based on params.bg
  const backgroundStyle = params.bg 
    ? { 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${params.bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      } 
    : { 
        backgroundImage: 'linear-gradient(to bottom, var(--color-zinc-50), var(--color-zinc-100))', 
      };
  
  // Dark mode version of the background
  if (isDarkMode && !params.bg) {
    backgroundStyle.backgroundImage = 'linear-gradient(to bottom, var(--color-zinc-900), var(--color-black))';
  }
  
  return (
    <div 
      className="flex min-h-screen flex-col items-center justify-center text-foreground transition-all p-4"
      style={backgroundStyle}
    >
      <Head title={isSuccess ? "Checkout Successful" : "Checkout Failed"} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl"
      >
         <div className={`h-2 w-full rounded-t-lg ${isSuccess ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
        {params.img ? (
          // Split card design with product image
           
          <div className="overflow-hidden border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl bg-white dark:bg-zinc-900 flex flex-col md:flex-row">
            {/* Status Bar */}
           
            
            {/* Product Image Side */}
            <div className="relative w-full md:w-1/2 h-56 md:h-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <img 
                  src={params.img} 
                  alt={params.product}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent md:bg-gradient-to-r"></div>
                
                {/* Product name overlay for mobile */}
                <div className="absolute bottom-4 left-4 right-4 md:hidden">
                  <h2 className="text-white font-bold text-xl line-clamp-2">{params.product}</h2>
                  <div className="mt-1 inline-block px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm">
                    <span className="text-white font-bold">{formatCurrency(params.price, params.curre)}</span>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Content Side */}
            <div className="relative w-full md:w-1/2 p-6 md:p-8">
              <div className="space-y-6">
                {/* Status Icon */}
                <div className="flex items-center space-x-3">
                  <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className={`rounded-full p-3 ${
                      isSuccess 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20' 
                        : 'bg-red-50 dark:bg-red-900/20'
                    }`}
                  >
                    <DynamicIcon 
                      className={`h-6 w-6 ${
                        isSuccess 
                          ? 'text-emerald-500 dark:text-emerald-400' 
                          : 'text-red-500 dark:text-red-400'
                      }`} 
                    />
                  </motion.div>
                  
                  {/* Status Text */}
                  <div>
                    <h1 className={`text-xl font-semibold ${
                      isSuccess 
                        ? 'text-zinc-800 dark:text-zinc-100' 
                        : 'text-zinc-800 dark:text-zinc-100'
                    }`}>
                      {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
                    </h1>
                  </div>
                </div>
                
                {/* Product Details (hidden on mobile, shown on desktop) */}
                <div className="hidden md:block">
                  <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{params.product}</h2>
                  <div className="mt-1 inline-block px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{formatCurrency(params.price, params.curre)}</span>
                  </div>
                </div>
                
                {/* Description */}
                <div>
                  <p className="text-zinc-600 dark:text-zinc-400">{params.descrip}</p>
                </div>
                
                {/* Order Details */}
                {isSuccess && (
                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-500 dark:text-zinc-400">Order ID</span>
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">{params.id}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-500 dark:text-zinc-400">Date</span>
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                    
                    {/* Payment Method (if provided) */}
                    {params.payment && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-500 dark:text-zinc-400">Payment Method</span>
                        <div className="flex items-center font-medium text-zinc-700 dark:text-zinc-300">
                          <PaymentIcon className="h-3 w-3 mr-1" />
                          <span>{params.payment}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Referrer (if available) - moved inside order details */}
                    {referrer && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-500 dark:text-zinc-400">From</span>
                        <div className="flex items-center font-medium text-zinc-700 dark:text-zinc-300">
                          <Globe className="h-3 w-3 mr-1" />
                          <span>
                            {getReferrerDisplayText()}
                            {referrerDetails.isAffiliate && (
                              <span className="ml-1 px-1 py-0.5 text-xs rounded-sm bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                                Affiliate
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  {isSuccess ? (
                    <>
                      <Button
                        variant="outline"
                        size="default"
                        className="border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                        onClick={() => window.location.href = '/dashboard'}
                      >
                        <Home className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                      <Button
                        variant="default"
                        size="default"
                        className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900"
                        onClick={() => window.location.href = '/deploy'}
                      >
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="default"
                        className="border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                        onClick={() => window.history.back()}
                      >
                        Go Back
                      </Button>
                      <Button
                        variant="default"
                        size="default"
                        className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900"
                        onClick={() => window.location.reload()}
                      >
                        Try Again
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Original card design without product image
          <Card className="overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 shadow-xl backdrop-blur-sm">
            {/* Status Bar */}
            <div className={`h-2 ${isSuccess ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
            
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Icon */}
                <div className="flex justify-center">
                  <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 260,
                      damping: 20 
                    }}
                    className={`rounded-full p-4 ${
                      isSuccess 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20' 
                        : 'bg-red-50 dark:bg-red-900/20'
                    }`}
                  >
                    <DynamicIcon 
                      className={`h-16 w-16 ${
                        isSuccess 
                          ? 'text-emerald-500 dark:text-emerald-400' 
                          : 'text-red-500 dark:text-red-400'
                      }`} 
                    />
                  </motion.div>
                </div>
                
                {/* Status and Product */}
                <div className="text-center space-y-2">
                  <h1 className={`text-2xl font-bold ${
                    isSuccess 
                      ? 'text-zinc-800 dark:text-zinc-100' 
                      : 'text-zinc-800 dark:text-zinc-100'
                  }`}>
                    {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
                  </h1>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {params.product}
                  </p>
                </div>
                
                {/* Price */}
                <div className="flex justify-center">
                  <div className={`px-4 py-2 rounded-full ${
                    isSuccess 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20' 
                      : 'bg-zinc-100 dark:bg-zinc-800/50'
                  }`}>
                    <span className={`text-xl font-bold ${
                      isSuccess 
                        ? 'text-emerald-700 dark:text-emerald-400' 
                        : 'text-zinc-700 dark:text-zinc-300'
                    }`}>
                      {formatCurrency(params.price, params.curre)}
                    </span>
                  </div>
                </div>
                
                {/* Description */}
                <div className="text-center">
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {params.descrip}
                  </p>
                </div>
                
                {/* Order Details */}
                {isSuccess && (
                  <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-500 dark:text-zinc-400">Order ID</span>
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">
                        {params.id}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm mt-2">
                      <span className="text-zinc-500 dark:text-zinc-400">Date</span>
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                    
                    {/* Payment Method (if provided) */}
                    {params.payment && (
                      <div className="flex justify-between items-center text-sm mt-2">
                        <span className="text-zinc-500 dark:text-zinc-400">Payment Method</span>
                        <div className="flex items-center font-medium text-zinc-700 dark:text-zinc-300">
                          <PaymentIcon className="h-3 w-3 mr-1" />
                          <span>{params.payment}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Referrer (if available) */}
                    {referrer && (
                      <div className="flex justify-between items-center text-sm mt-2">
                        <span className="text-zinc-500 dark:text-zinc-400">From</span>
                        <div className="flex items-center font-medium text-zinc-700 dark:text-zinc-300">
                          <Globe className="h-3 w-3 mr-1" />
                          <span>
                            {getReferrerDisplayText()}
                            {referrerDetails.isAffiliate && (
                              <span className="ml-1 px-1 py-0.5 text-xs rounded-sm bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                                Affiliate
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="px-8 pb-8 pt-0 flex flex-col sm:flex-row gap-3">
              {isSuccess ? (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-1/2 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                    onClick={() => window.location.href = '/dashboard'}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full sm:w-1/2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900"
                    onClick={() => window.location.href = '/deploy'}
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-1/2 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                    onClick={() => window.history.back()}
                  >
                    Go Back
                  </Button>
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full sm:w-1/2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        )}
        
        {/* Enhanced floating referrer badge at the bottom */}
        {referrer && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="mt-4 px-3 py-1 rounded-full text-xs bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm text-zinc-600 dark:text-zinc-300 inline-flex items-center"
          >
            <ExternalLink className="h-3 w-3 mr-1 opacity-70" />
            {referrerDetails.platform !== 'Direct Link' ? (
              <>
                <span className="font-medium">{referrerDetails.platform}</span>: {formatReferrer(referrer)}
              </>
            ) : (
              <>Referred by {formatReferrer(referrer)}</>
            )}
            {referrerDetails.isAffiliate && (
              <span className="ml-1 px-1 py-0.5 text-xs rounded-sm bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                Affiliate
              </span>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Dark Mode Toggle */}
      <div className="fixed bottom-4 right-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className={`
            relative w-14 h-7 rounded-full transition-colors duration-300 ease-in-out
            ${isDarkMode ? 'bg-zinc-700' : 'bg-zinc-300'}
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
        </motion.button>
      </div>
    </div>
  );
}