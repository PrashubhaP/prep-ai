import { auth, currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST() {
  try {
    // Get logged-in user
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user details from Clerk
    const clerkUser = await currentUser();

    // Connect to MongoDB
    await connectDB();

    // Check if user already exists
    let user = await User.findOne({ clerkId: userId });

    // Create new user if not found
    if (!user) {
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

    return Response.json({
      success: true,
      user,
    });

  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}