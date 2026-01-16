# Seed Data Instructions

To enable the mock users and locations for testing:

1.  Run the migration file `migrations/02_seed_mock_data.sql` in your Supabase SQL Editor.
    *   This script removes the strict dependency on Supabase Auth (Auth Users) for the `profiles` table, allowing us to create "app-only" users suitable for a kiosk/shared-device environment.
    *   It populates `locations` and `profiles`.

## Mock Credentials
Once the script is run, you can log in with:

| Role | User | PIN |
| :--- | :--- | :--- |
| **Barista** | John Barista | `1234` |
| **Barista** | Jane Smith | `1234` |
| **Manager** | Sarah Manager | `5678` |
| **C-Suite** | Michael CEO | `9999` |
