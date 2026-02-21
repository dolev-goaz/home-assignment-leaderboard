# Skip List Performance Analysis

## Overview

This document presents benchmark results for the skip list data structure implementation used in the leaderboard system. The skip list is augmented with span arrays for O(log n) rank queries and uses a HashMap for O(1) node lookup.

## Configuration

| Parameter              | Value            |
| ---------------------- | ---------------- |
| Max Level              | 24               |
| Probability Factor (p) | 0.25             |
| Test Size              | 10,000,000 users |

## Time Complexity Verification

### Insert Operations

The benchmark confirms O(log n) behavior for insertions. The ratio of actual comparisons to log₂(n) remains constant as the data structure grows.

| Size       | Avg Comparisons | log₂(n) | Ratio |
| ---------- | --------------- | ------- | ----- |
| 100,000    | 27.43           | 16.61   | 1.65  |
| 500,000    | 34.62           | 18.93   | 1.83  |
| 1,000,000  | 36.84           | 19.93   | 1.85  |
| 2,000,000  | 38.53           | 20.93   | 1.84  |
| 5,000,000  | 40.83           | 22.25   | 1.83  |
| 10,000,000 | 43.97           | 23.25   | 1.89  |

**Key Finding:** When n grows 10× (1M → 10M), comparisons only increase by ~19% (36.84 → 43.97). This matches O(log n) prediction where log(10) ≈ 3.3 represents a ~16% increase.

## Operation Performance (10M Users)

| Operation                | Avg Time | Avg Comparisons | Complexity |
| ------------------------ | -------- | --------------- | ---------- |
| Insert                   | 0.023ms  | 43.97           | O(log n)   |
| Update (remove + insert) | 0.051ms  | 43.94           | O(log n)   |
| Rank Query               | 0.027ms  | 43.57           | O(log n)   |
| Get Top N                | 0ms      | N traversals    | O(N)       |
| Get Neighbors            | ~0ms     | k traversals    | O(k)       |

## Memory Usage

| Component               | Size          |
| ----------------------- | ------------- |
| Skip List Nodes         | ~1,351 MB     |
| HashMap (userId → node) | ~477 MB       |
| **Total**               | **~1,828 MB** |

### Memory Calculation

- Average node level: 2.48 (calculated as -1/ln(1-p) - 1)
- Bytes per node: ~142
- Total for 10M users: ~1.8GB

## Implementation Details

### Data Structure Components

1. **Skip List**: Probabilistic sorted structure with multiple levels
2. **Span Arrays**: Each pointer stores the number of nodes it "skips over" for O(log n) rank computation
3. **Backward Pointers**: Level 0 doubly-linked for O(k) neighbor retrieval
4. **HashMap**: O(1) node lookup by userId

### Visual Representation

```
Level 3: HEAD ────────────────────────────────────────► [G]
Level 2: HEAD ──────────────► [C] ────────────────────► [G]
Level 1: HEAD ──────► [B] ──► [C] ────────► [E] ──────► [G]
Level 0: HEAD ► [A] ► [B] ──► [C] ──► [D] ► [E] ► [F] ► [G]
                       ↑
                  backward pointers (for neighbors above)
```

### Sorting Order

- Primary: Score descending (higher scores first)
- Secondary: UserId ascending (for deterministic tie-breaking)

## Comparison with Alternatives

| Data Structure | Insert   | Delete   | Search   | Rank     | Space |
| -------------- | -------- | -------- | -------- | -------- | ----- |
| Skip List      | O(log n) | O(log n) | O(log n) | O(log n) | O(n)  |
| Balanced BST   | O(log n) | O(log n) | O(log n) | O(n)\*   | O(n)  |
| Sorted Array   | O(n)     | O(n)     | O(log n) | O(1)     | O(n)  |
| Linked List    | O(n)     | O(n)     | O(n)     | O(n)     | O(n)  |

\*BST rank requires augmentation similar to skip list span arrays

## Conclusion

The skip list implementation successfully achieves O(log n) performance for all core operations:

- **Insertions**: Stable ratio of ~1.85x log₂(n) across all sizes
- **Updates**: Two O(log n) operations combined
- **Rank Queries**: Efficient due to span array augmentation
- **Neighbor Queries**: O(k) using backward pointers at level 0

The data structure is well-suited for the leaderboard use case with 10M+ users, providing predictable logarithmic performance with reasonable memory overhead.
