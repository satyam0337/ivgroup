define([], function() {	
	return {
		setPopup : function(accountGroupId, data) {
			$('#popUpContent_' + accountGroupId).bPopup({
			}, function() {
				var _thisMod = this;
				$(this).html("<div class='confirm' style='font-size:18px;height:150px;text-align:center;width:300px;color:DodgerBlue;>"
					+ "<b style='font-size:18px;>Print Option</b><br></br>"
					+ "<input type='radio' id='normalFormat' checked='checked' name='radio3'/>&nbsp;<b style='font-size:16px;'>Normal</b>&emsp;&emsp;"
					+ "<input type='radio' id='summaryFormat'  name='radio3' />&nbsp;<b style='font-size:16px;'>Summary</b><br>"
					+ "<button class='' id='cancel'>Cancel</button>"
					+ "<button class='' id='ok'>Ok</button></center></div>")

				$('input[id="normalFormat"]').click(function() {
					if ($("#normalFormat").prop("checked", true)) {
						$(".Summary").removeClass('hide');
						$(".Normal").addClass('hide');
					}
				});

				$('input[id="summaryFormat"]').click(function() {
					if ($("#summaryFormat").prop("checked", true)) {
						$(".Summary").addClass('hide');
						$(".Normal").removeClass('hide');
					}
				});
					
				$("#ok").click(function() {
					_thisMod.close();
					setTimeout(function(){window.print();},200);
				});
	
				$("#cancel").click(function() {
					_thisMod.close();
					setTimeout(function(){window.print();},200);
				});
				
				window.onload = function() {
                var watermark = document.querySelector('.watermark');
                var body = document.body;
                var html = document.documentElement;
                var height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
                
                for (var i = 0; i < height / window.innerHeight; i++) {
                    var clonedWatermark = watermark.cloneNode(true);
                    clonedWatermark.style.top = (i * 1000) + 'vh';
                    document.body.appendChild(clonedWatermark);
               	 }
                };
                
			});
		}
	}
});