import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingBag, 
  ShoppingCart,
  LogOut, 
  User, 
  LogIn, 
  UserPlus, 
  Menu, 
  X, 
  Sparkles,
  ShieldCheck,
  Heart,
  ClipboardList
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setIsLoggingOut(false);
      setMobileMenuOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link 
            to={isAuthenticated ? "/home" : "/login"} 
            className="flex items-center gap-2.5 group focus:outline-hidden"
          >
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white shadow-md shadow-indigo-500/25 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
                Shop<span className="text-indigo-600">Kart</span>
                <span className="inline-flex items-center px-1.5 py-0.2 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200/60">
                  Store
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/home"
                  className={`text-sm font-semibold transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                    isActive('/home')
                      ? 'text-indigo-600 bg-indigo-50/80 font-bold'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  Dashboard
                </Link>

                <Link
                  to="/products"
                  id="nav-products-link"
                  className={`text-sm font-semibold transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                    isActive('/products') || location.pathname.startsWith('/products/')
                      ? 'text-indigo-600 bg-indigo-50/80 font-bold'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 text-indigo-500" />
                  Products
                </Link>

                <Link
                  to="/wishlist"
                  id="nav-wishlist-link"
                  className={`text-sm font-semibold transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                    isActive('/wishlist')
                      ? 'text-rose-600 bg-rose-50/80 font-bold'
                      : 'text-slate-600 hover:text-rose-600 hover:bg-slate-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 text-rose-500 ${wishlistCount > 0 ? 'fill-rose-500' : ''}`} />
                  <span>Wishlist</span>
                  {wishlistCount > 0 && (
                    <span id="nav-wishlist-count" className="inline-flex items-center justify-center px-1.5 py-0.2 text-[11px] font-extrabold bg-rose-100 text-rose-700 rounded-full border border-rose-200">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/cart"
                  id="nav-cart-link"
                  className={`text-sm font-semibold transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                    isActive('/cart')
                      ? 'text-indigo-600 bg-indigo-50/80 font-bold'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 text-indigo-500" />
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span id="nav-cart-count" className="inline-flex items-center justify-center px-1.5 py-0.2 text-[11px] font-extrabold bg-indigo-100 text-indigo-700 rounded-full border border-indigo-200">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/orders"
                  id="nav-orders-link"
                  className={`text-sm font-semibold transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                    isActive('/orders')
                      ? 'text-violet-600 bg-violet-50/80 font-bold'
                      : 'text-slate-600 hover:text-violet-600 hover:bg-slate-50'
                  }`}
                >
                  <ClipboardList className="w-4 h-4 text-violet-500" />
                  <span>My Orders</span>
                </Link>

                {/* Logged in User Pill */}
                <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                  <div className="flex items-center gap-2.5 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                      {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-800 leading-tight">
                        {user?.fullName || 'Customer'}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button
                    id="logout-button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer"
                    title="Log out of ShopKart"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/products"
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    isActive('/products')
                      ? 'text-indigo-600 bg-indigo-50 font-bold'
                      : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 text-indigo-500" />
                  Products
                </Link>

                <Link
                  to="/login"
                  id="nav-login-link"
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    isActive('/login')
                      ? 'text-indigo-600 bg-indigo-50 font-bold'
                      : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>

                <Link
                  to="/register"
                  id="nav-register-link"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white gradient-brand hover:opacity-95 shadow-md shadow-indigo-500/20 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 animate-fade-in shadow-xl">
          {isAuthenticated ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-sm">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{user?.fullName}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>

              <Link
                to="/home"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg"
              >
                <Sparkles className="w-4 h-4" />
                Home Dashboard
              </Link>

              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg"
              >
                <ShoppingBag className="w-4 h-4" />
                Explore Products
              </Link>

              <Link
                to="/wishlist"
                id="mobile-nav-wishlist-link"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-600 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Heart className={`w-4 h-4 text-rose-500 ${wishlistCount > 0 ? 'fill-rose-500' : ''}`} />
                  <span>Wishlist</span>
                </div>
                {wishlistCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold bg-rose-100 text-rose-700 rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                id="mobile-nav-cart-link"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-indigo-500" />
                  <span>Cart</span>
                </div>
                {cartCount > 0 && (
                  <span id="mobile-nav-cart-count" className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold bg-indigo-100 text-indigo-700 rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>

              <Link
                to="/orders"
                id="mobile-nav-orders-link"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-600 rounded-lg"
              >
                <ClipboardList className="w-4 h-4 text-violet-500" />
                <span>My Orders</span>
              </Link>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                Explore Products
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white gradient-brand rounded-lg shadow-md transition-all"
              >
                <UserPlus className="w-4 h-4" />
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
