// components/VMCreate.jsx
import { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
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

export default function VMCreate() {
  const { vmsConfig, auth } = usePage().props;
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [selectedVM, setSelectedVM] = useState(null);

  const { flash } = usePage().props;
  const isError = flash?.status?.includes('Error');

  const { data, setData, post, processing, errors } = useForm({
    name: '',
    egg_id: '',
    nest_id: '',
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

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('admin.vms.store'));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create Virtual Machine</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            id="name"
            type="text"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            placeholder="Enter VM name"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${errors.name ? 'border-red-500' : ''}`}
            required
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="egg_id" className="block text-sm font-medium text-gray-700">Egg ID</label>
          <input
            id="egg_id"
            type="text"
            value={data.egg_id}
            onChange={(e) => setData('egg_id', e.target.value)}
            placeholder="Enter Egg ID"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${errors.egg_id ? 'border-red-500' : ''}`}
            required
          />
          {errors.egg_id && <p className="text-sm text-red-500">{errors.egg_id}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="nest_id" className="block text-sm font-medium text-gray-700">Nest ID</label>
          <input
            id="nest_id"
            type="text"
            value={data.nest_id}
            onChange={(e) => setData('nest_id', e.target.value)}
            placeholder="Enter Nest ID"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${errors.nest_id ? 'border-red-500' : ''}`}
            required
          />
          {errors.nest_id && <p className="text-sm text-red-500">{errors.nest_id}</p>}
        </div>

        {/* Add other resource fields similar to ServerCreate */}
        <div className="space-y-2">
          <label htmlFor="memory" className="block text-sm font-medium text-gray-700">Memory (MB)</label>
          <input
            id="memory"
            type="number"
            value={data.memory}
            onChange={(e) => setData('memory', e.target.value)}
            placeholder="Enter Memory"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${errors.memory ? 'border-red-500' : ''}`}
            required
          />
          {errors.memory && <p className="text-sm text-red-500">{errors.memory}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="disk" className="block text-sm font-medium text-gray-700">Disk (MB)</label>
          <input
            id="disk"
            type="number"
            value={data.disk}
            onChange={(e) => setData('disk', e.target.value)}
            placeholder="Enter Disk"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${errors.disk ? 'border-red-500' : ''}`}
            required
          />
          {errors.disk && <p className="text-sm text-red-500">{errors.disk}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="cpu" className="block text-sm font-medium text-gray-700">CPU (%)</label>
          <input
            id="cpu"
            type="number"
            value={data.cpu}
            onChange={(e) => setData('cpu', e.target.value)}
            placeholder="Enter CPU"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${errors.cpu ? 'border-red-500' : ''}`}
            required
          />
          {errors.cpu && <p className="text-sm text-red-500">{errors.cpu}</p>}
        </div>

        <button
          type="submit"
          disabled={processing}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white ${processing ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {processing ? 'Creating...' : 'Create VM'}
        </button>
      </form>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Success!</AlertDialogTitle>
            <AlertDialogDescription>
              VM template was created successfully.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleSuccessClose}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>
              There was an error creating the VM template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowErrorDialog(false)}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}