import { Navigate } from "react-router-dom";
import { useAuth } from "./authContext";

export default function ProtectedRoute({ element }) {
  const auth = useAuth();

  if (auth.loading) {
    return <div>Loading...</div>
  }

  return auth.isAuthenticated ? element : <Navigate to={'/login'} />
}
