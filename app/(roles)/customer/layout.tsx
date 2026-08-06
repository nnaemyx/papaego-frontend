"use client";

import { RequireAuth } from "@/components/auth/RequireAuth";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth allowedRoles={["CUSTOMER", "ORG_OWNER", "ORG_ADMIN"]} redirectTo="/business/auth/signin">
      {children}
    </RequireAuth>
  );
}
