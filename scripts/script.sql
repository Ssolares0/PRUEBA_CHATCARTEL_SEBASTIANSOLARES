-- Script para la base de datos chatcartel DB
-- Creado por: Sebastian Solares
-- Fecha de creacion: 28/11/2024

--creamos tablas de roles
CREATE TABLE Roles (
  id_role INT AUTO_INCREMENT,  -- Asignamos AUTO_INCREMENT para que se incremente automáticamente el id
  role_name VARCHAR(50) NOT NULL,  -- definimos el role name como no nulo
 
);
ALTER TABLE Roles ADD CONSTRAINT Roles_pk PRIMARY KEY ( id_role);

-- Crear la tabla `Users`
CREATE TABLE Users (
  id_user INT AUTO_INCREMENT,  -- AUTO_INCREMENT para incrementar automáticamente
  name VARCHAR(50) NOT NULL,  -- name no puede ser nulo
  password VARCHAR(100) NOT NULL,  -- password no puede ser nulo
  username VARCHAR(50) NOT NULL,  -- username no puede ser nulo
  id_role INT,  -- Definimos id_role como tipo entero
  
);
ALTER TABLE Users ADD CONSTRAINT Users_pk PRIMARY KEY ( id_user );


-- Crear la tabla para los proyectos
CREATE TABLE Projects (
  id_project INT AUTO_INCREMENT,  -- AUTO_INCREMENT para incrementar automáticamente
  name_project VARCHAR(100) NOT NULL,  -- `name_project` no puede ser nulo
  created_time DATETIME NOT NULL,  -- `created_time` no puede ser nulo
  id_user INT,  -- Definimos `id_user` como tipo entero
  
);
ALTER TABLE Projects ADD CONSTRAINT Projects_pk PRIMARY KEY ( id_project );

-- Crear la tabla `Tasks`
CREATE TABLE Tasks (
  id_task INT AUTO_INCREMENT,  -- AUTO_INCREMENT para incrementar automáticamente
  task_name VARCHAR(100) NOT NULL,  -- `task_name` no puede ser nulo
  status ENUM('pending', 'in progress', 'completed') NOT NULL,  -- `status` es un ENUM
  id_user INT,  -- Definimos `id_user` como tipo entero
  id_project INT,  -- Relacionamos la tarea con un proyecto
  due_date DATE,  -- Fecha límite de la tarea
  
);
ALTER TABLE Tasks ADD CONSTRAINT Tasks PRIMARY KEY ( id_task );