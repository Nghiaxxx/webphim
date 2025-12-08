import React, { useState, useEffect } from 'react';
import { publicAPI } from '../../services/api';

const PopcornDrinkSelection = ({ productQuantities, onQuantityChange }) => {
  const [combos, setCombos] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const [bottledDrinks, setBottledDrinks] = useState([]);
  const [snacks, setSnacks] = useState([]);
  const [pocas, setPocas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const [combosData, drinksData, bottledData, snacksData, pocasData] = await Promise.all([
          publicAPI.products.getAll('combo'),
          publicAPI.products.getAll('drink'),
          publicAPI.products.getAll('bottled_drink'),
          publicAPI.products.getAll('snack'),
          publicAPI.products.getAll('poca')
        ]);

        setCombos(Array.isArray(combosData) ? combosData : []);
        setDrinks(Array.isArray(drinksData) ? drinksData : []);
        setBottledDrinks(Array.isArray(bottledData) ? bottledData : []);
        setSnacks(Array.isArray(snacksData) ? snacksData : []);
        setPocas(Array.isArray(pocasData) ? pocasData : []);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu sản phẩm:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleQuantityChange = (productId, delta) => {
    onQuantityChange(productId, delta);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  // Render product card component - giống như PopcornDrink page
  const renderProductCard = (product, cardType = 'drink') => {
    const isCombo = cardType === 'combo';
    const quantity = productQuantities[product.id] || 0;
    
    return (
      <div key={product.id} className={isCombo ? `combo-card ${product.is_featured ? 'featured' : ''}` : 'drink-card'}>
        <div className={isCombo ? 'combo-image' : 'drink-image'}>
          <img src={product.image_url} alt={product.name} />
        </div>
        <div className={isCombo ? 'combo-details' : 'drink-info'}>
          <h3 className={isCombo ? `combo-name ${product.is_featured ? 'featured-text' : ''}` : 'drink-name'}>
            {product.name}
          </h3>
          {isCombo && product.description && (
            <p className="combo-description" style={{ whiteSpace: 'pre-line' }}>
              {product.description} {product.details}
            </p>
          )}
          <p className={isCombo ? 'combo-price' : 'drink-price'}>{formatPrice(product.price)}VND</p>
          <div className="quantity-selector">
            <button
              className="quantity-btn minus"
              onClick={() => handleQuantityChange(product.id, -1)}
              disabled={quantity === 0}
            >
              -
            </button>
            <span className="quantity-display">{quantity}</span>
            <button
              className="quantity-btn plus"
              onClick={() => handleQuantityChange(product.id, 1)}
            >
              +
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render product section - giống như PopcornDrink page
  const renderProductSection = (title, products, cardType = 'drink') => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
          Đang tải...
        </div>
      );
    }
    
    if (products.length === 0) {
      return null; // Don't show section if no products
    }

    return (
      <section className={cardType === 'combo' ? 'combos-section' : 'drinks-section'}>
        <h2 className="section-title">{title}</h2>
        <div className={cardType === 'combo' ? 'combos-grid' : 'drinks-grid'}>
          {products.map(product => renderProductCard(product, cardType))}
        </div>
      </section>
    );
  };

  return (
    <div className="food-items-section">
      <h2 className="section-title">CHỌN BẮP NƯỚC</h2>
      {/* All Product Sections */}
      {renderProductSection('COMBO 2 NGĂN', combos, 'combo')}
      {renderProductSection('NƯỚC NGỌT', drinks, 'drink')}
      {renderProductSection('NƯỚC ĐÓNG CHAI', bottledDrinks, 'drink')}
      {renderProductSection('SNACKS - KẸO', snacks, 'drink')}
      {renderProductSection('POCA', pocas, 'drink')}
    </div>
  );
};

export default PopcornDrinkSelection;

