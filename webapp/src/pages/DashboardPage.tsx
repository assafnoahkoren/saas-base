import React from 'react';
import {
  Container,
  Title,
  Text,
  Button,
  Paper,
  Group,
  Stack,
  Box,
} from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import { useAuth } from '../hooks/useAuth';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Container size="lg" py="xl">
        <Group justify="space-between" mb="xl">
          <Box>
            <Title order={1}>Dashboard</Title>
            <Text c="dimmed">Welcome back, {user?.name || user?.email}!</Text>
          </Box>
          <Button
            leftSection={<IconLogout size={18} />}
            variant="subtle"
            color="red"
            onClick={logout}
          >
            Logout
          </Button>
        </Group>

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
      </Container>
    </Box>
  );
};
