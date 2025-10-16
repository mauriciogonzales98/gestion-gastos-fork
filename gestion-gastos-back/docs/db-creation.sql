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
  `coin` VARCHAR(50) NULL,
  `spend` DECIMAL(10, 2) NULL,
  `income` DECIMAL(10, 2) NULL,
  `userid` VARCHAR(28) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`userid`) REFERENCES `user`(`id`)
);

CREATE TABLE IF NOT EXISTS `gestion_gastos`.`tag` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT UNIQUE,
  `name` VARCHAR(50) NULL,
  `userid` VARCHAR(28) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`userid`) REFERENCES `user`(`id`)
);

CREATE TABLE IF NOT EXISTS `gestion_gastos`.`operation` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `amount` DECIMAL(10, 2) NOT NULL,
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