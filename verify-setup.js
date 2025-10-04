#!/usr/bin/env node

/**
 * 🔧 SCRIPT DE VERIFICACIÓN AUTOMÁTICA - SGP REA PRODUCTIONS
 * 
 * Este script verifica que toda la configuración técnica esté funcionando correctamente:
 * - Conexiones a bases de datos (MySQL y MongoDB)
 * - Servicios de almacenamiento (Google Cloud Storage)
 * - Servicios de comunicación (SendGrid, Slack)
 * - Variables de entorno requeridas
 * - Estructura de archivos del proyecto
 * 
 * Uso: node verify-setup.js
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

// Colores para output en consola
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
    step: (msg) => console.log(`${colors.cyan}🔍 ${msg}${colors.reset}`),
    divider: () => console.log(`${colors.magenta}${'='.repeat(60)}${colors.reset}`)
};

// Configuración de verificaciones
const checks = {
    environment: {
        name: "Variables de Entorno",
        required: [
            'MYSQL_HOST', 'MYSQL_PORT', 'MYSQL_DATABASE', 'MYSQL_USERNAME', 'MYSQL_PASSWORD',
            'MONGODB_URI', 'GOOGLE_CLOUD_PROJECT_ID', 'GOOGLE_CLOUD_BUCKET',
            'JWT_SECRET', 'NODE_ENV'
        ],
        optional: [
            'SENDGRID_API_KEY', 'SLACK_WEBHOOK_URL', 'GOOGLE_APPLICATION_CREDENTIALS'
        ]
    },
    files: {
        name: "Archivos de Configuración",
        required: [
            'database_setup_mysql.sql',
            'database_setup_mongodb.js',
            'CONFIGURACION_TECNICA.md',
            'PLAN_PROTOTIPO_DEMO.md'
        ]
    },
    directories: {
        name: "Estructura de Directorios",
        expected: [
            'backend', 'frontend', 'docs', 'scripts', 'config'
        ]
    }
};

class SystemVerifier {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            warnings: 0,
            total: 0
        };
        this.startTime = Date.now();
    }

    async run() {
        log.divider();
        console.log(`${colors.magenta}🎬 SGP REA PRODUCTIONS - VERIFICACIÓN DEL SISTEMA${colors.reset}`);
        log.divider();
        console.log();

        await this.checkEnvironmentVariables();
        await this.checkRequiredFiles();
        await this.checkProjectStructure();
        await this.checkDatabaseConnections();
        await this.checkExternalServices();
        await this.checkPackageFiles();
        await this.generateReport();
    }

    async checkEnvironmentVariables() {
        log.step("Verificando variables de entorno...");
        
        // Intentar cargar .env si existe
        try {
            const envPath = path.join(process.cwd(), '.env');
            const envContent = await fs.readFile(envPath, 'utf8');
            const envVars = {};
            
            envContent.split('\n').forEach(line => {
                const [key, value] = line.split('=');
                if (key && value) {
                    envVars[key.trim()] = value.trim();
                }
            });
            
            // Cargar variables en process.env
            Object.assign(process.env, envVars);
            log.success("Archivo .env cargado exitosamente");
        } catch (error) {
            log.warning("No se encontró archivo .env, usando variables del sistema");
        }

        let envScore = 0;
        const totalRequired = checks.environment.required.length;

        for (const varName of checks.environment.required) {
            if (process.env[varName]) {
                log.success(`${varName}: Configurada`);
                envScore++;
            } else {
                log.error(`${varName}: FALTANTE - REQUERIDA`);
                this.results.failed++;
            }
            this.results.total++;
        }

        for (const varName of checks.environment.optional) {
            if (process.env[varName]) {
                log.success(`${varName}: Configurada (opcional)`);
            } else {
                log.warning(`${varName}: No configurada (opcional)`);
                this.results.warnings++;
            }
        }

        if (envScore === totalRequired) {
            log.success(`Todas las variables requeridas están configuradas (${envScore}/${totalRequired})`);
            this.results.passed++;
        } else {
            log.error(`Variables faltantes: ${totalRequired - envScore} de ${totalRequired}`);
        }

        console.log();
    }

    async checkRequiredFiles() {
        log.step("Verificando archivos de configuración...");

        for (const fileName of checks.files.required) {
            try {
                const filePath = path.join(process.cwd(), fileName);
                const stats = await fs.stat(filePath);
                
                if (stats.isFile()) {
                    log.success(`${fileName}: Encontrado (${Math.round(stats.size / 1024)}KB)`);
                    this.results.passed++;
                } else {
                    log.error(`${fileName}: No es un archivo válido`);
                    this.results.failed++;
                }
            } catch (error) {
                log.error(`${fileName}: FALTANTE`);
                this.results.failed++;
            }
            this.results.total++;
        }

        console.log();
    }

    async checkProjectStructure() {
        log.step("Verificando estructura del proyecto...");

        // Verificar si estamos en el directorio correcto
        const currentDir = path.basename(process.cwd());
        if (currentDir.toLowerCase().includes('rea_productions') || currentDir.toLowerCase().includes('rea-productions')) {
            log.success(`Directorio del proyecto: ${currentDir}`);
        } else {
            log.warning(`Directorio actual: ${currentDir} (¿es correcto?)`);
        }

        // Verificar directorios esperados
        for (const dirName of checks.directories.expected) {
            try {
                const dirPath = path.join(process.cwd(), dirName);
                const stats = await fs.stat(dirPath);
                
                if (stats.isDirectory()) {
                    log.success(`Directorio ${dirName}/: Existe`);
                    this.results.passed++;
                } else {
                    log.warning(`${dirName}: Existe pero no es un directorio`);
                    this.results.warnings++;
                }
            } catch (error) {
                log.warning(`Directorio ${dirName}/: No existe (se creará durante desarrollo)`);
                this.results.warnings++;
            }
            this.results.total++;
        }

        console.log();
    }

    async checkDatabaseConnections() {
        log.step("Verificando conexiones a bases de datos...");

        // Verificar MySQL
        await this.checkMySQL();
        
        // Verificar MongoDB
        await this.checkMongoDB();

        console.log();
    }

    async checkMySQL() {
        if (!process.env.MYSQL_HOST || !process.env.MYSQL_USERNAME) {
            log.warning("MySQL: Variables de conexión no configuradas");
            this.results.warnings++;
            return;
        }

        try {
            // Intentar conectar usando mysql2 si está disponible
            const mysql = require('mysql2/promise');
            const connection = await mysql.createConnection({
                host: process.env.MYSQL_HOST,
                port: process.env.MYSQL_PORT || 3306,
                user: process.env.MYSQL_USERNAME,
                password: process.env.MYSQL_PASSWORD,
                database: process.env.MYSQL_DATABASE,
                timeout: 10000
            });

            // Verificar que la base de datos tenga las tablas esperadas
            const [tables] = await connection.execute(
                "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ?",
                [process.env.MYSQL_DATABASE]
            );

            await connection.end();

            log.success(`MySQL: Conectado exitosamente (${tables[0].count} tablas)`);
            this.results.passed++;
        } catch (error) {
            if (error.code === 'MODULE_NOT_FOUND') {
                log.warning("MySQL: mysql2 no instalado - se verificará durante desarrollo");
                this.results.warnings++;
            } else {
                log.error(`MySQL: Error de conexión - ${error.message}`);
                this.results.failed++;
            }
        }
        this.results.total++;
    }

    async checkMongoDB() {
        if (!process.env.MONGODB_URI) {
            log.warning("MongoDB: URI de conexión no configurada");
            this.results.warnings++;
            this.results.total++;
            return;
        }

        try {
            const mongoose = require('mongoose');
            
            await mongoose.connect(process.env.MONGODB_URI, {
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 10000,
            });

            const collections = await mongoose.connection.db.listCollections().toArray();
            await mongoose.connection.close();

            log.success(`MongoDB: Conectado exitosamente (${collections.length} colecciones)`);
            this.results.passed++;
        } catch (error) {
            if (error.code === 'MODULE_NOT_FOUND') {
                log.warning("MongoDB: mongoose no instalado - se verificará durante desarrollo");
                this.results.warnings++;
            } else {
                log.error(`MongoDB: Error de conexión - ${error.message}`);
                this.results.failed++;
            }
        }
        this.results.total++;
    }

    async checkExternalServices() {
        log.step("Verificando servicios externos...");

        // Google Cloud Storage
        await this.checkGoogleCloudStorage();
        
        // SendGrid
        await this.checkSendGrid();
        
        // Slack
        await this.checkSlack();

        console.log();
    }

    async checkGoogleCloudStorage() {
        if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
            log.warning("Google Cloud Storage: Configuración no encontrada");
            this.results.warnings++;
            this.results.total++;
            return;
        }

        try {
            const { Storage } = require('@google-cloud/storage');
            const storage = new Storage({
                projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
            });

            // Verificar acceso al bucket
            const [buckets] = await storage.getBuckets();
            log.success(`Google Cloud Storage: Conectado (${buckets.length} buckets disponibles)`);
            this.results.passed++;
        } catch (error) {
            if (error.code === 'MODULE_NOT_FOUND') {
                log.warning("Google Cloud Storage: SDK no instalado - se instalará durante desarrollo");
                this.results.warnings++;
            } else {
                log.error(`Google Cloud Storage: Error - ${error.message}`);
                this.results.failed++;
            }
        }
        this.results.total++;
    }

    async checkSendGrid() {
        if (!process.env.SENDGRID_API_KEY) {
            log.warning("SendGrid: API Key no configurada");
            this.results.warnings++;
        } else {
            log.success("SendGrid: API Key configurada");
            this.results.passed++;
        }
        this.results.total++;
    }

    async checkSlack() {
        if (!process.env.SLACK_WEBHOOK_URL) {
            log.warning("Slack: Webhook URL no configurada (opcional)");
            this.results.warnings++;
        } else {
            log.success("Slack: Webhook URL configurada");
            this.results.passed++;
        }
        this.results.total++;
    }

    async checkPackageFiles() {
        log.step("Verificando archivos de configuración de paquetes...");

        const packageFiles = [
            { path: 'backend/package.json', name: 'Backend package.json' },
            { path: 'frontend/package.json', name: 'Frontend package.json' }
        ];

        for (const file of packageFiles) {
            try {
                const filePath = path.join(process.cwd(), file.path);
                const content = await fs.readFile(filePath, 'utf8');
                const packageData = JSON.parse(content);
                
                log.success(`${file.name}: Encontrado (${Object.keys(packageData.dependencies || {}).length} dependencias)`);
                this.results.passed++;
            } catch (error) {
                log.warning(`${file.name}: No encontrado (se creará durante desarrollo)`);
                this.results.warnings++;
            }
            this.results.total++;
        }

        console.log();
    }

    async generateReport() {
        const endTime = Date.now();
        const duration = ((endTime - this.startTime) / 1000).toFixed(2);

        log.divider();
        console.log(`${colors.magenta}📊 REPORTE FINAL DE VERIFICACIÓN${colors.reset}`);
        log.divider();

        console.log(`⏱️  Tiempo de ejecución: ${duration} segundos`);
        console.log(`📈 Total de verificaciones: ${this.results.total}`);
        console.log(`${colors.green}✅ Exitosas: ${this.results.passed}${colors.reset}`);
        console.log(`${colors.red}❌ Fallidas: ${this.results.failed}${colors.reset}`);
        console.log(`${colors.yellow}⚠️  Advertencias: ${this.results.warnings}${colors.reset}`);

        const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
        console.log(`📊 Tasa de éxito: ${successRate}%`);

        console.log();

        // Recomendaciones basadas en los resultados
        if (this.results.failed > 0) {
            log.error("ACCIÓN REQUERIDA: Hay configuraciones críticas faltantes");
            console.log("   🔧 Revisa las variables de entorno faltantes");
            console.log("   🔧 Asegúrate de que los archivos de configuración existan");
            console.log("   🔧 Verifica las conexiones a bases de datos");
        } else if (this.results.warnings > 5) {
            log.warning("Varias configuraciones opcionales están pendientes");
            console.log("   💡 Considera configurar los servicios opcionales para funcionalidad completa");
            console.log("   💡 Revisa la guía de configuración técnica");
        } else {
            log.success("🎉 ¡Sistema listo para desarrollo!");
            console.log("   🚀 Puedes proceder con la instalación de dependencias");
            console.log("   🚀 Las bases de datos están listas para inicializar");
            console.log("   🚀 Los servicios externos están configurados");
        }

        console.log();
        log.info("Para más detalles, consulta: CONFIGURACION_TECNICA.md");
        
        // Generar archivo de reporte
        await this.saveReport(duration, successRate);
    }

    async saveReport(duration, successRate) {
        const report = {
            timestamp: new Date().toISOString(),
            duration: duration,
            results: this.results,
            successRate: successRate,
            environment: {
                nodeVersion: process.version,
                platform: process.platform,
                workingDirectory: process.cwd()
            },
            recommendations: this.getRecommendations()
        };

        try {
            await fs.writeFile(
                'verification-report.json',
                JSON.stringify(report, null, 2)
            );
            log.success("Reporte guardado en: verification-report.json");
        } catch (error) {
            log.warning("No se pudo guardar el reporte de verificación");
        }
    }

    getRecommendations() {
        const recommendations = [];

        if (this.results.failed > 0) {
            recommendations.push("Configurar variables de entorno faltantes");
            recommendations.push("Crear archivos de configuración requeridos");
            recommendations.push("Verificar conexiones a bases de datos");
        }

        if (!process.env.SENDGRID_API_KEY) {
            recommendations.push("Configurar SendGrid para envío de emails");
        }

        if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            recommendations.push("Configurar credenciales de Google Cloud Storage");
        }

        if (this.results.warnings > 3) {
            recommendations.push("Revisar configuraciones opcionales para funcionalidad completa");
        }

        return recommendations;
    }
}

// Ejecutar verificación
async function main() {
    const verifier = new SystemVerifier();
    
    try {
        await verifier.run();
        
        // Exit code basado en los resultados
        if (verifier.results.failed > 0) {
            process.exit(1); // Configuración crítica faltante
        } else if (verifier.results.warnings > 5) {
            process.exit(2); // Muchas advertencias
        } else {
            process.exit(0); // Todo OK
        }
    } catch (error) {
        console.error(`${colors.red}💥 Error durante la verificación: ${error.message}${colors.reset}`);
        process.exit(3);
    }
}

// Manejar Ctrl+C
process.on('SIGINT', () => {
    console.log(`\n${colors.yellow}Verificación cancelada por el usuario${colors.reset}`);
    process.exit(130);
});

// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}

module.exports = SystemVerifier;