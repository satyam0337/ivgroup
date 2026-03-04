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
			
			$('#popUpContent695').bPopup({
					}, function() {
						var _thisMod = this;
						
							$(this).html("<div class='confirm'><table align='center'><tr><td colspan='3'><input type='radio' id='check1' >Print Header</td></tr>" +
								"<tr><td colspan='3'><input type='radio' id='check2' >Print Single LR Copy</td></tr></table>" +
								"<button id='cancelButton'>NO</button><button autofocus id='confirm'>YES</button></div>");

							$('#confirm').focus();

							$("#confirm").click(function() {
								if ($('#check1').prop('checked') == true) {
									$("#table1").css({ 'top': '5px' });
									$("#table2").css({ 'margin-top': '700px' });
									$("#table3").css({ 'margin-top': '30px' });
									$("#heaDer1").show();
									$("#heaDer2").show();
									$("#heaDer3").show();
								}

								if ($('#check2').prop('checked') == true) {
									$("#table1").show();
									$("#table2").hide();
									$("#table3").hide();
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
