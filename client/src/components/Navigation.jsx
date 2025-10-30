import { Link, useLocation } from 'react-router-dom';
import { Map, Upload, LayoutDashboard, LogIn, Mountain } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="aurora-header shadow-2xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 text-ice-white hover:text-tundra-gold transition-colors">
            <div className="icon-container">
              <Mountain size={24} className="text-ice-white" />
            </div>
            <span className="font-display text-xl font-bold text-shadow-aurora">
              True North Navigator
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/" icon={Map} label="Map" active={isActive('/')} />
            <NavLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" active={isActive('/dashboard')} />
            <NavLink to="/upload" icon={Upload} label="Upload Track" active={isActive('/upload')} />
            <NavLink to="/login" icon={LogIn} label="Login" active={isActive('/login')} />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center">
            <button className="text-ice-white p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden pb-4">
          <div className="flex flex-col space-y-2">
            <NavLink to="/" icon={Map} label="Map" active={isActive('/')} mobile />
            <NavLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" active={isActive('/dashboard')} mobile />
            <NavLink to="/upload" icon={Upload} label="Upload Track" active={isActive('/upload')} mobile />
            <NavLink to="/login" icon={LogIn} label="Login" active={isActive('/login')} mobile />
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, icon: Icon, label, active, mobile }) => {
  const baseClasses = mobile
    ? "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200"
    : "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 touch-target";

  const activeClasses = active
    ? "bg-ice-white/20 text-ice-white font-semibold"
    : "text-ice-blue hover:bg-ice-white/10 hover:text-ice-white";

  return (
    <Link to={to} className={`${baseClasses} ${activeClasses}`}>
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
};

export default Navigation;
