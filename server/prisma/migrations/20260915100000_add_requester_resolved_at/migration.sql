-- A requester may indicate that the reported problem appears resolved without
-- changing the formal IT workflow status of the ticket.
ALTER TABLE "Ticket" ADD COLUMN "requesterResolvedAt" TIMESTAMP(3);
