define([], function() {	
	return {
		setPopup : function(accountGroupId, data) {
			$('#popUpContent_' + accountGroupId).bPopup({
            }, function() {
				if(data.isBranchWisePrintFormatPopup) {	
					var _thisMod = this;

					$(this).html("<div class='confirm' style='font-size:18px;height:350px;width:350px;padding-left:15px;'>"
							+"<b style='text-align:center'>Print Option</b><br/><br/>"	
							+"<input type='radio' id='withOutHeader' name='radio'/>&nbsp;<b style='font-size:14px;text-align:left;color:DodgerBlue;'>Default Print Without Header</b><br/><br/>"
							+"<input type='radio' id='defaultPrint' checked='checked' name='radio'/>&nbsp;<b style='font-size:14px;text-align:left;color:DodgerBlue;'>Default Print</b><br/><br/>"
							/*+"<input type='radio' id='formate1' name='radio' />&nbsp;<b style='font-size:14px;text-align:left;color:DodgerBlue;'>Format 1</b><br/><br/>"*/
							+"<input type='radio' id='formate2' name='radio' />&nbsp;<b style='font-size:14px;text-align:left;color:DodgerBlue;'>Format 2</b><br/><br/>"
							+"<input type='radio' id='formate3' name='radio' />&nbsp;<b style='font-size:14px;text-align:left;color:DodgerBlue;'>Format 3</b><br/><br/>"
							+"<button id='cancel'>Cancel</button>"
							+"<button  id='ok'>OK</button></center></div>")

							$(document).ready(function() {
								$('#defaultPrint').prop("checked", true);	
									$(".format").hide();
									$(".format2").hide();
									$(".format3").hide();
									$(".defaultPrint").hide();
								
								$('input[id="withOutHeader"]'). click(function() {
										$(".defaultFormate").show();
										$(".format").hide();
										$(".format2").hide();
										$(".format3").hide();
										$(".defaultPrint").hide();
										$(".withOutHeaders").hide();
										$("#maintableEle").css('margin-top','0');
								});
								$('input[id="defaultPrint"]'). click(function() {
									$(".defaultFormate").show();
									$(".format").hide();
									$(".format2").hide();
									$(".format3").hide();
									$(".defaultPrint").hide();
									$(".withOutHeaders").show();
									$("#maintableEle").css('margin-top','0');
								});
								$('input[id="formate2"]'). click(function() {
									$(".format2").show();
									$(".format").hide();
									$(".defaultFormate").hide();
									$(".format3").hide();
									$(".defaultPrint").hide();
									$("#maintableEle").css('margin-top','100px');
								});
								$('input[id="formate3"]'). click(function() {
									$(".format3").show();
									$(".defaultFormate").hide();
									$(".format").hide();
									$(".format2").hide();
									$(".defaultPrint").hide();
									$("#maintableEle").css('margin-top','0');
								});
							});

					$("#ok").click(function() {
						_thisMod.close();
						setTimeout(function(){window.print();},200);
					});

					$("#cancel").click(function() {
						_thisMod.close();

					});
				}else{
					var _thisMod = this;

					$(this).html("<div class='confirm' style='font-size:18px;height:200px;width:350px;padding-left:15px;'>"
							+"<b style='text-align:center'>Print Option</b><br/><br/>"	
							+"<input type='radio' id='withHeader' name='radio'/>&nbsp;<b style='font-size:14px;text-align:left;color:DodgerBlue;'>With Header</b><br/><br/>"
							+"<input type='radio' id='withOutHeader' name='radio'/>&nbsp;<b style='font-size:14px;text-align:left;color:DodgerBlue;'>Without Header</b><br/><br/>"
							+"<button id='cancel'>Cancel</button>"
							+"<button  id='ok'>OK</button></center></div>")

							$(document).ready(function() {

								$(".format3").hide();
								$(".defaultFormate").hide();
								$(".format").hide();
								$(".format2").hide();
								$(".withHeader1").hide();

								$('input[id="withHeader"]'). click(function() {
									$(".withHeaders").show();
									$(".blanktr").addClass('hide');
								});
								$('input[id="withOutHeader"]'). click(function() {
									$(".withOutHeaders").hide();
									$(".blanktr").removeClass('hide');
								});

							});

					$("#ok").click(function() {
						_thisMod.close();
						setTimeout(function(){window.print();},200);
					});

					$("#cancel").click(function() {
						_thisMod.close();

					});
				}
			});
		}
	}
});