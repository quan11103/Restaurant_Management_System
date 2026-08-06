import fs from "fs";
import path from "path";

const CLIENT_COUNT = 1000;

const outputDir = path.join(__dirname, "../output");

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const outputFile = path.join(outputDir, "orders.csv");

let csv = "orderId,clientId\n";

let orderId = 1;

for (let clientId = 1; clientId <= CLIENT_COUNT; clientId++) {
    let orderCount: number;

    if (clientId <= 700) {
        // 70%
        orderCount = 20;
    } else if (clientId <= 900) {
        // 20%
        orderCount = 80;
    } else {
        // 10%
        orderCount = 200;
    }

    for (let i = 0; i < orderCount; i++) {
        csv += `${orderId},${clientId}\n`;
        orderId++;
    }
}

fs.writeFileSync(outputFile, csv, "utf8");

console.log(`Generated ${orderId - 1} orders.`);