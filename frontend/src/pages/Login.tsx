import { useAuthContext } from "@asgardeo/auth-react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const Login: React.FC = () => {
  const { state, signIn, getDecodedIDToken } = useAuthContext();
  const [roles, setRoles] = useState<string[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  // Load roles whenever user becomes authenticated
    useEffect(() => {
    const loadRoles = async () => {
      if (!state.isAuthenticated) {
        setRoles([]);
        setLoadingRoles(false);
        return;
      }

      try {
        const payload: any = await getDecodedIDToken();
        
        // Delete this line after debugging
        console.log("ID token payload:", payload);  

        const tokenRoles: string[] =
          (payload?.roles as string[]) ||
          (payload?.role as string[]) ||
          [];

        setRoles(tokenRoles);
      } catch (err) {
        console.error("Error decoding ID token:", err);
        setRoles([]);
      }

      setLoadingRoles(false);
    };

    loadRoles();
  }, [state.isAuthenticated, getDecodedIDToken]);

  // Auto-redirect based on role
  if (state.isAuthenticated && !loadingRoles) {
    if (roles.includes("rider")) return <Navigate to="/rider" replace />;
    if (roles.includes("driver")) return <Navigate to="/driver" replace />;

    // no role found:
    return <p>No role assigned. Contact admin.</p>;
  }

  return (
    <div className="App">
      <h1>Rideshare Login</h1>

      {!state.isAuthenticated && (
        <>
          <p>Please sign in to continue.</p>
          <button onClick={() => signIn()}>Sign in with Asgardeo</button>
        </>
      )}
    </div>
  );
};

export default Login;
