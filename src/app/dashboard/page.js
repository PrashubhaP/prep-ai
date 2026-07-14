import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Resume from "@/models/Resume";

import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {

    const { userId } = await auth();

    if (!userId) {
        return (
            <div className="p-10">
                Please sign in.
            </div>
        );
    }

    const clerkUser = await currentUser();

    await connectDB();

    let user = await User.findOne({
        clerkId: userId,
    });

    if (!user) {

        user = await User.create({

            clerkId: userId,
            firstName: clerkUser.firstName || "",
            lastName: clerkUser.lastName || "",
            email: clerkUser.emailAddresses[0].emailAddress,
            imageUrl: clerkUser.imageUrl || "",
            profileCompleted: false,

        });

    }

    if (!user.profileCompleted) {
        redirect("/onboarding");
    }

    const resume = await Resume.findOne({
        userId,
    }).sort({ createdAt: -1 });

    return (
        <DashboardClient
            user={JSON.parse(JSON.stringify(user))}
            resume={JSON.parse(JSON.stringify(resume))}
        />
    );

}