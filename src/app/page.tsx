"use client";

import {
  Home as HomeIcon,
  User,
  Upload,
  PlaySquare,
  Compass,
  Users,
  LogIn,
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
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


function VideoPost() {
  return (
    <div className="h-full w-full snap-center relative flex justify-center">
      <div className="absolute inset-0 bg-black flex items-center justify-center text-white">
        <p>No videos yet. Be the first to upload!</p>
      </div>
    </div>
  );
}


export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);


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
          {user ? (
            <Button variant="outline" className="text-white border-white bg-transparent hover:bg-white/20">
              <Upload className="mr-2" /> Upload
            </Button>
          ) : (
            <Button asChild variant="outline" className="text-white border-white bg-transparent hover:bg-white/20">
              <Link href="/login">
                <LogIn className="mr-2" /> Login
              </Link>
            </Button>
          )}
        </header>
        <main className="h-svh w-full snap-y snap-mandatory overflow-y-auto">
          {/* Will be populated with videos from firestore */}
          <VideoPost />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
