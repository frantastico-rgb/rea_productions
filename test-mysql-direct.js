// Test directo de conexión MySQL
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function testMySQL() {
    console.log('🔍 Probando conexión directa a MySQL...\n');
    
    const config = {
        host: process.env.MYSQL_HOST || 'localhost',
        port: process.env.MYSQL_PORT || 3306,
        user: process.env.MYSQL_USERNAME || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'sgp_rea_prod',
        charset: 'utf8mb4'
    };
    
    console.log('📋 Configuración:');
    console.log('   Host:', config.host);
    console.log('   Puerto:', config.port);
    console.log('   Usuario:', config.user);
    console.log('   Password:', config.password ? '***' : '(vacío)');
    console.log('   Database:', config.database);
    console.log('');
    
    try {
        // Test 1: Crear conexión
        console.log('1️⃣  Creando conexión...');
        const connection = await mysql.createConnection(config);
        console.log('   ✅ Conexión creada\n');
        
        // Test 2: Verificar base de datos
        console.log('2️⃣  Verificando base de datos...');
        const [databases] = await connection.query('SHOW DATABASES');
        console.log('   ✅ Bases de datos disponibles:');
        databases.forEach(db => console.log('      -', db.Database));
        console.log('');
        
        // Test 3: Verificar tabla projects
        console.log('3️⃣  Verificando tabla projects...');
        const [tables] = await connection.query(`SHOW TABLES LIKE 'projects'`);
        
        if (tables.length === 0) {
            console.log('   ❌ La tabla "projects" NO EXISTE');
            console.log('   💡 Necesitas ejecutar: database_setup_mysql.sql\n');
            
            // Mostrar todas las tablas
            const [allTables] = await connection.query('SHOW TABLES');
            console.log('   📋 Tablas existentes:');
            allTables.forEach(table => {
                const tableName = Object.values(table)[0];
                console.log('      -', tableName);
            });
        } else {
            console.log('   ✅ Tabla "projects" existe\n');
            
            // Test 4: Ver estructura
            console.log('4️⃣  Estructura de la tabla projects:');
            const [columns] = await connection.query('DESCRIBE projects');
            console.log('   Columnas:');
            columns.forEach(col => {
                console.log(`      - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `[${col.Key}]` : ''}`);
            });
            console.log('');
            
            // Test 5: Contar registros
            console.log('5️⃣  Contando registros...');
            const [count] = await connection.query('SELECT COUNT(*) as total FROM projects');
            console.log('   📊 Total de proyectos:', count[0].total);
            console.log('');
            
            // Test 6: Insertar proyecto de prueba
            console.log('6️⃣  Intentando insertar proyecto de prueba...');
            try {
                const [result] = await connection.execute(
                    `INSERT INTO projects (
                        title, slug, description, status, genre, target_duration, 
                        budget_total, start_date, end_date, director_id, producer_id,
                        poster_url, trailer_url, synopsis, target_audience, rating, created_by
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        'Proyecto Test MySQL',
                        'proyecto-test-mysql-' + Date.now(),
                        'Descripción de prueba',
                        'desarrollo',
                        'Drama',
                        90,
                        100000,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        'Sinopsis de prueba',
                        'Todo público',
                        null,
                        1
                    ]
                );
                
                console.log('   ✅ Proyecto insertado exitosamente!');
                console.log('   🆔 ID del proyecto:', result.insertId);
                console.log('');
                
                // Verificar inserción
                const [inserted] = await connection.query(
                    'SELECT * FROM projects WHERE id = ?',
                    [result.insertId]
                );
                console.log('   📄 Proyecto insertado:');
                console.log('      Título:', inserted[0].title);
                console.log('      Slug:', inserted[0].slug);
                console.log('      Estado:', inserted[0].status);
                console.log('      Presupuesto:', inserted[0].budget_total);
                
            } catch (insertError) {
                console.log('   ❌ ERROR al insertar:');
                console.log('   Código:', insertError.code);
                console.log('   Mensaje:', insertError.message);
                console.log('   SQL State:', insertError.sqlState);
                if (insertError.sql) {
                    console.log('   SQL:', insertError.sql.substring(0, 200) + '...');
                }
            }
        }
        
        await connection.end();
        console.log('\n✅ Test completado\n');
        
    } catch (error) {
        console.error('\n❌ ERROR DE CONEXIÓN:');
        console.error('   Código:', error.code);
        console.error('   Mensaje:', error.message);
        console.error('   Errno:', error.errno);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 SOLUCIÓN:');
            console.error('   1. Abre XAMPP/WAMP Control Panel');
            console.error('   2. Asegúrate de que MySQL esté en verde (Running)');
            console.error('   3. Si no está corriendo, haz click en "Start"');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('\n💡 SOLUCIÓN:');
            console.error('   1. Verifica usuario/password en .env.local');
            console.error('   2. Usuario actual:', config.user);
            console.error('   3. Password:', config.password ? 'Tiene valor' : 'Vacío');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('\n💡 SOLUCIÓN:');
            console.error('   1. La base de datos "sgp_rea_prod" no existe');
            console.error('   2. Créala desde phpMyAdmin o ejecuta:');
            console.error('      CREATE DATABASE sgp_rea_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
        }
        
        console.error('');
    }
}

testMySQL();
