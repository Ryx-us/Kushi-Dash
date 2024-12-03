// resources/js/Pages/Admin/VMSView.jsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { FaPencil, FaTrash } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { useForm, usePage } from '@inertiajs/react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { LucideLoader2, CheckCircle2 } from "lucide-react";
import CreateNew from '@/components/CreateNew';

const VMSView = () => {
  const [vmToDelete, setVmToDelete] = useState(null);
  const { delete: destroy, processing } = useForm();
  const [showSuccess, setShowSuccess] = useState(false);
  const { vms } = usePage().props;


  console.log(usePage().props)

  const handleDelete = () => {
    if (vmToDelete) {
      destroy(route('admin.vms.destroy', vmToDelete.id), {
        onSuccess: () => {
          setVmToDelete(null);
          setShowSuccess(true);
        },
      });
    }
  };

  if (!vms || vms.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <CreateNew go="/admin/vms/create" />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {vms.map((vm) => (
          <motion.div
            key={vm.id}
            whileHover={{ scale: 1.02 }}
            className="h-full"
          >
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {vm.icon && (
                    <img src={vm.icon} alt="" className="w-8 h-8 rounded" />
                  )}
                  <span className="truncate">{vm.name}</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-grow">
                {vm.image_url && (
                  <div className="mb-4">
                    <img 
                      src={vm.image_url} 
                      alt={vm.name}
                      className="w-full h-32 object-cover rounded-md" 
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {vm.description}
                  </p>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Details:</h3>
                    <ul className="space-y-1">
                      <li className="flex justify-between text-sm">
                        <span>Egg ID:</span>
                        <span>{vm.egg_id}</span>
                      </li>
                      <li className="flex justify-between text-sm">
                        <span>Nest ID:</span>
                        <span>{vm.nest_id}</span>
                      </li>
                      <li className="flex justify-between text-sm">
                        <span>Required Rank:</span>
                        <span className="capitalize">{vm.rank}</span>
                      </li>
                      <li className="flex justify-between text-sm">
                        <span>Status:</span>
                        <span className={vm.is_enabled ? 'text-green-500' : 'text-red-500'}>
                          {vm.is_enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between mt-auto">
                <Button 
                  variant="link"
                  onClick={() => window.location.href = `/admin/vms/edit/${vm.id}`}
                >
                  Edit <FaPencil className="ml-2" />
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => setVmToDelete(vm)}
                >
                  Delete <FaTrash className="ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <AlertDialog open={!!vmToDelete} onOpenChange={() => setVmToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              <span className="font-semibold">{vmToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setVmToDelete(null)}>
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
              VM template deleted successfully!
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

export default VMSView;