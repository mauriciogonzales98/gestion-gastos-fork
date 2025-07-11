Para crear la base de datos de User, con lo nombres en inglés
y los campos tal como aparecen en la  API:

###########################################

create database if not exists gestion_gastos;

use gestion_gastos;

create user if not exists dsw@'%' identified by 'dsw';
grant all on gestion_gastos.* to dsw@'%';

create table if not exists gestion_gastos.User (
  userId INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NULL,
  surname VARCHAR(255) NULL,
  email VARCHAR(255) NULL,
  password VARCHAR(255) NULL,
  PRIMARY KEY (userId));

insert into gestion_gastos.User values(1,'Anakin','Skywalker','maytheforce@bewithyou.com','Iamyourfather1977');

##########################################
