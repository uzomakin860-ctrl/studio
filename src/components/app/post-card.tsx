
'use client';

import type { Post, UserProfile } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, MessageCircle, Gift, Share, MoreHorizontal, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirestore, updateDocumentNonBlocking, deleteDocumentNonBlocking, useDoc, useMemoFirebase } from '@/firebase';
import { doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

export function PostCard({ post }: { post: Post }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const currentUserProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, `users/${user.uid}`) : null),
    [user, firestore]
  );
  const { data: currentUserProfile } = useDoc<UserProfile>(currentUserProfileRef);

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !post || !firestore) return;
    const currentUserRef = doc(firestore, 'users', user.uid);
    const targetUserRef = doc(firestore, 'users', post.userId);
    updateDocumentNonBlocking(currentUserRef, { following: arrayUnion(post.userId) });
    updateDocumentNonBlocking(targetUserRef, { followers: arrayUnion(user.uid) });
  };

  const handleUnfollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !post || !firestore) return;
    const currentUserRef = doc(firestore, 'users', user.uid);
    const targetUserRef = doc(firestore, 'users', post.userId);
    updateDocumentNonBlocking(currentUserRef, { following: arrayRemove(post.userId) });
    updateDocumentNonBlocking(targetUserRef, { followers: arrayRemove(user.uid) });
  };


  const handleUpvote = () => {
    if (!user || !firestore) return;
    const postRef = doc(firestore, 'posts', post.id);
    const isUpvoted = post.upvotes.includes(user.uid);
    const isDownvoted = post.downvotes?.includes(user.uid);

    let newUpvotes = [...post.upvotes];
    let newDownvotes = [...(post.downvotes || [])];

    if (isUpvoted) {
      newUpvotes = newUpvotes.filter(uid => uid !== user.uid);
    } else {
      newUpvotes.push(user.uid);
      if (isDownvoted) {
        newDownvotes = newDownvotes.filter(uid => uid !== user.uid);
      }
    }
    updateDocumentNonBlocking(postRef, { upvotes: newUpvotes, downvotes: newDownvotes });
  };
  
  const handleDownvote = () => {
    if (!user || !firestore) return;
    const postRef = doc(firestore, 'posts', post.id);
    const isUpvoted = post.upvotes.includes(user.uid);
    const isDownvoted = post.downvotes?.includes(user.uid);

    let newUpvotes = [...post.upvotes];
    let newDownvotes = [...(post.downvotes || [])];

    if (isDownvoted) {
      newDownvotes = newDownvotes.filter(uid => uid !== user.uid);
    } else {
      newDownvotes.push(user.uid);
      if (isUpvoted) {
        newUpvotes = newUpvotes.filter(uid => uid !== user.uid);
      }
    }
    updateDocumentNonBlocking(postRef, { upvotes: newUpvotes, downvotes: newDownvotes });
  };

  const handleDeletePost = () => {
    if (!user || !firestore || user.uid !== post.userId) return;
    const postRef = doc(firestore, 'posts', post.id);
    deleteDocumentNonBlocking(postRef);
    toast({
        title: "Post Deleted",
        description: "Your post has been successfully deleted.",
    });
  };

  const isFollowing = currentUserProfile?.following?.includes(post.userId);
  const isCurrentUserPost = user?.uid === post.userId;

  const isUpvoted = user ? post.upvotes.includes(user.uid) : false;
  const isDownvoted = user ? post.downvotes?.includes(user.uid) : false;
  const voteCount = (post.upvotes?.length || 0) - (post.downvotes?.length || 0);

  const timeAgo = post.createdAt?.seconds
  ? formatDistanceToNow(new Date(post.createdAt.seconds * 1000), { addSuffix: true })
  : 'just now';


  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
             <Link href={`/u/${post.username}`}>
              <Avatar className="h-8 w-8">
                  <AvatarImage src={post.userProfileUrl} />
                  <AvatarFallback>{post.username[0]}</AvatarFallback>
              </Avatar>
             </Link>
            <div className="flex-1 min-w-0">
                <Link href={`/post/${post.id}`} passHref>
                  <CardTitle className="text-base hover:underline truncate">{post.title}</CardTitle>
                </Link>
                <CardDescription>
                  <div className="flex items-center gap-2 text-xs">
                    <Link href={`/u/${post.username}`} className="hover:underline">{post.username}</Link>
                    {!isCurrentUserPost && user && (
                      <>
                        <span>·</span>
                        {isFollowing ? (
                           <button onClick={handleUnfollow} className="font-semibold text-primary hover:underline">Following</button>
                        ) : (
                           <button onClick={handleFollow} className="font-semibold text-primary hover:underline">Follow</button>
                        )}
                      </>
                    )}
                    <span>·</span>
                    <span>{timeAgo}</span>
                  </div>
                </CardDescription>
            </div>
          </div>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Share className="mr-2 h-4 w-4" />
                <span>Share</span>
              </DropdownMenuItem>
              {user && user.uid === post.userId && (
                <>
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your
                          post from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeletePost}
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
       {post.imageUrl && (
        <Link href={`/post/${post.id}`} passHref>
            <div className="px-6">
                <Image src={post.imageUrl} alt={post.title} width={600} height={400} className="w-full object-cover rounded-md border" />
            </div>
        </Link>
      )}
      <CardContent className={cn(post.imageUrl && "pt-4")}>
        <p className="whitespace-pre-wrap line-clamp-6">{post.content}</p>
        <div className="flex gap-2 flex-wrap mt-4">
            {post.tags?.map(tag => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 px-4 py-2 flex justify-start items-center gap-1">
         <Button 
            variant='ghost' 
            size="sm" 
            onClick={handleUpvote}
            className={cn("flex items-center gap-1.5", isUpvoted && "text-primary")}
         >
            <ArrowUp className="h-4 w-4" />
         </Button>
         <span className={cn("font-semibold text-xs", isUpvoted && "text-primary", isDownvoted && "text-destructive")}>{voteCount}</span>
         <Button 
            variant='ghost' 
            size="sm" 
            onClick={handleDownvote}
            className={cn("flex items-center gap-1.5", isDownvoted && "text-destructive")}
         >
            <ArrowDown className="h-4 w-4" />
         </Button>
        
        <Button variant="ghost" size="sm" className="flex items-center gap-1.5 ml-4" asChild>
          <Link href={`/post/${post.id}`}>
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">{post.comments?.length || 0}</span>
          </Link>
        </Button>

        {post.donations && (post.donations.cashAppName || post.donations.phoneNumber) && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
                <Gift className="h-4 w-4" />
                <span className="text-xs hidden sm:inline">Donate</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Donate to {post.username}</AlertDialogTitle>
                <AlertDialogDescription>
                  You can support this creator using the following methods.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4 space-y-2">
                {post.donations.cashAppName && (
                  <div>
                    <p className="font-semibold">Cash App:</p>
                    <p className="text-sm text-muted-foreground">{post.donations.cashAppName}</p>
                  </div>
                )}
                {post.donations.phoneNumber && (
                   <div>
                    <p className="font-semibold">Phone:</p>
                    <p className="text-sm text-muted-foreground">{post.donations.phoneNumber}</p>
                  </div>
                )}
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Close</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
          <Share className="h-4 w-4" />
          <span className="text-xs hidden sm:inline">Share</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
