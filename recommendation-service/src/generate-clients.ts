import fs from "fs";
import path from "path";
import { weightedRandomPersonaId } from "./utils";

const CLIENT_COUNT = 1000;

const outputDir = path.join(__dirname, "../output");

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const outputFile = path.join(outputDir, "clients.csv");

let csv = "clientId,personaId\n";

for (let clientId = 1; clientId <= CLIENT_COUNT; clientId++) {
    csv += `${clientId},${weightedRandomPersonaId()}\n`;
}

fs.writeFileSync(outputFile, csv, "utf8");

console.log(`Generated ${CLIENT_COUNT} clients.`);
console.log(outputFile);