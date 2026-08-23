/**
 * Generates a unique official Ticket Number in format: TKT-YYYY-XXXXXX
 * Example: TKT-2026-8A3B9Z
 * Conforms to BR-01 specification.
 */
export function generateTicketNumber(): string {
  const year = new Date().getFullYear();
  
  // Generate a random 6-character alphanumeric string (uppercase)
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomCode = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomCode += characters.charAt(randomIndex);
  }

  return `TKT-${year}-${randomCode}`;
}
