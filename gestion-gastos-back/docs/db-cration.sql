create database if not exists gestion_gastos;

use gestion_gastos;

create user if not exists dsw@'%' identified by 'dsw';
grant all on gestion_gastos.* to dsw@'%';

create table if not exists `gestion_gastos`.`user` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NULL,
  `surname` VARCHAR(50) NULL,
  `email` VARCHAR(50) NULL,
  `password` VARCHAR(255) NULL,
  PRIMARY KEY (`id`)
);

create table if not exists `gestion_gastos`.`category` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NULL UNIQUE,
  `icon` VARCHAR(50) NULL,
  `description` VARCHAR(100) NULL,
  `userid` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`userid`) REFERENCES `user`(`id`)
);

create table if not exists `gestion_gastos`.`wallet` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `coin` VARCHAR(50) NULL UNIQUE,
  `spend` DECIMAL(10, 2) NULL,
  `income` DECIMAL(10, 2) NULL,
  PRIMARY KEY (`id`)
);

create table if not exists `gestion_gastos`.`tag` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NULL UNIQUE,
  `userid` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`userid`) REFERENCES `user`(`id`)
);

create table if not exists `gestion_gastos`.`operation` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `amount` DECIMAL(10, 2) NOT NULL,
  `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `description` VARCHAR(100) NULL,
  `userid` INT UNSIGNED NOT NULL,
  `categoryid` INT UNSIGNED NOT NULL,
  `tagid` INT UNSIGNED NOT NULL,
  `walletid` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`userid`) REFERENCES `user`(`id`),
  FOREIGN KEY (`categoryid`) REFERENCES `category`(`id`),
  FOREIGN KEY (`tagid`) REFERENCES `tag`(`id`),
  FOREIGN KEY (`walletid`) REFERENCES `wallet`(`id`)
);