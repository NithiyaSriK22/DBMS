-- ============================================================================
-- BIODIVERSITY MANAGEMENT SYSTEM (BMS) - RELATIONAL DATABASE SCHEMA (3NF)
-- DBMS Project demonstrating Relational Modeling, 3NF Normalization,
-- Primary Keys, Foreign Keys, Referential Integrity, Constraints & Indexes.
-- Compatible with MySQL 8.x / MariaDB, phpMyAdmin, MySQL Workbench, and SQLite.
-- ============================================================================

-- Create and Select Database
CREATE DATABASE IF NOT EXISTS biodiversity_db;
USE biodiversity_db;

-- Temporarily disable foreign key checks for clean script re-execution
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS Conservation_Activity;
DROP TABLE IF EXISTS Conservation_Program;
DROP TABLE IF EXISTS Species_Observation;
DROP TABLE IF EXISTS Species_Threat;
DROP TABLE IF EXISTS Species_Habitat;
DROP TABLE IF EXISTS Location;
DROP TABLE IF EXISTS Threat;
DROP TABLE IF EXISTS Researchers;
DROP TABLE IF EXISTS Species;
DROP TABLE IF EXISTS Habitat;
DROP TABLE IF EXISTS Users;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 1. USERS TABLE
-- Authentication and Role-Based Access Control (RBAC)
-- ============================================================================
CREATE TABLE IF NOT EXISTS Users (
    User_ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Role VARCHAR(50) NOT NULL DEFAULT 'Viewer',
    Phone VARCHAR(20),
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_role CHECK (Role IN ('Admin', 'Researcher', 'Conservation Officer', 'Viewer'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. HABITAT TABLE
-- Major biomes and protected ecological zones
-- ============================================================================
CREATE TABLE IF NOT EXISTS Habitat (
    Habitat_ID INT AUTO_INCREMENT PRIMARY KEY,
    Habitat_Name VARCHAR(100) NOT NULL UNIQUE,
    Habitat_Type VARCHAR(50) NOT NULL,
    Climate VARCHAR(100) NOT NULL,
    Area DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    Description TEXT,
    Protection_Status VARCHAR(50) NOT NULL DEFAULT 'Protected',
    CONSTRAINT chk_habitat_area CHECK (Area >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. LOCATION TABLE (1:N with Habitat)
-- Geographic locations and sectors where biodiversity records are maintained
-- ============================================================================
CREATE TABLE IF NOT EXISTS Location (
    Location_ID INT AUTO_INCREMENT PRIMARY KEY,
    Location_Name VARCHAR(150) NOT NULL,
    State VARCHAR(100) NOT NULL,
    Country VARCHAR(100) NOT NULL DEFAULT 'India',
    Latitude DECIMAL(9,6) NOT NULL,
    Longitude DECIMAL(9,6) NOT NULL,
    Habitat_ID INT NOT NULL,
    INDEX idx_location_state (State),
    INDEX idx_location_habitat (Habitat_ID),
    CONSTRAINT fk_location_habitat FOREIGN KEY (Habitat_ID) 
        REFERENCES Habitat(Habitat_ID) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. SPECIES TABLE
-- Core biological catalog of tracked flora and fauna
-- ============================================================================
CREATE TABLE IF NOT EXISTS Species (
    Species_ID INT AUTO_INCREMENT PRIMARY KEY,
    Common_Name VARCHAR(100) NOT NULL,
    Scientific_Name VARCHAR(150) NOT NULL UNIQUE,
    Species_Type VARCHAR(50) NOT NULL,
    Family VARCHAR(100) NOT NULL,
    Conservation_Status VARCHAR(50) NOT NULL,
    Population_Estimate INT NOT NULL DEFAULT 0,
    Description TEXT,
    Discovery_Date DATE,
    Image_Url VARCHAR(500),
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_species_name (Common_Name),
    INDEX idx_species_status (Conservation_Status),
    INDEX idx_species_type (Species_Type),
    CONSTRAINT chk_species_type CHECK (Species_Type IN ('Mammal', 'Bird', 'Reptile', 'Amphibian', 'Fish', 'Plant', 'Insect')),
    CONSTRAINT chk_conservation_status CHECK (Conservation_Status IN ('Least Concern', 'Near Threatened', 'Vulnerable', 'Endangered', 'Critically Endangered')),
    CONSTRAINT chk_population CHECK (Population_Estimate >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. SPECIES_HABITAT JUNCTION TABLE (M:N Relationship between Species & Habitat)
-- A species can exist in multiple habitats; a habitat contains multiple species
-- ============================================================================
CREATE TABLE IF NOT EXISTS Species_Habitat (
    Species_ID INT NOT NULL,
    Habitat_ID INT NOT NULL,
    Population_Estimate INT DEFAULT 0,
    Recorded_Date DATE DEFAULT (CURRENT_DATE),
    PRIMARY KEY (Species_ID, Habitat_ID),
    INDEX idx_sh_species (Species_ID),
    INDEX idx_sh_habitat (Habitat_ID),
    CONSTRAINT fk_sh_species FOREIGN KEY (Species_ID) 
        REFERENCES Species(Species_ID) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_sh_habitat FOREIGN KEY (Habitat_ID) 
        REFERENCES Habitat(Habitat_ID) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT chk_sh_population CHECK (Population_Estimate >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. RESEARCHERS TABLE
-- Field scientists and institutions conducting biological surveys
-- ============================================================================
CREATE TABLE IF NOT EXISTS Researchers (
    Researcher_ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Phone VARCHAR(20),
    Organization VARCHAR(150) NOT NULL,
    Specialization VARCHAR(100) NOT NULL,
    Experience_Years INT NOT NULL DEFAULT 0,
    INDEX idx_researcher_org (Organization),
    INDEX idx_researcher_spec (Specialization),
    CONSTRAINT chk_researcher_exp CHECK (Experience_Years >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. THREAT TABLE
-- Drivers of biodiversity loss and environmental risks
-- ============================================================================
CREATE TABLE IF NOT EXISTS Threat (
    Threat_ID INT AUTO_INCREMENT PRIMARY KEY,
    Threat_Name VARCHAR(100) NOT NULL UNIQUE,
    Threat_Type VARCHAR(50) NOT NULL,
    Severity VARCHAR(50) NOT NULL,
    Description TEXT,
    INDEX idx_threat_severity (Severity),
    INDEX idx_threat_type (Threat_Type),
    CONSTRAINT chk_threat_type CHECK (Threat_Type IN ('Natural', 'Human', 'Environmental', 'Climate-related')),
    CONSTRAINT chk_threat_severity CHECK (Severity IN ('Low', 'Medium', 'High', 'Critical'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. SPECIES_THREAT JUNCTION TABLE (M:N Relationship between Species & Threat)
-- A species can face multiple threats; a threat can affect multiple species
-- ============================================================================
CREATE TABLE IF NOT EXISTS Species_Threat (
    Species_ID INT NOT NULL,
    Threat_ID INT NOT NULL,
    Impact_Level VARCHAR(50) NOT NULL DEFAULT 'High',
    Recorded_Date DATE DEFAULT (CURRENT_DATE),
    Description TEXT,
    PRIMARY KEY (Species_ID, Threat_ID),
    INDEX idx_st_species (Species_ID),
    INDEX idx_st_threat (Threat_ID),
    CONSTRAINT fk_st_species FOREIGN KEY (Species_ID) 
        REFERENCES Species(Species_ID) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_st_threat FOREIGN KEY (Threat_ID) 
        REFERENCES Threat(Threat_ID) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT chk_st_impact CHECK (Impact_Level IN ('Low', 'Medium', 'High', 'Critical'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 9. SPECIES_OBSERVATION TABLE (Multi-Entity Transaction Record)
-- Records a species observed at a location by a researcher
-- ============================================================================
CREATE TABLE IF NOT EXISTS Species_Observation (
    Observation_ID INT AUTO_INCREMENT PRIMARY KEY,
    Species_ID INT NOT NULL,
    Location_ID INT NOT NULL,
    Researcher_ID INT NOT NULL,
    Observation_Date DATE NOT NULL,
    Population_Count INT NOT NULL DEFAULT 1,
    Observation_Method VARCHAR(50) NOT NULL,
    Notes TEXT,
    INDEX idx_obs_date (Observation_Date),
    INDEX idx_obs_species (Species_ID),
    INDEX idx_obs_location (Location_ID),
    INDEX idx_obs_researcher (Researcher_ID),
    INDEX idx_obs_method (Observation_Method),
    CONSTRAINT fk_obs_species FOREIGN KEY (Species_ID) 
        REFERENCES Species(Species_ID) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_obs_location FOREIGN KEY (Location_ID) 
        REFERENCES Location(Location_ID) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_obs_researcher FOREIGN KEY (Researcher_ID) 
        REFERENCES Researchers(Researcher_ID) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT chk_obs_count CHECK (Population_Count >= 0),
    CONSTRAINT chk_obs_method CHECK (Observation_Method IN ('Camera Trap', 'Field Survey', 'Drone Survey', 'GPS Tracking', 'Direct Observation', 'Environmental DNA'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 10. CONSERVATION_PROGRAM TABLE (1:N with Location)
-- State, regional, and national biodiversity conservation initiatives
-- ============================================================================
CREATE TABLE IF NOT EXISTS Conservation_Program (
    Program_ID INT AUTO_INCREMENT PRIMARY KEY,
    Program_Name VARCHAR(150) NOT NULL,
    Objective TEXT NOT NULL,
    Start_Date DATE NOT NULL,
    End_Date DATE,
    Budget DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    Status VARCHAR(50) NOT NULL DEFAULT 'Planned',
    Location_ID INT NOT NULL,
    INDEX idx_prog_status (Status),
    INDEX idx_prog_location (Location_ID),
    INDEX idx_prog_dates (Start_Date, End_Date),
    CONSTRAINT fk_prog_location FOREIGN KEY (Location_ID) 
        REFERENCES Location(Location_ID) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT chk_prog_budget CHECK (Budget >= 0),
    CONSTRAINT chk_prog_status CHECK (Status IN ('Planned', 'Active', 'Completed', 'Suspended'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 11. CONSERVATION_ACTIVITY TABLE (1:N with Conservation_Program)
-- Specific milestone actions, patrols, and drives executed under a program
-- ============================================================================
CREATE TABLE IF NOT EXISTS Conservation_Activity (
    Activity_ID INT AUTO_INCREMENT PRIMARY KEY,
    Program_ID INT NOT NULL,
    Activity_Name VARCHAR(150) NOT NULL,
    Activity_Date DATE NOT NULL,
    Responsible_Person VARCHAR(100) NOT NULL,
    Description TEXT,
    Outcome TEXT,
    INDEX idx_act_program (Program_ID),
    INDEX idx_act_date (Activity_Date),
    CONSTRAINT fk_act_program FOREIGN KEY (Program_ID) 
        REFERENCES Conservation_Program(Program_ID) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
