import * as fs from "fs";
import * as path from "path";
import { PERSONAS } from "./personas";
import { COMPANION_DISHES } from "./companions";

const inputDir = path.join(__dirname, "../output");
const outputFile = path.join(inputDir, "order_dishes.csv");

// ==============================
// Đọc clients.csv
// ==============================

const clientPersona = new Map<number, number>();

const clientLines = fs
    .readFileSync(path.join(inputDir, "clients.csv"), "utf8")
    .trim()
    .split("\n")
    .slice(1);

for (const line of clientLines) {
    const [clientId, personaId] = line.split(",").map(Number);

    clientPersona.set(clientId, personaId);
}

// ==============================
// Đọc orders.csv
// ==============================

const orderLines = fs
    .readFileSync(path.join(inputDir, "orders.csv"), "utf8")
    .trim()
    .split("\n")
    .slice(1);

// ==============================

let csv = "orderId,dishId,quantity\n";

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDish(): number {
    return randomInt(1, 80);
}

function randomQuantity(): number {
    const r = Math.random();

    if (r < 0.8) return 1;
    if (r < 0.95) return 2;
    return 3;
}

function randomItemCount(): number {
    const r = Math.random();

    if (r < 0.25) return 2;
    if (r < 0.65) return 3;
    if (r < 0.90) return 4;

    return 5;
}

for (const line of orderLines) {

    const [orderId, clientId] = line.split(",").map(Number);

    const personaId = clientPersona.get(clientId)!;

    const persona = PERSONAS.find(p => p.id === personaId)!;

    const selected = new Set<number>();

    // Lưu các món được thêm bởi companion
    const companionItems = new Set<number>();

    const itemCount = randomItemCount();

    while (selected.size < itemCount) {

        let dishId: number;

        if (Math.random() < 0.95) {

            const favorites = persona.favoriteDishes;

            dishId = favorites[randomInt(0, favorites.length - 1)];

        } else {

            dishId = randomDish();

        }

        if (selected.has(dishId)) {
            continue;
        }

        selected.add(dishId);

        const companions = COMPANION_DISHES[dishId];

        if (
            companions &&
            Math.random() < 0.05 &&
            selected.size < itemCount
        ) {

            const companion =
                companions[randomInt(0, companions.length - 1)];

            if (
                !selected.has(companion) &&
                selected.size < itemCount
            ) {
                selected.add(companion);

                // Đánh dấu đây là món companion
                companionItems.add(companion);
            }
        }
    }

    for (const dishId of selected) {

        const quantity = companionItems.has(dishId)
            ? 1
            : randomQuantity();

        csv += `${orderId},${dishId},${quantity}\n`;
    }
}

fs.writeFileSync(outputFile, csv);

console.log("Generated order_dishes.csv");