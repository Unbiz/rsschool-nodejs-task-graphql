import {
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLString,
  GraphQLFloat,
  GraphQLNonNull,
} from 'graphql';
import { UUIDType } from './types/uuid.js';
import { MemberTypeIdEnum } from './types/enums.js';
import { GraphQLResolveInfo, GraphQLOutputType, GraphQLInputType } from 'graphql';
import { Context } from './types.js';

export interface CreateUserDto {
  name: string;
  balance: number;
}

export interface CreateProfileDto {
  isMale: boolean;
  yearOfBirth: number;
  userId: string;
  memberTypeId: string;
}

export interface CreatePostDto {
  title: string;
  content: string;
  authorId: string;
}

export interface ChangeUserDto {
  name?: string;
  balance?: number;
}

export interface ChangeProfileDto {
  isMale?: boolean;
  yearOfBirth?: number;
  memberTypeId?: string;
}

export interface ChangePostDto {
  title?: string;
  content?: string;
}

export const CreateUserInputType = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  },
});

export const ChangeUserInputType = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: {
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  },
});

export const CreateProfileInputType = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: {
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberTypeId: { type: new GraphQLNonNull(MemberTypeIdEnum) },
  },
});

export const ChangeProfileInputType = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: {
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberTypeId: { type: MemberTypeIdEnum },
  },
});

export const CreatePostInputType = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: {
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
  },
});

export const ChangePostInputType = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: {
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  },
});

export type GraphQLContext = Context;

export interface BaseUser {
  id: string;
  name: string;
  balance: number;
}

export interface BaseProfile {
  id: string;
  isMale: boolean;
  yearOfBirth: number;
  userId: string;
  memberTypeId: string;
}

export interface BaseMemberType {
  id: string;
  discount: number;
  postsLimitPerMonth: number;
}

export interface BasePost {
  id: string;
  title: string;
  content: string;
  authorId: string;
}

export interface User extends BaseUser {
  profile?: Profile | null;
  posts: Post[];
  userSubscribedTo: User[];
  subscribedToUser: User[];
}

export interface Profile extends BaseProfile {
  memberType: MemberType;
}

export interface MemberType extends BaseMemberType {}

export interface Post extends BasePost {
  author: User;
}

export interface CreateUserInput {
  name: string;
  balance: number;
}

export interface ChangeUserInput {
  name?: string;
  balance?: number;
}

export interface CreateProfileInput {
  isMale: boolean;
  yearOfBirth: number;
  userId: string;
  memberTypeId: 'BASIC' | 'BUSINESS';
}

export interface ChangeProfileInput {
  isMale?: boolean;
  yearOfBirth?: number;
  memberTypeId?: 'BASIC' | 'BUSINESS';
}

export interface CreatePostInput {
  title: string;
  content: string;
  authorId: string;
}

export interface ChangePostInput {
  title?: string;
  content?: string;
}

export interface SubscriptionArgs {
  userId: string;
  authorId: string;
}

export type Resolver<
  TResult,
  TParent = unknown,
  TContext = unknown,
  TArgs = Record<string, unknown>,
> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => Promise<TResult> | TResult;

export type ResolverWithoutInfo<
  TResult,
  TParent = unknown,
  TContext = unknown,
  TArgs = Record<string, unknown>,
> = (parent: TParent, args: TArgs, context: TContext) => Promise<TResult> | TResult;

export interface ResolverObject<
  TResult,
  TParent = unknown,
  TContext = unknown,
  TArgs = Record<string, unknown>,
> {
  type: GraphQLOutputType;
  args?: Record<string, { type: GraphQLInputType }>;
  resolve?: ResolverWithoutInfo<TResult, TParent, TContext, TArgs>;
}
