define([], function(){	
	return {
		setPopup : function(accountGroupId, data, isExcel) {
			$('#popUpContent_' + accountGroupId).bPopup({
            }, function() {
				var _thisMod = this;
				$(this).html(
					  "<div class='confirm' style='font-size:18px;text-align:center;height:180px;color:DodgerBlue;>"
					+ "<b style='font-size:18px;>Print Option</b><br></br>"
					+ "<label><input type='checkbox' checked='checked' id='consignorCheckbox'/>&nbsp;<b style='font-size:16px;'>Consignor</b><br></label>"
					+ "<label><input type='checkbox' checked='checked' id='consigneeCheckbox'/>&nbsp;<b style='font-size:16px;'>Consignee</b><br></label>"
					+ "<button class='' id='cancel'>Cancel</button>"
					+ "<button class='' id='ok'>Ok</button></center></div>"
				)
				
				$("#consignorCheckbox").on("change", function() {
					if ($(this).prop("checked")) {
						$(".consignorTd").show()
					} else {
						$(".consignorTd").hide()
					}
				})
				
				
				
				$("#consigneeCheckbox").on("change", function() {
					if ($(this).prop("checked")) {
						$(".consigneeTd").show()
					} else {
						$(".consigneeTd").hide()
					}
				})
				$("#ok").click(function() {
					if ($("#consignorCheckbox").is(":checked") && $("#consigneeCheckbox").is(":checked")) {
						$(".consignorTd").show()
						$(".consigneeTd").show()
						_thisMod.close();
						if (isExcel == true || isExcel == "true") return
						setTimeout(function(){window.print();},200);
					}else{
						_thisMod.close();
						if (isExcel == true || isExcel == "true") return
						setTimeout(function(){window.print();},200);	
					}
					
				});
	
				$("#cancel").click(function() {
					if ($("#consignorCheckbox").is(":checked") && $("#consigneeCheckbox").is(":checked")) {
						$(".consignorTd").hide()
						$(".consigneeTd").hide()
						_thisMod.close();
						if (isExcel == true || isExcel == "true") return
						setTimeout(function(){window.print();},200);
					}else{
						_thisMod.close();
						if (isExcel == true || isExcel == "true") return
						setTimeout(function(){window.print();},200);	
					}
				});

			});
		}
	}
});