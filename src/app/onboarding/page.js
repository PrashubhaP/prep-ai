import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage({ searchParams }) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  await connectDB();

  let user = await User.findOne({ clerkId: userId });

  // Create the user record here, the first time they ever land on onboarding.
  // Previously this only happened in dashboard/page.js, which meant it never
  // ran until AFTER the resume upload tried (and silently failed) to update it.
  if (!user) {
    const clerkUser = await currentUser();
    
        user = await User.create({
            clerkId: userId,
            firstName:
                clerkUser.firstName ||
                clerkUser.username ||
                clerkUser.emailAddresses[0]?.emailAddress?.split("@")[0] ||
                "User",
            lastName: clerkUser.lastName || "",
            email: clerkUser.emailAddresses[0].emailAddress,
            imageUrl: clerkUser.imageUrl || "",
            profileCompleted: false,
        });
  }

  const params = await searchParams;
  const isEditing = params?.edit === "true";

  // Only bounce to dashboard if profile is done AND they're not intentionally
  // here to update their resume.
  if (user.profileCompleted && !isEditing) {
    redirect("/dashboard");
  }

  return <OnboardingForm />;
}