import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { OnboardingForm } from "@/features/onboarding/OnboardingForm";

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  // Reachable both for first-time onboarding (the dashboard funnels new users
  // here) and for existing users updating their resume, so we don't redirect
  // completed profiles away.
  return <OnboardingForm />;
}
