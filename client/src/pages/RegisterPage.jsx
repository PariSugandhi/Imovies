import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';
import { Film, User, Mail, Lock, Phone } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      toast.warning('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      toast.warning('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      toast.warning('Passwords do not match.');
      return;
    }

    const resultAction = await dispatch(
      registerUser({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      })
    );

    if (registerUser.fulfilled.match(resultAction)) {
      toast.success('Registration successful! Welcome to IMovies.');
      navigate('/');
    } else {
      toast.error(resultAction.payload || 'Registration failed.');
    }
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
              <h3 className="fw-bold mb-1">Create Account</h3>
              <p className="text-muted small">Join IMovies for seamless ticket booking</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small mb-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">
                  Full Name *
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white">
                    <User size={15} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">
                  Email Address *
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white">
                    <Mail size={15} className="text-muted" />
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">
                  Mobile Number (Optional)
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white">
                    <Phone size={15} className="text-muted" />
                  </span>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">
                  Password (min. 6 characters) *
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white">
                    <Lock size={15} className="text-muted" />
                  </span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-secondary">
                  Confirm Password *
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white">
                    <Lock size={15} className="text-muted" />
                  </span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                  'Complete Registration'
                )}
              </button>
            </form>

            <div className="text-center mt-3 text-muted small">
              Already have an account?{' '}
              <Link to="/login" className="text-danger fw-semibold">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
