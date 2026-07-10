import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  return (
    <div className="min-h-dvh">
      <Sidebar />
      <div className="lg:pl-60">
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
