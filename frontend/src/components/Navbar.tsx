import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '@asgardeo/auth-react';
import Logo from './Logo';

interface NavbarProps {
  userType: 'driver' | 'rider';
}

const Navbar: React.FC<NavbarProps> = ({ userType }) => {
  const { signOut } = useAuthContext();
  const location = useLocation();
  const homePath = userType === 'driver' ? '/driver' : '/rider';
  const accountPath = userType === 'driver' ? '/driver/account' : '/rider/account';

  const isHomeActive = location.pathname === homePath;
  const isAccountActive = location.pathname === accountPath;

  const navStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    padding: '20px 40px',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const leftSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  };

  const dividerStyle: React.CSSProperties = {
    height: '32px',
    width: '1px',
    backgroundColor: '#e5e7eb',
    marginLeft: '20px',
    marginRight: '20px',
  };

  const navLinksStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  };

  const linkStyle: React.CSSProperties = {
    textDecoration: 'none',
    color: '#1f2937',
    fontSize: '16px',
    fontWeight: 500,
    padding: '8px 16px',
    borderRadius: '6px',
    transition: 'background-color 0.2s',
  };

  const activeLinkStyle: React.CSSProperties = {
    ...linkStyle,
    backgroundColor: '#eff6ff',
    color: '#3b82f6',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '12px 24px',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 500,
    transition: 'background-color 0.2s',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  };

  return (
    <nav style={navStyle}>
      <div style={leftSectionStyle}>
        <Logo size="medium" showSubtitle={false} />
        <div style={dividerStyle} />
        <div style={navLinksStyle}>
          <Link
            to={homePath}
            style={isHomeActive ? activeLinkStyle : linkStyle}
            onMouseEnter={(e) => {
              if (!isHomeActive) {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }
            }}
            onMouseLeave={(e) => {
              if (!isHomeActive) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            Home
          </Link>
          <Link
            to={accountPath}
            style={isAccountActive ? activeLinkStyle : linkStyle}
            onMouseEnter={(e) => {
              if (!isAccountActive) {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }
            }}
            onMouseLeave={(e) => {
              if (!isAccountActive) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            Account
          </Link>
        </div>
      </div>
      <div style={{ marginLeft: '32px' }}>
        <button
          onClick={() => signOut()}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#4b5563';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#6b7280';
          }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
