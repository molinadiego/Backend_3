# ShipNow — Pre-entrega Módulo 2

## Mocking y carga de datos de prueba

Esta entrega incorpora un sistema de mocking y carga controlada de datos de prueba para la API de ShipNow.

El objetivo es poder generar usuarios y órdenes simuladas sin tener que cargar manualmente los datos y, mediante un endpoint de seed, insertar datos de prueba en MongoDB.

La implementación mantiene la arquitectura por capas utilizada en la Pre-entrega 1.

---

## Tecnologías

* Node.js
* Express
* MongoDB
* Mongoose
* Faker
* bcrypt
* dotenv
* JavaScript ES Modules

---

## Arquitectura

La aplicación mantiene la separación de responsabilidades:

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

El sistema de mocking agrega la siguiente estructura:

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

La inyección de dependencias se utiliza para conectar los repositories con los modelos y los services con los repositories.

---

## Estructura

```text
pre_entrega2/
├── src/
│   ├── app.js
│   ├── constants/
│   │   └── constants.js
│   ├── controllers/
│   │   └── mocks.controller.js
│   ├── middlewares/
│   │   └── error.middleware.js
│   ├── mocks/
│   │   └── generators.js
│   ├── models/
│   │   ├── order.model.js
│   │   └── user.model.js
│   ├── repositories/
│   │   ├── orders.repository.js
│   │   └── users.repository.js
│   ├── routes/
│   │   └── mocks.router.js
│   └── services/
│       └── mocks.service.js
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Sistema de Mocking

La generación de datos se encuentra separada de la lógica de negocio.

### Generators

El archivo:

```text
src/mocks/generators.js
```

utiliza Faker para generar datos simulados.

También utiliza bcrypt para generar contraseñas hasheadas.

Los datos generados respetan los modelos de la aplicación y utilizan las constantes definidas en:

```text
src/constants/constants.js
```

Esto evita utilizar directamente strings para roles, estados o prioridades.

---

## Usuarios simulados

Los usuarios generados contienen:

* `name`
* `email`
* `password`
* `role`
* `isActive`

Los roles utilizados provienen de `USER_ROLES`.

Ejemplo:

```json
{
  "name": "Abbigail Rippin",
  "email": "lesly.smitham4@yahoo.com",
  "password": "$2b$10$...",
  "role": "customer",
  "isActive": true
}
```

Las contraseñas no se generan en texto plano: se almacenan como hashes mediante bcrypt cuando los datos son persistidos.

---

## Órdenes simuladas

Las órdenes generadas contienen:

* `userId`
* `deliveryAddress`
* `total`
* `status`
* `priority`
* `isActive`

Los valores de `status` utilizan `ORDER_STATUS`.

Los valores de `priority` utilizan `DELIVERY_PRIORITY`.

Las órdenes generadas mantienen una relación con un usuario mediante:

```text
Order.userId → User._id
```

---

# Endpoints

## Generar usuarios

```http
GET /api/mocks/users?qty=2
```

Genera la cantidad indicada de usuarios simulados.

Los datos se devuelven en la respuesta pero **no se guardan en MongoDB**.

Ejemplo:

```json
{
  "status": "success",
  "payload": [
    {
      "name": "Abbigail Rippin",
      "email": "lesly.smitham4@yahoo.com",
      "password": "$2b$10$...",
      "role": "customer",
      "isActive": true
    }
  ]
}
```

---

## Generar órdenes

```http
GET /api/mocks/orders?qty=2
```

Genera órdenes simuladas junto con usuarios simulados en memoria para mantener la relación entre ambos.

Los datos **no se guardan en MongoDB**.

Ejemplo:

```json
{
  "status": "success",
  "payload": [
    {
      "userId": "6ab7166f909c1dc2ed78488c",
      "deliveryAddress": "71323 Lansdowne Road",
      "total": 287.28,
      "status": "assigned",
      "priority": "high",
      "isActive": true
    }
  ]
}
```

---

## Seed

```http
POST /api/mocks/seed?users=5&orders=10
```

Genera y guarda datos de prueba en MongoDB.

El proceso es:

```text
Generar usuarios
      ↓
Guardar usuarios
      ↓
Obtener sus _id
      ↓
Generar órdenes relacionadas
      ↓
Guardar órdenes
```

Ejemplo de respuesta:

```json
{
  "status": "success",
  "payload": {
    "usersInserted": 5,
    "ordersInserted": 10
  }
}
```

A diferencia de los endpoints de generación, el endpoint `seed` sí persiste los datos en MongoDB.

---

# Instalación

Clonar el repositorio:

```bash
git clone https://github.com/molinadiego/Backend_3.git
```

Ingresar a la carpeta de la entrega:

```bash
cd Backend_3/pre_entrega2
```

Instalar dependencias:

```bash
npm install
```

Crear el archivo `.env` a partir de `.env.example`:

```bash
cp .env.example .env
```

Completar las variables de entorno necesarias para la conexión con MongoDB.

---

# Ejecución

Modo desarrollo:

```bash
npm run dev
```

La API se ejecuta en el puerto configurado en las variables de entorno.

---

# Pruebas realizadas

Se verificaron los siguientes endpoints:

```text
GET /api/mocks/users?qty=2
```

Resultado: generación correcta de usuarios sin persistencia.

```text
GET /api/mocks/orders?qty=2
```

Resultado: generación correcta de órdenes con `userId` válido y sin persistencia.

```text
POST /api/mocks/seed?users=5&orders=10
```

Resultado:

```json
{
  "usersInserted": 5,
  "ordersInserted": 10
}
```

Esto confirma la generación y persistencia controlada de usuarios y órdenes.

---

# Objetivo de la entrega

La implementación permite disponer de datos simulados para realizar pruebas sobre la API sin necesidad de cargar manualmente cada registro.

La lógica de generación, la lógica de negocio, el acceso a datos y la exposición de los endpoints permanecen separados siguiendo la arquitectura por capas.
