
import { Award, BookOpen, Coffee, Feather, HeartHandshake, MessageSquare, ShieldCheck, Star, Users } from 'lucide-react';
import type { Achievement } from './types';

export const achievements: Achievement[] = [
  {
    id: 'first_post',
    title: 'First Post',
    description: 'You shared your first story or problem.',
    icon: Feather,
  },
  {
    id: 'first_comment',
    title: 'Joined the Conversation',
    description: 'You posted your first comment.',
    icon: MessageSquare,
  },
  {
    id: 'first_upvote',
    title: 'Appreciated',
    description: 'Your post received its first upvote.',
    icon: Award,
  },
  {
    id: 'power_user',
    title: 'Power User',
    description: 'You have posted more than 10 stories.',
    icon: Coffee,
  },
  {
    id: 'enthusiast',
    title: 'Enthusiast',
    description: 'You have commented on 25 different posts.',
    icon: Users,
  },
  {
    id: 'helpful_hand',
    title: 'Helpful Hand',
    description: 'Your comment was marked as helpful.',
    icon: HeartHandshake,
  },
  {
    id: 'popular_post',
    title: 'Popular Post',
    description: 'One of your posts has over 25 upvotes.',
    icon: Star,
  },
  {
    id: 'story_teller',
    title: 'Story Teller',
    description: 'One of your posts has over 100 upvotes.',
    icon: BookOpen,
  },
  {
    id: 'verified',
    title: 'Verified',
    description: 'Your account has been verified by the mods.',
    icon: ShieldCheck,
  },
];
