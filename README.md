# 🚚 ShipNow — Backend

API backend para la gestión de usuarios, productos, órdenes y entregas, desarrollada con **Node.js, Express y MongoDB**.

El proyecto utiliza una arquitectura por capas, inyección de dependencias, generación de datos de prueba mediante mocking, manejo centralizado de errores, logging, documentación con Swagger y carga de archivos mediante Multer.

---

## 📋 Contenido

- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Mocking](#-mocking)
- [Endpoints de Mocking](#-endpoints-de-mocking)
- [Carga de datos de prueba](#-carga-de-datos-de-prueba)
- [Gestión de archivos](#-gestión-de-archivos)
- [Validaciones de archivos](#-validaciones-de-archivos)
- [Manejo profesional de errores](#-manejo-profesional-de-errores)
- [Logging](#-logging)
- [Documentación con Swagger](#-documentación-con-swagger)
- [Relaciones entre entidades](#-relaciones-entre-entidades)
- [Inyección de dependencias](#-inyección-de-dependencias)
- [Variables de entorno](#-variables-de-entorno)
- [Instalación](#-instalación)
- [Pruebas automatizadas](#-pruebas-automatizadas)
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
- **Multer**
- **Winston**
- **Swagger / OpenAPI**
- **Mocha**
- **Chai**
- **Supertest**
- **JavaScript ES Modules**

---

## 🏗 Arquitectura

ShipNow utiliza una arquitectura por capas que separa las responsabilidades de cada componente.

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

Los middlewares se encargan de tareas transversales, como la gestión de errores, el procesamiento de archivos y el registro de las peticiones HTTP.

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

Los endpoints de generación utilizan los generators para producir datos ficticios sin persistirlos.

El endpoint `seed`, en cambio, utiliza los repositories para insertar los datos generados en MongoDB.

### Arquitectura del módulo de carga de archivos

```text
HTTP Request
    ↓
UsersRouter / DeliveriesRouter
    ↓
Multer Middleware
    ↓
Controller
    ↓
Service
    ↓
Repository
    ↓
MongoDB
```

Multer procesa los archivos recibidos mediante `multipart/form-data`.

Los archivos se almacenan en el sistema de archivos del servidor y sus metadatos se guardan en MongoDB.

---

## 📁 Estructura del proyecto

La siguiente estructura resume los módulos principales del proyecto.

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
│   ├── docs/
│   │   ├── swagger.config.js
│   │   └── uploads.yaml
│   │
│   ├── errors/
│   │   ├── app.error.js
│   │   ├── errors.codes.js
│   │   └── errors.dictionary.js
│   │
│   ├── middlewares/
│   │   ├── error.middleware.js
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
│   └── services/
│       ├── deliveries.service.js
│       ├── mocks.service.js
│       ├── orders.service.js
│       ├── products.service.js
│       └── users.service.js
│
├── tests/
├── uploads/
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
- Las constantes de `src/constants/index.js` para roles, estados y prioridades.

Las cantidades solicitadas están limitadas a un máximo de **50 registros** para evitar cargas excesivas durante las pruebas.

## 👤 Usuarios simulados

Los usuarios generados contienen campos como:

```text
name
email
password
role
isActive
```

Los roles se definen mediante las constantes de `USER_ROLES`.

Las contraseñas se almacenan como hashes generados mediante `bcrypt`.

## 🛵 Repartidores simulados

Los repartidores son usuarios generados específicamente con el rol:

```text
USER_ROLES.DRIVER
```

Estos usuarios pueden relacionarse posteriormente con entregas.

## 📦 Órdenes simuladas

Las órdenes generadas contienen campos como:

```text
userId
deliveryAddress
total
status
priority
isActive
```

Los estados y prioridades utilizan las constantes definidas en el proyecto.

Cada orden mantiene una relación con un usuario:

```text
Order.userId → User._id
```

## 🚚 Entregas simuladas

Las entregas contienen campos como:

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
Delivery.order → Order._id
Delivery.deliveryPerson → User._id
```

El usuario asociado a `deliveryPerson` debe tener el rol `driver`.

---

## 🔌 Endpoints de Mocking

Los endpoints de mocking se encuentran bajo:

```text
/api/mocks
```

### Generar usuarios

```http
GET /api/mocks/users?qty=2
```

Genera usuarios ficticios sin almacenarlos en MongoDB.

```bash
curl "http://localhost:8080/api/mocks/users?qty=2"
```

### Generar repartidores

```http
GET /api/mocks/delivery-persons?qty=2
```

Genera usuarios con el rol `driver` sin almacenarlos en MongoDB.

```bash
curl "http://localhost:8080/api/mocks/delivery-persons?qty=2"
```

### Generar órdenes

```http
GET /api/mocks/orders?qty=2
```

Genera órdenes ficticias relacionadas con usuarios generados en memoria. Los datos no se persisten en MongoDB.

```bash
curl "http://localhost:8080/api/mocks/orders?qty=2"
```

### Generar entregas

```http
GET /api/mocks/deliveries?qty=2
```

Genera entregas relacionadas con órdenes y repartidores ficticios.

```bash
curl "http://localhost:8080/api/mocks/deliveries?qty=2"
```

---

## 🌱 Carga de datos de prueba

El endpoint:

```http
POST /api/mocks/seed
```

permite generar e insertar datos de prueba directamente en MongoDB.

Parámetros:

| Parámetro         | Descripción                  | Valor por defecto |
| ----------------- | ---------------------------- | ----------------: |
| `users`           | Usuarios clientes a insertar |                 5 |
| `deliveryPersons` | Repartidores a insertar      |                 3 |
| `orders`          | Órdenes a insertar           |                10 |
| `deliveries`      | Entregas a insertar          |                 5 |

Cada cantidad admite valores entre `0` y `50`, sujetos a las validaciones de las relaciones entre entidades.

### Ejemplo

```bash
curl -X POST "http://localhost:8080/api/mocks/seed?users=2&deliveryPersons=1&orders=2&deliveries=1"
```

Una respuesta exitosa puede tener la siguiente estructura:

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

Las cantidades efectivamente insertadas dependen de los parámetros enviados.

---

# 📎 Gestión de archivos

ShipNow permite cargar documentos de usuarios y licencias de conducir, así como comprobantes de entrega.

La carga de archivos se implementa mediante **Multer**. Las rutas reciben los archivos utilizando `multipart/form-data`.

Los archivos se almacenan en el sistema de archivos del servidor. MongoDB conserva los metadatos asociados, no el contenido binario del archivo.

## 📂 Directorios de almacenamiento

Los archivos se organizan en los siguientes directorios:

```text
uploads/
├── documents/
├── licenses/
└── proofs/
```

| Directorio           | Uso                              |
| -------------------- | -------------------------------- |
| `uploads/documents/` | Documentos generales de usuarios |
| `uploads/licenses/`  | Licencias de conducir            |
| `uploads/proofs/`    | Comprobantes de entrega          |

Los nombres de archivo se generan con identificadores únicos para reducir el riesgo de colisiones.

Los directorios se crean cuando son necesarios.

Los archivos cargados se excluyen del control de versiones mediante `.gitignore`. No se deben subir documentos personales, licencias ni comprobantes reales al repositorio.

## 📄 Documentos de usuario

Endpoint:

```http
POST /api/users/:id/documents
```

Permite asociar un documento a un usuario existente.

El formulario debe enviarse como `multipart/form-data` e incluir:

- `file`: archivo que se va a cargar.
- `documentType`: tipo de documento admitido por la API.

Los tipos de documento contemplados son:

```text
user_document
driver_license
```

Las licencias de conducir están reservadas para usuarios con el rol `driver`.

## 🚚 Comprobantes de entrega

Endpoint:

```http
POST /api/deliveries/:id/proof
```

Permite cargar un comprobante para una entrega existente.

El formulario debe enviarse como `multipart/form-data` e incluir el campo:

```text
file
```

La carga se asocia a la entrega identificada en la URL.

---

## 🛡 Validaciones de archivos

La configuración de Multer se encuentra en:

```text
src/config/multer.config.js
```

### Tipos de archivo permitidos

| Formato | MIME type         |
| ------- | ----------------- |
| PDF     | `application/pdf` |
| JPEG    | `image/jpeg`      |
| PNG     | `image/png`       |
| WebP    | `image/webp`      |

### Límites de carga

- Tamaño máximo por archivo: **5 MB**.
- Cantidad máxima de archivos por petición: **1**.
- Los archivos se reciben mediante `multipart/form-data`.
- Los tipos MIME no admitidos se rechazan.
- Los errores de Multer se traducen a errores controlados de la aplicación.
- Si falla una operación de negocio después de guardar el archivo, se intenta eliminar el archivo generado.

La validación del tipo MIME es una medida básica de control. Para un entorno productivo también conviene verificar el contenido real de los archivos, limitar el acceso a documentos sensibles y definir políticas de retención y eliminación.

### Errores habituales

| Situación                             | Código de error         |
| ------------------------------------- | ----------------------- |
| No se envía ningún archivo            | `FILE_REQUIRED`         |
| Tipo de archivo no admitido           | `INVALID_FILE_TYPE`     |
| Archivo superior al límite            | `FILE_TOO_LARGE`        |
| Campo inesperado o exceso de archivos | `UNEXPECTED_FILE_FIELD` |
| Usuario inexistente                   | `USER_NOT_FOUND`        |
| Entrega inexistente                   | `DELIVERY_NOT_FOUND`    |
| Tipo de documento inválido            | `INVALID_DOCUMENT_TYPE` |

Los códigos y mensajes definitivos son los definidos en los archivos de errores del proyecto.

---

# ⚠️ Manejo profesional de errores

ShipNow utiliza un sistema centralizado para gestionar los errores de la aplicación.

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

## Códigos de error

Los códigos se centralizan en:

```text
src/errors/errors.codes.js
```

Entre los códigos utilizados por los módulos del proyecto se encuentran:

```text
VALIDATION_ERROR
USER_NOT_FOUND
ORDER_NOT_FOUND
PRODUCT_NOT_FOUND
DELIVERY_NOT_FOUND
INVALID_MOCK_AMOUNT
FILE_REQUIRED
INVALID_FILE_TYPE
FILE_TOO_LARGE
UNEXPECTED_FILE_FIELD
ROUTE_NOT_FOUND
INTERNAL_SERVER_ERROR
```

La lista exacta depende de los códigos definidos en el proyecto.

## Diccionario de errores

El archivo:

```text
src/errors/errors.dictionary.js
```

asocia los códigos de error con información como:

- Código de estado HTTP.
- Mensaje destinado al cliente.

Esto permite mantener respuestas consistentes en toda la aplicación.

## AppError

`AppError` representa errores controlados de la aplicación.

Por ejemplo:

```js
throw new AppError(ERRORS_CODES.USER_NOT_FOUND);
```

Los services identifican los problemas de negocio, pero no construyen directamente las respuestas HTTP de error.

## Middleware global

El archivo:

```text
src/middlewares/error.middleware.js
```

transforma los errores en respuestas HTTP uniformes.

El flujo general es:

```text
Service
   ↓
AppError
   ↓
Controller
   ↓
Middleware global
   ↓
HTTP Response
```

Los controllers delegan la gestión de los errores al middleware centralizado.

## Respuestas de error

Las respuestas de error siguen una estructura uniforme:

```json
{
	"status": "error",
	"error": "ERROR_CODE",
	"message": "Mensaje claro para el cliente"
}
```

Ejemplo:

```json
{
	"status": "error",
	"error": "USER_NOT_FOUND",
	"message": "No se encontró el usuario solicitado."
}
```

Durante el desarrollo, ciertos errores pueden incluir detalles técnicos adicionales. En producción, estos detalles deben limitarse para evitar exponer información interna.

## Errores de rutas

Las rutas inexistentes se gestionan mediante:

```text
src/middlewares/notfound.middleware.js
```

Ejemplo:

```bash
curl -i http://localhost:8080/api/loquesea
```

Una ruta inexistente es diferente de un recurso inexistente:

```text
/api/loquesea
        ↓
ROUTE_NOT_FOUND
```

En cambio, una ruta válida que busca un usuario inexistente puede producir:

```text
/api/users/:id
        ↓
USER_NOT_FOUND
```

---

## 🪵 Logging

ShipNow incluye logging para facilitar el seguimiento de eventos y errores durante el desarrollo.

El registro de eventos permite investigar problemas sin mezclar la lógica de logging con la lógica de negocio.

Los mensajes registrados deben evitar contraseñas, tokens, credenciales y contenido sensible de los archivos cargados.

---

## 📚 Documentación con Swagger

La API dispone de documentación basada en Swagger / OpenAPI.

La documentación del módulo de carga de archivos se encuentra en:

```text
src/docs/uploads.yaml
```

Incluye la descripción de los endpoints de carga, los campos de los formularios, los tipos de archivo admitidos y los límites establecidos.

Para consultar la documentación, inicia el servidor y abre la ruta de Swagger configurada en la aplicación. La URL exacta depende de la configuración del proyecto.

---

# 🔗 Relaciones entre entidades

El sistema mantiene relaciones entre usuarios, órdenes y entregas.

```text
User
  │
  └── Order.userId
          │
          └── Delivery.order
```

El repartidor se relaciona con la entrega mediante:

```text
User (role: driver)
  │
  └── Delivery.deliveryPerson
```

Los identificadores utilizados para establecer las relaciones corresponden a identificadores de MongoDB.

Los servicios de la aplicación validan las relaciones requeridas antes de crear determinados registros.

---

# 💉 Inyección de dependencias

Las dependencias principales se instancian desde:

```text
src/app.js
```

Los repositories reciben sus modelos:

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

Este enfoque mantiene separadas las responsabilidades y facilita probar los componentes de forma aislada.

---

# 🔐 Variables de entorno

Las variables de entorno se almacenan en un archivo `.env` ubicado en la raíz del proyecto.

Ejemplo:

```env
PORT=8080
MONGODB_URI=mongodb://your-mongodb-url
NODE_ENV=development
```

El archivo `.env` puede contener información sensible y **no debe subirse al repositorio**.

Para facilitar la configuración se incluye un archivo de ejemplo:

```text
.env.example
```

Ejemplo:

```env
PORT=8080
MONGODB_URI=
NODE_ENV=development
```

Utiliza los nombres de variables definidos en la configuración real de la aplicación.

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

Crea o completa el archivo `.env` en la raíz del proyecto con las variables necesarias y una URI válida de MongoDB.

## 5. Iniciar el servidor

```bash
npm run dev
```

El servidor se ejecutará en el puerto configurado mediante `PORT`.

---

# 🧪 Pruebas automatizadas

El proyecto utiliza herramientas de testing como:

- **Mocha** para ejecutar las pruebas.
- **Chai** para realizar aserciones.
- **Supertest** para probar endpoints HTTP.

Para ejecutar la suite:

```bash
npm test
```

Las pruebas abarcan los módulos de la aplicación, incluyendo mocking, usuarios, productos, órdenes, documentación y carga de archivos.

En la última ejecución comunicada, la suite finalizó con:

```text
55 passing
```

Este resultado corresponde a esa ejecución y puede cambiar cuando se incorporen nuevas pruebas o modificaciones.

### Escenarios de carga de archivos

Las pruebas del módulo de uploads cubren escenarios como:

- Carga de un documento de usuario.
- Petición sin archivo.
- Tipo de documento inválido.
- Tipo MIME no admitido.
- Archivo que supera el límite de tamaño.
- Carga de un comprobante de entrega.
- Entrega inexistente.
- Aceptación de WebP.
- Restricción de licencias para usuarios que no son repartidores.
- Usuario inexistente.

---

# 🧪 Pruebas con cURL

Los siguientes ejemplos suponen que el servidor está ejecutándose en:

```text
http://localhost:8080
```

Reemplaza los identificadores de ejemplo por identificadores reales cuando corresponda.

### Ruta inexistente

```bash
curl -i http://localhost:8080/api/loquesea
```

Esperado: error de ruta no encontrada.

### Usuario inexistente

```bash
curl -i http://localhost:8080/api/users/507f1f77bcf86cd799439011
```

Esperado: error de usuario no encontrado, si la ruta está implementada de esa manera.

### Orden inexistente

```bash
curl -i http://localhost:8080/api/orders/507f1f77bcf86cd799439011
```

Esperado: error de orden no encontrada, si la ruta está implementada de esa manera.

### Producto inexistente

```bash
curl -i http://localhost:8080/api/products/507f1f77bcf86cd799439011
```

Esperado: error de producto no encontrado, si la ruta está implementada de esa manera.

### Cantidad negativa

```bash
curl -i "http://localhost:8080/api/mocks/users?qty=-5"
```

Esperado: error de validación de cantidad.

### Cantidad no numérica

```bash
curl -i "http://localhost:8080/api/mocks/users?qty=abc"
```

Esperado: error de validación de cantidad.

### Cantidad decimal

```bash
curl -i "http://localhost:8080/api/mocks/users?qty=2.5"
```

Esperado: error de validación de cantidad.

### Seed válido

```bash
curl -i -X POST "http://localhost:8080/api/mocks/seed?users=2&deliveryPersons=1&orders=2&deliveries=1"
```

Esperado: respuesta exitosa con las cantidades insertadas, siempre que se cumplan las validaciones y la base de datos esté disponible.

### Cargar un documento de usuario

```bash
curl -X POST "http://localhost:8080/api/users/USER_ID/documents" \
  -F "documentType=user_document" \
  -F "file=@./documento.pdf"
```

Reemplaza `USER_ID` por el identificador de un usuario existente y `./documento.pdf` por la ruta local de un archivo PDF válido.

### Cargar una licencia de conducir

```bash
curl -X POST "http://localhost:8080/api/users/DRIVER_ID/documents" \
  -F "documentType=driver_license" \
  -F "file=@./licencia.pdf"
```

Reemplaza `DRIVER_ID` por el identificador de un usuario existente con el rol `driver`.

### Cargar un comprobante de entrega

```bash
curl -X POST "http://localhost:8080/api/deliveries/DELIVERY_ID/proof" \
  -F "file=@./comprobante.jpg"
```

Reemplaza `DELIVERY_ID` por el identificador de una entrega existente y `./comprobante.jpg` por la ruta local de un archivo válido.

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
- Contraseñas simuladas hasheadas mediante bcrypt.
- Usuarios, repartidores, órdenes y entregas.
- Relaciones entre entidades mediante identificadores de MongoDB.
- Endpoint de seed para carga controlada de datos en MongoDB.
- Validación de cantidades de mocking.
- Errores de dominio personalizados mediante `AppError`.
- Diccionario centralizado de errores.
- Códigos de error centralizados.
- Middleware global para manejo de errores.
- Respuestas de error HTTP uniformes.
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
- Pruebas automatizadas con Mocha, Chai y Supertest.

La suite de pruebas registró **55 pruebas exitosas** en la última ejecución compartida.

El proyecto utiliza Git para conservar el historial de las diferentes etapas de desarrollo.
