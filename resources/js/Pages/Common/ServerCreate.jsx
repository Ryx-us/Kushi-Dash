import React, { useState, useEffect } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Server, LucideMemoryStick, LucideCrown, LucideHammer, LucideChevronDown } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Info } from 'lucide-react';

export default function ServerCreate() {
  const { locations, eggs, auth } = usePage().props;
  const [pingResults, setPingResults] = useState({});
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [selectedEggId, setSelectedEggId] = useState(null);
  const [demoEnabled, setDemoEnabled] = useState(false);
  const [showDemoOption, setShowDemoOption] = useState(false);
  
  const { flash } = usePage().props;
  const isError = flash?.status?.includes('Error');

  const { data, setData, post, processing, errors } = useForm({
    name: '',
    location_id: '',
    egg_id: '',
    memory: '',
    disk: '',
    cpu: '',
    databases: '',
    backups: '',
    allocations: '',
  });

  const user = auth.user;

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    router.visit('/dashboard');
  };

  const handleAccessServer = () => {
    if (flash.server_url) {
      window.open(flash.server_url, '_blank');
    }
  };

  const handleErrorClose = () => {
    setShowErrorDialog(false);
  };

  const calculateRemaining = (resource) => {
    const used = parseInt(auth.user.resources?.[resource] || 0, 10);
    const limit = parseInt(auth.user.limits?.[resource] || 0, 10);
    return Math.max(0, limit - used);
  };

  useEffect(() => {
    if (flash?.status) {
      if (isError) {
        setShowErrorDialog(true);
      } else {
        setShowSuccessDialog(true);
      }
    }
  }, [flash?.status, isError]);

  useEffect(() => {
    if (!Array.isArray(locations) || locations.length === 0) {
      return;
    }

    const checkPing = async (location) => {
      if (!location.latencyurl) {
        return;
      }

      try {
        const measurements = [];

        for (let i = 0; i < 3; i++) {
          const start = performance.now();
          await fetch(location.latencyUrl, {
            mode: 'cors',
            cache: 'no-cache',
            method: 'HEAD',
          });
          const end = performance.now();
          measurements.push(end - start);
        }

        const latency = Math.round(
          measurements
            .sort((a, b) => a - b)
            .slice(0, 2)
            .reduce((a, b) => a + b, 0) / 2
        );

        setPingResults((prev) => ({
          ...prev,
          [location.id]: latency,
        }));
      } catch (error) {
        console.error('Ping check failed:', error);
        setPingResults((prev) => ({
          ...prev,
          [location.id]: -1,
        }));
      }
    };

    locations.forEach((location) => checkPing(location));
  }, [locations]);

  const getRankDisplay = (location) => {
    if (location.maintenance) {
      return (
        <div className="flex items-center space-x-1 text-xs text-orange-500">
          <LucideHammer size={16} />
          <span>Maintenance</span>
        </div>
      );
    }

    switch (location.requiredRank) {
      case 'admin':
        return (
          <div className="flex items-center space-x-1 text-xs text-red-500">
            <LucideCrown size={16} />
            <span>Admin</span>
          </div>
        );
      case 'premium':
        return (
          <div className="flex items-center space-x-1 text-xs text-yellow-500">
            <LucideCrown size={16} />
            <span>Premium</span>
          </div>
        );
      case 'free':
        return (
          <div className="flex items-center space-x-1 text-xs text-green-500">
            <span>Free</span>
          </div>
        );
      default:
        return null;
    }
  };

  const EggGrid = ({ eggs, onSelectEgg }) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {eggs.map((egg) => (
          <div
            key={egg.id}
            className={`relative rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 ${
              selectedEggId === egg.id ? 'ring-4 ring-blue-500' : ''
            }`}
            onClick={() => onSelectEgg(egg.id)}
            style={{
              minHeight: '200px',
              background: egg.imageUrl ? `url(${egg.imageUrl}) center/cover` : '#f0f0f0',
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-60 p-4">
              <div className="flex items-center gap-3 mb-3">
                {egg.icon && (
                  <img
                    src={egg.icon}
                    alt={`${egg.name} icon`}
                    className="w-8 h-8 object-contain"
                  />
                )}
                <h3 className="text-xl font-semibold text-white">{egg.name}</h3>
              </div>
              
              <p className="text-sm text-gray-200 line-clamp-3">
                {egg.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('servers.store'));
  };

  // Check if demo mode is enabled in the environment
  useEffect(() => {
    // We'll use an API endpoint to check if DEMO=true in the environment
    fetch('/api/check-demo-enabled')
      .then(response => response.json())
      .then(data => {
        setShowDemoOption(data.enabled);
      })
      .catch(error => {
        console.error('Failed to check if demo is enabled:', error);
      });
  }, []);

  // Update form when demo is toggled
  useEffect(() => {
    if (demoEnabled) {
      // Set data.is_demo when the demo switch is toggled
      setData(prev => ({ ...prev, is_demo: true }));
    } else {
      setData(prev => ({ ...prev, is_demo: false }));
    }
  }, [demoEnabled]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Show demo toggle if enabled in environment */}
      {showDemoOption && (
        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              <Info className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-400">Demo Mode</h3>
                <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                  Create a temporary server that will be automatically suspended after 48 hours. Demo servers don't count against your resource limits.
                </p>
                <div className="mt-3 flex items-center space-x-2">
                  <Switch
                    checked={demoEnabled}
                    onCheckedChange={setDemoEnabled}
                    id="demo-mode"
                  />
                  <Label htmlFor="demo-mode" className="font-medium text-amber-800 dark:text-amber-400">
                    Enable demo mode
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Server Details
            </CardTitle>
            <CardDescription>Basic server configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Server Name</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="My Awesome Server"
              />
              {errors.name && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.name}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {locations.map((location) => (
                  <div
                    key={location.id}
                    className={`group flex flex-col p-4 bg-card border rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent/50 hover:border-accent ${
                      data.location_id === location.platform ? 'ring-2 ring-primary border-primary' : ''
                    } ${location.maintenance ? 'opacity-50' : ''}`}
                    onClick={() => !location.maintenance && setData('location_id', location.platform)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={location.flag}
                        alt={`${location.name} flag`}
                        className="w-10 h-7 rounded-sm object-cover shadow-sm"
                      />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{location.name}</span>
                        <div className="mt-0.5">{getRankDisplay(location)}</div>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground mb-2">{location.description}</div>

                    {pingResults[location.id] !== undefined && (
                      <div
                        className={`text-xs flex items-center gap-1.5 ${
                          pingResults[location.id] < 170
                            ? 'text-green-500'
                            : pingResults[location.id] < 500
                            ? 'text-yellow-500'
                            : 'text-red-500'
                        }`}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        {pingResults[location.id] === -1 ? 'Connection Error' : `${pingResults[location.id]}ms`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <EggGrid 
                eggs={eggs} 
                onSelectEgg={(id) => {
                  setSelectedEggId(id);
                  setData('egg_id', id);
                }} 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LucideMemoryStick className="h-5 w-5" />
              Resources
            </CardTitle>
            <CardDescription>
              {demoEnabled 
                ? "Demo servers use pre-configured resources" 
                : "Server resource allocation"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {demoEnabled && (
              <Alert className="bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                <AlertDescription>
                  Demo servers are configured with preset resources: 100% CPU, 1024MB Memory, 5120MB Disk, 
                  and 1 each for databases, backups, and ports.
                </AlertDescription>
              </Alert>
            )}

            <ResourceInput
              label="Memory"
              value={data.memory}
              onChange={(value) => setData('memory', value)}
              min={128}
              max={calculateRemaining('memory')}
              step={128}
              remaining={calculateRemaining('memory')}
              isDemoMode={demoEnabled}
            />

            <ResourceInput
              label="Disk"
              value={data.disk}
              onChange={(value) => setData('disk', value)}
              min={512}
              max={calculateRemaining('disk')}
              remaining={calculateRemaining('disk')}
              isDemoMode={demoEnabled}
            />

            <ResourceInput
              label="CPU"
              value={data.cpu}
              onChange={(value) => setData('cpu', value)}
              min={10}
              max={calculateRemaining('cpu')}
              step={5}
              remaining={calculateRemaining('cpu')}
              isDemoMode={demoEnabled}
            />

            <div className="grid grid-cols-3 gap-4">
              <SmallResourceInput
                label="Databases"
                value={data.databases}
                onChange={(value) => setData('databases', value)}
                max={calculateRemaining('databases')}
                remaining={calculateRemaining('databases')}
                isDemoMode={demoEnabled}
              />
              <SmallResourceInput
                label="Backups"
                value={data.backups}
                onChange={(value) => setData('backups', value)}
                min={0}
                max={calculateRemaining('backups')}
                remaining={calculateRemaining('backups')}
                isDemoMode={demoEnabled}
              />
              <SmallResourceInput
                label="Ports"
                value={data.allocations}
                onChange={(value) => setData('allocations', value)}
                min={0}
                max={calculateRemaining('allocations')}
                remaining={calculateRemaining('allocations')}
                isDemoMode={demoEnabled}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={processing}>
          {processing ? 'Creating...' : demoEnabled ? 'Create Demo Server' : 'Create Server'}
        </Button>
      </div>

      

<AlertDialog open={!isError && showSuccessDialog} onOpenChange={handleSuccessClose}>
  <AlertDialogContent className="max-w-md">
    <AlertDialogHeader>
      <AlertDialogTitle className="flex items-center gap-2">
        <CheckCircle2 className="h-6 w-6 text-green-500" />
        Success!
      </AlertDialogTitle>
      <AlertDialogDescription className="text-base">
        {flash?.status || 'Your server has been created successfully!'}
        
        {flash?.is_demo && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
            <p className="font-medium text-amber-800 dark:text-amber-400">Demo Server Information</p>
            <p className="mt-1 text-amber-700 dark:text-amber-500">
              This is a demo server that will be automatically suspended after 48 hours. Enjoy trying out our service!
            </p>
          </div>
        )}
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter className="flex gap-2">
      <AlertDialogAction onClick={handleSuccessClose}>Continue</AlertDialogAction>
      {flash?.server_url && (
        <Button onClick={handleAccessServer} variant="outline">
          Access Server
        </Button>
      )}
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

      <AlertDialog open={showErrorDialog} onOpenChange={handleErrorClose}>
        <AlertDialogContent className="max-w-md rounded-lg shadow-lg shadow-orange-950">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-red-500" />
              Error
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {flash?.status || 'Failed to create server. Please try again.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleErrorClose}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}

const ResourceInput = ({ label, value, onChange, min, max, step, remaining, isDemoMode }) => {
  const displayValue = value === 0 ? '' : value;

  const handleChange = (e) => {
    const newValue = e.target.value === '' ? '' : parseInt(e.target.value);
    onChange(newValue);
  };

  // Don't show errors in demo mode
  const hasError = !isDemoMode && value > remaining;

  // Set demo defaults based on label
  useEffect(() => {
    if (isDemoMode) {
      let demoValue;
      switch(label) {
        case 'CPU':
          demoValue = 100;
          break;
        case 'Memory':
          demoValue = 1024;
          break;
        case 'Disk':
          demoValue = 5120;
          break;
        default:
          demoValue = min || 0;
      }
      onChange(demoValue);
    }
  }, [isDemoMode, label]);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <Input
          type="number"
          min={min}
          max={isDemoMode ? undefined : max}
          step={step}
          value={displayValue}
          onChange={handleChange}
          className={hasError ? 'border-red-500' : ''}
          disabled={isDemoMode}
        />
        <span className="w-20 text-right">
          {value ? `${value}${label.includes('CPU') ? '%' : 'MB'}` : '-'}
        </span>
      </div>
      {isDemoMode ? (
        <div className="text-xs text-amber-600 dark:text-amber-400">
          Demo server with pre-configured resources
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">
          Remaining: {remaining}
          {label.includes('CPU') ? '%' : 'MB'}
        </div>
      )}
      {!isDemoMode && hasError && (
        <Alert variant="destructive">
          <AlertDescription>
            You don't have enough {label.toLowerCase()} resources available. Maximum: {remaining}
          </AlertDescription>
        </Alert>
      )}
      {!isDemoMode && value < min && value !== '' && (
        <Alert variant="destructive">
          <AlertDescription>
            Minimum {label.toLowerCase()} is {min}
            {label.includes('CPU') ? '%' : 'MB'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

const SmallResourceInput = ({ label, value, onChange, min, max, remaining, isDemoMode }) => {
  const displayValue = value === 0 ? '' : value;

  const handleChange = (e) => {
    const newValue = e.target.value === '' ? '' : parseInt(e.target.value);
    onChange(newValue);
  };

  // Don't show errors in demo mode
  const hasError = !isDemoMode && value > remaining;

  // Set demo defaults based on label
  useEffect(() => {
    if (isDemoMode) {
      let demoValue;
      switch(label) {
        case 'Databases':
          demoValue = 1;
          break;
        case 'Backups':
          demoValue = 1;
          break;
        case 'Ports':
          demoValue = 1;
          break;
        default:
          demoValue = min || 0;
      }
      onChange(demoValue);
    }
  }, [isDemoMode, label]);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="number"
        min={min}
        max={isDemoMode ? undefined : max}
        value={displayValue}
        onChange={handleChange}
        className={hasError ? 'border-red-500' : ''}
        disabled={isDemoMode}
      />
      {isDemoMode ? (
        <div className="text-xs text-amber-600 dark:text-amber-400">
          Demo preset
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">Remaining: {remaining}</div>
      )}
      {!isDemoMode && hasError && (
        <Alert variant="destructive">
          <AlertDescription>
            You don't have enough {label.toLowerCase()} available. Maximum: {remaining}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

