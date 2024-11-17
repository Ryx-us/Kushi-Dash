// resources/js/Pages/Earn.jsx

import React, { useEffect, useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'; // Adjust the import path as needed
import { CheckCircle2 } from 'lucide-react'; // Import the icon

export default function Earn() {
  const { flash, linkvertiseEnabled } = usePage().props;
  const [showSuccess, setShowSuccess] = useState(false);
  const [coinAmount, setCoinAmount] = useState(0);

  useEffect(() => {
    if (flash.success) {
      // Extract the coin amount from the success message
      const match = flash.success.match(/You have earned (\d+) coins!/);
      if (match && match[1]) {
        setCoinAmount(match[1]);
        setShowSuccess(true);
      }
    }

    if (flash.error) {
      toast.error(flash.error);
    }

    // If the backend sends linkvertiseUrl as a flash message, handle redirection
    if (flash.linkvertiseUrl) {
      window.location.href = flash.linkvertiseUrl;
    }
  }, [flash]);

  const handleEarnClick = () => {
    router.post(route('generate.linkvertise'), {}, {
      onError: () => {
        toast.error('An error occurred while generating the Linkvertise link.');
      },
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Earn Coins</h1>
      {flash.success && <div className="alert alert-success">{flash.success}</div>}
      {flash.error && <div className="alert alert-error">{flash.error}</div>}
      <p className="mb-6">Click the button below to earn coins through Linkvertise.</p>
      {linkvertiseEnabled ? (
        <Button onClick={handleEarnClick}>Earn Coins</Button>
      ) : (
        <p>Linkvertise is currently disabled.</p>
      )}

      {/* Success Modal */}
      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              Success!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Coins <strong>{coinAmount}</strong> claimed successfully.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccess(false)}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}