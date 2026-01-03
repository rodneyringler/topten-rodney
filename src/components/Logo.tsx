'use client';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

const sizes = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

const textSizes = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-4xl',
  xl: 'text-5xl',
};

export default function Logo({ size = 'md', showText = true }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={`${sizes[size]} relative`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Background circle with gradient */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d946ef" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#facc15" />
            </linearGradient>
          </defs>

          {/* Main circle */}
          <circle cx="50" cy="50" r="45" fill="url(#logoGradient)" />

          {/* Number 10 */}
          <text
            x="50"
            y="58"
            textAnchor="middle"
            fill="white"
            fontWeight="bold"
            fontSize="36"
            fontFamily="system-ui, sans-serif"
          >
            10
          </text>

          {/* Stars decorations */}
          <path
            d="M20 25 L22 20 L24 25 L29 25 L25 28 L27 33 L22 30 L17 33 L19 28 L15 25 Z"
            fill="url(#starGradient)"
          />
          <path
            d="M75 20 L77 15 L79 20 L84 20 L80 23 L82 28 L77 25 L72 28 L74 23 L70 20 Z"
            fill="url(#starGradient)"
          />
          <path
            d="M80 70 L82 65 L84 70 L89 70 L85 73 L87 78 L82 75 L77 78 L79 73 L75 70 Z"
            fill="url(#starGradient)"
          />
        </svg>
      </div>
      {showText && (
        <span className={`${textSizes[size]} font-bold bg-gradient-to-r from-primary-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent`}>
          TopTen
        </span>
      )}
    </div>
  );
}
