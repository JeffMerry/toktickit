-- Identify only the Actions Taken fixtures owned by the development seed.
-- A nullable unique key leaves all user-created actions untouched on reruns.
ALTER TABLE "ActionTaken" ADD COLUMN "seedKey" TEXT;

CREATE UNIQUE INDEX "ActionTaken_seedKey_key" ON "ActionTaken"("seedKey");
