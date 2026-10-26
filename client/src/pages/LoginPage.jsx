import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearAuthError } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';
import { Film, Lock, Mail, UserCheck, Shield } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Please enter both email and password.');
      return;
    }

    const resultAction = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(resultAction)) {
      toast.success(`Welcome back, ${resultAction.payload.user.name}!`);
      navigate(redirectPath, { replace: true });
    } else {
      toast.error(resultAction.payload || 'Invalid credentials.');
    }
  };

  // Quick fill helper for evaluator viva demo
  const fillDemoUser = () => {
    setEmail('user@imovies.com');
    setPassword('UserPassword123');
    dispatch(clearAuthError());
  };

  const fillDemoAdmin = () => {
    setEmail('admin@imovies.com');
    setPassword('AdminPassword123');
    dispatch(clearAuthError());
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-5">
          <div className="bg-white p-4 p-md-5 rounded-3 border shadow-sm">
            <div className="text-center mb-4">
              <span className="brand-badge d-inline-flex align-items-center gap-1 mb-2">
                <Film size={18} />
                <span>IMOVIES</span>
              </span>
              <h3 className="fw-bold mb-1">Sign In</h3>
              <p className="text-muted small">Access your bookings and cinema profile</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small mb-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">
                  Email Address
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white">
                    <Mail size={15} className="text-muted" />
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <label className="form-label small fw-semibold text-secondary mb-1">
                    Password
                  </label>
                </div>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white">
                    <Lock size={15} className="text-muted" />
                  </span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-cinema w-100 py-2 fw-semibold mb-3"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  'Log In to IMovies'
                )}
              </button>
            </form>

            {/* Quick Demo Fill Buttons for Viva */}
            <div className="pt-3 border-top text-center">
              <span className="small text-muted d-block mb-2">Quick Viva Demo Logins:</span>
              <div className="d-flex gap-2 justify-content-center">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                  onClick={fillDemoUser}
                >
                  <UserCheck size={14} />
                  <span>Demo User</span>
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1"
                  onClick={fillDemoAdmin}
                >
                  <Shield size={14} className="text-warning" />
                  <span>Demo Admin</span>
                </button>
              </div>
            </div>

            <div className="text-center mt-4 text-muted small">
              Don't have an account?{' '}
              <Link to="/register" className="text-danger fw-semibold">
                Register now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
