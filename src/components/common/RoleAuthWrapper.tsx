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
      console.log('🔐 RoleAuthWrapper - Checking authentication and role...')
      
      // First check if user is authenticated
      const authenticated = isAuthenticated();
      
      if (!authenticated) {
        console.log('❌ RoleAuthWrapper - Not authenticated, redirecting to:', fallbackUrl)
        router.push(fallbackUrl);
        return;
      }
      
      // Get user role
      const userRole = getUserRole();
      console.log('👤 RoleAuthWrapper - User role:', userRole)
      console.log('✅ RoleAuthWrapper - Allowed roles:', allowedRoles)
      
      if (!userRole) {
        console.warn('⚠️ RoleAuthWrapper - No role found, redirecting to:', fallbackUrl)
        router.push(fallbackUrl);
        return;
      }
      
      // Check if user role is in allowed roles (case-insensitive)
      const normalizedUserRole = userRole.toUpperCase();
      const normalizedAllowedRoles = allowedRoles.map(role => role.toUpperCase());
      
      if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
        console.log('🚫 RoleAuthWrapper - User role not allowed')
        
        // If custom redirect for this role exists, use it
        if (roleRedirectMap[normalizedUserRole]) {
          const customRedirect = roleRedirectMap[normalizedUserRole];
          console.log('🔄 RoleAuthWrapper - Redirecting to custom URL for role:', customRedirect)
          router.push(customRedirect);
        } else {
          // Default: redirect based on role
          const defaultRedirect = normalizedUserRole === 'ADMIN' ? '/admin' : '/';
          console.log('🔄 RoleAuthWrapper - Redirecting to default URL for role:', defaultRedirect)
          router.push(defaultRedirect);
        }
        return;
      }
      
      console.log('✅ RoleAuthWrapper - User authorized')
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
