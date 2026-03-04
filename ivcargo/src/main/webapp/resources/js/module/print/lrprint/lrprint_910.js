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
		}, showPopUp : function(responseOut, isPdfExportAllow) {
			hideLayer();
			var _this = this;
			var bookingCharges = responseOut.waybillBookingChargesList;

			$('#popupForTbbAmount910').bPopup({}, function() {
				var _thisMod = this;
					$(this).html("<div class='confirm' style='height:150px;width:250px; padding:5px'>"
						+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
						+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' id='check1'	/>&nbsp;<b style='font-size:14px;'>Print Charges</b><div>"
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
							$("*[data-lr='chargeSum']").html('0');

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
									$("*[data-lr='chargeSum']").html(responseOut.bookingChargesSum);
									$("*[data-lr='grandTotal']").html(responseOut.bookingTotal);
									
								}
							}
							_thisMod.close();
						}
						_thisMod.close();
						_this.printWindow(isPdfExportAllow);
					});
			});
		}
	});
});	