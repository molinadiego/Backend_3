# 🚚 ShipNow — Backend

API backend para la gestión de usuarios, productos, órdenes y entregas, desarrollada con **Node.js, Express y MongoDB**.

El proyecto utiliza una arquitectura por capas, inyección de dependencias, generación de datos de prueba mediante mocking, un sistema centralizado de manejo profesional de errores y logging mediante **Winston**.

---

## 📋 Contenido

- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Mocking](#-mocking)
- [Endpoints de Mocking](#-endpoints-de-mocking)
- [Carga de datos de prueba](#-carga-de-datos-de-prueba)
- [Manejo profesional de errores](#-manejo-profesional-de-errores)
- [Respuestas de error](#-respuestas-de-error)
- [Validación de cantidades](#-validación-de-cantidades)
- [Relaciones entre entidades](#-relaciones-entre-entidades)
- [Inyección de dependencias](#-inyección-de-dependencias)
- [Logging](#-logging)
- [Niveles de logging](#-niveles-de-logging)
- [Logging HTTP](#-logging-http)
- [Archivo de errores y rotación](#-archivo-de-errores-y-rotación)
- [Endpoint de prueba del logger](#-endpoint-de-prueba-del-logger)
- [Entornos de ejecución](#-entornos-de-ejecución)
- [Variables de entorno](#-variables-de-entorno)
- [Instalación](#-instalación)
- [Pruebas con cURL](#-pruebas-con-curl)
- [Estado del proyecto](#-estado-del-proyecto)

---

## 🛠 Tecnologías

- **Node.js**
- **Express**
- **MongoDB**
- **Mongoose**
- **Faker**
- **bcrypt**
- **dotenv**
- **Winston**
- **winston-daily-rotate-file**
- **JavaScript ES Modules**

---

## 🏗 Arquitectura

ShipNow utiliza una arquitectura por capas que separa las responsabilidades de cada componente:

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

Cada capa tiene una responsabilidad específica:

- **Routes:** definen los endpoints disponibles.
- **Controllers:** reciben las peticiones HTTP y delegan el trabajo.
- **Services:** contienen la lógica de negocio y las validaciones.
- **Repositories:** encapsulan el acceso a MongoDB.
- **Models:** definen los esquemas de Mongoose.
- **MongoDB:** almacena los datos persistentes.

### Arquitectura del módulo de Mocking

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

Los endpoints de generación utilizan los generators sin persistir datos.

El endpoint `seed`, en cambio, utiliza los repositories para insertar los datos generados en MongoDB.

### Arquitectura del logging HTTP

```text
HTTP Request
     ↓
httpMiddleware
     ↓
Route / Controller / Service
     ↓
HTTP Response
     ↓
logger.http()
```

El middleware registra cada petición cuando finaliza, incluyendo:

- Método HTTP.
- Ruta solicitada.
- Código de estado HTTP.

---

## 📁 Estructura del proyecto

```text
Backend_3/
├── src/
│   ├── app.js
│   ├── server.js
│   │
│   ├── config/
│   │   ├── database.js
│   │   └── env.config.js
│   │
│   ├── constants/
│   │   └── index.js
│   │
│   ├── controllers/
│   │   ├── logger.controller.js
│   │   ├── mocks.controller.js
│   │   ├── orders.controller.js
│   │   ├── products.controller.js
│   │   └── users.controller.js
│   │
│   ├── errors/
│   │   ├── app.error.js
│   │   ├── errors.codes.js
│   │   └── errors.dictionary.js
│   │
│   ├── middlewares/
│   │   ├── error.middleware.js
│   │   ├── http.middleware.js
│   │   └── notfound.middleware.js
│   │
│   ├── mocks/
│   │   └── generators.js
│   │
│   ├── models/
│   │   ├── delivery.model.js
│   │   ├── order.model.js
│   │   ├── product.model.js
│   │   └── user.model.js
│   │
│   ├── repositories/
│   │   ├── deliveries.repository.js
│   │   ├── orders.repository.js
│   │   ├── products.repository.js
│   │   └── users.repository.js
│   │
│   ├── routes/
│   │   ├── logger.router.js
│   │   ├── mocks.router.js
│   │   ├── orders.router.js
│   │   ├── products.router.js
│   │   └── users.router.js
│   │
│   ├── services/
│   │   ├── mocks.service.js
│   │   ├── orders.service.js
│   │   ├── products.service.js
│   │   └── users.service.js
│   │
│   └── utils/
│       └── logger.js
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

# 🧪 Mocking

El sistema de mocking permite generar datos ficticios para realizar pruebas sin necesidad de introducir manualmente registros en la base de datos.

La generación de datos se encuentra separada de la lógica de negocio en:

```text
src/mocks/generators.js
```

Los generators utilizan:

- **Faker** para generar datos ficticios.
- **bcrypt** para generar contraseñas hasheadas.
- **ObjectId** para establecer relaciones entre entidades.
- Las constantes definidas en `src/constants/index.js` para roles, estados y prioridades.

Las cantidades solicitadas están limitadas a un máximo de **50 registros** para evitar cargas excesivas durante las pruebas.

---

## 👤 Usuarios simulados

Los usuarios generados contienen:

```text
name
email
password
role
isActive
```

Los roles disponibles se encuentran definidos en:

```text
USER_ROLES
```

Cuando no se especifica un rol, el generator selecciona aleatoriamente entre:

```text
CUSTOMER
ADMIN
```

Las contraseñas son almacenadas como hashes utilizando `bcrypt`.

---

## 🛵 Repartidores simulados

Los repartidores son usuarios generados específicamente con el rol:

```text
driver
```

El rol se obtiene de:

```text
USER_ROLES.DRIVER
```

Estos usuarios pueden posteriormente relacionarse con entregas.

---

## 📦 Órdenes simuladas

Las órdenes generadas contienen:

```text
userId
deliveryAddress
total
status
priority
isActive
```

Los estados utilizan las constantes definidas en:

```text
ORDER_STATUS
```

Las prioridades utilizan:

```text
DELIVERY_PRIORITY
```

Cada orden mantiene una relación con un usuario:

```text
Order.userId → User._id
```

---

## 🚚 Entregas simuladas

Las entregas contienen:

```text
order
deliveryPerson
address
status
estimatedDeliveryDate
isActive
```

Las relaciones principales son:

```text
Delivery.order
      ↓
Order._id
```

y:

```text
Delivery.deliveryPerson
      ↓
User._id
```

El usuario relacionado con `deliveryPerson` posee el rol:

```text
driver
```

---

# 🔌 Endpoints de Mocking

Todos los endpoints de mocking se encuentran bajo:

```text
/api/mocks
```

## Generar usuarios

```http
GET /api/mocks/users?qty=2
```

Genera usuarios ficticios sin almacenarlos en MongoDB.

Ejemplo:

```bash
curl "http://localhost:8080/api/mocks/users?qty=2"
```

---

## Generar repartidores

```http
GET /api/mocks/delivery-persons?qty=2
```

Genera usuarios con el rol `driver` sin almacenarlos en MongoDB.

Ejemplo:

```bash
curl "http://localhost:8080/api/mocks/delivery-persons?qty=2"
```

---

## Generar órdenes

```http
GET /api/mocks/orders?qty=2
```

Genera órdenes ficticias relacionadas con usuarios generados en memoria.

Los datos generados no se almacenan en MongoDB.

Ejemplo:

```bash
curl "http://localhost:8080/api/mocks/orders?qty=2"
```

---

## Generar entregas

```http
GET /api/mocks/deliveries?qty=2
```

Genera entregas relacionadas con órdenes y repartidores.

Las relaciones utilizan identificadores válidos de MongoDB.

Ejemplo:

```bash
curl "http://localhost:8080/api/mocks/deliveries?qty=2"
```

---

# 🌱 Carga de datos de prueba

El endpoint:

```http
POST /api/mocks/seed
```

permite generar e insertar datos controlados directamente en MongoDB.

Los parámetros disponibles son:

| Parámetro         | Descripción                  | Valor por defecto |
| ----------------- | ---------------------------- | ----------------: |
| `users`           | Usuarios clientes a insertar |                 5 |
| `deliveryPersons` | Repartidores a insertar      |                 3 |
| `orders`          | Órdenes a insertar           |                10 |
| `deliveries`      | Entregas a insertar          |                 5 |

Cada cantidad admite valores entre `0` y `50`.

### Ejemplo

```bash
curl -X POST "http://localhost:8080/api/mocks/seed?users=2&deliveryPersons=1&orders=2&deliveries=1"
```

Respuesta:

```json
{
    "status": "success",
    "payload": {
        "usersInserted": 2,
        "deliveryPersonsInserted": 1,
        "ordersInserted": 2,
        "deliveriesInserted": 1
    }
}
```

---

# ⚠️ Manejo profesional de errores

ShipNow utiliza un sistema centralizado para manejar los errores de la aplicación.

Los errores se definen mediante tres componentes:

```text
errors.codes.js
        ↓
errors.dictionary.js
        ↓
AppError
        ↓
error.middleware.js
```

### Códigos de error

Los códigos se encuentran centralizados en:

```text
src/errors/errors.codes.js
```

Ejemplos:

```text
VALIDATION_ERROR
USER_NOT_FOUND
ORDER_NOT_FOUND
PRODUCT_NOT_FOUND
INVALID_MOCK_AMOUNT
ROUTE_NOT_FOUND
INTERNAL_SERVER_ERROR
```

### Diccionario de errores

El archivo:

```text
src/errors/errors.dictionary.js
```

define para cada código:

- HTTP status code.
- Mensaje que recibirá el cliente.

Esto permite mantener respuestas consistentes en toda la aplicación.

### AppError

`AppError` representa los errores controlados de la aplicación.

Por ejemplo:

```js
throw new AppError(ERRORS_CODES.USER_NOT_FOUND);
```

El Service detecta el problema, pero **no construye la respuesta HTTP**.

El error continúa su recorrido hasta el middleware global.

### Middleware global

El archivo:

```text
src/middlewares/error.middleware.js
```

es el encargado de transformar los errores en respuestas HTTP uniformes.

El flujo es:

```text
Service
   ↓
AppError
   ↓
Controller
   ↓
next(error)
   ↓
errorHandler
   ↓
HTTP Response
```

Los Controllers no contienen respuestas específicas para errores de negocio.

---

# 📤 Respuestas de error

Todas las respuestas de error utilizan una estructura uniforme:

```json
{
    "status": "error",
    "error": "ERROR_CODE",
    "message": "Mensaje claro para el cliente"
}
```

Por ejemplo, si se solicita un usuario inexistente:

```json
{
    "status": "error",
    "error": "USER_NOT_FOUND",
    "message": "No se encontró el usuario solicitado."
}
```

### Información de debugging

Durante el desarrollo, algunos errores pueden incluir:

```json
{
    "status": "error",
    "error": "ERROR_CODE",
    "message": "Mensaje claro para el cliente",
    "details": "Información adicional para debugging"
}
```

La información técnica se limita al entorno de desarrollo para evitar exponer detalles internos en producción.

---

# 🚫 Errores de rutas

Las rutas inexistentes son manejadas por:

```text
src/middlewares/notfound.middleware.js
```

Por ejemplo:

```bash
curl -i http://localhost:8080/api/loquesea
```

Respuesta:

```json
{
    "status": "error",
    "error": "ROUTE_NOT_FOUND",
    "message": "La ruta solicitada no existe."
}
```

Una ruta inexistente es diferente de un recurso inexistente.

Por ejemplo:

```text
/api/loquesea
        ↓
ROUTE_NOT_FOUND
```

mientras que:

```text
/api/users/:id
        ↓
USER_NOT_FOUND
```

---

# 🔢 Validación de cantidades

Las cantidades utilizadas por el sistema de mocking se validan en `MocksService`.

Las cantidades deben ser:

- números enteros;
- no negativos para `seed`;
- mayores que cero para los endpoints de generación;
- menores o iguales al límite establecido.

El límite máximo actual es:

```text
50 registros
```

Los valores inválidos generan:

```text
INVALID_MOCK_AMOUNT
```

Ejemplo:

```bash
curl -i "http://localhost:8080/api/mocks/users?qty=-5"
```

Respuesta:

```json
{
    "status": "error",
    "error": "INVALID_MOCK_AMOUNT",
    "message": "La cantidad de registros a poner debe ser un número positivo."
}
```

---

# 🔗 Relaciones entre entidades

El sistema mantiene las siguientes relaciones:

```text
User
  │
  └── Order.userId
          │
          └── Delivery.order


User
(role: driver)
  │
  └── Delivery.deliveryPerson
```

Los identificadores utilizados para establecer las relaciones corresponden a `ObjectId` de MongoDB.

---

# 💉 Inyección de dependencias

Las dependencias principales se instancian desde:

```text
src/app.js
```

Los repositories reciben sus respectivos modelos:

```text
Repository
    ↓
Model
```

Los services reciben sus repositories:

```text
Service
    ↓
Repository
```

Los controllers reciben sus services:

```text
Controller
    ↓
Service
```

Por ejemplo:

```text
UserModel
    ↓
UserRepository
    ↓
UserService
    ↓
UserController
    ↓
UsersRouter
```

Este enfoque permite mantener las responsabilidades separadas y facilita reemplazar implementaciones durante las pruebas.

---

# 📝 Logging

ShipNow utiliza **Winston** como sistema centralizado de logging.

La configuración se encuentra en:

```text
src/utils/logger.js
```

El logger permite registrar eventos importantes de la aplicación utilizando diferentes niveles de severidad.

La aplicación evita utilizar `console.log`, `console.error` y métodos similares dentro del código fuente.

Los logs pueden enviarse a:

- La consola.
- Archivos rotativos para errores.

Los eventos de negocio y errores se registran desde las capas correspondientes, mientras que las peticiones HTTP son registradas mediante un middleware global.

---

# 📊 Niveles de logging

ShipNow utiliza seis niveles personalizados:

| Nivel     | Prioridad | Uso                                                |
| --------- | --------: | -------------------------------------------------- |
| `fatal`   |         0 | Fallos críticos que impiden continuar la ejecución |
| `error`   |         1 | Errores inesperados de la aplicación               |
| `warning` |         2 | Errores controlados o situaciones esperadas        |
| `info`    |         3 | Eventos importantes de la aplicación               |
| `http`    |         4 | Información relacionada con peticiones HTTP        |
| `debug`   |         5 | Información detallada para desarrollo              |

### `fatal`

Se utiliza para errores críticos que comprometen el funcionamiento de la aplicación.

Ejemplo:

```text
Error al conectar a MongoDB
```

### `error`

Se utiliza para errores inesperados que no fueron tratados como errores de negocio.

Ejemplo:

```text
CastError de Mongoose
```

### `warning`

Se utiliza para errores controlados mediante `AppError`.

Ejemplos:

```text
USER_NOT_FOUND
PRODUCT_NOT_FOUND
ORDER_NOT_FOUND
ROUTE_NOT_FOUND
INVALID_MOCK_AMOUNT
```

### `info`

Se utiliza para eventos importantes de la aplicación.

Ejemplos:

```text
Conexión a MongoDB establecida
Servidor iniciado
Usuario creado
Producto creado
Producto actualizado
Usuarios generados
Seed completado
```

### `http`

Se utiliza para registrar el resultado de las peticiones HTTP.

Incluye:

```text
method
path
statusCode
```

### `debug`

Se utiliza para información detallada principalmente durante el desarrollo.

---

# 🌐 Logging HTTP

Las peticiones HTTP son registradas mediante:

```text
src/middlewares/http.middleware.js
```

El middleware utiliza el evento:

```js
res.on("finish");
```

para registrar la petición una vez que la respuesta HTTP finaliza.

Ejemplo:

```text
[http] HTTP {
    "path": "/api/products",
    "method": "POST",
    "statusCode": 201
}
```

Esto permite conocer cómo terminó cada petición independientemente de que haya sido exitosa o haya producido un error.

Los errores de negocio se registran además mediante el `errorHandler`, utilizando el nivel `warning`.

De esta forma:

```text
Error de negocio
      ↓
warning

Resultado HTTP
      ↓
http
```

Cada log representa información diferente y no constituye una duplicación del mismo evento.

---

# 📂 Archivo de errores y rotación

Los errores de nivel:

```text
error
fatal
```

se almacenan en archivos dentro del directorio:

```text
log/
```

Los archivos utilizan rotación diaria:

```text
errors-YYYY-MM-DD.log
```

Ejemplo:

```text
log/
└── errors-2026-10-03.log
```

El sistema conserva los archivos durante **14 días**.

El archivo de errores utiliza formato JSON estructurado e incluye información como:

```text
timestamp
level
message
stack
```

Los niveles `info`, `warning`, `http` y `debug` no se almacenan en este archivo.

El directorio `log/` se encuentra incluido en `.gitignore`, por lo que los logs generados localmente no deben subirse al repositorio.

---

# 🧪 Endpoint de prueba del logger

Para comprobar el funcionamiento de los seis niveles de logging existe un endpoint específico:

```http
GET /api/logger/loggertest
```

Ejemplo:

```bash
curl http://localhost:8080/api/logger/loggertest
```

El endpoint genera un mensaje de prueba para cada nivel:

```text
debug
http
info
warning
error
fatal
```

Además, como la petición pasa por el `httpMiddleware`, al finalizar la respuesta se genera un registro adicional de nivel `http` correspondiente a la propia petición.

Respuesta:

```json
{
    "status": "success",
    "message": "logs generados correctamente"
}
```

Este endpoint se utiliza exclusivamente para verificar el funcionamiento del sistema de logging durante el desarrollo.

---

# 🌎 Entornos de ejecución

El comportamiento del logger depende de la variable:

```text
NODE_ENV
```

### Development

Cuando:

```env
NODE_ENV=development
```

la consola permite visualizar desde el nivel:

```text
debug
```

Por lo tanto se muestran:

```text
debug
http
info
warning
error
fatal
```

Esto facilita el diagnóstico durante el desarrollo.

### Production

Cuando:

```env
NODE_ENV=production
```

la consola comienza desde:

```text
info
```

Por lo tanto no se muestran los mensajes `debug` ni `http` en la consola.

Los errores `error` y `fatal` se registran en los archivos rotativos configurados, independientemente del entorno.

---

# 🔐 Variables de entorno

Las variables de entorno se almacenan en un archivo `.env` ubicado en la raíz del proyecto.

Ejemplo:

```env
PORT=8080
MONGODB_URI=mongodb://your-mongodb-url
NODE_ENV=development
JWT_SECRET=your-secret
```

Las variables obligatorias son:

```text
PORT
NODE_ENV
MONGODB_URI
JWT_SECRET
```

El archivo `.env` contiene información sensible y **no debe subirse al repositorio**.

Para facilitar la configuración se incluye:

```text
.env.example
```

Ejemplo:

```env
PORT=8080
MONGODB_URI=
NODE_ENV=development
JWT_SECRET=
```

---

# 🚀 Instalación

## 1. Clonar el repositorio

```bash
git clone https://github.com/molinadiego/Backend_3.git
```

## 2. Ingresar al proyecto

```bash
cd Backend_3
```

## 3. Instalar dependencias

```bash
npm install
```

## 4. Configurar variables de entorno

Crear:

```text
.env
```

en la raíz del proyecto.

Completar las variables necesarias con los valores correspondientes.

## 5. Iniciar el servidor

```bash
npm run dev
```

El servidor se ejecutará en el puerto configurado en:

```text
PORT
```

---

# 🧪 Pruebas con cURL

Con el servidor iniciado en:

```text
http://localhost:8080
```

se pueden realizar las siguientes pruebas.

### Ruta inexistente

```bash
curl -i http://localhost:8080/api/loquesea
```

Esperado:

```text
404 Not Found
```

```text
ROUTE_NOT_FOUND
```

---

### Usuario inexistente

```bash
curl -i http://localhost:8080/api/users/507f1f77bcf86cd799439011
```

Esperado:

```text
404 Not Found
```

```text
USER_NOT_FOUND
```

---

### Pedido inexistente

```bash
curl -i http://localhost:8080/api/orders/507f1f77bcf86cd799439011
```

Esperado:

```text
404 Not Found
```

```text
ORDER_NOT_FOUND
```

---

### Producto inexistente

```bash
curl -i http://localhost:8080/api/products/507f1f77bcf86cd799439011
```

Esperado:

```text
404 Not Found
```

```text
PRODUCT_NOT_FOUND
```

---

### Cantidad negativa

```bash
curl -i "http://localhost:8080/api/mocks/users?qty=-5"
```

Esperado:

```text
400 Bad Request
```

```text
INVALID_MOCK_AMOUNT
```

---

### Cantidad no numérica

```bash
curl -i "http://localhost:8080/api/mocks/users?qty=abc"
```

Esperado:

```text
400 Bad Request
```

```text
INVALID_MOCK_AMOUNT
```

---

### Cantidad decimal

```bash
curl -i "http://localhost:8080/api/mocks/users?qty=2.5"
```

Esperado:

```text
400 Bad Request
```

```text
INVALID_MOCK_AMOUNT
```

---

### Seed con relaciones inválidas

No se pueden generar órdenes sin usuarios:

```bash
curl -i -X POST "http://localhost:8080/api/mocks/seed?users=0&orders=5"
```

Esperado:

```text
400 Bad Request
```

```text
INVALID_MOCK_AMOUNT
```

Tampoco se pueden generar entregas sin órdenes o repartidores:

```bash
curl -i -X POST "http://localhost:8080/api/mocks/seed?users=2&deliveryPersons=0&orders=2&deliveries=2"
```

Esperado:

```text
400 Bad Request
```

```text
INVALID_MOCK_AMOUNT
```

---

### Seed válido

```bash
curl -i -X POST "http://localhost:8080/api/mocks/seed?users=2&deliveryPersons=1&orders=2&deliveries=1"
```

Esperado:

```text
201 Created
```

con la cantidad de registros insertados.

---

### Crear usuario

```bash
curl -i -X POST http://localhost:8080/api/users \
-H "Content-Type: application/json" \
-d '{"name":"Usuario Test","email":"usuario@test.com","password":"123456","role":"customer"}'
```

Esperado:

```text
201 Created
```

Además se registra un evento `info` indicando que el usuario fue creado.

---

### Crear producto

```bash
curl -i -X POST http://localhost:8080/api/products \
-H "Content-Type: application/json" \
-d '{"name":"Producto Test","price":100,"stock":10}'
```

Esperado:

```text
201 Created
```

Además se registra un evento `info` indicando que el producto fue creado.

---

### Actualizar stock de producto

Reemplazar `PRODUCT_ID` por el identificador de un producto existente:

```bash
curl -i -X PATCH http://localhost:8080/api/products/PRODUCT_ID/stock \
-H "Content-Type: application/json" \
-d '{"stock":25}'
```

Esperado:

```text
200 OK
```

Además se registra un evento `info` indicando la actualización del producto.

---

### Error inesperado

Un identificador que no corresponde a un `ObjectId` válido permite comprobar el manejo de errores inesperados:

```bash
curl -i http://localhost:8080/api/products/123
```

Esperado:

```text
500 Internal Server Error
```

```text
INTERNAL_SERVER_ERROR
```

El error técnico se registra internamente con nivel:

```text
error
```

mientras que el cliente recibe una respuesta genérica.

---

### Prueba de todos los niveles del logger

```bash
curl -i http://localhost:8080/api/logger/loggertest
```

Esperado:

```text
200 OK
```

y generación de mensajes:

```text
debug
http
info
warning
error
fatal
```

Además, el middleware HTTP genera un registro `http` adicional al finalizar la petición.

---

# 📌 Estado del proyecto

ShipNow continúa su desarrollo sobre una única estructura de proyecto.

Actualmente cuenta con:

- Arquitectura por capas.
- Inyección de dependencias.
- Repositories para abstraer el acceso a datos.
- Servicios con lógica de negocio.
- Controllers y routers separados.
- Generación de datos de prueba mediante Faker.
- Contraseñas simuladas hasheadas mediante bcrypt.
- Usuarios, repartidores, órdenes y entregas.
- Relaciones entre entidades mediante `ObjectId`.
- Endpoint de seed para carga controlada en MongoDB.
- Validación de cantidades de mocking.
- Errores de dominio personalizados mediante `AppError`.
- Diccionario centralizado de errores.
- Códigos de error centralizados.
- Middleware global para manejo de errores.
- Respuestas de error HTTP uniformes.
- Manejo diferenciado de errores controlados e inesperados.
- Middleware para rutas inexistentes.
- Middleware global para logging HTTP.
- Logging centralizado mediante Winston.
- Seis niveles de logging: `debug`, `http`, `info`, `warning`, `error` y `fatal`.
- Registro de eventos importantes de la aplicación.
- Registro de errores inesperados con stack trace.
- Archivos de errores con rotación diaria.
- Retención de logs durante 14 días.
- Configuración diferenciada para development y production.
- Endpoint de prueba para verificar los niveles de logging.
- Configuración mediante variables de entorno.

El proyecto utiliza Git para conservar el historial de las diferentes etapas de desarrollo.
