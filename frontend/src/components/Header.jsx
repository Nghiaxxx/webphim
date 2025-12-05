import React, { useState, useMemo, useCallback } from 'react';
import { publicAPI } from '../services/api';
import useApiCache from '../hooks/useApiCache';
import MobileHeader from './header/MobileHeader';
import MobileSidebar from './header/MobileSidebar';
import DesktopHeader from './header/DesktopHeader';

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Cache cinemas API call with 15 minutes TTL (cinemas rarely change)
  const { data: cinemasData } = useApiCache(
    (signal) => publicAPI.cinemas.getAll(signal),
    ['cinemas', 'all'],
    { ttl: 15 * 60 * 1000 } // 15 minutes
  );

  const cinemas = useMemo(() => {
    return Array.isArray(cinemasData) ? cinemasData : [];
  }, [cinemasData]);

  const handleMenuToggle = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const handleMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <div className="header-wrapper">
      <MobileHeader 
        cinemas={cinemas}
        onMenuToggle={handleMenuToggle}
        isMenuOpen={isMobileMenuOpen}
      />
      <MobileSidebar 
        isOpen={isMobileMenuOpen}
        onClose={handleMenuClose}
        cinemas={cinemas}
      />
      <DesktopHeader cinemas={cinemas} />
    </div>
  );
}

export default React.memo(Header);

