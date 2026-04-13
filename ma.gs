function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    var sheetName = data.sheet;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet && !action) {
      return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": "Sheet not found"})).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'deleteRow') {
      sheet.deleteRow(data.rowIndex);
      return ContentService.createTextOutput(JSON.stringify({"status": "success"})).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'updateReportStatus') {
      sheet.getRange(data.rowIndex, 6).setValue(data.status); // Cột F là trạng thái
      return ContentService.createTextOutput(JSON.stringify({"status": "success"})).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Default append behavior
    if (!action) {
      if (sheetName === 'Counseling') {
        sheet.appendRow([data.time, data.sessionId, data.id, data.type, data.chat]);
      } else if (sheetName === 'Reports') {
        sheet.appendRow([data.time, data.ticketCode, data.id, data.type, data.content, "Cô đã tiếp nhận thông tin. Em hãy quay lại sau 1-2 giờ để nhận câu trả lời nhé."]);
      } else if (sheetName === 'Gratitude') {
        sheet.appendRow([data.time, data.sender, data.receiver, data.message]);
      } else if (sheetName === 'ParentCounseling') {
        sheet.appendRow([data.time, data.sessionId, data.chat]);
      }
      return ContentService.createTextOutput(JSON.stringify({"status": "success"})).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": "Invalid action"})).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function getSheetDataWithIndex(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  var result = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    row.push(i + 1); // Thêm rowIndex vào cuối mảng
    result.push(row);
  }
  // Đảo ngược mảng để hiển thị mới nhất lên đầu
  return result.reverse();
}

function doGet(e) {
  try {
    var action = e.parameter.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (action === 'adminLogin') {
      var username = e.parameter.username;
      var password = e.parameter.password;
      var sheet = ss.getSheetByName('Admins');
      if (!sheet) return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": "Sheet Admins not found"})).setMimeType(ContentService.MimeType.JSON);
      
      var data = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] == username && data[i][1] == password) {
          return ContentService.createTextOutput(JSON.stringify({"status": "success"})).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({"status": "invalid_credentials"})).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'getAllData') {
      var result = {
        reports: getSheetDataWithIndex(ss, 'Reports'),
        counseling: getSheetDataWithIndex(ss, 'Counseling'),
        gratitude: getSheetDataWithIndex(ss, 'Gratitude'),
        parentCounseling: getSheetDataWithIndex(ss, 'ParentCounseling')
      };
      return ContentService.createTextOutput(JSON.stringify({"status": "success", "data": result})).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'getQuote') {
      var sheet = ss.getSheetByName('Quotes');
      if (!sheet) return ContentService.createTextOutput(JSON.stringify({"quote": "Chúc em một ngày tốt lành!"})).setMimeType(ContentService.MimeType.JSON);
      
      var data = sheet.getDataRange().getValues();
      if (data.length <= 1) return ContentService.createTextOutput(JSON.stringify({"quote": "Chúc em một ngày tốt lành!"})).setMimeType(ContentService.MimeType.JSON);
      
      var randomIndex = Math.floor(Math.random() * (data.length - 1)) + 1;
      var quote = data[randomIndex][0];
      
      return ContentService.createTextOutput(JSON.stringify({"quote": quote})).setMimeType(ContentService.MimeType.JSON);
    } 
    else if (action === 'checkTicket') {
      var code = e.parameter.code;
      var sheet = ss.getSheetByName('Reports');
      if (!sheet) return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": "Sheet not found"})).setMimeType(ContentService.MimeType.JSON);
      
      var data = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (data[i][1] === code) {
          return ContentService.createTextOutput(JSON.stringify({"status": "success", "ticketStatus": data[i][5]})).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({"status": "not_found"})).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'getLibrary') {
      var sheet = ss.getSheetByName('Library');
      if (!sheet) return ContentService.createTextOutput(JSON.stringify({"data": []})).setMimeType(ContentService.MimeType.JSON);
      var data = sheet.getDataRange().getValues();
      var result = [];
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] || data[i][1]) {
          result.push({
            id: String(data[i][0]),
            title: String(data[i][1]),
            content: String(data[i][2]),
            type: String(data[i][3]).toLowerCase() === 'image' ? 'image' : 'text'
          });
        }
      }
      return ContentService.createTextOutput(JSON.stringify({"data": result})).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'getImpactStats') {
      var sheet = ss.getSheetByName('ImpactStats');
      if (!sheet) return ContentService.createTextOutput(JSON.stringify({"data": []})).setMimeType(ContentService.MimeType.JSON);
      var data = sheet.getDataRange().getValues();
      var result = [];
      for (var i = 1; i < data.length; i++) {
        if (data[i][0]) {
          result.push({
            month: String(data[i][0]),
            chatCount: Number(data[i][1]) || 0,
            reportCount: Number(data[i][2]) || 0,
            parentCount: Number(data[i][3]) || 0,
            gratitudeCount: Number(data[i][4]) || 0
          });
        }
      }
      return ContentService.createTextOutput(JSON.stringify({"data": result})).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({"status": "invalid_action"})).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}
