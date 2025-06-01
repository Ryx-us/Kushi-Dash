import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import ErrorBoundary from '@/components/Errors/Errorboundary';
//import ProgressBar from './elements/Progress/ProgressBar';






function App() {
   

    return (
        <div className="block relative">
            
            
        
            <ErrorBoundary>
                <RouterProvider
                    router={router}
                />
                
            </ErrorBoundary>
        </div>
    );
}

export default App;