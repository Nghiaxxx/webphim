const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Tạo interface để đọc input từ user
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function runSchema() {
  try {
    console.log('🚀 Bắt đầu chạy Database Schema...\n');

    // Nhập thông tin MySQL
    const host = await question('MySQL Host (mặc định: localhost): ') || 'localhost';
    const user = await question('MySQL User (mặc định: root): ') || 'root';
    const password = await question('MySQL Password (Enter nếu không có): ');
    const database = await question('Database name (mặc định: webphim): ') || 'webphim';

    // Hỏi xem có dữ liệu cũ không
    console.log('\n📋 Bạn đã có dữ liệu trong database chưa?');
    console.log('1. Database mới (chưa có dữ liệu) - Chạy schema.sql');
    console.log('2. Đã có dữ liệu - Chạy migration');
    const choice = await question('Chọn (1 hoặc 2): ');

    let sqlFile;
    if (choice === '2') {
      sqlFile = path.join(__dirname, '../migration_add_user_and_voucher.sql');
      console.log('\n⚠️  Bạn đã chọn migration. Đảm bảo database đã tồn tại!');
    } else {
      sqlFile = path.join(__dirname, '../schema.sql');
      console.log('\n✅ Bạn đã chọn schema mới. Database sẽ được tạo tự động.');
    }

    // Kiểm tra file tồn tại
    if (!fs.existsSync(sqlFile)) {
      throw new Error(`File không tồn tại: ${sqlFile}`);
    }

    // Đọc file SQL
    console.log(`\n📖 Đang đọc file: ${sqlFile}...`);
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Kết nối MySQL (không chỉ định database nếu là schema mới)
    console.log('\n🔌 Đang kết nối MySQL...');
    const connection = await mysql.createConnection({
      host,
      user,
      password: password || undefined,
      multipleStatements: true // Cho phép chạy nhiều câu lệnh
    });

    console.log('✅ Kết nối thành công!\n');

    // Chia SQL thành các câu lệnh (tách bằng ;)
    // Loại bỏ comment và khoảng trắng thừa
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    console.log(`📝 Tìm thấy ${statements.length} câu lệnh SQL\n`);

    // Chạy từng câu lệnh
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Bỏ qua các câu lệnh rỗng hoặc chỉ là comment
      if (!statement || statement.length < 10) continue;

      try {
        await connection.query(statement);
        successCount++;
        
        // Hiển thị progress
        const progress = Math.round((i + 1) / statements.length * 100);
        process.stdout.write(`\r⏳ Đang chạy... ${progress}% (${i + 1}/${statements.length})`);
      } catch (error) {
        errorCount++;
        // Một số lỗi có thể bỏ qua (như table đã tồn tại)
        if (error.code === 'ER_TABLE_EXISTS' || 
            error.code === 'ER_DUP_FIELDNAME' ||
            error.code === 'ER_DUP_KEYNAME') {
          console.log(`\n⚠️  Cảnh báo: ${error.message.split('\n')[0]}`);
        } else {
          console.error(`\n❌ Lỗi ở câu lệnh ${i + 1}:`);
          console.error(error.message);
          // Không dừng, tiếp tục chạy các câu lệnh khác
        }
      }
    }

    console.log('\n\n📊 Kết quả:');
    console.log(`✅ Thành công: ${successCount} câu lệnh`);
    if (errorCount > 0) {
      console.log(`⚠️  Có lỗi: ${errorCount} câu lệnh (có thể là cảnh báo)`);
    }

    // Kiểm tra các bảng đã tạo
    console.log('\n🔍 Đang kiểm tra các bảng đã tạo...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`\n✅ Đã tạo ${tables.length} bảng:`);
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`   ${index + 1}. ${tableName}`);
    });

    await connection.end();
    console.log('\n🎉 Hoàn thành! Database đã sẵn sàng.\n');

  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Chạy script
runSchema();

