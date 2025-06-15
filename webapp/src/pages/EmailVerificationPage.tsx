import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Center,
  Loader,
  ThemeIcon,
} from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
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
      <Container
        size={420}
        style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}
      >
        <Paper
          withBorder
          shadow="md"
          p={30}
          radius="md"
          style={{ width: '100%' }}
        >
          <Center>
            <Loader size="lg" />
          </Center>
          <Text ta="center" mt="md" c="dimmed">
            Verifying your email...
          </Text>
        </Paper>
      </Container>
    );
  }

  if (verifyMutation.isError) {
    return (
      <Container
        size={420}
        style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}
      >
        <Paper
          withBorder
          shadow="md"
          p={30}
          radius="md"
          style={{ width: '100%' }}
        >
          <Center>
            <ThemeIcon color="red" size={60} radius="xl" mb="md">
              <IconX size={30} stroke={2} />
            </ThemeIcon>
          </Center>
          <Title order={2} ta="center" mb="md">
            Verification Failed
          </Title>
          <Text c="dimmed" ta="center" mb="lg">
            {verifyMutation.error?.message ||
              'Unable to verify your email. The link may be expired or invalid.'}
          </Text>
          <Button component={Link} to="/register" fullWidth size="md">
            Back to Registration
          </Button>
        </Paper>
      </Container>
    );
  }

  if (verifyMutation.isSuccess) {
    return (
      <Container
        size={420}
        style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}
      >
        <Paper
          withBorder
          shadow="md"
          p={30}
          radius="md"
          style={{ width: '100%' }}
        >
          <Center>
            <ThemeIcon color="green" size={60} radius="xl" mb="md">
              <IconCheck size={30} stroke={2} />
            </ThemeIcon>
          </Center>
          <Title order={2} ta="center" mb="md">
            Email Verified!
          </Title>
          <Text c="dimmed" ta="center" mb="lg">
            Your email has been successfully verified. You can now log in to
            your account.
          </Text>
          <Button component={Link} to="/login" fullWidth size="md">
            Go to Login
          </Button>
        </Paper>
      </Container>
    );
  }

  return null;
};
