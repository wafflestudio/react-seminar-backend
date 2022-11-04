-- DropForeignKey
ALTER TABLE `Menu` DROP FOREIGN KEY `Menu_owner_id_fkey`;

-- DropForeignKey
ALTER TABLE `Review` DROP FOREIGN KEY `Review_menu_id_fkey`;

-- AddForeignKey
ALTER TABLE `Menu` ADD CONSTRAINT `Menu_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `Owner`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `Menu`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
