"use client";

import {
  Plus,
  Search,
  Bell,
  Heart,
  Shirt,
  FileText,
  Trophy,
  Moon,
  Settings,
  Ghost,
  Inbox,
} from "lucide-react";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useTheme } from "next-themes";

import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import type { Post } from "@/lib/types";
import { PostCard } from "@/components/app/post-card";

export default function Home() {
  // ---------------- SAFE MOUNT ----------------
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null; // Prevents hydration errors

  // ---------------- THEME ----------------
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  // ---------------- FIRESTORE ----------------
  const firestore = useFirestore();

  // ---------------- POSTS QUERY (SAFE) ----------------
  const postsQuery = useMemoFirebase(() => {
    if (!firestore) return null;

    // safe query: orders by createdAt but limits to 50 posts
    return query(
      collection(firestore, "posts"),
      orderBy("createdAt", "desc"),
      limit(50)
    );
  }, [firestore]);

  const { data: posts = [], isLoading } = useCollection<Post>(postsQuery);

  const username = "guest"; // Open Mode: no login needed

  // ---------------- LOADING ----------------
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-svh">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      {/* ---------------- HEADER ---------------- */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Ghost />
            </Button>
            <h1 className="text-xl font-bold">Feed</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/upload">
                <Plus />
              </Link>
            </Button>

            <Button variant="ghost" size="icon" asChild>
              <Link href="/search">
                <Search />
              </Link>
            </Button>

            <Button variant="ghost" size="icon" asChild>
              <Link href="/inbox">
                <Inbox />
              </Link>
            </Button>

            <Button variant="ghost" size="icon" asChild>
              <Link href="/notifications">
                <Bell />
              </Link>
            </Button>

            {/* Support */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Heart className="text-red-500" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Support the Creator</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tip the creator if you enjoy the app.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <p className="font-semibold">Bkash:</p>
                  <p className="text-sm text-muted-foreground">01308766555</p>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-64" align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex flex-col items-start !p-3">
                      <p className="text-base font-medium">View Profile</p>
                      <p className="text-xs text-muted-foreground">u/{username}</p>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/profile/edit">
                      <Shirt className="mr-3" />
                      Edit Profile
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/drafts">
                      <FileText className="mr-3" />
                      Drafts
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/achievements">
                      <Trophy className="mr-3" />
                      Achievements
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem>
                    <Moon className="mr-3" />
                    Dark Mode
                    <Switch className="ml-auto" checked={isDark} onCheckedChange={toggleTheme} />
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-3" />
                    Settings
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto p-4 md:p-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {posts.length > 0 ? (
            posts.map((post) =>
              post?.id ? <PostCard key={post.id} post={post} /> : null
            )
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <h3 className="text-xl font-medium">No posts yet</h3>
              <p className="text-sm text-muted-foreground">
                Be the first to share something.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/upload">Create Post</Link>
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground">
        <p>Tip the creator — Bkash: 01308766555</p>
      </footer>
    </div>
  );
              }
