var _thisPopulate;
define([
		'slickGridWrapper2',
		'JsonUtility', 
		'autocomplete',
		'autocompleteWrapper'
		], 
	function(slickGridWrapper2) {
	return {
		getDataForTripHisabSettlementDetails : function(response) {
			$("[data-selector='subHeader1']").html('Trip Hisab Settlement Details');
			
			let columnArray		= [];
			
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Trip Hisab No.</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Date</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Vehicle Number</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Settled Branch</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Settled By</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Driver Name</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Settlement Amount</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Total Running KM</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>End Kilometer</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Remark</th>");
			
			$('#LRSearchBasicDetailsDiv').append('<tr class="bg-primary text-white">' + columnArray.join(' ') + '</tr>');
			
			let tripHisabSettlementList	= response.tripHisabSettlementList;
				
			columnArray		= [];
				
			for (const element of tripHisabSettlementList) {
				let obj		= element;

				columnArray.push("<td>" + obj.tripHisabSettlementNumber + "</td>");
				columnArray.push("<td>" + obj.settlementDateTimeStr + "</td>");
				columnArray.push("<td>" + obj.vehicleNumber + "</td>");
				columnArray.push("<td>" + obj.branchName + "</td>");
				columnArray.push("<td>" + obj.settledBy + "</td>");
				columnArray.push("<td>" + obj.driverName + "</td>");
				columnArray.push("<td>" + obj.finalSettlementAmount + "</td>");
				columnArray.push("<td>" + obj.totalRunningKM + "</td>");
				columnArray.push("<td>" + obj.endKMReading + "</td>");
				columnArray.push("<td>" + obj.remark + "</td>");

				$('#LRSearchBasicDetailsDiv').append('<tr>' + columnArray.join(' ') + '</tr>');

				columnArray	= [];
			}
		}, getBulkLRRateUpdateDetails : function(response) {
			let bulkLRRateUpdateRequest	= response.bulkLRRateUpdateRequest;
			
			let columnArray		= new Array();
			
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Request No.</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Request On</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Request By</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Requested Data</th>");
			
			$('#LRSearchBasicDetailsDiv').append('<tr class="bg-primary text-white">' + columnArray.join(' ') + '</tr>');
			
			columnArray		= new Array();
			
			columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + bulkLRRateUpdateRequest.requestNumber + "</td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + bulkLRRateUpdateRequest.requestedDateTimeStr + "</td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + bulkLRRateUpdateRequest.requestedBy + "</td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + bulkLRRateUpdateRequest.requestedData + "</td>");
			
			$('#LRSearchBasicDetailsDiv').append('<tr>' + columnArray.join(' ') + '</tr>');
			
			if(response.CorporateAccount != undefined) {
				$("[data-selector='subHeader2']").html('LR Details');
				$('#bottom-border-boxshadow').removeClass('hide');
				let gridObject	= slickGridWrapper2.setGrid(response);
				slickGridWrapper2.updateRowColor(gridObject, 'rateUpdated', false, 'highlight-row-red');
			}
			
			if(!response.isPending) 
				showMessage('success', ' All LRs Rate has been updated !');
		}, getTruckHisabVoucherDetails : function(response) {
			$("[data-selector='subHeader1']").html('Truck Hisab Voucher Details');
			let columnArray		= new Array();
			
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>THV No.</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Date</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Created At</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Truck No.</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Driver</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>LHPV No.</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Status</th>");
			
			$('#LRSearchBasicDetailsDiv').append('<tr class="bg-primary text-white">' + columnArray.join(' ') + '</tr>');
			
			let truckHisabVoucherList		= response.truckHisabVoucherList;
			let blank						= '';
			
			columnArray		= new Array();

			for (const element of truckHisabVoucherList) {
				let obj		= element;

				if(obj.status == TRUCK_HISAB_VOUCHER_SETTLED_ID)
					columnArray.push("<td><button type='button' class='btn btn-primary' onclick='getDataforPrint("+obj.truckHisabVoucherId+", "+obj.vehicleId+");'>Print</button> " + obj.truckHisabNumber + "</td>");
				else
					columnArray.push("<td>" + obj.truckHisabNumber + "</td>");

				columnArray.push("<td>" + obj.createDateTimeString + "</td>");
				columnArray.push("<td>" + obj.branchName + "</td>");
				columnArray.push("<td>" + obj.vehicleNumber + "</td>");
				columnArray.push("<td>" + obj.driverName + "</td>");
				
				if(obj.lhpvNumber == null)
					columnArray.push("<td>--</td>");
				else
					columnArray.push("<td><a href='' onclick='openWindowForView(" + obj.lhpvId + "," + obj.lhpvNumber + "," + SEARCH_TYPE_ID_LHPV + ", 0, 0, " + blank + ")'/a> " + obj.lhpvNumber + "</td>");
				
				columnArray.push("<td>" + obj.statusString + "</td>");

				$('#LRSearchBasicDetailsDiv').append('<tr>' + columnArray.join(' ') + '</tr>');

				columnArray	= [];
			}
		}, getPumpReceiptDetails : function() {
			
		}, getFuelHisabVoucherDetails : function(response) {
			$("[data-selector='subHeader1']").html('Fuel Hisab Voucher Details');
			
			let columnArray		= new Array();
			
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Voucher No.</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Date</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Vehicle Number</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Branch</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>End Kilometer</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Fuel Closing Balance</th>");
			
			$('#LRSearchBasicDetailsDiv').append('<tr class="bg-primary text-white">' + columnArray.join(' ') + '</tr>');
			
			let fuelHisabVoucherList		= response.fuelHisabVoucherList;

			columnArray		= new Array();

			for (const element of fuelHisabVoucherList) {
				let obj		= element;

				columnArray.push("<td><button type='button' class='btn btn-primary' onclick='getFuelHisabVoucherPrint("+obj.fuelHisabVoucherId+");'>Print</button>" + obj.fuelHisabVoucherNumber + "</td>");
				columnArray.push("<td>" + obj.creationDateTimeString + "</td>");
				columnArray.push("<td>" + obj.vehicleNumber + "</td>");
				columnArray.push("<td>" + obj.branchName + "</td>");
				columnArray.push("<td>" + obj.voucherKilometer + "</td>");
				columnArray.push("<td>" + obj.fuelBalance + "</td>");
						
				$('#LRSearchBasicDetailsDiv').append('<tr>' + columnArray.join(' ') + '</tr>');

				columnArray	= [];
			}
		}, getBillCoveringLetterDetails : function(response) {
			$("[data-selector='subHeader1']").html('Bill Covering Letter Details');
			
			let columnArray		= [];
			
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Letter No.</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Date</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Created At</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Created By</th>");
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Remark</th>");
			
			if(response.EDIT_BILL_COVERING_LETTER)
				columnArray.push("<th style='text-align: center; vertical-align: middle;'></th>");
			
			if(response.CANCEL_BILL_COVERING_LETTER)
				columnArray.push("<th style='text-align: center; vertical-align: middle;'></th>");
			
			$('#LRSearchBasicDetailsDiv').append('<tr class="bg-primary text-white">' + columnArray.join(' ') + '</tr>');
			
			let billCoveringLetterList		= response.billCoveringLetterList;

			billCoveringLetterList.forEach(obj => {
				let tr		= $("<tr>");
				
				let notd	= $('<td>');
				
				if(obj.status == 0) {
					let printButtons = _this.createButton('btn btn-primary', 'Print');
					
					$(printButtons).click(function() {
						_this.getBillCoveringLetterPrint(obj.billCoveringLetterId);
					});
					
					notd.append(printButtons);
					notd.append(" " + obj.billCoveringLetterNo);
				} else
					notd.append(obj.billCoveringLetterNo);
				
				tr.append(notd);
				tr.append("<td>" + obj.creationDateTimeStr + "</td>");
				tr.append("<td>" + obj.branchName + "</td>");
				tr.append("<td>" + obj.createdByName + "</td>");
				tr.append("<td>" + obj.remark + "</td>");
				
				if(response.EDIT_BILL_COVERING_LETTER) {
					if(obj.status == 0) {
						let editButtons = _this.createButton('btn btn-info', 'Edit');
						
						$(editButtons).click(function() {
							_this.editBillCoveringLetter(obj.billCoveringLetterId);
						});
						
						_this.appendButtonInRow(tr, printButtons);
					} else
						tr.append("<td>--</td>");
				}
				
				if(response.CANCEL_BILL_COVERING_LETTER) {
					if(obj.status == 0) {
						let cancelButtons = _this.createButton('btn btn-danger', 'Cancel');
						
						$(cancelButtons).click(function() {
							_this.cancelBillCoveringLetter(obj.billCoveringLetterId, response.isAllowToCancel);
						});
						
						_this.appendButtonInRow(tr, cancelButtons);
					} else
						tr.append("<td>--</td>");
				}
				
				$('#LRSearchBasicDetailsDiv').append(tr);
			});
		}, getBillCoveringLetterPrint : function(billCoveringLetterId) {
			childwin = window.open('PrintWayBill.do?pageId=340&eventId=10&modulename=billCoveringLetterPrint&billCoveringLetterId='+billCoveringLetterId+'&isSearchModule=true','newwindow', config='height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		}, editBillCoveringLetter : function(billCoveringLetterId) {
			newwindow = window.open('editBillCoveringLetter.do?pageId=340&eventId=2&modulename=editBillCoveringLetter&billCoveringLetterId='+billCoveringLetterId,'newwindow', config='left=180,height=610,width=1055, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		}, cancelBillCoveringLetter : function(billCoveringLetterId, isAllowToCancel) {
			if(!isAllowToCancel) {
				showMessage('info', 'Cancellation not allowed, as payment is taken for some of the Bills.');
				return false;
			}
			
			let jsonObject						= new Object();
			jsonObject["billCoveringLetterId"]	= billCoveringLetterId;
			
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL+'/creditorInvoiceWS/cancelBillCoverLetter.do', _this.setResponse, EXECUTE_WITH_ERROR);
		}, createButton : function(className, label) {
			let cancelButtons = $("<button>");
			cancelButtons.attr("class", className);
			cancelButtons.text(label);
			
			return cancelButtons;
		}, appendButtonInRow : function(tr, button) {
			let td	= $('<td>');
			td.append(button);
			tr.append(td);
		}, setResponse : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				//return;
			}
			
			setTimeout(function() {
				myRouter.navigate('&modulename=searchDetails&wayBillNumber=' + $('#numberEle').val() + '&branchId = ' + $('#branchEle').val() + '&TypeOfNumber=' + $('#typeEle').val(),{trigger: true});
				location.reload();
			}, 1000);
		}, getWayBillCrossingLrDetails : function(response) {
			if(response.wayBillCrossingLrList.length == 1) {
				var wayBillId		= response.wayBillCrossingLrList[0].wayBillId;
				var wayBillNumber	= response.wayBillCrossingLrList[0].wayBillNumber;
 
				setTimeout(function() {
					openWindowForView(wayBillId, wayBillNumber, 1, 0, 0, "");
				}, 1000);
			} else {
				$("[data-selector='subHeader1']").html('LR Details');
				let columnArray		= new Array();
				
				columnArray.push("<th style='text-align: center; vertical-align: middle;'>LR No.</th>");
				columnArray.push("<th style='text-align: center; vertical-align: middle;'>Crossing LR No.</th>");
				columnArray.push("<th style='text-align: center; vertical-align: middle;'>Bkg Date</th>");
				columnArray.push("<th style='text-align: center; vertical-align: middle;'>From</th>");
				columnArray.push("<th style='text-align: center; vertical-align: middle;'>To</th>");
				columnArray.push("<th style='text-align: center; vertical-align: middle;'>Consignor</th>");
				columnArray.push("<th style='text-align: center; vertical-align: middle;'>Consignee</th>");
				columnArray.push("<th style='text-align: center; vertical-align: middle;'>Type</th>");
				columnArray.push("<th style='text-align: center; vertical-align: middle;'>Pkgs</th>");
				columnArray.push("<th style='text-align: center; vertical-align: middle;'>Total</th>");
				columnArray.push("<th style='text-align: center; vertical-align: middle;'>Status</th>");
			
				$('#LRSearchBasicDetailsDiv').append('<tr class="bg-primary text-white">' + columnArray.join(' ') + '</tr>');
				
				let wayBillCrossingLrList		= response.wayBillCrossingLrList;
	
				columnArray		= new Array();
				
				for (const element of wayBillCrossingLrList) {
					let obj		= element;
					
					columnArray.push("<td>" + obj.wayBillNumber + "<br><button data-tooltip='Show Details' type='button' class='btn btn-info' onclick='openWindowForView(" + obj.wayBillId + ", \"" + obj.wayBillNumber + "\", 1, 0, 0, \"\");'>Show</button></td>");
					columnArray.push("<td>" + obj.crossingWayBillNo + "</td>");
					columnArray.push("<td>" + obj.createDateTimeString + "</td>");
					columnArray.push("<td>" + obj.sourceBranchName + "</td>");
					columnArray.push("<td>" + obj.destinationBranchName + "</td>");
					columnArray.push("<td>" + obj.consignorName + "</td>");
					columnArray.push("<td>" + obj.consigneeName + "</td>");
					columnArray.push("<td>" + obj.wayBillType + "</td>");
					columnArray.push("<td>" + obj.noOfPkgs + "</td>");
					columnArray.push("<td>" + obj.bookingTotal + "</td>");
					columnArray.push("<td>" + obj.lrStatus + "</td>");
	
					$('#LRSearchBasicDetailsDiv').append('<tr>' + columnArray.join(' ') + '</tr>');
	
					columnArray	= [];
				}
			}
		}, setTransferLedgerDetails : function(tlList) {
			let dataColumnArray		= [];
			
			dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>TL No</th>");
			dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>TL Date/Time</th>");
			dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>From (Branch/Operator)</th>");
			dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>To (Branch/Operator)</th>");
			dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>Truck No</th>");
			dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>Driver Name</th>");
			dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>Mobile Number</th>");
			
			$('#LRSearchBasicDetailsDiv').append('<tr class="bg-primary text-white">' + dataColumnArray.join(' ') + '</tr>');
			
			for (const tl of tlList) {
				dataColumnArray = [];
				
				dataColumnArray.push("<td><button type='button' class='btn btn-primary' onclick='transferLedgerPrint(" + tl.transferLedgerId + ");'>Print</button> " + tl.transferLedgerNumber + "</td>");
				dataColumnArray.push("<td>" + tl.transferDateTimeStr + "</td>");
				dataColumnArray.push("<td>" + tl.transferByBranchName + " (" + tl.transferByAccountGroupName + ")" + "</td>");
				dataColumnArray.push("<td>" + tl.transferForBranchName + " (" + tl.transferForAccountGroupName + ")" + "</td>");
				dataColumnArray.push("<td>" + tl.vehicleNumber + "</td>");
				dataColumnArray.push("<td>" + tl.driverName + "</td>");
				dataColumnArray.push("<td>" + tl.driverMobile + "</td>");
				$('#LRSearchBasicDetailsDiv').append('<tr>' + dataColumnArray.join(' ') + '</tr>');
			}
		}, setTransferReceiveLedgerDetails : function(tlList) {
			let dataColumnArray		= [];
			
			dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>TRL No</th>");
			dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>TRL Date/Time</th>");
			dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>TL No</th>");
			dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>Branch</th>");
			dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>Executive Name</th>");
			dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>Truck No</th>");
			dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>Remark</th>");
			
			$('#LRSearchBasicDetailsDiv').append('<tr class="bg-primary text-white">' + dataColumnArray.join(' ') + '</tr>');

			for (const tl of tlList) {
				dataColumnArray = [];
				dataColumnArray.push("<td><button type='button' class='btn btn-primary' onclick='transferReceiveLedgerPrint(" + tl.transferReceiveLedgerId + ");'>Print</button> " + tl.transferReceiveLedgerNumber + "</td>");
				dataColumnArray.push("<td>" + (tl.transferReceiveCreationDate || '--') + "</td>");
				dataColumnArray.push("<td>" + (tl.transferLedgerNumber || '--') + "</td>");
				dataColumnArray.push("<td>" + (tl.receiveByBranchName || '--') + "</td>");
				dataColumnArray.push("<td>" + (tl.receiveByOperatorExecutiveName || '--') + "</td>");
				dataColumnArray.push("<td>" + (tl.vehicleNumber || '--') + "</td>");
				dataColumnArray.push("<td>" + (tl.remark || '--') + "</td>");

				$('#LRSearchBasicDetailsDiv').append('<tr>' + dataColumnArray.join(' ') + '</tr>');
			}
		}, setVehicleConfigHamaliDetails: function(response) {
			let vehicleConfigHamaliList	= response.vehicleConfigHamaliList;
			let allowToCancelMathadi	= response.ALLOW_TO_CANCEL_MATHADI;
			let allowToEditMathadi		= response.ALLOW_TO_EDIT_MATHADI;
			let isAnyCancelled			= response.anyCancelled;
				
			let dataColumnArray		= [];

			dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>Mathadi No.</th>");
			dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>Branch</th>");
			dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>Date</th>");
			
			if(allowToEditMathadi)
				dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>Edit</th>");
					
			if(allowToCancelMathadi || isAnyCancelled)
				dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>Cancel</th>");

			$('#LRSearchBasicDetailsDiv').append('<tr class="bg-primary text-white">' + dataColumnArray.join(' ') + '</tr>');

			const _this = this;

			for (const element of vehicleConfigHamaliList) {
				dataColumnArray = [];
				let isCancel	= element.status == CANCELLED_MATHADI;//cancel
				
				if(isCancel)
					dataColumnArray.push("<td class='textAlignCenter' style='font-size:13px;'>" + element.loadingHamaliNumber + "</td>");
				else	
					dataColumnArray.push("<td class='textAlignCenter' style='font-size:13px;'> <button type='button' class='btn btn-primary hyperlink printMathadi'>Print</button>" + element.loadingHamaliNumber + "</td>");
					
				dataColumnArray.push("<td class='textAlignCenter' style='font-size:13px'>" + element.branchName + "</td>");
				dataColumnArray.push("<td class='textAlignCenter' style='font-size:13px;'>" + element.lhpvCreationDateTimeStr + "</td>");
					
				if(allowToEditMathadi) {
					if(!isCancel)
						dataColumnArray.push("<td class='textAlignCenter'><button type='button' class='btn btn-info editMathadi'>Edit</button></td>");
					else
						dataColumnArray.push("<td></td>");
				}
					
				if(allowToCancelMathadi || isAnyCancelled) {
					if(!isCancel)
						dataColumnArray.push("<td class='textAlignCenter'><button type='button' class='btn btn-danger mathadiCancel'>Cancel</button></td>");
					else
						dataColumnArray.push("<td class='textAlignCenter' style='font-size:13px;'>Cancelled</td>");
				}
				
				$('#LRSearchBasicDetailsDiv').append('<tr>' + dataColumnArray.join(' ') + '</tr>');
					 
				$('.printMathadi').click(function() {
					_this.printMathadiNumberReceipt(element.loadingHamaliLedgerId)
				 });
						
				if(allowToEditMathadi && !isCancel) {
					$('.editMathadi').click(function() {
						_this.matahdiDataEdit(element.loadingHamaliLedgerId)
					});
				}
					
				if(allowToCancelMathadi && !isCancel) {
					$('.mathadiCancel').click(function() {
						_this.cancleMathadiNumberReceipt(element.loadingHamaliLedgerId)
					});
				}
			}
		}, printMathadiNumberReceipt : function(mathadiNumberId) {
			newwindow = window.open('module.do?pageId=340&eventId=10&modulename=mathadiCalculationPrint&masterid=' + mathadiNumberId + '&isReprint=true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		}, matahdiDataEdit : function(mathadiNumberId) {
			newwindow = window.open('module.do?pageId=340&eventId=1&modulename=mathadiEdit&masterid=' + mathadiNumberId, 'config=height=610,width=815, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		}, cancleMathadiNumberReceipt: function(mathadiNumberId) {
			if(confirm('Are you sure you want to cancel the Mathadi ?')) {
				let jsonObject = new Object;
				jsonObject.mathadiNumberId = mathadiNumberId;
				const _this = this;
				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL +'/mathadiCalculationWS/mathadiCancellation.do', _this.setResponseForMathadiCancel, EXECUTE_WITH_ERROR);
			}
		}, setResponseForMathadiCancel: function() {
			hideLayer();

			setTimeout(function() {
				myRouter.navigate('&modulename=searchDetails&wayBillNumber=' + $('#numberEle').val() + '&branchId=' + $('#branchEle').val() + '&TypeOfNumber=' + $('#typeEle').val(), { trigger: true });
				location.reload();
			}, 1000);
		}, setPickupDetailList : function (response) {
			let pickupDetailsList	= response.pickupDetailList;

			if(pickupDetailsList.length == 1) {
				$('#middle-border-boxshadow').addClass('hide');

				setTimeout(function() {
					openWindowForView(pickupDetailsList[0].wayBillId, pickupDetailsList[0].pickupRequestNumber, 1, 0, 0, "");
				}, 100);
			} else {
				let columnArray		= [];
	
				columnArray.push("<th style='text-align: center; vertical-align: middle;'>PR No.</th>");
				columnArray.push("<th style='text-align: center; vertical-align: middle;'>LR No.</th>");
				columnArray.push("<th style='text-align: center; vertical-align: middle;'>Date</th>");
				columnArray.push("<th style='text-align: center; vertical-align: middle;'>From</th>");
				columnArray.push("<th style='text-align: center; vertical-align: middle;'>To</th>");
				columnArray.push("<th style='text-align: center; vertical-align: middle;'>Consignor</th>");
				columnArray.push("<th style='text-align: center; vertical-align: middle;'>Consignee</th>");
				columnArray.push("<th style='text-align: center; vertical-align: middle;'>Type</th>");
				columnArray.push("<th style='text-align: center; vertical-align: middle;'>Status</th>");
				columnArray.push("<th style='text-align: center; vertical-align: middle;'>Pkgs</th>");
				columnArray.push("<th style='text-align: center; vertical-align: middle;'>Total</th>");
	
				$('#LRSearchBasicDetailsDiv').append('<tr class="bg-primary text-white">' + columnArray.join(' ') + '</tr>');
				
				for(let obj of pickupDetailsList) {
					let dataColumnArray = [];
					
					dataColumnArray.push("<td>" + obj.pickupRequestNumber + "<br><button data-tooltip='Show Details' type='button' class='btn btn-info' onclick='openWindowForView(" + obj.wayBillId + ", \"" + obj.pickupRequestNumber + "\", 1, 0, 0, \"\");'>Show</button></td>");
					dataColumnArray.push("<td>" + obj.wayBillNumber + "</td>");
					dataColumnArray.push("<td>" + obj.bookingDateStr + "</td>");
					dataColumnArray.push("<td>" + obj.sourceBranch + "</td>");
					dataColumnArray.push("<td>" + obj.destinationBranch + "</td>");
					dataColumnArray.push("<td>" + obj.consigneeName + "</td>");
					dataColumnArray.push("<td>" + obj.consignorName + "</td>");
					dataColumnArray.push("<td>" + obj.wayBillType + "</td>");
					dataColumnArray.push("<td>" + obj.statusStr + "</td>");
					dataColumnArray.push("<td>" + obj.wayBillConsignmentQuantity + "</td>");
					
					$('#LRSearchBasicDetailsDiv').append('<tr>' + dataColumnArray.join(' ') + '</tr>');
				}
			}
		}, setPendingLSPaymentBillDetails : function (response) {
			let pendingLSPaymentBillList	= response.PendingLSPaymentBill;
			let lsPaymentSummaryHM			= response.PendingLSPaymentBillSummary;
			
			let columnArray = [];
			
			columnArray.push("<th>Bill No.</th>");
			columnArray.push("<th>Date</th>");
			columnArray.push("<th>Billing Office</th>");
			columnArray.push("<th>Bill Amount</th>");
			columnArray.push("<th>Bill Status</th>");
			columnArray.push("<th>Created By</th>");
			
			$('#LRSearchBasicDetailsDiv').append('<tr class="bg-primary text-white">' + columnArray.join(' ') + '</tr>');

			for (let obj of pendingLSPaymentBillList) {
				let dataColumnArray = [];
				
				dataColumnArray.push("<td>" + obj.pendingLSPaymentBillNumber + "</td>");
				dataColumnArray.push("<td>" + obj.creationDateTimeString + "</td>");
				dataColumnArray.push("<td>" + obj.branchName + "</td>");
				dataColumnArray.push("<td>" + Math.round(obj.totalBillAmount) + "</td>");

				let billId = obj.pendingLSPaymentBillId;
				let summaries = lsPaymentSummaryHM[billId];
				
				if (summaries && obj.status !== BILL_CLEARANCE_STATUS_DUE_PAYMENT_ID && obj.status !== BILL_CLEARANCE_STATUS_CANCELLED_ID) {
					const encodedSummary = encodeURIComponent(JSON.stringify(summaries));
					dataColumnArray.push(
						`<td><a href='#' class='text-decoration-underline text-primary' onclick='showPaymentDetailsModal("${encodedSummary}")'>${obj.statusName}</a></td>`
					);
				} else {
					dataColumnArray.push("<td>" + obj.statusName + "</td>");
				}

				dataColumnArray.push("<td>" + obj.createdByExecutive + "</td>");
				
				$('#LRSearchBasicDetailsDiv').append('<tr>' + dataColumnArray.join(' ') + '</tr>');
			}
		}, setCreditorInvoiceDetailList: function(response, isCRMPage) {
			let billDetailsList = response.billDetailsList;
			
			for(let i = 0; i < billDetailsList.length; i++) {
				if(i == 0) {
					let columnArray = [];
	
					columnArray.push("<th style='text-align: center;'>Bill No.</th>");
					columnArray.push("<th style='text-align: center;'>Date</th>");
					columnArray.push("<th style='text-align: center;'>Creditor Name</th>");
					columnArray.push("<th style='text-align: center;'>Creditor Add.</th>");
					columnArray.push("<th style='text-align: center;'>Invoice Amount</th>");
					columnArray.push("<th style='text-align: center;'>Print</th>");
	
					$('#LRSearchBasicDetailsDiv').empty();
					$('#LRSearchBasicDetailsDiv').append('<tr class="bg-primary text-white">' + columnArray.join(' ') + '</tr>');
				}

				let billObj = billDetailsList[i];

				let dataColumnArray = [];
				dataColumnArray.push("<td style='text-align: center;'>" + (billObj.billNumber || "-") + "</td>");
				dataColumnArray.push("<td style='text-align: center;'>" + billObj.creationDateTimeStampStr + "</td>");
				dataColumnArray.push("<td style='text-align: center;'>" + (billObj.creditorName || "-") + "</td>");
				dataColumnArray.push("<td style='text-align: center;'>" + (billObj.creditorAddress || "-") + "</td>");
				dataColumnArray.push("<td style='text-align: center;'>" + Math.round(billObj.grandTotal + billObj.additionalCharge) + "</td>");
				dataColumnArray.push("<td style='text-align: center;'><button data-tooltip='Show Details' type='button' class='btn btn-info' onclick='openWindowForInvoicePrint(" + billObj.billId + ", " + isCRMPage + ");'>Print</button></td>");

				$('#LRSearchBasicDetailsDiv').append('<tr>' + dataColumnArray.join(' ') + '</tr>');
			}
		}, setDoorPickupLedgerDetails: function(response) {
			let doorPickupLedgerList	= response.doorPickupLedgerList;
			let allowToCancelPickupLs	= response.allowToCancelPickupLs;
			let allowToEditPickupLs		= response.allowToEditPickupLs;
			let alreadyReceived			= response.alreadyReceived;
			let alreadyCancel			= response.alreadyCancel;
				
			let dataColumnArray		= [];

			dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>Pickup Ls No.</th>");
			dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>Pickup Source</th>");
			dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>Pickup Dest</th>");
			dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>Date</th>");
			dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>No Of Lrs</th>");
			dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>Vehicle No</th>");
			dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>Status</th>");
			
			if(allowToEditPickupLs && !alreadyReceived && !alreadyCancel)
				dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>Edit</th>");
					
			if(allowToEditPickupLs && !alreadyReceived && !alreadyCancel)
				dataColumnArray.push("<th style='text-align: center; vertical-align: middle;'>Cancel</th>");

			$('#LRSearchBasicDetailsDiv').append('<tr class="bg-primary text-white">' + dataColumnArray.join(' ') + '</tr>');

			const _this = this;

			for (const element of doorPickupLedgerList) {
				dataColumnArray = [];
				
				dataColumnArray.push("<td class='textAlignCenter' style='font-size:13px'>" + element.doorPickupNumber + "</td>");
				dataColumnArray.push("<td class='textAlignCenter' style='font-size:13px;'>" + element.pickUpSource + "</td>");
				dataColumnArray.push("<td class='textAlignCenter' style='font-size:13px;'>" + element.pickUpDestination + "</td>");
				dataColumnArray.push("<td class='textAlignCenter' style='font-size:13px;'>" + element.creationDateTimeString + "</td>");
				dataColumnArray.push("<td class='textAlignCenter' style='font-size:13px;'>" + element.doorPickupLedgerTotalNoOfWayBills + "</td>");
				dataColumnArray.push("<td class='textAlignCenter' style='font-size:13px;'>" + element.doorPickupLedgerVehicleNumber + "</td>");
				dataColumnArray.push("<td class='textAlignCenter' style='font-size:13px;'>" + element.status + "</td>");

				if (allowToEditPickupLs && !alreadyReceived) {
					if (!alreadyCancel) {
						dataColumnArray.push("<td class='textAlignCenter'><button type='button' class='btn btn-info editPickupLs'>Edit</button></td>");
						dataColumnArray.push("<td class='textAlignCenter'><button type='button' class='btn btn-danger pickupCancel'>Cancel</button></td>");
					} else {
						dataColumnArray.push("<td class='textAlignCenter' style='font-size:13px;'><button class='btn btn-danger btn-sm'>Cancelled</button></td>");
					}
				}

				$('#LRSearchBasicDetailsDiv').append('<tr>' + dataColumnArray.join(' ') + '</tr>');
					 
				if(allowToEditPickupLs && !alreadyReceived) {
					$('.editPickupLs').click(function() {
						_this.pickupLsDataEdit(element.doorPickupLedgerId)
				 	});
				}
				 	
				if(allowToCancelPickupLs && !alreadyReceived) {
					$('.pickupCancel').click(function() {
						_this.canclePickupLs(element.doorPickupLedgerId)
				 	});
				}
			}
		}, pickupLsDataEdit : function(doorPickupLedgerId) {
			newwindow = window.open('module.do?pageId=340&eventId=1&modulename=editPickupLs&masterid=' + doorPickupLedgerId, 'config=height=610,width=815, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		}, canclePickupLs: function(doorPickupLedgerId) {
			if(confirm('Are you sure you want to cancel the Pickup Ls ?')) {
				let jsonObject = new Object;
				jsonObject.doorPickupLedgerId = doorPickupLedgerId;
				const _this = this;
				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL +'/editPickupLSWS/pickupLsCancellation.do', _this.setResponseForPickupCancel, EXECUTE_WITH_ERROR);
			}
		}, setResponseForPickupCancel: function() {
			hideLayer();

			setTimeout(function() {
				myRouter.navigate('&modulename=searchDetails&wayBillNumber=' + $('#numberEle').val() + '&branchId=' + $('#branchEle').val() + '&TypeOfNumber=' + $('#typeEle').val(), { trigger: true });
				location.reload();
			}, 1000);
		}
	}
});

function openWindowForView(id, number, type, branchId, subRegionId, searchBy) {
	childwin = window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId=' + id + '&wayBillNumber=' + number + '&TypeOfNumber=' + type + '&BranchId=' + branchId + '&SubRegionId=' + subRegionId + '&searchBy=' + searchBy);
}

function getFuelHisabVoucherPrint(fuelHisabVoucherId) {
	let filter	= 3;
	childwin = window.open('fuelHisabSettlementGetDetails.do?pageId=345&eventId=5&fuelHisabSettlementId=' + fuelHisabVoucherId + '&dataFilter=' + filter, 'newwindow', config = 'height=600,width=850, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function transferLedgerPrint(transferLedgerId) {
	childwin = window.open('TransferLSPrint.do?pageId=340&eventId=10&modulename=transferLsPrint&masterid=' + transferLedgerId + '&isReprint=true', 'newwindow', config = 'height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function transferReceiveLedgerPrint(transferLedgerId) {
	childwin = window.open('TransferReceiveLSPrint.do?pageId=340&eventId=10&modulename=transferReceiveLsPrint&masterid=' + transferLedgerId + '&isReprint=true', 'newwindow', config = 'height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function showPaymentDetailsModal(encodedSummaryStr) {
	const decoded = decodeURIComponent(encodedSummaryStr);
	const summaries = JSON.parse(decoded);

	document.querySelectorAll('.custom-payment-popup-overlay').forEach(e => e.remove());

	let tableHtml = '';
	if (!summaries || summaries.length === 0) {
		tableHtml = "<p class='text-muted'>No payment details available.</p>";
	} else {
		const { totalExpenseAmount = 0, totalBillAmount = 0, totalReceivedAmount = 0 } = summaries[0] || {};

		tableHtml += `<table border="1" cellpadding="6" cellspacing="0" 
			style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px; border: 1px solid #ccc;">
			<tr style="background-color: #1a237e; color: white;">
				<th style="border: 1px solid #ccc;">Date</th>
				<th style="border: 1px solid #ccc;">Branch</th>
				<th style="border: 1px solid #ccc;">Received By</th>
				<th style="border: 1px solid #ccc;">Received Amt</th>
				<th style="border: 1px solid #ccc;">Expense Amt</th>
				<th style="border: 1px solid #ccc;">Type</th>
				<th style="border: 1px solid #ccc;">Remark</th>
			</tr>`;

		for (let s of summaries) {
			tableHtml += `<tr style="background-color: #f9f9f9;">
				<td style="border: 1px solid #ccc;">${s.receivedOnDateStr}</td>
				<td style="border: 1px solid #ccc;">${s.receivedByBranchName}</td>
				<td style="border: 1px solid #ccc;">${s.receivedByExecutive}</td>
				<td style="border: 1px solid #ccc; text-align: right;">${Math.round(s.receivedAmount)}</td>
				<td style="border: 1px solid #ccc; text-align: right;">${Math.round(s.expenseAmout)}</td>
				<td style="border: 1px solid #ccc;">${s.paymentModeName}</td>
				<td style="border: 1px solid #ccc;">${s.remark}</td>
			</tr>`;
		}

		tableHtml += `<tr style="font-weight: bold; background-color: #e3f2fd;">
			<th colspan="3" style="border: 1px solid #ccc; text-align: left;">Total Bill Amount: ${Math.round(totalBillAmount)}</th>
			<th style="border: 1px solid #ccc; text-align: right;">${Math.round(totalReceivedAmount)}</th>
			<th style="border: 1px solid #ccc; text-align: right;">${Math.round(totalExpenseAmount)}</th>
			<th colspan="2" style="border: 1px solid #ccc;"></th>
		</tr>`;

		tableHtml += `</table>`;
	}

	const popupHtml = `
		<div class="custom-payment-popup-overlay" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.4); z-index: 9999;">
			<div class="custom-payment-popup" style="background: white; width: 80%; max-width: 800px; margin: 60px auto; padding: 20px; border-radius: 8px; position: relative; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">
				<div style="text-align: right;">
					<button onclick="this.closest('.custom-payment-popup-overlay').remove()" style="padding: 4px 12px; font-size: 20px; background: #1a237e; color: white; border: none; border-radius: 4px; cursor: pointer;">×</button>
				</div>
				<h4 style="margin-top: 0; margin-bottom: 20px; color: #1a237e;">Payment Details</h4>
				<div>${tableHtml}</div>
			</div>
		</div>
	`;

	document.body.insertAdjacentHTML('beforeend', popupHtml);
}

function openWindowForInvoicePrint(billId, isCRMPage) {
	if(isCRMPage != null && isCRMPage != undefined && (isCRMPage == 'true' || isCRMPage))
		childwin = window.open('print.do?modulename=InvoicePrint&masterid=' + billId + '&isCRMPage=' + isCRMPage + '&isExcel='+false, 'newwindow', config='height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	else
		childwin = window.open('printWayBill.do?pageId=340&eventId=10&modulename=InvoicePrint&masterid=' + billId + '&isCRMPage=' + isCRMPage + '&isExcel='+false, 'newwindow', config='height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
