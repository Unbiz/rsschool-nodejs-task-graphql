import { PrismaClient, Profile, MemberType, Post, User } from '@prisma/client';
import DataLoader from 'dataloader';

export interface Context {
  prisma: PrismaClient;
  loaders: {
    profile: DataLoader<string, Profile | null>;
    memberType: DataLoader<string, MemberType | null>;
    posts: DataLoader<string, Post[]>;
    userSubscribedTo: DataLoader<string, User[]>;
    subscribedToUser: DataLoader<string, User[]>;
  };
}
