
'use client';

import { ArrowLeft, Search as SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import type { Post, UserProfile } from '@/lib/types';
import { useEffect, useState, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { PostCard } from '@/components/app/post-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


export default function SearchPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();


  useEffect(() => {
    if (!firestore) return;

    const performSearch = async () => {
      if (searchTerm.trim().length < 2) {
        setPosts([]);
        setUsers([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);

      // Search posts by title
      const postsQuery = query(
        collection(firestore, 'posts'),
        where('title', '==', searchTerm),
        limit(10)
      );

      // Search users by username
      const usersQuery = query(
        collection(firestore, 'users'),
        where('username', '==', searchTerm),
        limit(10)
      );

      try {
        const [postSnapshots, userSnapshots] = await Promise.all([
          getDocs(postsQuery),
          getDocs(usersQuery),
        ]);
        
        const foundPosts = postSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
        const foundUsers = userSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));

        setPosts(foundPosts);
        setUsers(foundUsers);
      } catch (error) {
        console.error("Error searching:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const handler = setTimeout(() => {
        startTransition(() => {
             performSearch();
        });
    }, 500); // Debounce search

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, firestore]);

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <header className="relative flex items-center justify-center mb-4">
        <Link href="/" passHref className="absolute left-0">
          <Button variant="ghost" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Search</h1>
      </header>

      <div className="relative mb-6">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search for posts or users..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
            <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
            {isSearching || isPending ? (
                 <div className="text-center p-8">Searching...</div>
            ) : searchTerm.trim().length < 2 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                    <h3 className="text-xl font-medium">Search for anything</h3>
                    <p className="text-sm text-muted-foreground">
                        Find posts by title or users by their username.
                    </p>
                </div>
            ) : posts.length > 0 ? (
                <div className="space-y-4 mt-6">
                    {posts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            ) : (
                 <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                    <h3 className="text-xl font-medium">No posts found</h3>
                    <p className="text-sm text-muted-foreground">
                        Try a different search term.
                    </p>
                </div>
            )}
        </TabsContent>
        <TabsContent value="users">
            {isSearching || isPending ? (
                 <div className="text-center p-8">Searching...</div>
            ) : searchTerm.trim().length < 2 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                    <h3 className="text-xl font-medium">Search for users</h3>
                    <p className="text-sm text-muted-foreground">
                       Find other members of the community by their username.
                    </p>
                </div>
            ) : users.length > 0 ? (
                <div className="space-y-2 mt-6">
                    {users.map(user => (
                        <Link href={`/u/${user.username}`} key={user.id}>
                            <Card className="hover:bg-accent">
                                <CardContent className="p-4 flex items-center gap-4">
                                     <Avatar className="h-10 w-10">
                                        <AvatarImage src={user.profilePictureUrl} />
                                        <AvatarFallback>{user.username?.[0].toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold">{user.username}</p>
                                        <p className="text-sm text-muted-foreground">{user.bio}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
             ) : (
                 <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                    <h3 className="text-xl font-medium">No users found</h3>
                    <p className="text-sm text-muted-foreground">
                       We couldn't find anyone with that username.
                    </p>
                </div>
            )}
        </TabsContent>
        </Tabs>
    </div>
  );
}
