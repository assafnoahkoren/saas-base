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
import { IconRocket, IconShieldCheck, IconBolt } from '@tabler/icons-react';
import { RegisterForm } from '../components/auth/RegisterForm';

export const RegisterPage: React.FC = () => {
  const handleRegistrationSuccess = (email: string) => {
    console.log('Registration successful for:', email);
    // Additional success handling can be added here
  };

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Container size="xl" py="xl">
        <Grid gutter="xl" align="center">
          {/* Left side - Marketing content (hidden on mobile) */}
          <Grid.Col span={{ base: 12, md: 6 }} visibleFrom="md">
            <Box maw={500}>
              <Title order={1} size="h1" fw={900} mb="lg">
                Start Building Your
                <Text
                  component="span"
                  variant="gradient"
                  gradient={{ from: 'blue', to: 'cyan' }}
                >
                  {' '}
                  Dream SaaS
                </Text>
              </Title>

              <Text size="lg" c="dimmed" mb="xl">
                Join thousands of entrepreneurs and developers who trust our
                platform to launch and scale their applications.
              </Text>

              <Stack gap="lg">
                <Group wrap="nowrap">
                  <Paper p="sm" radius="md" bg="blue.0">
                    <IconRocket size={24} color="var(--mantine-color-blue-6)" />
                  </Paper>
                  <Box>
                    <Text fw={600}>Quick Setup</Text>
                    <Text size="sm" c="dimmed">
                      Get started in minutes with our intuitive platform
                    </Text>
                  </Box>
                </Group>

                <Group wrap="nowrap">
                  <Paper p="sm" radius="md" bg="green.0">
                    <IconShieldCheck
                      size={24}
                      color="var(--mantine-color-green-6)"
                    />
                  </Paper>
                  <Box>
                    <Text fw={600}>Enterprise Security</Text>
                    <Text size="sm" c="dimmed">
                      Bank-level encryption and security features
                    </Text>
                  </Box>
                </Group>

                <Group wrap="nowrap">
                  <Paper p="sm" radius="md" bg="orange.0">
                    <IconBolt size={24} color="var(--mantine-color-orange-6)" />
                  </Paper>
                  <Box>
                    <Text fw={600}>Lightning Fast</Text>
                    <Text size="sm" c="dimmed">
                      Built for performance and scalability
                    </Text>
                  </Box>
                </Group>
              </Stack>
            </Box>
          </Grid.Col>

          {/* Right side - Register form */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Box>
              {/* Mobile-only header */}
              <Box ta="center" mb="xl" hiddenFrom="md">
                <Title order={1} size="h1" fw={900} mb="xs">
                  SaaS App
                </Title>
                <Text c="dimmed" size="lg">
                  Join thousands of users already using our platform
                </Text>
              </Box>

              <RegisterForm onSuccess={handleRegistrationSuccess} />

              <Text ta="center" mt="xl" size="xs" c="dimmed">
                By creating an account, you agree to our{' '}
                <Anchor href="#" size="xs" fw={500}>
                  Terms of Service
                </Anchor>{' '}
                and{' '}
                <Anchor href="#" size="xs" fw={500}>
                  Privacy Policy
                </Anchor>
              </Text>
            </Box>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
};
