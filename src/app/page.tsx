"use client";

import {
  Home as HomeIcon,
  Users,
  Inbox,
  User,
  Search,
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
  const [activeTab, setActiveTab] = useState('foryou');

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
    <div className="h-svh w-full bg-black flex flex-col relative">
      <header className="absolute top-0 left-0 right-0 z-20 flex justify-center items-center h-16 bg-gradient-to-b from-black/50 to-transparent text-white">
        <div className="flex items-center gap-6 text-lg font-semibold">
          <button 
            onClick={() => setActiveTab('friends')}
            className={activeTab === 'friends' ? 'text-white' : 'text-gray-400'}
          >
            Friends
          </button>
          <div className="relative">
            <button 
              onClick={() => setActiveTab('foryou')}
              className={activeTab === 'foryou' ? 'text-white' : 'text-gray-400'}
            >
              For You
            </button>
            {activeTab === 'foryou' && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>}
          </div>
        </div>
        <div className="absolute right-4">
          <Search className="w-6 h-6" />
        </div>
      </header>

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
      <footer className="absolute bottom-0 w-full bg-black border-t border-gray-800/50 px-2 pt-2 pb-4 z-20">
          <div className="flex justify-around items-center max-w-xl mx-auto">
            <BottomNavItem href="/" icon={<HomeIcon className="w-6 h-6" />} label="Home" isActive />
            <BottomNavItem href="#" icon={<Users className="w-6 h-6" />} label="Friends" />
            <Link href="/upload">
              <div className="bg-white rounded-lg px-4 py-1.5 shadow-[0_0px_8px_theme(colors.secondary),0_0px_8px_theme(colors.primary)] hover:scale-105 transition-transform">
                 <svg height="28" viewBox="0 0 44 28" width="44" className="text-black"><path clipRule="evenodd" d="m29.382 0v11.121h11.121v5.758h-11.121v11.121h-5.758v-11.121h-11.121v-5.758h11.121v-11.121z" fill="currentColor" fillRule="evenodd"></path></svg>
              </div>
            </Link>
            <BottomNavItem href="#" icon={<Inbox className="w-6 h-6" />} label="Inbox" hasBadge />
            <BottomNavItem href="#" icon={<User className="w-6 h-6" />} label="Profile" />
          </div>
        </footer>
    </div>
  );
}
