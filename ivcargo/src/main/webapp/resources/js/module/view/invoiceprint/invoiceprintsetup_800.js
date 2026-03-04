define([], function(){	
	return {
		setPopup : function(accountGroupId, data) {
			$('#excelDownLoadForVbl').bPopup({
				}, function() {
					var _thisMod = this;
					
					$(this).html("<div id='popUpDiv' class='confirm' style='height:88px;width:200px; text-align: left;padding-top:12px; padding-left:12px;padding-bottom:50px;'>"
							+"<b style='font-size:18px; color:DodgerBlue;'>Print Option</b><br/><br/>"
							+"<input type='button' id='laserPrintButton' value ='Print' style='height:50px;width:90px;font-size:20px;position:relative;'></input>"
							+"<input type='button' id='excelButton' value ='Excel' style='height:50px;width:90px;font-size:20px;position:relative;'></input>"
							+"<input type='button' id='cancelButton' value ='Cancel' style='height:50px;width:90px;font-size:20px;position:relative;'></input></div>")

							$("#cancelButton").click(function(){
								_thisMod.close();
								setTimeout(function(){window.print();},200);
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
							
							$("#laserPrintButton").click(function(e) {
								_thisMod.close();
								setTimeout(function(){window.print();},200);
								})
							
					(function () {	
						$('#pdfButton').on('click', function () {  
							$('body').scrollTop(0);	 
							saveImageToPdf('downloadToExcel');
						});	 
					   
						function saveImageToPdf(idOfHtmlElement) {
						   var fbcanvas = document.getElementById(idOfHtmlElement);
						   html2canvas($(fbcanvas), {
							   onrendered: function (canvas) {

								var width = canvas.width;
								var height = canvas.height;
								var millimeters = {};
								millimeters.width = Math.floor(width * 0.264583);
								millimeters.height = Math.floor(height * 0.264583);

								var imgData = canvas.toDataURL('image/png');
								var doc = new jsPDF("p", "mm", "a4");
								doc.deletePage(1);
								doc.addPage(millimeters.width, millimeters.height);
								doc.addImage(imgData, 'PNG', 0, 0);
								doc.save('InvoicePrint.pdf');
							  }
							});
						}
					}());  
				});
		}
	}
});