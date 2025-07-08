create database if not exists gestion_gastos;

use gestion_gastos;

create user if not exists dsw@'%' identified by 'dsw';
grant all on gestion_gastos.* to dsw@'%';

create table if not exists `gestion_gastos`.`usuario` (
  `idUsuario` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NULL,
  `apellido` VARCHAR(50) NULL,
  `email` VARCHAR(50) NULL,
  `password` VARCHAR(255) NULL,
  PRIMARY KEY (`idUsuario`)
);

create table if not exists `gestion_gastos`.`categoria` (
  `idCategoria` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombreCategoria` VARCHAR(50) NULL UNIQUE,
  `tipoCategoria` VARCHAR(50) NULL,
  `descripcionCategoria` VARCHAR(100) NULL,
  PRIMARY KEY (`idCategoria`)
);

create table if not exists `gestion_gastos`.`wallet` (
  `idWallet` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `moneda` VARCHAR(50) NULL UNIQUE,
  `gastoTotal` DECIMAL(10, 2) NULL,
  `ingresoTotal` DECIMAL(10, 2) NULL,
  PRIMARY KEY (`idWallet`)
);

create table if not exists `gestion_gastos`.`movimiento` (
  `idMovimiento` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `montoMovimiento` DECIMAL(10, 2) NOT NULL,
  `fechaMovimiento` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `descripcionMovimiento` VARCHAR(100) NULL,
  `idUsuario` INT UNSIGNED NOT NULL,
  `idCategoria` INT UNSIGNED NOT NULL,
  `idEtiqueta` INT UNSIGNED NOT NULL,
  `idWallet` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`idMovimiento`),
  FOREIGN KEY (`idUsuario`) REFERENCES `usuario`(`idUsuario`),
  FOREIGN KEY (`idCategoria`) REFERENCES `categoria`(`idCategoria`),
  FOREIGN KEY (`idEtiqueta`) REFERENCES `etiqueta`(`idEtiqueta`),
  FOREIGN KEY (`idWallet`) REFERENCES `wallet`(`idWallet`)
);

create table if not exists `gestion_gastos`.`etiqueta` (
  `idEtiqueta` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombreEtiqueta` VARCHAR(50) NULL UNIQUE,
  `idUsuario` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`idEtiqueta`),
  FOREIGN KEY (`idUsuario`) REFERENCES `usuario`(`idUsuario`)
);