
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Gift, Share, ArrowLeft, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirestore, updateDocumentNonBlocking, useDoc, useMemoFirebase } from '@/firebase';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
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
import Link from 'next/link';
import type { Post, Comment } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';


function CommentCard({ comment }: { comment: Comment }) {
  const timeAgo = comment.createdAt?.seconds
    ? formatDistanceToNow(new Date(comment.createdAt.seconds * 1000), { addSuffix: true })
    : 'just now';

  return (
    <div className="flex items-start gap-3">
       <Link href={`/u/${comment.username}`}>
        <Avatar className="h-8 w-8">
            <AvatarImage src={comment.userProfileUrl} />
            <AvatarFallback>{comment.username[0]}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1">
        <div className="flex items-center gap-2 text-xs">
           <Link href={`/u/${comment.username}`} className="font-bold hover:underline">{comment.username}</Link>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{timeAgo}</span>
        </div>
        <p className="text-sm mt-1">{comment.text}</p>
      </div>
    </div>
  )
}


export default function PostPage({ params }: { params: { postId: string } }) {
  const { postId } = params;
  const { user } = useUser();
  const firestore = useFirestore();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const postRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'posts', postId) : null),
    [firestore, postId]
  );
  const { data: post, isLoading } = useDoc<Post>(postRef);

  if (isLoading || !post) {
    return <div className="container mx-auto max-w-3xl p-4 text-center">Loading...</div>;
  }
  
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

  const handleAddComment = async () => {
    if (!user || !postRef || !commentText.trim()) return;
    setIsSubmitting(true);
    
    const newComment: Comment = {
      id: uuidv4(),
      userId: user.uid,
      username: user.email?.split('@')[0] || 'anonymous',
      userProfileUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/100`,
      text: commentText.trim(),
      createdAt: serverTimestamp(),
    };

    const updatedComments = [...(post.comments || []), newComment];
    
    // Using await with updateDoc to make sure it completes
    try {
        await updateDoc(postRef, { comments: updatedComments });
        setCommentText('');
    } catch (error) {
        console.error("Error adding comment: ", error);
        // Optionally show a toast to the user
    } finally {
        setIsSubmitting(false);
    }
  };


  const isUpvoted = user ? post.upvotes.includes(user.uid) : false;
  const isDownvoted = user ? post.downvotes?.includes(user.uid) : false;
  const voteCount = (post.upvotes?.length || 0) - (post.downvotes?.length || 0);

  const postDate = post.createdAt?.seconds
  ? format(new Date(post.createdAt.seconds * 1000), 'PPP')
  : 'a while ago';

  return (
     <div className="container mx-auto max-w-3xl p-4 pb-24">
       <header className="relative flex items-center mb-4">
        <Link href="/" passHref className="absolute left-0 top-1/2 -translate-y-1/2">
          <Button variant="ghost" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
      </header>
       <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
               <Link href={`/u/${post.username}`}>
                <Avatar className="h-8 w-8">
                    <AvatarImage src={post.userProfileUrl} />
                    <AvatarFallback>{post.username[0]}</AvatarFallback>
                </Avatar>
               </Link>
              <div>
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-2 text-sm">
                      <Link href={`/u/${post.username}`} className="hover:underline">{post.username}</Link>
                      <span>·</span>
                      <span>{postDate}</span>
                    </div>
                  </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{post.content}</p>
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
           <span className={cn("font-semibold text-sm", isUpvoted && "text-primary", isDownvoted && "text-destructive")}>{voteCount}</span>
           <Button 
              variant='ghost' 
              size="sm" 
              onClick={handleDownvote}
              className={cn("flex items-center gap-1.5", isDownvoted && "text-destructive")}
           >
              <ArrowDown className="h-4 w-4" />
           </Button>
          
           <div className="flex items-center gap-1.5 ml-4">
            <span className="text-sm font-semibold">{post.comments?.length || 0}</span>
            <span className="text-sm text-muted-foreground">Comments</span>
           </div>

          {post.donations && (post.donations.cashAppName || post.donations.phoneNumber) && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
                  <Gift className="h-4 w-4" />
                  <span className="text-sm hidden sm:inline">Donate</span>
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
            <span className="text-sm hidden sm:inline">Share</span>
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-6 space-y-6">
        <h2 className="text-lg font-bold">Comments ({post.comments?.length || 0})</h2>
        <div className="relative">
          <Textarea 
            placeholder="Add a comment..." 
            className="pr-16" 
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <Button 
            size="icon" 
            className="absolute right-2 top-2 h-9 w-9" 
            onClick={handleAddComment}
            disabled={isSubmitting || !commentText.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-8">
            {post.comments && post.comments.length > 0 ? (
                [...post.comments].sort((a,b) => b.createdAt.seconds - a.createdAt.seconds).map((comment) => (
                    <CommentCard key={comment.id} comment={comment} />
                ))
            ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No comments yet. Be the first to reply!</p>
            )}
        </div>
      </div>
    </div>
  );
}
