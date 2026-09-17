import { describe, expect, it } from 'vitest';
import { administratorAccessError, isOperationalRole, operationalAccessError } from '../../src/utils/staffAuthorization';

describe('operational staff authorization', () => {
  it('allows IT staff and administrators as operational roles', () => {
    expect(isOperationalRole('IT_STAFF')).toBe(true);
    expect(isOperationalRole('ADMINISTRATOR')).toBe(true);
    expect(isOperationalRole('REQUESTER')).toBe(false);
  });

  it('requires password change before operational access', () => {
    expect(operationalAccessError({ role: 'IT_STAFF', mustChangePassword: true }))
      .toBe('Password change is required before accessing this resource.');
  });

  it('rejects requesters and allows eligible operational users', () => {
    expect(operationalAccessError({ role: 'REQUESTER', mustChangePassword: false }))
      .toBe('Operational staff access is required.');
    expect(operationalAccessError({ role: 'ADMINISTRATOR', mustChangePassword: false })).toBeUndefined();
  });

  it('allows only an administrator into administration routes', () => {
    expect(administratorAccessError({ role: 'IT_STAFF', mustChangePassword: false }))
      .toBe('Administrator access is required.');
    expect(administratorAccessError({ role: 'ADMINISTRATOR', mustChangePassword: true }))
      .toBe('Password change is required before accessing this resource.');
    expect(administratorAccessError({ role: 'ADMINISTRATOR', mustChangePassword: false })).toBeUndefined();
  });
});
