-- Insertar un guión de prueba para el proyecto existente
-- Asegúrate de que el project_id coincida con un proyecto existente

INSERT INTO scripts (
    project_id,
    title,
    version,
    file_path,
    file_type,
    file_size,
    page_count,
    scene_count,
    is_current,
    notes,
    uploaded_by,
    created_at,
    updated_at
) VALUES (
    5,  -- ID del proyecto de prueba (ajusta si es necesario)
    'Guión Principal - Versión 1.0',
    'v1.0',
    '/uploads/scripts/guion_principal_v1.pdf',
    'pdf',
    2048576,  -- 2 MB en bytes
    120,  -- 120 páginas
    0,  -- scene_count se actualizará automáticamente
    1,  -- is_current = true (guión actual)
    'Guión inicial del proyecto. Listo para desglose de escenas.',
    1,  -- uploaded_by = admin user
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Verificar que se insertó correctamente
SELECT * FROM scripts ORDER BY id DESC LIMIT 1;
