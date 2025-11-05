/*
  Warnings:

  - You are about to drop the column `active` on the `articles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `articles` DROP COLUMN `active`,
    ADD COLUMN `status` ENUM('DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED') NOT NULL DEFAULT 'DRAFT';
