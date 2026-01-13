import type { UserRole } from '../../modules/auth/roles'

export type MenuItem = {
  label: string
  path: string
}

export const menuConfig: Record<UserRole, MenuItem[]> = {
  GLOBAL_ADMIN: [
    { label: 'Colegios', path: '/app/schools' },
    { label: 'Proveedores', path: '/app/providers' },
    { label: 'Usuarios', path: '/app/users' },
    { label: 'Plantillas', path: '/app/templates' },
  ],

  SCHOOL_ADMIN: [
    { label: 'Dashboard', path: '/app' },
    { label: 'Usuarios', path: '/app/users' },
    { label: 'Actividades', path: '/app/activities' },
    { label: 'Pagos', path: '/app/payments' },
    { label: 'Comunicaciones', path: '/app/communications' },
  ],

  PARENT: [
    { label: 'Inicio', path: '/app' },
    { label: 'Dependientes', path: '/app/dependents' },
    { label: 'Actividades', path: '/app/activities' },
    { label: 'Estado de cuenta', path: '/app/payments' },
    { label: 'Marketplace', path: '/app/marketplace' },
  ],
}
