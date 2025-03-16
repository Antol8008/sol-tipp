-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "bio" TEXT,
    "minimum_tip" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "avatar_url" TEXT,
    "banner_url" TEXT,
    "social_links" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_wallet_address_key" ON "profiles"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_username_key" ON "profiles"("username");
