"use client";

import { RequireAuth } from "@/components/auth/RequireAuth";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The parent (roles)/layout.tsx already provides Sidebar + Header for CUSTOMER role.
  // This layout only adds role-specific auth protection.
  return (
    <RequireAuth requiredRole="CUSTOMER" redirectTo="/customer-auth/signin">
      {children}
    </RequireAuth>
  );
}
