
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useUser, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const surveyFormSchema = z.object({
  playsVideoGames: z.enum(['yes', 'no'], {
    required_error: "You need to select an option.",
  }),
  favoriteGame: z.string().optional(),
  howHeard: z.string().min(1, { message: 'This field is required.' }),
});

export default function SurveyPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof surveyFormSchema>>({
    resolver: zodResolver(surveyFormSchema),
    defaultValues: {
      favoriteGame: '',
      howHeard: '',
    },
  });
  
  const watchPlaysVideoGames = form.watch("playsVideoGames");

  useEffect(() => {
    // If user is not logged in and we are done loading, redirect to signup
    if (!isUserLoading && !user) {
      router.push('/signup');
    }
  }, [user, isUserLoading, router]);

  async function onSubmit(values: z.infer<typeof surveyFormSchema>) {
    if (!user || !firestore) return;
    setIsSubmitting(true);
    
    const userProfileRef = doc(firestore, `users/${user.uid}`);

    try {
      await updateDocumentNonBlocking(userProfileRef, {
        playsVideoGames: values.playsVideoGames === 'yes',
        favoriteGame: values.favoriteGame,
        howHeard: values.howHeard,
      });
      
      toast({
        title: "Welcome aboard!",
        description: "Thanks for sharing. Your profile is all set up.",
      });

      router.push('/');
    } catch (error) {
      console.error("Error updating profile with survey:", error);
      toast({
        variant: "destructive",
        title: "Oh no!",
        description: "There was a problem saving your survey. Please try again.",
      });
      setIsSubmitting(false);
    }
  }

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-svh">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background/50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Just a few more questions...</CardTitle>
          <CardDescription>
            Help us get to know you better.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="playsVideoGames"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Do you play video games?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="yes" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Yes
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="no" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            No
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchPlaysVideoGames === 'yes' && (
                <FormField
                  control={form.control}
                  name="favoriteGame"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Which game do you like the most?</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Stardew Valley, Elden Ring" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="howHeard"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How did you hear about us?</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. A friend, social media, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="ghost" onClick={() => router.push('/')}>
                  Skip
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Finish Setup'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
