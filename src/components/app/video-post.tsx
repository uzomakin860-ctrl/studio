'use client';

import { useRef, useEffect, useState } from 'react';
import type { Video } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Music, Send, Bookmark, CheckCircle2 } from 'lucide-react';
import { CommentsSheet } from './comments-sheet';

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

  useEffect(() => {
    if (isActive) {
      videoRef.current?.play();
    } else {
      videoRef.current?.pause();
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
    }
  }, [isActive]);

  return (
    <>
      <div className="h-full w-full snap-center relative flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src={video.videoUrl}
          loop
          playsInline
          muted
          onClick={() => videoRef.current?.paused ? videoRef.current?.play() : videoRef.current?.pause()}
        />
        
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
                <Button size="icon" variant="ghost" className="rounded-full text-white hover:bg-white/20 hover:text-white">
                  <Heart className="w-8 h-8" />
                </Button>
                <span className="text-sm font-bold">{formatCount(video.likes)}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                 <Button size="icon" variant="ghost" className="rounded-full text-white hover:bg-white/20 hover:text-white" onClick={() => setIsCommentsOpen(true)}>
                  <MessageCircle className="w-8 h-8" />
                </Button>
                <span className="text-sm font-bold">{formatCount(video.comments)}</span>
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
      <CommentsSheet isOpen={isCommentsOpen} onOpenChange={setIsCommentsOpen} commentCount={video.comments} />
    </>
  );
}
