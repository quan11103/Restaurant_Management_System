import * as fs from "fs";
import * as path from "path";

const outputDir = path.join(__dirname, "../output");

function buildInteractions(
    ordersFile: string,
    orderDishesFile: string,
    outputFile: string
) {
    //=============================
    // Đọc orders
    //=============================

    const orderToClient = new Map<number, number>();

    const orderLines = fs
        .readFileSync(path.join(outputDir, ordersFile), "utf8")
        .trim()
        .split("\n")
        .slice(1);

    for (const line of orderLines) {

        const [orderId, clientId] = line.split(",").map(Number);

        orderToClient.set(orderId, clientId);

    }

    //=============================
    // Tổng hợp interaction
    //=============================

    const interactions = new Map<string, number>();

    const orderDishLines = fs
        .readFileSync(path.join(outputDir, orderDishesFile), "utf8")
        .trim()
        .split("\n")
        .slice(1);

    for (const line of orderDishLines) {

        const [orderId, dishId, quantity] = line.split(",").map(Number);

        const clientId = orderToClient.get(orderId);

        if (clientId === undefined) continue;

        const key = `${clientId}_${dishId}`;

        interactions.set(
            key,
            (interactions.get(key) ?? 0) + quantity
        );

    }

    //=============================
    // Xuất CSV
    //=============================

    let csv = "clientId,dishId,interaction\n";

    for (const [key, value] of interactions) {

        const [clientId, dishId] = key.split("_");

        csv += `${clientId},${dishId},${value}\n`;

    }

    fs.writeFileSync(
        path.join(outputDir, outputFile),
        csv,
        "utf8"
    );

    //=============================
    // Thống kê
    //=============================

    const users = new Set<number>();
    const items = new Set<number>();

    for (const key of interactions.keys()) {

        const [clientId, dishId] = key.split("_").map(Number);

        users.add(clientId);
        items.add(dishId);

    }

    console.log(`========== ${outputFile} ==========`);

    console.log(`Users        : ${users.size}`);
    console.log(`Items        : ${items.size}`);
    console.log(`Interactions : ${interactions.size}`);

    console.log();
}

//=====================================
// Build train
//=====================================

buildInteractions(
    "train_orders.csv",
    "train_order_dishes.csv",
    "train_interactions.csv"
);

//=====================================
// Build test
//=====================================

buildInteractions(
    "test_orders.csv",
    "test_order_dishes.csv",
    "test_interactions.csv"
);

console.log("Done.");