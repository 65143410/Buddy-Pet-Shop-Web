export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  groupClasses?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  children?: NavigationItem[];
  link?: string;
  description?: string;
  path?: string;
  roles?: string[];
}

export const NavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    type: 'group',
    icon: 'icon-navigation',
    children: [

      {
        id: 'home',
        title: 'Home',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard/home',
        icon: 'global',
        breadcrumbs: false,
        roles: ['ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER']
      },
      {
        id: 'admin',
        title: 'Admin',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard/admin',
        icon: 'dashboard',
        breadcrumbs: false,
        roles: ['ADMIN', 'MANAGER']
      },
      {
        id: 'staff',
        title: 'Staff',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard/staff',
        icon: 'dashboard',
        breadcrumbs: false,
        roles: ['ADMIN', 'MANAGER', 'STAFF']
      },
    ]
  },
  {
    id: 'authentication',
    title: 'Authentication',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'login',
        title: 'Login',
        type: 'item',
        classes: 'nav-item',
        url: '/login',
        icon: 'login',
        target: true,
        breadcrumbs: false
      },
      {
        id: 'register',
        title: 'Register',
        type: 'item',
        classes: 'nav-item',
        url: '/register',
        icon: 'profile',
        target: true,
        breadcrumbs: false
      }
    ]
  },


];
