# ShipNow API V1

Backend de ShipNow desarrollado con Node.js, Express, MongoDB y Mongoose.

Esta versión corresponde a la **Pre-entrega 1**, cuyo objetivo es refactorizar la aplicación aplicando una arquitectura por capas, separación de responsabilidades, configuración centralizada, manejo de errores e inyección de dependencias.

## Tecnologías

- Node.js
- Express
- MongoDB
- Mongoose
- dotenv
- ECMAScript Modules (ESM)

## Arquitectura

La aplicación utiliza una arquitectura por capas con el siguiente flujo:

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

### Routes

Definen los endpoints de la API y delegan las operaciones a los controllers.

Los routers reciben los controllers mediante inyección de dependencias.

### Controllers

Gestionan las solicitudes HTTP y las respuestas.

No contienen lógica de acceso a la base de datos ni utilizan Mongoose directamente.

### Services

Contienen la lógica de negocio de la aplicación y utilizan los repositories para acceder a los datos.

### Repositories

Abstraen el acceso a MongoDB y trabajan con los modelos de Mongoose.

### Models

Definen los schemas y modelos utilizados para persistir información en MongoDB.

### Config

Centraliza la configuración de la aplicación y la conexión con MongoDB.

Las variables de entorno son gestionadas desde esta capa.

### Constants

Centraliza los valores constantes utilizados por la aplicación, como roles de usuarios y estados de órdenes.

### Middlewares

Contiene el middleware centralizado para el manejo de errores.

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
    │   ├── orders.controller.js
    │   └── users.controller.js
    │
    ├── middlewares
    │   └── error.middleware.js
    │
    ├── models
    │   ├── order.model.js
    │   └── user.model.js
    │
    ├── repositories
    │   ├── orders.repository.js
    │   └── users.repository.js
    │
    ├── routes
    │   ├── orders.router.js
    │   └── users.router.js
    │
    ├── services
    │   ├── orders.service.js
    │   └── users.service.js
    │
    └── utils
```

## Inyección de dependencias

Las dependencias de cada capa se construyen en `app.js`.

Ejemplo:

```js
const userRepository = new UserRepository(UserModel);
const orderRepository = new OrderRepository(OrderModel);

const userService = new UserService(userRepository);
const orderService = new OrderService(orderRepository);

const userController = new UserController(userService);
const orderController = new OrderController(orderService);

app.use("/api/users", createUsersRouter(userController));
app.use("/api/orders", createOrdersRouter(orderController));
```

De esta manera, cada capa recibe la dependencia que necesita sin crear directamente sus dependencias internas.

## Configuración

Crear el archivo `.env` a partir del archivo `.env.example`:

```bash
cp .env.example .env
```

Completar las variables de entorno requeridas.

El archivo `.env` no debe ser subido al repositorio.

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/molinadiego/Backend_3.git
```

Ingresar al proyecto:

```bash
cd Backend_3/pre_entrega1
```

Instalar las dependencias:

```bash
npm install
```

Crear el archivo `.env`:

```bash
cp .env.example .env
```

## Ejecución

Para iniciar el servidor en modo desarrollo:

```bash
npm run dev
```

La aplicación utiliza el puerto configurado en las variables de entorno.

## Endpoints

### Usuarios

```text
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
```

### Órdenes

```text
GET    /api/orders
GET    /api/orders/:id
POST   /api/orders
PUT    /api/orders/:id
DELETE /api/orders/:id
```

## Órdenes

Las órdenes contienen una referencia al usuario que las creó mediante `userId`.

El modelo de orden contempla:

```text
userId
deliveryAddress
total
status
isActive
createdAt
updatedAt
```

Los estados disponibles para una orden son:

```text
created
assigned
picked_up
in_transit
delivered
cancelled
```

Las órdenes utilizan `isActive` para permitir la eliminación lógica mediante soft delete.

## Formato de respuesta

Las respuestas exitosas utilizan el siguiente formato:

```json
{
    "status": "success",
    "payload": {}
}
```

## Manejo de errores

La aplicación utiliza un middleware centralizado ubicado en:

```text
src/middlewares/error.middleware.js
```

Los errores generados durante la ejecución son propagados desde las distintas capas hasta el middleware encargado de generar la respuesta HTTP correspondiente.

## Objetivos de la Pre-entrega 1

- Implementar una arquitectura por capas.
- Separar responsabilidades entre Routes, Controllers, Services y Repositories.
- Aplicar el patrón Repository.
- Implementar inyección de dependencias.
- Centralizar la configuración de la aplicación.
- Gestionar las variables de entorno mediante configuración centralizada.
- Centralizar constantes de la aplicación.
- Implementar manejo de errores mediante middleware.
- Abstraer el acceso a MongoDB.
- Mejorar la organización, mantenibilidad y escalabilidad del proyecto.
