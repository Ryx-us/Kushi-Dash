// resources/js/Pages/Admin/PlansView.jsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { FaPencil, FaTrash } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { useForm } from '@inertiajs/react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { LucideLoader2, CheckCircle2 } from "lucide-react";
import CreateNew from '@/components/CreateNew';

const PlansView = ({ plans = [] }) => {
  const [planToDelete, setPlanToDelete] = useState(null);
  const { delete: destroy, processing } = useForm();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDelete = () => {
    if (planToDelete) {
      destroy(route('admin.plans.destroy', planToDelete.id), {
        onSuccess: () => {
          setPlanToDelete(null);
          setShowSuccess(true);
        },
      });
    }
  };

  if (!plans || plans.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <CreateNew go="/admin/plans/new" />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ scale: 1.02 }}
            className="h-full"
          >
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {plan.icon && (
                    <img src={plan.icon} alt="" className="w-8 h-8 rounded" />
                  )}
                  <span className="truncate">{plan.name}</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-grow">
                {plan.image && (
                  <div className="mb-4">
                    <img 
                      src={plan.image} 
                      alt={plan.name}
                      className="w-full h-32 object-cover rounded-md" 
                    />
                  </div>
                )}

                <p className="text-2xl font-bold dark:text-white text-black mb-4">
                  ${plan.price}
                </p>

                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Resources:</h3>
                  <ul className="space-y-1">
                    {Object.entries(plan.resources).map(([key, value]) => (
                      <li key={key} className="flex justify-between text-sm text-gray-600 dark:text-white">
                        <span className="capitalize">{key}:</span>
                        <span>{value}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.discount && (
                  <div className="mt-4">
                    <span className="text-green-600 font-semibold">
                      Discount: {plan.discount}%
                    </span>
                  </div>
                )}

                <div className="text-sm text-gray-500 mt-4">
                  Created: {new Date(plan.created_at).toLocaleDateString()}
                </div>
              </CardContent>

              <CardFooter className="flex justify-between mt-auto">
                <Button 
                  variant="link"
                  onClick={() => window.location.href = `/admin/plans/edit/${plan.id}`}
                >
                  Edit <FaPencil className="ml-2" />
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => setPlanToDelete(plan)}
                >
                  Delete <FaTrash className="ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <AlertDialog open={!!planToDelete} onOpenChange={() => setPlanToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              <span className="font-semibold">{planToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPlanToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={processing}
            >
              {processing ? (
                <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              Success!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Plan deleted successfully!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccess(false)}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PlansView;