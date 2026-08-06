"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

interface RequireAuthProps {
  children: React.ReactNode;
  requiredRole?: string;
  allowedRoles?: string[];
  redirectTo?: string;
}

// Get default redirect based on role
function getDefaultRedirect(requiredRole?: string): string {
  if (requiredRole === "AGENT") return "/agent/login";
  if (requiredRole === "ADMIN") return "/admin/login";
  if (requiredRole === "BUSINESS" || requiredRole === "ORG_OWNER") return "/business/auth/signin";
  return "/login";
}

export function RequireAuth({
  children,
  requiredRole,
  allowedRoles,
  redirectTo,
}: RequireAuthProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const defaultRedirect = getDefaultRedirect(requiredRole);
  const finalRedirect = redirectTo || defaultRedirect;

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasAccess = (): boolean => {
    if (!user) return false;
    if (allowedRoles && allowedRoles.length > 0) {
      return allowedRoles.includes(user.role);
    }
    if (requiredRole) {
      if (requiredRole === "CUSTOMER") {
        return ["CUSTOMER", "ORG_OWNER", "ORG_ADMIN"].includes(user.role);
      }
      return user.role === requiredRole;
    }
    return true;
  };

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated) {
      router.push(finalRedirect);
      return;
    }

    if (!hasAccess()) {
      router.push("/unauthorized");
    }
  }, [mounted, isAuthenticated, user, requiredRole, finalRedirect, router]);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
          <p className="text-gray-600">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
