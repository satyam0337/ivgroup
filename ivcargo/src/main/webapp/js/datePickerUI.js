var currentSystemDate	=	new Date();
var	fromDate			= "fromDate";
var toDate				= "toDate";
var	minTimeStamp		= null;

$(function () {
	
	if(typeof minDateTimeStamp != undefined && typeof minDateTimeStamp != "undefined" && minDateTimeStamp != null) {
		minTimeStamp	=  new Date(minDateTimeStamp);
	}else {
		minTimeStamp = new Date(2014, 4 - 1, 1);
	}
	
    $("#"+fromDate).datepicker({
    	showOn: "button",
	    buttonImage: "/ivcargo/images/cal.gif",
	    buttonImageOnly: true,
	    buttonText: "Select date",
        minDate: minTimeStamp,
        maxDate: currentSystemDate,
        today: currentSystemDate,
        prevText: '< M',
        nextText: 'M >',
        changeMonth: true,
        showAnim: "fold",
        dateFormat: 'dd-mm-yy',
        onSelect: function (selectedDate, instance) {
            if (selectedDate != '') {
                var date = $.datepicker.parseDate(instance.settings.dateFormat, selectedDate, instance.settings);
               
                if(typeof dateSelectionMonthRange != undefined && typeof dateSelectionMonthRange != "undefined") {
                	date.setMonth(date.getMonth() + dateSelectionMonthRange);
                } else {
                	date.setMonth(date.getMonth() + 1);
                }
               
                $("#"+toDate).datepicker("option", "minDate", selectedDate);
                
                var newDate = date.setDate(date.getDate() - 1);
                
                if(date < currentSystemDate){
                	$("#"+toDate).datepicker("option", "maxDate", new Date(newDate));
                }else{
                	$("#"+toDate).datepicker("option", "maxDate", currentSystemDate);
                }
            }
        }
    });
    
    if(typeof dateSelectionMonthRange == undefined) {
    	$("#"+fromDate).datepicker("setDate", new Date());
    }
});

$(function () {
	$('#'+toDate).datepicker('destroy');
	var currentDate = currentSystemDate;

	$("#"+toDate).datepicker({
		showOn: "button",
	    buttonImage: "/ivcargo/images/cal.gif",
	    buttonImageOnly: true,
	    buttonText: "Select date",
		today: currentDate,
        defaultDate: $('#'+fromDate).val(),
        minDate: $('#'+fromDate).val(),
        maxDate: currentDate,
        prevText: '< M',
        nextText: 'M >',
        changeMonth: false,
        showAnim: "fold",
        dateFormat: 'dd-mm-yy',
        onClose: function (selectedDate) {
        }
    });
	
	if(typeof dateSelectionMonthRange == undefined) {
		$("#"+toDate).datepicker("setDate", new Date());
	}
});