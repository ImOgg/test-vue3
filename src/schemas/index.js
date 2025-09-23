import { z } from 'zod'

// User schema
export const UserSchema = z.object({
  id: z.number(),
  name: z.string().min(1, '姓名不能為空'),
  age: z.number().min(1, '年齡必須大於 0').max(150, '年齡必須小於 150'),
  city: z.string().min(1, '城市不能為空')
})

// Post schema
export const PostSchema = z.object({
  id: z.number(),
  title: z.string().min(1, '標題不能為空'),
  userId: z.number()
})

// Comment schema
export const CommentSchema = z.object({
  id: z.number(),
  body: z.string().min(1, '留言內容不能為空'),
  postId: z.number()
})

// Settings schema
export const SettingsSchema = z.object({
  simpleList: z.array(z.number())
})

// API response schemas
export const UsersResponseSchema = z.array(UserSchema)
export const PostsResponseSchema = z.array(PostSchema)
export const CommentsResponseSchema = z.array(CommentSchema)

// Form schemas (for creating/updating)
export const CreateUserSchema = UserSchema.omit({ id: true })
export const UpdateUserSchema = UserSchema.partial().omit({ id: true })

export const CreatePostSchema = PostSchema.omit({ id: true })
export const UpdatePostSchema = PostSchema.partial().omit({ id: true })

export const CreateCommentSchema = CommentSchema.omit({ id: true })
export const UpdateCommentSchema = CommentSchema.partial().omit({ id: true })

// Type exports for TypeScript-like intellisense
export const parseUser = (data) => UserSchema.parse(data)
export const parseUsers = (data) => UsersResponseSchema.parse(data)
export const parsePost = (data) => PostSchema.parse(data)
export const parsePosts = (data) => PostsResponseSchema.parse(data)
export const parseComment = (data) => CommentSchema.parse(data)
export const parseComments = (data) => CommentsResponseSchema.parse(data)
export const parseSettings = (data) => SettingsSchema.parse(data)