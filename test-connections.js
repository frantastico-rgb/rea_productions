// ===============================================
// 🔍 VALIDADOR DE CONEXIONES - SGP REA PRODUCTIONS
// ===============================================
// Archivo: test-connections.js
// Propósito: Verificar conexiones a MySQL y MongoDB antes de iniciar desarrollo
// Fecha: Octubre 2025

require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');

// ===============================================
// CONFIGURACIÓN DE CONEXIONES
// ===============================================

const mysqlConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USERNAME || 'sgp_user',
    password: process.env.MYSQL_PASSWORD || 'sgp_pass_2025',
    database: process.env.MYSQL_DATABASE || 'sgp_rea_prod',
    connectTimeout: 10000,
    acquireTimeout: 10000
};

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sgp_rea_files';

// ===============================================
// FUNCIONES DE VALIDACIÓN
// ===============================================

async function testMySQLConnection() {
    console.log('\n🔍 Probando conexión MySQL...');
    console.log(`📍 Host: ${mysqlConfig.host}:${mysqlConfig.port}`);
    console.log(`📊 Database: ${mysqlConfig.database}`);
    
    try {
        const connection = await mysql.createConnection(mysqlConfig);
        
        // Probar consulta básica
        const [rows] = await connection.execute('SELECT VERSION() as version, NOW() as current_time');
        console.log('✅ MySQL conectado exitosamente');
        console.log(`   Versión: ${rows[0].version}`);
        console.log(`   Hora del servidor: ${rows[0].current_time}`);
        
        // Verificar tablas principales
        const [tables] = await connection.execute(`
            SELECT TABLE_NAME, TABLE_ROWS, DATA_LENGTH 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = ? 
            ORDER BY TABLE_NAME
        `, [mysqlConfig.database]);
        
        console.log('\n📊 Tablas encontradas:');
        tables.forEach(table => {
            const sizeKB = Math.round(table.DATA_LENGTH / 1024);
            console.log(`   - ${table.TABLE_NAME}: ${table.TABLE_ROWS || 0} filas (${sizeKB} KB)`);
        });
        
        // Verificar datos de prueba
        const [roles] = await connection.execute('SELECT COUNT(*) as count FROM roles');
        const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
        
        console.log('\n🧾 Datos iniciales:');
        console.log(`   - Roles: ${roles[0].count}`);
        console.log(`   - Usuarios: ${users[0].count}`);
        
        await connection.end();
        return { success: true, tablesCount: tables.length };
        
    } catch (error) {
        console.error('❌ Error en MySQL:', error.message);
        console.error('💡 Verificar:');
        console.error('   - Docker container ejecutándose: docker ps');
        console.error('   - Credenciales en .env.local');
        console.error('   - Puerto 3306 disponible');
        return { success: false, error: error.message };
    }
}

async function testMongoDBConnection() {
    console.log('\n🔍 Probando conexión MongoDB Atlas...');
    console.log(`📍 URI: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    
    try {
        const client = new MongoClient(mongoUri, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
        });
        
        await client.connect();
        console.log('✅ MongoDB Atlas conectado exitosamente');
        
        const db = client.db('sgp_rea_files');
        
        // Verificar colecciones
        const collections = await db.listCollections().toArray();
        console.log('\n📊 Colecciones encontradas:');
        
        let totalDocuments = 0;
        for (const collection of collections) {
            const coll = db.collection(collection.name);
            const count = await coll.countDocuments();
            const indexes = await coll.indexes();
            totalDocuments += count;
            
            console.log(`   - ${collection.name}: ${count} documentos, ${indexes.length} índices`);
        }
        
        // Verificar datos de ejemplo
        const projectFiles = await db.collection('projects_files').findOne();
        const systemLogs = await db.collection('system_logs').findOne();
        const appConfigs = await db.collection('app_configurations').findOne();
        
        console.log('\n🧾 Datos de ejemplo:');
        console.log(`   - projects_files: ${projectFiles ? '✅ Configurado' : '❌ Sin datos'}`);
        console.log(`   - system_logs: ${systemLogs ? '✅ Configurado' : '❌ Sin datos'}`);
        console.log(`   - app_configurations: ${appConfigs ? '✅ Configurado' : '❌ Sin datos'}`);
        
        // Probar operación de escritura
        const testDoc = {
            test: true,
            timestamp: new Date(),
            message: 'Test de conexión exitoso'
        };
        
        await db.collection('connection_test').insertOne(testDoc);
        await db.collection('connection_test').deleteOne({ test: true });
        console.log('✅ Operaciones de escritura funcionando');
        
        await client.close();
        return { 
            success: true, 
            collectionsCount: collections.length, 
            totalDocuments 
        };
        
    } catch (error) {
        console.error('❌ Error en MongoDB:', error.message);
        console.error('💡 Verificar:');
        console.error('   - Connection string en .env.local');
        console.error('   - Usuario y contraseña de Atlas');
        console.error('   - IP whitelist en MongoDB Atlas');
        console.error('   - Conexión a internet estable');
        return { success: false, error: error.message };
    }
}

async function testRedisConnection() {
    console.log('\n🔍 Probando conexión Redis...');
    
    try {
        const redis = require('redis');
        const client = redis.createClient({
            url: process.env.REDIS_URL || 'redis://:rea_cache_2025@localhost:6379'
        });
        
        await client.connect();
        
        // Probar operaciones básicas
        await client.set('test_key', 'test_value', { EX: 10 });
        const value = await client.get('test_key');
        await client.del('test_key');
        
        console.log('✅ Redis conectado exitosamente');
        console.log(`   Prueba de escritura/lectura: ${value === 'test_value' ? '✅' : '❌'}`);
        
        await client.disconnect();
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error en Redis:', error.message);
        console.error('💡 Verificar Docker container Redis');
        return { success: false, error: error.message };
    }
}

// ===============================================
// FUNCIÓN PRINCIPAL
// ===============================================

async function runConnectionTests() {
    console.log('🎬 =====================================');
    console.log('🎬 SGP REA PRODUCTIONS - TEST CONEXIONES');
    console.log('🎬 =====================================');
    console.log(`📅 Fecha: ${new Date().toLocaleString('es-CO')}`);
    
    const results = {
        mysql: await testMySQLConnection(),
        mongodb: await testMongoDBConnection(),
        redis: await testRedisConnection()
    };
    
    console.log('\n🎯 =====================================');
    console.log('🎯 RESUMEN DE CONEXIONES');
    console.log('🎯 =====================================');
    
    console.log(`🗄️  MySQL: ${results.mysql.success ? '✅ CONECTADO' : '❌ ERROR'}`);
    if (results.mysql.success) {
        console.log(`   └── ${results.mysql.tablesCount} tablas configuradas`);
    }
    
    console.log(`🍃 MongoDB: ${results.mongodb.success ? '✅ CONECTADO' : '❌ ERROR'}`);
    if (results.mongodb.success) {
        console.log(`   └── ${results.mongodb.collectionsCount} colecciones, ${results.mongodb.totalDocuments} documentos`);
    }
    
    console.log(`🔴 Redis: ${results.redis.success ? '✅ CONECTADO' : '❌ ERROR'}`);
    
    const allConnected = results.mysql.success && results.mongodb.success && results.redis.success;
    
    console.log('\n🚀 =====================================');
    if (allConnected) {
        console.log('🚀 ¡TODAS LAS CONEXIONES EXITOSAS!');
        console.log('🚀 Sistema listo para desarrollo');
        console.log('🚀 Puedes proceder con el backend Node.js');
    } else {
        console.log('⚠️  ALGUNAS CONEXIONES FALLARON');
        console.log('⚠️  Revisa los errores antes de continuar');
    }
    console.log('🚀 =====================================\n');
    
    return allConnected;
}

// Ejecutar si se llama directamente
if (require.main === module) {
    runConnectionTests()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Error inesperado:', error);
            process.exit(1);
        });
}

module.exports = { runConnectionTests, testMySQLConnection, testMongoDBConnection };