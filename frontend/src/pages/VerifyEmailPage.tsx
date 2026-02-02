import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { verifyEmail, resendVerification } from '../services/api';
import AuthLayout from '../components/layout/AuthLayout';
import Button from '../components/ui/Button';


type VerificationState = 'loading' | 'success' | 'error' | 'already-verified';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<VerificationState>('loading');
  const [countdown, setCountdown] = useState(3);
  const [errorMessage, setErrorMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);

  const token = searchParams.get('token');
  const status = searchParams.get('status')

  useEffect(() => {
    if(status === 'success && !token'){
      setState('success');
      return;
    }

    if(!token) {
      setState('error');
      setErrorMessage('Verification token is missing')
      return;
    }
  })

  // Auto-verify on mount
  useEffect(() => {
    if (!token) {
      setState('error');
      setErrorMessage('Verification token is missing');
      return;
    }

    const verify = async () => {
      try {
        await verifyEmail(token);
        setState('success');
        toast.success('Email verified successfully!');
      } catch (error: any) {
        console.error('Verification error:', error);
        const message = error.response?.data?.message || 'Verification failed';

        if (message.includes('already verified')) {
          setState('already-verified');
          setErrorMessage('This email has already been verified');
        } else if (message.includes('expired')) {
          setState('error');
          setErrorMessage('Verification link has expired');
        } else if (message.includes('invalid')) {
          setState('error');
          setErrorMessage('Invalid verification link');
        } else {
          setState('error');
          setErrorMessage(message);
        }
      }
    };

    verify();
  }, [token]);

  // Redirect countdown after success
  useEffect(() => {
    if (state === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (state === 'success' && countdown === 0) {
      navigate('/login');
    }
  }, [state, countdown, navigate]);

  // Resend verification
  const handleResend = async () => {
    if (!showEmailInput) {
      setShowEmailInput(true);
      return;
    }

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setIsResending(true);
      await resendVerification(email);
      toast.success('Verification email sent! Please check your inbox.');
      setShowEmailInput(false);
      setEmail('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  }

  // Loading state
  if (state === 'loading') {
    return (
      <AuthLayout>
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Your Email</h2>
          <p className="text-gray-600">Please wait while we verify your email address...</p>
        </div>
      </AuthLayout>
    );
  }

  // Success state
  if (state === 'success') {
    return (
      <AuthLayout>
        <div className="text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h2>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            Your email has been successfully verified.
            <br />
            Redirecting to login in <span className="font-bold text-primary">{countdown}</span>{' '}
            seconds...
          </p>

          {/* Login Button */}
          <Link to="/login">
            <Button variant="primary" size="medium" fullWidth>
              Go to Login Now
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // Already Verified state
  if (state === 'already-verified') {
    return (
      <AuthLayout>
        <div className="text-center">
          {/* Info Icon */}
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-10 h-10 text-blue-600" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Already Verified</h2>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            This email address has already been verified.
            <br />
            You can now login to your account.
          </p>

          {/* Login Button */}
          <Link to="/login">
            <Button variant="primary" size="medium" fullWidth>
              Go to Login
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // Error state
  return (
    <AuthLayout>
      <div className="text-center">
        {/* Error Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>

        {/* Error Message */}
        <p className="text-gray-600 mb-6">{errorMessage}</p>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            className='mb-2;'
            variant="primary"
            size="medium"
            fullWidth
            onClick={handleResend}
            isLoading={isResending}
          >
            {isResending ? 'Sending...' : 'Resend Verification Email'}
          </Button>

          <Link to="/login">
            <Button className='mt-2'variant="outline" size="medium" fullWidth>
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}