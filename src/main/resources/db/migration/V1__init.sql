CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT         NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE vehicles (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    vehicle_name  VARCHAR(100) NOT NULL,
    license_plate VARCHAR(20),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_vehicles_user_id ON vehicles (user_id);

CREATE TABLE service_records (
    id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id        UUID          NOT NULL REFERENCES vehicles (id) ON DELETE CASCADE,
    service_date      DATE          NOT NULL,
    odometer          INTEGER       NOT NULL,
    parts_replaced    TEXT,
    total_cost        NUMERIC(12, 2),
    receipt_image_url TEXT,
    notes             TEXT,
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_service_records_vehicle_id ON service_records (vehicle_id);
CREATE INDEX idx_service_records_service_date ON service_records (service_date DESC);
