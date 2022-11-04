-- DropForeignKey
ALTER TABLE `Menu` DROP FOREIGN KEY `Menu_owner_id_fkey`;

-- AddForeignKey
ALTER TABLE `Menu` ADD CONSTRAINT `Menu_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `Owner`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
