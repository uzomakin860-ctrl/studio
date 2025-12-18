
"use client";

import { Plus, MessageCircle, ArrowUp, Search, Bell, Menu, Heart, LogOut, User as UserIcon, Shirt, FileText, Trophy, DollarSign, Shield, Moon, Settings, Megaphone, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUser, useMemoFirebase, useAuth } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy } from 'firebase/firestore';
import type { Post } from "@/lib/types";
import { PostCard } from "@/components/app/post-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { signOut } from "firebase/auth";
import { Switch } from "@/components/ui/switch";

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const auth = useAuth();

  const postsQuery = useMemoFirebase(
    () =>
      firestore
        ? (query(
            collection(firestore, 'posts'),
            orderBy('createdAt', 'desc')
          ) as any)
        : null,
    [firestore]
  );
  const { data: posts, isLoading: arePostsLoading } = useCollection<Post>(postsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  if (isUserLoading || arePostsLoading) {
    return (
      <div className="flex items-center justify-center min-h-svh">
        <p>Loading...</p>
      </div>
    );
  }
  
  const username = user?.email?.split('@')[0];

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Menu />
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
              <Link href="/notifications">
                <Bell />
              </Link>
            </Button>
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
                    Enjoying the app? You can show your support by sending a tip to the creator. Every little bit helps!
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4 space-y-2">
                  <div>
                    <p className="font-semibold">Bkash:</p>
                    <p className="text-sm text-muted-foreground">01308766555</p>
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photoURL || ''} />
                    <AvatarFallback>{username?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
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
                    <DropdownMenuItem>
                        <Shirt className="mr-3" />
                        <span>Edit Avatar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <FileText className="mr-3" />
                        <span>Drafts</span>
                    </DropdownMenuItem>
                     <DropdownMenuItem className="flex flex-col items-start !p-3">
                         <div className="flex items-center w-full">
                            <Trophy className="mr-3" />
                            <span>Achievements</span>
                         </div>
                        <p className="text-xs text-muted-foreground ml-9">2 unlocked</p>
                    </DropdownMenuItem>
                     <DropdownMenuItem className="flex flex-col items-start !p-3">
                         <div className="flex items-center w-full">
                            <DollarSign className="mr-3" />
                            <span>Earn</span>
                         </div>
                        <p className="text-xs text-muted-foreground ml-9">Earn cash</p>
                    </DropdownMenuItem>
                     <DropdownMenuItem>
                        <Shield className="mr-3" />
                        <span>Premium</span>
                    </DropdownMenuItem>
                     <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Moon className="mr-3" />
                        <span>Dark Mode</span>
                        <Switch className="ml-auto" />
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-3" />
                  <span>Log out</span>
                </DropdownMenuItem>
                 <DropdownMenuSeparator />
                 <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <Megaphone className="mr-3" />
                        <span>Advertise</span>
                    </DropdownMenuItem>
                     <DropdownMenuItem>
                        <Clock className="mr-3" />
                        <span>Try Pro</span>
                         <span className="ml-auto text-xs font-bold text-orange-500">BETA</span>
                    </DropdownMenuItem>
                 </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <Settings className="mr-3" />
                    <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <h3 className="text-xl font-medium">No posts yet</h3>
              <p className="text-sm text-muted-foreground">
                Be the first to share a story or a problem.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/upload">Create Post</Link>
              </Button>
            </div>
          )}
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground">
        <p>Enjoying the app? Tip the creator! Bkash: 01308766555</p>
      </footer>
    </div>
  );
}
