import { useEffect, useState } from 'react';
import { useAuthContext } from '@asgardeo/auth-react';

export interface UserAuthInfo {
  email: string | null;
  roles: string[];
  isRider: boolean;
  isDriver: boolean;
  isLoading: boolean;
}

export const useAuth = (): UserAuthInfo => {
  const { state, getDecodedIDToken } = useAuthContext();
  const [email, setEmail] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserInfo = async () => {
      if (!state.isAuthenticated) {
        setEmail(null);
        setRoles([]);
        setIsLoading(false);
        return;
      }

      try {
        const payload: any = await getDecodedIDToken();
        
        // Extract email from payload
        const userEmail = payload?.email || payload?.sub || null;
        
        // Extract roles from payload
        const tokenRoles: string[] =
          (payload?.roles as string[]) ||
          (payload?.role ? [payload.role] : []) ||
          [];

        setEmail(userEmail);
        setRoles(tokenRoles);
      } catch (err) {
        console.error('Failed to decode ID token', err);
        setEmail(null);
        setRoles([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserInfo();
  }, [state.isAuthenticated, getDecodedIDToken]);

  return {
    email,
    roles,
    isRider: roles.includes('rider'),
    isDriver: roles.includes('driver'),
    isLoading,
  };
};
