import type { Timestamp } from 'firebase/firestore';

export type Comment = {
  id: string;
  userId: string;
  username: string;
  userProfileUrl: string;
  text: string;
  createdAt: Timestamp;
};

export type PostDonations = {
  cashAppName?: string;
  phoneNumber?: string;
}

export type Post = {
  id: string;
  userId: string;
  username: string;
  userProfileUrl: string;
  title: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  tags: string[];
  upvotes: string[]; // Array of user IDs who upvoted
  downvotes?: string[]; // Array of user IDs who downvoted
  comments: Comment[];
  createdAt: Timestamp;
  isVerified?: boolean;
  donations?: PostDonations | null;
};

export type UserProfile = {
    id: string;
    username: string;
    email: string;
    profilePictureUrl?: string;
    bio?: string;
    unlockedAchievements?: string[];
    displayedBadges?: string[];
    playsVideoGames?: boolean;
    favoriteGame?: string;
    howHeard?: string;
    following?: string[];
    followers?: string[];
};

export type Achievement = {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
};

export type Notification = {
    id: string;
    recipientId: string;
    senderId: string;
    senderUsername: string;
    senderProfileUrl: string;
    type: 'follow' | 'comment' | 'upvote';
    postId?: string;
    postTitle?: string;
    read: boolean;
    createdAt: Timestamp;
}
