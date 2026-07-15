import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { findUserByClerkId } from "@/server/services/user.service";
import { OnboardingForm } from "@/features/onboarding/OnboardingForm";

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const user = await findUserByClerkId(userId);

  if (user?.profileCompleted) {
    redirect("/dashboard");
  }

  return <OnboardingForm />;
}
