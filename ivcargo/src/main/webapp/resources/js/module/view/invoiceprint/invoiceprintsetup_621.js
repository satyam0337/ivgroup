define([], function(){	
	return {
		setPopup : function(accountGroupId, data, isExcel) {
			$('#popUpContent_' + accountGroupId).bPopup({
            }, function() {
				var _thisMod = this;
				$(this).html(
					  "<div class='confirm' style='font-size:18px;text-align:center;height:180px;color:DodgerBlue;>"
					+ "<b style='font-size:18px;>Print Option</b><br></br>"
					+ "<label><input type='checkbox' checked='checked' id='rateCheckbox'/>&nbsp;<b style='font-size:16px;'>Rate</b><br></label>"
					+ "<label><input type='checkbox' checked='checked' id='ddcCheckbox'/>&nbsp;<b style='font-size:16px;'>DDC</b><br></label>"
					+ "<button class='' id='cancel'>Cancel</button>"
					+ "<button class='' id='ok'>Print</button></center></div>"
				)
				$(".otherWithDDCTd").hide()
				$("#rateCheckbox").on("change", function() {
					if ($(this).prop("checked")) {
						$(".rateTd").show()
					} else {
						$(".rateTd").hide()
					}
				})
				$("#ddcCheckbox").on("change", function() {
					if ($(this).prop("checked")) {
						$(".ddcTd").show()
						$(".otherWithDDCTd").hide()
						$(".otherTd").show()
						
					} else {
						$(".ddcTd").hide()
						$(".otherTd").hide()
						$(".otherWithDDCTd").show()
					}
				})
				$("#ok").click(function() {
					_thisMod.close();
					setTimeout(function(){window.print();},200);	
				});
	
				$("#cancel").click(function() {
					if ($("#rateCheckbox").is(":checked") && $("#ddcCheckbox").is(":checked")) {
						$(".rateTd").hide()
						$(".ddcTd").hide()
						$(".otherTd").hide()
						$(".otherWithDDCTd").show()
						_thisMod.close();
						setTimeout(function(){window.print();},200);
					}else if( $("#ddcCheckbox").is(":checked")){
						$(".otherWithDDCTd").hide()
						_thisMod.close();
						setTimeout(function(){window.print();},200);
					}else{
						$(".otherWithDDCTd").show()
						_thisMod.close();
						setTimeout(function(){window.print();},200);	
					}
				});

			});
		}
	}
});