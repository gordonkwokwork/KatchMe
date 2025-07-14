import pandas as pd
import os

# 1. Convert Excel to CSV (original code)
excel_file = '导出订单地址.xlsx'
csv_file = '导出订单地址.csv'

# Read Excel and save as CSV
df = pd.read_excel(excel_file)
df.to_csv(csv_file, index=False, encoding='utf-8-sig')

# 2. Reorganize CSV (new logic)
# Reload the CSV to process (avoid Excel formatting issues)
df = pd.read_csv(csv_file)

# Identify duplicate and unique GSP订单号
duplicate_mask = df.duplicated('GSP订单号', keep=False)
duplicate_orders = df[duplicate_mask]
unique_orders = df[~duplicate_mask].sort_values('卖家SKU')

# Combine: duplicates first, then sorted uniques
final_df = pd.concat([duplicate_orders, unique_orders])

# Overwrite the CSV with reorganized data
final_df.to_csv(csv_file, index=False, encoding='utf-8-sig')

# 3. Delete the original Excel file
os.remove(excel_file)

print(f"Success! Converted '{excel_file}' to '{csv_file}', reorganized orders, and deleted Excel.")