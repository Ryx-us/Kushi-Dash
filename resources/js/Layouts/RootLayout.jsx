import { ReactNode } from "react";
import { Outlet } from "react-router-dom";


export default function RootLayout(props) {
    return (
        
    <main className="">
        
        <Outlet />
       
    </main>
        
    );
}