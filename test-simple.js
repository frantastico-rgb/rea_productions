// ===============================================
// 🧪 TEST SIMPLE DE ENDPOINTS DE PROYECTOS
// ===============================================

const http = require('http');

const API_URL = 'localhost';
const API_PORT = 3000;

function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: API_URL,
            port: API_PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: JSON.parse(body)
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: body
                    });
                }
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function runTests() {
    console.log('\n🎬 TEST DE API DE PROYECTOS\n');
    
    try {
        // Test 1: Listar proyectos
        console.log('📋 Test 1: GET /api/projects');
        const list = await makeRequest('GET', '/api/projects');
        console.log(`   Status: ${list.status}`);
        console.log(`   Proyectos: ${list.data.data?.length || 0}`);
        console.log(`   Total: ${list.data.pagination?.total || 0}\n`);
        
        // Test 2: Crear proyecto
        console.log('📝 Test 2: POST /api/projects');
        const newProject = {
            title: 'Proyecto API Test',
            slug: `test-${Date.now()}`,
            description: 'Proyecto de prueba',
            status: 'desarrollo',
            budget_total: 500000,
            created_by: 1
        };
        const create = await makeRequest('POST', '/api/projects', newProject);
        console.log(`   Status: ${create.status}`);
        console.log(`   ID creado: ${create.data.data?.id || 'N/A'}`);
        console.log(`   Título: ${create.data.data?.title || 'N/A'}\n`);
        
        const projectId = create.data.data?.id;
        
        if (projectId) {
            // Test 3: Ver detalle
            console.log(`🔍 Test 3: GET /api/projects/${projectId}`);
            const detail = await makeRequest('GET', `/api/projects/${projectId}`);
            console.log(`   Status: ${detail.status}`);
            console.log(`   Presupuesto: $${detail.data.data?.budget_total?.toLocaleString('es-CO') || 0}`);
            console.log(`   Estado: ${detail.data.data?.status || 'N/A'}\n`);
            
            // Test 4: Actualizar
            console.log(`✏️  Test 4: PUT /api/projects/${projectId}`);
            const update = await makeRequest('PUT', `/api/projects/${projectId}`, {
                status: 'preproduccion',
                budget_total: 750000
            });
            console.log(`   Status: ${update.status}`);
            console.log(`   Nuevo estado: ${update.data.data?.status || 'N/A'}\n`);
            
            // Test 5: Estadísticas
            console.log(`📊 Test 5: GET /api/projects/${projectId}/stats`);
            const stats = await makeRequest('GET', `/api/projects/${projectId}/stats`);
            console.log(`   Status: ${stats.status}`);
            console.log(`   Escenas: ${stats.data.data?.scenes?.total || 0}`);
            console.log(`   Personajes: ${stats.data.data?.characters?.total || 0}\n`);
        }
        
        console.log('✅ Tests completados exitosamente!\n');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Esperar un poco para que el servidor esté listo
setTimeout(runTests, 1000);
