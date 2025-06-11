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
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, Calendar, Clock, Infinity } from "lucide-react";
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
    planIds: [],
    subscriptions: [] // Track active subscriptions
  });

  const { flash } = usePage().props;
  const [flashMessage, setFlashMessage] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isUserUpdated, setIsUserUpdated] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [userSubscriptions, setUserSubscriptions] = useState([]);

  // Fetch available plans on component mount
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

  // Handle user deletion
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      router.delete(`/admin/users/${userId}`, {
        onSuccess: () => {
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

  // Initial data fetch
  useEffect(() => {
    if (userId && initialLoad) {
      const fetchUserData = async () => {
        try {
          // Fetch basic user data
          const userResponse = await fetch(`/admin/api/users/${userId}`);
          const userData = await userResponse.json();
          
          // Fetch subscriptions
          const subscriptionsResponse = await fetch(`/admin/api/users/${userId}/subscriptions`);
          const subscriptionsData = await subscriptionsResponse.json();
          
          // Combine data
          const userSubscriptions = subscriptionsData.success ? subscriptionsData.subscriptions : [];
          
          setData({
            newName: userData.name,
            newPterodactylId: userData.pterodactyl_id,
            newEmail: userData.email,
            newDiscordId: userData.discord_id,
            newRank: userData.rank || 'free',
            newCoins: userData.coins || 0,
            newResources: userData.resources || {},
            newLimits: userData.limits || {},
            planIds: userData.purchases_plans || [],
            subscriptions: userSubscriptions
          });
          
          setSelectedPlans(userData.purchases_plans || []);
          setUserSubscriptions(userSubscriptions);
          setInitialLoad(false);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setInitialLoad(false);
        }
      };

      fetchUserData();
    }
  }, [userId, initialLoad, setData]);

  // Handle flash messages
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

  // Show success dialog when user is updated
  useEffect(() => {
    if (isUserUpdated) {
      setShowSuccessDialog(true);
    }
  }, [isUserUpdated]);

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await put(`/admin/api/users/${userId}/update`);
    } catch (error) {
      console.error('An error occurred while submitting the form.');
    }
  };

  // Handle rank change
  const handleRankChange = (rank) => {
    setData('newRank', rank);
  };

  // Close success dialog
  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    reset();
    setIsUserUpdated(false);
  };

  // Icon for plan type
  const getPlanTypeIcon = (planType) => {
    switch (planType) {
      case 'monthly':
        return <Calendar className="h-4 w-4" />;
      case 'annual':
        return <Clock className="h-4 w-4" />;
      case 'onetime':
        return <Infinity className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Badge color for plan type
  const getPlanTypeBadgeColor = (planType) => {
    switch (planType) {
      case 'monthly':
        return 'bg-blue-100 text-blue-800';
      case 'annual':
        return 'bg-green-100 text-green-800';
      case 'onetime':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format duration based on plan type
  const formatDuration = (planType, duration) => {
    switch (planType) {
      case 'monthly':
        return '30 days';
      case 'annual':
        return '365 days';
      case 'onetime':
        return 'Permanent';
      default:
        return duration ? `${duration} days` : 'Unknown';
    }
  };

  // Refresh user data from API
  const refreshUserData = async () => {
    try {
      // Fetch basic user data
      const userResponse = await fetch(`/admin/api/users/${userId}`);
      const userData = await userResponse.json();
      
      // Fetch subscriptions
      const subscriptionsResponse = await fetch(`/admin/api/users/${userId}/subscriptions`);
      const subscriptionsData = await subscriptionsResponse.json();
      
      // Set updated data
      const userSubscriptions = subscriptionsData.success ? subscriptionsData.subscriptions : [];
      setUserSubscriptions(userSubscriptions);
      setSelectedPlans(userData.purchases_plans || []);
      
      // Update form data
      setData(prev => ({
        ...prev,
        newLimits: userData.limits || {},
        planIds: userData.purchases_plans || [],
        newRank: userData.rank || prev.newRank,
        subscriptions: userSubscriptions
      }));
      
      return { userData, userSubscriptions };
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      return null;
    }
  };

  // Toggle plan (add or remove)
  const handlePlanToggle = async (plan) => {
    const isSelected = selectedPlans.includes(plan.id);
    
    if (isSelected) {
      // For removal, find the active subscription and cancel it
      const subscription = userSubscriptions.find(
        sub => sub.plan_id === plan.id && sub.status === 'active'
      );
      
      if (subscription) {
        await handleCancelSubscription(subscription.id);
      } else {
        // If no active subscription found, just update UI
        const newSelectedPlans = selectedPlans.filter(id => id !== plan.id);
        let newLimits = { ...data.newLimits };
        
        // Subtract from limits only on the frontend
        Object.keys(plan.resources).forEach(key => {
          newLimits[key] = Math.max(0, parseInt(newLimits[key] || 0, 10) - parseInt(plan.resources[key] || 0, 10));
        });
        
        setSelectedPlans(newSelectedPlans);
        setData(prev => ({
          ...prev,
          newLimits,
          planIds: newSelectedPlans,
          newRank: prev.newRank === 'admin' ? 'admin' : (newSelectedPlans.length > 0 ? 'premium' : 'free')
        }));
      }
    } else {
      // For adding, use the grant-plan endpoint
      await handleGrantPlan(plan);
    }
  };

  // Grant a plan to the user
  const handleGrantPlan = async (plan) => {
    try {
      const response = await axios.post(`/admin/api/users/${userId}/grant-plan`, {
        planId: plan.id,
        planType: plan.planType
      });

      if (response.data.success) {
        // Refresh user data
        await refreshUserData();
        
        setFlashMessage({
          type: 'success',
          message: `Successfully granted ${plan.name} to user`
        });
      }
    } catch (error) {
      console.error('Failed to grant plan:', error);
      setFlashMessage({
        type: 'error',
        message: 'Failed to grant plan to user: ' + (error.response?.data?.message || error.message)
      });
    }
  };

  // Re-add resources from selected plans
  const handleReaddResources = () => {
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

  // Remove resources from selected plans
  const handleRemoveResources = () => {
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

  // Cancel a subscription
  const handleCancelSubscription = async (subscriptionId) => {
    if (!confirm('Are you sure you want to cancel this subscription? Resources will be removed when it expires.')) {
      return;
    }
    
    try {
      const response = await axios.post(`/admin/api/subscriptions/${subscriptionId}/cancel`);
      
      if (response.data.success) {
        // Refresh user data
        await refreshUserData();
        
        setFlashMessage({
          type: 'success',
          message: 'Subscription cancelled successfully'
        });
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      setFlashMessage({
        type: 'error',
        message: 'Failed to cancel subscription: ' + (error.response?.data?.message || error.message)
      });
    }
  };

  // Render an input field
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

  // Render nested fields (resources and limits)
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

  // Show loading screen during initial data fetch
  if (initialLoad) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingScreen/>
      </div>
    );
  }

  return (
    <>
      <Card className="w-full max-w-6xl mx-auto">
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
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-6">
              {renderInputField('newName', 'Name', data.newName)}
              {renderInputField('newEmail', 'Email', data.newEmail, 'email')}
              {renderInputField('newPterodactylId', 'Pterodactyl Id', data.newPterodactylId, 'number')}
              {renderInputField('newDiscordId', 'Discord ID', data.newDiscordId)}
              {renderInputField('newCoins', 'Coins', data.newCoins, 'number')}
            </div>

            {/* Rank Selection */}
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

            {/* Current Active Subscriptions */}
            {userSubscriptions.length > 0 && (
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Active Subscriptions</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userSubscriptions.map(subscription => {
                    const plan = plans.find(p => p.id === subscription.plan_id);
                    if (!plan) return null;
                    
                    const daysRemaining = subscription.days_remaining;
                    
                    return (
                      <div key={subscription.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{plan.name}</h4>
                          <Badge className={`flex items-center gap-1 ${
                            daysRemaining < 5 ? 'bg-red-100 text-red-800' : 
                            daysRemaining < 15 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {getPlanTypeIcon(plan.planType)}
                            {plan.planType}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                        
                        <div className="flex flex-col space-y-2">
                          {subscription.expires_at ? (
                            <div className="flex justify-between items-center">
                              <span className="text-sm">
                                Expires: {new Date(subscription.expires_at).toLocaleDateString()}
                              </span>
                              <Badge className={`${
                                daysRemaining < 5 ? 'bg-red-100 text-red-800' : 
                                daysRemaining < 15 ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-green-100 text-green-800'
                              }`}>
                                {daysRemaining} days remaining
                              </Badge>
                            </div>
                          ) : (
                            <Badge className="bg-purple-100 text-purple-800 w-fit">
                              Never Expires
                            </Badge>
                          )}
                          
                          <Button 
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelSubscription(subscription.id)}
                            className="w-full mt-2"
                          >
                            Cancel Subscription
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Available Plans */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Available Plans</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map(plan => {
                  const isSelected = selectedPlans.includes(plan.id);
                  const hasActiveSubscription = userSubscriptions.some(sub => sub.plan_id === plan.id && sub.status === 'active');
                  
                  return (
                    <div
                      key={plan.id}
                      className={`relative p-4 border rounded-lg transition-all ${
                        isSelected || hasActiveSubscription
                          ? 'border-primary bg-primary/10' 
                          : 'hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {plan.icon && (
                          <img 
                            src={plan.icon} 
                            alt={plan.name} 
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{plan.name}</h3>
                            <Badge className={`${getPlanTypeBadgeColor(plan.planType)} flex items-center gap-1`}>
                              {getPlanTypeIcon(plan.planType)}
                              {plan.planType}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                        </div>
                      </div>
                      
                      <div className="mb-3 space-y-1 text-sm">
                        <div className="text-xs text-gray-500 mb-2">
                          <p>Price: <span className="font-medium">${plan.price}</span></p>
                          <p>Duration: {formatDuration(plan.planType, plan.duration)}</p>
                          {plan.maxUsers > 1 && <p>Max Users: {plan.maxUsers}</p>}
                        </div>
                        
                        <div className="text-sm">
                          <p className="font-medium mb-1">Resources:</p>
                          {Object.entries(plan.resources || {}).map(([key, value]) => (
                            value > 0 && (
                              <div key={key} className="flex items-center justify-between">
                                <span className="capitalize">{key}:</span>
                                <span className="font-medium">{value}</span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={isSelected ? "destructive" : "default"}
                          onClick={() => isSelected ? handlePlanToggle(plan) : handleGrantPlan(plan)}
                          className="flex-1"
                        >
                          {isSelected ? 'Remove' : 'Grant Plan'}
                        </Button>
                      </div>

                      {(isSelected || hasActiveSubscription) && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button type="button" onClick={handleReaddResources}>Readd Plan Resources</Button>
                <Button type="button" onClick={handleRemoveResources}>Remove Plan Resources</Button>
              </div>
            </div>

            {/* Resources and Limits */}
            <div className="grid grid-cols-2 gap-6">
              {renderNestedFields('newResources', data.newResources, 'Current Resources')}
              {renderNestedFields('newLimits', data.newLimits, 'Resource Limits')}
            </div>

            {/* Form Actions */}
            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="destructive"
                onClick={handleDelete}
                className="flex-1"
              >
                Delete User
              </Button>

              <Button type="submit" className="flex-1" disabled={processing}>
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update User'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Success Dialog */}
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