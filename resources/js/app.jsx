import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Suspense } from 'react';

// Loading component for Suspense fallback
const LoadingComponent = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    
    // Use a simpler approach that still gives us code splitting
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: false });
        return resolvePageComponent(`./Pages/${name}.jsx`, pages);
    },
    
    setup({ el, App, props }) {
        // Optimize initial props if they're large
        if (props.initialPage.props?.debug) {
            // Don't pass debug info to components unless in development
            if (import.meta.env.MODE !== 'development') {
                delete props.initialPage.props.debug;
            }
        }
        
        // Remove large server data if not needed right away
        if (props.initialPage.props?.flash?.res && props.initialPage.component !== 'Dashboard') {
            delete props.initialPage.props.flash.res;
        }
        
        const root = createRoot(el);
        
        root.render(
            <Suspense fallback={<LoadingComponent />}>
                <App {...props} />
            </Suspense>
        );
    },
    
    progress: {
        color: '#6366f1', 
        showSpinner: true,
        delay: 250,
    },
    
    // Add max request size option
    maxRequestSize: 5 * 1024 * 1024, // 5MB max payload
});