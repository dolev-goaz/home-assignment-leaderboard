import type { UserID } from "@/types/user";

const MAX_LEVEL = 24;
const P_FACTOR = 0.25;

/**
 * Skip List Node
 *
 * Explanation- https://www.youtube.com/watch?v=UGaOXaXAM5M
 *
 * Each node stores:
 * - value: the actual data (user id, score, name)
 * - forward[i]: pointer to next node at level i
 * - span[i]: how many nodes this pointer "skips over" (for O(log n) rank computation)
 * - backward: pointer to previous node at level 0 (for getting neighbors above)
 *
 * Example-
 *
 * Level 3: HEAD ------------------------------------► [G]
 * Level 2: HEAD ------------► [C] ------------------► [G]
 * Level 1: HEAD ------► [B] ► [C] ------► [E] ------► [G]
 * Level 0: HEAD ► [A] ► [B] ► [C] ► [D] ► [E] ► [F] ► [G]
 *
 * The span array tells us how many level-0 nodes each pointer jumps over.
 */
class SkipListNode<T> {
    value: T;
    // forward pointers for each level
    next: Array<SkipListNode<T> | null>;
    // span[i] = number of nodes skipped by next[i]
    span: number[];
    // previous pointer, in level 0 (for neighbors above query)
    prev: SkipListNode<T> | null;

    constructor(level: number, value: T) {
        this.value = value;
        this.next = new Array(level + 1).fill(null);
        this.span = new Array(level + 1).fill(0);
        this.prev = null;
    }
}

export interface SkipListEntry {
    id: UserID;
    score: number;
}

interface RankedNode<T extends SkipListEntry> {
    node: T;
    aboveNodes: T[];
    belowNodes: T[];
}

export class SkipList<T extends SkipListEntry> {
    private head: SkipListNode<T>;
    private level: number = 0;
    private length: number = 0;
    private nodeMap: Map<UserID, SkipListNode<T>> = new Map();

    constructor() {
        this.head = new SkipListNode<T>(MAX_LEVEL, null as unknown as T);
        for (let i = 0; i <= MAX_LEVEL; i++) {
            this.head.span[i] = 0;
        }
    }

    /**
     * randomly determine the level of a new node.
     * probability decreases exponentially with level
     */
    private randomLevel(): number {
        let level = 0;
        while (Math.random() < P_FACTOR && level < MAX_LEVEL) {
            level++;
        }
        return level;
    }

    /**
     * Returns:
     * - Positive: a > b
     * - Negative: a < b
     * - Zero: equal
     */
    private compare(a: T, b: T): number {
        if (a.id === b.id) return 0;
        if (a.score !== b.score) {
            return a.score - b.score;
        }
        return b.id.localeCompare(a.id);
    }

    insert(value: T): void {
        const prevByLevel: Array<SkipListNode<T> | null> = new Array(MAX_LEVEL + 1).fill(null);
        const prevByLevelRank: number[] = new Array(MAX_LEVEL + 1).fill(0);

        // ===== Find where to insert, track predecessors and their ranks at each level =====
        let current: SkipListNode<T> | null = this.head;
        for (let i = this.level; i >= 0; i--) {
            prevByLevelRank[i] = i === this.level ? 0 : prevByLevelRank[i + 1];
            while (current!.next[i] !== null) {
                const next: SkipListNode<T> = current!.next[i]!;
                const cmp = this.compare(next.value, value);
                if (cmp === 0) {
                    // user already exists, exit
                    return;
                }
                if (cmp < 0) {
                    // reached position to insert at level i
                    break;
                }
                prevByLevelRank[i] += current!.span[i];
                current = next;
            }
            prevByLevel[i] = current;
        }

        // ===== Randomly determine new node's level =====
        const newLevel = this.randomLevel();
        if (newLevel > this.level) {
            for (let i = this.level + 1; i <= newLevel; i++) {
                prevByLevelRank[i] = 0;
                prevByLevel[i] = this.head;
                prevByLevel[i]!.span[i] = this.length;
            }
            this.level = newLevel;
        }

        const newNode = new SkipListNode<T>(newLevel, value);

        // ===== Insert new node and update spans =====
        for (let i = 0; i <= newLevel; i++) {
            // update forward pointers
            newNode.next[i] = prevByLevel[i]!.next[i];
            prevByLevel[i]!.next[i] = newNode;

            // update span values
            const rankDiff = prevByLevelRank[0] - prevByLevelRank[i];
            newNode.span[i] = prevByLevel[i]!.span[i] - rankDiff;
            prevByLevel[i]!.span[i] = rankDiff + 1;
        }

        // levels above newNode's level
        for (let i = newLevel + 1; i <= this.level; i++) {
            prevByLevel[i]!.span[i] += 1;
        }

        newNode.prev = prevByLevel[0] === this.head ? null : prevByLevel[0];
        if (newNode.next[0] !== null) {
            newNode.next[0]!.prev = newNode;
        }
        this.length += 1;
        this.nodeMap.set(value.id, newNode);
    }

    /**
     * Remove a node by userId.
     * 1. Find all predecessor nodes at each level using value comparison (O(log n))
     * 2. Update their forward pointers and spans
     * 3. Update backward pointer of next node
     */
    remove(id: UserID): boolean {
        const node = this.nodeMap.get(id);
        if (!node) return false;

        const targetValue = node.value;
        const prevByLevel: Array<SkipListNode<T> | null> = new Array(MAX_LEVEL + 1).fill(null);

        // ===== Find predecessors at each level =====
        let current: SkipListNode<T> | null = this.head;
        for (let i = this.level; i >= 0; i--) {
            while (current!.next[i] !== null) {
                const next: SkipListNode<T> = current!.next[i]!;
                const cmp = this.compare(next.value, targetValue);
                if (cmp <= 0) {
                    break;
                }
                current = next;
            }
            prevByLevel[i] = current;
        }

        // ===== Remove node from each level, update spans =====
        for (let i = 0; i <= this.level; i++) {
            if (prevByLevel[i]!.next[i] === node) {
                prevByLevel[i]!.span[i] += node.span[i] - 1;
                prevByLevel[i]!.next[i] = node.next[i];
            } else {
                prevByLevel[i]!.span[i]--;
            }
        }

        if (node.next[0] !== null) {
            node.next[0]!.prev = node.prev;
        }

        // ===== remove unused levels =====
        while (this.level > 0 && this.head.next[this.level] === null) {
            this.level--;
        }

        this.length--;
        this.nodeMap.delete(id);
        return true;
    }

    // Similar to insert, we search the expected position of the node
    // and count how many nodes we skipped over to get the rank.
    getRank(id: UserID): number {
        const node = this.nodeMap.get(id);
        if (!node) return -1;

        const targetValue = node.value;
        let rank = 0;
        let current: SkipListNode<T> | null = this.head;

        for (let i = this.level; i >= 0; i--) {
            while (current!.next[i] !== null) {
                const next: SkipListNode<T> = current!.next[i]!;
                const cmp = this.compare(next.value, targetValue);
                if (cmp <= 0) {
                    // went past the target value, go down a level
                    break;
                }
                rank += current!.span[i];
                current = next;
            }
        }
        return rank + 1;
    }

    getByRank(rank: number): T | null {
        if (rank < 1 || rank > this.length) return null;

        let traversed = 0;
        let current: SkipListNode<T> | null = this.head;

        for (let i = this.level; i >= 0; i--) {
            while (current!.next[i] !== null && traversed + current!.span[i] < rank) {
                traversed += current!.span[i];
                current = current!.next[i];
            }
        }

        traversed++;
        current = current!.next[0];

        return current?.value ?? null;
    }

    getFirstN(n: number): T[] {
        const result: T[] = [];
        let current = this.head.next[0];
        while (current !== null && result.length < n) {
            result.push(current.value);
            current = current.next[0];
        }
        return result;
    }

    getNeighbors(id: UserID, above: number, below: number): RankedNode<T> | null {
        const node = this.nodeMap.get(id);
        if (!node) return null;

        const aboveNodes: T[] = [];
        let current = node.prev;
        while (current !== null && current.value !== null && aboveNodes.length < above) {
            aboveNodes.unshift(current.value);
            current = current.prev;
        }

        const belowNodes: T[] = [];
        current = node.next[0];
        while (current !== null && belowNodes.length < below) {
            belowNodes.push(current.value);
            current = current.next[0];
        }

        return { node: node.value, aboveNodes, belowNodes };
    }

    has(id: UserID): boolean {
        return this.nodeMap.has(id);
    }

    getEntry(id: UserID): T | null {
        const node = this.nodeMap.get(id);
        return node?.value ?? null;
    }

    getLength(): number {
        return this.length;
    }
}
