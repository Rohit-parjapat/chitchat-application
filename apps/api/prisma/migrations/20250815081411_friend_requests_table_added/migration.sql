-- CreateEnum
CREATE TYPE "public"."FriendRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."friendRequests" (
    "id" SERIAL NOT NULL,
    "fromId" INTEGER NOT NULL,
    "toId" INTEGER NOT NULL,
    "status" "public"."FriendRequestStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "friendRequests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."friendRequests" ADD CONSTRAINT "friendRequests_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."friendRequests" ADD CONSTRAINT "friendRequests_toId_fkey" FOREIGN KEY ("toId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
