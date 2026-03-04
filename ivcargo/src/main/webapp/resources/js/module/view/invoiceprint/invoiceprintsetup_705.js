define([], function(){	
	return {
		setPopup : function(accountGroupId, data) {
			$('#popUpContent_' + accountGroupId).bPopup({
            }, function() {
				var _thisMod = this;
				
				$(this).html("<div class='confirm' style='height:150px;width:370px; text-align: left; padding:5px'>"
						+"<b style='font-size:18px; color:DodgerBlue;'>Select Print</b><br/><br/>"	
						+"<input id='excel_bcm' style='font-size:25px;width: 80pt;margin-left: 35px;color: DodgerBlue;' type='button' value='Excel'/>"
						+"<input id='confirm' style='font-size:25px;width: 80pt;margin-left: 75px;color: DodgerBlue;' type='button' value='Print'/>"
						+"<button id='cancelButton'>NO</button>"
						+"<button autofocus id='confirm'>YES</button></center></div><br/>")
				
				$("#cancelButton").click(function() {
					$('.mainTable').css('height','1125px');
					_thisMod.close();
					setTimeout(function(){window.print();},200);
				});
					
				$("#confirm").click(function() {
					_thisMod.close();
					setTimeout(function(){window.print();},200);
				});
					
				$('input[id="excel_bcm"]').click(function(e) {
					_thisMod.close();
					var htmlTable = document.getElementById('exceldataofbcm');
					var html 	  = htmlTable.outerHTML;						
					var path 	= 'data:application/vnd.ms-excel,' + encodeURIComponent(html);
					window.open(path);
					e.preventDefault();
				});
			});
		}
	}
});