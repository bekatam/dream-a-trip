"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useSession, signOut } from "next-auth/react"

const navLinks = [
  { href: "/", label: "Карта", badge: "Pre-alpha" },
  { href: "/list", label: "Список", badge: "Beta" },
]

export default function Nav() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-primary/10 p-1.5">
              <div className="h-full w-full rounded-md bg-gradient-to-br from-primary to-accent" />
            </div>
            <span className="hidden text-lg font-semibold sm:inline-block">TravelApp</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <div className="inline-flex items-center rounded-xl border bg-card p-1 shadow-sm">
              {navLinks.map((link, idx) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                    isActive(link.href)
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {link.label}
                  <Badge
                    variant={isActive(link.href) ? "default" : "secondary"}
                    className={cn(
                      "text-[10px] font-medium",
                      link.badge === "Beta" && (isActive(link.href) ? "bg-success/90 text-white border-0" : "bg-success/20 text-success"),
                      link.badge === "Pre-alpha" && (isActive(link.href) ? "bg-warning/90 text-white border-0" : "bg-warning/20 text-warning"),
                    )}
                  >
                    {link.badge}
                  </Badge>
                  {isActive(link.href) && (
                    <span className="absolute inset-x-3 -bottom-1 h-0.5 rounded bg-primary/80" aria-hidden="true" />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Auth - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {session?.user ? (
              <>
                <span className="text-sm text-muted-foreground">{session.user.email}</span>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2 cursor-pointer"
                  onClick={async () => {
                    await signOut({ redirect: false })
                    router.replace("/")
                    router.refresh()
                  }}
                >
                  Выйти
                </Button>
              </>
            ) : (
              <Button asChild variant="default" size="sm" className="gap-2">
                <Link href="/signin">Войти</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Открыть меню</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetHeader>
                <SheetTitle className="text-left">Навигация</SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-4 py-3 text-base font-medium transition-colors",
                      isActive(link.href)
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    )}
                  >
                    <span>{link.label}</span>
                    <Badge
                      variant={isActive(link.href) ? "default" : "secondary"}
                      className={cn(
                        "text-[10px] font-medium",
                        link.badge === "Beta" && "bg-success/20 text-success",
                        link.badge === "Pre-alpha" && "bg-warning/20 text-warning",
                      )}
                    >
                      {link.badge}
                    </Badge>
                  </Link>
                ))}
                <div className="mt-4 pt-4 border-t">
                  {session?.user ? (
                    <div className="flex flex-col gap-3">
                      <div className="text-sm text-muted-foreground truncate">{session.user.email}</div>
                      <Button
                        className="w-full cursor-pointer"
                        size="lg"
                        onClick={async () => {
                          setMobileOpen(false)
                          await signOut({ redirect: false })
                          router.replace("/")
                          router.refresh()
                        }}
                      >
                        Выйти
                      </Button>
                    </div>
                  ) : (
                    <Button asChild className="w-full" size="lg">
                      <Link href="/signin" onClick={() => setMobileOpen(false)}>
                        Войти
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
