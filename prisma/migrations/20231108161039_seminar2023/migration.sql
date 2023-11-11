/*
  Warnings:

  - You are about to drop the column `description` on the `Menu` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Menu` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Menu` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `Menu` table. The data in that column could be lost. The data in that column will be cast from `VarChar(31)` to `VarChar(20)`.
  - You are about to drop the column `store_description` on the `Owner` table. All the data in the column will be lost.
  - You are about to drop the column `store_name` on the `Owner` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Menu` will be added. If there are existing duplicate values, this will fail.
  - Made the column `image` on table `Menu` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `Menu_name_owner_id_key` ON `Menu`;

-- AlterTable
ALTER TABLE `Menu` DROP COLUMN `description`,
    DROP COLUMN `price`,
    DROP COLUMN `type`,
    MODIFY `name` VARCHAR(20) NOT NULL,
    MODIFY `image` VARCHAR(1023) NOT NULL;

-- AlterTable
ALTER TABLE `Owner` DROP COLUMN `store_description`,
    DROP COLUMN `store_name`;

-- CreateIndex
CREATE UNIQUE INDEX `Menu_name_key` ON `Menu`(`name`);
