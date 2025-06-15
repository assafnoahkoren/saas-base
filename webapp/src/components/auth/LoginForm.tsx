import React from 'react';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { Link, useNavigate } from 'react-router-dom';
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Container,
  Stack,
  Alert,
  Anchor,
  Checkbox,
  Group,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { loginSchema, type LoginFormData } from '../../lib/validations/login';
import { useLoginMutation } from '../../api/auth/auth.queries';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();

  const form = useForm<LoginFormData>({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validate: zodResolver(loginSchema),
  });

  const loginMutation = useLoginMutation();

  const handleSubmit = async (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        navigate('/dashboard');
      },
    });
  };

  return (
    <Container size={460} my={{ base: 20, md: 40 }}>
      <Title ta="center" size="h2" fw={900}>
        Welcome Back
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Sign in to your account
      </Text>

      <Paper
        withBorder
        shadow="md"
        p={{ base: 20, sm: 30 }}
        mt={{ base: 20, sm: 30 }}
        radius="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Email Address"
              placeholder="your@email.com"
              required
              size="md"
              {...form.getInputProps('email')}
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              size="md"
              {...form.getInputProps('password')}
            />

            <Group justify="space-between" mt="xs">
              <Checkbox
                label="Remember me"
                {...form.getInputProps('rememberMe', { type: 'checkbox' })}
              />
              <Anchor component={Link} to="/forgot-password" size="sm">
                Forgot password?
              </Anchor>
            </Group>

            {loginMutation.isError && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Login failed"
                color="red"
                variant="light"
              >
                {loginMutation.error?.message || 'Invalid credentials'}
              </Alert>
            )}

            <Button
              fullWidth
              mt="xl"
              type="submit"
              size="md"
              loading={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
            </Button>
          </Stack>
        </form>

        <Text c="dimmed" size="sm" ta="center" mt="md">
          Don't have an account?{' '}
          <Anchor component={Link} to="/register" fw={700}>
            Sign up
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
};
