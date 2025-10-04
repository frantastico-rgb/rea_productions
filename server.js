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
            scriptSrc: ["'self'"],
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