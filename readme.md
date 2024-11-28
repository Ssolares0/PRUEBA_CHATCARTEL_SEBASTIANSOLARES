# Prueba Técnica Desarrollo Backend - Sebastian Solares

El objetivo de este proyecto es desarrollar una *API RESTful* utilizando *Node.js* y *TypeScript*. La API permitirá:

1. Crear, leer, eliminar y actualizar:
   - Usuarios.
   - Tareas.
   - proyectos
2. Asignar roles a los usuarios en diferentes proyectos.

Además, se utilizará una base de datos *MySQL* o *MongoDB* para almacenar los datos de forma relacional.

## Requisitos

### Servicios en la nube
- El proyecto se desplegará utilizando *Docker* para la creación de contenedores.
- Posteriormente, se implementará en la nube.

### Funcionalidades principales
1. *Gestión de usuarios*:
   - Crear un nuevo usuario.
   - Leer la información de un usuario.
   - Actualizar los datos de un usuario.
   - Eliminar un usuario.

2. *Gestión de tareas*:
   - Crear tareas.
   - Leer tareas existentes.
   - Actualizar tareas.
   
3. *Gestión de roles y proyectos*:
   - Asignar roles a los usuarios en diferentes proyectos.
  
## Herramientas utilizadas

- lucidchart para la realizacion del modelo logico
- data modeler para realizar los modelos fisicos y logicos
- mysql, mongodb como base de datos
- Docker para cargar la imagen de la base de datos

  

### Analisis de Diseño base de datos

## Relaciones

*****Usuarios*****
-- Un usuario tiene  un rol(id_role: este apunta a la tabla roles)

*****Usuarios y proyectos*****

-- Un usuario puede tener muchos proyectos (id_user en projects apunta a la tabla users).


*****proyectos y tareas*****

-- Un proyecto puede tener muchas tareas (id_project en tasks apunta a la tabla projects).

## Modelo Logico
![logic.jpeg](/images/logic.jpeg)

## Tablas
```sql
CREATE TABLE `Users` (
  `id_user` int(primary key),
  `name` varchar(50),
  `password` varchar(100),
  `username` varchar(50) ,
  `id_role` int
);
```
```sql
CREATE TABLE `Roles` (
  `Id_role` int,
  `role_name` varchar(50) (admin or user)
);
```
```sql
CREATE TABLE `Tasks` (
  `id_task` int,
  `task_name` varchar(100),
  `status` ENUM('pending','in progress','completed'),
  `id_user` int,
  `due_date` date
);
```
```sql
CREATE TABLE `Projects` (
  `id_project` int,
  `name_project` varchar(100),
  `created_time` datetime,
  `id_user` int
);
```