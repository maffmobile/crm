"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var bcryptjs_1 = require("bcryptjs");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var adminHash, admin, opHash, operator, pochtaHash, omborHash, products, _i, products_1, product, customers, createdCustomers, _a, customers_1, c, customer;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("🌱 Seeding database...");
                    return [4 /*yield*/, bcryptjs_1.default.hash("admin123", 10)];
                case 1:
                    adminHash = _b.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: "admin@internetmagazin.uz" },
                            update: {},
                            create: {
                                fullName: "Tizim Administratori",
                                email: "admin@internetmagazin.uz",
                                phone: "+998901000001",
                                passwordHash: adminHash,
                                role: "ADMIN",
                            },
                        })];
                case 2:
                    admin = _b.sent();
                    return [4 /*yield*/, bcryptjs_1.default.hash("operator123", 10)];
                case 3:
                    opHash = _b.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: "operator@internetmagazin.uz" },
                            update: {},
                            create: {
                                fullName: "Savdo Operatori",
                                email: "operator@internetmagazin.uz",
                                phone: "+998901000002",
                                passwordHash: opHash,
                                role: "OPERATOR",
                            },
                        })];
                case 4:
                    operator = _b.sent();
                    return [4 /*yield*/, bcryptjs_1.default.hash("pochta123", 10)];
                case 5:
                    pochtaHash = _b.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: "pochta@internetmagazin.uz" },
                            update: {},
                            create: {
                                fullName: "Pochta Xodimi",
                                email: "pochta@internetmagazin.uz",
                                phone: "+998901000003",
                                passwordHash: pochtaHash,
                                role: "POCHTA",
                            },
                        })];
                case 6:
                    _b.sent();
                    return [4 /*yield*/, bcryptjs_1.default.hash("ombor123", 10)];
                case 7:
                    omborHash = _b.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: "ombor@internetmagazin.uz" },
                            update: {},
                            create: {
                                fullName: "Omborchi",
                                email: "ombor@internetmagazin.uz",
                                phone: "+998901000004",
                                passwordHash: omborHash,
                                role: "OMBOR",
                            },
                        })];
                case 8:
                    _b.sent();
                    products = [
                        { name: "Proektr Epson EB-X51", category: "Elektronika", price: 3500000, stock: 10, sku: "PRJ-001" },
                        { name: "Shurpavoy bosh (Elektr)", category: "Uy jihozlari", price: 280000, stock: 45, sku: "KIT-001" },
                        { name: "FILIP 14 PRO Smartfon", category: "Elektronika", price: 5200000, stock: 8, sku: "PHN-001" },
                        { name: "Samsung Galaxy A34", category: "Elektronika", price: 4100000, stock: 15, sku: "PHN-002" },
                        { name: "Xiaomi Redmi Note 12", category: "Elektronika", price: 2900000, stock: 22, sku: "PHN-003" },
                        { name: "Televizor 43 inch Smart", category: "Elektronika", price: 3800000, stock: 6, sku: "TV-001" },
                        { name: "Changyutgich Dyson V11", category: "Uy jihozlari", price: 4500000, stock: 4, sku: "VC-001" },
                    ];
                    _i = 0, products_1 = products;
                    _b.label = 9;
                case 9:
                    if (!(_i < products_1.length)) return [3 /*break*/, 12];
                    product = products_1[_i];
                    return [4 /*yield*/, prisma.product.upsert({
                            where: { sku: product.sku },
                            update: {},
                            create: product,
                        })];
                case 10:
                    _b.sent();
                    _b.label = 11;
                case 11:
                    _i++;
                    return [3 /*break*/, 9];
                case 12:
                    customers = [
                        { fullName: "Aliyev Jasurbek Nosirovich", phone: "+998901234567", region: "Toshkent sh.", district: "Yunusobod", address: "47-mavze, 12-uy" },
                        { fullName: "Toshmatova Dilnoza Hamidovna", phone: "+998901234568", region: "Samarqand", district: "Mirzo Ulug'bek", address: "Universitet ko'chasi 5" },
                        { fullName: "Karimov Sherzod Baxtiyorovich", phone: "+998901234569", region: "Farg'ona", district: "Farg'ona", address: "Mustaqillik ko'chasi 23" },
                    ];
                    createdCustomers = [];
                    _a = 0, customers_1 = customers;
                    _b.label = 13;
                case 13:
                    if (!(_a < customers_1.length)) return [3 /*break*/, 16];
                    c = customers_1[_a];
                    return [4 /*yield*/, prisma.customer.upsert({
                            where: { phone: c.phone },
                            update: {},
                            create: c,
                        })];
                case 14:
                    customer = _b.sent();
                    createdCustomers.push(customer);
                    _b.label = 15;
                case 15:
                    _a++;
                    return [3 /*break*/, 13];
                case 16:
                    console.log("✅ Seed completed!");
                    console.log("\n📋 Login ma'lumotlari:");
                    console.log("  ADMIN:    admin@internetmagazin.uz / admin123");
                    console.log("  OPERATOR: operator@internetmagazin.uz / operator123");
                    console.log("  POCHTA:   pochta@internetmagazin.uz / pochta123");
                    console.log("  OMBOR:    ombor@internetmagazin.uz / ombor123");
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) { console.error(e); process.exit(1); })
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, prisma.$disconnect()];
        case 1:
            _a.sent();
            return [2 /*return*/];
    }
}); }); });
