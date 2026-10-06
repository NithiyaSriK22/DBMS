# Biodiversity Management System — Entity-Relationship (ER) Diagram & Schema Documentation

## 1. Relational ER Diagram (Mermaid)

```mermaid
erDiagram
    USERS {
        int User_ID PK
        string Name
        string Email UK
        string Password
        string Role
        string Phone
        timestamp Created_At
    }

    HABITAT {
        int Habitat_ID PK
        string Habitat_Name UK
        string Habitat_Type
        string Climate
        decimal Area
        text Description
        string Protection_Status
    }

    LOCATION {
        int Location_ID PK
        string Location_Name
        string State
        string Country
        decimal Latitude
        decimal Longitude
        int Habitat_ID FK
    }

    SPECIES {
        int Species_ID PK
        string Common_Name
        string Scientific_Name UK
        string Species_Type
        string Family
        string Conservation_Status
        int Population_Estimate
        text Description
        date Discovery_Date
        string Image_Url
        timestamp Created_At
    }

    SPECIES_HABITAT {
        int Species_ID PK,FK
        int Habitat_ID PK,FK
        int Population_Estimate
        date Recorded_Date
    }

    RESEARCHERS {
        int Researcher_ID PK
        string Name
        string Email UK
        string Phone
        string Organization
        string Specialization
        int Experience_Years
    }

    THREAT {
        int Threat_ID PK
        string Threat_Name UK
        string Threat_Type
        string Severity
        text Description
    }

    SPECIES_THREAT {
        int Species_ID PK,FK
        int Threat_ID PK,FK
        string Impact_Level
        date Recorded_Date
        text Description
    }

    SPECIES_OBSERVATION {
        int Observation_ID PK
        int Species_ID FK
        int Location_ID FK
        int Researcher_ID FK
        date Observation_Date
        int Population_Count
        string Observation_Method
        text Notes
    }

    CONSERVATION_PROGRAM {
        int Program_ID PK
        string Program_Name
        text Objective
        date Start_Date
        date End_Date
        decimal Budget
        string Status
        int Location_ID FK
    }

    CONSERVATION_ACTIVITY {
        int Activity_ID PK
        int Program_ID FK
        string Activity_Name
        date Activity_Date
        string Responsible_Person
        text Description
        text Outcome
    }

    HABITAT ||--o{ LOCATION : "contains (1:N)"
    SPECIES ||--o{ SPECIES_HABITAT : "inhabits (1:N)"
    HABITAT ||--o{ SPECIES_HABITAT : "hosts (1:N)"
    SPECIES ||--o{ SPECIES_THREAT : "faces (1:N)"
    THREAT ||--o{ SPECIES_THREAT : "affects (1:N)"
    SPECIES ||--o{ SPECIES_OBSERVATION : "observed_in (1:N)"
    LOCATION ||--o{ SPECIES_OBSERVATION : "location_of (1:N)"
    RESEARCHERS ||--o{ SPECIES_OBSERVATION : "records (1:N)"
    LOCATION ||--o{ CONSERVATION_PROGRAM : "hosts_program (1:N)"
    CONSERVATION_PROGRAM ||--o{ CONSERVATION_ACTIVITY : "executes (1:N)"
```

---

## 2. Cardinalities & Relationship Explanations

1. **Species to Habitat (M:N via `Species_Habitat`)**:
   - A single species can inhabit multiple distinct habitats (e.g. Bengal Tiger lives in Tropical Rainforests, Mangroves, and Grasslands).
   - A habitat contains numerous species.
   - Resolved using composite primary key `(Species_ID, Habitat_ID)`.

2. **Species to Threat (M:N via `Species_Threat`)**:
   - A species faces multiple anthropogenic or ecological threats.
   - A threat (e.g., Deforestation) affects many species.
   - Resolved using composite primary key `(Species_ID, Threat_ID)` with extra attributes `Impact_Level` and `Recorded_Date`.

3. **Habitat to Location (1:N)**:
   - Each geographical location belongs to exactly 1 primary habitat zone.
   - One habitat classification encompasses multiple protected sectors/locations.

4. **Species Observation (Multi-Entity Relationship: Species, Location, Researcher)**:
   - Every observation records a specific `Species` seen at a specific `Location` by a specific `Researcher` on a designated date using a standardized observation method.

5. **Conservation Program to Location (1:N)**:
   - A conservation program is hosted within a target geographical territory/location.

6. **Conservation Program to Conservation Activity (1:N)**:
   - A conservation program comprises multiple milestone field activities, audits, patrols, and restoration drives.

---

## 3. Database Normalization Analysis (3NF)

- **1NF (First Normal Form)**:
  - All attributes are atomic (no repeating groups, no comma-separated values).
  - Each record has a designated Primary Key.
- **2NF (Second Normal Form)**:
  - Is in 1NF.
  - No partial dependency. In junction tables `Species_Habitat` and `Species_Threat`, non-key attributes (`Population_Estimate`, `Impact_Level`) depend on the full composite primary key.
- **3NF (Third Normal Form)**:
  - Is in 2NF.
  - No transitive dependency. Non-prime attributes depend ONLY on the primary key, not on other non-prime attributes (e.g., Location names or Habitat details are not duplicated inside Observations).
