import { describe, expect, it } from 'vitest';
import {
  allowedNextStatuses,
  isAllowedStatusTransition,
  transitionRequiresConfirmation,
  transitionRequiresOwner,
} from '../../src/utils/ticketWorkflow';

describe('ticket workflow transitions', () => {
  it('returns only documented next states', () => {
    expect(allowedNextStatuses('NEW')).toEqual(['OPEN', 'CANCELLED']);
    expect(allowedNextStatuses('CANCELLED')).toEqual([]);
    expect(isAllowedStatusTransition('OPEN', 'RESOLVED')).toBe(true);
    expect(isAllowedStatusTransition('OPEN', 'CLOSED')).toBe(false);
  });

  it('requires an owner only for documented transitions', () => {
    expect(transitionRequiresOwner('NEW', 'OPEN')).toBe(true);
    expect(transitionRequiresOwner('REOPENED', 'RESOLVED')).toBe(true);
    expect(transitionRequiresOwner('OPEN', 'IN_PROGRESS')).toBe(false);
  });

  it('identifies transitions that require confirmation', () => {
    expect(transitionRequiresConfirmation('RESOLVED')).toBe(true);
    expect(transitionRequiresConfirmation('CANCELLED')).toBe(true);
    expect(transitionRequiresConfirmation('CLOSED')).toBe(true);
    expect(transitionRequiresConfirmation('IN_PROGRESS')).toBe(false);
  });
});
