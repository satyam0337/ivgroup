define([], function() {	
	return {
		setPopup : function(accountGroupId, data) {
			$('#popUpContent_' + accountGroupId).bPopup({
            }, function() {
					var _thisMod = this;

					$(this).html("<div class='confirm' style='font-size:18px;height:200px;width:350px;padding-left:15px;'>"
							+"<b style='text-align:center'>Print Option</b><br/><br/>"						
							+"<input type='radio' id='withHeader' name='radio1'/>&nbsp;<b style='font-size:14px;text-align:left;color:DodgerBlue;'>With Header</b>"
							+"<input type='radio' id='withOutHeader' name='radio1'/>&nbsp;<b style='font-size:14px;text-align:left;color:DodgerBlue;'>Without Header</b><br/><br/>"
							+"<input type='radio' id='withSign' name='radio2'/>&nbsp;<b style='font-size:14px;text-align:left;color:DodgerBlue;'>With Sign</b>&emsp;"
							+"<input type='radio' id='withOutSign'  name='radio2'/>&nbsp;<b style='font-size:14px;text-align:left;color:DodgerBlue;'>Without Sign</b><br/><br/>"
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
								
								$('input[id="withSign"]').click(function() {
									$(".withSignature").css('visibility', 'visible');
								});

								$('input[id="withOutSign"]').click(function() {
									$(".withSignature").css('visibility', 'hidden');
								});

							});

					$("#ok").click(function() {
						_thisMod.close();
						setTimeout(function(){window.print();},200);
					});

					$("#cancel").click(function() {
						_thisMod.close();
					});
			});
		}
	}
});