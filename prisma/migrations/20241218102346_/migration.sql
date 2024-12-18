/*
  Warnings:

  - A unique constraint covering the columns `[projectId,slug]` on the table `Prompt` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Prompt_slug_key` ON `Prompt`;

-- CreateIndex
CREATE UNIQUE INDEX `Prompt_projectId_slug_key` ON `Prompt`(`projectId`, `slug`);
