import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, Show } from "@clerk/nextjs";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-glass-border bg-canvas/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-blue to-accent-violet">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </span>
          <span className="text-lg font-bold text-gradient">PrepAI</span>
        </Link>

        {/* Navigation & Auth */}
        <div className="flex items-center gap-6">
          <Show when="signed-in">
            <nav className="hidden sm:flex items-center gap-1">
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/interview">Interview</NavLink>
            </nav>
            <div className="h-5 w-px bg-glass-border hidden sm:block" />
            <UserButton />
          </Show>
          <Show when="signed-out">
            <div className="flex items-center gap-3">
              <SignInButton>
                <button className="px-4 py-2 text-sm font-medium text-ink-soft hover:text-ink transition-colors cursor-pointer">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="btn-gradient rounded-full px-5 py-2 text-sm cursor-pointer">
                  <span>Get Started</span>
                </button>
              </SignUpButton>
            </div>
          </Show>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }) {
  return (
    <Link
      href={href}
      className="relative px-3 py-2 text-sm font-medium text-muted hover:text-ink transition-colors group"
    >
      {children}
      <span className="absolute bottom-0 left-3 right-3 h-px bg-gradient-to-r from-accent-blue to-accent-violet scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
    </Link>
  );
}
