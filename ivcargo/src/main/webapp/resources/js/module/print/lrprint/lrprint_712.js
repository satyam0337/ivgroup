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
			var _this = this;
			
			$('#popupForTbbAmount_712').bPopup({}, function() {
						var _thisMod = this;

							$(this).html("<div class='confirm' style='height:170px;width:250px; padding:5px'>"
								+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
								+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' id='check1'  />&nbsp;<b style='font-size:14px;'>Print Actual Weight</b><div>"
								+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' id='check2'  />&nbsp;<b style='font-size:14px;'>Print Charged Weight</b><div>"
								+ "<p style='color:red'>Shortcut Keys : Enter = Yes, Esc = No</p>"
								+ "<button id='cancel'>Cancel</button>"
								+ "<button autofocus id='printWeight1'>Print</button></center></div>");

							$("#confirm").click(function() {
								_thisMod.close();
							});
							$("#cancel").click(function() {
								_thisMod.close();
								_this.printWindow(isPdfExportAllow);
							});
							$("#printWeight1").click(function() {
								if ($("#check1").is(":checked")) {
									$(".showActualWeight").show();
									_thisMod.close();
								}
								if ($("#check2").is(":checked")) {
									$(".showChargedWeight").show();
									_thisMod.close();
								}
								_thisMod.close();
								_this.printWindow(isPdfExportAllow);
							});
					});
		}
	});
});	