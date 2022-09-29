DROP TABLE IF EXISTS `owner`, `menu`, `review`, `refreshtoken`;

CREATE TABLE `owner` (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       username VARCHAR(31) UNIQUE NOT NULL,
                       password VARCHAR(255) NOT NULL,
                       store_name VARCHAR(31),
                       store_description VARCHAR(255),
                       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `menu` (
                      id INT AUTO_INCREMENT PRIMARY KEY,
                      name VARCHAR(31) NOT NULL,
                      owner_id INT NOT NULL,
                      type ENUM('waffle', 'beverage', 'coffee', 'desert'),

                      price INT NOT NULL,
                      image VARCHAR(1023),
                      description VARCHAR(1023),
                      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                      updated_at TIMESTAMP DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

                      FOREIGN KEY (owner_id) REFERENCES Owner(id)
);

CREATE TABLE `review` (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        menu_id INT NOT NULL,
                        author_id INT NOT NULL,
                        content VARCHAR(1023) NOT NULL,
                        rating INT NOT NULL,
                        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                        updated_at TIMESTAMP DEFAULT NULL ON UPDATE NOW(),

                        FOREIGN KEY (menu_id) REFERENCES Menu(id),
                        FOREIGN KEY (author_id) REFERENCES Owner(id)
);

CREATE TABLE `RefreshToken` (
                              id INT AUTO_INCREMENT PRIMARY KEY,
                              refresh_token VARCHAR(100) NOT NULL UNIQUE,
                              owner_id INT NOT NULL,
                              expiry TIMESTAMP NOT NULL,

                              FOREIGN KEY (owner_id) REFERENCES Owner(id)
);
