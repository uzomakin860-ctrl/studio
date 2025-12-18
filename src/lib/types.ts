export type Video = {
  id: string;
  userId: string;
  username: string;
  userProfileUrl: string;
  videoUrl: string;
  caption: string;
  song: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: any;
  isVerified?: boolean;
};
