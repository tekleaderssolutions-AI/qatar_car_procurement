CREATE INDEX IF NOT EXISTS idx_vehicle_inventory_risk_flag ON vehicle_inventory(risk_flag);
CREATE INDEX IF NOT EXISTS idx_vehicle_inventory_make ON vehicle_inventory(make);
CREATE INDEX IF NOT EXISTS idx_vehicle_inventory_year ON vehicle_inventory(year);
CREATE INDEX IF NOT EXISTS idx_customers_next_upgrade_prediction ON customers(next_upgrade_prediction);

