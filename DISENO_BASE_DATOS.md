# 🗄️ DISEÑO DE BASE DE DATOS - SGP REA

## 📋 ESQUEMA COMPLETO DE LA BASE DE DATOS

### 🎯 PRINCIPIOS DE DISEÑO

1. **Modularidad:** Cada módulo tiene sus tablas principales claramente separadas
2. **Seguridad:** Separación estricta de datos sensibles (patrocinio) 
3. **Integridad:** Relaciones bien definidas con llaves foráneas
4. **Escalabilidad:** Diseño que permite crecimiento futuro
5. **Auditoría:** Campos de timestamp y usuario en todas las tablas críticas

---

## 👥 MÓDULO: USUARIOS Y SEGURIDAD

### Tabla: users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    is_active BOOLEAN DEFAULT true,
    phone VARCHAR(20),
    avatar_url VARCHAR(255),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: roles
```sql
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- 'gerente_produccion', 'gerente_patrocinio', 'director', etc.
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL, -- {"module_1": ["read", "write"], "module_3": ["read"]}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: user_sessions
```sql
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🎬 MÓDULO 1: GESTIÓN DE DESARROLLO Y PRODUCCIÓN

### Tabla: projects
```sql
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'desarrollo', -- desarrollo, preproduccion, rodaje, postproduccion, distribucion
    genre VARCHAR(100),
    target_duration INTEGER, -- minutos
    budget_total DECIMAL(12,2),
    start_date DATE,
    end_date DATE,
    director_id INTEGER REFERENCES users(id),
    producer_id INTEGER REFERENCES users(id),
    poster_url VARCHAR(255),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: scripts
```sql
CREATE TABLE scripts (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    title VARCHAR(200) NOT NULL,
    version VARCHAR(20) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(20), -- 'pdf', 'fdx', 'fountain', etc.
    file_size INTEGER,
    page_count INTEGER,
    scene_count INTEGER,
    is_current BOOLEAN DEFAULT false,
    notes TEXT,
    uploaded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: scenes
```sql
CREATE TABLE scenes (
    id SERIAL PRIMARY KEY,
    script_id INTEGER REFERENCES scripts(id),
    scene_number VARCHAR(20) NOT NULL,
    scene_title VARCHAR(200),
    location_type VARCHAR(50), -- 'interior', 'exterior'
    time_of_day VARCHAR(50), -- 'dia', 'noche', 'amanecer', 'atardecer'
    location_id INTEGER REFERENCES locations(id),
    page_start DECIMAL(4,2),
    page_end DECIMAL(4,2),
    estimated_duration INTEGER, -- minutos
    description TEXT,
    status VARCHAR(50) DEFAULT 'pendiente', -- pendiente, filmada, editada
    shoot_date DATE,
    shoot_order INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: locations 
```sql
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    location_type VARCHAR(100), -- 'casa', 'oficina', 'parque', 'estudio', etc.
    contact_name VARCHAR(100),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    rental_cost DECIMAL(10,2),
    availability_notes TEXT,
    permit_required BOOLEAN DEFAULT false,
    permit_expiry DATE,
    photos JSONB, -- ["url1", "url2", "url3"]
    coordinates JSONB, -- {"lat": -4.123, "lng": -74.456}
    facilities JSONB, -- ["parking", "restrooms", "power", "wifi"]
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: shooting_schedule
```sql
CREATE TABLE shooting_schedule (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    scene_id INTEGER REFERENCES scenes(id),
    shoot_date DATE NOT NULL,
    call_time TIME NOT NULL,
    wrap_time TIME,
    location_id INTEGER REFERENCES locations(id),
    crew_call_time TIME,
    talent_call_time TIME,
    setup_notes TEXT,
    weather_backup_plan TEXT,
    status VARCHAR(50) DEFAULT 'programada', -- programada, en_progreso, completada, cancelada
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: assets_inventory
```sql
CREATE TABLE assets_inventory (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100), -- 'utileria', 'vestuario', 'equipo_tecnico'
    subcategory VARCHAR(100),
    description TEXT,
    quantity INTEGER DEFAULT 1,
    condition VARCHAR(50), -- 'nuevo', 'bueno', 'regular', 'malo'
    acquisition_cost DECIMAL(10,2),
    rental_cost_daily DECIMAL(10,2),
    supplier_info TEXT,
    storage_location VARCHAR(200),
    photos JSONB,
    status VARCHAR(50) DEFAULT 'disponible', -- disponible, en_uso, mantenimiento, perdido
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🎭 MÓDULO 2: GESTIÓN DE TALENTO Y CONTRATACIÓN

### Tabla: characters
```sql
CREATE TABLE characters (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    name VARCHAR(200) NOT NULL,
    character_type VARCHAR(50), -- 'principal', 'secundario', 'extra'
    age_range VARCHAR(50),
    gender VARCHAR(50),
    ethnicity VARCHAR(100),
    description TEXT,
    personality TEXT,
    wardrobe_notes TEXT,
    special_requirements TEXT,
    scenes_count INTEGER DEFAULT 0,
    estimated_salary DECIMAL(10,2),
    casting_deadline DATE,
    status VARCHAR(50) DEFAULT 'abierto', -- abierto, en_casting, seleccionado, contratado
    priority INTEGER DEFAULT 1, -- 1=alta, 2=media, 3=baja
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: actors
```sql
CREATE TABLE actors (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    stage_name VARCHAR(200),
    email VARCHAR(200),
    phone VARCHAR(20),
    agent_name VARCHAR(200),
    agent_email VARCHAR(200),
    agent_phone VARCHAR(20),
    birth_date DATE,
    gender VARCHAR(50),
    ethnicity VARCHAR(100),
    height INTEGER, -- cm
    eye_color VARCHAR(50),
    hair_color VARCHAR(50),
    city VARCHAR(100),
    country VARCHAR(100),
    headshot_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    reel_url VARCHAR(500),
    instagram_handle VARCHAR(100),
    experience_level VARCHAR(50), -- 'novato', 'intermedio', 'profesional', 'veterano'
    union_member BOOLEAN DEFAULT false,
    union_name VARCHAR(100),
    languages JSONB, -- ["español", "inglés", "francés"]
    special_skills JSONB, -- ["canto", "baile", "artes marciales"]
    availability_start DATE,
    availability_end DATE,
    base_rate DECIMAL(10,2),
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: auditions
```sql
CREATE TABLE auditions (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id),
    actor_id INTEGER REFERENCES actors(id),
    audition_type VARCHAR(50), -- 'self_tape', 'presencial', 'callback'
    audition_date TIMESTAMP,
    video_url VARCHAR(500),
    notes TEXT,
    director_rating INTEGER CHECK (director_rating >= 1 AND director_rating <= 5),
    director_notes TEXT,
    producer_rating INTEGER CHECK (producer_rating >= 1 AND producer_rating <= 5),
    producer_notes TEXT,
    overall_rating DECIMAL(3,2), -- promedio calculado
    status VARCHAR(50) DEFAULT 'pendiente', -- pendiente, evaluada, callback, seleccionada, descartada
    evaluated_by INTEGER REFERENCES users(id),
    evaluated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: talent_contracts
```sql
CREATE TABLE talent_contracts (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    character_id INTEGER REFERENCES characters(id),
    actor_id INTEGER REFERENCES actors(id),
    contract_type VARCHAR(50), -- 'principal', 'secundario', 'extra', 'day_player'
    salary_amount DECIMAL(12,2) NOT NULL,
    salary_currency VARCHAR(10) DEFAULT 'USD',
    payment_schedule VARCHAR(100), -- 'upfront', '50_50', 'weekly', 'completion'
    start_date DATE,
    end_date DATE,
    exclusivity_clause BOOLEAN DEFAULT false,
    usage_rights TEXT,
    contract_file_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'draft', -- draft, sent, negotiating, signed, cancelled
    signed_date DATE,
    signed_by_actor BOOLEAN DEFAULT false,
    signed_by_production BOOLEAN DEFAULT false,
    agent_commission DECIMAL(5,2), -- porcentaje
    union_rates_applied BOOLEAN DEFAULT false,
    special_clauses TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: extras_management
```sql
CREATE TABLE extras_management (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    scene_id INTEGER REFERENCES scenes(id),
    category VARCHAR(100), -- 'multitud', 'transeuntes', 'clientes_restaurante', etc.
    quantity_needed INTEGER NOT NULL,
    quantity_confirmed INTEGER DEFAULT 0,
    age_range VARCHAR(50),
    wardrobe_requirements TEXT,
    special_requirements TEXT,
    shoot_date DATE,
    call_time TIME,
    estimated_wrap_time TIME,
    rate_per_person DECIMAL(8,2),
    meal_provided BOOLEAN DEFAULT false,
    transportation_provided BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'open', -- open, casting, confirmed, completed
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 💰 MÓDULO 3: GESTIÓN DE PATROCINIO Y LEGAL (CRÍTICO)

### Tabla: sponsors
```sql
CREATE TABLE sponsors (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(200) NOT NULL,
    brand_name VARCHAR(200),
    industry_category VARCHAR(100),
    sponsor_level VARCHAR(50), -- 'diamante', 'platino', 'oro', 'plata'
    total_contribution DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- Información de contacto
    primary_contact_name VARCHAR(200),
    primary_contact_title VARCHAR(200),
    primary_contact_email VARCHAR(200),
    primary_contact_phone VARCHAR(20),
    
    -- Información comercial
    company_address TEXT,
    company_website VARCHAR(200),
    tax_id VARCHAR(50),
    
    -- Exclusividad
    category_exclusivity VARCHAR(200), -- 'tecnologia', 'banca', 'automotriz', etc.
    territorial_exclusivity VARCHAR(200), -- 'nacional', 'regional', 'global'
    
    -- Activos de marca
    logo_url VARCHAR(500),
    brand_guidelines_url VARCHAR(500),
    
    -- Estado
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, blacklisted
    reputation_score INTEGER DEFAULT 5, -- 1-10
    
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: sponsorship_contracts
```sql
CREATE TABLE sponsorship_contracts (
    id SERIAL PRIMARY KEY,
    sponsor_id INTEGER REFERENCES sponsors(id),
    project_id INTEGER REFERENCES projects(id),
    contract_title VARCHAR(200) NOT NULL,
    contract_file_url VARCHAR(500),
    
    -- Fechas del contrato
    signature_date DATE,
    effective_start_date DATE NOT NULL,
    effective_end_date DATE NOT NULL,
    maintenance_period_months INTEGER DEFAULT 24,
    
    -- Términos financieros
    total_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_structure VARCHAR(100), -- 'hitos', 'mensual', 'upfront'
    maintenance_fee DECIMAL(12,2), -- Tarifa de mantenimiento post-lanzamiento
    
    -- Beneficios acordados
    logo_placement JSONB, -- {"opening_credits": true, "end_credits": true, "poster": false}
    social_media_mentions INTEGER DEFAULT 0,
    behind_scenes_content BOOLEAN DEFAULT false,
    premiere_tickets INTEGER DEFAULT 0,
    product_placement BOOLEAN DEFAULT false,
    
    -- Estado legal
    status VARCHAR(50) DEFAULT 'draft', -- draft, active, expired, terminated, renewed
    auto_renewal BOOLEAN DEFAULT false,
    termination_clause TEXT,
    
    -- Cumplimiento
    deliverables_completed INTEGER DEFAULT 0,
    deliverables_total INTEGER DEFAULT 0,
    
    legal_review_by INTEGER REFERENCES users(id),
    legal_review_date DATE,
    approved_by INTEGER REFERENCES users(id),
    approved_date DATE,
    
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: payment_milestones (CRÍTICA)
```sql
CREATE TABLE payment_milestones (
    id SERIAL PRIMARY KEY,
    contract_id INTEGER REFERENCES sponsorship_contracts(id),
    milestone_number INTEGER NOT NULL,
    milestone_name VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Información financiera
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- Fechas críticas
    scheduled_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    
    -- Estado del pago
    status VARCHAR(50) DEFAULT 'pending', -- pending, paid, overdue, cancelled, disputed
    payment_method VARCHAR(100),
    transaction_reference VARCHAR(200),
    
    -- Condiciones de liberación
    deliverable_required TEXT,
    approval_required BOOLEAN DEFAULT false,
    approved_by INTEGER REFERENCES users(id),
    approved_date DATE,
    
    -- Alertas
    alert_sent_90_days BOOLEAN DEFAULT false,
    alert_sent_60_days BOOLEAN DEFAULT false,
    alert_sent_30_days BOOLEAN DEFAULT false,
    alert_sent_overdue BOOLEAN DEFAULT false,
    
    -- Auditoría
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: license_renewals (SUPER CRÍTICA)
```sql
CREATE TABLE license_renewals (
    id SERIAL PRIMARY KEY,
    contract_id INTEGER REFERENCES sponsorship_contracts(id),
    
    -- Fechas críticas de renovación
    original_expiry_date DATE NOT NULL,
    renewal_start_date DATE,
    new_expiry_date DATE,
    
    -- Términos de renovación
    renewal_fee DECIMAL(12,2),
    renewal_period_months INTEGER DEFAULT 24,
    terms_changed BOOLEAN DEFAULT false,
    new_terms_description TEXT,
    
    -- Estado de renovación
    status VARCHAR(50) DEFAULT 'pending', -- pending, negotiating, approved, rejected, expired
    renewal_probability INTEGER, -- 1-100%
    
    -- Comunicaciones
    initial_contact_date DATE,
    proposal_sent_date DATE,
    sponsor_response_date DATE,
    contract_signed_date DATE,
    
    -- Alertas automáticas (CRÍTICO)
    alert_90_days_sent BOOLEAN DEFAULT false,
    alert_90_days_date DATE,
    alert_60_days_sent BOOLEAN DEFAULT false,
    alert_60_days_date DATE,
    alert_30_days_sent BOOLEAN DEFAULT false,
    alert_30_days_date DATE,
    alert_expired_sent BOOLEAN DEFAULT false,
    
    -- Documentación de impacto para renovación
    impact_report_url VARCHAR(500),
    roi_calculation DECIMAL(10,2),
    performance_metrics JSONB, -- {"views": 2300000, "engagement": 450000, "festivals": 12}
    
    -- Responsables
    managed_by INTEGER REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: contract_deliverables
```sql
CREATE TABLE contract_deliverables (
    id SERIAL PRIMARY KEY,
    contract_id INTEGER REFERENCES sponsorship_contracts(id),
    deliverable_type VARCHAR(100), -- 'logo_placement', 'social_mention', 'behind_scenes', 'product_placement'
    description TEXT NOT NULL,
    due_date DATE,
    completed_date DATE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    evidence_url VARCHAR(500), -- URL del archivo que demuestra cumplimiento
    sponsor_approved BOOLEAN DEFAULT false,
    sponsor_feedback TEXT,
    created_by INTEGER REFERENCES users(id),
    completed_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🎥 MÓDULO 4: GESTIÓN DE DISTRIBUCIÓN Y DERIVADOS

### Tabla: festivals
```sql
CREATE TABLE festivals (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    festival_name VARCHAR(200) NOT NULL,
    festival_category VARCHAR(100), -- 'a_list', 'regional', 'genre_specific', 'student'
    country VARCHAR(100),
    city VARCHAR(100),
    website_url VARCHAR(200),
    
    -- Fechas importantes
    submission_deadline DATE,
    notification_date DATE,
    festival_start_date DATE,
    festival_end_date DATE,
    
    -- Costos y requerimientos
    submission_fee DECIMAL(8,2),
    currency VARCHAR(10) DEFAULT 'USD',
    submission_requirements TEXT,
    technical_requirements TEXT,
    
    -- Estado de participación
    submission_status VARCHAR(50) DEFAULT 'planned', -- planned, submitted, accepted, rejected, withdrawn
    submission_date DATE,
    result_date DATE,
    result VARCHAR(50), -- 'accepted', 'rejected', 'waitlisted', 'winner', 'nominee', 'official_selection'
    award_received VARCHAR(200),
    
    -- Documentación
    submission_confirmation VARCHAR(200),
    screening_schedule TEXT,
    press_coverage JSONB, -- ["url1", "url2"]
    
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: distribution_platforms
```sql
CREATE TABLE distribution_platforms (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    platform_name VARCHAR(200) NOT NULL,
    platform_type VARCHAR(100), -- 'streaming', 'vod', 'theatrical', 'tv', 'podcast'
    platform_category VARCHAR(100), -- 'netflix', 'amazon_prime', 'youtube', 'spotify', etc.
    
    -- Términos del acuerdo
    distribution_type VARCHAR(100), -- 'exclusive', 'non_exclusive', 'windowed'
    territory VARCHAR(200), -- 'worldwide', 'latam', 'us_canada', etc.
    language_versions JSONB, -- ["spanish", "english", "portuguese"]
    
    -- Fechas del acuerdo
    license_start_date DATE,
    license_end_date DATE,
    renewal_option BOOLEAN DEFAULT false,
    
    -- Modelo de ingresos
    revenue_model VARCHAR(100), -- 'revenue_share', 'flat_fee', 'minimum_guarantee', 'free'
    revenue_percentage DECIMAL(5,2),
    minimum_guarantee DECIMAL(12,2),
    flat_fee_amount DECIMAL(12,2),
    
    -- Requerimientos técnicos
    technical_specs TEXT,
    delivery_requirements TEXT,
    metadata_requirements TEXT,
    
    -- Estado
    status VARCHAR(50) DEFAULT 'negotiating', -- negotiating, signed, live, expired, terminated
    go_live_date DATE,
    content_id VARCHAR(200), -- ID en la plataforma
    
    -- Contacto
    contact_name VARCHAR(200),
    contact_email VARCHAR(200),
    contact_phone VARCHAR(20),
    
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: content_derivatives
```sql
CREATE TABLE content_derivatives (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    title VARCHAR(200) NOT NULL,
    derivative_type VARCHAR(100), -- 'teaser', 'trailer', 'poster', 'behind_scenes', 'podcast_episode', 'social_clip'
    format VARCHAR(50), -- 'video', 'image', 'audio', 'document'
    duration INTEGER, -- segundos (para video/audio)
    resolution VARCHAR(50), -- '1920x1080', '4096x2160', etc.
    file_size INTEGER, -- bytes
    
    -- Archivos
    master_file_url VARCHAR(500),
    preview_file_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    
    -- Versiones
    version VARCHAR(20) DEFAULT '1.0',
    language VARCHAR(50) DEFAULT 'spanish',
    subtitle_versions JSONB, -- ["english", "portuguese"]
    
    -- Uso y distribución
    intended_use TEXT,
    platforms_approved JSONB, -- ["instagram", "youtube", "facebook", "tiktok"]
    embargo_date DATE,
    expiry_date DATE,
    
    -- Metadatos
    description TEXT,
    tags JSONB, -- ["behind_scenes", "cast_interview", "action_sequence"]
    credits TEXT,
    copyright_info TEXT,
    
    -- Estado
    status VARCHAR(50) DEFAULT 'draft', -- draft, review, approved, published, archived
    approved_by INTEGER REFERENCES users(id),
    approved_date DATE,
    published_date DATE,
    
    -- Métricas (para contenido publicado)
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2),
    
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: royalty_reports
```sql
CREATE TABLE royalty_reports (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    platform_id INTEGER REFERENCES distribution_platforms(id),
    
    -- Período del reporte
    report_period_start DATE NOT NULL,
    report_period_end DATE NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- Métricas de rendimiento
    total_views INTEGER DEFAULT 0,
    unique_viewers INTEGER DEFAULT 0,
    hours_watched INTEGER DEFAULT 0,
    average_watch_time INTEGER DEFAULT 0, -- segundos
    completion_rate DECIMAL(5,2), -- porcentaje
    
    -- Ingresos
    gross_revenue DECIMAL(12,2) DEFAULT 0,
    platform_commission DECIMAL(12,2) DEFAULT 0,
    net_revenue DECIMAL(12,2) DEFAULT 0,
    
    -- Distribución geográfica
    top_countries JSONB, -- {"US": 45, "MX": 23, "CO": 15, "AR": 10, "Other": 7}
    
    -- Distribución demográfica
    age_demographics JSONB, -- {"18-24": 20, "25-34": 35, "35-44": 25, "45+": 20}
    gender_demographics JSONB, -- {"male": 55, "female": 43, "other": 2}
    
    -- Archivos
    original_report_file_url VARCHAR(500),
    processed_report_url VARCHAR(500),
    
    -- Estado
    status VARCHAR(50) DEFAULT 'received', -- received, processed, distributed, disputed
    processed_date DATE,
    
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔗 TABLAS DE RELACIÓN Y AUDITORÍA

### Tabla: scene_characters (Relación Muchos a Muchos)
```sql
CREATE TABLE scene_characters (
    id SERIAL PRIMARY KEY,
    scene_id INTEGER REFERENCES scenes(id),
    character_id INTEGER REFERENCES characters(id),
    importance VARCHAR(50), -- 'principal', 'secundario', 'background'
    dialogue_lines_count INTEGER DEFAULT 0,
    screen_time_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: scene_assets (Relación Muchos a Muchos)
```sql
CREATE TABLE scene_assets (
    id SERIAL PRIMARY KEY,
    scene_id INTEGER REFERENCES scenes(id),
    asset_id INTEGER REFERENCES assets_inventory(id),
    quantity_needed INTEGER DEFAULT 1,
    usage_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: audit_log (Auditoría del Sistema)
```sql
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: system_notifications
```sql
CREATE TABLE system_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    notification_type VARCHAR(100), -- 'license_expiry', 'payment_overdue', 'audition_received', etc.
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    related_table VARCHAR(100),
    related_id INTEGER,
    action_url VARCHAR(500),
    read_at TIMESTAMP,
    email_sent BOOLEAN DEFAULT false,
    sms_sent BOOLEAN DEFAULT false,
    push_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📊 ÍNDICES Y OPTIMIZACIONES

### Índices Críticos para Rendimiento
```sql
-- Índices de seguridad y autenticación
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_user_sessions_token ON user_sessions(token_hash);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- Índices del flujo principal de producción
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_scenes_script_id ON scenes(script_id);
CREATE INDEX idx_scenes_shoot_date ON scenes(shoot_date);
CREATE INDEX idx_shooting_schedule_date ON shooting_schedule(shoot_date);

-- Índices críticos de patrocinio (MUY IMPORTANTES)
CREATE INDEX idx_payment_milestones_due_date ON payment_milestones(due_date);
CREATE INDEX idx_payment_milestones_status ON payment_milestones(status);
CREATE INDEX idx_license_renewals_expiry ON license_renewals(original_expiry_date);
CREATE INDEX idx_sponsorship_contracts_dates ON sponsorship_contracts(effective_end_date);

-- Índices de audiciones y casting
CREATE INDEX idx_auditions_character_id ON auditions(character_id);
CREATE INDEX idx_auditions_status ON auditions(status);
CREATE INDEX idx_talent_contracts_status ON talent_contracts(status);

-- Índices de notificaciones
CREATE INDEX idx_notifications_user_id ON system_notifications(user_id);
CREATE INDEX idx_notifications_read ON system_notifications(read_at);
CREATE INDEX idx_notifications_priority ON system_notifications(priority);

-- Índices de auditoría
CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_user_date ON audit_log(user_id, created_at);
```

---

## 🔒 TRIGGERS PARA AUTOMATIZACIÓN

### Trigger: Alertas Automáticas de Renovación
```sql
CREATE OR REPLACE FUNCTION check_license_expiry()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar si necesitamos enviar alertas
    IF NEW.effective_end_date <= CURRENT_DATE + INTERVAL '90 days' AND 
       NOT EXISTS (SELECT 1 FROM license_renewals WHERE contract_id = NEW.id AND alert_90_days_sent = true) THEN
        
        INSERT INTO license_renewals (contract_id, original_expiry_date, status, alert_90_days_sent, alert_90_days_date)
        VALUES (NEW.id, NEW.effective_end_date, 'pending', true, CURRENT_DATE);
        
        INSERT INTO system_notifications (user_id, notification_type, priority, title, message, related_table, related_id)
        SELECT u.id, 'license_expiry_90', 'critical', 
               'Licencia expira en 90 días',
               'El contrato de patrocinio #' || NEW.id || ' expira el ' || NEW.effective_end_date,
               'sponsorship_contracts', NEW.id
        FROM users u 
        JOIN roles r ON u.role_id = r.id 
        WHERE r.name = 'gerente_patrocinio';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_license_expiry_check
    AFTER INSERT OR UPDATE ON sponsorship_contracts
    FOR EACH ROW
    EXECUTE FUNCTION check_license_expiry();
```

### Trigger: Auditoría Automática
```sql
CREATE OR REPLACE FUNCTION audit_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (user_id, table_name, record_id, action, new_values)
        VALUES (
            COALESCE(NULLIF(current_setting('app.current_user_id', true), ''), '0')::INTEGER,
            TG_TABLE_NAME,
            NEW.id,
            'INSERT',
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (user_id, table_name, record_id, action, old_values, new_values)
        VALUES (
            COALESCE(NULLIF(current_setting('app.current_user_id', true), ''), '0')::INTEGER,
            TG_TABLE_NAME,
            NEW.id,
            'UPDATE',
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (user_id, table_name, record_id, action, old_values)
        VALUES (
            COALESCE(NULLIF(current_setting('app.current_user_id', true), ''), '0')::INTEGER,
            TG_TABLE_NAME,
            OLD.id,
            'DELETE',
            to_jsonb(OLD)
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Aplicar auditoría a tablas críticas
CREATE TRIGGER audit_sponsorship_contracts
    AFTER INSERT OR UPDATE OR DELETE ON sponsorship_contracts
    FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE TRIGGER audit_payment_milestones
    AFTER INSERT OR UPDATE OR DELETE ON payment_milestones
    FOR EACH ROW EXECUTE FUNCTION audit_changes();
```

---

## 📈 VISTAS PARA REPORTES

### Vista: Dashboard de Producción
```sql
CREATE VIEW v_production_dashboard AS
SELECT 
    p.id as project_id,
    p.title,
    p.status,
    COUNT(DISTINCT s.id) as total_scenes,
    COUNT(DISTINCT CASE WHEN s.status = 'filmada' THEN s.id END) as scenes_completed,
    COUNT(DISTINCT c.id) as total_characters,
    COUNT(DISTINCT tc.id) as contracts_signed,
    COUNT(DISTINCT CASE WHEN tc.status = 'signed' THEN tc.id END) as actors_confirmed,
    p.budget_total,
    COALESCE(SUM(tc.salary_amount), 0) as talent_budget_used
FROM projects p
LEFT JOIN scripts scr ON p.id = scr.project_id AND scr.is_current = true
LEFT JOIN scenes s ON scr.id = s.script_id
LEFT JOIN characters c ON p.id = c.project_id
LEFT JOIN talent_contracts tc ON c.id = tc.character_id
GROUP BY p.id, p.title, p.status, p.budget_total;
```

### Vista: Alertas de Patrocinio (CRÍTICA)
```sql
CREATE VIEW v_sponsorship_alerts AS
SELECT 
    sc.id as contract_id,
    sp.company_name,
    sp.sponsor_level,
    sc.effective_end_date,
    sc.maintenance_fee,
    (sc.effective_end_date - CURRENT_DATE) as days_until_expiry,
    CASE 
        WHEN sc.effective_end_date <= CURRENT_DATE THEN 'EXPIRED'
        WHEN sc.effective_end_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'CRITICAL'
        WHEN sc.effective_end_date <= CURRENT_DATE + INTERVAL '60 days' THEN 'WARNING'
        WHEN sc.effective_end_date <= CURRENT_DATE + INTERVAL '90 days' THEN 'ATTENTION'
        ELSE 'OK'
    END as alert_level,
    lr.status as renewal_status,
    lr.renewal_probability
FROM sponsorship_contracts sc
JOIN sponsors sp ON sc.sponsor_id = sp.id
LEFT JOIN license_renewals lr ON sc.id = lr.contract_id
WHERE sc.status = 'active'
ORDER BY sc.effective_end_date ASC;
```

---

## 🚀 SCRIPTS DE INICIALIZACIÓN

### Datos Iniciales: Roles del Sistema
```sql
INSERT INTO roles (name, display_name, description, permissions) VALUES
('super_admin', 'Super Administrador', 'Acceso total al sistema', 
 '{"module_1": ["read", "write", "delete"], "module_2": ["read", "write", "delete"], "module_3": ["read", "write", "delete"], "module_4": ["read", "write", "delete"]}'),

('gerente_produccion', 'Gerente de Producción', 'Gestión completa de producción y talento',
 '{"module_1": ["read", "write"], "module_2": ["read", "write"], "module_3": ["read"], "module_4": ["read"]}'),

('gerente_patrocinio', 'Gerente de Patrocinio', 'Gestión exclusiva de patrocinio y contratos',
 '{"module_1": ["read"], "module_2": ["read"], "module_3": ["read", "write", "delete"], "module_4": ["read"]}'),

('director', 'Director', 'Evaluación de casting y consulta de producción',
 '{"module_1": ["read"], "module_2": ["read", "write_auditions"], "module_3": [], "module_4": ["read"]}'),

('asistente_produccion', 'Asistente de Producción', 'Apoyo en gestión de producción',
 '{"module_1": ["read", "write_limited"], "module_2": ["read"], "module_3": [], "module_4": ["read"]}');
```

### Estados Iniciales del Sistema
```sql
-- Estados de proyecto
INSERT INTO system_configs (key, value) VALUES
('project_statuses', 'desarrollo,preproduccion,rodaje,postproduccion,distribucion'),
('sponsor_levels', 'diamante,platino,oro,plata'),
('contract_statuses', 'draft,sent,negotiating,signed,cancelled'),
('payment_statuses', 'pending,paid,overdue,cancelled,disputed');
```

Esta base de datos está diseñada para ser **segura, escalable y completamente funcional** para tu Sistema de Gestión de Producción REA. 🎬✨