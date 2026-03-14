import { MdDashboard } from 'react-icons/md';
import { FaClipboardList, FaBullhorn, FaUser, FaFeather } from 'react-icons/fa';
import {
  FaUserShield,
  FaTemperatureFull,
  FaUsers,
  FaShield,
  FaKey,
  FaScroll,
} from 'react-icons/fa6';

interface MenuItems {
  path: string;
  icon: React.ReactNode;
  label: string;
  role: string[];
}

const getIconForLabel = (label: string): React.ReactNode => {
  const iconMap: Record<string, React.ReactNode> = {
    Dashboard: <MdDashboard />,
    'Account Profile': <FaUser />,
    'Account Information': <FaUserShield />,
    Notifications: <FaBullhorn />,
    Announcements: <FaBullhorn />,
    'Temperature Monitoring': <FaTemperatureFull />,
    'Admin - Users': <FaUsers />,
    'Admin - Roles': <FaShield />,
    'Admin - Permissions': <FaKey />,
    'Admin - System Audit Logs': <FaScroll />,
    'Chicken Breed Library': <FaFeather />,
  };

  return iconMap[label] || <FaClipboardList />;
};

const menuConfig = {
  dashboard: { path: '/dashboard', label: 'Dashboard', role: [] },
  profile: { path: '/profile', label: 'Account Profile', role: [] },
  account: { path: '/account', label: 'Account Information', role: [] },
  notifications: { path: '/notifications', label: 'Notifications', role: [] },

  adminUsers: {
    path: '/admin/users',
    label: 'Admin - Users',
    role: ['Administrator', 'Moderator', 'Researcher', 'Monitoring-Manager'],
  },
  adminRoles: {
    path: '/admin/roles',
    label: 'Admin - Roles',
    role: ['Administrator', 'Moderator', 'Researcher', 'Monitoring-Manager'],
  },
  adminPermissions: {
    path: '/admin/permissions',
    label: 'Admin - Permissions',
    role: ['Administrator', 'Moderator', 'Researcher', 'Monitoring-Manager'],
  },
  adminAuditLogs: {
    path: '/admin/audit-logs',
    label: 'Admin - System Audit Logs',
    role: ['Administrator', 'Moderator', 'Researcher', 'Monitoring-Manager'],
  },

  temperatureMonitoring: {
    path: '/temperature-monitoring',
    label: 'Temperature Monitoring',
    role: [],
  },

  chickenBreedLibrary: {
    path: '/chicken-breed-library',
    label: 'Chicken Breed Library',
    role: [],
  },
};

const createMenuItems = (keys: string[]): MenuItems[] => {
  return keys.map((key) => {
    const config = menuConfig[key as keyof typeof menuConfig];
    return {
      ...config,
      icon: getIconForLabel(config.label),
    };
  });
};

export const AdministrativeMenuItems: MenuItems[] = createMenuItems([
  'dashboard',
  'adminUsers',
  'adminRoles',
  'adminPermissions',
  'adminAuditLogs',
  'temperatureMonitoring',
  'chickenBreedLibrary',
]);

export const ResearcherMenuItems: MenuItems[] = createMenuItems([
  'dashboard',
  'adminUsers',
  'adminRoles',
  'adminPermissions',
  'adminAuditLogs',
  'temperatureMonitoring',
  'chickenBreedLibrary',
]);

export const PoultryOperatorMenutItems: MenuItems[] = createMenuItems([
  'dashboard',
  'temperatureMonitoring',
  'chickenBreedLibrary',
]);

export const MonitoringManagerMenutItems: MenuItems[] = createMenuItems([
  'dashboard',
  'adminUsers',
  'adminRoles',
  'adminPermissions',
  'adminAuditLogs',
  'temperatureMonitoring',
  'chickenBreedLibrary',
]);
