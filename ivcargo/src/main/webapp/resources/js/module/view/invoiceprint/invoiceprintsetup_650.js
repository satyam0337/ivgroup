define([], function() {	
	return {
		setPopup : function(accountGroupId, data) {
			let GstValue = data.billDataForEMail.IGSTtaxPecentage;
			if(GstValue == undefined){
				$(".withoutGstPrint").html('&nbsp;');
				$(".invoiceLable").html('INVOICE');
				$('.companyLogo').attr('src','')
				formatFirst()
				return;
			}
			$('#popUpContent_' + accountGroupId).bPopup({
			}, function() {
				var _thisMod = this;
				$(this).html("<div class='confirm' style='font-size:18px;height:180px;text-align:center;width:300px;color:DodgerBlue;>"
					+ "<b style='font-size:18px;>Print Option</b><br></br>"
					+ "<input type='radio' id='Format-1' checked='checked' name='radio3'/>&nbsp;<b style='font-size:16px;'>Format-1</b>&emsp;&emsp;"
					+ "<input type='radio' id='Format-2'  name='radio3' />&nbsp;<b style='font-size:16px;'>Format-2</b><br>"
					+ "<input type='radio' id='Format-3' name='radio3'/>&nbsp;<b style='font-size:16px;'>Format-3</b>&emsp;&emsp;"
					+ "<input type='radio' id='Format-4'  name='radio3' />&nbsp;<b style='font-size:16px;'>Format-4</b><br>"
					+ "<input type='radio' id='Format-5' name='radio3'/>&nbsp;<b style='font-size:16px;'>Format-5</b>&emsp;&emsp;"
					+ "<button class='' id='cancel'>Cancel</button>"
					+ "<button class='' id='ok'>Ok</button></center></div>")
				
						$(".perPack").hide();
						$(".weight").hide();
						$(".builtyCharge").hide();
						$(".laborCharge").hide();
						$(".freight").hide();
						$(".ratePerPiece").hide();
						$(".perPcsRate").hide();
						$(".slplOtherF3").hide();
				
				$('input[id="Format-1"]').click(function() {
					if ($("#Format-1").prop("checked", true)) {
						formatFirst()
					}
				});

				$('input[id="Format-2"]').click(function() {
					if ($("#Format-2").prop("checked", true)) {
						$(".invoice").hide();
						$(".weightItem").hide();
						$(".extraCharge").show();
						$(".weight").hide();
						$(".builtyCharge").hide();
						$(".laborCharge").hide();
						$(".freight").hide();
						$(".ratePerPiece").show();
						$(".perPcsRate").show();
						$(".amount").show();
						$(".item").hide();
						$(".bankDetails").show();
						$(".consignor").show();
						$(".from").show();
						$(".slplOtherF3").hide();
						$(".slplOtherF1").show();
					}
				});
				
				$('input[id="Format-3"]').click(function() {
					if ($("#Format-3").prop("checked", true)) {
						$(".invoice").hide();
						$(".weightItem").hide();
						$(".extraCharge").hide();
						$(".weight").hide();
						$(".builtyCharge").show();
						$(".laborCharge").show();
						$(".freight").show();
						$(".ratePerPiece").show();
						$(".perPcsRate").hide();
						$(".amount").hide();
						$(".consignor").hide();
						$(".from").hide();
						$(".item").hide();
						$(".bankDetails").show();
						$(".slplOtherF3").show();
						$(".slplOtherF1").hide();
					}
				});
				
				$('input[id="Format-4"]').click(function() {
					if ($("#Format-4").prop("checked", true)) {
						$(".invoice").hide();
						$(".weightItem").hide();
						$(".extraCharge").show();
						$(".weight").show();
						$(".builtyCharge").hide();
						$(".laborCharge").hide();
						$(".freight").show();
						$(".ratePerPiece").hide();
						$(".perPcsRate").show();
						$(".amount").hide();
						$(".item").hide();
						$(".bankDetails").show();
						$(".slplOtherF3").hide();
						$(".slplOtherF1").show();
					}
				});
				
				$('input[id="Format-5"]').click(function() {
					if ($("#Format-5").prop("checked", true)) {
						$(".bankDetails").hide();
						$(".invoice").hide();
						$(".weightItem").hide();
						$(".extraCharge").show();
						$(".weight").show();
						$(".builtyCharge").hide();
						$(".laborCharge").hide();
						$(".freight").show();
						$(".ratePerPiece").show();
						$(".perPcsRate").show();
						$(".amount").hide();
						$(".item").hide();
						$(".slplOtherF3").hide();
						$(".slplOtherF1").show();
					}
				});
					
				$("#ok").click(function() {
					_thisMod.close();
					setTimeout(function(){window.print();},200);
				});
	
				$("#cancel").click(function() {
					_thisMod.close();
					/*setTimeout(function(){window.print();},200);*/
				});
			});
			
			function formatFirst(){
				$(".perPack").hide();
				$(".weight").hide();
				$(".builtyCharge").hide();
				$(".laborCharge").hide();
				$(".freight").hide();
				$(".ratePerPiece").hide();
				$(".perPcsRate").hide();
				$(".item").show();
				$(".consignor").show();
				$(".from").show();
				$(".amount").show();
				$(".extraCharge").show();
				$(".weightItem").show();
				$(".invoice").show();
				$(".bankDetails").show();
				$(".slplOtherF1").show();
				$(".slplOtherF3").hide();
			}
		}
	}
});