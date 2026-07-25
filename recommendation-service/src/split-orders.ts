import * as fs from "fs";
import * as path from "path";

const outputDir = path.join(__dirname, "../output");

// =========================
// Đọc orders.csv
// =========================

type Order = {
    orderId: number;
    clientId: number;
};

const orders: Order[] = [];

const orderLines = fs
    .readFileSync(path.join(outputDir, "orders.csv"), "utf8")
    .trim()
    .split("\n")
    .slice(1);

for (const line of orderLines) {
    const [orderId, clientId] = line.split(",").map(Number);

    orders.push({
        orderId,
        clientId,
    });
}

// =========================
// Gom theo client
// =========================

const clientOrders = new Map<number, Order[]>();

for (const order of orders) {
    if (!clientOrders.has(order.clientId)) {
        clientOrders.set(order.clientId, []);
    }

    clientOrders.get(order.clientId)!.push(order);
}

// =========================
// Chia train / test
// =========================

const trainOrders: Order[] = [];
const testOrders: Order[] = [];

const testOrderIds = new Set<number>();

for (const [, list] of clientOrders) {

    list.sort((a, b) => a.orderId - b.orderId);

    const last = list[list.length - 1];

    testOrders.push(last);
    testOrderIds.add(last.orderId);

    for (let i = 0; i < list.length - 1; i++) {
        trainOrders.push(list[i]);
    }
}

// =========================
// Xuất train_orders.csv
// =========================

let trainCsv = "orderId,clientId\n";

for (const order of trainOrders) {
    trainCsv += `${order.orderId},${order.clientId}\n`;
}

fs.writeFileSync(
    path.join(outputDir, "train_orders.csv"),
    trainCsv,
    "utf8"
);

// =========================
// Xuất test_orders.csv
// =========================

let testCsv = "orderId,clientId\n";

for (const order of testOrders) {
    testCsv += `${order.orderId},${order.clientId}\n`;
}

fs.writeFileSync(
    path.join(outputDir, "test_orders.csv"),
    testCsv,
    "utf8"
);

// =========================
// Chia order_dishes.csv
// =========================

const orderDishLines = fs
    .readFileSync(path.join(outputDir, "order_dishes.csv"), "utf8")
    .trim()
    .split("\n");

const header = orderDishLines[0];

let trainDishCsv = header + "\n";
let testDishCsv = header + "\n";

for (let i = 1; i < orderDishLines.length; i++) {

    const line = orderDishLines[i];

    if (!line) continue;

    const orderId = Number(line.split(",")[0]);

    if (testOrderIds.has(orderId)) {
        testDishCsv += line + "\n";
    } else {
        trainDishCsv += line + "\n";
    }
}

fs.writeFileSync(
    path.join(outputDir, "train_order_dishes.csv"),
    trainDishCsv,
    "utf8"
);

fs.writeFileSync(
    path.join(outputDir, "test_order_dishes.csv"),
    testDishCsv,
    "utf8"
);

// =========================
// Summary
// =========================

console.log("========== Split Completed ==========");

console.log(`Train Orders      : ${trainOrders.length}`);
console.log(`Test Orders       : ${testOrders.length}`);

console.log("");

console.log(
    `Train Ratio       : ${(trainOrders.length / orders.length * 100).toFixed(2)}%`
);

console.log(
    `Test Ratio        : ${(testOrders.length / orders.length * 100).toFixed(2)}%`
);

console.log("");

console.log("Generated:");

console.log("- train_orders.csv");
console.log("- test_orders.csv");
console.log("- train_order_dishes.csv");
console.log("- test_order_dishes.csv");