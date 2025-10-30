import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Map, Upload, LayoutDashboard, LogIn, Mountain, Menu, X, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { showSuccess } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    showSuccess('Logged out successfully');
    navigate('/');
    setUserMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="aurora-header shadow-2xl relative z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-3 text-frost-white hover:text-aurora-teal transition-all duration-200 group"
          >
            <img
              src="/logo-primary.svg"
              alt="FrozenShield"
              className="h-8 w-8 group-hover:scale-110 transition-transform"
            />
            <span className="font-display text-xl font-bold text-shadow-aurora hidden sm:block">
              FrozenShield
            </span>
            <span className="text-xs font-medium text-aurora-teal bg-aurora-teal/10 px-2 py-0.5 rounded-full hidden lg:inline">
              FZS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/" icon={Map} label="Map" active={isActive('/')} />
            <NavLink to="/trip-planner" icon={Mountain} label="Plan Trip" active={isActive('/trip-planner')} />
            <NavLink to="/my-trips" icon={LayoutDashboard} label="My Trips" active={isActive('/my-trips')} />
            <NavLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" active={isActive('/dashboard')} />
            <NavLink to="/upload" icon={Upload} label="Upload Track" active={isActive('/upload')} />

            {isAuthenticated ? (
              <div className="relative ml-2">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-button bg-frost-white/10 hover:bg-frost-white/20 transition-all duration-200 touch-target"
                >
                  <div className="w-8 h-8 rounded-full bg-aurora-teal flex items-center justify-center">
                    <User size={18} className="text-frost-white" />
                  </div>
                  <span className="text-frost-white font-medium">{user?.username}</span>
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-midnight-navy border border-arctic-ice/20 rounded-card shadow-elevation-3 py-2 z-20 animate-fadeIn">
                      <div className="px-4 py-3 border-b border-arctic-ice/20">
                        <p className="text-sm text-stone-grey">Signed in as</p>
                        <p className="text-frost-white font-semibold truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        className="flex items-center space-x-2 px-4 py-2 text-frost-white hover:bg-aurora-teal/10 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings size={18} />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-safety-critical hover:bg-safety-critical/10 transition-colors"
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <NavLink to="/login" icon={LogIn} label="Login" active={isActive('/login')} />
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-frost-white p-2 hover:bg-aurora-teal/10 rounded-button transition-colors touch-target"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 animate-slideUp">
            <div className="flex flex-col space-y-2">
              <NavLink to="/" icon={Map} label="Map" active={isActive('/')} mobile onClick={closeMobileMenu} />
              <NavLink to="/trip-planner" icon={Mountain} label="Plan Trip" active={isActive('/trip-planner')} mobile onClick={closeMobileMenu} />
              <NavLink to="/my-trips" icon={LayoutDashboard} label="My Trips" active={isActive('/my-trips')} mobile onClick={closeMobileMenu} />
              <NavLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" active={isActive('/dashboard')} mobile onClick={closeMobileMenu} />
              <NavLink to="/upload" icon={Upload} label="Upload Track" active={isActive('/upload')} mobile onClick={closeMobileMenu} />

              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 text-stone-grey text-sm border-t border-frost-white/10 mt-2">
                    Signed in as <span className="text-frost-white font-semibold">{user?.username}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className="flex items-center space-x-3 px-4 py-3 rounded-button text-safety-critical hover:bg-safety-critical/10 transition-all duration-200"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <NavLink to="/login" icon={LogIn} label="Login" active={isActive('/login')} mobile onClick={closeMobileMenu} />
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const NavLink = ({ to, icon: Icon, label, active, mobile, onClick }) => {
  const baseClasses = mobile
    ? "flex items-center space-x-3 px-4 py-3 rounded-button transition-all duration-200"
    : "flex items-center space-x-2 px-4 py-2 rounded-button transition-all duration-200 touch-target";

  const activeClasses = active
    ? "bg-aurora-teal/20 text-frost-white font-semibold shadow-aurora"
    : "text-arctic-ice hover:bg-aurora-teal/10 hover:text-aurora-teal hover:scale-105 active:scale-95";

  return (
    <Link to={to} className={`${baseClasses} ${activeClasses}`} onClick={onClick}>
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
};

export default Navigation;
