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

			$('#popUpContent869').bPopup({}, function() {
				var _thisMod = this;

				$(this).html(
					"<div class='confirm' style='font-size:18px;text-align:center;height:160px;color:DodgerBlue;padding-top: 20px;'>"
					+ "<b style='font-size:18px;'>Select Format</b><br/>"
					+ "<label><input type='radio' checked='checked' id='laserRadio' name='format'/>&nbsp;<b style='font-size:16px;'>Laser</b></label>&nbsp;&nbsp;"
					+ "<label><input type='radio' id='dotMatrixRadio' name='format'/>&nbsp;<b style='font-size:16px;'>Dot Matrix</b></label>"
					+ "<button id='cancelBtn'>Cancel</button>"
					+ "<button id='printBtn'>Print</button></center></div>"
				)
				$("#printBtn").focus();
				
				$("#laserRadio").on("change", function() {
					if ($(this).is(":checked")) {
						$("#laserPrint").show();
						$("#dotMatrixPrint").hide();
					}
				})
				
				$("#dotMatrixRadio").on("change", function() {
					if ($(this).is(":checked")) {
						$("#dotMatrixPrint").show();
						$("#laserPrint").hide();
					}
				})
				
				$("#cancelBtn").on("click", function() {
					_thisMod.close();
				})
				
				$("#printBtn").on("click", function() {
					_thisMod.close();
					_this.printWindow(isPdfExportAllow);
				})

			});
		}
	});
});	
