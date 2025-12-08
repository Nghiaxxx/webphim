const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function importToAiven() {
  try {
    console.log('🚀 Import Database Schema vào Aiven\n');

    // Nhập thông tin Aiven
    console.log('📋 Nhập thông tin kết nối Aiven:');
    console.log('   (Lấy từ Aiven Dashboard → Service → Overview → Connection information)\n');
    
    const host = await question('Host (ví dụ: webphim-xxx.c.aivencloud.com): ');
    const port = await question('Port (mặc định: 3306): ') || '3306';
    const user = await question('User (thường là: avnadmin): ');
    const password = await question('Password: ');
    const database = await question('Database (mặc định: defaultdb): ') || 'defaultdb';

    console.log('\n🔌 Đang kết nối đến Aiven...');

    // Kết nối MySQL
    const connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user,
      password,
      database,
      ssl: {
        rejectUnauthorized: false // Aiven dùng self-signed certificate
      },
      multipleStatements: true // Cho phép chạy nhiều câu lệnh
    });

    console.log('✅ Kết nối thành công!\n');

    // Đọc file schema.sql
    const schemaFile = path.join(__dirname, '../schema.sql');
    if (!fs.existsSync(schemaFile)) {
      throw new Error(`File không tồn tại: ${schemaFile}`);
    }

    console.log('📖 Đang đọc file schema.sql...');
    const sql = fs.readFileSync(schemaFile, 'utf8');

    // Chạy SQL
    console.log('⏳ Đang import schema (có thể mất vài phút)...\n');
    await connection.query(sql);
    console.log('✅ Import schema thành công!\n');

    // Kiểm tra các bảng đã tạo
    const [tables] = await connection.query('SHOW TABLES');
    
    console.log(`📊 Đã tạo ${tables.length} bảng:`);
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`   ${index + 1}. ${tableName}`);
    });

    await connection.end();
    console.log('\n🎉 Hoàn thành! Database đã sẵn sàng.\n');

  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Gợi ý:');
      console.error('   - Kiểm tra lại password');
      console.error('   - Kiểm tra user có quyền truy cập database không');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Gợi ý:');
      console.error('   - Kiểm tra lại hostname');
      console.error('   - Đảm bảo service Aiven đang chạy');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Gợi ý:');
      console.error('   - Kiểm tra lại port');
      console.error('   - Kiểm tra firewall/network');
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

importToAiven();

