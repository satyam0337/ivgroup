define([], function(){	
	return {
		setPopup : function(accountGroupId, data) {
					window.print();

			$('#excelDownLoad_231').bPopup({
				}, function() {
					var _thisMod = this;
					
					$(this).html("<div id='popUpDiv' class='confirm' style='height:88px;width:200px; text-align: left;padding-top:12px; padding-left:12px;padding-bottom:50px;'>"
							+"<b style='font-size:18px; color:DodgerBlue;'>Print Option</b><br/><br/>"
							+"<input type='button' id='laserPrintButton' value ='Print' style='height:50px;width:90px;font-size:20px;position:relative;'></input>"
							+"<input type='button' id='excelButton' value ='Excel' style='height:50px;width:90px;font-size:20px;position:relative;'></input>"
							+"<input type='button' id='cancelButton' value ='Cancel' style='height:50px;width:90px;font-size:20px;position:relative;'></input></div>")

							$("#cancelButton").click(function(){
								_thisMod.close();
							})

							$("#excelButton").click(function(e) {
								_thisMod.close();
								var clonedTable = $('#downloadToExcel').clone();
								clonedTable.find('.hide').remove();
								clonedTable.find(".rupeeSymbol").html("Rs.");

								var path = 'data:application/vnd.ms-excel,' + encodeURIComponent(clonedTable.html());

//								var path = 'data:application/vnd.ms-excel,' + encodeURIComponent($('#downloadToExcel').html());
								window.open(path);

								e.preventDefault();
							});
							
							$('#laserPrintButton').on('click', function () {  
								_thisMod.close();
								setTimeout(function(){window.print();},200);
							});	 
				});
		}
	}
});