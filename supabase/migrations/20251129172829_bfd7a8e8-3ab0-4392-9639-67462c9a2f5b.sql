-- Delete fictitious test patent data
DELETE FROM patents 
WHERE patent_number IN (
  'BR102023001234',
  'BR102022005678', 
  'BR102024002345',
  'BR102021008901',
  'BR102020003456'
);