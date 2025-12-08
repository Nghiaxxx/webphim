import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import './RoomLayoutEditor.css';

const GRID_ROWS = 20; // Số hàng trong grid
const GRID_COLS = 20; // Số cột trong grid

const RoomLayoutEditor = ({ initialLayout, onLayoutChange }) => {
  // Convert từ format rowLetters sang grid format
  const convertToGrid = useCallback((layout) => {
    if (!layout || !layout.rowLetters) {
      return { seats: [], gridRows: GRID_ROWS, gridCols: GRID_COLS };
    }

    const seats = [];
    const { rowLetters, seatsPerRow, middleSeats, rowOffsets } = layout;
    
    rowLetters.forEach((rowLetter, rowIndex) => {
      const numSeats = seatsPerRow[rowLetter] || 0;
      // rowOffsets là số ô trống ở đầu hàng (0-based)
      // Cột bắt đầu = số ô trống + 1 (vì gridCol bắt đầu từ 1)
      const emptySpaces = (rowOffsets || {})[rowLetter] || 0;
      const startCol = emptySpaces + 1; // Cột bắt đầu (1-based)
      const isVIPRow = (layout.rowsWithMiddleSeats || []).includes(rowLetter);
      const rowVIPSeats = (middleSeats || {})[rowLetter] || [];

      // Đặt hàng ở giữa grid (rowIndex + offset từ trên)
      const gridRow = rowIndex + 2; // Bắt đầu từ hàng 2 (để có không gian cho màn hình)
      
      // Đặt ghế, bắt đầu từ cột startCol
      for (let i = 0; i < numSeats; i++) {
        const seatNum = numSeats - i; // Đếm từ phải sang trái
        const gridCol = startCol + i;
        const isVIP = rowVIPSeats.includes(seatNum);
        
        seats.push({
          id: `${rowLetter}${String(seatNum).padStart(2, '0')}`,
          rowLetter,
          seatNum,
          gridRow,
          gridCol,
          isVIP
        });
      }
    });

    return { seats, gridRows: GRID_ROWS, gridCols: GRID_COLS };
  }, []);

  // Convert từ grid format sang rowLetters format
  const convertFromGrid = useCallback((gridData) => {
    const { seats } = gridData;
    if (!seats || seats.length === 0) {
      return {
        rowLetters: [],
        seatsPerRow: {},
        middleSeats: {},
        rowsWithMiddleSeats: [],
        rowOffsets: {}
      };
    }

    // Group seats by rowLetter
    const seatsByRow = {};
    seats.forEach(seat => {
      if (!seatsByRow[seat.rowLetter]) {
        seatsByRow[seat.rowLetter] = [];
      }
      seatsByRow[seat.rowLetter].push(seat);
    });

    // Sort rows alphabetically
    const rowLetters = Object.keys(seatsByRow).sort();
    
    const seatsPerRow = {};
    const middleSeats = {};
    const rowsWithMiddleSeats = [];
    const rowOffsets = {};

    rowLetters.forEach(rowLetter => {
      // Sort seats by gridCol (từ trái sang phải)
      const rowSeats = seatsByRow[rowLetter].sort((a, b) => a.gridCol - b.gridCol);
      const minCol = Math.min(...rowSeats.map(s => s.gridCol));
      const maxCol = Math.max(...rowSeats.map(s => s.gridCol));
      
      // rowOffsets là số ô trống ở đầu hàng (0-based), không phải cột bắt đầu (1-based)
      // Nếu ghế bắt đầu ở cột 5, thì có 4 ô trống (5-1)
      rowOffsets[rowLetter] = Math.max(0, minCol - 1);
      
      // Số ghế = số lượng ghế thực tế trong hàng
      seatsPerRow[rowLetter] = rowSeats.length;
      
      // Tìm ghế VIP - sử dụng seatNum thực tế từ grid
      const vipSeats = rowSeats.filter(s => s.isVIP).map(s => s.seatNum).sort((a, b) => a - b);
      if (vipSeats.length > 0) {
        middleSeats[rowLetter] = vipSeats;
        rowsWithMiddleSeats.push(rowLetter);
      }
      
      // Debug log
      console.log(`[convertFromGrid] Row ${rowLetter}:`, {
        minCol,
        maxCol,
        rowOffsets: rowOffsets[rowLetter],
        seatsPerRow: seatsPerRow[rowLetter],
        seats: rowSeats.map(s => ({ id: s.id, gridCol: s.gridCol, seatNum: s.seatNum }))
      });
    });

    return {
      rowLetters,
      seatsPerRow,
      middleSeats,
      rowsWithMiddleSeats,
      rowOffsets
    };
  }, []);

  // Initialize grid data
  const [gridData, setGridData] = useState(() => {
    if (initialLayout) {
      return convertToGrid(initialLayout);
    }
    return { seats: [], gridRows: GRID_ROWS, gridCols: GRID_COLS };
  });

  const [draggedSeat, setDraggedSeat] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState(new Set());
  const [nextRowLetter, setNextRowLetter] = useState('A');
  const [nextSeatNum, setNextSeatNum] = useState(1);
  const [mode, setMode] = useState('add'); // 'add', 'remove', 'move', 'vip'
  const containerRef = useRef(null);
  const onLayoutChangeRef = useRef(onLayoutChange);
  
  // Update ref when onLayoutChange changes
  useEffect(() => {
    onLayoutChangeRef.current = onLayoutChange;
  }, [onLayoutChange]);

  // Update next row letter based on existing seats
  useEffect(() => {
    const usedRows = new Set(gridData.seats.map(s => s.rowLetter));
    let nextRow = 'A';
    while (usedRows.has(nextRow)) {
      nextRow = String.fromCharCode(nextRow.charCodeAt(0) + 1);
    }
    setNextRowLetter(nextRow);
    
    // Find max seat number for next row
    const maxSeatNum = Math.max(...gridData.seats.map(s => s.seatNum), 0);
    setNextSeatNum(maxSeatNum + 1);
  }, [gridData.seats]);

  // Memoize current layout to avoid unnecessary updates
  const currentLayout = useMemo(() => {
    return convertFromGrid(gridData);
  }, [gridData, convertFromGrid]);

  // Update layout when grid changes (only when layout actually changes)
  const prevLayoutRef = useRef(null);
  useEffect(() => {
    // Compare with previous layout to avoid infinite loops
    const layoutStr = JSON.stringify(currentLayout);
    const prevLayoutStr = prevLayoutRef.current ? JSON.stringify(prevLayoutRef.current) : null;
    
    if (layoutStr !== prevLayoutStr && onLayoutChangeRef.current) {
      prevLayoutRef.current = currentLayout;
      onLayoutChangeRef.current(currentLayout);
    }
  }, [currentLayout]);

  // Get seat at grid position
  const getSeatAt = (row, col) => {
    return gridData.seats.find(s => s.gridRow === row && s.gridCol === col);
  };

  // Add seat at position
  const addSeat = (row, col) => {
    const existing = getSeatAt(row, col);
    if (existing) return;

    // Find row letter for this row (use existing or create new)
    let rowLetter = nextRowLetter;
    const seatsInRow = gridData.seats.filter(s => s.gridRow === row);
    if (seatsInRow.length > 0) {
      rowLetter = seatsInRow[0].rowLetter;
    }

    // Find next seat number for this row
    const rowSeats = gridData.seats.filter(s => s.rowLetter === rowLetter);
    const maxSeatNum = Math.max(...rowSeats.map(s => s.seatNum), 0);
    const seatNum = maxSeatNum + 1;

    const newSeat = {
      id: `${rowLetter}${String(seatNum).padStart(2, '0')}`,
      rowLetter,
      seatNum,
      gridRow: row,
      gridCol: col,
      isVIP: false
    };

    setGridData({
      ...gridData,
      seats: [...gridData.seats, newSeat]
    });
  };

  // Remove seat at position
  const removeSeat = (row, col) => {
    setGridData({
      ...gridData,
      seats: gridData.seats.filter(s => !(s.gridRow === row && s.gridCol === col))
    });
  };

  // Toggle VIP for seat
  const toggleVIP = (row, col) => {
    setGridData({
      ...gridData,
      seats: gridData.seats.map(s => 
        s.gridRow === row && s.gridCol === col 
          ? { ...s, isVIP: !s.isVIP }
          : s
      )
    });
  };

  // Handle cell click
  const handleCellClick = (row, col) => {
    const seat = getSeatAt(row, col);
    
    if (mode === 'add' && !seat) {
      addSeat(row, col);
    } else if (mode === 'remove' && seat) {
      removeSeat(row, col);
    } else if (mode === 'vip' && seat) {
      toggleVIP(row, col);
    }
  };

  // Handle drag start
  const handleDragStart = (e, seat) => {
    if (mode !== 'move') return;
    setDraggedSeat(seat);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop
  const handleDrop = (e, targetRow, targetCol) => {
    e.preventDefault();
    if (!draggedSeat || mode !== 'move') return;

    const existing = getSeatAt(targetRow, targetCol);
    if (existing) return; // Cannot drop on existing seat

    // Move seat to new position
    setGridData({
      ...gridData,
      seats: gridData.seats.map(s =>
        s.id === draggedSeat.id
          ? { ...s, gridRow: targetRow, gridCol: targetCol }
          : s
      )
    });

    setDraggedSeat(null);
  };

  // Clear all seats
  const clearAll = () => {
    if (window.confirm('Bạn có chắc muốn xóa tất cả ghế?')) {
      setGridData({ ...gridData, seats: [] });
    }
  };

  // Get statistics
  const totalSeats = gridData.seats.length;
  const vipSeats = gridData.seats.filter(s => s.isVIP).length;
  const usedRows = new Set(gridData.seats.map(s => s.rowLetter)).size;

  return (
    <div className="room-layout-editor" ref={containerRef}>
      <div className="editor-toolbar">
        <div className="toolbar-section">
          <div className="mode-selector">
            <button
              className={`mode-btn ${mode === 'add' ? 'active' : ''}`}
              onClick={() => setMode('add')}
              title="Thêm ghế (Click vào ô trống)"
            >
              <i className="fa-solid fa-plus"></i> Thêm
            </button>
            <button
              className={`mode-btn ${mode === 'remove' ? 'active' : ''}`}
              onClick={() => setMode('remove')}
              title="Xóa ghế (Click vào ghế)"
            >
              <i className="fa-solid fa-trash"></i> Xóa
            </button>
            <button
              className={`mode-btn ${mode === 'move' ? 'active' : ''}`}
              onClick={() => setMode('move')}
              title="Di chuyển ghế (Kéo thả)"
            >
              <i className="fa-solid fa-arrows-up-down-left-right"></i> Di chuyển
            </button>
            <button
              className={`mode-btn ${mode === 'vip' ? 'active' : ''}`}
              onClick={() => setMode('vip')}
              title="Đánh dấu VIP (Click vào ghế)"
            >
              <i className="fa-solid fa-star"></i> VIP
            </button>
          </div>
          <button className="toolbar-btn" onClick={clearAll} title="Xóa tất cả ghế">
            <i className="fa-solid fa-eraser"></i> Xóa tất cả
          </button>
        </div>
        <div className="toolbar-section">
          <div className="editor-stats">
            <span>Số hàng: {usedRows}</span>
            <span>Tổng ghế: {totalSeats}</span>
            <span>Ghế VIP: {vipSeats}</span>
          </div>
        </div>
        <div className="toolbar-hint">
          <small>
            {mode === 'add' && '💡 Click vào ô trống để thêm ghế'}
            {mode === 'remove' && '💡 Click vào ghế để xóa'}
            {mode === 'move' && '💡 Kéo thả ghế để di chuyển'}
            {mode === 'vip' && '💡 Click vào ghế để đánh dấu/bỏ đánh dấu VIP'}
          </small>
        </div>
      </div>

      <div className="editor-screen">
        <div className="screen-label">MÀN HÌNH</div>
      </div>

      <div className="editor-grid-container">
        <div className="editor-grid" onDragOver={handleDragOver}>
          {Array.from({ length: gridData.gridRows }).map((_, rowIndex) => {
            const row = rowIndex + 1;
            return (
              <div key={row} className="editor-grid-row">
                {Array.from({ length: gridData.gridCols }).map((_, colIndex) => {
                  const col = colIndex + 1;
                  const seat = getSeatAt(row, col);
                  const isHovered = hoveredCell?.row === row && hoveredCell?.col === col;
                  const isEmpty = !seat;
                  
                  return (
                    <div
                      key={`${row}-${col}`}
                      className={`editor-grid-cell ${isEmpty ? 'empty' : 'has-seat'} ${isHovered ? 'hovered' : ''} ${seat?.isVIP ? 'seat-vip' : ''}`}
                      onClick={() => handleCellClick(row, col)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, row, col)}
                      onMouseEnter={() => setHoveredCell({ row, col })}
                      onMouseLeave={() => setHoveredCell(null)}
                      draggable={seat && mode === 'move'}
                      onDragStart={seat && mode === 'move' ? (e) => handleDragStart(e, seat) : undefined}
                      title={seat ? `${seat.id}${seat.isVIP ? ' (VIP)' : ''}` : `Row ${row}, Col ${col}`}
                    >
                      {seat && (
                        <>
                          <span className="seat-id">{seat.id}</span>
                          {seat.isVIP && <span className="vip-badge">★</span>}
                        </>
                      )}
                      {isEmpty && mode === 'add' && isHovered && (
                        <span className="add-hint">+</span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="editor-legend">
        <div className="legend-item">
          <div className="legend-seat"></div>
          <span>Ô trống</span>
        </div>
        <div className="legend-item">
          <div className="legend-seat has-seat"></div>
          <span>Ghế thường</span>
        </div>
        <div className="legend-item">
          <div className="legend-seat seat-vip"></div>
          <span>Ghế VIP</span>
        </div>
      </div>
    </div>
  );
};

export default RoomLayoutEditor;
