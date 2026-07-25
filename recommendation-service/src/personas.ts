export interface Persona {
    id: number;
    name: string;
    weight: number;
    favoriteDishes: number[];
}

export const PERSONAS: Persona[] = [
    { id: 1, name: "Khách văn phòng", weight: 20, favoriteDishes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
    { id: 2, name: "Người thích cơm", weight: 12, favoriteDishes: [5, 6, 7, 8] },
    { id: 3, name: "Tín đồ Pizza", weight: 8, favoriteDishes: [12, 13, 14, 15] },
    { id: 4, name: "Fan đồ ăn nhanh", weight: 8, favoriteDishes: [16, 17, 18, 19, 20, 21, 22, 23] },
    { id: 5, name: "Người ăn healthy", weight: 6, favoriteDishes: [24, 25, 47, 48, 49, 50] },
    { id: 6, name: "Tín đồ cà phê", weight: 10, favoriteDishes: [41, 42, 43, 44, 45, 46] },
    { id: 7, name: "Fan trà sữa", weight: 7, favoriteDishes: [36, 37, 38, 39, 40] },
    { id: 8, name: "Gia đình cuối tuần", weight: 3, favoriteDishes: [1, 5, 12, 18, 31, 51] },
    { id: 9, name: "Sinh viên", weight: 8, favoriteDishes: [16, 17, 21, 22, 31, 32, 33] },
    { id: 10, name: "Người thích món Việt", weight: 5, favoriteDishes: [1, 2, 3, 4, 26, 27, 28, 29, 30] },
    { id: 11, name: "Tín đồ đồ ngọt", weight: 3, favoriteDishes: [51, 52, 53, 54, 55, 56, 57, 58, 59, 60] },
    { id: 12, name: "Người thích mì", weight: 3, favoriteDishes: [9, 10, 11] },
    { id: 13, name: "Khách đặt đồ uống", weight: 4, favoriteDishes: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40] },
    { id: 14, name: "Khách thích khám phá", weight: 2, favoriteDishes: Array.from({ length: 60 }, (_, i) => i + 1) },
    { id: 15, name: "Khách trung thành", weight: 1, favoriteDishes: [5, 41, 45, 54] }
];