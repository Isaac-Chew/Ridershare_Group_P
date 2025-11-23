import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showSubtitle?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', showSubtitle = false }) => {
  const sizeStyles = {
    small: { fontSize: '20px', fontWeight: 700 },
    medium: { fontSize: '28px', fontWeight: 700 },
    large: { fontSize: '36px', fontWeight: 700 },
  };

  const subtitleStyles = {
    small: { fontSize: '12px', marginTop: '2px' },
    medium: { fontSize: '14px', marginTop: '4px' },
    large: { fontSize: '16px', marginTop: '6px' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          ...sizeStyles[size],
          color: '#1e3a8a', // Dark navy blue
          letterSpacing: '-0.5px',
        }}
      >
        Rivo
      </div>
      {showSubtitle && (
        <div
          style={{
            ...subtitleStyles[size],
            color: '#64748b', // Light grey
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Rideshare
        </div>
      )}
    </div>
  );
};

export default Logo;

