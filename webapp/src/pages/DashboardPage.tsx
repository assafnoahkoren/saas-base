import React from 'react';
import { Title, Text, Paper, Stack, Box } from '@mantine/core';
import { useAuth } from '../hooks/useAuth';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Title order={1} mb="md">
        Dashboard
      </Title>
      <Text c="dimmed" mb="xl">
        Welcome back, {user?.name || user?.email}!
      </Text>

      <Stack gap="lg">
        <Paper shadow="sm" p="lg" radius="md">
          <Title order={3} mb="md">
            Account Information
          </Title>
          <Stack gap="xs">
            <Text>
              <strong>Email:</strong> {user?.email}
            </Text>
            <Text>
              <strong>Name:</strong> {user?.name || 'Not set'}
            </Text>
            <Text>
              <strong>Email Verified:</strong>{' '}
              {user?.emailVerified ? 'Yes' : 'No'}
            </Text>
          </Stack>
        </Paper>

        <Paper shadow="sm" p="lg" radius="md">
          <Title order={3} mb="md">
            Quick Stats
          </Title>
          <Text c="dimmed">
            Your dashboard content will appear here. This is a placeholder for
            your application's main features.
          </Text>
        </Paper>
      </Stack>
    </Box>
  );
};
