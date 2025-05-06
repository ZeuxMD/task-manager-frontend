"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, User, LogOut, Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppSelector } from "@/lib/hooks"
import { logout } from "@/lib/features/auth/authSlice"
import { useDispatch } from "react-redux"

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const dispatch = useDispatch();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true)
      } else {
        setIsSidebarOpen(false)
      }
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Profile", href: "/profile", icon: User },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar toggle */}
      <Button variant="ghost" size="icon" className="fixed left-4 top-4 z-50 md:hidden" onClick={toggleSidebar}>
        {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      {/* Sidebar backdrop for mobile */}
      {isMobile && isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={closeSidebarOnMobile} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-card shadow-lg transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex h-full flex-col">
          {/* User profile section */}
          <div className="flex items-center gap-3 border-b p-4">
            <Avatar>
              {user?.profileImage && <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.username} />}
              <AvatarFallback>{user?.username.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{user?.username || "name"}</span>
              <span className="text-xs text-muted-foreground">{user?.email}</span>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 space-y-1 p-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeSidebarOnMobile}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Logout button */}
          <div className="border-t p-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => {
                console.log("Logging out...")
                dispatch(logout())
                window.location.href = "/login"
              }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
    </div>
  )
}
