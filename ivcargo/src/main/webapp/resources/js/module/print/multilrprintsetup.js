var QR_CODE_USING_WAYBILL_NUMBER	= 2;

define(['/ivcargo/resources/js/barcode/qrcode/qrcode.js'], function(QRCodeJS){	
	var
	summeryObject				= new Object();
	return {
		/*getConfiguration : function(configuration){
			var josnObject = new Object();
			josnObject.lrPrint_def 	= '/ivcargo/html/print/multiLr/multiLrPrint_Default.html';

			if (josnObject != null && josnObject[configuration.multiLrPrintFlavor] != undefined) {
				return josnObject[configuration.multiLrPrintFlavor];
			} else {
				return '';
			}
		},getFilePathForLabel:function(configuration){
			var josnObject = new Object();

			josnObject.lrPrint_def	= '/ivcargo/resources/js/module/view/multilrprint/multiLrPrint_def_FilePath.js';


			if (josnObject != null && josnObject[configuration.multiLrPrintFlavor] != undefined) {
				return josnObject[configuration.multiLrPrintFlavor];
			} else {
				return '';
			}

		},*/
		setLRDetails(wayBillModel,wayBillId,lrPrintConfig){
			var QrCodeHeight	= lrPrintConfig.QrCodeHeight;
			var QrCodeWidth	 	= lrPrintConfig.QrCodeWidth;
			var QtyTotal		= 0;
			showLayer();
			
			
			if(wayBillModel != undefined && wayBillModel != 'undefined' && typeof wayBillModel != 'undefined'){
				setTimeout(() => {
					$("#data_"+wayBillId).find('span[id=wayBillNumber]').html(wayBillModel.wayBillNumber);
					$("#data_"+wayBillId).find('span[id=waybillTypeName]').html(wayBillModel.waybillTypeName);
					$("#data_"+wayBillId).find('span[id=wayBillSourceBranchName]').html(wayBillModel.wayBillSourceBranchName);
					$("#data_"+wayBillId).find('span[id=wayBillDestinationBranchName]').html(wayBillModel.wayBillDestinationBranchName);
					$("#data_"+wayBillId).find('span[id=insuredByName]').html(wayBillModel.insuredByName);
					$("#data_"+wayBillId).find('span[id=insuranceNumber]').html(wayBillModel.insurance);
					
					if (wayBillModel.wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
						$('#data_' + wayBillId + ' .hideSelectorInTopayForSAL').hide();
						$('#data_' + wayBillId + ' .hideSelectorForPaidAndTBBForSAL').show();
					} else {
						$('#data_' + wayBillId + ' .hideSelectorForPaidAndTBBForSAL').hide();
						$('#data_' + wayBillId + ' .hideSelectorInTopayForSAL').show();
					}

					if(wayBillModel.privateMark != undefined && wayBillModel.privateMark != 'undefined')
						$("#data_"+wayBillId).find('span[id=privateMark]').html(wayBillModel.privateMark);
					else
						$("#data_"+wayBillId).find('span[id=privateMark]').html("--");

					$("#data_"+wayBillId).find('span[id=executiveName]').html(wayBillModel.executiveName);
					/*$("#data_"+wayBillId).find('span[id=deliveryToName]').html(wayBillModel.deliveryToName);*/
					$("#data_"+wayBillId).find('span[id=bookingChargesSum]').html(wayBillModel.bookingChargesSum);
					
					if(wayBillModel.taxByName != undefined && wayBillModel.taxByName != 'undefined')
						$("#data_"+wayBillId).find('span[id=taxByName]').html(wayBillModel.taxByName);
					else
						$("#data_"+wayBillId).find('span[id=taxByName]').html("--");
					
					if (wayBillModel.bookingTotal == 0)
						$("#data_"+wayBillId).find('span[id=taxPaidByOnWayBillType]').html("As per government noms");
					else if (wayBillModel.wayBillTypeId == WAYBILL_TYPE_PAID || wayBillModel.wayBillTypeId == WAYBILL_TYPE_CREDIT)
						$("#data_"+wayBillId).find('span[id=taxPaidByOnWayBillType]').html("Consignor");
					else if (wayBillModel.wayBillTypeId == WAYBILL_TYPE_TO_PAY)
						$("#data_"+wayBillId).find('span[id=taxPaidByOnWayBillType]').html("Consignee");
					
					if(wayBillModel.deliveryTo == DELIVERY_TO_DOOR_ID)
						$("#data_"+wayBillId).find('span[id=deliveryToName]').html('Door Delivery');
					else if(wayBillModel.deliveryTo == DELIVERY_TO_BRANCH_ID)
						$("#data_"+wayBillId).find('span[id=deliveryToName]').html('Office Delivery');
					$("#data_"+wayBillId).find('span[id=destHandlingBranchName]').html('( '+ wayBillModel.handlingBranchName + " )");
					$("#data_"+wayBillId).find('span[id=wayBillBookingDateTimeStr]').html(wayBillModel.wayBillBookingDateTimeStr);
					$("#data_"+wayBillId).find('span[id=chargeWeight]').html(wayBillModel.chargeWeight);
					$("#data_"+wayBillId).find('span[id=chargeTypeName]').html(wayBillModel.chargeTypeName);
					$("#data_"+wayBillId).find('span[id=wayBillActualWeight]').html(wayBillModel.wayBillActualWeight);
					$("#data_"+wayBillId).find('span[id=wayBillDeclaredValue]').html(wayBillModel.wayBillDeclaredValue);
					$("#data_"+wayBillId).find('span[id=wayBillRemark]').html(wayBillModel.wayBillRemark);
					$("#data_"+wayBillId).find('span[id=wayBillConsignmentQuantity]').html(wayBillModel.wayBillConsignmentQuantity);
					$("#data_"+wayBillId).find('span[id=bookingTotal]').html(wayBillModel.bookingTotal);
					$("#data_"+wayBillId).find('span[id=vehicleNumber]').html(wayBillModel.vehicleNumber);
					$("#data_"+wayBillId).find('span[id=vehicleTypeName]').html(wayBillModel.vehicleTypeName);
					$("#data_"+wayBillId).find('span[id=additionalRemark]').html(wayBillModel.additionalRemark);
					$("#data_"+wayBillId).find('span[id=transportModeName]').html(wayBillModel.transportModeName);
					if(wayBillModel.wayBillConsignorInvoiceNo != undefined && wayBillModel.wayBillConsignorInvoiceNo != 'undefined' ){
						$("#data_"+wayBillId).find('span[id=consignorInvoiceNo]').html(wayBillModel.wayBillConsignorInvoiceNo);
					}else{
						$("#data_"+wayBillId).find('span[id=consignorInvoiceNo]').html("--");
					}
					
					$("#data_"+wayBillId).find('span[class=wayBillNumber]').html(wayBillModel.wayBillNumber);
					$("#data_"+wayBillId).find('span[class=waybillTypeName]').html(wayBillModel.waybillTypeName);
					$("#data_"+wayBillId).find('span[class=wayBillSourceBranchName]').html(wayBillModel.wayBillSourceBranchName);
					$("#data_"+wayBillId).find('span[class=wayBillDestinationBranchName]').html(wayBillModel.wayBillDestinationBranchName);
					$("#data_"+wayBillId).find('span[class=insuredByName]').html(wayBillModel.insuredByName);
					if(wayBillModel.privateMark != undefined && wayBillModel.privateMark != 'undefined' ){
						$("#data_"+wayBillId).find('span[class=privateMark]').html(wayBillModel.privateMark);
					}else{
						$("#data_"+wayBillId).find('span[class=privateMark]').html("--");
					}
					$("#data_"+wayBillId).find('span[class=executiveName]').html(wayBillModel.executiveName);
					$("#data_"+wayBillId).find('span[class=deliveryToName]').html(wayBillModel.deliveryToName);
					$("#data_"+wayBillId).find('span[class=bookingChargesSum]').html(wayBillModel.bookingChargesSum);
					if(wayBillModel.taxByName != undefined && wayBillModel.taxByName != 'undefined' ){
						$("#data_"+wayBillId).find('span[class=taxByName]').html(wayBillModel.taxByName);
					}else{
						$("#data_"+wayBillId).find('span[class=taxByName]').html("--");
					}
					$("#data_"+wayBillId).find('span[class=wayBillBookingDateTimeStr]').html(wayBillModel.wayBillBookingDateTimeStr);
					$("#data_"+wayBillId).find('span[class=chargeWeight]').html(wayBillModel.chargeWeight);
					$("#data_"+wayBillId).find('span[class=chargeTypeName]').html(wayBillModel.chargeTypeName);
					$("#data_"+wayBillId).find('span[class=wayBillActualWeight]').html(wayBillModel.wayBillActualWeight);
					$("#data_"+wayBillId).find('span[class=wayBillDeclaredValue]').html(wayBillModel.wayBillDeclaredValue);
					$("#data_"+wayBillId).find('span[class=wayBillRemark]').html(wayBillModel.wayBillRemark);
					$("#data_"+wayBillId).find('span[class=wayBillConsignmentQuantity]').html(wayBillModel.wayBillConsignmentQuantity);
					if(wayBillModel.wayBillConsignorInvoiceNo != undefined && wayBillModel.wayBillConsignorInvoiceNo != 'undefined' ){
						$("#data_"+wayBillId).find('span[class=consignorInvoiceNo]').html(wayBillModel.wayBillConsignorInvoiceNo);
					}else{
						$("#data_"+wayBillId).find('span[class=consignorInvoiceNo]').html("--");
					}
					$("#data_"+wayBillId).find('span[class=wayBillBookingTimeStr]').html(wayBillModel.bookingTimeString);
					
					$("#barcode1").prop('id', "barcode1_"+wayBillId);
					$("#barcode2").prop('id', "barcode2_"+wayBillId);
					$("#barcode3").prop('id', "barcode3_"+wayBillId);
					
					QtyTotal += wayBillModel.wayBillConsignmentQuantity;
					$("#data_"+wayBillId).find('span[class=wayBillConsignmentQuantityTotal]').html(QtyTotal);
					
					
					if($("#data_"+wayBillId).find('div[id=barcode1_'+wayBillId+']')){
						var qrcode1 = new QRCode(document.getElementById("barcode1_"+wayBillId), {
							width : QrCodeHeight,
							height : QrCodeWidth
						});
						qrcode1.makeCode(wayBillModel.wayBillId+"~"+wayBillModel.wayBillNumber+"~"+QR_CODE_USING_WAYBILL_NUMBER+"~"+0);
					}
					
					if($("#data_"+wayBillId).find('div[id=barcode2_'+wayBillId+']')){
						var qrcode2 = new QRCode(document.getElementById("barcode2_"+wayBillId), {
							width : QrCodeHeight,
							height : QrCodeWidth
						});
						qrcode2.makeCode(wayBillModel.wayBillId+"~"+wayBillModel.wayBillNumber+"~"+QR_CODE_USING_WAYBILL_NUMBER+"~"+0);
					}
					
					if($("#data_"+wayBillId).find('div[id=barcode3_'+wayBillId+']')){
						var qrcode3 = new QRCode(document.getElementById("barcode3_"+wayBillId), {
							width : QrCodeHeight,
							height : QrCodeWidth
						});
						qrcode3.makeCode(wayBillModel.wayBillId+"~"+wayBillModel.wayBillNumber+"~"+QR_CODE_USING_WAYBILL_NUMBER+"~"+0);
					}

				}, 500);
			}
		},setConsignmentDetails(consignmentArr,wayBillId){
			setTimeout(() => {
				
				
				var showQuantity 			= false;
				var showPackingType 		= false;
				var showSaidToContain 		= false;
				var showSeperater			= false;
				var commaSepratedSaidToContained = [];
				var commaSepratedPackingType = [];
				var classNameofQty 				= $("*[data-consignmentquantity='dynamic']").attr('class');
				var classNameofPackingType 		= $("*[data-consignmentpackingtype='dynamic']").attr('class');
				var classNameofSeperator 		= $("*[data-consignmentseperator='dynamic']").attr('class');
				var classNameofSaidToContain 	= $("*[data-consignmentsaidtocontain='dynamic']").attr('class');
				let totalQuantity = 0;
								

				$("*[data-consignmentquantity='dynamic']").each(function(){
					showQuantity 			= true;
				});

				$("*[data-consignmentpackingtype='dynamic']").each(function(){
					showPackingType 		= true;
				});

				$("*[data-consignmentseperator='dynamic']").each(function(){
					showSeperater 		= true;
				});

				$("*[data-consignmentsaidtocontain='dynamic']").each(function(){
					showSaidToContain = true;
				});

				var tbody = $("*[data-consignmentquantity='dynamic']").parent().parent();
				

				for(var index in consignmentArr){
					var saidToContain = consignmentArr[index].saidToContain;
					var packingTypeName = consignmentArr[index].packingTypeName;
					
					if(saidToContain != null)
						saidToContain	= saidToContain.replace("(New)", "");
					
					var newtr = $("<tr/>")
					
					if(showQuantity){
						var newtdQuantity = $("<td></td>");
						newtdQuantity.attr("class",classNameofQty);
						newtdQuantity.attr("data-selector",'qty'+consignmentArr[index].consignmentDetailsId);	
						newtr.append(newtdQuantity);
					}

					if(showPackingType){
						var newtdPackingType = $("<td></td>");
						newtdPackingType.attr("class",classNameofPackingType);
						newtdPackingType.attr("data-selector",'packingtype'+consignmentArr[index].consignmentDetailsId);
						newtr.append(newtdPackingType);
					}

					if(showSeperater){
						var newtdSeperator = $("<td></td>");
						newtdSeperator.attr("class",classNameofSeperator);
						newtdSeperator.attr("data-selector",'seperator');
						newtr.append(newtdSeperator);
					}

					if(showSaidToContain){
						var newtdSaidToContain = $("<td></td>");
						newtdSaidToContain.attr("class",classNameofSaidToContain);
						newtdSaidToContain.attr("data-selector",'saidToCOntain'+consignmentArr[index].consignmentDetailsId);
						newtr.append(newtdSaidToContain);
					}
					
					commaSepratedSaidToContained.push(saidToContain);
					commaSepratedPackingType.push(packingTypeName);
					$(tbody).before(newtr);
				}

				$("#data_"+wayBillId).find('span[id=saidtocontainname]').html(commaSepratedSaidToContained.join(', '));
				$("#data_"+wayBillId).find('span[id=packingTypeName]').html(commaSepratedPackingType.join(', '));
				for(var index in consignmentArr){
					var pos = Number(index) + Number(1);
					totalQuantity		+= consignmentArr[index].quantity;

					$('div[id=data_'+wayBillId+']').find("span[data-consignmentquantity='"+(pos)+"']").html(consignmentArr[index].quantity);
					$('div[id=data_'+wayBillId+']').find("span[data-consignmentpackingtype='"+(pos)+"']").html(consignmentArr[index].packingTypeName);
					$('div[id=data_'+wayBillId+']').find("span[data-consignmentseperator='"+(pos)+"']").html('of ');
					
					let saidToContain	= consignmentArr[index].saidToContain;
					
					if(saidToContain != undefined)
						$('div[id=data_'+wayBillId+']').find("span[data-consignmentsaidtocontain='"+(pos)+"']").html(saidToContain.replace("(New)", ""));
					
					$('div[id=data_'+wayBillId+']').find("span[data-consignmentdescription='"+(pos)+"']").html(consignmentArr[index].packingTypeName + 'of ' + saidToContain.replace("(New)", ""));
										
					if(consignmentArr[index].weightRate == 0)
						$('div[id=data_'+wayBillId+']').find("span[data-consignmentArticleRateForSAL='"+(pos)+"']").html(consignmentArr[index].amount);	
					else
						$('div[id=data_'+wayBillId+']').find("span[data-consignmentArticleRateForSAL='1']").html(consignmentArr[index].weightRate);
				}
				$('div[id=data_'+wayBillId+']').find('span[id=totalQuantity]').html(totalQuantity);
			}, 500);
		},setConsignorDetails : function(consignor,wayBillId){
			if(consignor != undefined && consignor != 'undefined' && typeof consignor != 'undefined'){
				let isConsignorGST	= consignor.consignorGSTN != "" && consignor.consignorGSTN != undefined && consignor.consignorGSTN != 'undefined';
				
				setTimeout(() => {
					$('div[id=data_'+wayBillId+']').find('span[id=consignor]').html(consignor.wayBillConsignorName);
					$('div[id=data_'+wayBillId+']').find('span[id=consignorMobileNumber]').html(consignor.consignorMobileNumber);
					$('div[id=data_'+wayBillId+']').find('span[id=consignornumberwithbracket]').html('('+consignor.consignorMobileNumber+')');
					$('div[id=data_'+wayBillId+']').find('span[id=consignorPhoneNumber]').html(consignor.consignorPhoneNumber);
					$('div[id=data_'+wayBillId+']').find('span[id=consignorAddress]').html(consignor.consignorAddress);
					
					if(isConsignorGST)
						$('div[id=data_'+wayBillId+']').find('span[id=consignorGSTN]').html(consignor.consignorGSTN);
					else
						$('div[id=data_'+wayBillId+']').find('span[id=consignorGSTN]').html("--");
					
					$('div[id=data_'+wayBillId+']').find('span[class=consignor]').html(consignor.wayBillConsignorName);
					$('div[id=data_'+wayBillId+']').find('span[class=consignorSubStr]').html((consignor.wayBillConsignorName).substring(0,20) + '..');
					$('div[id=data_'+wayBillId+']').find('span[class=consignorMobileNumber]').html(consignor.consignorMobileNumber);
					$('div[id=data_'+wayBillId+']').find('span[class=consignornumberwithbracket]').html('('+consignor.consignorMobileNumber+')');
					$('div[id=data_'+wayBillId+']').find('span[class=consignorPhoneNumber]').html(consignor.consignorPhoneNumber);
					$('div[id=data_'+wayBillId+']').find('span[class=consignorAddress]').html(consignor.consignorAddress);

					if(isConsignorGST) {
						$('div[id=data_'+wayBillId+']').find('span[class=consignorGSTN]').html(consignor.consignorGSTN);
						$('div[id=data_'+wayBillId+']').find('span[class=consGstnForBatco]').html(consignor.consignorGSTN);
					} else {
						$('div[id=data_'+wayBillId+']').find('span[class=consignorGSTN]').html("--");
						$('div[id=data_'+wayBillId+']').find('span[class=consGstnForBatco]').html('URD');
					}

				}, 500);
			}
		},setConsigneeDetails : function(consignee,wayBillId){
			if(consignee != undefined && consignee != 'undefined' && typeof consignee != 'undefined') {
				let isConsigneeGST	= consignee.consigneeGSTN != "" && consignee.consigneeGSTN != undefined && consignee.consigneeGSTN != 'undefined';
				
				setTimeout(() => {
					$('div[id=data_'+wayBillId+']').find('span[id=consignee]').html(consignee.wayBillConsigneeName);
					$('div[id=data_'+wayBillId+']').find('span[id=consigneeMobileNumber]').html(consignee.consigneeMobileNumber);
					$('div[id=data_'+wayBillId+']').find('span[id=consigneenumberwithbracket]').html('('+consignee.consigneeMobileNumber+')');
					$('div[id=data_'+wayBillId+']').find('span[id=consigneeAddress]').html(consignee.consigneeAddress);
					
					if(isConsigneeGST)
						$('div[id=data_'+wayBillId+']').find('span[id=consigneeGSTN]').html(consignee.consigneeGSTN);
					else
						$('div[id=data_'+wayBillId+']').find('span[id=consigneeGSTN]').html("--");
					
					$('div[id=data_'+wayBillId+']').find('span[class=consignee]').html(consignee.wayBillConsigneeName);
					$('div[id=data_'+wayBillId+']').find('span[class=consigneeSubStr]').html((consignee.wayBillConsigneeName).substring(0,20) + '..');
					$('div[id=data_'+wayBillId+']').find('span[class=consigneeMobileNumber]').html(consignee.consigneeMobileNumber);
					$('div[id=data_'+wayBillId+']').find('span[class=consigneenumberwithbracket]').html('('+consignee.consigneeMobileNumber+')');
					
					if(isConsigneeGST) {
						$('div[id=data_'+wayBillId+']').find('span[class=consigneeGSTN]').html(consignee.consigneeGSTN);
						$('div[id=data_'+wayBillId+']').find('span[class=coneGstnForBatco]').html(consignee.consigneeGSTN);
					} else {
						$('div[id=data_'+wayBillId+']').find('span[class=consigneeGSTN]').html("--");
						$('div[id=data_'+wayBillId+']').find('span[class=coneGstnForBatco]').html('URD');
					}
				}, 500);
			}
		}, setFormTypeDetails : function(formTypesList, wayBillId) {
			if(formTypesList != undefined && formTypesList != 'undefined' && typeof formTypesList != 'undefined') {
				setTimeout(() => {
					if(formTypesList.formNumber != undefined && formTypesList.formNumber != 'undefined' && typeof formTypesList.formNumber != 'undefined')
						$('div[id=data_'+wayBillId+']').find('span[id=formNumber]').html(formTypesList.formNumber);
					else
						$('div[id=data_'+wayBillId+']').find('span[id=formNumber]').html("--");
					
					if(formTypesList.formTypesName != undefined && formTypesList.formTypesName != 'undefined' && typeof formTypesList.formTypesName != 'undefined'){
						$('div[id=data_'+wayBillId+']').find('span[id=formTypesName]').html(formTypesList.formTypesName);
						
						if(formTypesList.formTypesName != 'CC Attached')
							$('div[id=data_'+wayBillId+']').find('span[id=ccAtached]').html("CC ATTACHED");
						else
							$('div[id=data_'+wayBillId+']').find('span[id=ccAtached]').html(" ");
					} else
						$('div[id=data_'+wayBillId+']').find('span[id=formTypesName]').html("--");

				}, 500);
			}
		},setCurrentDateTime : function(currentTime,currentDate,wayBillId){
			setTimeout(() => {
				$('div[id=data_'+wayBillId+']').find('span[id=currentTime]').html(currentTime);
				$('div[id=data_'+wayBillId+']').find('span[id=currentDate]').html(currentDate);
			}, 500);
		},setBranchDetails : function(destBranchHM,sourceBranchHM,wayBillId){
			setTimeout(() => {
				var sourceBranchphNumber	=	null;
				var destBranachPhNumber		= 	null;
				
				if(sourceBranchHM.branchContactDetailPhoneNumber != undefined && sourceBranchHM.branchContactDetailPhoneNumber != 0)
					sourceBranchphNumber	= sourceBranchHM.branchContactDetailPhoneNumber
				else
					sourceBranchphNumber = '--'
					
				if(destBranchHM.branchContactDetailPhoneNumber != undefined && sourceBranchHM.branchContactDetailPhoneNumber != 0)
					destBranachPhNumber	= destBranchHM.branchContactDetailPhoneNumber
				else
					destBranachPhNumber = '--'
				
				if(destBranchHM != undefined && destBranchHM != 'undefined' && typeof destBranchHM != 'undefined'){
					$('div[id=data_'+wayBillId+']').find('span[id=destinationBranchAddress]').html(destBranchHM.branchAddress);
					$('div[id=data_'+wayBillId+']').find('span[id=destinationBranchCode]').html(destBranchHM.branchCode);
					
					if(destBranchHM.branchContactDetailMobileNumber != '0000000000')
						$('div[id=data_'+wayBillId+']').find('span[id=destinationMobileNumber]').html(destBranchHM.branchContactDetailMobileNumber);
					
					$('div[id=data_'+wayBillId+']').find('span[id=destinationMobileNumber2]').html(destBranchHM.branchContactDetailMobileNumber2);
					$('div[id=data_'+wayBillId+']').find('span[id=destinationPhoneNumber]').html(destBranchHM.branchContactDetailPhoneNumber);
					$('div[id=data_'+wayBillId+']').find('span[id=destinationBranchGSTN]').html(destBranchHM.branchGSTN);
					$('div[id=data_'+wayBillId+']').find('span[id=destinationBranchDisplayName]').html(destBranchHM.branchDisplayName);
					$('div[id=data_'+wayBillId+']').find('span[class=destinationBranchAddress]').html(destBranchHM.branchAddress);
					$('div[id=data_'+wayBillId+']').find('span[class=destinationBranchCode]').html(destBranchHM.branchCode);
					$('div[id=data_'+wayBillId+']').find('span[class=destinationMobileNumber]').html(destBranchHM.branchContactDetailMobileNumber);
					$('div[id=data_'+wayBillId+']').find('span[class=destinationMobileNumber2]').html(destBranchHM.branchContactDetailMobileNumber2);
					$('div[id=data_'+wayBillId+']').find('span[class=destinationPhoneNumber]').html(destBranchHM.branchContactDetailPhoneNumber);
					$('div[id=data_'+wayBillId+']').find('span[class=destinationBranchGSTN]').html(destBranchHM.branchGSTN);
					$('div[id=data_'+wayBillId+']').find('span[class=destinationBranchDisplayName]').html(destBranchHM.branchDisplayName);
					$('div[id=data_'+wayBillId+']').find('span[class=destinationBranchWithPhNumber]').html(destBranchHM.branchName+'('+destBranachPhNumber+')');
				}
				
				if(sourceBranchHM != undefined && sourceBranchHM != 'undefined' && typeof sourceBranchHM != 'undefined'){
					$('div[id=data_'+wayBillId+']').find('span[id=sourceBranchAddress]').html(sourceBranchHM.branchAddress);
					$('div[id=data_'+wayBillId+']').find('span[id=sourceBranchCode]').html(sourceBranchHM.branchCode);
					$('div[id=data_'+wayBillId+']').find('span[id=sourceBranchMobileNumber]').html(sourceBranchHM.branchContactDetailMobileNumber);
					$('div[id=data_'+wayBillId+']').find('span[id=sourceBranchMobileNumber2]').html(sourceBranchHM.branchContactDetailMobileNumber2);
					$('div[id=data_'+wayBillId+']').find('span[id=sourceBranchPhoneNumber]').html(sourceBranchHM.branchContactDetailPhoneNumber);
					$('div[id=data_'+wayBillId+']').find('span[id=sourceBranchGSTN]').html(sourceBranchHM.branchGSTN);
					$('div[id=data_'+wayBillId+']').find('span[id=sourceBranchDisplayName]').html(sourceBranchHM.branchDisplayName);
					$('div[id=data_'+wayBillId+']').find('span[id=branchContactDetailEmailAddress]').html(sourceBranchHM.branchContactDetailEmailAddress);
					$('div[id=data_'+wayBillId+']').find('span[id=branchPanNumber]').html(sourceBranchHM.branchPanNumber);
					$('div[id=data_'+wayBillId+']').find('span[class=sourceBranchAddress]').html(sourceBranchHM.branchAddress);
					$('div[id=data_'+wayBillId+']').find('span[class=sourceBranchCode]').html(sourceBranchHM.branchCode);
					$('div[id=data_'+wayBillId+']').find('span[class=sourceBranchMobileNumber]').html(sourceBranchHM.branchContactDetailMobileNumber);
					$('div[id=data_'+wayBillId+']').find('span[class=sourceBranchMobileNumber2]').html(sourceBranchHM.branchContactDetailMobileNumber2);
					$('div[id=data_'+wayBillId+']').find('span[class=sourceBranchPhoneNumber]').html(sourceBranchHM.branchContactDetailPhoneNumber);
					$('div[id=data_'+wayBillId+']').find('span[class=sourceBranchGSTN]').html(sourceBranchHM.branchGSTN);
					$('div[id=data_'+wayBillId+']').find('span[class=sourceBranchDisplayName]').html(sourceBranchHM.branchDisplayName);
					$('div[id=data_'+wayBillId+']').find('span[class=sourceBranchWithPhNumber]').html(sourceBranchHM.branchName+'('+sourceBranchphNumber+')');
				}
			}, 500);
			
			hideLayer();
		}, setPrintHeaderModel(printHeader, wayBillId){
			setTimeout(() => {
				$('div[id=data_'+wayBillId+']').find('span[class=accountGroupName]').html(printHeader.accountGroupName);
				$('div[id=data_'+wayBillId+']').find('span[class=accountGroupAddress]').html(printHeader.branchAddress);
				$('div[id=data_'+wayBillId+']').find('span[class=accountGroupPhone]').html('('+ printHeader.accountGroupPhoneNo + ')');
				$('div[id=data_'+wayBillId+']').find('span[class=accountGroupGSTN]').html(printHeader.branchGSTN);
				$('div[id=data_'+wayBillId+']').find('span[class=branchMobileNo]').html(printHeader.branchContactDetailMobileNumber ? printHeader.branchContactDetailMobileNumber : "--");
				$('div[id=data_'+wayBillId+']').find('span[class=branchMobileNo2]').html(printHeader.branchContactDetailMobileNumber2 ? printHeader.branchContactDetailMobileNumber2 : "--");
				$('div[id=data_'+wayBillId+']').find('span[class=emailId]').html(printHeader.branchContactDetailEmailAddress);
			},
			500);
		},setBookingCharges(wayBillIdWiseBookingchargesArr, wayBillId, wayBillModel) {
			setTimeout(() => {
				var showChargeName	= false;
				var showChargeValue	= false;
				var grandTotal		= 0;
				
				var chargeName 				= $("*[data-chargeName='dynamic']").attr('class');
				var chargeAmount 			= $("*[data-chageValue='dynamic']").attr('class');
				
				$("*[data-chargeName1='dynamic']").each(function(){
					showChargeName 			= true;
				});
	
				$("*[data-chageValue='dynamic']").each(function(){
					showChargeValue 		= true;
				});
	
				var tbody = $("*[data-chargeName='dynamic']").parent().parent();
					
				for(var index in wayBillIdWiseBookingchargesArr){
					$('div[id=data_' + wayBillId + ']').find('span[class=chargeValue' + wayBillIdWiseBookingchargesArr[index].chargeTypeMasterId + ']').html(wayBillIdWiseBookingchargesArr[index].wayBillBookingChargeChargeAmount);
					$('div[id=data_' + wayBillId + ']').find('span[id=chargeValue' + wayBillIdWiseBookingchargesArr[index].chargeTypeMasterId + ']').html(wayBillIdWiseBookingchargesArr[index].wayBillBookingChargeChargeAmount);	
						
					var newtr = $("<tr/>")
	
					if(showChargeName){
						var newtdChargeName = $("<td></td>");
						newtdChargeName.attr("class",chargeName);
						newtdChargeName.attr("data-selector",'chargeName'+wayBillIdWiseBookingchargesArr[index].chargeTypeMasterId);					
						newtr.append(newtdChargeName);
					}
	
					if(showChargeValue){
						var newtdChargeValue = $("<td></td>");
						newtdChargeValue.attr("class",chargeAmount);
						newtdChargeValue.attr("data-selector",'chargeValue'+wayBillIdWiseBookingchargesArr[index].chargeTypeMasterId);
						newtr.append(newtdChargeValue);
					}
					
					$(tbody).before(newtr); 
				}
					
				for(var index in wayBillIdWiseBookingchargesArr){
					var pos = Number(index) + Number(1);
						
					$('div[id=data_'+wayBillId+']').find("span[data-chargeName='"+(pos)+"']").html(wayBillIdWiseBookingchargesArr[index].chargeTypeMasterName);
					$('div[id=data_'+wayBillId+']').find("span[data-chargeValue='"+(pos)+"']").html(wayBillIdWiseBookingchargesArr[index].wayBillBookingChargeChargeAmount);
						
					grandTotal+= wayBillIdWiseBookingchargesArr[index].wayBillBookingChargeChargeAmount;
				}
					
				$('div[id=data_'+wayBillId+']').find('span[class=calculateTotal]').html(grandTotal);
			}, 500);
		
			setTimeout(()=>{
				let dynmictbody =  $("<tbody/>")
					for(let index in wayBillIdWiseBookingchargesArr){
						var newtr = $("<tr/>")
	
						var newtdChargeName = $("<td class='fontSize10px paddingLeft10px  pageBreakNeeded' ></td>");
						newtdChargeName.append(wayBillIdWiseBookingchargesArr[index].chargeTypeMasterName)
						var newtdChargeValue = $("<td  class='fontSize10px paddingRight5px textAlignRight   pageBreakNeeded' ></td>");
						newtdChargeValue.append(wayBillIdWiseBookingchargesArr[index].wayBillBookingChargeChargeAmount)
						newtr.append(newtdChargeName,newtdChargeValue);
						dynmictbody.append(newtr)
				}	
				
				if (wayBillModel.wayBillTypeId == WAYBILL_TYPE_TO_PAY)
					$('#data_' + wayBillId + ' .dynmicChargesTable').append(dynmictbody)
				else
			       $('#data_' + wayBillId + ' .dynmicChargesTableA').append(dynmictbody)
			},500);
			
			setTimeout(()=>{
				let dynamicBodyDefault =  $("<tbody/>")
					for(let index in wayBillIdWiseBookingchargesArr){
						var newtr = $("<tr/>")
	
						var newtdChargeName = $("<td class='paddingLeft3px  pageBreakNeeded  borderBottom   borderTop ' ></td>");
						newtdChargeName.append(wayBillIdWiseBookingchargesArr[index].chargeTypeMasterName)
						var newtdChargeValue = $("<td  class='textAlignRight textAlignRight pageBreakNeeded   borderBottom   borderLeft borderTop' ></td>");
						newtdChargeValue.append(wayBillIdWiseBookingchargesArr[index].wayBillBookingChargeChargeAmount)
						newtr.append(newtdChargeName,newtdChargeValue);
						dynamicBodyDefault.append(newtr)
				}	
					
				$('#data_' + wayBillId + ' .dynmicChargesTableDefault').append(dynamicBodyDefault)

			},500);
		},setInvoiceDetails (lrInvoiceDetail,wayBillId) {
			setTimeout(()=>{
				var invoiceNumber   ="";	
				var invoiceDate     ="";	
				var description     ="";	
				var partNumber      ="";	
				var quantity        ="";
				var descriptions = [];
				
				for (var index in lrInvoiceDetail) {
					invoiceNumber  = invoiceNumber + lrInvoiceDetail[index].invoiceNumber+"<br>";
					invoiceDate    = invoiceDate + lrInvoiceDetail[index].invoiceDate+"<br>";
					description    = description + lrInvoiceDetail[index].description+"<br>";
					partNumber     = partNumber + lrInvoiceDetail[index].partNumber+"<br>";
					quantity       = quantity + lrInvoiceDetail[index].quantity+"<br>";
			    	descriptions.push(lrInvoiceDetail[index].declaredValue);
				}
				
				$("#data_"+wayBillId).find('span[id="multipleInvoiceNumber"]').html(invoiceNumber);
				$("#data_"+wayBillId).find('span[id="multipleInvoiceDate"]').html(invoiceDate);
				$("#data_"+wayBillId).find('span[id="multipleInvoiceDeclaredValue"]').html(descriptions.join(', '));
				$("#data_"+wayBillId).find('span[id="multipleInvoiceDescription"]').html(description);
				$("#data_"+wayBillId).find('span[id="multipleInvoicePartNumber"]').html(partNumber);
				$("#data_"+wayBillId).find('span[id="multipleInvoiceQuantity"]').html(quantity);
			},500);
		},setEwayBillDetails (formTypesList, wayBillId){
			setTimeout(()=>{
				for(var index in formTypesList){
					if(wayBillId == formTypesList[index].wayBillId){
						
						var eWayBillNumbers     =  formTypesList[index].formNumber;
						var ewaybillArr = formTypesList[index].formNumber.split(',');
						
						if (ewaybillArr.length > 1)
							$("#data_"+wayBillId).find('span[id="EWayBillNoMinified"]').html(ewaybillArr[0] + '.. and More');
						else
							$("#data_"+wayBillId).find('span[id="EWayBillNoMinified"]').html(ewaybillArr[0]);
					
						var formNumberRow = eWayBillNumbers.replace(/,/g, '<br>');
						var formNumberRow1 = eWayBillNumbers.replace(/,/g, ' ');
						
						if(eWayBillNumbers != undefined){
							$("#data_"+wayBillId).find('span[id="eWayBillNumbers"]').html(formNumberRow);
							$("#data_"+wayBillId).find('span[id="eWayBillNumberModified"]').html(formNumberRow1);
						}
							
						break;
					}
					
				}
			},500);
		},showPopUp : function(){
			setTimeout(()=>{
				var showPopUp = true;
				if(showPopUp){
				$('#popUpContent669').bPopup({
						},function(){
								$(".hideTotal").hide();
							var _thisMod = this;
							$(this).html("<div class='confirm' style='height:180px'><h1>Print option</h1><br><center>" +
									"<input type='checkbox' name='setAmount' id='setAmount' style='font-weight: bold;font-size: 20px;' unchecked />Print Charges</center> " +
									"<br><br><button type='button' name='cancel' id='cancel' class='btn-primary'>Cancel</button>" +
							"<button type='button' name='printCharges' id='printCharges' class='btn-primary' style='margin-left: 50px;'>Print</button>");
		
							$('.confirm').focus();
							$('#printCharges').click(function(){
								_thisMod.close();
								setTimeout(function() {
									window.print();
									window.close();
								}, 500);
							})
							$("#cancel").click(function(){
								_thisMod.close();
							})
		
							$("#setAmount").click(function(){
								if ( $("#setAmount").is(":checked") ) {
									$(".hideTotal").show();
								} else if ( $("#setAmount").not(":checked") ) {
									$(".hideTotal").hide();
								}
							});
		
						});
					}
			},500)
			}
		}
});