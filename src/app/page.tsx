"use client";

import {
  Home as HomeIcon,
  User,
  Compass,
  Inbox,
  PlusSquare,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUser, useMemoFirebase } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy }from 'firebase/firestore';
import type { Video } from "@/lib/types";
import { VideoPost } from "@/components/app/video-post";
import { BottomNavItem } from "@/components/app/bottom-nav-item";


export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const videosQuery = useMemoFirebase(
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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, clientHeight } = container;
      const index = Math.round(scrollTop / clientHeight);
      setCurrentVideoIndex(index);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-svh bg-black">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-svh w-full bg-black flex flex-col">
      <main ref={containerRef} className="flex-1 h-full snap-y snap-mandatory overflow-y-scroll">
        {areVideosLoading && (
          <div className="h-full w-full flex items-center justify-center text-white">
            <p>Loading videos...</p>
          </div>
        )}

        {!areVideosLoading && videos && videos.length > 0 ? (
            videos.map((video, index) => (
              <VideoPost key={video.id} video={video} isActive={index === currentVideoIndex} />
            ))
        ) : (
          !areVideosLoading && (
            <div className="h-full w-full flex items-center justify-center text-white snap-center">
              <div className="text-center">
                <p className="text-lg font-semibold">No videos yet</p>
                <p className="text-sm text-gray-400">Be the first to upload a video!</p>
                <Button asChild className="mt-4" variant="default">
                  <Link href="/upload">Upload Video</Link>
                </Button>
              </div>
            </div>
          )
        )}
      </main>
      <footer className="absolute bottom-0 w-full bg-black/30 border-t border-gray-800 p-2 z-20">
          <div className="flex justify-around items-center max-w-xl mx-auto">
            <BottomNavItem href="/" icon={<HomeIcon className="w-7 h-7" />} label="Home" isActive />
            <BottomNavItem href="#" icon={<Compass className="w-7 h-7" />} label="Discover" />
            <Link href="/upload">
              <div className="bg-white rounded-lg px-4 py-1.5 shadow-[0_0px_8px_theme(colors.secondary),0_0px_8px_theme(colors.primary)] hover:scale-105 transition-transform">
                <PlusSquare className="w-8 h-8 text-black" />
              </div>
            </Link>
            <BottomNavItem href="#" icon={<Inbox className="w-7 h-7" />} label="Inbox" />
            <BottomNavItem href="#" icon={<User className="w-7 h-7" />} label="Profile" />
          </div>
        </footer>
    </div>
  );
}
