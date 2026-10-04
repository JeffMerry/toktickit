import type { TicketStatus } from '@prisma/client';

const allowedTransitions: Record<TicketStatus, TicketStatus[]> = {
  NEW: ['OPEN', 'CANCELLED'],
  OPEN: ['IN_PROGRESS', 'WAITING_FOR_REQUESTER', 'CANCELLED'],
  IN_PROGRESS: ['WAITING_FOR_REQUESTER', 'RESOLVED', 'CANCELLED'],
  WAITING_FOR_REQUESTER: ['IN_PROGRESS', 'RESOLVED', 'CANCELLED'],
  RESOLVED: ['CLOSED', 'REOPENED'],
  CLOSED: ['REOPENED'],
  REOPENED: ['IN_PROGRESS', 'WAITING_FOR_REQUESTER', 'CANCELLED'],
  CANCELLED: [],
};

const confirmationTransitions = new Set<TicketStatus>(['RESOLVED', 'CANCELLED', 'CLOSED', 'REOPENED']);
const ownerRequiredStatuses = new Set<TicketStatus>(['OPEN', 'IN_PROGRESS', 'WAITING_FOR_REQUESTER', 'RESOLVED']);

export function allowedNextStatuses(currentStatus: TicketStatus): TicketStatus[] {
  return allowedTransitions[currentStatus];
}

export function isAllowedStatusTransition(currentStatus: TicketStatus, nextStatus: TicketStatus): boolean {
  return allowedNextStatuses(currentStatus).includes(nextStatus);
}

export function transitionRequiresOwner(_currentStatus: TicketStatus, nextStatus: TicketStatus): boolean {
  return ownerRequiredStatuses.has(nextStatus);
}

export function transitionRequiresConfirmation(nextStatus: TicketStatus): boolean {
  return confirmationTransitions.has(nextStatus);
}
