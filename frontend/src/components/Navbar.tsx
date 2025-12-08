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

  return (
    <nav className="bg-white px-10 py-5 border-b border-gray-200 shadow-sm flex justify-between items-center">
      <div className="flex items-center gap-5">
        <Logo size="medium" showSubtitle={false} />
        <div className="h-8 w-px bg-gray-200" />
        <div className="flex items-center gap-6 ml-5">
          <Link
            to={homePath}
            className={`no-underline text-base font-medium px-4 py-2 rounded-md transition-colors ${
              isHomeActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Home
          </Link>
          <Link
            to={accountPath}
            className={`no-underline text-base font-medium px-4 py-2 rounded-md transition-colors ${
              isAccountActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Account
          </Link>
        </div>
      </div>
      <div>
        <button
          onClick={() => signOut()}
          className="px-6 py-3 bg-gray-500 text-white border-none rounded-lg cursor-pointer text-base font-medium transition-colors shadow-sm hover:bg-gray-600"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
