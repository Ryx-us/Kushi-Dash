import InputError from '@/components/InputError';
import InputLabel from '@/components/InputLabel';
import PrimaryButton from '@/components/PrimaryButton';
import TextInput from '@/components/TextInput';
import { useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import SuccessModal from '@/components/SuccessModal';

export default function PasswordResetFormPterodactyl({ className = '' }) {
    const user = usePage().props.auth.user;
    const [isPasswordUpdated, setIsPasswordUpdated] = useState(false);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
    } = useForm({
        password: '',
        password_confirmation: '',
        userId: user.pterodactyl_id,
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('pterodactyl.reset-password'), {
            onSuccess: (page) => {
                if (page.props.flash.status) {
                    //console.log ('Response from password reset:', page.props.flash.status);
                    reset();
                    setIsPasswordUpdated(true);
                } else {
                    console.error('No status found in the response');
                }
            },
            onError: (error) => {
                console.error('Failed to send request:', error);
            },
        });
    };

    return (
        <div className={`p-6 bg-white dark:bg-black rounded-lg shadow-md ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Reset Your Password
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Please enter your new password below.
                </p>
            </header>

            {/* Show SuccessModal when the password is successfully updated */}
            {isPasswordUpdated && (
                <SuccessModal
                    isOpen={isPasswordUpdated}
                    onClose={() => setIsPasswordUpdated(false)}
                />
            )}

            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="password" value="New Password" />
                    <TextInput
                        id="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
                        className="mt-1 block w-full bg-white text-black dark:bg-black dark:text-white"
                        autoComplete="new-password"
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                    <TextInput
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        type="password"
                        className="mt-1 block w-full bg-white text-black dark:bg-black dark:text-white"
                        autoComplete="new-password"
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Reset Password</PrimaryButton>
                </div>
            </form>
        </div>
    );
}
