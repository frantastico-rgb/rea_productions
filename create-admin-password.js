// Script para crear contraseña hasheada para el usuario admin
const bcrypt = require('bcrypt');

async function generatePassword() {
    const password = 'admin123';
    const saltRounds = 10;
    
    const hash = await bcrypt.hash(password, saltRounds);
    
    console.log('\n✅ Contraseña generada exitosamente\n');
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('\n📋 Ejecuta este SQL en phpMyAdmin:\n');
    console.log(`UPDATE users SET password_hash = '${hash}' WHERE username = 'admin';`);
    console.log('\n🔐 Credenciales de acceso:');
    console.log('Usuario: admin');
    console.log('Contraseña: admin123\n');
}

generatePassword().catch(console.error);
