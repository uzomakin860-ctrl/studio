
'use client';

import { ArrowLeft, UserPlus, MessageCircle, ArrowUp, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Notification } from '@/lib/types';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Card } from '@/components/ui/card';

function NotificationItem({ notification }: { notification: Notification }) {
    const timeAgo = formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true });
    
    const getIcon = () => {
        switch(notification.type) {
            case 'follow': return <UserPlus className="h-5 w-5 text-blue-500" />;
            case 'comment': return <MessageCircle className="h-5 w-5 text-green-500" />;
            case 'upvote': return <ArrowUp className="h-5 w-5 text-red-500" />;
            default: return <BellRing className="h-5 w-5" />;
        }
    }
    
    const getText = () => {
        switch(notification.type) {
            case 'follow': return <><span className="font-bold">{notification.senderUsername}</span> started following you.</>;
            case 'comment': return <><span className="font-bold">{notification.senderUsername}</span> commented on your post: <span className="italic">"{notification.postTitle}"</span></>;
            case 'upvote': return <><span className="font-bold">{notification.senderUsername}</span> upvoted your post: <span className="italic">"{notification.postTitle}"</span></>;
            default: return "You have a new notification.";
        }
    }

    const content = (
        <div className="flex items-start gap-4 p-4">
            <div className="mt-1">
                {getIcon()}
            </div>
            <div className="flex-1">
                <p className="text-sm">{getText()}</p>
                <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
            </div>
            <Avatar className="h-10 w-10">
                <AvatarImage src={notification.senderProfileUrl} />
                <AvatarFallback>{notification.senderUsername?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
        </div>
    )

    if (notification.postId) {
        return (
            <Link href={`/post/${notification.postId}`}>
                <Card className="hover:bg-accent transition-colors">
                    {content}
                </Card>
            </Link>
        )
    }

    return (
         <Link href={`/u/${notification.senderUsername}`}>
            <Card className="hover:bg-accent transition-colors">
                {content}
            </Card>
        </Link>
    )
}


export default function NotificationsPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const notificationsQuery = useMemoFirebase(
        () => user ? query(
            collection(firestore, 'notifications'), 
            where('recipientId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(50)
        ) : null,
        [user, firestore]
    );
    const { data: notifications, isLoading } = useCollection<Notification>(notificationsQuery);


  return (
    <div className="container mx-auto max-w-2xl p-4">
      <header className="relative flex items-center justify-center mb-8">
        <Link href="/" passHref className="absolute left-0">
          <Button variant="ghost" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Notifications</h1>
      </header>
      
      {isLoading && <div className="text-center">Loading notifications...</div>}

      {!isLoading && notifications?.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <BellRing className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium">No notifications yet</h3>
            <p className="text-sm text-muted-foreground">
            You'll see notifications about your posts and comments here.
            </p>
        </div>
      )}

      {notifications && notifications.length > 0 && (
        <div className="space-y-3">
            {notifications.map(notification => (
                <NotificationItem key={notification.id} notification={notification} />
            ))}
        </div>
      )}
    </div>
  );
}
