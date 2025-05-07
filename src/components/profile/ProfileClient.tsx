"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ExternalLink, Mail, User } from "lucide-react";
import { redirect } from "next/navigation";
import { useDispatch } from "react-redux";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import { useAppSelector } from "@/lib/hooks";
import { login, logout } from "@/lib/features/auth/authSlice";
import { toast } from "@/components/ui/use-toast";

interface UserProfile {
  username: string;
  email: string;
  linkedinUrl?: string;
  profileImage?: string;
}

export default function ProfileClient() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dispatch = useDispatch();
  // Attempt to get user from Redux first for potentially faster load
  const reduxUser = useAppSelector((state) => state.auth.user);

  const fetchProfile = useCallback(async () => {
    // If profile is already loaded from Redux, use it initially
    if (reduxUser && !profile) {
      setProfile({
        username: reduxUser.username,
        email: reduxUser.email,
        linkedinUrl: reduxUser.linkedinUrl,
        profileImage: reduxUser.profileImage,
      });
      setIsLoading(false);
      return;
    }


    setIsLoading(true);
    setError(null);
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      dispatch(logout());
      redirect('/login');
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/profile`, {
        headers: { "Authorization": `Bearer ${accessToken}` }
      });

      if (!response.ok) {
        if (response.status === 401) {
          dispatch(logout());
          throw new Error("Unauthorized. Please log in again.");
        }
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }

      const data = await response.json();
      setProfile({
        username: data.username,
        email: data.email,
        linkedinUrl: data.linkedinProfileUrl, // Adjust key based on backend response
        profileImage: data.profileImage || "/placeholder.svg?height=200&width=200", // Use placeholder if missing
      });
      // Update Redux store if it wasn't already populated or needs refresh
      if (!reduxUser || reduxUser.email !== data.email) {
        dispatch(login(data));
      }

    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(err.message || "Failed to load profile.");
      if (err.message.includes("Unauthorized")) {
        toast({
          title: "Session Expired",
          description: "Please log in again.",
          variant: "destructive",
        });
        redirect('/login');
      } else {
        toast({
          title: "Error",
          description: err.message || "Could not load profile.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, profile, reduxUser]);

  useEffect(() => {
    fetchProfile();
  }, []);

  // --- Render Logic ---

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-6 md:flex-row">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="flex flex-1 flex-col space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-5 w-3/4" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-5 w-3/4" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-5 w-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !profile) { // Only show full error if profile couldn't load at all
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (!profile) {
    return <div className="text-center">Could not load profile data.</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{`${profile.username}'s Profile`}</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <div className="relative h-32 w-32 overflow-hidden rounded-full bg-muted">
              <Image
                src={profile.profileImage || "https://placehold.co/200/png"} // Use placeholder
                alt={profile.username || "User profile"}
                fill
                className="object-cover text-center"
                priority
                sizes="(max-width: 768px) 128px, 128px"
              />
            </div>
            <div className="flex flex-1 flex-col space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Username</span>
                </div>
                <p className="font-medium">{profile.username}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </div>
                <p className="font-medium">{profile.email}</p>
              </div>

              {profile.linkedinUrl && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ExternalLink className="h-4 w-4" />
                    <span>LinkedIn URL</span>
                  </div>
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline break-all"
                  >
                    {profile.linkedinUrl}
                  </a>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
