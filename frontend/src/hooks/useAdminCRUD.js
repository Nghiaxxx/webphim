import { useState, useEffect } from 'react';

/**
 * Custom hook for admin CRUD operations
 * @param {Object} api - API object with getAll, getById, create, update, delete methods
 * @param {Function} transformFn - Function to transform data for display
 * @param {Function} initialFormData - Function to return initial form data
 */
export const useAdminCRUD = (api, transformFn, initialFormData) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(initialFormData ? initialFormData() : {});

  // Fetch items
  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAll();
      const transformed = transformFn ? data.map(transformFn) : data;
      setItems(transformed);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError(err.message || 'Không thể tải dữ liệu');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Handle edit
  const handleEdit = async (item) => {
    try {
      setError(null);
      const itemData = await api.getById(item.id);
      setFormData(itemData);
      setEditingItem(item);
      setShowModal(true);
    } catch (err) {
      console.error('Error fetching item:', err);
      setError(err.message || 'Không thể tải thông tin');
    }
  };

  // Handle add
  const handleAdd = () => {
    setFormData(initialFormData ? initialFormData() : {});
    setEditingItem(null);
    setShowModal(true);
  };

  // Handle save
  const handleSave = async () => {
    try {
      setError(null);
      if (editingItem) {
        await api.update(editingItem.id, formData);
      } else {
        await api.create(formData);
      }
      setShowModal(false);
      await fetchItems();
    } catch (err) {
      console.error('Error saving item:', err);
      setError(err.message || 'Có lỗi xảy ra khi lưu');
    }
  };

  // Handle delete
  const handleDelete = async (item) => {
    if (window.confirm(`Bạn có chắc muốn xóa "${item.title || item.name || item.id}"?`)) {
      try {
        setError(null);
        await api.delete(item.id);
        setItems(items.filter(i => i.id !== item.id));
      } catch (err) {
        console.error('Error deleting item:', err);
        setError(err.message || 'Không thể xóa. Vui lòng thử lại.');
      }
    }
  };

  return {
    items,
    loading,
    error,
    showModal,
    editingItem,
    formData,
    setFormData,
    setShowModal,
    setError,
    fetchItems,
    handleEdit,
    handleAdd,
    handleSave,
    handleDelete,
  };
};

