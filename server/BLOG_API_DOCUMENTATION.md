# Blog API Documentation

## Overview
The Blog API provides comprehensive CRUD operations for managing blog posts with Cloudinary integration for image uploads. This API allows you to create, read, update, and delete blog posts with support for both display images and additional images.

## Base URL
```
/api/blogs
```

## Authentication
Currently, all endpoints are public. Future versions may include admin authentication for create, update, and delete operations.

## Models

### Blog Model
```typescript
interface IBlog {
  _id: string;
  title: string;           // Required: Blog post title
  displayImage: string;    // Required: Main/cover image URL
  notes: string;          // Required: Blog content/body
  images: string[];       // Optional: Additional images URLs
  createdAt: Date;        // Auto-generated
  updatedAt: Date;        // Auto-generated
}
```

## API Endpoints

### 1. Create Blog Post
**POST** `/api/blogs`

Creates a new blog post with optional image uploads.

#### Request Body
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `title` (string, required): Blog post title (3-200 characters)
  - `notes` (string, required): Blog content (minimum 10 characters)
  - `displayImage` (file, optional): Main/cover image
  - `images` (files[], optional): Additional images (max 10 files)

#### File Upload Limits
- Maximum file size: 5MB per file
- Allowed formats: jpg, jpeg, png, gif, webp
- Maximum additional images: 10

#### Example Request
```bash
curl -X POST https://api.kynajewels.com/api/blogs \
  -F "title=My First Blog Post" \
  -F "notes=This is the content of my blog post..." \
  -F "displayImage=@/path/to/cover.jpg" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

#### Response
```json
{
  "success": true,
  "message": "Blog post created successfully",
  "data": {
    "_id": "64f8b1234567890abcdef123",
    "title": "My First Blog Post",
    "displayImage": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/kyna-jewels/blogs/cover_image",
    "notes": "This is the content of my blog post...",
    "images": [
      "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/kyna-jewels/blogs/image1",
      "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/kyna-jewels/blogs/image2"
    ],
    "createdAt": "2023-09-06T10:30:00.000Z",
    "updatedAt": "2023-09-06T10:30:00.000Z"
  }
}
```

### 2. Get All Blog Posts
**GET** `/api/blogs`

Retrieves all blog posts with pagination support.

#### Query Parameters
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)

#### Example Request
```bash
curl "https://api.kynajewels.com/api/blogs?page=1&limit=5"
```

#### Response
```json
{
  "success": true,
  "message": "Blogs retrieved successfully",
  "data": {
    "blogs": [
      {
        "_id": "64f8b1234567890abcdef123",
        "title": "My First Blog Post",
        "displayImage": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/kyna-jewels/blogs/cover_image",
        "notes": "This is the content of my blog post...",
        "images": ["..."],
        "createdAt": "2023-09-06T10:30:00.000Z",
        "updatedAt": "2023-09-06T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 25,
      "pages": 5
    }
  }
}
```

### 3. Get Blog Post by ID
**GET** `/api/blogs/:id`

Retrieves a single blog post by its ID.

#### Path Parameters
- `id` (string, required): MongoDB ObjectId of the blog post

#### Example Request
```bash
curl "https://api.kynajewels.com/api/blogs/64f8b1234567890abcdef123"
```

#### Response
```json
{
  "success": true,
  "message": "Blog post retrieved successfully",
  "data": {
    "_id": "64f8b1234567890abcdef123",
    "title": "My First Blog Post",
    "displayImage": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/kyna-jewels/blogs/cover_image",
    "notes": "This is the content of my blog post...",
    "images": ["..."],
    "createdAt": "2023-09-06T10:30:00.000Z",
    "updatedAt": "2023-09-06T10:30:00.000Z"
  }
}
```

### 4. Update Blog Post
**PUT** `/api/blogs/:id`

Updates an existing blog post with optional image updates.

#### Path Parameters
- `id` (string, required): MongoDB ObjectId of the blog post

#### Request Body
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `title` (string, optional): Updated blog post title
  - `notes` (string, optional): Updated blog content
  - `displayImage` (file, optional): New main/cover image
  - `images` (files[], optional): New additional images

#### Example Request
```bash
curl -X PUT https://api.kynajewels.com/api/blogs/64f8b1234567890abcdef123 \
  -F "title=Updated Blog Post Title" \
  -F "notes=Updated content..." \
  -F "displayImage=@/path/to/new-cover.jpg"
```

#### Response
```json
{
  "success": true,
  "message": "Blog post updated successfully",
  "data": {
    "_id": "64f8b1234567890abcdef123",
    "title": "Updated Blog Post Title",
    "displayImage": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/kyna-jewels/blogs/new_cover_image",
    "notes": "Updated content...",
    "images": ["..."],
    "createdAt": "2023-09-06T10:30:00.000Z",
    "updatedAt": "2023-09-06T11:45:00.000Z"
  }
}
```

### 5. Delete Blog Post
**DELETE** `/api/blogs/:id`

Deletes a blog post and all associated images from Cloudinary.

#### Path Parameters
- `id` (string, required): MongoDB ObjectId of the blog post

#### Example Request
```bash
curl -X DELETE https://api.kynajewels.com/api/blogs/64f8b1234567890abcdef123
```

#### Response
```json
{
  "success": true,
  "message": "Blog post deleted successfully"
}
```

### 6. Search Blog Posts
**GET** `/api/blogs/search`

Searches blog posts by title or content.

#### Query Parameters
- `q` (string, required): Search query (minimum 2 characters)
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)

#### Example Request
```bash
curl "https://api.kynajewels.com/api/blogs/search?q=jewelry&page=1&limit=5"
```

#### Response
```json
{
  "success": true,
  "message": "Search results retrieved successfully",
  "data": {
    "blogs": [
      {
        "_id": "64f8b1234567890abcdef123",
        "title": "Jewelry Care Tips",
        "displayImage": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/kyna-jewels/blogs/jewelry_care",
        "notes": "Learn how to take care of your jewelry...",
        "images": ["..."],
        "createdAt": "2023-09-06T10:30:00.000Z",
        "updatedAt": "2023-09-06T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 3,
      "pages": 1
    }
  }
}
```

### 7. Upload Display Image Only
**POST** `/api/blogs/:id/display-image`

Updates only the display image for an existing blog post.

#### Path Parameters
- `id` (string, required): MongoDB ObjectId of the blog post

#### Request Body
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `displayImage` (file, required): New main/cover image

### 8. Upload Additional Images Only
**POST** `/api/blogs/:id/images`

Adds additional images to an existing blog post.

#### Path Parameters
- `id` (string, required): MongoDB ObjectId of the blog post

#### Request Body
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `images` (files[], required): Additional images (max 10)

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Title is required",
      "param": "title",
      "location": "body"
    }
  ]
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "message": "Blog post not found"
}
```

### File Upload Error (400)
```json
{
  "success": false,
  "message": "File size too large. Maximum size is 5MB per file."
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Failed to create blog post",
  "error": "Database connection failed"
}
```

## Cloudinary Integration

### Image Storage
- All images are stored in the `kyna-jewels/blogs` folder on Cloudinary
- Images are automatically optimized for web delivery
- Automatic format conversion (WebP when supported)
- Quality optimization for faster loading

### Image Management
- Old images are automatically deleted when updating or deleting blog posts
- Public IDs are extracted from URLs for proper cleanup
- Error handling ensures main operations continue even if image deletion fails

## Rate Limiting
- General API rate limit: 100 requests per 15 minutes per IP (production)
- Development: 1000 requests per 15 minutes per IP

## Security Features
- File type validation (images only)
- File size limits (5MB per file)
- Maximum file count limits
- Input sanitization and validation
- CORS protection
- Helmet security headers

## Testing

### Using cURL
```bash
# Create a blog post
curl -X POST https://api.kynajewels.com/api/blogs \
  -F "title=Test Blog" \
  -F "notes=This is a test blog post content" \
  -F "displayImage=@test-image.jpg"

# Get all blogs
curl https://api.kynajewels.com/api/blogs

# Search blogs
curl "https://api.kynajewels.com/api/blogs/search?q=test"

# Update a blog
curl -X PUT https://api.kynajewels.com/api/blogs/BLOG_ID \
  -F "title=Updated Test Blog"

# Delete a blog
curl -X DELETE https://api.kynajewels.com/api/blogs/BLOG_ID
```

### Using Postman
1. Set method to POST/PUT
2. Set URL to `https://api.kynajewels.com/api/blogs`
3. Go to Body tab
4. Select "form-data"
5. Add fields: title, notes, displayImage, images
6. For file fields, select "File" type and upload images

## Environment Variables Required
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
MONGO_URI=mongodb://localhost:27017/kyna-jewels
```

## Future Enhancements
- Admin authentication for write operations
- Blog categories and tags
- Featured blog posts
- Blog post drafts
- Content scheduling
- SEO optimization fields
- Social media integration
- Comment system integration
