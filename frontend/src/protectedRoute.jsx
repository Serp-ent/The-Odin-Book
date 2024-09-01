import { Navigate } from "react-router-dom";
import { useAuth } from "./authContext";

export default function ProtectedRoute({ element, requireUnlogged = false }) {
  const auth = useAuth();

  if (auth.loading) {
    return <div>Loading...</div>
  }

  if (requireUnlogged) {
    return !auth.isAuthenticated ? element : <Navigate to={'/'} />
  }

  return auth.isAuthenticated ? element : <Navigate to={'/login'} />
}
