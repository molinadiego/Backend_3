# 🚚 ShipNow — Backend

API backend para la gestión de usuarios, productos, órdenes y entregas, desarrollada con **Node.js, Express y MongoDB**.

El proyecto utiliza una arquitectura por capas, inyección de dependencias, generación de datos de prueba mediante mocking y un sistema centralizado de manejo de errores.

La arquitectura por capas no implica que la API esté lista para producción. Actualmente no existe autenticación ni autorización; las rutas que modifican usuarios, productos, órdenes y entregas requieren controles de acceso antes de exponer el servicio públicamente.

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
- [Variables de entorno](#-variables-de-entorno)
- [Instalación](#-instalación)
- [Pruebas automatizadas](#-pruebas-automatizadas)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Pruebas con cURL](#-pruebas-con-curl)
- [Docker](#-docker)
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
- **Multer**
- **Winston**
- **Swagger / OpenAPI**
- **Mocha**
- **Chai**
- **Supertest**
- **JavaScript ES Modules**
- **Docker**

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

Los middlewares manejan tareas transversales como el procesamiento de errores, las cargas de archivos y el registro de solicitudes. Esta separación no reemplaza la autenticación ni la autorización, que aún no están implementadas.

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
│   │   ├── env.config.js
│   │   └── multer.config.js
│   │
│   ├── constants/
│   │   └── index.js
│   │
│   ├── controllers/
│   │   ├── deliveries.controller.js
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
│   │   ├── async-handler.middleware.js
│   │   ├── error.middleware.js
│   │   ├── http.middleware.js
│   │   ├── notfound.middleware.js
│   │   └── upload-error.middleware.js
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
│   │   ├── deliveries.router.js
│   │   ├── logger.router.js
│   │   ├── mocks.router.js
│   │   ├── orders.router.js
│   │   ├── products.router.js
│   │   └── users.router.js
│   │
│   ├── services/
│   │   ├── deliveries.service.js
│   │   ├── mocks.service.js
│   │   ├── orders.service.js
│   │   ├── products.service.js
│   │   └── users.service.js
│   │
│   ├── utils/
│   │   ├── logger.js
│   │   └── pagination.js
│   │
│   └── docs/
│       ├── swagger.config.js
│       └── ...
│
├── tests/
├── uploads/
├── .dockerignore
├── .env.example
├── .gitignore
├── Dockerfile
├── package.json
├── package-lock.json
└── README.md
```

La estructura anterior representa los componentes principales del proyecto; pueden existir archivos adicionales dentro de las carpetas indicadas.

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

Las cantidades solicitadas deben estar entre los límites admitidos. Los valores mayores a **50 registros** se rechazan con `INVALID_MOCK_AMOUNT`; no se reducen automáticamente a 50.

---

## 👤 Usuarios simulados

Los objetos internos generados contienen:

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

Los usuarios pueden generarse como clientes, administradores u otros roles definidos por el sistema.

El generador calcula las contraseñas como hashes con `bcrypt`. Los endpoints HTTP de generación eliminan la propiedad `password` de sus respuestas, por lo que no devuelven ni la contraseña ni su hash.

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

permite generar e insertar datos controlados directamente en MongoDB. Usalo únicamente contra una base de pruebas controlada; no lo ejecutes contra una base con datos reales.

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
FILE_REQUIRED
INVALID_FILE_TYPE
FILE_TOO_LARGE
UNEXPECTED_FILE_FIELD
INVALID_DOCUMENT_TYPE
ROUTE_NOT_FOUND
INTERNAL_SERVER_ERROR
```

Esta lista incluye ejemplos y no es exhaustiva. Las cargas también pueden responder `DOCUMENT_UPLOAD_FAILED`, `DELIVERY_PROOF_UPLOAD_FAILED` y errores de recursos inexistentes, según la operación.

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
	"message": "La cantidad de registros solicitada no es válida."
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

# 🔐 Variables de entorno

Las variables de entorno se almacenan en un archivo `.env` ubicado en la raíz del proyecto.

Ejemplo:

```env
PORT=8080
MONGODB_URI=mongodb://your-mongodb-url
NODE_ENV=development
JWT_SECRET=
API_BASE_URL=http://localhost:8080
```

El archivo `.env` contiene información sensible y **no debe subirse al repositorio**.

`API_BASE_URL` define la URL base publicada por Swagger y OpenAPI. Su valor por defecto es `http://localhost:8080`. La configuración también requiere `JWT_SECRET`, pero actualmente no hay un flujo JWT implementado que lo utilice.

Cuando `NODE_ENV=test`, `src/config/env.config.js` carga las variables desde `.env.test`. Ese archivo debe contener las variables obligatorias, incluida una URI de MongoDB destinada exclusivamente a pruebas y diferente de la base de desarrollo. Nunca ejecutes pruebas contra datos reales ni contra la base de desarrollo.

Para configurar el entorno de pruebas, copiá la plantilla y verificá que la base indicada sea exclusiva de testing:

```bash
cp .env.test.example .env.test
```

La plantilla usa `mongodb://127.0.0.1:27017/shipnow_test`; si usás otra instancia, configurá `MONGODB_URI` con una base aislada para pruebas. No apuntes `.env.test` a desarrollo ni a producción. `.env.test` está ignorado por Git y no debe subirse al repositorio.

Para facilitar la configuración se incluye:

```text
.env.example
```

Ejemplo:

```env
PORT=8080
MONGODB_URI=
JWT_SECRET=
NODE_ENV=development
API_BASE_URL=http://localhost:8080
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

# 🧪 Pruebas automatizadas

La suite utiliza Mocha, Chai y Supertest. Para ejecutarla:

```bash
npm test
```

El script usa `cross-env` para configurar `NODE_ENV=test` y carga `.env.test`. Antes de ejecutarlo, copiá `.env.test.example` a `.env.test` y confirmá que `MONGODB_URI` apunte a `shipnow_test` o a otra base exclusiva, distinta de desarrollo. Nunca ejecutes pruebas contra datos reales ni contra la base de desarrollo.

`cross-env` está declarado en `devDependencies` y `npm install` lo instala junto con las dependencias de desarrollo. Si se instala omitiendo devDependencies, `npm test` no tendrá disponible ese binario.

En la última ejecución verificada, `npm test` finalizó con **81 tests aprobados y 0 fallidos**.

---

# 🔌 Endpoints de la API

Las rutas principales disponibles son:

| Recurso | Operaciones |
| --- | --- |
| Usuarios (`/api/users`) | `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id`, `POST /:id/documents` |
| Productos (`/api/products`) | `GET /`, `GET /:id`, `POST /`, `PATCH /:id/stock` |
| Órdenes (`/api/orders`) | `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id` |
| Entregas (`/api/deliveries`) | `GET /`, `POST /:id/proof` |

Los listados de usuarios, productos, órdenes y entregas aceptan `page` y `limit` (por defecto `1` y `10`; `limit` se limita a `100`). También aceptan filtros propios del recurso: `role`, `status`, `priority`, `userId`, `deliveryPerson` u `order`, según corresponda. Los filtros disponibles se detallan en `/api/docs`.

Rutas adicionales:

- `GET /health`: informa si Mongoose tiene conexión establecida.
- `GET /api/logger/loggerTest`: genera registros de prueba en distintos niveles del logger.
- `/api/docs`: interfaz Swagger / OpenAPI. En local, abrí `http://localhost:8080/api/docs`; la URL base que muestra la documentación depende de `API_BASE_URL`.

La API no cuenta actualmente con autenticación ni autorización. No expongas públicamente las rutas de modificación hasta incorporar controles de acceso.

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

### Cargar un documento de usuario

Las cargas se reciben como `multipart/form-data`. Se admiten PDF, JPEG, PNG y WebP, con un máximo de un archivo y un tamaño de **5 MB** por solicitud.

```bash
curl -X POST "http://localhost:8080/api/users/USER_ID/documents" \
  -F "documentType=user_document" \
  -F "file=@./documento.pdf"
```

Reemplazar `USER_ID` por el identificador de un usuario existente y `./documento.pdf` por la ruta local de un archivo PDF válido.

---

### Cargar una licencia de conducir

```bash
curl -X POST "http://localhost:8080/api/users/DRIVER_ID/documents" \
  -F "documentType=driver_license" \
  -F "file=@./licencia.pdf"
```

Reemplazar `DRIVER_ID` por el identificador de un usuario existente con el rol `driver`.

---

### Cargar un comprobante de entrega

```bash
curl -X POST "http://localhost:8080/api/deliveries/DELIVERY_ID/proof" \
  -F "file=@./comprobante.jpg"
```

Reemplazar `DELIVERY_ID` por el identificador de una entrega existente y `./comprobante.jpg` por la ruta local de un archivo válido.

Los mismos formatos, límite de un archivo y máximo de 5 MB aplican a documentos, licencias y comprobantes.

---

# 🐳 Docker

ShipNow puede ejecutarse en un contenedor Docker utilizando una imagen basada en Node.js 22.

## Requisitos previos

- Docker Desktop instalado y en ejecución.
- Acceso a MongoDB Atlas.
- Un archivo `.env` correctamente configurado.

No es necesario instalar Node.js en el equipo anfitrión para ejecutar la API dentro del contenedor.

## Construir la imagen

Desde la raíz del proyecto, ejecutar:

```bash
docker build -t shipnow-api:1.0 .
```

Para comprobar que se creó:

```bash
docker images shipnow-api
```

El archivo `.dockerignore` excluye archivos locales, dependencias instaladas en el equipo anfitrión y variables de entorno del contexto de construcción.

## Variables de entorno

El archivo `.env` debe contener las variables obligatorias:

```env
PORT=8080
MONGODB_URI=
JWT_SECRET=
NODE_ENV=development
API_BASE_URL=http://localhost:8080
```

Completar `MONGODB_URI` y `JWT_SECRET` con los valores correspondientes. `JWT_SECRET` es requerido por la configuración actual, aunque no hay un flujo JWT implementado. No publicar el archivo `.env` ni incluir credenciales en el repositorio.

Las variables se proporcionan al contenedor durante su ejecución, no se copian a la imagen.

## Ejecutar el contenedor

Con Docker Desktop en ejecución y el puerto `8080` disponible:

```bash
docker run -d \
  --name shipnow-api \
  --env-file .env \
  -e NODE_ENV=development \
  -p 8080:8080 \
  -v shipnow-logs:/app/log \
  -v shipnow-uploads:/app/uploads \
  shipnow-api:1.0
```

El valor de `PORT` dentro del contenedor debe coincidir con el puerto de destino (lado del contenedor) en `-p HOST_PORT:CONTAINER_PORT`. Con la configuración de ejemplo, `PORT=8080` y `-p 8080:8080`. Si se configura `PORT=8081`, usar `-e PORT=8081` y publicar, por ejemplo, `-p 18081:8081`; el puerto del equipo anfitrión puede ser distinto.

El comando:

- Ejecuta la API en segundo plano.
- El Dockerfile define `NODE_ENV=production` como valor predeterminado; en este comando, `--env-file .env` y `-e NODE_ENV=development` hacen que la aplicación se ejecute con `NODE_ENV=development` (el valor indicado con `-e` tiene prioridad). Para usar otro entorno, ajustar o quitar esa opción.
- Publica el puerto `8080` del contenedor en el puerto `8080` del equipo anfitrión.
- Carga las variables desde `.env`.
- Conserva los logs en el volumen `shipnow-logs`.
- Conserva los archivos subidos en el volumen `shipnow-uploads`.

El contenedor no incorpora autenticación ni autorización por el hecho de ejecutarse con `NODE_ENV=production`; no expongas públicamente rutas de modificación hasta agregar controles de acceso.

Si ya existe un contenedor llamado `shipnow-api`, o el puerto `8080` está ocupado, será necesario resolver ese conflicto antes de iniciar otra instancia.

## Verificar el funcionamiento

Consultar el estado del contenedor:

```bash
docker ps -a --filter name=shipnow-api
```

Consultar el health check:

```bash
curl -i http://localhost:8080/health
```

Comprobar el estado del health check de Docker:

```bash
docker inspect --format '{{.State.Health.Status}}' shipnow-api
```

Una respuesta `200 OK` con `"status": "ok"` indica que la aplicación está operativa y que Mongoose considera establecida la conexión a MongoDB. El health check interno consulta `http://127.0.0.1:$PORT/health`, usando el mismo puerto con el que inicia el servidor.

Probar un endpoint funcional:

```bash
curl -i http://localhost:8080/api/products
```

## Consultar los logs

Ver los últimos mensajes:

```bash
docker logs --tail 50 shipnow-api
```

Seguir los logs en tiempo real:

```bash
docker logs -f shipnow-api
```

Presionar `Ctrl+C` para salir del seguimiento. Esto no detiene el contenedor.

## Detener e iniciar el contenedor

Detener la API:

```bash
docker stop shipnow-api
```

Volver a iniciar el mismo contenedor:

```bash
docker start shipnow-api
```

Consultar su estado:

```bash
docker ps -a --filter name=shipnow-api
```

Para eliminar el contenedor después de detenerlo:

```bash
docker rm shipnow-api
```

Eliminar el contenedor no elimina los volúmenes nombrados. No borrar `shipnow-logs` ni `shipnow-uploads` si se necesita conservar su contenido.

## Health check

La ruta `GET /health` informa el estado de la aplicación, el entorno, el tiempo de actividad y la fecha de la consulta.

Devuelve:

- `200 OK` cuando la conexión de Mongoose está establecida.
- `503 Service Unavailable` cuando la conexión no está establecida.

---

# 📌 Estado del proyecto

ShipNow continúa su desarrollo sobre una estructura de proyecto que separa las responsabilidades por capas.

Entre las funcionalidades implementadas se encuentran:

- Arquitectura por capas.
- Inyección de dependencias.
- Repositories para abstraer el acceso a datos.
- Services con lógica de negocio.
- Controllers y routers separados.
- Generación de datos de prueba mediante Faker.
- Registro público que asigna siempre `USER_ROLES.CUSTOMER`, sin permitir que el rol enviado por el cliente influya en el rol asignado.
- Contraseñas de creación y cambio procesadas con bcrypt; las respuestas de usuario excluyen `password`.
- Endpoints de mocking que omiten la propiedad `password` de las respuestas de usuarios y repartidores.
- Usuarios, repartidores, órdenes y entregas.
- Relaciones entre entidades mediante identificadores de MongoDB.
- Endpoint de seed para carga controlada de datos en MongoDB.
- Validación de cantidades de mocking.
- Errores de dominio personalizados mediante `AppError`.
- Diccionario centralizado de errores.
- Códigos de error centralizados.
- Middleware global para manejo de errores.
- Respuestas de error HTTP uniformes.
- Manejo diferenciado de errores controlados e inesperados.
- Middleware para rutas inexistentes.
- Configuración mediante variables de entorno.
- Logging para facilitar el diagnóstico.
- Documentación de API mediante Swagger / OpenAPI.
- Carga de documentos de usuarios.
- Carga de licencias de conducir para repartidores.
- Carga de comprobantes de entrega.
- Validación de tipos de archivo y tamaño máximo.
- Gestión centralizada de errores de Multer.
- Limpieza de archivos ante determinados fallos de negocio.
- Paginación en listados.
- Health check de la API.
- Dockerfile para construir la imagen de la aplicación.
- `.dockerignore` para excluir archivos locales del contexto de construcción.
- Ejecución de la API en un contenedor Docker.
- Persistencia de logs y archivos subidos mediante volúmenes Docker.
- Pruebas automatizadas con Mocha, Chai y Supertest.

Estas funcionalidades no implican que la API esté lista para producción: aún faltan autenticación y autorización para proteger las rutas y operaciones sensibles.

El proyecto utiliza Git para conservar el historial de las diferentes etapas de desarrollo.
