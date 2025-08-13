# QuizWhiz Backend Requirements (LAN Version)

## Data Models

### Quiz

- id: string (unique identifier)
- title: string
- description: string (optional)
- categories: string[]
- questions: Question[]
- createdAt: timestamp
- status: "draft" | "published"

### Question

- id: string
- text: string
- type: "multiple-choice" | "true-false"
- options: Option[]
- correctAnswer: string
- time: number (seconds)
- points: number
- mediaUrl: string (optional)

### Option

- id: string
- text: string

### Game Session

- id: string
- quizId: string
- pin: string (4-digit code)
- status: "lobby" | "active" | "finished"
- players: Player[]
- currentQuestion: number
- startedAt: timestamp

### Player

- id: string
- name: string
- score: number
- answers: Answer[]

### Answer

- questionId: string
- selectedOption: string
- timeToAnswer: number
- points: number

## Communication Protocols

### REST API Endpoints

#### Quiz Management

```typescript
POST /api/quizzes          // Create new quiz
GET /api/quizzes           // List quizzes
GET /api/quizzes/:id       // Get quiz details
PUT /api/quizzes/:id       // Update quiz
DELETE /api/quizzes/:id    // Delete quiz
```

### Game Flow

```typescript
POST /api/games/create              // Create new game session
POST /api/games/join               // Player joins via PIN
POST /api/games/:id/start          // Start game
POST /api/games/:id/next           // Next question
POST /api/games/:id/answer         // Submit answer
GET /api/games/:id/leaderboard     // Get current standings
POST /api/games/:id/end            // End game session
```

### AI Integration

```typescript
POST / api / ai / suggest - categories; // Get AI category suggestions
```

## Real-time Requirements

### WebSocket connections for:

- Live player lobby updates
- Question broadcasting
- Answer submission
- Score updates
- Leaderboard changes
- Game state changes

### Emit Events (Host → Server)

- host:create_game // { quizId } → returns { gameId, pin }
- host:start_game // { gameId }
- host:next_question // { gameId }
- host:reveal_answer // { gameId }
- host:end_game // { gameId }
- host:update_settings // { gameId, settings }

### Listen Events (Server → Host)

- game:lobby_update // { players: Player[] }
- game:question // { question, choices, timeLimit }
- game:time // { secondsLeft }
- game:reveal // { correctChoiceId, stats: { choiceCounts } }
- game:leaderboard // { players: sorted }
- game:game_over // { finalLeaderboard }
- game:error // { message }

### Emit Events (Player → Server)

- player:join // { pin, name }
- player:answer // { gameId, questionId, choiceId, timeTaken }
- player:disconnecting // (optional)

### Listen Events (Server → Player)

- game:lobby_update // { players: Player[] }
- game:question // { question, choices, timeLimit }
- game:time // { secondsLeft }
- game:reveal // { correctChoiceId, stats: { choiceCounts } }
- game:leaderboard // { players: sorted }
- game:game_over // { finalLeaderboard }
- game:error // { message }

## WebSocket Implementation Details

### Room Structure

- Game Room: game:${gameId}
- Host Room: host:${gameId} (optional, for host-specific events)

### Connection Lifecycle

1. Initial connection with authentication
2. Join appropriate room(s)
3. Handle reconnection scenarios
4. Graceful disconnection handling

## Basic Security
- Simple password protection for quiz creation
- Player names must be unique per game
- Basic input validation

## Storage

### Files

- Local file storage for images
- Basic file size limit (10MB)

### Database

- Simple SQLite or similar lightweight database
- Basic indexing on frequently accessed fields
- Daily cleanup of completed games

## Basic Monitoring
- Simple error logging
- Active game sessions count
- Basic connection status


## Real-time Monitoring

- WebSocket server health
- Connection pool status
- Room membership counts
- Event processing queue

## Implementation Notes
- Use local network IP address
- Simple room-based WebSocket implementation
- Basic error handling
- No need for complex caching or optimization