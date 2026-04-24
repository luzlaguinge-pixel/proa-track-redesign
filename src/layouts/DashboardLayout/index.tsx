import { type ReactNode, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import useMediaQuery from '@material-hu/mui/useMediaQuery';

import {
  IconArrowsExchange,
  IconBox,
  IconCalendarCheck,
  IconChartBar,
  IconClipboardList,
  IconHome,
  IconBell,
  IconHelp,
  IconShield,
  IconTag,
  IconUsersGroup,
  IconUsers,
} from '@material-hu/icons/tabler';
import Box from '@material-hu/mui/Box';
import Chip from '@material-hu/mui/Chip';
import Divider from '@material-hu/mui/Divider';
import Popover from '@material-hu/mui/Popover';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import Button from '@material-hu/components/design-system/Buttons/Button';
import HomeHeader from '@material-hu/components/design-system/Header/Home';
import Sidebar from '@material-hu/components/design-system/Sidebar';
import {
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_WIDTH,
} from '@material-hu/components/design-system/Sidebar/constants';
import { type NavSectionProps } from '@material-hu/components/design-system/Sidebar/types';

import humandLogo from '../../assets/humand.svg';
import { useAuth } from '../../providers/AuthContext';
import { type Perfil, useProfile } from '../../providers/ProfileContext';
import { NotificationsMenu } from '../../pages/Notifications/NotificationsMenu';
import {
  getNotificacionesCaptador,
  getNotificacionesLiderAdmin,
} from '../../pages/Notifications/List/services';
import { useDispatchedNotifications } from '../../hooks/useDispatchedNotifications';
import NotificationPermissionBanner from '../../pages/Notifications/components/NotificationPermissionBanner';

const PERFIL_LABEL: Record<Perfil, string> = {
  admin: 'Admin',
  coordinador: 'Coordinador/a Regional',
  navegante: 'Navegante',
};

const ADMIN_NAV_KEYS = new Set([
  'home',
  'inventory',
  'people',
  'catalog',
  'movements',
  'my-materials',
  'team-confirmations',
  'solicitudes',
  'reports',
  'faqs',
  'roles',
]);
const COORDINADOR_NAV_KEYS = new Set([
  'home',
  'my-team',
  'team-inventory',
  'my-materials',
  'team-confirmations',
  'solicitudes',
  'reports',
  'faqs',
  'roles',
]);
const NAVEGANTE_NAV_KEYS = new Set(['my-materials', 'faqs']);

const ALL_ITEMS = [
  { key: 'home', title: 'Home', path: '/', icon: <IconHome /> },
  {
    key: 'inventory',
    title: 'Inventario',
    path: '/inventory',
    icon: <IconBox />,
  },
  { key: 'people', title: 'Personas', path: '/people', icon: <IconUsers /> },
  { key: 'catalog', title: 'Catálogo', path: '/catalog', icon: <IconTag /> },
  {
    key: 'movements',
    title: 'Movimientos',
    path: '/movements',
    icon: <IconArrowsExchange />,
  },
  {
    key: 'my-team',
    title: 'Mi equipo',
    path: '/my-team',
    icon: <IconUsersGroup />,
  },
  {
    key: 'team-inventory',
    title: 'Materiales del equipo',
    path: '/team-inventory',
    icon: <IconBox />,
  },
  {
    key: 'my-materials',
    title: 'Mis materiales',
    path: '/my-materials',
    icon: <IconBox />,
  },
  {
    key: 'my-confirmation',
    title: 'Confirmación mensual',
    path: '/my-confirmation',
    icon: <IconCalendarCheck />,
  },
  {
    key: 'team-confirmations',
    title: 'Confirmaciones',
    path: '/team-confirmations',
    icon: <IconCalendarCheck />,
  },
  {
    key: 'solicitudes',
    title: 'Solicitudes',
    path: '/solicitudes',
    icon: <IconClipboardList />,
  },
  {
    key: 'reports',
    title: 'Reportes',
    path: '/reports',
    icon: <IconChartBar />,
  },
  {
    key: 'faqs',
    title: 'Preguntas frecuentes',
    path: '/faqs',
    icon: <IconHelp />,
  },
  {
    key: 'roles',
    title: 'Gestión de roles',
    path: '/roles',
    icon: <IconShield />,
  },
];

function getSections(perfil: Perfil): NavSectionProps[] {
  const keys =
    perfil === 'admin'
      ? ADMIN_NAV_KEYS
      : perfil === 'coordinador'
        ? COORDINADOR_NAV_KEYS
        : NAVEGANTE_NAV_KEYS;

  return [
    {
      key: 'main',
      title: 'Main',
      items: ALL_ITEMS.filter(item => keys.has(item.key)),
    },
  ];
}

type DashboardLayoutProps = {
  children: ReactNode;
};

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const isMobile = useMediaQuery('(max-width:900px)');
  const [isCollapsed, setIsCollapsed] = useState(
    () => window.innerWidth <= 900,
  );
  const [notificationsAnchor, setNotificationsAnchor] =
    useState<HTMLButtonElement | null>(null);
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { perfil } = useProfile();

  const sidebarWidth = isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;
  const sections = getSections(perfil);

  // On mobile, treat "collapsed" as fully hidden; the hamburger opens an overlay
  const sidebarHidden = isMobile && isCollapsed;
  const sidebarOverlay = isMobile && !isCollapsed;

  const avatarInitial =
    user?.firstName?.[0]?.toUpperCase() ??
    user?.email?.[0]?.toUpperCase() ??
    'U';

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : '';
  const profileBadge = PERFIL_LABEL[perfil];

  // Local workflow alerts (computed from material state)
  const { data: localNotifs = [] } = useQuery({
    queryKey: ['notificaciones-layout', perfil, displayName],
    queryFn: () =>
      perfil === 'navegante'
        ? getNotificacionesCaptador(displayName)
        : getNotificacionesLiderAdmin([]),
    enabled: !!displayName,
  });
  // Server-dispatched notifications (real, from DB)
  const { data: dispatched = [] } = useDispatchedNotifications();
  const unreadCount =
    localNotifs.filter((n) => !n.leida).length +
    dispatched.filter((n) => !n.isRead).length;

  const handleOpenNotifications = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setNotificationsAnchor(null);
  };

  return (
    <Stack
      sx={{ height: '100vh', flexDirection: 'column', overflow: 'hidden' }}
    >
      <Box
        sx={{
          flexShrink: 0,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderBottomColor: 'divider',
          '& button:has(svg.tabler-icon-world)': { display: 'none' },
        }}
      >
        <Stack
          sx={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
            gap: 2,
          }}
        >
          <HomeHeader
            onOpenMenu={() => setIsCollapsed(prev => !prev)}
            logoSrc={humandLogo}
            logoAlt="Humand"
            hideSupportButton
            isAdmin={false}
            hideNotificationsButton={false}
            notificationsCount={unreadCount}
            hasUnreadNotifications={unreadCount > 0}
            onOpenNotificationsMenu={handleOpenNotifications}
            avatarProps={{ text: avatarInitial }}
            avatarPopoverContent={
              <Stack sx={{ p: 2, minWidth: 220, gap: 1 }}>
                <Stack sx={{ px: 1, gap: 0.5 }}>
                  {displayName && (
                    <Typography
                      variant="body2"
                      fontWeight={600}
                    >
                      {displayName}
                    </Typography>
                  )}
                  <Stack
                    sx={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {user?.employeeInternalId}
                    </Typography>
                    <Chip
                      label={profileBadge}
                      size="small"
                      variant="outlined"
                      color={
                        perfil === 'admin'
                          ? 'error'
                          : perfil === 'coordinador'
                            ? 'warning'
                            : 'default'
                      }
                    />
                  </Stack>
                </Stack>
                <Divider />
                <Button
                  onClick={() => logout()}
                  variant="text"
                  size="small"
                >
                  Cerrar sesión
                </Button>
              </Stack>
            }
            onOpenLanguageMenu={() => {}}
            supportButtonProps={{ href: '#' }}
            sx={{ flex: 1 }}
          />
          <Chip
            label={profileBadge}
            size="medium"
            color={
              perfil === 'admin'
                ? 'error'
                : perfil === 'coordinador'
                  ? 'warning'
                  : 'default'
            }
            variant={perfil === 'admin' ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600 }}
          />
        </Stack>
      </Box>

      <Popover
        open={Boolean(notificationsAnchor)}
        anchorEl={notificationsAnchor}
        onClose={handleCloseNotifications}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { mt: 1 } } }}
      >
        <NotificationsMenu onClose={handleCloseNotifications} />
      </Popover>

      <Stack
        sx={{
          flexDirection: 'row',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Backdrop for mobile overlay */}
        {sidebarOverlay && (
          <Box
            onClick={() => setIsCollapsed(true)}
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'rgba(0,0,0,0.4)',
              zIndex: 10,
            }}
          />
        )}

        {!sidebarHidden && (
          <Box
            sx={{
              flexShrink: 0,
              width: sidebarWidth,
              height: '100%',
              overflowY: 'auto',
              borderRight: '1px solid',
              borderRightColor: 'divider',
              pt: 2,
              bgcolor: 'background.paper',
              ...(sidebarOverlay && {
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                zIndex: 11,
              }),
            }}
          >
            <Box
              onClick={() => {
                if (isMobile) setIsCollapsed(true);
              }}
            >
              <Sidebar
                isCollapsed={false}
                pathname={pathname}
                sections={sections}
                openMenu={() => setIsCollapsed(false)}
              />
            </Box>
          </Box>
        )}

        <Box
          component="main"
          sx={{
            flex: 1,
            height: '100%',
            overflowY: 'auto',
            pt: { xs: 3, md: 5 },
            pb: { xs: 3, md: 5 },
            px: { xs: 2, sm: 4, md: 12 },
            bgcolor: 'new.background.layout.default',
          }}
        >
          <NotificationPermissionBanner />
          {children}
        </Box>
      </Stack>
    </Stack>
  );
};
