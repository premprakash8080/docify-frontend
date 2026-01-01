import FuseUtils from '@fuse/utils';
import FuseLoading from '@fuse/core/FuseLoading';
import { Navigate } from 'react-router-dom';
import settingsConfig from './settingsConfig';
import authRoles from '../auth/authRoles';

// Authentication routes (always accessible)
import SignInConfig from '../main/sign-in/SignInConfig';
import SignUpConfig from '../main/sign-up/SignUpConfig';
import SignOutConfig from '../main/sign-out/SignOutConfig';

// Error pages (always accessible)
import Error404Page from '../main/pages/error/Error404Page';

// Dashboard Layout
import DashboardLayout from '../main/Dashboard/DashboardLayout';
import DashboardHomePage from '../main/Dashboard/DashboardHomePage';

// Dashboard pages - Evernote features
import NotesPage from '../main/notes/NotesPage';
import TasksPage from '../main/tasks/TasksPage';
import FilesPage from '../main/files/FilesPage';
import FilesFirstScreen from '../main/files/components/FilesFirstScreen';
import FileView from '../main/files/FileView';
import CalendarPage from '../main/calendar/CalendarPage';
import TemplatesPage from '../main/templates/TemplatesPage';
import NotebooksPage from '../main/notebooks/NotebooksPage';
import TagsPage from '../main/tags/TagsPage';
import SharedPage from '../main/shared/SharedPage';
import SpacesPage from '../main/spaces/SpacesPage';
import SettingsPage from '../main/settings/SettingsPage';
import HelpPage from '../main/help/HelpPage';

// Keep these apps for Evernote features (commented unused ones)
import NotesAppConfig from '../main/apps/notes/NotesAppConfig'; // Keep - main feature
import TasksAppConfig from '../main/apps/tasks/TasksAppConfig'; // Keep - Evernote has tasks/checkboxes
import CalendarAppConfig from '../main/apps/calendar/CalendarAppConfig'; // Keep - for reminders
import ProfileAppConfig from '../main/apps/profile/profileAppConfig'; // Keep - user profile
// import HelpCenterAppConfig from '../main/apps/help-center/HelpCenterAppConfig'; // Commented - we have help page

// Commented out - Not needed for Evernote clone
// import AcademyAppConfig from '../main/apps/academy/AcademyAppConfig';
// import ChatAppConfig from '../main/apps/chat/ChatAppConfig';
// import ContactsAppConfig from '../main/apps/contacts/ContactsAppConfig';
// import ECommerceAppConfig from '../main/apps/e-commerce/ECommerceAppConfig';
// import FileManagerAppConfig from '../main/apps/file-manager/FileManagerAppConfig';
// import MailboxAppConfig from '../main/apps/mailbox/MailboxAppConfig';
// import ScrumboardAppConfig from '../main/apps/scrumboard/ScrumboardAppConfig';

// Commented out - Not needed dashboards
// import AnalyticsDashboardAppConfig from '../main/dashboards/analytics/AnalyticsDashboardAppConfig';
// import ProjectDashboardAppConfig from '../main/dashboards/project/ProjectDashboardAppConfig';
// import FinanceDashboardAppConfig from '../main/dashboards/finance/FinanceDashboardAppConfig';
// import CryptoDashboardAppConfig from '../main/dashboards/crypto/CryptoDashboardAppConfig';

// Commented out - Not needed pages
// import authenticationPagesConfig from '../main/pages/authentication/authenticationPagesConfig';
// import comingSoonPagesConfig from '../main/pages/coming-soon/comingSoonPagesConfig';
// import invoicePagesConfig from '../main/pages/invoice/invoicePagesConfig';
// import pricingPagesConfig from '../main/pages/pricing/pricingPagesConfig';
// import searchPagesConfig from '../main/pages/search/searchPagesConfig';
// import activitiesPageConfig from '../main/pages/activities/activitiesPageConfig';
// import maintenancePageConfig from '../main/pages/maintenance/maintenancePageConfig';

// Commented out - Not needed UI examples
// import userInterfaceConfigs from '../main/user-interface/UserInterfaceConfigs';

// Commented out - Not needed documentation
// import DocumentationConfig from '../main/documentation/DocumentationConfig';

// Commented out - Auth role examples (keep for reference but not in routes)
// import authRoleExamplesConfigs from '../main/auth/authRoleExamplesConfigs';

// Route configs for apps (only Evernote-relevant ones)
const appsConfigs = [
  NotesAppConfig, // Main notes feature
  TasksAppConfig, // Tasks/checkboxes
  CalendarAppConfig, // Calendar/reminders
  ProfileAppConfig, // User profile
  // HelpCenterAppConfig, // Help center (optional)
];

// Route configs - only authentication and error pages
const routeConfigs = [...appsConfigs, SignOutConfig, SignInConfig, SignUpConfig];

// Main routes with role-based access
const routes = [
  ...FuseUtils.generateRoutesFromConfigs(routeConfigs, settingsConfig.defaultAuth),
  {
    path: 'dashboard',
    element: <DashboardLayout />,
    auth: authRoles.user, // Requires user role or higher
    children: [
      {
        index: true,
        element: <DashboardHomePage />,
        auth: authRoles.user,
      },
      {
        path: 'notes',
        element: <NotesPage />,
        auth: authRoles.user,
      },
      {
        path: 'tasks',
        element: <TasksPage />,
        auth: authRoles.user,
      },
      {
        path: 'files',
        element: <FilesPage />,
        auth: authRoles.user,
        children: [
          {
            index: true,
            element: <FilesFirstScreen />,
            auth: authRoles.user,
          },
          {
            path: ':id',
            element: <FileView />,
            auth: authRoles.user,
          },
        ],
      },
      {
        path: 'calendar',
        element: <CalendarPage />,
        auth: authRoles.user,
      },
      {
        path: 'templates',
        element: <TemplatesPage />,
        auth: authRoles.user,
      },
      {
        path: 'notebooks',
        element: <NotebooksPage />,
        auth: authRoles.user,
      },
      {
        path: 'tags',
        element: <TagsPage />,
        auth: authRoles.user,
      },
      {
        path: 'shared',
        element: <SharedPage />,
        auth: authRoles.user,
      },
      {
        path: 'spaces',
        element: <SpacesPage />,
        auth: authRoles.user,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
        auth: authRoles.user,
      },
      {
        path: 'help',
        element: <HelpPage />,
        auth: authRoles.user,
      },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" />,
    auth: settingsConfig.defaultAuth,
  },
  {
    path: 'loading',
    element: <FuseLoading />,
    auth: null, // No auth required
  },
  {
    path: '404',
    element: <Error404Page />,
    auth: null, // No auth required
  },
  {
    path: '*',
    element: <Navigate to="404" />,
    auth: null, // No auth required
  },
];

export default routes;
