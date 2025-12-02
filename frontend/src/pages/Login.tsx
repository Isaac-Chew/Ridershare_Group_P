// src/pages/Login.tsx
import { SignedIn, SignedOut, SignInButton, SignOutButton } from "@asgardeo/react";
import { Link } from "react-router-dom";

const Login: React.FC = () => {
  return (
    <div className="App">
      <h1>Rideshare Login</h1>

      <SignedOut>
        <p>Please sign in to access your rides.</p>
        <SignInButton>Sign in with Asgardeo</SignInButton>
      </SignedOut>

      <SignedIn>
        <p>
          You’re already signed in. Go to your{" "}
          <Link to="/rider">Rider page</Link>.
        </p>
        <SignOutButton>Sign Out</SignOutButton>
      </SignedIn>
    </div>
  );
};

export default Login;
