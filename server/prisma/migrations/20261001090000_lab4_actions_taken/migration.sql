-- Lab 4 is additive: existing Tickets retain all previous relationships and
-- simply start with zero Actions Taken.
CREATE TYPE "ActionStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "ActionEventType" AS ENUM ('CREATED', 'UPDATED', 'STATUS_CHANGED');

CREATE TABLE "ActionTaken" (
  "id" SERIAL NOT NULL,
  "ticketId" INTEGER NOT NULL,
  "assigneeId" INTEGER,
  "createdById" INTEGER NOT NULL,
  "performedById" INTEGER,
  "actionOccurredAt" TIMESTAMP(3) NOT NULL,
  "description" TEXT NOT NULL,
  "result" TEXT,
  "status" "ActionStatus" NOT NULL DEFAULT 'PLANNED',
  "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
  "followUpNote" TEXT,
  "attachmentNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ActionTaken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ActionTakenEvent" (
  "id" SERIAL NOT NULL,
  "actionTakenId" INTEGER NOT NULL,
  "actorId" INTEGER NOT NULL,
  "eventType" "ActionEventType" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ActionTakenEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ActionTaken_ticketId_actionOccurredAt_idx" ON "ActionTaken"("ticketId", "actionOccurredAt");
CREATE INDEX "ActionTaken_assigneeId_status_idx" ON "ActionTaken"("assigneeId", "status");
CREATE INDEX "ActionTaken_performedById_actionOccurredAt_idx" ON "ActionTaken"("performedById", "actionOccurredAt");
CREATE INDEX "ActionTakenEvent_actionTakenId_createdAt_idx" ON "ActionTakenEvent"("actionTakenId", "createdAt");

ALTER TABLE "ActionTaken"
  ADD CONSTRAINT "ActionTaken_ticketId_fkey"
    FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "ActionTaken_assigneeId_fkey"
    FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "ActionTaken_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "ActionTaken_performedById_fkey"
    FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ActionTakenEvent"
  ADD CONSTRAINT "ActionTakenEvent_actionTakenId_fkey"
    FOREIGN KEY ("actionTakenId") REFERENCES "ActionTaken"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "ActionTakenEvent_actorId_fkey"
    FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
