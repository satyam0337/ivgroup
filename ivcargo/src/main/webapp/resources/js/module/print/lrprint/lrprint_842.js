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
			if(responseOut.wayBillTypeId == WAYBILL_TYPE_PAID || responseOut.wayBillTypeId == WAYBILL_TYPE_CREDIT) {
				$('#popUpContent842').bPopup({
				}, function() {
					var _thisMod = this;
					$(this).html("<div class='confirm' style='height:150px;width:250px; padding:5px;'>"
						+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
						+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printCharges'/>&nbsp;<b style='font-size:14px;'>Print Charges</b><div><br/>"
						+ "<button id='cancelButton'>Cancel</button>"
						+ "<button autofocus id='confirm'>Print</button></center></div>")
					
					$("#confirm").focus();
					$("#cancelButton").click(function() {
						_thisMod.close();
						_this.printWindow();
					})
					
					$('#confirm').click(function() {
						 if ( $('#printCharges').is(':checked') == false) {
							$('.hideCharges').each(function() {
								$(this).text('0');
							});
						}
						_thisMod.close();
						_this.printWindow();

					
					});

				}); 
		}

		}
	});
});	