# 🔧 GUÍA DE CONFIGURACIÓN TÉCNICA - SGP REA PRODUCTIONS

## 📋 RESUMEN EJECUTIVO

Esta guía contiene los pasos detallados para configurar la infraestructura técnica completa del Sistema de Gestión de Producción (SGP) para REA Productions. La configuración incluye bases de datos, servicios en la nube, y herramientas de desarrollo.

---

## 🎯 ARQUITECTURA HÍBRIDA DE DATOS

### **MySQL (Base de Datos Principal)**
- **Propósito:** Datos estructurados críticos del negocio
- **Contiene:** Usuarios, proyectos, contratos, patrocinios, talentos
- **Características:** ACID compliance, integridad referencial, alertas automáticas

### **MongoDB (Base de Datos Flexible)**
- **Propósito:** Archivos, logs, analytics, configuraciones
- **Contiene:** Metadatos de archivos, métricas, logs del sistema
- **Características:** Escalabilidad horizontal, consultas complejas, datos no estructurados

---

## 🚀 PASOS DE CONFIGURACIÓN

### **PASO 1: CONFIGURACIÓN DE MySQL**

#### 1.1 Crear Base de Datos
```bash
# Opción A: Usando Railway (Recomendado para prototipo)
# 1. Ir a railway.app
# 2. Crear nuevo proyecto
# 3. Agregar servicio MySQL
# 4. Copiar string de conexión
```

#### 1.2 Ejecutar Script de Configuración
```sql
-- Conectar a MySQL y ejecutar:
SOURCE /ruta/al/archivo/database_setup_mysql.sql;

-- Verificar instalación:
SHOW TABLES;
SELECT COUNT(*) as total_tables FROM information_schema.tables 
WHERE table_schema = 'sgp_rea_productions';
```

#### 1.3 Configurar Usuario de Aplicación
```sql
-- Crear usuario específico para la aplicación
CREATE USER 'sgp_app'@'%' IDENTIFIED BY 'password_seguro_aqui';
GRANT SELECT, INSERT, UPDATE, DELETE ON sgp_rea_productions.* TO 'sgp_app'@'%';
FLUSH PRIVILEGES;
```

#### 1.4 Variables de Entorno MySQL
```env
# Archivo .env
MYSQL_HOST=containers-us-west-xxx.railway.app
MYSQL_PORT=6543
MYSQL_DATABASE=sgp_rea_productions
MYSQL_USERNAME=sgp_app
MYSQL_PASSWORD=password_seguro_aqui
MYSQL_CONNECTION_URL=mysql://sgp_app:password@host:6543/sgp_rea_productions
```

### **PASO 2: CONFIGURACIÓN DE MongoDB Atlas**

#### 2.1 Crear Cluster en MongoDB Atlas
```bash
# 1. Ir a https://cloud.mongodb.com
# 2. Crear cuenta gratuita
# 3. Crear nuevo cluster (M0 gratuito para prototipo)
# 4. Configurar usuario de base de datos
# 5. Agregar IP address (0.0.0.0/0 para desarrollo)
```

#### 2.2 Ejecutar Script de Configuración
```javascript
// Conectar con MongoDB Compass o mongosh
// Ejecutar: database_setup_mongodb.js

// Verificar instalación:
show collections
db.project_files.countDocuments()
db.system_logs.countDocuments()
```

#### 2.3 Variables de Entorno MongoDB
```env
# Archivo .env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/sgp_rea_productions?retryWrites=true&w=majority
MONGODB_DATABASE=sgp_rea_productions
```

### **PASO 3: CONFIGURACIÓN DE ALMACENAMIENTO (Google Cloud)**

#### 3.1 Configurar Google Cloud Storage
```bash
# 1. Crear proyecto en Google Cloud Console
# 2. Habilitar Google Cloud Storage API
# 3. Crear bucket para archivos
gsutil mb gs://sgp-rea-productions-files

# 4. Configurar CORS para acceso web
gsutil cors set cors-config.json gs://sgp-rea-productions-files
```

#### 3.2 Archivo de Configuración CORS
```json
// cors-config.json
[
  {
    "origin": ["http://localhost:3000", "https://tu-dominio.com"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "responseHeader": ["Content-Type", "Authorization"],
    "maxAgeSeconds": 3600
  }
]
```

#### 3.3 Variables de Entorno Storage
```env
# Archivo .env
GOOGLE_CLOUD_PROJECT_ID=tu-proyecto-id
GOOGLE_CLOUD_BUCKET=sgp-rea-productions-files
GOOGLE_APPLICATION_CREDENTIALS=/ruta/al/service-account.json
STORAGE_BASE_URL=https://storage.googleapis.com/sgp-rea-productions-files/
```

### **PASO 4: CONFIGURACIÓN DE SERVICIOS EXTERNOS**

#### 4.1 SendGrid para Emails
```env
# Variables de entorno
SENDGRID_API_KEY=SG.tu-api-key-aqui
SENDGRID_FROM_EMAIL=noreply@reaproductions.com
SENDGRID_FROM_NAME=REA Productions Sistema
```

#### 4.2 Slack para Notificaciones
```env
# Variables de entorno
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
SLACK_CHANNEL_ALERTS=#sgp-alerts
SLACK_CHANNEL_CRITICAL=#sgp-critical
```

### **PASO 5: CONFIGURACIÓN DE DESARROLLO LOCAL**

#### 5.1 Estructura del Proyecto
```
sgp-rea-productions/
├── backend/                 # API Node.js/Express
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── utils/
│   ├── config/
│   │   ├── database.js
│   │   ├── mongodb.js
│   │   └── storage.js
│   ├── package.json
│   └── .env
├── frontend/               # Vue.js + Vuetify
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── router/
│   │   ├── store/
│   │   └── services/
│   ├── public/
│   ├── package.json
│   └── .env
└── docs/                   # Documentación
    ├── api/
    ├── database/
    └── deployment/
```

#### 5.2 Configuración Backend (Node.js)
```json
// package.json
{
  "name": "sgp-rea-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.3",
    "mongoose": "^7.6.3",
    "multer": "^1.4.5",
    "@google-cloud/storage": "^7.5.0",
    "@sendgrid/mail": "^7.7.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "express-rate-limit": "^7.1.5",
    "helmet": "^7.1.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

#### 5.3 Configuración Frontend (Vue.js)
```json
// package.json
{
  "name": "sgp-rea-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.3.8",
    "vuetify": "^3.4.4",
    "@mdi/font": "^7.3.67",
    "vue-router": "^4.2.5",
    "pinia": "^2.1.7",
    "axios": "^1.6.0",
    "chart.js": "^4.4.0",
    "vue-chartjs": "^5.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.5.0",
    "vite": "^5.0.0"
  }
}
```

---

## ⚙️ CONFIGURACIONES ESPECÍFICAS

### **Configuración de Conexión a Bases de Datos**

#### MySQL Connection (backend/config/database.js)
```javascript
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  charset: 'utf8mb4',
  timezone: '-05:00',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
```

#### MongoDB Connection (backend/config/mongodb.js)
```javascript
const mongoose = require('mongoose');

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB conectado exitosamente');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectMongoDB;
```

---

## 🔐 CONFIGURACIÓN DE SEGURIDAD

### **Variables de Entorno Completas**
```env
# Base de datos MySQL
MYSQL_HOST=containers-us-west-xxx.railway.app
MYSQL_PORT=6543
MYSQL_DATABASE=sgp_rea_productions
MYSQL_USERNAME=sgp_app
MYSQL_PASSWORD=tu_password_super_seguro_aqui

# Base de datos MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/sgp_rea_productions?retryWrites=true&w=majority

# Almacenamiento Google Cloud
GOOGLE_CLOUD_PROJECT_ID=sgp-rea-productions
GOOGLE_CLOUD_BUCKET=sgp-rea-productions-files
GOOGLE_APPLICATION_CREDENTIALS=./config/gcp-service-account.json

# Autenticación y seguridad
JWT_SECRET=tu_jwt_secret_super_largo_y_seguro_aqui
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12
SESSION_SECRET=tu_session_secret_aqui

# Servicios externos
SENDGRID_API_KEY=SG.tu-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@reaproductions.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx

# Configuración de aplicación
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
API_BASE_URL=http://localhost:3000/api

# Configuración de archivos
MAX_FILE_SIZE=1073741824
ALLOWED_FILE_TYPES=mp4,avi,mov,jpg,jpeg,png,pdf,doc,docx
```

---

## 🧪 VERIFICACIÓN DE CONFIGURACIÓN

### **Script de Verificación**
```javascript
// scripts/verify-setup.js
const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
const { Storage } = require('@google-cloud/storage');

async function verifySetup() {
    console.log('🔍 Verificando configuración del sistema...\n');
    
    // Verificar MySQL
    try {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USERNAME,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE
        });
        
        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM users');
        console.log('✅ MySQL: Conectado exitosamente');
        console.log(`   - Usuarios registrados: ${rows[0].count}`);
        await connection.end();
    } catch (error) {
        console.log('❌ MySQL: Error de conexión');
        console.log(`   - Error: ${error.message}`);
    }
    
    // Verificar MongoDB
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('✅ MongoDB: Conectado exitosamente');
        console.log(`   - Colecciones disponibles: ${collections.length}`);
        await mongoose.connection.close();
    } catch (error) {
        console.log('❌ MongoDB: Error de conexión');
        console.log(`   - Error: ${error.message}`);
    }
    
    // Verificar Google Cloud Storage
    try {
        const storage = new Storage();
        const [buckets] = await storage.getBuckets();
        console.log('✅ Google Cloud Storage: Conectado exitosamente');
        console.log(`   - Buckets disponibles: ${buckets.length}`);
    } catch (error) {
        console.log('❌ Google Cloud Storage: Error de conexión');
        console.log(`   - Error: ${error.message}`);
    }
    
    console.log('\n🎬 Verificación completada!');
}

verifySetup();
```

---

## 📊 MONITOREO Y ALERTAS

### **Configuración de Alertas Críticas**
```sql
-- Configurar evento para verificar vencimientos diariamente
CREATE EVENT daily_license_check
ON SCHEDULE EVERY 1 DAY
STARTS CONCAT(CURDATE() + INTERVAL 1 DAY, ' 08:00:00')
DO
BEGIN
    -- Insertar alertas para licencias que vencen pronto
    INSERT INTO system_notifications (user_id, notification_type, priority, title, message, related_table, related_id)
    SELECT 
        u.id,
        'license_expiry_critical' as notification_type,
        'critical' as priority,
        CONCAT('🚨 LICENCIA VENCE HOY: ', sd.deal_name) as title,
        CONCAT('La licencia del acuerdo "', sd.deal_name, '" vence HOY (', sd.license_expiry_date, '). ACCIÓN INMEDIATA REQUERIDA.') as message,
        'sponsorship_deals' as related_table,
        sd.id as related_id
    FROM sponsorship_deals sd
    JOIN projects p ON sd.project_id = p.id
    CROSS JOIN users u
    WHERE sd.license_expiry_date = CURDATE()
      AND sd.status = 'activo'
      AND u.role_id IN (1, 3); -- Super admin y gerente patrocinio
END;
```

---

## 🚀 COMANDOS DE DESPLIEGUE

### **Desarrollo Local**
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (nueva terminal)
cd frontend
npm install
npm run dev
```

### **Producción Railway**
```bash
# Configurar Railway CLI
npm install -g @railway/cli
railway login

# Desplegar backend
cd backend
railway deploy

# Desplegar frontend en Vercel
cd frontend
npm run build
# Conectar con Vercel CLI o GitHub
```

---

## ✅ CHECKLIST DE CONFIGURACIÓN

### **Pre-requisitos**
- [ ] Cuenta GitHub configurada
- [ ] Node.js 18+ instalado
- [ ] MySQL client instalado
- [ ] MongoDB Compass instalado

### **Servicios en la Nube**
- [ ] Railway: Proyecto creado y MySQL configurado
- [ ] MongoDB Atlas: Cluster creado y usuario configurado
- [ ] Google Cloud: Proyecto creado y Storage configurado
- [ ] SendGrid: Cuenta creada y API key obtenida
- [ ] Slack: Webhook configurado (opcional)

### **Configuración Local**
- [ ] Repositorio clonado
- [ ] Variables de entorno configuradas
- [ ] Dependencias instaladas (backend y frontend)
- [ ] Base de datos MySQL inicializada
- [ ] Base de datos MongoDB configurada
- [ ] Script de verificación ejecutado exitosamente

### **Testing Inicial**
- [ ] Conexiones a bases de datos funcionando
- [ ] Carga de archivos a Google Cloud Storage
- [ ] Envío de emails de prueba
- [ ] Notificaciones Slack funcionando
- [ ] Dashboard básico cargando

---

## 🎯 PRÓXIMOS PASOS

1. **✅ COMPLETADO:** Scripts de configuración de bases de datos
2. **🔄 EN PROGRESO:** Configuración de servicios externos
3. **⏳ PENDIENTE:** Desarrollo de API backend
4. **⏳ PENDIENTE:** Desarrollo de interfaz frontend
5. **⏳ PENDIENTE:** Testing y depuración
6. **⏳ PENDIENTE:** Despliegue en producción

---

## 📞 SOPORTE

**Para problemas de configuración:**
- Revisar logs en `backend/logs/`
- Ejecutar script de verificación
- Verificar variables de entorno
- Consultar documentación de servicios específicos

**Contactos de emergencia:**
- Administrador de sistema: [email protegido]
- Soporte técnico: [email protegido]
- Documentación completa: `/docs/`

---

*🎬 Sistema de Gestión de Producción REA - Configuración Técnica v1.0*