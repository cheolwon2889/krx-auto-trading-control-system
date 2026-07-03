-- CreateTable
CREATE TABLE `User` (
    `id` CHAR(36) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `displayName` VARCHAR(100) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RefreshToken` (
    `id` CHAR(36) NOT NULL,
    `tokenHash` VARCHAR(255) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `revokedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` CHAR(36) NOT NULL,

    INDEX `RefreshToken_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TradingSystemSetting` (
    `id` CHAR(36) NOT NULL,
    `tradingEnabled` BOOLEAN NOT NULL DEFAULT false,
    `mode` ENUM('PAPER', 'LIVE') NOT NULL DEFAULT 'PAPER',
    `stopReason` VARCHAR(255) NULL,
    `webhookSecret` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Strategy` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Strategy_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AllowedSymbol` (
    `id` CHAR(36) NOT NULL,
    `symbol` VARCHAR(20) NOT NULL,
    `exchange` VARCHAR(20) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `strategyId` CHAR(36) NOT NULL,

    INDEX `AllowedSymbol_symbol_idx`(`symbol`),
    UNIQUE INDEX `AllowedSymbol_strategyId_symbol_key`(`strategyId`, `symbol`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TradingSignal` (
    `id` CHAR(36) NOT NULL,
    `eventId` VARCHAR(100) NOT NULL,
    `strategyId` CHAR(36) NOT NULL,
    `symbol` VARCHAR(20) NOT NULL,
    `exchange` VARCHAR(20) NOT NULL,
    `side` ENUM('BUY', 'SELL') NOT NULL,
    `orderType` ENUM('MARKET', 'LIMIT') NOT NULL,
    `quantity` DECIMAL(18, 6) NOT NULL,
    `price` DECIMAL(18, 6) NULL,
    `status` ENUM('RECEIVED', 'VALIDATING', 'REJECTED', 'APPROVED', 'ORDER_CREATED', 'ORDER_FAILED', 'COMPLETED') NOT NULL DEFAULT 'RECEIVED',
    `rawPayload` JSON NOT NULL,
    `receivedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `validatedAt` DATETIME(3) NULL,
    `rejectedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TradingSignal_eventId_key`(`eventId`),
    INDEX `TradingSignal_strategyId_receivedAt_idx`(`strategyId`, `receivedAt`),
    INDEX `TradingSignal_symbol_receivedAt_idx`(`symbol`, `receivedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` CHAR(36) NOT NULL,
    `clientOrderId` VARCHAR(100) NOT NULL,
    `brokerOrderId` VARCHAR(100) NULL,
    `signalId` CHAR(36) NOT NULL,
    `strategyId` CHAR(36) NOT NULL,
    `symbol` VARCHAR(20) NOT NULL,
    `exchange` VARCHAR(20) NOT NULL,
    `side` ENUM('BUY', 'SELL') NOT NULL,
    `orderType` ENUM('MARKET', 'LIMIT') NOT NULL,
    `requestedQty` DECIMAL(18, 6) NOT NULL,
    `requestedPrice` DECIMAL(18, 6) NULL,
    `filledQty` DECIMAL(18, 6) NOT NULL DEFAULT 0,
    `averagePrice` DECIMAL(18, 6) NULL,
    `status` ENUM('RECEIVED', 'VALIDATING', 'REJECTED', 'READY', 'ORDER_REQUESTED', 'ORDER_ACCEPTED', 'PARTIALLY_FILLED', 'FILLED', 'CANCELLED', 'FAILED', 'UNKNOWN') NOT NULL DEFAULT 'RECEIVED',
    `failReason` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Order_clientOrderId_key`(`clientOrderId`),
    UNIQUE INDEX `Order_brokerOrderId_key`(`brokerOrderId`),
    UNIQUE INDEX `Order_signalId_key`(`signalId`),
    INDEX `Order_strategyId_createdAt_idx`(`strategyId`, `createdAt`),
    INDEX `Order_symbol_createdAt_idx`(`symbol`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderStatusHistory` (
    `id` CHAR(36) NOT NULL,
    `orderId` CHAR(36) NOT NULL,
    `fromStatus` ENUM('RECEIVED', 'VALIDATING', 'REJECTED', 'READY', 'ORDER_REQUESTED', 'ORDER_ACCEPTED', 'PARTIALLY_FILLED', 'FILLED', 'CANCELLED', 'FAILED', 'UNKNOWN') NULL,
    `toStatus` ENUM('RECEIVED', 'VALIDATING', 'REJECTED', 'READY', 'ORDER_REQUESTED', 'ORDER_ACCEPTED', 'PARTIALLY_FILLED', 'FILLED', 'CANCELLED', 'FAILED', 'UNKNOWN') NOT NULL,
    `reason` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OrderStatusHistory_orderId_createdAt_idx`(`orderId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Execution` (
    `id` CHAR(36) NOT NULL,
    `orderId` CHAR(36) NOT NULL,
    `brokerExecId` VARCHAR(100) NULL,
    `quantity` DECIMAL(18, 6) NOT NULL,
    `price` DECIMAL(18, 6) NOT NULL,
    `executedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Execution_brokerExecId_key`(`brokerExecId`),
    INDEX `Execution_orderId_executedAt_idx`(`orderId`, `executedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Position` (
    `id` CHAR(36) NOT NULL,
    `symbol` VARCHAR(20) NOT NULL,
    `exchange` VARCHAR(20) NOT NULL,
    `quantity` DECIMAL(18, 6) NOT NULL,
    `averagePrice` DECIMAL(18, 6) NOT NULL,
    `lastPrice` DECIMAL(18, 6) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Position_symbol_exchange_key`(`symbol`, `exchange`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RiskRejection` (
    `id` CHAR(36) NOT NULL,
    `signalId` CHAR(36) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `message` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `RiskRejection_signalId_key`(`signalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DailyAccountSummary` (
    `id` CHAR(36) NOT NULL,
    `businessDate` DATE NOT NULL,
    `totalBuyAmt` DECIMAL(18, 2) NOT NULL DEFAULT 0,
    `totalSellAmt` DECIMAL(18, 2) NOT NULL DEFAULT 0,
    `realizedPnl` DECIMAL(18, 2) NOT NULL DEFAULT 0,
    `orderCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DailyAccountSummary_businessDate_key`(`businessDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SystemEvent` (
    `id` CHAR(36) NOT NULL,
    `type` ENUM('INFO', 'WARN', 'ERROR', 'CRITICAL') NOT NULL,
    `eventKey` VARCHAR(100) NULL,
    `level` VARCHAR(20) NOT NULL,
    `message` VARCHAR(500) NOT NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SystemEvent_type_createdAt_idx`(`type`, `createdAt`),
    INDEX `SystemEvent_eventKey_createdAt_idx`(`eventKey`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RefreshToken` ADD CONSTRAINT `RefreshToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AllowedSymbol` ADD CONSTRAINT `AllowedSymbol_strategyId_fkey` FOREIGN KEY (`strategyId`) REFERENCES `Strategy`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TradingSignal` ADD CONSTRAINT `TradingSignal_strategyId_fkey` FOREIGN KEY (`strategyId`) REFERENCES `Strategy`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_signalId_fkey` FOREIGN KEY (`signalId`) REFERENCES `TradingSignal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_strategyId_fkey` FOREIGN KEY (`strategyId`) REFERENCES `Strategy`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStatusHistory` ADD CONSTRAINT `OrderStatusHistory_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Execution` ADD CONSTRAINT `Execution_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RiskRejection` ADD CONSTRAINT `RiskRejection_signalId_fkey` FOREIGN KEY (`signalId`) REFERENCES `TradingSignal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
