import React, { lazy } from 'react';

// Client routes - Lazy loaded for better performance
const Home = lazy(() => import('./pages/Home'));
const MovieDetail = lazy(() => import('./components/MovieDetail'));
const PopcornDrink = lazy(() => import('./pages/PopcornDrink'));
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));
const Movies = lazy(() => import('./pages/Movies'));
const MovieShowing = lazy(() => import('./pages/MovieShowing'));
const MovieUpcoming = lazy(() => import('./pages/MovieUpcoming'));
const Promotions = lazy(() => import('./pages/Promotions'));
const Showtimes = lazy(() => import('./pages/Showtimes'));
const CinemaSelection = lazy(() => import('./pages/CinemaSelection'));
const CinemaDetail = lazy(() => import('./pages/CinemaDetail'));
const RoomViewer = lazy(() => import('./components/RoomViewer'));
const Search = lazy(() => import('./pages/Search'));

// Admin routes - Lazy loaded (only load when admin accesses)
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminMovies = lazy(() => import('./pages/admin/AdminMovies'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const AdminRooms = lazy(() => import('./pages/admin/AdminRooms'));
const AdminShowtimes = lazy(() => import('./pages/admin/AdminShowtimes'));
const AdminPromotions = lazy(() => import('./pages/admin/AdminPromotions'));
const AdminCinemas = lazy(() => import('./pages/admin/AdminCinemas'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminRevenue = lazy(() => import('./pages/admin/AdminRevenue'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

export const clientRoutes = [
  { path: '/', element: <Home /> },
  { path: '/movie', element: <Movies /> },
  { path: '/movie/showing', element: <MovieShowing /> },
  { path: '/movie/upcoming', element: <MovieUpcoming /> },
  { path: '/movie/:id', element: <MovieDetail /> },
  { path: '/chuong-trinh-khuyen-mai', element: <Promotions /> },
  { path: '/popcorn-drink', element: <PopcornDrink /> },
  { path: '/showtimes', element: <Showtimes /> },
  { path: '/cinema-selection', element: <CinemaSelection /> },
  { path: '/book-tickets/:cinemaPath', element: <CinemaDetail /> },
  { path: '/search', element: <Search /> },
  { path: '/login', element: <Login /> },
  { path: '/rooms', element: <RoomViewer /> },
  { path: '/profile', element: <Profile /> },
  // Profile routes - Profile component will normalize URLs with trailing slash
  { path: '/account/account-profile', element: <Profile /> },
  { path: '/account/account-member', element: <Profile /> },
  { path: '/account/account-history', element: <Profile /> },
];

export const adminRoutes = [
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'movies', element: <AdminMovies /> },
      { path: 'bookings', element: <AdminBookings /> },
      { path: 'showtimes', element: <AdminShowtimes /> },
      { path: 'promotions', element: <AdminPromotions /> },
      { path: 'cinemas', element: <AdminCinemas /> },
      { path: 'rooms', element: <AdminRooms /> },
      { path: 'products', element: <AdminProducts /> },
      { path: 'revenue', element: <AdminRevenue /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'settings', element: <AdminSettings /> },
    ],
  },
];

