import React, { useState, useEffect, useRef } from 'react';
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

export default function ServerCreate() {
  const { locations, eggs, auth } = usePage().props;
  const [pingResults, setPingResults] = useState({});
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  
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
      //console.log ('No locations available');
      return;
    }

    const checkPing = async (location) => {
      if (!location.latencyurl) {
        //console.log ('No latency URL for location:', location.name);
        return;
      }

      try {
        //console.log ('Checking ping for:', location.name);
        const measurements = [];

        // Take 3 measurements
        for (let i = 0; i < 3; i++) {
          const start = performance.now(); // More precise than Date.now()
          await fetch(location.latencyUrl, {
            mode: 'cors',
            cache: 'no-cache',
            method: 'HEAD', // Only get headers, not full response
          });
          const end = performance.now();
          measurements.push(end - start);
        }

        // Calculate average, excluding outliers
        const latency = Math.round(
          measurements
            .sort((a, b) => a - b) // Sort ascending
            .slice(0, 2) // Take first 2 measurements (exclude highest)
            .reduce((a, b) => a + b, 0) / 2 // Average
        );

        //console.log ('Latency measurements:', measurements);
        //console.log ('Final latency:', latency);

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

  const ServerTypeDropdown = ({ eggs, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedEgg = eggs.find((egg) => egg.id === value);

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-3 py-2 border rounded-md
                        bg-white dark:white 
                        text-black dark:text-black
                        hover:bg-gray-50 dark:hover:bg-zinc-700
                        transition-colors
                        ${isOpen ? 'ring-2 ring-primary' : ''}`}
        >
          <span className="text-sm">{selectedEgg ? selectedEgg.name : 'Select server type'}</span>
          <LucideChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 py-1 bg-white dark:bg-black border rounded-md shadow-lg">
            {eggs.map((egg) => (
              <button
                key={egg.id}
                type="button"
                onClick={() => {
                  onChange(egg.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm
                                    text-black dark:text-white
                                    hover:bg-gray-50 dark:hover:bg-zinc-700 rounded-lg
                                    ${value === egg.id ? 'bg-gray-100 dark:bg-black' : ''}`}
              >
                {egg.name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('servers.store'));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
              <Label className="text-black dark:text-white">Server Type</Label>
              <ServerTypeDropdown eggs={eggs} value={data.egg_id} onChange={(value) => setData('egg_id', value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LucideMemoryStick className="h-5 w-5" />
              Resources
            </CardTitle>
            <CardDescription>Server resource allocation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ResourceInput
              label="Memory"
              value={data.memory}
              onChange={(value) => setData('memory', value)}
              min={128}
              max={calculateRemaining('memory')}
              step={128}
              remaining={calculateRemaining('memory')}
            />

            <ResourceInput
              label="Disk"
              value={data.disk}
              onChange={(value) => setData('disk', value)}
              min={512}
              max={calculateRemaining('disk')}
              remaining={calculateRemaining('disk')}
            />

            <ResourceInput
              label="CPU"
              value={data.cpu}
              onChange={(value) => setData('cpu', value)}
              min={10}
              max={calculateRemaining('cpu')}
              step={5}
              remaining={calculateRemaining('cpu')}
            />

            <div className="grid grid-cols-3 gap-4">
              <SmallResourceInput
                label="Databases"
                value={data.databases}
                onChange={(value) => setData('databases', value)}
                max={calculateRemaining('databases')}
                remaining={calculateRemaining('databases')}
              />
              <SmallResourceInput
                label="Backups"
                value={data.backups}
                onChange={(value) => setData('backups', value)}
                min={0}
                max={calculateRemaining('backups')}
                remaining={calculateRemaining('backups')}
              />
              <SmallResourceInput
                label="Ports"
                value={data.allocations}
                onChange={(value) => setData('allocations', value)}
                min={0}
                max={calculateRemaining('allocations')}
                remaining={calculateRemaining('allocations')}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={processing}>
          {processing ? 'Creating...' : 'Create Server'}
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

// Add these components below the main ServerCreate function

const ResourceInput = ({ label, value, onChange, min, max, step, remaining }) => {
  const displayValue = value === 0 ? '' : value;

  const handleChange = (e) => {
    const newValue = e.target.value === '' ? '' : parseInt(e.target.value);
    onChange(newValue);
  };

  const hasError = value > remaining;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <Input
          type="number"
          min={min}
          max={max}
          step={step}
          value={displayValue}
          onChange={handleChange}
          className={hasError ? 'border-red-500' : ''}
        />
        <span className="w-20 text-right">
          {value ? `${value}${label.includes('CPU') ? '%' : 'MB'}` : '-'}
        </span>
      </div>
      <div className="text-xs text-muted-foreground">
        Remaining: {remaining}
        {label.includes('CPU') ? '%' : 'MB'}
      </div>
      {hasError && (
        <Alert variant="destructive">
          <AlertDescription>
            You don't have enough {label.toLowerCase()} resources available. Maximum: {remaining}
          </AlertDescription>
        </Alert>
      )}
      {value < min && value !== '' && (
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

const SmallResourceInput = ({ label, value, onChange, min, max, remaining }) => {
  const displayValue = value === 0 ? '' : value;

  const handleChange = (e) => {
    const newValue = e.target.value === '' ? '' : parseInt(e.target.value);
    onChange(newValue);
  };

  const hasError = value > remaining;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="number"
        min={min}
        max={max}
        value={displayValue}
        onChange={handleChange}
        className={hasError ? 'border-red-500' : ''}
      />
      <div className="text-xs text-muted-foreground">Remaining: {remaining}</div>
      {hasError && (
        <Alert variant="destructive">
          <AlertDescription>
            You don't have enough {label.toLowerCase()} available. Maximum: {remaining}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};