import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function Logo({ size = 'medium', className = '' }: LogoProps) {
  // Size classes untuk SVG logo
  const logoSizes = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  // Size classes untuk text
  const textSizeClasses = {
    small: 'text-xl',
    medium: 'text-2xl md:text-3xl',
    large: 'text-3xl md:text-4xl lg:text-5xl'
  };

  const taglineClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base md:text-lg'
  };

  return (
    <Link to="/" className={`inline-block ${className}`}>
      <div className="flex items-center gap-3">
        {/* Logo SVG */}
        <svg 
          className={logoSizes[size]} 
          viewBox="0 0 95 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        > {/* Convert X dan Y ke top bottom left right */}
          <rect x="1.5" y="1.5" width="92" height="97" rx="13.5" fill="#2D7A5E" stroke="white" strokeWidth="3"/>
          <path d="M18.4559 18.7171C17.2093 20.6185 16.902 22.954 17.3836 25.6512C17.9579 28.8677 19.6955 32.4923 22.2071 35.9051C27.2304 42.7308 35.3389 48.6312 42.5526 49.5257L43.0568 49.59L43.3815 49.9788L69.9262 82.0223C72.5719 82.6545 74.2802 82.2608 75.1685 81.3811C76.0636 80.4946 76.4763 78.7827 75.8134 76.0662L18.4562 18.717L18.4559 18.7171ZM69.7342 19.0332L54.9002 33.8672C53.2596 35.5075 53.2454 37.3125 54.0925 39.2847L54.4429 40.1009L53.802 40.7161L48.8203 45.467L52.8664 49.5129L57.596 44.5183L58.2113 43.8688L59.0272 44.2235C61.1005 45.117 63.0667 45.0803 64.59 43.557L79.424 28.723L77.4971 26.7961L67.8498 36.4391L66.0469 34.6321L75.6897 24.9894L73.6348 22.9338L63.992 32.5768L62.1846 30.7697L71.8274 21.1269L69.7342 19.0332ZM41.8389 52.1278L16.4905 76.3141C15.865 78.9049 16.2657 80.5233 17.1101 81.3597C17.9547 82.1962 19.5885 82.5802 22.1473 81.9621L45.8298 56.9471L41.8389 52.1278Z" fill="white"/>
        </svg>
        
        {/* Text Container */}
        <div>
          {/* Brand Name */}
          <h1 className={`text-start font-bold text-primary ${textSizeClasses[size]} leading-none`}>
            Replate
          </h1>
          
          {/* Tagline */}
          <p className={`text-gray-600 font-medium ${taglineClasses[size]} mt-0.5`}>
            Rescue. Reduce. Replate.
          </p>
        </div>
      </div>
    </Link>
  );
}