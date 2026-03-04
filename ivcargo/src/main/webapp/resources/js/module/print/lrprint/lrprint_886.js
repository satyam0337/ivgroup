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

			if (isRePrint) {
				$('#popUpContent886').bPopup({
				}, function() {
					var _thisMod = this;
					$(this).html("<div class='confirm' style='height:200px;'><h1>Print Option </h1><input type='checkbox' id='duplicate' /><b>SIngle Copy</b><br><br><p id='shortcut' style='color: red;'></p><button id='cancelButton'>NO</button><button id='confirm'>YES</button></div>")
					$("#shortcut").html("Shortcut Keys : Enter = Yes, Esc = No")
					$("#confirm").focus();

					$("#confirm").click(function() {
						if ($('input[id="duplicate"]').prop("checked") == true) {
							$("#secondCopy").css("display", "none");
							$("#thirdCopy").css("display", "none");
						} else if ($('input[id="duplicate"]').prop("checked") == false) {
							$("#firstCopy").css("display", "block");
							$("#secondCopy").css("display", "block");
							$("#thirdCopy").css("display", "block");
						}
						_thisMod.close();
						_this.printWindow(isPdfExportAllow);
					})

					$("#confirm").on('keydown', function(e) {
						if (e.which == 27) {  //escape
							if ($('input[id="duplicate"]').prop("checked") == true) {
								$("#secondCopy").css("display", "none");
								$("#thirdCopy").css("display", "none");
							} else if ($('input[id="duplicate"]').prop("checked") == false) {
								$("#firstCopy").css("display", "block");
								$("#secondCopy").css("display", "block");
								$("#thirdCopy").css("display", "block");
							}
							_thisMod.close();
							_this.printWindow(isPdfExportAllow);
						}
					});
					$("#cancelButton").click(function() {
						$("#firstCopy").css("display", "block");
						$("#secondCopy").css("display", "block");
						$("#thirdCopy").css("display", "block");
						_thisMod.close();
						_this.printWindow(isPdfExportAllow);
					})
				});
			} else {
				_this.printWindow(isPdfExportAllow);
			}
				
		}
	});
});	