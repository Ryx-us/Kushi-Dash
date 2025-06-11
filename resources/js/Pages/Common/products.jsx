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

const Products = ({ plansINTERSIA = [] }) => {
    const [plans, setPlans] = useState([]);
    
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await fetch('/client/api/plans');
                const data = await response.json();
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
                return 'one-time';
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
                                        {plan.planType}
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="flex-grow pt-2 space-y-4">
                            {plan?.image && (
                                <div className="mb-4">
                                    <img
                                        src={plan.image}
                                        alt={plan.name}
                                        className="w-full h-36 object-cover rounded-md"
                                    />
                                </div>
                            )}

                            {plan?.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {plan.description}
                                </p>
                            )}

                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
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

                            {plan?.resources && Object.keys(plan.resources).length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Resources Included:</h3>
                                    <ul className="space-y-2">
                                        {Object.entries(plan.resources)
                                            .filter(([_, value]) => value > 0)
                                            .map(([key, value]) => (
                                                <li key={key} className="flex items-center gap-2 text-sm">
                                                    {getResourceIcon(key)}
                                                    <span className="capitalize flex-1">{key}:</span>
                                                    <span className="font-medium">{value}</span>
                                                </li>
                                            ))}
                                    </ul>
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="pt-2">
                            <Button
                                className="w-full gap-2"
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