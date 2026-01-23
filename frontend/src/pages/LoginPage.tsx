import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, Phone, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { login, getMerchantStore, registerCustomer } from '../services/api';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import type { LoginCredentials, RegisterCustomerData } from '../@types';

type TabType = 'signin' | 'register';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Form for Sign In
  const {
    register: registerSignIn,
    handleSubmit: handleSubmitSignIn,
    formState: { errors: errorsSignIn }
  } = useForm<LoginCredentials>();

  // Form for Register
  const {
    register: registerForm,
    handleSubmit: handleSubmitRegister,
    watch,
    formState: { errors: errorsRegister }
  } = useForm<RegisterCustomerData>();

  const password = watch('password');

  // Sign In Handler
  const onSubmitSignIn = async (data: LoginCredentials) => {
    try {
      setIsLoading(true);

      const response = await login(data);
      authLogin(response.user, response.token);
      toast.success('Login successful!');

      if (response.user.role === 'user') {
        navigate('/dashboard');
      } else if (response.user.role === 'merchant') {
        try {
          const store = await getMerchantStore();

          if (store.approval_status === 'pending') {
            navigate('/merchant/pending-approval');
          } else if (store.approval_status === 'approved') {
            navigate('/merchant/dashboard');
          } else if (store.approval_status === 'rejected') {
            navigate('/merchant/rejected');
          }
        } catch (error) {
          navigate('/merchant/pending-approval');
        }
      } else if (response.user.role === 'admin') {
        navigate('/admin/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);

      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 404) {
        toast.error('No account found with this email address.');
      } else if (status === 401) {
        toast.error('Incorrect password. Please try again.');
      } else if (status === 403) {
        toast.error('Please verify your email before logging in. Check your inbox.');
      } else {
        toast.error(message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Register Handler
  const onSubmitRegister = async (data: RegisterCustomerData) => {
    try {
      setIsLoading(true);

      await registerCustomer(data);

      setRegisteredEmail(data.email);
      setRegistrationSuccess(true);
      toast.success('Registration successful! Please check your email.');
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.response?.status === 409) {
        toast.error('Email already registered. Please login instead.');
      } else {
        toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Registration Success State
  if (registrationSuccess) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h2>

          <p className="text-gray-600 mb-6">
            We've sent a verification email to:
            <br />
            <span className="font-semibold text-gray-800">{registeredEmail}</span>
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-blue-800">
              <strong>Next steps:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
              <li>Check your email inbox</li>
              <li>Click the verification link</li>
              <li>Login to your account</li>
            </ul>
          </div>

          <Button
            variant="primary"
            size="medium"
            fullWidth
            onClick={() => {
              setRegistrationSuccess(false);
              setActiveTab('signin');
            }}
          >
            Go to Login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      {/* TAB NAVIGATION */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          type="button"
          className={`flex-1 py-3 text-center font-semibold transition-colors ${
            activeTab === 'signin'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('signin')}
        >
          Sign In
        </button>
        <button
          type="button"
          className={`flex-1 py-3 text-center font-semibold transition-colors ${
            activeTab === 'register'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('register')}
        >
          Register
        </button>
      </div>

      {/* SIGN IN TAB */}
      {activeTab === 'signin' && (
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Welcome Back</h2>
          <p className="text-gray-600 text-sm text-center mb-6">Sign in to continue to Replate</p>

          <form onSubmit={handleSubmitSignIn(onSubmitSignIn)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="example@gmail.com"
              leftIcon={<Mail size={20} />}
              error={errorsSignIn.email?.message}
              {...registerSignIn('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />

            <Input
              label="Password"
              isPassword
              placeholder="8 Characters minimum"
              leftIcon={<Lock size={20} />}
              error={errorsSignIn.password?.message}
              {...registerSignIn('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                }
              })}
            />

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:text-primary-dark font-medium"
              >
                Forget Password?
              </Link>
            </div>

            <Button type="submit" variant="primary" size="medium" fullWidth isLoading={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <Button variant="outline" size="medium" fullWidth disabled>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Register as a Merchant{' '}
                <Link
                  to="/register/merchant"
                  className="text-primary hover:text-primary-dark font-semibold"
                >
                  Register
                </Link>
              </p>
            </div>
          </form>
        </>
      )}

      {/* REGISTER TAB */}
      {activeTab === 'register' && (
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Create Account</h2>
          <p className="text-gray-600 text-sm text-center mb-6">
            Join Replate and start saving food today!
          </p>

          <form onSubmit={handleSubmitRegister(onSubmitRegister)} className="space-y-4">
            {/* Full Name */}
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              leftIcon={<User size={20} />}
              error={errorsRegister.name?.message}
              {...registerForm('name', {
                required: 'Name is required',
                minLength: {
                  value: 3,
                  message: 'Name must be at least 3 characters'
                }
              })}
            />

            {/* Email */}
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              leftIcon={<Mail size={20} />}
              error={errorsRegister.email?.message}
              {...registerForm('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />

            {/* Phone */}
            <Input
              label="Phone Number"
              type="tel"
              placeholder="08xxxxxxxxxx"
              leftIcon={<Phone size={20} />}
              error={errorsRegister.phone?.message}
              {...registerForm('phone', {
                required: 'Phone number is required',
                pattern: {
                  value: /^[0-9]{10,13}$/,
                  message: 'Invalid phone number (10-13 digits)'
                }
              })}
            />

            {/* Password */}
            <Input
              label="Password"
              isPassword
              placeholder="Create a password"
              leftIcon={<Lock size={20} />}
              error={errorsRegister.password?.message}
              helperText="Min. 8 characters with uppercase, lowercase & number"
              {...registerForm('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Must contain uppercase, lowercase & number'
                }
              })}
            />

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              isPassword
              placeholder="Confirm your password"
              leftIcon={<Lock size={20} />}
              error={errorsRegister.confirmPassword?.message}
              {...registerForm('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match'
              })}
            />

            {/* Terms & Conditions */}
            {/* <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1"
                {...registerForm('terms' as any, {
                  required: 'You must accept the terms and conditions'
                })}
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-primary hover:text-primary-dark font-semibold">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary hover:text-primary-dark font-semibold">
                  Privacy Policy
                </a>
              </label>
            </div>
            {errorsRegister.terms && (
              <p className="text-sm text-red-500 -mt-2">{(errorsRegister.terms as any).message}</p>
            )} */}

            {/* Register Button */}
            <Button type="submit" variant="primary" size="medium" fullWidth isLoading={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Social Register */}
            <Button variant="outline" size="medium" fullWidth disabled>
              Google
            </Button>

            {/* Links */}
            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setActiveTab('signin')}
                className="text-primary hover:text-primary-dark font-semibold"
              >
                Sign In
              </button>
            </p>

            <p className="text-center text-sm text-gray-600">
              Want to sell your products?{' '}
              <Link
                to="/register/merchant"
                className="text-primary hover:text-primary-dark font-semibold"
              >
                Register as Merchant
              </Link>
            </p>
          </form>
        </>
      )}
    </AuthLayout>
  );
}