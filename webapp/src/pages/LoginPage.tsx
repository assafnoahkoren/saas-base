import React from 'react';
import {
  Container,
  Title,
  Text,
  Anchor,
  Box,
  Grid,
  Paper,
  Stack,
  Group,
} from '@mantine/core';
import { IconLock, IconShield, IconBolt } from '@tabler/icons-react';
import { LoginForm } from '../components/auth/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Container size="xl" py="xl">
        <Grid gutter="xl" align="center">
          {/* Left side - Login form */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Box>
              {/* Mobile-only header */}
              <Box ta="center" mb="xl" hiddenFrom="md">
                <Title order={1} size="h1" fw={900} mb="xs">
                  SaaS App
                </Title>
                <Text c="dimmed" size="lg">
                  Access your dashboard
                </Text>
              </Box>

              <LoginForm />
            </Box>
          </Grid.Col>

          {/* Right side - Features (hidden on mobile) */}
          <Grid.Col span={{ base: 12, md: 6 }} visibleFrom="md">
            <Box maw={500}>
              <Title order={1} size="h1" fw={900} mb="lg">
                Welcome Back to
                <Text
                  component="span"
                  variant="gradient"
                  gradient={{ from: 'blue', to: 'cyan' }}
                >
                  {' '}
                  SaaS App
                </Text>
              </Title>

              <Text size="lg" c="dimmed" mb="xl">
                Access your dashboard and manage your projects with our powerful
                tools.
              </Text>

              <Stack gap="lg">
                <Group wrap="nowrap">
                  <Paper p="sm" radius="md" bg="blue.0">
                    <IconLock size={24} color="var(--mantine-color-blue-6)" />
                  </Paper>
                  <Box>
                    <Text fw={600}>Secure Access</Text>
                    <Text size="sm" c="dimmed">
                      Your data is protected with enterprise-grade security
                    </Text>
                  </Box>
                </Group>

                <Group wrap="nowrap">
                  <Paper p="sm" radius="md" bg="green.0">
                    <IconShield
                      size={24}
                      color="var(--mantine-color-green-6)"
                    />
                  </Paper>
                  <Box>
                    <Text fw={600}>Privacy First</Text>
                    <Text size="sm" c="dimmed">
                      We never share your data with third parties
                    </Text>
                  </Box>
                </Group>

                <Group wrap="nowrap">
                  <Paper p="sm" radius="md" bg="orange.0">
                    <IconBolt size={24} color="var(--mantine-color-orange-6)" />
                  </Paper>
                  <Box>
                    <Text fw={600}>Fast & Reliable</Text>
                    <Text size="sm" c="dimmed">
                      99.9% uptime guaranteed for your business
                    </Text>
                  </Box>
                </Group>
              </Stack>

              <Text ta="center" mt="xl" size="xs" c="dimmed">
                Need help?{' '}
                <Anchor href="#" size="xs" fw={500}>
                  Contact Support
                </Anchor>
              </Text>
            </Box>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
};
