export type Comment = {
  id: string;
  userId: string;
  username: string;
  userProfileUrl: string;
  text: string;
  createdAt: any;
};

export type Video = {
  id: string;
  userId: string;
  username: string;
  userProfileUrl: string;
  videoUrl: string;
  caption: string;
  song: string;
  likes: string[]; // Array of user IDs who liked the video
  comments: Comment[]; // Array of comment objects
  shares: number;
  createdAt: any;
  isVerified?: boolean;
};
