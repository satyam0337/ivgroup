/***
 * Created By : Shailesh Khandare
 * Description : 
 */

function  insertIntoTollMaster(){
	
	if(validateTOll()) {	
		return false;
	}
	showLayer();
	var jsonObject 			= new Object();
	var jsonOutObject 		= new Object();
	jsonObject.Name 		= $("#addNewTollNAme").val(); 
	jsonObject.Amount 		= $("#addNewFuelAmount").val();
	jsonObject.mobileNumber = $("#mobileNumber").val();
	jsonObject.address 		= $("#address").val();
	jsonObject.Filter 		= 1;
	jsonOutObject			= jsonObject;
	
	var jsonStr = JSON.stringify(jsonOutObject);
	
	$.getJSON("tollMaster.do?pageId=343&eventId=9", 
			{json:jsonStr}, function(data) {
				if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					console.log(data);
					showMessage('error', "Sorry an error occured in system!");
				}else{
					console.log(data);
					if(data.Success){
						showMessage('success', "Inserted SucessFully!");
						$("#addNewTollNAme").val("");
						$("#addNewFuelAmount").val("");
						$("#mobileNumber").val("");
						$("#address").val("");
						hideLayer();
					}else{
						showMessage('error', "Sorry an error occured in system!");
						 hideLayer();
					}
				}
			});
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
	$.getJSON("tollMaster.do?pageId=343&eventId=9", 
			{json:jsonStr}, function(data) {
				
				if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					 hideLayer();
					 $('#tableDivForMiscType').hide();
					 showMessage('error', data.errorDescription);					 
				}else{
					
					$('#tableDivForMiscType').show();
					$('#tollTypeTblTBody tbody tr').remove();
					console.log(data.pumpNameMasterColl);
					if(showAmountfield == true || showAmountfield == 'true'){
						$("#fuelRate").removeClass('hide');
					}else{
						$("#fuelRate").addClass('hide');
					}
					console.log("showAddressfield=--0-",showAddressfield)
					if(showAddressfield == true|| showAddressfield == 'true'){
						$("#addressField").removeClass("hide");
					}else{
						$("#addressField").addClass("hide");
					}
					if(showMobileNumberfield == true || showMobileNumberfield == 'true'){
						$("#mobileNo").removeClass("hide");
					}else{
						$("#mobileNo").addClass("hide");
					}
					var tollMaster =   data.pumpNameMasterColl;
					if(tollMaster.length > 0){
						for(var i = 0; i < tollMaster.length; i++) {
							tollMasterDtls	= tollMaster[i];
							
							var SrNo 	= (i+1);
/*							var namme 	= tollMasterDtls.name;*/
							
							var row			= createRow('TollMaster_'+(i+1), '');
						
							var srNoCol		= createColumn(row, 'srNo_'+(i+1), 'datatd', '', 'left', '', '');
							var nameCol		= createColumn(row, 'namme_'+(i+1), 'datatd', '', 'left', '', '');
						if(showAmountfield == true || showAmountfield == 'true'){
							var amountCol	= createColumn(row, 'amount_'+(i+1), 'datatd', '', 'left', '', '');
						}
						if(showMobileNumberfield == true || showMobileNumberfield == 'true'){
							var mobileNoCol	= createColumn(row, 'mobileNo_'+(i+1), 'datatd', '', 'left', '', '');
						}
						if(showAddressfield == true|| showAddressfield == 'true'){
							var addressCol	= createColumn(row, 'address_'+(i+1), 'datatd', '', 'left', '', '');
						}
							var buttonCol	= createColumn(row, 'button_'+(i+1), 'datatd', '20%', '', '', '');
							var deleteButtonCol	= createColumn(row, 'deleteButtonCol_'+(i+1), 'datatd', '20%', '', '', '');
							
							var NameObject				= new Object();
							var AmountObject			= new Object();
							var MobileNoObject			= new Object();
							var AddessObject			= new Object();
							var saveJsonObject			= new Object();
							var deleteJsonObject		= new Object();
							var editJsonObject			= new Object();
							var tollTypeMasterIdObject	= new Object();			
							
							tollTypeMasterIdObject.type			= 'hidden';
							tollTypeMasterIdObject.id			= 'tollTypeMasterId_'+[i+1];
							tollTypeMasterIdObject.name			= 'tollTypeMasterId_'+[i+1];
							tollTypeMasterIdObject.value 		=  tollMasterDtls.pumpNameMasterId;
							tollTypeMasterIdObject.readonly		= 'readonly';
							
							createInput(nameCol, tollTypeMasterIdObject);
							
							
							NameObject.type		= 'text';
							NameObject.id		= 'Name1_'+[i+1];
							NameObject.name		= 'Name1_'+[i+1];
							NameObject.value 	= tollMasterDtls.name;
							NameObject.readonly	= 'readonly';
							NameObject.class	= "pure-input-1";
							NameObject.onfocus	= "";
							NameObject.onkeypress ="";
							NameObject.maxlength	= 50;
							
							createInput(nameCol, NameObject);
							
							if(showAmountfield == true || showAmountfield == 'true'){
								AmountObject.type		= 'text';
								AmountObject.id			= 'Amount2_'+[i+1];
								AmountObject.name		= 'Amount2_'+[i+1];
								AmountObject.value 		= tollMasterDtls.fuelAmount;
								AmountObject.readonly	= 'readonly';
								AmountObject.class		= "pure-input-1";
								AmountObject.onfocus	= "";
								AmountObject.onkeypress ="";
								AmountObject.maxlength	= 50;

								createInput(amountCol, AmountObject);
							}
							if(showMobileNumberfield == true || showMobileNumberfield == 'true'){
								MobileNoObject.type			= 'text';
								MobileNoObject.id			= 'MobileNo2_'+[i+1];
								MobileNoObject.name			= 'MobileNo2_'+[i+1];
								MobileNoObject.value 		= tollMasterDtls.mobileNumber;
								MobileNoObject.readonly		= 'readonly';
								MobileNoObject.class		= "pure-input-1";
								MobileNoObject.onfocus		= "";
								MobileNoObject.onkeypress 	= "return allowOnlyNumeric(event)";
								MobileNoObject.maxlength	= 15;

								createInput(mobileNoCol, MobileNoObject);
							}
							if(showAddressfield == true|| showAddressfield == 'true'){
								AddessObject.type			= 'text';
								AddessObject.id				= 'Address2_'+[i+1];
								AddessObject.name			= 'Address2_'+[i+1];
								AddessObject.value 			= tollMasterDtls.address;
								AddessObject.readonly		= 'readonly';
								AddessObject.class			= "pure-input-1";
								AddessObject.onfocus		= "";
								AddessObject.onkeypress 	="";
								AddessObject.maxlength		= 200;

								createInput(addressCol, AddessObject);
							}
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
							$(nameCol).append();
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
	console.log("tollTypeMasterId_");
	console.log($("#tollTypeMasterId_"+count).val());
	jSon.Name1 		  =  $("#Name1_"+count).val();
	jSon.Amount5 	  =  $("#Amount2_"+count).val();
	jSon.MobileNo2 	  =  $("#MobileNo2_"+count).val();
	jSon.Address2 	  =  $("#Address2_"+count).val();
	jSon.Filter =  3;

	jSonOutObj = jSon

var jsonStr = JSON.stringify(jSonOutObj);
$.getJSON("tollMaster.do?pageId=343&eventId=9", 
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

	$("#Name1_"+num).attr("readonly", false);
	$("#Amount2_"+num).attr("readonly", false);
	$("#MobileNo2_"+num).attr("readonly", false);
	$("#Address2_"+num).attr("readonly", false);
	$('#button1_'+num).show();
	$('#button2_'+num).hide();
}

function saveAfter(count){
	$('#Name1_'+count).attr('readonly', true);
	$("#Amount2_"+count).attr("readonly", true);
	$("#MobileNo2_"+count).attr("readonly", true);
	$("#Address2_"+count).attr("readonly", true);
	$('#button2_'+count).show();
	$('#button1_'+count).hide();
}


function tabFunction(){
	$( "#tabs" ).tabs();
}


$('.ui-id-2').click(function(){
    
   alert("hi");
})

function validateTOll(){
	if($("#addNewTollNAme").val()  =="" || $("#addNewTollNAme").val() == 0){
		showMessage('error', "Invalid Toll Name!");
			return true;
		}
	/*if($("#tollAmount").val()  =="" || $("#tollAmount").val() == 0){
		
		showMessage('error', "Invalid Toll Amount!");
			return true;
		}*/
	return false;
}


function validateAmount(count){
	if($("#Name1_"+count).val()  ==""){
		showMessage('error', "Invalid Name!");
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
$.getJSON("tollMaster.do?pageId=343&eventId=9", 
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
function loadElement(){
	if(showAmountfield == true|| showAmountfield == 'true'){
		$("#amountDiv").removeClass("hide");
	}else{
		$("#amountDiv").addClass("hide");
	}
	if(showAddressfield == true|| showAddressfield == 'true'){
		$("#mobileNumberDiv").removeClass("hide");
	}else{
		$("#mobileNumberDiv").addClass("hide");
	}
	if(showMobileNumberfield == true || showMobileNumberfield == 'true'){
		$("#addressDiv").removeClass("hide");
	}else{
		$("#addressDiv").addClass("hide");
	}
	
}
