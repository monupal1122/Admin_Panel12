import { useState } from "react";
import { Lock, Mail, Eye, EyeOff, LogIn } from "lucide-react";
import { Navigation } from "lucide-react";
const API1 = `${import.meta.env.VITE_API_URL}/api`;
export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Replace with your actual API endpoint
      const API = `${API1}/auth/adminlogin`;
      
      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      setMessage("Login successful!");

      // Store token and admin data (Note: use your own state management in production)
      // localStorage.setItem("token", data.token);
      // localStorage.setItem("admin", JSON.stringify(data.admin));

      // Navigate to dashboard after success
      
      setTimeout(() => {
        window.location.href = "/admin-dashboard";
        // Or use: navigate("/admin-dashboard") if using react-router
      }, 1000);
      
    } catch (error) {
      setMessage(error.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-700 to-teal-800 animate-gradient"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      {/* LEFT SIDE */}
      <div className="w-[65%] relative z-10 flex flex-col items-center justify-center px-12">
        {/* Logo */}
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xl font-bold">AdminPanel</span>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl text-center">
          <div className="mb-8 inline-block">
            <div className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl">
              <Lock className="w-16 h-16 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
            Welcome Back
          </h1>
          <p className="text-xl text-white/80 mb-8">
            Securely access your administrative dashboard
          </p>

          <div className="flex gap-6 justify-center text-white/70">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Secure Access</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse delay-75"></div>
              <span className="text-sm">24/7 Monitoring</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse delay-150"></div>
              <span className="text-sm">Data Protection</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE (Login Form) */}
      <div className="w-[35%] relative z-10 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Admin Login
            </h2>
            <p className="text-gray-500 text-sm">
              Enter your credentials to continue
            </p>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-xl border ${
                message.includes("successful")
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  message.includes("successful") ? "bg-emerald-500" : "bg-red-500"
                }`}></div>
                <span className="text-sm font-medium">{message}</span>
              </div>
            </div>
          )}

          <div className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@example.com"
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-gray-50 hover:bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-gray-50 hover:bg-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSubmit(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-gray-600">Remember me</span>
              </label>
              <button onClick={() => alert('Forgot password clicked')} className="text-emerald-600 hover:text-emerald-700 font-medium">
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3.5 rounded-xl font-semibold hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <span>Login to Dashboard</span>
                  <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-500 text-sm">
              Protected by enterprise-grade security
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }
        .delay-75 {
          animation-delay: 75ms;
        }
        .delay-150 {
          animation-delay: 150ms;
        }
      `}</style>
    </div>
  );
}