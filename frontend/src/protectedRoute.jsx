import { Navigate } from "react-router-dom";
import { useAuth } from "./authContext";

export default function ProtectedRoute({ element }) {
  const auth = useAuth();

  return auth.isAuthenticated ? element : <Navigate to={'/login'} />
}
