"use client";

import {
  Home as HomeIcon,
  User,
  Upload,
  PlaySquare,
  Compass,
  Users,
} from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const videos = [
  {
    id: 1,
    user: {
      name: "CreativeCoder",
      avatar: "https://picsum.photos/seed/1/40/40",
    },
    description: "Just built this amazing Next.js app! #webdev #coding",
    videoUrl: "https://storage.googleapis.com/web-dev-assets/video-dark.mp4",
    likes: "1.2K",
    comments: "243",
    shares: "102",
  },
  {
    id: 2,
    user: {
      name: "DanceMachine",
      avatar: "https://picsum.photos/seed/2/40/40",
    },
    description: "New dance challenge! Can you do it? 💃🕺 #dance #challenge",
    videoUrl: "https://storage.googleapis.com/web-dev-assets/video-dark.mp4",
    likes: "5.6K",
    comments: "891",
    shares: "450",
  },
  {
    id: 3,
    user: {
      name: "FoodieFusion",
      avatar: "https://picsum.photos/seed/3/40/40",
    },
    description: "You HAVE to try this spicy ramen recipe! 🍜🔥 #food #recipe",
    videoUrl: "https://storage.googleapis.com/web-dev-assets/video-dark.mp4",
    likes: "3.1K",
    comments: "457",
    shares: "231",
  },
];

function VideoPost({ video }: { video: (typeof videos)[0] }) {
  return (
    <div className="h-full w-full snap-center relative flex justify-center">
      <video
        src={video.videoUrl}
        controls
        loop
        className="h-full object-contain"
      />
      <div className="absolute bottom-0 left-0 p-4 text-white bg-gradient-to-t from-black/50 to-transparent w-full">
        <div className="flex items-center gap-2">
            <Avatar>
                <AvatarImage src={video.user.avatar} alt={video.user.name} />
                <AvatarFallback>{video.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="font-bold">{video.user.name}</p>
            <Button variant="outline" size="sm" className="h-7 text-white border-white bg-transparent hover:bg-white/20">
                Follow
            </Button>
        </div>
        <p className="text-sm my-2">{video.description}</p>
        <div className="flex items-center gap-4 mt-2 text-sm">
          <span>{video.likes} Likes</span>
          <span>{video.comments} Comments</span>
          <span>{video.shares} Shares</span>
        </div>
      </div>
    </div>
  );
}


export default function Home() {
  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <PlaySquare className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">ClipStream</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" isActive tooltip="Home">
                <HomeIcon />
                Home
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="Explore">
                <Compass />
                Explore
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="Following">
                <Users />
                Following
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="Profile">
                <User />
                Profile
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="!p-0 !m-0 !bg-black max-w-none">
         <header className="absolute top-0 left-0 z-10 p-4 flex items-center justify-between w-full">
          <SidebarTrigger className="text-white hover:bg-white/20 hover:text-white" />
          <Button variant="outline" className="text-white border-white bg-transparent hover:bg-white/20">
            <Upload className="mr-2" /> Upload
          </Button>
        </header>
        <main className="h-svh w-full snap-y snap-mandatory overflow-y-auto">
          {videos.map((video) => (
            <VideoPost key={video.id} video={video} />
          ))}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
