-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Mar 11, 2025 at 12:36 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `Kelseys_Homestay`
--

-- --------------------------------------------------------

--
-- Table structure for table `agent`
--

CREATE TABLE `agent` (
  `Agent_ID` int(11) NOT NULL,
  `Agent_Name` varchar(255) NOT NULL,
  `Agent_Email` varchar(255) NOT NULL,
  `Agent_ContactNum` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `agent`
--

INSERT INTO `agent` (`Agent_ID`, `Agent_Name`, `Agent_Email`, `Agent_ContactNum`) VALUES
(1, 'Rody Duterte', 'rody@duterte.com', '0922345555');

-- --------------------------------------------------------

--
-- Table structure for table `Bills`
--

CREATE TABLE `Bills` (
  `Bills_ID` int(11) NOT NULL,
  `Bills_Name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Booking`
--

CREATE TABLE `Booking` (
  `Booking_ID` int(11) NOT NULL,
  `Booking_DateFrom` date NOT NULL,
  `Booking_DateTo` date NOT NULL,
  `Booking_Pax` int(11) NOT NULL,
  `Booking_Deposit` decimal(10,2) NOT NULL,
  `Unit_ID` int(11) NOT NULL,
  `Customer_ID` int(11) NOT NULL,
  `Agent_ID` int(11) NOT NULL,
  `Booking_Rate` decimal(10,2) NOT NULL,
  `Booking_Payment` varchar(50) NOT NULL,
  `Booking_ExtraPaxFee` decimal(10,2) DEFAULT NULL,
  `Booking_Commission` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Booking_Guest`
--

CREATE TABLE `Booking_Guest` (
  `Booking_ID` int(11) NOT NULL,
  `Customer_ID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Building`
--

CREATE TABLE `Building` (
  `Building_ID` int(11) NOT NULL,
  `Property_ID` int(11) NOT NULL,
  `Building_Tower` varchar(255) NOT NULL,
  `Building_Floor` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Building`
--

INSERT INTO `Building` (`Building_ID`, `Property_ID`, `Building_Tower`, `Building_Floor`) VALUES
(1, 1, 'Valencia', '7'),
(2, 1, 'Valencia', '2'),
(3, 1, 'Valencia', 'Ground'),
(4, 1, 'Valencia', '4'),
(5, 2, 'Tower 1', '7'),
(6, 2, 'Tower 1', '14'),
(7, 2, 'Tower 2', '19'),
(8, 2, 'Tower 1', '19'),
(9, 3, 'Building B', '2'),
(10, 3, 'Building B', '1');

-- --------------------------------------------------------

--
-- Table structure for table `Charges`
--

CREATE TABLE `Charges` (
  `Booking_ID` int(11) NOT NULL,
  `Item_ID` int(11) NOT NULL,
  `Charges_Fee` decimal(10,2) NOT NULL,
  `Charges_Quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Customer`
--

CREATE TABLE `Customer` (
  `Customer_ID` int(11) NOT NULL,
  `Customer_Name` varchar(255) NOT NULL,
  `Customer_Email` varchar(255) NOT NULL,
  `Customer_ContactNum` varchar(20) NOT NULL,
  `Customer_BirthDate` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Customer`
--

INSERT INTO `Customer` (`Customer_ID`, `Customer_Name`, `Customer_Email`, `Customer_ContactNum`, `Customer_BirthDate`) VALUES
(1, 'John Doe', 'john@doe.com', '09159645891', '2002-12-16');

-- --------------------------------------------------------

--
-- Table structure for table `Daily_Expenses`
--

CREATE TABLE `Daily_Expenses` (
  `Daily_ID` int(11) NOT NULL,
  `Daily_Date` date NOT NULL,
  `Unit_ID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Expenses`
--

CREATE TABLE `Expenses` (
  `Bills_ID` int(11) NOT NULL,
  `Daily_ID` int(11) NOT NULL,
  `Exp_TotalCost` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Items`
--

CREATE TABLE `Items` (
  `Item_ID` int(11) NOT NULL,
  `Item_Name` varchar(255) NOT NULL,
  `Item_ChargeFee` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `property`
--

CREATE TABLE `property` (
  `Property_ID` int(11) NOT NULL,
  `Property_Name` varchar(255) NOT NULL,
  `Property_Address` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `property`
--

INSERT INTO `property` (`Property_ID`, `Property_Name`, `Property_Address`) VALUES
(1, 'Magallanes Residences', 'Bolton St, Poblacion District, Davao City'),
(2, 'Avida Towers', 'C. M. Recto, Poblacion District, Davao City'),
(3, 'Centro Spatial', 'Brgy, 39-D Bolton Ext, Poblacion District, Davao City');

-- --------------------------------------------------------

--
-- Table structure for table `Unit`
--

CREATE TABLE `Unit` (
  `Unit_ID` int(11) NOT NULL,
  `Unit_Name` int(11) NOT NULL,
  `Unit_Pax` int(11) NOT NULL,
  `Unit_Price` decimal(10,2) NOT NULL,
  `Unit_ExtraPaxFee` decimal(10,2) DEFAULT NULL,
  `Unit_Size` varchar(50) DEFAULT NULL,
  `Unit_Desc` text DEFAULT NULL,
  `Building_ID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Unit`
--

INSERT INTO `Unit` (`Unit_ID`, `Unit_Name`, `Unit_Pax`, `Unit_Price`, `Unit_ExtraPaxFee`, `Unit_Size`, `Unit_Desc`, `Building_ID`) VALUES
(1, 711, 4, 5000.00, 200.00, '20x30', 'Corner 2BR | 1CR', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `agent`
--
ALTER TABLE `agent`
  ADD PRIMARY KEY (`Agent_ID`),
  ADD UNIQUE KEY `Agent_Email` (`Agent_Email`);

--
-- Indexes for table `Bills`
--
ALTER TABLE `Bills`
  ADD PRIMARY KEY (`Bills_ID`);

--
-- Indexes for table `Booking`
--
ALTER TABLE `Booking`
  ADD PRIMARY KEY (`Booking_ID`),
  ADD KEY `Unit_ID` (`Unit_ID`),
  ADD KEY `Customer_ID` (`Customer_ID`),
  ADD KEY `Agent_ID` (`Agent_ID`);

--
-- Indexes for table `Booking_Guest`
--
ALTER TABLE `Booking_Guest`
  ADD PRIMARY KEY (`Booking_ID`,`Customer_ID`),
  ADD KEY `Customer_ID` (`Customer_ID`);

--
-- Indexes for table `Building`
--
ALTER TABLE `Building`
  ADD PRIMARY KEY (`Building_ID`),
  ADD KEY `Property_ID` (`Property_ID`);

--
-- Indexes for table `Charges`
--
ALTER TABLE `Charges`
  ADD PRIMARY KEY (`Booking_ID`,`Item_ID`),
  ADD KEY `Item_ID` (`Item_ID`);

--
-- Indexes for table `Customer`
--
ALTER TABLE `Customer`
  ADD PRIMARY KEY (`Customer_ID`),
  ADD UNIQUE KEY `Customer_Email` (`Customer_Email`);

--
-- Indexes for table `Daily_Expenses`
--
ALTER TABLE `Daily_Expenses`
  ADD PRIMARY KEY (`Daily_ID`),
  ADD KEY `Unit_ID` (`Unit_ID`);

--
-- Indexes for table `Expenses`
--
ALTER TABLE `Expenses`
  ADD PRIMARY KEY (`Bills_ID`,`Daily_ID`),
  ADD KEY `Daily_ID` (`Daily_ID`);

--
-- Indexes for table `Items`
--
ALTER TABLE `Items`
  ADD PRIMARY KEY (`Item_ID`);

--
-- Indexes for table `property`
--
ALTER TABLE `property`
  ADD PRIMARY KEY (`Property_ID`);

--
-- Indexes for table `Unit`
--
ALTER TABLE `Unit`
  ADD PRIMARY KEY (`Unit_ID`),
  ADD KEY `Building_ID` (`Building_ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `agent`
--
ALTER TABLE `agent`
  MODIFY `Agent_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `Bills`
--
ALTER TABLE `Bills`
  MODIFY `Bills_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Booking`
--
ALTER TABLE `Booking`
  MODIFY `Booking_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Building`
--
ALTER TABLE `Building`
  MODIFY `Building_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `Customer`
--
ALTER TABLE `Customer`
  MODIFY `Customer_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `Daily_Expenses`
--
ALTER TABLE `Daily_Expenses`
  MODIFY `Daily_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Items`
--
ALTER TABLE `Items`
  MODIFY `Item_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `property`
--
ALTER TABLE `property`
  MODIFY `Property_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `Unit`
--
ALTER TABLE `Unit`
  MODIFY `Unit_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Booking`
--
ALTER TABLE `Booking`
  ADD CONSTRAINT `booking_ibfk_1` FOREIGN KEY (`Unit_ID`) REFERENCES `Unit` (`Unit_ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `booking_ibfk_2` FOREIGN KEY (`Customer_ID`) REFERENCES `Customer` (`Customer_ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `booking_ibfk_3` FOREIGN KEY (`Agent_ID`) REFERENCES `Agent` (`Agent_ID`) ON DELETE CASCADE;

--
-- Constraints for table `Booking_Guest`
--
ALTER TABLE `Booking_Guest`
  ADD CONSTRAINT `booking_guest_ibfk_1` FOREIGN KEY (`Booking_ID`) REFERENCES `Booking` (`Booking_ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `booking_guest_ibfk_2` FOREIGN KEY (`Customer_ID`) REFERENCES `Customer` (`Customer_ID`) ON DELETE CASCADE;

--
-- Constraints for table `Building`
--
ALTER TABLE `Building`
  ADD CONSTRAINT `building_ibfk_1` FOREIGN KEY (`Property_ID`) REFERENCES `Property` (`Property_ID`) ON DELETE CASCADE;

--
-- Constraints for table `Charges`
--
ALTER TABLE `Charges`
  ADD CONSTRAINT `charges_ibfk_1` FOREIGN KEY (`Booking_ID`) REFERENCES `Booking` (`Booking_ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `charges_ibfk_2` FOREIGN KEY (`Item_ID`) REFERENCES `Items` (`Item_ID`) ON DELETE CASCADE;

--
-- Constraints for table `Daily_Expenses`
--
ALTER TABLE `Daily_Expenses`
  ADD CONSTRAINT `daily_expenses_ibfk_1` FOREIGN KEY (`Unit_ID`) REFERENCES `Unit` (`Unit_ID`) ON DELETE CASCADE;

--
-- Constraints for table `Expenses`
--
ALTER TABLE `Expenses`
  ADD CONSTRAINT `expenses_ibfk_1` FOREIGN KEY (`Bills_ID`) REFERENCES `Bills` (`Bills_ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `expenses_ibfk_2` FOREIGN KEY (`Daily_ID`) REFERENCES `Daily_Expenses` (`Daily_ID`) ON DELETE CASCADE;

--
-- Constraints for table `Unit`
--
ALTER TABLE `Unit`
  ADD CONSTRAINT `unit_ibfk_1` FOREIGN KEY (`Building_ID`) REFERENCES `Building` (`Building_ID`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
