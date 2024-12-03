import React from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Minus } from 'lucide-react';

export default function PlanEdit() {
  const { plan } = usePage().props;

  const { data, setData, put, processing, errors } = useForm({
    name: plan?.name ?? '',
    price: plan?.price ?? '',
    icon: plan?.icon ?? '',
    image: plan?.image ?? '',
    description: plan?.description ?? '',
    resources: plan?.resources ?? {
      cpu: 0,
      memory: 0,
      disk: 0,
      databases: 0,
      allocations: 0,
      backups: 0,
      servers: 0,
    },
    discount: plan?.discount ?? 0,
    visibility: plan?.visibility ?? true,
    redirect: plan?.redirect ?? '',
    perCustomer: plan?.perCustomer ?? '',
    planType: plan?.planType ?? 'monthly',
    perPerson: plan?.perPerson ?? 1,
    stock: plan?.stock ?? 0,
    kushiConfig: plan?.kushiConfig ?? null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(`/plans/${plan.id}`);
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Plan: {plan?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={e => setData('name', e.target.value)}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={data.price}
                  onChange={e => setData('price', e.target.value)}
                />
                {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
              </div>
            </div>

            {/* Media */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon">Icon URL</Label>
                <Input
                  id="icon"
                  value={data.icon}
                  onChange={e => setData('icon', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={data.image}
                  onChange={e => setData('image', e.target.value)}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={e => setData('description', e.target.value)}
              />
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Resources</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(data.resources).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const newValue = Math.max(0, (data.resources[key] || 0) - 1);
                          setData('resources', { ...data.resources, [key]: newValue });
                        }}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={value}
                        onChange={e => {
                          const newValue = parseInt(e.target.value) || 0;
                          setData('resources', { ...data.resources, [key]: newValue });
                        }}
                        className="w-24 text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const newValue = (data.resources[key] || 0) + 1;
                          setData('resources', { ...data.resources, [key]: newValue });
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount">Discount</Label>
                <Input
                  id="discount"
                  type="number"
                  value={data.discount}
                  onChange={e => setData('discount', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="perCustomer">Per Customer</Label>
                <Input
                  id="perCustomer"
                  value={data.perCustomer}
                  onChange={e => setData('perCustomer', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="planType">Plan Type</Label>
                <Select
                  value={data.planType}
                  onValueChange={value => setData('planType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="lifetime">Lifetime</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={data.stock}
                  onChange={e => setData('stock', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="perPerson">Per Person</Label>
                <Input
                  id="perPerson"
                  type="number"
                  value={data.perPerson}
                  onChange={e => setData('perPerson', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="redirect">Redirect URL</Label>
                <Input
                  id="redirect"
                  value={data.redirect}
                  onChange={e => setData('redirect', e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="visibility"
                  checked={data.visibility}
                  onCheckedChange={checked => setData('visibility', checked)}
                />
                <Label htmlFor="visibility">Visibility</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={processing}>
                {processing ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}5