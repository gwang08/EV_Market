"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getUserRole } from "../../services/Auth";

interface RoleAuthWrapperProps {
  children: React.ReactNode;
  allowedRoles: string[]; // e.g., ['ADMIN'], ['MEMBER'], or ['ADMIN', 'MEMBER']
  fallbackUrl?: string;
  roleRedirectMap?: Record<string, string>; // Optional: custom redirect per role
}

const RoleAuthWrapper: React.FC<RoleAuthWrapperProps> = ({ 
  children, 
  allowedRoles,
  fallbackUrl = "/login",
  roleRedirectMap = {}
}) => {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuthAndRole = () => {
      
      // First check if user is authenticated
      const authenticated = isAuthenticated();
      
      if (!authenticated) {
        router.push(fallbackUrl);
        return;
      }
      
      // Get user role
      const userRole = getUserRole();
     
      
      if (!userRole) {
        router.push(fallbackUrl);
        return;
      }
      
      // Check if user role is in allowed roles (case-insensitive)
      const normalizedUserRole = userRole.toUpperCase();
      const normalizedAllowedRoles = allowedRoles.map(role => role.toUpperCase());
      
      if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
        
        // If custom redirect for this role exists, use it
        if (roleRedirectMap[normalizedUserRole]) {
          const customRedirect = roleRedirectMap[normalizedUserRole];
          router.push(customRedirect);
        } else {
          // Default: redirect based on role
          const defaultRedirect = normalizedUserRole === 'ADMIN' ? '/admin' : '/';
          router.push(defaultRedirect);
        }
        return;
      }
      
      setIsAuthorized(true);
    };

    checkAuthAndRole();
  }, [router, allowedRoles, fallbackUrl, roleRedirectMap]);

  // If not authorized yet, don't render anything (will redirect)
  if (!isAuthorized) {
    return null;
  }

  // Render children immediately - they will show their own skeleton UI
  return <>{children}</>;
};

export default RoleAuthWrapper;
