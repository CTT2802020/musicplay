# Spotify Clone API

A RESTful API for a music streaming application built with Node.js, Express and MongoDB.

## Features

- User authentication with JWT
- Song management (upload, metadata)
- Playlist creation and management
- Listening history and recommendations
- Audio streaming with support for partial content (range requests)
- Role-based access control (user, admin)

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create .env file in the root directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/spotify-clone
JWT_SECRET=your_very_secure_secret_key
JWT_EXPIRE=7d
FILE_UPLOAD_PATH=./public/uploads
MAX_FILE_SIZE=10000000
```

4. Run the server:

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Documentation

### Authentication Routes

#### Register a new user
- **POST** `/api/v1/auth/register`
- Body:
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login user
- **POST** `/api/v1/auth/login`
- Body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get current user
- **GET** `/api/v1/auth/me`
- Headers: `Authorization: Bearer <token>`

#### Update user details
- **PUT** `/api/v1/auth/updatedetails`
- Headers: `Authorization: Bearer <token>`
- Body:
```json
{
  "name": "New Name"
}
```

#### Update password
- **PUT** `/api/v1/auth/updatepassword`
- Headers: `Authorization: Bearer <token>`
- Body:
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```

### Song Routes

#### Get all songs
- **GET** `/api/v1/songs`
- Query parameters:
  - `page`: Page number (default: 1)
  - `limit`: Number of results per page (default: 10)

#### Search songs
- **GET** `/api/v1/songs/search?q=<search term>`

#### Get single song
- **GET** `/api/v1/songs/:id`

#### Upload song
- **POST** `/api/v1/songs/upload`
- Headers: `Authorization: Bearer <token>`
- Body (multipart/form-data):
  - `audio`: Audio file (MP3, WAV, etc.)
  - `title`: Song title
  - `artist`: Artist name
  - `album`: Album name (optional)
  - `genre`: Genre (optional)
  - `releaseYear`: Release year (optional)
  - `coverImage`: Cover image filename (optional)

#### Update song
- **PUT** `/api/v1/songs/:id`
- Headers: `Authorization: Bearer <token>`
- Body:
```json
{
  "title": "New Title",
  "artist": "New Artist",
  "album": "New Album",
  "genre": "New Genre",
  "releaseYear": 2023
}
```

#### Delete song
- **DELETE** `/api/v1/songs/:id`
- Headers: `Authorization: Bearer <token>`

#### Record play
- **POST** `/api/v1/songs/:id/play`
- Headers: `Authorization: Bearer <token>`
- Body:
```json
{
  "duration": 180, 
  "completed": true
}
```

#### Upload song cover image
- **POST** `/api/v1/songs/:id/cover`
- Headers: `Authorization: Bearer <token>`
- Body (multipart/form-data):
  - `image`: Image file (JPEG, PNG, etc.)

### Playlist Routes

#### Get all public playlists
- **GET** `/api/v1/playlists`
- Query parameters:
  - `page`: Page number (default: 1)
  - `limit`: Number of results per page (default: 10)

#### Get user's playlists
- **GET** `/api/v1/playlists/me`
- Headers: `Authorization: Bearer <token>`

#### Get single playlist
- **GET** `/api/v1/playlists/:id`
- Headers: `Authorization: Bearer <token>` (required for private playlists)

#### Create playlist
- **POST** `/api/v1/playlists`
- Headers: `Authorization: Bearer <token>`
- Body:
```json
{
  "name": "Playlist Name",
  "description": "Playlist Description",
  "isPublic": true
}
```

#### Update playlist
- **PUT** `/api/v1/playlists/:id`
- Headers: `Authorization: Bearer <token>`
- Body:
```json
{
  "name": "New Name",
  "description": "New Description",
  "isPublic": false
}
```

#### Delete playlist
- **DELETE** `/api/v1/playlists/:id`
- Headers: `Authorization: Bearer <token>`

#### Add song to playlist
- **POST** `/api/v1/playlists/:id/songs`
- Headers: `Authorization: Bearer <token>`
- Body:
```json
{
  "songId": "song_id_here"
}
```

#### Remove song from playlist
- **DELETE** `/api/v1/playlists/:id/songs/:songId`
- Headers: `Authorization: Bearer <token>`

#### Upload playlist cover image
- **POST** `/api/v1/playlists/:id/cover`
- Headers: `Authorization: Bearer <token>`
- Body (multipart/form-data):
  - `image`: Image file (JPEG, PNG, etc.)

### History Routes

All history routes require authentication (`Authorization: Bearer <token>` header)

#### Get user's listening history
- **GET** `/api/v1/history`
- Query parameters:
  - `page`: Page number (default: 1)
  - `limit`: Number of results per page (default: 20)

#### Get recently played songs
- **GET** `/api/v1/history/recent`
- Query parameters:
  - `limit`: Number of results (default: 10)

#### Get most played songs
- **GET** `/api/v1/history/most-played`
- Query parameters:
  - `limit`: Number of results (default: 10)

#### Get song recommendations
- **GET** `/api/v1/history/recommendations`
- Query parameters:
  - `limit`: Number of results (default: 10)

#### Clear history
- **DELETE** `/api/v1/history`

### Stream Routes

#### Stream song
- **GET** `/api/v1/stream/:id`
- Supports byte ranges for seeking (using the `Range` header)

#### Get song metadata
- **GET** `/api/v1/stream/:id/metadata`

### User Routes

#### Upload user avatar
- **POST** `/api/v1/users/avatar`
- Headers: `Authorization: Bearer <token>`
- Body (multipart/form-data):
  - `image`: Image file (JPEG, PNG, etc.)

### Admin Routes

All admin routes require authentication and admin role (`role: 'admin'`)

#### Get all users
- **GET** `/api/v1/users`
- Headers: `Authorization: Bearer <token>`

#### Get single user
- **GET** `/api/v1/users/:id`
- Headers: `Authorization: Bearer <token>`

#### Update user role
- **PUT** `/api/v1/users/:id/role`
- Headers: `Authorization: Bearer <token>`
- Body:
```json
{
  "role": "admin" // or "user"
}
```

## Dependencies

- express: Web framework
- mongoose: MongoDB ODM
- jsonwebtoken: JWT authentication
- bcrypt: Password hashing
- multer: File uploads
- express-validator: Input validation
- dotenv: Environment variables
- cors: CORS support
- helmet: Security headers
- morgan: HTTP request logger
- mongoose-aggregate-paginate-v2: Pagination for aggregation queries
- express-rate-limit: Rate limiting

## License

MIT 