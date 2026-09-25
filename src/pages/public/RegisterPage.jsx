import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Button, Input, Checkbox } from '../../components/common';
import { useAuth } from '../../auth/AuthContext';
import { roleHome, safeNext } from '../../utils/format';

const API_FIELD_MAP = { display_name: 'name', email: 'email', password: 'password' };

export const RegisterPage = () => {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = safeNext(searchParams.get('next'));
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email address';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!agreed) newErrors.agreed = 'You must agree to the terms';
    return newErrors;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const current = await register({
        email: formData.email,
        password: formData.password,
        display_name: formData.name,
      });
      navigate(next || roleHome(current.role));
    } catch (err) {
      const fieldErrors = {};
      Object.entries(err.fields || {}).forEach(([field, message]) => {
        fieldErrors[API_FIELD_MAP[field] || 'submit'] = message;
      });
      setErrors({ ...fieldErrors, submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center px-lg py-2xl">
        <div className="card p-2xl w-full max-w-md text-center space-y-4">
          <h2 className="text-2xl font-bold text-brand-900">You already have an account</h2>
          <p className="text-brand-600">Signed in as {user.display_name}.</p>
          <Button variant="primary" className="w-full" onClick={() => navigate(next || roleHome(user.role))}>
            Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center px-lg py-2xl">
      <div className="w-full max-w-md">
        <div className="card p-2xl">
          <h2 className="text-2xl font-bold text-brand-900 mb-md text-center">Create Account</h2>
          <p className="text-brand-600 text-center mb-2xl">Join DOGFOOD and start building</p>

          {errors.submit && (
            <Alert
              type="error"
              title="Registration Error"
              message={errors.submit}
              onClose={() => setErrors(prev => ({ ...prev, submit: '' }))}
              className="mb-lg"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-md mb-2xl" noValidate>
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Jane Doe"
              error={errors.name}
              autoComplete="name"
              required
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              error={errors.email}
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              error={errors.password}
              autoComplete="new-password"
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.confirmPassword}
              autoComplete="new-password"
              required
            />

            <Checkbox
              label="I agree to the Terms of Service and Privacy Policy"
              checked={agreed}
              onChange={e => {
                setAgreed(e.target.checked);
                if (errors.agreed) setErrors(prev => ({ ...prev, agreed: '' }));
              }}
            />
            {errors.agreed && <p className="text-sm text-danger-600">{errors.agreed}</p>}

            <Button type="submit" variant="primary" isLoading={loading} className="w-full">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-brand-600">
            Already have an account?{' '}
            <Link
              to={next ? `/login?next=${encodeURIComponent(next)}` : '/login'}
              className="text-accent-600 hover:text-accent-700 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
