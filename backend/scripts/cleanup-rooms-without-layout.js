const mysql = require('mysql2/promise');
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

async function main() {
  console.log('🧹 Script dọn dẹp phòng không có layout\n');
  console.log('Script này sẽ:');
  console.log('  - Tìm tất cả phòng không có layout_config hoặc layout_config không hợp lệ');
  console.log('  - Kiểm tra xem phòng có đang được sử dụng trong showtimes không');
  console.log('  - Xóa những phòng không có layout và không đang được sử dụng\n');

  // Kết nối database
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || undefined,
      database: process.env.DB_NAME || 'webphim',
      multipleStatements: false
    });
    console.log('✅ Đã kết nối database\n');
  } catch (error) {
    console.error('❌ Lỗi kết nối database:', error.message);
    process.exit(1);
  }

  try {
    // Lấy tất cả các phòng
    console.log('📋 Đang lấy danh sách phòng...');
    const [rooms] = await connection.execute(
      'SELECT id, name, cinema_id, layout_config FROM rooms ORDER BY id'
    );
    console.log(`   Tìm thấy ${rooms.length} phòng\n`);

    // Phân loại phòng
    const roomsWithoutLayout = [];
    const roomsWithInvalidLayout = [];
    const roomsWithValidLayout = [];
    const roomsInUseWithoutLayout = []; // Phòng có showtimes nhưng không có layout

    console.log('🔍 Đang kiểm tra layout của từng phòng...\n');

    for (const room of rooms) {
      // Kiểm tra xem phòng có đang được sử dụng trong showtimes không
      const [showtimes] = await connection.execute(
        'SELECT COUNT(*) as count FROM showtimes WHERE room_id = ?',
        [room.id]
      );
      const isInUse = showtimes[0].count > 0;

      // Kiểm tra layout_config
      let hasValidLayout = false;
      let layoutError = null;

      if (!room.layout_config || room.layout_config === null) {
        // Không có layout
        if (isInUse) {
          roomsInUseWithoutLayout.push({
            id: room.id,
            name: room.name,
            showtimesCount: showtimes[0].count,
            reason: 'Không có layout nhưng đang có showtimes'
          });
        } else {
          roomsWithoutLayout.push({
            id: room.id,
            name: room.name,
            cinema_id: room.cinema_id
          });
        }
        continue;
      }

      // Kiểm tra layout có hợp lệ không
      let layoutData;
      try {
        layoutData = typeof room.layout_config === 'string'
          ? JSON.parse(room.layout_config)
          : room.layout_config;

        // Kiểm tra cấu trúc layout
        if (!layoutData || typeof layoutData !== 'object') {
          throw new Error('Layout không phải là object');
        }

        if (!Array.isArray(layoutData.rowLetters) || layoutData.rowLetters.length === 0) {
          throw new Error('rowLetters không hợp lệ');
        }

        if (!layoutData.seatsPerRow || typeof layoutData.seatsPerRow !== 'object') {
          throw new Error('seatsPerRow không hợp lệ');
        }

        // Kiểm tra mỗi row có seatsPerRow tương ứng không
        const hasAllRows = layoutData.rowLetters.every(row => 
          layoutData.seatsPerRow[row] && typeof layoutData.seatsPerRow[row] === 'number'
        );

        if (!hasAllRows) {
          throw new Error('Một số hàng không có seatsPerRow tương ứng');
        }

        // Layout hợp lệ
        hasValidLayout = true;
        roomsWithValidLayout.push({
          id: room.id,
          name: room.name,
          rows: layoutData.rowLetters.length,
          totalSeats: Object.values(layoutData.seatsPerRow).reduce((a, b) => a + b, 0),
          isInUse: isInUse,
          showtimesCount: isInUse ? showtimes[0].count : 0
        });
      } catch (error) {
        layoutError = error.message;
        if (isInUse) {
          roomsInUseWithoutLayout.push({
            id: room.id,
            name: room.name,
            showtimesCount: showtimes[0].count,
            reason: `Layout không hợp lệ: ${error.message}`
          });
        } else {
          roomsWithInvalidLayout.push({
            id: room.id,
            name: room.name,
            error: error.message,
            layout_preview: typeof room.layout_config === 'string' 
              ? room.layout_config.substring(0, 100) 
              : JSON.stringify(room.layout_config).substring(0, 100)
          });
        }
      }
    }

    // Hiển thị thống kê
    console.log('\n📊 THỐNG KÊ:\n');
    console.log(`✅ Phòng có layout hợp lệ: ${roomsWithValidLayout.length}`);
    console.log(`❌ Phòng không có layout (có thể xóa): ${roomsWithoutLayout.length}`);
    console.log(`⚠️  Phòng có layout không hợp lệ (có thể xóa): ${roomsWithInvalidLayout.length}`);
    console.log(`🔒 Phòng đang được sử dụng nhưng không có layout: ${roomsInUseWithoutLayout.length}`);
    console.log(`   (Cần thiết lập layout cho các phòng này)\n`);

    // Hiển thị danh sách phòng cần thiết lập layout (luôn hiển thị)
    if (roomsInUseWithoutLayout.length > 0) {
      console.log('\n⚠️  PHÒNG ĐANG ĐƯỢC SỬ DỤNG NHƯNG KHÔNG CÓ LAYOUT:');
      console.log('   Các phòng này cần được thiết lập layout ngay:\n');
      roomsInUseWithoutLayout.forEach((room, index) => {
        console.log(`   ${index + 1}. ID: ${room.id}, Tên: "${room.name || 'N/A'}"`);
        console.log(`      - ${room.showtimesCount} suất chiếu đang sử dụng phòng này`);
        console.log(`      - ${room.reason}`);
        console.log('');
      });
    }

    // Danh sách phòng sẽ bị xóa
    const roomsToDelete = [...roomsWithoutLayout, ...roomsWithInvalidLayout];

    if (roomsToDelete.length === 0) {
      console.log('✨ Không có phòng nào cần xóa!\n');
      if (roomsInUseWithoutLayout.length > 0) {
        console.log('💡 Lưu ý: Hãy thiết lập layout cho các phòng ở trên để người dùng có thể đặt vé.\n');
      }
      await connection.end();
      rl.close();
      return;
    }

    console.log('\n🗑️  DANH SÁCH PHÒNG SẼ BỊ XÓA:\n');
    if (roomsWithoutLayout.length > 0) {
      console.log('Phòng không có layout:');
      roomsWithoutLayout.forEach(room => {
        console.log(`  - ID: ${room.id}, Tên: ${room.name || 'N/A'}, Cinema ID: ${room.cinema_id}`);
      });
    }

    if (roomsWithInvalidLayout.length > 0) {
      console.log('\nPhòng có layout không hợp lệ:');
      roomsWithInvalidLayout.forEach(room => {
        console.log(`  - ID: ${room.id}, Tên: ${room.name || 'N/A'}`);
        console.log(`    Lỗi: ${room.error}`);
        console.log(`    Layout preview: ${room.layout_preview}...`);
      });
    }

    // Xác nhận xóa
    console.log(`\n⚠️  CẢNH BÁO: Bạn sắp xóa ${roomsToDelete.length} phòng!`);
    const confirm = await question('Bạn có chắc chắn muốn tiếp tục? (yes/no): ');

    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      console.log('\n❌ Đã hủy thao tác.');
      await connection.end();
      rl.close();
      return;
    }

    // Xóa phòng
    console.log('\n🗑️  Đang xóa phòng...\n');
    let deletedCount = 0;
    let errorCount = 0;

    for (const room of roomsToDelete) {
      try {
        await connection.execute('DELETE FROM rooms WHERE id = ?', [room.id]);
        console.log(`✅ Đã xóa phòng ID ${room.id} (${room.name || 'N/A'})`);
        deletedCount++;
      } catch (error) {
        console.error(`❌ Lỗi khi xóa phòng ID ${room.id}:`, error.message);
        errorCount++;
      }
    }

    // Kết quả
    console.log('\n📊 KẾT QUẢ:');
    console.log(`✅ Đã xóa thành công: ${deletedCount} phòng`);
    if (errorCount > 0) {
      console.log(`❌ Lỗi khi xóa: ${errorCount} phòng`);
    }
    console.log(`✅ Giữ lại: ${roomsWithValidLayout.length} phòng có layout hợp lệ`);
    if (roomsInUseWithoutLayout.length > 0) {
      console.log(`⚠️  Cần thiết lập layout: ${roomsInUseWithoutLayout.length} phòng đang được sử dụng\n`);
    }

  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    console.error(error);
  } finally {
    await connection.end();
    rl.close();
  }
}

// Chạy script
main().catch(error => {
  console.error('❌ Lỗi không mong muốn:', error);
  process.exit(1);
});

