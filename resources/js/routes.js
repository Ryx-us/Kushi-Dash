import React from 'react';

// Define your routes in this configuration
const routes = [
  {
    path: '/server/test',
    component: React.lazy(() => import('@/elements/welcome')),
    exact: true,
    requiresAuth: false 
  },
  
];

export default routes;