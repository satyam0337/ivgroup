define([], function(){	
	var
	summeryObject				= new Object();
	pageCounter	= 1,
	amount = 0,
	paidBookingTotal = 0,
	toPayBookingTotal = 0,
	tbbBookingTotal  = 0
	paidAmount = 0;
	return {
		getConfiguration : function(configuration) {
			return '/ivcargo/html/print/pickupLS/' + configuration.doorPickupDispatchPrintFlavor  + '.html';
		}, getFilePathForLabel : function() {
			return '/ivcargo/resources/js/module/view/doorpickuploadingsheetprint/doorPickupDispatchPrintFilePath.js';
		}, setHeadersForPrint : function(headerData, pageNumber, showHeader, removeHeader) {
			
			$("[data-group]").html(headerData[$("[data-group]").attr("data-group")]);
			var headerbreak	= $("[data-group='name']");
			if (pageCounter > 1) {
				var indexToRemove = 0;
				var numberToRemove = 1;
				headerbreak.splice(indexToRemove, numberToRemove);
				headerbreak.each(function(){					
					$(this).attr("class","page-break");
				});
			}
			$("[data-selector='branchAddressLabel']").html($("[data-selector='branchAddressLabel']").attr("data-addressLabel")+":");
			$("[data-address]").html(headerData[$("[data-address]").attr("data-address")]);
			$("[data-selector='branchPhoneNumberLabel']").html($("[data-phoneNumberLabel='branchPhoneNumberLabel']").attr("data-phoneNumberLabel")+":");
			$("*[data-account='branchGSTN']").html(headerData.branchGSTN);
			$("*[data-account='branchPanNumber']").html(headerData.branchPanNumber);
			$("*[data-account='branchMobileNumbers']").html(headerData.branchMobileNumbers);
			$("*[data-account='branchContactDetailMobileNumber']").html(headerData.branchContactDetailMobileNumber);
		    $("*[data-account='branchContactDetailMobileNumber2']").html(headerData.branchContactDetailMobileNumber2);
			$("*[data-account='conEwayBillNo']").html(headerData.consolidateEwaybillNo);

			if(headerData[$("[data-phoneNumber]").attr("data-phoneNumber")] != undefined) {
				var replacedString =  (headerData[$("[data-phoneNumber]").attr("data-phoneNumber")]).replace('-','');
				var zerosReg = /[1-9]/g;
				
				if(zerosReg.test(replacedString))
					$("[data-phoneNumber]").html(headerData[$("[data-phoneNumber]").attr("data-phoneNumber")]);
				else if(zerosReg.test(headerData[$("[data-mobileNumber]").attr("data-mobileNumber")]))
					$("[data-phoneNumber]").html(headerData[$("[data-mobileNumber]").attr("data-mobileNumber")]);
				else
					$("[data-phoneNumber]").html('');
			}
			
			if(removeHeader == true)
				$('#header').remove();

			pageCounter++;
		}, setInformationDivs : function(infoData){
			
			$("[data-info='DispatchNumber']").html(infoData[$("[data-info='DispatchNumber']").attr("data-info")]);
			$("[data-info='DispatchDate']").html(infoData[$("[data-info='DispatchDate']").attr("data-info")]);
			$("[data-info='DispatchFromBranch']").html(infoData[$("[data-info='DispatchFromBranch']").attr("data-info")]);
			$("[data-info='DispatchToBranch']").html(infoData[$("[data-info='DispatchToBranch']").attr("data-info")]);
			$("[data-info='vehicleNumber']").html(infoData[$("[data-info='vehicleNumber']").attr("data-info")]);
			$("[data-info='lorryHire']").html(infoData[$("[data-info='lorryHire']").attr("data-info")]);
			$("[data-info='driverName']").html(infoData[$("[data-info='driverName']").attr("data-info")]);
			$("[data-info='driverMobileNumber']").html(infoData[$("[data-info='driverMobileNumber']").attr("data-info")]);
			$("[data-info='vehicletype']").html(infoData[$("[data-info='vehicletype']").attr("data-info")]);
			$("[data-info='closingKm']").html(infoData[$("[data-info='closingKm']").attr("data-info")]);
			$("[data-info='staringKm']").html(infoData[$("[data-info='staringKm']").attr("data-info")]);
			$("[data-info='dispatchDateTime']").html(infoData[$("[data-info='dispatchDateTime']").attr("data-info")]);
			$("[data-info='pickupLsRemark']").html(infoData[$("[data-info='pickupLsRemark']").attr("data-info")]);
			$("[data-info='vehicleAgentName']").html(infoData[$("[data-info='vehicleAgentName']").attr("data-info")]);
			$("[data-info='conEwayBillNo']").html(infoData[$("[data-info='conEwayBillNo']").attr("data-info")]);
			$("[data-info='divisionName']").html(infoData[$("[data-info='divisionName']").attr("data-info")]);
			$("[data-info='doorPickupLedgerExecutiveName']").html(infoData[$("[data-info='doorPickupLedgerExecutiveName']").attr("data-info")]);

		}, setDataTableDetails : function(tableData) {
			var lastItrObj	= tableData[tableData.length - 1];
			tableData.pop();
			var tbody	= $("[data-dataTableDetail='srNumber']").parent().parent();
			tbody		= (tbody[tbody.length-1]);
			columnObjectForDetails		= $("[data-row='dataTableDetails']").children();
			var totalQuantity =0;
			var totalAmount =0;
			var totalWeight =0;
			var totalLorryHireAmnt = 0;			
			for(const element of tableData){
				let newtr = $("<tr></tr>");
				totalQuantity			+= element.quantity;
				totalWeight			    += element.weight;
				totalAmount			    += element.bookingTotal;
				totalLorryHireAmnt		+= element.lorryHireAmnt;
				
				$("[data-table='userName']").html(element.doorPickupLedgerExecutiveName);

				if(totalQuantity > 0)
					$("[data-table='totalQuantity']").html(totalQuantity);
				else
					$("[data-table='totalQuantity']").html("");

				if(totalWeight > 0)
					$("[data-table='totalWeight']").html(totalWeight);
				else
					$("[data-table='totalWeight']").html("");
					
				if(totalLorryHireAmnt > 0)
					$("[data-table='totalLorryHireAmnt']").html(totalLorryHireAmnt);
				else
					$("[data-table='totalLorryHireAmnt']").html("");	

				if(totalAmount > 0) {
					$("[data-table='totalAmount']").html(totalAmount);
					$("[data-table='grandTotalInword']").html(convertNumberToWord(Math.round(totalAmount)) +' '+ 'only.');
				} else
					$("[data-table='totalAmount']").html("");
				
				for(var j =  0; j < columnObjectForDetails.length; j++) {
					var newtd = $("<td></td>");
					var dataPicker = $(columnObjectForDetails[j]).attr("data-dataTableDetail");
					$(newtd).attr("class",$(columnObjectForDetails[j]).attr("class"));
					$(newtd).attr("data-dataTableDetail",$(columnObjectForDetails[j]).attr("data-dataTableDetail"));						
					$(newtd).html(element[dataPicker]);
					$(newtr).append($(newtd));
					
					if (dataPicker == 'paidBookingTotal'){
						if (element['wayBillTypeId'] == WAYBILL_TYPE_PAID) {		
							$(newtd).attr("data-dataTableDetail","paidBookingTotal");
							$(newtd).html(element['bookingTotal']);
							paidBookingTotal	= paidBookingTotal + element.bookingTotal;
						} else {
							$(newtd).attr("data-dataTableDetail","paidBookingTotal");
							$(newtd).html("0");
						}
					}
					
					if (dataPicker == 'toPayBookingTotal') {
						if (element['wayBillTypeId'] == WAYBILL_TYPE_TO_PAY) {
							$(newtd).attr("data-dataTableDetail","toPayBookingTotal");
							$(newtd).html(element['bookingTotal']);
							toPayBookingTotal = toPayBookingTotal + element.bookingTotal;
						} else {
							$(newtd).attr("data-dataTableDetail","toPayBookingTotal");
							$(newtd).html("0");
						}
					}
					
					if (dataPicker == 'tbbBookingTotal') {
						if (element['wayBillTypeId'] == WAYBILL_TYPE_CREDIT) {
							$(newtd).attr("data-dataTableDetail","tbbBookingTotal");
							$(newtd).html(element['bookingTotal']);
							tbbBookingTotal = tbbBookingTotal + element.bookingTotal;
						} else {
							$(newtd).attr("data-dataTableDetail","tbbBookingTotal");
							$(newtd).html("0");
						}
					}
				}

				$(tbody).before(newtr);
			}

			$("[data-row='dataTableDetails']").remove();
		}, setFooterDiv : function(footerData) {
			$("[data-info='lsRemark']").html(footerData[$("[data-info='lsRemark']").attr("data-info")]);

			setTimeout(function(){window.print();},200);
		}, setPickupChargesDetails : function(pickupChargeData){
			$("[data-pickupCharge='lorryhire']").html(pickupChargeData.lorryHire);
			$("[data-pickupCharge='extra']").html(pickupChargeData.extra);
			$("[data-pickupCharge='lorryHireAmt']").html(pickupChargeData.lorryHireAmount);
			$("[data-pickupCharge='lorryHireAdvance']").html(pickupChargeData.lorryHireAdvance);
			$("[data-pickupCharge='lorryHireBalance']").html(pickupChargeData.lorryHireBalance);
		}
	}
});