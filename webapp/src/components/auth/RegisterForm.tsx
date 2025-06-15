import React, { useState } from 'react';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { Link } from 'react-router-dom';
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
  Center,
  ThemeIcon,
} from '@mantine/core';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';
import {
  registerSchema,
  type RegisterFormData,
} from '../../lib/validations/auth';
import { useRegisterMutation } from '../../api/auth/auth.queries';

interface RegisterFormProps {
  onSuccess?: (email: string) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<RegisterFormData>({
    initialValues: {
      email: '',
      name: '',
      password: '',
    },
    validate: zodResolver(registerSchema),
  });

  const registerMutation = useRegisterMutation();

  const handleSubmit = async (data: RegisterFormData) => {
    const submitData = {
      ...data,
      name: data.name && data.name.trim() ? data.name.trim() : undefined,
    };

    registerMutation.mutate(submitData, {
      onSuccess: (response) => {
        if (response.success) {
          setIsSuccess(true);
          onSuccess?.(data.email);
        }
      },
    });
  };

  if (isSuccess) {
    return (
      <Container size={460} my={{ base: 20, md: 40 }}>
        <Paper radius="md" p={{ base: 'md', sm: 'xl' }} withBorder shadow="sm">
          <Center>
            <ThemeIcon color="green" size={60} radius="xl" mb="md">
              <IconCheck size={30} stroke={2} />
            </ThemeIcon>
          </Center>

          <Title order={2} ta="center" mb="md">
            Registration Successful!
          </Title>

          <Text c="dimmed" size="sm" ta="center" mb="lg">
            We've sent a verification email to{' '}
            <strong>{form.values.email}</strong>. Please check your inbox and
            click the verification link to activate your account.
          </Text>

          <Stack>
            <Button component={Link} to="/login" fullWidth size="md">
              Go to Login
            </Button>
            <Button
              variant="subtle"
              fullWidth
              onClick={() => {
                setIsSuccess(false);
                form.reset();
              }}
            >
              Register Another Account
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size={420} my={40}>
      <Title ta="center" size="h2" fw={900}>
        Create Account
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Sign up to get started
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

            <TextInput
              label="Full Name"
              placeholder="John Doe"
              size="md"
              {...form.getInputProps('name')}
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              size="md"
              description="Password must be at least 6 characters long"
              {...form.getInputProps('password')}
            />

            {registerMutation.isError && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Registration failed"
                color="red"
                variant="light"
              >
                {registerMutation.error?.message || 'Registration failed'}
              </Alert>
            )}

            <Button
              fullWidth
              mt="xl"
              type="submit"
              size="md"
              loading={registerMutation.isPending}
            >
              {registerMutation.isPending
                ? 'Creating Account...'
                : 'Create Account'}
            </Button>
          </Stack>
        </form>

        <Text c="dimmed" size="sm" ta="center" mt="md">
          Already have an account?{' '}
          <Anchor component={Link} to="/login" fw={700}>
            Sign in
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
};
