define([], function(){	
	return {
		setPopup : function(accountGroupId, data, isExcel) {
			$('#popUpContent_' + accountGroupId).bPopup({
            }, function() {
				var _thisMod = this;
				$(this).html(
					  "<div class='confirm' style='font-size:18px;text-align:center;height:160px;color:DodgerBlue;padding-top: 20px;'>"
					+ "<b style='font-size:18px;'>Select Format</b><br/>"
					+ "<label><input type='radio' checked='checked' id='summaryRadio' name='format'/>&nbsp;<b style='font-size:16px;'>Summary (Portrait)</b></label>&nbsp;&nbsp;"
					+ "<label><input type='radio' id='detailsRadio' name='format'/>&nbsp;<b style='font-size:16px;'>Details (Landscape)</b></label>"
					+ "<button id='cancelBtn'>Cancel</button>"
					+ "<button id='printBtn'>Print</button></center></div>"
				)
				
				$("#summaryRadio, #detailsRadio").change(function() {
					if ($("#summaryRadio").is(":checked")) {
						$("#summary").removeClass("hide")
						$("#details").addClass("hide")
					} else {
						$("#summary").addClass("hide")
						$("#details").removeClass("hide")
					}
				})
				
				$("#cancelBtn").click(function() {
					_thisMod.close();
				})
				
				$("#printBtn").click(function() {
					_thisMod.close();
					setTimeout(function(){window.print();},200);
				})
			});
		}
	}
});