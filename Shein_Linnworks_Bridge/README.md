# Shein-Linnworks Bridge

A Python automation toolkit for processing Shein order data and generating tracking uploads for Linnworks integration.

## Features

- **Step 0**: Clean CSV data by removing unnecessary columns
- **Step 1**: Convert Excel to CSV and reorganize orders by duplicates
- **Step 2**: Merge order data with tracking information

## Workflow

1. Export order data from Shein as Excel file (`导出订单地址.xlsx`)
2. Run scripts in sequence to process and merge data
3. Generate final Excel template for bulk tracking upload

## Files

- `shein_step0_delete_column_csv.ipynb` - Column cleanup script
- `shein_step1_convert_file_type.ipynb` - Excel to CSV conversion and sorting
- `shein_step2_merge.ipynb` - Data merging with tracking info

## Requirements

- Python 3.13+
- pandas
- openpyxl

## Usage

Run the Jupyter notebooks in order (Step 0 → Step 1 → Step 2) to process your order data.