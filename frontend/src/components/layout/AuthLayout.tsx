import type { ReactNode } from 'react';
import Logo from './Logo';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#217851] to-[#135252] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* White Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          {/* Logo */}
          <div className="mb-8 text-center">
            <Logo size="medium" />
          </div>

          {/* Title & Subtitle (optional) */}
          {(title || subtitle) && (
            <div className="mb-6 text-center">
              {title && (
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-gray-600 text-sm">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Content */}
          <div>{children}</div>
        </div>

        {/* Footer text (optional) */}
        <p className="text-center text-sm text-gray-600 mt-6">
          © 2025 Replate. All rights reserved.
        </p>
      </div>
    </div>
  );
}