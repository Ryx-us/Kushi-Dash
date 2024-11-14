import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { usePage } from '@inertiajs/react';

export function LoadingScreen() {
  const [factIndex, setFactIndex] = useState(0);
  const { props: { companyLogo } } = usePage();

  const facts = [
    "The average person spends 6 months of their life waiting for red lights to turn green.",
    "A group of flamingos is called a 'flamboyance'.",
    "The world's oldest known living tree is over 5,000 years old.",
    "Honeybees can recognize human faces.",
    "The shortest war in history lasted 38 minutes.",
    "A day on Venus is longer than its year.",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % facts.length);
    }, 3000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-black transition-colors duration-300 opacity-90">
      <div className="flex flex-col items-center">
        <motion.div
          className="bg-gray-100 dark:bg-black p-4 rounded-lg shadow-lg"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={companyLogo}
            alt="Loading Icon"
            width={80}
            height={80}
            className="w-20 h-20 object-contain animate-pulse"
          />
        </motion.div>
        <motion.div
          className="mt-6 text-gray-800 dark:text-gray-200 text-xl font-bold"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Loading...
        </motion.div>
        <motion.div
          key={factIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="mt-4 max-w-md text-center text-gray-600 dark:text-gray-400 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <p>{facts[factIndex]}</p>
        </motion.div>
      </div>
    </div>
  );

}