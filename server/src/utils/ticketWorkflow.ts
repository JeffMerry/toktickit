import type { TicketStatus } from '@prisma/client';

const allowedTransitions: Record<TicketStatus, TicketStatus[]> = {
  NEW: ['OPEN', 'CANCELLED'],
  OPEN: ['IN_PROGRESS', 'WAITING_FOR_REQUESTER', 'RESOLVED', 'CANCELLED'],
  IN_PROGRESS: ['WAITING_FOR_REQUESTER', 'RESOLVED', 'CANCELLED'],
  WAITING_FOR_REQUESTER: ['IN_PROGRESS', 'RESOLVED', 'CANCELLED'],
  RESOLVED: ['CLOSED', 'REOPENED'],
  CLOSED: ['REOPENED'],
  REOPENED: ['IN_PROGRESS', 'WAITING_FOR_REQUESTER', 'RESOLVED', 'CANCELLED'],
  CANCELLED: [],
};

const confirmationTransitions = new Set<TicketStatus>(['RESOLVED', 'CANCELLED', 'CLOSED', 'REOPENED']);

export function allowedNextStatuses(currentStatus: TicketStatus): TicketStatus[] {
  return allowedTransitions[currentStatus];
}

export function isAllowedStatusTransition(currentStatus: TicketStatus, nextStatus: TicketStatus): boolean {
  return allowedNextStatuses(currentStatus).includes(nextStatus);
}

export function transitionRequiresOwner(currentStatus: TicketStatus, nextStatus: TicketStatus): boolean {
  return (currentStatus === 'NEW' && nextStatus === 'OPEN') || currentStatus === 'REOPENED';
}

export function transitionRequiresConfirmation(nextStatus: TicketStatus): boolean {
  return confirmationTransitions.has(nextStatus);
}
