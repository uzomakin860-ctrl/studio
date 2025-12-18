"use client";

import {
  Home as HomeIcon,
  User,
  Heart,
  MessageCircle,
  Send,
  Music,
  Compass,
  Inbox,
  PlusSquare,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy }from 'firebase/firestore';
import type { Video } from "@/lib/types";

function VideoPost({ video }: { video: Video }) {
  return (
    <div className="h-full w-full snap-center relative flex items-center justify-center bg-black">
      <video
        className="h-full w-full object-cover"
        src={video.videoUrl}
        loop
        autoPlay
        playsInline
        muted
      />
      
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
        <div className="flex justify-between items-end">
          {/* Left side: User Info & Caption */}
          <div className="flex-1 pr-4">
            <div className="font-bold">@{video.username}</div>
            <div className="text-sm">{video.caption}</div>
            <div className="flex items-center gap-2 mt-2">
              <Music className="w-4 h-4" />
              <div className="text-sm">{video.song}</div>
            </div>
          </div>

          {/* Right side: Action Buttons */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col items-center">
              <Avatar className="w-12 h-12 border-2 border-white">
                <AvatarImage src={video.userProfileUrl} />
                <AvatarFallback>{video.username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
               <Button size="icon" variant="ghost" className="rounded-full bg-primary -mt-4 w-6 h-6 text-white text-xs">+</Button>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Button size="icon" variant="ghost" className="rounded-full text-white hover:bg-white/20 hover:text-white">
                <Heart className="w-8 h-8" />
              </Button>
              <span className="text-xs font-bold">{video.likes}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
               <Button size="icon" variant="ghost" className="rounded-full text-white hover:bg-white/20 hover:text-white">
                <MessageCircle className="w-8 h-8" />
              </Button>
              <span className="text-xs font-bold">{video.comments}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
               <Button size="icon" variant="ghost" className="rounded-full text-white hover:bg-white/20 hover:text-white">
                <Send className="w-8 h-8" />
              </Button>
              <span className="text-xs font-bold">{video.shares}</span>
            </div>
             <div className="w-12 h-12 rounded-full bg-gray-800 animate-spin-slow">
                 <Avatar className="w-12 h-12">
                    <AvatarImage src={video.userProfileUrl} />
                 </Avatar>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const BottomNavItem = ({
  href,
  icon,
  label,
  isActive = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
}) => (
  <Link href={href}>
    <div
      className={cn(
        "flex flex-col items-center gap-1 text-xs text-gray-400 hover:text-white",
        isActive && "text-white font-bold"
      )}
    >
      {icon}
      {label}
    </div>
  </Link>
);


export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const videosQuery = useMemo(
    () =>
      firestore
        ? (query(
            collection(firestore, 'videos'),
            orderBy('createdAt', 'desc')
          ) as any)
        : null,
    [firestore]
  );
  const { data: videos, isLoading: areVideosLoading } = useCollection<Video>(videosQuery);


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const [currentVideo, setCurrentVideo] = useState(0);

  useEffect(() => {
    const handleScroll = (event: WheelEvent) => {
      if (!videos) return;
      if (event.deltaY > 0) {
        // scroll down
        setCurrentVideo(v => Math.min(v + 1, videos.length - 1));
      } else {
        // scroll up
        setCurrentVideo(v => Math.max(v - 1, 0));
      }
    };
    
    const container = document.getElementById('video-container');
    container?.addEventListener('wheel', handleScroll);
    
    return () => container?.removeEventListener('wheel', handleScroll);

  }, [videos]);


  return (
    <div className="h-svh w-full bg-black flex flex-col">
      <main id="video-container" className="flex-1 h-full snap-y snap-mandatory overflow-hidden">
        {areVideosLoading && (
          <div className="h-full w-full flex items-center justify-center text-white">
            <p>Loading videos...</p>
          </div>
        )}

        {!areVideosLoading && videos && videos.length > 0 ? (
          <div
            className="h-full transition-transform duration-500"
            style={{ transform: `translateY(-${currentVideo * 100}%)` }}
          >
            {videos.map((video) => (
              <VideoPost key={video.id} video={video} />
            ))}
          </div>
        ) : (
          !areVideosLoading && (
            <div className="h-full w-full flex items-center justify-center text-white">
              <p>No videos yet. Be the first to upload!</p>
            </div>
          )
        )}
      </main>
      <footer className="bg-black border-t border-gray-800 p-2 z-20">
          <div className="flex justify-around items-center">
            <BottomNavItem href="/" icon={<HomeIcon className="w-6 h-6" />} label="Home" isActive />
            <BottomNavItem href="#" icon={<Compass className="w-6 h-6" />} label="Discover" />
            <Link href="/upload">
              <div className="bg-white rounded-lg px-4 py-1.5 shadow-[0_0px_8px_theme(colors.secondary),0_0px_8px_theme(colors.primary)]">
                <PlusSquare className="w-8 h-8 text-black" />
              </div>
            </Link>
            <BottomNavItem href="#" icon={<Inbox className="w-6 h-6" />} label="Inbox" />
            <BottomNavItem href="#" icon={<User className="w-6 h-6" />} label="Profile" />
          </div>
        </footer>
    </div>
  );
}
