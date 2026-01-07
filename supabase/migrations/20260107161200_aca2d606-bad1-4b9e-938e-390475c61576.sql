-- Problem 2: Remove incorrect level entries from bridge_up table

-- Remove Bachelor entry for MA++ (should only have Master)
DELETE FROM "bridge_up(U-P)" WHERE id_bridge_up = '72d04660-77ee-438f-a74c-0b490fe45cfb';

-- Remove Master entry for CH-ENG (should only have Bachelor)
DELETE FROM "bridge_up(U-P)" WHERE id_bridge_up = 'c8e5a476-ccfe-4aee-a8d8-c8753033e03c';

-- Remove Bachelor entry for CHB-ENG (should only have Master)
DELETE FROM "bridge_up(U-P)" WHERE id_bridge_up = '319b5510-a6ef-4919-bc9b-d612c4e6afb0';

-- Remove Bachelor entry for CYB (should only have Master)
DELETE FROM "bridge_up(U-P)" WHERE id_bridge_up = '3b3f44c5-16ed-4469-90c4-cdd728a8a927';