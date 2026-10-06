-- ============================================================================
-- BIODIVERSITY MANAGEMENT SYSTEM (BMS) - REALISTIC SEED DATA
-- Fully normalized relational records for DBMS evaluation and demonstration.
-- ============================================================================

-- 1. SEED USERS (Passwords hashed for bcrypt: 'Admin@123', 'Research@123', 'Officer@123', 'Viewer@123')
-- Note: In the node backend, bcrypt hashes will also be verified or loaded dynamically.
INSERT INTO Users (User_ID, Name, Email, Password, Role, Phone) VALUES
(1, 'Dr. Rajesh Sharma', 'admin@biodiversity.org', '$2a$10$wN3tN6XW3Q7s6H5r6r0/h.aRkK6i4eF5Yg3k7H8x9J0z1a2b3c4d5e', 'Admin', '+91 98450 12345'),
(2, 'Dr. Sunita Narain', 'sunita.narain@wii.gov.in', '$2a$10$wN3tN6XW3Q7s6H5r6r0/h.aRkK6i4eF5Yg3k7H8x9J0z1a2b3c4d5e', 'Researcher', '+91 98450 23456'),
(3, 'Vikram Rathore', 'vikram.rathore@forest.gov.in', '$2a$10$wN3tN6XW3Q7s6H5r6r0/h.aRkK6i4eF5Yg3k7H8x9J0z1a2b3c4d5e', 'Conservation Officer', '+91 98450 34567'),
(4, 'Ananya Iyer', 'ananya.iyer@nature.org', '$2a$10$wN3tN6XW3Q7s6H5r6r0/h.aRkK6i4eF5Yg3k7H8x9J0z1a2b3c4d5e', 'Viewer', '+91 98450 45678');

-- 2. SEED HABITATS
INSERT INTO Habitat (Habitat_ID, Habitat_Name, Habitat_Type, Climate, Area, Description, Protection_Status) VALUES
(1, 'Western Ghats Tropical Montane Rainforest', 'Tropical Evergreen Forest', 'Humid Tropical / High Rainfall', 160000.00, 'Global biodiversity hotspot with dense canopy, endemic flora, and heavy monsoon rains.', 'National Park'),
(2, 'Sundarbans Mangrove Delta', 'Mangrove Forest', 'Coastal Wetland / Brackish Tidal', 10200.00, 'Largest tidal halophytic mangrove forest in the world, home to tidal waterways and unique mangrove taxa.', 'UNESCO World Heritage'),
(3, 'Kaziranga Alluvial Floodplain', 'Grassland', 'Sub-tropical Humid Monsoon', 430.00, 'Dense tall elephant grass interspersed with water bodies, vital for large megaherbivores.', 'National Park'),
(4, 'Gulf of Mannar Coral Reefs', 'Coral Reef', 'Marine Tropical', 10500.00, 'Rich biosphere reserve with 21 islands, fringing coral reefs, seagrass beds, and dugong populations.', 'Marine National Park'),
(5, 'Hemis High Altitude Himalayan Plateau', 'Mountain Ecosystem', 'Alpine Cold Desert', 4400.00, 'Rugged snow-clad mountain valleys and passes supporting high-altitude alpine wildlife.', 'National Park'),
(6, 'Gir Dry Deciduous Teak Forest', 'Dry Deciduous Forest', 'Semi-Arid Tropical', 1412.00, 'Rugged rocky hills and deciduous thorn forests, the sole global habitat of the Asiatic Lion.', 'Wildlife Sanctuary'),
(7, 'Chilika Brackish Lagoon', 'Wetland', 'Coastal Marine / Wetland', 1165.00, 'Largest coastal lagoon in India and second largest in the world, migratory waterbird haven.', 'Ramsar Wetland Site'),
(8, 'Thar Arid Dune Shrubland', 'Desert', 'Hyper-Arid Hot Desert', 3162.00, 'Sand dunes, scrubland, and rocky outcrops adapted to harsh droughts and extreme temperatures.', 'Protected Sanctuary');

-- 3. SEED LOCATIONS
INSERT INTO Location (Location_ID, Location_Name, State, Country, Latitude, Longitude, Habitat_ID) VALUES
(1, 'Silent Valley Core Zone', 'Kerala', 'India', 11.083333, 76.450000, 1),
(2, 'Anamalai Tiger Reserve Sector A', 'Tamil Nadu', 'India', 10.333333, 76.916667, 1),
(3, 'Sundarbans Tiger Core Sanctuary', 'West Bengal', 'India', 21.949700, 88.899900, 2),
(4, 'Kaziranga Central Range Kohora', 'Assam', 'India', 26.577500, 93.171100, 3),
(5, 'Gulf of Mannar Biosphere Island 4', 'Tamil Nadu', 'India', 9.133300, 79.116700, 4),
(6, 'Rumbak Valley Hemis High Peak', 'Ladakh', 'India', 34.050000, 77.400000, 5),
(7, 'Sasan Gir Wildlife Division', 'Gujarat', 'India', 21.124300, 70.824200, 6),
(8, 'Mangalajodi Chilika Wetland Wing', 'Odisha', 'India', 19.916700, 85.416700, 7),
(9, 'Desert National Park Sam Dunes', 'Rajasthan', 'India', 26.890000, 70.520000, 8),
(10, 'Periyar Lake Basin Sanctuary', 'Kerala', 'India', 9.466700, 77.143300, 1);

-- 4. SEED SPECIES (24 rich, distinct species covering all categories)
INSERT INTO Species (Species_ID, Common_Name, Scientific_Name, Species_Type, Family, Conservation_Status, Population_Estimate, Description, Discovery_Date, Image_Url) VALUES
(1, 'Bengal Tiger', 'Panthera tigris tigris', 'Mammal', 'Felidae', 'Endangered', 3167, 'Apex terrestrial predator with distinctive dark vertical stripes on reddish-orange fur.', '1758-01-01', 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=800&q=80'),
(2, 'Asian Elephant', 'Elephas maximus indicus', 'Mammal', 'Elephantidae', 'Endangered', 29964, 'Largest terrestrial mammal in Asia, characterized by high intelligence and complex social structures.', '1758-01-01', 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=800&q=80'),
(3, 'Indian Peacock', 'Pavo cristatus', 'Bird', 'Phasianidae', 'Least Concern', 150000, 'National bird of India known for the iridescent blue-green plumage and fan-shaped crest.', '1758-01-01', 'https://images.unsplash.com/photo-1536514498073-50e69d39c6cf?auto=format&fit=crop&w=800&q=80'),
(4, 'Indian Pangolin', 'Manis crassicaudata', 'Mammal', 'Manidae', 'Endangered', 12000, 'Nocturnal anteater covered in large overlapping keratin scales, heavily targeted by illegal trafficking.', '1822-06-15', 'https://images.unsplash.com/photo-1590695213691-0f3d4407849e?auto=format&fit=crop&w=800&q=80'),
(5, 'Nilgiri Tahr', 'Nilgiritragus hylocrius', 'Mammal', 'Bovidae', 'Endangered', 3120, 'Stocky mountain ungulate endemic to the montane shola-grassland ecosystem of the Western Ghats.', '1838-04-10', 'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=800&q=80'),
(6, 'Lion-tailed Macaque', 'Macaca silenus', 'Mammal', 'Cercopithecidae', 'Endangered', 2450, 'Arboreal Old World monkey with silver-white mane surrounding the head, endemic to rainforests.', '1758-01-01', 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=800&q=80'),
(7, 'Great Indian Hornbill', 'Buceros bicornis', 'Bird', 'Bucerotidae', 'Vulnerable', 18500, 'Canopy frugivore with an enormous curved beak topped with a bright yellow keratin casque.', '1758-01-01', 'https://images.unsplash.com/photo-1618281377501-88c2328cbb9c?auto=format&fit=crop&w=800&q=80'),
(8, 'Green Sea Turtle', 'Chelonia mydas', 'Reptile', 'Cheloniidae', 'Endangered', 85000, 'Large marine turtle feeding predominantly on seagrasses and algae, nesting along coastal beaches.', '1758-01-01', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'),
(9, 'Ganges River Dolphin', 'Platanista gangetica', 'Mammal', 'Platanistidae', 'Endangered', 3800, 'Freshwater river dolphin practically blind, relying exclusively on ultrasonic echolocation.', '1801-01-01', 'https://images.unsplash.com/photo-1568430462989-44163eb1752f?auto=format&fit=crop&w=800&q=80'),
(10, 'Snow Leopard', 'Panthera uncia', 'Mammal', 'Felidae', 'Vulnerable', 718, 'Ghost of the mountains, highly adapted to freezing high-altitude scree slopes and cliffs.', '1775-01-01', 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=800&q=80'),
(11, 'Great Indian Bustard', 'Ardeotis nigriceps', 'Bird', 'Otididae', 'Critically Endangered', 140, 'Tall ground-dwelling bird with horizontal body and long bare legs, on the brink of extinction.', '1831-01-01', 'https://images.unsplash.com/photo-1444464666168-89d8ba518a0e?auto=format&fit=crop&w=800&q=80'),
(12, 'King Cobra', 'Ophiophagus hannah', 'Reptile', 'Elapidae', 'Vulnerable', 9500, 'Longest venomous snake species in the world, specialized predator of other snakes.', '1836-01-01', 'https://images.unsplash.com/photo-1531386151447-fd764033c4f7?auto=format&fit=crop&w=800&q=80'),
(13, 'Gharial', 'Gavialis gangeticus', 'Reptile', 'Gavialidae', 'Critically Endangered', 650, 'Fish-eating crocodylian with distinctive elongated snout terminating in a bulbous ghara.', '1789-01-01', 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80'),
(14, 'Indian Rhinoceros', 'Rhinoceros unicornis', 'Mammal', 'Rhinocerotidae', 'Vulnerable', 4014, 'Massive herbivore with thick silver-brown armor-like skin folds and a single keratin horn.', '1758-01-01', 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=800&q=80'),
(15, 'Asiatic Lion', 'Panthera leo persica', 'Mammal', 'Felidae', 'Endangered', 674, 'Distinct subspecies of lion surviving solely in the Gir forest ecosystem of western India.', '1826-01-01', 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80'),
(16, 'Purple Frog', 'Nasikabatrachus sahyadrensis', 'Amphibian', 'Sooglossidae', 'Endangered', 1350, 'Living fossil burrowing amphibian that emerges above ground for only two weeks during monsoon.', '2003-10-16', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80'),
(17, 'Malabar Giant Squirrel', 'Ratufa indica', 'Mammal', 'Sciuridae', 'Least Concern', 34000, 'Large multicolored arboreal rodent with deep red, maroon, and purple fur patches.', '1777-01-01', 'https://images.unsplash.com/photo-1507667522119-90656a29be85?auto=format&fit=crop&w=800&q=80'),
(18, 'Irrawaddy Dolphin', 'Orcaella brevirostris', 'Mammal', 'Delphinidae', 'Endangered', 160, 'Euryhaline coastal dolphin with rounded melon head and short beak found in Chilika Lake.', '1866-01-01', 'https://images.unsplash.com/photo-1570481662006-a3a1374699e8?auto=format&fit=crop&w=800&q=80'),
(19, 'Whale Shark', 'Rhincodon typus', 'Fish', 'Rhincodontidae', 'Endangered', 7200, 'Largest known extant fish species, filter-feeding on plankton along Gujarat coastal waters.', '1828-01-01', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'),
(20, 'Neelakurinji', 'Strobilanthes kunthiana', 'Plant', 'Acanthaceae', 'Vulnerable', 85000, 'Famous montane shrub that blossoms once every 12 years covering the Shola hills in purple.', '1846-01-01', 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80'),
(21, 'Red Sandalwood', 'Pterocarpus santalinus', 'Plant', 'Fabaceae', 'Endangered', 45000, 'Precious timber tree prized for its dark red wood, medicinal value, and strict export protection.', '1800-01-01', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80'),
(22, 'Atlas Moth', 'Attacus atlas', 'Insect', 'Saturniidae', 'Least Concern', 120000, 'One of the largest lepidopterans with wing surfaces exceeding 400 square centimeters.', '1758-01-01', 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&w=800&q=80'),
(23, 'Kashmir Stag (Hangul)', 'Cervus hanglu hanglu', 'Mammal', 'Cervidae', 'Critically Endangered', 261, 'The only surviving Asian subspecies of European red deer confined to Dachigam Valley.', '1844-01-01', 'https://images.unsplash.com/photo-1484406566174-9da000fda645?auto=format&fit=crop&w=800&q=80'),
(24, 'Olive Ridley Sea Turtle', 'Lepidochelys olivacea', 'Reptile', 'Cheloniidae', 'Vulnerable', 420000, 'Famous for mass synchronized nesting (Arribada) along the Gahirmatha and Rushikulya coasts.', '1829-01-01', 'https://images.unsplash.com/photo-1508873696983-2df5703bc20d?auto=format&fit=crop&w=800&q=80');

-- 5. SEED SPECIES_HABITAT (M:N Links)
INSERT INTO Species_Habitat (Species_ID, Habitat_ID, Population_Estimate, Recorded_Date) VALUES
(1, 2, 96, '2023-04-10'),
(1, 3, 125, '2023-05-12'),
(1, 1, 340, '2023-06-20'),
(2, 1, 14200, '2023-01-15'),
(2, 3, 2100, '2023-02-18'),
(3, 1, 45000, '2023-03-01'),
(3, 6, 12000, '2023-03-05'),
(4, 1, 4200, '2023-04-01'),
(4, 8, 1800, '2023-04-02'),
(5, 1, 3120, '2023-05-15'),
(6, 1, 2450, '2023-05-16'),
(7, 1, 8900, '2023-06-11'),
(7, 3, 4200, '2023-06-12'),
(8, 4, 3200, '2023-07-01'),
(9, 3, 110, '2023-07-20'),
(10, 5, 718, '2023-08-05'),
(11, 8, 140, '2023-08-10'),
(12, 1, 4300, '2023-08-15'),
(12, 2, 1800, '2023-08-16'),
(13, 7, 24, '2023-09-01'),
(14, 3, 2613, '2023-09-10'),
(15, 6, 674, '2023-09-15'),
(16, 1, 1350, '2023-10-01'),
(17, 1, 21000, '2023-10-05'),
(18, 7, 160, '2023-10-10'),
(19, 4, 450, '2023-10-12'),
(20, 1, 85000, '2023-10-15'),
(21, 1, 45000, '2023-10-18'),
(22, 1, 62000, '2023-10-20'),
(23, 5, 261, '2023-10-22'),
(24, 7, 310000, '2023-10-25');

-- 6. SEED RESEARCHERS
INSERT INTO Researchers (Researcher_ID, Name, Email, Phone, Organization, Specialization, Experience_Years) VALUES
(1, 'Dr. K. Ullas Karanth', 'ullas.karanth@wcs.org', '+91 98801 11223', 'Wildlife Conservation Society', 'Mammalogy / Carnivore Ecology', 34),
(2, 'Dr. Romulus Whitaker', 'romulus@madrascrocodilebank.org', '+91 98801 22334', 'Madras Crocodile Bank Trust', 'Herpetology / Reptilian Ecology', 45),
(3, 'Dr. Salim Ali Legacy Fellow Dr. Asad Rahmani', 'asad.rahmani@bnhs.org', '+91 98801 33445', 'Bombay Natural History Society', 'Ornithology / Grassland Conservation', 38),
(4, 'Dr. Divya Mudappa', 'divya.mudappa@ncf-india.org', '+91 98801 44556', 'Nature Conservation Foundation', 'Rainforest Restoration & Arboreal Ecology', 22),
(5, 'Dr. Charudutt Mishra', 'charu@snowleopard.org', '+91 98801 55667', 'Snow Leopard Trust', 'High Altitude Mountain Ecology', 26),
(6, 'Dr. B. C. Choudhury', 'choudhury.bc@wii.gov.in', '+91 98801 66778', 'Wildlife Institute of India', 'Aquatic Ecology & Chelonian Biology', 30),
(7, 'Dr. Aparajita Datta', 'aparajita@ncf-india.org', '+91 98801 77889', 'Hornbill Research Initiative', 'Tropical Ecology & Hornbill Biology', 25),
(8, 'Dr. S. Subramanya', 'subramanya.s@uasbangalore.edu.in', '+91 98801 88990', 'Univ of Agricultural Sciences', 'Entomology & Botanical Ecology', 28);

-- 7. SEED THREATS
INSERT INTO Threat (Threat_ID, Threat_Name, Threat_Type, Severity, Description) VALUES
(1, 'Commercial Deforestation & Shola Fragmentation', 'Human', 'Critical', 'Clearance of pristine rainforests for infrastructure and monoculture plantations.'),
(2, 'Organized Wildlife Poaching & Skin/Bone Trade', 'Human', 'Critical', 'Illegal targeted killing for skins, bones, claws, scales, and traditional medicine.'),
(3, 'Global Climate Shift & Glacial Retreat', 'Climate-related', 'High', 'Rising temperatures shifting alpine tree lines and altering precipitation patterns.'),
(4, 'Aquatic Microplastic & Chemical Effluent Runoff', 'Environmental', 'High', 'Untreated industrial runoff and heavy metals degrading river systems and coral reefs.'),
(5, 'Invasive Weed Proliferation (Lantana & Prosopis)', 'Environmental', 'Medium', 'Aggressive exotic flora choking native forage and reducing grazing carrying capacity.'),
(6, 'High-Voltage Power Transmission Lines Collisions', 'Human', 'Critical', 'Overhead electrical lines across arid grasslands leading to lethal avian electrocutions.'),
(7, 'Linear Infrastructure (Highways & Rail) Fragmentation', 'Human', 'High', 'Transportation corridors cutting through wildlife migration routes leading to roadkills.'),
(8, 'Sea Level Rise & Coastal Salinization', 'Climate-related', 'High', 'Erosion of mangrove banks and inundation of freshwater breeding sanctuaries.');

-- 8. SEED SPECIES_THREAT (M:N Links)
INSERT INTO Species_Threat (Species_ID, Threat_ID, Impact_Level, Recorded_Date, Description) VALUES
(1, 2, 'Critical', '2023-01-10', 'Direct threat from poaching and illegal international trade in body parts.'),
(1, 1, 'High', '2023-01-12', 'Loss of contiguous forest corridors between core protected zones.'),
(1, 7, 'High', '2023-02-05', 'Roadkills across highway crossings in tiger corridors.'),
(2, 7, 'Critical', '2023-02-14', 'Railway line strikes and highway barriers dividing migration herds.'),
(2, 1, 'High', '2023-03-01', 'Loss of ancient elephant foraging corridors.'),
(4, 2, 'Critical', '2023-03-10', 'Extremely intensive international illicit scale trade.'),
(5, 1, 'High', '2023-03-15', 'Shola grassland encroachment by invasive wattle and tea estates.'),
(6, 1, 'Critical', '2023-04-01', 'Arboreal canopy gaps preventing troop movement across fragmented forests.'),
(8, 4, 'High', '2023-04-20', 'Plastic ingestion and entanglement in abandoned fishing nets (ghost gear).'),
(9, 4, 'Critical', '2023-05-01', 'Agricultural toxic runoff and sand mining disrupting acoustic biosonar navigation.'),
(10, 3, 'High', '2023-05-15', 'Shrinking alpine snowline and prey depletion in high valleys.'),
(11, 6, 'Critical', '2023-06-01', 'Low front-vision leads to deadly collision with high tension transmission wires.'),
(13, 4, 'High', '2023-06-10', 'Sand mining on nesting river banks and gillnet entanglement.'),
(14, 2, 'High', '2023-06-25', 'Poaching targeted at horn trade in regional cross-border networks.'),
(15, 7, 'High', '2023-07-01', 'Traffic hazards on peripheral roads passing through Gir protected sanctuary.'),
(18, 4, 'Critical', '2023-07-15', 'Motorboat propeller hits and commercial gillnet bycatch in lagoon passages.'),
(21, 2, 'Critical', '2023-08-01', 'Illegal timber felling and illicit transnational smuggling.'),
(24, 8, 'High', '2023-08-10', 'Nesting beach erosion and artificial illumination disorienting hatchlings.');

-- 9. SEED SPECIES_OBSERVATIONS (Real field records)
INSERT INTO Species_Observation (Observation_ID, Species_ID, Location_ID, Researcher_ID, Observation_Date, Population_Count, Observation_Method, Notes) VALUES
(1, 1, 1, 1, '2023-01-15', 3, 'Camera Trap', 'Adult tigress with two sub-adult cubs recorded at waterhole camera grid 4B.'),
(2, 1, 3, 1, '2023-02-20', 2, 'GPS Tracking', 'Pugmarks and satellite radio collar telemetry confirmed pair crossing Raimangal channel.'),
(3, 2, 2, 4, '2023-03-10', 14, 'Direct Observation', 'Family herd feeding in secondary bamboo thickets, healthy calves noted.'),
(4, 5, 1, 4, '2023-03-25', 28, 'Field Survey', 'Large herd grazing along steep precipice near Sispara Pass during dawn census.'),
(5, 6, 2, 4, '2023-04-05', 9, 'Direct Observation', 'Troop feeding on Ficus fruits in upper canopy, infant present.'),
(6, 7, 1, 7, '2023-04-18', 4, 'Direct Observation', 'Active breeding nest cavity observed in old-growth Cullenia tree.'),
(7, 8, 5, 6, '2023-05-02', 6, 'Drone Survey', 'Sub-adults foraging in shallow seagrass meadows south of Appa Island.'),
(8, 9, 4, 6, '2023-05-18', 2, 'Direct Observation', 'Surface breathing interval 110 seconds near Brahmaputra confluence point.'),
(9, 10, 6, 5, '2023-06-04', 1, 'Camera Trap', 'Solitary male captured on motion-sensor night camera on ridgeline at 4300m elevation.'),
(10, 11, 9, 3, '2023-06-19', 4, 'Direct Observation', 'Courting male displaying ballooned gular sac in Sam desert enclosure.'),
(11, 12, 1, 2, '2023-07-08', 1, 'Field Survey', 'Large female guarding leaf-litter nest mound on moist evergreen slope.'),
(12, 13, 8, 2, '2023-07-22', 3, 'Direct Observation', 'Basking on mudflats near Mahanadi delta distributor canal.'),
(13, 14, 4, 1, '2023-08-05', 8, 'Drone Survey', 'Group wallowing in floodplain marsh during midday heat.'),
(14, 15, 7, 1, '2023-08-20', 5, 'GPS Tracking', 'Pride resting under Acacia umbrella canopy near water trough.'),
(15, 16, 1, 2, '2023-09-02', 12, 'Direct Observation', 'Synchronized breeding chorus following initial torrential monsoon spell.'),
(16, 18, 8, 6, '2023-09-14', 3, 'Direct Observation', 'Spyhopping behavior recorded near Outer Channel mouth at high tide.'),
(17, 19, 5, 6, '2023-09-28', 1, 'Environmental DNA', 'eDNA markers detected from water column samples off Mandapam reef.'),
(18, 23, 6, 5, '2023-10-05', 7, 'Field Survey', 'Winter rutting group spotted in upper oak-rhododendron forest.'),
(19, 24, 8, 6, '2023-10-18', 450, 'Field Survey', 'Early wave of nesting females emerging onto sand spit during new moon.'),
(20, 3, 7, 3, '2023-11-02', 18, 'Direct Observation', 'Flock roosting in canopy of Banyan trees near forestry checkpoint.'),
(21, 4, 10, 2, '2023-11-15', 1, 'Camera Trap', 'Adult foraging near termitarium on damp forest floor at 22:40 hours.'),
(22, 17, 2, 4, '2023-11-28', 5, 'Direct Observation', 'Multiple canopy leaps recorded between Dipterocarpus crowns.'),
(23, 20, 1, 8, '2023-12-10', 85, 'Field Survey', 'Patchy flowering recorded on high rocky ridge of Karian Shola.'),
(24, 21, 2, 8, '2024-01-05', 12, 'Field Survey', 'Girth census and GPS microchipping of mature seed-bearing trees.');

-- 10. SEED CONSERVATION_PROGRAMS
INSERT INTO Conservation_Program (Program_ID, Program_Name, Objective, Start_Date, End_Date, Budget, Status, Location_ID) VALUES
(1, 'Project Tiger: Western Ghats Corridor Strengthening', 'Restore contiguous canopy corridors and bolster anti-poaching camera surveillance networks.', '2022-01-01', '2027-12-31', 45000000.00, 'Active', 1),
(2, 'Project Snow Leopard: High Himalayan Community Stewards', 'Engage pastoral nomadic communities in corral predator-proofing and livestock insurance.', '2021-06-01', '2026-05-31', 18000000.00, 'Active', 6),
(3, 'Great Indian Bustard Recovery Mission (Project Godawan)', 'Undergrounding dangerous power transmission lines and captive breeding chick incubation.', '2020-04-01', '2028-03-31', 32000000.00, 'Active', 9),
(4, 'Marine Sanctuary Dugong & Seagrass Meadow Restoration', 'Establish community protected no-trawl zones and replant devastated seagrass beds.', '2023-01-01', '2028-12-31', 22000000.00, 'Active', 5),
(5, 'Chilika Laguna Irrawaddy Dolphin Protection & Ecotourism Regulation', 'Regulate motorized speedboats and restore natural brackish inlet mouth hydrology.', '2022-08-01', '2025-07-31', 14000000.00, 'Active', 8),
(6, 'Gir Lion Landscape Multi-Range Expansion Initiative', 'Develop satellite sanctuary habitats in Barda to prevent disease outbreak risks in single population.', '2023-03-01', '2029-02-28', 60000000.00, 'Planned', 7);

-- 11. SEED CONSERVATION_ACTIVITIES
INSERT INTO Conservation_Activity (Activity_ID, Program_ID, Activity_Name, Activity_Date, Responsible_Person, Description, Outcome) VALUES
(1, 1, 'Installation of AI-Powered 24x7 Poacher Detection Grid', '2023-02-10', 'Vikram Rathore', 'Deployed 40 real-time transmission wireless camera units in core vulnerability sectors.', 'Zero illegal trespassing incidents recorded in sector during Q1-Q3.'),
(2, 1, 'Invasive Lantana Camara Mechanical Uprooting Drive', '2023-05-15', 'Dr. Divya Mudappa', 'Cleared 120 hectares of dense invasive weed thickets to restore natural deer grazing pastures.', 'Forage biomass increased by 38% based on post-monsoon quadrate sampling.'),
(3, 2, 'Predator-Proof Livestock Night Corral Construction', '2023-04-22', 'Dr. Charudutt Mishra', 'Built 18 wire-mesh reinforced high mountain enclosures in Rumbak village.', '100% reduction in nocturnal livestock depredation by snow leopards.'),
(4, 3, 'Installation of Bird Flight Diverters on 66kV High Tension Lines', '2023-06-18', 'Dr. Asad Rahmani', 'Fixed 2,400 reflective glow-in-the-dark spiral diverters along known bustard flight paths.', 'Zero avian wire-strike fatalities reported along targeted corridor in 12 months.'),
(5, 4, 'Community Fisherfolk Ghost-Gear Retrieval Expedition', '2023-07-29', 'Dr. B. C. Choudhury', 'Recovered 4.2 metric tons of abandoned synthetic nylon nets from fringing reef drop-offs.', 'Reef fish and juvenile sea turtle entanglement mortality dropped significantly.'),
(6, 5, 'Installation of Acoustic Propeller Guards on 150 Tourist Boats', '2023-09-05', 'Vikram Rathore', 'Fitted noise-dampening ring guards on motorboats operating near Mangalajodi channel.', 'Irrawaddy dolphin skin injury incidents decreased to zero throughout tourist season.'),
(7, 6, 'Prey Density Augmentation & Waterhole Excavation in Barda', '2024-01-20', 'Dr. Rajesh Sharma', 'Translocated 200 spotted deer and excavated 4 solar-powered perennial watering holes.', 'Prey base expanded successfully in preparation for satellite lion pride introduction.');
