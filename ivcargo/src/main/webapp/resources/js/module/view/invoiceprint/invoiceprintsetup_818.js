define([], function(){	
	return {
		setPopup : function(accountGroupId, data, isExcel) {
			$('#popUpContent_' + accountGroupId).bPopup({
            }, function() {
				var _thisMod = this;
				$(this).html(
					  "<div class='confirm' style='font-size:18px;text-align:center;height:160px;color:DodgerBlue;padding-top: 20px;'>"
					+ "<b style='font-size:18px;'>Select Format</b><br/>"
					+ "<label><input type='radio' checked='checked' id='jpflRadio' name='format'/>&nbsp;<b style='font-size:16px;'>1-JPFL</b></label>&nbsp;&nbsp;"
					+ "<label><input type='radio' id='everestRadio' name='format'/>&nbsp;<b style='font-size:16px;'>2-Everest</b></label>"
					+ "<button id='cancelBtn'>Cancel</button>"
					+ "<button id='printBtn'>Print</button></center></div>"
				)
				
				$(".hideInJpfl").addClass("hide")
				$(".hideInEverest").removeClass("hide")
				$("#root").addClass("jpfl")
				$("#root").removeClass("everest")
				let format = "jpfl"
				$(`*[data-colspan-${format}]`).each(function() {
					$(this).attr("colspan", $(this).attr(`data-colspan-${format}`))
				})
				
				$("#jpflRadio, #everestRadio").change(function() {
					if ($("#jpflRadio").is(":checked")) {
						$(".hideInJpfl").addClass("hide")
						$(".hideInEverest").removeClass("hide")
						$("#root").addClass("jpfl")
						$("#root").removeClass("everest")
					} else {
						$(".hideInJpfl").removeClass("hide")
						$(".hideInEverest").addClass("hide")
						$("#root").addClass("everest")
						$("#root").removeClass("jpfl")
					}
					let format = $("#jpflRadio").is(":checked") ? "jpfl" : "everest"
					$(`*[data-colspan-${format}]`).each(function() {
						$(this).attr("colspan", $(this).attr(`data-colspan-${format}`))
					})
				})
				
				$("#cancelBtn").click(function() {
					_thisMod.close();
				})
				
				$("#printBtn").click(function() {
					_thisMod.close();
					$(".hideInPrint").addClass("hide");
					setTimeout(function(){window.print();},200);
				})
			});
		}
	}
});