import React from 'react';

const NotFound = () => {
    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh',
            textAlign: 'center',
            padding: '20px'
        }}>
            <h1>404</h1>
            <h2>Page Not Found</h2>
            <p>The page you are looking for does not exist.</p>
            <a href="/" style={{ marginTop: '20px', textDecoration: 'none' }}>
                Go Home
            </a>
        </div>
    );
};

export default NotFound;