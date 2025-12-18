'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth, useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { collection, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Progress } from '@/components/ui/progress';

const formSchema = z.object({
  video: z.any().refine(file => file?.length == 1, "Video is required."),
  caption: z.string().min(1, { message: 'Caption is required.' }),
  song: z.string().min(1, { message: 'Song is required.' }),
});

export default function UploadPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      caption: '',
      song: '',
    },
  });
  
  const fileRef = form.register("video");

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) return;
    
    setIsUploading(true);
    const videoFile = values.video[0];
    const storage = getStorage();
    const storageRef = ref(storage, `videos/${user.uid}/${Date.now()}_${videoFile.name}`);

    try {
      // For simplicity, not showing upload progress. In a real app, you would use uploadBytesResumable
      const snapshot = await uploadBytes(storageRef, videoFile);
      setUploadProgress(100);
      const videoUrl = await getDownloadURL(snapshot.ref);

      const videosCollection = collection(firestore, 'videos');
      addDocumentNonBlocking(videosCollection, {
        userId: user.uid,
        username: user.email?.split('@')[0] || 'anonymous',
        userProfileUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/100`,
        videoUrl,
        caption: values.caption,
        song: values.song,
        likes: 0,
        comments: 0,
        shares: 0,
        createdAt: serverTimestamp(),
      });

      router.push('/');

    } catch (error) {
      console.error("Error uploading file or creating post:", error);
      // You should show a toast to the user here
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }
  
  if (isUserLoading || !user) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <p>Loading...</p>
        </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Upload Video</CardTitle>
          <CardDescription>
            Share a new video with your followers.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="video"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video File</FormLabel>
                    <FormControl>
                      <Input type="file" accept="video/*" {...fileRef} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="caption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Caption</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Write a caption..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="song"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Song</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter song name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isUploading && <Progress value={uploadProgress} className="w-full" />}
              <Button type="submit" className="w-full" disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Post'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
