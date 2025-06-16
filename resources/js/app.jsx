import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import React from 'react';
import LoadingScreen from '@/components/LoadingScreen';

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
              <React.Suspense fallback={<LoadingScreen duration={300} />}>
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
    // The delay after which the progress bar will appear, in milliseconds...
    delay: 250,

    // The color of the progress bar...
    color: '#29d',

    // Whether to include the default NProgress styles...
    includeCSS: true,

    // Whether the NProgress spinner will be shown...
    showSpinner: false,
  },
});

// Track page load time for analytics
let pageLoadStart;

document.addEventListener('inertia:start', () => {
  pageLoadStart = performance.now();
  
  // Create a loader container if it doesn't exist
  if (!document.getElementById('kushi-loader-container')) {
    const loaderContainer = document.createElement('div');
    loaderContainer.id = 'kushi-loader-container';
    document.body.appendChild(loaderContainer);
    
    // Mount the React loader component
    const loaderRoot = createRoot(loaderContainer);
    loaderRoot.render(<LoadingScreen />);
  }
});

document.addEventListener('inertia:finish', () => {
  const loadTime = performance.now() - pageLoadStart;
  console.log(`Page loaded in ${loadTime.toFixed(0)}ms`);
  
  // Remove the loader with a slight delay for smooth transition
  setTimeout(() => {
    const loaderContainer = document.getElementById('kushi-loader-container');
    if (loaderContainer) {
      // Unmount properly
      const loaderRoot = createRoot(loaderContainer);
      loaderRoot.unmount();
      loaderContainer.remove();
    }
  }, 300);
});