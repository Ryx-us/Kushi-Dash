import React, { useEffect } from 'react';

export default function Footer() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://images.dmca.com/Badges/DMCABadgeHelper.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-theme(spacing.16))]">
      <div className="pb-[100px]">
        {/* Main content wrapper */}
      </div>
      <footer className="absolute bottom-0 left-0 right-0 w-full py-6 px-4 bg-gray-100 dark:bg-black rounded-lg transition-colors duration-200">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Copyright © {new Date().getFullYear()} Nadhi.dev
              </p>
              <div className="flex space-x-4 mt-2">
                <a 
                  href="https://ryx.us/privacy-policy" 
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="text-blue-500 hover:text-blue-700 text-xs"
                >
                  Privacy Policy
                </a>
                <a 
                  href="https://ryx.us/tos" 
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="text-blue-500 hover:text-blue-700 text-xs"
                >
                  Terms of Service
                </a>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col items-center md:items-end">
              <p className="text-gray-500 dark:text-gray-400 text-xs">
                Carefully crafted by Nadhi.dev in 2 weeks
              </p>
              <a
                href="//www.dmca.com/Protection/Status.aspx?ID=8325d56a-0fde-46d4-b3c7-e00fd57859ff"
                title="DMCA.com Protection Status"
                className="dmca-badge mt-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://images.dmca.com/Badges/dmca_protected_sml_120n.png?ID=8325d56a-0fde-46d4-b3c7-e00fd57859ff"
                  alt="DMCA.com Protection Status"
                  className="h-5"
                />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}