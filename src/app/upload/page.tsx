
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
import { useUser, useFirestore, addDocumentNonBlocking, getSdks } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { collection, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft, Image as ImageIcon, X } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Image from 'next/image';

const formSchema = z.object({
  title: z.string().min(1, { message: 'Title is required.' }).max(100, { message: 'Title must be 100 characters or less.' }),
  content: z.string().min(1, { message: 'Content is required.' }),
  tags: z.string().optional(),
  enableDonations: z.boolean().default(false).optional(),
  cashAppName: z.string().optional(),
  phoneNumber: z.string().optional(),
});

export default function UploadPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      tags: '',
      enableDonations: false,
      cashAppName: '',
      phoneNumber: '',
    },
  });

  const watchEnableDonations = form.watch('enableDonations');

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);
  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) return;
    
    setIsSubmitting(true);
    
    let imageUrl: string | undefined = undefined;

    if (imageFile) {
        const { storage } = getSdks(getStorage().app);
        const storageRef = ref(storage, `posts/${user.uid}/${Date.now()}_${imageFile.name}`);
        try {
            const snapshot = await uploadBytes(storageRef, imageFile);
            imageUrl = await getDownloadURL(snapshot.ref);
        } catch (error) {
            console.error("Error uploading image: ", error);
            setIsSubmitting(false);
            // Optionally, show a toast to the user
            return;
        }
    }

    try {
      const postsCollection = collection(firestore, 'posts');
      await addDocumentNonBlocking(postsCollection, {
        userId: user.uid,
        username: user.email?.split('@')[0] || 'anonymous',
        userProfileUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/100`,
        title: values.title,
        content: values.content,
        imageUrl,
        tags: values.tags?.split(',').map(tag => tag.trim()).filter(tag => tag) || [],
        upvotes: [],
        downvotes: [],
        comments: [],
        createdAt: serverTimestamp(),
        donations: values.enableDonations ? {
          cashAppName: values.cashAppName,
          phoneNumber: values.phoneNumber,
        } : null,
      });

      router.push('/');
    } catch (error) {
      console.error("Error creating post:", error);
      setIsSubmitting(false);
      // You can add a toast notification here to inform the user
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
    <div className="container mx-auto max-w-2xl p-4">
      <header className="relative flex items-center justify-center mb-8">
        <Link href="/" passHref className="absolute left-0">
          <Button variant="ghost" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Create a New Post</h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Share your story</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="An interesting title for your post" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Image (Optional)</FormLabel>
                {imagePreview ? (
                    <div className="relative">
                        <Image src={imagePreview} alt="Image preview" width={600} height={400} className="rounded-md w-full object-cover aspect-video" />
                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={removeImage}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div 
                        className="flex items-center justify-center w-full p-6 border-2 border-dashed rounded-md cursor-pointer hover:bg-accent"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="text-center">
                            <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">Click to upload an image</p>
                        </div>
                        <Input 
                            ref={fileInputRef}
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell your story, share your problem..." {...field} rows={8} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. creepy, personal-problem, mystery" {...field} />
                    </FormControl>
                     <p className="text-sm text-muted-foreground">
                        Separate tags with a comma.
                      </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="enableDonations"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Donations</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Allow other users to donate to you for this post.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {watchEnableDonations && (
                <div className="space-y-4 rounded-lg border bg-accent/50 p-4">
                   <FormField
                    control={form.control}
                    name="cashAppName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cash App Name</FormLabel>
                        <FormControl>
                          <Input placeholder="$username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (for other apps)</FormLabel>
                        <FormControl>
                          <Input placeholder="+1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Posting...' : 'Post'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
