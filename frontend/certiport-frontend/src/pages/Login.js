// import { useState } from 'react';
// import API from '../api/axiosInstance';
// import '../styles/Login.css'; 
// import logo from '../assets/logo.png'  
// import { useNavigate, Link } from 'react-router-dom';

// export default function Login() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const navigate = useNavigate();

//   const submit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');
//     setIsLoading(true);

//     try {
//       const res = await API.post('/auth/login', { email, password });
      
//       // Always store in localStorage for consistency
//       // The rememberMe flag can be used for other purposes (like auto-login)
//       localStorage.setItem('token', res.data.token);
//       localStorage.setItem('user', JSON.stringify(res.data.user));
      
//       // If remember me is not checked, you could set an expiry or handle differently
//       if (rememberMe) {
//         // Store a flag that user wants to be remembered
//         localStorage.setItem('rememberMe', 'true');
//       } else {
//         // Remove remember me flag but keep the session active
//         localStorage.removeItem('rememberMe');
//       }

//       setSuccess('Login successful! Redirecting...');
      
//       // Debug logs
//       console.log('Token stored:', localStorage.getItem('token'));
//       console.log('User stored:', localStorage.getItem('user'));
//       console.log('User role:', res.data.user.role);
      
//       // Redirect based on role immediately (no setTimeout needed)
//       const role = res.data.user.role;
//       if (role === 'university') {
//         navigate('/university');
//       } else if (role === 'student') {
//         navigate('/student');
//       } else if (role === 'admin') {
//         navigate('/admin');
//       } else {
//         navigate('/');
//       }

//     } catch (err) {
//       setError(err.response?.data?.msg || 'Login failed. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const togglePassword = () => {
//     setShowPassword(!showPassword);
//   };

//   return (
//     <div className="login-page">
//       <div className="login-container">
//         <div className="login-header">
//           <div className="login-logo">
//             <img src={logo} alt="CertiPort" />
//           </div>
//           <h1 className="login-title">Welcome Back</h1>
//           <p className="login-subtitle">Sign in to your CertiPort account</p>
//         </div>

//         <form className="login-form" onSubmit={submit}>
//           {error && <div className="error-message">{error}</div>}
//           {success && <div className="success-message">{success}</div>}
          
//           <div className="form-group">
//             <label className="form-label" htmlFor="email">Email Address</label>
//             <div className="form-input-wrapper">
//               <input
//                 id="email"
//                 className="form-input"
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="Enter your email"
//                 required
//                 disabled={isLoading}
//               />
//               <span className="input-icon">📧</span>
//             </div>
//           </div>

//           <div className="form-group">
//             <label className="form-label" htmlFor="password">Password</label>
//             <div className="form-input-wrapper">
//               <input
//                 id="password"
//                 className="form-input"
//                 type={showPassword ? "text" : "password"}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Enter your password"
//                 required
//                 disabled={isLoading}
//               />
//               <span className="input-icon">🔒</span>
//               <button
//                 type="button"
//                 className="password-toggle"
//                 onClick={togglePassword}
//                 disabled={isLoading}
//               >
//                 {showPassword ? '👁️' : '🙈'}
//               </button>
//             </div>
//           </div>

//           <div className="form-options">
//             <div className="remember-me">
//               <input
//                 type="checkbox"
//                 id="remember"
//                 className="remember-checkbox"
//                 checked={rememberMe}
//                 onChange={(e) => setRememberMe(e.target.checked)}
//                 disabled={isLoading}
//               />
//               <label htmlFor="remember" className="remember-label">Remember me</label>
//             </div>
//             <Link to="/forgot-password" className="forgot-password">
//               Forgot password?
//             </Link>
//           </div>

//           <button
//             type="submit"
//             className="login-button"
//             disabled={isLoading}
//           >
//             {isLoading ? 'Signing In...' : 'Sign In'}
//           </button>
//         </form>

//         <div className="signup-link">
//           Don't have an account? <Link to="/register">Sign up here</Link>
//         </div>

//         <div className="security-badge">
//           Secure • Blockchain-Verified • Tamper-Proof
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState } from 'react';
import API from '../api/axiosInstance';
import '../styles/Login.css'; 
import logo from '../assets/logo.png'  
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const res = await API.post('/auth/login', { email, password });
      
      // Always store in localStorage for consistency
      // The rememberMe flag can be used for other purposes (like auto-login)
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // If remember me is not checked, you could set an expiry or handle differently
      if (rememberMe) {
        // Store a flag that user wants to be remembered
        localStorage.setItem('rememberMe', 'true');
      } else {
        // Remove remember me flag but keep the session active
        localStorage.removeItem('rememberMe');
      }

      setSuccess('Login successful! Redirecting...');
      
      // Debug logs
      console.log('Token stored:', localStorage.getItem('token'));
      console.log('User stored:', localStorage.getItem('user'));
      console.log('User role:', res.data.user.role);
      
      // Redirect based on role immediately (no setTimeout needed)
      const role = res.data.user.role;
      if (role === 'university') {
        navigate('/university');
      } else if (role === 'student') {
        navigate('/student');
      } else if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }

    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <img src={logo} alt="CertiPort" />
          </div>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to your CertiPort account</p>
        </div>

        <form className="login-form" onSubmit={submit}>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="form-input-wrapper">
              <input
                id="email"
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
              <Mail className="input-icon" size={20} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="form-input-wrapper">
              <input
                id="password"
                className="form-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
              <Lock className="input-icon" size={20} />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePassword}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-options">
            <div className="remember-me">
              <input
                type="checkbox"
                id="remember"
                className="remember-checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              <label htmlFor="remember" className="remember-label">Remember me</label>
            </div>
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="signup-link">
          Don't have an account? <Link to="/register">Sign up here</Link>
        </div>

        <div className="security-badge">
          Secure • Blockchain-Verified • Tamper-Proof
        </div>
      </div>
    </div>
  );
}