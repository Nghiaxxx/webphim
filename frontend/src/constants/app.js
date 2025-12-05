// App Constants
export const APP_CONFIG = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  
  // Booking Configuration
  BOOKING: {
    TIMER_SECONDS: 300, // 5 minutes
    TICKET_PRICES: {
      ADULT_SINGLE: 45000,
      STUDENT_SINGLE: 45000,
      SENIOR_SINGLE: 45000,
      ADULT_DOUBLE: 100000,
    },
  },
  
  // Image URLs
  IMAGES: {
    LOGO: 'https://cinestar.com.vn/_next/image/?url=%2Fassets%2Fimages%2Fheader-logo.png&w=1920&q=75',
    IC_TICKET: 'https://cinestar.com.vn/assets/images/ic-ticket.svg',
    IC_COR: 'https://cinestar.com.vn/assets/images/ic-cor.svg',
    IC_HEADER_AUTH: 'https://cinestar.com.vn/assets/images/ic-header-auth.svg',
    IC_USER_CIRCLE: 'https://cinestar.com.vn/assets/images/ic-user-circle.svg',
    IC_ACC_MENU_2: 'https://cinestar.com.vn/assets/images/acc-menu-2.svg',
    IC_ACC_MENU_3: 'https://cinestar.com.vn/assets/images/acc-menu-3.svg',
    IC_TAG: 'https://cinestar.com.vn/assets/images/icon-tag.svg',
    IC_CLOCK: 'https://cinestar.com.vn/assets/images/icon-clock.svg',
    IC_PLAY_VID: 'https://cinestar.com.vn/assets/images/icon-play-vid.svg',
    SUBTITLE: 'https://cinestar.com.vn/assets/images/subtitle.svg',
    FOOTER_VIETNAM: 'https://cinestar.com.vn/assets/images/footer-vietnam.svg',
    FOOTER_AMERICA: 'https://cinestar.com.vn/_next/image/?url=%2Fassets%2Fimages%2Ffooter-america.webp&w=48&q=75',
    LOYALTY_PROGRAM: 'https://cinestar.com.vn/_next/image/?url=%2Fassets%2Fimages%2FLoyalty_Program.webp&w=2048&q=75',
  },
  
  // Member Program
  MEMBER: {
    MAX_POINTS: 10000,
    DEFAULT_POINTS: 446,
  },
  
  // Date Format
  DATE_FORMAT: {
    DISPLAY: 'DD/MM/YYYY',
    INPUT: 'YYYY-MM-DD',
  },
};

