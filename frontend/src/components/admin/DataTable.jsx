import { useState } from 'react';
import '../../styles/admin/DataTable.css';

const DataTable = ({ 
  columns, 
  data, 
  onEdit, 
  onDelete, 
  onView,
  searchable = true,
  title 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filter data based on search
  const filteredData = data.filter(item =>
    columns.some(col => {
      const value = item[col.key];
      return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    })
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="data-table-container">
      <div className="table-header">
        <h2 className="table-title">{title}</h2>
        {searchable && (
          <div className="table-search">
            <span className="search-icon"><i className="fa-solid fa-magnifying-glass"></i></span>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        )}
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} style={{ width: col.width }}>
                  {col.label}
                </th>
              ))}
              <th style={{ width: '120px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item, idx) => (
                <tr key={idx}>
                  {columns.map((col, colIdx) => (
                    <td key={colIdx}>
                      {col.render ? col.render(item[col.key], item) : item[col.key]}
                    </td>
                  ))}
                  <td>
                    <div className="action-buttons">
                      {onView && (
                        <button 
                          className="action-btn view-btn"
                          onClick={() => onView(item)}
                          title="Xem"
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>
                      )}
                      {onEdit && (
                        <button 
                          className="action-btn edit-btn"
                          onClick={() => onEdit(item)}
                          title="Sửa"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => onDelete(item)}
                          title="Xóa"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="no-data">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-pagination">
        <div className="pagination-info">
          Hiển thị {filteredData.length > 0 ? indexOfFirstItem + 1 : 0} - {Math.min(indexOfLastItem, filteredData.length)} 
          {' '}trong tổng số {filteredData.length}
        </div>
        {totalPages > 1 && (
          <div className="pagination-buttons">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="page-btn"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`page-btn ${currentPage === idx + 1 ? 'active' : ''}`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="page-btn"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;

