-- Add location_id to restock_requests
alter table restock_requests add column location_id uuid references locations(id);

-- Backfill location_id from shifts table
update restock_requests
set location_id = shifts.location_id
from shifts
where restock_requests.shift_id = shifts.id;

-- (Optional) Add index for performance since we will query by location_id
create index idx_restock_requests_location_id on restock_requests(location_id);
