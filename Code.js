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

const TAB_NAME = "Monitor Logs";
const SPR_DUMP = SpreadsheetApp.openById(DUMP_ID);
const MONITOR_LOGS_TAB = SPR_DUMP.getSheetByName(TAB_NAME);

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
  let d = new Date(date);
  let hours = d.getHours()
  let minutes = d.getMinutes()
  return `${hours}${minutes}`
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
  console.log(filteredArray)
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
    ////recentCases
    ////lastRowNumber
    // studyID
    // valueDate
    // uniqueID
    const scrapedCasesArray = bodyJSON.map(({ surveyURL,lastUpdatedTime }) => {
      let data;
      let submittedUID = `${surveyURL.split('configurationId=')[1]}-${getDateValue(lastUpdatedTime)}`
      return data = {
        submittedUID,
        surveyURL,
        lastUpdatedTime
      }
    })
    const { recentCases,lastRowNumber } = getRecentSubmittedSID();
    // const recentCases = [{studyID:2882232,valueDate:1620291785152,uniqueID:"2882232-1620291785152"},{studyID:2943417,valueDate:1620291954432,uniqueID:"2943417-1620291954432"},{studyID:2891567,valueDate:1620292279563,uniqueID:"2891567-1620292279563"},{studyID:3012026,valueDate:1620293721974,uniqueID:"3012026-1620293721974"},{studyID:2940847,valueDate:1620295849870,uniqueID:"2940847-1620295849870"},{studyID:2397827,valueDate:1620296576521,uniqueID:"2397827-1620296576521"},{studyID:2460103,valueDate:1620296589646,uniqueID:"2460103-1620296589646"},{studyID:2946198,valueDate:1620298688932,uniqueID:"2946198-1620298688932"},{studyID:2943255,valueDate:1620300284642,uniqueID:"2943255-1620300284642"},{studyID:3004480,valueDate:1620300579487,uniqueID:"3004480-1620300579487"},{studyID:3012083,valueDate:1620301906313,uniqueID:"3012083-1620301906313"},{studyID:2946006,valueDate:1620302086140,uniqueID:"2946006-1620302086140"},{studyID:3007819,valueDate:1620302529687,uniqueID:"3007819-1620302529687"},{studyID:3009905,valueDate:1620302676639,uniqueID:"3009905-1620302676639"},{studyID:2994698,valueDate:1620303965423,uniqueID:"2994698-1620303965423"},{studyID:3007852,valueDate:1620304289104,uniqueID:"3007852-1620304289104"},{studyID:3013355,valueDate:1620304402063,uniqueID:"3013355-1620304402063"},{studyID:2943525,valueDate:1620305016935,uniqueID:"2943525-1620305016935"},{studyID:2943528,valueDate:1620305119062,uniqueID:"2943528-1620305119062"},{studyID:2936241,valueDate:1620305663177,uniqueID:"2936241-1620305663177"},{studyID:3012095,valueDate:1620306131859,uniqueID:"3012095-1620306131859"},{studyID:3013382,valueDate:1620306783988,uniqueID:"3013382-1620306783988"},{studyID:2945678,valueDate:1620306941254,uniqueID:"2945678-1620306941254"},{studyID:3013415,valueDate:1620307304466,uniqueID:"3013415-1620307304466"},{studyID:2943588,valueDate:1620308990078,uniqueID:"2943588-1620308990078"},{studyID:3004903,valueDate:1620309129025,uniqueID:"3004903-1620309129025"},{studyID:2582385,valueDate:1620309715453,uniqueID:"2582385-1620309715453"},{studyID:3013355,valueDate:1620309784865,uniqueID:"3013355-1620309784865"},{studyID:3009977,valueDate:1620309827810,uniqueID:"3009977-1620309827810"},{studyID:2943594,valueDate:1620309976521,uniqueID:"2943594-1620309976521"} ,{studyID:2943594,valueDate:1620309976521,uniqueID:"3007819-1620345729000"}];

    const submittedUIDArray = recentCases.map(({ uniqueID }) => uniqueID);
    // console.log(submittedCasesArray,uniqueIDArray,lastRowNumber);

    // console.log('fuck',scrapedCasesArray,submittedUIDArray)

    // scrapedCasesArray
    // submittedUIDArray

    const finalData = scrapedCasesArray.filter(({ submittedUID },i) => {
        return !submittedUIDArray.includes(submittedUID)
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
    // Add Cases from RB
    MONITOR_LOGS_TAB.getRange(lastRowNumber + 1, 20, dashboardData.length, 2).setValues(dashboardData);

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