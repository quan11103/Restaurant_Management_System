export interface Persona {
    id: number;
    name: string;
    weight: number;
    favoriteDishes: number[];
}

export const PERSONAS: Persona[] = [
    { id: 1, name: "Người thích món nước", weight: 28, favoriteDishes: [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 17, 18, 19, 20] },
    { id: 2, name: "Người thích cơm", weight: 25, favoriteDishes: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37] },
    { id: 3, name: "Người ăn cay", weight: 20, favoriteDishes: [4, 15, 16, 40, 41, 43, 44, 45, 55, 60, 65, 67, 71] },
    { id: 4, name: "Fan đồ Ý", weight: 15, favoriteDishes: [46, 47, 48, 49, 50, 51, 52, 56, 57, 58, 61, 81, 97, 98] },
    { id: 5, name: "Người ăn healthy", weight: 12, favoriteDishes: [38, 39, 53, 54, 72, 73, 74, 75, 78, 86, 93, 94, 100] }
];