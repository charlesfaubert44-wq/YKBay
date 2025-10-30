import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mountain, LogIn, UserPlus, Mail, Lock, User, Ship } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const Login = () => {
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    vesselType: 'aluminum-boat',
    vesselDraft: ''
  });
  const [errors, setErrors] = useState({});

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/dashboard');
  }

  const validateForm = () => {
    const newErrors = {};

    if (!isLogin && !formData.username) {
      newErrors.username = 'Username is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password);

        if (result.success) {
          showSuccess(`Welcome back, ${result.user.username}!`);
          navigate('/dashboard');
        } else {
          showError(result.error || 'Login failed');
        }
      } else {
        const userData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          vesselType: formData.vesselType || null,
          vesselDraft: formData.vesselDraft ? parseFloat(formData.vesselDraft) : null,
        };

        const result = await register(userData);

        if (result.success) {
          showSuccess(`Welcome aboard, ${result.user.username}!`);
          navigate('/dashboard');
        } else {
          showError(result.error || 'Registration failed');
        }
      }
    } catch (error) {
      showError('An unexpected error occurred. Please try again.');
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleGuestAccess = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full animate-fadeIn">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="icon-container mx-auto mb-4 w-16 h-16 hover:scale-110 transition-transform">
            <Mountain size={32} className="text-ice-white" />
          </div>
          <h1 className="text-4xl font-display font-bold text-ice-white mb-2 text-shadow-aurora">
            True North Navigator
          </h1>
          <p className="text-ice-blue text-lg">
            Safe navigation through Great Slave Lake
          </p>
        </div>

        {/* Form Card */}
        <Card variant="elevated" className="animate-slideUp">
          {/* Toggle Tabs */}
          <div className="flex mb-6 bg-midnight-dark rounded-lg p-1">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setErrors({});
              }}
              className={`flex-1 py-3 rounded-md font-semibold transition-all duration-200 ${
                isLogin
                  ? 'bg-gradient-to-r from-aurora-green to-forest-green text-ice-white shadow-md'
                  : 'text-ice-blue hover:text-ice-white hover:bg-ice-white/5'
              }`}
            >
              <LogIn size={18} className="inline mr-2" />
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setErrors({});
              }}
              className={`flex-1 py-3 rounded-md font-semibold transition-all duration-200 ${
                !isLogin
                  ? 'bg-gradient-to-r from-aurora-green to-forest-green text-ice-white shadow-md'
                  : 'text-ice-blue hover:text-ice-white hover:bg-ice-white/5'
              }`}
            >
              <UserPlus size={18} className="inline mr-2" />
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username (Register only) */}
            {!isLogin && (
              <Input
                label="Username"
                type="text"
                placeholder="Choose a username"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                leftIcon={<User size={18} />}
                error={errors.username}
                fullWidth
                required
              />
            )}

            {/* Email */}
            <Input
              label="Email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              leftIcon={<Mail size={18} />}
              error={errors.email}
              fullWidth
              required
            />

            {/* Password */}
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              leftIcon={<Lock size={18} />}
              error={errors.password}
              helperText={!isLogin ? "Minimum 6 characters" : ""}
              fullWidth
              required
            />

            {/* Vessel Information (Register only) */}
            {!isLogin && (
              <>
                <div className="aurora-divider my-6"></div>
                <h3 className="text-sm font-semibold text-ice-white mb-4 flex items-center gap-2">
                  <Ship size={18} className="text-aurora-blue" />
                  Vessel Information (Optional)
                </h3>

                <div>
                  <label className="block text-sm font-semibold text-ice-blue mb-2">
                    Vessel Type
                  </label>
                  <select
                    value={formData.vesselType}
                    onChange={(e) => handleChange('vesselType', e.target.value)}
                    className="input-northern"
                  >
                    <option value="aluminum-boat">Aluminum Boat</option>
                    <option value="canoe">Canoe</option>
                    <option value="kayak">Kayak</option>
                    <option value="yacht">Yacht</option>
                    <option value="fishing-boat">Fishing Boat</option>
                    <option value="houseboat">Houseboat</option>
                  </select>
                </div>

                <Input
                  label="Vessel Draft (meters)"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 0.6"
                  value={formData.vesselDraft}
                  onChange={(e) => handleChange('vesselDraft', e.target.value)}
                  helperText="The depth of your vessel below the waterline"
                  fullWidth
                />
              </>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="aurora"
              size="lg"
              fullWidth
              loading={loading}
              className="mt-6"
            >
              {isLogin ? (
                <>
                  <LogIn size={20} className="inline mr-2" />
                  Login to Dashboard
                </>
              ) : (
                <>
                  <UserPlus size={20} className="inline mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          {/* Forgot Password (Login only) */}
          {isLogin && (
            <div className="text-center mt-6">
              <a
                href="#"
                className="text-sm text-aurora-blue hover:text-aurora-purple transition-colors duration-200 font-medium"
              >
                Forgot your password?
              </a>
            </div>
          )}
        </Card>

        {/* Guest Access */}
        <div className="text-center mt-6 animate-slideUp" style={{ animationDelay: '0.1s' }}>
          <p className="text-ice-blue text-sm mb-3">Want to explore first?</p>
          <Button
            variant="ghost"
            onClick={handleGuestAccess}
            disabled={loading}
          >
            Continue as Guest
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
