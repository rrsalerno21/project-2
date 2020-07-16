DROP DATABASE IF EXISTS mer_calendar_db;
CREATE DATABASE mer_calendar_db;

USE mer_calendar_db;

CREATE TABLE IF NOT EXISTS `Users` (
    `id` INTEGER NOT NULL auto_increment , 
    `email` VARCHAR(255) NOT NULL UNIQUE, 
    `password` VARCHAR(255) NOT NULL, 
    `state` VARCHAR(255) NOT NULL, 
    `createdAt` DATETIME NOT NULL, 
    `updatedAt` DATETIME NOT NULL, 
    PRIMARY KEY (`id`)
    );

CREATE TABLE IF NOT EXISTS `Tasks` (
    `id` INTEGER NOT NULL auto_increment , 
    `task` VARCHAR(255) NOT NULL, 
    `due_date` DATETIME, 
    `category` VARCHAR(50) DEFAULT 'General', 
    `complete` TINYINT(1) NOT NULL DEFAULT false, 
    `createdAt` DATETIME NOT NULL, 
    `updatedAt` DATETIME NOT NULL, 
    `UserId` INTEGER, 
    PRIMARY KEY (`id`), 
    FOREIGN KEY (`UserId`) 
        REFERENCES `Users` (`id`) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
    );