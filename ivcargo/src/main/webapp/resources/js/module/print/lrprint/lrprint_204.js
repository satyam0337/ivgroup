define([],function() {
    return ({
        renderElements : function(){
            _this = this;
		},printWindow : function(isPdfExportAllow){
			if(!isPdfExportAllow){
				hideLayer();
				setTimeout(function(){ window.print();window.close();
				},500);
			}
		}, showPopUp : function(responseOut, isPdfExportAllow) {
			hideLayer();
			var _this = this;
			var chargeTypeModelArr = responseOut.chargeTypeModelArr;
				
			
					$('#popUpForPrintType204').bPopup({
					}, function() {
						var _thisMod = this;
						
					    $('#newDotMatrix, #lazerPrint').hide();
						var popupHtml = "<div class='confirm' style='height:190px;width:250px; padding:5px'>"
									    +"<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Type Option</b><div><br/>"
									    +"<div style='margin-left:5px; text-align:left;color:black;font-size:17px;'>"
									    + "<input type='radio' name='printType' value='old' id='oldPrint'checked  />&nbsp;<b style='font-size:14px;'>Print Old Dot Matrix</b></div>"
									    +"<div style='margin-left:5px; text-align:left;color:black;font-size:17px;'>"
									    + "<input type='radio' name='printType' value='new' id='newPrint' />&nbsp;<b style='font-size:14px;'>Print New Dot Matrix</b></div>"
									    +"<div style='margin-left:5px; margin-bottom:10px; text-align:left;color:black;font-size:17px;'>"
									    + "<input type='radio' name='printType' value='lazer' id='lazerPrint' />&nbsp;<b style='font-size:14px;'>Print lazer</b></div>";
									
									if (responseOut.wayBillTypeId == WAYBILL_TYPE_CREDIT) {
									    popupHtml += "<div style='margin-left:5px;margin-bottom:5px; text-align:left;color:black;font-size:17px;'>"
									               + "<input type='checkbox' id='setAmount' />&nbsp;<b style='font-size:14px;'>Print Charges</b></div>";
									}
									
									popupHtml += "<button id='cancel'>Cancel</button>"
									           + "<button autofocus id='printCharges'>Print</button></center></div>";
									
									$(this).html(popupHtml);


		 		 	const savedOption = getCookie('printType');
	                if (savedOption) {
	                    $(`input[name="printType"][value="${savedOption}"]`).prop('checked', true);
	                   	showHidefunction(savedOption)

	                }
                
					$('input[name="printType"]').change(function() {
					    var selectedValue = $(this).val(); 
					    showHidefunction(selectedValue)
					    
					});
					
					
						$("#cancel").click(function(){
							_thisMod.close();
							_this.printWindow();
						});
					
						$("#printCharges").click(function(){
							if (responseOut.wayBillTypeId == WAYBILL_TYPE_CREDIT) {
								
								if ( $("#setAmount").is(":checked") ) {
									_thisMod.close();
									  _this.printWindow();
								}else if ( $("#setAmount").not(":checked") ) {
		                                 _this.setZeroAmount(chargeTypeModelArr);
										_thisMod.close();
									_this.printWindow();
								}
							  }else{
								_thisMod.close();
								_this.printWindow();
							}
						})
						
						$('input[name="printType"]').change(function() {
		                    const selectedValue = $(this).val();
		                    setCookie('printType', selectedValue, 365); 
		                });
		                
	                   function setCookie(name, value, days) {
					        const date = new Date();
					        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
					        const expires = "expires=" + date.toUTCString();
					        document.cookie = name + "=" + value + ";" + expires + ";path=/";
					   }
					   
					    function getCookie(name) {
					        const cookieName = name + "=";
					        const decodedCookie = decodeURIComponent(document.cookie);
					        const cookieArray = decodedCookie.split(';');
					        for (let i = 0; i < cookieArray.length; i++) {
					            let cookie = cookieArray[i];
					            while (cookie.charAt(0) === ' ') {
					                cookie = cookie.substring(1);
					            }
					            if (cookie.indexOf(cookieName) === 0) {
					                return cookie.substring(cookieName.length, cookie.length);
					            }
					        }
					        return ""; 

					    }
					    function showHidefunction (selectedValue){
							if (selectedValue === 'old') {
					        $('#oldDotMatrix').show();
					        $('#newDotMatrix').hide();
					        $('#lazerPrint').hide();
					    } else if (selectedValue === 'new') {
					        $('#newDotMatrix').show();
					        $('#oldDotMatrix').hide();
					        $('#lazerPrint').hide();
					    } else if (selectedValue === 'lazer') {
					        $('#lazerPrint').show();
							$('#newDotMatrix').hide();
					        $('#oldDotMatrix').hide();
					    }
						}
					    
					});
				
				
		},setZeroAmount: function(chargeTypeModelArr) {
				for (var index in chargeTypeModelArr) {
					$("*[data-consignor-selector='chargeValue" + chargeTypeModelArr[index].chargeTypeMasterId + "']").html('0');
					$("*[data-selector='chargeValue" + chargeTypeModelArr[index].chargeTypeMasterId + "']").html('0');
					$("*[data-consignorLrCharges='chargeValue" + chargeTypeModelArr[index].chargeTypeMasterId + "']").html('0');
				}

				$("*[data-lr='grandTotal']").html('0');
				$("*[data-lr='bookingServicetax']").html('0');
				$("*[data-lr='bookingReceived']").html('0');
				$("*[data-lr='bookingBalance']").html('0');
				$("*[data-lr='chargeSum']").html('0');
				$("*[data-lr='advanceAmount']").html('0');
				$("*[data-consignorLrCharges='chargeSum']").html('0');
				$("*[data-consignorLrCharges='grandTotal']").html('0');
				$("*[data-lr='grandTotalInWord']").html("Zero");
				$("*[data-gst='sgst']").html('0');
				$("*[data-gst='cgst']").html('0');
				$("*[data-gst='igst']").html('0');
				$("*[data-gst='consignorsgst']").html('0');
				$("*[data-gst='consignorcgst']").html('0');
				$("*[data-gst='consignorigst']").html('0');
				$("*[data-gst='consigneeigst']").html('0');
				$("*[data-gst='transporterigst']").html('0');
			}
	});
});	