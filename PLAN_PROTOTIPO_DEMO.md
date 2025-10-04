# 🎬 PLAN DE PROTOTIPO SGP REA - DEMO FUNCIONAL

## 🎯 OBJETIVO DEL PROTOTIPO

Crear una **demostración funcional** del Sistema de Gestión de Producción que permita:
- ✅ **Validar conceptos** con stakeholders
- ✅ **Demostrar valor** a potenciales patrocinadores  
- ✅ **Obtener feedback** temprano del equipo
- ✅ **Facilitar cotizaciones** de desarrolladores
- ✅ **Proof of concept** técnico

---

## 🏗️ ARQUITECTURA DEL PROTOTIPO

### Stack Tecnológico Simplificado
```
Frontend: Vue.js + Vuetify (Material Design)
Backend: Node.js + Express (Rápido desarrollo)
BD Relacional: MySQL (Datos estructurados críticos)
BD NoSQL: MongoDB Atlas (Datos flexibles y archivos)
Hosting: Vercel (Frontend) + Railway (Backend)
```

### Arquitectura de Datos Híbrida
```
MySQL (Crítico)                 MongoDB Atlas (Flexible)
├── users                      ├── file_metadata
├── projects                   ├── activity_logs  
├── sponsors                   ├── notifications
├── sponsorship_contracts      ├── ui_preferences
├── payment_milestones         ├── analytics_data
├── characters                 └── temp_uploads
├── actors
└── auditions
```

---

## 📋 FUNCIONALIDADES DEL PROTOTIPO

### 🎯 CORE FEATURES (Mínimo Viable)

#### 🏠 Dashboard Principal
- [x] Login con roles (Producción/Patrocinio)
- [x] Vista general del proyecto
- [x] Métricas básicas visuales
- [x] Alertas de ejemplo

#### 💰 Módulo Patrocinio (CRÍTICO)
- [x] Lista de patrocinadores
- [x] Dashboard con niveles (Diamante/Platino)
- [x] **Simulador de alertas** de renovación
- [x] Tracker de pagos visual
- [x] Carga/vista de contratos (PDF)

#### 🎭 Módulo Casting
- [x] Matriz de personajes
- [x] Evaluación de audiciones (con videos de demo)
- [x] Estados de contratación
- [x] Formulario de nueva audición

#### 📱 Vista Móvil
- [x] Call sheet responsive
- [x] Contactos rápidos
- [x] Confirmación de asistencia

### 🎨 ELEMENTOS VISUALES
- [x] Paleta cinematográfica (dorado/negro/rojo)
- [x] Iconografía de producción
- [x] Gráficos de progreso animados
- [x] Cards con estados visuales

---

## 🗄️ ESTRUCTURA DE BASES DE DATOS

### MySQL - Tablas Esenciales

```sql
-- Usuarios y Seguridad
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('gerente_produccion', 'gerente_patrocinio', 'director') NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Proyectos
CREATE TABLE projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    status ENUM('desarrollo', 'preproduccion', 'rodaje', 'postproduccion') DEFAULT 'desarrollo',
    budget_total DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patrocinadores (CRÍTICO)
CREATE TABLE sponsors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_name VARCHAR(200) NOT NULL,
    sponsor_level ENUM('diamante', 'platino', 'oro', 'plata') NOT NULL,
    total_contribution DECIMAL(15,2) NOT NULL,
    contact_email VARCHAR(200),
    logo_url VARCHAR(500),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contratos de Patrocinio
CREATE TABLE sponsorship_contracts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sponsor_id INT REFERENCES sponsors(id),
    project_id INT REFERENCES projects(id),
    total_amount DECIMAL(15,2) NOT NULL,
    effective_start_date DATE NOT NULL,
    effective_end_date DATE NOT NULL,
    maintenance_fee DECIMAL(12,2),
    status ENUM('active', 'expired', 'renewed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- HIttos de Pago (SUPER CRÍTICO)
CREATE TABLE payment_milestones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    contract_id INT REFERENCES sponsorship_contracts(id),
    milestone_name VARCHAR(200) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE NULL,
    status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Personajes
CREATE TABLE characters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT REFERENCES projects(id),
    name VARCHAR(200) NOT NULL,
    character_type ENUM('principal', 'secundario', 'extra') NOT NULL,
    age_range VARCHAR(50),
    description TEXT,
    estimated_salary DECIMAL(10,2),
    status ENUM('abierto', 'casting', 'seleccionado', 'contratado') DEFAULT 'abierto',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Actores
CREATE TABLE actors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(200),
    phone VARCHAR(20),
    headshot_url VARCHAR(500),
    reel_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audiciones
CREATE TABLE auditions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    character_id INT REFERENCES characters(id),
    actor_id INT REFERENCES actors(id),
    audition_type ENUM('self_tape', 'presencial', 'callback') NOT NULL,
    video_url VARCHAR(500),
    director_rating INT CHECK (director_rating >= 1 AND director_rating <= 5),
    director_notes TEXT,
    status ENUM('pendiente', 'evaluada', 'seleccionada', 'descartada') DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### MongoDB Collections

```javascript
// file_metadata - Metadatos de archivos
{
  _id: ObjectId,
  file_type: "script|video|image|document",
  original_name: "guion_v1.pdf",
  file_size: 2048576,
  mime_type: "application/pdf",
  upload_date: ISODate(),
  uploaded_by: "user_id",
  project_id: "project_id",
  tags: ["guion", "version_1", "final"],
  storage_url: "https://storage.googleapis.com/...",
  thumbnail_url: "https://...",
  metadata: {
    pages: 120,
    duration: 7200, // para videos
    resolution: "1920x1080" // para videos/imágenes
  }
}

// activity_logs - Logs de actividad
{
  _id: ObjectId,
  user_id: "user_id",
  action: "LOGIN|CREATE|UPDATE|DELETE|VIEW",
  resource_type: "project|sponsor|contract|audition",
  resource_id: "resource_id",
  details: {
    old_values: {...},
    new_values: {...},
    ip_address: "192.168.1.1",
    user_agent: "Mozilla/5.0..."
  },
  timestamp: ISODate()
}

// notifications - Notificaciones del sistema
{
  _id: ObjectId,
  user_id: "user_id",
  type: "license_expiry|payment_overdue|audition_received",
  priority: "low|medium|high|critical",
  title: "Licencia expira en 30 días",
  message: "El contrato del Sponsor X expira el...",
  related_resource: {
    type: "contract",
    id: "contract_id"
  },
  channels: {
    email: true,
    push: true,
    sms: false
  },
  status: "pending|sent|read",
  created_at: ISODate(),
  read_at: ISODate()
}

// analytics_data - Métricas y analytics
{
  _id: ObjectId,
  project_id: "project_id",
  metric_type: "budget_usage|scene_progress|casting_status",
  date: ISODate(),
  values: {
    total_budget: 100000,
    used_budget: 75000,
    percentage: 75,
    breakdown: {
      talent: 45000,
      equipment: 20000,
      locations: 10000
    }
  }
}
```

---

## 🎨 DATOS DE DEMOSTRACIÓN

### Proyecto Demo: "La Fruta de la Pasión"
```sql
INSERT INTO projects (title, status, budget_total) VALUES 
('La Fruta de la Pasión', 'preproduccion', 250000.00);

INSERT INTO sponsors (company_name, sponsor_level, total_contribution, contact_email) VALUES
('TechCorp Solutions', 'diamante', 50000.00, 'marketing@techcorp.com'),
('Banco Regional', 'platino', 25000.00, 'patrocinio@bancoregional.com'),
('Café Premium', 'oro', 15000.00, 'brand@cafepremium.com');

INSERT INTO characters (project_id, name, character_type, age_range, description, status) VALUES
(1, 'Helena Adulta', 'principal', '28-35', 'Protagonista, mujer fuerte y decidida', 'casting'),
(1, 'Ricardo', 'secundario', '30-40', 'Interés romántico, personaje complejo', 'abierto'),
(1, 'Madre de Helena', 'secundario', '50-60', 'Figura materna protectora', 'seleccionado');

INSERT INTO actors (first_name, last_name, email, phone) VALUES
('María', 'Pérez', 'maria.perez@email.com', '+57-300-123-4567'),
('Ana', 'García', 'ana.garcia@email.com', '+57-300-234-5678'),
('Sofía', 'López', 'sofia.lopez@email.com', '+57-300-345-6789');
```

---

## 📱 WIREFRAMES DEL PROTOTIPO

### Login Screen
```
┌─────────────────────────────────┐
│           🎬 SGP REA            │
│       Sistema de Gestión        │
│         de Producción           │
├─────────────────────────────────┤
│                                 │
│    📧 [email@ejemplo.com     ]  │
│    🔒 [******************    ]  │
│                                 │
│    🎭 ( ) Gerente Producción    │
│    💰 (•) Gerente Patrocinio    │
│    🎬 ( ) Director              │
│                                 │
│         [🎬 INGRESAR]           │
│                                 │
│    ¿Primera vez? Crear cuenta   │
└─────────────────────────────────┘
```

### Dashboard Patrocinio (Demo)
```
┌─────────────────────────────────────────┐
│ 💰 SGP REA - Patrocinio  [🔔 2] [👤]   │
├─────────────────────────────────────────┤
│ 📊 RESUMEN FINANCIERO                   │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐     │
│ │ $90K    │ │ $15K    │ │ 340%    │     │
│ │ Total   │ │ Pendiente│ │ ROI     │     │
│ │ Activo  │ │ Pago    │ │ Promedio│     │
│ └─────────┘ └─────────┘ └─────────┘     │
│                                         │
│ 💎 PATROCINADORES                       │
│ ┌─────────────────────────────────────┐ │
│ │ 🥇 TechCorp Solutions (DIAMANTE)    │ │
│ │ $50,000 • Expira: Dic 2025         │ │
│ │ ✅ Hito 1  ✅ Hito 2  ⏳ Hito 3    │ │
│ │ [Ver Contrato] [Gestionar]         │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 🚨 ALERTAS CRÍTICAS                     │
│ ⚡ Renovación TechCorp en 45 días       │
│ 💰 Pago Banco Regional vencido         │
│                                         │
│ [+ Nuevo Patrocinador] [Reportes]       │
└─────────────────────────────────────────┘
```

---

## 🛠️ PLAN DE DESARROLLO DEL PROTOTIPO

### Semana 1: Fundación
**Días 1-2: Setup Técnico**
- [ ] Crear repositorio GitHub
- [ ] Setup Node.js + Express backend
- [ ] Setup Vue.js + Vuetify frontend
- [ ] Configurar MySQL en Railway
- [ ] Configurar MongoDB Atlas
- [ ] Conexión entre servicios

**Días 3-5: Base de Datos y Auth**
- [ ] Crear esquemas MySQL
- [ ] Seed data (datos de demo)
- [ ] Sistema de autenticación JWT
- [ ] Middleware de roles y permisos
- [ ] APIs básicas CRUD

### Semana 2: Funcionalidades Core
**Días 1-3: Dashboard y Patrocinio**
- [ ] Dashboard principal con métricas
- [ ] Lista de patrocinadores
- [ ] Vista detalle de contratos
- [ ] Simulador de alertas
- [ ] Tracker de pagos visual

**Días 4-5: Casting y Móvil**
- [ ] Lista de personajes
- [ ] Formulario de audiciones
- [ ] Evaluación con ratings
- [ ] Vista móvil call sheet
- [ ] Responsive design completo

### Semana 3: Pulimiento y Demo
**Días 1-2: UX y Visuales**
- [ ] Aplicar paleta cinematográfica
- [ ] Animaciones y transiciones
- [ ] Iconografía custom
- [ ] Loading states
- [ ] Error handling

**Días 3-5: Demo Ready**
- [ ] Data poblada realista
- [ ] Flujos completos funcionales
- [ ] Testing en dispositivos
- [ ] Deploy en Vercel + Railway
- [ ] URL demo lista para presentar

---

## 💰 PRESUPUESTO DEL PROTOTIPO

### Desarrollo (3 semanas)
| Concepto | Horas | Costo |
|----------|-------|-------|
| Desarrollador Full-Stack | 120h | $7,200 - $12,000 |
| UX/UI Design | 20h | $1,200 - $2,000 |
| **TOTAL DESARROLLO** | | **$8,400 - $14,000** |

### Hosting y Servicios (Primeros 3 meses)
| Servicio | Costo Mensual |
|----------|---------------|
| Railway (Backend + MySQL) | $5 - $20 |
| MongoDB Atlas (512MB) | $0 (Free tier) |
| Vercel (Frontend) | $0 (Free tier) |
| Dominio .com | $12/año |
| **TOTAL MENSUAL** | **$5 - $20** |

---

## 🎯 VALOR DEL PROTOTIPO

### Para el Negocio
- ✅ **Demostración tangible** del concepto
- ✅ **Herramienta de ventas** para patrocinadores
- ✅ **Validación** con usuarios reales
- ✅ **Proof of concept** para inversionistas

### Para el Desarrollo
- ✅ **Arquitectura validada** técnicamente  
- ✅ **Base de código** reutilizable
- ✅ **Feedback temprano** de usabilidad
- ✅ **Estimaciones** más precisas

### ROI Esperado
- 📈 **Acelera** decisión de patrocinadores
- 💰 **Reduce riesgo** de desarrollo completo
- 🎯 **Aumenta probabilidad** de funding
- ⚡ **Acorta** tiempo de development

---

## 🚀 PRÓXIMOS PASOS

### Esta Semana
1. **Validar concepto** de prototipo con equipo
2. **Aprobar presupuesto** (~$10K + hosting)
3. **Contratar desarrollador** para prototipo
4. **Definir URL** demo (ej: demo.sgp-rea.com)

### Próximas 3 Semanas  
1. **Desarrollo** según cronograma
2. **Testing** con usuarios internos
3. **Refinamiento** basado en feedback
4. **Demo lista** para presentaciones

---

## 📞 SIGUIENTES ACCIONES

¿Estás listo para proceder con el prototipo? Los próximos pasos serían:

1. ✅ **Aprobar el plan y presupuesto**
2. 🔍 **Buscar desarrollador** (o trabajar con uno existente)
3. 🚀 **Iniciar desarrollo** inmediatamente
4. 📅 **Agendar demo** en 3 semanas

**El prototipo funcionará como tu mejor herramienta de ventas y validación técnica.** 🎬✨

---

*Plan de Prototipo SGP REA - Octubre 2025*