"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Onboarding from "@/components/layout/Onboarding"; // ✅ FIXED: no {}

export default function RootPage() {
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const onboarded = localStorage.getItem("taskup_onboarded");
    const token = localStorage.getItem("taskup_token");

    if (token) {
      router.replace("/dashboard");
    } else if (onboarded !== "true") {
      setShowOnboarding(true);
    } else {
      router.replace("/login");
    }
  }, [router]);

  if (!showOnboarding) return null;

  return <Onboarding />;
}
