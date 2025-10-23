"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getUserRole } from "../../services/Auth";

interface MemberOnlyWrapperProps {
  children: React.ReactNode;
  fallbackUrl?: string;
}

/**
 * MemberOnlyWrapper - Chỉ cho phép MEMBER truy cập
 * Admin sẽ bị redirect về /admin
 * Guest sẽ bị redirect về /login
 */
const MemberOnlyWrapper: React.FC<MemberOnlyWrapperProps> = ({ 
  children, 
  fallbackUrl = "/login"
}) => {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      
      const authenticated = isAuthenticated();
      
      if (!authenticated) {
        router.push(fallbackUrl);
        return;
      }
      
      const userRole = getUserRole();
      
      // Only MEMBER can access
      if (userRole !== "MEMBER") {
        router.push("/admin");
        return;
      }
      
      setIsAuthorized(true);
    };

    checkAuth();
  }, [router, fallbackUrl]);

  // If not authorized yet, don't render anything (will redirect)
  if (!isAuthorized) {
    return null;
  }

  // Render children immediately - they will show their own skeleton UI
  return <>{children}</>;
};

export default MemberOnlyWrapper;
