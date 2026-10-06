-- Adopt fixtures created by the first Lab 4 seed before seedKey existed.
-- Matching uses the fixed ticket number, timestamp, and description together.
WITH fixtures (seed_key, ticket_number, action_occurred_at, description) AS (
  VALUES
    ('lab4-action-001', 'TKT-2026-SEED-002', TIMESTAMP '2026-09-03T03:00:00.000Z', 'Review VPN disconnect diagnostics and collect connection logs.'),
    ('lab4-action-002', 'TKT-2026-SEED-003', TIMESTAMP '2026-09-01T04:00:00.000Z', 'Reproduce the Grade Submission App save failure in the test environment.'),
    ('lab4-action-003', 'TKT-2026-SEED-003', TIMESTAMP '2026-09-02T06:30:00.000Z', 'Verify the database validation fix with a new grade submission.'),
    ('lab4-action-004', 'TKT-2026-SEED-004', TIMESTAMP '2026-09-02T09:30:00.000Z', 'Prepare the mailbox unlock verification steps for the requester.'),
    ('lab4-action-005', 'TKT-2026-SEED-005', TIMESTAMP '2026-09-01T08:00:00.000Z', 'Replace the printer toner cartridge and print a test page.'),
    ('lab4-action-006', 'TKT-2026-SEED-006', TIMESTAMP '2026-09-01T10:00:00.000Z', 'Measure wireless signal strength in the second-floor meeting room.'),
    ('lab4-action-007', 'TKT-2026-SEED-007', TIMESTAMP '2026-09-04T02:00:00.000Z', 'Schedule a diagnostic review for the recurring learning application error.')
)
UPDATE "ActionTaken" AS action
SET "seedKey" = fixture.seed_key
FROM fixtures AS fixture
JOIN "Ticket" AS ticket ON ticket."ticketNumber" = fixture.ticket_number
WHERE action."seedKey" IS NULL
  AND action."ticketId" = ticket.id
  AND action."actionOccurredAt" = fixture.action_occurred_at
  AND action.description = fixture.description
  AND NOT EXISTS (
    SELECT 1 FROM "ActionTaken" AS existing WHERE existing."seedKey" = fixture.seed_key
  );

-- If the new seed was run before this backfill, remove only its exact legacy
-- duplicate once the corresponding identified fixture exists. User Actions do
-- not have a seedKey and are otherwise never selected by the seed.
WITH fixtures (seed_key, ticket_number, action_occurred_at, description) AS (
  VALUES
    ('lab4-action-001', 'TKT-2026-SEED-002', TIMESTAMP '2026-09-03T03:00:00.000Z', 'Review VPN disconnect diagnostics and collect connection logs.'),
    ('lab4-action-002', 'TKT-2026-SEED-003', TIMESTAMP '2026-09-01T04:00:00.000Z', 'Reproduce the Grade Submission App save failure in the test environment.'),
    ('lab4-action-003', 'TKT-2026-SEED-003', TIMESTAMP '2026-09-02T06:30:00.000Z', 'Verify the database validation fix with a new grade submission.'),
    ('lab4-action-004', 'TKT-2026-SEED-004', TIMESTAMP '2026-09-02T09:30:00.000Z', 'Prepare the mailbox unlock verification steps for the requester.'),
    ('lab4-action-005', 'TKT-2026-SEED-005', TIMESTAMP '2026-09-01T08:00:00.000Z', 'Replace the printer toner cartridge and print a test page.'),
    ('lab4-action-006', 'TKT-2026-SEED-006', TIMESTAMP '2026-09-01T10:00:00.000Z', 'Measure wireless signal strength in the second-floor meeting room.'),
    ('lab4-action-007', 'TKT-2026-SEED-007', TIMESTAMP '2026-09-04T02:00:00.000Z', 'Schedule a diagnostic review for the recurring learning application error.')
)
DELETE FROM "ActionTaken" AS legacy
USING fixtures AS fixture, "Ticket" AS ticket
WHERE legacy."seedKey" IS NULL
  AND legacy."ticketId" = ticket.id
  AND ticket."ticketNumber" = fixture.ticket_number
  AND legacy."actionOccurredAt" = fixture.action_occurred_at
  AND legacy.description = fixture.description
  AND EXISTS (
    SELECT 1 FROM "ActionTaken" AS identified WHERE identified."seedKey" = fixture.seed_key
  );
