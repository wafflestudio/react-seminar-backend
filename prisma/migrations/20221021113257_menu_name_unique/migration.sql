/*
  Warnings:

  - A unique constraint covering the columns `[name,owner_id]` on the table `Menu` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Menu_name_owner_id_key` ON `Menu`(`name`, `owner_id`);
