"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, User, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../../../components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useSession, signOut } from "next-auth/react"

const navLinks = [
  { href: "/", label: "Главная" },
  { href: "/map", label: "Карта", badge: "Pre-alpha" },
  { href: "/list", label: "Список", badge: "Beta" },
]

export default function Nav() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-[4rem]">
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
                  {link.badge && (
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
                  )}
                  {isActive(link.href) && (
                    <span className="absolute inset-x-3 -bottom-1 h-0.5 rounded bg-primary/80" aria-hidden="true" />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Auth - Desktop */}
          <div className="hidden md:flex items-center gap-3 w-48">
            {!isClient ? (
              <div className="w-20 h-8 bg-muted animate-pulse rounded" />
            ) : status === "loading" ? (
              <div className="w-20 h-8 bg-muted animate-pulse rounded" />
            ) : session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 ml-auto">
                    <User className="h-4 w-4" />
                    <span className="text-sm truncate max-w-32">
                      {session.user.email}
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Мой профиль
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={async () => {
                      await signOut({ redirect: false })
                      router.replace("/")
                      router.refresh()
                    }}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default" size="sm" className="gap-2 ml-auto">
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
                  {!isClient ? (
                    <div className="flex flex-col gap-3">
                      <div className="w-32 h-4 bg-muted animate-pulse rounded" />
                      <div className="w-full h-10 bg-muted animate-pulse rounded" />
                    </div>
                  ) : status === "loading" ? (
                    <div className="flex flex-col gap-3">
                      <div className="w-32 h-4 bg-muted animate-pulse rounded" />
                      <div className="w-full h-10 bg-muted animate-pulse rounded" />
                    </div>
                  ) : session?.user ? (
                    <div className="flex flex-col gap-3">
                      <div className="text-sm text-muted-foreground truncate">{session.user.email}</div>
                      <div className="flex flex-col gap-2">
                        <Button asChild className="w-full" size="lg" variant="outline">
                          <Link href="/profile" onClick={() => setMobileOpen(false)}>
                            <User className="mr-2 h-4 w-4" />
                            Мой профиль
                          </Link>
                        </Button>
                        <Button
                          className="w-full cursor-pointer"
                          size="lg"
                          variant="destructive"
                          onClick={async () => {
                            setMobileOpen(false)
                            await signOut({ redirect: false })
                            router.replace("/")
                            router.refresh()
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Выйти
                        </Button>
                      </div>
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
