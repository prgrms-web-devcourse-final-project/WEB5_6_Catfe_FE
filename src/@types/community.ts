import { ApiListPaginationResponse, ApiPaginationResponse, ApiResponse, UserProfile } from './type';

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
  content: string | null;

  likeCount: number;
  bookmarkCount: number;
  commentCount: number;

  likedByMe?: boolean;
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

export type CreatePostRequest = {
  title: string;
  content: string;
  categoryIds: number[];
};

export type CreateCommentRequest = {
  content: string;
};

/** GET 통신 시 떨어지는 data */
type CommentBase = {
  commentId: number;
  postId: number;
  author: UserSummary;
  content: string | null;
  likeCount: number;
  likedByMe?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type RootComment = CommentBase & {
  parentId: null;
  children: ReplyComment[];
  replyCount?: number;
};

export type ReplyComment = CommentBase & {
  parentId: number;
  children?: never;
  replyCount?: never;
};

/** PUT / POST 통신 시 떨어지는 data */
export type CommentResponseData = {
  commentId: number;
  postId: number;
  parentId?: number | null; // 대댓글일 경우 parentId가 존재
  author: UserSummary;
  content: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Comment = RootComment | ReplyComment;
export type CommentTree = RootComment[];
export type CommentsResponse = ApiResponse<ApiPaginationResponse<RootComment>>;
export type CommentMutationResponse = ApiResponse<CommentResponseData>;
export type CommentDeleteResponse = ApiResponse<null>;

export type CategoryType = 'SUBJECT' | 'DEMOGRAPHIC' | 'GROUP_SIZE';
export type CategoryItem = {
  id: number;
  name: string;
  type: CategoryType;
};

export type CategoriesResponse = ApiResponse<CategoryItem[]>;
