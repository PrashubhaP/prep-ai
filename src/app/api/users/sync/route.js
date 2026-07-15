import { auth, currentUser } from "@clerk/nextjs/server";

import { getOrCreateUser } from "@/server/services/user.service";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const clerkUser = await currentUser();
    const user = await getOrCreateUser(userId, clerkUser);

    return Response.json({ success: true, user });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
