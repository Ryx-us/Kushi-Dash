import React, { useEffect, useState } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Loader2, CheckCircle2 } from "lucide-react";
import { LoadingScreen } from '@/components/loading-screen';
import axios from 'axios';

export default function Component({ userId = '1' }) {
  const { data, setData, put, processing, errors, reset } = useForm({
    newName: '',
    newEmail: '',
    newDiscordId: '',
    newRank: 'free',
    newCoins: '',
    newPterodactylId: '',
    newResources: {},
    newLimits: {},
    planIds: []
  });

  const { flash } = usePage().props;
  const [flashMessage, setFlashMessage] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isUserUpdated, setIsUserUpdated] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlans, setSelectedPlans] = useState([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get('/admin/api/plans');
        setPlans(response.data.plans);
      } catch (error) {
        console.error('Failed to fetch plans:', error);
      }
    };
    fetchPlans();
  }, []);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      router.delete(`/admin/users/${userId}`, {
        onSuccess: () => {
          // Redirect to users list after successful deletion
          router.visit('/admin/users');
        },
        onError: (errors) => {
          setFlashMessage({
            type: 'error',
            message: 'Failed to delete user'
          });
        }
      });
    }
  };

  useEffect(() => {
    if (userId && initialLoad) {
      const fetchUser = async () => {
        try {
          const response = await fetch(`/admin/api/users/${userId}`);
          const userData = await response.json();
          setData({
            newName: userData.name,
            newPterodactylId: userData.pterodactyl_id,
            newEmail: userData.email,
            newDiscordId: userData.discord_id,
            newRank: userData.rank || 'free',
            newCoins: userData.coins || 0,
            newResources: userData.resources || {},
            newLimits: userData.limits || {},
            planIds: userData.purchases_plans || []
          });
          setSelectedPlans(userData.purchases_plans || []);
          setInitialLoad(false);
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      };

      fetchUser();
    }
  }, [userId, initialLoad, setData]);

  useEffect(() => {
    if (flash.status) {
      setFlashMessage({ message: flash.res, type: flash.status });
      if (flash.status === 'success') {
        setIsUserUpdated(true);
      } else {
        const timer = setTimeout(() => setFlashMessage(null), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [flash]);

  useEffect(() => {
    if (isUserUpdated) {
      setShowSuccessDialog(true);
    }
  }, [isUserUpdated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await put(`/admin/api/users/${userId}/update`);
    } catch (error) {
      console.error('An error occurred while submitting the form.');
    }
  };

  const handleRankChange = (rank) => {
    setData('newRank', rank);
  };

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    reset();
    setIsUserUpdated(false);
  };

  const handlePlanToggle = (plan) => {
    const isSelected = selectedPlans.includes(plan.id);
    let newSelectedPlans;
    let newLimits = { ...data.newLimits };
    
    if (isSelected) {
        // Remove plan
        newSelectedPlans = selectedPlans.filter(id => id !== plan.id);
        // Subtract from limits only
        Object.keys(plan.resources).forEach(key => {
            newLimits[key] = Math.max(0, parseInt(newLimits[key] || 0, 10) - parseInt(plan.resources[key] || 0, 10));
        });
    } else {
        // Add plan
        newSelectedPlans = [...selectedPlans, plan.id];
        // Add to limits only
        Object.keys(plan.resources).forEach(key => {
            newLimits[key] = parseInt(newLimits[key] || 0, 10) + parseInt(plan.resources[key] || 0, 10);
        });
    }

    setSelectedPlans(newSelectedPlans);
    setData(prev => ({
        ...prev,
        newLimits,
        planIds: newSelectedPlans,
        newRank: prev.newRank === 'admin' ? 'admin' : (newSelectedPlans.length > 0 ? 'premium' : 'free')
    }));
}

const handleReaddResources = () => {
  // Only modify frontend display of limits
  let newLimits = { ...data.newLimits };
  selectedPlans.forEach(planId => {
      const plan = plans.find(p => p.id === planId);
      if (plan) {
          Object.keys(plan.resources).forEach(key => {
              const currentValue = parseInt(newLimits[key] || 0, 10);
              const planValue = parseInt(plan.resources[key] || 0, 10);
              newLimits[key] = currentValue + planValue;
          });
      }
  });
  setData('newLimits', newLimits);
};

const handleRemoveResources = () => {
  // Only modify frontend display of limits
  let newLimits = { ...data.newLimits };
  selectedPlans.forEach(planId => {
      const plan = plans.find(p => p.id === planId);
      if (plan) {
          Object.keys(plan.resources).forEach(key => {
              const currentValue = parseInt(newLimits[key] || 0, 10);
              const planValue = parseInt(plan.resources[key] || 0, 10);
              newLimits[key] = Math.max(0, currentValue - planValue);
          });
      }
  });
  setData('newLimits', newLimits);
};

  const renderInputField = (field, label, value, type = 'text') => (
    <div className="space-y-2">
      <Label htmlFor={field}>{label}</Label>
      <Input
        id={field}
        type={type}
        value={value}
        onChange={(e) => setData(field, e.target.value)}
        placeholder={`Enter user's ${label.toLowerCase()}`}
        className={errors[field] ? 'border-red-500' : ''}
      />
      {errors[field] && <p className="text-xs text-red-500">{errors[field]}</p>}
    </div>
  );

  const renderNestedFields = (prefix, fields, label) => (
    <div className="space-y-2">
        <Label>{label}</Label>
        <div className="grid grid-cols-2 gap-4">
            {Object.keys(fields).map((key) => (
                <div key={key} className="space-y-2">
                    <Label htmlFor={`${prefix}_${key}`}>
                        {`${key.charAt(0).toUpperCase() + key.slice(1)}`}
                    </Label>
                    <Input
                        id={`${prefix}_${key}`}
                        type="number"
                        value={fields[key]}
                        onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            setData(prefix, { 
                                ...fields, 
                                [key]: isNaN(value) ? 0 : value 
                            });
                        }}
                        placeholder={`${key.charAt(0).toUpperCase() + key.slice(1)} Limit`}
                    />
                </div>
            ))}
        </div>
    </div>
);

  if (initialLoad) {
    return (
      <div className="flex items-center justify-center h-screen">
       <LoadingScreen/>
      </div>
    );
  }

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Update User</CardTitle>
          <CardDescription>Update the details for this user</CardDescription>
        </CardHeader>
        <CardContent>
          {flashMessage && flashMessage.type !== 'success' && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{flashMessage.message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {renderInputField('newName', 'Name', data.newName)}
              {renderInputField('newEmail', 'Email', data.newEmail, 'email')}
              {renderInputField('newPterodactylId', 'Pterodactyl Id', data.newPterodactylId, 'number')}
              {renderInputField('newDiscordId', 'Discord ID', data.newDiscordId)}
              {renderInputField('newCoins', 'Coins', data.newCoins, 'number')}
            </div>

            <div className="space-y-2">
              <Label>Rank</Label>
              <div className="flex gap-2">
                {['free', 'premium', 'admin'].map((rank) => (
                  <Button
                    key={rank}
                    type="button"
                    variant={data.newRank === rank ? 'default' : 'outline'}
                    onClick={() => handleRankChange(rank)}
                  >
                    {rank.charAt(0).toUpperCase() + rank.slice(1)}
                  </Button>
                ))}
              </div>
              {errors.newRank && <p className="text-xs text-red-500">{errors.newRank}</p>}
            </div>

            <div className="space-y-4">
              <Label>Server Plans</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map(plan => (
                  <div
                    key={plan.id}
                    className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedPlans.includes(plan.id) 
                        ? 'border-primary bg-primary/10' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => handlePlanToggle(plan)}
                  >
                    <div className="flex items-center gap-3">
                      {plan.icon && (
                        <img 
                          src={plan.icon} 
                          alt={plan.name} 
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <h3 className="font-medium">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 space-y-1 text-sm">
                      {Object.entries(plan.resources).map(([key, value]) => (
                        value > 0 && (
                          <div key={key} className="flex items-center gap-2">
                            <span className="capitalize">{key}:</span>
                            <span className="font-medium">{value}</span>
                          </div>
                        )
                      ))}
                    </div>

                    {selectedPlans.includes(plan.id) && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleReaddResources}>Readd Plan Resources</Button>
                <Button onClick={handleRemoveResources}>Remove Plan Resources</Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {renderNestedFields('newResources', data.newResources, 'Resources')}
              {renderNestedFields('newLimits', data.newLimits, 'Limits')}
            </div>

            <Button 
    type="button" 
    variant="destructive"
    onClick={handleDelete}
    className="flex-1"
  >
    Delete User
  </Button>
 

            <Button type="submit" className="w-full" disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update User'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={showSuccessDialog} onOpenChange={handleSuccessClose}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              Success!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {flashMessage?.message || 'User details have been successfully updated!'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleSuccessClose}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}