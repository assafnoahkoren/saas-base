import React from 'react';
import {
  AppShell,
  Container,
  Group,
  Button,
  Text,
  Box,
  Title,
  Burger,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconLogout } from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const { user, logout } = useAuth();
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Container fluid h="100%">
          <Group h="100%" justify="space-between" align="center">
            <Group>
              <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
              />
              <Title order={3}>SaaS App</Title>
            </Group>
            <Group>
              <Text size="sm" c="dimmed">
                {user?.name || user?.email}
              </Text>
              <Button
                leftSection={<IconLogout size={18} />}
                variant="subtle"
                color="red"
                onClick={logout}
                size="sm"
              >
                Logout
              </Button>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Box>
          <Text size="sm" fw={500} c="dimmed" mb="xs">
            Navigation
          </Text>
        </Box>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};
