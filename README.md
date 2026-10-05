# ⚽ Yo Claudio — Sistema Interno de Gestión

Sistema interno de gestión para una academia/club de fútbol. Permite administrar
alumnos, asistencias, ligas y toda la parte económica (cuotas, pagos y movimientos),
con generación y actualización **automática** de cuotas y alertas por email de
vencimientos. Monorepo con backend en Node/Express + MongoDB y frontend en React + Vite.

---

## 🎯 El problema que resuelve

El control de las **cuotas** de una academia suele hacerse a mano: alguien tiene que
acordarse de generar las cuotas del mes, revisar quién debe, recalcular montos cuando
una cuota se vence y avisarle a cada familia. Es trabajo repetitivo, propenso a errores
y fácil de olvidar.

Este sistema automatiza ese circuito con tareas programadas (`node-cron`):

- 🗓️ **Generación automática de cuotas**: el primer día hábil de cada mes se crean las
  cuotas pendientes de cada alumno y se disparan las notificaciones correspondientes.
- 🔔 **Alerta automática por email**: se avisa por correo (Nodemailer) cuando se generan
  las cuotas, para que las familias estén al tanto.
- 📈 **Actualización de montos y estados**: pasado el día 10, otro job recalcula montos y
  marca las cuotas vencidas, manteniendo el estado de deuda siempre al día.

Todo con zona horaria `America/Argentina/Tucumán`, para que las fechas de corte sean
consistentes con la operación local.

---

## ✨ Funcionalidades principales

- 👥 **Gestión de usuarios** con roles y autenticación por JWT (access + refresh token).
- 🧑‍🎓 **Gestión de alumnos**: alta, edición, listados y detalle.
- ✅ **Control de asistencias**.
- 💳 **Cuotas y pagos**: generación automática, actualización de montos/estados y registro de pagos.
- 📨 **Alertas automáticas por email** de cuotas (cron + Nodemailer).
- 💰 **Movimientos económicos** y listados contables.
- 🏆 **Gestión de ligas**.
- 🖼️ **Carga de imágenes** mediante Cloudinary.
- 📄 **Exportación de datos** a PDF (PDFKit / jsPDF) y a Excel/CSV (xlsx / json2csv).
- 📊 **Dashboards y gráficos** (ApexCharts, Chart.js, Recharts, MUI X Charts).
- 🔒 **Seguridad**: Helmet, CORS con whitelist, rate limiting, validación y sanitización
  de entradas, y protección CSRF por origen en métodos de escritura.

---

## 🛠️ Stack tecnológico

### Frontend
- **React 18** + **Vite 6**
- **React Router 7**
- **Material UI 6** (`@mui/material`, `@mui/x-charts`, `@mui/x-date-pickers`)
- **Bootstrap 5** / **React-Bootstrap**
- **Firebase**
- Gráficos: **ApexCharts**, **Chart.js**, **Recharts**
- UI/UX: **SweetAlert2**, **Sonner**, **React Icons**, **React Datepicker**
- Export: **jsPDF** / **jspdf-autotable**, **html2canvas**, **xlsx** / **xlsx-js-style**
- Utilidades: **Axios**, **Luxon**, **date-fns**, **dayjs**, **lodash**, **DOMPurify**
- Linting: **ESLint 9**

### Backend
- **Node.js 20.x** + **Express 4** (ESM)
- **MongoDB** con **Mongoose 8**
- **Auth**: **JWT** (`jsonwebtoken`, access + refresh) y **bcryptjs** para el hash de contraseñas
- **Seguridad**: **Helmet**, **CORS**, **express-rate-limit**, **express-validator**,
  **mongo-sanitize**, **sanitize-html**, **cookie-parser**
- **Tareas programadas**: **node-cron**
- **Email**: **Nodemailer**
- **Imágenes**: **Cloudinary** (+ **Multer** para uploads)
- **Export/Reportes**: **PDFKit**, **json2csv**, **xlsx**
- **Fechas**: **Luxon**, **date-fns** / **date-fns-tz**
- **Logging**: **Pino** + **Morgan**
- Dev: **Nodemon**

### Organización del proyecto

```
sistemaInterno/
├── Backend/
│   └── src/
│       ├── config/        # Configuración y variables
│       ├── controllers/   # Controladores de las rutas
│       ├── routes/        # Definición de endpoints (user, student, share, payment, ...)
│       ├── models/        # Modelos de Mongoose
│       ├── logic/         # Lógica de negocio (ej. creación de cuotas)
│       ├── services/      # Servicios (email, etc.)
│       ├── middlewares/   # Middlewares (auth, errores, ...)
│       ├── validators/    # Validaciones de entrada
│       ├── cron/          # Tareas programadas (generación/actualización de cuotas)
│       ├── db/            # Conexión a MongoDB
│       └── utils/         # Utilidades
└── Frontend/
    └── src/
        ├── pages/         # Vistas (home, student, payment, league, ...)
        ├── components/    # Componentes reutilizables
        ├── api/           # Cliente HTTP / llamadas al backend
        ├── context/       # Context API de React
        ├── routes/        # Rutas del frontend
        ├── styles/        # Estilos
        └── utils/         # Utilidades
```

---

## 🖼️ Capturas

> ⚠️ El sistema se encuentra en producción con datos reales de la empresa, por lo
> que no se publican capturas con información sensible. Puedo mostrar una demo en
> vivo con datos de prueba a pedido.

| Vista | Captura |
|-------|---------|
| Login | `![Login](./screenshots/login.png)` |
| Dashboard / Home | `![Home](./screenshots/home.png)` |
| Alumnos | `![Alumnos](./screenshots/alumnos.png)` |
| Cuotas | `![Cuotas](./screenshots/cuotas.png)` |

<!-- Ejemplo:
![Dashboard](./screenshots/home.png)
-->

---

## 🚀 Cómo correrlo localmente

### Requisitos previos
- **Node.js 20.x** (ambos proyectos lo exigen vía `engines`)
- Una instancia de **MongoDB** (local o en la nube)
- Cuentas/credenciales para **Cloudinary** y para el servicio de **email**

### 1. Clonar el repositorio

```bash
git clone [URL_DEL_REPOSITORIO]
cd sistemaInterno
```

### 2. Backend

```bash
cd Backend
npm install
```

Creá un archivo `.env` en `Backend/` con las siguientes variables:

```env
CONNECTION_STRING=      # Cadena de conexión a MongoDB
NODE_ENV=               # development | production
JWT_SECRET=             # Secreto para el access token
JWT_REFRESH_SECRET=     # Secreto para el refresh token
EMAIL_USER=             # Usuario del servicio de email
EMAIL_PASS=             # Contraseña / app password del email
CLOUDINARY_CLOUD_NAME=  # Nombre de la cuenta de Cloudinary
CLOUDINARY_API_KEY=     # API key de Cloudinary
CLOUDINARY_API_SECRET=  # API secret de Cloudinary
```

Levantar el servidor:

```bash
npm run dev     # Desarrollo (nodemon)
# o
npm start       # Producción
```

### 3. Frontend

```bash
cd Frontend
npm install
```

Creá un archivo `.env` (o `.env.local`) en `Frontend/` con:

```env
VITE_API_URL=   # URL base de la API del backend (ej. http://localhost:[PUERTO])
```

Levantar la aplicación:

```bash
npm run dev       # Servidor de desarrollo (Vite)
npm run build     # Build de producción
npm run preview   # Previsualizar el build
npm run lint      # Linting
```

---

## 👤 Autor

**Ignacio Skibski** — Full Stack Developer

- 💼 LinkedIn: [ignacio-skibski](https://www.linkedin.com/in/ignacio-skibski-366877247)
- 📧 Email: [nanoskibski@gmail.com](mailto:nanoskibski@gmail.com)
