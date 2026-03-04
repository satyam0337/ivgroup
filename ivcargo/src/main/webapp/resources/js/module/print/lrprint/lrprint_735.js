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
			
			$('#popUpContent735').bPopup({
					}, function() {
						var _thisMod = this;

						$(this).html("<div class='confirm' style='height:150px;width:250px; padding:5px'>"
							+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
							+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' id='check1'  />&nbsp;<b style='font-size:14px;'>Print Header</b><div>"
							+ "<p style='color:red'>Shortcut Keys : Enter = Yes, Esc = No</p>"
							+ "<button id='cancelButton'>NO</button>"
							+ "<button  id='confirm'>YES</button></center></div>")

							$('#confirm').focus();

							$("#confirm").click(function() {
								if ($('#check1').prop('checked') == true) {
									$("#heaDer2").show();
									$("#heaDer1").hide();
									$(".heaDer3").hide();
									$(".heaDer4").show();
									$("#heaDer22").show();
									$("#heaDer12").hide();
									$("#heaDer23").show();
									$("#heaDer13").hide();
									$("#heaDer24").show();
									$("#heaDer14").hide();
								}
								_thisMod.close();
								_this.printWindow(isPdfExportAllow);
							});

							$("#confirm").on('keydown', function(e) {
								if (e.which == 27) {  //escape
									_thisMod.close();
								}
							});

							$("#cancelButton").click(function() {
								_thisMod.close();
								_this.printWindow(isPdfExportAllow);
							})
					});
		}
	});
});	