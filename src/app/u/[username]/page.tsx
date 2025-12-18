
'use client';

import { ArrowLeft, MessageSquare, UserPlus, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCollection, useMemoFirebase, useFirestore, useUser, useDoc, updateDocumentNonBlocking } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { collection, query, where, limit, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import type { UserProfile, Post } from '@/lib/types';
import { achievements as allAchievements } from '@/lib/achievements';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PostCard } from '@/components/app/post-card';
import { useRouter } from 'next/navigation';


export default function UserProfilePage({ params }: { params: { username: string } }) {
  const { user: currentUser } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userProfileQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'users'), where('username', '==', params.username), limit(1)) : null),
    [firestore, params.username]
  );
  const { data: userProfiles, isLoading: isProfileLoading } = useCollection<UserProfile>(userProfileQuery);
  const userProfile = userProfiles?.[0];

  const currentUserProfileRef = useMemoFirebase(
    () => (currentUser ? doc(firestore, `users/${currentUser.uid}`) : null),
    [currentUser, firestore]
  );
  const { data: currentUserProfile } = useDoc<UserProfile>(currentUserProfileRef);

  const userPostsQuery = useMemoFirebase(
    () => (firestore && userProfile ? query(collection(firestore, 'posts'), where('userId', '==', userProfile.id)) : null),
    [firestore, userProfile]
  );
  const { data: posts, isLoading: arePostsLoading } = useCollection<Post>(userPostsQuery);


  const handleFollow = () => {
    if (!currentUser || !userProfile || !firestore) return;
    const currentUserRef = doc(firestore, 'users', currentUser.uid);
    const targetUserRef = doc(firestore, 'users', userProfile.id);

    updateDocumentNonBlocking(currentUserRef, { following: arrayUnion(userProfile.id) });
    updateDocumentNonBlocking(targetUserRef, { followers: arrayUnion(currentUser.uid) });
  };

  const handleUnfollow = () => {
    if (!currentUser || !userProfile || !firestore) return;
    const currentUserRef = doc(firestore, 'users', currentUser.uid);
    const targetUserRef = doc(firestore, 'users', userProfile.id);

    updateDocumentNonBlocking(currentUserRef, { following: arrayRemove(userProfile.id) });
    updateDocumentNonBlocking(targetUserRef, { followers: arrayRemove(currentUser.uid) });
  };

  const handleMessage = () => {
    // This is a placeholder for messaging functionality.
    // In a real app, this would check for an existing conversation
    // or create a new one, then navigate to the conversation page.
    router.push('/inbox');
  }

  const isLoading = isProfileLoading || arePostsLoading;

  const displayedBadges = userProfile?.displayedBadges
    ?.map(badgeId => allAchievements.find(a => a.id === badgeId))
    .filter(Boolean) as (typeof allAchievements) | undefined;
    
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!userProfile) {
    return <div className="container mx-auto max-w-2xl p-4 text-center">User not found.</div>
  }
  
  const isFollowing = currentUserProfile?.following?.includes(userProfile.id);
  const isCurrentUser = currentUser?.uid === userProfile.id;

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <header className="relative flex items-center justify-center mb-8">
        <Link href="/" passHref className="absolute left-0">
          <Button variant="ghost" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">{userProfile.username}'s Profile</h1>
      </header>
      <div className="flex flex-col items-center gap-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={userProfile?.profilePictureUrl || ''} />
          <AvatarFallback>{userProfile?.username?.[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="text-2xl font-bold">{userProfile?.username}</h2>
          <p className="text-muted-foreground">{userProfile?.bio || userProfile?.email}</p>
        </div>

        {!isCurrentUser && currentUser && (
          <div className="flex items-center gap-2 mt-2">
            {isFollowing ? (
              <Button variant="secondary" onClick={handleUnfollow}>
                <UserCheck className="mr-2 h-4 w-4" />
                Following
              </Button>
            ) : (
              <Button onClick={handleFollow}>
                <UserPlus className="mr-2 h-4 w-4" />
                Follow
              </Button>
            )}
             <Button variant="outline" onClick={handleMessage}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Message
            </Button>
          </div>
        )}

        {displayedBadges && displayedBadges.length > 0 && (
            <TooltipProvider>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                    {displayedBadges.map((badge) => (
                        <Tooltip key={badge.id}>
                            <TooltipTrigger>
                                <Badge variant="secondary" className="flex items-center gap-1.5 p-2">
                                    <badge.icon className="h-4 w-4"/>
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-semibold">{badge.title}</p>
                                <p>{badge.description}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </TooltipProvider>
        )}
      </div>

       <div className="mt-8 space-y-4">
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
             <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center mt-8">
                <h3 className="text-xl font-medium">No posts yet</h3>
                <p className="text-sm text-muted-foreground">
                    This user hasn't posted anything yet.
                </p>
            </div>
          )}
        </div>
    </div>
  );
}
