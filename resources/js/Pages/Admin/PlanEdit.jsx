// resources/js/Pages/Plans/PlanForm.jsx
import React from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function PlanFormEdit({ plan = null }) {
  const { data, setData, post, put, processing, errors } = useForm({
    name: plan?.name ?? '',
    price: plan?.price ?? '',
    icon: plan?.icon ?? '',
    image: plan?.image ?? '',
    description: plan?.description ?? '',
    resources: plan?.resources ?? '',
    discount: plan?.discount ?? '',
    visibility: plan?.visibility ?? true,
    redirect: plan?.redirect ?? '',
    perCustomer: plan?.perCustomer ?? '',
    planType: plan?.planType ?? 'monthly',
    perPerson: plan?.perPerson ?? 1,
    stock: plan?.stock ?? 0,
    kushiConfig: plan?.kushiConfig ?? '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (plan) {
      put(`/plans/${plan.id}`, data);
    } else {
      post('/plans', data);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>{plan ? 'Edit Plan' : 'Create Plan'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Input
                id="icon"
                value={data.icon}
                onChange={e => setData('icon', e.target.value)}
              />
              {errors.icon && <p className="text-sm text-red-500">{errors.icon}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <Input
                id="image"
                value={data.image}
                onChange={e => setData('image', e.target.value)}
              />
              {errors.image && <p className="text-sm text-red-500">{errors.image}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={e => setData('description', e.target.value)}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="resources">Resources</Label>
              <Input
                id="resources"
                value={data.resources}
                onChange={e => setData('resources', e.target.value)}
              />
              {errors.resources && <p className="text-sm text-red-500">{errors.resources}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount">Discount</Label>
              <Input
                id="discount"
                value={data.discount}
                onChange={e => setData('discount', e.target.value)}
              />
              {errors.discount && <p className="text-sm text-red-500">{errors.discount}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Input
                id="visibility"
                type="checkbox"
                checked={data.visibility}
                onChange={e => setData('visibility', e.target.checked)}
              />
              {errors.visibility && <p className="text-sm text-red-500">{errors.visibility}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="redirect">Redirect</Label>
              <Input
                id="redirect"
                value={data.redirect}
                onChange={e => setData('redirect', e.target.value)}
              />
              {errors.redirect && <p className="text-sm text-red-500">{errors.redirect}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="perCustomer">Per Customer</Label>
              <Input
                id="perCustomer"
                value={data.perCustomer}
                onChange={e => setData('perCustomer', e.target.value)}
              />
              {errors.perCustomer && <p className="text-sm text-red-500">{errors.perCustomer}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="planType">Plan Type</Label>
              <Input
                id="planType"
                value={data.planType}
                onChange={e => setData('planType', e.target.value)}
              />
              {errors.planType && <p className="text-sm text-red-500">{errors.planType}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="perPerson">Per Person</Label>
              <Input
                id="perPerson"
                type="number"
                value={data.perPerson}
                onChange={e => setData('perPerson', e.target.value)}
              />
              {errors.perPerson && <p className="text-sm text-red-500">{errors.perPerson}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                value={data.stock}
                onChange={e => setData('stock', e.target.value)}
              />
              {errors.stock && <p className="text-sm text-red-500">{errors.stock}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="kushiConfig">Kushi Config</Label>
              <Textarea
                id="kushiConfig"
                value={data.kushiConfig}
                onChange={e => setData('kushiConfig', e.target.value)}
              />
              {errors.kushiConfig && <p className="text-sm text-red-500">{errors.kushiConfig}</p>}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.get('/plans')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={processing}>
                {processing ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}