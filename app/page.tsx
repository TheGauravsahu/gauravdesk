import LandingPage from "@/components/LandingPage";
import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  let initialUser: { name?: string | null; email?: string | null } | null = null;

  try {
    const sessionRes = await auth.getSession();
    if (sessionRes?.data?.user) {
      initialUser = {
        name: sessionRes.data.user.name,
        email: sessionRes.data.user.email,
      };
    }
  } catch (err) {
    // If session check fails or unauthenticated, initialUser remains null
  }

  return <LandingPage initialUser={initialUser} />;
}
