-- ENUMS
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'PENDING', 'PARTIAL');
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- =========================
-- USERS
-- =========================
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN DEFAULT true,
    "lastLogin" TIMESTAMP,
    "failedAttempts" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL
);

-- =========================
-- CUSTOMERS
-- =========================
CREATE TABLE "Customer" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "dni" TEXT UNIQUE NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL
);

-- =========================
-- SUPPLIERS
-- =========================
CREATE TABLE "Supplier" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "dniRuc" TEXT UNIQUE NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL
);

-- =========================
-- CATEGORY (NORMALIZADO)
-- =========================
CREATE TABLE "Category" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE
);

-- =========================
-- PRODUCTS
-- =========================
CREATE TABLE "Product" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "purchasePrice" DECIMAL(10,2) DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "categoryId" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
);

-- =========================
-- CASH REGISTER
-- =========================
CREATE TABLE "CashRegister" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "openingDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "closingDate" TIMESTAMP,
    "openingBalance" DECIMAL(10,2) NOT NULL,
    "closingBalance" DECIMAL(10,2),
    "expectedBalance" DECIMAL(10,2),
    "status" TEXT DEFAULT 'OPEN',
    "notes" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    FOREIGN KEY ("userId") REFERENCES "User"("id")
);

-- =========================
-- SALES
-- =========================
CREATE TABLE "Sale" (
    "id" TEXT PRIMARY KEY,
    "series" TEXT,
    "correlative" INTEGER,
    "documentType" TEXT, -- BOLETA / FACTURA
    "subtotal" DECIMAL(10,2) DEFAULT 0,
    "taxAmount" DECIMAL(10,2) DEFAULT 0,
    "taxRate" DECIMAL(5,2) DEFAULT 18,
    "total" DECIMAL(10,2) NOT NULL,
    "amountPaid" DECIMAL(10,2) DEFAULT 0,
    "status" "PaymentStatus" DEFAULT 'PAID',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "customerId" TEXT,
    "cashRegisterId" TEXT,

    FOREIGN KEY ("userId") REFERENCES "User"("id"),
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL,
    FOREIGN KEY ("cashRegisterId") REFERENCES "CashRegister"("id") ON DELETE SET NULL
);

-- =========================
-- SALE ITEMS
-- =========================
CREATE TABLE "SaleItem" (
    "id" TEXT PRIMARY KEY,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "saleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    FOREIGN KEY ("saleId") REFERENCES "Sale"("id"),
    FOREIGN KEY ("productId") REFERENCES "Product"("id")
);

-- =========================
-- PAYMENTS (MULTIPLES)
-- =========================
CREATE TABLE "Payment" (
    "id" TEXT PRIMARY KEY,
    "saleId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" TEXT NOT NULL, -- CASH, YAPE, CARD
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY ("saleId") REFERENCES "Sale"("id")
);

-- =========================
-- PURCHASES
-- =========================
CREATE TABLE "Purchase" (
    "id" TEXT PRIMARY KEY,
    "total" DECIMAL(10,2) NOT NULL,
    "status" "PurchaseStatus" DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "supplierId" TEXT NOT NULL,

    FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id")
);

-- =========================
-- PURCHASE ITEMS
-- =========================
CREATE TABLE "PurchaseItem" (
    "id" TEXT PRIMARY KEY,
    "quantity" INTEGER NOT NULL,
    "costPrice" DECIMAL(10,2) NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id"),
    FOREIGN KEY ("productId") REFERENCES "Product"("id")
);

-- =========================
-- STOCK MOVEMENTS (AUDITORÍA)
-- =========================
CREATE TABLE "StockMovement" (
    "id" TEXT PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "type" TEXT NOT NULL, -- IN / OUT
    "quantity" INTEGER NOT NULL,
    "reason" TEXT, -- SALE / PURCHASE / ADJUSTMENT
    "referenceId" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY ("productId") REFERENCES "Product"("id")
);

-- =========================
-- CASH MOVEMENTS
-- =========================
CREATE TABLE "CashMovement" (
    "id" TEXT PRIMARY KEY,
    "cashRegisterId" TEXT NOT NULL,
    "type" TEXT NOT NULL, -- IN / OUT
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY ("cashRegisterId") REFERENCES "CashRegister"("id")
);

-- =========================
-- AUDIT LOG
-- =========================
CREATE TABLE "AuditLog" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT,
    "tableName" TEXT,
    "recordId" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY ("userId") REFERENCES "User"("id")
);