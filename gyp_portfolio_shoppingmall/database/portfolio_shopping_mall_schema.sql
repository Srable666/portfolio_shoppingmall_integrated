-- --------------------------------------------------------
-- 호스트:                          **.***.***.***
-- 서버 버전:                        10.11.13-MariaDB-0ubuntu0.24.04.1-log - Ubuntu 24.04
-- 서버 OS:                        debian-linux-gnu
-- HeidiSQL 버전:                  12.6.0.6765
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- portfolio_shopping_mall 데이터베이스 구조 내보내기
CREATE DATABASE IF NOT EXISTS `portfolio_shopping_mall` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `portfolio_shopping_mall`;

-- 테이블 portfolio_shopping_mall.categories 구조 내보내기
CREATE TABLE IF NOT EXISTS `categories` (
  `category_id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `parent_category_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `code` (`code`),
  KEY `FK_CP` (`parent_category_id`),
  CONSTRAINT `FK_CP` FOREIGN KEY (`parent_category_id`) REFERENCES `categories` (`category_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 portfolio_shopping_mall.delivery_histories 구조 내보내기
CREATE TABLE IF NOT EXISTS `delivery_histories` (
  `delivery_history_id` int(11) NOT NULL AUTO_INCREMENT,
  `order_product_id` int(11) NOT NULL,
  `delivery_type` enum('ORDER_OUT','RETURN_IN','EXCHANGE_IN','EXCHANGE_OUT') DEFAULT NULL,
  `invoice_number` varchar(50) DEFAULT NULL,
  `delivery_company` varchar(50) DEFAULT NULL,
  `delivery_status` enum('PREPARING','DELIVERING','DELIVERED','CONFIRMED','CANCELED','RETURN','EXCHANGE') DEFAULT NULL,
  `delivery_start_date` datetime DEFAULT NULL,
  `delivery_complete_date` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`delivery_history_id`) USING BTREE,
  KEY `order_product_id` (`order_product_id`),
  CONSTRAINT `delivery_histories_ibfk_1` FOREIGN KEY (`order_product_id`) REFERENCES `order_products` (`order_product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 portfolio_shopping_mall.inventory_histories 구조 내보내기
CREATE TABLE IF NOT EXISTS `inventory_histories` (
  `inventory_history_id` int(11) NOT NULL AUTO_INCREMENT,
  `product_inventory_id` int(11) DEFAULT NULL,
  `order_product_id` int(11) DEFAULT NULL,
  `status_from` enum('IN_STOCK','OUT_OF_STOCK','DEFECTIVE') DEFAULT NULL,
  `status_to` enum('IN_STOCK','OUT_OF_STOCK','DEFECTIVE') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `note` text DEFAULT NULL,
  PRIMARY KEY (`inventory_history_id`),
  KEY `order_item_id` (`order_product_id`) USING BTREE,
  KEY `product_item_id` (`product_inventory_id`) USING BTREE,
  CONSTRAINT `FK_inventory_histories_order_products` FOREIGN KEY (`order_product_id`) REFERENCES `order_products` (`order_product_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_inventory_histories_product_inventories` FOREIGN KEY (`product_inventory_id`) REFERENCES `product_inventories` (`product_inventory_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=758 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 portfolio_shopping_mall.login_histories 구조 내보내기
CREATE TABLE IF NOT EXISTS `login_histories` (
  `login_history_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `login_datetime` timestamp NOT NULL DEFAULT current_timestamp(),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `device_type` varchar(255) DEFAULT NULL,
  `login_status` enum('SUCCESS','FAILURE') NOT NULL,
  `fail_reason` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`login_history_id`),
  KEY `FK_login_histories_users` (`user_id`),
  CONSTRAINT `FK_login_histories_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=671 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 portfolio_shopping_mall.orders 구조 내보내기
CREATE TABLE IF NOT EXISTS `orders` (
  `order_id` int(11) NOT NULL AUTO_INCREMENT,
  `merchant_uid` varchar(50) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `delivery_fee` int(11) NOT NULL DEFAULT 0,
  `original_total_price` decimal(10,2) NOT NULL,
  `current_total_price` decimal(10,2) NOT NULL,
  `recipient_name` varchar(50) NOT NULL,
  `recipient_phone` text NOT NULL,
  `recipient_postcode` varchar(20) NOT NULL,
  `recipient_address` text NOT NULL,
  `delivery_request` text NOT NULL,
  `payment_method` enum('card','trans','vbank','phone','kakaopay','naverpay','tosspay') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`order_id`),
  KEY `merchant_uid` (`merchant_uid`),
  KEY `orders_ibfk_1` (`user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 portfolio_shopping_mall.order_products 구조 내보내기
CREATE TABLE IF NOT EXISTS `order_products` (
  `order_product_id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `product_item_id` int(11) DEFAULT NULL,
  `original_quantity` int(11) NOT NULL,
  `changed_quantity` int(11) NOT NULL,
  `request_quantity` int(11) DEFAULT 0,
  `price` decimal(10,2) NOT NULL,
  `discount_rate` decimal(10,2) NOT NULL,
  `final_price` decimal(10,2) NOT NULL,
  `size` varchar(50) NOT NULL DEFAULT '',
  `color` varchar(50) NOT NULL DEFAULT '',
  `status` enum('PAYMENT_PENDING','PAYMENT_COMPLETED','PREPARING','DELIVERING','DELIVERED','DELIVERY_CONFIRMED','CANCEL_REQUESTED','CANCELED','RETURN_REQUESTED','RETURNING','RETURNED','EXCHANGE_REQUESTED','EXCHANGE_RETURNING','EXCHANGE_PREPARING','EXCHANGE_DELIVERING','EXCHANGE_DELIVERED') DEFAULT 'PAYMENT_PENDING',
  `request_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `version` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`order_product_id`) USING BTREE,
  KEY `order_items_ibfk_1` (`order_id`),
  KEY `order_products_ibfk_2` (`product_item_id`) USING BTREE,
  CONSTRAINT `FK_order_products_product_items` FOREIGN KEY (`product_item_id`) REFERENCES `product_items` (`product_item_id`) ON UPDATE CASCADE,
  CONSTRAINT `order_products_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 portfolio_shopping_mall.order_product_histories 구조 내보내기
CREATE TABLE IF NOT EXISTS `order_product_histories` (
  `order_product_history_id` int(11) NOT NULL AUTO_INCREMENT,
  `order_product_id` int(11) NOT NULL,
  `request_quantity_record` int(11) DEFAULT NULL,
  `status_from` enum('PAYMENT_PENDING','PAYMENT_COMPLETED','PREPARING','DELIVERING','DELIVERED','DELIVERY_CONFIRMED','CANCEL_REQUESTED','CANCELED','RETURN_REQUESTED','RETURNING','RETURNED','EXCHANGE_REQUESTED','EXCHANGE_RETURNING','EXCHANGE_PREPARING','EXCHANGE_DELIVERING','EXCHANGE_DELIVERED') DEFAULT NULL,
  `status_to` enum('PAYMENT_PENDING','PAYMENT_COMPLETED','PREPARING','DELIVERING','DELIVERED','DELIVERY_CONFIRMED','CANCEL_REQUESTED','CANCELED','RETURN_REQUESTED','RETURNING','RETURNED','EXCHANGE_REQUESTED','EXCHANGE_RETURNING','EXCHANGE_PREPARING','EXCHANGE_DELIVERING','EXCHANGE_DELIVERED') DEFAULT NULL,
  `reason` varchar(500) DEFAULT '',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`order_product_history_id`),
  KEY `order_product_id` (`order_product_id`),
  CONSTRAINT `FK_order_product_histories_order_products` FOREIGN KEY (`order_product_id`) REFERENCES `order_products` (`order_product_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 portfolio_shopping_mall.payment_histories 구조 내보내기
CREATE TABLE IF NOT EXISTS `payment_histories` (
  `payment_history_id` int(11) NOT NULL AUTO_INCREMENT,
  `imp_uid` varchar(100) DEFAULT NULL,
  `merchant_uid` varchar(100) DEFAULT NULL,
  `order_id` int(11) DEFAULT NULL,
  `status` enum('READY','PAID','FAILED','CANCELLED','PARTIAL_CANCELLED') DEFAULT NULL,
  `payment_method` enum('card','trans','vbank','phone','kakaopay','naverpay','tosspay') DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `customer_name` varchar(50) DEFAULT NULL,
  `customer_email` varchar(50) DEFAULT NULL,
  `customer_phone` text DEFAULT NULL,
  `requested_at` datetime DEFAULT NULL,
  `payment_data` text DEFAULT NULL,
  `error_code` varchar(50) DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`payment_history_id`),
  KEY `merchant_uid` (`merchant_uid`),
  KEY `imp_uid` (`imp_uid`) USING BTREE,
  KEY `FK_payment_histories_orders` (`order_id`),
  CONSTRAINT `FK_payment_histories_orders` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON UPDATE CASCADE,
  CONSTRAINT `FK_payment_histories_orders_2` FOREIGN KEY (`merchant_uid`) REFERENCES `orders` (`merchant_uid`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 portfolio_shopping_mall.products 구조 내보내기
CREATE TABLE IF NOT EXISTS `products` (
  `product_id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(50) NOT NULL,
  `base_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount_rate` decimal(10,2) NOT NULL DEFAULT 0.00,
  `final_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `category_id` int(11) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `view_count` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`product_id`),
  KEY `FK_PC` (`category_id`),
  KEY `code` (`code`),
  CONSTRAINT `FK_PC` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=132 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 portfolio_shopping_mall.product_inventories 구조 내보내기
CREATE TABLE IF NOT EXISTS `product_inventories` (
  `product_inventory_id` int(11) NOT NULL AUTO_INCREMENT,
  `product_item_id` int(11) NOT NULL,
  `barcode` varchar(50) NOT NULL,
  `status` enum('IN_STOCK','OUT_OF_STOCK','DEFECTIVE') NOT NULL,
  `order_product_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`product_inventory_id`),
  UNIQUE KEY `barcode` (`barcode`),
  KEY `product_item_id` (`product_item_id`),
  KEY `order_product_id` (`order_product_id`),
  CONSTRAINT `FK_product_inventories_order_products` FOREIGN KEY (`order_product_id`) REFERENCES `order_products` (`order_product_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_product_inventories_product_items` FOREIGN KEY (`product_item_id`) REFERENCES `product_items` (`product_item_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=736 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 portfolio_shopping_mall.product_items 구조 내보내기
CREATE TABLE IF NOT EXISTS `product_items` (
  `product_item_id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `stock_quantity` int(11) DEFAULT 0,
  `reserved_quantity` int(11) DEFAULT 0,
  `size` varchar(50) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `sales_count` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` tinyint(4) DEFAULT 1,
  `is_deleted` tinyint(4) DEFAULT 0,
  `version` int(11) DEFAULT 0,
  PRIMARY KEY (`product_item_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `FK_product_items_products` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=243 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 portfolio_shopping_mall.reviews 구조 내보내기
CREATE TABLE IF NOT EXISTS `reviews` (
  `review_id` int(11) NOT NULL AUTO_INCREMENT,
  `order_product_id` int(11) NOT NULL,
  `product_item_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rating` enum('1','2','3','4','5') NOT NULL,
  `comment` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `version` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`review_id`),
  KEY `reviews_ibfk_2` (`user_id`),
  KEY `product_id` (`product_item_id`) USING BTREE,
  KEY `FK_reviews_order_products` (`order_product_id`),
  CONSTRAINT `FK_reviews_order_products` FOREIGN KEY (`order_product_id`) REFERENCES `order_products` (`order_product_id`) ON UPDATE CASCADE,
  CONSTRAINT `FK_reviews_product_items` FOREIGN KEY (`product_item_id`) REFERENCES `product_items` (`product_item_id`) ON UPDATE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 portfolio_shopping_mall.users 구조 내보내기
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` text NOT NULL,
  `postcode` varchar(50) NOT NULL,
  `base_address` varchar(50) NOT NULL,
  `detail_address` varchar(50) NOT NULL,
  `reset_token` varchar(36) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_admin` tinyint(1) NOT NULL DEFAULT 0,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `version` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`user_id`) USING BTREE,
  UNIQUE KEY `email` (`email`),
  KEY `reset_token` (`reset_token`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
