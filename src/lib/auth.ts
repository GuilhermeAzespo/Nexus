import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function getServerAuthSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "supersecret"
    ) as { userId: string; email: string };
    
    return decoded;
  } catch (error) {
    return null;
  }
}
