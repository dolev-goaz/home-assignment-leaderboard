# Design Choices

I chose to implement the leaderboard system using PostgreSQL as the persistent storage layer,
and an in-memory skip list data structure for efficient ranking and retrieval of scores.

## Data Structure- Skip List

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

### Updating a user’s score

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
Although it would be useful if there was a need for horizontal scaling(to not recompute the same data structure), we don't have that requirement in the assignment.
