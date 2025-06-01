import React from "react";
import ReactDOM from "react-dom/client";

import "@/styles/index.scss";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App-react";

const googleClientId = window.ssr?.props?.googleClientId;

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
       
            <App/>
        
    </React.StrictMode>
);

// console.log(import.meta.env.VITE_APP_URL);