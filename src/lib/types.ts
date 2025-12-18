export type Comment = {
  id: string;
  userId: string;
  username: string;
  userProfileUrl: string;
  text: string;
  createdAt: any;
};

export type Post = {
  id: string;
  userId: string;
  username: string;
  userProfileUrl: string;
  title: string;
  content: string;
  tags: string[];
  upvotes: string[]; // Array of user IDs who upvoted
  comments: Comment[];
  createdAt: any;
  isVerified?: boolean;
};
