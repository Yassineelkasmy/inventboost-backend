SET session_replication_role = 'replica'; -- Disable foreign key checks (PostgreSQL)

DROP TABLE IF EXISTS 
    providers,
    users,
    user_profiles
    CASCADE;

SET session_replication_role = 'origin'; -- Re-enable foreign key checks (PostgreSQL)
