import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { forgotPassword } from '../services/api';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import type { ForgotPasswordData } from '../@types';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordData>();

  const onSubmit = async (data: ForgotPasswordData) => {
    try {
      setIsLoading(true);

      // Call forgot password API
      await forgotPassword(data);

      // Success
      setEmailSent(true);
      setSentEmail(data.email);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast.error(error.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (emailSent) {
    return (
      <AuthLayout>
        <div className="text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h2>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            We've sent a password reset link to:
            <br />
            <span className="font-semibold text-gray-800">{sentEmail}</span>
          </p>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-blue-800">
              <strong>Next steps:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
              <li>Check your email inbox</li>
              <li>Click the reset password link</li>
              <li>Create a new password</li>
            </ul>
          </div>

          {/* Back to Login */}
          <Link to="/login">
            <Button variant="primary" size="medium" fullWidth leftIcon={<ArrowLeft size={18} />}>
              Back to Login
            </Button>
          </Link>

          {/* Resend option */}
          <p className="text-sm text-gray-500 mt-4">
            Didn't receive the email?{' '}
            <button
              onClick={() => {
                setEmailSent(false);
                setSentEmail('');
              }}
              className="text-primary hover:text-primary-dark font-semibold"
            >
              Try again
            </button>
          </p>
        </div>
      </AuthLayout>
    );
  }

  // Form state
  return (
    <AuthLayout title="Forgot Password?" subtitle="Enter your email to reset your password">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Input */}
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          leftIcon={<Mail size={20} />}
          error={errors.email?.message}
          helperText="We'll send you a password reset link"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
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
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>

        {/* Back to Login */}
        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}