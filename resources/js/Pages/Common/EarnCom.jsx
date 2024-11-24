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
} from '@/components/ui/alert-dialog';
import { CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Earn() {
  const { flash, linkvertiseEnabled } = usePage().props;
  const [showSuccess, setShowSuccess] = useState(false);
  const [coinAmount, setCoinAmount] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captcha, setCaptcha] = useState({ question: '', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [captchaError, setCaptchaError] = useState('');

  useEffect(() => {
    if (flash.success) {
      const match = flash.success.match(/You have earned (\d+) coins!/);
      if (match && match[1]) {
        setCoinAmount(match[1]);
        setShowSuccess(true);
      }
    }

    if (flash.error) {
      toast.error(flash.error);
    }

    if (flash.linkvertiseUrl) {
      window.location.href = flash.linkvertiseUrl;
    }

    // Reset captcha error when modal is closed
    if (!showCaptcha) {
      setCaptchaError('');
    }
  }, [flash, showCaptcha]);

  const generateCaptcha = () => {
    const operations = ['+', '-', 'x', '/'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2, answer;

    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
        break;
      case 'x':
        num1 = Math.floor(Math.random() * 5) + 1;
        num2 = Math.floor(Math.random() * 5) + 1;
        answer = num1 * num2;
        break;
      case '/':
        num2 = Math.floor(Math.random() * 5) + 1;
        answer = Math.floor(Math.random() * 5) + 1;
        num1 = num2 * answer;
        break;
    }

    setCaptcha({
      question: `${num1} ${operation} ${num2} = ?`,
      answer: answer
    });
  };

  const handleEarnClick = () => {
    generateCaptcha();
    setShowCaptcha(true);
  };

  const handleCaptchaSubmit = () => {
    if (parseInt(userAnswer) === captcha.answer) {
      setIsLoading(true);
      router.post(route('generate.linkvertise'), {}, {
        onSuccess: () => {
          setShowCaptcha(false);
          setIsLoading(false);
        },
        onError: () => {
          setIsLoading(false);
          toast.error('An error occurred while generating the Linkvertise link.');
        },
      });
    } else {
      setCaptchaError("Hmm though luck, Maybe use a calculator next time?");
      generateCaptcha();
      setUserAnswer('');
      // Keep the captcha modal open
      setShowCaptcha(true);
    }
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

      {/* Captcha Modal */}
      <AlertDialog open={showCaptcha} onOpenChange={setShowCaptcha}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Your not a Robot right?</AlertDialogTitle>
            <AlertDialogDescription>
              Please solve the following arithmetic problem to verify your an human:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="captcha" className="text-lg font-semibold">
              {captcha.question}
            </Label>
            <Input
              id="captcha"
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="mt-2"
              placeholder="Enter your answer"
            />
            {captchaError && (
              <p className="text-red-500 mt-2">{captchaError}</p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleCaptchaSubmit} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Submit'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="dark:bg-black  p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg font-semibold">Loading...</p>
            <p>Please wait while we generate your Linkvertise link.</p>
          </div>
        </div>
      )}
    </div>
  );
}