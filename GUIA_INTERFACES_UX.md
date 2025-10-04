# 🎨 GUÍA DE INTERFACES Y EXPERIENCIA DE USUARIO - SGP REA

## 🎯 PRINCIPIOS DE DISEÑO

### Filosofía Visual
- **Sencillo:** Interfaces limpias sin elementos innecesarios
- **Intuitivo:** Flujo natural que refleje el proceso cinematográfico
- **Visual:** Uso de iconos, colores y elementos gráficos cinematográficos
- **Responsivo:** Funcional en desktop, tablet y móvil

### Paleta de Colores Cinematográfica
```css
/* Colores Principales */
--cine-gold: #FFD700      /* Dorado - Elementos premium/patrocinio */
--film-red: #DC143C       /* Rojo - Alertas críticas */
--reel-black: #1A1A1A     /* Negro - Texto principal */
--screen-silver: #C0C0C0  /* Plateado - Elementos secundarios */
--edit-blue: #4169E1      /* Azul - Acciones/enlaces */
--success-green: #32CD32  /* Verde - Estados completados */
```

---

## 📱 WIREFRAMES DETALLADOS

### 🏠 Dashboard Principal - Gerencia de Producción

```
┌────────────────────────────────────────────────────────────────┐
│ 🎬 SGP REA                          [🔔 3] [👤 Juan P.] [⚙️]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ 📊 RESUMEN DEL PROYECTO: "La Fruta de la Pasión"              │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│ │ 📋 ESCENAS   │ │ 👥 TALENTO   │ │ 📅 RODAJE    │           │
│ │              │ │              │ │              │           │
│ │    45/60     │ │    8/12      │ │    23        │           │
│ │   Listas     │ │  Confirmados │ │  Días Total  │           │
│ │              │ │              │ │              │           │
│ │ ──────────── │ │ ──────────── │ │ ──────────── │           │
│ │ 75% ████░░░  │ │ 67% ███████░ │ │ En Progreso  │           │
│ └──────────────┘ └──────────────┘ └──────────────┘           │
│                                                                │
│ 🚨 ALERTAS IMPORTANTES                                         │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ ⚠️  Presupuesto Talento: 85% utilizado                   │ │
│ │ 📄 Contrato María Pérez pendiente de firma               │ │
│ │ 📍 Permiso locación "Casa Antigua" vence en 5 días       │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                                │
│ 📅 PRÓXIMAS ACTIVIDADES                                       │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ HOY - 14:00                                              │ │
│ │ 🎭 Audición: Helena Adulta - Candidata #3               │ │
│ │                                                          │ │
│ │ MAÑANA - 06:30                                           │ │
│ │ 🎬 Call Sheet: Escena 23 "Confrontación"                │ │
│ │ 📍 Locación: Casa Antigua                               │ │
│ │                                                          │ │
│ │ VIERNES - 10:00                                          │ │
│ │ 🤝 Reunión: Scout nueva locación                        │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                                │
│ [Ver Call Sheet] [Gestionar Casting] [Cronograma Completo]    │
└────────────────────────────────────────────────────────────────┘
```

### 💰 Dashboard - Gerencia de Patrocinio

```
┌────────────────────────────────────────────────────────────────┐
│ 💰 SGP REA - PATROCINIO                     [🔔] [👤] [⚙️]    │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ 💎 PATROCINADORES ACTIVOS                                      │
│                                                                │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 🥇 NIVEL DIAMANTE                                        │ │
│ │ ┌─────────────────────────────────────────────────────┐  │ │
│ │ │ EMPRESA TECNOLÓGICA X                              │  │ │
│ │ │ 💵 $50,000 USD                                      │  │ │
│ │ │ 📅 Vigente hasta: Diciembre 2025                   │  │ │
│ │ │ ✅ Hito 1  ✅ Hito 2  ⏳ Hito 3  ⏸️ Hito 4        │  │ │
│ │ │ [Ver Contrato] [Gestionar Pagos]                   │  │ │
│ │ └─────────────────────────────────────────────────────┘  │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                                │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 🥈 NIVEL PLATINO                                         │ │
│ │ ┌─────────────────────────────────────────────────────┐  │ │
│ │ │ BANCO REGIONAL Y                                    │  │ │
│ │ │ 💵 $25,000 USD                                      │  │ │
│ │ │ 📅 Vigente hasta: Marzo 2026                       │  │ │
│ │ │ ✅ Hito 1  ✅ Hito 2  ✅ Hito 3  ✅ Hito 4        │  │ │
│ │ └─────────────────────────────────────────────────────┘  │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                                │
│ 🚨 ALERTAS CRÍTICAS                                           │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ ⚡ URGENTE: Licencia Sponsor Z expira en 45 días         │ │
│ │ 📧 Email de renovación enviado hace 15 días              │ │
│ │ 💰 Tarifa de mantenimiento: $15,000                      │ │
│ │ [Contactar Sponsor] [Ver Propuesta]                      │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                                │
│ 📊 MÉTRICAS DE IMPACTO (Para Renovaciones)                    │
│ • 🎭 Festivales: 12 participaciones, 3 premios                │
│ • 👁️ Visualizaciones: 2.3M (↑15% vs. mes anterior)           │
│ • 📱 Engagement redes: 450K interacciones                     │
│ • 💹 ROI Promedio: 340%                                       │
│                                                                │
│ [Generar Reporte] [Histórico Pagos] [Nuevos Patrocinadores]   │
└────────────────────────────────────────────────────────────────┘
```

### 🎭 Panel de Casting

```
┌────────────────────────────────────────────────────────────────┐
│ 🎭 CASTING: "La Fruta de la Pasión"                           │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ 📋 PERSONAJES                      🔍 [Buscar actores...]     │
│                                                                │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 👩 HELENA ADULTA (Protagónica)                           │ │
│ │ ─────────────────────────────────────────────────────────  │ │
│ │                                                          │ │
│ │ CANDIDATAS:                                              │ │
│ │ ┌────────────┬────────────┬────────────┬──────────────┐ │ │
│ │ │[📸]        │[📸]        │[📸]        │[📸]          │ │ │
│ │ │María Pérez │Ana García  │Sofía López │Carmen Torres │ │ │
│ │ │⭐⭐⭐⭐⭐    │⭐⭐⭐⭐☆    │⭐⭐⭐☆☆    │⭐⭐☆☆☆      │ │ │
│ │ │▶️ Self-tape │▶️ Self-tape │▶️ Audición │▶️ Self-tape  │ │ │
│ │ │💚 SELECCIONADA│🔄 CALLBACK │⏳ PENDIENTE│❌ DESCARTADA│ │ │
│ │ │$15K aprobado│Sal. prop: $12K│Disponible │-           │ │ │
│ │ └────────────┴────────────┴────────────┴──────────────┘ │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                                │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 👨 RICARDO (Secundario)                                  │ │
│ │ ─────────────────────────────────────────────────────────  │ │
│ │ 🔍 Casting abierto - 23 postulaciones                   │ │
│ │ ⏰ Deadline: 15 de Octubre                               │ │
│ │ [Ver Candidatos] [Programar Audiciones]                 │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                                │
│ 📊 RESUMEN DE CASTING                                          │
│ • ✅ Confirmados: 3/8 personajes principales                  │
│ • ⏳ En proceso: 4/8 personajes                              │
│ • 🔍 Por convocar: 1/8 personajes                            │
│ • 👥 Extras requeridos: 45 personas                           │
│                                                                │
│ [Nueva Convocatoria] [Matriz Completa] [Exportar Lista]       │
└────────────────────────────────────────────────────────────────┘
```

### 📱 Interfaz Móvil - Call Sheet

```
┌─────────────────────┐
│ 📱 CALL SHEET       │
│ Escena 23           │
├─────────────────────┤
│                     │
│ 🎬 "CONFRONTACIÓN"  │
│ Interior - Día      │
│                     │
│ 📍 LOCACIÓN         │
│ Casa Antigua        │
│ Calle 45 #23-67     │
│ 📞 Juan: 555-0123   │
│ 🗺️ [Ver Mapa]       │
│                     │
│ ⏰ LLAMADOS         │
│ ┌─────────────────┐ │
│ │ 06:30 - CREW    │ │
│ │ • Director      │ │
│ │ • Foto Principal│ │
│ │ • Sonido        │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ 07:00 - TALENTO │ │
│ │ • María Pérez   │ │
│ │   (Helena)      │ │
│ │ • Carlos Ruiz   │ │
│ │   (Ricardo)     │ │
│ └─────────────────┘ │
│                     │
│ 🎯 EQUIPO NECESARIO │
│ • Cámara RED        │
│ • Kit Iluminación   │
│ • Micrófono Boom    │
│                     │
│ ✅ [CONFIRMAR       │
│     ASISTENCIA]     │
│                     │
│ 📞 [CONTACTAR       │
│     PRODUCCIÓN]     │
└─────────────────────┘
```

---

## 🎨 COMPONENTES DE INTERFAZ

### Cards de Estado
```css
/* Tarjetas de proyecto */
.project-card {
  background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
  border-left: 4px solid var(--cine-gold);
  border-radius: 12px;
  padding: 20px;
  color: white;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}

.progress-bar {
  background: linear-gradient(90deg, var(--cine-gold), var(--film-red));
  height: 6px;
  border-radius: 3px;
  animation: shimmer 2s infinite;
}
```

### Alertas Cinematográficas
```html
<!-- Alerta Crítica -->
<div class="alert alert-critical">
  <span class="icon">🚨</span>
  <div class="content">
    <h4>CRÍTICO: Licencia expira en 30 días</h4>
    <p>Sponsor Diamante requiere renovación inmediata</p>
  </div>
  <button class="btn-action">Actuar</button>
</div>

<!-- Alerta Información -->
<div class="alert alert-info">
  <span class="icon">📢</span>
  <div class="content">
    <h4>Call Sheet generado</h4>
    <p>Escena 24 programada para mañana 06:30</p>
  </div>
</div>
```

### Navegación Modular
```
┌─────────────────────────────────────────┐
│ 🎬 SGP REA                              │
├─────────────────────────────────────────┤
│ 🏠 Dashboard                            │
│ ┌─────────────────────────────────────┐ │
│ │ 📋 PRODUCCIÓN                       │ │
│ │ • Guiones y Escenas                 │ │
│ │ • Cronograma de Rodaje              │ │
│ │ • Locaciones                        │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 🎭 TALENTO                          │ │
│ │ • Casting                           │ │
│ │ • Contratos                         │ │
│ │ • Evaluaciones                      │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 💰 PATROCINIO (Solo si autorizado)  │ │
│ │ • Dashboard Sponsors                │ │
│ │ • Tracker Pagos                     │ │
│ │ • Alertas Renovación                │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 🎥 DISTRIBUCIÓN                     │ │
│ │ • Festivales                        │ │
│ │ • Plataformas                       │ │
│ │ • Reportes                          │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 📊 FLUJOS DE USUARIO

### Flujo 1: Evaluación de Audición
```
1. [Director] Recibe notificación de nueva audición
   ↓
2. [Sistema] Muestra video en player integrado
   ↓
3. [Director] Califica 1-5 estrellas + comentarios
   ↓
4. [Sistema] Notifica a Gerente de Producción
   ↓
5. [Gerente] Revisa evaluación + consulta presupuesto
   ↓
6. [Sistema] Actualiza estado: Callback/Seleccionado/Descartado
```

### Flujo 2: Alerta de Renovación de Patrocinio
```
1. [Sistema] Detecta licencia próxima a vencer (90 días)
   ↓
2. [Sistema] Genera alerta automática
   ↓
3. [Gerente Patrocinio] Recibe notificación email + dashboard
   ↓
4. [Sistema] Genera reporte de impacto automático
   ↓
5. [Gerente] Descarga PDF para presentar a sponsor
   ↓
6. [Gerente] Actualiza estado renovación en sistema
```

---

## 🎯 EXPERIENCIA DE USUARIO POR DISPOSITIVO

### 💻 Desktop (Trabajo Principal)
- **Dashboard completo** con múltiples widgets
- **Navegación lateral** persistente
- **Múltiples ventanas** para flujos complejos
- **Drag & drop** para cronogramas
- **Vista de tabla** para datos extensos

### 📱 Móvil (Campo/Set)
- **Call sheets** optimizados
- **Contactos rápidos** con un toque
- **Confirmación** de asistencia
- **Mapas** integrados para locaciones
- **Cámara** para captura de evidencias

### 🖥️ Tablet (Reuniones/Presentaciones)
- **Dashboards** adaptados para presentar
- **Evaluación** de audiciones táctil
- **Firma digital** de contratos
- **Revisión** de cronogramas visuales

---

## 🔄 ESTADOS DE LA APLICACIÓN

### Estados de Proyecto
```css
.status-desarrollo { background: #4169E1; } /* Azul */
.status-preproduccion { background: #FFD700; } /* Dorado */
.status-rodaje { background: #DC143C; } /* Rojo */
.status-postproduccion { background: #32CD32; } /* Verde */
.status-distribucion { background: #8A2BE2; } /* Violeta */
```

### Estados de Contratación
```html
<span class="badge badge-selected">✅ Seleccionado</span>
<span class="badge badge-negotiation">🔄 Negociación</span>
<span class="badge badge-signed">📝 Contrato Firmado</span>
<span class="badge badge-rejected">❌ Descartado</span>
```

### Estados de Pago
```html
<span class="payment-status paid">✅ Pagado</span>
<span class="payment-status pending">⏳ Pendiente</span>
<span class="payment-status overdue">🚨 Vencido</span>
<span class="payment-status scheduled">📅 Programado</span>
```

---

## 📱 NOTIFICACIONES Y ALERTAS

### Tipos de Notificación

#### 🚨 Críticas (Rojas)
- Licencias de patrocinio venciendo
- Pagos vencidos
- Contratos no firmados cerca del rodaje

#### ⚠️ Importantes (Naranjas)
- Presupuesto llegando al límite
- Permisos próximos a vencer
- Audiciones pendientes de evaluación

#### 📢 Informativas (Azules)
- Nuevas audiciones recibidas
- Call sheets generados
- Actualizaciones de cronograma

### Sistema de Notificaciones
```javascript
// Ejemplo de configuración
notifications: {
  critical: {
    email: true,
    push: true,
    sms: true,
    dashboard: true
  },
  important: {
    email: true,
    push: true,
    dashboard: true
  },
  info: {
    push: true,
    dashboard: true
  }
}
```

---

## 🎨 THEMES Y PERSONALIZACIÓN

### Tema Oscuro (Principal)
```css
:root {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --text-primary: #ffffff;
  --text-secondary: #c0c0c0;
  --accent: #FFD700;
}
```

### Tema Claro (Opcional)
```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --accent: #DC143C;
}
```

---

Esta guía de interfaces garantiza que tu SGP tenga una experiencia visual profesional, intuitiva y completamente alineada con la industria cinematográfica. 🎬✨