import type { UserRole } from '../../modules/auth/roles'

export interface MenuItem {
  label: string
  path: string
}

export const menuByRole: Record<UserRole, MenuItem[]> = {
  GLOBAL_ADMIN: [
    { label: 'Dashboard', path: '/app' },
    { label: 'Colegios', path: '/app/schools' },
    { label: 'Proveedores', path: '/app/providers' },
    { label: 'Templates', path: '/app/templates' },
  ],
  SCHOOL_ADMIN: [
    { label: 'Dashboard', path: '/app' },
    { label: 'Padres', path: '/app/parents' },
    { label: 'Pagos', path: '/app/payments' },
    { label: 'Comunicación', path: '/app/communications' },
  ],
  PARENT: [
    { label: 'Inicio', path: '/app' },
    { label: 'Dependientes', path: '/app/dependents' },
    { label: 'Estado de Cuenta', path: '/app/account' },
    { label: 'Marketplace', path: '/app/marketplace' },
  ],
}
