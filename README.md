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

Lo
