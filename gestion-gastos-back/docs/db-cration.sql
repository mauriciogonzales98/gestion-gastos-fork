create database if not exists gestion_gastos;

use gestion_gastos;

create user if not exists dsw@'%' identified by 'dsw';
grant all on gestion_gastos.* to dsw@'%';

create table if not exists `gestion_gastos`.`user` (
  `userId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NULL,
  `surname` VARCHAR(50) NULL,
  `email` VARCHAR(50) NULL,
  `password` VARCHAR(255) NULL,
  PRIMARY KEY (`userId`)
);

create table if not exists `gestion_gastos`.`category` (
  `categoryId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `categoryName` VARCHAR(50) NULL UNIQUE,
  `categoryIcon` VARCHAR(50) NULL,
  `categoryDescription` VARCHAR(100) NULL,
  PRIMARY KEY (`categoryId`)
);

create table if not exists `gestion_gastos`.`wallet` (
  `walletId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `coin` VARCHAR(50) NULL UNIQUE,
  `totalSpend` DECIMAL(10, 2) NULL,
  `totalIncome` DECIMAL(10, 2) NULL,
  PRIMARY KEY (`walletId`)
);

create table if not exists `gestion_gastos`.`operation` (
  `operationId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `operationAmount` DECIMAL(10, 2) NOT NULL,
  `operationDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `operationDescription` VARCHAR(100) NULL,
  `userId` INT UNSIGNED NOT NULL,
  `categoryId` INT UNSIGNED NOT NULL,
  `tagId` INT UNSIGNED NOT NULL,
  `walletId` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`operationId`),
  FOREIGN KEY (`userId`) REFERENCES `user`(`userId`),
  FOREIGN KEY (`categoryId`) REFERENCES `category`(`categoryId`),
  FOREIGN KEY (`tagId`) REFERENCES `tag`(`tagId`),
  FOREIGN KEY (`walletId`) REFERENCES `wallet`(`walletId`)
);

create table if not exists `gestion_gastos`.`tag` (
  `tagId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tagName` VARCHAR(50) NULL UNIQUE,
  `userId` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`tagId`),
  FOREIGN KEY (`userId`) REFERENCES `user`(`userId`)
);