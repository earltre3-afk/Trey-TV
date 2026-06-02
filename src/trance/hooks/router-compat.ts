import { useNavigate as useTsNavigate, useParams as useTsParams, useLocation as useTsLocation } from '@tanstack/react-router';

export const useNavigate = () => {
  const navigate = useTsNavigate();
  return (to: string | number, options?: { replace?: boolean; state?: any }) => {
    if (typeof to === 'number') {
      window.history.go(to);
    } else {
      void navigate({ 
        to: to as any, 
        replace: options?.replace 
      });
    }
  };
};

export const useParams = <T extends Record<string, string>>() => {
  return (useTsParams as any)({ strict: false }) as T;
};

export const useLocation = () => {
  const location = useTsLocation();
  return {
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
    state: null,
  };
};
