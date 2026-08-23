import { describe, it, expect } from 'vitest';
import { generateTicketNumber } from '../../src/utils/ticketNumber';

describe('Ticket Number Generator Utility', () => {
  it('should generate a ticket number matching TKT-YYYY-XXXXXX format', () => {
    const ticketNumber = generateTicketNumber();
    const currentYear = new Date().getFullYear();
    const regex = new RegExp(`^TKT-${currentYear}-[A-Z0-9]{6}$`);

    expect(ticketNumber).toMatch(regex);
  });

  it('should generate distinct ticket numbers on multiple calls', () => {
    const num1 = generateTicketNumber();
    const num2 = generateTicketNumber();

    expect(num1).not.toEqual(num2);
  });
});
