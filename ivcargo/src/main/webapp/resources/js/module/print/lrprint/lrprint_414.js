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
			var wayBillTypeId = responseOut.wayBillTypeId;
			var isPdfExportAllow = responseOut.isPdfExportAllow;
			var _this = this;
			
			$('#popUpContent1').bPopup({
				}, function() {
					var _thisMod = this;
					$(this).html("<div class='confirm' style='height:200px;width:250px; padding:5px'>"
						+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Options</b><div><br/>"
						+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox'  id='consignorCopyId'  />&nbsp;<b style='font-size:14px;'>Print Charges on Consignor Copy</b><div>"
						+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='consigneeCopyId'  />&nbsp;<b style='font-size:14px;'>Print Charges on Consignee Copy</b><div>"
						+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='podCopyId'  />&nbsp;<b style='font-size:14px;'>Print Charges on POD Copy</b><div>"
						+ "<p style='color:red' id='shortcut'></p>"
						+ "<button id='cancelButton'>Cancel</button>"
						+ "<button autofocus id='confirm'>Print</button></center></div>")

					if (wayBillTypeId == WAYBILL_TYPE_PAID || wayBillTypeId == WAYBILL_TYPE_TO_PAY || wayBillTypeId == WAYBILL_TYPE_FOC) {
						$("#shortcut").html("Shortcut Keys : Enter = Yes, Esc = No")
						$("#confirm").focus();

						$("#confirm").click(function() {
							_thisMod.close();
							_this.printWindow(isPdfExportAllow);
						})

						$("#confirm").on('keydown', function(e) {
							if (e.which == 27) {  //escape
								_thisMod.close();
								_this.clearCharges(responseOut);
							}
						});
						$("#cancelButton").click(function() {
							_thisMod.close();
							_this.clearCharges(responseOut);
						})

						$(".hideConsignorCopyChrgs").hide();

						$("#confirm").click(function() {
							if ($("#consignorCopyId").is(":checked"))
								$(".hideConsignorCopyChrgs").show();

							if ($("#consigneeCopyId").is(":checked"))
								$(".hideConsigneeCopyChrgs").show();
							else
								$(".hideConsigneeCopyChrgs").hide();

							if ($("#podCopyId").is(":checked"))
								$(".hidePodCopyChrgs").show();
							else
								$(".hidePodCopyChrgs").hide();
						});
					} else {
						$("#shortcut").html("Shortcut Keys : Enter = NO, Esc = Yes")
						$("#cancelButton").focus();

						$("#cancelButton").click(function() {
							_thisMod.close();
							_this.clearCharges(responseOut);
						})

						$("#cancelButton").on('keydown', function(e) {
							if (e.which == 27) {  //escape
								_thisMod.close();
								_this.printWindow(isPdfExportAllow);
							}
						});
						$("#confirm").click(function() {
							_thisMod.close();
							_this.printWindow(isPdfExportAllow);
						});

						$(".hideConsignorCopyChrgs").hide();

						$("#confirm").click(function() {
							if ($("#consignorCopyId").is(":checked"))
								$(".hideConsignorCopyChrgs").show();

							if ($("#consigneeCopyId").is(":checked"))
								$(".hideConsigneeCopyChrgs").show();
							else
								$(".hideConsigneeCopyChrgs").hide();

							if ($("#podCopyId").is(":checked"))
								$(".hidePodCopyChrgs").show();
							else
								$(".hidePodCopyChrgs").hide();
						});
					}
				});
		}
	});
});	