import { Navigate } from "react-router-dom";
import { useAppSelector } from "../store/hook";
import { ROUTES, STORAGE_KEYS } from "../utils/constants";

// This is a protected route that checks if the user is authenticated
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

  // If the token doesn't exist and not authenticated, redirect to Signin
  if (!token && !isAuthenticated) {
    return <Navigate to={ROUTES.SIGNIN} replace />;
  }

  return children; // If there's a token, render the protected route
};

export default ProtectedRoute;
