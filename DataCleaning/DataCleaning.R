library(tidyverse)
library(magrittr)
library(sf)
library(readxl)

# LOAD DATA
raw <- st_read("RawData/WaterConsumption.gdb", layer = "ConsumptionJanSept2025")
prop_codes <- read_excel("RawData/PropertyUseCode.xlsx") %>%
  rename(PropertyType = Code, PropertyDesc = Description)

# RENAME, FORMAT, JOIN
cleaned <- raw %>%
  rename(
    Juris = JURIS,
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
    SubdivisionCode = SUBDIVISIONS
  ) %>%
  mutate(
    ReadOn = ymd(ReadOn),
    Cycle = substr(CYCLE_RTE, 1, 1),
    Route = substr(CYCLE_RTE, nchar(CYCLE_RTE), nchar(CYCLE_RTE)),
    WaterType = case_when(
      WaterType == "RW" ~ "Reclaimed",
      WaterType == "WA" ~ "Potable",
      TRUE ~ WaterType
    ),
    PropertyCat = case_when(
      PropertyType %in% c("ALF","APTS","DUP","1","RM","SFR","TH","901","15VR") ~ "Residential",
      PropertyType %in% c("10-A","10-B","10-C","10-D","10-E","10-I","10-M","15VC") ~ "Commercial",
      PropertyType %in% c("10-P","P","SCH") ~ "Public",
      PropertyType %in% c("99") ~ "Shell",
      TRUE ~ "Miscellaneous"
    )
  ) %>%
  dplyr::select(-CYCLE_RTE) %>%
  # join the description lookup on PropertyType = Code
  left_join(prop_codes, by = "PropertyType") %>%
  relocate(PropertyDesc, .after = PropertyCat) %>%
  relocate(Cycle, Route, .after = MeterSize)

# DEDUPLICATION
# "Duplicate" = same LocationCode + ReadOn + WaterType; keep the max Consump is the deduplication logic
cleaned <- cleaned %>%
  group_by(LocationCode, ReadOn, WaterType) %>%
  mutate(Consump = max(Consump, na.rm = TRUE)) %>%
  slice(1) %>%
  ungroup() %>%
  mutate(Consump = pmax(Consump, 0)) # recode negatives to 0 pmax() just finds the max out of two vectors

# SPLIT BY WATER TYPE & ASSIGN BILLING PERIOD
# billing period decided by order b/c there's no better way
assign_bills <- function(df) {
  df %>%
    group_by(LocationCode) %>%
    arrange(ReadOn, .by_group = TRUE) %>%
    mutate(Bill = row_number()) %>%
    filter(Bill <= 9) %>%
    ungroup()
}

potable   <- cleaned %>% filter(WaterType == "Potable")   %>% assign_bills()
reclaimed <- cleaned %>% filter(WaterType == "Reclaimed") %>% assign_bills()

# BUILD COMBINED (Potable + Reclaimed) PER LOCATION + BILL
# Full join so locations with only one type still appear
combined_long <- potable %>%
  st_drop_geometry() %>%
  dplyr::select(LocationCode, Bill, Consump) %>%
  full_join(
    reclaimed %>% st_drop_geometry() %>% dplyr::select(LocationCode, Bill, Consump),
    by     = c("LocationCode", "Bill"),
    suffix = c("_p", "_r")
  ) %>%
  mutate(
    Consump   = coalesce(Consump_p, 0) + coalesce(Consump_r, 0),
    WaterType = "Combined"
  ) %>%
  dplyr::select(LocationCode, Bill, Consump, WaterType)

# OUTPUT 1 -- SEARCHBAR GeoJSON (Address + LocationCode + point)
searchbar <- cleaned %>%
  distinct(LocationCode, .keep_all = TRUE) %>%
  dplyr::select(Address, LocationCode) %>%
  st_transform(crs = 4326)

st_write(searchbar, "CleanedData/OviedoWaterSearchbar.geojson",
         driver = "GeoJSON", delete_dsn = TRUE)

# OUTPUT 2 -- LONG CSV (all three water types, all attributes, no geometry)
long_all <- bind_rows(
  potable   %>% st_drop_geometry(),
  reclaimed %>% st_drop_geometry(),
  # combined doesn't carry static attrs; join them back from potable or reclaimed
  combined_long %>%
    left_join(
      cleaned %>%
        st_drop_geometry() %>%
        distinct(LocationCode, .keep_all = TRUE) %>%
        dplyr::select(-ReadOn, -Consump, -WaterType),
      by = "LocationCode"
    )
)

write.csv(long_all, "CleanedData/OviedoWaterLong.csv", row.names = FALSE)

# OUTPUT 3 -- WIDE GeoJSON
# Columns made as Potable1, Reclaimed1, Combined1, Potable2, and so on
static_cols <- c("LocationCode","Juris","Route","Cycle","MeterSize","CustomerCode",
                 "Address","Misc","PropertyType","PropertyCat","PropertyDesc",
                 "InOut","SubdivisionCode")

# helper: pivot one water-type df to wide, keeping static cols
pivot_type <- function(df, prefix, has_static = TRUE) {
  base <- df %>% st_drop_geometry()
  if (has_static) {
    base %>%
      pivot_wider(
        id_cols     = all_of(static_cols),
        names_from  = Bill,
        values_from = Consump,
        names_glue  = paste0(prefix, "{Bill}")
      )
  } else {
    base %>%
      pivot_wider(
        id_cols     = LocationCode,
        names_from  = Bill,
        values_from = Consump,
        names_glue  = paste0(prefix, "{Bill}")
      )
  }
}

potable_wide   <- pivot_type(potable,        "Potable",   has_static = TRUE)
reclaimed_wide <- pivot_type(reclaimed,      "Reclaimed", has_static = TRUE)
combined_wide  <- pivot_type(combined_long,  "Combined",  has_static = FALSE)

# add per-type averages (rowMeans respects NA)
add_avg <- function(df, prefix) {
  cols <- paste0(prefix, 1:9)
  existing <- cols[cols %in% names(df)]
  df %>%
    mutate(across(all_of(existing), as.numeric)) %>%
    mutate(!!paste0(prefix, "Avg") := rowMeans(across(all_of(existing)), na.rm = TRUE))
}

potable_wide   <- add_avg(potable_wide,   "Potable")
reclaimed_wide <- add_avg(reclaimed_wide, "Reclaimed")
combined_wide  <- add_avg(combined_wide,  "Combined")

# join all three together; potable carries the static attrs
wide_all <- potable_wide %>%
  left_join(
    reclaimed_wide %>% dplyr::select(LocationCode, starts_with("Reclaimed")),
    by = "LocationCode"
  ) %>%
  left_join(
    combined_wide  %>% dplyr::select(LocationCode, starts_with("Combined")),
    by = "LocationCode"
  )

# reorder the columns more nicely: static attributes | Potable1, Reclaimed1, Combined1, Potable2, ... | averages
interleaved <- map(1:9, ~ paste0(c("Potable","Reclaimed","Combined"), .x)) %>%
  unlist() %>%
  .[. %in% names(wide_all)]      # drop any that don't exist (e.g. if <9 bills)

avg_cols <- c("PotableAvg","ReclaimedAvg","CombinedAvg") %>% .[. %in% names(wide_all)]

wide_all <- wide_all %>%
  dplyr::select(all_of(static_cols), all_of(interleaved), all_of(avg_cols))

# attach point geometry (one point per LocationCode, WGS84)
geom_lookup <- cleaned %>%
  distinct(LocationCode, .keep_all = TRUE) %>%
  dplyr::select(LocationCode) %>%
  st_transform(crs = 4326) # WGS84 needed for mapping

wide_sf <- geom_lookup %>%
  left_join(wide_all, by = "LocationCode")

st_write(wide_sf, "CleanedData/OviedoWaterWide.geojson",
         driver = "GeoJSON", delete_dsn = TRUE)

parcels <- st_read("RawData/Parcels.gdb", layer = "Parcels") %>%
  st_cast("MULTIPOLYGON") %>%
  st_make_valid() %>%
  st_transform(crs = 4326)

consump_cols_all <- names(wide_sf)[str_detect(names(wide_sf), "^(Potable|Reclaimed|Combined)")]
parcels <- st_read("RawData/Parcels.gdb", layer = "Parcels") %>%
  st_cast("MULTIPOLYGON") %>%
  st_make_valid() %>%
  st_transform(crs = 4326)

consump_cols_all <- names(wide_sf)[str_detect(names(wide_sf), "^(Potable|Reclaimed|Combined)")]
static_cols_all <- names(wide_sf)[!names(wide_sf) %in% c(consump_cols_all, attr(wide_sf, "sf_column"))]

parcels <- parcels %>% mutate(.parcel_idx = row_number())

points_tagged <- st_join(wide_sf, parcels %>% dplyr::select(.parcel_idx),
                         join = st_within, left = FALSE)

parcel_consump <- points_tagged %>%
  st_drop_geometry() %>%
  group_by(.parcel_idx) %>%
  summarise(
    across(all_of(static_cols_all),  first),
    across(all_of(consump_cols_all), ~ sum(.x, na.rm = TRUE)),
    n_meters = n(),
    .groups = "drop"
  )

parcel_sf <- parcels %>%
  inner_join(parcel_consump, by = ".parcel_idx") %>%
  dplyr::select(-.parcel_idx)

st_write(parcel_sf, "CleanedData/OviedoParcels.geojson",
         driver = "GeoJSON", delete_dsn = TRUE)