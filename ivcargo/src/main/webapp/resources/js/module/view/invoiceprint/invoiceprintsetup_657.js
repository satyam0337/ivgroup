define([], function(){	
	return {
		setPopup : function(accountGroupId, data) {
			$('#popUpContent_' + accountGroupId).bPopup({
            }, function() {
                var _thisMod = this;
                $(this).html("<div class='confirm' style='font-size:18px;height:180px;text-align:center;width:400px;color:DodgerBlue;>"
                    + "<b style='font-size:25px;padding-top:20px;'>HSN/SAC Code Option</b><br></br>"
                    + "<input type='radio' id='oldSacCode'  checked='checked' name='radio1'/> <b style='font-size:16px;width:200px'>996511</b>&emsp;&emsp;"
                    + "<input type='radio' id='SacCodeRad'  name='radio1'/>"
                    + "<input type='text' id='inputSacCode'  name='enter' maxlength='10'  />"
                    + "<button class='' id='cancel'>Cancel</button>"
                    + "<button class='' id='ok'>Ok</button></center></div>")
                    
                	$('input[id="oldSacCode"]').click(function() {
                        if ($("#oldSacCode").prop("checked", true)) {
                            $(".hsnSacCode").html('996511');
                        }
                    });

                    $('input[id="SacCodeRad"]').click(function() {
                        if ($(this).prop('checked')) {
                            $(".hsnSacCode").html($('#inputSacCode').val());
                        }
                    });
                    
           		 	$("#ok").click(function() {
                		if ($("#SacCodeRad").prop('checked')) {
                            if($('#inputSacCode').val() != '')
                                $(".hsnSacCode").html($('#inputSacCode').val());
                            else{
                                $('#oldSacCode').prop("checked", true);
                                $(".hsnSacCode").html('996511');
                            }
                        }
               		 _thisMod.close();
                	setTimeout(function(){window.print();},200);
            	});

            	$("#cancel").click(function() {
                	if ($("#SacCodeRad").prop('checked')) {
                    	if($('#inputSacCode').val() != '')
                             $(".hsnSacCode").html($('#inputSacCode').val());
                        else {
                             $('#oldSacCode').prop("checked", true);
                             $(".hsnSacCode").html('12121');
                        }
                	}
                	_thisMod.close();
                	setTimeout(function(){window.print();},200);
            	});
  			});
		}
	}
});