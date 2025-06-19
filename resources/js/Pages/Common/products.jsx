import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  CheckCircle2, 
  Calendar, 
  Cpu, 
  HardDrive, 
  Database,
  Wifi,
  MemoryStick
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import EmptyState from './NotFound';
import http from '@/lib/http';

const Products = ({ plansINTERSIA = [] }) => {
    const [plans, setPlans] = useState([]);
    
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await http.get('/client/plans');
                const data = await response
                console.log(response)
                setPlans(data.plans || []);
            } catch (error) {
                console.error('Error fetching plans:', error);
            }
        };

        fetchPlans();
    }, []);

    if (!plans || plans.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <EmptyState />
            </div>
        );
    }

    // Helper function to get appropriate icon for resource type
    const getResourceIcon = (resourceType) => {
        switch (resourceType.toLowerCase()) {
            case 'cpu':
            case 'cores':
                return <Cpu className="h-4 w-4 text-gray-500" />;
            case 'ram':
            case 'memory':
                return <MemoryStick className="h-4 w-4 text-gray-500" />;
            case 'disk':
            case 'storage':
                return <HardDrive className="h-4 w-4 text-gray-500" />;
            case 'database':
            case 'databases':
                return <Database className="h-4 w-4 text-gray-500" />;
            case 'bandwidth':
            case 'network':
                return <Wifi className="h-4 w-4 text-gray-500" />;
            default:
                return <CheckCircle2 className="h-4 w-4 text-gray-500" />;
        }
    };

    // Helper function to format plan type
    const getPlanTypeLabel = (planType) => {
        switch (planType) {
            case 'monthly':
                return 'month';
            case 'annual':
                return 'year';
            case 'onetime':
                return 'Lifetime';
            default:
                return planType || 'month';
        }
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
            {plans.map((plan) => (
                <motion.div
                    key={plan.id}
                    whileHover={{ scale: 1.02 }}
                    className="h-full"
                >
                    <Card className="h-full flex flex-col border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                        {/* Card Header with Plan Title and Type */}
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="flex items-center gap-3">
                                    {plan?.icon && (
                                        <img src={plan.icon} alt="" className="w-8 h-8 rounded-md" />
                                    )}
                                    <span className="truncate">{plan.name}</span>
                                </CardTitle>
                                {plan.planType && (
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {getPlanTypeLabel(plan.planType)}
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="flex-grow pt-2 pb-0">
                            <div className="space-y-4 h-full flex flex-col">
                                {/* Plan Image - Optional */}
                                {plan?.image && (
                                    <div className="mb-4 flex-shrink-0">
                                        <img
                                            src={plan.image}
                                            alt={plan.name}
                                            className="w-full h-32 object-cover rounded-md"
                                        />
                                    </div>
                                )}

                                {/* Price Display */}
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 flex-shrink-0">
                                    <p className="text-2xl font-bold text-center">
                                        ${plan.price}
                                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                                            /{getPlanTypeLabel(plan.planType)}
                                        </span>
                                    </p>
                                    
                                    {plan?.discount && plan.discount > 0 && (
                                        <div className="text-center mt-1">
                                            <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                                                Save {plan.discount}%
                                            </Badge>
                                        </div>
                                    )}
                                </div>

                                {/* Description - Optional */}
                                {plan?.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 flex-shrink-0">
                                        {plan.description}
                                    </p>
                                )}

                                {/* Resources Section */}
                                {plan?.resources && Object.keys(plan.resources).length > 0 && (
                                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex-1 overflow-auto max-h-48">
                                        <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wider uppercase mb-3">Features</h3>
                                        
                                        <div className="grid grid-cols-2 gap-2">
                                            {Object.entries(plan.resources)
                                                .filter(([_, value]) => value > 0)
                                                .map(([key, value]) => {
                                                    // Format value based on resource type
                                                    const formattedValue = key.toLowerCase().includes('cpu') 
                                                        ? `${value}%` 
                                                        : key.toLowerCase().includes('ram') || key.toLowerCase().includes('memory') || key.toLowerCase().includes('disk') || key.toLowerCase().includes('storage')
                                                            ? `${value} MB`
                                                            : value;
                                                    
                                                    return (
                                                        <div key={key} className="flex items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                            <div className="w-7 h-7 rounded-full bg-primary/5 flex items-center justify-center mr-2">
                                                                {getResourceIcon(key)}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{key}</span>
                                                                <span className="text-sm font-semibold">{formattedValue}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>

                        {/* Purchase Button - Always Visible */}
                        <CardFooter className="pt-4 mt-auto">
                            <Button
                                className="w-full gap-2 py-5"
                                onClick={() => window.location.href = `/user/plans/purchase/${plan.id}`}
                            >
                                <ShoppingCart className="h-4 w-4" />
                                Select Plan
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
};

export default Products;