import { ApiListPaginationResponse, ApiPaginationResponse, ApiResponse, UserProfile } from './type';

export type UserSummary = Pick<UserProfile, 'nickname' | 'profileImageUrl'> & { id: number };

/* ------ Category ------ */
export type ApiCategory = {
  id: number;
  name: string;
};

export type CategoryType = 'SUBJECT' | 'DEMOGRAPHIC' | 'GROUP_SIZE';
export type CategoryItem = {
  id: number;
  name: string;
  type: CategoryType;
};

export type CategoriesResponse = ApiResponse<CategoryItem[]>;

/* ------ Post ------ */
export type PostListItem = {
  postId: number;
  author: UserSummary;
  title: string;
  thumbnailUrl: string | null;
  categories: ApiCategory[];

  likeCount: number;
  bookmarkCount: number;
  commentCount: number;

  likedByMe?: boolean;
  bookmarkedByMe?: boolean;

  createdAt: string;
  updatedAt: string;
};

export type PostDetail = PostListItem & {
  content: string;
};

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
  thumbnailUrl: string | null;
  imageIds: number[];
};

/* ------ Comment ------ */

// GET 통신 시 떨어지는 data
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

export type CreateCommentRequest = {
  content: string;
};

// PUT / POST 통신 시 떨어지는 data
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

/* ------ Like ------ */
export type LikeToggleResponseData = {
  postId?: number;
  commentId?: number;
  likeCount: number;
};
export type LikeToggleResponse = ApiResponse<LikeToggleResponseData>;

/* ------ Bookmark ------ */
export type BookmarkToggleResponseData = {
  postId: number;
  bookmarkCount: number;
};
export type BookmarkToggleResponse = ApiResponse<BookmarkToggleResponseData>;

/* ------ MyPage용 ------ */
export type MyPostListDto = {
  postId: number;
  author: UserSummary;
  title: string;
  thumbnailUrl: string | null;
  categories: CategoryItem[];
  likeCount: number;
  bookmarkCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
};
export type MyPostListPageResponse = ApiListPaginationResponse<MyPostListDto>;
export interface MyPostListQuery {
  page?: number;
  size?: number;
  sort?: string;
}
