/* Route
 * All Request with Method GET will be process here
 */
var email = Session.getActiveUser().getEmail();
var ldap = email.split("@")[0];

// Test
// const DUMP_ID = "1zkW4cvxVHJxAlQRSM-1hWhzksfJuOoy2nK03TZlhluY"
// Prod
const DUMP_ID = "1k2jLrOAeCG3vvCxX1xm205fztiXoAEuFuqPDGJk3Ln4";
// SPR v2
// const DUMP_ID = "17gZg4NvVTcpQTHf1GcC5CoGsVYzzge5Bldk89V7Gxsc";

const SPR_DUMP = SpreadsheetApp.openById(DUMP_ID);
const MONITOR_LOGS_TAB = SPR_DUMP.getSheetByName("Monitor Logs");
const QM_REF_TAB = SPR_DUMP.getSheetByName("QM - References");

function setStudyIDRef(array) {
  if (array == undefined) return
  const currentRound = getRound();
  console.log({currentRound})

  const { 'currentRound':scrapedRound, 'logData':scrapedData } = JSON.parse(array);
  console.log({scrapedRound})
  console.log({scrapedData})


  let { 'currentRound':submittedRound, 'logData':submittedData } = getStudyIDRef();
  console.log({submittedRound})
  console.log({submittedData})

  if (currentRound != submittedRound) {
    QM_REF_TAB.getRange("A2").setValue(array);
    console.log(submittedRound, {scrapedData})
  } else {
    scrapedData != undefined && scrapedData != null ? submittedData = [scrapedData,...submittedData].flat() : ''
    console.log({submittedData})
    currentData = QM_REF_TAB.getRange("A2").setValue(JSON.stringify({
      logData: submittedData,
      currentRound: submittedRound
    }));
  }
  
  // let SIDArray = QM_REF_TAB.getRange("A2").setValue(array);
  
  // console.log(SIDArray);

  // return {
  //   message: 'Successfully updated!'
  // }
}

function getRound(){
  let minute = new Date().getMinutes();
  let round = minute >= 30 ? 2 : 1;
  return round;
}

function getStudyIDRef() {
  let SIDArray = QM_REF_TAB.getRange("A2").getValue();
  let parsedData = SIDArray != '' ? JSON.parse(SIDArray) : [];

  return parsedData
}

function _getLastRowSpecial(range) {
  let rowNum = 0;
  let blank = false;
  for(row = 0; row < range.length; row++){

    if(range[row][0] === "" && !blank){
      rowNum = row;
      blank = true;
    }else if(range[row][0] !== ""){
      blank = false;
    };
  };
  return rowNum;
}

function getEmail (){
  return Session.getActiveUser().getEmail();
}

function generateGUID() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
    }
    return 'case' + '-' + s4() + '-' + s4();
}

function yyyymm() {
  var now = new Date();
  var y = now.getFullYear();
  var m = now.getMonth() + 1;
  return '' + y + "-" + (m < 10 ? '0' : '') + m ;
}

function yyyymmdd(date) {
  var now = date == null || date == "" ? new Date() : date;
  var y = now.getFullYear();
  var m = now.getMonth() + 1;
  var d = now.getDate();
  return '' + y + "-" + (m < 10 ? '0' : '') + m + "-" + (d < 10 ? '0' : '') + d;
}

function doIdentifyDate(stringToDate){
  let strArray = stringToDate.split(" ");
  if (isNaN(strArray[0])){
    let currentYear = new Date().getFullYear();
    let yearString = new Date(`${stringToDate} ${currentYear}`);
    return yyyymmdd(yearString);
  } else {
    return strToDate(strArray);
  }
}

function strToDate(strArray){
  // check if minutes, days or hours
  if (strArray[1].includes('day')){
    let hours = strArray[0] * 24,
        minutes = hours * 60,
        seconds = minutes * 60,
        ms = seconds * 1000;
    return getDateDifference(ms);
  } else if(strArray[1].includes('hour')){
    let minutes = strArray[0] * 60,
        seconds = minutes * 60,
        ms = seconds * 1000;
    return getDateDifference(ms);
  } else if(strArray[1].includes('minute')){
    let seconds = strArray[0] * 60,
        ms = seconds * 1000;
    return getDateDifference(ms);
  }

  // return ms is msDifference to subtract from currentDate
}

function getDateDifference(ms){
  // date now - relative dates -> convert to MS
  // ms - currentDate
  // convert MS to Date Object
  // format Date Object to yyyymmdd 
  let currentDate = new Date();
  let differenceMS = currentDate.valueOf() - ms;
  let finalDate = new Date(differenceMS);
  console.log("msRaw: " + ms);
  console.log("differenceMS: " +differenceMS)
  console.log("datifiedMSDiff: " + finalDate)
  return (yyyymmdd(finalDate))
}

function dateAdd(date, interval, units) {
  var ret = new Date(date); //don't change original date
  var checkRollover = function() { if(ret.getDate() != date.getDate()) ret.setDate(0);};
  switch(interval.toLowerCase()) {
    case 'year'   :  ret.setFullYear(ret.getFullYear() + units); checkRollover();  break;
    case 'quarter':  ret.setMonth(ret.getMonth() + 3*units); checkRollover();  break;
    case 'month'  :  ret.setMonth(ret.getMonth() + units); checkRollover();  break;
    case 'week'   :  ret.setDate(ret.getDate() + 7*units);  break;
    case 'day'    :  ret.setDate(ret.getDate() + units);  break;
    case 'hour'   :  ret.setTime(ret.getTime() + units*3600000);  break;
    case 'minute' :  ret.setTime(ret.getTime() + units*60000);  break;
    case 'second' :  ret.setTime(ret.getTime() + units*1000);  break;
    default       :  ret = undefined;  break;
  }
  return ret;
}

function getDateValue(date) {
  if (!date) return
  let parsedDate = Date.parse(date);
  let stringDate = parseInt(parsedDate.toString().substring(0, 7))
  return stringDate
}

function getRecentSubmittedSID(){
  const studyIDColumn = 25;
  const lastNumberValue = 30;
  const columnNumber = 3;
  let data = {}

  const rangeValues = MONITOR_LOGS_TAB.getRange('T:U').getValues();
  const lastRowNumber = _getLastRowSpecial(rangeValues);
  const lastRowMinusThirty = lastRowNumber != 0 ? (lastRowNumber-lastNumberValue) : 0;
  const lastThirtyValues = MONITOR_LOGS_TAB.getRange(lastRowMinusThirty, studyIDColumn, lastNumberValue, columnNumber).getValues();
  const filteredArray = lastThirtyValues.map(([studyID,,lastModifiedDate]) => {
    let caseData = {};
    let valueDate = getDateValue(lastModifiedDate)
    let uniqueID = `${studyID}-${valueDate}`
    return caseData = {
      studyID,
      valueDate,
      uniqueID
    }
  })
  return lastThirtyValues.length ? data = {
    recentCases: filteredArray,
    lastRowNumber
  } : [];
}

function doPost(e){
//  myLockFunction(e)
  // Test
  // const DUMP_ID = "1zkW4cvxVHJxAlQRSM-1hWhzksfJuOoy2nK03TZlhluY"
  // Prod
  const DUMP_ID = "1k2jLrOAeCG3vvCxX1xm205fztiXoAEuFuqPDGJk3Ln4";
  // SPR v2
  // const DUMP_ID = "17gZg4NvVTcpQTHf1GcC5CoGsVYzzge5Bldk89V7Gxsc";
  const TAB_NAME = "Monitor Logs";
  const SPR_DUMP = SpreadsheetApp.openById(DUMP_ID);
  const MONITOR_LOGS_TAB = SPR_DUMP.getSheetByName(TAB_NAME);
 
  const body = e.postData.contents;
  const bodyJSON = JSON.parse(body);
  let jsonResponse = {};
  let ldapToggle = e.parameter.ldap == "me" ? ldap : e.parameter.ldap;
  let flag = e.parameter.flag || 0;

  // Test Endpoint
  // console.log(bodyJSON);

  // Data Schema
  // name: tdText[0],
  // surveyLanguage: tdText[1],
  // surveyURL: tdText[3],
  // lastUpdatedTime: tdText[4]

  if (flag == 1){
    console.log({flag});
  } else {
    const columnToCheck = MONITOR_LOGS_TAB.getRange("T:U").getValues();
    const lastRowNumber = _getLastRowSpecial(columnToCheck);
    const scrapedCasesArray = bodyJSON.map(({ surveyURL,lastUpdatedTime }) => {
      let data;
      let studyID = surveyURL.split('configurationId=')[1];
      return data = {
        studyID,
        surveyURL,
        lastUpdatedTime
      }
    })
    // const { recentCases,lastRowNumber } = getRecentSubmittedSID();
    // const submittedUIDArray = recentCases.map(({ studyID }) => studyID);
    const submittedUIDArray = getStudyIDRef();
    const finalData = scrapedCasesArray.filter(({ studyID },i) => {
      if (submittedUIDArray == undefined) return studyID
      let { logData,currentRound } = submittedUIDArray;
      return logData ? !logData.includes(studyID) : studyID
    })
    console.log({submittedUIDArray})
    console.log({scrapedCasesArray})
    console.log({finalData})

    const dashboardData = finalData.map((c) => {
      return [
        c.surveyURL,
        c.lastUpdatedTime
      ]
    });
    const logData = finalData.map(({studyID}) => studyID);
    const cacheObject = {
      logData,
      currentRound: getRound()
    }
    console.log({logData})
    console.log({cacheObject})
    console.log({lastRowNumber})
    console.log(dashboardData.length)
    const stringifiedCacheObject = logData.length ? JSON.stringify(cacheObject) : JSON.stringify([]);
    // Add Cases from RB
    setStudyIDRef(stringifiedCacheObject);
    dashboardData.length ? MONITOR_LOGS_TAB.getRange(lastRowNumber + 1, 20, dashboardData.length, 2).setValues(dashboardData) : console.log('no data: ', {dashboardData})
    

  }
  const response  = [{status: 200, message: "OK"}];

  return sendJSON_(response);

  
}

function sendJSON_(jsonResponse){
  return ContentService
    .createTextOutput(JSON.stringify(jsonResponse))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(req) {
   let action = req.parameter.action;
   let tab = "TSV Paste";
   if (req.parameter.tab) {
     tab = req.parameter.tab;
   }

   tab = SPR_DUMP.getSheetByName(tab);

   console.log(tab);  
   
   switch(action) {
       case "read":
           return doRead(req, tab);
           break;
       case "insert":
           return doInsert(req, tab);
           break;
       case "update":
           return doUpdate(req, tab);
           break;
       case "delete":
           return doDelete(req, tab);
           break;
       default:
           return response().json({
              status: false,
              message: 'silent!'
           });
   }
}

/* Read
 * request for all Data
 *
 * @request-parameter | action<string>
 * @example-request | ?action=read
 */
function doRead(request, sheetObject) {
   var data = {};
   
   data.records = _readData(sheetObject);

   return response().json(data);

}

/* Insert
 *
 */
function doInsert(req, sheet) {
//  parse stuff
   console.log(req.parameter.data);
  var result = "";
  
//  send stuff
//   var flag = 1;
//  
//   if (flag == 1) {
//      var timestamp = Date.now();
//      var currentTime = new Date().toLocaleString(); // Full Datetime
//      var rowData = sheet.appendRow([
//        c.lastModifiedDate,
//        ldap,
//        c.studyID,
//        c.caseID,
//        "",
//        c.caseRemarks
//      ]);
//      var result = "Insertion successful";
//   }

   return response().json({
      result: result
   });
}

/* Update
 * request for Update
 *
 * @request-parameter | id<string>, data<JSON>, action<string>
 * @example-request | ?id=1&action=update&data={"email":"test@gmail.com", "username":"testid"}
 */
function doUpdate(req, sheet) 
{
   var id = req.parameter.id;
   var updates = JSON.parse(req.parameter.data);
  
   var lr = sheet.getLastRow();

   var headers = _getHeaderRow(sheet);
   var updatesHeader = Object.keys(updates);
   
   // Looping for row
   for (var row = 1; row <= lr; row++) {
      // Looping for available header / column
      for (var i = 0; i <= (headers.length - 1); i++) {
         var header = headers[i];
         // Looping for column need to updated
         for (var update in updatesHeader) {
            if (updatesHeader[update] == header) {
               // Get ID for every row
               var rid = sheet.getRange(row, 1).getValue();

               if (rid == id) {
                  // Lets Update
                  sheet.getRange(row, i + 1).setValue(updates[updatesHeader[update]]);
               }
            }
         }
      }
   }

   
   // Output
   return response().json({
      status: true,
      message: "Update successfully"
   });
}


/* Delete
 *
 */
function doDelete(req, sheet) {
   var id = req.parameter.id;
   var flag = 0;

   var Row = sheet.getLastRow();
   for (var i = 1; i <= Row; i++) {
      var idTemp = sheet.getRange(i, 3).getValue();
      if (idTemp == id) {
         sheet.deleteRow(i);
         
         var result = "deleted successfully";
         flag = 1;
      }

   }

   if (flag == 0) {
      return response().json({
         status: false,
         message: "ID not found"
      });
   }

   return response().json({
      status: true,
      message: result
   });
}


/* Service
 */
function _readData(sheetObject, properties) {

   if (typeof properties == "undefined") {
      properties = _getHeaderRow(sheetObject);
      properties = properties.map(function (p) {
//         return p.replace(/\s+/g, '_');
        return p;
      });
   }

   var rows = _getDataRows(sheetObject),
      data = [];

   for (var r = 0, l = rows.length; r < l; r++) {
      var row = rows[r],
          record = {};

      for (var p in properties) {
         record[properties[p]] = row[p];
      }

      data.push(record);
   }
   
   return data;
}
function _getDataRows(sheetObject) {
   var sh = sheetObject;

   return sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
}
function _getHeaderRow(sheetObject) {
   var sh = sheetObject;

   return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
}
function response() {
   return {
      json: function(data) {
         return ContentService
            .createTextOutput(JSON.stringify(data))
            .setMimeType(ContentService.MimeType.JSON);
      }
   }
}