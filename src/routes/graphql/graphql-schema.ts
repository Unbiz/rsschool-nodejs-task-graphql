import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLError,
} from 'graphql';
import { UUIDType } from './types/uuid.js';
import type {
  User,
  Profile,
  MemberType,
  Post,
  BaseProfile,
  GraphQLContext,
} from './schema-types.js';
import { MemberTypeIdEnum } from './types/enums.js';

interface WithId {
  id: string;
}

interface WithAuthorId {
  authorId: string;
}

export const MemberTypeObject = new GraphQLObjectType<MemberType, GraphQLContext>({
  name: 'MemberType',
  fields: () => ({
    id: { type: new GraphQLNonNull(MemberTypeIdEnum) },
    discount: { type: new GraphQLNonNull(GraphQLFloat) },
    postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) },
  }),
});

export const PostObject = new GraphQLObjectType<Post, GraphQLContext>({
  name: 'Post',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
    author: {
      type: new GraphQLNonNull(UserObject),
      resolve: async (parent: WithAuthorId, _, context: GraphQLContext) => {
        const baseUser = await context.prisma.user.findUnique({
          where: { id: parent.authorId },
        });
        if (!baseUser) return null;
        return baseUser as User;
      },
    },
  }),
});

export const ProfileObject = new GraphQLObjectType<Profile, GraphQLContext>({
  name: 'Profile',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberTypeId: { type: new GraphQLNonNull(MemberTypeIdEnum) },
    memberType: {
      type: new GraphQLNonNull(MemberTypeObject),
      resolve: async (profile: BaseProfile, _, context: GraphQLContext) => {
        return context.loaders.memberType.load(profile.memberTypeId);
      },
    },
  }),
});

export const UserObject = new GraphQLObjectType<User, GraphQLContext>({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    profile: {
      type: ProfileObject,
      resolve: async (user: WithId, _, context: GraphQLContext) => {
        return context.loaders.profile.load(user.id);
      },
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PostObject))),
      resolve: async (user: WithId, _, context: GraphQLContext) => {
        return context.loaders.posts.load(user.id);
      },
    },
    userSubscribedTo: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserObject))),
      resolve: async (user: WithId, _, context: GraphQLContext) => {
        return context.loaders.userSubscribedTo.load(user.id);
      },
    },
    subscribedToUser: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserObject))),
      resolve: async (user: WithId, _, context: GraphQLContext) => {
        return context.loaders.subscribedToUser.load(user.id);
      },
    },
  }),
});

const RootQueryType = new GraphQLObjectType<unknown, GraphQLContext>({
  name: 'RootQueryType',
  fields: {
    memberTypes: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MemberTypeObject))),
      resolve: async (_, __, context: GraphQLContext) => {
        const types = await context.prisma.memberType.findMany();
        return types as MemberType[];
      },
    },
    memberType: {
      type: MemberTypeObject as GraphQLObjectType,
      args: {
        id: { type: new GraphQLNonNull(MemberTypeIdEnum) },
      },
      resolve: async (_, { id }: { id: string }, context: GraphQLContext) => {
        const type = await context.prisma.memberType.findUnique({
          where: { id },
        });
        return type as MemberType;
      },
    },
    users: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserObject))),
      resolve: async (_, __, context: GraphQLContext) => {
        const users = await context.prisma.user.findMany();
        return users as User[];
      },
    },
    user: {
      type: UserObject as GraphQLObjectType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }: { id: string }, context: GraphQLContext) => {
        const user = await context.prisma.user.findUnique({
          where: { id },
        });
        return user as User | null;
      },
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PostObject))),
      resolve: async (_, __, context: GraphQLContext) => {
        const posts = await context.prisma.post.findMany();
        return posts as Post[];
      },
    },
    post: {
      type: PostObject as GraphQLObjectType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }: { id: string }, context: GraphQLContext) => {
        const post = await context.prisma.post.findUnique({
          where: { id },
        });
        return post as Post | null;
      },
    },
    profiles: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ProfileObject))),
      resolve: async (_, __, context: GraphQLContext) => {
        const profiles = await context.prisma.profile.findMany();
        return profiles as Profile[];
      },
    },
    profile: {
      type: ProfileObject as GraphQLObjectType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }: { id: string }, context: GraphQLContext) => {
        const profile = await context.prisma.profile.findUnique({
          where: { id },
        });
        return profile as Profile | null;
      },
    },
  },
});

const Mutations = new GraphQLObjectType<unknown, GraphQLContext>({
  name: 'Mutations',
  fields: {
    createUser: {
      type: new GraphQLNonNull(UserObject),
      args: {
        dto: {
          type: new GraphQLNonNull(
            new GraphQLInputObjectType({
              name: 'CreateUserInput',
              fields: () => ({
                name: { type: new GraphQLNonNull(GraphQLString) },
                balance: { type: new GraphQLNonNull(GraphQLFloat) },
              }),
            }),
          ),
        },
      },
      resolve: async (
        _,
        { dto }: { dto: { name: string; balance: number } },
        context: GraphQLContext,
      ) => {
        const user = await context.prisma.user.create({
          data: dto,
        });
        return user as User;
      },
    },
    createProfile: {
      type: new GraphQLNonNull(ProfileObject),
      args: {
        dto: {
          type: new GraphQLNonNull(
            new GraphQLInputObjectType({
              name: 'CreateProfileInput',
              fields: () => ({
                isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
                yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
                userId: { type: new GraphQLNonNull(UUIDType) },
                memberTypeId: { type: new GraphQLNonNull(MemberTypeIdEnum) },
              }),
            }),
          ),
        },
      },
      resolve: async (
        _,
        {
          dto,
        }: {
          dto: {
            isMale: boolean;
            yearOfBirth: number;
            userId: string;
            memberTypeId: string;
          };
        },
        context: GraphQLContext,
      ) => {
        if (!Number.isInteger(dto.yearOfBirth)) {
          throw new GraphQLError(
            `Int cannot represent non-integer value: ${dto.yearOfBirth}`,
          );
        }

        const user = await context.prisma.user.findUnique({
          where: { id: dto.userId },
        });
        if (!user) {
          throw new GraphQLError(`User with id ${dto.userId} not found`);
        }

        const profile = await context.prisma.profile.create({
          data: dto,
        });
        return profile as Profile;
      },
    },
    createPost: {
      type: new GraphQLNonNull(PostObject),
      args: {
        dto: {
          type: new GraphQLNonNull(
            new GraphQLInputObjectType({
              name: 'CreatePostInput',
              fields: () => ({
                title: { type: new GraphQLNonNull(GraphQLString) },
                content: { type: new GraphQLNonNull(GraphQLString) },
                authorId: { type: new GraphQLNonNull(UUIDType) },
              }),
            }),
          ),
        },
      },
      resolve: async (
        _,
        { dto }: { dto: { title: string; content: string; authorId: string } },
        context: GraphQLContext,
      ) => {
        const post = await context.prisma.post.create({
          data: dto,
        });
        return post as Post;
      },
    },
    changePost: {
      type: new GraphQLNonNull(PostObject),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: {
          type: new GraphQLNonNull(
            new GraphQLInputObjectType({
              name: 'ChangePostInput',
              fields: () => ({
                title: { type: GraphQLString },
                content: { type: GraphQLString },
              }),
            }),
          ),
        },
      },
      resolve: async (
        _,
        { id, dto }: { id: string; dto: { title?: string; content?: string } },
        context: GraphQLContext,
      ) => {
        const post = await context.prisma.post.update({
          where: { id },
          data: dto,
        });
        return post as Post;
      },
    },
    changeProfile: {
      type: new GraphQLNonNull(ProfileObject),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: {
          type: new GraphQLNonNull(
            new GraphQLInputObjectType({
              name: 'ChangeProfileInput',
              fields: () => ({
                isMale: { type: GraphQLBoolean },
                yearOfBirth: { type: GraphQLInt },
                memberTypeId: { type: MemberTypeIdEnum },
              }),
            }),
          ),
        },
      },
      resolve: async (
        _,
        {
          id,
          dto,
        }: {
          id: string;
          dto: {
            isMale?: boolean;
            yearOfBirth?: number;
            memberTypeId?: string;
            userId?: string;
          };
        },
        context: GraphQLContext,
      ) => {
        if (dto.userId !== undefined) {
          throw new GraphQLError('Field "userId" is not allowed in ChangeProfileInput');
        }

        // Validate yearOfBirth is an integer if provided
        if (dto.yearOfBirth !== undefined && !Number.isInteger(dto.yearOfBirth)) {
          throw new GraphQLError(
            `Int cannot represent non-integer value: ${dto.yearOfBirth}`,
          );
        }

        const existingProfile = await context.prisma.profile.findUnique({
          where: { id },
        });

        if (!existingProfile) {
          throw new GraphQLError(`Profile with id ${id} not found`);
        }

        const profile = await context.prisma.profile.update({
          where: { id },
          data: dto,
        });
        return profile as Profile;
      },
    },
    changeUser: {
      type: new GraphQLNonNull(UserObject),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: {
          type: new GraphQLNonNull(
            new GraphQLInputObjectType({
              name: 'ChangeUserInput',
              fields: () => ({
                name: { type: GraphQLString },
                balance: { type: GraphQLFloat },
              }),
            }),
          ),
        },
      },
      resolve: async (
        _,
        { id, dto }: { id: string; dto: { name?: string; balance?: number } },
        context: GraphQLContext,
      ) => {
        const user = await context.prisma.user.update({
          where: { id },
          data: dto,
        });
        return user as User;
      },
    },
    deleteUser: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }: { id: string }, context: GraphQLContext) => {
        await context.prisma.user.delete({
          where: { id },
        });
        return 'User deleted';
      },
    },
    deletePost: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }: { id: string }, context: GraphQLContext) => {
        await context.prisma.post.delete({
          where: { id },
        });
        return 'Post deleted';
      },
    },
    deleteProfile: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }: { id: string }, context: GraphQLContext) => {
        await context.prisma.profile.delete({
          where: { id },
        });
        return 'Profile deleted';
      },
    },
    subscribeTo: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (
        _,
        { userId, authorId }: { userId: string; authorId: string },
        context: GraphQLContext,
      ) => {
        await context.prisma.subscribersOnAuthors.create({
          data: {
            subscriberId: userId,
            authorId: authorId,
          },
        });
        return 'Subscribed successfully';
      },
    },
    unsubscribeFrom: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (
        _,
        { userId, authorId }: { userId: string; authorId: string },
        context: GraphQLContext,
      ) => {
        await context.prisma.subscribersOnAuthors.delete({
          where: {
            subscriberId_authorId: {
              subscriberId: userId,
              authorId: authorId,
            },
          },
        });
        return 'Unsubscribed successfully';
      },
    },
  },
});

export const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: Mutations,
});
