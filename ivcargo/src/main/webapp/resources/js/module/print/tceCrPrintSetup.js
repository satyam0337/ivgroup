
var zerosReg = /[1-9]/g;
var whitespace = /\S/;

define([]
	, function() {
		'use strict' ; // this basically give strictness to this specific js
		return {
			getConfiguration: function() {
				return '/ivcargo/html/print/delivery/crprint_tce.html';
			}, getFilePathForLabel: function() {
				return '/ivcargo/resources/js/module/print/lrprint/lrprintfilepath.js';
			}, setHeader: function(responseOut) {
				if (responseOut.transporterNameId > 0 && responseOut.transporterName != undefined)
					$("*[data-lr='transportid']").html(responseOut.transporterName);
				else
					$("*[data-lr='transportid']").html('');
					
				let sourceBranchMobile2;
				let destinationBranchMobile2;

				if(responseOut.sourceBranchMobile2 == null)
					sourceBranchMobile2 = ""
				else
					sourceBranchMobile2 = ` ${responseOut.sourceBranchMobile2}`

				if( responseOut.destinationBranchMobile2 == null)
					destinationBranchMobile2 =""
				else
					destinationBranchMobile2 =	`${responseOut.destinationBranchMobile2}`
				
				$("*[data-lr='lrSourceAddress']").html('<b style="font-size:22px" >'+ responseOut.bookedForAccountGroupName +'</b>' + '<br>' + responseOut.destinationBranchAddress + '<br>' + 'Contact Number : '+ responseOut.destinationBranchMobile + '');
				$("*[data-lr='lrDestinationAddress']").html(responseOut.destinationBranchAddress);
				/// isReprint 
				var isRePrint = responseOut.isReprint;

				if (isRePrint) {
					$("*[data-lr='lrTypeWithDuplicateKeyword']").html("( Duplicate )");
					$("*[data-lr='lrTypeWithDuplicateAndOrignalKeyword']").html("( Duplicate )");
				} else {
					$("*[data-lr='lrTypeWithDuplicateKeyword']").html(" ");
					$("*[data-lr='lrTypeWithDuplicateAndOrignalKeyword']").html("( Original )");
				}

				$("*[data-lr='lrSource']").html(responseOut.sourceBranchName+", "+ responseOut.sourceCityName);
				$("*[data-lr='lrDestination']").html(responseOut.destinationBranchName+", "+ responseOut.destinationCityName);

				setLogo(responseOut.accountGroupId);
			}, setLRDetails : function(responseOut) {
				let deliveryContactDetails	= responseOut.deliveryContactDetails;
				$("*[data-lr='number']").html(deliveryContactDetails.deliveryContactDetailsWayBillDeliveryNumber);
				var date = new Date(deliveryContactDetails.deliveryContactDetailsDeliveryDateTime);
				var formattedTime = date.toLocaleString();
				
				let dateParts = deliveryContactDetails.deliveryContactDetailsDateStr.split('-');
				let dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
				let formattedDate = dateObject.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
				
				$("*[data-lr='bookingTime']").html(formattedDate + formattedTime.split(',')[1]);
				$("*[data-lr='onlydate']").html(formattedDate);
				$("*[data-lr='lrType']").html(responseOut.wayBillType);
				$("*[data-lr='paymentType']").html(responseOut.paymentType);
				$("*[data-cr='remark']").html(responseOut.wayBill.wayBillRemark);
			}, setConsignor: function(responseOut) {

				$("*[data-consignor='name']").html(responseOut.customerDetailsName)
				$("*[data-consignor='address']").html(responseOut.customerDetailsAddress)
				$("*[data-consignor='gstn']").html(responseOut.gstn)
				
			}, setConsignee: function(responseOut) {
				$("*[data-consignee='name']").html(responseOut.customerDetailsName)
				$("*[data-consignee='address']").html(responseOut.customerDetailsAddress)
				$("*[data-consignee='gstn']").html(responseOut.gstn)
				$("*[data-lr='transportid']").html(responseOut.gstn)
			}, setConsignmentDts: function(responseAll) {

				let qtybody = $('.qtybody');
				let packingtypebody = $('.packingtypebody');
				let descriptionbody = $('.descriptionbody');
				let hsncodebody = $('.hsncodebody');
				let totalqty = 0;
				
				for (let i = 0; i < responseAll.length; i++) {
				    let el = responseAll[i];
					let qtybodytr = $('<tr></tr>');
					let packingtypebodytr = $('<tr></tr>');
					let descriptionbodytr = $('<tr></tr>');
					let hsncodebodytr = $('<tr></tr>');
						totalqty += el.quantity
				    let qty = `<td>${el.quantity}</td>`;
				    let packingTypes = `<td>${el.packingTypeName}</td>`;
				    let saidToContains = `<td class="textAlignLeft" ><p class="ellipsis width90per marginAuto">${el.saidToContain} </p></td>`;
					let hsnCode        =  `<td>${el.hsnCode}</td>`;
				    qtybodytr.append(qty)
				   	packingtypebodytr.append(packingTypes),
				   	descriptionbodytr.append(saidToContains)
				   	hsncodebodytr.append(hsnCode)
				 
				 	qtybody.append(qtybodytr) 
				  	packingtypebody.append(packingtypebodytr) 
				   	descriptionbody.append(descriptionbodytr) 
				    hsncodebody.append(hsncodebodytr) 
				}
				
                 let tbody = $("tbody.qtyHeightadjust");

				if (tbody.children("tr").length > 1) {
					$('.totalqtytr').removeClass('hide')
					$('.totalqty').html(totalqty)
					
				$('#chargeslabel').removeClass('height105px')
				$('#chargeslabel').addClass('height130px')
				$('#chargesvalue').removeClass('height101px')
				$('#chargesvalue').addClass('height126px')
			    }
			}, setCharge: function(responseOut) { 
				let wayBill										= responseOut.wayBill;
				let consignmentSummary							= responseOut.consignmentSummary;
				let operatorCommunityOrderChargesDetailsList	= responseOut.operatorCommunityOrderChargesDetailsList;
				console.log(responseOut,'===---')
				$("*[data-lr='actualWeight']").html(consignmentSummary.consignmentSummaryActualWeight);
				$("*[data-lr='chargedWeight']").html(consignmentSummary.consignmentSummaryChargeWeight);
				
				let invoiceNumbers = consignmentSummary.consignmentSummaryInvoiceNo.split(',')
				var firstInvoiceNumber = invoiceNumbers[0];
				$("*[data-lr='consignorInvoiceNo']").html(firstInvoiceNumber)
				
				let invoiceNumbersLength = invoiceNumbers.length - 1
				
				if (invoiceNumbersLength > 0)
				    $('.countinvoice').html(' +' + invoiceNumbersLength);
				else
					$('.countinvoicetd').addClass('hide')
				
				if(responseOut.formNumberDetails !== undefined) {
					let ewaybillNumbers = responseOut.formNumberDetails.split(',');
					
					if (ewaybillNumbers.length > 1) {
					    var firstEwayBill = ewaybillNumbers[0].split(':')[1].trim();
					    $("*[data-lr='EWayBillNo']").html(firstEwayBill)
					
					    let ewaybillNumbersLength = ewaybillNumbers.length - 1
					    
					    if (ewaybillNumbersLength > 0)
					        $('.countewaybill').html(' +' + ewaybillNumbersLength);
					} else if (ewaybillNumbers.length === 1) {
					    var firstEwayBill = ewaybillNumbers[0].split(':')[1].trim();
					    $("*[data-lr='EWayBillNo']").html(firstEwayBill);
					    $('.countewaybilltd').addClass('hide');
					}
				}
				
				
					responseOut.operatorCommunityOrderChargesDetailsList.forEach((el) => {
						if(wayBill.wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
				 		$("*[data-selector='chargeValue" + el.chargeTypeId + "']").html('₹ '+el.amount)
				 		}else{
						$("*[data-selector='chargeValue" + el.chargeTypeId + "']").html('PAID')	
						}
					});

                  


				$("*[data-lr='inclusiveDecalredValue']").html(consignmentSummary.consignmentSummaryDeclaredValue);
				
				for (let i = 0; i < operatorCommunityOrderChargesDetailsList.length; i++) {
					let chargeDetail = operatorCommunityOrderChargesDetailsList[i];

					if (chargeDetail.chargeTypeId == FREIGHT) {
						$("*[data-lr='grandTotal']").html('₹ ' + Math.ceil(parseFloat(chargeDetail.amount)));
						$("*[data-lr='grandTotalInWord']").html(convertNumberToWord(Math.ceil(parseFloat(chargeDetail.amount))));
						$("*[data-lr='freightInWord']").html(convertNumberToWords(chargeDetail.amount));

						break;
					}
				}

				if(wayBill.wayBillTypeId == WAYBILL_TYPE_PAID){
					$('.totalChargesRow').hide()
					$('.DeliverTo').addClass('fontSize16px')
					$("*[data-lr='freightInWord']").html('PAID')
				  }

				$("*[data-lr='grandTotalWithIns']").html('₹ ' + wayBill.wayBillAmount);
				

			}, setFooter: function(responseOut) {
				let deliveryContactDetails	= responseOut.deliveryContactDetails;
				let wayBill					= responseOut.wayBill;
				
				$('.deilverycontactdetails').html(' ' + deliveryContactDetails.deliveryContactDetailsDeliveredToName + ', Contact Number : ' + deliveryContactDetails.deliveryContactDetailsDeliveredToNumber )	
				
				if (wayBill.executiveName !== undefined && wayBill.executiveName)
					$("*[data-lr='bookedByExecutive']").html(wayBill.executiveName);
			}

		};
	});