
'use client';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { achievements } from '@/lib/achievements';
import { useUser, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function AchievementsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, `users/${user.uid}`) : null),
    [user, firestore]
  );
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const unlockedAchievements = userProfile?.unlockedAchievements || [];

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <header className="relative flex items-center justify-center mb-8">
        <Link href="/" passHref className="absolute left-0">
          <Button variant="ghost" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Achievements</h1>
      </header>
      <div className="grid gap-4">
        {achievements.map((achievement) => {
          const isUnlocked = unlockedAchievements.includes(achievement.id);
          return (
            <Card key={achievement.id} className={cn("flex items-center gap-4 p-4", isUnlocked ? "bg-accent/50" : "opacity-50")}>
              <div className="relative">
                <achievement.icon className="w-10 h-10 text-muted-foreground" />
                {isUnlocked && (
                    <CheckCircle2 className="absolute -bottom-1 -right-1 h-5 w-5 fill-green-500 text-background" />
                )}
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">{achievement.title}</CardTitle>
                <CardDescription>{achievement.description}</CardDescription>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
