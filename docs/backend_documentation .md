# QuizWhiz API Documentation

## Base URL
```
http://localhost:3001/api
```

## Table of Contents
- [Authentication](#authentication)
- [REST API Endpoints](#rest-api-endpoints)
  - [Authentication](#authentication-endpoints)
  - [Quiz Management](#quiz-management)
  - [Game Management](#game-management)
  - [File Upload](#file-upload)
  - [AI Integration](#ai-integration)
  - [System](#system)
- [WebSocket Events](#websocket-events)
  - [Host Events](#host-events)
  - [Player Events](#player-events)
  - [Server Events](#server-events)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Rate Limits](#rate-limits)

## Authentication

The API supports JWT-based authentication for host operations. Player operations do not require authentication.

### Authentication Flow
1. Host logs in to receive a JWT token
2. Token is included in WebSocket authentication or REST API headers
3. Host operations are protected and require valid tokens

**Authorization Header Format:**
```
Authorization: Bearer <jwt_token>
```

**WebSocket Authentication:**
```javascript
const socket = io('/host', {
  auth: { token: 'your_jwt_token' }
});
```

## REST API Endpoints

### Authentication Endpoints

#### Host Login
Authenticate as a host to receive a JWT token.

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "username": "host_username",
  "password": "host_password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "host_001",
    "username": "host_username",
    "role": "host"
  }
}
```

#### Generate Guest Token
Generate a temporary token for quiz hosting (2-hour expiry).

```http
POST /api/auth/guest-token
```

**Request Body:**
```json
{
  "quizId": "quiz_123456789"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Quiz Management

#### Create Quiz
Creates a new quiz with questions and categories.

**🔒 Authentication Required**

```http
POST /api/quizzes
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Science Quiz",
  "description": "A fun science quiz for students",
  "categories": ["Science", "Biology", "Chemistry"],
  "questions": [
    {
      "id": "q1",
      "text": "What is the chemical symbol for water?",
      "type": "multiple-choice",
      "options": [
        { "id": "a", "text": "H2O" },
        { "id": "b", "text": "CO2" },
        { "id": "c", "text": "NaCl" },
        { "id": "d", "text": "O2" }
      ],
      "correctAnswer": "a",
      "time": 30,
      "points": 1000,
      "mediaUrl": "/uploads/water-molecule.jpg"
    }
  ]
}
```

**Response:**
```json
{
  "id": "quiz_123456789",
  "title": "Science Quiz",
  "description": "A fun science quiz for students",
  "categories": ["Science", "Biology", "Chemistry"],
  "questions": [...],
  "status": "draft",
  "createdAt": "2025-08-14T10:30:00.000Z"
}
```

#### Get All Quizzes
Retrieves a list of all quizzes, ordered by creation date.

```http
GET /api/quizzes
```

**Response:**
```json
[
  {
    "id": "quiz_123456789",
    "title": "Science Quiz",
    "description": "A fun science quiz for students",
    "categories": ["Science", "Biology", "Chemistry"],
    "questions": [...],
    "createdAt": "2025-08-14T10:30:00.000Z",
    "status": "published"
  }
]
```

#### Get Quiz by ID
Retrieves a specific quiz by its ID.

```http
GET /api/quizzes/{id}
```

**Parameters:**
- `id` (string): Quiz identifier

**Response:**
```json
{
  "id": "quiz_123456789",
  "title": "Science Quiz",
  "description": "A fun science quiz for students",
  "categories": ["Science", "Biology", "Chemistry"],
  "questions": [...],
  "createdAt": "2025-08-14T10:30:00.000Z",
  "status": "published"
}
```

#### Update Quiz
Updates an existing quiz.

**🔒 Authentication Required**

```http
PUT /api/quizzes/{id}
Authorization: Bearer <token>
```

**Parameters:**
- `id` (string): Quiz identifier

**Request Body:**
```json
{
  "title": "Updated Science Quiz",
  "description": "An updated description",
  "categories": ["Science", "Physics"],
  "questions": [...],
  "status": "published"
}
```

**Response:**
```json
{
  "message": "Quiz updated successfully"
}
```

#### Delete Quiz
Deletes a quiz permanently.

**🔒 Authentication Required**

```http
DELETE /api/quizzes/{id}
Authorization: Bearer <token>
```

**Parameters:**
- `id` (string): Quiz identifier

**Response:**
```json
{
  "message": "Quiz deleted successfully"
}
```

### Game Management

#### Create Game Session
Creates a new game session with a unique PIN.

**🔒 Authentication Required**

```http
POST /api/games/create
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "quizId": "quiz_123456789"
}
```

**Response:**
```json
{
  "gameId": "game_987654321",
  "pin": "1234"
}
```

#### Join Game (HTTP)
Allows a player to join a game using a PIN via HTTP.

```http
POST /api/games/join
```

**Request Body:**
```json
{
  "pin": "1234",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "playerId": "player_456789123",
  "gameId": "game_987654321"
}
```

**Error Responses:**
- `404`: Game not found or already started
- `400`: Name already taken

#### Get Leaderboard
Retrieves the current leaderboard for a game.

```http
GET /api/games/{id}/leaderboard
```

**Parameters:**
- `id` (string): Game session identifier

**Response:**
```json
{
  "players": [
    {
      "id": "player_456789123",
      "name": "John Doe",
      "score": 2500,
      "answers": [
        {
          "questionId": "q1",
          "selectedOption": "a",
          "timeToAnswer": 15.5,
          "points": 1250
        }
      ]
    }
  ]
}
```


### File Upload

#### Upload Media File
Uploads media files for use in quizzes (images, audio, etc.).

```http
POST /api/upload
```

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `media`
- Max file size: 10MB

**Response:**
```json
{
  "mediaUrl": "/uploads/media-1642234567890-123456789.jpg",
  "originalName": "question-image.jpg"
}
```

### AI Integration

#### Get Category Suggestions
Gets AI-powered category suggestions for quiz creation.

```http
POST /api/ai/suggest-categories
```

**Request Body:**
```json
{
  "context": "educational quiz for high school students"
}
```

**Response:**
```json
{
  "suggestions": [
    "Science & Nature",
    "History",
    "Geography", 
    "Sports",
    "Entertainment",
    "Technology",
    "Literature",
    "Art & Culture"
  ]
}
```

### System

#### Health Check
Checks the system status and provides monitoring information.

```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "activeGames": 3,
  "totalConnections": 25,
  "timestamp": "2025-08-14T10:30:00.000Z"
}
```

## WebSocket Events

### Connection Namespaces

**Host Connection (Authenticated):**
```javascript
const hostSocket = io('/host', {
  auth: { token: localStorage.getItem('authToken') }
});
```

**Player Connection (No Authentication):**
```javascript
const playerSocket = io('/player');
```

### Host Events

**🔒 All host events require authentication**

#### Initialize Game
Host creates a new game session.

**Emit:**
```javascript
hostSocket.emit('host:init_game', {
  quizId: 'quiz_123456789'
});
```

**Response:**
```javascript
hostSocket.on('game:init', (data) => {
  console.log(data); // { gameId, pin, totalQuestions }
});
```

#### Start Game
Host starts the game, moving from lobby to active state.

**Emit:**
```javascript
hostSocket.emit('host:start_game', {
  gameId: 'game_987654321'
});
```

#### Next Question
Host advances to the next question.

**Emit:**
```javascript
hostSocket.emit('host:next_question', {
  gameId: 'game_987654321'
});
```

#### Reveal Answer
Host reveals the correct answer and statistics.

**Emit:**
```javascript
hostSocket.emit('host:reveal_answer', {
  gameId: 'game_987654321'
});
```

#### End Game
Host ends the game session.

**Emit:**
```javascript
hostSocket.emit('host:end_game', {
  gameId: 'game_987654321'
});
```

### Player Events

#### Join Game
Player joins a game using PIN and player ID.

**Emit:**
```javascript
playerSocket.emit('player:join', {
  pin: '1234',
  playerId: 'player_456789123'
});
```

**Response:**
```javascript
playerSocket.on('player:joined', (data) => {
  console.log(data); // { playerId, gameId }
});
```

#### Submit Answer
Player submits an answer to a question.

**Emit:**
```javascript
playerSocket.emit('player:answer', {
  gameId: 'game_987654321',
  questionId: 'q1',
  choiceId: 'a',
  timeTaken: 15.5
});
```

**Response:**
```javascript
playerSocket.on('answer:submitted', (data) => {
  console.log(data); // { points: 1250 }
});
```

### Server Events

#### Lobby Update
Sent when players join or leave the lobby.

**Listen:**
```javascript
socket.on('game:lobby_update', (data) => {
  console.log(data.players); // Array of player objects
});
```

#### Question Broadcast
Sent when a new question starts.

**Listen:**
```javascript
socket.on('game:question', (data) => {
  console.log(data);
  /* {
    question: "What is the chemical symbol for water?",
    choices: [{ id: "a", text: "H2O" }, ...],
    timeLimit: 30,
    questionNumber: 1,
    totalQuestions: 10
  } */
});
```

#### Timer Update
Sent every second during a question.

**Listen:**
```javascript
socket.on('game:time', (data) => {
  console.log(data.secondsLeft); // 29, 28, 27, ...
});
```

#### Answer Reveal
Sent when host reveals the correct answer.

**Listen:**
```javascript
socket.on('game:reveal', (data) => {
  console.log(data);
  /* {
    correctChoiceId: "a",
    stats: {
      choiceCounts: { "a": 15, "b": 5, "c": 3, "d": 2 }
    }
  } */
});
```

#### Leaderboard Update
Sent after each question with updated scores.

**Listen:**
```javascript
socket.on('game:leaderboard', (data) => {
  console.log(data.players); // Sorted array of players by score
});
```

#### Game Over
Sent when the game ends.

**Listen:**
```javascript
socket.on('game:game_over', (data) => {
  console.log(data.finalLeaderboard); // Final rankings
});
```

#### Error Handling
Sent when an error occurs.

**Listen:**
```javascript
socket.on('game:error', (data) => {
  console.error(data.message); // Error description
});
```

## Data Models

### Quiz
```typescript
interface Quiz {
  id: string;
  title: string;
  description?: string;
  categories: string; // JSON string
  questions: string; // JSON string
  createdAt: DateTime;
  status: 'draft' | 'published';
  gameSessions?: GameSession[];
}
```

### Question
```typescript
interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false';
  options: Option[];
  correctAnswer: string;
  time: number; // seconds
  points: number;
  mediaUrl?: string;
}
```

### Option
```typescript
interface Option {
  id: string;
  text: string;
}
```

### Game Session
```typescript
interface GameSession {
  id: string;
  pin: string; // 4-digit code
  status: 'lobby' | 'active' | 'finished';
  currentQuestion: number;
  startedAt?: DateTime;
  quiz: Quiz;
  quizId: string;
  players: Player[];
  hostId?: string; // For authenticated hosts
}
```

### Player
```typescript
interface Player {
  id: string;
  name: string;
  score: number;
  answers: string; // JSON string
  gameSession: GameSession;
  gameId: string;
}
```

### Answer
```typescript
interface Answer {
  questionId: string;
  selectedOption: string;
  timeToAnswer: number; // seconds
  points: number;
}
```

### User/Host
```typescript
interface User {
  id: string;
  username: string;
  role: 'host' | 'guest_host';
  quizId?: string; // For guest hosts
}
```

## Error Handling

### HTTP Status Codes
- `200`: Success
- `400`: Bad Request (invalid input, validation errors)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (quiz/game not found)
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

### Error Response Format
```json
{
  "error": "Error description here"
}
```

### Common WebSocket Errors
- `"Authentication token required"`: Missing authentication for host events
- `"Authentication failed"`: Invalid or expired token
- `"Game not found or unauthorized"`: Invalid game ID or permissions
- `"You are not authorized to control this game"`: Host permission check failed
- `"Socket session mismatch"`: Host socket doesn't match stored session
- `"Name already taken"`: Player name conflict in lobby
- `"Already answered this question"`: Duplicate answer submission
- `"Player not found or unauthorized"`: Invalid player state
- `"User not registered"`: Player ID not found in database

### Prisma Error Codes
- `P2002`: Unique constraint violation (duplicate PIN, name, etc.)
- `P2025`: Record not found during update/delete operations

## Rate Limits

### File Uploads
- Maximum file size: 10MB
- Supported formats: Images, audio files
- Basic rate limiting: 100 requests per minute per IP

### WebSocket Connections
- Authentication required for host namespace
- Automatic cleanup of inactive connections
- Daily cleanup of finished games (24+ hours old)

### Database Operations
- Prisma handles connection pooling automatically
- Async operations with proper error handling
- Prepared statements via Prisma for performance and security

## Example Usage

### Complete Authentication Flow

```javascript
// 1. Host Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'host', password: 'password' })
});
const { token } = await loginResponse.json();
localStorage.setItem('authToken', token);

// 2. Connect with authentication
const hostSocket = io('/host', {
  auth: { token: localStorage.getItem('authToken') }
});

// 3. Handle authentication events
hostSocket.on('connect', () => {
  console.log('Authenticated and connected as host');
});

hostSocket.on('connect_error', (error) => {
  console.error('Authentication failed:', error.message);
});
```

### Complete Game Flow Example

```javascript
// Host creates and starts a game
const hostSocket = io('/host', {
  auth: { token: localStorage.getItem('authToken') }
});

// Initialize game
hostSocket.emit('host:init_game', { quizId: 'quiz_123' });

hostSocket.on('game:init', ({ gameId, pin, totalQuestions }) => {
  console.log(`Game created with PIN: ${pin}`);
  console.log(`Total questions: ${totalQuestions}`);
  
  // Wait for players, then start
  setTimeout(() => {
    hostSocket.emit('host:start_game', { gameId });
  }, 30000);
});

// Handle question flow with timer
let currentGameId;
hostSocket.on('game:question', (data) => {
  console.log(`Question ${data.questionNumber}: ${data.question}`);
  
  // Auto-reveal after time limit (optional)
  setTimeout(() => {
    hostSocket.emit('host:reveal_answer', { gameId: currentGameId });
  }, data.timeLimit * 1000);
});

// Player joins and plays (separate connection)
const playerSocket = io('/player');

// First register via HTTP, then join via WebSocket
const joinResponse = await fetch('/api/games/join', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ pin: '1234', name: 'Alice' })
});
const { playerId, gameId } = await joinResponse.json();

// Join game via WebSocket
playerSocket.emit('player:join', { pin: '1234', playerId });

playerSocket.on('player:joined', (data) => {
  console.log('Successfully joined game:', data);
});

playerSocket.on('game:question', (data) => {
  console.log('New question:', data.question);
  
  // Simulate player answering
  setTimeout(() => {
    playerSocket.emit('player:answer', {
      gameId,
      questionId: data.questionId || 'q1',
      choiceId: 'a',
      timeTaken: 12.5
    });
  }, 12500);
});

playerSocket.on('answer:submitted', (data) => {
  console.log(`Answer submitted! Points earned: ${data.points}`);
});
```

### Error Handling Example

```javascript
// Comprehensive error handling
hostSocket.on('game:error', (error) => {
  console.error('Game error:', error.message);
  
  // Handle specific errors
  switch (error.message) {
    case 'Authentication token required':
      // Redirect to login
      window.location.href = '/login';
      break;
    case 'You are not authorized to control this game':
      // Show permission error
      showErrorMessage('You don\'t have permission to control this game');
      break;
    default:
      showErrorMessage(error.message);
  }
});

// HTTP error handling
async function createQuiz(quizData) {
  try {
    const response = await fetch('/api/quizzes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(quizData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to create quiz:', error.message);
    throw error;
  }
}
```

## Testing

### Using cURL for REST endpoints:
```bash
# Host login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"host","password":"password"}'

# Create a quiz (with authentication)
curl -X POST http://localhost:3001/api/quizzes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title":"Test Quiz","questions":[]}'

# Get all quizzes
curl http://localhost:3001/api/quizzes

# Check system health
curl http://localhost:3001/api/health
```

### Using a WebSocket client:
```javascript
// Browser console or Node.js
const hostSocket = io('/host', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});

hostSocket.on('connect', () => {
  hostSocket.emit('host:init_game', { quizId: 'test_quiz' });
});

const playerSocket = io('/player');
playerSocket.emit('player:join', { 
  pin: '1234', 
  playerId: 'test_player_123' 
});
```

## Database Schema (Prisma)

The application uses Prisma ORM with SQLite database. Key schema elements:

```prisma
model Quiz {
  id          String        @id
  title       String
  description String?
  categories  String        // JSON
  questions   String        // JSON
  createdAt   DateTime      @default(now())
  status      String        @default("draft")
  gameSessions GameSession[]
}

model GameSession {
  id             String    @id
  pin            String    @unique
  status         String    @default("lobby")
  currentQuestion Int      @default(0)
  startedAt      DateTime?
  quiz           Quiz      @relation(fields: [quizId], references: [id])
  quizId         String
  players        Player[]
}

model Player {
  id          String      @id
  name        String
  score       Int         @default(0)
  answers     String      @default("[]") // JSON
  gameSession GameSession @relation(fields: [gameId], references: [id])
  gameId      String
}
```

## Architecture Notes

### Technology Stack
- **Backend**: Node.js with Express.js
- **WebSocket**: Socket.io with namespace separation
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT tokens
- **File Upload**: Multer middleware
- **Validation**: Custom middleware with error classes

### Security Features
- JWT authentication for host operations
- Namespace isolation between hosts and players
- Input validation and sanitization
- Rate limiting on endpoints
- CORS configuration
- Error handling without data leakage

### Performance Considerations
- Prisma connection pooling
- Socket.io room-based broadcasting
- Automatic cleanup of old games
- Async/await throughout for non-blocking operations
- JSON storage for complex data structures

This documentation covers all the endpoints and events available in the QuizWhiz backend API. For additional support or feature requests, please refer to the project repository.