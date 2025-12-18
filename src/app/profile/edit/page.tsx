
'use client';

import { ArrowLeft, Check, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser, useDoc, useMemoFirebase, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile, Achievement } from '@/lib/types';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { achievements } from '@/lib/achievements';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const profileFormSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }).max(20, { message: 'Username must be 20 characters or less.' }),
  bio: z.string().max(160, { message: 'Bio must be 160 characters or less.' }).optional(),
});

export default function EditProfilePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, `users/${user.uid}`) : null),
    [user, firestore]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: '',
      bio: '',
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        username: userProfile.username || user?.email?.split('@')[0],
        bio: userProfile.bio || '',
      });
      setSelectedBadges(userProfile.displayedBadges || []);
    }
  }, [userProfile, form, user]);

  const unlockedAchievements = userProfile?.unlockedAchievements || ['first_post', 'first_comment'];

  const toggleBadge = (achievementId: string) => {
    setSelectedBadges(prev => {
      if (prev.includes(achievementId)) {
        return prev.filter(id => id !== achievementId);
      }
      if (prev.length < 5) { // Limit to 5 badges
        return [...prev, achievementId];
      }
      toast({
        variant: "destructive",
        title: "Too many badges",
        description: "You can only display up to 5 badges.",
      });
      return prev;
    });
  };

  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    if (!userProfileRef) return;
    setIsSaving(true);
    await updateDocumentNonBlocking(userProfileRef, {
      ...values,
      displayedBadges: selectedBadges
    });
    setIsSaving(false);
    toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully.",
    });
  }

  if (isProfileLoading) {
    return <div className="container mx-auto max-w-2xl p-4 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl p-4 pb-12">
      <header className="relative flex items-center justify-center mb-8">
        <Link href="/profile" passHref className="absolute left-0">
          <Button variant="ghost" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Edit Profile</h1>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Public Profile</CardTitle>
              <CardDescription>This information will be displayed publicly.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Your username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell us a little bit about yourself" className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Display Badges</CardTitle>
              <CardDescription>Show off your achievements! Select up to 5 to display on your profile.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {achievements.map((achievement) => {
                const isUnlocked = unlockedAchievements.includes(achievement.id);
                const isSelected = selectedBadges.includes(achievement.id);

                if (!isUnlocked) return null;

                return (
                  <button
                    type="button"
                    key={achievement.id}
                    onClick={() => toggleBadge(achievement.id)}
                    className={cn(
                      "relative flex flex-col items-center justify-center gap-2 rounded-lg border p-4 text-center aspect-square transition-all",
                      isSelected ? "ring-2 ring-primary border-primary" : "hover:bg-accent"
                    )}
                  >
                    <achievement.icon className="w-8 h-8" />
                    <p className="text-xs font-medium">{achievement.title}</p>
                    {isSelected && <CheckCircle2 className="absolute top-1 right-1 h-5 w-5 fill-primary text-primary-foreground" />}
                  </button>
                );
              })}
            </CardContent>
          </Card>
          
          <Button type="submit" className="w-full" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
