import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { Loader2 } from 'lucide-react'; // Import the spinner icon
import React from 'react';

// Global spinner component
const GlobalSpinner = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
    <Loader2 className="h-12 w-12 animate-spin text-white" />
  </div>
);

createInertiaApp({
    title: (title) => `${title} - Kushi-Dash`,
    // This is the key part for code splitting
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: false });
        return pages[`./Pages/${name}.jsx`]()
          .then(module => {
            const Page = module.default;
            // Wrap the page component to show content only when it's ready
            return (props) => (
              <React.Suspense fallback={<GlobalSpinner />}>
                <Page {...props} />
              </React.Suspense>
            );
          });
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        // Customize the progress bar or disable it since we have a spinner
        color: '#4B5563',
        showSpinner: true,
        // Add delay to prevent flashing on fast loads
        delay: 250,
    },
});

// Add a global event listener for page transitions
document.addEventListener('inertia:start', () => {
  // Create and append spinner on navigation start
  const spinnerContainer = document.createElement('div');
  spinnerContainer.id = 'page-transition-spinner';
  spinnerContainer.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80';
  spinnerContainer.innerHTML = `
    <svg class="animate-spin h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  `;
  document.body.appendChild(spinnerContainer);
});

document.addEventListener('inertia:finish', () => {
  // Remove spinner when navigation is complete
  const spinner = document.getElementById('page-transition-spinner');
  if (spinner) {
    spinner.remove();
  }
});