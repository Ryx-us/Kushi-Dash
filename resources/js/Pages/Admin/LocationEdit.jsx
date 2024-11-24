// LocationEdit.jsx
import React, { useEffect, useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"




import { AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';


const LocationEdit = () => {
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [plansError, setPlansError] = useState(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const { location, flash } = usePage().props
  const locationId = location.id
  

  const locationIdProp = (usePage().props.location.id);

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
    platform: '',
    platform_settings: null,
  })

  useEffect(() => {
    // Use optional chaining with nullish coalescing
    const success = location?.flash?.success ?? null
    setShowSuccessModal(!!success)
  }, [location?.flash?.success])

  const handleCheckboxChange = (planId) => {
  const updatedSubscriptions = data.requiredSubscriptions.includes(planId)
    ? data.requiredSubscriptions.filter(id => id !== planId)
    : [...data.requiredSubscriptions, planId];

  handleInputChange('requiredSubscriptions', updatedSubscriptions);
};

  


  const SuccessModal = () => (
    <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Success</DialogTitle>
        </DialogHeader>
        <Alert>
          <AlertDescription>{flash.success}</AlertDescription>
        </Alert>
      </DialogContent>
    </Dialog>
  )

  // Fetch initial location data only once
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axios.get(`/admin/api/locations/${locationIdProp}`)
        const locationData = response.data.location
        
        // Set initial form data once
        setData(prevData => ({
          ...prevData,
          name: locationData.name,
          location: locationData.location,
          servers: locationData.servers,
          flag: locationData.flag,
          maxservers: locationData.maxservers,
          latencyurl: locationData.latencyurl,
          requiredRank: locationData.requiredRank,
          maintenance: locationData.maintenance,
          requiredSubscriptions: locationData.requiredSubscriptions,
          platform: locationData.platform,
          platform_settings: locationData.platform_settings,
        }))
      } catch (error) {
        console.error('Error fetching location:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLocation()
  }, [locationIdProp]) // Only depend on locationIdProp

  // Fetch plans once
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get('/admin/api/plans')
        setPlans(response.data.plans || [])
      } catch (err) {
        setPlansError('Failed to load plans.')
      } finally {
        setPlansLoading(false)
      }
    }

    fetchPlans()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    put(`/admin/locations/${locationId}`, {
      data,
      onSuccess: () => {
        //console.log ('Location updated successfully')
        setShowSuccessModal(true)
      },
      onError: (errors) => {
        console.error('Error updating location:', errors)
      }
    })
  }

  

  const handleInputChange = (field, value) => {
    setData(prevData => ({
      ...prevData,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center space-x-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Loading location...</span>
      </div>
    )
  }

  

  return (

    <>
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={data.name}
          onChange={e => handleInputChange('name', e.target.value)}
          placeholder="Location name"
        />
        {errors.name && (
          <Alert variant="destructive">
            <AlertDescription>{errors.name}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Similar pattern for other fields */}
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={data.location}
          onChange={e => handleInputChange('location', e.target.value)}
          placeholder="Physical location"
        />
        {errors.location && (
          <Alert variant="destructive">
            <AlertDescription>{errors.location}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="flag">Flag URL</Label>
        <Input
          id="flag"
          value={data.flag}
          onChange={e => handleInputChange('flag', e.target.value)}
          placeholder="Flag image URL"
        />
        {errors.flag && (
          <Alert variant="destructive">
            <AlertDescription>{errors.flag}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxservers">Max Servers</Label>
        <Input
          id="maxservers"
          type="number"
          value={data.maxservers}
          onChange={e => handleInputChange('maxservers', parseInt(e.target.value))}
          placeholder="Maximum servers allowed"
        />
        {errors.maxservers && (
          <Alert variant="destructive">
            <AlertDescription>{errors.maxservers}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="maintenance">Maintenance Mode</Label>
        <Switch
          id="maintenance"
          checked={data.maintenance}
          onCheckedChange={checked => handleInputChange('maintenance', checked)}
        />
      </div>

      <div className="space-y-2">
  <Card>
    <Label>Required Subscriptions</Label>
    {!plansLoading && !plansError && (
      <div className="flex flex-col  mt-3 mb-4 mr-3">
        {plans.map(plan => (
          <div key={plan.id} className="flex items-center mr-3">
            <input
              id={`plan-${plan.id}`}
              type="checkbox"
              checked={data.requiredSubscriptions.includes(plan.id)}
              onChange={() => handleCheckboxChange(plan.id)}
              className="mr-2"
            />
            <label htmlFor={`plan-${plan.id}`}>{plan.name}</label>
          </div>
        ))}
      </div>
    )}
  </Card>
</div>
      

      <Button type="submit" className="w-full">
        Update Location 📦
      </Button>
      

    </form>
  <SuccessModal />  

  </>
    


    
  )
}

export default LocationEdit