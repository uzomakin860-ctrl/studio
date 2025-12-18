'use client';

import { useRef, useEffect, useState } from 'react';
import type { Video } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Music, Send, Bookmark, CheckCircle2 } from 'lucide-react';
import { CommentsSheet } from './comments-sheet';
import { useUser, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';


function formatCount(num: number) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num;
}

export function VideoPost({ video, isActive }: { video: Video, isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (isActive) {
      videoRef.current?.play().catch(error => console.error("Video play failed:", error));
    } else {
      videoRef.current?.pause();
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
    }
  }, [isActive]);

  const handleLike = () => {
    if (!user || !firestore) return;
    const videoRef = doc(firestore, 'videos', video.id);
    const isLiked = video.likes.includes(user.uid);

    let newLikes;
    if (isLiked) {
      newLikes = video.likes.filter(uid => uid !== user.uid);
    } else {
      newLikes = [...video.likes, user.uid];
    }
    updateDocumentNonBlocking(videoRef, { likes: newLikes });
  };
  
  const isLiked = user ? video.likes.includes(user.uid) : false;

  return (
    <>
      <div className="h-full w-full snap-center relative flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src={video.videoUrl}
          loop
          playsInline
          // Muted for autoplay policy compliance
          muted
          onClick={(e) => {
            e.preventDefault();
            if (videoRef.current) {
               videoRef.current.muted = !videoRef.current.muted;
            }
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <p className="text-white/50 text-3xl font-bold">{videoRef.current?.muted ? 'Tap to unmute' : ''}</p>
        </div>
        
        <div className="absolute bottom-20 left-0 right-0 p-4 text-white z-10 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex justify-between items-end">
            {/* Left side: User Info & Caption */}
            <div className="flex-1 pr-4 space-y-3">
              <div className="flex items-center gap-2 font-bold text-lg">
                @{video.username}
                {video.isVerified && <CheckCircle2 className="w-4 h-4 text-blue-400" fill="white" />}
              </div>
              <div className="text-sm">{video.caption}</div>
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                <div className="text-sm marquee w-40"><p>{video.song}</p></div>
              </div>
            </div>

            {/* Right side: Action Buttons */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-col items-center">
                <Avatar className="w-12 h-12 border-2 border-white">
                  <AvatarImage src={video.userProfileUrl} />
                  <AvatarFallback>{video.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                 <Button size="icon" variant="ghost" className="rounded-full bg-primary -mt-4 w-6 h-6 text-white text-xs hover:bg-primary/80">+</Button>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Button size="icon" variant="ghost" className="rounded-full text-white hover:bg-white/20 hover:text-white" onClick={handleLike}>
                  <Heart className={cn("w-8 h-8", isLiked && "fill-red-500 text-red-500")} />
                </Button>
                <span className="text-sm font-bold">{formatCount(video.likes?.length || 0)}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                 <Button size="icon" variant="ghost" className="rounded-full text-white hover:bg-white/20 hover:text-white" onClick={() => setIsCommentsOpen(true)}>
                  <MessageCircle className="w-8 h-8" />
                </Button>
                <span className="text-sm font-bold">{formatCount(video.comments?.length || 0)}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                 <Button size="icon" variant="ghost" className="rounded-full text-white hover:bg-white/20 hover:text-white">
                  <Bookmark className="w-8 h-8" />
                </Button>
                <span className="text-sm font-bold">{formatCount(video.shares)}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                 <Button size="icon" variant="ghost" className="rounded-full text-white hover:bg-white/20 hover:text-white">
                  <Send className="w-8 h-8" />
                </Button>
                <span className="text-sm font-bold">Share</span>
              </div>
               <div className="w-12 h-12 mt-2 rounded-full bg-gray-800 animate-spin-slow flex items-center justify-center">
                   <Avatar className="w-8 h-8">
                      <AvatarImage src={video.userProfileUrl} />
                      <AvatarFallback />
                   </Avatar>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CommentsSheet 
        isOpen={isCommentsOpen} 
        onOpenChange={setIsCommentsOpen} 
        video={video}
      />
    </>
  );
}
