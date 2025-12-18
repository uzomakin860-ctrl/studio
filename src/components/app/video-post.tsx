'use client';

import { useRef, useEffect } from 'react';
import type { Video } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Music, Send } from 'lucide-react';

export function VideoPost({ video, isActive }: { video: Video, isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

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
    <div className="h-full w-full snap-center relative flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        src={video.videoUrl}
        loop
        playsInline
        muted
      />
      
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10 bg-gradient-to-t from-black/50 to-transparent">
        <div className="flex justify-between items-end">
          {/* Left side: User Info & Caption */}
          <div className="flex-1 pr-4 space-y-2">
            <div className="font-bold text-lg">@{video.username}</div>
            <div className="text-sm">{video.caption}</div>
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4" />
              <div className="text-smmarquee w-32"><p>{video.song}</p></div>
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
              <span className="text-sm font-bold">{video.likes}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
               <Button size="icon" variant="ghost" className="rounded-full text-white hover:bg-white/20 hover:text-white">
                <MessageCircle className="w-8 h-8" />
              </Button>
              <span className="text-sm font-bold">{video.comments}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
               <Button size="icon" variant="ghost" className="rounded-full text-white hover:bg-white/20 hover:text-white">
                <Send className="w-8 h-8" />
              </Button>
              <span className="text-sm font-bold">{video.shares}</span>
            </div>
             <div className="w-12 h-12 mt-2 rounded-full bg-gray-800 animate-spin-slow flex items-center justify-center">
                 <Avatar className="w-10 h-10">
                    <AvatarImage src={video.userProfileUrl} />
                    <AvatarFallback />
                 </Avatar>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
