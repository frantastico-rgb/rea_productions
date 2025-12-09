-- ===============================================
-- 🎬 SGP REA PRODUCTIONS - CONFIGURACIÓN PostgreSQL
-- ===============================================
-- Archivo: database_setup_postgresql.sql
-- Propósito: Script completo para crear la base de datos principal en PostgreSQL
-- Migrado desde MySQL
-- Fecha: Diciembre 2025

-- ===============================================
-- 1. CONFIGURACIÓN INICIAL DE BASE DE DATOS
-- ===============================================

-- Nota: La base de datos se crea desde la consola con:
-- CREATE DATABASE sgp_rea_prod ENCODING 'UTF8';

-- Conectar a la base de datos


-- Configurar zona horaria
SET timezone = 'America/Bogota';

-- ===============================================
-- 2. TABLAS DE USUARIOS Y SEGURIDAD
-- ===============================================

-- Tabla: roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_roles_active ON roles(is_active);

COMMENT ON TABLE roles IS 'Roles del sistema con permisos por módulo';
COMMENT ON COLUMN roles.name IS 'Identificador interno del rol';
COMMENT ON COLUMN roles.display_name IS 'Nombre visual del rol';
COMMENT ON COLUMN roles.description IS 'Descripción del rol';
COMMENT ON COLUMN roles.permissions IS 'Permisos por módulo en formato JSON';

-- Tabla: users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role_id INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    phone VARCHAR(20),
    avatar_url VARCHAR(255),
    last_login TIMESTAMP NULL,
    email_verified_at TIMESTAMP NULL,
    remember_token VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_last_login ON users(last_login);

COMMENT ON TABLE users IS 'Usuarios del sistema';

-- Tabla: user_sessions
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(token_hash);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_sessions_active ON user_sessions(is_active);

COMMENT ON TABLE user_sessions IS 'Sesiones activas de usuarios';

-- ===============================================
-- 3. MÓDULO DE PRODUCCIÓN
-- ===============================================

-- Crear tipo ENUM para status de proyectos
CREATE TYPE project_status AS ENUM (
    'desarrollo', 'preproduccion', 'rodaje', 'postproduccion', 
    'distribucion', 'completado', 'cancelado'
);

-- Tabla: projects
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    status project_status DEFAULT 'desarrollo',
    genre VARCHAR(100),
    target_duration INTEGER,
    budget_total DECIMAL(12,2),
    start_date DATE,
    end_date DATE,
    director_id INTEGER,
    producer_id INTEGER,
    poster_url VARCHAR(255),
    trailer_url VARCHAR(255),
    synopsis TEXT,
    target_audience VARCHAR(100),
    rating VARCHAR(20),
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (director_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (producer_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_director ON projects(director_id);
CREATE INDEX idx_projects_producer ON projects(producer_id);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);
CREATE INDEX idx_projects_search ON projects USING gin(to_tsvector('spanish', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(synopsis, '')));

COMMENT ON TABLE projects IS 'Proyectos de producción';
COMMENT ON COLUMN projects.target_duration IS 'Duración objetivo en minutos';

-- Tabla: scripts
CREATE TABLE scripts (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    version VARCHAR(20) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(20),
    file_size INTEGER,
    page_count INTEGER,
    scene_count INTEGER,
    is_current BOOLEAN DEFAULT FALSE,
    notes TEXT,
    uploaded_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_scripts_project ON scripts(project_id);
CREATE INDEX idx_scripts_current ON scripts(project_id, is_current);
CREATE INDEX idx_scripts_version ON scripts(project_id, version);

COMMENT ON TABLE scripts IS 'Guiones de los proyectos';
COMMENT ON COLUMN scripts.file_type IS 'pdf, fdx, fountain, docx';
COMMENT ON COLUMN scripts.file_size IS 'Tamaño en bytes';

-- Crear tipo ENUM para time_of_day
CREATE TYPE scene_time AS ENUM ('día', 'noche', 'amanecer', 'atardecer', 'interior', 'exterior');
CREATE TYPE scene_status AS ENUM ('pendiente', 'filmada', 'aprobada', 'refilmar');

-- Tabla: scenes
CREATE TABLE scenes (
    id SERIAL PRIMARY KEY,
    script_id INTEGER NOT NULL,
    scene_number VARCHAR(20) NOT NULL,
    scene_name VARCHAR(200),
    location VARCHAR(200),
    time_of_day scene_time,
    description TEXT,
    dialogue_count INTEGER DEFAULT 0,
    estimated_duration INTEGER,
    shooting_date DATE,
    status scene_status DEFAULT 'pendiente',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE
);

CREATE INDEX idx_scenes_script ON scenes(script_id);
CREATE INDEX idx_scenes_number ON scenes(script_id, scene_number);
CREATE INDEX idx_scenes_status ON scenes(status);
CREATE INDEX idx_scenes_shooting_date ON scenes(shooting_date);
CREATE INDEX idx_scenes_search ON scenes USING gin(to_tsvector('spanish', COALESCE(scene_name, '') || ' ' || COALESCE(location, '') || ' ' || COALESCE(description, '')));

COMMENT ON TABLE scenes IS 'Escenas de los guiones';
COMMENT ON COLUMN scenes.estimated_duration IS 'Duración estimada en segundos';

-- Crear tipo ENUM para character_type y gender
CREATE TYPE character_type AS ENUM ('principal', 'secundario', 'extra', 'voz');
CREATE TYPE gender_type AS ENUM ('masculino', 'femenino', 'no_binario', 'indefinido');

-- Tabla: characters
CREATE TABLE characters (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    name VARCHAR(200) NOT NULL,
    character_type character_type DEFAULT 'secundario',
    description TEXT,
    age_range VARCHAR(50),
    gender gender_type,
    casting_notes TEXT,
    costume_notes TEXT,
    makeup_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX idx_characters_project ON characters(project_id);
CREATE INDEX idx_characters_type ON characters(character_type);
CREATE INDEX idx_characters_search ON characters USING gin(to_tsvector('spanish', name || ' ' || COALESCE(description, '')));

COMMENT ON TABLE characters IS 'Personajes de los proyectos';

-- ===============================================
-- 4. MÓDULO DE TALENTOS
-- ===============================================

-- Crear tipos ENUM para talentos
CREATE TYPE talent_gender AS ENUM ('masculino', 'femenino', 'no_binario', 'prefiero_no_decir');
CREATE TYPE experience_level AS ENUM ('principiante', 'intermedio', 'avanzado', 'profesional');
CREATE TYPE talent_status AS ENUM ('activo', 'inactivo', 'blacklist');

-- Tabla: talent_profiles
CREATE TABLE talent_profiles (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    stage_name VARCHAR(200),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    birthdate DATE,
    gender talent_gender,
    nationality VARCHAR(100),
    city VARCHAR(100),
    
    -- Información física
    height INTEGER,
    weight INTEGER,
    hair_color VARCHAR(50),
    eye_color VARCHAR(50),
    
    -- Información profesional
    experience_level experience_level,
    union_member BOOLEAN DEFAULT FALSE,
    union_name VARCHAR(200),
    representation VARCHAR(200),
    
    -- Archivos multimedia
    headshot_url VARCHAR(255),
    portfolio_url VARCHAR(255),
    demo_reel_url VARCHAR(255),
    resume_url VARCHAR(255),
    
    -- Disponibilidad
    available_from DATE,
    available_until DATE,
    travel_willingness BOOLEAN DEFAULT TRUE,
    
    -- Habilidades especiales (JSON)
    special_skills JSONB,
    languages JSONB,
    
    -- Estado
    status talent_status DEFAULT 'activo',
    rating DECIMAL(3,2) DEFAULT 0.00,
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_talent_email ON talent_profiles(email);
CREATE INDEX idx_talent_name ON talent_profiles(first_name, last_name);
CREATE INDEX idx_talent_stage_name ON talent_profiles(stage_name);
CREATE INDEX idx_talent_experience ON talent_profiles(experience_level);
CREATE INDEX idx_talent_status ON talent_profiles(status);
CREATE INDEX idx_talent_availability ON talent_profiles(available_from, available_until);
CREATE INDEX idx_talent_search ON talent_profiles USING gin(to_tsvector('spanish', first_name || ' ' || last_name || ' ' || COALESCE(stage_name, '')));

COMMENT ON TABLE talent_profiles IS 'Perfiles de talentos y actores';
COMMENT ON COLUMN talent_profiles.height IS 'Altura en centímetros';
COMMENT ON COLUMN talent_profiles.weight IS 'Peso en kilogramos';
COMMENT ON COLUMN talent_profiles.representation IS 'Agencia o representante';
COMMENT ON COLUMN talent_profiles.special_skills IS 'Habilidades especiales: idiomas, deportes, instrumentos, etc.';
COMMENT ON COLUMN talent_profiles.languages IS 'Idiomas que habla';
COMMENT ON COLUMN talent_profiles.rating IS 'Calificación promedio 0-5';

-- Crear tipos ENUM para auditions
CREATE TYPE audition_type AS ENUM ('presencial', 'virtual', 'self_tape');
CREATE TYPE audition_status AS ENUM ('programada', 'completada', 'cancelada', 'reprogramada');
CREATE TYPE audition_result AS ENUM ('pendiente', 'callback', 'seleccionado', 'rechazado');

-- Tabla: auditions
CREATE TABLE auditions (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    character_id INTEGER NOT NULL,
    talent_id INTEGER NOT NULL,
    audition_date TIMESTAMP NOT NULL,
    audition_type audition_type DEFAULT 'presencial',
    location VARCHAR(200),
    status audition_status DEFAULT 'programada',
    
    -- Evaluación
    rating DECIMAL(3,2),
    performance_notes TEXT,
    director_feedback TEXT,
    casting_director_feedback TEXT,
    
    -- Archivos
    audition_video_url VARCHAR(255),
    callback_needed BOOLEAN DEFAULT FALSE,
    callback_date TIMESTAMP,
    
    -- Resultado
    result audition_result DEFAULT 'pendiente',
    rejection_reason TEXT,
    
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    FOREIGN KEY (talent_id) REFERENCES talent_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    UNIQUE (project_id, character_id, talent_id, audition_date)
);

CREATE INDEX idx_auditions_project ON auditions(project_id);
CREATE INDEX idx_auditions_character ON auditions(character_id);
CREATE INDEX idx_auditions_talent ON auditions(talent_id);
CREATE INDEX idx_auditions_date ON auditions(audition_date);
CREATE INDEX idx_auditions_status ON auditions(status);
CREATE INDEX idx_auditions_result ON auditions(result);

COMMENT ON TABLE auditions IS 'Audiciones de talentos';
COMMENT ON COLUMN auditions.rating IS 'Calificación 0-5';

-- Crear tipos ENUM para contracts
CREATE TYPE contract_type AS ENUM ('actor_principal', 'actor_secundario', 'extra', 'crew', 'freelance', 'patrocinio');
CREATE TYPE payment_schedule AS ENUM ('unico', 'semanal', 'quincenal', 'mensual', 'por_hitos');
CREATE TYPE contract_status AS ENUM ('borrador', 'enviado', 'firmado', 'activo', 'completado', 'cancelado', 'vencido');

-- Tabla: contracts
CREATE TABLE contracts (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    talent_id INTEGER NOT NULL,
    character_id INTEGER,
    contract_type contract_type NOT NULL,
    
    -- Información del contrato
    contract_number VARCHAR(100) UNIQUE,
    contract_title VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Fechas
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    signature_date DATE,
    
    -- Compensación
    total_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'COP',
    payment_schedule payment_schedule DEFAULT 'mensual',
    payment_terms TEXT,
    
    -- Estado y documentos
    status contract_status DEFAULT 'borrador',
    contract_file_url VARCHAR(255),
    signed_contract_url VARCHAR(255),
    
    -- Términos especiales
    exclusivity BOOLEAN DEFAULT FALSE,
    confidentiality BOOLEAN DEFAULT TRUE,
    image_rights BOOLEAN DEFAULT TRUE,
    cancellation_terms TEXT,
    
    -- Seguimiento
    created_by INTEGER NOT NULL,
    approved_by INTEGER,
    signed_by_talent TIMESTAMP,
    signed_by_production TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (talent_id) REFERENCES talent_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_contracts_project ON contracts(project_id);
CREATE INDEX idx_contracts_talent ON contracts(talent_id);
CREATE INDEX idx_contracts_type ON contracts(contract_type);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_dates ON contracts(start_date, end_date);
CREATE INDEX idx_contracts_number ON contracts(contract_number);

COMMENT ON TABLE contracts IS 'Contratos con talentos y equipo';

-- ===============================================
-- 5. MÓDULO DE PATROCINIO (CRÍTICO)
-- ===============================================

-- Crear tipos ENUM para sponsors
CREATE TYPE company_size AS ENUM ('startup', 'pequeña', 'mediana', 'grande', 'corporacion');
CREATE TYPE sponsor_tier AS ENUM ('bronce', 'plata', 'oro', 'platino', 'exclusivo');
CREATE TYPE sponsor_status AS ENUM ('prospecto', 'activo', 'inactivo', 'blacklist');

-- Tabla: sponsors
CREATE TABLE sponsors (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(200),
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    industry VARCHAR(100),
    company_size company_size,
    website VARCHAR(255),
    address TEXT,
    tax_id VARCHAR(50),
    
    -- Clasificación
    sponsor_tier sponsor_tier DEFAULT 'bronce',
    preferred_genres JSONB,
    target_demographics JSONB,
    
    -- Historial
    total_sponsored_amount DECIMAL(12,2) DEFAULT 0,
    projects_count INTEGER DEFAULT 0,
    average_satisfaction DECIMAL(3,2) DEFAULT 0,
    
    -- Estado
    status sponsor_status DEFAULT 'prospecto',
    relationship_manager_id INTEGER,
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (relationship_manager_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_sponsors_company ON sponsors(company_name);
CREATE INDEX idx_sponsors_tier ON sponsors(sponsor_tier);
CREATE INDEX idx_sponsors_status ON sponsors(status);
CREATE INDEX idx_sponsors_manager ON sponsors(relationship_manager_id);
CREATE INDEX idx_sponsors_search ON sponsors USING gin(to_tsvector('spanish', company_name || ' ' || COALESCE(contact_name, '') || ' ' || COALESCE(industry, '')));

COMMENT ON TABLE sponsors IS 'Patrocinadores y empresas colaboradoras';
COMMENT ON COLUMN sponsors.preferred_genres IS 'Géneros de contenido preferidos';
COMMENT ON COLUMN sponsors.target_demographics IS 'Demographics objetivo del patrocinador';

-- Crear tipos ENUM para sponsorship_deals
CREATE TYPE deal_type AS ENUM ('patrocinio', 'product_placement', 'co_produccion', 'distribucion', 'licencia');
CREATE TYPE deal_status AS ENUM ('negociacion', 'enviado', 'firmado', 'activo', 'completado', 'cancelado', 'vencido', 'renovacion_pendiente');
CREATE TYPE payment_status AS ENUM ('pendiente', 'parcial', 'completo', 'atrasado');

-- Tabla: sponsorship_deals
CREATE TABLE sponsorship_deals (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    sponsor_id INTEGER NOT NULL,
    
    -- Información del acuerdo
    deal_name VARCHAR(200) NOT NULL,
    deal_type deal_type NOT NULL,
    sponsorship_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'COP',
    
    -- ⚠️ FECHAS CRÍTICAS - ALERTAS AUTOMÁTICAS
    contract_start_date DATE NOT NULL,
    contract_end_date DATE NOT NULL,
    payment_due_date DATE,
    delivery_deadline DATE,
    
    -- ⚠️ LICENCIAS CRÍTICAS
    license_expiry_date DATE,
    renewal_notification_days INTEGER DEFAULT 30,
    auto_renewal BOOLEAN DEFAULT FALSE,
    renewal_terms TEXT,
    
    -- Estado del acuerdo
    status deal_status DEFAULT 'negociacion',
    
    -- Entregables
    deliverables JSONB,
    delivery_status JSONB,
    
    -- Documentos
    contract_file_url VARCHAR(255),
    signed_contract_url VARCHAR(255),
    
    -- Términos especiales
    exclusivity_clause BOOLEAN DEFAULT FALSE,
    territory_restrictions TEXT,
    usage_rights TEXT,
    brand_guidelines_url VARCHAR(255),
    
    -- Seguimiento financiero
    amount_paid DECIMAL(12,2) DEFAULT 0,
    amount_pending DECIMAL(12,2) DEFAULT 0,
    payment_status payment_status DEFAULT 'pendiente',
    
    -- Responsables
    account_manager_id INTEGER,
    legal_contact_id INTEGER,
    created_by INTEGER NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (sponsor_id) REFERENCES sponsors(id) ON DELETE CASCADE,
    FOREIGN KEY (account_manager_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (legal_contact_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- ⚠️ ÍNDICES CRÍTICOS PARA ALERTAS
CREATE INDEX idx_sponsorship_license_expiry ON sponsorship_deals(license_expiry_date);
CREATE INDEX idx_sponsorship_payment_due ON sponsorship_deals(payment_due_date);
CREATE INDEX idx_sponsorship_delivery_deadline ON sponsorship_deals(delivery_deadline);
CREATE INDEX idx_sponsorship_status ON sponsorship_deals(status);
CREATE INDEX idx_sponsorship_project ON sponsorship_deals(project_id);
CREATE INDEX idx_sponsorship_sponsor ON sponsorship_deals(sponsor_id);
CREATE INDEX idx_sponsorship_active ON sponsorship_deals(status, contract_end_date);

COMMENT ON TABLE sponsorship_deals IS '🚨 CRÍTICO: Acuerdos de patrocinio con alertas automáticas';
COMMENT ON COLUMN sponsorship_deals.license_expiry_date IS '🚨 CRÍTICO: Fecha de vencimiento de licencias';
COMMENT ON COLUMN sponsorship_deals.renewal_notification_days IS 'Días antes para notificar renovación';
COMMENT ON COLUMN sponsorship_deals.deliverables IS 'Lista de entregables comprometidos';
COMMENT ON COLUMN sponsorship_deals.delivery_status IS 'Estado de cada entregable';

-- ===============================================
-- 6. MÓDULO DE DISTRIBUCIÓN
-- ===============================================

-- Crear tipos ENUM para distribution_platforms
CREATE TYPE platform_type AS ENUM ('streaming', 'vod', 'theatrical', 'tv', 'podcast', 'social_media');
CREATE TYPE distribution_type AS ENUM ('exclusive', 'non_exclusive', 'windowed');
CREATE TYPE revenue_model AS ENUM ('revenue_share', 'flat_fee', 'minimum_guarantee', 'free');
CREATE TYPE distribution_status AS ENUM ('negotiating', 'signed', 'live', 'expired', 'terminated');

-- Tabla: distribution_platforms
CREATE TABLE distribution_platforms (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    platform_name VARCHAR(200) NOT NULL,
    platform_type platform_type NOT NULL,
    platform_category VARCHAR(100),
    
    -- Términos del acuerdo
    distribution_type distribution_type DEFAULT 'non_exclusive',
    territory VARCHAR(200) DEFAULT 'worldwide',
    language_versions JSONB,
    
    -- ⚠️ FECHAS CRÍTICAS DE DISTRIBUCIÓN
    license_start_date DATE NOT NULL,
    license_end_date DATE NOT NULL,
    renewal_option BOOLEAN DEFAULT FALSE,
    renewal_deadline DATE,
    
    -- Modelo de ingresos
    revenue_model revenue_model DEFAULT 'revenue_share',
    revenue_percentage DECIMAL(5,2),
    minimum_guarantee DECIMAL(12,2),
    flat_fee_amount DECIMAL(12,2),
    
    -- Requerimientos técnicos
    technical_specs TEXT,
    delivery_requirements TEXT,
    metadata_requirements TEXT,
    
    -- Estado
    status distribution_status DEFAULT 'negotiating',
    go_live_date DATE,
    content_id VARCHAR(200),
    
    -- Contacto
    contact_name VARCHAR(200),
    contact_email VARCHAR(200),
    contact_phone VARCHAR(20),
    
    notes TEXT,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_distribution_project ON distribution_platforms(project_id);
CREATE INDEX idx_distribution_platform ON distribution_platforms(platform_name);
CREATE INDEX idx_distribution_type ON distribution_platforms(platform_type);
CREATE INDEX idx_distribution_status ON distribution_platforms(status);
CREATE INDEX idx_distribution_license_dates ON distribution_platforms(license_start_date, license_end_date);
CREATE INDEX idx_distribution_renewal ON distribution_platforms(renewal_deadline);

COMMENT ON TABLE distribution_platforms IS 'Plataformas de distribución';
COMMENT ON COLUMN distribution_platforms.platform_category IS 'netflix, amazon_prime, youtube, spotify, etc.';
COMMENT ON COLUMN distribution_platforms.language_versions IS 'Versiones de idioma disponibles';
COMMENT ON COLUMN distribution_platforms.content_id IS 'ID en la plataforma';

-- ===============================================
-- 7. TABLAS DE AUDITORÍA Y NOTIFICACIONES
-- ===============================================

-- Crear tipo ENUM para audit_log
CREATE TYPE audit_action AS ENUM ('INSERT', 'UPDATE', 'DELETE');

-- Tabla: audit_log
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER NOT NULL,
    action audit_action NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_table ON audit_log(table_name);
CREATE INDEX idx_audit_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_created ON audit_log(created_at);

COMMENT ON TABLE audit_log IS 'Log de auditoría del sistema';

-- Crear tipos ENUM para notificaciones
CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- Tabla: system_notifications
CREATE TABLE system_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    notification_type VARCHAR(100) NOT NULL,
    priority notification_priority DEFAULT 'medium',
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(255),
    
    -- Metadatos
    related_table VARCHAR(100),
    related_id INTEGER,
    metadata JSONB,
    
    -- Estado
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user ON system_notifications(user_id);
CREATE INDEX idx_notifications_type ON system_notifications(notification_type);
CREATE INDEX idx_notifications_priority ON system_notifications(priority);
CREATE INDEX idx_notifications_read ON system_notifications(is_read);
CREATE INDEX idx_notifications_created ON system_notifications(created_at);
CREATE INDEX idx_notifications_expires ON system_notifications(expires_at);

COMMENT ON TABLE system_notifications IS 'Notificaciones del sistema';
COMMENT ON COLUMN system_notifications.notification_type IS 'license_expiry, payment_overdue, audition_received, etc.';

-- ===============================================
-- 8. TABLAS DE RELACIÓN
-- ===============================================

-- Crear tipo ENUM para scene_characters
CREATE TYPE character_importance AS ENUM ('principal', 'secundario', 'background');

-- Tabla: scene_characters (Muchos a Muchos)
CREATE TABLE scene_characters (
    id SERIAL PRIMARY KEY,
    scene_id INTEGER NOT NULL,
    character_id INTEGER NOT NULL,
    importance character_importance DEFAULT 'secundario',
    dialogue_lines_count INTEGER DEFAULT 0,
    screen_time_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    UNIQUE (scene_id, character_id)
);

CREATE INDEX idx_scene_characters_scene ON scene_characters(scene_id);
CREATE INDEX idx_scene_characters_character ON scene_characters(character_id);

COMMENT ON TABLE scene_characters IS 'Relación entre escenas y personajes';

-- ===============================================
-- 9. DATOS INICIALES
-- ===============================================

-- Insertar roles por defecto
INSERT INTO roles (name, display_name, description, permissions) VALUES
('super_admin', 'Super Administrador', 'Acceso completo a todos los módulos', 
 '{"produccion": ["read", "write", "delete"], "talentos": ["read", "write", "delete"], "patrocinio": ["read", "write", "delete"], "distribucion": ["read", "write", "delete"], "usuarios": ["read", "write", "delete"]}'::jsonb),

('gerente_produccion', 'Gerente de Producción', 'Gestión completa de proyectos y producción',
 '{"produccion": ["read", "write", "delete"], "talentos": ["read", "write"], "patrocinio": ["read"], "distribucion": ["read", "write"], "usuarios": ["read"]}'::jsonb),

('gerente_patrocinio', 'Gerente de Patrocinio', 'Gestión de patrocinadores y acuerdos comerciales',
 '{"produccion": ["read"], "talentos": ["read"], "patrocinio": ["read", "write", "delete"], "distribucion": ["read"], "usuarios": ["read"]}'::jsonb),

('director_casting', 'Director de Casting', 'Gestión de talentos y casting',
 '{"produccion": ["read"], "talentos": ["read", "write", "delete"], "patrocinio": [], "distribucion": [], "usuarios": ["read"]}'::jsonb),

('coordinador_distribucion', 'Coordinador de Distribución', 'Gestión de distribución y plataformas',
 '{"produccion": ["read"], "talentos": ["read"], "patrocinio": ["read"], "distribucion": ["read", "write", "delete"], "usuarios": ["read"]}'::jsonb),

('asistente', 'Asistente', 'Acceso de solo lectura para asistir en tareas',
 '{"produccion": ["read"], "talentos": ["read"], "patrocinio": [], "distribucion": ["read"], "usuarios": []}'::jsonb);

-- Nota: El usuario admin se creará con el script de migración de datos
-- Para crear manualmente: password_hash debe ser bcrypt de 'admin123'

-- ===============================================
-- 10. FUNCIONES Y TRIGGERS
-- ===============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scripts_updated_at BEFORE UPDATE ON scripts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scenes_updated_at BEFORE UPDATE ON scenes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON characters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_talent_profiles_updated_at BEFORE UPDATE ON talent_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auditions_updated_at BEFORE UPDATE ON auditions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sponsors_updated_at BEFORE UPDATE ON sponsors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sponsorship_deals_updated_at BEFORE UPDATE ON sponsorship_deals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_distribution_platforms_updated_at BEFORE UPDATE ON distribution_platforms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- 11. VISTAS PARA REPORTES
-- ===============================================

-- Vista: Resumen de proyectos activos
CREATE VIEW v_active_projects AS
SELECT 
    p.id,
    p.title,
    p.status,
    p.budget_total,
    p.start_date,
    p.end_date,
    CONCAT(u1.first_name, ' ', u1.last_name) AS director_name,
    CONCAT(u2.first_name, ' ', u2.last_name) AS producer_name,
    COUNT(DISTINCT c.id) AS contracts_count,
    COUNT(DISTINCT sd.id) AS sponsorship_count
FROM projects p
LEFT JOIN users u1 ON p.director_id = u1.id
LEFT JOIN users u2 ON p.producer_id = u2.id
LEFT JOIN contracts c ON p.id = c.project_id AND c.status IN ('activo', 'firmado')
LEFT JOIN sponsorship_deals sd ON p.id = sd.project_id AND sd.status IN ('activo', 'firmado')
WHERE p.status NOT IN ('completado', 'cancelado')
GROUP BY p.id, p.title, p.status, p.budget_total, p.start_date, p.end_date,
         u1.first_name, u1.last_name, u2.first_name, u2.last_name;

-- Vista: Alertas críticas de vencimiento
CREATE VIEW v_critical_alerts AS
SELECT 
    'sponsorship_license' AS alert_type,
    sd.id AS record_id,
    sd.deal_name AS title,
    CONCAT('Licencia vence: ', sd.license_expiry_date) AS message,
    (sd.license_expiry_date - CURRENT_DATE) AS days_remaining,
    'critical' AS priority,
    p.title AS project_name,
    s.company_name AS sponsor_name
FROM sponsorship_deals sd
JOIN projects p ON sd.project_id = p.id
JOIN sponsors s ON sd.sponsor_id = s.id
WHERE sd.license_expiry_date <= CURRENT_DATE + INTERVAL '30 days'
  AND sd.status = 'activo'

UNION ALL

SELECT 
    'contract_expiry' AS alert_type,
    c.id AS record_id,
    c.contract_title AS title,
    CONCAT('Contrato vence: ', c.end_date) AS message,
    (c.end_date - CURRENT_DATE) AS days_remaining,
    CASE 
        WHEN (c.end_date - CURRENT_DATE) <= 7 THEN 'critical'
        WHEN (c.end_date - CURRENT_DATE) <= 15 THEN 'high'
        ELSE 'medium'
    END AS priority,
    p.title AS project_name,
    CONCAT(tp.first_name, ' ', tp.last_name) AS talent_name
FROM contracts c
JOIN projects p ON c.project_id = p.id
JOIN talent_profiles tp ON c.talent_id = tp.id
WHERE c.end_date <= CURRENT_DATE + INTERVAL '30 days'
  AND c.status = 'activo';

-- ===============================================
-- 🎬 CONFIGURACIÓN COMPLETADA
-- ===============================================

SELECT 'Base de datos SGP REA Productions (PostgreSQL) configurada exitosamente' AS status;
SELECT COUNT(*) AS total_tables FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
SELECT 'Alertas automáticas configuradas para licencias críticas' AS security_note;
