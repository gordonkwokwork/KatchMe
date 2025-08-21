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
    -- AND o.dReceievedDate >= '2025-08-19 14:00:00'  -- Start datetime
    AND o.dReceievedDate <= '2025-08-20 09:00:00'  -- End datetime
    -- Session1-'2025-08-20 14:00:00'-'2025-08-21 09:00:00'
    -- Session2-'2025-08-20 09:00:00'-'2025-08-20 14:00:00'
  AND o.pkOrderID IN (
    SELECT fkOrderID
    FROM [Open_OrderItem]
    GROUP BY fkOrderID
    HAVING COUNT(*) = 1
  )
GROUP BY si.ItemNumber
ORDER BY si.ItemNumber DESC