import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { resetPassword } from '../services/api';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<ResetPasswordFormData>();

  const newPassword = watch('newPassword');

  // Redirect countdown after success
  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (success && countdown === 0) {
      navigate('/login');
    }
  }, [success, countdown, navigate]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Invalid or missing reset token');
      return;
    }

    try {
      setIsLoading(true);

      // Call reset password API
      await resetPassword({
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      });

      // Success
      setSuccess(true);
      toast.success('Password reset successful!');
    } catch (error: any) {
      console.error('Reset password error:', error);
      if (error.response?.status === 400 && error.response?.data?.message?.includes('expired')) {
        toast.error('Reset link has expired. Please request a new one.');
      } else if (error.response?.status === 400 && error.response?.data?.message?.includes('invalid')) {
        toast.error('Invalid reset link. Please request a new one.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Check if token exists
  if (!token) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Link</h2>
          <p className="text-gray-600 mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Link to="/forgot-password">
            <Button variant="primary" size="medium" fullWidth>
              Request New Link
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // Success state
  if (success) {
    return (
      <AuthLayout>
        <div className="text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Password Reset Successful!</h2>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            Your password has been successfully reset.
            <br />
            Redirecting to login in <span className="font-bold text-primary">{countdown}</span> seconds...
          </p>

          {/* Manual redirect button */}
          <Link to="/login">
            <Button variant="primary" size="medium" fullWidth>
              Go to Login Now
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // Form state
  return (
    <AuthLayout title="Reset Password" subtitle="Enter your new password">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* New Password Input */}
        <Input
          label="New Password"
          isPassword
          placeholder="Enter new password"
          leftIcon={<Lock size={20} />}
          error={errors.newPassword?.message}
          helperText="Must be at least 8 characters"
          {...register('newPassword', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters'
            },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
              message: 'Password must contain uppercase, lowercase, and number'
            }
          })}
        />

        {/* Confirm Password Input */}
        <Input
          label="Confirm Password"
          isPassword
          placeholder="Confirm new password"
          leftIcon={<Lock size={20} />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) =>
              value === newPassword || 'Passwords do not match'
          })}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="medium"
          fullWidth
          isLoading={isLoading}
        >
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </Button>

        {/* Back to Login */}
        <div className="text-center">
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-800">
            Back to Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}