import connectDB from "@/server/db";
import User from "@/server/models/User";

/**
 * Map a Clerk user object to our persisted user shape.
 */
function toUserDoc(clerkUser, userId) {
  return {
    clerkId: userId,
    firstName: clerkUser.firstName || "",
    lastName: clerkUser.lastName || "",
    email: clerkUser.emailAddresses[0].emailAddress,
    imageUrl: clerkUser.imageUrl || "",
  };
}

export async function findUserByClerkId(userId) {
  await connectDB();
  return User.findOne({ clerkId: userId });
}

/**
 * Return the existing user for this Clerk id, creating one on first sight.
 */
export async function getOrCreateUser(userId, clerkUser) {
  await connectDB();

  const existing = await User.findOne({ clerkId: userId });
  if (existing) {
    return existing;
  }

  return User.create({ ...toUserDoc(clerkUser, userId), profileCompleted: false });
}

export async function markProfileCompleted(userId) {
  await connectDB();
  return User.findOneAndUpdate({ clerkId: userId }, { profileCompleted: true });
}
