# QuizWhiz API Documentation

## Base URL
```
http://localhost:3001/api
```

## Table of Contents
- [Authentication](#authentication)
- [REST API Endpoints](#rest-api-endpoints)
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
Currently, the API uses basic authentication without tokens. Future versions may implement JWT tokens or session-based authentication.

## REST API Endpoints

### Quiz Management

#### Create Quiz
Creates a new quiz with questions and categories.

```http
POST /api/quizzes
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
  "status": "draft"
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
    "createdAt": "2024-01-15T10:30:00.000Z",
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
  "createdAt": "2024-01-15T10:30:00.000Z",
  "status": "published"
}
```

#### Update Quiz
Updates an existing quiz.

```http
PUT /api/quizzes/{id}
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

```http
DELETE /api/quizzes/{id}
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

```http
POST /api/games/create
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

#### Join Game
Allows a player to join a game using a PIN.

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
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## WebSocket Events

### Connection
Connect to WebSocket at the base URL:
```javascript
const socket = io('http://localhost:3001');
```

### Host Events

#### Create Game
Host creates a new game session.

**Emit:**
```javascript
socket.emit('host:create_game', {
  quizId: 'quiz_123456789'
});
```

**Response:**
```javascript
socket.on('game:created', (data) => {
  console.log(data); // { gameId, pin }
});
```

#### Start Game
Host starts the game, moving from lobby to active state.

**Emit:**
```javascript
socket.emit('host:start_game', {
  gameId: 'game_987654321'
});
```

#### Next Question
Host advances to the next question.

**Emit:**
```javascript
socket.emit('host:next_question', {
  gameId: 'game_987654321'
});
```

#### Reveal Answer
Host reveals the correct answer and statistics.

**Emit:**
```javascript
socket.emit('host:reveal_answer', {
  gameId: 'game_987654321'
});
```

#### End Game
Host ends the game session.

**Emit:**
```javascript
socket.emit('host:end_game', {
  gameId: 'game_987654321'
});
```

### Player Events

#### Join Game
Player joins a game using PIN and name.

**Emit:**
```javascript
socket.emit('player:join', {
  pin: '1234',
  name: 'John Doe'
});
```

**Response:**
```javascript
socket.on('player:joined', (data) => {
  console.log(data); // { playerId, gameId }
});
```

#### Submit Answer
Player submits an answer to a question.

**Emit:**
```javascript
socket.emit('player:answer', {
  gameId: 'game_987654321',
  questionId: 'q1',
  choiceId: 'a',
  timeTaken: 15.5
});
```

**Response:**
```javascript
socket.on('answer:submitted', (data) => {
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
  categories: string[];
  questions: Question[];
  createdAt: string;
  status: 'draft' | 'published';
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
  quizId: string;
  pin: string; // 4-digit code
  status: 'lobby' | 'active' | 'finished';
  players: Player[];
  currentQuestion: number;
  startedAt?: string;
}
```

### Player
```typescript
interface Player {
  id: string;
  name: string;
  score: number;
  answers: Answer[];
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

## Error Handling

### HTTP Status Codes
- `200`: Success
- `400`: Bad Request (invalid input, name taken, etc.)
- `404`: Not Found (quiz/game not found)
- `500`: Internal Server Error

### Error Response Format
```json
{
  "error": "Error description here"
}
```

### Common WebSocket Errors
- `"Game not found or unauthorized"`: Invalid game ID or permissions
- `"Name already taken"`: Player name conflict in lobby
- `"Already answered this question"`: Duplicate answer submission
- `"Player not found or unauthorized"`: Invalid player state

## Rate Limits

### File Uploads
- Maximum file size: 10MB
- Supported formats: Images, audio files
- No rate limit on upload frequency

### WebSocket Connections
- No explicit connection limits
- Automatic cleanup of inactive connections
- Daily cleanup of finished games (24+ hours old)

### Database Operations
- No explicit rate limits
- SQLite handles concurrent access automatically
- Prepared statements used for performance

## Example Usage

### Complete Game Flow Example

```javascript
// Host creates and starts a game
const socket = io('http://localhost:3001');

// Create game
socket.emit('host:create_game', { quizId: 'quiz_123' });

socket.on('game:created', ({ gameId, pin }) => {
  console.log(`Game created with PIN: ${pin}`);
  
  // Wait for players, then start
  setTimeout(() => {
    socket.emit('host:start_game', { gameId });
  }, 30000);
});

// Handle question flow
socket.on('game:question', (data) => {
  console.log(`Question: ${data.question}`);
  
  // After time limit, reveal answer
  setTimeout(() => {
    socket.emit('host:reveal_answer', { gameId });
  }, data.timeLimit * 1000);
});

// Player joins and plays
const playerSocket = io('http://localhost:3001');

playerSocket.emit('player:join', { pin: '1234', name: 'Alice' });

playerSocket.on('game:question', (data) => {
  // Simulate player answering
  setTimeout(() => {
    playerSocket.emit('player:answer', {
      gameId: 'game_987654321',
      questionId: 'q1',
      choiceId: 'a',
      timeTaken: 12.5
    });
  }, 12500);
});
```

## Testing

### Using cURL for REST endpoints:
```bash
# Create a quiz
curl -X POST http://localhost:3001/api/quizzes \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Quiz","questions":[]}'

# Get all quizzes
curl http://localhost:3001/api/quizzes

# Check system health
curl http://localhost:3001/api/health
```

### Using a WebSocket client:
```javascript
// Browser console or Node.js
const socket = io('http://localhost:3001');
socket.emit('host:create_game', { quizId: 'test_quiz' });
```

This documentation covers all the endpoints and events available in the QuizWhiz backend API. For additional support or feature requests, please refer to the project repository.