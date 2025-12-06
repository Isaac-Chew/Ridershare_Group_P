// src/pages/Login.tsx
import { useAuthContext } from "@asgardeo/auth-react";
import { Link } from "react-router-dom";

const Login: React.FC = () => {
  const { state, signIn, signOut } = useAuthContext();

  return (
    <div className="App">
      <h1>Rideshare Login</h1>

      {!state.isAuthenticated && (
        <>
          <p>Please sign in to access your rides.</p>
          <button onClick={() => signIn()}>Sign in with Asgardeo</button>
        </>
      )}

      {state.isAuthenticated && (
        <>
          <p>
            You’re signed in. Go to your{" "}
            <Link to="/rider">Rider page</Link>.
          </p>
          <button onClick={() => signOut()}>Sign out</button>
        </>
      )}
    </div>
  );
};

export default Login;
