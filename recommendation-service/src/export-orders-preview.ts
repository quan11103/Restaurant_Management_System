import * as fs from "fs";
import * as path from "path";
import { PERSONAS } from "./personas";

const outputDir = path.join(__dirname, "../output");

// ======================================
// Input prefix
// ""      -> orders.csv
// train   -> train_orders.csv
// test    -> test_orders.csv
// ======================================

const prefix = process.argv[2] ?? "";

const ordersFile =
    prefix === ""
        ? "orders.csv"
        : `${prefix}_orders.csv`;

const orderDishesFile =
    prefix === ""
        ? "order_dishes.csv"
        : `${prefix}_order_dishes.csv`;

const outputFile =
    prefix === ""
        ? "orders_preview.json"
        : `${prefix}_orders_preview.json`;

// ======================================

interface OrderDish {

    name: string;

    quantity: number;

}

interface Order {

    orderId: number;

    clientId: number;

    persona: string;

    order_dishes: OrderDish[];

}

// ======================================
// dishes
// ======================================

const dishes = new Map<number, string>();

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

    dishes.set(
        Number(cols[dishIdIndex]),
        cols[nameIndex]
    );

}

// ======================================
// clients
// ======================================

const clients = new Map<number, number>();

const clientLines = fs
    .readFileSync(path.join(outputDir, "clients.csv"), "utf8")
    .trim()
    .split("\n")
    .slice(1);

for (const line of clientLines) {

    const [id, personaId] = line.split(",");

    clients.set(Number(id), Number(personaId));

}

// ======================================
// orders
// ======================================

const orders = new Map<number, Order>();

const orderLines = fs
    .readFileSync(path.join(outputDir, ordersFile), "utf8")
    .trim()
    .split("\n")
    .slice(1);

for (const line of orderLines) {

    const [orderId, clientId] = line.split(",");

    const personaId = clients.get(Number(clientId));

    if (personaId === undefined) continue;

    const persona = PERSONAS.find(p => p.id === personaId);

    if (!persona) continue;

    orders.set(Number(orderId), {

        orderId: Number(orderId),

        clientId: Number(clientId),

        persona: persona.name,

        order_dishes: []

    });

}

// ======================================
// order_dishes
// ======================================

const orderDishLines = fs
    .readFileSync(path.join(outputDir, orderDishesFile), "utf8")
    .trim()
    .split("\n")
    .slice(1);

for (const line of orderDishLines) {

    const [orderId, dishId, quantity] = line.split(",");

    const order = orders.get(Number(orderId));

    if (!order) continue;

    order.order_dishes.push({

        name: dishes.get(Number(dishId)) ?? "Unknown",

        quantity: Number(quantity)

    });

}

// ======================================

const PREVIEW_COUNT = 200;

const result = Array
    .from(orders.values())
    .slice(0, PREVIEW_COUNT);

fs.writeFileSync(

    path.join(outputDir, outputFile),

    JSON.stringify(result, null, 2),

    "utf8"

);

console.log(`Exported ${result.length} orders.`);
console.log(`Output: ${outputFile}`);