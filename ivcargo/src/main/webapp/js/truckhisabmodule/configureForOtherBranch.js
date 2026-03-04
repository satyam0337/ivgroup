/***
 * Created By : Shailesh Khandare
 * Description : Configure duplicate entry for nearBy branches  
 */

/**
 * 
 * */
var srcBranchConfig  		= null;

function openJqueryPannelForOtherBranchConfig(){
	if($('#branchName').val() == '' || $('#branchName').val() == null){
		showMessage('error', "Please Select Branch First ! Closing Modal ....");
		setTimeout(function(){ $(document).ready(function(){
			  $('.close').trigger('click');
		}); }, 1000);
		$('#branchName').css('border-color','red');
		$('#branchName').focus();
		return false;
	}
	
	if(!validateValidBranch(1, 'branchId', 'branchName')) {	
		return false;
	}
	/*else{
		$('#sroucebranchName').val($('#branchName').val());
	}*/
	getAllConfigFromSrcBranch();

} 

/**
 * Set Feild On Pannel
 * */
function setFeild() {
	$("#sroucebranchName").val($("#branchName").val());
	setBranchAutoComplete('ConfbranchName', 'branchId1', 'cityId1');
}

/**
 * get All Distance Configuration form 
 * */
function getAllConfigFromSrcBranch() {
	var jsonObject 					= null;
	jsonObject 	 			    	= new Object();
	jsonObject.sourceBranchId		= $("#branchId").val();
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/branchDistanceMapMasterWS/getDistanceDetailsBySourceId.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				setTimeout(function(){ $(document).ready(function(){
					 // $('.close').trigger('click');
				}); }, 2000);
				hideLayer();
				setFeild();
				return;
			}
			
			setFeild();
			srcBranchConfig  		= data.braArrayList;	

			if(branchDistanceConfig) {
				$("#labelsTd").removeAttr("style");
				$("#configDistTd").removeAttr("style");
			} else {
				$("#configDistTd").remove();
				$("#labelsTd").remove();
			}
			
			if(branchHoursConfig)
				$("#configHoursTd").css("display", "block");
			else
				$("#configHoursTd").remove();
				
			if(branchDaysWiseConfig)
				$("#configDaysTd").css("display", "block");
			else
				$("#configDaysTd").remove();
		}
	});
}

/**
 * Copy configuration from Src Branch 
 **/
function copyConfigFrmOtherBranch() {
	if(!validateDistanceConfig())
		return false;

	if(srcBranchConfig != null && srcBranchConfig.length > 1)
		configureMultipleDistance();
	else
		configureDistance();
}

function validateDistanceConfig() {
	if($("#ConfbranchName").val() == "" && $("#branchId1").val() <= 0) {
		showMessage('error', "Select Branch for Configuration!!");
		return false;
	}
	
	if(branchDistanceConfig && $("#configDist").val() == "") {
		showMessage('error', "Select Proper distance!!");
		$("#configDist").val(0);
		return false;
	}
	
	if(branchHoursConfig && ($("#configHours").val() == "" || Number($("#configHours").val()) == 0)) {
		showMessage('error', "Hours cannot be zero!!");
		$("#configHours").val(0);
		return false;
	}
	
	if(branchDaysWiseConfig && ($("#configDays").val() == "" || Number($("#configDays").val()) == 0)) {
		showMessage('error', "Days cannot be zero!!");
		$("#configDays").val(0);
		return false;
	}

	if($("#branchId").val() == $("#branchId1").val()) {
		showMessage('error', "Both Branch can not be same!!");
		$("#configDist").val(0);
		$("#branchId1").val(0);
		return false;
	}
	
	return true;
}

function configureDistance() {
	var jsonObject = new Object();

	jsonObject.fromBrachId 	= $("#branchId").val();
	jsonObject.toBranchId 	= $("#branchId1").val();
	jsonObject.distance	 	= $("#configDist").val();
	
	if(branchDaysWiseConfig)
		jsonObject.hours  			= 24 * Number($("#configDays").val());
	else
		jsonObject.hours 			= $("#configHours").val();

	showLayer();
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/branchDistanceMapMasterWS/saveDistanceDetails.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
			}
			
			$('#dialogConfigure').modal('hide');
			getDistanceDetails();
		}
	});
}

function configureMultipleDistance() {
	var srcBranchArray	 = new Array();
	var jsonOutObject 	 = new Object();

	var configForOperation =  $("#checkBoxforOperation").is(":checked");

	for(var i = 0;i < srcBranchConfig.length ; i++ ){
		var srcBranchCon 			= srcBranchConfig[i];
		var cpyData 				= new Object();
		cpyData.fromBrachId 		= $("#branchId1").val();
		cpyData.toBranchId			= srcBranchCon.toBranchId;
		
		if(branchDaysWiseConfig)
			cpyData.hours  	= 24 * Number($("#configDays").val());
		else
			cpyData.hours 	= $("#configHours").val();
		
		cpyData.distance			= 0;

		if(branchDistanceConfig) {
			if(configForOperation)
				cpyData.distance			= Number(srcBranchCon.distance) + Number($("#configDist").val());
			else
				cpyData.distance			= Number(srcBranchCon.distance) - Number($("#configDist").val());
		}

		srcBranchArray.push(cpyData);
	}
	
	var cpyData 				= new Object();
	cpyData.fromBrachId 		= $("#branchId").val();
	cpyData.toBranchId			= $("#branchId1").val();
	
	if(branchDaysWiseConfig)
		cpyData.hours  	= 24 * Number($("#configDays").val());
	else
		cpyData.hours 	= $("#configHours").val();
			
	cpyData.distance			= Number($("#configDist").val());
	
	srcBranchArray.push(cpyData);
	
	jsonOutObject.SrcBranchArray = JSON.stringify(srcBranchArray);
	
	showLayer();
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/branchDistanceMapMasterWS/saveMultipleDistanceDetails.do',
		data		:	jsonOutObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
			}
			
			if(Number(data.countofInsert) > 0) {
				showMessage('success', "Inserted SucessFully!");
				$('#dialogConfigure').modal('hide');
				$("#branchId").val($("#branchId1").val());
				getDistanceDetails();
			}	
			
			if(Number(data.countofUpdate) > 0) {
				showMessage('success', "Updated SucessFully!");
				$("#branchId").val($("#branchId1").val());
				$("#branchName").val($("#ConfbranchName").val());
				getDistanceDetails();
				$('#dialogConfigure').modal('hide');
			}	
			
			$("#configDist").val(0);
			$("#configHours").val(0);
			$("#configDays").val(0);
			$("#branchId1").val(0);
			$("#ConfbranchName").val('');
			
			hideLayer();
		}
	});
}