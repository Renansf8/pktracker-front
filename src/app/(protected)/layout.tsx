import { redirect } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { serverFetch, ServerFetchError } from "@/lib/api/server";
import { clearSession } from "@/lib/auth/session";
import type { User } from "@/services/api/types";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user: User | null = null;

  try {
    user = await serverFetch<User>("/users/me");
  } catch (err) {
    if (err instanceof ServerFetchError && err.status === 401) {
      await clearSession();
      redirect("/signin");
    }
    throw err;
  }

  return (
    <>
      <NavBar user={user} />
      <main>{children}</main>
    </>
  );
}
