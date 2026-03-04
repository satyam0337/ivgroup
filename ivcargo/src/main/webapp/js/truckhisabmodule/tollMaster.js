/***
 * Created By : Shailesh Khandare
 * Description : 
 */

/**
 * this function loads all Necessary Functions 
 * */
var vehicleJSonData = null;
var vehicleArr = null;
var vehicleTypeIdNameArray	= new Object();
var selectedTypeIdNameArray	= new Array();
var vehicleIdArry  = new Array();
var vehicleIdArry1 = new Array();
var tableContains = new Array();
var tableData = new Object();


function loadTollMaster(){
	tabFunction();
	/*loadTollName();*/
	loadTruckType();
}


function loadTollName() {

	var jsonObject		= new Object();
	jsonObject.Filter	= 5;
	var jsonStr = JSON.stringify(jsonObject);
	$.getJSON("tollMaster.do?pageId=343&eventId=5",
			{json:jsonStr}, function(data) {			
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', "yor Logged of Please login again!!"); // show message to show system processing error massage on top of the window.
				} else{
					loadTollTypeDropDown(data)
					jsondata				= data;
				}
			});
}

var driverarr  = new Array();
function setTollNameMaster(data) {
	var tollArr = jsondata.tollMasterArr;

	for(var i = 0 ; i < tollArr.length ; i++){
		var tolData	= new Object();
		var tollModel = tollArr[i];
		tolData.id = tollModel.tollTypeMasterId; 
		tolData.name = tollModel.name;
		driverarr.push(tolData);
	}


	$('#addNewTollName').ajaxComboBox(
			driverarr,
			{
				lang: 'en',
				sub_info: false,
				sub_as: {
					name: 'name',
					post: 'Post',
					position: 'Position'
				},
				primary_key: 'name'
			}
	);

}

function loadTruckType() {
	var jsonObject		= new Object();
	jsonObject.Filter	= 6;
	var jsonStr = JSON.stringify(jsonObject);
	$.getJSON("tollMaster.do?pageId=343&eventId=5",
			{json:jsonStr}, function(data) {			
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', "yor Logged of Please login again!!"); // show message to show system processing error massage on top of the window.
				} else{
					jsondata				= data;
					vehicleJSonData				= data;
					setVehicleTypeMaster(data);
					//setVehicleTypeMaster1();
				}
			});
}


function setVehicleTypeMaster(data) {

	removeOption('truckType',null);

	vehicleArr = jsondata.vehicleTypeArr;

	if(!jQuery.isEmptyObject(vehicleArr)) {
		for(var i=0; i < vehicleArr.length; i++) {
			createOption('truckType', vehicleArr[i].vehicleTypeId, vehicleArr[i].name);
			vehicleTypeIdNameArray[vehicleArr[i].vehicleTypeId] 	= vehicleArr[i].name;
		}
	}
	ready();
}

function setVehicleTypeMaster1() {
	removeOption('truckType1',null);
	var vehicleArr1 = vehicleJSonData.vehicleTypeArr;

	if(!jQuery.isEmptyObject(vehicleArr1)) {
		for(var i=0; i < vehicleArr1.length; i++) {
			createOption('truckType1', vehicleArr1[i].vehicleTypeId, vehicleArr1[i].name);
			vehicleTypeIdNameArray[vehicleArr1[i].vehicleTypeId] 	= vehicleArr1[i].name;
		}
	}
	ready1();
}



function  insertIntoTollMaster(){

	if(validateTOll()) {	
		return false;
	}
	showLayer();
	var jsonObject 								= new Object();
	var jsonOutObject 							= new Object();

	var tollNameWithoutTrim						= $("#addNewTollName").val();
	jsonObject.Name 							= tollNameWithoutTrim.trim(); 
	jsonObject.Amount  							= $("#tollAmount").val();
	jsonObject.SelectedTypeIdNameArray  		= selectedTypeIdNameArray


	jsonObject.Filter 		= 1;
	jsonOutObject			= jsonObject;

	var jsonStr = JSON.stringify(jsonOutObject);

	$.getJSON("tollMaster.do?pageId=343&eventId=5", 
			{json:jsonStr}, function(data) {
				if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					resetFunction();
					showMessage('error', "Sorry an error occurred in system!");
				}else{
					if(data.Success){
						showMessage('success', "Inserted Successfully!");
						resetFunction();
						hideLayer();
						$('#disPlayTableTbody tbody tr').remove();
						$('#disPlayTableTbody').empty();
						$('#disPlayTableThead').empty();
						$('#disPlayTable').hide();
						tableContains =null;
						selectedTypeIdNameArray = null;
						vehicleIdArry = null;	
						tableContains = new Array();
						selectedTypeIdNameArray = new Array();
						//$("#truckType").empty();
					}else{
						showMessage('error', "Sorry an error occurred in system!");
						hideLayer();
						resetFunction();
					}
				}
			});
}


function resetFunction(){
	$("#addNewTollName").val("");
	$("#tollAmount").val(0);
	$("#mobileNumber").val(0);
	$("#address").val("");
}

var tollMasterDtls 	= null;
function getTollDetails(){
	$('#tollTypeTblTBody tbody tr').remove();
	$('#tollTypeTblTBody').empty();

	showLayer();

	var jsonObject 	  = new Object();
	var jsonOutObject = new Object();
	jsonObject.Filter 		= 2;
	jsonOutObject			= jsonObject;
	var jsonStr = JSON.stringify(jsonOutObject);
	$.getJSON("tollMaster.do?pageId=343&eventId=5", 
			{json:jsonStr}, function(data) {

				if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', "No records");
					hideLayer();
					$('#tableDivforToll').hide();
				}else{
					$('#tollTypeTblTBody tbody tr').remove();
					$('#tableDivforToll').show();


					var tollMaster =   data.tollMasterListColl;
					if(tollMaster.length > 0){
						for(var i = 0; i < tollMaster.length; i++) {
							tollMasterDtls	= tollMaster[i];

							var SrNo 					= (i+1);
							var namme 					= tollMasterDtls.name;
							var vehicleTypeName 		= tollMasterDtls.vehicleTypeName;
							var amount 					= tollMasterDtls.amount;

							var row			= createRow('TollMaster_'+(i+1), '');

							var srNoCol		= createColumn(row, 'srNo_'+(i+1), 'datatd', '', 'left', '', '');
							var nameCol		= createColumn(row, 'namme_'+(i+1), 'datatd', '', 'left', '', '');
							var vehicleTypeNameCol		= createColumn(row, 'vehicleTypeName_'+(i+1), 'datatd', '', 'left', '', '');
							var amountCol	= createColumn(row, 'amount_'+(i+1), 'datatd', '', 'left', '', '');
							var buttonCol	= createColumn(row, 'button_'+(i+1), 'datatd', '20%', '', '', '');
							var deleteButtonCol	= createColumn(row, 'deleteButtonCol_'+(i+1), 'datatd', '20%', '', '', '');

							var amountObject			= new Object();
							var saveJsonObject			= new Object();
							var deleteJsonObject		= new Object();
							var editJsonObject			= new Object();
							var tollTypeMasterIdObject	= new Object();			

							var selectEdit				= new Object();			

							tollTypeMasterIdObject.type			= 'hidden';
							tollTypeMasterIdObject.id			= 'tollTypeMasterId_'+[i+1];
							tollTypeMasterIdObject.name			= 'tollTypeMasterId_'+[i+1];
							tollTypeMasterIdObject.value 		=  tollMasterDtls.tollTypeRateMasterId;
							tollTypeMasterIdObject.readonly		= 'readonly';

							createInput(amountCol, tollTypeMasterIdObject);

							amountObject.type		= 'text';
							amountObject.id			= 'amount1_'+[i+1];
							amountObject.name		= 'amount1_'+[i+1];
							amountObject.value 		= tollMasterDtls.amount;
							amountObject.readonly	= 'readonly';
							amountObject.class		= "pure-input-1";
							amountObject.onfocus	= "";
							amountObject.onkeypress ="return noNumbers(event)";
							amountObject.maxlength	= 7;

							createInput(amountCol, amountObject);


							selectEdit.id			= 'button6_'+[i+1];
							selectEdit.name			= 'button6_'+[i+1];
							selectEdit.value 		= "Edit";
							selectEdit.readonly		= '';
							selectEdit.class		= "";
							selectEdit.onfocus		= "";
							selectEdit.onclick		= "assgnNewVehicleTypeToToll("+[i+1]+")";
							selectEdit.style		= "";

							saveJsonObject.type		= 'button';
							saveJsonObject.id		= 'button1_'+[i+1];
							saveJsonObject.name		= 'button1_'+[i+1];
							saveJsonObject.value 	= "Save";
							saveJsonObject.readonly	= '';
							saveJsonObject.class	= "pure-button pure-button-primary";
							saveJsonObject.onfocus	= "";
							saveJsonObject.onclick	= "saveAmount("+[i+1]+")";
							saveJsonObject.style	= "display:none";
							createInput(buttonCol, saveJsonObject);



							editJsonObject.type		= 'button';
							editJsonObject.id		= 'button2_'+[i+1];
							editJsonObject.name		= 'button2_'+[i+1];
							editJsonObject.value 	= "Edit";
							editJsonObject.readonly	= '';
							editJsonObject.class	= "pure-button pure-button-primary";
							editJsonObject.onfocus	= "";
							editJsonObject.onclick	= "editSave(this,"+[i+1]+")";
							createInput(buttonCol, editJsonObject);

							deleteJsonObject.type		= 'button';
							deleteJsonObject.id			= 'delbutton1_'+[i+1];
							deleteJsonObject.name		= 'delbutton1_'+[i+1];
							deleteJsonObject.value 		= "Delete";
							deleteJsonObject.readonly	= '';
							deleteJsonObject.class		= "pure-button pure-button-primary";
							deleteJsonObject.onfocus	= "";
							deleteJsonObject.onclick	= "deleteAmount("+[i+1]+")";
							deleteJsonObject.style		= "";
							createInput(deleteButtonCol, deleteJsonObject);


							$(srNoCol).append(SrNo);
							$(nameCol).append(namme);
							$(vehicleTypeNameCol).append(vehicleTypeName);

							$(amountCol).append();
							$('#tollTypeTblTBody').append(row);

						}
					}
					hideLayer();
				}
			});
}


var rowCount
function saveAmount(count){

	if(validateAmount(count)) {	
		return false;
	}

	showLayer();
	rowCount = 0;
	jSon  = null;
	jSonOutObj = null;

	jSon = new Object();
	jSonOutObj = new Object();
	jSon.TollTypeMasterId =  $("#tollTypeMasterId_"+count).val();
	jSon.Amount1 		  =  $("#amount1_"+count).val();
	jSon.Filter =  3;

	jSonOutObj = jSon

	var jsonStr = JSON.stringify(jSonOutObj);
	$.getJSON("tollMaster.do?pageId=343&eventId=5", 
			{json:jsonStr}, function(data) {
				if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					hideLayer();
					showMessage('error', "Record Not Found !!");
				} else {
					if(data.Sucess ==  "Sucess"){
						showMessage('success', "Updated SucessFully!");
						saveAfter(count);
						hideLayer();
					}
					hideLayer();
				}
			})
}



function editSave(ele,num){

	$("#amount1_"+num).attr("readonly", false);
	$('#button1_'+num).show();
	$('#button2_'+num).hide();
}

function saveAfter(count){
	$('#amount1_'+count).attr('readonly', true);
	/*$('#distance_'+num).removeAttr('disabled');*/
	$('#button2_'+count).show();
	$('#button1_'+count).hide();
}


function tabFunction(){
	$( "#tabs" ).tabs();	
}


$('.ui-id-2').click(function(){

})

function validateTOll(){
	if($("#addNewTollName").val()  =="" || $("#addNewTollName").val() == 0){
		showMessage('error', "Invalid Toll Name!");
		return true;
	}
	if($("#tollAmount").val()  =="" || $("#tollAmount").val() == 0){

		showMessage('error', "Invalid Toll Amount!");
		return true;
	}
	return false;
}


function validateAmount(count){
	if($("#amount1_"+count).val()  =="" || $("#amount1_"+count).val() == 0){
		showMessage('error', "Invalid Amount!");
		return true;
	}
	return false;
}


/**
 * Delete From TollTypeMaster
 **/
function deleteAmount(count){

	showLayer();
	rowCount = 0;
	jSon  = null;
	jSonOutObj = null;

	jSon = new Object();
	jSonOutObj = new Object();
	jSon.TollTypeMasterId =  $("#tollTypeMasterId_"+count).val();
	jSon.Filter =  4;
	jSonOutObj = jSon

	var jsonStr = JSON.stringify(jSonOutObj);
	$.getJSON("tollMaster.do?pageId=343&eventId=5", 
			{json:jsonStr}, function(data) {
				if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					hideLayer();
					showMessage('error', "Record Not Found !!");
				} else {
					if(data.Sucess ==  "Sucess"){
						showMessage('success', "Deleted SucessFully!");
						getTollDetails();
						saveAfter(count);
						hideLayer();
					}
					hideLayer();
				}
			})
}

function ready() {
	$('#truckType').multiselect({
		enableFiltering: true,
		includeSelectAllOption: true,
		maxHeight: 200,
	});
}
function ready1() {
	$('#truckType1').multiselect({
		enableFiltering: true,
		includeSelectAllOption: true,
		maxHeight: 200,
	});
}


/**
 * Function to add values to temporary table 
 **/
function addToDisplayTable(){

	vehicleIdArry 	= []; 
	vehicleIdArry	= getVehicleTypeIds();
	var count		= 0;

	if($("#tollAmount").val() <= 0 || $("#tollAmount").val() == ""){
		showMessage('error', "Toll Amount Can not enter Zero!!");
		return false
	}	

	if(vehicleIdArry.length > 0){
		$('#disPlayTableDiv').show();
		$('#disPlayTable').show();

		for(var i = 0 ; i < vehicleIdArry.length; i++) {
			var model 		= vehicleIdArry[i];
			var selectModel = {};

			selectModel.id		= model.id;
			selectModel.name	= vehicleTypeIdNameArray[model.id];
			var found 			= $.inArray(model.id, tableContains) > -1;

			tableContains.push(model.id);
			
			if(!found){
				selectedTypeIdNameArray.push(selectModel);
				var srNo				= 	(count+1);
				var vehicleTypeId		= 	model.id;
				var vehicleTypeName		= 	vehicleTypeIdNameArray[model.id];
				var tollAmt				= 	$("#tollAmount").val();

				var row 							= createRow('VehicleType_'+vehicleTypeId, '');

				var srNoCol 						= createColumn(row,'srNo_'+vehicleTypeId, 'datatd', '', '', 'letter-spacing:2px', '');
				var vehicleTypeNameCol	 			= createColumn(row,'vehicleTypeNameCol_'+vehicleTypeId, 'datatd', '', '', 'letter-spacing:2px', '');
				var tollAmtCol	 					= createColumn(row,'tollAmtCol_'+vehicleTypeId, 'datatd', '', '', 'letter-spacing:2px', '');

				var vehicleTypeIdObject	= new Object();

				vehicleTypeIdObject.type			= 'hidden';
				vehicleTypeIdObject.id				= 'vehicleTypeId_'+vehicleTypeId;
				vehicleTypeIdObject.name			= 'vehicleTypeId_'+vehicleTypeId;
				vehicleTypeIdObject.value 			=  vehicleTypeId;
				vehicleTypeIdObject.readonly		= 'readonly';

				createInput(srNoCol, vehicleTypeIdObject);

				$(srNoCol).append(srNo);
				$(vehicleTypeNameCol).append(vehicleTypeName);
				$(tollAmtCol).append(tollAmt);

				$("#disPlayTableTbody").append(row);
				count++;
			}
		}
	}
}

/**
 * get truck type id 
 * */
/*var vehicleTypeIdArr 		= new  Array();*/
var vehicleTypeIdArr1 		= new  Array();
function getVehicleTypeIds(){
	var vehicleTypeIdArr 		= new  Array();
	var  vehicleTypeIds			= "";
	var selected				= $("#truckType option:selected");
	selected.each(function () {
		var tblData	= new Object();
		tblData.id = $(this).val();
		vehicleTypeIdArr.push(tblData);
	});
	return vehicleTypeIdArr;
}


function getVehicleTypeIds1(){
	var  vehicleTypeIds			= "";
	var selected1				= $("#truckType1 option:selected");
	selected1.each(function () {
		var tblData	= new Object();
		tblData.id = $(this).val();
		vehicleTypeIdArr1.push(tblData);
	});
	return vehicleTypeIdArr1;
}

/**
 * Check for duplicate value
 * */
function checkForDuplicate(){
	if($("#checkbox"+wayBillId).length != 0) {
		showMessage('error', "Already prseent!!");
		false;
	}
}



/**
 * Assign new vehicle type to toll    
 **/

function assgnNewVehicleTypeToToll(count){
	alert(count);
}


/**
 *loadTollTypeDropDown(); 
 **/

function loadTollTypeDropDown(data){

	removeOption('TollTypeDropDwon',null);
	var tollArr1 = jsondata.tollMasterArr;


	var TollType = data.tollMasterArr;

	createOption('TollTypeDropDwon',0, '--Select Toll Type--');

	if(!jQuery.isEmptyObject(TollType)) {
		for(var i=0; i < TollType.length; i++) {
			createOption('TollTypeDropDwon', TollType[i].tollTypeMasterId, TollType[i].name);
		}
	}

	setVehicleTypeMaster1()
}

/**
 * Update toll Type 
 */
function updateFunctionFortTollTypeMap(){

	if($("#TollTypeMApAmount").val() <= 0 || $("#TollTypeMApAmount").val()==""){
		showMessage('error', "Amount can't be zero!!");
		return false;
	}


	if( $("#TollTypeDropDwon").val() <= 0){
		showMessage('error', "Select Toll Name!!");
		return false;
	}

	var JsonObject 	  = null ;
	var JsonOutObject = null ;
	JsonObject = new Object();
	JsonOutObject = new Object();

	JsonObject.TollType = $("#TollTypeDropDwon").val();
	vehicleIdArry1 = getVehicleTypeIds1();
	if(vehicleIdArry1.length <= 0){
		showMessage('error', "Select Vehicle Type!!");
		return false;
	}
	JsonObject.VehicleIdArry1 = vehicleIdArry1;
	JsonObject.MapAmount = $("#TollTypeMApAmount").val();
	JsonObject.Filter = 8;
	JsonOutObject   = JsonObject;

	var jsonStr = JSON.stringify(JsonOutObject);
	$.getJSON("tollMaster.do?pageId=343&eventId=5", 
			{json:jsonStr}, function(data) {
				if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					hideLayer();
					showMessage('error', "Sorry an error occured !!");
				}else{
					if(data.sucess== "sucess"){
						showMessage('success', "Updated successfully!");
						$("#TollTypeMApAmount").val(0);
						$("#TollTypeDropDwon").val(0);
						setVehicleTypeMaster1();

					}
				}
			})
}



function checkDuplicateTollName(){
	var jsonObject		= new  Object();
	var jsonOutObject	= new  Object();
	var tollnameToCheck	= $("#addNewTollName").val();
	jsonObject.TollnameToCheck	= tollnameToCheck.trim();
	jsonObject.Filter	= 9;
	jsonOutObject		= jsonObject;

	var jsonStr			= JSON.stringify(jsonOutObject);
	var ifalg = false;
	$.getJSON("tollMaster.do?pageId=343&eventId=5", 
			{json:jsonStr}, function(data) {
				if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					addToDisplayTable();
				}else{
					if(data.sucess== "sucess"){
						showMessage('error', "Toll Name Already Present!!");
						return false;
					}else{
						console.log("hi");
						addToDisplayTable();
					}
				}
			})

}