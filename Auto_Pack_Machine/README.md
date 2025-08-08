# Auto Pack Machine

Warehouse automation for LinnWorks - automatically processes orders and formats picking lists.

## What it does

- Scans barcodes and processes single-item orders automatically
- Converts picking data from CSV to formatted Excel sheets
- Prevents manual errors in order processing

## Files

**Tampermonkey Scripts:**
- `Part 1` - Disables checkboxes in LinnWorks
- `Part 2` - Auto-processes orders when you scan barcodes

**Data Tools:**
- `format_picking_list.ipynb` - Formats picking lists for printing
- `picking.csv` - Raw data input
- `formatted_test.xlsx` - Formatted output
- `Gordon-Testing-Open Orders.sql` - Gets single-item orders from database

## Setup

**Browser Scripts:**
1. Install Tampermonkey extension
2. Add both JavaScript files as new scripts
3. Set URL match to `https://www.linnworks.net/*`

**Excel Formatting:**
1. Install Python with pandas and openpyxl
2. Put your CSV data in `picking.csv`
3. Run the notebook to get formatted Excel file

## How to use

1. Open LinnWorks with Tampermonkey running
2. Scan barcodes - orders process automatically
3. Export picking data to CSV
4. Run Python script to format for printing
5. Print formatted Excel sheet for warehouse team

## Notes

- Only works with single-item orders
- Test before using in production
- Check console logs if something breaks