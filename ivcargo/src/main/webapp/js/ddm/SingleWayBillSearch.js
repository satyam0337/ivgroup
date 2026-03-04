var response;
var count 			= 0;
var wayBillIdList	= [];
var ddmsHM			= null;
var ddmData			= null;
var doneTheStuff	= false;
var headerExist 	= false;
var totalQtyArr 	= new Array();
var totalWeightArr 	= new Array();
var totalToPayArr 	= new Array();
var totalAmtArr 	= new Array();
var totalDlyArr 	= new Array();
var wayBillIdArr 	= new Array();
var wayBillIdArr2 	= new Array();
var totalDlyAmt 	= new Array();
var myMap 			= new Map();
var lrObj2 			= null;
var isChecked		= false;
var	lorryHireAmount	= 0;
var allowToDecreaseDefaultMemoCharge= false;

function searchSingleWayBill(event,tableId) {
	
	if(!validateInput(1, 'wayBillNumber', 'wayBillNumber', 'wayBillNumberError',  lrNumberErrMsg)) {
		hideLayer();
		return false;
	}

	if(event.which){
		
		var keycode = event.which;

		if(keycode == 13){
			
			showLayer();
			var str = document.getElementById('wayBillNumber').value;
			var wbNo = str.replace(/\s+/g, '');
			if(wbNo.length > 0){

				//Check if already added
				var tbl  =  document.getElementById(tableId);
				var rowCount = tbl.rows.length;
				var flg = true;
				
				for (var i = 1; i < rowCount; i++) {
					var addedWbNo = tbl.rows[i].cells[2].innerHTML;
					
					if(addedWbNo == wbNo) {
						flg = false;
						showMessage('error', lrNumberAlreadyAdded(wbNo));
						hideLayer();
						break;
					}
				}
				
				if(flg == true || flg == 'true'){
					jsonObjectdata = new Object();
					jsonObjectdata.filter 			= 19; 
					
				if (configuration.searchDDMNumberByQRCodeScanner) {
        		  var parts = wbNo.split("~");
        			if (parts.length > 1) {
            			jsonObjectdata.wayBillNumber = parts[1];  
        			}else {
            			jsonObjectdata.wayBillNumber = wbNo;
       				 }
   		 		} else {
      			  jsonObjectdata.wayBillNumber = wbNo;
    			}
					
					var jsonStr = JSON.stringify(jsonObjectdata);

					$.getJSON("AjaxAction.do?pageId=9&eventId=16",
						{json:jsonStr}, function(data) {
							if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
								showMessage('error', data.errorDescription);
								hideLayer();
							} else {
								setJSONData (data);
							}
						hideLayer();
					});
				}
			}

		} else {
			hideLayer();
		}
	}
}

function setJSONData(jsonData) {
	var data						= jsonData;
	ddmsHM							= data.ddmsHM;
	var ddm							= null;
	var showBlackListedParty	    = false;
	var compareLRReceiveDateWhileDDMCreation = data.compareLRReceiveDateWhileDDMCreation;
//	configuration 					= data.configuration;
	
	allowToDecreaseDefaultMemoCharge	= data.allowToDecreaseDefaultMemoCharge;
		
	if(data.wbIdWiseBookingCharges)
		wbIdWiseBookingCharges	= data.wbIdWiseBookingCharges;
	
	if(data.wbIdWiseDeliveryCharges)
		wbIdWiseDeliveryCharges	= data.wbIdWiseDeliveryCharges;
	
	if(data.ddms) {
		if(Number(data.ddms.length) == 1) {
			ddm	= data.ddms[0];
						
			if(showPartyIsBlackListedParty &&
					(ddm.tbbBlackListed > 0 || ddm.consignorBlackListed > 0 || ddm.consigneeBlackListed > 0)){
				showBlackListedParty  = true;
				showBlacklistedMessage(ddm);
			}
			
			$('#wayBillNumber').val('');
			document.getElementById('wayBillNumber').focus();
			
			ddm.showBlackListedParty	= showBlackListedParty;
			ddm.ddbWiseSelfPartyId		= ddbWiseSelfPartyId;
			ddm.compareLRReceiveDateWhileDDMCreation = compareLRReceiveDateWhileDDMCreation
			
			if(!data.isNewDDMCreation) {
				if(executive.accountGroupId == 270)
					addWithNewOrder(ddm);
				else
					add(ddm);
				
				showLoadingDetails();
				showTruckLoadingDetails();
			} else {
				if(!checkIfExistsWithId(ddm.wayBillId,document.getElementById('lrDetailsTable'))) {
					setLRDetailsHeader(data);
					doneTheStuff		= false;
					var lRObj			= data.ddms[0];
					var wayBillId		= lRObj.wayBillId;
					// setting the values
					myMap.set(wayBillId, data);
					ddmData				= data;
					
					addCharges(ddmData);
				} else {
					showMessage('error', lrNumberAlreadyAdded(ddm.wayBillNumber));
					return false;
				}
			}
		} else
			setDDmDataToModal(data.ddms);
	}	
}

function setWayBillWiseMap(wayBillId){
	addCharges(myMap.get(wayBillId));
}

function setElementsForPopUp(ddmData){
	var data 			= ddmData;
	
	if(data.ddms != undefined && typeof data.ddms !== 'undefined'){
		var lRObj			= data.ddms[0];
	} else {
		var lRObj			= data;
	}

	var wayBillId			= lRObj.wayBillId;
	
	if(configuration.DeliveredTo) {
		if(configuration.DeliveredToAutoFill) {
			if(ddbWiseSelfPartyId != lRObj.consigneeCorpId) {
				$('#deliveredToName_' + wayBillId).val(lRObj.consigneeDetailsName);
				$('#deliveredToPhoneNo_' + wayBillId).val(lRObj.consigneePhoneNumber);
				$('#dlyToName_'+wayBillId).val(lRObj.consigneeDetailsName);
				$('#dlyToNumber_'+wayBillId).val(lRObj.consigneePhoneNumber);
			} else if(ddbWiseSelfPartyId == lRObj.consigneeCorpId) {
				$('#dlyToNumberTr').addClass('hide');
			}
		}
	} else {
		$('#deliveredToRow').addClass('hide');
	}
}

function addCharges(ddmData) {
	hideLayer();
	$('#delCharges').empty();
	$('#dlyToNameTd').empty();
	$('#dlyToNumberTd').empty();
	$('#addButton').empty();
	$('#addButton').remove();
	
	doneTheStuff 		= false;
	var data 			= ddmData;
	var dataKey			= Object.keys(activeDeliveryChargesGlobal);
	var dataKey2		= Object.keys(discountTypesGlobal);

	if(data.ddms != undefined && typeof data.ddms !== 'undefined'){
		var lRObj			= data.ddms[0];
	} else {
		var lRObj			= data;
	}
	
	var wayBillId		= lRObj.wayBillId;
	var bookingTotalAmt = 0;
	var initialiseFocusId;
	
	if(lRObj.wayBillTypeId == WAYBILL_TYPE_TO_PAY)
		bookingTotalAmt = lRObj.grandTotal;

	$("#dlyToNameTd").append('<input class="form-control height30px" type="text" placeholder="Name" onkeypress="return allowOnlyCharacter(event);" id="dlyToName_'+wayBillId+'" />');
	$("#dlyToNumberTd").append('<input class="form-control height30px" type="text" maxlength="10" placeholder="Number" onkeypress="return allowOnlyNumeric(event);" id="dlyToNumber_'+wayBillId+'" />');

	setElementsForPopUp(ddmData);
	
	$("#popUpContentOnLRPunch").modal({
		backdrop: 'static',
		keyboard: false
	});
	
	lrObj2	= lRObj;

	$('#wayBillNumerValue').html(lRObj.wayBillNumber);
	$('#wayBillType').html(lRObj.wayBillTypeStr);
	$('#from').html(lRObj.sourceBranch);
	$('#to').html(lRObj.destinationBranch);
	$('#consignee').html(lRObj.consigneeDetailsName);
	$('#article').html(lRObj.quantity);
	$('#weight').html(lRObj.actualWeight);
	$('#dlyAt').html(lRObj.deliveryToForUser);
	$('#bkgTotal').html(lRObj.grandTotal);
	$('#lrTypeId').val(lRObj.wayBillTypeId);
	
	if(configuration.DdmCharges && typeof dataKey !== 'undefined'){
		for (var i = 0; i < dataKey.length; i++) {
			var obj		= activeDeliveryChargesGlobal[dataKey[i]];
			var objKey	= Object.keys(obj);

			for (const element of objKey){
				var chargeId		= element;
				var chargeName		= obj[element];
				if(i == 0){
					initialiseFocusId = chargeId
				}
				setTimeout(function(){
					$('#charge_'+initialiseFocusId).focus();
					initialiseFocus();
				}, 500);
				
				var chargeAmount = $('#'+wayBillId+'_'+chargeId).text();
								
				if (chargeAmount == '') {
					if (chargeId == 206 && configuration.defaultMemoCharge > 0) {
						if (configuration.applyMemoChargeOnlyForTopay) {
							if (lRObj.wayBillTypeId == WAYBILL_TYPE_TO_PAY)
								chargeAmount = configuration.defaultMemoCharge
							else
								chargeAmount = 0;
						} else
							chargeAmount = configuration.defaultMemoCharge;
					} else
						chargeAmount = 0;
				}

				$('#charge_206').on('input blur', function (e) {
					const min = configuration.defaultMemoCharge;
					let val = $(this).val().replace(/\D/g, '');
					if (val === '') return $(this).val('');
					val = Number(val);
					
					if ((!allowToDecreaseDefaultMemoCharge && e.type === 'blur' && val < min) || val < 0) {
						val = min;
					}
  					
					$(this).val(val);
				});

				
				var tr 		=  $('<tr style="text-align: center;"></tr>');
				tr.append("<td class='text-info text-center' style='text-align: center; vertical-align: middle;background-color: #fdc8bf;font-weight: bold;'>"  + chargeName +  "</td>");
				tr.append("<td style='text-align: center; vertical-align: middle;'>" +
						"<input style='text-align: right;height: 30px;' class='form-control height30px' onkeypress='return allowOnlyNumeric(event);' onfocus='setBlankAmount(this);' onblur='calcGrandtotal("+wayBillId+"); clearIfNotNumeric(this,0);' onkeyup='clearIfNotNumeric(this,0);' type='text' " +
						"name='charge_"+chargeId+"' value='"+chargeAmount+"'  id='charge_"+chargeId+"' />" +
				"</td>");
				$('#delCharges').append(tr);
			}
		}
		
		
	}

		var tr 		=  $('<tr style="text-align: center;"></tr>');
		tr.append("<td class='text-info text-center' style='text-align: center; vertical-align: middle;background-color: #fdc8bf;font-weight: bold;'>Booking Amt</td>");
		tr.append("<td style='text-align: center; vertical-align: middle;'>" +
				"<input style='text-align: right;height: 30px;' class='form-control height30px' type='text' " +
				"name='bookingAmt_"+wayBillId+"' readonly='readonly' value='"+bookingTotalAmt+"'  id='bookingAmt_"+wayBillId+"' />" +
				"</td>");
		$('#delCharges').append(tr);
		
		if(configuration.isDiscountShow) {
			var tr 		=  $('<tr style="text-align: center;"></tr>');
			tr.append("<td class='text-info text-center' style='width: 99px;text-align: center; vertical-align: middle;background-color: #fdc8bf;font-weight: bold;'>Discont On</td>");
			tr.append('<td><select id="discountTypes_Def" name="discountTypes_Def" class="form-control text-center" data-tooltip = "Discount On"'
						+ 'onclick="hideAllMessages();" style="width: 103px;height: 30px;"></select></td>');
			
			setTimeout(function() { 
				if(discountTypesGlobal != undefined && typeof dataKey2 !== 'undefined') {
					$('#discountTypes_Def').append($("<option>").attr('value', 0).text("--Select--"));
					for (var i=0; i<dataKey2.length; i++) {
						var obj		= discountTypesGlobal[dataKey2[i]];
						$('#discountTypes_Def').append($("<option>").attr('value',dataKey2[i]).text(obj));

					}
				}
			}, 500);
			$('#delCharges').append(tr);
			var tr 		=  $('<tr style="text-align: center;"></tr>');
			tr.append("<td class='text-info text-center' style='width: 99px;text-align: center; vertical-align: middle;background-color: #fdc8bf;font-weight: bold;'>Delivery Discont</td>");
			tr.append("<td style='text-align: center; vertical-align: middle;'>" +
					"<input style='text-align: right;height: 30px;' class='form-control height30px' onkeypress='return allowOnlyNumeric(event);' onfocus='setBlankAmount(this);' onblur='calcGrandtotal("+wayBillId+"); clearIfNotNumeric(this,0);' onkeyup='clearIfNotNumeric(this,0);'' type='text' " +
					"name='dlyDiscount_"+wayBillId+"' value='"+0+"'  id='dlyDiscount_"+wayBillId+"' />" +
			"</td>");
			$('#delCharges').append(tr);
			
		}
		
		var tr 		=  $('<tr style="text-align: center;"></tr>');
		tr.append("<td class='text-info text-center' style='text-align: center; vertical-align: middle;background-color: #fdc8bf;font-weight: bold;'>Total Amount</td>");
		tr.append("<td style='text-align: center; vertical-align: middle;' >" +
				"<input style='text-align: right;height: 30px;' class='form-control height30px' type='text' " +
				"name='totalAmt' value='0' readonly='readonly' id='totalAmt' />" +
		"</td>");
		$('#delCharges').append(tr);
		
		var tr 		=  $('<tr style="text-align: center;"></tr>');
		tr.append("<td class='text-info text-center' style='width: 99px;text-align: center; vertical-align: middle;background-color: #fdc8bf;font-weight: bold;'>Remark</td>");
		tr.append("<td><input style='text-align: right;height: 30px;' class='form-control height30px' type='text' " +
				"name='remarkPopup_"+wayBillId+"' value='' id='remarkPopup_"+wayBillId+"' />" +
		"</td>");
		$('#delCharges').append(tr);
		
		response = data;
		var tr 		=  $('<tr id="addButton"></tr>');
		tr.append("<td colspan='2' style='text-align: end;vertical-align: bottom;'><button type='button' id='txnDetailsBtn' onclick='addDataToMainTables("+wayBillId+")' class='btn btn-primary'>Add</button></td>");
		$('#dlyToDetails').append(tr);
}

function addDataToMainTables(wayBillId){
	
	if(configuration.DeliveredTo) {
		if(typeof $('#dlyToName_'+wayBillId).val() != 'undefined'){
			if($('#dlyToName_'+wayBillId).val() == '' || $('#dlyToName_'+wayBillId).val() == null){
				showMessage('error', 'Please enter Delivery To Name !');
				changeTextFieldColor('dlyToName', '', '', 'red');
				return false;
			} 
			
			if($('#dlyToNumber_'+wayBillId).val() == '' || $('#dlyToNumber_'+wayBillId).val() == null){
				showMessage('error', 'Please enter Delivery To Number!');
				changeTextFieldColor('dlyToNumber', '', '', 'red');
				return false;
			}
		}
	}
	
	var totalDeliveryCharges = 0;
	var grandTotal 			 = 0;
	
	var dataKey		= Object.keys(activeDeliveryChargesGlobal);
	
	if(typeof dataKey !== 'undefined'){
		for (const element of dataKey) {
			let objKey	= Object.keys(activeDeliveryChargesGlobal[element]);
			
			for (let k = 0; k < objKey.length; k++) {
				let chargeAmount    = $('#charge_' + objKey[k]).val();
				
				totalDeliveryCharges = Number(totalDeliveryCharges + chargeAmount);
			}
		}
	}
	
	if(configuration.isDiscountShow && $('#dlyDiscount_'+wayBillId).val() > 0 && $('#discountTypes_Def').val() <= 0){
		showMessage('error', 'Please select Discount type!');
		changeTextFieldColor('discountTypes_Def', '', '', 'red');
		return false;
	}
	
	if(Number(lrObj2.wayBillTypeId) == WAYBILL_TYPE_TO_PAY)
		grandTotal	= Number(lrObj2.grandTotal + totalDeliveryCharges);
	else
		grandTotal	= Number(totalDeliveryCharges);
	
	if(grandTotal <= 0 && $('#dlyDiscount_'+wayBillId).val() > 0) {
		showMessage('error','Discount cannot be more than Delivery Amount');
		changeTextFieldColor('discountTypes_Def', '', '', 'red');
		return false;
	}
	
	if($('#dlyDiscount_'+wayBillId).val() > 0 && $('#dlyDiscount_'+wayBillId).val() > grandTotal) {
		showMessage('error','Discount cannot be more than Delivery Amount');
		changeTextFieldColor('discountTypes_Def', '', '', 'red');
		return false;
	}
	
	response.bookingTotal 	= $('#bookingAmt_'+wayBillId).val();
	response.totalAmt	 	= Number($('#totalAmt').val());
	response.dlyToName		= $('#dlyToName_'+wayBillId).val();
	response.dlyToPhone		= $('#dlyToNumber_'+wayBillId).val();
	response.remark_		= $('#remarkPopup_'+wayBillId).val();
	response.dlyDiscount	= $('#dlyDiscount_'+wayBillId).val();
	response.discountType	= $('#discountTypes_Def').val();
	
	if(!doneTheStuff) {
		doneTheStuff	= true;

		if(!checkIfExistsWithId(wayBillId,document.getElementById('lrDetailsTable')))
			setLRDetailsTable(response);
		else
			updateLRDetails(response);
		
		if( Number($('#totalAmt_'+wayBillId).text()) != Number($('#grandTotal_'+wayBillId).val())){
			$("#Tr_"+wayBillId+" td").css('background-color', '#efed0a');
		}

		setSummaryTable();
		$('#popUpContentOnLRPunch').modal('hide');
		$('#summaryDiv').removeClass('hide');
		$('#lrDetailsTableDiv').removeClass('hide');
		
		setTimeout(function() {
			$('#wayBillNumber').focus();
		}, 1000);
		
		updateSummary();
	}
}

function hideNShowVehcileDetails() {
	
	if($('#lrDetailsTable').exists() && $('#lrDetailsTable').is(':visible')){
		if(!validateDeliveryChargesEntry()){return false;}
	 }
	 
	if($('#middle-border-boxshadow').css('display') != 'none'){
		$('#middle-border-boxshadow').css('display','none');
	} else if($('#middle-border-boxshadow').css('display') == 'none'){
		$('#middle-border-boxshadow').css('display','block');
	}
	
	setTimeout(function(){
		$('#vehicleNumber').focus();
	}, 500);
	displayTruckLoadingDetails();
}

function setBlankAmount(obj) {
	if(obj.value=='0') {
		obj.value='';
	}
}

function setLRDetailsHeader(data){
	var dataKeyBkg	= null;
	var dataKey	= null;
	
	if(activeBookingCharges != null && activeBookingCharges != undefined) dataKeyBkg	= Object.keys(activeBookingCharges);	
	if(activeDeliveryChargesGlobal != null && activeDeliveryChargesGlobal != undefined) dataKey		= Object.keys(activeDeliveryChargesGlobal);
		
	if(!$("#lrHeader").exists() || $("#lrHeader").exists() == 'false') {
		var tr 	=  $('<tr style="text-align: center;" id="lrHeader"></tr>');
		
		var th0 =  $("<th height:50px; style='position: sticky;top: 0;text-align: center; vertical-align: middle;color:#31708f; background-color: #fdc8bf;'>All" +
						"<input id='selectAll' onclick='selectAll(this.checked);' name='selectAll' type='checkbox' value='Select All' /></th>");         
		var th1 =  $("<th height:50px; style='position: sticky;top: 0;text-align: center; vertical-align: middle;color:#31708f; background-color: #fdc8bf;'></th>");         
		var th2 =  $("<th height:50px; style='position: sticky;top: 0;text-align: center; vertical-align: middle;color:#31708f; background-color: #fdc8bf;'>LR Number</th>");
		var th3 =  $("<th width='' class='titletd hide' align='left'>WayBillId</th>");                                                                                       
		var th4 =  $("<th height:50px; style='position: sticky;top: 0;text-align: center; vertical-align: middle;color:#31708f; background-color: #fdc8bf;'>LR Type</th>");  
		var th5 =  $("<th height:50px; style='position: sticky;top: 0;text-align: center; vertical-align: middle;color:#31708f; background-color: #fdc8bf;'>Source</th>");   
		var th6 =  $("<th height:50px; style='position: sticky;top: 0;text-align: center; vertical-align: middle;color:#31708f; background-color: #fdc8bf;'>Consignee</th>");
	
		tr.append(th0);
		tr.append(th1);
		tr.append(th2);
		tr.append(th3);
		tr.append(th4);
		tr.append(th5);
		tr.append(th6);
	
		if(dataKeyBkg != null) {
			for (var i = 0; i < dataKeyBkg.length; i++) {
				var obj		= activeBookingCharges[dataKeyBkg[i]];
				var objKey	= Object.keys(obj);
				
				for (var k = 0; k < objKey.length; k++) {
					var chargeName		= obj[objKey[k]];
					
					tr.append('<th height:50px; style="position: sticky;top: 0;text-align: center; vertical-align: middle;color:#31708f; background-color: #fdc8bf;">' + chargeName + '</th>');
				}
			}
		}
	
		if(dataKey != null) {
			for (var i = 0; i < dataKey.length; i++) {
				var obj		= activeDeliveryChargesGlobal[dataKey[i]];
				var objKey	= Object.keys(obj);
				
				for (var k = 0; k < objKey.length; k++) {
					var chargeName		= obj[objKey[k]];
					tr.append('<th height:50px; style="position: sticky;top: 0;text-align: center; vertical-align: middle;color:#31708f; background-color: #fdc8bf;">' + chargeName + '</th>');
				}
			}
		}
		
		var th10 =  $("<th height:50px; style='position: sticky;top: 0;text-align: center; vertical-align: middle;color:#31708f; background-color: #fdc8bf;'>Bkg Total</th>");  
		var th11 =  $("<th height:50px; style='position: sticky;top: 0;text-align: center; vertical-align: middle;color:#31708f; background-color: #fdc8bf;'>Discount</th>");  
		var th7	 =  $("<th height:50px; style='position: sticky;top: 0;text-align: center; vertical-align: middle;color:#31708f; background-color: #fdc8bf;'>Total</th>");  
		var th8	 =  $("<th height:50px; style='position: sticky;top: 0;text-align: center; vertical-align: middle;color:#31708f; background-color: #fdc8bf;'>Article</th>");
		var th9  =  $("<th height:50px; style='position: sticky;top: 0;text-align: center; vertical-align: middle;color:#31708f; background-color: #fdc8bf;'>Weight</th>"); 
		var th12  =  $("<th height:50px; style='position: sticky;top: 0;text-align: center; vertical-align: middle;color:#31708f; background-color: #fdc8bf;'>Remark</th>"); 
	
		if(configuration.showLorryHireAmountColumn)
			var th13  =  $("<th height:50px; style='position: sticky;top: 0;text-align: center; vertical-align: middle;color:#31708f; background-color: #fdc8bf;'>Lorry Hire</th>"); 
		
		tr.append(th10);
		tr.append(th11);
		tr.append(th7);
		tr.append(th8);
		tr.append(th9);
		tr.append(th12);

		if(configuration.showLorryHireAmountColumn)
			tr.append(th13);
		
		$('#lrDetailsTable').append(tr);
	}
	
	headerExist =  true;
}

function setLRDetailsTable(data){
	var discAmt		= 0;
	var discType	= 0;
	var totalAmt	= 0;
	var dlyToName	= "";
	var dlyToNumber	= "";
	var dataKeyBkg	=  null;
	var dataKey	=  null;
	var remark_		=  "";
	
	if(activeBookingCharges != null && activeBookingCharges != undefined) dataKeyBkg	= Object.keys(activeBookingCharges);	
	if(activeDeliveryChargesGlobal != null && activeDeliveryChargesGlobal != undefined) dataKey		= Object.keys(activeDeliveryChargesGlobal);
	if(typeof data.dlyToPhone !== 'undefined') dlyToNumber = data.dlyToPhone;
	if(typeof data.dlyToName !== 'undefined') dlyToName 	= data.dlyToName;

	if(data.ddms != undefined || typeof data.ddms !== 'undefined')
		var lRObj1			= data.ddms[0];
	else
		var lRObj1			= data;

	var wayBillId		= lRObj1.wayBillId;

	var tr 				=  $("<tr id='Tr_"+wayBillId+"' style='text-align: center;' /></tr>");
	var totalTr 		=  $('<tr style="text-align: center;" id="totalTr"></tr>');

	var td0 	=  $("<td style='text-align: center; vertical-align: middle;' />");
	var td1 	=  $("<td style='text-align: center; vertical-align: middle;' />");
	var td2 	=  $("<td style='text-align: center; vertical-align: middle;' />");
	var td3 	=  $("<td style='text-align: center; vertical-align: middle;' />");
	var td4 	=  $("<td id='totalAmt_"+wayBillId+"' style='text-align: center; vertical-align: middle;' />");
	var td5 	=  $("<td style='text-align: center; vertical-align: middle;' />");
	var td6 	=  $("<td style='text-align: center; vertical-align: middle;' />");
	var td7 	=  $("<td style='text-align: center; vertical-align: middle;' />");
	var td10 	=  $("<td id='delyDiscount_"+wayBillId+"' style='text-align: center; vertical-align: middle;' />");
	var td11	=  $("<td id='tableRemark_"+wayBillId+"' style='text-align: right; vertical-align: middle;' />");
	
	if(configuration.showLorryHireAmountColumn)
		var td12	=  $("<td style='text-align: center; vertical-align: middle;'><input name='lrWiseLorryHireAmount_"+lRObj1.wayBillId+"' id='lrWiseLorryHireAmount_"+lRObj1.wayBillId+"'  type='text' value='' onkeypress='return allowOnlyNumeric(event);'/></td>");
	
	var totalTd0 	=  $("<td style='text-align: center; vertical-align: middle;' />");
	var totalTd1 	=  $("<td style='text-align: center; vertical-align: middle;' />");
	var totalTd2 	=  $("<td style='text-align: center; vertical-align: middle;' />");
	var totalTd3 	=  $("<td style='text-align: center; vertical-align: middle;' />");
	var totalTd4 	=  $("<td style='text-align: center; vertical-align: middle;' />");
	var totalTd5 	=  $("<td style='text-align: center; vertical-align: middle;' />");
	var totalTd6 	=  $("<td style='text-align: center; vertical-align: middle;' />");
	var totalTd7 	=  $("<td style='text-align: center; vertical-align: middle;' />");
	var totalTd8 	=  $("<td style='text-align: center; vertical-align: middle;' />");
	var totalTd9 	=  $("<td style='text-align: center; vertical-align: middle;' />");
	
	td0.append(lRObj1.wayBillNumber);
	$('#lrDetailsTable').append("<input name='wayBillBranchId_"+lRObj1.wayBillId+"' id='wayBillBranchId_"+lRObj1.wayBillId+"'  type='hidden' value='"+lRObj1.branchId+"'/>");
	td1.append(lRObj1.wayBillTypeStr);
	td2.append(lRObj1.sourceBranch);
	td3.append(lRObj1.consigneeDetailsName);

	if(typeof data.totalAmt !== 'undefined')
		totalAmt = data.totalAmt;
	else if(typeof lRObj1.grandTotal !== 'undefined')
		totalAmt = lRObj1.grandTotal;
	
	td4.append(totalAmt);
	td5.append(lRObj1.quantity);
	td6.append(lRObj1.actualWeight);
	
	if(lRObj1.wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
		totalAmt = lRObj1.grandTotal;
		td7.append(totalAmt);
	} else
		td7.append(0);
	
	if(typeof data.dlyDiscount !== 'undefined'){
		discAmt		= data.dlyDiscount;
		discType	= data.discountType;
	}

	if(typeof data.remark_ !== 'undefined')
		remark_ 	= data.remark_;

	td10.append(discAmt);
	td11.append(remark_);

	totalTd0.append('')
	totalTd1.append('')
	totalTd2.append(count)
	totalTd3.append('')
	totalTd4.append('')
	totalTd5.append('')
	totalTd6.append(lRObj1.grandTotal + $('#totalArtcile').val())
	totalTd7.append(lRObj1.quantity + $('#totalArtcile').val())
	totalTd8.append(lRObj1.actualWeight + $('#totalArtcile').val())
	totalTd9.append('')
	
	tr.append("<td style='text-align: center; vertical-align: middle;'><input name='wayBills' id='wayBills_"+lRObj1.wayBillId+"'  type='checkbox' value='"+wayBillId+"' onclick='setResetList(this)'/></td>");
	tr.append("<td style='text-align: center; vertical-align: middle;'>" +
			"<button type='button' id='editCharges' data-tooltip = 'Edit' onclick='setWayBillWiseMap("+wayBillId+")' class='btn-xs btn-primary'>Edit</button>" +		
	"</td>");
	tr.append(td0);
	tr.append("<td class='hide'>"+lRObj1.wayBillId+"</td>");
	tr.append(td1);
	tr.append(td2);
	tr.append(td3);
	
	totalTr.append(totalTd0);
	totalTr.append(totalTd1);
	totalTr.append(totalTd2);
	totalTr.append(totalTd3);
	totalTr.append(totalTd4);
	totalTr.append(totalTd5);
	
	if(dataKeyBkg != null) {
		for (var i = 0; i < dataKeyBkg.length; i++) {
			var obj		= activeBookingCharges[dataKeyBkg[i]];
			var objKey	= Object.keys(obj);
			
			for (var k = 0; k < objKey.length; k++) {
				var chargeId		= objKey[k];
				var chargeAmount    = $('#charge_'+chargeId).val();
				
				if(typeof chargeAmount === undefined || chargeAmount == undefined)
					chargeAmount = 0;
				
				tr.append("<td id='"+lRObj1.wayBillId +"_"+ chargeId+"' style='text-align: center; vertical-align: middle;'>" + chargeAmount + "</td>");
				totalTr.append("<td style='text-align: center; vertical-align: middle; id='#totalCharge_"+chargeId +"' > "+ chargeAmount + "</td>");
				
				$('#lrDetailsTable').append("<input name='bkgCharge_"+chargeId+"_"+lRObj1.wayBillId+"' id='bkgCharge_"+chargeId+"_"+lRObj1.wayBillId+"'  type='hidden' value='"+chargeAmount+"'/>");
			}
		}
	}
	
	if(dataKey != null) {
		for (var i = 0; i < dataKey.length; i++) {
			var obj		= activeDeliveryChargesGlobal[dataKey[i]];
			var objKey	= Object.keys(obj);
			
			for (var k = 0; k < objKey.length; k++){
				var chargeId		= objKey[k];
				var chargeAmount    = $('#charge_' + chargeId).val();
				
				
				if ((chargeAmount === '' || chargeAmount === undefined || chargeAmount === null) && chargeId == 206 && configuration.defaultMemoCharge > 0) {
					if (configuration.applyMemoChargeOnlyForTopay) {
						if (lRObj1.wayBillTypeId == WAYBILL_TYPE_TO_PAY)
							chargeAmount = configuration.defaultMemoCharge;
					} else
						chargeAmount = configuration.defaultMemoCharge;
				}
					
				if (typeof chargeAmount === 'undefined' || chargeAmount === undefined || chargeAmount === null)
					chargeAmount = 0;
			
				tr.append("<td id='"+lRObj1.wayBillId +"_"+ chargeId+"' style='text-align: center; vertical-align: middle;'>" + chargeAmount + "</td>");
				totalTr.append("<td style='text-align: center; vertical-align: middle; id='#totalCharge_"+chargeId +"' > "+ chargeAmount + "</td>");
				
				$('#lrDetailsTable').append("<input name='delCharge_"+chargeId+"_"+lRObj1.wayBillId+"' id='delCharge_"+chargeId+"_"+lRObj1.wayBillId+"'  type='hidden' value='"+chargeAmount+"'/>");
			}
		}
	}
	
	tr.append(td7);
	tr.append(td10);
	tr.append(td4);
	tr.append(td5);
	tr.append(td6);
	tr.append(td11);
	tr.append(td12);

	totalTr.append(totalTd6);
	totalTr.append(totalTd7);
	totalTr.append(totalTd8);
	
	totalTr.append(totalTd9);
	
	var hiddenTr = $('<tr style="text-align: center;"></tr>');
	
	hiddenTr.append("<td style='text-align: center; vertical-align: middle;'><input name='wayBillBranchId_"+lRObj1.wayBillId+"' id='wayBillBranchId_"+lRObj1.wayBillId+"'  type='hidden' value='"+lRObj1.branchId+"'/></td>");
	
	$('#lrDetailsTable').append("<input name='wayBillBranchId_"+lRObj1.wayBillId+"' id='wayBillBranchId_"+lRObj1.wayBillId+"'  type='hidden' value='"+lRObj1.branchId+"'/>");
	$('#lrDetailsTable').append("<input name='wayBillNumber_"+lRObj1.wayBillId+"' id='wayBillNumber_"+lRObj1.wayBillId+"'  type='hidden' value='"+lRObj1.wayBillNumber+"'/>");
	$('#lrDetailsTable').append("<input name='wayBillType_"+lRObj1.wayBillId+"' id='wayBillType_"+lRObj1.wayBillId+"'  type='hidden' value='"+lRObj1.wayBillTypeId+"'/>");
	$('#lrDetailsTable').append("<input name='lrActualWeight_"+lRObj1.wayBillId+"' id='lrActualWeight_"+lRObj1.wayBillId+"'  type='hidden' value='"+lRObj1.actualWeight+"'/>");
	$('#lrDetailsTable').append("<input name='quantity_"+lRObj1.wayBillId+"' id='quantity_"+lRObj1.wayBillId+"'  type='hidden' value='"+lRObj1.quantity+"'/>");
	$('#lrDetailsTable').append("<input name='wayBillReceivedDate_"+lRObj1.wayBillId+"' id='wayBillReceivedDate_"+lRObj1.wayBillId+"'  type='hidden' value='"+lRObj1.wayBillBookingDateTimeStamp+"'/>");
	$('#lrDetailsTable').append("<input name='wayBillSubRegionId_"+lRObj1.wayBillId+"' id='wayBillSubRegionId_"+lRObj1.wayBillId+"'  type='hidden' value='"+lRObj1.subRegionId+"'/>");
	$('#lrDetailsTable').append("<input name='grandTotal_"+lRObj1.wayBillId+"' id='grandTotal_"+lRObj1.wayBillId+"'  type='hidden' value='"+lRObj1.grandTotal+"'/>");
	$('#lrDetailsTable').append("<input name='deliveredToPhoneNo_"+lRObj1.wayBillId+"' id='deliveredToPhoneNo_"+lRObj1.wayBillId+"'  type='hidden' value='"+dlyToNumber+"'/>");
	$('#lrDetailsTable').append("<input name='deliveredToName_"+lRObj1.wayBillId+"' id='deliveredToName_"+lRObj1.wayBillId+"'  type='hidden' value='"+dlyToName+"'/>");
	$('#lrDetailsTable').append("<input name='discount_"+lRObj1.wayBillId+"' id='discount_"+lRObj1.wayBillId+"'  type='hidden' value='"+discAmt+"'/>");
	$('#lrDetailsTable').append("<input name='discountTypes_"+lRObj1.wayBillId+"' id='discountTypes_"+lRObj1.wayBillId+"'  type='hidden' value='"+discType+"'/>");
	$('#lrDetailsTable').append("<input name='remark_"+lRObj1.wayBillId+"' id='remark_"+lRObj1.wayBillId+"'  type='hidden' value='"+remark_+"'/>");
	$('#lrDetailsTable').append("<input name='lorryHire_"+lRObj1.wayBillId+"' id='lorryHire_"+lRObj1.wayBillId+"'  type='hidden' value='"+lorryHireAmount+"'/>");
	
	$('#lrDetailsTable').append(tr);
	myMap.set(Number(wayBillId), data);
}

function updateLRDetails(data) {
	var dataKey			= Object.keys(activeDeliveryChargesGlobal);
	
	if(data.ddms != undefined || typeof data.ddms !== 'undefined'){
		var lRObj1			= data.ddms[0];
	} else {
		var lRObj1			= data;
	}
	
	var wayBillId		= lRObj1.wayBillId;
	
	if(typeof dataKey !== 'undefined'){
		for (var i = 0; i < dataKey.length; i++) {
			
			var obj		= activeDeliveryChargesGlobal[dataKey[i]];
			var objKey	= Object.keys(obj);
			
			for (var k=0; k<objKey.length; k++){
				var chargeId		= objKey[k];
				
				$("#"+wayBillId+"_"+chargeId).html($('#charge_'+chargeId).val());
				$("#delCharge_"+chargeId+"_"+lRObj1.wayBillId).val($('#charge_'+chargeId).val());
			}
		}
	}

	$('#totalAmt_'+wayBillId).html(data.totalAmt);
	$('#delyDiscount_'+wayBillId).html(data.dlyDiscount);
	$('#discount_'+wayBillId).val(data.dlyDiscount);
	$('#discountTypes_'+wayBillId).val(data.discountType);
	$('#deliveredToName_'+wayBillId).val(data.dlyToName);
	$('#deliveredToPhoneNo_'+wayBillId).val(data.dlyToPhone);
	$('#remark_'+wayBillId).val(data.remark_);
	$('#tableRemark_' + wayBillId).html(data.remark_);
}

function setDDmDataToModal(ddms) {

	var ddm 		= null;

	$('#ddmTableEle').empty();
	wayBillIdList		= [];

	for (var i = 0; i < ddms.length; i++){
		ddm		= ddms[i];
		if(i == 0) {
			var tr 	=  $('<tr id="ddmDataDuplicatedLR" class="danger"/>'); 

			var th1 	=  $('<td/>');
			var th2 	=  $('<td/>');
			var th3 	=  $('<td/>');
			var th4 	=  $('<td/>');
			var th5 	=  $('<td/>');
			var th6 	=  $('<td/>');
			var th7 	=  $('<td/>');
			var th8 	=  $('<td/>');
			var th9 	=  $('<td/>');
			var th10 	=  $('<td/>');

			th1.append('<input name="ddmWaybillAll" id="ddmWaybillAll"  type="checkbox" value="0" onclick="setResetList(this);selectAllWayBillToDupliacteLR(this.checked);validateLrNumberSelection(this);">');
			th2.append("LR No");
			th3.append("Bkg Date");
			th4.append("Receive Date");
			th5.append("LR Type");
			th6.append("Amount");
			th7.append("Source");
			th8.append("Destination");
			th9.append("Consignor");
			th10.append("Consignee");

			tr.append(th1);
			tr.append(th2);
			tr.append(th3);
			tr.append(th4);
			tr.append(th5);
			tr.append(th6);
			tr.append(th7);
			tr.append(th8);
			tr.append(th9);
			tr.append(th10);

			$('#ddmTableEle').append(tr);
		} 
		var tr 	=  $('<tr/>'); 

		var td1 	=  $("<td class=isBlackListedParty_"+ ddm.wayBillId + " />");
		var td2 	=  $("<td class=isBlackListedParty_"+ ddm.wayBillId + " />");
		var td3 	=  $("<td class=isBlackListedParty_"+ ddm.wayBillId + " />");
		var td4 	=  $("<td class=isBlackListedParty_"+ ddm.wayBillId + " />");
		var td5 	=  $("<td class=isBlackListedParty_"+ ddm.wayBillId + " />");
		var td6 	=  $("<td class=isBlackListedParty_"+ ddm.wayBillId + " />");
		var td7 	=  $("<td class=isBlackListedParty_"+ ddm.wayBillId + " />");
		var td8 	=  $("<td class=isBlackListedParty_"+ ddm.wayBillId + " />");
		var td9 	=  $("<td class=isBlackListedParty_"+ ddm.wayBillId + " />");
		var td10 	=  $("<td class=isBlackListedParty_"+ ddm.wayBillId + " />");

		td1.append('<input name="ddmWaybill" id="ddmWaybill_'+ddm.wayBillId+'"  type="checkbox" value="'+ddm.wayBillId+'" onclick="setResetList(this);validateLrNumberSelection(this);">');
		td2.append(ddm.wayBillNumber);
		td3.append(ddm.wayBillBookingDateStr);
		td4.append(ddm.creationDateForUser);
		td5.append(ddm.wayBillTypeStr);
		td6.append(ddm.grandTotal);
		td7.append(ddm.sourceBranch);
		td8.append(ddm.destinationBranch);
		td9.append(ddm.consignorDetailsName);
		td10.append(ddm.consigneeDetailsName);

		tr.append(td1);
		tr.append(td2);
		tr.append(td3);
		tr.append(td4);
		tr.append(td5);
		tr.append(td6);
		tr.append(td7);
		tr.append(td8);
		tr.append(td9);
		tr.append(td10);

		$('#ddmTableEle').append(tr);
	}
	
	$('#dialogExcessForm').removeClass('hide');
	openDialog('dialogExcessForm');
	
	if(showPartyIsBlackListedParty) {
		for (var i = 0; i < ddms.length; i++){
			if(ddms[i].tbbBlackListed > 0 || ddms[i].consignorBlackListed > 0 || ddms[i].consigneeBlackListed > 0){
				$('.isBlackListedParty_'+ddms[i].wayBillId).css('background-color' , 'red');
				$('.isBlackListedParty_'+ddms[i].wayBillId).css('color' , 'black');
				$('.isBlackListedParty_'+ddms[i].wayBillId).css('font-weight' , 'bold');
			}
		}
	}
}

function setResetList(obj) {
	if($("#" + obj.id).val() != 0) {
		if(obj.checked)
			wayBillIdList.push($("#"+obj.id).val())
		else
			wayBillIdList.splice(wayBillIdList.indexOf($("#"+obj.id).val()),1);
	} else if(obj.checked) {
		for(var wayBillId in ddmsHM) {
			wayBillIdList.push(wayBillId)
		}
	} else
		wayBillIdList		= [];
}

function validateLrNumberSelection(obj){
	if(obj.value > 0){
		isChecked = $('#ddmWaybill_'+obj.value).is(':checked');
	}else{
		isChecked = $("#ddmWaybillAll").is(':checked');
	}
}

function setDataForDDM() {
	
	if(!isChecked) {
		showMessage('error', "Please Select LR Number");
		return false;
	}
	
	var ddbWiseSelfPartyId					= 0;

	for(var i = 0; i < wayBillIdList.length;i++) {
		ddm							= ddmsHM[wayBillIdList[i]];
		var showBlackListedParty	= showPartyIsBlackListedParty && (ddm.tbbBlackListed > 0 || ddm.consignorBlackListed > 0 || ddm.consigneeBlackListed > 0);

		ddm.showBlackListedParty	= showBlackListedParty;
		ddm.ddbWiseSelfPartyId		= ddbWiseSelfPartyId;
		
		if(!configuration.isNewDDMCreation) {
			if(executive.accountGroupId == 270)
				addWithNewOrder(ddm);
			else
				add(ddm);
			
			showLoadingDetails();
			showTruckLoadingDetails();
		} else {
			var lRObj			= ddm;
			var wayBillId		= lRObj.wayBillId;
			myMap.set(wayBillId, ddm);
			ddmData				= ddm;
			
			setLRDetailsHeader(ddmData);
		
			if(!checkIfExistsWithId(wayBillId,document.getElementById('lrDetailsTable'))) {
				setLRDetailsTable(ddmData);
			} else {
				updateLRDetails(ddmData);
			}

			setSummaryTable();
			$('#popUpContentOnLRPunch').modal('hide');
			$('#summaryDiv').removeClass('hide');
			$('#lrDetailsTableDiv').removeClass('hide');
			setTimeout(function(){
				$('#wayBillNumber').focus();
			}, 1000);
			updateSummary();
		}
	}
	$('#wayBillNumber').val('');
	document.getElementById('wayBillNumber').focus();

	closeJqueryDialog('dialogExcessForm');
	$('#dialogExcessForm').addClass('hide');
}

function showBlacklistedMessage(ddm){
		if(ddm.tbbBlackListed > 0 && ddm.consignorBlackListed > 0){
			showMessage('error', "Consignor and TBB Party are BlackListed ");
		}else if( ddm.consignorBlackListed > 0){
			showMessage('error', "Consignor Party  is  BlackListed ");
		}else if(ddm.consigneeBlackListed > 0){
			showMessage('error', "Consignee Party is BlackListed  ");
		}else if(ddm.tbbBlackListed > 0){
			showMessage('error', "TBB Party is BlackListed");
		}
		
}

function calcGrandtotal(wayBillId) {
	
	var total			= 0;
	var bookingAmt		= 0;
	var grandtotal 		= 0;
	var discAmount 		= 0;
	ddmData				= myMap.get(wayBillId);
	var dataKey			= Object.keys(activeDeliveryChargesGlobal);
	
	for (var i = 0; i < dataKey.length; i++) {
		var obj	= activeDeliveryChargesGlobal[dataKey[i]];
		var objKey	= Object.keys(obj);
		
		for (var k = 0; k < objKey.length; k++) {
			var chargeId		= objKey[k];
			
			var chargeTotal		= Number($('#charge_'+chargeId).val());
			total				= total + chargeTotal;
		}
	}
	
	if(configuration.isDiscountShow)
		discAmount	= Number($('#dlyDiscount_'+wayBillId).val());
	
	bookingAmt		= Number($('#bookingAmt_'+wayBillId).val());
	
	grandtotal 		= parseFloat((total + bookingAmt) - discAmount);
	
	$("#totalAmt").val(Math.round(grandtotal));
}

function selectAllWayBillToDupliacteLR(param) {

	if(document.getElementById('ddmTableEle')) {

		var tab 	= document.getElementById('ddmTableEle');
		var count 	= parseFloat(tab.rows.length-1);
		for (var row = count; row > 0; row--){
			if(tab.rows[row].style.display == ''){
				tab.rows[row].cells[0].firstChild.checked = param;
			}
		}
	}
}
function setConsineeNameAutoComplete(consigneeNameId) { 
	
	$("#"+consigneeNameId).autocomplete({
		source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&partyType=2,3",
		minLength: 3,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				$('#newConsigneeCorpAccId').val(ui.item.id);
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}
