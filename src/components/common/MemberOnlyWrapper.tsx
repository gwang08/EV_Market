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
      console.log("🔐 MemberOnlyWrapper - Checking authentication and role...");
      
      const authenticated = isAuthenticated();
      
      if (!authenticated) {
        console.log("⚠️ MemberOnlyWrapper - Not authenticated, redirecting to:", fallbackUrl);
        router.push(fallbackUrl);
        return;
      }
      
      const userRole = getUserRole();
      console.log("👤 MemberOnlyWrapper - User role:", userRole);
      
      // Only MEMBER can access
      if (userRole !== "MEMBER") {
        console.log("⚠️ MemberOnlyWrapper - Not a MEMBER, redirecting admin to /admin");
        router.push("/admin");
        return;
      }
      
      console.log("✅ MemberOnlyWrapper - Authorization successful");
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
