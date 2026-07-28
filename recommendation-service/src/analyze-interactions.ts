import * as fs from "fs";
import * as path from "path";

const outputDir = path.join(__dirname, "../output");

// =======================
// Đọc dishes.csv
// =======================

const dishMap = new Map<number, string>();

const dishFile = fs
    .readFileSync(path.join(outputDir, "dishes.csv"), "utf8")
    .trim()
    .split("\n");

const dishHeaders = dishFile[0].split(",");

const dishIdIndex = dishHeaders.indexOf("dishId");
const nameIndex = dishHeaders.indexOf("name");

if (dishIdIndex === -1 || nameIndex === -1) {
    throw new Error(
        "dishes.csv phải chứa các cột 'dishId' và 'name'."
    );
}

for (const line of dishFile.slice(1)) {
    const cols = line.split(",");
    dishMap.set(
        Number(cols[dishIdIndex]),
        cols[nameIndex]
    );
}

const ITEM_COUNT = dishMap.size;

// =======================
// Đọc interactions.csv
// =======================

const userInteractionCount = new Map<number, number>();
const itemUserCount = new Map<number, number>();

let interactionCount = 0;

const interactionLines = fs
    .readFileSync(path.join(outputDir, "train_interactions.csv"), "utf8")
    .trim()
    .split("\n")
    .slice(1);

for (const line of interactionLines) {

    const [clientId, dishId] = line.split(",").map(Number);

    interactionCount++;

    userInteractionCount.set(
        clientId,
        (userInteractionCount.get(clientId) ?? 0) + 1
    );

    itemUserCount.set(
        dishId,
        (itemUserCount.get(dishId) ?? 0) + 1
    );
}

const USER_COUNT = userInteractionCount.size;

// =======================
// Density
// =======================

const density =
    (interactionCount / (USER_COUNT * ITEM_COUNT)) * 100;

// =======================
// User statistics
// =======================

const userValues = [...userInteractionCount.values()];

const avgUser =
    userValues.reduce((a, b) => a + b, 0) / USER_COUNT;

const minUser = Math.min(...userValues);
const maxUser = Math.max(...userValues);

// =======================
// Item statistics
// =======================

const itemValues = [...itemUserCount.values()];

const avgItem =
    itemValues.reduce((a, b) => a + b, 0) / ITEM_COUNT;

const minItem = Math.min(...itemValues);
const maxItem = Math.max(...itemValues);

// =======================
// Top dishes
// =======================

const topDishes = [...itemUserCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

const bottomDishes = [...itemUserCount.entries()]
    .sort((a, b) => a[1] - b[1])
    .slice(0, 10);

// =======================
// Top users
// =======================

const topUsers = [...userInteractionCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

// =======================
// Print
// =======================

console.log("=======================================");
console.log("Recommendation Dataset Analysis");
console.log("=======================================\n");

console.log(`Users                  : ${USER_COUNT}`);
console.log(`Items                  : ${ITEM_COUNT}`);
console.log(`Interactions           : ${interactionCount}`);
console.log(`Density                : ${density.toFixed(2)} %`);

console.log("");

console.log("Per User");
console.log("------------------------------");
console.log(`Average interactions   : ${avgUser.toFixed(2)}`);
console.log(`Minimum interactions   : ${minUser}`);
console.log(`Maximum interactions   : ${maxUser}`);

console.log("");

console.log("Per Item");
console.log("------------------------------");
console.log(`Average users          : ${avgItem.toFixed(2)}`);
console.log(`Minimum users          : ${minItem}`);
console.log(`Maximum users          : ${maxItem}`);

console.log("");

console.log("Top 10 Popular Dishes");
console.log("------------------------------");

for (const [dishId, count] of topDishes) {
    console.log(
        `${dishId.toString().padStart(2)} | ${dishMap
            .get(dishId)!
            .padEnd(30)} | ${count}`
    );
}

console.log("");

console.log("Bottom 10 Popular Dishes");
console.log("------------------------------");

for (const [dishId, count] of bottomDishes) {
    console.log(
        `${dishId.toString().padStart(2)} | ${dishMap
            .get(dishId)!
            .padEnd(30)} | ${count}`
    );
}

console.log("");

console.log("Top 10 Active Users");
console.log("------------------------------");

for (const [userId, count] of topUsers) {
    console.log(
        `${userId.toString().padStart(4)} | ${count}`
    );
}

console.log("\n=======================================");