import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingScreen } from '@/components/loading-screen';

const CreateLocation = () => {
  const [imagePreview, setImagePreview] = useState('');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { data, setData, post, processing, errors } = useForm({
    name: '',
    location: '',
    servers: 0,
    flag: '',
    maxservers: 0,
    latencyurl: '',
    requiredRank: '',
    maintenance: false,
    requiredSubscriptions: [],
    coinRenewal: '',
    platform: '',
    platform_settings: ''
  });



  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/admin/api/plans');
        const result = await response.json();
        
        
        if (result.statusCode === 200 && result.plans) {
          setPlans(result.plans);
        } else {
          setError('Failed to load plans');
        }
      } catch (err) {
        setError('Error fetching plans: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const getLocationData = () => {
    return {
      name: data.name,
      location: data.location,
      servers: data.servers,
      flag: data.flag,
      maxservers: data.maxservers,
      latencyurl: data.latencyurl,
      requiredRank: data.requiredRank,
      maintenance: data.maintenance,
      requiredSubscriptions: data.requiredSubscriptions,
      coinRenewal: data.coinRenewal,
      platform: data.platform,
      platform_settings: data.platform_settings
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const locationData = getLocationData();
    //console.log ('Submitting location data:', locationData);
    post(route('locations.store'), locationData);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Location</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Location Name</Label>
              <Input
                id="name"
                value={data.name}
                onChange={e => {
                    setData({
                      ...data,
                      name: e.target.value,
                      location: e.target.value
                    });
                  }}
                placeholder="Enter location name"
              />
              {errors.name && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.name}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="servers">Current Servers</Label>
                <Input
                  id="servers"
                  type="number"
                  value={data.servers}
                  onChange={e => setData('servers', parseInt(e.target.value))}
                  min="0"
                />
                {errors.servers && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.servers}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxservers">Maximum Servers</Label>
                <Input
                  id="maxservers"
                  type="number"
                  value={data.maxservers}
                  onChange={e => setData('maxservers', parseInt(e.target.value))}
                  min="0"
                />
                {errors.maxservers && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.maxservers}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="flag">Flag Image URL</Label>
              <Input
                id="flag"
                value={data.flag}
                onChange={e => {
                  setData('flag', e.target.value);
                  setImagePreview(e.target.value);
                }}
                placeholder="Enter flag image URL"
              />
              {errors.flag && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.flag}</AlertDescription>
                </Alert>
              )}
              {imagePreview && (
                <div className="mt-2">
                  <img 
                    src={imagePreview} 
                    alt="Flag Preview" 
                    className="w-32 h-32 object-contain border rounded-md"
                    onError={() => setImagePreview('')}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="latencyurl">Latency URL</Label>
              <Input
                id="latencyurl"
                value={data.latencyurl}
                onChange={e => setData('latencyurl', e.target.value)}
                placeholder="Enter latency URL"
              />
              {errors.latencyurl && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.latencyurl}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="requiredRank">Required Rank</Label>
              <Input
                id="requiredRank"
                value={data.requiredRank}
                onChange={e => setData('requiredRank', e.target.value)}
                placeholder="Enter required rank"
              />
              {errors.requiredRank && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.requiredRank}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="maintenance"
                  checked={data.maintenance}
                  onCheckedChange={checked => setData('maintenance', checked)}
                />
                <Label htmlFor="maintenance">Maintenance Mode</Label>
              </div>
              {errors.maintenance && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.maintenance}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="requiredSubscriptions">Required Subscriptions</Label>
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading plans...</span>
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : (
                <select
  id="requiredSubscriptions"
  value={data.requiredSubscriptions}
  onChange={e =>
    setData('requiredSubscriptions', 
      Array.from(e.target.selectedOptions, option => option.value)
    )
  }
  multiple
  className="w-full rounded-md border border-input bg-background px-3 py-2"
>
  {plans.map(plan => (
    <option key={plan.id} value={plan.id}>
      {plan.name}
    </option>
  ))}
</select>

               
              )}
              {errors.requiredSubscriptions && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.requiredSubscriptions}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="coinRenewal">Coin Renewal (Optional)</Label>
              <Input
                id="coinRenewal"
                value={data.coinRenewal}
                onChange={e => setData('coinRenewal', e.target.value)}
                placeholder="Enter coin renewal details"
              />
              {errors.coinRenewal && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.coinRenewal}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Input
                id="platform"
                type="number"
                value={data.platform}
                onChange={e => setData('platform', parseInt(e.target.value))}
                min="0"
              />
              {errors.platform && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.platform}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform_settings">Platform Settings (Optional)</Label>
              <Input
                id="platform_settings"
                value={data.platform_settings}
                onChange={e => setData('platform_settings', e.target.value)}
                placeholder="Enter platform settings"
              />
              {errors.platform_settings && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.platform_settings}</AlertDescription>
                </Alert>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={processing || loading}
          >
            {processing ? (
              <>
                <LoadingScreen/>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Location'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateLocation;