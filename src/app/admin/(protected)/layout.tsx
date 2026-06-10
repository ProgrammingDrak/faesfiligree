import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getAdminEmail } from "@/lib/auth";

export const metadata = {
  title: "Admin",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Belt-and-suspenders on top of middleware + Clerk's allowlist: only
  // allow-listed admin emails may render the portal.
  const email = await getAdminEmail();
  if (!email) {
    redirect("/admin/login?denied=1");
  }

  return (
    <div className="flex min-h-screen bg-charcoal/95">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
