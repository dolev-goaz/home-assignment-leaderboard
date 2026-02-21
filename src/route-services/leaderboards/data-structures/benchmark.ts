import { LeaderboardStore } from "./leaderboard-store";

function formatNumber(n: number): string {
    return n.toLocaleString();
}

function printSection(title: string) {
    console.log("\n" + "=".repeat(60));
    console.log(`  ${title}`);
    console.log("=".repeat(60));
}

async function benchmark() {
    const TOTAL_USERS = 1_000_000;
    const SAMPLE_INTERVAL = 100_000;
    const UPDATE_SAMPLE_SIZE = 10_000;
    const RANK_SAMPLE_SIZE = 1_000;
    const TOP_N_SIZE = 100;

    const store = new LeaderboardStore();
    const userIds: string[] = [];

    printSection("SKIP LIST BENCHMARK");
    console.log(`\nConfiguration:`);
    console.log(`  Total users to insert: ${formatNumber(TOTAL_USERS)}`);
    console.log(`  Sample interval: ${formatNumber(SAMPLE_INTERVAL)}`);

    printSection("PHASE 1: INSERTIONS");

    console.log("\nInserting users...");
    const insertStart = Date.now();

    for (let i = 0; i < TOTAL_USERS; i++) {
        const score = Math.floor(Math.random() * 1_000_000);
        store.addUser(`user${i}`, `User${i}`, score);
        userIds.push(`user${i}`);

        if ((i + 1) % SAMPLE_INTERVAL === 0) {
            const elapsed = Date.now() - insertStart;
            const avgTime = elapsed / (i + 1);
            console.log(
                `  ${formatNumber(i + 1)} users inserted (${elapsed}ms, avg: ${avgTime.toFixed(3)}ms/insert)`,
            );
        }
    }

    const insertTotal = Date.now() - insertStart;
    console.log(`\nTotal insert time: ${insertTotal}ms`);
    console.log(`Average time per insert: ${(insertTotal / TOTAL_USERS).toFixed(3)}ms`);

    printSection("PHASE 2: SCORE UPDATES");

    console.log(`\nUpdating ${formatNumber(UPDATE_SAMPLE_SIZE)} random users...`);
    const updateStart = Date.now();

    for (let i = 0; i < UPDATE_SAMPLE_SIZE; i++) {
        const userId = userIds[Math.floor(Math.random() * userIds.length)];
        const newScore = Math.floor(Math.random() * 1_000_000);
        store.updateUserScore(userId, newScore);
    }

    const updateTotal = Date.now() - updateStart;
    console.log(`\nTotal update time: ${updateTotal}ms`);
    console.log(`Average time per update: ${(updateTotal / UPDATE_SAMPLE_SIZE).toFixed(3)}ms`);

    printSection("PHASE 3: RANK QUERIES");

    console.log(`\nQuerying rank for ${formatNumber(RANK_SAMPLE_SIZE)} random users...`);
    const rankStart = Date.now();

    for (let i = 0; i < RANK_SAMPLE_SIZE; i++) {
        const userId = userIds[Math.floor(Math.random() * userIds.length)];
        store.getUserPosition(userId);
    }

    const rankTotal = Date.now() - rankStart;
    console.log(`\nTotal rank query time: ${rankTotal}ms`);
    console.log(`Average time per query: ${(rankTotal / RANK_SAMPLE_SIZE).toFixed(3)}ms`);

    printSection("PHASE 4: GET TOP N USERS");

    console.log(`\nFetching top ${TOP_N_SIZE} users...`);
    const topNStart = Date.now();
    const topUsers = store.getTopUsers(TOP_N_SIZE);
    const topNTotal = Date.now() - topNStart;

    console.log(`Time: ${topNTotal}ms`);
    console.log(`\nTop 5 users:`);
    topUsers.slice(0, 5).forEach((user, i) => {
        console.log(`  ${i + 1}. ${user.id} - score: ${formatNumber(user.score)}`);
    });

    printSection("SUMMARY");

    const logN = Math.log2(TOTAL_USERS);
    console.log(`\nFor n = ${formatNumber(TOTAL_USERS)} users (log₂(n) ≈ ${logN.toFixed(2)}):`);
    console.log(`  Insert:  ${(insertTotal / TOTAL_USERS).toFixed(3)}ms avg`);
    console.log(`  Update:  ${(updateTotal / UPDATE_SAMPLE_SIZE).toFixed(3)}ms avg`);
    console.log(`  Rank:    ${(rankTotal / RANK_SAMPLE_SIZE).toFixed(3)}ms avg`);
    console.log(`  Top N:   ${topNTotal}ms total`);

    const avgNodeLevel = -1 / Math.log(1 - 0.25) - 1;
    const bytesPerNode = 100 + (avgNodeLevel + 1) * (8 + 4);
    const totalMemoryMB = (TOTAL_USERS * bytesPerNode) / (1024 * 1024);
    const hashMapMemoryMB = (TOTAL_USERS * 50) / (1024 * 1024);

    console.log(`\nEstimated memory: ~${(totalMemoryMB + hashMapMemoryMB).toFixed(0)} MB`);
    console.log(`Final list size: ${formatNumber(store.size())}`);
    console.log("\n");
}

benchmark().catch(console.error);
