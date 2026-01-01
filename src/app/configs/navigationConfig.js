const navigationConfig = [
  // MAIN
  {
    id: 'main-group',
    title: 'MAIN',
    type: 'group',
    children: [
      {
        id: 'home',
        title: 'Home',
        type: 'item',
        icon: 'heroicons-outline:home',
        url: 'dashboard',
      },
      {
        id: 'notes',
        title: 'Notes',
        type: 'item',
        icon: 'heroicons-outline:document-text',
        url: 'dashboard/notes',
      },
      {
        id: 'tasks',
        title: 'Tasks',
        type: 'item',
        icon: 'heroicons-outline:clipboard',
        url: 'dashboard/tasks',
      },
      {
        id: 'files',
        title: 'Files',
        type: 'item',
        icon: 'heroicons-outline:folder',
        url: 'dashboard/files',
      },
      {
        id: 'calendar',
        title: 'Calendar',
        type: 'item',
        icon: 'heroicons-outline:calendar',
        url: 'dashboard/calendar',
      },
      {
        id: 'templates',
        title: 'Templates',
        type: 'item',
        icon: 'heroicons-outline:document-duplicate',
        url: 'dashboard/templates',
      },
    ],
  },

  // ORGANIZE
  {
    id: 'organize-group',
    title: 'ORGANIZE',
    type: 'group',
    children: [
      {
        id: 'notebooks',
        title: 'Notebooks',
        type: 'item',
        icon: 'heroicons-outline:book-open',
        url: 'dashboard/notebooks',
      },
      {
        id: 'tags',
        title: 'Tags',
        type: 'item',
        icon: 'heroicons-outline:tag',
        url: 'dashboard/tags',
      },
    ],
  },

  // COLLABORATION
  {
    id: 'collaboration-group',
    title: 'COLLABORATION',
    type: 'group',
    children: [
      {
        id: 'shared-with-me',
        title: 'Shared with me',
        type: 'item',
        icon: 'heroicons-outline:users',
        url: 'dashboard/shared',
      },
      {
        id: 'spaces',
        title: 'Spaces',
        type: 'item',
        icon: 'heroicons-outline:squares-2x2',
        url: 'dashboard/spaces',
      },
    ],
  },

  // MORE
  {
    id: 'more-group',
    title: 'MORE',
    type: 'group',
    children: [
      {
        id: 'settings',
        title: 'Settings',
        type: 'item',
        icon: 'heroicons-outline:cog',
        url: 'dashboard/settings',
      },
      {
        id: 'help',
        title: 'Help',
        type: 'item',
        icon: 'heroicons-outline:question-mark-circle',
        url: 'dashboard/help',
      },
    ],
  },

  // ========== COMMENTED OUT - Not needed for Evernote clone ==========
  // {
  //   id: 'dashboards',
  //   title: 'Dashboards',
  //   type: 'group',
  //   children: [
  //     { id: 'dashboards.project', title: 'Project', url: '/dashboards/project' },
  //     { id: 'dashboards.analytics', title: 'Analytics', url: '/dashboards/analytics' },
  //     { id: 'dashboards.finance', title: 'Finance', url: '/dashboards/finance' },
  //     { id: 'dashboards.crypto', title: 'Crypto', url: '/dashboards/crypto' },
  //   ],
  // },
  // {
  //   id: 'apps',
  //   title: 'Applications',
  //   type: 'group',
  //   children: [
  //     { id: 'apps.academy', title: 'Academy', url: '/apps/academy' },
  //     { id: 'apps.chat', title: 'Chat', url: '/apps/chat' },
  //     { id: 'apps.contacts', title: 'Contacts', url: '/apps/contacts' },
  //     { id: 'apps.ecommerce', title: 'ECommerce', url: '/apps/e-commerce' },
  //     { id: 'apps.file-manager', title: 'File Manager', url: '/apps/file-manager' },
  //     { id: 'apps.mailbox', title: 'Mailbox', url: '/apps/mailbox' },
  //     { id: 'apps.scrumboard', title: 'Scrumboard', url: '/apps/scrumboard' },
  //   ],
  // },
  // {
  //   id: 'pages',
  //   title: 'Pages',
  //   type: 'group',
  //   children: [
  //     { id: 'pages.activities', title: 'Activities', url: '/pages/activities' },
  //     { id: 'pages.authentication', title: 'Authentication', url: '/pages/authentication' },
  //     { id: 'pages.coming-soon', title: 'Coming Soon', url: '/pages/coming-soon' },
  //     { id: 'pages.error', title: 'Error', url: '/pages/error' },
  //     { id: 'pages.invoice', title: 'Invoice', url: '/pages/invoice' },
  //     { id: 'pages.maintenance', title: 'Maintenance', url: '/pages/maintenance' },
  //     { id: 'pages.pricing', title: 'Pricing', url: '/pages/pricing' },
  //     { id: 'pages.search', title: 'Search', url: '/pages/search' },
  //   ],
  // },
  // {
  //   id: 'user-interface',
  //   title: 'User Interface',
  //   type: 'group',
  //   children: [
  //     { id: 'user-interface.tailwindcss', title: 'TailwindCSS', url: '/ui/tailwindcss' },
  //     { id: 'user-interface.icons', title: 'Icons', url: '/ui/icons' },
  //     { id: 'user-interface.page-layouts', title: 'Page Layouts', url: '/ui/page-layouts' },
  //     { id: 'user-interface.typography', title: 'Typography', url: '/ui/typography' },
  //   ],
  // },
  // DocumentationNavigation,
  // {
  //   id: 'auth',
  //   title: 'Auth',
  //   type: 'group',
  //   children: [
  //     { id: 'auth-admin-example', title: 'Admin: Auth protected page', url: 'auth/admin-role-example' },
  //     { id: 'auth-staff-example', title: 'Staff: Auth protected page', url: 'auth/staff-role-example' },
  //     { id: 'auth-guest-example', title: 'Guest: Auth protected page', url: 'auth/guest-role-example' },
  //   ],
  // },
  // ====================================================================
];

export default navigationConfig;
