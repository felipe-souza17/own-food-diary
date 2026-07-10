import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { ShareButton } from "@/components/share/share-button";

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-end gap-3 border-b border-zinc-200 bg-white/80 px-4 backdrop-blur sm:px-6">
      <ShareButton />

      <div className="hidden items-center gap-3 sm:flex">
        <div className="h-6 w-px bg-zinc-200" />
        <span
          className="max-w-48 truncate text-sm text-zinc-500"
          title={session?.user?.email ?? ""}
        >
          {session?.user?.email}
        </span>
      </div>

      <SignOutButton />
    </header>
  );
}
