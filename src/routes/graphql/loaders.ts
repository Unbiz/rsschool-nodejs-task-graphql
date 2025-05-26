import DataLoader from 'dataloader';
import { PrismaClient, User } from '@prisma/client';
import type { Context } from './types.js';

type SubscriptionField = 'subscriberId' | 'authorId';
type IncludeField = 'author' | 'subscriber';

const createSubscriptionLoader = (
  prisma: PrismaClient,
  whereField: SubscriptionField,
  includeField: IncludeField,
) =>
  new DataLoader(async (userIds: readonly string[]) => {
    const subscriptions = await prisma.subscribersOnAuthors.findMany({
      where: { [whereField]: { in: Array.from(userIds) } },
      include: { [includeField]: true },
    });
    return userIds.map((id) =>
      subscriptions
        .filter((sub) => sub[whereField] === id)
        .map((sub) => sub[includeField] as User),
    );
  });

export function createLoaders(prisma: PrismaClient): Context['loaders'] {
  return {
    profile: new DataLoader(async (userIds: readonly string[]) => {
      const profiles = await prisma.profile.findMany({
        where: { userId: { in: Array.from(userIds) } },
      });
      return userIds.map((id) => profiles.find((p) => p.userId === id) || null);
    }),

    memberType: new DataLoader(async (memberTypeIds: readonly string[]) => {
      const memberTypes = await prisma.memberType.findMany({
        where: { id: { in: Array.from(memberTypeIds) } },
      });
      return memberTypeIds.map((id) => memberTypes.find((mt) => mt.id === id) || null);
    }),

    posts: new DataLoader(async (userIds: readonly string[]) => {
      const posts = await prisma.post.findMany({
        where: { authorId: { in: Array.from(userIds) } },
      });
      return userIds.map((id) => posts.filter((p) => p.authorId === id));
    }),

    userSubscribedTo: createSubscriptionLoader(prisma, 'subscriberId', 'author'),
    subscribedToUser: createSubscriptionLoader(prisma, 'authorId', 'subscriber'),
  };
}
