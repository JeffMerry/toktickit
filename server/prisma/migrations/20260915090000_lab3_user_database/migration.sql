-- Preserve the Lab 2 requester records by renaming their table in place.
CREATE TYPE "UserRole" AS ENUM ('REQUESTER', 'IT_STAFF', 'ADMINISTRATOR');
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "TicketStatus" AS ENUM (
  'NEW',
  'OPEN',
  'IN_PROGRESS',
  'WAITING_FOR_REQUESTER',
  'RESOLVED',
  'CLOSED',
  'REOPENED',
  'CANCELLED'
);

ALTER TABLE "RequesterUser" RENAME TO "User";

ALTER TABLE "User"
  ADD COLUMN "normalizedEmail" TEXT,
  ADD COLUMN "passwordHash" TEXT,
  ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'REQUESTER',
  ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT true;

-- Existing Lab 2 requesters become active requester accounts. This bcrypt hash
-- is for the development-only initial password ChangeMe123! and must be changed
-- on first login.
UPDATE "User"
SET
  "normalizedEmail" = LOWER(BTRIM("email")),
  "passwordHash" = '$2b$12$Yh/1FGLdelXkV9uEe1t5NucuRInYnoam8W36mwZcCTz2u7nGpQaX2';

ALTER TABLE "User"
  ALTER COLUMN "normalizedEmail" SET NOT NULL,
  ALTER COLUMN "passwordHash" SET NOT NULL;

CREATE UNIQUE INDEX "User_normalizedEmail_key" ON "User"("normalizedEmail");
CREATE INDEX "User_role_isActive_idx" ON "User"("role", "isActive");

-- Convert Lab 2 string values without discarding existing tickets.
ALTER TABLE "Ticket" ALTER COLUMN "requestedPriority" DROP DEFAULT;
ALTER TABLE "Ticket"
  ALTER COLUMN "requestedPriority" TYPE "Priority"
  USING (
    CASE UPPER(BTRIM("requestedPriority"))
      WHEN 'LOW' THEN 'LOW'
      WHEN 'HIGH' THEN 'HIGH'
      WHEN 'URGENT' THEN 'URGENT'
      ELSE 'MEDIUM'
    END
  )::"Priority";
ALTER TABLE "Ticket" ALTER COLUMN "requestedPriority" SET DEFAULT 'MEDIUM';

ALTER TABLE "Ticket" ALTER COLUMN "currentStatus" DROP DEFAULT;
ALTER TABLE "Ticket"
  ALTER COLUMN "currentStatus" TYPE "TicketStatus"
  USING (
    CASE LOWER(BTRIM("currentStatus"))
      WHEN 'open' THEN 'OPEN'
      WHEN 'in progress' THEN 'IN_PROGRESS'
      WHEN 'in_progress' THEN 'IN_PROGRESS'
      WHEN 'waiting for requester' THEN 'WAITING_FOR_REQUESTER'
      WHEN 'waiting_for_requester' THEN 'WAITING_FOR_REQUESTER'
      WHEN 'resolved' THEN 'RESOLVED'
      WHEN 'closed' THEN 'CLOSED'
      WHEN 'reopened' THEN 'REOPENED'
      WHEN 'cancelled' THEN 'CANCELLED'
      WHEN 'canceled' THEN 'CANCELLED'
      ELSE 'NEW'
    END
  )::"TicketStatus";
ALTER TABLE "Ticket" ALTER COLUMN "currentStatus" SET DEFAULT 'NEW';

ALTER TABLE "Ticket"
  ADD COLUMN "ownerId" INTEGER,
  ADD COLUMN "itPriority" "Priority",
  ADD COLUMN "resolutionSuggestedAt" TIMESTAMP(3),
  ADD COLUMN "resolutionSuggestedById" INTEGER;

UPDATE "Ticket" SET "itPriority" = "requestedPriority";
ALTER TABLE "Ticket"
  ALTER COLUMN "itPriority" SET NOT NULL,
  ALTER COLUMN "itPriority" SET DEFAULT 'MEDIUM';

ALTER TABLE "Ticket"
  ADD CONSTRAINT "Ticket_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "Ticket_resolutionSuggestedById_fkey"
    FOREIGN KEY ("resolutionSuggestedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Ticket_requesterId_createdAt_idx" ON "Ticket"("requesterId", "createdAt");
CREATE INDEX "Ticket_ownerId_currentStatus_idx" ON "Ticket"("ownerId", "currentStatus");
CREATE INDEX "Ticket_currentStatus_itPriority_idx" ON "Ticket"("currentStatus", "itPriority");

CREATE TABLE "Session" (
  "id" SERIAL NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "userId" INTEGER NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
ALTER TABLE "Session"
  ADD CONSTRAINT "Session_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "PublicComment" (
  "id" SERIAL NOT NULL,
  "ticketId" INTEGER NOT NULL,
  "authorId" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PublicComment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PublicComment_ticketId_createdAt_idx" ON "PublicComment"("ticketId", "createdAt");
ALTER TABLE "PublicComment"
  ADD CONSTRAINT "PublicComment_ticketId_fkey"
    FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "PublicComment_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "InternalNote" (
  "id" SERIAL NOT NULL,
  "ticketId" INTEGER NOT NULL,
  "authorId" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InternalNote_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InternalNote_ticketId_createdAt_idx" ON "InternalNote"("ticketId", "createdAt");
ALTER TABLE "InternalNote"
  ADD CONSTRAINT "InternalNote_ticketId_fkey"
    FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "InternalNote_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
