define([], function(){	
	return {
		setPopup : function(accountGroupId, data) {
			$('#popUpContent_' + accountGroupId).bPopup({
            }, function() {
				var _thisMod = this;

				$(this).html("<div class='confirm' style='font-size:18px;height:350px;width:350px;padding-left:15px;'>"
					+ "<b style='text-align:center'>Print Option</b><br/><br/>"
					+ "<input type='radio' id='formate1' name='radio' />&nbsp;<b style='font-size:14px;text-align:left;color:DodgerBlue;'>Company Copy</b><br/><br/>"
					+ "<input type='radio' id='formate2' name='radio' />&nbsp;<b style='font-size:14px;text-align:left;color:DodgerBlue;'>Ackonwledgement Copy</b><br/><br/>"
					+ "<input type='radio' id='formate3' name='radio' />&nbsp;<b style='font-size:14px;text-align:left;color:DodgerBlue;'>LR Details Copy</b><br/><br/>"
					+ "<button id='cancel'>Cancel</button>"
					+ "<button  id='ok'>OK</button></center></div>")

				$(document).ready(function() {
					$('input[id="formate1"]').click(function() {

						$(".formate2").css("display", "none");
						$(".formate1").css("display", "block");
						$(".formate3").css("display", "none");
					});

					$('input[id="formate2"]').click(function() {
						$(".formate1").css("display", "none");
						$(".formate2").css("display", "block");
						$(".formate3").css("display", "none");
					});

					$('input[id="formate3"]').click(function() {
						$(".formate3").css("display", "block");
						$(".formate2").css("display", "none");
						$(".formate1").css("display", "none");
					});
				});

				$("#ok").click(function() {
					_thisMod.close();
					setTimeout(function() { window.print(); }, 200);
				});

				$("#cancel").click(function() {
					_thisMod.close();

				});
			});
		}
	}
});