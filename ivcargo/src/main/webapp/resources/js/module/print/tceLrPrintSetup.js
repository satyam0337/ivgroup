var zerosReg = /[1-9]/g;
var whitespace = /\S/;

define([]
	, function() {
		'use strict' ; // this basically give strictness to this specific js
		return {
			getConfiguration: function() {
				return '/ivcargo/template/lrprint/lrprint_tce.html';
			}, getFilePathForLabel: function() {
				return '/ivcargo/resources/js/module/print/lrprint/lrprintfilepath.js';
			}, setHeader: function(responseOut) {
				if (responseOut.transporterNameId > 0 && responseOut.transporterName != undefined)
					$("*[data-lr='transportid']").html(responseOut.transporterName);
				else
					$("*[data-lr='transportid']").html('');
					
				let sourceBranchMobile2;
				let destinationBranchMobile2;
					
				if(responseOut.sourceBranchMobile2 == null )
					sourceBranchMobile2 = ""
				else
					sourceBranchMobile2 = ` ${responseOut.sourceBranchMobile2}`
					
				if( responseOut.destinationBranchMobile2 == null)
					destinationBranchMobile2 =""
				else
					destinationBranchMobile2 =	`${responseOut.destinationBranchMobile2}`
					
                $("*[data-lr='lrSourceAddress']").html( '<b style="font-size:20px">'+ responseOut.AccountGroupName +'</b>'  +'<br> <span class="ellipsisFortwoline">' + responseOut.sourceBranchAddress + ' </span> ' + 'Contact Number : '+ responseOut.sourceBranchMobile + sourceBranchMobile2 +'');
			    $("*[data-lr='lrDestinationAddress']").html(responseOut.destinationBranchAddress+ '<br>' + 'Contact Number : '+ responseOut.destinationBranchMobile + ','+destinationBranchMobile2 +'');
				/// isReprint 
				var isRePrint = responseOut.isReprint;

				if (isRePrint) {
					$("*[data-lr='lrTypeWithDuplicateKeyword']").html("( Duplicate )");
					$("*[data-lr='lrTypeWithDuplicateAndOrignalKeyword']").html("( Duplicate )");
				} else {
					$("*[data-lr='lrTypeWithDuplicateKeyword']").html(" ");
					$("*[data-lr='lrTypeWithDuplicateAndOrignalKeyword']").html("( Original )");
				}

				$("*[data-lr='lrSource']").html(responseOut.sourceBranchName + ", " + responseOut.sourceCityName);
				$("*[data-lr='lrDestination']").html(responseOut.destinationBranchName + ", " + responseOut.destinationCityName);
				
				setLogo(responseOut.accountGroupId);
			}, setLRDetails : function(responseOut) {
				let wayBill	= responseOut.wayBill;
				
				$("*[data-lr='number']").html(wayBill.wayBillNumber);
				var date = new Date(wayBill.wayBillCreationDateTimeStamp);

				var formattedTime = date.toLocaleString();
				let dateParts = wayBill.wayBillBookingDateTimeStr.split('-');
				let dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
				let formattedDate = dateObject.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
				$("*[data-lr='onlydate']").html(formattedDate);
				$("*[data-lr='bookingtime']").html(formattedDate + formattedTime.split(',')[1]);
				$("*[data-lr='lrType']").html(responseOut.wayBillType);
				$("*[data-lr='paymentType']").html(responseOut.consignmentSummary.paymentTypeName);
				$("*[data-lr='remark']").html(wayBill.wayBillRemark);

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
				let totalLrQty = responseAll.length;
                if(responseAll.length>3){
					totalLrQty = totalLrQty - 3;
				}
				for (let i = 0; i < responseAll.length; i++) {
					let el = responseAll[i];
					if(i<3){
					let qtybodytr 			= $('<tr></tr>');
					let packingtypebodytr	= $('<tr></tr>');
					let descriptionbodytr	= $('<tr></tr>');
					let hsncodebodytr		= $('<tr></tr>');
					let qty				= `<td>${el.quantity}</td>`;
					let packingTypes	= `<td>${el.packingTypeName}</td>`;
					let saidToContains	= `<td class="textAlignLeft" ><p class="ellipsis width90per marginAuto">${el.saidToContain} </p></td>`;
					let hsnCode			=  `<td>${el.hsnCode}</td>`;
				
					qtybodytr.append(qty)
					packingtypebodytr.append(packingTypes),
					descriptionbodytr.append(saidToContains)
					hsncodebodytr.append(hsnCode)
					qtybody.append(qtybodytr) 
					packingtypebody.append(packingtypebodytr) 
					descriptionbody.append(descriptionbodytr) 
					hsncodebody.append(hsncodebodytr) 
				}				
				totalqty += el.quantity

				}
				$("*[data-lr='qtyLr']").html(totalLrQty)
  
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

				let consignmentSummary	= responseOut.consignmentSummary;
				let wayBill				= responseOut.wayBill;
				let operatorCommunityOrderChargesDetailsList = responseOut.operatorCommunityOrderChargesDetailsList;

				
				$("*[data-lr='actualWeight']").html(consignmentSummary.consignmentSummaryActualWeight);
				$("*[data-lr='chargedWeight']").html(consignmentSummary.consignmentSummaryChargeWeight);
				
				let invoiceNumbers = consignmentSummary.consignmentSummaryInvoiceNo.split(',')
				let firstInvoiceNumber = invoiceNumbers[0];
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
	
						if (ewaybillNumbersLength > 0) {
							$('.countewaybill').html(' +' + ewaybillNumbersLength);
						}
					} else if (ewaybillNumbers.length === 1) {
						var firstEwayBill = ewaybillNumbers[0].split(':')[1].trim();
						$("*[data-lr='EWayBillNo']").html(firstEwayBill)
						$('.countewaybilltd').addClass('hide')
					}
				}
				responseOut.operatorCommunityOrderChargesDetailsList.forEach((el) => {
					$("*[data-selector='chargeValue" + el.chargeTypeId + "']").html(el.amount)
				});
				

				
				$("*[data-lr='inclusiveDecalredValue']").html(consignmentSummary.consignmentSummaryDeclaredValue)
			    for (let i = 0; i < operatorCommunityOrderChargesDetailsList.length; i++) {
					let chargeDetail = operatorCommunityOrderChargesDetailsList[i];

					if (chargeDetail.chargeName === 'Freight') {
						$("*[data-lr='freightInWord']").html(convertNumberToWords(chargeDetail.amount) );
						break;
					}
				}	
				
				$("*[data-lr='grandTotal']").html('₹ ' + wayBill.bookingTotal);
				$("*[data-lr='grandTotalInWord']").html(convertNumberToWords(wayBill.bookingTotal));

			}, setFooter: function(responseOut) {
				let wayBill				= responseOut.wayBill;

				if (wayBill.executiveName && wayBill.executiveName !== undefined) {
					$("*[data-lr='bookedByExecutive']").html(wayBill.executiveName);
				}
			}, sendWhatsAppPdf: function(responseOut) { 
				console.log('inside sendWhatsAppPdf..............', responseOut);
				html2canvas(document.getElementById('mainContent')).then(function(canvas) {
									var imgData = canvas.toDataURL('image/png');
									var height = canvas.height;
									var width = canvas.width;
									var millimeters = {};
										 
									millimeters.width = Math.floor(width * 0.264583);
									millimeters.height = Math.floor(height * 0.264583);
					
									var doc = new jsPDF("p", "mm", [420, 594]);
									
									//doc.addImage(imgData, 'JPEG', 10, 10, millimeters.width, millimeters.height, '', 'FAST');
									doc.addImage(imgData, 'JPEG', 10, 10, 400, 300, '', 'FAST');
									
									var pdfData = doc.output('blob'); // Save the PDF as a Blob
									
									var filename = 'Invoice_'+responseOut.wayBill.wayBillNumber+'.pdf';
									
									var formData = new FormData();
									formData.append("files", pdfData, filename);
									formData.append("fileName", filename);
									formData.append("waybillId",  responseOut.waybillId);
									formData.append("emailAddress", 'yagnesh.tripathi@ivgroup.in');
									formData.append("accountGroupId", 39);
									formData.append("branchId", 13747);
									formData.append("executiveId", 17767);
									
									console.log('formData :::: ', formData);
										  
									var xhr = new XMLHttpRequest();
									xhr.open('POST', '/ivwebservices/tceBookingWS/sendPdfAsMail.do?', true);
									xhr.onload = function() {
										if (xhr.status === 200) {
											console.log('Email sent successfully!');
										} else {
											console.error('Error sending email.');
										}
									};
									xhr.send(formData);
								  });
			}
		};
	});