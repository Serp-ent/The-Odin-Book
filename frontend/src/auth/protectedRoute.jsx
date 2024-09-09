import { Navigate } from "react-router-dom";
import { useAuth } from "./authContext";
import { ClipLoader } from "react-spinners";

export default function ProtectedRoute({ element, requireUnlogged = false }) {
  const auth = useAuth();

  if (auth.loading) {
    return (
      <div className="flex justify-center items-center">
        <ClipLoader size={50} />
      </div>
    )
  }

  if (requireUnlogged) {
    return !auth.isAuthenticated ? element : <Navigate to={'/'} />
  }

  return auth.isAuthenticated ? element : <Navigate to={'/login'} />
}
