import { useState } from 'react';
import { Mountain, LogIn, UserPlus } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    vesselType: 'aluminum-boat',
    vesselDraft: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login/register logic
    console.log('Form submitted:', formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="icon-container mx-auto mb-4 w-16 h-16">
            <Mountain size={32} className="text-ice-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-ice-white mb-2 text-shadow-aurora">
            True North Navigator
          </h1>
          <p className="text-ice-blue">
            Safe navigation through Great Slave Lake
          </p>
        </div>

        {/* Form Card */}
        <div className="card">
          {/* Toggle Tabs */}
          <div className="flex mb-6 bg-midnight-dark rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-md font-semibold transition-all ${
                isLogin
                  ? 'bg-aurora-green text-ice-white'
                  : 'text-ice-blue hover:text-ice-white'
              }`}
            >
              <LogIn size={18} className="inline mr-2" />
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-md font-semibold transition-all ${
                !isLogin
                  ? 'bg-aurora-green text-ice-white'
                  : 'text-ice-blue hover:text-ice-white'
              }`}
            >
              <UserPlus size={18} className="inline mr-2" />
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username (Register only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-ice-blue mb-2">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  className="input-northern"
                  required={!isLogin}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-ice-blue mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="input-northern"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-ice-blue mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="input-northern"
                required
              />
            </div>

            {/* Vessel Information (Register only) */}
            {!isLogin && (
              <>
                <div className="aurora-divider my-6"></div>
                <h3 className="text-sm font-semibold text-ice-white mb-4">
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

                <div>
                  <label className="block text-sm font-semibold text-ice-blue mb-2">
                    Vessel Draft (meters)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 0.6"
                    value={formData.vesselDraft}
                    onChange={(e) => handleChange('vesselDraft', e.target.value)}
                    className="input-northern"
                  />
                </div>
              </>
            )}

            {/* Submit Button */}
            <button type="submit" className="w-full btn-primary mt-6">
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
            </button>
          </form>

          {/* Forgot Password (Login only) */}
          {isLogin && (
            <div className="text-center mt-4">
              <a href="#" className="text-sm text-aurora-blue hover:text-aurora-purple transition-colors">
                Forgot your password?
              </a>
            </div>
          )}
        </div>

        {/* Guest Access */}
        <div className="text-center mt-6">
          <p className="text-ice-blue text-sm mb-2">Want to explore first?</p>
          <button className="btn-secondary">Continue as Guest</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
