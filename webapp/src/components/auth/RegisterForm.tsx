import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import {
  registerSchema,
  type RegisterFormData,
} from '../../lib/validations/auth';
import { useRegisterMutation } from '../../api/auth/auth.queries';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface RegisterFormProps {
  onSuccess?: (email: string) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const watchedEmail = watch('email');

  const registerMutation = useRegisterMutation();

  const onSubmit = async (data: RegisterFormData) => {
    // Convert empty string to undefined for name
    const submitData = {
      ...data,
      name: data.name && data.name.trim() ? data.name.trim() : undefined,
    };

    registerMutation.mutate(submitData, {
      onSuccess: (response) => {
        if (response.success) {
          setIsSuccess(true);
          onSuccess?.(data.email);
        }
      },
    });
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Registration Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            We've sent a verification email to <strong>{watchedEmail}</strong>.
            Please check your inbox and click the verification link to activate
            your account.
          </p>
          <div className="space-y-3">
            <Link
              to="/login"
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center"
            >
              Go to Login
            </Link>
            <button
              onClick={() => setIsSuccess(false)}
              className="block w-full text-blue-600 hover:text-blue-800 transition-colors"
            >
              Register Another Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
        <p className="text-gray-600 mt-2">Sign up to get started</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Full Name (Optional)"
          type="text"
          placeholder="Enter your full name"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="text-xs text-gray-500">
          Password must be at least 6 characters long
        </div>

        {registerMutation.isError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">
              {registerMutation.error?.message || 'Registration failed'}
            </p>
          </div>
        )}

        <Button
          type="submit"
          isLoading={registerMutation.isPending}
          className="w-full"
        >
          {registerMutation.isPending
            ? 'Creating Account...'
            : 'Create Account'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
