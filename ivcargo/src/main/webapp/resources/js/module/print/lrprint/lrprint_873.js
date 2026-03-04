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
			var isRePrint = responseOut.isReprint;
			
					if (responseOut.wayBillTypeId == WAYBILL_TYPE_CREDIT || responseOut.wayBillTypeId == WAYBILL_TYPE_PAID) {
						$('.hideChargesforSNRT').html("0");
					}
					if (responseOut.wayBillTypeId == WAYBILL_TYPE_FOC) {
			
						$(".hideChargesforSadashivFOC").hide();
			
					}	
					
					if(isRePrint){
						$('#popUpContentForSinglePrint').bPopup({
						}, function() {
	
							var _thisMod = this;
							$(this).html("<div class='confirm' style='height:180px'><h1>Print option</h1><br><center>" +
								"<input type='checkbox' name='setAmount' id='setAmount' style='font-weight: bold;font-size: 20px;' unchecked />Print Three Copy</center> " +
								"<br><br><button type='button' name='cancel' id='cancel' class='btn-primary'>Cancel</button>" +
								"<button type='button' name='printCharges' id='printCharges' class='btn-primary' style='margin-left: 50px;'>Print</button>");
	
							$('.confirm').focus();
							$('#printCharges').focus();
							$(".thirdCopy").css("margin-top", "75px");									

							$("#cancel").click(function() {
								_thisMod.close();
								_this.printWindow();
							})
	
							$("#printCharges").click(function() {
								if ($("#setAmount").is(":checked")) {
									$(".hideCopyForReprint").show();
									$(".thirdCopy").css("margin-top", "35px");									
									_thisMod.close();
									_this.printWindow();
								} else if ($("#setAmount").not(":checked")) {
									_thisMod.close();
									_this.printWindow();
								}
							});
	
						});
					}else{
						_this.printWindow(isPdfExportAllow);	
					}
		}
	});
});	