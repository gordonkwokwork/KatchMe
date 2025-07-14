# %%
import pandas as pd
import os
import sys

# Handle paths correctly
if getattr(sys, 'frozen', False):
    script_dir = os.path.dirname(sys.executable)
else:
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
    except NameError:
        script_dir = os.getcwd()

file_path = os.path.join(script_dir, "导出订单地址.csv")

# Load the CSV file
df = pd.read_csv(file_path, encoding='utf-8-sig')

# Columns to drop (keep 商品ID, 国家, 省份, 城市)
columns_to_drop = [
    "订单创建时间", "要求签收时间", "商品名称", "规格", "货号",
    "平台SKU", "平台SKC", "平台SPU", "商品价格", "商品预计收入",
    "币种", "国家", "区", "用户姓氏", "用户名字", "用户邮箱", "税号"
]

# Drop the columns
df = df.drop(columns=columns_to_drop, errors='ignore')

# Save back to CSV
df.to_csv(file_path, index=False, encoding='utf-8-sig')

# Open the CSV file
os.startfile(file_path)

print("Done: Columns dropped, saved as CSV, file opened.")


