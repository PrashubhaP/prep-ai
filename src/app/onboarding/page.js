import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  await connectDB();

  const user = await User.findOne({ clerkId: userId });

  if (user?.profileCompleted) {
    redirect("/dashboard");
  }

  return <OnboardingForm />;
}