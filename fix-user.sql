-- Crear usuario por defecto para permitir creación de proyectos
-- Este script soluciona el error de foreign key en created_by

USE sgp_rea_prod;

-- Verificar si existe la tabla users
SHOW TABLES LIKE 'users';

-- Insertar usuario por defecto si no existe
INSERT INTO users (id, username, email, password_hash, role, is_active, created_at, updated_at)
VALUES (
    1,
    'admin',
    'admin@reaproductions.com',
    '$2a$10$DUMMY_HASH_FOR_TESTING_ONLY', -- Contraseña dummy
    'admin',
    1,
    NOW(),
    NOW()
)
ON DUPLICATE KEY UPDATE
    username = 'admin',
    updated_at = NOW();

-- Verificar inserción
SELECT id, username, email, role, is_active FROM users WHERE id = 1;
