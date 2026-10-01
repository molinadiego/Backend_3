# ShipNow — Backend

## Mocking y carga de datos de prueba

ShipNow es una API backend desarrollada con Node.js, Express y MongoDB.

Esta versión incorpora un sistema de mocking y carga controlada de datos de prueba para usuarios, repartidores, órdenes y entregas.

La implementación mantiene una arquitectura por capas y utiliza inyección de dependencias para separar la lógica de negocio del acceso a datos.

---

## Tecnologías

- Node.js
- Express
- MongoDB
- Mongoose
- Faker
- bcrypt
- dotenv
- JavaScript ES Modules

---

## Arquitectura

La aplicación utiliza la siguiente separación de responsabilidades:

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

El módulo de mocking utiliza:

```text
/api/mocks
    ↓
MocksRouter
    ↓
MocksController
    ↓
MocksService
    ↓
Generators / Repositories
    ↓
MongoDB
```

La inyección de dependencias permite conectar los repositories con sus modelos y los services con sus repositories desde `app.js`.

---

## Estructura

```text
Backend_3/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── database.js
│   │   └── env.config.js
│   ├── constants/
│   │   └── index.js
│   ├── controllers/
│   │   ├── mocks.controller.js
│   │   ├── orders.controller.js
│   │   ├── products.controller.js
│   │   └── users.controller.js
│   ├── middlewares/
│   │   └── error.middleware.js
│   ├── mocks/
│   │   └── generators.js
│   ├── models/
│   │   ├── delivery.model.js
│   │   ├── order.model.js
│   │   ├── product.model.js
│   │   └── user.model.js
│   ├── repositories/
│   │   ├── deliveries.repository.js
│   │   ├── orders.repository.js
│   │   ├── products.repository.js
│   │   └── users.repository.js
│   ├── routes/
│   │   ├── mocks.router.js
│   │   ├── orders.router.js
│   │   ├── products.router.js
│   │   └── users.router.js
│   └── services/
│       ├── mocks.service.js
│       ├── orders.service.js
│       ├── products.service.js
│       └── users.service.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Sistema de Mocking

La generación de datos se encuentra separada de la lógica de negocio.

El archivo:

```text
src/mocks/generators.js
```

utiliza Faker para generar datos simulados y bcrypt para generar contraseñas hasheadas.

Los generators utilizan las constantes definidas en:

```text
src/constants/index.js
```

para roles, estados y prioridades.

Las cantidades solicitadas para los endpoints de mocking están limitadas a un máximo de 50 registros para evitar cargas excesivas.

---

## Usuarios simulados

Los usuarios generados contienen:

- `name`
- `email`
- `password`
- `role`
- `isActive`

Los roles disponibles se encuentran definidos en `USER_ROLES`.

Las contraseñas son generadas como hashes mediante bcrypt.

---

## Repartidores simulados

Los repartidores son usuarios generados con el rol:

```text
driver
```

El rol se obtiene de `USER_ROLES`.

Los repartidores pueden utilizarse posteriormente para establecer relaciones con las entregas.

---

## Órdenes simuladas

Las órdenes generadas contienen:

- `userId`
- `deliveryAddress`
- `total`
- `status`
- `priority`
- `isActive`

Los valores de `status` utilizan `ORDER_STATUS`.

Los valores de `priority` utilizan `DELIVERY_PRIORITY`.

Las órdenes mantienen una relación con un usuario mediante:

```text
Order.userId → User._id
```

---

## Entregas simuladas

Las entregas generadas contienen:

- `order`
- `deliveryPerson`
- `address`
- `status`
- `estimatedDeliveryDate`

Las entregas mantienen las siguientes relaciones:

```text
Delivery.order → Order._id
Delivery.deliveryPerson → User._id
```

El usuario relacionado con `deliveryPerson` posee el rol `driver`.

---

## Endpoints de Mocking

Todos los endpoints de mocking se encuentran bajo:

```text
/api/mocks
```

### Generar usuarios

```http
GET /api/mocks/users?qty=2
```

Genera usuarios simulados sin almacenarlos en MongoDB.

---

### Generar repartidores

```http
GET /api/mocks/delivery-persons?qty=2
```

Genera usuarios con el rol `driver` sin almacenarlos en MongoDB.

---

### Generar órdenes

```http
GET /api/mocks/orders?qty=2
```

Genera órdenes simuladas y establece un `userId` para cada una.

Los usuarios utilizados para generar las relaciones son creados en memoria y no se almacenan.

---

### Generar entregas

```http
GET /api/mocks/deliveries?qty=2
```

Genera entregas simuladas relacionadas con órdenes y repartidores.

Las relaciones se generan utilizando ObjectId válidos.

---

## Carga de datos de prueba

El endpoint:

```http
POST /api/mocks/seed
```

permite generar e insertar datos controlados en MongoDB.

Ejemplo:

```http
POST /api/mocks/seed?users=5&deliveryPersons=3&orders=10&deliveries=5
```

El resultado informa la cantidad de registros insertados:

```json
{
    "status": "success",
    "payload": {
        "usersInserted": 5,
        "deliveryPersonsInserted": 3,
        "ordersInserted": 10,
        "deliveriesInserted": 5
    }
}
```

Las cantidades pueden configurarse mediante:

- `users`
- `deliveryPersons`
- `orders`
- `deliveries`

Cada cantidad tiene un límite máximo de 50 registros.

---

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto.

Ejemplo:

```env
PORT=8080
MONGODB_URI=mongodb://your-mongodb-url
JWT_SECRET=your-jwt-secret
NODE_ENV=development
```

Las variables requeridas son:

- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `NODE_ENV`

El archivo `.env` no debe subirse al repositorio.

Se incluye un archivo `.env.example` como referencia.

---

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/molinadiego/Backend_3.git
```

Ingresar al proyecto:

```bash
cd Backend_3
```

Instalar dependencias:

```bash
npm install
```

Configurar las variables de entorno:

```text
.env
```

Iniciar el servidor:

```bash
npm run dev
```

El servidor se ejecutará en el puerto configurado en `PORT`.

---

## Pruebas rápidas

Una vez iniciado el servidor se pueden probar los endpoints mediante `curl`.

Generar usuarios:

```bash
curl "http://localhost:8080/api/mocks/users?qty=2"
```

Generar repartidores:

```bash
curl "http://localhost:8080/api/mocks/delivery-persons?qty=2"
```

Generar órdenes:

```bash
curl "http://localhost:8080/api/mocks/orders?qty=2"
```

Generar entregas:

```bash
curl "http://localhost:8080/api/mocks/deliveries?qty=2"
```

Ejecutar seed:

```bash
curl -X POST "http://localhost:8080/api/mocks/seed?users=2&deliveryPersons=2&orders=3&deliveries=2"
```

---

## Relaciones entre entidades

El sistema mantiene las siguientes relaciones:

```text
User
  │
  └── Order.userId
          │
          └── Delivery.order

User (role: driver)
  │
  └── Delivery.deliveryPerson
```

Los identificadores utilizados para las relaciones corresponden a `ObjectId` de MongoDB.

---

## Control de cantidades

Para evitar cargas excesivas durante la generación de datos, las cantidades solicitadas se validan antes de ejecutar los generators.

El límite máximo establecido es:

```text
50 registros
```

Las cantidades inválidas son rechazadas antes de iniciar la generación.

---

## Inyección de dependencias

Las dependencias principales se instancian desde `src/app.js`.

Los repositories reciben sus respectivos modelos:

```text
Repository → Model
```

Los services reciben sus repositories:

```text
Service → Repository
```

Los controllers reciben sus services:

```text
Controller → Service
```

Esto permite mantener separadas las responsabilidades y facilita reemplazar implementaciones durante las pruebas.

---

## Estado del proyecto

Esta versión corresponde al desarrollo de la funcionalidad de mocking y carga de datos de prueba de ShipNow.

El proyecto continúa evolucionando sobre una única estructura y utiliza Git para conservar el historial de las diferentes etapas del desarrollo.
