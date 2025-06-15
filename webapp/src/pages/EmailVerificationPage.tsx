import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useVerifyEmailMutation } from '../api/auth/auth.queries';

export const EmailVerificationPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const verifyMutation = useVerifyEmailMutation();

  useEffect(() => {
    if (token) {
      verifyMutation.mutate(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (verifyMutation.isPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your email...</p>
        </div>
      </div>
    );
  }

  if (verifyMutation.isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verification Failed
          </h2>
          <p className="text-gray-600 mb-6">
            {verifyMutation.error?.message ||
              'Unable to verify your email. The link may be expired or invalid.'}
          </p>
          <div className="space-y-3">
            <Link
              to="/register"
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center"
            >
              Back to Registration
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (verifyMutation.isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
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
            Email Verified!
          </h2>
          <p className="text-gray-600 mb-6">
            Your email has been successfully verified. You can now log in to
            your account.
          </p>
          <Link
            to="/login"
            className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return null;
};
