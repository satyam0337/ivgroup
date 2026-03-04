define([],function() {
    return ({
        renderElements : function(){
            _this = this;
		},printWindow : function(isPdfExportAllow){
			if(!isPdfExportAllow){
				hideLayer();
				setTimeout(function(){ window.print();window.close();
				},500);
			}
		}, showPopUp : function(responseOut) {
			hideLayer();
			//var conf = responseOut.configuration;
			var isPdfExportAllow = responseOut.isPdfExportAllow;
			var wayBillTypeId = responseOut.wayBillTypeId;
			var bookingCharges = responseOut.waybillBookingChargesList;
			var _this = this;
		
			$('#popUpContent255').bPopup({}, function() {
				var _thisMod = this;

				if (wayBillTypeId == WAYBILL_TYPE_CREDIT || wayBillTypeId == WAYBILL_TYPE_TO_PAY || wayBillTypeId == WAYBILL_TYPE_PAID) {
						$(this).html("<div class='confirm' style='height:150px;width:250px; padding:5px'>"
							+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
							+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' id='check1'  />&nbsp;<b style='font-size:14px;'>Print Charges</b><div>"
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
									$("*[data-lr='bookingServicetax']").html('0');
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
											$("*[data-selector='chargeValue" + bookingCharges[index].chargeTypeMasterId + "']").html(bookingCharges[index].wayBillBookingChargeChargeAmount);
											$("*[data-lr='advanceAmount']").html(responseOut.advanceAmount);
											$("*[data-lr='calculateTotal']").html(responseOut.bookingTotal);
											$("*[data-lr= 'grandTotal']").html(responseOut.bookingTotal);
											$("*[data-lr='bookingServicetax']").html(responseOut.bookingTimeServiceTax);
										}
									}
									_thisMod.close();
								}
								_thisMod.close();
								_this.printWindow(isPdfExportAllow);
							});
						} else {
							for (var index in bookingCharges) {
								if (bookingCharges[index].wayBillBookingChargeChargeAmount != 0) {
									$("*[data-selector='chargeValue" + bookingCharges[index].chargeTypeMasterId + "']").html(bookingCharges[index].wayBillBookingChargeChargeAmount);
									$("*[data-lr='advanceAmount']").html(responseOut.advanceAmount);
									$("*[data-lr='calculateTotal']").html(responseOut.bookingTotal);
								}
							}
							_thisMod.close();
							_this.printWindow(isPdfExportAllow);
						}
					});	
		}
	});
});	