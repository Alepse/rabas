CREATE DATABASE  IF NOT EXISTS `rabas` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `rabas`;
-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: rabas
-- ------------------------------------------------------
-- Server version	8.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `booking_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `business_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `customerName` varchar(255) DEFAULT NULL,
  `productName` varchar(255) DEFAULT NULL,
  `numberOfGuests` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `dateIn` datetime DEFAULT NULL,
  `dateOut` datetime DEFAULT NULL,
  `specialRequests` varchar(255) DEFAULT NULL,
  `originalPrice` varchar(255) DEFAULT NULL,
  `discount` varchar(255) DEFAULT NULL,
  `discountedPrice` varchar(255) DEFAULT NULL,
  `status` tinyint DEFAULT '0',
  PRIMARY KEY (`booking_id`)
) ENGINE=InnoDB AUTO_INCREMENT=116 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (108,28,1,187,'Jestoni Vargas','Luxury Mountain Cabin','2','vargasjestoni23@gmail.com','0987654321','Cabins','2024-12-11 00:00:00','2024-12-12 00:00:00','','500','0','500',1),(109,28,1,178,'Jestoni Vargas','Hiking Adventure','2','vargasjestoni23@gmail.com','09468570936','Hiking','2024-12-18 10:00:00',NULL,'','1500','0','1500',0),(110,28,1,189,'Jestoni Vargas','Mountain View Dining','2','vargasjestoni23@gmail.com','0987654321','Fine Dining','2024-12-19 18:00:00',NULL,'','1000','0','1000',1),(111,45,1,190,'Jestoni Vargas','Coastal Seafood Feast','2','vargasjestoni23@gmail.com','0987654321','Buffet','2024-12-19 18:00:00',NULL,'','1500','12','1320',2),(112,45,1,187,'Kreyziii Blueee','Luxury Mountain Cabin','2','kreyziblue@gmail.com','0987654321','Cabins','2024-12-21 00:00:00','2024-12-22 00:00:00','','500','0','500',1),(113,1,31,195,'Jestoni Vargas','Mountain Adventure','2','vargasjestoni23@gmail.com','09468570936','Hiking, Camping','2024-12-19 10:00:00',NULL,'','1200','0','1200',0),(114,1,1,187,'Jes Vargas','Luxury Mountain Cabin','2','vargasjestoni23@gmail.com','9468570999','Cabins','2024-12-09 00:00:00','2024-12-11 00:00:00','','500','0','500',1),(115,47,1,186,'Jestoni Vargas','Snorkeling Tour','4','jestoniuno.vargas@bicol-u.edu.ph','0987654321','Water Sports','2024-12-19 10:00:00',NULL,'','1200','19','972',0);
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `business_applications`
--

DROP TABLE IF EXISTS `business_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_applications` (
  `businessApplication_id` int NOT NULL AUTO_INCREMENT,
  `application_id` int NOT NULL,
  `user_id` int NOT NULL,
  `firstName` varchar(45) NOT NULL,
  `lastName` varchar(45) NOT NULL,
  `businessName` varchar(255) NOT NULL,
  `businessTerritory` varchar(255) NOT NULL,
  `certNumber` varchar(255) NOT NULL,
  `businessScope` varchar(255) NOT NULL,
  `businessType` varchar(45) NOT NULL,
  `category` json NOT NULL,
  `completeAddress` varchar(45) NOT NULL,
  `pin_location` json DEFAULT NULL,
  `status` tinyint DEFAULT '0',
  `application_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`businessApplication_id`),
  UNIQUE KEY `application_id_UNIQUE` (`application_id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business_applications`
--

LOCK TABLES `business_applications` WRITE;
/*!40000 ALTER TABLE `business_applications` DISABLE KEYS */;
INSERT INTO `business_applications` VALUES (8,336886,1,'Jestoni','Vargas','tang tang','adkf','askdfj','Camalig','food','[\"hotel\", \"inn\"]','Camalig, Albay','{\"latitude\": 13.002922323322425, \"longitude\": 124.05075073242188}',1,'2024-10-20 17:08:09'),(12,682510,28,'Yuu','Astro','Di-ret-so','Venus','132048','Universe 7','accommodation','[\"hotel\", \"inn\"]','Venus','{\"latitude\": 13.002922323322425, \"longitude\": 124.05075073242188}',1,'2024-11-14 17:40:13'),(13,981325,32,'Kreyziiii','Blueee','Asika-su','Planetang di makita','10294141','Mundong ibabaw','attraction','[\"adventure\"]','Kahit saan','{\"latitude\": 13.002922323322425, \"longitude\": 124.05075073242188}',1,'2024-11-15 01:45:36'),(15,640679,33,'sample','sample','sample','sample','sample','sample','shop','[\"souvenir_shop\"]','sample','{\"latitude\": 13.002922323322425, \"longitude\": 124.05075073242188}',-1,'2024-11-15 01:50:16'),(21,858771,45,'Kreyziiii','Blueee','Pinili','Planet Earth','1203172412','Earth','shop','[\"souvenir_shop\"]','Castilla','{\"latitude\": 12.95489555183957, \"longitude\": 123.87382508022712}',1,'2024-11-16 12:34:02'),(22,118528,46,'Dante','Vargas','Tanaw','Castilla','124122131','Castilla','attraction','[\"adventure\", \"relaxation\"]','Castilla','{\"latitude\": 12.944069665457144, \"longitude\": 123.84805297013374}',0,'2024-11-20 01:34:54'),(24,400456,47,'asda','dsf','sff','fsd','dsd','dfgsd','attraction','[\"relaxation\", \"asdasdas\"]','Albay','{\"latitude\": 12.953381785933615, \"longitude\": 123.87505531311037}',1,'2024-11-21 15:17:42');
/*!40000 ALTER TABLE `business_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `business_card`
--

DROP TABLE IF EXISTS `business_card`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_card` (
  `businessCardId` int NOT NULL AUTO_INCREMENT,
  `cardImage` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `description` longtext NOT NULL,
  `priceRange` varchar(255) NOT NULL,
  PRIMARY KEY (`businessCardId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business_card`
--

LOCK TABLES `business_card` WRITE;
/*!40000 ALTER TABLE `business_card` DISABLE KEYS */;
/*!40000 ALTER TABLE `business_card` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `business_cover_photo`
--

DROP TABLE IF EXISTS `business_cover_photo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_cover_photo` (
  `bcp_id` int NOT NULL AUTO_INCREMENT,
  `business_id` int NOT NULL,
  `coverPhoto` varchar(255) NOT NULL,
  PRIMARY KEY (`bcp_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business_cover_photo`
--

LOCK TABLES `business_cover_photo` WRITE;
/*!40000 ALTER TABLE `business_cover_photo` DISABLE KEYS */;
/*!40000 ALTER TABLE `business_cover_photo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `business_ratings`
--

DROP TABLE IF EXISTS `business_ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_ratings` (
  `ratings_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `business_id` int DEFAULT NULL,
  `ratings` varchar(255) DEFAULT NULL,
  `comment` longtext CHARACTER SET armscii8 COLLATE armscii8_general_ci,
  PRIMARY KEY (`ratings_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business_ratings`
--

LOCK TABLES `business_ratings` WRITE;
/*!40000 ALTER TABLE `business_ratings` DISABLE KEYS */;
INSERT INTO `business_ratings` VALUES (1,33,1,'5',NULL),(2,34,1,'4',NULL),(3,29,1,'5',NULL),(4,33,31,'5',NULL),(5,34,33,'5',NULL),(6,45,27,'5',NULL);
/*!40000 ALTER TABLE `business_ratings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `businesses`
--

DROP TABLE IF EXISTS `businesses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `businesses` (
  `business_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `application_id` int DEFAULT NULL,
  `businessName` varchar(255) DEFAULT NULL,
  `certNumber` varchar(255) DEFAULT NULL,
  `businessType` varchar(255) DEFAULT NULL,
  `category` json DEFAULT NULL,
  `businessLogo` varchar(255) DEFAULT NULL,
  `businessCard` json DEFAULT NULL,
  `heroImages` json DEFAULT NULL,
  `aboutUs` text,
  `facilities` json DEFAULT NULL,
  `policies` json DEFAULT NULL,
  `contactInfo` json DEFAULT NULL,
  `openingHours` json DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `completeAddress` varchar(255) DEFAULT NULL,
  `pin_location` json DEFAULT NULL,
  `dateOrigin` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`business_id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `businesses`
--

LOCK TABLES `businesses` WRITE;
/*!40000 ALTER TABLE `businesses` DISABLE KEYS */;
INSERT INTO `businesses` VALUES (1,1,336886,'Shabyuuu',NULL,'restaurant','[\"cafe\"]','uploads\\businessLogo-1729170878261.png','{\"category\": \"cafe\", \"location\": \"Sorsogon sa tapat lang\", \"cardImage\": \"uploads\\\\businessCardImage-1734591201691.jpg\", \"priceRange\": \"100 - 5000\", \"description\": \"A cozy cafe with a great ambiance.\"}',NULL,'Good shit na mga inumin!','[{\"icon\": \"Wi-Fi\", \"name\": \"WIFI\", \"description\": \"\"}, {\"icon\": \"Check\", \"name\": \"Parking Area\", \"description\": \"\"}]','[{\"items\": [\"No cancellation\", \"item 2\"], \"title\": \"Reservation\"}]','[{\"id\": 1729178938412, \"icon\": \"Email\", \"label\": \"shabyuuu@gmail.com\", \"value\": \"\"}]','[{\"day\": \"Monday\", \"open\": \"08:00\", \"close\": \"17:00\"}, {\"day\": \"Tuesday\", \"open\": \"08:00\", \"close\": \"17:00\"}, {\"day\": \"Wednesday\", \"open\": \"08:00\", \"close\": \"17:00\"}, {\"day\": \"Thursday\", \"open\": \"08:00\", \"close\": \"18:00\"}, {\"day\": \"Friday\", \"open\": \"08:00\", \"close\": \"18:00\"}, {\"day\": \"Saturday\", \"open\": \"10:00\", \"close\": \"15:00\"}, {\"day\": \"Sunday\", \"open\": \"10:00\", \"close\": \"15:00\"}]','Sta. Magdalena','Sta. Magdalena','{\"latitude\": 12.75489555183957, \"longitude\": 123.87382508022712}','2024-01-19 20:13:02'),(27,28,682510,'Di-ret-so',NULL,'accommodation','[\"hotel\", \"inn\", \"adventure\"]','uploads\\businessLogo-1731734673684.avif','{\"category\": [\"hotel\", \"inn\"], \"location\": \"Venus\", \"cardImage\": \"uploads\\\\businessCardImage-1731735230514.avif\", \"priceRange\": \"1000-20000\", \"description\": \"Kung diretso, diretso sana\"}',NULL,'Masain ka pa man?',NULL,NULL,NULL,NULL,'Sta. Magdalena','Sta. Magdalena',NULL,'2024-02-19 20:13:02'),(30,45,858771,'Pinili',NULL,'shop','[\"souvenir shop\"]','uploads\\businessLogo-1731731956705.jpg','{\"category\": [\"souvenir_shop\"], \"location\": \"Castilla\", \"cardImage\": \"uploads\\\\businessCardImage-1731732053935.jpg\", \"priceRange\": \"70 - 1000\", \"description\": \"Mga pinili\"}',NULL,'Pipiliin ka palagi, kaya bili na','[{\"icon\": \"Wi-Fi\", \"name\": \"WIFI\", \"description\": \"\"}, {\"icon\": null, \"name\": \"PARKING\", \"description\": \"\"}, {\"icon\": null, \"name\": \"LIVE MUSIC\", \"description\": \"\"}]',NULL,'[{\"id\": 1732278097056, \"icon\": \"Phone\", \"label\": \"09235674892\", \"value\": \"\"}]',NULL,'Sta. Magdalena','Sta. Magdalena','{\"latitude\": 12.95489555183957, \"longitude\": 123.87382508022712}','2024-07-19 20:13:02'),(31,32,981325,'Asika-su',NULL,'attraction','[\"adventure\"]','uploads\\businessLogo-1731733539189.png','{\"category\": [\"adventure\"], \"location\": \"Kahit saan\", \"cardImage\": \"uploads\\\\businessCardImage-1731934470224.jpg\", \"priceRange\": \"1000 - 8000\", \"description\": \"Best attraction\"}',NULL,'Pagparaluhayluhay, manaaaaa na bayaaaa',NULL,NULL,NULL,NULL,'Sta. Magdalena','Sta. Magdalena','{\"latitude\": 13.002922323322425, \"longitude\": 124.05075073242188}','2024-10-19 20:13:02'),(32,46,118528,'Tanaw',NULL,'attraction','[\"adventure\", \"relaxation\"]','uploads\\businessLogo-1732068525839.png','{\"category\": [\"adventure\", \"relaxation\"], \"location\": \"Castilla\", \"cardImage\": \"\", \"priceRange\": \"\", \"description\": \"\"}',NULL,NULL,'[{\"icon\": \"Wi-Fi\", \"name\": \"Wifi\", \"description\": \"\"}]',NULL,NULL,NULL,'Sta. Magdalena','Sta. Magdalena','{\"latitude\": 12.944069665457144, \"longitude\": 123.84805297013374}','2024-08-19 20:13:02'),(42,47,400456,'sff','dsd','attraction','[\"relaxation\", \"asdasdas\"]','uploads\\businessLogo-1734583133157.png','{\"category\": [\"relaxation\", \"asdasdas\"], \"location\": \"Donsol\", \"cardImage\": \"uploads\\\\businessCardImage-1734582104865.jpg\", \"priceRange\": \"\", \"description\": \"Ahh ehh ihhh ohh uhh\"}',NULL,NULL,'[{\"icon\": null, \"name\": \"WIFI\", \"items\": [{\"icon\": null, \"name\": \"WIFI 1\"}]}]',NULL,NULL,NULL,'dfgsd','Albay','{\"latitude\": 12.953381785933615, \"longitude\": 123.87505531311037}','2024-06-19 20:13:02');
/*!40000 ALTER TABLE `businesses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deals`
--

DROP TABLE IF EXISTS `deals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deals` (
  `deal_id` int NOT NULL AUTO_INCREMENT,
  `category` varchar(255) NOT NULL,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `dealName` varchar(255) DEFAULT 'Unknown',
  `discount` varchar(255) DEFAULT NULL,
  `expirationDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `dateCreated` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`deal_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deals`
--

LOCK TABLES `deals` WRITE;
/*!40000 ALTER TABLE `deals` DISABLE KEYS */;
INSERT INTO `deals` VALUES (16,'activity',1,186,'Unknown','19','2024-11-21 00:00:00','2024-11-10 22:39:18'),(17,'accommodation',1,188,'Unknown','25','2024-11-13 00:00:00','2024-11-11 01:07:25'),(18,'restaurant',1,190,'Unknown','12','2024-11-12 00:00:00','2024-11-11 01:57:18');
/*!40000 ALTER TABLE `deals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `liked_pages`
--

DROP TABLE IF EXISTS `liked_pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `liked_pages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `business_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `liked_pages`
--

LOCK TABLES `liked_pages` WRITE;
/*!40000 ALTER TABLE `liked_pages` DISABLE KEYS */;
INSERT INTO `liked_pages` VALUES (21,1,32),(34,32,32),(50,27,32),(53,32,1),(54,1,1),(55,32,29),(57,42,47),(58,31,1),(59,42,1),(60,31,47),(62,30,1),(63,1,47);
/*!40000 ALTER TABLE `liked_pages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `locations` (
  `location_id` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`location_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int NOT NULL,
  `sender_account` varchar(255) NOT NULL,
  `receiver_id` int NOT NULL,
  `receiver_account` varchar(255) NOT NULL,
  `text` text,
  `time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `formType` varchar(255) DEFAULT NULL,
  `form_details` json DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=151 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (114,28,'user',1,'business','You have successfully reserved: Luxury Mountain Cabin for ₱500.00.','2024-12-07 17:19:41','accommodationBooking','{\"email\": \"vargasjestoni23@gmail.com\", \"phone\": \"0987654321\", \"amount\": \"500.00\", \"booking_id\": 108, \"productName\": \"Luxury Mountain Cabin\", \"numberOfGuests\": \"2\", \"checkInOutDates\": {\"end\": {\"day\": 12, \"era\": \"AD\", \"year\": 2024, \"month\": 12, \"calendar\": {\"identifier\": \"gregory\"}}, \"start\": {\"day\": 11, \"era\": \"AD\", \"year\": 2024, \"month\": 12, \"calendar\": {\"identifier\": \"gregory\"}}}, \"specialRequests\": \"\"}',NULL),(121,28,'user',1,'business','You have successfully reserved: Hiking Adventure for ₱1500.00.','2024-12-07 17:40:52','activityBooking','{\"email\": \"vargasjestoni23@gmail.com\", \"phone\": \"09468570936\", \"amount\": \"1500.00\", \"visitDate\": {\"day\": 18, \"era\": \"AD\", \"year\": 2024, \"month\": 12, \"calendar\": {\"identifier\": \"gregory\"}}, \"booking_id\": 109, \"productName\": \"Hiking Adventure\", \"activityTime\": \"10:00\", \"numberOfGuests\": \"2\", \"specialRequests\": \"\"}',NULL),(123,28,'user',1,'business','You have successfully reserved: Mountain View Dining for ₱1000.00.','2024-12-07 17:41:50','tableReservation','{\"email\": \"vargasjestoni23@gmail.com\", \"phone\": \"0987654321\", \"amount\": \"1000.00\", \"booking_id\": 110, \"productName\": \"Mountain View Dining\", \"numberOfGuests\": \"2\", \"reservationDate\": {\"day\": 19, \"era\": \"AD\", \"year\": 2024, \"month\": 12, \"calendar\": {\"identifier\": \"gregory\"}}, \"reservationTime\": \"18:00\", \"specialRequests\": \"\"}',NULL),(135,1,'business',28,'user','Booking for Luxury Mountain Cabin has been accepted.','2024-12-07 18:13:12','bookingAccepted','{\"bookingId\": 108}',NULL),(136,45,'user',1,'business','You have successfully reserved: Coastal Seafood Feast for ₱1320.00.','2024-12-07 20:05:41','tableReservation','{\"email\": \"vargasjestoni23@gmail.com\", \"phone\": \"0987654321\", \"amount\": \"1320.00\", \"booking_id\": 111, \"productName\": \"Coastal Seafood Feast\", \"numberOfGuests\": \"2\", \"reservationDate\": {\"day\": 19, \"era\": \"AD\", \"year\": 2024, \"month\": 12, \"calendar\": {\"identifier\": \"gregory\"}}, \"reservationTime\": \"18:00\", \"specialRequests\": \"\"}',NULL),(137,45,'user',1,'business','You have successfully reserved: Luxury Mountain Cabin for ₱500.00.','2024-12-07 20:06:38','accommodationBooking','{\"email\": \"kreyziblue@gmail.com\", \"phone\": \"0987654321\", \"amount\": \"500.00\", \"booking_id\": 112, \"productName\": \"Luxury Mountain Cabin\", \"numberOfGuests\": \"2\", \"checkInOutDates\": {\"end\": {\"day\": 22, \"era\": \"AD\", \"year\": 2024, \"month\": 12, \"calendar\": {\"identifier\": \"gregory\"}}, \"start\": {\"day\": 21, \"era\": \"AD\", \"year\": 2024, \"month\": 12, \"calendar\": {\"identifier\": \"gregory\"}}}, \"specialRequests\": \"\"}',NULL),(138,45,'user',1,'business','hi','2024-12-08 15:23:50',NULL,NULL,NULL),(139,1,'business',45,'user','Booking for Coastal Seafood Feast has been accepted.','2024-12-08 15:24:16','bookingAccepted','{\"email\": \"vargasjestoni23@gmail.com\", \"phone\": \"0987654321\", \"amount\": \"1320.00\", \"booking_id\": 111, \"productName\": \"Coastal Seafood Feast\", \"numberOfGuests\": \"2\", \"reservationDate\": {\"day\": 19, \"era\": \"AD\", \"year\": 2024, \"month\": 12, \"calendar\": {\"identifier\": \"gregory\"}}, \"reservationTime\": \"18:00\", \"specialRequests\": \"\"}',NULL),(140,1,'business',45,'user','Booking for Luxury Mountain Cabin has been accepted.','2024-12-08 15:24:18','bookingAccepted','{\"email\": \"kreyziblue@gmail.com\", \"phone\": \"0987654321\", \"amount\": \"500.00\", \"booking_id\": 112, \"productName\": \"Luxury Mountain Cabin\", \"numberOfGuests\": \"2\", \"checkInOutDates\": {\"end\": {\"day\": 22, \"era\": \"AD\", \"year\": 2024, \"month\": 12, \"calendar\": {\"identifier\": \"gregory\"}}, \"start\": {\"day\": 21, \"era\": \"AD\", \"year\": 2024, \"month\": 12, \"calendar\": {\"identifier\": \"gregory\"}}}, \"specialRequests\": \"\"}',NULL),(141,1,'business',28,'user','Booking for Mountain View Dining has been accepted.','2024-12-10 01:20:46','bookingAccepted','{\"bookingId\": 110}',NULL),(142,28,'user',32,'business','ano?','2024-12-10 01:24:46',NULL,NULL,NULL),(143,28,'user',28,'business','hello po','2024-12-10 01:25:31',NULL,NULL,NULL),(144,1,'user',32,'business','You have successfully reserved: Mountain Adventure for ₱1200.00.','2024-12-11 01:15:40','activityBooking','{\"email\": \"vargasjestoni23@gmail.com\", \"phone\": \"09468570936\", \"amount\": \"1200.00\", \"visitDate\": {\"day\": 19, \"era\": \"AD\", \"year\": 2024, \"month\": 12, \"calendar\": {\"identifier\": \"gregory\"}}, \"booking_id\": 113, \"productName\": \"Mountain Adventure\", \"activityTime\": \"10:00\", \"numberOfGuests\": \"2\", \"specialRequests\": \"\"}',NULL),(145,1,'user',1,'business','You have successfully reserved: Luxury Mountain Cabin for ₱500.00.','2024-12-11 21:35:35','accommodationBooking','{\"email\": \"vargasjestoni23@gmail.com\", \"phone\": \"9468570999\", \"amount\": \"500.00\", \"booking_id\": 114, \"productName\": \"Luxury Mountain Cabin\", \"numberOfGuests\": \"2\", \"checkInOutDates\": {\"end\": {\"day\": 11, \"era\": \"AD\", \"year\": 2024, \"month\": 12, \"calendar\": {\"identifier\": \"gregory\"}}, \"start\": {\"day\": 9, \"era\": \"AD\", \"year\": 2024, \"month\": 12, \"calendar\": {\"identifier\": \"gregory\"}}}, \"specialRequests\": \"\"}',NULL),(146,1,'user',32,'business','hiiiiiiiiiiiii','2024-12-12 07:03:08',NULL,NULL,NULL),(147,47,'user',1,'business','You have successfully reserved: Snorkeling Tour for ₱972.00.','2024-12-12 07:49:18','activityBooking','{\"email\": \"jestoniuno.vargas@bicol-u.edu.ph\", \"phone\": \"0987654321\", \"amount\": \"972.00\", \"visitDate\": {\"day\": 19, \"era\": \"AD\", \"year\": 2024, \"month\": 12, \"calendar\": {\"identifier\": \"gregory\"}}, \"booking_id\": 115, \"productName\": \"Snorkeling Tour\", \"activityTime\": \"10:00\", \"numberOfGuests\": \"4\", \"specialRequests\": \"\"}',NULL),(148,1,'user',32,'business','adasdas','2024-12-12 07:51:11',NULL,NULL,NULL),(149,1,'business',47,'user','abu','2024-12-12 07:54:47',NULL,NULL,NULL),(150,1,'business',1,'user','Booking for Luxury Mountain Cabin has been accepted.','2024-12-13 13:00:02','bookingAccepted','{\"email\": \"vargasjestoni23@gmail.com\", \"phone\": \"9468570999\", \"amount\": \"500.00\", \"booking_id\": 114, \"productName\": \"Luxury Mountain Cabin\", \"numberOfGuests\": \"2\", \"checkInOutDates\": {\"end\": {\"day\": 11, \"era\": \"AD\", \"year\": 2024, \"month\": 12, \"calendar\": {\"identifier\": \"gregory\"}}, \"start\": {\"day\": 9, \"era\": \"AD\", \"year\": 2024, \"month\": 12, \"calendar\": {\"identifier\": \"gregory\"}}}, \"specialRequests\": \"\"}',NULL);
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_ratings`
--

DROP TABLE IF EXISTS `product_ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_ratings` (
  `ratings_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `ratings` varchar(255) DEFAULT NULL,
  `comment` longtext,
  PRIMARY KEY (`ratings_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_ratings`
--

LOCK TABLES `product_ratings` WRITE;
/*!40000 ALTER TABLE `product_ratings` DISABLE KEYS */;
INSERT INTO `product_ratings` VALUES (1,1,194,'5',''),(2,32,194,'4','okay naman'),(3,45,197,'5','goods lang'),(4,45,197,'3','ang galing'),(5,45,196,'5','haha'),(6,45,196,'4','like it'),(7,45,199,'5','aliwwwwwwwwwww'),(8,47,190,'4','pwede na'),(9,1,178,'5','Astig'),(10,47,186,'5','maganda siya');
/*!40000 ALTER TABLE `product_ratings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `business_id` int NOT NULL,
  `product_category` varchar(255) NOT NULL,
  `user_id` int NOT NULL,
  `type` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` longtext,
  `price` varchar(255) DEFAULT NULL,
  `pricing_unit` varchar(255) DEFAULT NULL,
  `booking_operation` tinyint DEFAULT '0',
  `inclusions` json DEFAULT NULL,
  `termsAndConditions` json DEFAULT NULL,
  `images` json DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=201 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (178,1,'activity',1,'Hiking','Hiking Adventure','Explore scenic mountain trails. Guide and equipment included.','1500','per head',1,'[]','[]','[{\"id\": \"477d5d52-02b3-4e8a-a065-01939f91d4fe\", \"path\": \"uploads\\\\productImage-1731256162262.jpg\", \"title\": \"img1\"}, {\"id\": \"c5e59705-9915-4bf4-9109-c6c8a0cb7dd7\", \"path\": \"uploads\\\\productImage-1732415629800.jpg\", \"title\": \"img2\"}]','2024-11-14 09:06:39'),(186,1,'activity',1,'Water Sports','Snorkeling Tour','Discover the underwater world with a guided snorkeling tour.','1200','per head',1,'[]','[]','[{\"id\": \"639de385-50ec-465a-9a4d-cbca8c291311\", \"path\": \"uploads\\\\productImage-1731256955712.avif\", \"title\": \"image 2\"}]','2024-11-14 09:06:39'),(187,1,'accommodation',1,'Cabins','Luxury Mountain Cabin','Stay in a cozy cabin with scenic views and modern amenities.','500','per head',1,'[{\"id\": 1731923790146, \"item\": \"WIFI\"}, {\"id\": 1731923801155, \"item\": \"BREAKFAST\"}, {\"id\": 1731923805574, \"item\": \"TV\"}]','[]','[{\"id\": \"00743228-7dac-46e0-91d4-25ec22f8ad03\", \"path\": \"uploads\\\\productImage-1731150579447.png\", \"title\": \"Image 1\"}, {\"id\": \"8f90c8b4-af9d-4f00-9430-a9bfc41688ce\", \"path\": \"uploads\\\\productImage-1731150579450.png\", \"title\": \"Image 2\"}]','2024-11-14 09:06:39'),(188,1,'accommodation',1,'Resorts','Beachfront Resort','Relax in a luxury resort right on the beach.','8000','per head',1,'[{\"id\": 1731923812578, \"item\": \"WIFI\"}, {\"id\": 1731923814996, \"item\": \"TV\"}]','[]','[{\"id\": \"376c2855-d444-440a-8a5d-9da85427ac29\", \"path\": \"uploads\\\\productImage-1731150592181.png\", \"title\": \"\"}]','2024-11-14 09:06:39'),(189,1,'restaurant',1,'Fine Dining','Mountain View Dining','Experience local cuisine with a view of the mountains.','1000','starting price',1,'[]','[]','[{\"id\": \"7c4d806c-2481-46fd-b624-9974e99efe9f\", \"path\": \"uploads\\\\productImage-1731150630441.png\", \"title\": \"Image 1\"}]','2024-11-14 09:06:39'),(190,1,'restaurant',1,'Buffet','Coastal Seafood Feast','Indulge in fresh seafood dishes by the shore.','1500','starting price',1,'[{\"id\": 1732149190139, \"item\": \"Parking\"}]','[]','[{\"id\": \"471baf4f-0fad-4ab7-9e52-6d1495f9446e\", \"path\": \"uploads\\\\productImage-1731150646924.png\", \"title\": \"Image 1\"}]','2024-11-14 09:06:39'),(191,1,'shop',1,'Local Crafts','Local Handicrafts','Shop unique handmade items from local artisans.','500','per piece',0,'[]','[]','[{\"id\": \"48a9649a-20fe-4672-a3e9-5cf7b0856146\", \"path\": \"uploads\\\\productImage-1731150658271.png\", \"title\": \"Item 1\"}]','2024-11-14 09:06:39'),(192,1,'shop',1,'Souvenirs','Souvenir Shop','Get your souvenirs and take home memories of the trip.','700','per piece',0,'[]','[]','[{\"id\": \"1e245baa-f939-4583-ba31-75ce569cc0ee\", \"path\": \"uploads\\\\productImage-1731150669857.png\", \"title\": \"Item 1\"}]','2024-11-14 09:06:39'),(194,31,'activity',32,'Camping','Camping Retreat','Spend the night under the stars.','800','per head',1,'[{\"id\": 1731934336133, \"item\": \"Basic tools\"}]','[]','[{\"id\": \"fcdba3cb-5508-419e-a343-76564b07238b\", \"path\": \"uploads\\\\productImage-1731737511159.webp\", \"title\": \"Image 1\"}]','2024-11-16 14:11:51'),(195,31,'activity',32,'Hiking, Camping','Mountain Adventure','Hike through the mountains and enjoy nature.','1200','per head',1,'[]','[]','[{\"id\": \"0f1c07cd-3e21-4be7-acf3-cf3e62566240\", \"path\": \"uploads\\\\productImage-1731737597846.webp\", \"title\": \"Image 1\"}]','2024-11-16 14:13:17'),(196,27,'activity',28,'Adventure','Sample 1','Basta adventure to with thrill','1200','per head',1,'[{\"id\": 1732142626445, \"item\": \"Snacks\"}, {\"id\": 1732145689765, \"item\": \"Parking\"}]','[]','[{\"id\": \"26f0c2d5-7bf8-4f51-bd37-02f93a2aa6d0\", \"path\": \"uploads\\\\productImage-1732142638392.jpg\", \"title\": \"Image 1\"}]','2024-11-21 06:43:58'),(197,32,'activity',46,'Hiking, Camping','Mountain Adventure','Hike through the mountains and enjoy nature.','1200','per head',1,'[{\"id\": 1732145904117, \"item\": \"Parking\"}, {\"id\": 1732146050957, \"item\": \"Restroom\"}]','[]','[]','2024-11-21 07:39:01'),(198,32,'activity',46,'Swimming, Snorkeling','Snorkeling Expedition','Explore underwater life.','3500','per pax',1,'[{\"id\": 1732146336654, \"item\": \"Guides\"}]','[]','[]','2024-11-21 07:45:39'),(199,30,'shop',45,'Souvenir','Cards','Funny cards','120','per pack',0,'[]','[]','[{\"id\": \"c7f20ed4-054b-407b-bb46-360b6c8b3fc2\", \"path\": \"uploads\\\\productImage-1732150455576.jpg\", \"title\": \"card 1\"}]','2024-11-21 08:54:15'),(200,33,'restaurant',47,'cafe','Hot coffee','Kapeng matapang na kaya kang ipaglaban','70','per cup',1,'[]','[]','[{\"id\": \"111515b9-f5b9-423a-947f-18ab8e12836a\", \"path\": \"uploads\\\\productImage-1732945928052.jpg\", \"title\": \"\"}]','2024-11-30 13:52:08');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `report_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `typeOfUser` varchar(255) DEFAULT NULL,
  `reports` varchar(255) DEFAULT NULL,
  `reportType` varchar(255) DEFAULT NULL,
  `description` longtext,
  `status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`report_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('1I6aAy70HUGsxj2jDYVrcoT5X2aBjuF_',1734697883,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2024-12-20T04:19:52.023Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":47},\"user\":{\"user_id\":47,\"name\":\"Jestoni Vargas\",\"business_id\":42}}'),('s6U3xwsCbamuVUUtVoteZY0Of5V2ipuf',1734697595,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2024-12-20T04:51:50.775Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":1},\"user\":{\"user_id\":1,\"name\":\"Jestoni Vargas\",\"business_id\":1}}'),('yPp0Vhv6rU6UpOgBrSQQdcsetVepX3kT',1734648734,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2024-12-19T03:04:55.017Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\"},\"user\":{\"user_id\":1,\"business_id\":1}}');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trips`
--

DROP TABLE IF EXISTS `trips`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trips` (
  `tripId` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `tripName` varchar(255) NOT NULL,
  `imageUrl` varchar(255) DEFAULT 'defaultImageUrl.png',
  `destination` varchar(255) DEFAULT 'Unknown',
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `itinerary` json NOT NULL,
  PRIMARY KEY (`tripId`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trips`
--

LOCK TABLES `trips` WRITE;
/*!40000 ALTER TABLE `trips` DISABLE KEYS */;
INSERT INTO `trips` VALUES (2,28,'asdasda','uploads\\businessLogo-1731733539189.png','Donsol','2024-11-05','2024-11-06','{\"Friday, Nov 8\": [{\"id\": 27, \"name\": \"Di-ret-so\", \"time\": \"13:00\", \"type\": \"accommodation\", \"notes\": \"No additional notes\", \"title\": \"Di-ret-so\", \"imageUrl\": \"uploads\\\\businessLogo-1731734673684.avif\", \"isBooked\": true, \"location\": \"Venus\", \"description\": \"Kung diretso, diretso sana\"}], \"Thursday, Nov 7\": [{\"id\": 31, \"name\": \"Asika-su\", \"time\": \"02:00\", \"type\": \"attraction\", \"notes\": \"No additional notes\", \"title\": \"Asika-su\", \"imageUrl\": \"uploads\\\\businessLogo-1731733539189.png\", \"isBooked\": false, \"location\": \"Donsol\", \"description\": \"Best attraction\"}]}'),(9,47,'trip 1','uploads\\businessLogo-1732068525839.png','Castilla','2024-11-11','2024-11-30','{\"Tuesday, Nov 12\": [{\"id\": 32, \"name\": \"Tanaw\", \"time\": \"01:00\", \"type\": \"attraction\", \"notes\": \"No additional notes\", \"title\": \"Tanaw\", \"imageUrl\": \"uploads\\\\businessLogo-1732068525839.png\", \"isBooked\": true, \"location\": \"Castilla\", \"description\": null, \"pin_location\": {\"latitude\": 12.944069665457144, \"longitude\": 123.84805297013374}}], \"Thursday, Nov 14\": [{\"id\": 30, \"name\": \"Pinili\", \"time\": \"01:00\", \"type\": \"shop\", \"notes\": \"No additional notes\", \"title\": \"Pinili\", \"imageUrl\": \"uploads\\\\businessLogo-1731731956705.jpg\", \"isBooked\": true, \"location\": \"Castilla\", \"description\": \"Mga pinili\", \"pin_location\": {\"latitude\": 12.95489555183957, \"longitude\": 123.87382508022712}}], \"Wednesday, Nov 13\": [{\"id\": 27, \"name\": \"Di-ret-so\", \"time\": \"01:00\", \"type\": \"accommodation\", \"notes\": \"No additional notes\", \"title\": \"Di-ret-so\", \"imageUrl\": \"uploads\\\\businessLogo-1731734673684.avif\", \"isBooked\": true, \"location\": \"Venus\", \"description\": \"Kung diretso, diretso sana\", \"pin_location\": null}]}'),(10,1,'sigeeee','uploads\\businessLogo-1732068525839.png','Castilla','2024-12-09','2024-12-11','{\"Friday, Dec 13\": [], \"Thursday, Dec 12\": [{\"id\": 33, \"name\": \"sff\", \"time\": \"13:00\", \"type\": \"attraction\", \"notes\": \"No additional notes\", \"title\": \"sff\", \"imageUrl\": \"uploads\\\\businessLogo-1732173592143.jpg\", \"isBooked\": true, \"location\": \"Barcelona\", \"description\": null, \"pin_location\": {\"latitude\": 12.953381785933615, \"longitude\": 123.87505531311037}}], \"Wednesday, Dec 11\": [{\"id\": 32, \"name\": \"Tanaw\", \"time\": \"13:00\", \"type\": \"attraction\", \"notes\": \"No additional notes\", \"title\": \"Tanaw\", \"imageUrl\": \"uploads\\\\businessLogo-1732068525839.png\", \"isBooked\": true, \"location\": \"Castilla\", \"description\": null, \"pin_location\": {\"latitude\": 12.944069665457144, \"longitude\": 123.84805297013374}}]}'),(11,1,'try daw','uploads\\businessLogo-1731733539189.png','Sta. Magdalena','2024-12-18','2024-12-20','{\"Friday, Dec 20\": [], \"Thursday, Dec 19\": [], \"Wednesday, Dec 18\": [{\"id\": 31, \"name\": \"Asika-su\", \"time\": \"03:00\", \"type\": \"attraction\", \"notes\": \"No additional notes\", \"title\": \"Asika-su\", \"imageUrl\": \"uploads\\\\businessLogo-1731733539189.png\", \"isBooked\": true, \"location\": \"Sta. Magdalena\", \"description\": \"Best attraction\", \"pin_location\": {\"latitude\": 13.002922323322425, \"longitude\": 124.05075073242188}}]}'),(14,47,'sadasds','uploads\\businessLogo-1731733539189.png','Sta. Magdalena','2024-12-08','2024-12-25','{\"Monday, Dec 9\": [{\"id\": 31, \"name\": \"Asika-su\", \"time\": \"02:00\", \"type\": \"attraction\", \"notes\": \"asdasdsad\", \"title\": \"Asika-su\", \"imageUrl\": \"uploads\\\\businessLogo-1731733539189.png\", \"isBooked\": true, \"location\": \"Sta. Magdalena\", \"description\": \"Best attraction\", \"pin_location\": {\"latitude\": 13.002922323322425, \"longitude\": 124.05075073242188}}, {\"id\": 32, \"name\": \"Tanaw\", \"time\": \"03:03\", \"type\": \"attraction\", \"notes\": \"qweqweqw\", \"title\": \"Tanaw\", \"imageUrl\": \"uploads\\\\businessLogo-1732068525839.png\", \"isBooked\": true, \"location\": \"Sta. Magdalena\", \"description\": null, \"pin_location\": {\"latitude\": 12.944069665457144, \"longitude\": 123.84805297013374}}], \"Tuesday, Dec 10\": []}');
/*!40000 ALTER TABLE `trips` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `google_id` varchar(255) DEFAULT NULL,
  `username` varchar(45) DEFAULT NULL,
  `Fname` varchar(45) DEFAULT NULL,
  `Lname` varchar(45) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `contact` varchar(11) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `reset_password_token` varchar(255) DEFAULT NULL,
  `reset_password_expires` bigint DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `google_id` (`google_id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,NULL,'jesss','Jestoni','Vargas','P3- Miti, Camalig, Albay','$2a$10$L1WCYfKvDXqAk1YeeFB1eecDd7baGGS8VuQ/kdrTqfcDyn6KFxv5a','vargasjestoni23@gmail.com','0987654321','profilePic-1733954710958.jpg','uploads\\profilePic-1733954710958.jpg',NULL,NULL),(28,NULL,'yuu','Yuu','Astro','Miti, Camalig, Albay','$2b$10$rlD0Z6WxeTQiD1iQD9/LBuuYe0sexaugTuUCcAy2G6eBPxjtY5joi','yuu@gmail.com','09123456789','profilePic-1733054042716.jpg','uploads\\profilePic-1733054042716.jpg',NULL,NULL),(29,NULL,'rabas','rabas','rabas','rabas rabas rabas','$2b$10$UywmDS9Ye8xu6S1n5ZjDt.s98r6p302qhXVCLdph6zeDCW.r1vqrq','rabas@gmail.com','09234857684',NULL,NULL,NULL,NULL),(32,NULL,'kreyziii','Kreyziii','Blueee','Planet 1232','$2a$10$97NVinYUt/f3uo3.B3S5o.LWzap0lNI07My1nJ.M2mP0M4xDOInR.','kreyziii@gmail.com','09123485764',NULL,NULL,NULL,NULL),(33,NULL,'sample','sample','sample','sample','$2a$10$4RcLLYY.Bs8LvgODHGaQweGaGOwHx09M3I2oS/itQSw0eaBIxc79a','sample@gmail.com','sample',NULL,NULL,NULL,NULL),(34,NULL,'sample2','sample2','sample2','sample2','$2a$10$zxAHQf1RxWHYUOi7rgJDe.Q6XFWtsQ0cLU4opGHTWgQpJyHwj7dnq','sample2@gmail.com','sample2',NULL,NULL,NULL,NULL),(45,'116588850404190553614','kreyziblue8129','Kreyzi','Blue',NULL,NULL,'kreyziblue@gmail.com',NULL,'https://lh3.googleusercontent.com/a/ACg8ocLzo0aqw0j8G5Rmjh9iAdMNb3G9QvMMM8J0234ZG_JX3AQ8CcY=s96-c',NULL,NULL,NULL),(46,'102361255804249664651','dantevargas7061','Dante','Vargas',NULL,NULL,'dantelovendino.vargas@gmail.com',NULL,'https://lh3.googleusercontent.com/a/ACg8ocKZpChsNIe6ieyXKV9ziUF36u_eTQEKTxMwJkHbbD7bEHudAg=s96-c',NULL,NULL,NULL),(47,'118033373074304050929','jestonivargas8119','Jestoni','Vargas','Address 1',NULL,'jestoniuno.vargas@bicol-u.edu.ph','0987654321','profilePic-1733989620742.png','uploads\\profilePic-1733989620742.png',NULL,NULL),(48,'112461761354651427165','rabas2162','Rabas',NULL,NULL,NULL,'rabasorsogon@gmail.com',NULL,'https://lh3.googleusercontent.com/a/ACg8ocLwjnCUS7DHzySTUUXeFTGLBa3BPAyFZA8SvLUjNM-ffrjq51k=s96-c',NULL,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-12-19 20:33:51
