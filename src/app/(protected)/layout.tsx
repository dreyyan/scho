import { auth } from "@/auth";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { redirect } from "next/navigation";

export const instant = false;

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="grid min-h-screen grid-cols-[12rem_1fr] grid-rows-[4rem_1fr]">
      <header className="col-span-2">
        <Header />
      </header>

      <aside>
        <Sidebar />
      </aside>

      <main
        className="
        min-w-0
        px-20 py-14
      "
      >
        {children}
      </main>
    </div>
  );
}
