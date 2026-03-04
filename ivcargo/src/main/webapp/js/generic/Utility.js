
/*
 * pass date object with identifier and get normal for view
 */
function date(dateObject,identifier) {
	var d = new Date(dateObject);

	if(d == 'Invalid Date' || d == 'NaN') {
		var t = dateObject.split(/[- :]/);
		d = new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5]);
	}

	var day = d.getDate();
	var month = d.getMonth() + 1;
	var year = d.getFullYear();
	if (day < 10) {
		day = "0" + day;
	}
	if (month < 10) {
		month = "0" + month;
	}
	var date = day + identifier + month + identifier + year;

	return date;
}

/*
 * show erros
 */
function showErrors(errorEl,msg) {
	var ele = document.getElementById(errorEl);
	ele.innerHTML		= msg;
	ele.style.color		= 'red';
}

/*
 * validate input elements with different cases 
 */
function validateInput(filter, elementID, errorElementId, errorId, errorMsg) {
	var element = document.getElementById(elementID);

	if(!element) {
		console.log('Element not found');
		return true;
	}

	switch (Number(filter)) {
	case 1:
		if (element.value == '' || element.value == 0 || element.value < 0) {
			showMessage('error', errorMsg);
			changeError1(errorElementId, '0', '0');
			element.focus();
			isValidationError=true;
			
			return false;
		} else {
			hideAllMessages();
			removeError(errorElementId);
		}
		break;

	case 2:
		var reg = /^[6789]\d{9}$/ig;
		var reg1 = /(\d)\1{9}/g;
		if(element.value.length == 10 ) {
			if( !element.value.match(reg)) {
				showMessage('error', errorMsg);
				changeError1(errorElementId, '0', '0');
				element.focus();
				return false;
			} else if(reg1.test(element.value)){
				showMessage('error', errorMsg);
				changeError1(errorElementId, '0', '0');
				element.focus();
				return false;
			} else {
				hideAllMessages();
				removeError(errorElementId);
			}
		}
		break;

	case 3:
		if (element.value == '' || element.value == -1) {
			showMessage('error', errorMsg);
			changeError1(errorElementId, '0', '0');
			element.focus();
			return false;
		} else {
			hideAllMessages();
			removeError(errorElementId);
		}
		break;

	case 4:
		if (element.value != '' && element.value != null && element.value.length != 11) {
			showMessage('info', errorMsg);
			changeError1(errorElementId, '0', '0');
			element.focus();
			isValidationError = true;
			return false;
		} else {
			hideAllMessages();
			removeError(errorElementId);
		}
		break;
		
	case 5:
		if (element.value != '' && element.value != null && element.value.length != 10) {
			showMessage('info', errorMsg);
			changeError1(errorElementId, '0', '0');
			element.focus();
			isValidationError = true;
			return false;
		} else {
			hideAllMessages();
			removeError(errorElementId);
		}
		break;
		
	case 6:
		if (element.value < 0) {
			showMessage('error', errorMsg);
			changeError1(errorElementId, '0', '0');
			element.focus();
			return false;
		} else {
			hideAllMessages();
			removeError(errorElementId);
		}
		break;
		
	case 7:		//filter to validate for phone number
		if(element.value.length > 5 && element.value.length <= 11 || element.value.length == 10 || element.value.length == 0 ) {
			toogleElement('error', 'none');
			removeError(errorElementId);
			return true;
		} else {
			if(element.value !='0000000000') {
				showMessage('error', errorMsg);
				toogleElement('error', 'block');
				changeError1(errorElementId, '0', '0');
				return false;
			}
		}
		break;

	default:
		break;
	}

	return true;
}

function isValidEmailId(id) {
	var email = document.getElementById(id).value;
	
	if(email.length <= 0) {
		return true;
	}

	var splitted = email.match("^(.+)@(.+)$");
	if(splitted == null) {
		return false;
	}
	if(splitted[1] != null ){
		var regexp_user=/^\"?[\w-_\.]*\"?$/;
		if(splitted[1].match(regexp_user) == null)
			return false;
	}
	if(splitted[2] != null){
		var regexp_domain=/^[\w-\.]*\.[A-Za-z]{2,4}$/;
		if(splitted[2].match(regexp_domain) == null){
			var regexp_ip =/^\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\]$/;
			if(splitted[2].match(regexp_ip) == null)
				return false;
		}
		return true;
	}
	return false;
}


function LTrim(value) {
	var re = /\s*((\S+\s*)*)/;
	return value.replace(re, "$1");
}

function RTrim(value) {
	var re = /((\s*\S+)*)\s*/;
	return value.replace(re, "$1");
}

function trim(value) {
	return LTrim(RTrim(value));
}

//get key perss code. works in chrome in firefox
function getKeyCode(event) {
	return event.which || event.keyCode;
}

//Sort HTML Select by Text
function sortDropDownListByText(selectId, filter) {

	if (filter == true) {
		var foption = $('#'+ selectId + ' option:first');
		var soptions = $('#'+ selectId + ' option:not(:first)').sort(function(a, b) {
			return a.text == b.text ? 0 : a.text < b.text ? -1 : 1;
		});
		$('#' + selectId).html(soptions).prepend(foption);
	} else if (filter == false) {
		var soptions = $('#'+ selectId + ' option').sort(function(a, b) {
			return a.text == b.text ? 0 : a.text < b.text ? -1 : 1;
		});
		$('#' + selectId).html(soptions);
	}
}

//set Logout method if server returns none in Jquery UI autocomplete
//if you are using autocomplete always return black response 
//other wise system will think user is not in session.
function setLogoutIfEmpty(ui) {
	if(ui.content) {
		if(ui.content.length < 1) {
			ui.content.push (
					{
						"label": "You are logged out, Please login again !",
						"id": "0"
					}
			);
		}
	}
}

//set source in Jquery UI autocomplete. autocomplete parameter (source)
function setSourceToAutoComplete(Id, source) { // Input Value like in URL 
	if ($("#"+Id)) {
		$( "#"+Id ).autocomplete( "option", "source", source);
	}
}

function setComboBoxIndex(elementId, elementIndex) {
	$("#"+elementId).prop('selectedIndex', elementIndex);
}

//check if element is exist or not. calling type $("#abc").exists()
$.fn.exists = function () {
	return this.length !== 0;
};


$.fn.isDisabled = function () {
	if($(this).prop('disabled')){
		return true;
	}else{
		return false;
	}
};
$.fn.isReadOnly = function () {
	if($(this).prop('readonly')){
		return true;
	}else{
		return false;
	}
};
$.fn.isHidden = function () {
	if($(this).is(":hidden")){
		return true;
	}else{
		return false;
	}
};
//get fixed position of element
$.fn.fixedPosition = function () {
	var offset = this.offset();
	var $doc = $(document);
	return {
		'left': offset.left - $doc.scrollLeft(),
		'top' : offset.top - $doc.scrollTop()
	};
};

//change css classes from one to another 
$.fn.switchClass = function (addClass, removeClass) {
	$( this ).addClass(addClass);
	$( this ).removeClass(removeClass);
};

(function( $ ) {
    $.widget( "ui.combobox", {
        _create: function() {
            var self = this,
                select = this.element.hide(),
                selected = select.children( ":selected" ),
                value = selected.val() ? selected.text() : "";
            //var input = this.input = $( "<input>" )
                var input = this.input = $( "<input id='packingTypeAutoCompleter'; type ='text' placeholder='Article Type' onkeydown='validateTypeOfPackingInput(event);if(event.which == 13) {setNextPrevAfterPackingType();}' onblur='return validatePackingGroupChecking();'>" )
                .insertAfter( select )
                .val( value )
                .autocomplete({
                    delay: 0,
                    minLength: 0,
                    autoFocus: true,
                    source: function( request, response ) {
                        var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
                        if (typeof self.options.source === "string" && request.term && request.term.length > 0) {
                            $.ajax({
                                url: self.options.source,
                                data: request,
                                dataType: "json",
                                success: function(data, status) {
                                    response(data);
                                },
                                error: function() {
                                    response([]);
                                }
                            });
                        } else {
                        	response( select.children( "option" ).map(function() {
                        		var text = $( this ).text();
                        		if ( this.value && ( request.term.length <= 0) ){
                        			return {
                        				label: text.replace(
                        						new RegExp(
                        								"(?![^&;]+;)(?!<[^<>]*)(" +
                        								$.ui.autocomplete.escapeRegex(request.term) +
                        								")(?![^<>]*>)(?![^&;]+;)", "gi"
                        						), "<strong>$1</strong>" ),
                        						value: text,
                        						option: this
                        			};
                        		} else if (typeof self.options.source === "string") {
                        			$.ajax({
                        				url: self.options.source,
                        				data: request,
                        				dataType: "json",
                        				success: function(data, status) {
                        					response(data);
                        				},
                        				error: function() {
                        					response([]);
                        				}
                        			});
                        		}
                        	}) );
                        }
                    },
                    select: self.options.select,
                })
                .addClass( "width-135" );

            input.data( "ui-autocomplete" )._renderItem = function( ul, item ) {
                return $( "<li></li>" )
                    .data( "item.autocomplete", item )
                    .append( "<a>" + item.label + "</a>" )
                    .appendTo( ul );
            };

            this.button = $( "<button type='button'><i class='glyphicon glyphicon-chevron-down'></i></button>" )
                .attr( "tabIndex", -1 )
                .attr( "title", "Show All Items" )
                .insertAfter( input )
                .button({
                    icons: {
                        primary: "ui-icon-triangle-1-s"
                    },
                    text: false
                })
                .removeClass( "ui-corner-all" )
                .addClass( "btn btn-primary" )
                .click(function() {
                    // close if already visible
                    if ( input.autocomplete( "widget" ).is( ":visible" ) ) {
                        input.autocomplete( "close" );
                        return;
                    }

                    // pass empty string as value to search for, displaying all results
                    input.autocomplete( "search", "" );
                    input.focus();
                });
        },

        destroy: function() {
            this.input.remove();
            this.button.remove();
            this.element.show();
            $.Widget.prototype.destroy.call( this );
        }
    });
})( jQuery );



function validateInputWithSelectedText(elementID, selectedText, errorElementId, errorId,  errorMsg) {
	var element = document.getElementById(elementID);

	if(!element) {
		console.log('Element not found');
		return true;
	}
	
	if(element.options[element.selectedIndex].text == selectedText) {
		showMessage('error', errorMsg);
		changeError1(errorElementId,'0','0');
		element.focus();
		return false;
	} else {
		hideAllMessages();
		removeError(errorElementId);
	}
	
	return true;
}