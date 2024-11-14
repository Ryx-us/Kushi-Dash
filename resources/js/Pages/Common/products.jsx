// resources/js/Pages/User/Products.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import EmptyState from './NotFound';

const Products = ({ plansINTERSIA = [] }) => {
    const [plans, setPlans] = useState([]);

    console.log('Raw plans data:', plans);
    console.log('Structured plans:', plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        resources: plan.resources,
        discount: plan.discount,
        planType: plan.planType
    })));

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await fetch('/admin/api/plans');
                const data = await response.json();
                setPlans(data.plans || []); // Ensure data is an array
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

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {plans.map((plan) => (
                <motion.div
                    key={plan.id}
                    whileHover={{ scale: 1.02 }}
                    className="h-full"
                >
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                {plan?.icon && (
                                    <img src={plan.icon} alt="" className="w-8 h-8 rounded" />
                                )}
                                <span className="truncate">{plan.name}</span>
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="flex-grow">
                            {plan?.image && (
                                <div className="mb-4">
                                    <img
                                        src={plan.image}
                                        alt={plan.name}
                                        className="w-full h-32 object-cover rounded-md"
                                    />
                                </div>
                            )}

                            <p className="text-3xl font-bold text-center mb-4">
                                ${plan.price}
                                <span className="text-sm text-gray-500 ml-1">
                                    /{plan.planType || 'month'}
                                </span>
                            </p>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Resources Included:</h3>
                                    <ul className="space-y-2">
                                        {plan?.resources && Object.entries(plan.resources).map(([key, value]) => (
                                            <li key={key} className="flex items-center justify-between text-sm">
                                                <span className="capitalize">{key}:</span>
                                                <span className="font-medium">{value}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {plan?.description && (
                                    <p className="text-sm text-gray-600">
                                        {plan.description}
                                    </p>
                                )}

                                {plan?.discount && plan.discount > 0 && (
                                    <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                                        <span className="text-green-600 dark:text-green-400 font-medium">
                                            Save {plan.discount}% on this plan
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardContent>

                        <CardFooter className="mt-auto pt-4">
                            <Button
                                className="w-full bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200"
                                onClick={() => window.location.href = `/user/plans/purchase/${plan.id}`}
                            >
                                <ShoppingCart className="mr-2 h-4 w-4" />
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
