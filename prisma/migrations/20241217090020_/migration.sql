/*
  Warnings:

  - Made the column `description` on table `Project` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Message` MODIFY `content` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `Project` MODIFY `description` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `Prompt` MODIFY `description` TEXT NULL;
