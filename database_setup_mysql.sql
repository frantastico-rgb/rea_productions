-- ===============================================
-- 🎬 SGP REA PRODUCTIONS - CONFIGURACIÓN MySQL
-- ===============================================
-- Archivo: database_setup_mysql.sql
-- Propósito: Script completo para crear la base de datos principal
-- Autor: Sistema SGP REA
-- Fecha: Octubre 2025

-- ===============================================
-- 1. CONFIGURACIÓN INICIAL DE BASE DE DATOS
-- ===============================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS sgp_rea_prod 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE sgp_rea_prod;

-- Configurar zona horaria
SET time_zone = '-05:00';  -- Colombia/Bogotá

-- ===============================================
-- 2. TABLAS DE USUARIOS Y SEGURIDAD
-- ===============================================

-- Tabla: roles
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL COMMENT 'Identificador interno del rol',
    display_name VARCHAR(100) NOT NULL COMMENT 'Nombre visual del rol',
    description TEXT COMMENT 'Descripción del rol',
    permissions JSON NOT NULL COMMENT 'Permisos por módulo en formato JSON',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_roles_name (name),
    INDEX idx_roles_active (is_active)
) ENGINE=InnoDB COMMENT='Roles del sistema con permisos por módulo';

-- Tabla: users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    phone VARCHAR(20),
    avatar_url VARCHAR(255),
    last_login TIMESTAMP NULL,
    email_verified_at TIMESTAMP NULL,
    remember_token VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    INDEX idx_users_email (email),
    INDEX idx_users_username (username),
    INDEX idx_users_role (role_id),
    INDEX idx_users_active (is_active),
    INDEX idx_users_last_login (last_login)
) ENGINE=InnoDB COMMENT='Usuarios del sistema';

-- Tabla: user_sessions
CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sessions_user (user_id),
    INDEX idx_sessions_token (token_hash),
    INDEX idx_sessions_expires (expires_at),
    INDEX idx_sessions_active (is_active)
) ENGINE=InnoDB COMMENT='Sesiones activas de usuarios';

-- ===============================================
-- 3. MÓDULO DE PRODUCCIÓN
-- ===============================================

-- Tabla: projects
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    status ENUM('desarrollo', 'preproduccion', 'rodaje', 'postproduccion', 'distribucion', 'completado', 'cancelado') DEFAULT 'desarrollo',
    genre VARCHAR(100),
    target_duration INT COMMENT 'Duración objetivo en minutos',
    budget_total DECIMAL(12,2),
    start_date DATE,
    end_date DATE,
    director_id INT,
    producer_id INT,
    poster_url VARCHAR(255),
    trailer_url VARCHAR(255),
    synopsis TEXT,
    target_audience VARCHAR(100),
    rating VARCHAR(20),
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (director_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (producer_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_projects_status (status),
    INDEX idx_projects_slug (slug),
    INDEX idx_projects_director (director_id),
    INDEX idx_projects_producer (producer_id),
    INDEX idx_projects_dates (start_date, end_date),
    FULLTEXT idx_projects_search (title, description, synopsis)
) ENGINE=InnoDB COMMENT='Proyectos de producción';

-- Tabla: scripts
CREATE TABLE scripts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    version VARCHAR(20) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(20) COMMENT 'pdf, fdx, fountain, docx',
    file_size INT COMMENT 'Tamaño en bytes',
    page_count INT,
    scene_count INT,
    is_current BOOLEAN DEFAULT FALSE,
    notes TEXT,
    uploaded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_scripts_project (project_id),
    INDEX idx_scripts_current (project_id, is_current),
    INDEX idx_scripts_version (project_id, version)
) ENGINE=InnoDB COMMENT='Guiones de los proyectos';

-- Tabla: scenes
CREATE TABLE scenes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    script_id INT NOT NULL,
    scene_number VARCHAR(20) NOT NULL,
    scene_name VARCHAR(200),
    location VARCHAR(200),
    time_of_day ENUM('día', 'noche', 'amanecer', 'atardecer', 'interior', 'exterior'),
    description TEXT,
    dialogue_count INT DEFAULT 0,
    estimated_duration INT COMMENT 'Duración estimada en segundos',
    shooting_date DATE,
    status ENUM('pendiente', 'filmada', 'aprobada', 'refilmar') DEFAULT 'pendiente',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE,
    INDEX idx_scenes_script (script_id),
    INDEX idx_scenes_number (script_id, scene_number),
    INDEX idx_scenes_status (status),
    INDEX idx_scenes_shooting_date (shooting_date),
    FULLTEXT idx_scenes_search (scene_name, location, description)
) ENGINE=InnoDB COMMENT='Escenas de los guiones';

-- Tabla: characters
CREATE TABLE characters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    character_type ENUM('principal', 'secundario', 'extra', 'voz') DEFAULT 'secundario',
    description TEXT,
    age_range VARCHAR(50),
    gender ENUM('masculino', 'femenino', 'no_binario', 'indefinido'),
    casting_notes TEXT,
    costume_notes TEXT,
    makeup_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_characters_project (project_id),
    INDEX idx_characters_type (character_type),
    FULLTEXT idx_characters_search (name, description)
) ENGINE=InnoDB COMMENT='Personajes de los proyectos';

-- ===============================================
-- 4. MÓDULO DE TALENTOS
-- ===============================================

-- Tabla: talent_profiles
CREATE TABLE talent_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    stage_name VARCHAR(200),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    birthdate DATE,
    gender ENUM('masculino', 'femenino', 'no_binario', 'prefiero_no_decir'),
    nationality VARCHAR(100),
    city VARCHAR(100),
    
    -- Información física
    height INT COMMENT 'Altura en centímetros',
    weight INT COMMENT 'Peso en kilogramos',
    hair_color VARCHAR(50),
    eye_color VARCHAR(50),
    
    -- Información profesional
    experience_level ENUM('principiante', 'intermedio', 'avanzado', 'profesional'),
    union_member BOOLEAN DEFAULT FALSE,
    union_name VARCHAR(200),
    representation VARCHAR(200) COMMENT 'Agencia o representante',
    
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
    special_skills JSON COMMENT 'Habilidades especiales: idiomas, deportes, instrumentos, etc.',
    languages JSON COMMENT 'Idiomas que habla',
    
    -- Estado
    status ENUM('activo', 'inactivo', 'blacklist') DEFAULT 'activo',
    rating DECIMAL(3,2) DEFAULT 0.00 COMMENT 'Calificación promedio 0-5',
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_talent_email (email),
    INDEX idx_talent_name (first_name, last_name),
    INDEX idx_talent_stage_name (stage_name),
    INDEX idx_talent_experience (experience_level),
    INDEX idx_talent_status (status),
    INDEX idx_talent_availability (available_from, available_until),
    FULLTEXT idx_talent_search (first_name, last_name, stage_name)
) ENGINE=InnoDB COMMENT='Perfiles de talentos y actores';

-- Tabla: auditions
CREATE TABLE auditions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    character_id INT NOT NULL,
    talent_id INT NOT NULL,
    audition_date DATETIME NOT NULL,
    audition_type ENUM('presencial', 'virtual', 'self_tape') DEFAULT 'presencial',
    location VARCHAR(200),
    status ENUM('programada', 'completada', 'cancelada', 'reprogramada') DEFAULT 'programada',
    
    -- Evaluación
    rating DECIMAL(3,2) COMMENT 'Calificación 0-5',
    performance_notes TEXT,
    director_feedback TEXT,
    casting_director_feedback TEXT,
    
    -- Archivos
    audition_video_url VARCHAR(255),
    callback_needed BOOLEAN DEFAULT FALSE,
    callback_date DATETIME,
    
    -- Resultado
    result ENUM('pendiente', 'callback', 'seleccionado', 'rechazado') DEFAULT 'pendiente',
    rejection_reason TEXT,
    
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    FOREIGN KEY (talent_id) REFERENCES talent_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_auditions_project (project_id),
    INDEX idx_auditions_character (character_id),
    INDEX idx_auditions_talent (talent_id),
    INDEX idx_auditions_date (audition_date),
    INDEX idx_auditions_status (status),
    INDEX idx_auditions_result (result),
    UNIQUE KEY unique_audition (project_id, character_id, talent_id, audition_date)
) ENGINE=InnoDB COMMENT='Audiciones de talentos';

-- Tabla: contracts
CREATE TABLE contracts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    talent_id INT NOT NULL,
    character_id INT,
    contract_type ENUM('actor_principal', 'actor_secundario', 'extra', 'crew', 'freelance', 'patrocinio') NOT NULL,
    
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
    payment_schedule ENUM('unico', 'semanal', 'quincenal', 'mensual', 'por_hitos') DEFAULT 'mensual',
    payment_terms TEXT,
    
    -- Estado y documentos
    status ENUM('borrador', 'enviado', 'firmado', 'activo', 'completado', 'cancelado', 'vencido') DEFAULT 'borrador',
    contract_file_url VARCHAR(255),
    signed_contract_url VARCHAR(255),
    
    -- Términos especiales
    exclusivity BOOLEAN DEFAULT FALSE,
    confidentiality BOOLEAN DEFAULT TRUE,
    image_rights BOOLEAN DEFAULT TRUE,
    cancellation_terms TEXT,
    
    -- Seguimiento
    created_by INT NOT NULL,
    approved_by INT,
    signed_by_talent DATETIME,
    signed_by_production DATETIME,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (talent_id) REFERENCES talent_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_contracts_project (project_id),
    INDEX idx_contracts_talent (talent_id),
    INDEX idx_contracts_type (contract_type),
    INDEX idx_contracts_status (status),
    INDEX idx_contracts_dates (start_date, end_date),
    INDEX idx_contracts_number (contract_number)
) ENGINE=InnoDB COMMENT='Contratos con talentos y equipo';

-- ===============================================
-- 5. MÓDULO DE PATROCINIO (CRÍTICO)
-- ===============================================

-- Tabla: sponsors
CREATE TABLE sponsors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(200),
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    industry VARCHAR(100),
    company_size ENUM('startup', 'pequeña', 'mediana', 'grande', 'corporacion'),
    website VARCHAR(255),
    address TEXT,
    tax_id VARCHAR(50),
    
    -- Clasificación
    sponsor_tier ENUM('bronce', 'plata', 'oro', 'platino', 'exclusivo') DEFAULT 'bronce',
    preferred_genres JSON COMMENT 'Géneros de contenido preferidos',
    target_demographics JSON COMMENT 'Demographics objetivo del patrocinador',
    
    -- Historial
    total_sponsored_amount DECIMAL(12,2) DEFAULT 0,
    projects_count INT DEFAULT 0,
    average_satisfaction DECIMAL(3,2) DEFAULT 0,
    
    -- Estado
    status ENUM('prospecto', 'activo', 'inactivo', 'blacklist') DEFAULT 'prospecto',
    relationship_manager_id INT,
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (relationship_manager_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_sponsors_company (company_name),
    INDEX idx_sponsors_tier (sponsor_tier),
    INDEX idx_sponsors_status (status),
    INDEX idx_sponsors_manager (relationship_manager_id),
    FULLTEXT idx_sponsors_search (company_name, contact_name, industry)
) ENGINE=InnoDB COMMENT='Patrocinadores y empresas colaboradoras';

-- Tabla: sponsorship_deals
CREATE TABLE sponsorship_deals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    sponsor_id INT NOT NULL,
    
    -- Información del acuerdo
    deal_name VARCHAR(200) NOT NULL,
    deal_type ENUM('patrocinio', 'product_placement', 'co_produccion', 'distribucion', 'licencia') NOT NULL,
    sponsorship_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'COP',
    
    -- ⚠️ FECHAS CRÍTICAS - ALERTAS AUTOMÁTICAS
    contract_start_date DATE NOT NULL,
    contract_end_date DATE NOT NULL,
    payment_due_date DATE,
    delivery_deadline DATE,
    
    -- ⚠️ LICENCIAS CRÍTICAS
    license_expiry_date DATE COMMENT '🚨 CRÍTICO: Fecha de vencimiento de licencias',
    renewal_notification_days INT DEFAULT 30 COMMENT 'Días antes para notificar renovación',
    auto_renewal BOOLEAN DEFAULT FALSE,
    renewal_terms TEXT,
    
    -- Estado del acuerdo
    status ENUM('negociacion', 'enviado', 'firmado', 'activo', 'completado', 'cancelado', 'vencido', 'renovacion_pendiente') DEFAULT 'negociacion',
    
    -- Entregables
    deliverables JSON COMMENT 'Lista de entregables comprometidos',
    delivery_status JSON COMMENT 'Estado de cada entregable',
    
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
    payment_status ENUM('pendiente', 'parcial', 'completo', 'atrasado') DEFAULT 'pendiente',
    
    -- Responsables
    account_manager_id INT,
    legal_contact_id INT,
    created_by INT NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (sponsor_id) REFERENCES sponsors(id) ON DELETE CASCADE,
    FOREIGN KEY (account_manager_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (legal_contact_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    
    -- ⚠️ ÍNDICES CRÍTICOS PARA ALERTAS
    INDEX idx_sponsorship_license_expiry (license_expiry_date),
    INDEX idx_sponsorship_payment_due (payment_due_date),
    INDEX idx_sponsorship_delivery_deadline (delivery_deadline),
    INDEX idx_sponsorship_status (status),
    INDEX idx_sponsorship_project (project_id),
    INDEX idx_sponsorship_sponsor (sponsor_id),
    INDEX idx_sponsorship_active (status, contract_end_date)
) ENGINE=InnoDB COMMENT='🚨 CRÍTICO: Acuerdos de patrocinio con alertas automáticas';

-- ===============================================
-- 6. MÓDULO DE DISTRIBUCIÓN
-- ===============================================

-- Tabla: distribution_platforms
CREATE TABLE distribution_platforms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    platform_name VARCHAR(200) NOT NULL,
    platform_type ENUM('streaming', 'vod', 'theatrical', 'tv', 'podcast', 'social_media') NOT NULL,
    platform_category VARCHAR(100) COMMENT 'netflix, amazon_prime, youtube, spotify, etc.',
    
    -- Términos del acuerdo
    distribution_type ENUM('exclusive', 'non_exclusive', 'windowed') DEFAULT 'non_exclusive',
    territory VARCHAR(200) DEFAULT 'worldwide',
    language_versions JSON COMMENT 'Versiones de idioma disponibles',
    
    -- ⚠️ FECHAS CRÍTICAS DE DISTRIBUCIÓN
    license_start_date DATE NOT NULL,
    license_end_date DATE NOT NULL,
    renewal_option BOOLEAN DEFAULT FALSE,
    renewal_deadline DATE,
    
    -- Modelo de ingresos
    revenue_model ENUM('revenue_share', 'flat_fee', 'minimum_guarantee', 'free') DEFAULT 'revenue_share',
    revenue_percentage DECIMAL(5,2),
    minimum_guarantee DECIMAL(12,2),
    flat_fee_amount DECIMAL(12,2),
    
    -- Requerimientos técnicos
    technical_specs TEXT,
    delivery_requirements TEXT,
    metadata_requirements TEXT,
    
    -- Estado
    status ENUM('negotiating', 'signed', 'live', 'expired', 'terminated') DEFAULT 'negotiating',
    go_live_date DATE,
    content_id VARCHAR(200) COMMENT 'ID en la plataforma',
    
    -- Contacto
    contact_name VARCHAR(200),
    contact_email VARCHAR(200),
    contact_phone VARCHAR(20),
    
    notes TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_distribution_project (project_id),
    INDEX idx_distribution_platform (platform_name),
    INDEX idx_distribution_type (platform_type),
    INDEX idx_distribution_status (status),
    INDEX idx_distribution_license_dates (license_start_date, license_end_date),
    INDEX idx_distribution_renewal (renewal_deadline)
) ENGINE=InnoDB COMMENT='Plataformas de distribución';

-- ===============================================
-- 7. TABLAS DE AUDITORÍA Y NOTIFICACIONES
-- ===============================================

-- Tabla: audit_log
CREATE TABLE audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    table_name VARCHAR(100) NOT NULL,
    record_id INT NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_table (table_name),
    INDEX idx_audit_record (table_name, record_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB COMMENT='Log de auditoría del sistema';

-- Tabla: system_notifications
CREATE TABLE system_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    notification_type VARCHAR(100) NOT NULL COMMENT 'license_expiry, payment_overdue, audition_received, etc.',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(255),
    
    -- Metadatos
    related_table VARCHAR(100),
    related_id INT,
    metadata JSON,
    
    -- Estado
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_type (notification_type),
    INDEX idx_notifications_priority (priority),
    INDEX idx_notifications_read (is_read),
    INDEX idx_notifications_created (created_at),
    INDEX idx_notifications_expires (expires_at)
) ENGINE=InnoDB COMMENT='Notificaciones del sistema';

-- ===============================================
-- 8. TABLAS DE RELACIÓN
-- ===============================================

-- Tabla: scene_characters (Muchos a Muchos)
CREATE TABLE scene_characters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scene_id INT NOT NULL,
    character_id INT NOT NULL,
    importance ENUM('principal', 'secundario', 'background') DEFAULT 'secundario',
    dialogue_lines_count INT DEFAULT 0,
    screen_time_seconds INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    INDEX idx_scene_characters_scene (scene_id),
    INDEX idx_scene_characters_character (character_id),
    UNIQUE KEY unique_scene_character (scene_id, character_id)
) ENGINE=InnoDB COMMENT='Relación entre escenas y personajes';

-- ===============================================
-- 9. DATOS INICIALES
-- ===============================================

-- Insertar roles por defecto
INSERT INTO roles (name, display_name, description, permissions) VALUES
('super_admin', 'Super Administrador', 'Acceso completo a todos los módulos', 
 '{"produccion": ["read", "write", "delete"], "talentos": ["read", "write", "delete"], "patrocinio": ["read", "write", "delete"], "distribucion": ["read", "write", "delete"], "usuarios": ["read", "write", "delete"]}'),

('gerente_produccion', 'Gerente de Producción', 'Gestión completa de proyectos y producción',
 '{"produccion": ["read", "write", "delete"], "talentos": ["read", "write"], "patrocinio": ["read"], "distribucion": ["read", "write"], "usuarios": ["read"]}'),

('gerente_patrocinio', 'Gerente de Patrocinio', 'Gestión de patrocinadores y acuerdos comerciales',
 '{"produccion": ["read"], "talentos": ["read"], "patrocinio": ["read", "write", "delete"], "distribucion": ["read"], "usuarios": ["read"]}'),

('director_casting', 'Director de Casting', 'Gestión de talentos y casting',
 '{"produccion": ["read"], "talentos": ["read", "write", "delete"], "patrocinio": [], "distribucion": [], "usuarios": ["read"]}'),

('coordinador_distribucion', 'Coordinador de Distribución', 'Gestión de distribución y plataformas',
 '{"produccion": ["read"], "talentos": ["read"], "patrocinio": ["read"], "distribucion": ["read", "write", "delete"], "usuarios": ["read"]}'),

('asistente', 'Asistente', 'Acceso de solo lectura para asistir en tareas',
 '{"produccion": ["read"], "talentos": ["read"], "patrocinio": [], "distribucion": ["read"], "usuarios": []}');

-- Crear usuario administrador por defecto
INSERT INTO users (username, email, password_hash, first_name, last_name, role_id, is_active) VALUES
('admin', 'admin@reaproductions.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'Sistema', 1, TRUE);

-- ===============================================
-- 10. TRIGGERS PARA AUDITORÍA AUTOMÁTICA
-- ===============================================

DELIMITER //

-- Trigger para auditoría en sponsorship_deals (CRÍTICO)
CREATE TRIGGER audit_sponsorship_deals_insert
    AFTER INSERT ON sponsorship_deals
    FOR EACH ROW
BEGIN
    INSERT INTO audit_log (user_id, table_name, record_id, action, new_values, ip_address)
    VALUES (NEW.created_by, 'sponsorship_deals', NEW.id, 'INSERT', 
            JSON_OBJECT('deal_name', NEW.deal_name, 'sponsor_id', NEW.sponsor_id, 
                       'license_expiry_date', NEW.license_expiry_date, 'status', NEW.status), 
            CONNECTION_ID());
END//

CREATE TRIGGER audit_sponsorship_deals_update
    AFTER UPDATE ON sponsorship_deals
    FOR EACH ROW
BEGIN
    INSERT INTO audit_log (user_id, table_name, record_id, action, old_values, new_values)
    VALUES (@current_user_id, 'sponsorship_deals', NEW.id, 'UPDATE',
            JSON_OBJECT('status', OLD.status, 'license_expiry_date', OLD.license_expiry_date),
            JSON_OBJECT('status', NEW.status, 'license_expiry_date', NEW.license_expiry_date));
END//

-- Trigger para notificaciones automáticas de vencimiento
CREATE TRIGGER check_license_expiry_notification
    AFTER INSERT ON sponsorship_deals
    FOR EACH ROW
BEGIN
    -- Crear notificación si la licencia vence en menos de 30 días
    IF NEW.license_expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN
        INSERT INTO system_notifications (user_id, notification_type, priority, title, message, related_table, related_id)
        SELECT u.id, 'license_expiry_warning', 'critical',
               CONCAT('⚠️ Licencia próxima a vencer: ', NEW.deal_name),
               CONCAT('La licencia del acuerdo "', NEW.deal_name, '" vence el ', NEW.license_expiry_date, '. Revisar renovación urgente.'),
               'sponsorship_deals', NEW.id
        FROM users u 
        WHERE u.role_id IN (1, 3); -- Super admin y gerente de patrocinio
    END IF;
END//

DELIMITER ;

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
GROUP BY p.id;

-- Vista: Alertas críticas de vencimiento
CREATE VIEW v_critical_alerts AS
SELECT 
    'sponsorship_license' AS alert_type,
    sd.id AS record_id,
    sd.deal_name AS title,
    CONCAT('Licencia vence: ', sd.license_expiry_date) AS message,
    DATEDIFF(sd.license_expiry_date, CURDATE()) AS days_remaining,
    'critical' AS priority,
    p.title AS project_name,
    s.company_name AS sponsor_name
FROM sponsorship_deals sd
JOIN projects p ON sd.project_id = p.id
JOIN sponsors s ON sd.sponsor_id = s.id
WHERE sd.license_expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
  AND sd.status = 'activo'

UNION ALL

SELECT 
    'contract_expiry' AS alert_type,
    c.id AS record_id,
    c.contract_title AS title,
    CONCAT('Contrato vence: ', c.end_date) AS message,
    DATEDIFF(c.end_date, CURDATE()) AS days_remaining,
    CASE 
        WHEN DATEDIFF(c.end_date, CURDATE()) <= 7 THEN 'critical'
        WHEN DATEDIFF(c.end_date, CURDATE()) <= 15 THEN 'high'
        ELSE 'medium'
    END AS priority,
    p.title AS project_name,
    CONCAT(tp.first_name, ' ', tp.last_name) AS talent_name
FROM contracts c
JOIN projects p ON c.project_id = p.id
JOIN talent_profiles tp ON c.talent_id = tp.id
WHERE c.end_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
  AND c.status = 'activo';

-- ===============================================
-- 12. PROCEDIMIENTOS ALMACENADOS
-- ===============================================

DELIMITER //

-- Procedimiento para crear notificaciones automáticas
CREATE PROCEDURE CreateExpiryNotifications()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE deal_id INT;
    DECLARE deal_name VARCHAR(200);
    DECLARE expiry_date DATE;
    DECLARE days_remaining INT;
    
    DECLARE cur CURSOR FOR 
        SELECT id, deal_name, license_expiry_date, DATEDIFF(license_expiry_date, CURDATE())
        FROM sponsorship_deals 
        WHERE status = 'activo' 
          AND license_expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
          AND id NOT IN (
              SELECT related_id 
              FROM system_notifications 
              WHERE notification_type = 'license_expiry_warning' 
                AND created_at >= CURDATE()
          );
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO deal_id, deal_name, expiry_date, days_remaining;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Crear notificación para usuarios relevantes
        INSERT INTO system_notifications (user_id, notification_type, priority, title, message, related_table, related_id)
        SELECT u.id, 'license_expiry_warning', 
               CASE WHEN days_remaining <= 7 THEN 'critical' ELSE 'high' END,
               CONCAT('⚠️ Licencia vence en ', days_remaining, ' días'),
               CONCAT('El acuerdo "', deal_name, '" vence el ', expiry_date, '. Acción requerida.'),
               'sponsorship_deals', deal_id
        FROM users u 
        WHERE u.role_id IN (1, 3) AND u.is_active = TRUE;
        
    END LOOP;
    
    CLOSE cur;
END//

DELIMITER ;

-- ===============================================
-- 13. CONFIGURACIÓN FINAL
-- ===============================================

-- Configurar eventos para ejecutar notificaciones automáticamente
SET GLOBAL event_scheduler = ON;

CREATE EVENT IF NOT EXISTS daily_expiry_check
ON SCHEDULE EVERY 1 DAY
STARTS CONCAT(CURDATE() + INTERVAL 1 DAY, ' 08:00:00')
DO
  CALL CreateExpiryNotifications();

-- ===============================================
-- 🎬 CONFIGURACIÓN COMPLETADA
-- ===============================================

SELECT 'Base de datos SGP REA Productions configurada exitosamente' AS status;
SELECT COUNT(*) AS total_tables FROM information_schema.tables WHERE table_schema = 'sgp_rea_prod';
SELECT 'Alertas automáticas activadas para licencias críticas' AS security_note;