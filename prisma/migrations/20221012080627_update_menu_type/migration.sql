/*
  Warnings:

  - The values [desert] on the enum `Menu_type` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `updated_at` on table `Menu` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `Owner` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Menu` MODIFY `type` ENUM('waffle', 'beverage', 'coffee', 'dessert') NOT NULL,
    MODIFY `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `Owner` MODIFY `updated_at` DATETIME(3) NOT NULL;
