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
			let artLength = responseOut.consignmentSummaryQuantity;
			
			$('#popUpContent806').bPopup({
			 }, function() {
				var _thisMod = this;
				$(this).html("<div class='confirm' style='height:200px;width:250px; padding:5px'>"
						+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
						+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox'	id='printAllLR'/> <b style='font-size:14px;'>Print All LR</b><div><br/>"
						+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox'	id='printSingleLR'/> <b style='font-size:14px;'>Print Single LR</b><div><br/>"
						+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printDoubleLR'/> <b style='font-size:14px;'>Print Double LR</b><div><br/>"
						+ "<button id='cancelButton'>Cancel</button>"
						+ "<button autofocus id='confirm'>Print</button></center></div>")

				let originalTable = $('.OrignalCopyTable');

				$("#confirm").focus();
				
				$("#cancelButton").click(function() {
					window.close();
					_thisMod.close();
				})

				$('#confirm').click(function() {
					if ($('#printAllLR').prop('checked')) {
						for(let i = 1; i < artLength; i++) {
							let clonedTable = originalTable.clone();
							clonedTable.addClass('marginTop50px')
							$('#mainContent > div').append(clonedTable)
						}
						
						_thisMod.close();
					} else if ($('#printSingleLR').prop('checked')) {
						_thisMod.close();
					} else if ($('#printDoubleLR').prop('checked')) {
						let clonedTable = originalTable.clone();
						clonedTable.addClass('marginTop50px')
						$('#mainContent > div').append(clonedTable)
					}
					
					_thisMod.close();
					_this.printWindow(isPdfExportAllow);
				});
				
				$('#confirm').on('keydown', function(e) {
					if (e.which == 27)  //escape
						window.close();
				});
			});
		}
	});
});	