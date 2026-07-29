export interface Persona {
    id: number;
    name: string;
    weight: number;
    favoriteDishes: number[];
}

export const PERSONAS: Persona[] = [
    { id: 1, name: "Người thích món nước", weight: 20, favoriteDishes: [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19] },
    { id: 2, name: "Người thích cơm", weight: 16, favoriteDishes: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36] },
    { id: 3, name: "Người ăn cay", weight: 10, favoriteDishes: [4, 15, 38, 39, 49, 54] },
    { id: 4, name: "Fan đồ Ý", weight: 8, favoriteDishes: [40, 41, 42, 43, 44, 45, 77, 78] },
    { id: 5, name: "Người ăn healthy", weight: 8, favoriteDishes: [55, 56, 73, 74, 75, 76, 80] },
    { id: 6, name: "Tín đồ Pizza", weight: 7, favoriteDishes: [42, 43, 44, 45] },
    { id: 7, name: "Fan gà rán", weight: 7, favoriteDishes: [48, 49, 50, 51, 52, 53] },
    { id: 8, name: "Tín đồ cà phê", weight: 7, favoriteDishes: [67, 68, 69, 70, 71, 72] },
    { id: 9, name: "Fan trà", weight: 5, favoriteDishes: [63, 64, 65, 66] },
    { id: 10, name: "Tín đồ đồ ngọt", weight: 5, favoriteDishes: [77, 78, 79, 80] },
    { id: 11, name: "Người thích khai vị", weight: 3, favoriteDishes: [57, 58, 59, 60, 61, 62] },
    { id: 12, name: "Người thích đồ uống", weight: 4, favoriteDishes: [63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76] },
];