import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {  useForm } from 'react-hook-form';
import { Mail, Lock, User, Phone, CheckCircle } from 'lucide-react';
import type {CredentialResponse } from '@react-oauth/google';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { login, getMerchantStore, registerCustomer, googleAuth, resendVerification } from '../services/api';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import type { LoginCredentials, RegisterCustomerData} from '../@types';


type TabType = 'signin' | 'register';

export default function LoginPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const { login: authLogin } = useAuth();
  
  //State untuk unverified email
  const [showResendVerfication, setShowResendVerification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const[isResending, setIsResending] = useState(false);
  

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

  //Google Auth Handler Log In
  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    try {
      setIsLoading(true);

      if(!credentialResponse.credential){
        toast.error('Failed to get Google credentials. Please try again.');
        return;
      }

      const response = await googleAuth(credentialResponse.credential, 'signin');

      authLogin(response.user, response.token);
      toast.success('Login succesful with Google!')

      if(response.isNewUser){
        toast.error('No account found. Please register first.');

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return;
      }

      //User existing
      authLogin(response.user, response.token);
      toast.success('Login successful with Google!');

      if (response.user.role === 'user') {
        navigate('/dashboard');
      }else if(response.user.role === 'merchant'){
        try {
          const store = await getMerchantStore();
          if(store.approval_status === 'pending'){
            navigate('/merchant/pending-approval');
          } else if (store.approval_status === 'approved'){
            navigate('/merchant/dashboard');
          }else if(store.approval_status === 'rejected'){
            navigate('/merchant/rejected');
          }

        } catch (error) {
          navigate('/merchant/pending-approval');
        }
      }else if(response.user.role === 'admin'){
        navigate('/admin/dashboard');
      }
    } catch (error:any) {
      console.error('Google auth error:', error);
      toast.error(error.response?.data?.message || 'Google authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  //Google Register
  const handleGoogleRegister = async(credentialResponse: CredentialResponse) => {
    try {
      setIsLoading(true);

      if(!credentialResponse.credential){
        toast.error('Failed to get Google credentials. Please try again.');
        return;
      }

      const response = await googleAuth(credentialResponse.credential, 'register');

      authLogin(response.user, response.token);

      if (response.isNewUser){
        toast.success('Registration successful with Google!');
      } else{
        toast.success('Welcome back! Logged in with Google.');
      }

      // Redirect based on role
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

    } catch (error:any) {
      console.error('Google register error:', error);
      toast.error(error.response?.data?.message || 'Google registration failed');
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleError = () => {
    toast.error('Google authentication was unsuccessful. Please try again.');
  }

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

          console.log('Full store object:', store);
          console.log('Approval status:', store.approval_status);
          console.log('===========================');
          if (store.approval_status === 'pending') {
            navigate('/merchant/pending-approval');
          } else if (store.approval_status === 'approved') {
            navigate('/merchant/dashboard');
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
        setUnverifiedEmail(data.email);
        setShowResendVerification(true);
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

          <div className='mt-4'>
            <p className='text-sm text-gray-600'>
              Didn't receive verification email?{' '}
              <button
                onClick={async () => {
                  try {
                    setIsResending(true);
                    await resendVerification(registeredEmail);
                    toast.success('Verification email resent! Please check your inbox.');
                  } catch (error: any) {
                    toast.error('Failed to resend email. Please try again.')
                  } finally{
                    setIsResending(false);
                  }
                }}
                disabled={isResending}
                className='text-primary hover:text-primary-dark font-semibold disabled:opacity-50'
                >
                  {isResending ? 'Sending...' : 'Resend verification email'}
              </button>
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Resend Verification email Handler
  const handlerResendVerfication = async() => {
    if(!unverifiedEmail){
      toast.error('User Not found.');
      return;
    }

    try {
      setIsResending(true);
      await resendVerification(unverifiedEmail);
      toast.success('Verification email resent! Please check your inbox.');
      setShowResendVerification(false);
      setUnverifiedEmail('');
    } catch (error:any) {
      console.error('Resend verification error: ', error);
      toast.error(error.response?.data?.message || 'Failes to resend verification email. Please try again.');
    } finally{
      setIsResending(false);
    }
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

          {showResendVerfication && (
            <div className='mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
              <p className=' text-sm text-yellow-800 mb-2'>
                <strong>Email not verified</strong>
              </p>
              <p className='text-xs text-yellow-700 mb-2'>
                Please Check your inbox for the verification email sent to{' '}
                <span className='font-semibold'>
                  {unverifiedEmail}
                </span>
                <Button
                 variant= "outline"
                 size='small'
                 fullWidth
                 onClick={handlerResendVerfication}
                 isLoading={isResending}
                 className='mt-2'
                 >
                  {isResending ? 'Resending...' : 'Resend Verification Email'}
                </Button>
              </p>
            </div>
          )}

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

            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={handleGoogleError}
                useOneTap
                theme="outline"
                size="large"
                text="signin_with"
                width="384"
              />
            </div>

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
            <div className="flex justify-center w-ful">
              <GoogleLogin
                onSuccess={handleGoogleRegister}
                onError={handleGoogleError}
                useOneTap
                theme="outline"
                size="large"
                text="signin_with"
                width="384"
              />
            </div>

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