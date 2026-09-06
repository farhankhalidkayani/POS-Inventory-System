"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AcceptInviteForm } from "../../../features/team";

function AcceptInvitePageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <AcceptInviteForm token={token} />
    </main>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={null}>
      <AcceptInvitePageContent />
    </Suspense>
  );
}
