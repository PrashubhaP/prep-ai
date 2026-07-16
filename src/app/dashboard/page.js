import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getOrCreateUser } from "@/server/services/user.service";
import { getLatestResume } from "@/server/services/resume.service";
import { getInterviewStats } from "@/server/services/interview.service";
import { Dashboard } from "@/features/dashboard/Dashboard";

// Mongoose documents can't cross the server/client boundary directly.
const serialize = (doc) => (doc ? JSON.parse(JSON.stringify(doc)) : null);

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div className="p-10 text-muted">Please sign in.</div>;
  }

  const clerkUser = await currentUser();
  const user = await getOrCreateUser(userId, clerkUser);

  if (!user.profileCompleted) {
    redirect("/onboarding");
  }

  const [resume, stats] = await Promise.all([
    getLatestResume(userId),
    getInterviewStats(userId),
  ]);

  return (
    <Dashboard
      user={serialize(user)}
      resume={serialize(resume)}
      stats={serialize(stats)}
    />
  );
}
