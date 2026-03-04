/***
 * Created By : Shailesh Khandare
 * Description : Get Truck Hisab Settlement Module.
 */



var grandTotalOfTV = 0;
var totleAmount = 0;
var totleTollAmount = 0;
var totlemiscAmount = 0;
var IncomeExpenseMappingMasterId = 7;
var driverDetails = new Object();
var showBackDateInTruckHisabSettlement	= false;
var lastSellementDate;


/**
 * Get Truck details By vehicle Id
 * Method will give details Of current Lhpv details.  
 */

function display(){
	$("#tripDetails").show();
	displayTruckDetails();
} 
function displaylhpvdetails(){
	$("#dailyAllowanceDiv11").show();
	
} 

function displayTruckDetails(){
	$("#truckDetails1").show();
	$("#truckDetails2").show();
} 

function displayDriverDetails(){
	$("#dirverDetails").show();
	$("#dirverDetails1").show();
	
	
	
	
var driverId  =	 getDriverId('driverNameAuto');
	$("#driverID").val(driverId);
	var drv = new Object();
	 var json 		= new Object();
	 json	= driverDetails[driverId];
	 
	 if(json != undefined){
		 $("#driverNameToDisplayId").text(json.Name);
		 $("#licenceToDisplayId").text(json.LicenceNumber);
	 }
	 
	//include getDriverDailyAllowance.js
	 getDailyAllowanceDetails(driverId);
}

function showTabs(){
	$("#tabs").show();
}

/**
 *Function for accordion effect 
 *It should be call on bodyonload and 
 *include :-jquery-ui.js,jquery-1.10.2.js,jquery-ui.css  
 */
function getAccordionEffect(){
	$( "#tabs" ).tabs().addClass( "ui-tabs-vertical ui-helper-clearfix" );
    $( "#tabs li" ).removeClass( "ui-corner-top" ).addClass( "ui-corner-left" );
  }


/**
 * 
 */
var i = 0;

function addDailyAllowanceTable(){
	if(!validateAllowance()){
		return;
	}
	
	$("#dailyAllowanceDiv").show();
	$("#totalSummary").show();
	$("#grandTotals").show();
	$("#dailyAllowanceFoor").remove();
	
	var srNo 			= (i + 1);
	var fromDate 		= $("#fromDailyAllowdate").val();
	var toDate			= $("#toDailyAllowdate").val();
	var totDays 		= $("#totalNumberDay").val();
	var driverAmt 		= $("#driverAllowanceAmount").val();
	var totAmt 			= $("#totAmountAllowance").val();
	var remark 			= $("#allowanceRemark").val();
	totleAmount = Number(totAmt) + Number(totleAmount);
	var row 				= createRow('dailyAllowance'+i, '');
	
	var srNoCol 					= createColumn(row,'srNo_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var fromDateCol 				= createColumn(row,'fromDate_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var toDateCol	 				= createColumn(row,'toDate_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var totDaysCol 					= createColumn(row,'totDays_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var driverAmtCol 				= createColumn(row,'driverAmt_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var totAmtCol 					= createColumn(row,'totAmt_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var remarkCol 					= createColumn(row,'remark_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	
	$(srNoCol).append(srNo);
	$(fromDateCol).append(fromDate);
	$(toDateCol).append(toDate);
	$(totDaysCol).append(totDays);
	$(driverAmtCol).append(driverAmt);
	$(totAmtCol).append(totAmt);
	$(remarkCol).append(remark);
	
	$("#dailyAllowance").append(row);
	
	var rowFoot 						= createRow('dailyAllowanceFoor', '');
	var srNoFootCol 					= createColumn(rowFoot,'srNoFoot_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var fromDateFootCol 				= createColumn(rowFoot,'fromDateFoot_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var toDateFootCol	 				= createColumn(rowFoot,'toDateFoot_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var totDaysFootCol 					= createColumn(rowFoot,'totDaysFoot_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var driverAmtFootCol 				= createColumn(rowFoot,'driverAmtFoot_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var totAmtFootCol 					= createColumn(rowFoot,'totAmtFoot_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var remarkFootCol 					= createColumn(rowFoot,'remarkFoot_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	
	$(srNoFootCol).append("");
	$(fromDateFootCol).append("");
	$(toDateFootCol).append("");
	$(totDaysFootCol).append("");
	$(driverAmtFootCol).append("Total");
	$(totAmtFootCol).append(totleAmount);
	$(remarkFootCol).append("");
	
	$("#dailyAllowance").append(rowFoot);
	$("#finalDailyAllowance").html(totleAmount);
	$("#DailyAllowanceExpensemasterTypeID1").val(totleAmount);
	
	grandTotalOfTV = Number(totleAmount) + Number(totleTollAmount) + Number(totlemiscAmount);
	$("#TotalAllExpense").val(grandTotalOfTV);
	$("#TotalDlyTravAll").html(grandTotalOfTV);
	setValueToContent("TotalDlyTravAll",'htmlTag',totleAmount);
	i=i+1;
	
	$("#fromDailyAllowdate").val("");
	$("#totAmountAllowance").val("");
	$("#allowanceRemark").val("");
}


var j = 0;

function addTollExpenseTable(){
	
	if(!validateToll()){
		return;
	}
	$("#tollExpenseDiv").show();
	$("#totalSummary").show();
	$("#tollExpenseFoot").remove();
	$("#grandTotals").show();
	var srNo1 			= (j + 1);
	var tollName 		= $("#tollName").val();
	var tollAmount		= $("#TotTollAmount").val();
	var remark 			= $("#TollRemark").val();
	var TollTypeMasterId = $("#tollTypeMasterId").val();
	totleTollAmount = Number(tollAmount) + Number(totleTollAmount);
	var row1 				= createRow('tollExpense'+j, '');
	
	var srNo1Col 				= createColumn(row1,'srNo1_'+(j+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var tollNameCol 			= createColumn(row1,'tolltype_'+(j+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var tollAmountCol 			= createColumn(row1,'TotTollAmount_'+(j+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var remarkCol	 			= createColumn(row1,'tollRemark_'+(j+1), 'datatd', '', '', 'letter-spacing:2px', '');
	
	
	$(srNo1Col).append(srNo1);
	$(srNo1Col).append('<input type ="hidden" id="TollTypeMasterId_'+(j+1)+'" value= '+TollTypeMasterId+' />');
	$(tollNameCol).append(tollName);
	$(tollAmountCol).append(tollAmount);
	$(remarkCol).append(remark);
	
	$("#tollExpense").append(row1);
	
	var rowFoot1 						= createRow('tollExpenseFoot', '');
	
	var srNo1FootCol 					= createColumn(rowFoot1,'srNo1Foot_'+(j+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var tollNameFootCol 				= createColumn(rowFoot1,'tollNameFoot_'+(j+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var tollAmountFootCol	 			= createColumn(rowFoot1,'tollAmountFoot_'+(j+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var remarkFootCol 					= createColumn(rowFoot1,'remarkFoot_'+(j+1), 'datatd', '', '', 'letter-spacing:2px', '');
		
	$(srNo1FootCol).append("");
	$(tollNameFootCol).append("<b>Total<b>");
	$(tollAmountFootCol).append('<b>' + totleTollAmount + '</b>');
	$(remarkFootCol).append("");
	
	
	$("#tollExpense").append(rowFoot1);
	
	setValueToContent("TotaltollExpAll",'htmlTag',totleTollAmount);
	$("#grandTotalHisabSettle").val(grandTotalOfTV);
	$("#finalTollExpense").html(totleTollAmount);
	$("#TollExpenseTypeID1").val(totleTollAmount);
	grandTotalOfTV = Number(totleAmount) + Number(totleTollAmount) + Number(totlemiscAmount);
	$("#TotalAllExpense").val(grandTotalOfTV);
	j=j+1;
	$("#TotTollAmount").val(0);
	$("#TollRemark").val("");
	$("#tollName").val("")
	$("#tollTypeMasterId").val(0);
}


var l = 0;

function addMiscExpenseTable(){
	
	if(!validateMisc()){
		return;
	}
	if(grandTotalOfTV == 0){
		grandTotalOfTV	= 0;
	}
	
	$("#miscExpenseFoot").remove();
	$("#miscExpenseDiv").show();
	$("#totalSummary").show();
	$("#grandTotals").show();
	var srNo2 			= (l + 1);
	var typeOfExpense 	= $("#miscName").val();
	var TotMISCAmount 	= $("#totMiscAmount").val();
	var remark		 	= $("#miscRemark").val();
	var miscTypeMasterId222 = $("#miscMastertypeIduniq").val();
	
	totlemiscAmount 	= Number(TotMISCAmount) + Number(totlemiscAmount);
	var row2 			= createRow('MiscExpense'+l, '');
	
	var srNo2Col 					= createColumn(row2,'srNo2_'+(l+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var typeOfExpenseCol 			= createColumn(row2,'typeOfExpense_'+(l+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var TotMISCAmountCol	 		= createColumn(row2,'TotMISCAmount_'+(l+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var remarkAmountCol	 			= createColumn(row2,'remarkAmountCol_'+(l+1), 'datatd', '', '', 'letter-spacing:2px', '');
	
	
	
	$(srNo2Col).append(srNo2);
	$(srNo2Col).append('<input type ="hidden" id="miscTypeMasterId123_'+(l+1)+'" value= '+miscTypeMasterId222+' />');
	$(typeOfExpenseCol).append(typeOfExpense);
	$(TotMISCAmountCol).append(TotMISCAmount);
	$(remarkAmountCol).append(remark);

	
	$("#miscExpense").append(row2);
	
	var rowFoot2 						= createRow('miscExpenseFoot', '');
	
	var srNo2FootCol 					= createColumn(rowFoot2,'srNo2Foot_'+(l+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var tollnameFootCol	 				= createColumn(rowFoot2,'tollnameFoot_'+(l+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var TotMISCAmountFootCol 			= createColumn(rowFoot2,'TotMISCAmountFoot_'+(l+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var remarkFootCol 					= createColumn(rowFoot2,'remarkFootFoot_'+(l+1), 'datatd', '', '', 'letter-spacing:2px', '');
		
	$(srNo2FootCol).append("");
	$(tollnameFootCol).append("Total");
	$(TotMISCAmountFootCol).append(totlemiscAmount);
	$(remarkFootCol).append();
	
	
	$("#miscExpense").append(rowFoot2);
	grandTotalOfTV = Number(grandTotalOfTV) + Number(totlemiscAmount);
	$("#grandTotalHisabSettle").val(grandTotalOfTV);
	$("#finalMiscExpense").html(totlemiscAmount);
	$("#MiscExpenseID1").val(totlemiscAmount);
	grandTotalOfTV = Number(totleAmount) + Number(totleTollAmount) + Number(totlemiscAmount);
	$("#TotalAllExpense").val(grandTotalOfTV);
	setValueToContent("TotaltollMiscAll",'htmlTag',totlemiscAmount);
	l=l+1;
	$("#totMiscAmount").val(0);
	$("#miscRemark").val("");
	$("#miscName").val("")
	$("#miscMastertypeIduniq").val(0);
}


function loadTruckHisabSettlement(){
	//autoCompleteToll();
	getCurrentDate();
	autoCompleteMisc();
	loadDataDriver();
	getExpenseChargeMasterId();
	autoCompleteLoadOwnVehicle(4);
	$( "#findButton" ).click(function() {
		validationForTruckHisabVoucher('VehicleId');
		$("#SettleVoucher").attr("disabled", false);
		$("#SettleVoucher").show();
		});
}

var tollexpe =null;
var tollObjectGobal 	= null;
function autoCompleteToll(vehicleTypeId){
	tollexpe = new  Object();
	tollObjectGobal = new Object();
	var jsonObject  		= new Object();
	var jsonOutObject 		= new Object();
	jsonObject.Filter 		= 7;
	jsonObject.VehicleTypeId 		= vehicleTypeId;
	
	jsonOutObject = jsonObject;
	 var jsonStr 	= JSON.stringify(jsonOutObject);
	 
	 $.getJSON("tollMaster.do?pageId=343&eventId=5", 
				{json:jsonStr}, function(data) {
					
						tollexpe =	data.tollMasterListColl1;
						
							for(var i = 0; i < tollexpe.length; i++ ){
								var tollModel1 = tollexpe[i];
								tollObjectGobal[tollModel1.tollTypeRateMasterId] = tollModel1.amount;   
							}
						
					
				 autoCompleteTollEx();
				 
				});
}


var jsondata 										= null;
var executiveObj									= null;
var Executive										= null;
var configuration									= null;
var columnsCount 									= 0;
function loadDataDriver() {
showLayer();
	var jsonObject		= new Object();
	jsonObject.Filter	= 1;
	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("TruckHisabSettlementAjaxAction.do?pageId=344&eventId=2",
			{json:jsonStr}, function(data) {			
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', "you are Logged of Please login again!!"); // show message to show system processing error massage on top of the window.
					hideLayer();
				} else{
					jsondata				= data;
					var drivDtls1 			= jsondata.driverMasterArr;
					for(var i = 0 ; i < drivDtls1.length ; i++){
						var driverDtlsData	= new Object();
						var driverDtlsModel = drivDtls1[i];
						driverDtlsData.Name	= driverDtlsModel.name;
						
						driverDtlsData.LicenceNumber	= driverDtlsModel.licenceNumber;
						driverDetails[driverDtlsModel.driverMasterId] = driverDtlsData; 
					}
					
					setDriver(data);
				
				}
				hideLayer();
			});
}

var driverarr  = new Array();
function setDriver(data) {
	var driverMasterArr = jsondata.driverMasterArr;

	for(var i = 0 ; i < driverMasterArr.length ; i++){
		var driverData	= new Object();
		var driverModel = driverMasterArr[i];
		driverData.id = driverModel.driverMasterId; 
		driverData.name = driverModel.displayName;
		driverarr.push(driverData);
	}
	
	$('#driverNameAuto').ajaxComboBox(
			driverarr,
			  {
				  lang: 'en',
				  sub_info: false,
				  sub_as: {
			      name: 'name',
			      post: 'Post',
			      position: 'Position'
			    },
			    primary_key: 'id'
			  }
			);
	
	}

var miscexpe =null;
function autoCompleteMisc(){
	miscexpe = new  Object();
	var jsonObject  		= new Object();
	var jsonOutObject 		= new Object();
	jsonObject.Filter 		= 2;
	
	jsonOutObject = jsonObject;
	 var jsonStr 	= JSON.stringify(jsonOutObject);
	 
	 $.getJSON("tollMaster.do?pageId=343&eventId=7", 
				{json:jsonStr}, function(data) {
					miscexpe =	data.tollMasterListColl;
				 autoCompletemiscEx();
				 
				});
}

function getTollTypeMasterId() {
	var tollTypeId	= getTollTypeId('tollName');
	getTollTypeRate(tollTypeId);
	$("#tollTypeMasterId").val(getTollTypeId('tollName'));
	
}

function getMiscMasterId() {

	$("#miscMastertypeIduniq").val(getMiscTyoeId('miscName')) 
}


function getTollTypeId(id) {
	if($('#' + id + '_primary_key').val() != ""){
		var  primaryId =   $('#' + id + '_primary_key').val();
		return primaryId; 
	}else{
		return null;
	}
}
function getMiscTyoeId(id) {
	if($('#' + id + '_primary_key').val() != ""){
		var  primaryId =   $('#' + id + '_primary_key').val();
		return primaryId; 
	}else{
		return null;
	}
}

var  tollarray = new Array(); 
var counttotoll = 0 ;
function autoCompleteTollEx(){
if(counttotoll == 0){
	if (tollexpe) {
	for(var i = 0 ; i < tollexpe.length ; i++){
		var tollData	= new Object();
		var tollModel = tollexpe[i];
		tollData.id   = tollModel.tollTypeRateMasterId; 
		tollData.name = tollModel.name;
		tollarray.push(tollData);
		
	}
	counttotoll++;
	}else{
		var tollData	= new Object();
		
		tollData.id   = 0 
		tollData.name = "No toll configure for vehicle type !!"
			tollarray = new Array();
		tollarray.push(tollData);
		counttotoll++;
	}
	console.log("counttotoll"+counttotoll);
	
	$('#tollName').ajaxComboBox(
			tollarray,
			  {
				  lang: 'en',
				  sub_info: false,
				  sub_as: {
					  name: 'name',
				      post: 'Post',
				      position: 'Position'
			    },
			    primary_key: 'id'
			  }
			);
	}
}
var  miscArray2 = new Array();
function autoCompletemiscEx(){

	for(var i = 0 ; i < miscexpe.length ; i++){
		var miscData1	= new Object();
		var miscModel1 = miscexpe[i];
		miscData1.id   = miscModel1.miscTypeMasterId; 
		miscData1.name = miscModel1.name;
		miscArray2.push(miscData1);
	}
	
	
	$('#miscName').ajaxComboBox(
			miscArray2,
			  {
				  lang: 'en',
				  sub_info: false,
				  sub_as: {
					  name: 'name',
				      post: 'Post',
				      position: 'Position'
			    },
			    primary_key: 'id'
			  }
			);
}

$("#ClickHereForTop").click(function() {
    $('html, body').animate({
        scrollTop: $("#truckNumber").offset().top
    }, 2000);
});

$("#ui-id-1").click(function() {
	
	$('html, body').animate({
		scrollTop: $("#TotalAllExpense").offset().top
	}, 2000);
});

$("#ui-id-2").click(function() {
	
	$('html, body').animate({
		scrollTop: $("#TotalAllExpense").offset().top
	}, 2000);
});

$("#ui-id-3").click(function() {
	
	$('html, body').animate({
		scrollTop: $("#TotalAllExpense").offset().top
	}, 2000);
});


/*$("#AddDailyAllownce").click(function() {
    $('html, body').animate({
        scrollTop: $("#lastele").offset().top
    }, 2000);
});*/

$("#AddNewToll11").click(function() {
	$('html, body').animate({
		scrollTop: $("#TotalAllExpense").offset().top
	}, 2000);
});

$("#addTruckHisabExpense").button({
    icons: {
        primary: "ui-icon-close"
    },
    text: false
}).click(function(event) {
    $("#addTruckHisabExpense").hide("slow");
});



function openDialog(id) {
	$("#"+id).dialog({
		modal: true,
		width:'auto',
		height: 'auto',
		minWidth: 700,
		maxWidth: 600,
	   // minHeight: 500,
	    position: ["center", 50],
		closeOnEscape: false,
		resizable: false,
		show: 'slide',
		hide: 'slide',
		draggable: false,
		close: function(ev, ui) {
			hideAllMessages();
			//Include this ResetInputFieldValue.js file to work this function 
			//resetInputFieldData();
			//window.location.reload();
		}
	}).css("font-size", "12px");
}



function openWindowForView(id, number, type, branchId, cityId, searchBy) {
	window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+id+'&wayBillNumber='+number+'&TypeOfNumber='+type+'&BranchId='+branchId+'&CityId='+cityId+'&searchBy='+searchBy);
}



function getDriverId(id) {
	if($('#' + id + '_primary_key').val() != ""){
		var  primaryId =   $('#' + id + '_primary_key').val();
		return primaryId; 
	}else{
		return null;
	}
}


/**
 * Get last date of Truck hisab 
 * */
function getLastDateTransaction(VehicleId){

	var jsonOject 			= new Object();
	var jsonOutObject		= new Object();
	
	jsonOject.VEHICLEID 	= VehicleId;
	jsonOject.Filter 		= 5;
	jsonOutObject			= jsonOject;
	
	var jsonStr				= JSON.stringify(jsonOutObject);
	
	$.getJSON("TruckHisabSettlementAjaxAction.do?pageId=344&eventId=2",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
				//	showMessage('info', "Allowance is not configure for driver !");
				//	$("#driverAllowanceAmount").val(0);
					 $("#fromDailyAllowdate").removeAttr("readonly");
				}else{
					
					$("#lastDateToShowTD").show(); 
					$("#closingKilometerShowTD").show(); 

					var dateCol =  data.lastDateListCol;
					var date =		dateCol[0];
					$("#fromDailyAllowdate").val(date.vehicleLastDate); 
					$("#lastDateToShow").html(date.vehicleLastDate); 
					$("#lastDateToShow").text(date.vehicleLastDate);
					lastSellementDate = date.vehicleLastHisabDateTime;
					$("#closingKilometerPrev").html(date.closingKilometer); 
					$("#closingKilometerPrev").text(date.closingKilometer);
				}
			})		
}


/**
 * Get Current Truckhisab Voucher 
 **/


function getTruckHisabVoucher(VehicleId){
	var jsonObject 			= new Object();
	var jsonOutObject 		= new Object();
	jsonObject.VEHICLEID	= VehicleId;
	jsonObject.Filter		= 6;
	
	jsonOutObject = jsonObject;
	
	var jsonStr				= JSON.stringify(jsonOutObject);
	
	$.getJSON("TruckHisabSettlementAjaxAction.do?pageId=344&eventId=2",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', "Hisab Voucher Not Found On Truck!");
				//	$("#driverAllowanceAmount").val(0);
					//getCurrentDate();
				}else{
					
					showBackDateInTruckHisabSettlement	= data.showBackDateInTruckHisabSettlement;
					var currentDate = moment().format('DD-MM-YYYY');
					
					if(showBackDateInTruckHisabSettlement) {
						
						$('#settlementBackDateTr').removeClass('hide');
						
						$('#settlementBackDate').val(currentDate);
						
						$( function() {
							$('#settlementBackDate').datepicker({
								minDate		: data.minimumDate,
								maxDate		: new Date(),
								showAnim	: "fold",
								dateFormat	: 'dd-mm-yy'
							});
						});
					}
					
					var truckHisab =  data.truckHisabVoucherListCol;
					var TruckCol   = truckHisab[0]; 
					
					console.log("aaaaaaaaa",truckHisab[0]);
					$("#voucherID").html(TruckCol.truckHisabNumber);
					$("#voucherID").text(TruckCol.truckHisabNumber);
					$("#truckHisabVocherNumber").val(TruckCol.truckHisabNumber);
					$("#voucherID1").show();
					$("#truckHisabVocherId").val(TruckCol.truckHisabVoucherId);
					getLastDateTransaction(VehicleId);
					getvehicleTypeByVehicleID(VehicleId);
					display();
					getLhpvDetailsByVehicleId(TruckCol.lhpvId);
				}
			})		
	
}


/**
 * get vehicleType By vehicleNumber type master id 
 * 
 **/


function getvehicleTypeByVehicleID(VehicleId){
	
	var jsonObject 			= new Object();
	var jsonOutObject 		= new Object();
	jsonObject.VEHICLEID	= VehicleId;
	jsonObject.Filter		= 8; 
	
	jsonOutObject = jsonObject;
	
	var jsonStr				= JSON.stringify(jsonOutObject);
	
	$.getJSON("TruckHisabSettlementAjaxAction.do?pageId=344&eventId=2",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', "Hisab Voucher Not Found on Found!");
				//	$("#driverAllowanceAmount").val(0);
					//getCurrentDate();
				}else{
					var vehicleType =  data.vehicleNumberMaster;
					
					$("#VehicleTypeId").val(vehicleType.vehicleTypeId);
					$("#vehicleTypeToDisplayId").text(vehicleType.vehicleTypeName);
					$("#vehicleTypeToDisplayCapacity").text(vehicleType.vehicleTypeCapacity);
					$("#truckTypePannelTD").show();
					autoCompleteToll(vehicleType.vehicleTypeId);
				}
			})		
	
}


function showInfo12(elObj,tagToDisp) {
	div = document.getElementById('info');
	div.style.display='block';
	var elPos= findPos(elObj);
	div.style.left=elPos[0]+'px';
	div.style.top=elPos[1] -16 +'px';
	if(tagToDisp == 'Consignor Phone' || tagToDisp == 'Consignee Phone') {
		tagToDisp = tagToDisp + ' : ' + elObj.value.length;
	}
	console.log(tagToDisp);
	div.innerHTML=tagToDisp;
}



function getTollTypeRate(tollTypeId){
	$("#TotTollAmount").val(tollObjectGobal[tollTypeId]);  
}



$( "#findButton" ).click(function() {
	validationForTruckHisabVoucher('VehicleId');
	});

/**
 * get  ExpenseChargeMasterId   
 **/
function getExpenseChargeMasterId(){
	var jsonObject 		= new Object();
	var jsonOutObject 	= new Object();
	jsonObject.INCOMEEXPENSEMAPPINGMASTERID = IncomeExpenseMappingMasterId;
	jsonObject.AccountGroupId			    = 201;
	jsonObject.Filter					    = 11;
	
	jsonOutObject = jsonObject;
	
	var jsonStr	  = JSON.stringify(jsonOutObject);
	
	$.getJSON("TruckHisabSettlementAjaxAction.do?pageId=344&eventId=2",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', "Charge mapping is not found!");
				}else{
					console.log(data);
					var chargeMapping =  data.incomeExpenseChargeMaster;
					$("#ExpenseChargeMasterId").val(chargeMapping.chargeId);
				}
			})
}

function calculateTotalNoOfDays() {
	
	if($('#driverAllowanceAmount').val() > 0) {
		
		var fromDate 	= moment($('#fromDailyAllowdate').val(), "DD-MM-YYYY");
		var toDate 		= moment($('#toDailyAllowdate').val(), "DD-MM-YYYY");
		
		var diffInDays = toDate.diff(fromDate,'days');
		
		console.log('diffInDays >>', diffInDays)
		
		if(!isNaN(diffInDays)) {
			$('#totalNumberDay').val(diffInDays);
		}
	}
}