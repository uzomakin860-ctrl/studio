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
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { collection, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, UploadCloud, Music, Film } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  video: z.any().refine(fileList => fileList?.length === 1, "A video file is required."),
  caption: z.string().min(1, { message: 'Caption is required.' }),
  song: z.string().min(1, { message: 'Song name is required.' }),
});

export default function UploadPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      caption: '',
      song: '',
      video: undefined,
    },
  });
  
  const fileRef = form.register("video");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setVideoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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

    const uploadTask = uploadBytesResumable(storageRef, videoFile);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
        setIsUploading(false);
        // Add user-facing error message here
      },
      async () => {
        try {
          const videoUrl = await getDownloadURL(uploadTask.snapshot.ref);

          const videosCollection = collection(firestore, 'videos');
          await addDocumentNonBlocking(videosCollection, {
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
          console.error("Error creating post:", error);
          setIsUploading(false);
          // Add user-facing error message here
        }
      }
    );
  }
  
  if (isUserLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-svh bg-black">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-svh bg-black text-white p-4">
      <header className="w-full flex items-center justify-between mb-8">
        <Link href="/" passHref>
          <Button variant="ghost" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Post Video</h1>
        <div className="w-10"></div>
      </header>

      <div className="w-full max-w-md flex-1 flex flex-col">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex flex-col flex-1">
            <FormField
              control={form.control}
              name="video"
              render={({ field }) => (
                <FormItem className="flex-1 flex flex-col">
                  <FormLabel htmlFor="video-upload" className="flex-1 w-full">
                    {videoPreview ? (
                      <div className="relative w-full h-full min-h-64 rounded-lg overflow-hidden border-2 border-dashed border-gray-600 flex items-center justify-center">
                        <video src={videoPreview} className="w-full h-full object-cover" autoPlay loop muted />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full h-full min-h-64 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-900/50 transition-colors">
                        <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-lg font-semibold">Tap to upload</p>
                        <p className="text-sm text-gray-500">MP4 or other video formats</p>
                      </div>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input id="video-upload" type="file" accept="video/*" {...fileRef} className="hidden" onChange={handleFileChange} />
                  </FormControl>
                  <FormMessage className="text-red-500 mt-2" />
                </FormItem>
              )}
            />

            <div className="space-y-4">
                <FormField
                control={form.control}
                name="caption"
                render={({ field }) => (
                    <FormItem>
                    <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
                        <Film className="text-gray-400" />
                        <FormControl>
                        <Input placeholder="Describe your video..." {...field} className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-white" />
                        </FormControl>
                    </div>
                    <FormMessage className="pl-3" />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="song"
                render={({ field }) => (
                    <FormItem>
                    <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
                        <Music className="text-gray-400" />
                        <FormControl>
                        <Input placeholder="Add a song" {...field} className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-white" />
                        </FormControl>
                    </div>
                    <FormMessage className="pl-3"/>
                    </FormItem>
                )}
                />
            </div>

            <div className="mt-auto pt-4">
                {isUploading && (
                  <div className="mb-4">
                    <p className="text-center text-sm mb-2">Uploading: {Math.round(uploadProgress)}%</p>
                    <Progress value={uploadProgress} className="w-full h-2" />
                  </div>
                )}
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg py-6" disabled={isUploading}>
                {isUploading ? 'Posting...' : 'Post'}
                </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
