import React from 'react';
import { Button, Text, Title, Stack, Alert } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useResendVerificationMutation } from '../../api/auth/auth.queries';

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
    <Stack align="center" p="xl">
      <Title order={3}>Check Your Email</Title>
      <Text c="dimmed" ta="center">
        We've sent a verification email to <strong>{email}</strong>. Please
        check your inbox and click the verification link.
      </Text>

      <Stack align="center" mt="lg">
        {resendMutation.isSuccess ? (
          <Alert icon={<IconCheck size={16} />} color="green" variant="light">
            Verification email sent successfully!
          </Alert>
        ) : (
          <Text size="sm" c="dimmed">
            Didn't receive the email?
          </Text>
        )}

        {resendMutation.isError && (
          <Alert color="red" variant="light">
            {resendMutation.error?.message || 'Failed to resend email'}
          </Alert>
        )}

        <Button
          onClick={handleResend}
          loading={resendMutation.isPending}
          disabled={resendMutation.isSuccess}
          variant="light"
          size="sm"
        >
          {resendMutation.isPending
            ? 'Sending...'
            : 'Resend Verification Email'}
        </Button>
      </Stack>
    </Stack>
  );
};
