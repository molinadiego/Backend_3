# ShipNow API V1

Backend de ShipNow desarrollado con Node.js, Express y MongoDB.

Esta versión corresponde a la **Pre-entrega 1**, cuyo objetivo es refactorizar la aplicación aplicando una arquitectura por capas, separación de responsabilidades, configuración centralizada, manejo de errores e inyección de dependencias.

## Tecnologías

- Node.js
- Express
- MongoDB
- Mongoose
- dotenv

## Arquitectura

El proyecto utiliza una arquitectura basada en capas:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Model
  ↓
MongoDB
```

Cada capa tiene una responsabilidad específica.

### Routes

Define los endpoints de la API y delega las solicitudes a los controllers.

Los routers reciben sus controllers mediante inyección de dependencias.

### Controllers

Gestionan las solicitudes HTTP y delegan la lógica de negocio a los services correspondientes.

### Services

Contienen la lógica de negocio de la aplicación.

Los services utilizan repositories para acceder a los datos.

### Repositories

Abstraen el acceso a la base de datos y se encargan de trabajar con los modelos de Mongoose.

### Models

Definen los esquemas y modelos utilizados para almacenar información en MongoDB.

### Config

Centraliza la configuración de la aplicación y la conexión con MongoDB.

Las variables de entorno se gestionan desde esta capa.

### Constants

Contiene las constantes utilizadas por la aplicación para evitar valores repetidos directamente en el código.

### Middlewares

Contiene el middleware encargado del manejo centralizado de errores.

### Utils

Carpeta destinada a utilidades auxiliares de la aplicación.

## Estructura del proyecto

```text
.
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
│
└── src
    ├── app.js
    ├── server.js
    │
    ├── config
    │   ├── config.js
    │   └── database.js
    │
    ├── constants
    │   └── constants.js
    │
    ├── controllers
    │   ├── products.controller.js
    │   └── users.controller.js
    │
    ├── middlewares
    │   └── error.middleware.js
    │
    ├── models
    │   ├── product.model.js
    │   └── user.model.js
    │
    ├── repositories
    │   ├── products.repository.js
    │   └── users.repository.js
    │
    ├── routes
    │   ├── products.router.js
    │   └── users.router.js
    │
    ├── services
    │   ├── products.service.js
    │   └── users.service.js
    │
    └── utils
```

## Inyección de dependencias

La aplicación utiliza inyección de dependencias para conectar las diferentes capas.

Las dependencias se construyen en `app.js` y se inyectan en la siguiente secuencia:

```text
Repository
    ↓
Service
    ↓
Controller
    ↓
Router
```

Por ejemplo, para Users:

```javascript
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

app.use("/api/users", createUsersRouter(userController));
```

De esta manera, cada componente recibe la dependencia que necesita en lugar de crearla internamente.

Esto permite mantener las capas desacopladas y facilita el mantenimiento y las pruebas de la aplicación.

## Configuración

La aplicación utiliza variables de entorno para configurar el servidor y la conexión con MongoDB.

Crear un archivo `.env` a partir del archivo `.env.example`:

```bash
cp .env.example .env
```

Luego completar las variables requeridas.

El archivo `.env` no debe subirse al repositorio, ya que puede contener información sensible.

## Instalación

Clonar el repositorio:

```bash
git clone <repository-url>
```

Ingresar al directorio del proyecto:

```bash
cd <project-folder>
```

Instalar las dependencias:

```bash
npm install
```

Crear el archivo de variables de entorno:

```bash
cp .env.example .env
```

Configurar las variables correspondientes.

## Ejecución

Para iniciar el servidor en modo desarrollo:

```bash
npm run dev
```

La aplicación se ejecutará utilizando el puerto definido en las variables de entorno.

Con la configuración actual:

```text
http://localhost:8080
```

Al iniciar correctamente, la aplicación establece la conexión con MongoDB y luego inicia el servidor HTTP.

## API

### Users

| Método | Endpoint         | Descripción                |
| ------ | ---------------- | -------------------------- |
| GET    | `/api/users`     | Obtener todos los usuarios |
| GET    | `/api/users/:id` | Obtener un usuario por ID  |
| POST   | `/api/users`     | Crear un usuario           |
| PUT    | `/api/users/:id` | Actualizar un usuario      |
| DELETE | `/api/users/:id` | Eliminar un usuario        |

### Products

| Método | Endpoint            | Descripción                 |
| ------ | ------------------- | --------------------------- |
| GET    | `/api/products`     | Obtener todos los productos |
| GET    | `/api/products/:id` | Obtener un producto por ID  |
| POST   | `/api/products`     | Crear un producto           |
| PUT    | `/api/products/:id` | Actualizar un producto      |
| DELETE | `/api/products/:id` | Eliminar un producto        |

## Formato de respuesta

Las respuestas exitosas de la API utilizan una estructura uniforme:

```json
{
    "status": "success",
    "payload": {}
}
```

## Manejo de errores

La aplicación cuenta con un middleware centralizado para el manejo de errores:

```text
src/middlewares/error.middleware.js
```

El middleware recibe los errores propagados durante el procesamiento de las solicitudes y genera la respuesta correspondiente.

## Objetivos de la Pre-entrega 1

Esta entrega busca aplicar los siguientes conceptos:

- Arquitectura por capas.
- Separación de responsabilidades.
- Patrón Repository.
- Inyección de dependencias.
- Configuración centralizada.
- Uso de variables de entorno.
- Constantes centralizadas.
- Manejo centralizado de errores.
- Separación entre routes, controllers, services y repositories.
- Abstracción del acceso a MongoDB.
- Preparación de la aplicación para facilitar su mantenimiento y futuras extensiones.
