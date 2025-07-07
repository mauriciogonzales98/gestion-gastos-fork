create database if not exists gestion_gastos;

use gestion_gastos;

create user if not exists dsw@'%' identified by 'dsw';
grant all on basedeprueba.* to dsw@'%';

create table if not exists `gestion_gastos`.`usuario` (
  `idUsuario` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NULL,
  `apellido` VARCHAR(50) NULL,
  `email` VARCHAR(50) NULL,
  `password` VARCHAR(255) NULL,
  PRIMARY KEY (`idUsuario`)
);

create table if not exists `gestion_gastos`.`movimiento` (
  `idMovimiento` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `montoMovimiento` DECIMAL(10, 2) NULL,
  `fechaMovimiento` DATETIME NULL,
  `descripcionMovimiento` VARCHAR(50) NULL,
  PRIMARY KEY (`idMovimiento`),
  FOREIGN KEY (`idUsuario`) REFERENCES `usuario`(`idUsuario`),
  FOREIGN KEY (`idCategoria`) REFERENCES `categoria`(`idCategoria`)
);

create table if not exists `gestion_gastos`.`categoria` (
  `idCategoria` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombreCategoria` VARCHAR(50) NULL UNIQUE,
  `tipoCategoria` VARCHAR(50) NULL,
  `descripcionCategoria` VARCHAR(100) NULL,
  PRIMARY KEY (`idCategoria`)
);