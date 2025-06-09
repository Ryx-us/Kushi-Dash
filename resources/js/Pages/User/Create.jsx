import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';

// Lazy load components with timeout handling
const AuthenticatedLayout = lazy(() => {
  return Promise.all([
    import("@/Layouts/AuthenticatedLayout.jsx"),
    // Add a small delay to ensure the component loads properly
    new Promise(resolve => setTimeout(resolve, 100))
  ])
  .then(([moduleExports]) => moduleExports);
});

const ServerCreate = lazy(() => {
  return Promise.all([
    import('../Common/ServerCreate'),
    new Promise(resolve => setTimeout(resolve, 100))
  ])
  .then(([moduleExports]) => moduleExports);
});

// Loading fallbacks
const LayoutFallback = () => (
  <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  </div>
);

const ServerCreateFallback = () => (
  <div className="w-full p-4">
    <div className="w-full h-80 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse mb-4"></div>
    <div className="w-3/4 h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-2"></div>
    <div className="w-1/2 h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
  </div>
);

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400">
          <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
          <p>Please try refreshing the page or contact support if the issue persists.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 bg-red-100 dark:bg-red-800/30 px-4 py-2 rounded-md text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
          >
            Refresh page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function AdminDashboard() {
    const { auth, darkMode } = usePage().props;
    const username = auth.user.name;
    const userRank = auth.user.rank;
    const [isLoaded, setIsLoaded] = useState(false);
    
    // Force a re-render after component mount to ensure proper loading
    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 300);
        return () => clearTimeout(timer);
    }, []);
    
    return (
        <ErrorBoundary>
            <Suspense fallback={<LayoutFallback />}>
                <AuthenticatedLayout
                    header={
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                            Home / New Server
                        </h2>
                    }
                    sidebartab="deploy"
                >
                    <Head title="New Server" />

                    <div className="relative h-[100px] w-full mb-6 outline-gray-400 outline rounded-lg ">
                        <img
                            src="https://i.pinimg.com/originals/1b/1b/b5/1b1bb5e2107b007bf4eb7b9eefb072ed.jpg"
                            alt="Server Deployments"
                            className="absolute inset-0 w-full h-full object-cover rounded-lg"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 flex items-center p-5">
                            <h1 className="text-4xl font-bold text-gray-200">
                                Server Deployments
                            </h1>
                        </div>
                    </div>

                    <ErrorBoundary>
                        <Suspense fallback={<ServerCreateFallback />}>
                            <ServerCreate />
                        </Suspense>
                    </ErrorBoundary>
                </AuthenticatedLayout>
            </Suspense>
        </ErrorBoundary>
    );
}