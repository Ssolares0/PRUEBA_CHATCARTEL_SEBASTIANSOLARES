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

### Como usar la API RESTful
Debes utilizar postman como herramienta para consumir APIS o puedes utilizar la que desees.

## Usuario admin
Solo existe un administrador de la aplicacion y cuenta con la siguiente informacion, el id del admin empieza con 1 y el resto
de usuarios incrementa de uno en uno.
```json
{
    "name":"admin",
    "username":"admin",
    "password":"admin"

}
```

## Creacion de usuario
para crear un usuario debes ingresar la URL POST /users para crear un usuario con el siguiente cuerpo en formato JSON.

(EL ID EMPIEZA A CONTAR DESDE EL 2, YA QUE EL 1 ES RESERVADO PARA EL ADMIN)

ejemplo:
```json
{
    "name":"Juan Valencia",
    "username":"juan00",
    "password":"juanito2020"

}
```


## Login
para logearte debes usar la URL POST /auth/login para autenticarte, con el siguiente ejemplo del cuerpo del mensaje


```json
{

    "username":"juan00",
    "password":"juanito2020"

}
```

Si el usuario o la contrasena no coincide con los usuarios registrados, marcara un error.


## Obtener Informacion del usuario
Se puede obtener informacion de un usuario solo si este esta logeado y coincide con el id del parametro GET /users/:id

ejemplo 1:
GET /users/2

Respuesta:
```json
{

    {
        "id_user": 2,
        "name": "Juan Valencia",
        "password": "$2a$10$pvbwvs93jkZuCcaJHplgquzH4O0BH.5XyTw3XD5NXjLcfqVwQKQMW",
        "username": "juanito00",
        "id_role": 2 // rol usuario normal
    }

}
```

ejemplo 2:
GET /users/1

Respuesta:
```json
{

    {
        "id_user": 1,
        "name": "admin",
        "password": "$2a$10$pvbwvs93jkZuCcaJHplgquzH4O0BH.5XyTw3XD5NXjLcfqVwQKQMW",
        "username": "admin",
        "id_role": 1 // rol usuario administrador
    }

}
```
## Actualizar la informacion de un usuario
Se puede actualizar la informacion de un usuario solo si este esta logeado y coincide con el id del parametro PUT /users/:id y solo actualizara el de el mismo. Se debe enviar un body con estos campos a actualizar.

```json
{

    "name":"Juan Andres Valencia España",
    "username":"juanNuevo"

}
```

## Eliminar un usuario(solo administradores)
se puede eliminar un usuario solo si esta logeado como admin DELETE /users/:id

ejemplo:

DELETE /users/2 (este eliminara al usuario con id:2)



## Creacion de un proyecto
para crear un usuario debes ingresar la URL POST /projects para crear un proyecto con el siguiente cuerpo en formato JSON.

solo el administrador puede crear proyectos.

ejemplo:
```json
{
   
    "name_project":"Desarollo sofware pc",
    "id_user":7

}
```

## creacion de una tarea para un proyecto en especifico
para crar una tarea de un proyecto el administrador debe crearla obteniendo el id del proyecto en parametros
POST /projects/:projectId/tasks. Debes estar logeado como admin para poder asignar la tarea.

```json
{
  "task_name": "hacer login2",
  "status": "pending",
  "id_user": 7,
  "due_date": "2024-12-25"
}
```

# Deploy de la API web

----


# Almacenamiento de Logs y Gestión de Bases de Datos: MongoDB y MySQL

## MongoDB:
Para la gestión y almacenamiento de logs, se optó por utilizar **MongoDB Atlas**, una plataforma completamente administrada que permite desplegar bases de datos MongoDB en la nube. Esta solución ofrece escalabilidad automática, alta disponibilidad y copias de seguridad integradas,lo que esto nos facilita la integracion de logs.

## MySQL:
En cuanto a la base de datos relacional utilizada para la aplicación, se implementó **MySQL** en **Google Cloud**. A través de los servicios de bases de datos gestionadas de Google Cloud, se crearon las instancias necesarias para proporcionar una infraestructura confiable, segura y de alto rendimiento. Google Cloud nos ofrece opciones avanzadas de administración, optimización de costos y escalabilidad, lo que garantiza que la base de datos MySQL pueda crecer y adaptarse a las necesidades de la aplicación de manera eficiente.
