import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';
import { publicAPI } from '../services/api';

function PopcornDrink() {
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [cinemas, setCinemas] = useState([]);
  const [combos, setCombos] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const [bottledDrinks, setBottledDrinks] = useState([]);
  const [snacks, setSnacks] = useState([]);
  const [pocas, setPocas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState({});
  const { language } = useLanguage();
  const t = (key) => getTranslation(key, language);

  // Fetch cinemas
  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const data = await publicAPI.cinemas.getAll();
        setCinemas(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu rạp phim:', error);
        setCinemas([]);
      }
    };
    fetchCinemas();
  }, []);

  // Fetch products when cinema is selected
  useEffect(() => {
    if (selectedCinema) {
      const fetchProducts = async () => {
        setLoading(true);
        try {
          // Fetch all product types
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
    } else {
      // Reset products when no cinema selected
      setCombos([]);
      setDrinks([]);
      setBottledDrinks([]);
      setSnacks([]);
      setPocas([]);
      setQuantities({});
    }
  }, [selectedCinema]);

  const handleQuantityChange = (itemId, delta) => {
    setQuantities(prev => {
      const current = prev[itemId] || 0;
      const newQuantity = Math.max(0, current + delta);
      return {
        ...prev,
        [itemId]: newQuantity
      };
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  // Render product card component
  const renderProductCard = (product, cardType = 'drink') => {
    const isCombo = cardType === 'combo';
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
            >
              -
            </button>
            <span className="quantity-display">{quantities[product.id] || 0}</span>
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

  // Get all products from all categories
  const getAllProducts = () => {
    return [
      ...combos.map(p => ({ ...p, category: 'combo' })),
      ...drinks.map(p => ({ ...p, category: 'drink' })),
      ...bottledDrinks.map(p => ({ ...p, category: 'bottled_drink' })),
      ...snacks.map(p => ({ ...p, category: 'snack' })),
      ...pocas.map(p => ({ ...p, category: 'poca' }))
    ];
  };

  // Get selected items with quantities
  const getSelectedItems = () => {
    const allProducts = getAllProducts();
    return allProducts
      .filter(product => quantities[product.id] > 0)
      .map(product => ({
        ...product,
        quantity: quantities[product.id]
      }));
  };

  // Calculate total price
  const calculateTotal = () => {
    const selectedItems = getSelectedItems();
    return selectedItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  // Render product section
  const renderProductSection = (title, products, cardType = 'drink') => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
          {t('home.loading')}
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

  // Render order summary as sticky footer
  const renderOrderSummary = () => {
    const selectedItems = getSelectedItems();
    const total = calculateTotal();

    if (selectedItems.length === 0 || !selectedCinema) {
      return null;
    }

    // Format cinema name with city
    const cinemaDisplayName = selectedCinema.city 
      ? `${selectedCinema.name.toUpperCase()} (${selectedCinema.city})`
      : selectedCinema.name.toUpperCase();

    return (
      <div className="popcorn-drink-sticky-footer">
        <div className="popcorn-drink-footer-content">
          <div className="popcorn-drink-footer-left">
            <div className="popcorn-drink-cinema-name">{cinemaDisplayName}</div>
            <div className="popcorn-drink-items-list">
              {selectedItems.map((item, index) => (
                <span key={item.id} className="popcorn-drink-item">
                  <span className="popcorn-drink-item-text">{item.quantity} {item.name}</span>
                  {index < selectedItems.length - 1 && <span className="popcorn-drink-separator"> | </span>}
                </span>
              ))}
            </div>
          </div>
          <div className="popcorn-drink-footer-right">
            <div className="popcorn-drink-total-section">
              <span className="popcorn-drink-total-label">{t('popcornDrink.subtotal') || 'Tạm tính'}</span>
              <span className="popcorn-drink-total-amount">{formatPrice(total)} VND</span>
            </div>
            <button className="popcorn-drink-checkout-btn">
              {t('popcornDrink.checkout') || 'THANH TOÁN'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-root">
      <Header />
      
      <main className="popcorn-drink-main">
        {/* Cinema Selection - Always visible */}
        <div className="cinema-selection-section">
          <h1 className="cinema-selection-title">{t('popcornDrink.selectCinemaNearYou')}</h1>
          <div className="cinema-selector-wrapper">
            <select
              className="cinema-selector"
              value={selectedCinema ? selectedCinema.id : ''}
              onChange={(e) => {
                const cinemaId = e.target.value;
                if (cinemaId) {
                  const cinema = cinemas.find(c => c.id === parseInt(cinemaId));
                  setSelectedCinema(cinema);
                } else {
                  setSelectedCinema(null);
                }
              }}
            >
              <option value="">{t('popcornDrink.selectCinema')}</option>
              {cinemas.map((cinema) => (
                <option key={cinema.id} value={cinema.id}>
                  {cinema.name} {cinema.address ? `(${cinema.address})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Food Items Section - Only show when cinema is selected */}
        {selectedCinema && (
          <div className="food-items-section">

            {/* All Product Sections */}
            {renderProductSection(t('popcornDrink.combo2Compartments'), combos, 'combo')}
            {renderProductSection(t('popcornDrink.softDrinks'), drinks, 'drink')}
            {renderProductSection(t('popcornDrink.bottledDrinks'), bottledDrinks, 'drink')}
            {renderProductSection(t('popcornDrink.snacks'), snacks, 'drink')}
            {renderProductSection(t('popcornDrink.poca'), pocas, 'drink')}
          </div>
        )}

        {/* Order Summary Sticky Footer */}
        {renderOrderSummary()}
      </main>

      <Footer />
    </div>
  );
}

export default PopcornDrink;
