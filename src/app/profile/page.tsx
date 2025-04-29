"use client"

import { useState } from "react"
import Image from "next/image"
import { ExternalLink, Mail, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AppLayout from "@/components/layout/app-layout"

export default function ProfilePage() {
  // In a real app, you would get this from Redux state
  const [user] = useState({
    name: "John Doe",
    email: "john@example.com",
    linkedinUrl: "https://linkedin.com/in/johndoe",
    profileImage: "/placeholder.svg?height=200&width=200",
  })

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold">Profile</h1>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>LinkedIn Profile</CardTitle>
            <CardDescription>Your profile information from LinkedIn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-6 md:flex-row">
              <div className="relative h-32 w-32 overflow-hidden rounded-full">
                <Image src={user.profileImage || "/placeholder.svg"} alt={user.name} fill className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Full Name</span>
                  </div>
                  <p className="font-medium">{user.name}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </div>
                  <p className="font-medium">{user.email}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ExternalLink className="h-4 w-4" />
                    <span>LinkedIn URL</span>
                  </div>
                  <a
                    href={user.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    {user.linkedinUrl}
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
