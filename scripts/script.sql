-- Script para la base de datos chatcartel DB--
-- Creado por: Sebastian Solares --
-- Fecha de creacion: 28/11/2024 --

-- Creamos tabla de roles --
CREATE TABLE Roles (
  id_role INT AUTO_INCREMENT,  -- Asignamos AUTO_INCREMENT para que se incremente automáticamente el id --
  role_name VARCHAR(50) NOT NULL,  -- Definimos el role_name como no nulo --
  PRIMARY KEY (id_role)  -- Definimos la clave primaria --
);

-- Crear la tabla `Users` --
CREATE TABLE Users (
  id_user INT AUTO_INCREMENT,  -- AUTO_INCREMENT para incrementar automáticamente --
  name VARCHAR(50) NOT NULL,  -- name no puede ser nulo --
  password VARCHAR(100) NOT NULL,  -- password no puede ser nulo --
  username VARCHAR(50) NOT NULL,  -- username no puede ser nulo --
  id_role INT,  -- Definimos id_role como tipo entero --
  PRIMARY KEY (id_user),  -- Definimos la clave primaria --
  FOREIGN KEY (id_role) REFERENCES Roles(id_role)  -- Agregamos la clave foránea para relacionar Users con Roles --
);

-- Crear la tabla para los proyectos --
CREATE TABLE Projects (
  id_project INT AUTO_INCREMENT,  -- AUTO_INCREMENT para incrementar automáticamente --
  name_project VARCHAR(100) NOT NULL,  -- `name_project` no puede ser nulo --
  created_time DATETIME NOT NULL,  -- `created_time` no puede ser nulo --
  id_user INT,  -- Definimos `id_user` como tipo entero --
  PRIMARY KEY (id_project),  -- Definimos la clave primaria --
  FOREIGN KEY (id_user) REFERENCES Users(id_user)  -- Agregamos la clave foránea para relacionar Projects con Users --
);

-- Crear la tabla `Tasks` --
CREATE TABLE Tasks (
  id_task INT AUTO_INCREMENT,  -- AUTO_INCREMENT para incrementar automáticamente --
  task_name VARCHAR(100) NOT NULL,  -- `task_name` no puede ser nulo --
  status ENUM('pending', 'in progress', 'completed') NOT NULL,  -- `status` es un ENUM --
  id_user INT,  -- Definimos `id_user` como tipo entero --
  id_project INT,  -- Relacionamos la tarea con un proyecto --
  due_date DATE,  -- Fecha límite de la tarea --
  PRIMARY KEY (id_task),  -- Definimos la clave primaria --
  FOREIGN KEY (id_user) REFERENCES Users(id_user),  -- Agregamos la clave foránea para relacionar Tasks con Users --
  FOREIGN KEY (id_project) REFERENCES Projects(id_project)  -- Agregamos la clave foránea para relacionar Tasks con Projects --
);


-- Insertamos roles --
INSERT INTO Roles (id_role, role_name) VALUES (1, 'admin');
INSERT INTO Roles (id_role, role_name) VALUES (2, 'user');

-- Insertamos usuarios --
INSERT INTO Users (id_user, name, password, username, id_role) VALUES (1, 'admin', 'admin', 'admin', 1);

-- Insertamos proyectos --
INSERT INTO projects (id_project, name_project, created_time, id_user) VALUES (1, 'Proyecto 1', '2024-11-28 00:00:00', 1);

-- Insertamos tareas --
INSERT INTO tasks (id_task, task_name, status, id_user, id_project, due_date) VALUES (1, 'Tarea 1', 'pending', 1, 1, '2024-11-30');
INSERT INTO tasks (id_task, task_name, status, id_user, id_project, due_date) VALUES (2, 'Tarea 2', 'in progress', 1, 1, '2024-12-05');


-- Consultas de prueba --
SELECT * FROM roles;
SELECT * FROM users;
SELECT * FROM projects;
SELECT * FROM tasks;
