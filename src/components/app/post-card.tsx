
'use client';

import type { Post } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUp, MessageCircle, Gift } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
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

export function PostCard({ post }: { post: Post }) {
  const { user } = useUser();
  const firestore = useFirestore();

  const handleUpvote = () => {
    if (!user || !firestore) return;
    const postRef = doc(firestore, 'posts', post.id);
    const isUpvoted = post.upvotes.includes(user.uid);

    let newUpvotes;
    if (isUpvoted) {
      newUpvotes = post.upvotes.filter(uid => uid !== user.uid);
    } else {
      newUpvotes = [...post.upvotes, user.uid];
    }
    updateDocumentNonBlocking(postRef, { upvotes: newUpvotes });
  };
  
  const isUpvoted = user ? post.upvotes.includes(user.uid) : false;

  const timeAgo = post.createdAt?.seconds
  ? formatDistanceToNow(new Date(post.createdAt.seconds * 1000), { addSuffix: true })
  : 'just now';


  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1.5">
            <CardTitle>{post.title}</CardTitle>
            <CardDescription>
              <div className="flex items-center gap-2 text-xs">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={post.userProfileUrl} />
                  <AvatarFallback>{post.username[0]}</AvatarFallback>
                </Avatar>
                <span>{post.username}</span>
                <span>·</span>
                <span>{timeAgo}</span>
              </div>
            </CardDescription>
          </div>
          <div className="flex flex-col items-center gap-1">
             <Button 
                variant={isUpvoted ? 'default' : 'ghost'} 
                size="sm" 
                onClick={handleUpvote}
                className="flex items-center gap-1.5"
             >
                <ArrowUp className={cn("h-4 w-4", isUpvoted && "text-primary-foreground")} />
                <span>{post.upvotes?.length || 0}</span>
             </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap line-clamp-6">{post.content}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
         <div className="flex gap-2 flex-wrap">
            {post.tags?.map(tag => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
        </div>
        <div className="flex items-center gap-2">
            {post.donations && (post.donations.cashAppName || post.donations.phoneNumber) && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                    <Gift className="h-4 w-4 text-green-500" />
                    <span>Donate</span>
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
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments?.length || 0}</span>
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
