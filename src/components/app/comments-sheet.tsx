'use client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Heart, Smile, AtSign, Image as ImageIcon } from "lucide-react";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import type { Video, Comment } from "@/lib/types";
import { useState } from "react";
import { useUser, useFirestore, updateDocumentNonBlocking } from "@/firebase";
import { doc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid'; // To generate unique IDs for comments


function formatCount(num: number) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num;
}

const CommentItem = ({ comment }: { comment: Comment }) => (
  <div className="flex items-start gap-3">
    <Avatar className="w-8 h-8">
      <AvatarImage src={comment.userProfileUrl} />
      <AvatarFallback>{comment.username[0]}</AvatarFallback>
    </Avatar>
    <div className="flex-1">
      <p className="text-xs text-muted-foreground">{comment.username}</p>
      <p className="text-sm">{comment.text}</p>
      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
        {/* We would need a date formatting function here for time */}
        {/* <span>{formatDistanceToNow(new Date(comment.createdAt.seconds * 1000), { addSuffix: true })}</span> */}
        <Button variant="link" size="sm" className="p-0 h-auto text-muted-foreground">Reply</Button>
      </div>
    </div>
    <div className="flex flex-col items-center gap-1 text-muted-foreground">
      <Heart className="w-4 h-4 cursor-pointer" />
      <span className="text-xs">{/* Placeholder for comment likes */}0</span>
    </div>
  </div>
);


export const CommentsSheet = ({ isOpen, onOpenChange, video }: { isOpen: boolean, onOpenChange: (isOpen: boolean) => void, video: Video }) => {
  const [newComment, setNewComment] = useState("");
  const { user } = useUser();
  const firestore = useFirestore();

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore || !newComment.trim()) return;

    const commentToAdd: Comment = {
      id: uuidv4(),
      userId: user.uid,
      username: user.email?.split('@')[0] || 'anonymous',
      userProfileUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/40`,
      text: newComment,
      createdAt: serverTimestamp(), // Will be converted on the server
    };
    
    const videoRef = doc(firestore, 'videos', video.id);
    
    // Add the new comment to the existing array
    const updatedComments = [...(video.comments || []), commentToAdd];

    updateDocumentNonBlocking(videoRef, { comments: updatedComments });

    setNewComment(""); // Reset input field
  };


  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-background text-foreground h-[80%] rounded-t-2xl flex flex-col p-0">
        <SheetHeader className="p-4 text-center">
          <SheetTitle>{formatCount(video.comments?.length || 0)} comments</SheetTitle>
        </SheetHeader>
        <Separator />
        <ScrollArea className="flex-1 px-4 py-2">
            <div className="space-y-6">
                {video.comments && video.comments.length > 0 ? (
                  [...video.comments].sort((a,b) => b.createdAt - a.createdAt).map(comment => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-10">
                    <p>No comments yet.</p>
                    <p className="text-sm">Be the first to comment!</p>
                  </div>
                )}
            </div>
        </ScrollArea>
        <Separator />
        <div className="p-4 bg-background">
            <form onSubmit={handleCommentSubmit} className="relative">
                <Input 
                  placeholder="Add comment..." 
                  className="bg-secondary border-none rounded-full pr-24" 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <ImageIcon className="text-muted-foreground cursor-pointer" />
                    <Smile className="text-muted-foreground cursor-pointer" />
                    <AtSign className="text-muted-foreground cursor-pointer" />
                </div>
                <Button type="submit" variant="ghost" size="sm" className="absolute right-14 top-1/2 -translate-y-1/2" disabled={!newComment.trim()}>Post</Button>
            </form>
        </div>
      </SheetContent>
    </Sheet>
  );
};
