CREATE DATABASE IF NOT EXISTS gestion_gastos;

USE gestion_gastos;

CREATE USER IF NOT EXISTS dsw@'%' IDENTIFIED BY 'dsw';
GRANT ALL ON gestion_gastos.* TO dsw@'%';

CREATE TABLE IF NOT EXISTS `gestion_gastos`.`user` (
  `id` VARCHAR(28) NOT NULL UNIQUE,
  `name` VARCHAR(50) NULL,
  `surname` VARCHAR(50) NULL,
  `email` VARCHAR(50) NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `gestion_gastos`.`category` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NULL,
  `icon` VARCHAR(50) NULL,
  `description` VARCHAR(100) NULL,
  `userid` VARCHAR(28) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`userid`) REFERENCES `user`(`id`)
);

CREATE TABLE IF NOT EXISTS `gestion_gastos`.`wallet` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `coin` VARCHAR(5) NULL,
  `spend` DECIMAL(15, 2) NULL,
  `income` DECIMAL(15, 2) NULL,
  `userid` VARCHAR(28) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`userid`) REFERENCES `user`(`id`)
);

CREATE TABLE IF NOT EXISTS `gestion_gastos`.`tag` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT UNIQUE,
  `name` VARCHAR(50) NULL,
  `userid` VARCHAR(28) NOT NULL,
  `color` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`userid`) REFERENCES `user`(`id`)
);

CREATE TABLE IF NOT EXISTS `gestion_gastos`.`operation` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `amount` DECIMAL(12, 2) NOT NULL,
  `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `description` VARCHAR(100) NULL,
  `type` ENUM('gasto', 'ingreso') NOT NULL DEFAULT 'gasto',
  `userid` VARCHAR(28) NOT NULL,
  `categoryid` INT UNSIGNED NULL,
  `tagid` INT UNSIGNED NULL,
  `walletid` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`userid`) REFERENCES `user`(`id`),
  FOREIGN KEY (`categoryid`) REFERENCES `category`(`id`),
  FOREIGN KEY (`tagid`) REFERENCES `tag`(`id`),
  FOREIGN KEY (`walletid`) REFERENCES `wallet`(`id`)
);
CREATE TABLE IF NOT EXISTS `registration_process` (
  `id` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `name` varchar(50) NOT NULL,
  `surname` varchar(50) DEFAULT NULL,
  `auth_created` tinyint DEFAULT '0',
  `user_id` varchar(28) DEFAULT NULL,
  `status` varchar(45) DEFAULT NULL,
  `step` varchar(45) DEFAULT NULL,
  `error` varchar(512) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- sync mercado pago

-- Agregar campos a User
ALTER TABLE user 
ADD COLUMN mp_access_token TEXT NULL,
ADD COLUMN mp_refresh_token TEXT NULL,
ADD COLUMN mp_token_expires_at DATETIME NULL,
ADD COLUMN mp_user_id VARCHAR(255) NULL,
ADD COLUMN last_sync_at DATETIME NULL;

-- Agregar campos a Operation  
ALTER TABLE operation 
ADD COLUMN external_id VARCHAR(255) NULL,
ADD COLUMN sync_source VARCHAR(50) NULL,
ADD COLUMN payment_method VARCHAR(100) NULL,
ADD COLUMN status VARCHAR(50) NULL,
ADD UNIQUE INDEX unique_external_operation (userid, external_id);