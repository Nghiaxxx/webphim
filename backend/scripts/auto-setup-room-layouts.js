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

// Layout mặc định - có thể tùy chỉnh
const DEFAULT_LAYOUT = {
  rowLetters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'],
  seatsPerRow: {
    'A': 12, 'B': 12, 'C': 12, 'D': 12,
    'E': 15, 'F': 15, 'G': 15, 'H': 15, 'I': 15, 'J': 15, 'K': 15, 'L': 15,
    'M': 10, 'N': 5
  },
  middleSeats: {
    // Ghế VIP ở giữa (có thể tùy chỉnh)
    'E': [7, 8, 9],
    'F': [7, 8, 9],
    'G': [7, 8, 9],
    'H': [7, 8, 9]
  },
  rowsWithMiddleSeats: ['E', 'F', 'G', 'H']
};

async function main() {
  console.log('🔧 Script tự động thiết lập layout cho phòng chưa có layout\n');
  console.log('Script này sẽ:');
  console.log('  - Tìm tất cả phòng không có layout_config hoặc layout_config không hợp lệ');
  console.log('  - Tự động thiết lập layout mặc định cho các phòng đó');
  console.log('  - Layout mặc định: 14 hàng (A-N), tổng ~180 ghế\n');

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

    // Tìm phòng cần thiết lập layout
    const roomsNeedingLayout = [];
    const roomsWithValidLayout = [];

    console.log('🔍 Đang kiểm tra layout của từng phòng...\n');

    for (const room of rooms) {
      // Kiểm tra layout_config
      if (!room.layout_config || room.layout_config === null) {
        roomsNeedingLayout.push({
          id: room.id,
          name: room.name,
          cinema_id: room.cinema_id,
          reason: 'Không có layout'
        });
        continue;
      }

      // Kiểm tra layout có hợp lệ không
      try {
        const layoutData = typeof room.layout_config === 'string'
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
        roomsWithValidLayout.push({
          id: room.id,
          name: room.name
        });
      } catch (error) {
        roomsNeedingLayout.push({
          id: room.id,
          name: room.name,
          cinema_id: room.cinema_id,
          reason: `Layout không hợp lệ: ${error.message}`
        });
      }
    }

    // Hiển thị thống kê
    console.log('\n📊 THỐNG KÊ:\n');
    console.log(`✅ Phòng đã có layout hợp lệ: ${roomsWithValidLayout.length}`);
    console.log(`⚠️  Phòng cần thiết lập layout: ${roomsNeedingLayout.length}\n`);

    if (roomsNeedingLayout.length === 0) {
      console.log('✨ Tất cả phòng đã có layout hợp lệ!\n');
      await connection.end();
      rl.close();
      return;
    }

    // Hiển thị danh sách phòng cần thiết lập layout
    console.log('📝 DANH SÁCH PHÒNG CẦN THIẾT LẬP LAYOUT:\n');
    roomsNeedingLayout.forEach((room, index) => {
      console.log(`   ${index + 1}. ID: ${room.id}, Tên: "${room.name || 'N/A'}"`);
      console.log(`      - ${room.reason}`);
      console.log('');
    });

    // Hiển thị layout mặc định sẽ được áp dụng
    console.log('\n📐 LAYOUT MẶC ĐỊNH SẼ ĐƯỢC ÁP DỤNG:');
    console.log(`   - Số hàng: ${DEFAULT_LAYOUT.rowLetters.length} (${DEFAULT_LAYOUT.rowLetters.join(', ')})`);
    const totalSeats = Object.values(DEFAULT_LAYOUT.seatsPerRow).reduce((a, b) => a + b, 0);
    console.log(`   - Tổng số ghế: ${totalSeats}`);
    console.log(`   - Hàng có ghế VIP: ${DEFAULT_LAYOUT.rowsWithMiddleSeats.join(', ')}\n`);

    // Xác nhận
    console.log(`⚠️  Bạn sắp thiết lập layout mặc định cho ${roomsNeedingLayout.length} phòng!`);
    const confirm = await question('Bạn có muốn tiếp tục? (yes/no): ');

    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      console.log('\n❌ Đã hủy thao tác.');
      await connection.end();
      rl.close();
      return;
    }

    // Thiết lập layout
    console.log('\n🔧 Đang thiết lập layout...\n');
    let successCount = 0;
    let errorCount = 0;

    const layoutJson = JSON.stringify(DEFAULT_LAYOUT);

    for (const room of roomsNeedingLayout) {
      try {
        await connection.execute(
          'UPDATE rooms SET layout_config = ? WHERE id = ?',
          [layoutJson, room.id]
        );
        console.log(`✅ Đã thiết lập layout cho phòng ID ${room.id} (${room.name || 'N/A'})`);
        successCount++;
      } catch (error) {
        console.error(`❌ Lỗi khi thiết lập layout cho phòng ID ${room.id}:`, error.message);
        errorCount++;
      }
    }

    // Kết quả
    console.log('\n📊 KẾT QUẢ:');
    console.log(`✅ Đã thiết lập thành công: ${successCount} phòng`);
    if (errorCount > 0) {
      console.log(`❌ Lỗi: ${errorCount} phòng`);
    }
    console.log(`✅ Tổng cộng: ${roomsWithValidLayout.length + successCount} phòng có layout hợp lệ\n`);

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

