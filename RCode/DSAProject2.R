#---------------------------------------
#INITIAL DATA CLEANING & GDB->GeoJSON
#---------------------------------------

#I do not claim to write quality R code. But it works :)

require(tidyverse)
require(magrittr)
require(sf) #for .gdb file
require(readxl) #for Excel file

#LOAD IN WATER CONSUMPTION DATA
gdb_path <- "WaterConsumption.gdb"
#st_layers(gdb_path) #view layers
consump_all <- st_read(gdb_path, layer = "ConsumptionJanSept2025") #load in desired layer

#FORMAT DATA
consump_all %<>% mutate(READ_ON = ymd(READ_ON))
consump_all %<>% mutate(PropertyCat = case_when(TYPE %in% c("ALF", "APTS","DUP","1","RM","SFR","TH","901","15VR") ~ "Residential",
                                                TYPE %in% c("10-A", "10-B", "10-C", "10-D", "10-E", "10-I", "10-M", "15VC") ~ "Commercial",
                                                TYPE %in% c("10-P", "P", "SCH") ~ "Public",
                                                TYPE %in% c("99") ~ "Shell",
                                                TRUE ~ "Miscellaneous")) %>% relocate(PropertyCat, .after = TYPE)

#Separate CYCLE_RTE into distinct "Cycle" & "Route" columns
consump_all %<>% mutate(Cycle = substr(CYCLE_RTE, 1, 1), Route = substr(CYCLE_RTE, nchar(CYCLE_RTE), nchar(CYCLE_RTE)))
consump_all %<>% relocate(Cycle, .after = CYCLE_RTE) %>% relocate(Route, .after = Cycle) %>% dplyr::select(-CYCLE_RTE) #it didn't want to work w/o "dyplr::" for whatever reason

#Rename other columns
consump_all %<>% rename(Juris= JURIS,
                        ReadOn = READ_ON,
                        Consump = CONSUMP,
                        MeterSize = SIZE,
                        WaterType = UTTMS,
                        CustomerCode = CUSID,
                        LocationCode = LOCID,
                        Address = ADDRESS,
                        Misc = MISC,
                        PropertyType = TYPE,
                        InOut = IN_OUT,
                        SubdivisionCode = SUBDIVISIONS)

#Mutate WaterType column values
consump_all %<>% mutate(WaterType = case_when(WaterType == "RW" ~ "Reclaimed", WaterType == "WA" ~ "Potable"))

#DATA FORMATTING
#Remove duplicate rows
consump_all_cleaned <- consump_all %>%
  group_by(LocationCode, ReadOn, WaterType) %>%
  slice(1) %>%  #Take first row of each group, because all the values ~should~ be the same anyways
  mutate(Consump = max(Consump, na.rm = TRUE)) %>%  #override Consump b/c some of the Consump values aren't the same (even though they should be)
  ungroup()

consump_all_cleaned %<>% mutate(Consump = case_when(Consump < 0 ~ 0, Consump >= 0 ~ Consump)) #recode negative values as 0's


#Separate Reclaimed & Potable Usage
potable_consump <- consump_all_cleaned %>% filter(WaterType == "Potable")
reclaimed_consump <- consump_all_cleaned %>% filter(WaterType == "Reclaimed")

#Create "Bill" column for both
potable_consump %<>% group_by(LocationCode) %>%
  arrange(ReadOn) %>%
  mutate(Bill = row_number()) %>% #this wasn't working prior to removing duplicate rows
  filter(Bill <= 9) %>% #restrict to <=9 because very few properties have October data
  ungroup()

reclaimed_consump %<>% group_by(LocationCode) %>%
  arrange(ReadOn) %>%
  mutate(Bill = row_number()) %>%
  filter(Bill <= 9) %>%
  ungroup()

#Pivot Wider for both Potable & Reclaimed datasets
#Must drop geometry (and remove Shape from id_cols) before pivoting wider
potable_consump_wide <- potable_consump %>% st_drop_geometry() %>% 
  pivot_wider(
    id_cols = c(LocationCode, Juris, Route, Cycle, MeterSize, CustomerCode,
                Address, Misc, PropertyType, PropertyCat, InOut, SubdivisionCode), #need to drop ReadOn or else it can't collapse all locations into one row
    names_from = Bill,
    values_from = Consump,
    names_glue = "Consump{Bill}"
  )

#Must drop geometry (and remove Shape from id_cols) before pivoting wider
reclaimed_consump_wide <- reclaimed_consump %>% st_drop_geometry() %>% 
  pivot_wider(
    id_cols = c(LocationCode, Juris, Route, Cycle, MeterSize, CustomerCode,
                Address, Misc, PropertyType, PropertyCat, InOut, SubdivisionCode), #need to drop ReadOn or else it can't collapse all locations into one row
    names_from = Bill,
    values_from = Consump,
    names_glue = "Consump{Bill}"
  )


#Combine Potable & Reclaimed Data (can't use original consump_all b/c that doesn't have a "Bill" column)
total_consump <- bind_rows(potable_consump, reclaimed_consump)
total_consump_wide <- bind_rows(potable_consump_wide, reclaimed_consump_wide)

#Sum the potable & reclaimed usage data together
total_consump_wide <- total_consump_wide %>% group_by(LocationCode) %>% summarize(
  across(starts_with("Consump"), ~ sum(.x, na.rm = TRUE)),
  across(everything(), ~first(.x)),
  .groups = "drop"
)

#transform to WGS84 (required for mapping in maplibre/web -- VERY IMPORTANT)
total_consump <- st_transform(total_consump, crs = 4326)
search_bar_data <- total_consump %>% select(Address, LocationCode) %>% distinct()

#write to geoJSON
#sf::st_write(total_consump, dsn = "OviedoWaterJSON.geojson", driver = "GeoJSON")
#sf::st_write(search_bar_data, dsn = "OviedoWaterSearchbar.geojson", driver = "GeoJSON")


#---------------------------------------
#PARCELS & Shapefile->GeoJSON
#---------------------------------------

parcels_path <- "Parcels.gdb"

#VIEW LAYERS
# st_layers(gdb_path)
# st_layers(parcels_path)
# st_layers(limits_path)

#Re-add geometry back in so that the maps work right
original_points <- consump_all_cleaned %>% select(LocationCode, Shape)

potable_consump_wide <- potable_consump_wide %>%
  left_join(original_points, by = "LocationCode")


reclaimed_consump_wide <- reclaimed_consump_wide %>%
  left_join(original_points, by = "LocationCode")

total_consump_wide <- total_consump_wide %>%
  left_join(original_points, by = "LocationCode")

#need to use wide tables or else spatial merge won't work properly
consump_pts_total <- st_as_sf(total_consump_wide)
consump_pts_potable <- st_as_sf(potable_consump_wide)
consump_pts_reclaimed <- st_as_sf(reclaimed_consump_wide)
parcels_vector <- st_read(parcels_path, layer = "Parcels")

#add a column for avg thus far
#since some data points are missing a billing cycle, rowMeans() will ignore the NA's and properly average
consump_cols <- paste0("Consump", 1:9)

consump_pts_total %<>% mutate(across(all_of(consump_cols), ~ as.numeric(as.character(.))))
consump_pts_reclaimed %<>% mutate(across(all_of(consump_cols), ~ as.numeric(as.character(.))))
consump_pts_potable %<>% mutate(across(all_of(consump_cols), ~ as.numeric(as.character(.))))

consump_pts_total %<>%
  rowwise() %>%                                   #go row by row?? cuz it's not cooperating
  mutate(ConsumpAvg = mean(c_across(all_of(consump_cols)), na.rm = TRUE)) %>%
  ungroup()
consump_pts_reclaimed %<>%
  rowwise() %>%                                   #go row by row?? cuz it's not cooperating
  mutate(ConsumpAvg = mean(c_across(all_of(consump_cols)), na.rm = TRUE)) %>%
  ungroup()
consump_pts_potable %<>%
  rowwise() %>%                                   #go row by row?? cuz it's not cooperating
  mutate(ConsumpAvg = mean(c_across(all_of(consump_cols)), na.rm = TRUE)) %>%
  ungroup()

#apparently curved geometry types are not supported...
#st_geometry_type(parcels_vector)
parcels_vector <- parcels_vector %>% st_cast("MULTIPOLYGON") #approximate curve shape with straight lines
#st_geometry_type(parcels_vector) double-check it worked

#do the spatial join
total_parcels <- st_join(parcels_vector, consump_pts_total, join = st_contains)
potable_parcels <- st_join(parcels_vector, consump_pts_potable, join = st_contains)
reclaimed_parcels <- st_join(parcels_vector, consump_pts_reclaimed, join = st_contains)

#remove parcels that did not contain a point
#(since my parcels layer contains parcels for all of Seminole County I don't want all the parcels;
#I also don't want parcels that are just random properties/land not hooked up to water)
total_parcels %<>% filter(!is.na(LocationCode))
potable_parcels %<>% filter(!is.na(LocationCode))
reclaimed_parcels %<>% filter(!is.na(LocationCode))

#transform to WGS84 (required for mapping in maplibre/web -- VERY IMPORTANT)
total_parcels %<>% st_transform(crs = 4326)
#Didn't actually end up using these:
potable_parcels %<>% st_transform(crs = 4326)
reclaimed_parcels %<>% st_transform(crs = 4326)

#get JUST the parcels ID-ed by address and location code (all other info will be joined in the backend somehow)
#write to geoJSON
#total_parcels %<>% select(Address, LocationCode, Shape) %>% distinct(Address, LocationCode)
sf::st_write(total_parcels, dsn = "TotalParcelsWGS.geojson", driver = "GeoJSON")