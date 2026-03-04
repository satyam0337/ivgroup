define([], function(){	
	return {
		setPopup : function(accountGroupId, data, isExcel) {
			$('#popUpContent_' + accountGroupId).bPopup({
            }, function() {
				var _thisMod = this;
				$(this).html(
					  "<div class='confirm' style='font-size:18px;text-align:center;height:180px;color:DodgerBlue;>"
					+ "<b style='font-size:18px;>Print Option</b><br></br>"
					+ "<label><input type='checkbox' checked='checked' id='withSignature'/>&nbsp;<b style='font-size:16px;'>With Signature</b><br></label>"
					+"<input type='button' id='excelButton' value ='Excel' style='height:50px;width:90px;font-size:20px;'></input>"
					+ "<button class='' id='cancel'>Cancel</button>"
					+ "<button class='' id='ok'>Ok</button></center></div>"
				)
				
				$("#withSignature").on("change", function() {
					if ($(this).prop("checked")) {
						$(".withSignature").show()
					} else {
						$(".withSignature").hide()
						$(".showSpace").show()
					}
				})
				
				 $("#excelButton").click(function(e) {
                                _thisMod.close();
                                var clonedTable = $('#downloadToExcel').clone();
                                clonedTable.find('.hide').remove();

                                var path = 'data:application/vnd.ms-excel,' + encodeURIComponent(clonedTable.html());

                                window.open(path);

                                e.preventDefault();
                            });
                            
				$("#ok").click(function() {
					if ($("#consignorCheckbox").is(":checked") && $("#consigneeCheckbox").is(":checked") && $("#destinationCheckbox").is(":checked")) {
						event.preventDefault();
                		alert("All options are selected, popup is blocked.");
					}else{
						_thisMod.close();
						if (isExcel == true || isExcel == "true") return
						setTimeout(function(){window.print();},200);	
					}
					
				});
	
				$("#cancel").click(function() {
					if ($("#consignorCheckbox").is(":checked") && $("#consigneeCheckbox").is(":checked") && $("#destinationCheckbox").is(":checked")) {
						$(".consignorTd").hide()
						$(".consigneeTd").hide()
						$(".destinationTd").hide()
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