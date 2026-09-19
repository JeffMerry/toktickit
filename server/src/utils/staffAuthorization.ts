export type OperationalRole = 'REQUESTER' | 'IT_STAFF' | 'ADMINISTRATOR';

export function isOperationalRole(role: OperationalRole): boolean {
  return role === 'IT_STAFF' || role === 'ADMINISTRATOR';
}

export function operationalAccessError(user: { role: OperationalRole; mustChangePassword: boolean }): string | undefined {
  if (user.mustChangePassword) return 'Password change is required before accessing this resource.';
  if (!isOperationalRole(user.role)) return 'Operational staff access is required.';
  return undefined;
}

export function administratorAccessError(user: { role: OperationalRole; mustChangePassword: boolean }): string | undefined {
  if (user.mustChangePassword) return 'Password change is required before accessing this resource.';
  if (user.role !== 'ADMINISTRATOR') return 'Administrator access is required.';
  return undefined;
}
