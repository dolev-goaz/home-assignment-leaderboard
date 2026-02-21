# Design Choices

I chose to implement the leaderboard system using PostgreSQL as the persistent storage layer,
and an in-memory skip list data structure for efficient ranking and retrieval of scores.

## Data Structure - Skip List

My initial thought was to use a balanced binary search tree for ordering users by score, but it posed challenges in fetching neighboring users efficiently.

Then I remembered Redis's sorted set(ZSET) implementation. It should theoretically perfectly fit our needs-

- Instant lookup of user scores by userId
- Users are ordered by score(which perfectly matches our requirement)
- O(log n) complexity for insertions, deletions, and rank retrievals

The implementation would be rather simple-

### Adding a new user with a score

```
ZADD leaderboard <score> <user_id>
```

### Updating a user's score

```
ZADD leaderboard XX CH 2500 "dolev" # Update only if user exists, returns if the score was updated
```

### Retrieving the top N users on the leaderboard

```
ZREVRANGE leaderboard 0 N-1 WITHSCORES # Reverse range as redis stored in ascending order
```

### Fetching neighboring users

```
ZRANK leaderboard <user_id>  # Get the rank of a user, lets say in <score>
ZREVRANGE leaderboard <score - 5> <score + 5> WITHSCORES
```

I did ask about using redis as the data-store as a clarifying question, but as the assignment was done in the weekend I took the liberty of not using Redis as the data-store.
Although it would be useful if there was a need for horizontal scaling(to not recompute the same data structure and maintain data consistency), we don't have that requirement in the assignment.

## Database Schema

The PostgreSQL schema is intentionally minimal:

```sql
CREATE TABLE users (
    userId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    score INTEGER NOT NULL
);
```

### Indexes

The skip list handles all leaderboard query operations in memory. PostgreSQL serves only as a persistence layer

Since we never query `SELECT * FROM users ORDER BY score`, an index on `score` would be wasted storage and write overhead. The primary key index is sufficient for all database operations.

### Image field

The assignment mentions user image, but doesnt specify

- How images are provided
- Where images are stored

We can easily add an "image_url" field to the schema if needed, or a base64 encoded string, but I chose to omit it for simplicity.

### Write-Through Pattern

Every write operation updates both PostgreSQL and the skip list:

1. **Add user**: INSERT to PostgreSQL → insert to skip list
2. **Update score**: UPDATE PostgreSQL → remove + insert in skip list

This ensures durability while maintaining fast reads from memory.

### Notes

Due to time constraints, I did not implement the Redis cachine layer, nor did I implement locks around the skip list.
In a production system, we would need to consider concurrency control for the skip list, especially if we expect high write throughput.
