define([],function(){
    return ({
        renderElements : function(){
            _this = this;
		},printWindow : function(isPdfExportAllow){
			if(!isPdfExportAllow){
				hideLayer();
				setTimeout(function(){ window.print();window.close();
				},500);
			}
			
		}, showPopUp : function(responseOut, isPdfExportAllow) {
			hideLayer();
			var conf = responseOut.configuration;
			var _this = this;
			var wayBillTypeId = responseOut.wayBillTypeId;
			var bookingCharges = responseOut.waybillBookingChargesList;

			$('#popupForTbbAmount_742').bPopup({}, function() {
						var _thisMod = this;

						if (wayBillTypeId == WAYBILL_TYPE_CREDIT) {
							$(this).html("<div class='confirm' style='height:170px;width:250px; padding:5px'>"
								+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
								+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' id='check1'	/>&nbsp;<b style='font-size:14px;'>Print Charges</b><div>"
								+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' id='check2'	/>&nbsp;<b style='font-size:14px;'>Print Rate</b><div>"
								+ "<p style='color:red'>Shortcut Keys : Enter = Yes, Esc = No</p>"
								+ "<button id='cancel'>Cancel</button>"
								+ "<button autofocus id='printCharges1'>Print</button></center></div>");

							$("#confirm").click(function() {
								_thisMod.close();
							});
							for (var index in bookingCharges) {
								if (bookingCharges[index].wayBillBookingChargeChargeAmount != 0) {
									$("*[data-selector='chargeValue" + bookingCharges[index].chargeTypeMasterId + "']").html('0');
									$("*[data-lr='advanceAmount']").html('0');
									$("*[data-lr='grandTotal']").html('0');
									$("*[data-lr='calculateTotal']").html('0');
									$("*[data-lr='chargeSumroundoff']").html('0');
									$("*[data-lr='bookingServicetax']").html('0');
									$("*[data-lr='grandTotalInWord']").html('');
								}
							}
							$("#cancel").click(function() {
								_thisMod.close();
								_this.printWindow(isPdfExportAllow);
							});
							$("#printCharges1").click(function() {
								if ($("#check1").is(":checked")) {
									for (var index in bookingCharges) {
										if (bookingCharges[index].wayBillBookingChargeChargeAmount != 0) {
											$("*[data-selector='chargeValue" + bookingCharges[index].chargeTypeMasterId + "']").html(Math.round(bookingCharges[index].wayBillBookingChargeChargeAmount) + ".00");
											$("*[data-lr='advanceAmount']").html(responseOut.advanceAmount);
											$("*[data-lr='grandTotal']").html(Math.round(responseOut.bookingTotal))
											$("*[data-lr='calculateTotal']").html(responseOut.bookingTotal);
											$("*[data-lr='chargeSumroundoff']").html(Math.round(responseOut.bookingChargesSum));
											$("*[data-lr='bookingServicetax']").html(responseOut.bookingTimeServiceTax);
											$("*[data-lr='grandTotalInWord']").html(convertNumberToWord(Math.round(responseOut.bookingTotal)));
										}
									}
									
									_thisMod.close();
								}
								if ($("#check2").is(":checked")) {
										$(".hideRateSES").show();
										_thisMod.close();
									}
									
									
								_thisMod.close();
								_this.printWindow(isPdfExportAllow);
							});
						}else if (wayBillTypeId == WAYBILL_TYPE_TO_PAY || wayBillTypeId == WAYBILL_TYPE_PAID) {
							$(this).html("<div class='confirm' style='height:170px;width:250px; padding:5px'>"
								+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
								+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' id='check2'	/>&nbsp;<b style='font-size:14px;'>Print Rate</b><div>"
								+ "<p style='color:red'>Shortcut Keys : Enter = Yes, Esc = No</p>"
								+ "<button id='cancel'>Cancel</button>"
								+ "<button autofocus id='printCharges1'>Print</button></center></div>");

							$("#confirm").click(function() {
								_thisMod.close();
							});
							
							$("#cancel").click(function() {
								_thisMod.close();
								_this.printWindow(isPdfExportAllow);
							});
							$("#printCharges1").click(function() {
								if ($("#check2").is(":checked")) {
										$(".hideRateSES").show();
										_thisMod.close();
									}
									
									
								_thisMod.close();
								_this.printWindow(isPdfExportAllow);
							});
						} else {
							for (var index in bookingCharges) {
								if (bookingCharges[index].wayBillBookingChargeChargeAmount != 0) {
									$("*[data-selector='chargeValue" + bookingCharges[index].chargeTypeMasterId + "']").html(Math.round(bookingCharges[index].wayBillBookingChargeChargeAmount) + ".00");
									$("*[data-lr='advanceAmount']").html(responseOut.advanceAmount);
									$("*[data-lr='grandTotal']").html(Math.round(responseOut.bookingTotal))
									$("*[data-lr='calculateTotal']").html(responseOut.bookingTotal);
									$("*[data-lr='chargeSumroundoff']").html(Math.round(responseOut.bookingChargesSum));
									$("*[data-lr='bookingServicetax']").html(responseOut.bookingTimeServiceTax);
									$("*[data-lr='grandTotalInWord']").html(convertNumberToWord(Math.round(responseOut.bookingTotal)));
								}
							}
							_thisMod.close();
							_this.printWindow(isPdfExportAllow);
						}
					});
		}
	});
});	
