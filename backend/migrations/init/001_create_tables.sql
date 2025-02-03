-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create claims table to store all claim history
CREATE TABLE IF NOT EXISTS claims (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount DECIMAL NOT NULL,
    claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create latest_claims table as an index
CREATE TABLE IF NOT EXISTS latest_claims (
    user_id INTEGER PRIMARY KEY REFERENCES users(id),
    claim_id INTEGER REFERENCES claims(id),
    claimed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_claims_claimed_at ON claims(claimed_at);

-- Create trigger function
CREATE OR REPLACE FUNCTION update_latest_claim()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO latest_claims (user_id, claim_id, claimed_at)
    VALUES (NEW.user_id, NEW.id, NEW.claimed_at)
    ON CONFLICT (user_id)
    DO UPDATE SET
        claim_id = NEW.id,
        claimed_at = NEW.claimed_at;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_latest_claim ON claims;
CREATE TRIGGER trigger_update_latest_claim
AFTER INSERT ON claims
FOR EACH ROW
EXECUTE FUNCTION update_latest_claim(); 