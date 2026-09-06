"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AcceptInviteForm } from "../../../features/team";
import { AuthLayout } from "../../../shared/components/layout/AuthLayout";

function AcceptInvitePageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return (
    <AuthLayout>
      <AcceptInviteForm token={token} />
    </AuthLayout>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={null}>
      <AcceptInvitePageContent />
    </Suspense>
  );
}
