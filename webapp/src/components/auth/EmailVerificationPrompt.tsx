import React from 'react';
import { useResendVerificationMutation } from '../../api/auth/auth.queries';
import { Button } from '../ui/Button';

interface EmailVerificationPromptProps {
  email: string;
}

export const EmailVerificationPrompt: React.FC<
  EmailVerificationPromptProps
> = ({ email }) => {
  const resendMutation = useResendVerificationMutation();

  const handleResend = () => {
    resendMutation.mutate(email);
  };

  return (
    <div className="text-center p-6">
      <h3 className="text-lg font-semibold mb-4">Check Your Email</h3>
      <p className="text-gray-600 mb-6">
        We've sent a verification email to <strong>{email}</strong>. Please
        check your inbox and click the verification link.
      </p>

      <div className="space-y-4">
        <div className="text-sm text-gray-500">
          {resendMutation.isSuccess ? (
            <p className="text-green-600">
              Verification email sent successfully!
            </p>
          ) : (
            <p>Didn't receive the email?</p>
          )}
        </div>

        {resendMutation.isError && (
          <p className="text-sm text-red-600">
            {resendMutation.error?.message || 'Failed to resend email'}
          </p>
        )}

        <Button
          onClick={handleResend}
          isLoading={resendMutation.isPending}
          disabled={resendMutation.isSuccess}
          variant="outline"
          size="sm"
        >
          {resendMutation.isPending
            ? 'Sending...'
            : 'Resend Verification Email'}
        </Button>
      </div>
    </div>
  );
};
