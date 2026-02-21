import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setNavigateRef } from '../lib/axiosInterceptors';

/**
 * Invisible component that lives inside <Router> and
 * stores the navigate function so axios interceptors can redirect.
 */
export default function NavigationSetter() {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigateRef(navigate);
  }, [navigate]);

  return null;
}
