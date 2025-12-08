// ===============================================
// 🧪 TEST DE ENDPOINTS DE PROYECTOS
// ===============================================
// Archivo: test-projects-api.js
// Propósito: Probar endpoints del módulo de proyectos

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Colores para consola
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    gray: '\x1b[90m'
};

async function testProjectsAPI() {
    console.log('\n🎬 =====================================');
    console.log('🎬 TEST DE API DE PROYECTOS');
    console.log('🎬 =====================================\n');
    
    let projectId = null;
    
    try {
        // TEST 1: Listar proyectos
        console.log(`${colors.blue}📋 TEST 1: Listar proyectos${colors.reset}`);
        try {
            const response = await axios.get(`${API_URL}/projects`);
            console.log(`${colors.green}✅ GET /api/projects - OK${colors.reset}`);
            console.log(`   Proyectos encontrados: ${response.data.data.length}`);
            console.log(`   Total en BD: ${response.data.pagination.total}`);
            
            if (response.data.data.length > 0) {
                projectId = response.data.data[0].id;
                console.log(`   Primer proyecto: "${response.data.data[0].title}" (ID: ${projectId})`);
            }
        } catch (error) {
            console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
        }
        
        console.log('');
        
        // TEST 2: Crear nuevo proyecto
        console.log(`${colors.blue}📝 TEST 2: Crear nuevo proyecto${colors.reset}`);
        try {
            const newProject = {
                title: 'Proyecto de Prueba API',
                slug: `proyecto-test-${Date.now()}`,
                description: 'Proyecto creado desde test de API',
                status: 'desarrollo',
                genre: 'Drama',
                target_duration: 90,
                budget_total: 500000.00,
                start_date: '2025-01-15',
                end_date: '2025-06-30',
                synopsis: 'Un proyecto de prueba para validar la API de gestión de producción',
                target_audience: 'Público general',
                created_by: 1
            };
            
            const response = await axios.post(`${API_URL}/projects`, newProject);
            projectId = response.data.data.id;
            
            console.log(`${colors.green}✅ POST /api/projects - OK${colors.reset}`);
            console.log(`   Proyecto creado con ID: ${projectId}`);
            console.log(`   Título: "${response.data.data.title}"`);
            console.log(`   Slug: "${response.data.data.slug}"`);
        } catch (error) {
            if (error.response) {
                console.log(`${colors.red}❌ Error ${error.response.status}: ${error.response.data.error}${colors.reset}`);
            } else {
                console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
            }
        }
        
        console.log('');
        
        // TEST 3: Obtener detalle del proyecto
        if (projectId) {
            console.log(`${colors.blue}🔍 TEST 3: Obtener detalle del proyecto${colors.reset}`);
            try {
                const response = await axios.get(`${API_URL}/projects/${projectId}`);
                console.log(`${colors.green}✅ GET /api/projects/${projectId} - OK${colors.reset}`);
                console.log(`   Título: "${response.data.data.title}"`);
                console.log(`   Estado: ${response.data.data.status}`);
                console.log(`   Presupuesto: $${response.data.data.budget_total?.toLocaleString('es-CO')}`);
                console.log(`   Escenas: ${response.data.data.stats.scenes_count}`);
                console.log(`   Personajes: ${response.data.data.stats.characters_count}`);
            } catch (error) {
                console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
            }
            
            console.log('');
        }
        
        // TEST 4: Actualizar proyecto
        if (projectId) {
            console.log(`${colors.blue}✏️  TEST 4: Actualizar proyecto${colors.reset}`);
            try {
                const updateData = {
                    status: 'preproduccion',
                    budget_total: 750000.00,
                    rating: 'PG-13'
                };
                
                const response = await axios.put(`${API_URL}/projects/${projectId}`, updateData);
                console.log(`${colors.green}✅ PUT /api/projects/${projectId} - OK${colors.reset}`);
                console.log(`   Estado actualizado: ${response.data.data.status}`);
                console.log(`   Presupuesto actualizado: $${response.data.data.budget_total?.toLocaleString('es-CO')}`);
            } catch (error) {
                console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
            }
            
            console.log('');
        }
        
        // TEST 5: Estadísticas del proyecto
        if (projectId) {
            console.log(`${colors.blue}📊 TEST 5: Estadísticas del proyecto${colors.reset}`);
            try {
                const response = await axios.get(`${API_URL}/projects/${projectId}/stats`);
                console.log(`${colors.green}✅ GET /api/projects/${projectId}/stats - OK${colors.reset}`);
                console.log(`   Escenas totales: ${response.data.data.scenes.total || 0}`);
                console.log(`   Personajes totales: ${response.data.data.characters.total || 0}`);
                console.log(`   Progreso escenas: ${response.data.data.progress.scenes_percentage}%`);
            } catch (error) {
                console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
            }
            
            console.log('');
        }
        
        // TEST 6: Filtrar proyectos por estado
        console.log(`${colors.blue}🔎 TEST 6: Filtrar proyectos por estado${colors.reset}`);
        try {
            const response = await axios.get(`${API_URL}/projects?status=desarrollo`);
            console.log(`${colors.green}✅ GET /api/projects?status=desarrollo - OK${colors.reset}`);
            console.log(`   Proyectos en desarrollo: ${response.data.data.length}`);
        } catch (error) {
            console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
        }
        
        console.log('');
        
        // TEST 7: Búsqueda de proyectos
        console.log(`${colors.blue}🔍 TEST 7: Búsqueda de proyectos${colors.reset}`);
        try {
            const response = await axios.get(`${API_URL}/projects?search=prueba`);
            console.log(`${colors.green}✅ GET /api/projects?search=prueba - OK${colors.reset}`);
            console.log(`   Resultados: ${response.data.data.length}`);
        } catch (error) {
            console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
        }
        
        console.log('');
        
        // TEST 8: Eliminar proyecto (comentado para no eliminar datos)
        /*
        if (projectId) {
            console.log(`${colors.blue}🗑️  TEST 8: Eliminar proyecto${colors.reset}`);
            try {
                const response = await axios.delete(`${API_URL}/projects/${projectId}`);
                console.log(`${colors.green}✅ DELETE /api/projects/${projectId} - OK${colors.reset}`);
                console.log(`   Proyecto eliminado: "${response.data.title}"`);
            } catch (error) {
                console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
            }
        }
        */
        
        console.log('\n🎯 =====================================');
        console.log('🎯 RESUMEN DE TESTS');
        console.log('🎯 =====================================');
        console.log(`${colors.green}✅ Todos los tests completados${colors.reset}`);
        console.log(`${colors.yellow}⚠️  Proyecto de prueba creado con ID: ${projectId}${colors.reset}`);
        console.log(`${colors.gray}💡 Para eliminar el proyecto de prueba, usa:${colors.reset}`);
        console.log(`${colors.gray}   DELETE http://localhost:3000/api/projects/${projectId}${colors.reset}`);
        console.log('🎯 =====================================\n');
        
    } catch (error) {
        console.error(`${colors.red}💥 Error general: ${error.message}${colors.reset}`);
    }
}

// Ejecutar tests
testProjectsAPI();
