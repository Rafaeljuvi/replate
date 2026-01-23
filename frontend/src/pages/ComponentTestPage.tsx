import { useState } from 'react';
import { Mail, Lock, User, Search } from 'lucide-react';
import Logo from '../components/layout/Logo';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import AuthLayout from '../components/layout/AuthLayout';


export default function ComponentTestPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTest = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  

  return (
    
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Component Test Page
        </h1>

        {/* Logo Test */}
        <section className="mb-12 bg-white p-8 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Logo Component</h2>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Small:</p>
              <Logo size="small" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Medium:</p>
              <Logo size="medium" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Large:</p>
              <Logo size="large" />
            </div>
          </div>
        </section>

        {/* Button Test */}
        <section className="mb-12 bg-white p-8 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Button Component</h2>
          
          {/* Variants */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">Variants:</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </div>

          {/* Sizes */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">Sizes:</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="small">Small</Button>
              <Button size="medium">Medium</Button>
              <Button size="large">Large</Button>
            </div>
          </div>

          {/* With Icons */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">With Icons:</p>
            <div className="flex flex-wrap gap-3">
              <Button leftIcon={<Mail size={18} />}>With Left Icon</Button>
              <Button rightIcon={<Search size={18} />}>With Right Icon</Button>
              <Button leftIcon={<User size={18} />} rightIcon={<Search size={18} />}>
                Both Icons
              </Button>
            </div>
          </div>

          {/* States */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">States:</p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleTest} isLoading={loading}>
                {loading ? 'Loading...' : 'Click to Load'}
              </Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>

          {/* Full Width */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Full Width:</p>
            <Button fullWidth>Full Width Button</Button>
          </div>
        </section>

        {/* Input Test */}
        <section className="mb-12 bg-white p-8 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Input Component</h2>
          <div className="space-y-4 max-w-md">
            {/* Basic input */}
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              leftIcon={<Mail size={20} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* Password input */}
            <Input
              label="Password"
              isPassword
              placeholder="Enter your password"
              leftIcon={<Lock size={20} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* With helper text */}
            <Input
              label="Username"
              placeholder="Choose a username"
              helperText="Username must be unique"
              leftIcon={<User size={20} />}
            />

            {/* With error */}
            <Input
              label="Invalid Email"
              type="email"
              placeholder="test@example"
              error="Please enter a valid email address"
              leftIcon={<Mail size={20} />}
            />

            {/* Required field */}
            <Input
              label="Required Field"
              placeholder="This field is required"
              required
            />

            {/* Disabled */}
            <Input
              label="Disabled Input"
              placeholder="Cannot edit"
              disabled
              value="Disabled value"
            />
          </div>
        </section>

        {/* AuthLayout Test */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 bg-white p-4 rounded-lg shadow">
            AuthLayout Component (Full Page)
          </h2>
          <div className="border-4 border-dashed border-gray-300 rounded-lg overflow-hidden">
            <AuthLayout
              title="Welcome Back"
              subtitle="Sign in to continue to Replate"
            >
              <div className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  leftIcon={<Mail size={20} />}
                />
                <Input
                  label="Password"
                  isPassword
                  placeholder="Enter your password"
                  leftIcon={<Lock size={20} />}
                />
                <Button fullWidth>Sign In</Button>
              </div>
            </AuthLayout>
          </div>
        </section>
      </div>
    </div>
  );
}