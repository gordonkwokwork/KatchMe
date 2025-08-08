-- Filters open orders that have exactly one item
-- Limits results to orders from the UK WAREHOUSE
-- Groups by SKU (ItemNumber)
-- Returns total quantity ordered per SKU
-- Sorts SKUs in descending order


SELECT
  -- 'Channel Order ID' = o.ReferenceNum,
  -- 'Channel' = o.Source + '_' + o.SubSource,
  -- 'Channel SKU' = oi.ChannelSKU,
  -- 'LW Order ID' = o.norderID,
  'LW SKU' = si.ItemNumber,
  -- 'Qty ordered' = oi.nqty
  SUM(oi.nqty) AS [Qty ordered]
FROM
  [Open_Order] o
INNER JOIN
  [Open_OrderItem] oi ON o.pkOrderID = oi.fkOrderID
LEFT JOIN
  [StockItem] si ON si.pkStockItemId = oi.fkStockItemID
LEFT JOIN
  [StockLocation] sl ON o.FulfillmentLocationId = sl.pkStockLocationId
WHERE
  sl.Location = 'UK WAREHOUSE'
  AND o.SubSource <> 'TikTok-Quick Steal'
  AND o.pkOrderID IN (
    SELECT fkOrderID
    FROM [Open_OrderItem]
    GROUP BY fkOrderID
    HAVING COUNT(*) = 1
  )
GROUP BY si.ItemNumber
ORDER BY si.ItemNumber DESC
