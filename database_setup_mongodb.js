// ===============================================
// 🎬 SGP REA PRODUCTIONS - CONFIGURACIÓN MongoDB
// ===============================================
// Archivo: database_setup_mongodb.js
// Propósito: Script completo para configurar MongoDB Atlas
// Autor: Sistema SGP REA
// Fecha: Octubre 2025

// ===============================================
// 1. CONFIGURACIÓN INICIAL
// ===============================================

// Conectar a la base de datos
use('sgp_rea_productions');

print("🚀 Iniciando configuración de MongoDB para SGP REA Productions...");

// ===============================================
// 2. COLECCIONES PARA ARCHIVOS Y METADATOS
// ===============================================

// Colección: project_files
// Almacena metadatos de todos los archivos del proyecto
db.project_files.createIndex({ "project_id": 1, "file_type": 1 });
db.project_files.createIndex({ "created_at": -1 });
db.project_files.createIndex({ "file_name": "text", "description": "text" });

// Insertar documentos de ejemplo
db.project_files.insertMany([
    {
        project_id: 1,
        file_name: "guion_principal_v1.pdf",
        file_type: "script",
        file_category: "document",
        file_path: "/storage/projects/1/scripts/guion_principal_v1.pdf",
        file_size: 2048576, // bytes
        mime_type: "application/pdf",
        version: "1.0",
        description: "Primera versión del guión principal",
        upload_metadata: {
            original_name: "Guión El Último Suspiro v1.pdf",
            uploaded_by: 1,
            upload_ip: "192.168.1.100",
            upload_device: "Windows Desktop"
        },
        processing_status: "completed",
        thumbnails: {
            small: "/storage/projects/1/thumbnails/guion_v1_small.jpg",
            medium: "/storage/projects/1/thumbnails/guion_v1_medium.jpg"
        },
        tags: ["guion", "principal", "v1", "completo"],
        permissions: {
            public: false,
            roles_allowed: ["gerente_produccion", "director", "super_admin"],
            users_allowed: [1, 2, 3]
        },
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        project_id: 1,
        file_name: "casting_audition_maria_rodriguez.mp4",
        file_type: "audition_video",
        file_category: "video",
        file_path: "/storage/projects/1/auditions/casting_audition_maria_rodriguez.mp4",
        file_size: 157286400, // bytes
        mime_type: "video/mp4",
        video_metadata: {
            duration: 180, // segundos
            resolution: "1920x1080",
            fps: 30,
            codec: "h264"
        },
        audition_data: {
            talent_id: 101,
            character_id: 5,
            audition_date: new Date("2025-10-01"),
            rating: 4.2,
            notes: "Excelente interpretación, muy natural"
        },
        processing_status: "completed",
        thumbnails: {
            poster: "/storage/projects/1/thumbnails/maria_audition_poster.jpg",
            animated_gif: "/storage/projects/1/thumbnails/maria_audition.gif"
        },
        tags: ["audition", "maria_rodriguez", "protagonista", "approved"],
        permissions: {
            public: false,
            roles_allowed: ["gerente_produccion", "director_casting", "super_admin"],
            sensitive: true
        },
        created_at: new Date(),
        updated_at: new Date()
    }
]);

// ===============================================
// 3. COLECCIÓN PARA LOGS DEL SISTEMA
// ===============================================

// Colección: system_logs
db.system_logs.createIndex({ "timestamp": -1 });
db.system_logs.createIndex({ "level": 1, "timestamp": -1 });
db.system_logs.createIndex({ "user_id": 1, "timestamp": -1 });
db.system_logs.createIndex({ "action": 1, "timestamp": -1 });

// Insertar logs de ejemplo
db.system_logs.insertMany([
    {
        timestamp: new Date(),
        level: "INFO",
        action: "USER_LOGIN",
        user_id: 1,
        username: "admin",
        message: "Usuario administrador inició sesión exitosamente",
        metadata: {
            ip_address: "192.168.1.100",
            user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            session_id: "sess_abc123def456",
            login_method: "email_password"
        },
        request_id: "req_" + new ObjectId().toString()
    },
    {
        timestamp: new Date(),
        level: "WARNING",
        action: "LICENSE_EXPIRY_ALERT",
        user_id: null,
        message: "Licencia de patrocinio próxima a vencer",
        metadata: {
            sponsorship_deal_id: 1,
            deal_name: "Patrocinio Coca-Cola Q4 2025",
            expiry_date: new Date("2025-12-31"),
            days_remaining: 25,
            notification_sent_to: [1, 3, 5]
        },
        severity: "high",
        request_id: "system_alert_" + new ObjectId().toString()
    },
    {
        timestamp: new Date(),
        level: "ERROR",
        action: "FILE_UPLOAD_FAILED",
        user_id: 2,
        username: "director_casting",
        message: "Error al subir video de audición",
        metadata: {
            file_name: "audition_large_file.mov",
            file_size: 2147483648, // 2GB
            error_code: "FILE_TOO_LARGE",
            max_allowed_size: 1073741824 // 1GB
        },
        error_details: {
            stack_trace: "FileUploadError: File exceeds maximum size limit...",
            recovery_suggestion: "Comprimir video o usar enlace externo"
        },
        request_id: "req_" + new ObjectId().toString()
    }
]);

// ===============================================
// 4. COLECCIÓN PARA ANALYTICS Y MÉTRICAS
// ===============================================

// Colección: project_analytics
db.project_analytics.createIndex({ "project_id": 1, "date": -1 });
db.project_analytics.createIndex({ "metric_type": 1, "date": -1 });

// Insertar métricas de ejemplo
db.project_analytics.insertMany([
    {
        project_id: 1,
        date: new Date("2025-10-01"),
        metric_type: "production_progress",
        metrics: {
            scenes_completed: 15,
            scenes_total: 45,
            completion_percentage: 33.33,
            days_elapsed: 20,
            days_remaining: 40,
            budget_used: 125000,
            budget_total: 500000,
            budget_percentage: 25.0
        },
        milestones: {
            pre_production_completed: true,
            casting_completed: true,
            principal_photography_started: true,
            post_production_started: false
        },
        team_metrics: {
            total_crew: 25,
            total_cast: 8,
            active_contracts: 33,
            pending_auditions: 3
        }
    },
    {
        project_id: 1,
        date: new Date("2025-10-01"),
        metric_type: "financial_overview",
        metrics: {
            total_revenue_projected: 750000,
            sponsorship_secured: 200000,
            distribution_deals_value: 400000,
            production_costs: 500000,
            marketing_budget: 100000,
            projected_profit: 150000,
            roi_percentage: 30.0
        },
        revenue_streams: {
            sponsorships: 200000,
            theatrical: 150000,
            streaming: 200000,
            international_sales: 200000
        },
        cost_breakdown: {
            above_line: 150000, // talento principal
            below_line: 200000, // crew y producción
            post_production: 75000,
            marketing: 75000
        }
    }
]);

// ===============================================
// 5. COLECCIÓN PARA CONFIGURACIONES DINÁMICAS
// ===============================================

// Colección: app_configurations
db.app_configurations.createIndex({ "key": 1 }, { unique: true });
db.app_configurations.createIndex({ "category": 1 });

// Insertar configuraciones del sistema
db.app_configurations.insertMany([
    {
        key: "license_expiry_alerts",
        category: "notifications",
        value: {
            enabled: true,
            warning_days: [30, 15, 7, 3, 1],
            notification_methods: ["email", "in_app", "slack"],
            recipients: {
                roles: ["super_admin", "gerente_patrocinio"],
                specific_users: [1]
            },
            escalation_rules: {
                critical_days: 7,
                escalate_to_roles: ["super_admin"],
                max_notifications_per_day: 3
            }
        },
        description: "Configuración de alertas de vencimiento de licencias",
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        key: "file_upload_settings",
        category: "storage",
        value: {
            max_file_size: {
                video: 1073741824, // 1GB
                image: 52428800,   // 50MB
                document: 104857600, // 100MB
                audio: 524288000   // 500MB
            },
            allowed_formats: {
                video: ["mp4", "avi", "mov", "mkv"],
                image: ["jpg", "jpeg", "png", "gif", "bmp"],
                document: ["pdf", "doc", "docx", "txt"],
                audio: ["mp3", "wav", "aac", "flac"]
            },
            storage_providers: {
                primary: "google_cloud_storage",
                backup: "aws_s3",
                cdn: "cloudflare"
            },
            compression_settings: {
                video_quality: "high",
                image_quality: 85,
                generate_thumbnails: true,
                generate_previews: true
            }
        },
        description: "Configuración de carga y almacenamiento de archivos",
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        key: "security_settings",
        category: "security",
        value: {
            session_timeout: 3600, // 1 hora en segundos
            max_login_attempts: 5,
            lockout_duration: 900, // 15 minutos
            password_policy: {
                min_length: 8,
                require_uppercase: true,
                require_lowercase: true,
                require_numbers: true,
                require_special_chars: true,
                history_count: 5
            },
            two_factor_auth: {
                enabled: true,
                methods: ["sms", "email", "authenticator"],
                backup_codes_count: 10
            },
            ip_whitelist: {
                enabled: false,
                allowed_ips: []
            }
        },
        description: "Configuraciones de seguridad del sistema",
        created_at: new Date(),
        updated_at: new Date()
    }
]);

// ===============================================
// 6. COLECCIÓN PARA BÚSQUEDAS Y FILTROS
// ===============================================

// Colección: search_indexes
db.search_indexes.createIndex({ "index_type": 1, "last_updated": -1 });

// Crear índices de búsqueda optimizados
db.search_indexes.insertMany([
    {
        index_type: "talent_search",
        description: "Índice optimizado para búsqueda de talentos",
        fields_indexed: [
            "first_name", "last_name", "stage_name", 
            "special_skills", "experience_level", "languages"
        ],
        search_weights: {
            "stage_name": 10,
            "first_name": 8,
            "last_name": 8,
            "special_skills": 6,
            "experience_level": 4
        },
        filters_available: [
            "gender", "age_range", "experience_level", 
            "availability", "location", "union_member"
        ],
        last_updated: new Date(),
        total_documents: 0
    },
    {
        index_type: "project_search",
        description: "Índice optimizado para búsqueda de proyectos",
        fields_indexed: [
            "title", "description", "genre", "synopsis", "tags"
        ],
        search_weights: {
            "title": 10,
            "genre": 8,
            "description": 6,
            "synopsis": 6,
            "tags": 4
        },
        filters_available: [
            "status", "genre", "budget_range", "date_range", 
            "director", "producer", "sponsor_tier"
        ],
        last_updated: new Date(),
        total_documents: 0
    }
]);

// ===============================================
// 7. COLECCIÓN PARA BACKUPS Y SINCRONIZACIÓN
// ===============================================

// Colección: sync_status
db.sync_status.createIndex({ "table_name": 1, "last_sync": -1 });

// Estado de sincronización entre MySQL y MongoDB
db.sync_status.insertMany([
    {
        table_name: "projects",
        last_sync: new Date(),
        sync_type: "incremental",
        records_synced: 0,
        records_failed: 0,
        status: "success",
        next_sync: new Date(Date.now() + 3600000), // 1 hora
        errors: []
    },
    {
        table_name: "talent_profiles",
        last_sync: new Date(),
        sync_type: "full",
        records_synced: 0,
        records_failed: 0,
        status: "success",
        next_sync: new Date(Date.now() + 7200000), // 2 horas
        errors: []
    },
    {
        table_name: "sponsorship_deals",
        last_sync: new Date(),
        sync_type: "real_time",
        records_synced: 0,
        records_failed: 0,
        status: "active",
        next_sync: new Date(Date.now() + 300000), // 5 minutos
        errors: [],
        priority: "high" // Crítico para alertas
    }
]);

// ===============================================
// 8. COLECCIÓN PARA REPORTES Y DASHBOARD
// ===============================================

// Colección: dashboard_widgets
db.dashboard_widgets.createIndex({ "user_id": 1, "position": 1 });
db.dashboard_widgets.createIndex({ "widget_type": 1, "is_active": 1 });

// Configuración de widgets del dashboard
db.dashboard_widgets.insertMany([
    {
        user_id: 1, // Super admin
        widget_type: "critical_alerts",
        title: "🚨 Alertas Críticas",
        position: { row: 1, col: 1, width: 6, height: 4 },
        configuration: {
            alert_types: ["license_expiry", "payment_overdue", "contract_expiry"],
            max_items: 10,
            auto_refresh: 300 // 5 minutos
        },
        data_source: {
            type: "aggregation",
            collection: "system_logs",
            pipeline: [
                { $match: { level: { $in: ["WARNING", "ERROR"] } } },
                { $sort: { timestamp: -1 } },
                { $limit: 10 }
            ]
        },
        is_active: true,
        created_at: new Date()
    },
    {
        user_id: 1,
        widget_type: "projects_overview",
        title: "📊 Resumen de Proyectos",
        position: { row: 1, col: 7, width: 6, height: 4 },
        configuration: {
            chart_type: "donut",
            show_percentages: true,
            color_scheme: "cinema"
        },
        data_source: {
            type: "mysql_view",
            view: "v_active_projects",
            group_by: "status"
        },
        is_active: true,
        created_at: new Date()
    },
    {
        user_id: 3, // Gerente de patrocinio
        widget_type: "sponsorship_pipeline",
        title: "💰 Pipeline de Patrocinios",
        position: { row: 1, col: 1, width: 12, height: 6 },
        configuration: {
            show_amounts: true,
            currency: "COP",
            stages: ["negociacion", "enviado", "firmado", "activo"],
            forecast_enabled: true
        },
        data_source: {
            type: "mysql_table",
            table: "sponsorship_deals",
            filters: { status: { $ne: "cancelado" } }
        },
        is_active: true,
        created_at: new Date()
    }
]);

// ===============================================
// 9. COLECCIÓN PARA INTEGRACIONES EXTERNAS
// ===============================================

// Colección: external_integrations
db.external_integrations.createIndex({ "service_name": 1, "is_active": 1 });

// Configuración de integraciones con servicios externos
db.external_integrations.insertMany([
    {
        service_name: "google_cloud_storage",
        service_type: "file_storage",
        configuration: {
            bucket_name: "sgp-rea-productions",
            region: "us-central1",
            credentials_file: "/config/gcp-credentials.json",
            public_url_base: "https://storage.googleapis.com/sgp-rea-productions/",
            cdn_enabled: true,
            cdn_url: "https://cdn.reaproductions.com/"
        },
        endpoints: {
            upload: "https://storage.googleapis.com/upload/storage/v1/b/sgp-rea-productions/o",
            download: "https://storage.googleapis.com/storage/v1/b/sgp-rea-productions/o",
            delete: "https://storage.googleapis.com/storage/v1/b/sgp-rea-productions/o"
        },
        rate_limits: {
            uploads_per_minute: 100,
            downloads_per_minute: 1000,
            api_calls_per_day: 100000
        },
        is_active: true,
        health_check: {
            last_check: new Date(),
            status: "healthy",
            response_time_ms: 150
        },
        created_at: new Date()
    },
    {
        service_name: "sendgrid_email",
        service_type: "email_service",
        configuration: {
            api_key: "SG.xxx-secure-key-xxx",
            from_email: "noreply@reaproductions.com",
            from_name: "REA Productions Sistema",
            templates: {
                license_expiry: "d-template-id-1",
                contract_notification: "d-template-id-2",
                welcome_user: "d-template-id-3"
            }
        },
        endpoints: {
            send_email: "https://api.sendgrid.com/v3/mail/send",
            templates: "https://api.sendgrid.com/v3/templates"
        },
        rate_limits: {
            emails_per_day: 40000,
            emails_per_hour: 2000
        },
        is_active: true,
        health_check: {
            last_check: new Date(),
            status: "healthy",
            response_time_ms: 250
        },
        created_at: new Date()
    },
    {
        service_name: "slack_notifications",
        service_type: "messaging",
        configuration: {
            webhook_url: "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
            default_channel: "#sgp-alerts",
            channels: {
                critical_alerts: "#sgp-critical",
                general_notifications: "#sgp-general",
                file_uploads: "#sgp-files"
            },
            mention_users: {
                critical: ["@admin", "@gerente.patrocinio"],
                high: ["@admin"]
            }
        },
        is_active: true,
        health_check: {
            last_check: new Date(),
            status: "healthy",
            response_time_ms: 100
        },
        created_at: new Date()
    }
]);

// ===============================================
// 10. FUNCIONES DE UTILIDAD
// ===============================================

// Función para limpiar logs antiguos (ejecutar mensualmente)
function cleanupOldLogs() {
    const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
    
    const result = db.system_logs.deleteMany({
        timestamp: { $lt: thirtyDaysAgo },
        level: { $in: ["INFO", "DEBUG"] } // Mantener WARNING y ERROR más tiempo
    });
    
    print(`✅ Logs limpiados: ${result.deletedCount} documentos eliminados`);
    
    // Registrar la limpieza
    db.system_logs.insertOne({
        timestamp: new Date(),
        level: "INFO",
        action: "LOG_CLEANUP",
        message: `Limpieza automática de logs completada: ${result.deletedCount} documentos eliminados`,
        metadata: {
            cleanup_date: thirtyDaysAgo,
            automated: true
        }
    });
}

// Función para generar reporte de uso de almacenamiento
function generateStorageReport() {
    const pipeline = [
        {
            $group: {
                _id: "$file_type",
                total_files: { $sum: 1 },
                total_size: { $sum: "$file_size" },
                avg_size: { $avg: "$file_size" }
            }
        },
        {
            $sort: { total_size: -1 }
        }
    ];
    
    const storageStats = db.project_files.aggregate(pipeline).toArray();
    
    // Insertar reporte en analytics
    db.project_analytics.insertOne({
        project_id: null, // Reporte global
        date: new Date(),
        metric_type: "storage_usage",
        metrics: {
            by_file_type: storageStats,
            total_files: db.project_files.countDocuments(),
            total_storage_bytes: storageStats.reduce((sum, item) => sum + item.total_size, 0)
        },
        generated_at: new Date()
    });
    
    print("✅ Reporte de almacenamiento generado");
}

// ===============================================
// 11. ÍNDICES ADICIONALES PARA PERFORMANCE
// ===============================================

// Índices compuestos para consultas complejas
db.project_files.createIndex({ 
    "project_id": 1, 
    "file_type": 1, 
    "created_at": -1 
});

db.system_logs.createIndex({
    "level": 1,
    "action": 1,
    "timestamp": -1
});

db.project_analytics.createIndex({
    "project_id": 1,
    "metric_type": 1,
    "date": -1
});

// Índice geoespacial para ubicaciones (futuro)
db.shooting_locations = db.shooting_locations || {};
db.shooting_locations.createIndex({ "coordinates": "2dsphere" });

// ===============================================
// 12. VALIDACIONES DE ESQUEMA
// ===============================================

// Validación para project_files
db.runCommand({
    collMod: "project_files",
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["project_id", "file_name", "file_type", "file_path", "created_at"],
            properties: {
                project_id: {
                    bsonType: "int",
                    minimum: 1,
                    description: "ID del proyecto (debe existir en MySQL)"
                },
                file_name: {
                    bsonType: "string",
                    minLength: 1,
                    description: "Nombre del archivo requerido"
                },
                file_type: {
                    bsonType: "string",
                    enum: ["script", "audition_video", "contract", "image", "audio", "document", "other"],
                    description: "Tipo de archivo debe ser válido"
                },
                file_size: {
                    bsonType: "int",
                    minimum: 0,
                    description: "Tamaño del archivo en bytes"
                },
                permissions: {
                    bsonType: "object",
                    properties: {
                        public: { bsonType: "bool" },
                        roles_allowed: { bsonType: "array" },
                        users_allowed: { bsonType: "array" }
                    }
                }
            }
        }
    },
    validationLevel: "moderate",
    validationAction: "warn"
});

// Validación para system_logs
db.runCommand({
    collMod: "system_logs",
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["timestamp", "level", "action", "message"],
            properties: {
                level: {
                    bsonType: "string",
                    enum: ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"],
                    description: "Nivel de log debe ser válido"
                },
                timestamp: {
                    bsonType: "date",
                    description: "Timestamp requerido"
                },
                user_id: {
                    bsonType: ["int", "null"],
                    minimum: 1,
                    description: "ID de usuario válido o null para sistema"
                }
            }
        }
    },
    validationLevel: "strict",
    validationAction: "error"
});

// ===============================================
// 13. CONFIGURACIÓN DE TTL (Time To Live)
// ===============================================

// Los logs se eliminan automáticamente después de 90 días
db.system_logs.createIndex(
    { "timestamp": 1 },
    { expireAfterSeconds: 7776000 } // 90 días
);

// Las sesiones de usuarios expiradas se limpian automáticamente
db.user_sessions = db.user_sessions || {};
db.user_sessions.createIndex(
    { "expires_at": 1 },
    { expireAfterSeconds: 0 } // Expira en la fecha especificada
);

// ===============================================
// 14. CONFIGURACIÓN DE REPLICA SET (PRODUCCIÓN)
// ===============================================

// Configuración para alta disponibilidad
// (Estas configuraciones se aplicarían en producción)

/*
// Configurar replica set
rs.initiate({
    _id: "sgp-replica-set",
    members: [
        { _id: 0, host: "mongodb-primary:27017", priority: 2 },
        { _id: 1, host: "mongodb-secondary1:27017", priority: 1 },
        { _id: 2, host: "mongodb-secondary2:27017", priority: 1, arbiterOnly: true }
    ]
});

// Configurar read preference
db.getMongo().setReadPref("secondaryPreferred");
*/

// ===============================================
// 15. VERIFICACIÓN FINAL
// ===============================================

print("\n🎬 ===== RESUMEN DE CONFIGURACIÓN MONGODB =====");
print(`✅ Base de datos: ${db.getName()}`);
print(`✅ Colecciones creadas: ${db.getCollectionNames().length}`);
print("✅ Colecciones principales:");
db.getCollectionNames().forEach(name => {
    const count = db[name].countDocuments();
    print(`   - ${name}: ${count} documentos`);
});

print("\n📊 Índices creados:");
db.getCollectionNames().forEach(name => {
    const indexes = db[name].getIndexes();
    if (indexes.length > 1) { // Más que solo _id
        print(`   - ${name}: ${indexes.length} índices`);
    }
});

print("\n🔧 Configuraciones aplicadas:");
print("   ✅ Validaciones de esquema");
print("   ✅ Índices de performance");
print("   ✅ TTL para limpieza automática");
print("   ✅ Integraciones externas configuradas");
print("   ✅ Dashboard widgets preparados");

print("\n⚠️  PRÓXIMOS PASOS:");
print("   1. Configurar credenciales de servicios externos");
print("   2. Establecer conexión con MySQL para sincronización");
print("   3. Configurar backups automáticos");
print("   4. Implementar monitoreo de performance");
print("   5. Configurar alertas de seguridad");

print("\n🚀 MongoDB configurado exitosamente para SGP REA Productions!");

// ===============================================
// 16. COMANDOS DE MANTENIMIENTO
// ===============================================

// Comando para ejecutar limpieza manual
// cleanupOldLogs();

// Comando para generar reporte de almacenamiento
// generateStorageReport();

// Verificar salud de integraciones
function checkIntegrationsHealth() {
    db.external_integrations.find({ is_active: true }).forEach(integration => {
        print(`🔍 Verificando: ${integration.service_name}`);
        print(`   Estado: ${integration.health_check.status}`);
        print(`   Última verificación: ${integration.health_check.last_check}`);
        print(`   Tiempo de respuesta: ${integration.health_check.response_time_ms}ms`);
    });
}

// checkIntegrationsHealth();