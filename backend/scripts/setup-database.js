const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config();

// Tạo interface để đọc input từ user
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function testConnection(config) {
  try {
    const connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password || undefined,
      multipleStatements: true
    });
    return { success: true, connection };
  } catch (error) {
    return { success: false, error };
  }
}

async function setupDatabase() {
  try {
    console.log('🚀 Đang thiết lập Database...\n');

    // Đọc config từ .env hoặc dùng giá trị mặc định
    let config = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'webphim'
    };

    console.log(`📋 Cấu hình hiện tại:`);
    console.log(`   Host: ${config.host}`);
    console.log(`   User: ${config.user}`);
    console.log(`   Password: ${config.password ? '***' : '(không có)'}`);
    console.log(`   Database: ${config.database}\n`);

    // Thử kết nối
    let connectionResult = await testConnection(config);
    
    // Nếu lỗi access denied, hỏi lại password
    if (!connectionResult.success && connectionResult.error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('⚠️  Kết nối thất bại. Vui lòng nhập lại thông tin:\n');
      
      const newPassword = await question(`MySQL Password cho user '${config.user}' (Enter nếu không có password): `);
      config.password = newPassword || '';
      
      // Thử lại
      connectionResult = await testConnection(config);
      
      if (!connectionResult.success) {
        throw new Error(`Không thể kết nối MySQL: ${connectionResult.error.message}`);
      }
    } else if (!connectionResult.success) {
      throw connectionResult.error;
    }

    const connection = connectionResult.connection;
    console.log('✅ Kết nối MySQL thành công!\n');

    // Kiểm tra xem dùng schema mới hay migration
    const useMigration = process.argv.includes('--migration') || process.argv.includes('-m');
    const sqlFile = useMigration 
      ? path.join(__dirname, '../migration_add_user_and_voucher.sql')
      : path.join(__dirname, '../schema.sql');

    if (!fs.existsSync(sqlFile)) {
      throw new Error(`File không tồn tại: ${sqlFile}`);
    }

    console.log(`📖 Đang đọc file: ${path.basename(sqlFile)}...`);

    // Đọc và chạy SQL
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('⏳ Đang chạy SQL...');
    await connection.query(sql);
    console.log('✅ Chạy SQL thành công!\n');

    // Kiểm tra các bảng
    await connection.query(`USE ${config.database}`);
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
      console.error('   1. Kiểm tra lại password trong file .env');
      console.error('   2. Hoặc chạy lại script và nhập password khi được hỏi');
      console.error('   3. Nếu MySQL không có password, để trống DB_PASSWORD trong .env');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('💡 Đảm bảo MySQL đang chạy');
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

setupDatabase();

