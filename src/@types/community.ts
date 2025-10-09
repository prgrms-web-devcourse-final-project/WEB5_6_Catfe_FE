import { ApiListPaginationResponse, ApiPaginationResponse, ApiResponse, UserProfile } from './type';
import { JSONContent } from '@tiptap/react';

export type UserSummary = Pick<UserProfile, 'nickname' | 'profileImageUrl'> & { id: number };
export type ApiCategory = {
  id: number;
  name: string;
};

export type PostListItem = {
  postId: number;
  author: UserSummary;
  title: string;
  categories: ApiCategory[];
  content: JSONContent | null;

  likeCount: number;
  bookmarkCount: number;
  commentCount: number;

  isLikedByMe?: boolean;
  isBookmarkedByMe?: boolean;

  createdAt: string;
  updatedAt: string;
};

export type PostDetail = PostListItem;

export type InitialPost =
  | Pick<PostDetail, 'postId' | 'title' | 'categories' | 'content'>
  | null
  | undefined;

export type PostListResponse = ApiResponse<ApiListPaginationResponse<PostListItem>>;
export type PostResponse = ApiResponse<PostDetail>;

type CommentBase = {
  commentId: number;
  postId: number;
  author: UserSummary;
  content: string | null;
  likeCount: number;
  isLikedByMe?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type RootComment = CommentBase & {
  parentId: null;
  children?: ReplyComment[];
  replyCount?: number;
};

export type ReplyComment = CommentBase & {
  parentId: number;
  children?: never;
  replyCount?: never;
};

export type Comment = RootComment | ReplyComment;
export type CommentTree = RootComment[];
export type CommentsResponse = ApiResponse<ApiPaginationResponse<RootComment>>;

export type CategoryType = 'SUBJECT' | 'DEMOGRAPHIC' | 'GROUP_SIZE';
export type CategoryItem = {
  id: number;
  name: string;
  type: CategoryType;
};

export type CategoriesResponse = ApiResponse<CategoryItem[]>;
