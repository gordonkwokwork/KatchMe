# %%
import pandas as pd
# File paths
linnworks_csv = 'shein_open_order_tracking_info.csv'  # Linnworks CSV
address_csv = '导出订单地址.csv'  # Address/order CSV
output_xlsx = 'Multiple+waybill+upload+template.xlsx'

# Load Linnworks tracking data
linnworks_df = pd.read_csv(linnworks_csv)

# Load order address data
address_df = pd.read_csv(address_csv)

# Rename for merge
address_df.rename(columns={'GSP订单号': 'Order Number', '商品ID': 'Item ID'}, inplace=True)

# Merge on 'Order Number'
merged_df = pd.merge(address_df, linnworks_df, on='Order Number', how='left')

# Select relevant columns
columns_to_keep = ['Order Number', 'Item ID', 'Tracking Number', 'Logistics Provider']
result_df = merged_df[columns_to_keep]

# Save to Excel
result_df.to_excel(output_xlsx, index=False)

print(f'Successfully saved merged data to {output_xlsx}')


