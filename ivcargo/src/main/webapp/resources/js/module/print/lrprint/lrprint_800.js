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
			var configuration = responseOut.configuration;
			var isPdfExportAllow = responseOut.isPdfExportAllow;
			var _this = this;
			var chargeIdArr = (configuration.ChargeIdsExceptionForTBBLabel).split(",");
			var chargeTypeModelArr = responseOut.chargeTypeModelArr;
			var wayBillTypeId = responseOut.wayBillTypeId;
			
			$('#popupForTbbAmount_800').bPopup({}, function() {
						var _thisMod = this;

							if (wayBillTypeId == WAYBILL_TYPE_CREDIT) {
							$(this).html("<div class='confirm' style='height:150px;width:250px; padding:5px'>"
								+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
								+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' id='check1'  />&nbsp;<b style='font-size:14px;'>Print Charge</b><div>"
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
							$("*[data-lr='grandTotal']").html(Math.round(responseOut.bookingTotal));
							$("#printCharges1").click(function() {
								if ($("#check1").is(":checked")) {
									for (var index in chargeTypeModelArr) {
										if (!isValueExistInArray(chargeIdArr, chargeTypeModelArr[index].chargeTypeMasterId))
											$("*[data-selector='chargeValue" + chargeTypeModelArr[index].chargeTypeMasterId + "']").html("0");
											$("*[data-lr='grandTotal']").html(Math.round(responseOut.bookingTotal));
									}
									_thisMod.close();
								}else{
									for (var index in chargeTypeModelArr) {
											$("*[data-selector='chargeValue" + chargeTypeModelArr[index].chargeTypeMasterId + "']").html("0");
											$("*[data-lr='grandTotal']").html("0");
											
									}
									
									_thisMod.close();
								}
								
								
								_thisMod.close();
								_this.printWindow(isPdfExportAllow);
							});
							}else{
								_thisMod.close();
								_this.printWindow(isPdfExportAllow);
							}
					});
		}
	});
});	