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

async function importWebphimToAiven() {
  try {
    console.log('🚀 Import Database WebPhim (có dữ liệu) vào Aiven\n');

    // Nhập thông tin Aiven
    console.log('📋 Nhập thông tin kết nối Aiven:');
    console.log('   (Lấy từ Aiven Dashboard → Service → Overview → Connection information)\n');
    
    const host = await question('Host (ví dụ: webphim-xxx.c.aivencloud.com): ');
    const port = await question('Port (mặc định: 3306): ') || '3306';
    const user = await question('User (thường là: avnadmin): ');
    const password = await question('Password: ');
    const database = await question('Database (mặc định: defaultdb): ') || 'defaultdb';

    console.log('\n🔌 Đang kết nối đến Aiven...');

    // Kết nối MySQL (không chỉ định database để có thể tạo database mới)
    const connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user,
      password,
      ssl: {
        rejectUnauthorized: false // Aiven dùng self-signed certificate
      },
      multipleStatements: true // Cho phép chạy nhiều câu lệnh
    });

    console.log('✅ Kết nối thành công!\n');

    // Đọc file webphim.sql
    const sqlFile = path.join(__dirname, '../webphim.sql');
    if (!fs.existsSync(sqlFile)) {
      throw new Error(`File không tồn tại: ${sqlFile}`);
    }

    console.log('📖 Đang đọc file webphim.sql...');
    let sql = fs.readFileSync(sqlFile, 'utf8');

    // Xử lý SQL: Loại bỏ các lệnh tạo database và USE (vì Aiven đã có database sẵn)
    // Thay thế USE webphim bằng USE database được chỉ định
    sql = sql.replace(/USE\s+`?webphim`?;?/gi, `USE \`${database}\`;`);
    sql = sql.replace(/CREATE DATABASE.*?;/gi, '-- Database đã tồn tại');
    
    // Loại bỏ các lệnh SET SQL_MODE, START TRANSACTION, COMMIT (có thể gây lỗi)
    sql = sql.replace(/SET SQL_MODE\s*=\s*[^;]+;/gi, '-- SET SQL_MODE');
    sql = sql.replace(/START TRANSACTION;/gi, '-- START TRANSACTION');
    sql = sql.replace(/COMMIT;/gi, '-- COMMIT');
    
    // Loại bỏ các lệnh SET time_zone, CHARACTER_SET_CLIENT (có thể gây lỗi)
    sql = sql.replace(/SET time_zone\s*=\s*[^;]+;/gi, '-- SET time_zone');
    sql = sql.replace(/SET @OLD_CHARACTER_SET_CLIENT\s*=\s*[^;]+;/gi, '-- SET @OLD_CHARACTER_SET_CLIENT');
    sql = sql.replace(/SET @OLD_CHARACTER_SET_RESULTS\s*=\s*[^;]+;/gi, '-- SET @OLD_CHARACTER_SET_RESULTS');
    sql = sql.replace(/SET @OLD_COLLATION_CONNECTION\s*=\s*[^;]+;/gi, '-- SET @OLD_COLLATION_CONNECTION');
    sql = sql.replace(/SET NAMES\s+[^;]+;/gi, '-- SET NAMES');
    sql = sql.replace(/SET CHARACTER_SET_CLIENT\s*=\s*[^;]+;/gi, '-- SET CHARACTER_SET_CLIENT');
    sql = sql.replace(/SET CHARACTER_SET_RESULTS\s*=\s*[^;]+;/gi, '-- SET CHARACTER_SET_RESULTS');
    sql = sql.replace(/SET COLLATION_CONNECTION\s*=\s*[^;]+;/gi, '-- SET COLLATION_CONNECTION');
    
    // Loại bỏ các comment phpMyAdmin
    sql = sql.replace(/\/\*!40101.*?\*\/;/g, '-- phpMyAdmin comment');
    sql = sql.replace(/\/\*!.*?\*\/;/g, '-- MySQL comment');

    // Chọn database
    await connection.query(`USE \`${database}\``);
    console.log(`✅ Đã chọn database: ${database}\n`);

    // Chạy SQL - chạy toàn bộ file một lần
    console.log('⏳ Đang import database (có thể mất vài phút)...\n');
    console.log('   ⚠️  Lưu ý: File này có dữ liệu thực tế (phim, rạp, users, etc.)\n');
    
    try {
      // Chạy toàn bộ SQL file một lần
      await connection.query(sql);
      console.log('✅ Import SQL thành công!\n');
    } catch (err) {
      // Nếu lỗi, thử chạy từng phần
      console.log('⚠️  Lỗi khi chạy toàn bộ, đang thử chạy từng phần...\n');
      
      // Tắt foreign key checks tạm thời
      await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
      
      // Chia SQL thành các câu lệnh đơn giản hơn
      // Tách bằng dấu ; nhưng chỉ khi không nằm trong string hoặc comment
      const statements = [];
      let currentStatement = '';
      let inString = false;
      let stringChar = '';
      
      for (let i = 0; i < sql.length; i++) {
        const char = sql[i];
        const nextChar = sql[i + 1];
        
        if (!inString && (char === '"' || char === "'" || char === '`')) {
          inString = true;
          stringChar = char;
          currentStatement += char;
        } else if (inString && char === stringChar && sql[i - 1] !== '\\') {
          inString = false;
          currentStatement += char;
        } else if (!inString && char === ';') {
          const stmt = currentStatement.trim();
          if (stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*')) {
            statements.push(stmt);
          }
          currentStatement = '';
        } else {
          currentStatement += char;
        }
      }
      
      // Thêm câu lệnh cuối cùng nếu có
      if (currentStatement.trim().length > 0) {
        statements.push(currentStatement.trim());
      }
      
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.length === 0 || statement.startsWith('--')) continue;
        
        try {
          await connection.query(statement);
          successCount++;
          if ((i + 1) % 50 === 0) {
            process.stdout.write(`   Đã xử lý ${i + 1}/${statements.length} câu lệnh...\r`);
          }
        } catch (err) {
          // Bỏ qua một số lỗi không quan trọng
          if (!err.message.includes('already exists') && 
              !err.message.includes('Duplicate entry') &&
              !err.message.includes('Unknown database') &&
              !err.message.includes('doesn\'t exist')) {
            errorCount++;
            if (errorCount <= 10) { // Chỉ hiển thị 10 lỗi đầu tiên
              console.error(`\n   ⚠️  Lỗi ở câu lệnh ${i + 1}: ${err.message.substring(0, 150)}`);
            }
          }
        }
      }
      
      // Bật lại foreign key checks
      await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
      
      console.log(`\n✅ Đã xử lý ${successCount} câu lệnh thành công`);
      if (errorCount > 0) {
        console.log(`   ⚠️  Có ${errorCount} lỗi (có thể là lỗi không quan trọng)`);
      }
    }

    // Kiểm tra các bảng đã tạo
    const [tables] = await connection.query('SHOW TABLES');
    
    console.log(`\n📊 Đã tạo ${tables.length} bảng:`);
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`   ${index + 1}. ${tableName}`);
    });

    // Kiểm tra số lượng dữ liệu
    try {
      const [movieCount] = await connection.query('SELECT COUNT(*) as count FROM movies');
      const [cinemaCount] = await connection.query('SELECT COUNT(*) as count FROM cinemas');
      const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
      
      console.log(`\n📈 Dữ liệu đã import:`);
      console.log(`   - Movies: ${movieCount[0].count}`);
      console.log(`   - Cinemas: ${cinemaCount[0].count}`);
      console.log(`   - Users: ${userCount[0].count}`);
    } catch (err) {
      // Bỏ qua nếu không có dữ liệu
    }

    await connection.end();
    console.log('\n🎉 Hoàn thành! Database đã sẵn sàng với dữ liệu.\n');

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

importWebphimToAiven();

