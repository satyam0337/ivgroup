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
				var chargeTypeModelArr = responseOut.chargeTypeModelArr;
					if(responseOut.wayBillTypeId == WAYBILL_TYPE_CREDIT){
						$('#popupShowZeroForTBB').bPopup({
						}, function() {
							_this.hideCharges(chargeTypeModelArr);
	
							var _thisMod = this;
							$(this).html("<div class='confirm' style='height:180px'><h1>Print option</h1><br><center>" +
								"<input type='checkbox'	 name='setAmount' id='setAmount' style='font-weight: bold;font-size: 20px;' checked />Print Charges</center> " +
								"<br><br><button type='button' name='cancel' id='cancel' class='btn-primary'>Cancel</button>" +
								"<button type='button' name='printCharges' id='printCharges' class='btn-primary' style='margin-left: 50px;'>Print</button>");
	
							$('.confirm').focus();
							$('#printCharges').focus();
	
							$("#cancel").click(function() {
								_thisMod.close();
								_this.setZeroAmount(chargeTypeModelArr);
								_this.printWindow();
							})
	
							$("#printCharges").click(function() {
								if ($("#setAmount").is(":checked")) {
									_this.showCharges(chargeTypeModelArr);
									_thisMod.close();
									_this.printWindow();
								} else if ($("#setAmount").not(":checked")) {
									_this.hideCharges(chargeTypeModelArr);
									_thisMod.close();
									_this.printWindow();
								}
							});
	
						});
					}else{
						_this.printWindow();
					}
			},hideCharges: function(chargeTypeModelArr) {
				for (var index in chargeTypeModelArr) {
					//$("*[data-selector='chargeValue" + chargeTypeModelArr[index].chargeTypeMasterId + "']").hide();
					$("*[data-selector='chargeValue" + chargeTypeModelArr[index].chargeTypeMasterId + "']").css("visibility", "hidden");
				}

				$(".grandTotal").css("visibility", "hidden");
				$("*[data-lr='bookingServicetax']").css("visibility", "hidden");
				$("*[data-lr='grandTotal']").css("visibility", "hidden");
			}, showCharges: function(chargeTypeModelArr) {
				for (var index in chargeTypeModelArr) {
					//$("*[data-selector='chargeValue" + chargeTypeModelArr[index].chargeTypeMasterId + "']").show();
					$("*[data-selector='chargeValue" + chargeTypeModelArr[index].chargeTypeMasterId + "']").css("visibility", "visible");
				}

				$(".grandTotal").css("visibility", "visible");
				$(".removeChargest").show();
				$("*[data-lr='bookingServicetax']").css("visibility", "visible");
				$("*[data-lr='grandTotal']").css("visibility", "visible");
			}
	});
});	