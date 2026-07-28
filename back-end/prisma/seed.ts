/**
 * Seed data cho 2 bảng: Dish và DishImage.
 *
 * - Dish: lấy đầy đủ theo NewDish.csv (id được đánh lại liên tục 1-80).
 * - DishImage: lấy theo DishImage.csv, đã xử lý:
 *     1) Loại bỏ 3 dòng bị trùng lặp hoàn toàn (id 210, 211, 212 - trùng
 *        y hệt id 207, 208, 209 của món "Nem hải sản"), đưa mỗi món về
 *        đúng 3 ảnh (tổng 80 x 3 = 240 ảnh).
 *     2) Ánh xạ (remap) `dishId` từ id cũ (theo OldDish.csv) sang id mới
 *        (theo NewDish.csv) để trỏ đúng vào món ăn tương ứng trong bảng Dish mới.
 *
 * LƯU Ý QUAN TRỌNG:
 * 1. Dish.restaurantId = 1 với mọi món -> cần đã tồn tại Restaurant có id = 1
 *    trước khi chạy seed này (ràng buộc khóa ngoại), vì file này không seed bảng Restaurant.
 * 2. Vì Dish.id và DishImage.id được set thủ công (thay vì để autoincrement tự sinh),
 *   sau khi insert xong, script sẽ reset lại sequence của 2 bảng để các bản ghi tạo mới
 *   sau này (qua Prisma, không truyền id) không bị đụng id / lỗi trùng khóa chính.
 *
 * Cách chạy (ví dụ):
 *   npx ts-node prisma/seed.ts
 *   // hoặc cấu hình "prisma": { "seed": "ts-node prisma/seed.ts" } trong package.json rồi chạy: npx prisma db seed
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL không tồn tại hoặc chưa được nạp vào môi trường!');
}

const pool = new Pool({ connectionString: String(connectionString) });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const dishes: Prisma.DishCreateManyInput[] = [
  {
    "id": 1,
    "restaurantId": 1,
    "name": "Phở bò tái",
    "type": "Món chính",
    "price": 65000,
    "description": "Phở bò truyền thống với nước dùng đậm đà và thịt bò tái mềm.",
    "isAvailable": true
  },
  {
    "id": 2,
    "restaurantId": 1,
    "name": "Phở bò chín",
    "type": "Món chính",
    "price": 65000,
    "description": "Phở bò với thịt bò chín thái lát.",
    "isAvailable": true
  },
  {
    "id": 3,
    "restaurantId": 1,
    "name": "Phở gà",
    "type": "Món chính",
    "price": 60000,
    "description": "Phở gà ta với nước dùng thanh ngọt và thịt gà mềm.",
    "isAvailable": true
  },
  {
    "id": 4,
    "restaurantId": 1,
    "name": "Bún bò Huế",
    "type": "Món chính",
    "price": 70000,
    "description": "Bún bò Huế cay nhẹ, thơm mùi sả.",
    "isAvailable": true
  },
  {
    "id": 5,
    "restaurantId": 1,
    "name": "Bún chả Hà Nội",
    "type": "Món chính",
    "price": 65000,
    "description": "Bún ăn kèm chả nướng và nước mắm chua ngọt.",
    "isAvailable": true
  },
  {
    "id": 6,
    "restaurantId": 1,
    "name": "Bún riêu",
    "type": "Món chính",
    "price": 60000,
    "description": "Bún riêu cua với cà chua, riêu cua và chả.",
    "isAvailable": true
  },
  {
    "id": 7,
    "restaurantId": 1,
    "name": "Hủ tiếu Nam Vang",
    "type": "Món chính",
    "price": 70000,
    "description": "Hủ tiếu Nam Vang với tôm, thịt bằm và trứng cút.",
    "isAvailable": true
  },
  {
    "id": 8,
    "restaurantId": 1,
    "name": "Mì Quảng",
    "type": "Món chính",
    "price": 70000,
    "description": "Mì Quảng gà với nước dùng đậm vị miền Trung.",
    "isAvailable": true
  },
  {
    "id": 9,
    "restaurantId": 1,
    "name": "Bánh canh cua",
    "type": "Món chính",
    "price": 75000,
    "description": "Bánh canh cua với chả cua, tôm và trứng cút.",
    "isAvailable": true
  },
  {
    "id": 10,
    "restaurantId": 1,
    "name": "Cơm tấm sườn",
    "type": "Món chính",
    "price": 70000,
    "description": "Cơm tấm với sườn nướng, bì và chả.",
    "isAvailable": true
  },
  {
    "id": 11,
    "restaurantId": 1,
    "name": "Cơm gà xối mỡ",
    "type": "Món chính",
    "price": 75000,
    "description": "Gà chiên giòn ăn cùng cơm và nước sốt.",
    "isAvailable": true
  },
  {
    "id": 12,
    "restaurantId": 1,
    "name": "Cơm chiên hải sản",
    "type": "Món chính",
    "price": 80000,
    "description": "Cơm chiên với tôm, mực và rau củ.",
    "isAvailable": true
  },
  {
    "id": 13,
    "restaurantId": 1,
    "name": "Cơm chiên Dương Châu",
    "type": "Món chính",
    "price": 75000,
    "description": "Cơm chiên truyền thống nhiều nguyên liệu.",
    "isAvailable": true
  },
  {
    "id": 14,
    "restaurantId": 1,
    "name": "Cơm rang dưa bò",
    "type": "Món chính",
    "price": 75000,
    "description": "Cơm rang với thịt bò và dưa cải chua.",
    "isAvailable": true
  },
  {
    "id": 15,
    "restaurantId": 1,
    "name": "Cơm bò lúc lắc",
    "type": "Món chính",
    "price": 90000,
    "description": "Cơm trắng ăn kèm bò lúc lắc và salad.",
    "isAvailable": true
  },
  {
    "id": 16,
    "restaurantId": 1,
    "name": "Cơm cá kho tộ",
    "type": "Món chính",
    "price": 80000,
    "description": "Cơm nóng ăn cùng cá kho tộ đậm đà.",
    "isAvailable": true
  },
  {
    "id": 17,
    "restaurantId": 1,
    "name": "Mì xào bò",
    "type": "Món chính",
    "price": 70000,
    "description": "Mì xào với thịt bò và rau cải.",
    "isAvailable": true
  },
  {
    "id": 18,
    "restaurantId": 1,
    "name": "Mì cay",
    "type": "Món chính",
    "price": 75000,
    "description": "Mì cay Hàn Quốc với hải sản và rau nấm.",
    "isAvailable": true
  },
  {
    "id": 19,
    "restaurantId": 1,
    "name": "Lẩu Thái",
    "type": "Món chính",
    "price": 220000,
    "description": "Lẩu Thái chua cay với hải sản và rau tươi.",
    "isAvailable": true
  },
  {
    "id": 20,
    "restaurantId": 1,
    "name": "Mì Ý sốt bò bằm",
    "type": "Món chính",
    "price": 85000,
    "description": "Spaghetti sốt bò bằm kiểu Ý.",
    "isAvailable": true
  },
  {
    "id": 21,
    "restaurantId": 1,
    "name": "Mì Ý sốt kem",
    "type": "Món chính",
    "price": 90000,
    "description": "Mì Ý sốt kem béo ngậy cùng thịt xông khói.",
    "isAvailable": true
  },
  {
    "id": 22,
    "restaurantId": 1,
    "name": "Pizza Margherita",
    "type": "Pizza",
    "price": 150000,
    "description": "Pizza phô mai và sốt cà chua truyền thống.",
    "isAvailable": true
  },
  {
    "id": 23,
    "restaurantId": 1,
    "name": "Pizza Hải sản",
    "type": "Pizza",
    "price": 190000,
    "description": "Pizza với tôm, mực và phô mai.",
    "isAvailable": true
  },
  {
    "id": 24,
    "restaurantId": 1,
    "name": "Pizza Pepperoni",
    "type": "Pizza",
    "price": 180000,
    "description": "Pizza xúc xích Pepperoni đậm vị.",
    "isAvailable": true
  },
  {
    "id": 25,
    "restaurantId": 1,
    "name": "Pizza Bò BBQ",
    "type": "Pizza",
    "price": 200000,
    "description": "Pizza bò sốt BBQ thơm ngon.",
    "isAvailable": true
  },
  {
    "id": 26,
    "restaurantId": 1,
    "name": "Burger bò",
    "type": "Burger",
    "price": 85000,
    "description": "Burger bò nướng cùng rau và phô mai.",
    "isAvailable": true
  },
  {
    "id": 27,
    "restaurantId": 1,
    "name": "Burger gà",
    "type": "Burger",
    "price": 80000,
    "description": "Burger gà giòn sốt mayonnaise.",
    "isAvailable": true
  },
  {
    "id": 28,
    "restaurantId": 1,
    "name": "Gà rán truyền thống",
    "type": "Gà rán",
    "price": 90000,
    "description": "Gà rán giòn rụm theo công thức đặc biệt.",
    "isAvailable": true
  },
  {
    "id": 29,
    "restaurantId": 1,
    "name": "Gà rán cay",
    "type": "Gà rán",
    "price": 95000,
    "description": "Gà rán phủ sốt cay Hàn Quốc.",
    "isAvailable": true
  },
  {
    "id": 30,
    "restaurantId": 1,
    "name": "Cánh gà BBQ",
    "type": "Gà rán",
    "price": 110000,
    "description": "Cánh gà nướng sốt BBQ.",
    "isAvailable": true
  },
  {
    "id": 31,
    "restaurantId": 1,
    "name": "Khoai tây chiên",
    "type": "Ăn kèm",
    "price": 45000,
    "description": "Khoai tây chiên giòn.",
    "isAvailable": true
  },
  {
    "id": 32,
    "restaurantId": 1,
    "name": "Khoai tây lắc phô mai",
    "type": "Ăn kèm",
    "price": 50000,
    "description": "Khoai tây chiên lắc bột phô mai.",
    "isAvailable": true
  },
  {
    "id": 33,
    "restaurantId": 1,
    "name": "Xúc xích nướng",
    "type": "Ăn kèm",
    "price": 45000,
    "description": "Xúc xích nướng ăn kèm tương cà.",
    "isAvailable": true
  },
  {
    "id": 34,
    "restaurantId": 1,
    "name": "Kim chi",
    "type": "Ăn kèm",
    "price": 30000,
    "description": "Kim chi cải thảo lên men kiểu Hàn Quốc.",
    "isAvailable": true
  },
  {
    "id": 35,
    "restaurantId": 1,
    "name": "Salad Caesar",
    "type": "Salad",
    "price": 70000,
    "description": "Salad rau xà lách với sốt Caesar.",
    "isAvailable": true
  },
  {
    "id": 36,
    "restaurantId": 1,
    "name": "Salad cá ngừ",
    "type": "Salad",
    "price": 75000,
    "description": "Salad cá ngừ tươi cùng rau củ.",
    "isAvailable": true
  },
  {
    "id": 37,
    "restaurantId": 1,
    "name": "Nem rán",
    "type": "Khai vị",
    "price": 60000,
    "description": "Nem rán giòn nhân thịt.",
    "isAvailable": true
  },
  {
    "id": 38,
    "restaurantId": 1,
    "name": "Nem hải sản",
    "type": "Khai vị",
    "price": 70000,
    "description": "Nem rán nhân tôm và mực.",
    "isAvailable": true
  },
  {
    "id": 39,
    "restaurantId": 1,
    "name": "Gỏi cuốn",
    "type": "Khai vị",
    "price": 55000,
    "description": "Gỏi cuốn tôm thịt ăn kèm nước chấm đậu phộng.",
    "isAvailable": true
  },
  {
    "id": 40,
    "restaurantId": 1,
    "name": "Súp bí đỏ",
    "type": "Khai vị",
    "price": 50000,
    "description": "Súp bí đỏ kem mịn.",
    "isAvailable": true
  },
  {
    "id": 41,
    "restaurantId": 1,
    "name": "Súp hải sản",
    "type": "Khai vị",
    "price": 65000,
    "description": "Súp hải sản nóng hổi.",
    "isAvailable": true
  },
  {
    "id": 42,
    "restaurantId": 1,
    "name": "Bánh mì bơ tỏi",
    "type": "Khai vị",
    "price": 45000,
    "description": "Bánh mì nướng bơ tỏi thơm giòn.",
    "isAvailable": true
  },
  {
    "id": 43,
    "restaurantId": 1,
    "name": "Cháo thịt bằm",
    "type": "Cháo",
    "price": 50000,
    "description": "Cháo nóng với thịt bằm và hành lá.",
    "isAvailable": true
  },
  {
    "id": 44,
    "restaurantId": 1,
    "name": "Cháo gà",
    "type": "Cháo",
    "price": 55000,
    "description": "Cháo gà ta xé phay thơm ngon.",
    "isAvailable": true
  },
  {
    "id": 45,
    "restaurantId": 1,
    "name": "Cháo dinh dưỡng",
    "type": "Cháo",
    "price": 50000,
    "description": "Cháo dinh dưỡng với rau củ và thịt bằm.",
    "isAvailable": true
  },
  {
    "id": 46,
    "restaurantId": 1,
    "name": "Cháo lòng",
    "type": "Cháo",
    "price": 60000,
    "description": "Cháo lòng với dồi, gan và tim.",
    "isAvailable": true
  },
  {
    "id": 47,
    "restaurantId": 1,
    "name": "Canh chua cá",
    "type": "Canh",
    "price": 70000,
    "description": "Canh chua cá với dứa, cà chua và bạc hà.",
    "isAvailable": true
  },
  {
    "id": 48,
    "restaurantId": 1,
    "name": "Canh cải thịt bằm",
    "type": "Canh",
    "price": 55000,
    "description": "Canh cải xanh nấu thịt bằm thanh ngọt.",
    "isAvailable": true
  },
  {
    "id": 49,
    "restaurantId": 1,
    "name": "Canh rong biển",
    "type": "Canh",
    "price": 50000,
    "description": "Canh rong biển nấu thịt bò.",
    "isAvailable": true
  },
  {
    "id": 50,
    "restaurantId": 1,
    "name": "Canh bí đỏ hầm xương",
    "type": "Canh",
    "price": 60000,
    "description": "Canh bí đỏ hầm xương ngọt thanh.",
    "isAvailable": true
  },
  {
    "id": 51,
    "restaurantId": 1,
    "name": "Coca-Cola",
    "type": "Đồ uống",
    "price": 20000,
    "description": "Nước ngọt Coca-Cola.",
    "isAvailable": true
  },
  {
    "id": 52,
    "restaurantId": 1,
    "name": "Pepsi",
    "type": "Đồ uống",
    "price": 20000,
    "description": "Nước ngọt Pepsi.",
    "isAvailable": true
  },
  {
    "id": 53,
    "restaurantId": 1,
    "name": "7Up",
    "type": "Đồ uống",
    "price": 20000,
    "description": "Nước ngọt vị chanh.",
    "isAvailable": true
  },
  {
    "id": 54,
    "restaurantId": 1,
    "name": "Sprite",
    "type": "Đồ uống",
    "price": 20000,
    "description": "Nước ngọt có gas vị chanh.",
    "isAvailable": true
  },
  {
    "id": 55,
    "restaurantId": 1,
    "name": "Fanta Cam",
    "type": "Đồ uống",
    "price": 20000,
    "description": "Nước ngọt vị cam.",
    "isAvailable": true
  },
  {
    "id": 56,
    "restaurantId": 1,
    "name": "Trà đào cam sả",
    "type": "Đồ uống",
    "price": 45000,
    "description": "Trà đào kết hợp cam và sả.",
    "isAvailable": true
  },
  {
    "id": 57,
    "restaurantId": 1,
    "name": "Trà chanh",
    "type": "Đồ uống",
    "price": 30000,
    "description": "Trà chanh tươi mát.",
    "isAvailable": true
  },
  {
    "id": 58,
    "restaurantId": 1,
    "name": "Trà vải",
    "type": "Đồ uống",
    "price": 40000,
    "description": "Trà đen kết hợp quả vải.",
    "isAvailable": true
  },
  {
    "id": 59,
    "restaurantId": 1,
    "name": "Trà sữa truyền thống",
    "type": "Đồ uống",
    "price": 45000,
    "description": "Trà sữa với trân châu đen.",
    "isAvailable": true
  },
  {
    "id": 60,
    "restaurantId": 1,
    "name": "Trà sữa Matcha",
    "type": "Đồ uống",
    "price": 50000,
    "description": "Trà sữa vị Matcha.",
    "isAvailable": true
  },
  {
    "id": 61,
    "restaurantId": 1,
    "name": "Cà phê đen",
    "type": "Cà phê",
    "price": 30000,
    "description": "Cà phê đen pha phin.",
    "isAvailable": true
  },
  {
    "id": 62,
    "restaurantId": 1,
    "name": "Cà phê sữa",
    "type": "Cà phê",
    "price": 35000,
    "description": "Cà phê sữa truyền thống.",
    "isAvailable": true
  },
  {
    "id": 63,
    "restaurantId": 1,
    "name": "Bạc xỉu",
    "type": "Cà phê",
    "price": 40000,
    "description": "Bạc xỉu nhiều sữa ít cà phê.",
    "isAvailable": true
  },
  {
    "id": 64,
    "restaurantId": 1,
    "name": "Americano",
    "type": "Cà phê",
    "price": 45000,
    "description": "Cà phê Americano.",
    "isAvailable": true
  },
  {
    "id": 65,
    "restaurantId": 1,
    "name": "Latte",
    "type": "Cà phê",
    "price": 55000,
    "description": "Latte với lớp sữa mịn.",
    "isAvailable": true
  },
  {
    "id": 66,
    "restaurantId": 1,
    "name": "Cappuccino",
    "type": "Cà phê",
    "price": 55000,
    "description": "Cappuccino phủ bọt sữa.",
    "isAvailable": true
  },
  {
    "id": 67,
    "restaurantId": 1,
    "name": "Nước cam ép",
    "type": "Nước ép",
    "price": 40000,
    "description": "Nước cam ép tươi.",
    "isAvailable": true
  },
  {
    "id": 68,
    "restaurantId": 1,
    "name": "Nước dưa hấu ép",
    "type": "Nước ép",
    "price": 40000,
    "description": "Nước ép dưa hấu nguyên chất.",
    "isAvailable": true
  },
  {
    "id": 69,
    "restaurantId": 1,
    "name": "Sinh tố bơ",
    "type": "Sinh tố",
    "price": 50000,
    "description": "Sinh tố bơ béo mịn.",
    "isAvailable": true
  },
  {
    "id": 70,
    "restaurantId": 1,
    "name": "Sinh tố xoài",
    "type": "Sinh tố",
    "price": 50000,
    "description": "Sinh tố xoài chín.",
    "isAvailable": true
  },
  {
    "id": 71,
    "restaurantId": 1,
    "name": "Kem vani",
    "type": "Tráng miệng",
    "price": 35000,
    "description": "Kem vị vani mát lạnh.",
    "isAvailable": true
  },
  {
    "id": 72,
    "restaurantId": 1,
    "name": "Kem socola",
    "type": "Tráng miệng",
    "price": 35000,
    "description": "Kem vị socola đậm đà.",
    "isAvailable": true
  },
  {
    "id": 73,
    "restaurantId": 1,
    "name": "Bánh flan",
    "type": "Tráng miệng",
    "price": 30000,
    "description": "Bánh flan mềm mịn.",
    "isAvailable": true
  },
  {
    "id": 74,
    "restaurantId": 1,
    "name": "Tiramisu",
    "type": "Tráng miệng",
    "price": 55000,
    "description": "Bánh Tiramisu kiểu Ý.",
    "isAvailable": true
  },
  {
    "id": 75,
    "restaurantId": 1,
    "name": "Cheesecake việt quất",
    "type": "Tráng miệng",
    "price": 60000,
    "description": "Bánh cheesecake phủ việt quất.",
    "isAvailable": true
  },
  {
    "id": 76,
    "restaurantId": 1,
    "name": "Bánh mousse chanh dây",
    "type": "Tráng miệng",
    "price": 55000,
    "description": "Bánh mousse chanh dây thanh mát.",
    "isAvailable": true
  },
  {
    "id": 77,
    "restaurantId": 1,
    "name": "Bánh su kem",
    "type": "Tráng miệng",
    "price": 35000,
    "description": "Bánh su nhân kem vani.",
    "isAvailable": true
  },
  {
    "id": 78,
    "restaurantId": 1,
    "name": "Sữa chua trái cây",
    "type": "Tráng miệng",
    "price": 40000,
    "description": "Sữa chua ăn kèm trái cây tươi.",
    "isAvailable": true
  },
  {
    "id": 79,
    "restaurantId": 1,
    "name": "Rau câu dừa",
    "type": "Tráng miệng",
    "price": 30000,
    "description": "Rau câu vị dừa mát lạnh.",
    "isAvailable": true
  },
  {
    "id": 80,
    "restaurantId": 1,
    "name": "Trái cây theo mùa",
    "type": "Tráng miệng",
    "price": 50000,
    "description": "Đĩa trái cây tươi theo mùa.",
    "isAvailable": true
  }
];

const dishImages: Prisma.DishImageCreateManyInput[] = [
  {
    "id": 12,
    "dishId": 1,
    "imageUrl": "https://cdnv2.tgdd.vn/mwg-static/common/Common/pho-tai-lan.jpg",
    "isMain": true
  },
  {
    "id": 13,
    "dishId": 1,
    "imageUrl": "https://monngonmoingay.com/wp-content/uploads/2024/06/pho-tai-lan.jpg",
    "isMain": false
  },
  {
    "id": 14,
    "dishId": 1,
    "imageUrl": "https://i.ytimg.com/vi/ZNnDDeqtGFc/maxresdefault.jpg",
    "isMain": false
  },
  {
    "id": 15,
    "dishId": 2,
    "imageUrl": "https://fohlafood.vn/cdn/shop/articles/bi-quyet-nau-phi-bo-ngon-tuyet-dinh.jpg?v=1712213789",
    "isMain": true
  },
  {
    "id": 16,
    "dishId": 2,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8aZQVMSqHU5EVX7vck8nvg_8TDwzfC9i-R0SKQVxJ8CHhapX8igp0Slk&s=10",
    "isMain": false
  },
  {
    "id": 17,
    "dishId": 2,
    "imageUrl": "https://cdn.eva.vn/upload/1-2021/images/2021-02-18/me-dam-mach-cach-nau-pho-bo-chin-don-gian-ma-ngon-giai-ngan-sau-tet-149447769_3595380830579906_8820952129031903690_o-1613620916-453-width700height559.jpg",
    "isMain": false
  },
  {
    "id": 18,
    "dishId": 4,
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Bun-Bo-Hue-from-Huong-Giang-2011.jpg/1280px-Bun-Bo-Hue-from-Huong-Giang-2011.jpg",
    "isMain": true
  },
  {
    "id": 19,
    "dishId": 4,
    "imageUrl": "https://cdn.mediamart.vn/images/news/hc-cach-nu-bun-bo-hu-thom-ngon-dung-chun-huong-v_519e659c.webp",
    "isMain": false
  },
  {
    "id": 20,
    "dishId": 4,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToll8mEuiBuaMYUpLAxBab80R-BmRNzD3PhX3d-GW26owhfNoz0G8_8EIn&s=10",
    "isMain": false
  },
  {
    "id": 21,
    "dishId": 5,
    "imageUrl": "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2024_1_12_638406880045931692_cach-lam-bun-cha-ha-noi-0.jpg",
    "isMain": true
  },
  {
    "id": 22,
    "dishId": 5,
    "imageUrl": "https://cdn11.dienmaycholon.vn/filewebdmclnew/public/userupload/files/kien-thuc/cach-lam-bun-cha-ha-noi/cach-lam-bun-cha-ha-noi-1.jpg",
    "isMain": false
  },
  {
    "id": 23,
    "dishId": 5,
    "imageUrl": "https://dulichviet.com.vn/images/bandidau/am-thuc/mon-bun-cha-ha-noi-du-lich-viet.jpeg",
    "isMain": false
  },
  {
    "id": 24,
    "dishId": 10,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTnOtjahxpY5dc2arMwWBKbiRMnvxAMs6jkFAowEvP1w&s=10",
    "isMain": true
  },
  {
    "id": 25,
    "dishId": 10,
    "imageUrl": "https://static.hawonkoo.vn/hwk02/images/2023/10/com-tam-suon-bi-cha-2.jpg",
    "isMain": false
  },
  {
    "id": 26,
    "dishId": 10,
    "imageUrl": "https://storage.googleapis.com/onelife-public/blog.onelife.vn/2026/03/8c4c9ee0-suon-nuong-com-tam-sai-gon-5.jpg",
    "isMain": false
  },
  {
    "id": 27,
    "dishId": 11,
    "imageUrl": "https://cdn.tgdd.vn/2021/01/CookRecipe/GalleryStep/thanh-pham-362.jpg",
    "isMain": true
  },
  {
    "id": 28,
    "dishId": 11,
    "imageUrl": "https://www.cet.edu.vn/wp-content/uploads/2020/04/cach-lam-com-chien-ga-xoi-mo.jpg",
    "isMain": false
  },
  {
    "id": 29,
    "dishId": 11,
    "imageUrl": "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2023_12_6_638374928096209198_com-ga-xoi-mo-bao-nhieu-calo.jpg",
    "isMain": false
  },
  {
    "id": 30,
    "dishId": 12,
    "imageUrl": "https://cdn.tgdd.vn/2021/01/CookProduct/comchienhaisan-1200x676.jpg",
    "isMain": true
  },
  {
    "id": 31,
    "dishId": 12,
    "imageUrl": "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/com_chien_duong_chau_hai_san_2fd9d1a7a2.jpg",
    "isMain": false
  },
  {
    "id": 32,
    "dishId": 12,
    "imageUrl": "https://b1.congngheviet.com.vn/file/cdn-cnv04/khonggianxuahue-com-vn/wp-content/uploads/2024/05/Hai-San-Cua-Bien-Thuc-Don-30-Mon-Man-Com-Rang-Hai-San.jpg",
    "isMain": false
  },
  {
    "id": 33,
    "dishId": 13,
    "imageUrl": "https://www.cet.edu.vn/wp-content/uploads/2018/03/com-chien-duong-chau.jpg",
    "isMain": true
  },
  {
    "id": 34,
    "dishId": 13,
    "imageUrl": "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/com_chien_duong_chau_hai_san_2fd9d1a7a2.jpg",
    "isMain": false
  },
  {
    "id": 35,
    "dishId": 13,
    "imageUrl": "https://www.lottemart.vn/media/catalog/product/cache/0x0/2/2/2202990000000-1.jpg.webp",
    "isMain": false
  },
  {
    "id": 36,
    "dishId": 17,
    "imageUrl": "https://cdn.tgdd.vn/2021/03/CookRecipe/GalleryStep/ham-thit-bo-bi-do.jpg",
    "isMain": false
  },
  {
    "id": 37,
    "dishId": 17,
    "imageUrl": "https://i-giadinh.vnecdn.net/2022/07/30/Thanh-pham-1-1-2409-1659167237.jpg",
    "isMain": true
  },
  {
    "id": 38,
    "dishId": 17,
    "imageUrl": "https://beptruong.edu.vn/wp-content/uploads/2024/10/cach-lam-mi-xao-bo.jpg",
    "isMain": false
  },
  {
    "id": 39,
    "dishId": 20,
    "imageUrl": "https://cdn.tgdd.vn/2021/11/CookRecipe/Avatar/mi-y-sot-ca-chua-bo-bam-cong-thuc-duoc-chia-se-tu-nguoi-dung-thumbnail.jpg",
    "isMain": true
  },
  {
    "id": 40,
    "dishId": 20,
    "imageUrl": "https://cdn.pastaxi-manager.onepas.vn/content/uploads/articles/anhntn/New%20folder%20(12)/cach-lam-mi-y-sot-bo-bam-1.jpg",
    "isMain": false
  },
  {
    "id": 41,
    "dishId": 20,
    "imageUrl": "https://cdn.pastaxi-manager.onepas.vn/content/uploads/articles/anhntn/New%20folder%20(12)/cach-lam-mi-y-sot-bo-bam-8.jpg",
    "isMain": false
  },
  {
    "id": 42,
    "dishId": 21,
    "imageUrl": "https://cdn.tgdd.vn/2020/09/CookRecipe/Avatar/my-y-sot-kem-chay-thumbnail.jpg",
    "isMain": false
  },
  {
    "id": 43,
    "dishId": 21,
    "imageUrl": "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2023_10_19_638333151281847208_mi-y-sot-kem.jpg",
    "isMain": true
  },
  {
    "id": 44,
    "dishId": 21,
    "imageUrl": "https://bizweb.dktcdn.net/100/004/714/files/19-ac56982d-e4c0-4a00-9344-ba85654ccc18.png?v=1660533917722",
    "isMain": false
  },
  {
    "id": 45,
    "dishId": 22,
    "imageUrl": "https://www.foodandwine.com/thmb/7BpSJWDh1s-2M2ooRPHoy07apq4=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/mozzarella-pizza-margherita-FT-RECIPE0621-11fa41ceb1a5465d9036a23da87dd3d4.jpg",
    "isMain": true
  },
  {
    "id": 46,
    "dishId": 22,
    "imageUrl": "https://ooni.com/cdn/shop/articles/20220211142347-margherita-9920_ba86be55-674e-4f35-8094-2067ab41a671.jpg?v=1737104576&width=1080",
    "isMain": false
  },
  {
    "id": 47,
    "dishId": 22,
    "imageUrl": "https://assets.tmecosys.com/image/upload/t_web_rdp_recipe_584x480/img/recipe/ras/Assets/5802fab5-fdce-468a-a830-43e8001f5a72/Derivates/c00dc34a-e73d-42f0-a86e-e2fd967d33fe.jpg",
    "isMain": false
  },
  {
    "id": 48,
    "dishId": 23,
    "imageUrl": "https://cdn.tgdd.vn/2020/09/CookProduct/1200bzhspm-1200x676.jpg",
    "isMain": true
  },
  {
    "id": 49,
    "dishId": 23,
    "imageUrl": "https://www.huongnghiepaau.com/wp-content/uploads/2017/07/999cf916d676bcea9e5646256b3e0198.jpg",
    "isMain": false
  },
  {
    "id": 50,
    "dishId": 23,
    "imageUrl": "https://cdn.hstatic.net/files/200000700229/article/pizza-hai-san-pho-mai-thumb_775dcae875a740cea521d0063dc5f89e.jpg",
    "isMain": false
  },
  {
    "id": 51,
    "dishId": 24,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2Pq_kUCnJ8dwxd9SCfor4icy_lzSjV8I4PiVxlOBcJNJZfvVfYV-Gw7bC&s=10",
    "isMain": false
  },
  {
    "id": 52,
    "dishId": 24,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHombDMvTf9919xx7zVPZ4Sxq67tFwMadWBMYhsXwxAK_a5KtGtoT5Tls&s=10",
    "isMain": false
  },
  {
    "id": 53,
    "dishId": 24,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRytMLThU-E9eJh1QBYyYhci_VbmzNOI5k6fCGN8ANtOQE8blLnT8INP9Bh&s=10",
    "isMain": true
  },
  {
    "id": 57,
    "dishId": 26,
    "imageUrl": "https://burgerking.vn/media/catalog/product/cache/1/small_image/316x/9df78eab33525d08d6e5fb8d27136e95/2/-/2-mieng-b_-burger-b_-n_ng-whopper_2.jpg",
    "isMain": false
  },
  {
    "id": 58,
    "dishId": 26,
    "imageUrl": "https://product.hstatic.net/200000848723/product/2_356e19838a61405292c8b5bb03ce4075_master.jpg",
    "isMain": false
  },
  {
    "id": 59,
    "dishId": 26,
    "imageUrl": "https://pasgo.vn/Upload/anh-blog/cach-lam-hamburger-bo-cuc-don-gian-chi-trong-3-buoc-400-43970593394.webp",
    "isMain": true
  },
  {
    "id": 60,
    "dishId": 27,
    "imageUrl": "https://burgerking.vn/media/catalog/product/cache/1/image/1800x/040ec09b1e35df139433887a97daa66f/b/u/burger_ga_pho_mai_so_t_bbq.jpg",
    "isMain": true
  },
  {
    "id": 61,
    "dishId": 27,
    "imageUrl": "https://file.hstatic.net/1000389344/article/buffalo-chicken-burger_49abffb5e55648f88c778bd3f1a141b7_1024x1024.jpg",
    "isMain": false
  },
  {
    "id": 62,
    "dishId": 27,
    "imageUrl": "https://api.popeyes.vn/api/v1/files/ChickenBurger.webp",
    "isMain": false
  },
  {
    "id": 63,
    "dishId": 28,
    "imageUrl": "https://cdn.tgdd.vn/2020/12/CookProduct/2-1200x676-1.jpg",
    "isMain": false
  },
  {
    "id": 64,
    "dishId": 28,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHaYkIqEGiSpdQ4hqO8QFnCDKlQ4l59FoeL08rV6tPkpv8Po9QrrbvFkE&s=10",
    "isMain": false
  },
  {
    "id": 65,
    "dishId": 28,
    "imageUrl": "https://i.ytimg.com/vi/2DZT0ZK_kzY/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDDw6-e6KohLx4J1iywuiYctt31aw",
    "isMain": true
  },
  {
    "id": 66,
    "dishId": 29,
    "imageUrl": "https://cdn.tgdd.vn/2021/08/CookProduct/thumb-1200x676-54.jpg",
    "isMain": false
  },
  {
    "id": 67,
    "dishId": 29,
    "imageUrl": "https://cdn.mediamart.vn/images/news/cach-lam-ga-ran-st-cay-han-quc-gion-rm-ai-an-cung-me_eeea1763.jpg",
    "isMain": true
  },
  {
    "id": 68,
    "dishId": 29,
    "imageUrl": "https://cdn.tgdd.vn/2021/08/CookProduct/gthum-1200x676-1.jpg",
    "isMain": false
  },
  {
    "id": 75,
    "dishId": 31,
    "imageUrl": "https://cdn.tgdd.vn/Files/2015/03/01/615221/bi-quyet-lam-moi-khoai-tay-chien-cu-5-760x367.jpg",
    "isMain": true
  },
  {
    "id": 76,
    "dishId": 31,
    "imageUrl": "https://i-giadinh.vnecdn.net/2025/04/27/Khoaitaychien6vnexpress-174574-6122-2456-1745744819.jpg",
    "isMain": false
  },
  {
    "id": 77,
    "dishId": 31,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdkCCi0iGbQ6iG0qiWE0zAOiUw0A-xTaCAD6p98OIPoBoyqOqJfdCSXXPo&s=10",
    "isMain": false
  },
  {
    "id": 78,
    "dishId": 32,
    "imageUrl": "https://cdn2.fptshop.com.vn/unsafe/Uploads/images/tin-tuc/163279/Originals/khoai-tay-lac-pho-mai-1.jpg",
    "isMain": true
  },
  {
    "id": 79,
    "dishId": 32,
    "imageUrl": "https://cdn2.fptshop.com.vn/unsafe/Uploads/images/tin-tuc/163279/Originals/khoai-tay-lac-pho-mai-8.jpg",
    "isMain": false
  },
  {
    "id": 80,
    "dishId": 32,
    "imageUrl": "https://cdn2.fptshop.com.vn/unsafe/Uploads/images/tin-tuc/163279/Originals/khoai-tay-lac-pho-mai-9.JPG",
    "isMain": false
  },
  {
    "id": 81,
    "dishId": 33,
    "imageUrl": "https://file.hstatic.net/200000055918/file/nuong-xuc-xich_2bd724eda100453ba098969d9c73dee7_grande.jpg",
    "isMain": true
  },
  {
    "id": 82,
    "dishId": 33,
    "imageUrl": "https://cdn.tgdd.vn/2020/07/CookProductThumb/ava-620x620-17.jpg",
    "isMain": false
  },
  {
    "id": 83,
    "dishId": 33,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0GsAtIEI7fp-17Wj5Prvs72OLGm0dhHs1nSV1i1wFo6r1srEnCQdQzvlk&s=10",
    "isMain": false
  },
  {
    "id": 84,
    "dishId": 35,
    "imageUrl": "https://cdn.loveandlemons.com/wp-content/uploads/2024/12/caesar-salad.jpg",
    "isMain": false
  },
  {
    "id": 85,
    "dishId": 35,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOqiT8lI0otrVtmmDVlfPy3S69HOupaKyOM9LID1l20_SAsQRKpkZNBV8&s=10",
    "isMain": false
  },
  {
    "id": 86,
    "dishId": 35,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPJQ-x7lo3bbH9DiDUXdN6B15FuO_xTMFj5IN2fv0WhY_VQRtkttF5IKs&s=10",
    "isMain": true
  },
  {
    "id": 87,
    "dishId": 36,
    "imageUrl": "https://cdn.tgdd.vn/2020/07/CookRecipe/Avatar/salad-ca-ngu-ngam-dau-voi-trung-luoc-thumbnail.jpg",
    "isMain": false
  },
  {
    "id": 88,
    "dishId": 36,
    "imageUrl": "https://pastaxi-manager.onepas.vn/content/uploads/articles/minhnguyet/salad-ca-ngu/cach-lam-salad-ca-ngu-4.jpg",
    "isMain": false
  },
  {
    "id": 89,
    "dishId": 36,
    "imageUrl": "https://cdn2.fptshop.com.vn/unsafe/Uploads/images/tin-tuc/164271/Originals/salad-ca-ngu-5.jpg",
    "isMain": true
  },
  {
    "id": 90,
    "dishId": 37,
    "imageUrl": "https://cdn.tgdd.vn/2022/10/CookDish/cach-lam-mon-nem-ran-thom-ngon-chuan-vi-don-gian-tai-nha-avt-1200x676.jpg",
    "isMain": false
  },
  {
    "id": 91,
    "dishId": 37,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHHvXMEAxU9fObxXGu7XQN0DP6HQH0ylWlmFcxFcOFcZrSjWOaLh1hS3jt&s=10",
    "isMain": true
  },
  {
    "id": 92,
    "dishId": 37,
    "imageUrl": "https://langvong.vn/wp-content/uploads/2025/10/nem-ran-thumbnail.jpg",
    "isMain": false
  },
  {
    "id": 96,
    "dishId": 40,
    "imageUrl": "https://file.hstatic.net/200000721249/file/cach-lam-sup-bi-do-sua-tuoi_f6da5fd20078415296ad23c4fb6259fe.jpg",
    "isMain": true
  },
  {
    "id": 97,
    "dishId": 40,
    "imageUrl": "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2023_12_15_638382272602111119_cach-lam-sup-bi-do.jpg",
    "isMain": false
  },
  {
    "id": 98,
    "dishId": 40,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRWCM1l2q2I8K0M4Sxu7CRWpvnoywcdOvKb2souLBhFeU28oUnvfR8tQ4&s=10",
    "isMain": false
  },
  {
    "id": 99,
    "dishId": 41,
    "imageUrl": "https://monngonmoingay.com/wp-content/uploads/2020/03/sup-nam-hai-san-chua-cay.webp",
    "isMain": false
  },
  {
    "id": 100,
    "dishId": 41,
    "imageUrl": "https://monngonmoingay.com/wp-content/uploads/2019/10/sup-tomyum-hai-san-500.jpg",
    "isMain": false
  },
  {
    "id": 101,
    "dishId": 41,
    "imageUrl": "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/cach_nau_sup_hai_san_thumb_187f9682de.jpg",
    "isMain": true
  },
  {
    "id": 102,
    "dishId": 42,
    "imageUrl": "https://www.cet.edu.vn/wp-content/uploads/2020/03/cach-lam-banh-mi-bo-toi-pho-mai.jpg",
    "isMain": true
  },
  {
    "id": 103,
    "dishId": 42,
    "imageUrl": "https://cdn.tgdd.vn/2022/07/CookRecipe/Avatar/banh-mi-bo-toi-thumbnail.jpg",
    "isMain": false
  },
  {
    "id": 104,
    "dishId": 42,
    "imageUrl": "https://www.huongnghiepaau.com/wp-content/uploads/2019/01/mon-banh-gion-thom.jpg",
    "isMain": false
  },
  {
    "id": 105,
    "dishId": 51,
    "imageUrl": "https://product.hstatic.net/1000282430/product/nuoc-ngot-coca-cola-nhat-500ml_9c3f793688484f1083b46f8e8d46fbd0_grande.jpg",
    "isMain": false
  },
  {
    "id": 106,
    "dishId": 51,
    "imageUrl": "https://bizweb.dktcdn.net/thumb/grande/100/469/765/products/1503-9de8f3562b364e56b550ff30bc493122-2c0db7cc76fd4b7f8b3c767fb24bc277-d4f804d8fc474b4bae5f628ff0d632e0-master.jpg",
    "isMain": false
  },
  {
    "id": 107,
    "dishId": 51,
    "imageUrl": "https://product.hstatic.net/200000534989/product/dsc08341-enhanced-nr_1_e6d5d0a13c8f42c2bd7cea59e03ce199_master.jpg",
    "isMain": true
  },
  {
    "id": 108,
    "dishId": 52,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDcTQdScclWp1lgPOuDJwG_OdaTQPmNuX4zOSKZLZV8o1BoemDPiJsUbw&s=10",
    "isMain": false
  },
  {
    "id": 109,
    "dishId": 52,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrb_DYG_8jPC6kYk1-mi8wdtWYNIZ6IYbb_pHoqKcBdw77MikHpA_VRyzD&s=10",
    "isMain": false
  },
  {
    "id": 110,
    "dishId": 52,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWpXtUu0wJ2RhOtXHvorLLuKIgE0ET6cpvyUj86bM6iA&s",
    "isMain": true
  },
  {
    "id": 114,
    "dishId": 53,
    "imageUrl": "https://product.hstatic.net/1000301274/product/_10100996__7up_320ml_sleek_lon_0366766c074a4b538595ed8d91dc6b0d.png",
    "isMain": true
  },
  {
    "id": 115,
    "dishId": 53,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSR09MR1M2w3PtkKi1G6z11-1ZIHYfed6xTCFp-RCFVZ0Y24JLO3PglYHA&s=10",
    "isMain": false
  },
  {
    "id": 116,
    "dishId": 53,
    "imageUrl": "https://product.hstatic.net/200000460455/product/7up_sleek_lon_320ml_e07c19bbd0c34a998d74c6f7d3d7d3a6_master.jpg",
    "isMain": false
  },
  {
    "id": 117,
    "dishId": 54,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRs9UAEeoh5Bv6hc2_Nk8c-DNvmXt8hEybXTD7J4sQNrOrkP3z0RtAH283v&s=10",
    "isMain": false
  },
  {
    "id": 118,
    "dishId": 54,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNu19thbD_O0NFcm8IJ7NqcKj3TTTaskaRz-S9y3NdIe2W3tyAqSf_l-M&s=10",
    "isMain": false
  },
  {
    "id": 119,
    "dishId": 54,
    "imageUrl": "https://product.hstatic.net/200000460455/product/sprite_sleek_can_coca_xuan_320ml_5883907844a54b8ea155a4fb56e0a754_master.png",
    "isMain": true
  },
  {
    "id": 120,
    "dishId": 55,
    "imageUrl": "https://cdnv2.tgdd.vn/bhx-static/bhx/Products/Images/2443/193332/bhx/z-2_202411041516031783.jpg",
    "isMain": true
  },
  {
    "id": 121,
    "dishId": 55,
    "imageUrl": "https://shop.annam-gourmet.com/pub/media/catalog/product/cache/ee0af4cad0f3673c5271df64bd520339/i/t/item_F104711_b6e8.jpg",
    "isMain": false
  },
  {
    "id": 122,
    "dishId": 55,
    "imageUrl": "https://storage.googleapis.com/sc_pcm_product/prod/2025/2/19/618817-8935049501572.webp",
    "isMain": false
  },
  {
    "id": 123,
    "dishId": 56,
    "imageUrl": "https://www.huongnghiepaau.com/wp-content/uploads/2017/07/tra-dao-cam-sa-ngot-ngao.jpg",
    "isMain": true
  },
  {
    "id": 124,
    "dishId": 56,
    "imageUrl": "https://cooponline.vn/tin-tuc/wp-content/uploads/2025/10/tra-dao-cam-sa-cong-thuc-pha-che-chuan-vi.png",
    "isMain": false
  },
  {
    "id": 125,
    "dishId": 56,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2YlNJmWgmqyB1pY9H4E8Q1BgDPWqvyTpbhUjPA2XhES0fRLn360Bls3Hx&s=10",
    "isMain": false
  },
  {
    "id": 126,
    "dishId": 57,
    "imageUrl": "https://lypham.vn/wp-content/uploads/2024/10/cach-lam-tra-chanh-ha-noi.jpg",
    "isMain": true
  },
  {
    "id": 127,
    "dishId": 57,
    "imageUrl": "https://cdn.tgdd.vn/2021/05/CookProduct/thum-1200x676-16.jpg",
    "isMain": false
  },
  {
    "id": 128,
    "dishId": 57,
    "imageUrl": "https://www.unileverfoodsolutions.com.vn/dam/global-ufs/mcos/phvn/vietnam/calcmenu/recipes/VN-recipes/other/energizing-lemon-tea/main-header.jpg",
    "isMain": false
  },
  {
    "id": 129,
    "dishId": 58,
    "imageUrl": "https://cdn-media.sforum.vn/storage/app/media/wp-content/uploads/2023/10/cach-lam-tra-vai-thumbnail.jpg",
    "isMain": true
  },
  {
    "id": 130,
    "dishId": 58,
    "imageUrl": "https://cdn.tgdd.vn/2020/07/CookRecipe/Avatar/tra-vai-hoa-hong-thumbnail.jpg",
    "isMain": false
  },
  {
    "id": 131,
    "dishId": 58,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7nirKld-lYo73PxQCktE_LzmxZV-mpNyLZCgT-0M66Kx7cgi_vl_GLCc&s=10",
    "isMain": false
  },
  {
    "id": 132,
    "dishId": 59,
    "imageUrl": "https://www.bartender.edu.vn/wp-content/uploads/2015/11/tra-sua-truyen-thong.jpg",
    "isMain": true
  },
  {
    "id": 133,
    "dishId": 59,
    "imageUrl": "https://cdn.tgdd.vn/Files/2021/08/10/1374160/hoc-2-cach-pha-tra-sua-truyen-thong-thom-ngon-chuan-vi-ai-cung-me-202203031716377004.jpg",
    "isMain": false
  },
  {
    "id": 134,
    "dishId": 59,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPffR1f_BG2DpUKzR0OjM70s7PC-AD6D7Bg-O2bvRCkvjGhm8jZgrfuQHn&s=10",
    "isMain": false
  },
  {
    "id": 135,
    "dishId": 60,
    "imageUrl": "https://cdn.tgdd.vn/2021/04/CookRecipe/GalleryStep/thanh-pham-1340.jpg",
    "isMain": true
  },
  {
    "id": 136,
    "dishId": 60,
    "imageUrl": "https://www.cet.edu.vn/wp-content/uploads/2021/05/cach-lam-tra-sua-matcha.jpg",
    "isMain": false
  },
  {
    "id": 137,
    "dishId": 60,
    "imageUrl": "https://cdn.tgdd.vn/2026/04/CookRecipe/GalleryStep/thanh-pham-153.jpg",
    "isMain": false
  },
  {
    "id": 138,
    "dishId": 61,
    "imageUrl": "https://file.hstatic.net/1000274203/article/tac_dung_cua_ca_phe_den_2a1a0e12486f430cb893203b10dea6c7.jpg",
    "isMain": true
  },
  {
    "id": 139,
    "dishId": 61,
    "imageUrl": "https://vinbarista.com/uploads/news/10-loi-ich-bat-ngo-khi-uong-ca-phe-den-nguyen-chat-202504021427.jpg",
    "isMain": false
  },
  {
    "id": 140,
    "dishId": 61,
    "imageUrl": "https://oola.vn/wp-content/uploads/2023/03/ca-phe-den.jpg",
    "isMain": false
  },
  {
    "id": 141,
    "dishId": 62,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkFhoMhFnxnZBfTdoD9HiUKyV4NWSPMNCyld-Sn7oQlUVruMp2Obi1Y6g&s=10",
    "isMain": true
  },
  {
    "id": 142,
    "dishId": 62,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREQWdkFEC-MvEeiNN8shoN9B0FWn1GMB24NmwTrS6kZhj42VmiPycokuI&s=10",
    "isMain": false
  },
  {
    "id": 143,
    "dishId": 62,
    "imageUrl": "https://cdn.tgdd.vn/2021/08/CookRecipe/GalleryStep/thanh-pham-314.jpg",
    "isMain": false
  },
  {
    "id": 144,
    "dishId": 63,
    "imageUrl": "https://cdn.tgdd.vn/2021/03/CookProduct/Bac-xiu-la-gi-nguon-goc-va-cach-lam-bac-xiu-thom-ngon-don-gian-tai-nha-0-1200x676.jpg",
    "isMain": true
  },
  {
    "id": 145,
    "dishId": 63,
    "imageUrl": "https://dayphache.edu.vn/wp-content/uploads/2019/10/bac-xiu-da.jpg",
    "isMain": false
  },
  {
    "id": 146,
    "dishId": 63,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEEAo1SrrfxqTG6zncgGdg2aLQRyMsVLWNb3eoz_AIDMUmQGlA_JvvExU&s=10v",
    "isMain": false
  },
  {
    "id": 147,
    "dishId": 64,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxDSku7NWam5p8bRn7K4_HlBhoG5pABCUdezem3ghgKBX5DDL-2rwgusw&s=10",
    "isMain": true
  },
  {
    "id": 148,
    "dishId": 64,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ16XNJA7lW2ALHeEhX9LL06WhPxkyQF6V9QZcR9R6F_LVPnpfGdDFBQx0&s=10",
    "isMain": false
  },
  {
    "id": 149,
    "dishId": 64,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwwg1JnpsIWZThhTYwGuNlmn-R3U8EkWfZAkhDA82bHfAZ1_8wvppZH8M&s=10",
    "isMain": false
  },
  {
    "id": 150,
    "dishId": 65,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ98z4YqylgtiZZSIOr_RMHNGIyBxbkK6B3gu-a_GgSzQ&s=10",
    "isMain": true
  },
  {
    "id": 151,
    "dishId": 65,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaN2azyRxf0HSJ7yizltTeczv8nVkve8yNQoUm6nMQmfVw4H0tYmBLgYo&s=10",
    "isMain": false
  },
  {
    "id": 152,
    "dishId": 65,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOij-t9YRSi5M3H1kxfoFn2vZ6logKUSraw-h8-9f-zw&s=10",
    "isMain": false
  },
  {
    "id": 153,
    "dishId": 66,
    "imageUrl": "https://www.allrecipes.com/thmb/chsZz0jqIHWYz39ViZR-9k_BkkE=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/8624835-how-to-make-a-cappuccino-beauty-4x3-0301-13d55eaad60b42058f24369c292d4ccb.jpg",
    "isMain": false
  },
  {
    "id": 154,
    "dishId": 66,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9h7FSpyyjltjKQtA1np5YvMmCLyb8SCU5Q_mf-Maigw&s=10",
    "isMain": true
  },
  {
    "id": 155,
    "dishId": 66,
    "imageUrl": "https://www.tasteofhome.com/wp-content/uploads/2017/09/Cappuccino-Punch_EXPS_HPBZ16_19462_D05_24_2b.jpg",
    "isMain": false
  },
  {
    "id": 156,
    "dishId": 67,
    "imageUrl": "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/Nuoc_ep_cam_0ae1447a8f.jpg",
    "isMain": true
  },
  {
    "id": 157,
    "dishId": 67,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQetL9FQTI_HxQpCh6d6r6I1D_EX7mG7PmYJVPbA3x98KeoNF1R64IyKPo&s=10",
    "isMain": false
  },
  {
    "id": 158,
    "dishId": 67,
    "imageUrl": "https://cdn.tgdd.vn/2020/07/CookProductThumb/nuocscam-620x620.jpg",
    "isMain": false
  },
  {
    "id": 159,
    "dishId": 68,
    "imageUrl": "https://www.cet.edu.vn/wp-content/uploads/2020/06/cach-lam-nuoc-ep-dua-hau.jpg",
    "isMain": false
  },
  {
    "id": 160,
    "dishId": 68,
    "imageUrl": "https://cdn.tgdd.vn/2021/12/CookRecipe/Avatar/nuoc-ep-dua-hau-thumbnail.jpg",
    "isMain": false
  },
  {
    "id": 161,
    "dishId": 68,
    "imageUrl": "https://www.huongnghiepaau.com/wp-content/uploads/2017/08/nuoc-ep-dua-hau-ngot-mat.jpg",
    "isMain": true
  },
  {
    "id": 162,
    "dishId": 69,
    "imageUrl": "https://cdn.tgdd.vn/2021/08/CookRecipe/GalleryStep/thanh-pham-1351.jpg",
    "isMain": true
  },
  {
    "id": 163,
    "dishId": 69,
    "imageUrl": "https://lypham.vn/wp-content/uploads/2025/11/cach-lam-sinh-to-mang-cau-bo.jpg",
    "isMain": false
  },
  {
    "id": 164,
    "dishId": 69,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQq3L4JF4raVvH4P6rMb_ha49oYclQTsBupFaITNyr8j6zYIXJmaGq6jKpl&s=10",
    "isMain": false
  },
  {
    "id": 165,
    "dishId": 70,
    "imageUrl": "https://dayphache.edu.vn/wp-content/uploads/2016/02/cach-lam-sinh-to-xoai-sua-dac.jpg",
    "isMain": true
  },
  {
    "id": 166,
    "dishId": 70,
    "imageUrl": "https://bizweb.dktcdn.net/thumb/1024x1024/100/516/634/products/sinh-to-xoai.jpg?v=1726542596270",
    "isMain": false
  },
  {
    "id": 167,
    "dishId": 70,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9p4SVWm6eEZTNumuUjOlxaozKxPyBKV3XnE5iLYFgv3mCF4Bqjhf2zbU&s=10",
    "isMain": false
  },
  {
    "id": 168,
    "dishId": 71,
    "imageUrl": "https://dayphache.edu.vn/wp-content/uploads/2016/02/kem-vani.jpg",
    "isMain": false
  },
  {
    "id": 169,
    "dishId": 71,
    "imageUrl": "https://cdn.tgdd.vn/2021/10/CookRecipe/Avatar/3-17-screenshot.jpg",
    "isMain": true
  },
  {
    "id": 170,
    "dishId": 71,
    "imageUrl": "https://static-images.vnncdn.net/files/publish/cach-lam-kem-vani-cuc-ngon-tai-nha-5094e1fbf87641faa9368b95c7be9148.jpg?width=0&s=34l6Cc44IKuz0Y20M_0fNQ",
    "isMain": false
  },
  {
    "id": 171,
    "dishId": 72,
    "imageUrl": "https://dayphache.edu.vn/wp-content/uploads/2017/03/hoc-cach-lam-kem-socola.jpg",
    "isMain": false
  },
  {
    "id": 172,
    "dishId": 72,
    "imageUrl": "https://static-images.vnncdn.net/files/publish/cach-lam-kem-socola-thom-ngon-tai-nha-0d04b4de993f4530a7f843b31e367f40.jpg?width=0&s=pdzwiupl1k_AziNIc1rucQ",
    "isMain": true
  },
  {
    "id": 173,
    "dishId": 72,
    "imageUrl": "https://file.hstatic.net/1000396324/file/cach-lam-kem-socola-2_a922a19f416a4422b975839af109e2c7.jpg",
    "isMain": false
  },
  {
    "id": 174,
    "dishId": 73,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGPDPpf23jrpJc4Gjy1Y2NPCTV3y0HqM1yjVzH2Zo-U3ZyRyR9Lqa4HPg&s=10",
    "isMain": true
  },
  {
    "id": 175,
    "dishId": 73,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSm1zkbYLGn4IOgHE7Ejm5CkXNtyfrrL_Jvi4huBcyufCpVnrkTpbMjc7E&s=10",
    "isMain": false
  },
  {
    "id": 176,
    "dishId": 73,
    "imageUrl": "https://savourebakery.com/storage/images/san-pham/Banh-lanh/Banh-Flan-2.jpg",
    "isMain": false
  },
  {
    "id": 177,
    "dishId": 74,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSix8Nxmazuu2mmzxMdeomdTxVAMnmd-2EX1giDlTooX5qEbZbqk_2B8967&s=10",
    "isMain": true
  },
  {
    "id": 178,
    "dishId": 74,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMxzrsZpsQpUkEpwNYFG4ZGylh0PqmeHmbTa8t5FnLl0yDclrBjI-JBM8&s=10",
    "isMain": false
  },
  {
    "id": 179,
    "dishId": 74,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1xtPzEoRlmLgKFiczhciiHbNOqZQPlT8GIKrvWbagldOwNX_0WHi2RF0&s=10",
    "isMain": false
  },
  {
    "id": 180,
    "dishId": 75,
    "imageUrl": "https://cdn.tgdd.vn/2020/12/CookRecipe/GalleryStep/thanh-pham-963.jpg",
    "isMain": false
  },
  {
    "id": 181,
    "dishId": 75,
    "imageUrl": "https://daylambanh.edu.vn/wp-content/uploads/2016/06/cach-lam-cheesecake-viet-quat.jpg",
    "isMain": false
  },
  {
    "id": 182,
    "dishId": 75,
    "imageUrl": "https://cdn.tgdd.vn/Files/2022/03/31/1423160/cach-lam-banh-cheesecake-viet-quat-beo-ngay-thom-ngon-de-lam-tai-nha-202203310716536409.jpg",
    "isMain": true
  },
  {
    "id": 183,
    "dishId": 76,
    "imageUrl": "https://cdn.tgdd.vn/2021/09/CookRecipe/GalleryStep/thanh-pham-2132.jpg",
    "isMain": false
  },
  {
    "id": 184,
    "dishId": 76,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRa5x5XaxqInU1N0qoFZRntVj4oNa-_nRYKNadlLb1IFyMZfon5qtiyjY&s=10",
    "isMain": false
  },
  {
    "id": 185,
    "dishId": 76,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfWkWsHV3qyQxla2Uq-w7vkKpd1X3yWykluGAiFHCGItSdxldg6G1mM1Q&s=10",
    "isMain": true
  },
  {
    "id": 186,
    "dishId": 77,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS26OQ9XhaSaWL9wnz-EkzuTYIBhs2wxt49n-HZEOhxX0Tf0AUg0TcAmLnH&s=10",
    "isMain": false
  },
  {
    "id": 187,
    "dishId": 77,
    "imageUrl": "https://bizweb.dktcdn.net/100/487/455/products/choux-1695873488314.jpg?v=1724205292207",
    "isMain": true
  },
  {
    "id": 188,
    "dishId": 77,
    "imageUrl": "https://cdn.tgdd.vn/2021/06/CookRecipe/Avatar/banh-su-kem-thumbnail.jpg",
    "isMain": false
  },
  {
    "id": 189,
    "dishId": 78,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCAsok1oVEZVH8q14Rei2yQCHjlurTUZMEJCVbkVa_Yav4kHY6gPIxiy4&s=10",
    "isMain": true
  },
  {
    "id": 190,
    "dishId": 78,
    "imageUrl": "https://i.ytimg.com/vi/n-HDNu5dCAU/maxresdefault.jpg",
    "isMain": false
  },
  {
    "id": 191,
    "dishId": 78,
    "imageUrl": "https://www.huongnghiepaau.com/wp-content/uploads/2020/08/sua-chua-uong-trai-cay.jpg",
    "isMain": false
  },
  {
    "id": 192,
    "dishId": 79,
    "imageUrl": "https://cdn.tgdd.vn/2021/11/CookRecipe/Avatar/rau-cau-dua-soi-thumbnail.jpg",
    "isMain": true
  },
  {
    "id": 193,
    "dishId": 79,
    "imageUrl": "https://cdn-media.sforum.vn/storage/app/media/wp-content/uploads/2023/11/cach-lam-rau-cau-dua-thumnail.jpg",
    "isMain": false
  },
  {
    "id": 194,
    "dishId": 79,
    "imageUrl": "https://cdn11.dienmaycholon.vn/filewebdmclnew/public/userupload/files/kien-thuc/cach-lam-rau-cau-dua-deo/cach-lam-rau-cau-dua-deo-1.jpg",
    "isMain": false
  },
  {
    "id": 195,
    "dishId": 80,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqELq-f8nkXc2JBL75iPgmTrVN5Sg5Jwr6ply0zvtDmtal0_i2BvE17ho&s=10",
    "isMain": true
  },
  {
    "id": 196,
    "dishId": 80,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTma-xAVahbNrYIQV1SBcRjLR_tCqmBhD3mhX5To_GoKPzDVSkDDA655evI&s=10",
    "isMain": false
  },
  {
    "id": 197,
    "dishId": 80,
    "imageUrl": "https://foodmap.blob.core.windows.net/foodmap/news/2023/05/trai-cay-mua-he.jpg",
    "isMain": false
  },
  {
    "id": 201,
    "dishId": 30,
    "imageUrl": "https://trixie.com.vn/media/images/product/45867239/hinh-ga-nuong-%20bbq.jpg",
    "isMain": true
  },
  {
    "id": 202,
    "dishId": 30,
    "imageUrl": "https://vuongquocruou.vn/wp-content/uploads/2024/10/canh-ga-nuong-bbq.png",
    "isMain": false
  },
  {
    "id": 203,
    "dishId": 30,
    "imageUrl": "https://cdn.tgdd.vn/2020/09/CookProduct/1-1200x676-24.jpg",
    "isMain": false
  },
  {
    "id": 204,
    "dishId": 25,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSS0n_ejbdOS94vyLvKZXyfANBo6z-JQcBd0cbsCz7_PBHsysu1Sl3FvY&s=10",
    "isMain": true
  },
  {
    "id": 205,
    "dishId": 25,
    "imageUrl": "https://www.monngon.tv/uploads/images/images/cach-lam-pizza-bo-1.jpeg",
    "isMain": false
  },
  {
    "id": 206,
    "dishId": 25,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQArMkcs_Bt6qfxiTwbOsjOQ7wzgjG8jmH2oF8RfOuJRet407BtnKA6k90&s=10",
    "isMain": false
  },
  {
    "id": 207,
    "dishId": 38,
    "imageUrl": "https://cooponline.vn/tin-tuc/wp-content/uploads/2025/10/cha-gio-hai-san-cong-thuc-lam-mon-khai-vi-gion-rum-thom-ngon-dam-vi-bien.png",
    "isMain": true
  },
  {
    "id": 208,
    "dishId": 38,
    "imageUrl": "https://cdn.tgdd.vn/2022/01/CookDish/2-cach-lam-cha-gio-hai-san-don-gian-gion-thom-beo-ngay-ai-avt-1200x676.jpg",
    "isMain": false
  },
  {
    "id": 209,
    "dishId": 38,
    "imageUrl": "https://storage.googleapis.com/onelife-public/blog.onelife.vn/2026/03/0562e1f7-cha-gio-hai-san-sot-mayonnaise-5-700x525.jpg",
    "isMain": false
  },
  {
    "id": 213,
    "dishId": 3,
    "imageUrl": "https://cdn.tgdd.vn/2021/09/CookProduct/1200(3)-1200x676-2.jpg",
    "isMain": true
  },
  {
    "id": 214,
    "dishId": 3,
    "imageUrl": "https://cdnv2.tgdd.vn/mwg-static/common/Common/H%C3%ACnh%20m%C3%B3n%20an%20t01%20%281200%20x%20676%20px%29%20%2828%29.jpg",
    "isMain": false
  },
  {
    "id": 215,
    "dishId": 3,
    "imageUrl": "https://www.huongnghiepaau.com/wp-content/uploads/2017/08/cach-nau-pho-ga-ngon.jpg",
    "isMain": false
  },
  {
    "id": 216,
    "dishId": 6,
    "imageUrl": "https://cdn.tgdd.vn/2020/08/CookProduct/Untitled-1-1200x676-10.jpg",
    "isMain": true
  },
  {
    "id": 217,
    "dishId": 6,
    "imageUrl": "https://cdnv2.tgdd.vn/mwg-static/common/Common/H%C3%ACnh%20thumb%20to%20t8%20%2866%29.jpg",
    "isMain": false
  },
  {
    "id": 218,
    "dishId": 6,
    "imageUrl": "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/cach_nau_bun_rieu_cua_ha_noi_ed8278d38b.jpg",
    "isMain": false
  },
  {
    "id": 219,
    "dishId": 7,
    "imageUrl": "https://i-giadinh.vnecdn.net/2023/05/15/Bc8Thnhphm18-1684125639-9811-1684125654.jpg",
    "isMain": true
  },
  {
    "id": 220,
    "dishId": 7,
    "imageUrl": "https://cdn.tgdd.vn/2021/10/CookRecipe/Avatar/2(10).jpg",
    "isMain": false
  },
  {
    "id": 221,
    "dishId": 7,
    "imageUrl": "https://cooponline.vn/tin-tuc/wp-content/uploads/2025/10/hu-tieu-nam-vang-cong-thuc-nau-chuan-vi-sai-gon-nuoc-dung-ngot-thanh-dam-da-topping.png",
    "isMain": false
  },
  {
    "id": 222,
    "dishId": 8,
    "imageUrl": "https://cooponline.vn/tin-tuc/wp-content/uploads/2025/10/mi-quang-mon-dac-san-dam-da-thom-lung-xu-quang.png",
    "isMain": true
  },
  {
    "id": 223,
    "dishId": 8,
    "imageUrl": "https://cattour.vn/images/upload/images/mi-quang-dac-san-noi-tieng-nhat-cua-mien-trung/mi-quang-ga.jpg",
    "isMain": false
  },
  {
    "id": 224,
    "dishId": 8,
    "imageUrl": "https://cdn3.ivivu.com/2023/10/mi-quang-ivivu-9.jpg",
    "isMain": false
  },
  {
    "id": 225,
    "dishId": 9,
    "imageUrl": "https://cdn.tgdd.vn/2021/05/CookProduct/thumbcmscn-1200x676-4.jpg",
    "isMain": true
  },
  {
    "id": 226,
    "dishId": 9,
    "imageUrl": "https://www.huongnghiepaau.com/wp-content/uploads/2018/01/banh-canh-cua.jpg",
    "isMain": false
  },
  {
    "id": 227,
    "dishId": 9,
    "imageUrl": "https://cdn.hstatic.net/files/200000700229/article/banh-canh-cua-chay-thumb_36726ae473f847e2a55b805135f3d848.jpg",
    "isMain": false
  },
  {
    "id": 228,
    "dishId": 14,
    "imageUrl": "https://www.huongnghiepaau.com/wp-content/uploads/2025/09/cach-lam-com-rang-dua-bo.jpg",
    "isMain": false
  },
  {
    "id": 229,
    "dishId": 14,
    "imageUrl": "https://i-giadinh.vnecdn.net/2023/10/17/Buoc-8-Thanh-pham-1-8-2323-1697527935.jpg",
    "isMain": true
  },
  {
    "id": 230,
    "dishId": 14,
    "imageUrl": "https://afamilycdn.com/150157425591193600/2023/12/17/cong-thuc-lam-com-rang-dua-bo-ngon-chuan-vi-ha-noi1-1702799295172-17027992956191958849824.jpg",
    "isMain": false
  },
  {
    "id": 231,
    "dishId": 15,
    "imageUrl": "https://cdn.tgdd.vn/2021/01/CookProduct/thumb1-1200x676-10.jpg",
    "isMain": true
  },
  {
    "id": 232,
    "dishId": 15,
    "imageUrl": "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/com_chien_bo_luc_lac_thumb_c464dabbe4.JPG",
    "isMain": false
  },
  {
    "id": 233,
    "dishId": 15,
    "imageUrl": "https://i.ytimg.com/vi/RfGrzXPuKeM/maxresdefault.jpg",
    "isMain": false
  },
  {
    "id": 234,
    "dishId": 16,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToiyGxsXk6IroAUifLguqNt1gcsZF7p6S77I8U3QDbb3VRusVsx4waBR7j&s=10",
    "isMain": true
  },
  {
    "id": 235,
    "dishId": 16,
    "imageUrl": "https://hnm.vn/wp-content/uploads/2013/06/com-ca-tram-kho-to-1.jpg",
    "isMain": false
  },
  {
    "id": 236,
    "dishId": 16,
    "imageUrl": "https://cdnv2.tgdd.vn/mwg-static/common/Common/05052025%20-%202025-05-09T154044.858.jpg",
    "isMain": false
  },
  {
    "id": 237,
    "dishId": 18,
    "imageUrl": "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2024_5_7_638507084183475958_mi-cay-bao-nhieu-calo.jpg",
    "isMain": false
  },
  {
    "id": 238,
    "dishId": 18,
    "imageUrl": "https://bizweb.dktcdn.net/100/603/550/articles/my-cay-0.jpg?v=1759828264857",
    "isMain": true
  },
  {
    "id": 239,
    "dishId": 18,
    "imageUrl": "https://monngonmoingay.com/wp-content/uploads/2025/03/2.png",
    "isMain": false
  },
  {
    "id": 240,
    "dishId": 19,
    "imageUrl": "https://cdn11.dienmaycholon.vn/filewebdmclnew/public/userupload/files/kien-thuc/cach-nau-lau-thai/cach-nau-lau-thai-1.jpg",
    "isMain": true
  },
  {
    "id": 241,
    "dishId": 19,
    "imageUrl": "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2023_10_19_638333107419881422_cach-nau-lau-thai-thumb.jpg",
    "isMain": false
  },
  {
    "id": 242,
    "dishId": 19,
    "imageUrl": "https://cooponline.vn/tin-tuc/wp-content/uploads/2025/10/Hinh-bia-5.jpg",
    "isMain": false
  },
  {
    "id": 246,
    "dishId": 34,
    "imageUrl": "https://daotaobeptruong.vn/wp-content/uploads/2020/04/cach-lam-kim-chi-cai-thao.jpg",
    "isMain": false
  },
  {
    "id": 247,
    "dishId": 34,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtcRkE32KwNfjU-3Om5g9zlyUnIs7Uq85ZkCunnlSPC1HxPHwrvSzLTnoH&s=10",
    "isMain": true
  },
  {
    "id": 248,
    "dishId": 34,
    "imageUrl": "https://i-giadinh.vnecdn.net/2021/10/07/kimchi-1633599838-4841-1633599980.jpg",
    "isMain": false
  },
  {
    "id": 249,
    "dishId": 39,
    "imageUrl": "https://www.cet.edu.vn/wp-content/uploads/2018/11/goi-cuon-tom-thit.jpg",
    "isMain": true
  },
  {
    "id": 250,
    "dishId": 39,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqloOCCXllXHiJYrwq12XqHIVvWX_hYb8Z8ZgtL0UGbQ&s=10",
    "isMain": false
  },
  {
    "id": 251,
    "dishId": 39,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXSIVrKZK9nfyFKkYyeDRh0RqKogNdmvNfnF67Rih33anxAdFq-JCzviT0&s=10",
    "isMain": false
  },
  {
    "id": 252,
    "dishId": 43,
    "imageUrl": "https://beptruong.edu.vn/wp-content/uploads/2015/11/hinh-anh-bat-chao-thit-bam.jpg",
    "isMain": false
  },
  {
    "id": 253,
    "dishId": 43,
    "imageUrl": "https://hoanghamobile.com/tin-tuc/wp-content/uploads/2025/06/cach-nau-chao-thit-bam.jpg",
    "isMain": true
  },
  {
    "id": 254,
    "dishId": 43,
    "imageUrl": "https://cdn11.dienmaycholon.vn/filewebdmclnew/public/userupload/files/kien-thuc/cach-nau-chao-thit-bam/cach-nau-chao-thit-bam-1.jpg",
    "isMain": false
  },
  {
    "id": 255,
    "dishId": 44,
    "imageUrl": "https://cdnv2.tgdd.vn/mwg-static/common/Common/H%C3%ACnh%20thumb%20m%C3%B3n%20an%20t11%20%282%29.jpg",
    "isMain": true
  },
  {
    "id": 256,
    "dishId": 44,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCVwyhJqbrb92j_27Yft46OJmIEzY2ZhstuuUs_hDzdfxyTFQqsmqgJJKH&s=10",
    "isMain": false
  },
  {
    "id": 257,
    "dishId": 44,
    "imageUrl": "https://assets.unileversolutions.com/recipes-v2/247235.jpg",
    "isMain": false
  },
  {
    "id": 258,
    "dishId": 45,
    "imageUrl": "https://beptruong.edu.vn/wp-content/uploads/2018/08/mo-quan-chao-dinh-duong.jpg",
    "isMain": false
  },
  {
    "id": 259,
    "dishId": 45,
    "imageUrl": "https://unie.com.vn/wp-content/uploads/2019/12/cach-nau-chao-dinh-duong-cho-tre-thit-bam.jpg",
    "isMain": true
  },
  {
    "id": 260,
    "dishId": 45,
    "imageUrl": "https://chaodinhduongpapadashi.vn/wp-content/uploads/2024/12/Suon-Non-Ngu-Coc.png",
    "isMain": false
  },
  {
    "id": 261,
    "dishId": 46,
    "imageUrl": "https://cdn.tgdd.vn/2022/01/CookDishThumb/cong-thuc-lam-lau-chao-long-vua-thoi-vua-an-vo-cung-hap-dan-thumb-620x620.jpg",
    "isMain": false
  },
  {
    "id": 262,
    "dishId": 46,
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/8/82/Ch%C3%A1o_l%C3%B2ng.jpg",
    "isMain": false
  },
  {
    "id": 263,
    "dishId": 46,
    "imageUrl": "https://daotaobeptruong.vn/wp-content/uploads/2019/12/chao-long.jpg",
    "isMain": true
  },
  {
    "id": 264,
    "dishId": 47,
    "imageUrl": "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/canh_chua_ca_bong_lau_1_7e63517315.jpg",
    "isMain": true
  },
  {
    "id": 265,
    "dishId": 47,
    "imageUrl": "https://cdn.tgdd.vn/2021/11/CookDish/cach-nau-canh-chua-ca-lang-sieu-bat-vi-dam-da-hap-dan-cho-bua-avt-1200x676-1.jpg",
    "isMain": false
  },
  {
    "id": 266,
    "dishId": 47,
    "imageUrl": "https://beptruong.edu.vn/wp-content/uploads/2020/03/canh-chua-ca-dieu-hong.jpg",
    "isMain": false
  },
  {
    "id": 267,
    "dishId": 48,
    "imageUrl": "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2023_10_20_638334216677224510_canh-cai-ngot_hinh-3.jpeg",
    "isMain": true
  },
  {
    "id": 268,
    "dishId": 48,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeQkE1213sMevPGbCxN82ncG6VYHAc2CpeqORQZtsMxV0ZF3Bq6oBirWg&s=10",
    "isMain": false
  },
  {
    "id": 269,
    "dishId": 48,
    "imageUrl": "https://img.onelife.vn/ZJAVBJnOQWSocMDlfzDuqGpy6YmTcQY6JFeUCnNlWyQ/rs:fit:1000:1000:1/aHR0cHM6Ly9zdG9yYWdlLmdvb2dsZWFwaXMuY29tL29uZWxpZmUtcHVibGljLzI2X2NkNzQ1ZDMzNzgvMjZfY2Q3NDVkMzM3OC5qcGc.webp",
    "isMain": false
  },
  {
    "id": 270,
    "dishId": 49,
    "imageUrl": "https://cdn.tgdd.vn/2023/11/CookDish/canh-rong-bien-nau-voi-gi-ngon-tong-hop-cac-mon-canh-tu-rong-avt-1200x676.jpg",
    "isMain": true
  },
  {
    "id": 271,
    "dishId": 49,
    "imageUrl": "https://www.huongnghiepaau.com/wp-content/uploads/2022/10/mon-canh-rong-bien.jpg",
    "isMain": false
  },
  {
    "id": 272,
    "dishId": 49,
    "imageUrl": "https://genki.vn/wp-content/uploads/2016/07/4d70d32f-93e4-430f-9382-2e1661baf6f3.png",
    "isMain": false
  },
  {
    "id": 273,
    "dishId": 50,
    "imageUrl": "https://cdn2.fptshop.com.vn/unsafe/Uploads/images/tin-tuc/182112/Originals/canh-bi-do-ham-xuong-1.jpg",
    "isMain": true
  },
  {
    "id": 274,
    "dishId": 50,
    "imageUrl": "https://www.cet.edu.vn/wp-content/uploads/2018/03/canh-bi-do-bo-duong.jpg",
    "isMain": false
  },
  {
    "id": 275,
    "dishId": 50,
    "imageUrl": "https://img.onelife.vn/I16VuG8x-XsXtFAGeX8ELBTjJz_G62pKRy4WtQvr0FA/rs:fit:1000:1000:1/aHR0cHM6Ly9zdG9yYWdlLmdvb2dsZWFwaXMuY29tL29uZWxpZmUtcHVibGljL2NhbmhfYmlfZG9faGFtX3h1b25nX3RodW1ibmFpbF82MTdlMjUwMDYzL2NhbmhfYmlfZG9faGFtX3h1b25nX3RodW1ibmFpbF82MTdlMjUwMDYzLmpwZw.webp",
    "isMain": false
  }
];

async function resetSequence(tableName: string, column: string) {
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"${tableName}"', '${column}'), (SELECT COALESCE(MAX("${column}"), 1) FROM "${tableName}"));`
  );
}

async function main() {
  // Xóa dữ liệu cũ trước (CASCADE để bỏ qua FK constraints)
  console.log('Xóa dữ liệu cũ...');
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "DishImage", "Dish" CASCADE;`);

  console.log(`Seeding ${dishes.length} dishes...`);
  await prisma.dish.createMany({
    data: dishes,
  });

  console.log(`Seeding ${dishImages.length} dish images...`);
  await prisma.dishImage.createMany({
    data: dishImages,
  });

  console.log('Resetting id sequences...');
  await resetSequence('Dish', 'id');
  await resetSequence('DishImage', 'id');

  console.log('Seed hoàn tất.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
