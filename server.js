// ===============================================
// 🎬 SGP REA PRODUCTIONS - SERVIDOR PRINCIPAL
// ===============================================
// Archivo: server.js
// Propósito: Servidor Express.js principal del sistema
// Autor: Sistema SGP REA
// Fecha: Octubre 2025

require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const session = require('express-session');

// ===============================================
// CONFIGURACIÓN INICIAL
// ===============================================

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ===============================================
// MIDDLEWARE DE SEGURIDAD
// ===============================================

// Helmet para seguridad
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// Compresión
app.use(compression());

// CORS
app.use(cors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: NODE_ENV === 'production' ? 100 : 1000, // límite de requests
    message: 'Demasiadas solicitudes desde esta IP, intente más tarde.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Logging
if (NODE_ENV !== 'test') {
    app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Parse JSON y URL encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configurar sesiones (debe estar ANTES de las rutas)
app.use(session({
    secret: process.env.SESSION_SECRET || 'rea-productions-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // false para desarrollo (HTTP)
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
        sameSite: 'lax'
    }
}));

console.log('✅ Sistema de sesiones configurado');

// Servir archivos estáticos desde la carpeta public
app.use(express.static('public'));

// ===============================================
// CONEXIÓN A MONGODB
// ===============================================

let isConnected = false;

async function connectToMongoDB() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        
        if (!mongoUri) {
            throw new Error('MONGODB_URI no está configurado en las variables de entorno');
        }

        console.log('🍃 Conectando a MongoDB Atlas...');
        
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
            maxPoolSize: 10,
            minPoolSize: 2,
            maxIdleTimeMS: 30000,
            bufferCommands: false,
        });

        isConnected = true;
        console.log('✅ MongoDB Atlas conectado exitosamente');
        console.log(`📊 Base de datos: ${mongoose.connection.db.databaseName}`);
        
        // Verificar colecciones
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`📁 Colecciones disponibles: ${collections.length}`);
        collections.forEach(col => console.log(`   - ${col.name}`));
        
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error.message);
        isConnected = false;
        throw error;
    }
}

// ===============================================
// CONEXIÓN A POSTGRESQL
// ===============================================

let pgPool = null;

async function getPostgreSQLConnection() {
    try {
        if (!pgPool) {
            pgPool = new Pool({
                connectionString: process.env.DATABASE_URL || 
                    'postgresql://postgres:admin123@localhost:5432/sgp_rea_prod',
                max: 10,
                min: 2,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 10000,
            });
            
            console.log('✅ Pool de conexiones PostgreSQL creado');
            
            // Probar la conexión
            const client = await pgPool.connect();
            await client.query('SELECT NOW()');
            client.release();
            console.log('✅ PostgreSQL conectado exitosamente');
        }
        
        return pgPool;
    } catch (error) {
        console.error('❌ Error en conexión PostgreSQL:', error.message);
        throw error;
    }
}

// ===============================================
// MODELOS MONGOOSE
// ===============================================

// Modelo para archivos de proyecto
const ProjectFileSchema = new mongoose.Schema({
    project_id: { type: Number, required: true, index: true },
    file_name: { type: String, required: true },
    file_type: { 
        type: String, 
        required: true,
        enum: ['script', 'audition_video', 'contract', 'image', 'audio', 'document', 'other'],
        index: true
    },
    file_category: { type: String, required: true },
    file_path: { type: String, required: true },
    file_size: { type: Number, min: 0 },
    mime_type: String,
    version: String,
    description: String,
    upload_metadata: {
        original_name: String,
        uploaded_by: { type: Number, required: true },
        upload_ip: String,
        upload_device: String
    },
    processing_status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    thumbnails: {
        small: String,
        medium: String,
        large: String
    },
    tags: [String],
    permissions: {
        public: { type: Boolean, default: false },
        roles_allowed: [String],
        users_allowed: [Number],
        sensitive: { type: Boolean, default: false }
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Índices compuestos
ProjectFileSchema.index({ project_id: 1, file_type: 1 });
ProjectFileSchema.index({ created_at: -1 });
ProjectFileSchema.index({ file_name: 'text', description: 'text' });

const ProjectFile = mongoose.model('ProjectFile', ProjectFileSchema, 'projects_files');

// Modelo para logs del sistema
const SystemLogSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now, index: true },
    level: { 
        type: String, 
        required: true,
        enum: ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'],
        index: true
    },
    action: { type: String, required: true, index: true },
    user_id: { type: Number, index: true },
    username: String,
    message: { type: String, required: true },
    metadata: mongoose.Schema.Types.Mixed,
    severity: {
        type: String,
        enum: ['low', 'normal', 'high', 'critical'],
        default: 'normal'
    },
    module: String,
    request_id: String,
    ip_address: String,
    user_agent: String,
    error_details: {
        stack_trace: String,
        recovery_suggestion: String
    }
});

// Índices compuestos para logs
SystemLogSchema.index({ level: 1, timestamp: -1 });
SystemLogSchema.index({ user_id: 1, timestamp: -1 });
SystemLogSchema.index({ action: 1, timestamp: -1 });

const SystemLog = mongoose.model('SystemLog', SystemLogSchema, 'system_logs');

// Modelo para configuraciones
const AppConfigurationSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true, index: true },
    category: { type: String, required: true, index: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    description: String,
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const AppConfiguration = mongoose.model('AppConfiguration', AppConfigurationSchema, 'app_configurations');

// ===============================================
// FUNCIONES DE UTILIDAD
// ===============================================

async function logSystemEvent(level, action, message, metadata = {}, userId = null) {
    try {
        const log = new SystemLog({
            level,
            action,
            message,
            metadata,
            user_id: userId,
            timestamp: new Date()
        });
        
        await log.save();
        
        // Log críticos también van a consola
        if (level === 'ERROR' || level === 'CRITICAL') {
            console.error(`🚨 ${level}: ${message}`, metadata);
        } else if (level === 'WARNING') {
            console.warn(`⚠️  ${level}: ${message}`, metadata);
        }
        
    } catch (error) {
        console.error('Error guardando log del sistema:', error);
    }
}

// ===============================================
// RUTAS DE LA API
// ===============================================

// Ruta de salud del sistema
app.get('/api/health', async (req, res) => {
    try {
        const health = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: NODE_ENV,
            version: process.env.npm_package_version || '1.0.0',
            connections: {
                mongodb: isConnected ? 'connected' : 'disconnected',
            },
            memory: process.memoryUsage(),
            system: {
                node_version: process.version,
                platform: process.platform,
                arch: process.arch
            }
        };

        // Verificar conexión a MongoDB
        if (isConnected) {
            const collections = await mongoose.connection.db.listCollections().toArray();
            health.database = {
                name: mongoose.connection.db.databaseName,
                collections: collections.length,
                connection_state: mongoose.connection.readyState
            };
        }

        res.json(health);
        
        // Log del health check
        await logSystemEvent('INFO', 'HEALTH_CHECK', 'Health check ejecutado exitosamente', {
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        });
        
    } catch (error) {
        console.error('Error en health check:', error);
        
        await logSystemEvent('ERROR', 'HEALTH_CHECK_FAILED', 'Error en health check', {
            error: error.message,
            ip_address: req.ip
        });
        
        res.status(500).json({
            status: 'error',
            message: 'Error en health check',
            timestamp: new Date().toISOString()
        });
    }
});

// Ruta para obtener configuraciones
app.get('/api/config/:key?', async (req, res) => {
    try {
        const { key } = req.params;
        
        let query = { is_active: true };
        if (key) {
            query.key = key;
        }
        
        const configs = await AppConfiguration.find(query);
        
        if (key && configs.length === 0) {
            return res.status(404).json({
                error: 'Configuración no encontrada',
                key: key
            });
        }
        
        const result = key ? configs[0] : configs;
        
        res.json({
            success: true,
            data: result,
            count: configs.length
        });
        
        await logSystemEvent('INFO', 'CONFIG_ACCESS', `Configuración accedida: ${key || 'all'}`, {
            key: key,
            ip_address: req.ip
        });
        
    } catch (error) {
        console.error('Error obteniendo configuración:', error);
        
        await logSystemEvent('ERROR', 'CONFIG_ACCESS_FAILED', 'Error accediendo configuración', {
            key: req.params.key,
            error: error.message,
            ip_address: req.ip
        });
        
        res.status(500).json({
            error: 'Error interno del servidor',
            message: error.message
        });
    }
});

// Ruta para obtener archivos de proyecto
app.get('/api/projects/:projectId/files', async (req, res) => {
    try {
        const { projectId } = req.params;
        const { file_type, limit = 50, offset = 0 } = req.query;
        
        let query = { project_id: parseInt(projectId) };
        if (file_type) {
            query.file_type = file_type;
        }
        
        const files = await ProjectFile
            .find(query)
            .sort({ created_at: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(offset));
            
        const total = await ProjectFile.countDocuments(query);
        
        res.json({
            success: true,
            data: files,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                has_more: (parseInt(offset) + parseInt(limit)) < total
            }
        });
        
        await logSystemEvent('INFO', 'FILES_ACCESS', `Archivos consultados para proyecto ${projectId}`, {
            project_id: projectId,
            file_type: file_type,
            count: files.length,
            ip_address: req.ip
        });
        
    } catch (error) {
        console.error('Error obteniendo archivos:', error);
        
        await logSystemEvent('ERROR', 'FILES_ACCESS_FAILED', 'Error consultando archivos', {
            project_id: req.params.projectId,
            error: error.message,
            ip_address: req.ip
        });
        
        res.status(500).json({
            error: 'Error interno del servidor',
            message: error.message
        });
    }
});

// Ruta para obtener logs del sistema
app.get('/api/logs', async (req, res) => {
    try {
        const { level, action, limit = 100, offset = 0 } = req.query;
        
        let query = {};
        if (level) query.level = level;
        if (action) query.action = action;
        
        const logs = await SystemLog
            .find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(offset));
            
        const total = await SystemLog.countDocuments(query);
        
        res.json({
            success: true,
            data: logs,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                has_more: (parseInt(offset) + parseInt(limit)) < total
            }
        });
        
    } catch (error) {
        console.error('Error obteniendo logs:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: error.message
        });
    }
});

// Ruta raíz
app.get('/', (req, res) => {
    res.json({
        message: '🎬 SGP REA Productions API',
        version: '1.0.0',
        documentation: '/api/health',
        timestamp: new Date().toISOString()
    });
});

// ===============================================
// MIDDLEWARE DE AUTENTICACIÓN
// ===============================================

// Middleware para verificar autenticación
function requireAuth(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ 
            error: 'No autenticado',
            message: 'Debe iniciar sesión para acceder a este recurso'
        });
    }
    next();
}

// Middleware para verificar roles específicos
function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ 
                error: 'No autenticado',
                message: 'Debe iniciar sesión para acceder a este recurso'
            });
        }
        
        if (!allowedRoles.includes(req.session.user.role_name)) {
            return res.status(403).json({ 
                error: 'Acceso denegado',
                message: `Necesita uno de estos roles: ${allowedRoles.join(', ')}`
            });
        }
        
        next();
    };
}

// ===============================================
// ENDPOINTS DE AUTENTICACIÓN
// ===============================================

// POST /api/auth/login - Iniciar sesión
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ 
                error: 'Datos incompletos',
                message: 'Usuario y contraseña son requeridos'
            });
        }
        
        const pool = await getMySQLConnection();
        
        // Buscar usuario con su rol
        const [users] = await pool.query(`
            SELECT 
                u.id,
                u.username,
                u.email,
                u.password_hash,
                u.first_name,
                u.last_name,
                CONCAT(u.first_name, ' ', u.last_name) as full_name,
                u.role_id,
                r.name as role_name,
                r.display_name as role_display_name,
                u.is_active,
                u.created_at
            FROM users u
            INNER JOIN roles r ON u.role_id = r.id
            WHERE u.username = ? AND u.is_active = 1
            LIMIT 1
        `, [username]);
        
        if (users.length === 0) {
            return res.status(401).json({ 
                error: 'Credenciales inválidas',
                message: 'Usuario o contraseña incorrectos'
            });
        }
        
        const user = users[0];
        
        // Verificar contraseña
        // Si el password_hash es null, es un usuario temporal sin contraseña
        let passwordMatch = false;
        
        if (!user.password_hash) {
            // Usuario sin contraseña - permitir acceso temporal (solo para desarrollo)
            if (NODE_ENV === 'development') {
                passwordMatch = true;
                console.log('⚠️  ADVERTENCIA: Usuario sin contraseña detectado (solo desarrollo)');
            }
        } else {
            passwordMatch = await bcrypt.compare(password, user.password_hash);
        }
        
        if (!passwordMatch) {
            return res.status(401).json({ 
                error: 'Credenciales inválidas',
                message: 'Usuario o contraseña incorrectos'
            });
        }
        
        // Crear sesión
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            role_id: user.role_id,
            role_name: user.role_name,
            role_display_name: user.role_display_name
        };
        
        // Registrar login en logs
        await logSystemEvent('info', 'user_login', `Usuario ${user.username} inició sesión`, {
            user_id: user.id,
            username: user.username,
            role: user.role_name
        });
        
        res.json({
            success: true,
            message: 'Sesión iniciada correctamente',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                role: {
                    id: user.role_id,
                    name: user.role_name,
                    display_name: user.role_display_name
                }
            }
        });
        
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: error.message
        });
    }
});

// POST /api/auth/logout - Cerrar sesión
app.post('/api/auth/logout', requireAuth, async (req, res) => {
    try {
        const username = req.session.user.username;
        
        req.session.destroy((err) => {
            if (err) {
                console.error('Error cerrando sesión:', err);
                return res.status(500).json({
                    error: 'Error cerrando sesión',
                    message: err.message
                });
            }
            
            res.json({
                success: true,
                message: 'Sesión cerrada correctamente'
            });
        });
        
        // Log del logout (fuera del callback para no depender de la sesión)
        await logSystemEvent('info', 'user_logout', `Usuario ${username} cerró sesión`, {
            username: username
        });
        
    } catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: error.message
        });
    }
});

// GET /api/auth/me - Obtener usuario actual
app.get('/api/auth/me', requireAuth, async (req, res) => {
    try {
        res.json({
            success: true,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error obteniendo usuario actual:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: error.message
        });
    }
});

// GET /api/auth/check - Verificar si hay sesión activa (sin requerir auth)
app.get('/api/auth/check', (req, res) => {
    res.json({
        authenticated: !!(req.session && req.session.user),
        user: req.session?.user || null
    });
});

// ===============================================
// GESTIÓN DE PROYECTOS
// ===============================================

// GET /api/projects - Listar proyectos
app.get('/api/projects', requireAuth, async (req, res) => {
    try {
        const { status, limit = 20 } = req.query;
        
        const pool = await getMySQLConnection();
        
        let query = 'SELECT * FROM projects WHERE 1=1';
        const params = [];
        
        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }
        
        query += ' ORDER BY created_at DESC LIMIT ?';
        params.push(parseInt(limit));
        
        const [rows] = await pool.query(query, params);
        
        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
        
    } catch (error) {
        console.error('Error obteniendo proyectos:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: error.message
        });
    }
});

// POST /api/projects - Crear nuevo proyecto
app.post('/api/projects', requireAuth, async (req, res) => {
    try {
        const {
            title,
            slug,
            description,
            status,
            genre,
            target_duration,
            budget_total,
            start_date,
            end_date
        } = req.body;
        
        if (!title || !slug) {
            return res.status(400).json({
                error: 'Datos incompletos',
                message: 'Título y slug son requeridos'
            });
        }
        
        const pool = await getMySQLConnection();
        
        const created_by = req.session.user.id;
        
        const [result] = await pool.query(`
            INSERT INTO projects (
                title, slug, description, status, genre, 
                target_duration, budget_total, start_date, end_date, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            title, slug, description || null, status || 'desarrollo', genre || null,
            target_duration || null, budget_total || null, start_date || null, 
            end_date || null, created_by
        ]);
        
        res.status(201).json({
            success: true,
            message: 'Proyecto creado exitosamente',
            data: {
                id: result.insertId,
                title,
                slug
            }
        });
        
    } catch (error) {
        console.error('Error creando proyecto:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: error.message
        });
    }
});

// GET /api/projects/:id - Ver proyecto individual
app.get('/api/projects/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getMySQLConnection();
        
        // Obtener datos del proyecto
        const [rows] = await pool.query(`
            SELECT 
                p.*,
                CONCAT(u.first_name, ' ', u.last_name) as creator_name,
                r.display_name as creator_role
            FROM projects p
            LEFT JOIN users u ON p.created_by = u.id
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE p.id = ?
            LIMIT 1
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ 
                error: 'Proyecto no encontrado' 
            });
        }
        
        const project = rows[0];
        
        // Obtener estadísticas del proyecto
        // Las escenas están relacionadas con scripts, no directamente con proyectos
        const [scenesCount] = await pool.query(`
            SELECT COUNT(DISTINCT sc.id) as count 
            FROM scenes sc
            INNER JOIN scripts s ON sc.script_id = s.id
            WHERE s.project_id = ?
        `, [id]);
        
        const [charactersCount] = await pool.query(
            'SELECT COUNT(*) as count FROM characters WHERE project_id = ?',
            [id]
        );
        
        // Contar archivos en MongoDB
        let filesCount = 0;
        try {
            const db = await getMongoConnection();
            filesCount = await db.collection('projects_files').countDocuments({ project_id: parseInt(id) });
        } catch (mongoError) {
            console.warn('⚠️ No se pudo contar archivos de MongoDB:', mongoError.message);
        }
        
        // Agregar estadísticas al proyecto
        project.stats = {
            scenes_count: scenesCount[0].count,
            characters_count: charactersCount[0].count,
            files_count: filesCount
        };
        
        res.json({
            success: true,
            data: project
        });
        
    } catch (error) {
        console.error('❌ Error obteniendo proyecto:', error);
        res.status(500).json({ 
            error: 'Error obteniendo proyecto',
            details: error.message 
        });
    }
});

// PUT /api/projects/:id - Actualizar proyecto
app.put('/api/projects/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const pool = await getMySQLConnection();
        
        const fields = [];
        const values = [];
        
        Object.keys(updateData).forEach(key => {
            if (key !== 'id' && updateData[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(updateData[key]);
            }
        });
        
        if (fields.length === 0) {
            return res.status(400).json({
                error: 'No hay datos para actualizar'
            });
        }
        
        values.push(id);
        
        const [result] = await pool.query(
            `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Proyecto no encontrado'
            });
        }
        
        res.json({
            success: true,
            message: 'Proyecto actualizado exitosamente'
        });
        
    } catch (error) {
        console.error('Error actualizando proyecto:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: error.message
        });
    }
});

// DELETE /api/projects/:id - Eliminar proyecto
app.delete('/api/projects/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        const pool = await getMySQLConnection();
        
        const [result] = await pool.query('DELETE FROM projects WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Proyecto no encontrado'
            });
        }
        
        res.json({
            success: true,
            message: 'Proyecto eliminado exitosamente'
        });
        
    } catch (error) {
        console.error('Error eliminando proyecto:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: error.message
        });
    }
});

// ===============================================
// GESTIÓN DE GUIONES (SCRIPTS)
// ===============================================

// GET /api/scripts - Listar guiones
app.get('/api/scripts', requireAuth, async (req, res) => {
    try {
        const { project_id, is_current, limit = 50 } = req.query;
        
        const pool = await getMySQLConnection();
        
        let query = 'SELECT * FROM scripts WHERE 1=1';
        const params = [];
        
        if (project_id) {
            query += ' AND project_id = ?';
            params.push(project_id);
        }
        
        if (is_current !== undefined) {
            query += ' AND is_current = ?';
            params.push(is_current === 'true' || is_current === '1' ? 1 : 0);
        }
        
        query += ' ORDER BY created_at DESC LIMIT ?';
        params.push(parseInt(limit));
        
        const [rows] = await pool.query(query, params);
        
        await logSystemEvent('scripts_list', { 
            count: rows.length,
            filters: { project_id, is_current }
        });
        
        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
        
    } catch (error) {
        console.error('❌ Error obteniendo guiones:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener los guiones',
            details: error.message
        });
    }
});

// POST /api/scripts - Crear nuevo guión
app.post('/api/scripts', requireAuth, async (req, res) => {
    try {
        const {
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
            uploaded_by
        } = req.body;
        
        // Validación básica
        if (!project_id || !title) {
            return res.status(400).json({
                success: false,
                error: 'project_id y title son campos requeridos'
            });
        }
        
        const pool = await getMySQLConnection();
        
        const cleanValue = (value) => value === undefined || value === '' || value === 'null' ? null : value;
        
        const query = `
            INSERT INTO scripts (
                project_id, title, version, file_path, file_type, 
                file_size, page_count, scene_count, is_current, 
                notes, uploaded_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            project_id,
            title,
            cleanValue(version),
            cleanValue(file_path),
            cleanValue(file_type),
            cleanValue(file_size),
            cleanValue(page_count),
            cleanValue(scene_count),
            is_current === true || is_current === 1 ? 1 : 0,
            cleanValue(notes),
            cleanValue(uploaded_by) || 1
        ];
        
        console.log('🔵 Creando guión con parámetros:', params);
        
        const [result] = await pool.query(query, params);
        
        // Obtener el guión recién creado
        const [newScript] = await pool.query('SELECT * FROM scripts WHERE id = ?', [result.insertId]);
        
        await logSystemEvent('script_created', {
            script_id: result.insertId,
            project_id,
            title
        });
        
        console.log('✅ Guión creado exitosamente:', result.insertId);
        
        res.status(201).json({
            success: true,
            message: 'Guión creado exitosamente',
            data: newScript[0]
        });
        
    } catch (error) {
        console.error('❌ Error creando guión:', error);
        res.status(500).json({
            success: false,
            error: 'Error al crear el guión',
            details: error.message
        });
    }
});

// PUT /api/scripts/:id - Actualizar guión
app.put('/api/scripts/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const pool = await getMySQLConnection();
        
        // Construir query dinámicamente
        const allowedFields = [
            'project_id', 'title', 'version', 'file_path', 'file_type',
            'file_size', 'page_count', 'scene_count', 'is_current',
            'notes', 'uploaded_by'
        ];
        
        const cleanValue = (value) => value === undefined || value === '' || value === 'null' ? null : value;
        
        const fields = [];
        const values = [];
        
        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                fields.push(`${key} = ?`);
                values.push(key === 'is_current' ? (value === true || value === 1 ? 1 : 0) : cleanValue(value));
            }
        }
        
        if (fields.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No hay campos válidos para actualizar'
            });
        }
        
        values.push(id);
        
        const query = `UPDATE scripts SET ${fields.join(', ')} WHERE id = ?`;
        
        const [result] = await pool.query(query, values);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Guión no encontrado'
            });
        }
        
        const [updatedScript] = await pool.query('SELECT * FROM scripts WHERE id = ?', [id]);
        
        await logSystemEvent('script_updated', { script_id: id, updates: Object.keys(updates) });
        
        res.json({
            success: true,
            message: 'Guión actualizado exitosamente',
            data: updatedScript[0]
        });
        
    } catch (error) {
        console.error('❌ Error actualizando guión:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar el guión',
            details: error.message
        });
    }
});

// DELETE /api/scripts/:id - Eliminar guión
app.delete('/api/scripts/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        const pool = await getMySQLConnection();
        
        const [result] = await pool.query('DELETE FROM scripts WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Guión no encontrado'
            });
        }
        
        await logSystemEvent('script_deleted', { script_id: id });
        
        res.json({
            success: true,
            message: 'Guión eliminado exitosamente'
        });
        
    } catch (error) {
        console.error('❌ Error eliminando guión:', error);
        res.status(500).json({
            success: false,
            error: 'Error al eliminar el guión',
            details: error.message
        });
    }
});

// ===============================================
// GESTIÓN DE ESCENAS (SCENES)
// ===============================================

// GET /api/scenes - Listar escenas (con filtro opcional por script_id)
app.get('/api/scenes', requireAuth, async (req, res) => {
    try {
        const { script_id, status, limit = 50 } = req.query;
        
        const pool = await getMySQLConnection();
        
        let query = 'SELECT * FROM scenes WHERE 1=1';
        const params = [];
        
        if (script_id) {
            query += ' AND script_id = ?';
            params.push(script_id);
        }
        
        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }
        
        query += ' ORDER BY scene_number ASC LIMIT ?';
        params.push(parseInt(limit));
        
        const [rows] = await pool.query(query, params);
        
        await logSystemEvent('scenes_list', { 
            count: rows.length,
            filters: { script_id, status }
        });
        
        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
        
    } catch (error) {
        console.error('❌ Error obteniendo escenas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener las escenas',
            details: error.message
        });
    }
});

// POST /api/scenes - Crear nueva escena
app.post('/api/scenes', requireAuth, async (req, res) => {
    try {
        const {
            script_id,
            scene_number,
            scene_name,
            location,
            time_of_day,
            description,
            dialogue_count,
            estimated_duration,
            shooting_date,
            status,
            notes
        } = req.body;
        
        // Validación básica
        if (!script_id || !scene_number) {
            return res.status(400).json({
                success: false,
                error: 'script_id y scene_number son campos requeridos'
            });
        }
        
        const pool = await getMySQLConnection();
        
        const cleanValue = (value) => value === undefined || value === '' || value === 'null' ? null : value;
        
        const query = `
            INSERT INTO scenes (
                script_id, scene_number, scene_name, location, time_of_day,
                description, dialogue_count, estimated_duration, shooting_date,
                status, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            script_id,
            scene_number,
            cleanValue(scene_name),
            cleanValue(location),
            cleanValue(time_of_day),
            cleanValue(description),
            dialogue_count || 0,
            cleanValue(estimated_duration),
            cleanValue(shooting_date),
            status || 'pendiente',
            cleanValue(notes)
        ];
        
        console.log('🔵 Creando escena con parámetros:', params);
        
        const [result] = await pool.query(query, params);
        
        // Obtener la escena recién creada
        const [newScene] = await pool.query('SELECT * FROM scenes WHERE id = ?', [result.insertId]);
        
        await logSystemEvent('scene_created', {
            scene_id: result.insertId,
            script_id,
            scene_number
        });
        
        console.log('✅ Escena creada exitosamente:', result.insertId);
        
        res.status(201).json({
            success: true,
            message: 'Escena creada exitosamente',
            data: newScene[0]
        });
        
    } catch (error) {
        console.error('❌ Error creando escena:', error);
        res.status(500).json({
            success: false,
            error: 'Error al crear la escena',
            details: error.message
        });
    }
});

// PUT /api/scenes/:id - Actualizar escena
app.put('/api/scenes/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const pool = await getMySQLConnection();
        
        // Construir query dinámicamente
        const allowedFields = [
            'script_id', 'scene_number', 'scene_name', 'location', 'time_of_day',
            'description', 'dialogue_count', 'estimated_duration', 'shooting_date',
            'status', 'notes'
        ];
        
        const cleanValue = (value) => value === undefined || value === '' || value === 'null' ? null : value;
        
        const fields = [];
        const values = [];
        
        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                fields.push(`${key} = ?`);
                values.push(cleanValue(value));
            }
        }
        
        if (fields.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No hay campos válidos para actualizar'
            });
        }
        
        values.push(id);
        
        const query = `UPDATE scenes SET ${fields.join(', ')} WHERE id = ?`;
        
        const [result] = await pool.query(query, values);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Escena no encontrada'
            });
        }
        
        const [updatedScene] = await pool.query('SELECT * FROM scenes WHERE id = ?', [id]);
        
        await logSystemEvent('scene_updated', { scene_id: id, updates: Object.keys(updates) });
        
        res.json({
            success: true,
            message: 'Escena actualizada exitosamente',
            data: updatedScene[0]
        });
        
    } catch (error) {
        console.error('❌ Error actualizando escena:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar la escena',
            details: error.message
        });
    }
});

// DELETE /api/scenes/:id - Eliminar escena
app.delete('/api/scenes/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        const pool = await getMySQLConnection();
        
        const [result] = await pool.query('DELETE FROM scenes WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Escena no encontrada'
            });
        }
        
        await logSystemEvent('scene_deleted', { scene_id: id });
        
        res.json({
            success: true,
            message: 'Escena eliminada exitosamente'
        });
        
    } catch (error) {
        console.error('❌ Error eliminando escena:', error);
        res.status(500).json({
            success: false,
            error: 'Error al eliminar escena'
        });
    }
});

// ===============================================
// MANEJO DE ERRORES
// ===============================================

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    
    logSystemEvent('ERROR', 'UNHANDLED_ERROR', 'Error no manejado en la aplicación', {
        error: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip_address: req.ip
    });
    
    res.status(500).json({
        error: 'Error interno del servidor',
        message: NODE_ENV === 'development' ? err.message : 'Algo salió mal',
        timestamp: new Date().toISOString()
    });
});

// ===============================================
// INICIO DEL SERVIDOR
// ===============================================

async function startServer() {
    try {
        // Conectar a MongoDB
        await connectToMongoDB();
        
        // Iniciar servidor
        const server = app.listen(PORT, () => {
            console.log('\n🎬 =====================================');
            console.log('🎬 SGP REA PRODUCTIONS - SERVIDOR INICIADO');
            console.log('🎬 =====================================');
            console.log(`🚀 Servidor ejecutándose en: http://localhost:${PORT}`);
            console.log(`📊 Entorno: ${NODE_ENV}`);
            console.log(`🍃 MongoDB: Conectado`);
            console.log('🎬 =====================================\n');
            
            console.log('📋 URLs disponibles:');
            console.log(`   🏠 Home: http://localhost:${PORT}/`);
            console.log(`   💚 Health: http://localhost:${PORT}/api/health`);
            console.log(`   ⚙️  Config: http://localhost:${PORT}/api/config`);
            console.log(`   📁 Files: http://localhost:${PORT}/api/projects/1/files`);
            console.log(`   📊 Logs: http://localhost:${PORT}/api/logs`);
            console.log('');
        });
        
        // Log del inicio exitoso
        await logSystemEvent('INFO', 'SERVER_START', 'Servidor iniciado exitosamente', {
            port: PORT,
            environment: NODE_ENV,
            pid: process.pid,
            memory: process.memoryUsage()
        });
        
        // Manejo de cierre graceful
        process.on('SIGTERM', async () => {
            console.log('🛑 Cerrando servidor...');
            await logSystemEvent('INFO', 'SERVER_SHUTDOWN', 'Servidor cerrando gracefully');
            
            server.close(() => {
                console.log('✅ Servidor cerrado');
                mongoose.connection.close(() => {
                    console.log('✅ Conexión MongoDB cerrada');
                    process.exit(0);
                });
            });
        });
        
        process.on('SIGINT', async () => {
            console.log('\n🛑 Interrupción recibida, cerrando servidor...');
            await logSystemEvent('INFO', 'SERVER_INTERRUPTED', 'Servidor interrumpido por usuario');
            
            server.close(() => {
                console.log('✅ Servidor cerrado');
                mongoose.connection.close(() => {
                    console.log('✅ Conexión MongoDB cerrada');
                    process.exit(0);
                });
            });
        });
        
    } catch (error) {
        console.error('💥 Error iniciando servidor:', error);
        
        await logSystemEvent('CRITICAL', 'SERVER_START_FAILED', 'Error crítico iniciando servidor', {
            error: error.message,
            stack: error.stack
        });
        
        process.exit(1);
    }
}

// Iniciar servidor
if (require.main === module) {
    startServer();
}

module.exports = { app, connectToMongoDB, logSystemEvent };