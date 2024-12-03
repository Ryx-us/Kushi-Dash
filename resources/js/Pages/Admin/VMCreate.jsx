// components/VmsCreate.jsx
import { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
  } from "@/components/ui/alert-dialog";
import { LucideCheckCircle, LucideCheckCircle2, LucideEclipse } from 'lucide-react';

export default function VmsCreate() {
  const { flash } = usePage().props;
  console.log(usePage().props);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
    egg_id: '',
    nest_id: '',
    image_url: '',
    icon: '',
    rank: 'user',
    is_enabled: true
  });

  const handleDialogClose = () => {
    setShowSuccessDialog(false);
    reset();
  };

  useEffect(() => {
    if (flash.success) {
      setShowSuccessDialog(true);
    }
  }, [flash.success]);

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('admin.vms.store'));
  };

  return (
<>
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New VM Configuration (Pterodactyl)</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={data.name}
              onChange={e => setData('name', e.target.value)}
              placeholder="Enter VM name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input 
              id="description"
              value={data.description}
              onChange={e => setData('description', e.target.value)}
              placeholder="Enter description"
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="egg_id">Egg ID</Label>
            <Input
              id="egg_id"
              value={data.egg_id}
              onChange={e => setData('egg_id', e.target.value)}
              placeholder="Enter egg ID"
              className={errors.egg_id ? 'border-red-500' : ''}
            />
            {errors.egg_id && (
              <p className="text-sm text-red-500">{errors.egg_id}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nest_id">Nest ID</Label>
            <Input
              id="nest_id"
              value={data.nest_id}
              onChange={e => setData('nest_id', e.target.value)}
              placeholder="Enter nest ID"
              className={errors.nest_id ? 'border-red-500' : ''}
            />
            {errors.nest_id && (
              <p className="text-sm text-red-500">{errors.nest_id}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              value={data.image_url}
              onChange={e => setData('image_url', e.target.value)}
              placeholder="Enter image URL"
              className={errors.image_url ? 'border-red-500' : ''}
            />
            {errors.image_url && (
              <p className="text-sm text-red-500">{errors.image_url}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icon URL</Label>
            <Input
              id="icon"
              value={data.icon}
              onChange={e => setData('icon', e.target.value)}
              placeholder="Enter icon URL"
              className={errors.icon ? 'border-red-500' : ''}
            />
            {errors.icon && (
              <p className="text-sm text-red-500">{errors.icon}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rank">Required Rank</Label>
            <Select 
              value={data.rank} 
              onValueChange={(value) => setData('rank', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select rank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {errors.rank && (
              <p className="text-sm text-red-500">{errors.rank}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={processing}
          >
            {processing ? 'Creating...' : 'Create VM Configuration'}
          </Button>
        </form>
      </CardContent>
    </Card>

    <AlertDialog open={showSuccessDialog} onOpenChange={handleDialogClose}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <LucideCheckCircle2 className="h-6 w-6 text-green-500" />
                            Success!
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                           A virtual machine configuration has been successfully created!
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={handleDialogClose}>
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
    </>

    
  );
}