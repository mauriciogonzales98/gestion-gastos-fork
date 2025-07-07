create database if not exists basedeprueba;

use basedeprueba;

create user if not exists dsw@'%' identified by 'dsw';
grant all on basedeprueba.* to dsw@'%';
grant all on basedeprueba.* to mauri@'%';

create table if not exists `basedeprueba`.`usuario` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NULL,
  `apellido` VARCHAR(255) NULL,
  PRIMARY KEY (`id`));

insert into basedeprueba.usuario values(1,'Anakin','Skywalker');
