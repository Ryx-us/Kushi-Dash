import React, { useEffect, useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Map, Server, Flag, Globe, Wifi, User, CreditCard, Settings, ChevronRight } from 'lucide-react';
import axios from 'axios';

const LocationEdit = () => {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { location, flash } = usePage().props;
  const locationId = location.id;
  const locationIdProp = usePage().props.location.id;

  const { data, setData, put, errors } = useForm({
    name: '',
    location: '',
    servers: 0,
    flag: '',
    maxservers: 0,
    latencyurl: '',
    requiredRank: '',
    maintenance: false,
    requiredSubscriptions: [],
    coinRenewal: {
      amount: 0,
      hours: 0,
      exceptions: []
    },
    platform: '',
    platform_settings: null,
  });

  useEffect(() => {
    const success = location?.flash?.success ?? null;
    setShowSuccessModal(!!success);
  }, [location?.flash?.success]);

  const handleCheckboxChange = (planId) => {
    const updatedSubscriptions = data.requiredSubscriptions.includes(planId)
      ? data.requiredSubscriptions.filter(id => id !== planId)
      : [...data.requiredSubscriptions, planId];

    handleInputChange('requiredSubscriptions', updatedSubscriptions);
  };

  const SuccessModal = () => (
    <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold text-green-600">Success</DialogTitle>
        </DialogHeader>
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-700">{flash.success}</AlertDescription>
        </Alert>
        <div className="flex justify-center mt-4">
          <Button onClick={() => setShowSuccessModal(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Fetch initial location data only once
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axios.get(`/admin/api/locations/${locationIdProp}`);
        const locationData = response.data.location;
        
        // Parse JSON fields if they're stored as strings
        let platformSettings = locationData.platform_settings;
        if (typeof platformSettings === 'string') {
          try {
            platformSettings = JSON.parse(platformSettings);
          } catch (e) {
            platformSettings = null;
          }
        }
        
        let coinRenewal = locationData.coinRenewal;
        if (typeof coinRenewal === 'string') {
          try {
            coinRenewal = JSON.parse(coinRenewal);
          } catch (e) {
            coinRenewal = {
              amount: 0,
              hours: 0,
              exceptions: []
            };
          }
        } else if (!coinRenewal) {
          coinRenewal = {
            amount: 0,
            hours: 0,
            exceptions: []
          };
        }
        
        // Set initial form data once
        setData(prevData => ({
          ...prevData,
          name: locationData.name || '',
          location: locationData.location || '',
          servers: locationData.servers || 0,
          flag: locationData.flag || '',
          maxservers: locationData.maxservers || 0,
          latencyurl: locationData.latencyurl || '',
          requiredRank: locationData.requiredRank || '',
          maintenance: Boolean(locationData.maintenance),
          requiredSubscriptions: locationData.requiredSubscriptions || [],
          coinRenewal: coinRenewal,
          platform: locationData.platform || '',
          platform_settings: platformSettings,
        }));
      } catch (error) {
        console.error('Error fetching location:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [locationIdProp]);

  // Fetch plans once
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get('/admin/api/plans');
        setPlans(response.data.plans || []);
      } catch (err) {
        setPlansError('Failed to load plans.');
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Format coinRenewal for submission
    let formattedData = {...data};
    
    if (formattedData.coinRenewal) {
      formattedData.coinRenewal = JSON.stringify(formattedData.coinRenewal);
    }
    
    if (formattedData.platform_settings) {
      formattedData.platform_settings = JSON.stringify(formattedData.platform_settings);
    }
    
    put(`/admin/locations/${locationId}`, {
      data: formattedData,
      onSuccess: () => {
        setShowSuccessModal(true);
      },
      onError: (errors) => {
        console.error('Error updating location:', errors);
      }
    });
  };

  const handleInputChange = (field, value) => {
    setData(prevData => ({
      ...prevData,
      [field]: value
    }));
  };

  const handleCoinRenewalChange = (field, value) => {
    setData(prevData => ({
      ...prevData,
      coinRenewal: {
        ...prevData.coinRenewal,
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="text-lg font-medium">Loading location data...</span>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            
            <Badge variant={data.maintenance ? "destructive" : "success"} className="ml-2">
              {data.maintenance ? "Maintenance" : "Active"}
            </Badge>
          </div>
          
          <div className="flex space-x-4">
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <Button type="submit" form="location-form" className="px-8">
              Update Location
            </Button>
          </div>
        </div>
        
        <form id="location-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Card */}
          <Card>
            <CardHeader className=" border-b">
              <CardTitle className="flex items-center text-xl">
                <Map className="mr-2 h-5 w-5" /> 
                Basic Location Information
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-6 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Location Name</Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    placeholder="Location name"
                    className="w-full"
                  />
                  {errors.name && (
                    <Alert variant="destructive" className="py-2 mt-1">
                      <AlertDescription>{errors.name}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Physical Location</Label>
                  <Input
                    id="location"
                    value={data.location}
                    onChange={e => handleInputChange('location', e.target.value)}
                    placeholder="e.g., New York, USA"
                    className="w-full"
                  />
                  {errors.location && (
                    <Alert variant="destructive" className="py-2 mt-1">
                      <AlertDescription>{errors.location}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="flag">Flag URL</Label>
                  <Input
                    id="flag"
                    value={data.flag}
                    onChange={e => handleInputChange('flag', e.target.value)}
                    placeholder="https://example.com/flags/us.png"
                    className="w-full"
                  />
                  {errors.flag && (
                    <Alert variant="destructive" className="py-2 mt-1">
                      <AlertDescription>{errors.flag}</AlertDescription>
                    </Alert>
                  )}
                  {data.flag && (
                    <div className="mt-2 flex items-center">
                      <img 
                        src={data.flag} 
                        alt="Flag preview" 
                        className="h-8 w-12 object-cover border rounded" 
                        onError={(e) => e.target.style.display = 'none'}
                      />
                      <span className="ml-2 text-sm text-gray-500">Flag preview</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maintenance" className="block mb-2">Maintenance Mode</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="maintenance"
                      checked={data.maintenance}
                      onCheckedChange={checked => handleInputChange('maintenance', checked)}
                    />
                    <span className="text-sm text-gray-600">
                      {data.maintenance ? "In maintenance (unavailable)" : "Active (available)"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Server Configuration Card */}
          <Card>
            <CardHeader className=" border-b">
              <CardTitle className="flex items-center text-xl">
                <Server className="mr-2 h-5 w-5" /> 
                Server Configuration
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-6 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="servers">Current Servers</Label>
                  <Input
                    id="servers"
                    type="number"
                    value={data.servers}
                    onChange={e => handleInputChange('servers', parseInt(e.target.value) || 0)}
                    placeholder="Current number of servers"
                    className="w-full"
                  />
                  {errors.servers && (
                    <Alert variant="destructive" className="py-2 mt-1">
                      <AlertDescription>{errors.servers}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxservers">Max Servers</Label>
                  <Input
                    id="maxservers"
                    type="number"
                    value={data.maxservers}
                    onChange={e => handleInputChange('maxservers', parseInt(e.target.value) || 0)}
                    placeholder="Maximum servers allowed"
                    className="w-full"
                  />
                  {errors.maxservers && (
                    <Alert variant="destructive" className="py-2 mt-1">
                      <AlertDescription>{errors.maxservers}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 mt-6">
                <Label htmlFor="latencyurl">Latency Test URL</Label>
                <Input
                  id="latencyurl"
                  value={data.latencyurl}
                  onChange={e => handleInputChange('latencyurl', e.target.value)}
                  placeholder="https://ping.example.com"
                  className="w-full"
                />
                {errors.latencyurl && (
                  <Alert variant="destructive" className="py-2 mt-1">
                    <AlertDescription>{errors.latencyurl}</AlertDescription>
                  </Alert>
                )}
                <p className="text-sm text-gray-500 mt-1">URL used for testing connection latency to this location</p>
              </div>
              
              <div className="space-y-2 mt-6">
                <Label htmlFor="platform">Platform (Location ID) </Label>
                <Input
                  id="platform"
                  value={data.platform}
                  onChange={e => handleInputChange('platform', e.target.value)}
                  placeholder="Platform type (e.g., Linux, Windows)"
                  className="w-full"
                />
                {errors.platform && (
                  <Alert variant="destructive" className="py-2 mt-1">
                    <AlertDescription>{errors.platform}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Access Requirements Card */}
          <Card>
            <CardHeader className=" border-b">
              <CardTitle className="flex items-center text-xl">
                <User className="mr-2 h-5 w-5" /> 
                Access Requirements
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-6 pb-4">
              <div className="space-y-2">
                <Label htmlFor="requiredRank">Required User Rank</Label>
                <Input
                  id="requiredRank"
                  value={data.requiredRank}
                  onChange={e => handleInputChange('requiredRank', e.target.value)}
                  placeholder="e.g., Premium, Basic, VIP"
                  className="w-full"
                />
                {errors.requiredRank && (
                  <Alert variant="destructive" className="py-2 mt-1">
                    <AlertDescription>{errors.requiredRank}</AlertDescription>
                  </Alert>
                )}
              </div>
              
              <div className="space-y-2 mt-6">
                <Label className="block mb-2">Required Subscriptions</Label>
                <div className="border rounded-lg p-4 ">
                  {plansLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span>Loading plans...</span>
                    </div>
                  ) : plansError ? (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription>{plansError}</AlertDescription>
                    </Alert>
                  ) : plans.length === 0 ? (
                    <p className="text-sm text-gray-500">No subscription plans available</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {plans.map(plan => (
                        <div key={plan.id} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                          <input
                            id={`plan-${plan.id}`}
                            type="checkbox"
                            checked={data.requiredSubscriptions.includes(plan.id)}
                            onChange={() => handleCheckboxChange(plan.id)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <label htmlFor={`plan-${plan.id}`} className="text-sm font-medium cursor-pointer">
                            {plan.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-3">
                    Select which subscription plans have access to this location
                  </p>
                </div>
              </div>
              
              <div className="mt-6 border rounded-lg p-4 ">
                <div className="flex items-center mb-4">
                  <CreditCard className="mr-2 h-4 w-4" />
                  <h3 className="font-medium">Coin Renewal Settings</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="coinRenewalAmount">Coin Amount</Label>
                    <Input
                      id="coinRenewalAmount"
                      type="number"
                      value={data.coinRenewal?.amount || 0}
                      onChange={e => handleCoinRenewalChange('amount', parseInt(e.target.value) || 0)}
                      placeholder="Coin amount required"
                      className="w-full bg-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="coinRenewalHours">Duration (Hours)</Label>
                    <Input
                      id="coinRenewalHours"
                      type="number"
                      value={data.coinRenewal?.hours || 0}
                      onChange={e => handleCoinRenewalChange('hours', parseInt(e.target.value) || 0)}
                      placeholder="Duration in hours"
                      className="w-full bg-white"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Configure the coin cost and duration for renewal at this location
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Advanced Configuration Card */}
          <Card>
            <CardHeader className=" border-b">
              <CardTitle className="flex items-center text-xl">
                <Settings className="mr-2 h-5 w-5" /> 
                Advanced Configuration
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-6 pb-4">
              <div className="space-y-3">
                <Label htmlFor="platformSettings">Platform Settings (JSON)</Label>
                <textarea
                  id="platformSettings"
                  value={typeof data.platform_settings === 'object' 
                    ? JSON.stringify(data.platform_settings, null, 2) 
                    : data.platform_settings || ''}
                  onChange={e => {
                    try {
                      const value = e.target.value;
                      // Only parse if not empty
                      const parsedValue = value ? JSON.parse(value) : null;
                      handleInputChange('platform_settings', parsedValue);
                    } catch (error) {
                      // If it's not valid JSON yet, store as string
                      handleInputChange('platform_settings', e.target.value);
                    }
                  }}
                  className="w-full min-h-[200px] p-3 border rounded-md font-mono text-sm "
                  placeholder='{"key": "value"}'
                />
                {errors.platform_settings && (
                  <Alert variant="destructive" className="py-2 mt-1">
                    <AlertDescription>{errors.platform_settings}</AlertDescription>
                  </Alert>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Enter platform-specific configuration as JSON
                </p>
              </div>
            </CardContent>
          </Card>
          
          
        </form>
      </div>
      <SuccessModal />
    </>
  );
};

export default LocationEdit;