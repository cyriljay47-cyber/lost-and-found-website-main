-- Alter image_url column to LONGTEXT to support large base64 images
USE lost_and_found;

ALTER TABLE items MODIFY COLUMN image_url LONGTEXT;
