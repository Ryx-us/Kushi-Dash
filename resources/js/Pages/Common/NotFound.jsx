// components/EmptyState.jsx
import React from 'react';
import { cn } from "@/lib/utils";
import { Card } from '@/components/ui/card';

const EmptyState = () => {
    return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 transition-all duration-200">
        <Card>
            <div className={cn(
                "p-6 rounded-xl",
                "dark:bg-transparent",
                "transition-colors duration-200"
            )}>
                <img 
                    src="/counting.svg"
                    alt="Nothing Found"
                    className="w-120 h-60 object-contain"
                />
            </div>
            <div>
                <h1 className="font-semibold text-2xl text-center ">😿 Nothing Found</h1>
                <p className="text-gray-500">We didn't manage to find anything related to this 🥲</p>
            </div>
            </Card>
        </div>

    );
};

export default EmptyState;