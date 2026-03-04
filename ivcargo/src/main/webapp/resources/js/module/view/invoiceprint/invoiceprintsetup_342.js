define([], function(){	
	return {
		setPopup : function(accountGroupId, data) {
			$('#invoicePopUpContent_' + accountGroupId).bPopup({
            }, function() {
				var _thisMod = this;
				var  dotMatrix		    = false;
				$(".gstInvoicePrintTable").hide();
				
				$(this).html("<div class='confirm' style='font-size:18px;height:300px;width:450px;text-align: center;color:DodgerBlue;>"
						+ "<b style='margin-top:10px;'>Print Option</b><br/><br/>"	
						+ "<input type='radio' id='consignorName' checked='checked' name='radio'/>&nbsp;<b style='font-size:14px;'>Print ConsigneeName</b><br/><br/>"
						+ "<input type='radio' id='consigneeName' name='radio' />&nbsp;<b style='font-size:14px;'>Print ConsignorName</b><br/><br/>"
						+ "<button style='width: 150px;' id='dotmatrix'>Laser Print</button> <button style='width: 150px;' id='Laser'>DotMatrix Print</button> <button style='width: 150px; margin-left: -77px; border-top: 1px solid #B4B4B4; border-right: 1px solid #B4B4B4;' id='gstInvoicePrint'>GST Invoice Print</button></div>")

					$("#Laser").click(function() {
							$(".gstInvoicePrintTable").hide();
							_thisMod.close();
							setTimeout(function(){window.print();},200);
						});
				
				$("#dotmatrix").click(function() {
					if(!dotMatrix) {
						$(".gstInvoicePrintTable").hide();
						$(".div1").removeClass("letterspacing");	
						$(".header1").removeClass("letterspacing");
						$(".table1").removeClass("letterspacing");	
						$(".table2").removeClass("letterspacing");	
					}
					_thisMod.close();
					setTimeout(function(){window.print();},200);
				});
				$("#gstInvoicePrint").click(function() {
					$(".gstInvoicePrintTable").show();
					$(".hideOtherContaint").hide();
					$(".table1").removeClass("letterspacing");
					var border = document.getElementById("border");

					border.style.borderTop = "2px solid black";
					border.style.borderLeft = "2px solid black";
					border.style.borderRight = "2px solid black";
					border.style.borderBottom = "2px solid black";
					
					if(data.totalCollection == 0)
						$(".totalCollection").hide();
					if(data.totalAoc == 0)
						$(".totalAoc").hide();
					if(data.totalDD == 0)
						$(".totalDD").hide();
					if(data.totalhamali == 0)
						$(".totalhamali").hide();
					if(data.totallrCharge == 0)
						$(".totallrCharge").hide();
					
					_thisMod.close();
					setTimeout(function(){window.print();},200);
				});
				
				$(document).ready(function() {
					
					if($("#consignorName").prop("checked")) {
						$(".consignor").addClass('hideCustome');
						$(".lrConsignorName").addClass('hideCustome');
						$(".consignorTH").addClass('hideCustome');
						
						$(".consignee").removeClass('hideCustome');
						$(".lrConsigneeName").removeClass('hideCustome');
						$(".consigneeTH").removeClass('hideCustome');
					}
				$('input[id="consignorName"]'). click(function() {
						$(".consignor").addClass('hideCustome');
						$(".lrConsignorName").addClass('hideCustome');
						$(".consignorTH").addClass('hideCustome');
						
						$(".consignee").removeClass('hideCustome');
						$(".lrConsigneeName").removeClass('hideCustome');
						$(".consigneeTH").removeClass('hideCustome');
				});
				$('input[id="consigneeName"]'). click(function() {
					
						$(".consignee").addClass('hideCustome');
						$(".lrConsigneeName").addClass('hideCustome');
						$(".consigneeTH").addClass('hideCustome');
						
						$(".consignor").removeClass('hideCustome');
						$(".lrConsignorName").removeClass('hideCustome');
						$(".consignorTH").removeClass('hideCustome');
					});
				});
			});
		}
	}
});