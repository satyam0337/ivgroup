var PaymentTypeConstant;
var deliveryGrandTotal		=	0;
var packingTypeStr          =	null;		
var BATCO_SURAT_DLY_BRANCH_ID = 38634;
define(['/ivcargo/resources/js/barcode/qrcode/qrcode.js'],function(QRCodeJS) {
	'use strict';// this basically give strictness to this specific js
	return {
		getConfiguration : function(configuration, isMultiple, isSingleCrPrintNeededForSingleLrDelivery){
			if(isMultiple == 0 && (isSingleCrPrintNeededForSingleLrDelivery == true || isSingleCrPrintNeededForSingleLrDelivery == 'true'))
				return 'text!/ivcargo/html/print/delivery/' + configuration.crPrintType + '.html';
				
			return 'text!/ivcargo/html/print/delivery/singleCrMultiLrPrint/' + configuration.crPrintType + '.html';
		}, getFilePathForLabel : function(configuration) {
			return '/ivcargo/resources/js/module/print/deliveryprint/crprintfilepath.js';
		}, setHeaderDetails:function(responseOut) {
			var accountGroupObj = responseOut.PrintHeaderModel;
			var accountGroupName	= accountGroupObj.accountGroupName
			$("*[data-account='name']").html(accountGroupObj.accountGroupName);
			$("*[data-account='accountGroupName']").html(accountGroupName.toUpperCase());
			$("*[data-account='address']").html(accountGroupObj.branchAddress+". ");
			$("*[data-account='email']").html(accountGroupObj.branchContactDetailEmailAddress);
			
			if(accountGroupObj.branchAddress != undefined)
				$("*[data-account='addressbranch']").html(accountGroupObj.branchAddress.substring(0, 35)+". ");
			else
				$("*[data-account='addressbranch']").html(' ');
			
			if(accountGroupObj.branchContactDetailPhoneNumber != undefined)
				$("*[data-account='number']").html(accountGroupObj.branchContactDetailPhoneNumber);
			else
				$("*[data-account='number']").html(accountGroupObj.branchContactDetailMobileNumber);

			$("*[data-account='gstn']").html(accountGroupObj.branchGSTN);
			
			//if(accountGroupObj.branchId == BATCO_SURAT_DLY_BRANCH_ID)
				//$(".batcoBankDetails").show();
			setCompanyLogos(accountGroupObj.accountGroupId);
		}, setConsignorname:function(responseOut,count) {
			var crprintList = responseOut.crprintls[0];
			var configuration = responseOut.configuration;

			$("*[data-consignor='name']").html(crprintList.consignerName);
			
			if(crprintList.consignerAddress != undefined)
				$("*[data-consignor='address']").html(crprintList.consignerAddress);
			else
				$("*[data-consignor='address']").html("--");
			
			if(crprintList.consignerNumber != undefined)
				$("*[data-consignor='number']").html(crprintList.consignerNumber);
			else
				$("*[data-consignor='number']").html("");

			if(crprintList.consigneeGstnNumber != undefined)
				$("*[data-consignor='gstn']").html(crprintList.consignorGstnNumber);
			else
				$("*[data-consignor='gstn']").html('');

			$("*[data-consignee='name']").html(crprintList.consigneeName);

			if(crprintList.consigneeAddress != undefined)
				$("*[data-consignee='address']").html(crprintList.consigneeAddress);

			if(crprintList.consigneeNumber != undefined)
				$("*[data-consignee='number']").html(crprintList.consigneeNumber);
			else
				$("*[data-consignee='number']").html("");

			//	$("*[data-consignee='tinNo']").html(crprintList.customerDetailsTinNo.replace(/ /g, "&nbsp;"));
			if(crprintList.consigneeGstnNumber != undefined)
				$("*[data-consignee='gstn']").html(crprintList.consigneeGstnNumber);
			else
				$("*[data-consignee='gstn']").html('');
			
			if(crprintList.deliveredToName != undefined)
				$("*[data-consignee='deliveredToName']").html(crprintList.deliveredToName);
			else
				$("*[data-consignee='deliveredToName']").html('');
			
			//To add Barcode Id dynamically
			$('#barcode').attr("id","barcode"+count+"");
				if(document.getElementById("barcode"+count+"")){
					var qrcode1 = new QRCode(document.getElementById("barcode"+count+""), {
						width : configuration.QrCodeWidth,
						height : configuration.QrCodeHeight
					});
					qrcode1.makeCode(crprintList.wayBillId+"~"+crprintList.wayBillDeliveryNumber);
			}
			
			if(crprintList.wayBillSourceBranchName != undefined)
				$("*[data-Source='wayBillSourceBranchName']").html(crprintList.wayBillSourceBranchName);
			else
				$("*[data-Source='wayBillSourceBranchName']").html('--');
			
			if(crprintList.wayBillDestinationBranchName != undefined)
				$("*[data-Destination='wayBillDestinationBranchName']").html(crprintList.wayBillDestinationBranchName);
			else
				$("*[data-Destination='wayBillDestinationBranchName']").html('--');
		}, setCrDetails : function(responseOut,tableData){
			var crprintList			= responseOut.crprintls[0];
			var totalChargesAmtHM	= responseOut.totalChargesAmtHM;
			var lastItrObj			= tableData[tableData.length - 1];
			var totalHandling	= 0;
			var totalDemurrage	= 0;
			var totalTempo		= 0;
			var totalOther		= 0;
			var totalHamali		= 0;
			var totalDoorDly	= 0;			
			var totalService	= 0;
			var totalCharges	= 0;
			var totalET			= 0;
			var consolidateEWaybillNumber	= responseOut.consolidateEWaybillNumber;
			var consignementHm				= responseOut.consignementHm
			if (lastItrObj.lastITR == false) {
				$("[data-table='summaryTable']").remove();
				$("[data-table='total']").remove();
			}
			var tbody	= $("[data-dataTableDetail='srNumber']").parent().parent();
			var tbody2	= $("[data-dataTableDetail='srNumber1']").parent().parent();
			tbody		= (tbody[tbody.length-1]);
			tbody2		= (tbody2[tbody2.length-1]);

			var columnObjectForDetails		= $("[data-row='dataTableDetails']").children();

			var dataTable	= $("#dataTable").clone();
			var dataTable2	= $("#dataTable2").clone();
			$(dataTable).removeClass('hide');
			$(dataTable).addClass('bold');
			$(tbody).before(dataTable);
			
			$(dataTable2).removeClass('hide');
			$(dataTable2).addClass('bold');
			$(tbody2).before(dataTable2);

			if(tableData.lastItrObj == true || tableData.lastItrObj == 'true')
				$("#total").removeClass('hide');
			
			if(columnObjectForDetails != null && columnObjectForDetails.length > 0) {
				for(var i = 0; i < tableData.length;i++){
					let deliveryChargeList = tableData[i].deliveryChargeList;
					
					totalCharges += tableData[i].bookingChargesSum;
					
					if(tableData[i].wayBillNumber == undefined)
						continue;
					
					var newtr = $("<tr id='row_"+i+"' class=''></tr>");
					var newtr2 = $("<tr id='row_"+i+"' class=''></tr>");
					
					for(var j = 0; j < columnObjectForDetails.length; j++) {
						var newtd = $("<td></td>");
						var newtd2 = $("<td></td>");
						var dataPicker = $(columnObjectForDetails[j]).attr("data-dataTableDetail");
						$(newtd).attr("class",$(columnObjectForDetails[j]).attr("class"));
						$(newtd2).attr("class",$(columnObjectForDetails[j]).attr("class"));
						$(newtd).attr("data-dataTableDetail",$(columnObjectForDetails[j]).attr("data-dataTableDetail"));
						$(newtd2).attr("data-dataTableDetail2",$(columnObjectForDetails[j]).attr("data-dataTableDetail2"));
						
						if(tableData[i].wayBillTypeId != WAYBILL_TYPE_PAID && tableData[i].wayBillTypeId != WAYBILL_TYPE_CREDIT) {
							if(dataPicker == "bookingChargesSum"){
								$(newtd).html(Math.round(Number(tableData[i][dataPicker])));
								$(newtd2).html(Math.round(Number(tableData[i][dataPicker])));

								$("*[data-cr='totalbookingChargesSum']").html(totalCharges);
							} else
								$(newtd).html(tableData[i][dataPicker]);
								$(newtd2).html(tableData[i][dataPicker]);
						} else if(dataPicker == "bookingChargesSum")
							$(newtd).html("0"), $(newtd2).html("0");					

						else
							$(newtd).html(tableData[i][dataPicker]),$(newtd2).html(tableData[i][dataPicker]);
						
						if ($(newtd).hasClass('bookingChargesSumLrType')) {
			                if (tableData[i].wayBillTypeId === WAYBILL_TYPE_PAID) {
			                    $(newtd).html("PAID");
			                } else if (tableData[i].wayBillTypeId === WAYBILL_TYPE_CREDIT) {
			                    $(newtd).html("TBB");
			                } else {
			                    $(newtd).html(Math.round(Number(tableData[i][dataPicker])));
			                }
			            }
						//create column for delivery charges and display amount
						
						if(deliveryChargeList != undefined) {
							for(let k = 0; k < deliveryChargeList.length; k++) {
								var wayBillChargeMasterId		= deliveryChargeList[k].wayBillChargeMasterId;
								var wayBillDeliverychargeAmount	= deliveryChargeList[k].wayBillDeliverychargeAmount;
					
								if (dataPicker == "handlingCharge" && wayBillChargeMasterId == HANDLING) {
									$(newtd).html(''+wayBillDeliverychargeAmount);
									$(newtd2).html(''+wayBillDeliverychargeAmount);
									totalHandling = wayBillDeliverychargeAmount;
								} else if(dataPicker == "demurrage" && wayBillChargeMasterId == DEMURRAGE) {
									$(newtd).html(''+wayBillDeliverychargeAmount);
									$(newtd2).html(''+wayBillDeliverychargeAmount);
									totalDemurrage	= wayBillDeliverychargeAmount;
								} else if(dataPicker == "tempo" && wayBillChargeMasterId == TEMPO) {
									$(newtd).html(''+wayBillDeliverychargeAmount);
									$(newtd2).html(''+wayBillDeliverychargeAmount);
									totalTempo	= wayBillDeliverychargeAmount;
								} else if(dataPicker == "other" && wayBillChargeMasterId == OTHER) {
									$(newtd).html(''+wayBillDeliverychargeAmount);
									$(newtd2).html(''+wayBillDeliverychargeAmount);
									totalOther	= wayBillDeliverychargeAmount;
								} else if(dataPicker == "service" && wayBillChargeMasterId == SERVICE) {
									$(newtd).html(''+wayBillDeliverychargeAmount);
									$(newtd2).html(''+wayBillDeliverychargeAmount);
									totalService	= wayBillDeliverychargeAmount;
								} else if(dataPicker == "et" && wayBillChargeMasterId == ET) {
									$(newtd).html(''+wayBillDeliverychargeAmount);
									$(newtd2).html(''+wayBillDeliverychargeAmount);
									totalET	= wayBillDeliverychargeAmount;
								}else if(dataPicker == "hamali" && wayBillChargeMasterId == HAMALI_DELIVERY) {
									$(newtd).html(''+wayBillDeliverychargeAmount);
									$(newtd2).html(''+wayBillDeliverychargeAmount);
									totalHamali	= wayBillDeliverychargeAmount;
								} else if(dataPicker == "doorDelivery" && wayBillChargeMasterId == DOOR_DELIVERY_DELIVERY) {
									$(newtd).html(''+wayBillDeliverychargeAmount);
									$(newtd2).html(''+wayBillDeliverychargeAmount);
									totalDoorDly	= wayBillDeliverychargeAmount;
								}		
							}
						}
						
						if (dataPicker == "handlingCharge" && totalHandling == 0)
							$(newtd).html('0'),$(newtd2).html('0');
						
						if (dataPicker == "demurrage" && totalDemurrage == 0)
							$(newtd).html('0'),$(newtd2).html('0');
							
						
						if (dataPicker == "tempo" && totalTempo == 0)
							$(newtd).html('0'),$(newtd2).html('0');
						
						if (dataPicker == "other" && totalOther == 0)
							$(newtd).html('0'),$(newtd2).html('0');
					
						if (dataPicker == "service" && totalService == 0)
							$(newtd).html('0'),$(newtd2).html('0');
							
						if (dataPicker == "et" && totalET == 0)
							$(newtd).html('0'),$(newtd2).html('0');
							
						
						if (dataPicker == "hamali" && totalHamali == 0)
							$(newtd).html('0'),$(newtd2).html('0');
						
						if (dataPicker == "doorDelivery" && totalDoorDly == 0)
							$(newtd).html('0'),$(newtd2).html('0');		
						
						totalHandling	= 0;
						totalTempo		= 0;
						totalDemurrage	= 0;
						totalOther		= 0;
						totalService	= 0;
						totalET			= 0;
						totalHamali		= 0;
						totalDoorDly	= 0;
						
						if(dataPicker == "finalTotalAmount") {
							if(tableData[i].wayBillTypeId == WAYBILL_TYPE_TO_PAY || tableData[i].consignmentSummaryIsDeliveryTimeTBB == true)
								$(newtd).html(tableData[i].grandTotal),
								$(newtd2).html(tableData[i].grandTotal);
							else
								$(newtd).html(tableData[i].deliveryTotal),
								$(newtd2).html(tableData[i].deliveryTotal);
						}
						
						$(newtr).append($(newtd));
						$(newtr2).append($(newtd2));
						$(tbody).before(newtr);
						$(tbody2).before(newtr2);
					}
					
					$(newtr).append($(newtd));
					$(newtr2).append($(newtd2));
					$(tbody).before(newtr);
					$(tbody2).before(newtr2);

					if(tableData[i].wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
						$("*[data-cr='totalToPayAmount']").html(tableData[i].grandTotal + Number($("*[data-cr='totalToPayAmount']").html()));
						$('.bookingchargesSc').removeClass('hide');
					} else if(tableData[i].wayBillTypeId == WAYBILL_TYPE_CREDIT)
						$("*[data-cr='totalTbbAmount']").html(tableData[i].deliveryTotal + Number($("*[data-cr='totalTbbAmount']").html()));
					else if(tableData[i].wayBillTypeId == WAYBILL_TYPE_PAID)
						$("*[data-cr='totalPaidAmount']").html(tableData[i].deliveryTotal + Number($("*[data-cr='totalPaidAmount']").html()));
				}
			} else if(crprintList.wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
				$("*[data-cr='totalToPayAmount']").html(crprintList.bookingChargesSum + Number($("*[data-cr='totalToPayAmount']").html()));
				$('.bookingchargesSc').removeClass('hide');
			} else if(crprintList.wayBillTypeId == WAYBILL_TYPE_CREDIT)
				$("*[data-cr='totalTbbAmount']").html(crprintList.deliveryTotal + Number($("*[data-cr='totalTbbAmount']").html()));
			else if(crprintList.wayBillTypeId == WAYBILL_TYPE_PAID)
				$("*[data-cr='totalPaidAmount']").html(crprintList.deliveryTotal + Number($("*[data-cr='totalPaidAmount']").html()));
			
			if(totalChargesAmtHM != undefined) {
				totalHandling	= totalChargesAmtHM[HANDLING] || 0;
				totalDemurrage	= totalChargesAmtHM[DEMURRAGE] || 0;
				totalTempo		= totalChargesAmtHM[TEMPO] || 0;
				totalOther		= totalChargesAmtHM[OTHER] || 0;
				totalService	= totalChargesAmtHM[SERVICE] || 0;
				totalET			= totalChargesAmtHM[ET] || 0;
				totalHamali		= totalChargesAmtHM[HAMALI_DELIVERY] || 0;
				totalDoorDly	= totalChargesAmtHM[DOOR_DELIVERY_DELIVERY] || 0;
			}
			
			$("*[data-cr='handling']").html(totalHandling);
			$("*[data-cr='demurrage']").html(totalDemurrage);
			$("*[data-cr='tempo']").html(totalTempo);
			$("*[data-cr='service']").html(totalService);
			$("*[data-cr='other']").html(totalOther);
			$("*[data-cr='hamali']").html(totalHamali);
			$("*[data-cr='doorDly']").html(totalDoorDly);
			$("*[data-cr='et']").html(totalET);
			$("*[data-cr='deliveryTo']").html(crprintList.deliveredToName);
			$("*[data-cr='deliveredToNumber']").html(crprintList.deliveredToNumber);
			$("*[data-cr='deliveryBranchAdd']").html(crprintList.consignmentSummaryDeliveryToAddress);
			$("[data-row='dataTableDetails']").remove();
			$("[data-row='dataTableDetails2']").remove();
			$("*[data-cr='vehicleNo']").html(crprintList.vehicleNo);
			$("*[data-cr='invoiceNo']").html(crprintList.invoiceNo);
			
			if(crprintList.consignmentSummaryDeliveryToContact != undefined ){
				$("*[data-cr='crDestinationMobileNumber1']").html(crprintList.consignmentSummaryDeliveryToContact.replace(/ /g, "&nbsp;"));
				$("*[data-cr='crSourceBranchMobileNumber1']").html(crprintList.sourceBranchMobileNumber);
			} else{
				$("*[data-cr='crDestinationMobileNumber1']").html('--');
				$("*[data-cr='crSourceBranchMobileNumber1']").html('--');
			}
			
			$("*[data-cr='deliveryDate']").html(crprintList.deliveryDate);
			$("*[data-cr='crNo']").html(crprintList.wayBillDeliveryNumber);
			$("*[data-cr='lrNumber']").html(crprintList.wayBillNumber);
			$("*[data-cr='crSource']").html(crprintList.wayBillSourceBranchName);
			$("*[data-cr='crDestination']").html(crprintList.wayBillDestinationBranchName);
			$("*[data-cr='lrType']").html(crprintList.wayBillType);
			$("*[data-cr='quantity']").html(crprintList.quantity);
			$("*[data-cr='saidToContainList']").html(crprintList.saidToContain);
			$("*[data-cr='pkgNameWithQtynoBrace']").html(crprintList.quantity + ' ' + crprintList.packingTypeMasterName);
			$("*[data-cr='packingTypeName']").html(crprintList.packingTypeMasterName);
			$("*[data-cr='remark']").html(crprintList.remark);
			$("*[data-cr='deliveryPaymentType']").html(crprintList.paymentTypeString);
			$("*[data-cr='deliveryBranchName']").html(crprintList.deliveryBranchName);
			$("*[data-cr='DeliveryToBranchContact']").html(crprintList.consignmentSummaryDeliveryToContact);
			$("*[data-cr='lrNo']").html(crprintList.wayBillNumber.replace(/ /g, "&nbsp;"));
			$("*[data-cr='lrType']").html(crprintList.wayBillType.replace(/ /g, "&nbsp;"));
			$("*[data-cr='date']").html(crprintList.deliveryDateTimeString);
			$("*[data-cr='crSource']").html(crprintList.wayBillSourceBranchName.replace(/ /g, "&nbsp;"));
			$("*[data-cr='crDestination']").html(crprintList.wayBillDestinationBranchName.replace(/ /g, "&nbsp;"));
			$("*[data-cr='deliveryBy']").html(crprintList.settledByExecutive);
			$("*[data-cr='actualWeight']").html(crprintList.actualWeight);
			$("*[data-cr='chargeWeight']").html(crprintList.chargeWeight);
			$("*[data-cr='bookingTotalnew']").html(crprintList.grandTotal);
			$("*[data-cr='deliveredToGodownName']").html(crprintList.deliveredToGodownName);
			$("*[data-cr='bookingDate']").html(crprintList.bookingDateTimeString);
			$("*[data-cr='bookingDatewithoutTime']").html(crprintList.bookingDate);
			$("*[data-cr='chequeNumber']").html(crprintList.chequeNumber);
			$("*[data-cr='BookingGrandTotal']").html(crprintList.grandTotal);


			if(crprintList.wayBillTypeId == WAYBILL_TYPE_PAID){
				$("*[data-cr='grandTotalsre']").html(crprintList.deliverySumCharges);
				$("*[data-cr='bookingTotalgldts']").html(crprintList.bookingChargesSum);
				$("*[data-cr='grandTotalgldts']").html(((crprintList.grandTotal)) - (crprintList.bookingChargesSum));
				$("*[data-cr='grandTotalInWordgldts']").html(convertNumberToWord(((crprintList.grandTotal)) - (crprintList.bookingChargesSum)));
			} else if(crprintList.wayBillTypeId == WAYBILL_TYPE_TO_PAY){
				$("*[data-cr='grandTotalsre']").html(crprintList.deliverySumCharges + crprintList.bookingChargesSum);
				$("*[data-cr='bookingTotalgldts']").html(crprintList.bookingChargesSum);
				$("*[data-cr='grandTotalgldts']").html(crprintList.grandTotal);
				$("*[data-cr='grandTotalInWordgldts']").html(convertNumberToWord(Math.round(crprintList.grandTotal)));
			} else if(crprintList.wayBillTypeId == WAYBILL_TYPE_CREDIT){
				$("*[data-cr='grandTotalsre']").html(crprintList.deliverySumCharges);
				$("*[data-cr='bookingTotalgldts']").html(crprintList.bookingChargesSum);
				$("*[data-cr='grandTotalgldts']").html(crprintList.grandTotal);
				$("*[data-cr='grandTotalInWordgldts']").html(convertNumberToWord(Math.round(crprintList.grandTotal)));
			 }

			if (crprintList.wayBillTypeId == WAYBILL_TYPE_PAID || crprintList.wayBillTypeId == WAYBILL_TYPE_CREDIT)
				$("*[data-cr='bookingTotalForYash']").html(0);
			else
				$("*[data-cr='bookingTotalForYash']").html(Math.round(crprintList.bookingChargesSum));

			if(crprintList.wayBillTypeId == WAYBILL_TYPE_TO_PAY)
				$("*[data-cr='crAmount']").html(crprintList.grandTotal);
			else
				$("*[data-cr='crAmount']").html(crprintList.deliveryTotal);
			
			if(crprintList.vehicleNumber != undefined && crprintList.vehicleNumber != null) {
				$("*[data-cr='vehicleNumber']").html(crprintList.vehicleNumber);
				$("*[data-cr='vehicleNumber']").html("Vehicle Number : " + crprintList.vehicleNumber);
			}
			
			if(consolidateEWaybillNumber != undefined && consolidateEWaybillNumber != null)
				$("*[data-cr='consolidateEWaybillNumber']").html("Co E-Waybill No : " + consolidateEWaybillNumber);
			else
				$("*[data-cr='consolidateEWaybillNumberBlank']").html("Co E-Waybill No : --	 ");
				
			if(crprintList.paymentType == PAYMENT_TYPE_CASH_ID)
				$(".refnohide").hide();
		
		if(crprintList.billSelectionId == BOOKING_WITHOUT_BILL){
                $(".withbill").hide();
                $(".withoutbill").show();
            }else{
                $(".withbill").show();
                $(".withoutbill").hide();
            }		
		
			var printList = null;
			if(consignementHm != undefined && consignementHm != null) {
				for(var key in consignementHm) {
						printList	= consignementHm[key];
						for (var i = 0; i < printList.length; i++) {
							let cr = printList[i];
							if(packingTypeStr != null)
								packingTypeStr = packingTypeStr + ", " + cr.packingTypeName;
							else
								packingTypeStr = cr.packingTypeName;
						}
					}
			 }	
			 
			 if(packingTypeStr != null && packingTypeStr != undefined) {
				$("*[data-cr='packingTypeNameStr']").html(packingTypeStr);
				}
				let  dataContentTable = $('.dataContentTable').clone()
				$(".tableCloned").html(dataContentTable)
				
		}, disableRightClick:	function (){
			var message="Function Disabled!"; 
			function clickIE4(event){ if (event.button==2){ alert(message); return false; } } 
			function clickNS4(e){ if (document.layers||document.getElementById&&!document.all){ if (e.which==2||e.which==3){ alert(message); return false; } } } if (document.layers){ document.captureEvents(Event.MOUSEDOWN); document.onmousedown=clickNS4; } else if (document.all&&!document.getElementById){ document.onmousedown=clickIE4; } document.oncontextmenu=new Function("alert(message);return false") ;
		}, setDeliveryCharges : function(configation, responseOut) {
			var classNameofName		= $("*[data-chargename='dynamic']").attr('class');
			var classNameofVal		= $("*[data-chargevalue='dynamic']").attr('class');
									
			var crprintList			= responseOut.crprintls[0];
			var wayBillTypeId		= crprintList.wayBillTypeId;
			var tbody = $("*[data-chargevalue='dynamic']").parent().parent();
			var list  = responseOut.wayBillIdList		
			var uniqueChargeNames = [];

			for(let i = 0; i < list.length; i++) {
				var wayBillDlyCharges	= responseOut.deliveryChargeHm[list[i]];

				for(var index in wayBillDlyCharges) {
					 var chargeName = wayBillDlyCharges[index].chargeTypeMasterName;
						 
					if (!uniqueChargeNames.includes(chargeName)) {
						uniqueChargeNames.push(chargeName);
						var newtr = $("<tr/>")
						var newtdChargename = $("<td></td>");
						newtdChargename.attr("class",classNameofName);
						newtdChargename.attr("data-selector",'chargeName'+wayBillDlyCharges[index].wayBillChargeMasterId);
						newtdChargename.text(wayBillDlyCharges[index].chargeTypeMasterName)
						newtr.append(newtdChargename);
						var newtdChargeVal = $("<td></td>");
						newtdChargeVal.attr("class",classNameofVal);
						newtdChargeVal.attr("data-selector",'chargeValue'+wayBillDlyCharges[index].wayBillChargeMasterId);
						newtr.append(newtdChargeVal);
						$(tbody).before(newtr);
						
						if(wayBillDlyCharges[index].wayBillDeliverychargeAmount > 0) {
							if(wayBillDlyCharges[index].wayBillChargeMasterId == UNLOADING)
								$(".unloadingChargeSection").show();
							else if(wayBillDlyCharges[index].wayBillChargeMasterId == DAMERAGE)
								$(".demurrageChargeSection").show();
						} 
					}
				}	
			}

			let totalChargesAmtHM = responseOut.totalChargesAmtHM
			
			for(let index in totalChargesAmtHM){
				$("*[data-selector='chargeValue"+index+"']").html(totalChargesAmtHM[index]);
			}
			
			var totalDeliveryCharges = 0;

			for(var index in wayBillDlyCharges) {
				totalDeliveryCharges = totalDeliveryCharges + wayBillDlyCharges[index].wayBillDeliverychargeAmount;
				
				if(wayBillDlyCharges[index].wayBillChargeMasterId == OCTROI_DELIVERY)
					totalDeliveryCharges = totalDeliveryCharges - wayBillDlyCharges[index].wayBillDeliverychargeAmount;
				
				if(wayBillDlyCharges[index].wayBillChargeMasterId == DELIVERY_GIC)
					totalDeliveryCharges = totalDeliveryCharges - wayBillDlyCharges[index].wayBillDeliverychargeAmount;
			}
			
			if(wayBillTypeId == WAYBILL_TYPE_TO_PAY)
				totalDeliveryCharges = totalDeliveryCharges + (crprintList.bookingChargesSum);
			else
				$("*[data-selector='totalDeliveryCharges']").html(totalDeliveryCharges);

			$("*[data-cr='grandTotal']").html(totalDeliveryCharges);
			$("*[data-cr='bookingTotalnew1']").html(crprintList.bookingChargesSum);
			
			if (wayBillTypeId == WAYBILL_TYPE_PAID || wayBillTypeId == WAYBILL_TYPE_CREDIT)
				$("*[data-cr='bookingTotalnewforndtc']").html(0);
			else
				$("*[data-cr='bookingTotalnewforndtc']").html(crprintList.bookingChargesSum);
			
			if (wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
				$("*[data-cr='grandTotalroundof']").html(Math.round(crprintList.grandTotal));
				$("*[data-cr='grandTotalroundofInWord']").html(convertNumberToWord(Math.round(crprintList.grandTotal)));
				$("*[data-cr='grandTotalndtc']").html(crprintList.deliverySumCharges + crprintList.bookingChargesSum);
			} else {
				$("*[data-cr='grandTotalndtc']").html(crprintList.deliverySumCharges);
				$("*[data-cr='grandTotalroundof']").html(Math.round(crprintList.deliveryTotal));
				$("*[data-cr='grandTotalroundofInWord']").html(convertNumberToWord(Math.round(crprintList.deliveryTotal)));
			}
			
			var deliveryGrandTotal = totalDeliveryCharges + crprintList.deliveryTimeGst;
			
			if(crprintList.deliveryDiscount > 0 && (wayBillTypeId == WAYBILL_TYPE_TO_PAY || wayBillTypeId == WAYBILL_TYPE_PAID)) {
				$(".dlydiscount").show();
				var dlyDisc = crprintList.deliveryDiscount;
				$("*[data-cr='deliveryDisscount']").html(dlyDisc);
			} else
				$(".dlydiscount").hide();
			
			if(crprintList.deliveryDiscount > 0) {
				$(".dlydisamnt").show();
				var dlyDisc = crprintList.deliveryDiscount;
				$("*[data-cr='deliveryDisAmnt']").html(dlyDisc);
				totalDeliveryCharges = totalDeliveryCharges - dlyDisc;
				
				deliveryGrandTotal	 = deliveryGrandTotal - dlyDisc;
				$("*[data-selector='totalDeliveryCharges']").html(totalDeliveryCharges);
			} else
				$(".dlydisamnt").hide();
			
			$("*[data-selector='totalDeliveryChargesWithTds']").html(totalDeliveryCharges-crprintList.tdsAmount);
			
			$("*[data-selector='deliveryGrandTotal']").html(deliveryGrandTotal);			
			$("*[data-selector='deliveryGrandTotalwithoutdiscount']").html(deliveryGrandTotal - crprintList.deliveryDiscount);	
			$("*[data-selector='deliveryGrandTotalInWords']").html(convertNumberToWord(Math.round(deliveryGrandTotal)));
			$("*[data-selector='deliveryGrandTotalwithoutdiscountInword']").html(convertNumberToWord(Math.round(deliveryGrandTotal - crprintList.deliveryDiscount)));
				
			if(deliveryGrandTotal == 0)
				$("*[data-selector='deliveryGrandTotalInWords']").html("Zero");
			
			$("*[data-chargevalue='dynamic']").parent().remove()
		}, showHideTable : function(responseOut) {
			var accountGroupObj		= responseOut.PrintHeaderModel;
			 
			if(accountGroupObj.accountGroupId == ACCOUNT_GROUP_ID_GLDTS) {
				if(accountGroupObj.branchId == POLUR_BRANCH_740)
					$(".showSecondTable").addClass('hide');
				else
					$(".showTable").addClass('hide');
			}
		}
	};
});
