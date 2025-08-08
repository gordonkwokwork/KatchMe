function doPost(e) {
  try {
    console.log('=== doPost called ===');
    console.log('Event object exists:', !!e);
    console.log('Parameter object:', e ? e.parameter : 'e is undefined');
    console.log('Parameter keys:', e && e.parameter ? Object.keys(e.parameter) : 'no keys');
    
    if (!e || !e.parameter) {
      throw new Error('No parameter object found');
    }
    
    const trackingNumber = e.parameter.trackingNumber;
    const userName = e.parameter.userName;
    const date = e.parameter.date;
    const time = e.parameter.time;
    
    console.log('Extracted data:', {
      trackingNumber: trackingNumber,
      userName: userName, 
      date: date,
      time: time
    });
    
    if (!trackingNumber || !userName) {
      throw new Error('Missing required fields: trackingNumber or userName');
    }
    
    const spreadsheetId = 'PLACE SPREADSHEETID';
    console.log('Opening spreadsheet:', spreadsheetId);
    
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    console.log('Spreadsheet opened successfully');
    
    const sheet = spreadsheet.getSheetByName('Log');
    console.log('Sheet found:', !!sheet);
    console.log('Sheet name:', sheet ? sheet.getName() : 'null');
    
    if (!sheet) {
      throw new Error('Sheet "Log" not found');
    }
    
    // CHANGED: Only append to columns A-D to preserve array formulas in E-H
    const lastRow = sheet.getLastRow() + 1;
    const range = sheet.getRange(lastRow, 1, 1, 4); // Only columns A-D
    range.setValues([[trackingNumber, userName, date, time]]);
    
    console.log('✅ Row added successfully to columns A-D only!');
    
    // Get the last row to confirm it was added
    const lastRowData = sheet.getRange(lastRow, 1, 1, 4).getValues()[0];
    console.log('Last row data after append:', lastRowData);
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true, message: 'Data logged successfully'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('❌ Error in doPost:', error);
    console.error('Error stack:', error.stack);
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}