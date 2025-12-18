
"use client";

import { Plus, MessageCircle, ArrowUp, Search, Bell, Menu } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUser, useMemoFirebase } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy } from 'firebase/firestore';
import type { Post } from "@/lib/types";
import { PostCard } from "@/components/app/post-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

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

  if (isUserLoading || arePostsLoading) {
    return (
      <div className="flex items-center justify-center min-h-svh">
        <p>Loading...</p>
      </div>
    );
  }

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
            <Button variant="ghost" size="icon">
              <Search />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.photoURL || ''} />
              <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
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
