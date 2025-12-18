'use client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Heart, ThumbsDown, MessageSquareReply, Smile, AtSign, Image as ImageIcon } from "lucide-react";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";


const placeholderComments = [
  {
    id: 1,
    user: {
      name: 'lofi',
      avatarUrl: 'https://picsum.photos/seed/1/40/40',
      isVerified: true,
    },
    text: 'I think I met my dad in 1985:',
    image: 'https://picsum.photos/seed/10/200/200',
    likes: 26800,
    time: '18h',
    replies: 21,
  },
  {
    id: 2,
    user: {
      name: 'Ben Dover',
      avatarUrl: 'https://picsum.photos/seed/2/40/40',
    },
    text: 'This is hilarious!',
    likes: 1500,
    time: '12h',
    replies: 5,
  },
    {
    id: 3,
    user: {
      name: 'Jane Smith',
      avatarUrl: 'https://picsum.photos/seed/3/40/40',
    },
    text: 'OMG so true 😂',
    likes: 543,
    time: '10h',
    replies: 2,
  },
    {
    id: 4,
    user: {
      name: 'Mike',
      avatarUrl: 'https://picsum.photos/seed/4/40/40',
    },
    text: 'I can\'t stop watching this.',
    likes: 2000,
    time: '9h',
    replies: 10,
  }
];

function formatCount(num: number) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num;
}

export const CommentsSheet = ({ isOpen, onOpenChange, commentCount }: { isOpen: boolean, onOpenChange: (isOpen: boolean) => void, commentCount: number }) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-background text-foreground h-[80%] rounded-t-2xl flex flex-col p-0">
        <SheetHeader className="p-4 text-center">
          <SheetTitle>{formatCount(commentCount)} comments</SheetTitle>
        </SheetHeader>
        <Separator />
        <ScrollArea className="flex-1 px-4 py-2">
            <div className="space-y-6">
                {placeholderComments.map(comment => (
                    <div key={comment.id} className="flex items-start gap-3">
                        <Avatar className="w-8 h-8">
                            <AvatarImage src={comment.user.avatarUrl} />
                            <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="text-xs text-muted-foreground">{comment.user.name}</p>
                            <p className="text-sm">{comment.text}</p>
                            {comment.image && <img src={comment.image} alt="comment image" className="mt-2 rounded-lg w-32"/>}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                <span>{comment.time}</span>
                                <Button variant="link" size="sm" className="p-0 h-auto text-muted-foreground">Reply</Button>
                            </div>
                            {comment.replies > 0 && <Button variant="link" size="sm" className="p-0 h-auto text-muted-foreground text-xs">View {comment.replies} replies</Button>}
                        </div>
                        <div className="flex flex-col items-center gap-1 text-muted-foreground">
                            <Heart className="w-4 h-4"/>
                            <span className="text-xs">{formatCount(comment.likes)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
        <Separator />
        <div className="p-4 bg-background">
            <div className="relative">
                <Input placeholder="Add comment..." className="bg-secondary border-none rounded-full pr-24" />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <ImageIcon className="text-muted-foreground cursor-pointer" />
                    <Smile className="text-muted-foreground cursor-pointer" />
                    <AtSign className="text-muted-foreground cursor-pointer" />
                </div>
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
