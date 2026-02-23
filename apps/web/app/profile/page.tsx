import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <div className="rounded-lg border p-6">
          <p className="text-muted-foreground">
            Welcome, {session.user.name || session.user.email}. Profile settings coming soon.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
