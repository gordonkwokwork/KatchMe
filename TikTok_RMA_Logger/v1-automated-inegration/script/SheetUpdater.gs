function doPost(e) {
  try {
    const sheetId = 'PLACE GOOGLE SHEET ID'; // Replace with your Sheet ID
    const sheetName = 'rma';
    
    const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
    const data = JSON.parse(e.postData.contents);
    
    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Order ID', 'Return ID', 'Employee Name', 'Date', 'Time']);
    }
    
    // Check for duplicate Return ID (Column B)
    const returnId = data.returnId || 'UNKNOWN_RETURN';
    
    if (returnId !== 'UNKNOWN_RETURN') {
      const dataRange = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1); // Column B (Return ID), starting from row 2
      const existingReturnIds = dataRange.getValues().flat(); // Get all Return IDs as flat array
      
      // Check if this Return ID already exists
      if (existingReturnIds.includes(returnId)) {
        console.log('Duplicate Return ID detected:', returnId);
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Duplicate entry - Return ID already exists',
          returnId: returnId
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // Use the separate date and time fields sent from the script
    const date = data.date || '';  // DD/MM/YYYY
    const time = data.time || '';  // HH:MM:SS
    
    // Add the row with Order ID, Return ID, Employee Name, Date, Time
    sheet.appendRow([
      data.orderId || 'UNKNOWN_ORDER',
      returnId, 
      data.employeeName || 'UNKNOWN_EMPLOYEE',
      date,
      time
    ]);
    
    // Log the data being written for debugging
    console.log('Successfully wrote to sheet:', {
      orderId: data.orderId,
      returnId: returnId,
      employeeName: data.employeeName,
      date: date,
      time: time
    });
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Data added successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.log('Error in doPost:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}