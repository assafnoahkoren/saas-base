import React from 'react';
import { RegisterForm } from '../components/auth/RegisterForm';

export const RegisterPage: React.FC = () => {
  const handleRegistrationSuccess = (email: string) => {
    console.log('Registration successful for:', email);
    // Additional success handling can be added here
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">SaaS App</h1>
          <p className="mt-2 text-sm text-gray-600">
            Join thousands of users already using our platform
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <RegisterForm onSuccess={handleRegistrationSuccess} />
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          By creating an account, you agree to our{' '}
          <a href="#" className="text-blue-600 hover:text-blue-800">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-blue-600 hover:text-blue-800">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};
