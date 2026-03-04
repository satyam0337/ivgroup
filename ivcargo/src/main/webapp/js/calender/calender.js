function initCalenderValidation(isDefault){	
	var configCalenderObject;
	if(isDefault=='true'){filter ="ToDateAfterOneMonth";
	}else{filter="Default";}	
	configCalenderObject={filter:filter};
	initCalender(configCalenderObject);
	
}

function initCalender(configCalenderObject){
	configCalenderObject.filter=configCalenderObject.filter||"Default";
	var altCommands = $.extend(true, {}, $.datepick.commands);
	altCommands.prevJump.keystroke = {keyCode: 33, altKey: true}; // Alt+PageUp
	altCommands.nextJump.keystroke = {keyCode: 34, altKey: true}; // Alt+PageDown
	altCommands.nextWeek.keystroke = {keyCode:40, altKey: false}; // left
	altCommands.nextDay.keystroke = {keyCode: 39, altKey: false}; // up
	altCommands.prevDay.keystroke = {keyCode: 37, altKey: false}; // right
	altCommands.prevWeek.keystroke = {keyCode: 38, altKey: false}; // down
	altCommands.prev.keystroke = {keyCode: 33, altKey: false}; // Alt+up
	altCommands.next.keystroke = {keyCode: 34, altKey: false}; // Alt+down
	var currentDate=curSystemDate;
	$(function() {
		$('.fromDate').datepick({
			today:configCalenderObject.today||currentDate,
			defaultDate:configCalenderObject.defaultDate||null,
			selectDefaultDate: configCalenderObject.selectDefaultDate||true,
			showAnim: configCalenderObject.showAnim||'',
			firstDay: configCalenderObject.firstDay||0,
			dateFormat: configCalenderObject.dateFormat||'dd-mm-yyyy',
			yearRange: configCalenderObject.yearRange||'1947:2100',
			onSelect:showDate,
			minDate:configCalenderObject.minDate||'01-01-2014',
			maxDate:configCalenderObject.maxDate||currentDate,
			commands: altCommands,
			showTrigger:configCalenderObject.showTrigger||'#calimg',
			prevText: configCalenderObject.prevText||'< M',
			todayText: configCalenderObject.todayText||'d M,y',
			nextText:configCalenderObject.nextText|| 'M >',
	    	commandsAsDateFormat: true,
			pickerClass: configCalenderObject.pickerClass||'datepick-jumps',
	    	renderer: $.extend({}, $.datepick.defaultRenderer,
	        		{picker: $.datepick.defaultRenderer.picker.
	            	replace(/\{link:prev\}/, '{link:prevJump}{link:prev}').
	            	replace(/\{link:next\}/, '{link:nextJump}{link:next}')})
		});
		showDate();//remove this line if donot want toDate With respect to FromDate
		});

	function showDate(){
		$('.toDate').datepick('destroy');
		var currentDate=curSystemDate;
		var fromDate=new Date($('.fromDate').datepick('getDate')[0].getTime());
		var toDate=new Date($('.fromDate').datepick('getDate')[0].getTime());
		var date=new Date($('.fromDate').datepick('getDate')[0].getTime());
		$.datepick.add(date	,configCalenderObject.numberOfDaysMonthYear||1,configCalenderObject.typeOfNumberOfDaysMonthYear||'m');//calculate date 1 month Range
		if(configCalenderObject.filter=='ToDateAfterOneMonth'){
			$.datepick.add(toDate	,configCalenderObject.numberOfDaysMonthYear||1,configCalenderObject.typeOfNumberOfDaysMonthYear||'m');//calculate date 1 month Range
			toDate.setDate(1,toDate.getMonth(),toDate.getFullYear());
			$.datepick.add(toDate	,-1,'d');//calculate date 1 month Range
			$.datepick.add(date	,-1,'d');//calculate date 1 month Range
		}
		if(date>=configCalenderObject.maxDate){date=configCalenderObject.maxDate;}
		else if(date>=currentDate){date=currentDate;}
		$('.toDate').datepick({
			today:configCalenderObject.today||currentDate,
			showAnim: configCalenderObject.showAnim||'',
			firstDay: configCalenderObject.firstDay||0,
			dateFormat:configCalenderObject.dateFormat||'dd-mm-yyyy',
			commands: altCommands,
			defaultDate:$('.fromDate').val(),
			selectDefaultDate: configCalenderObject.selectDefaultDate||true,
			minDate:$('.fromDate').val(),
			maxDate:date,
			showTrigger:configCalenderObject.showTrigger||'#calimg',
			pickerClass: configCalenderObject.pickerClass||'datepick-jumps',
			prevText: configCalenderObject.prevText||'< M',
			todayText: configCalenderObject.todayText||'d M,y',
			nextText: configCalenderObject.nextText|| 'M >',
		    commandsAsDateFormat: configCalenderObject.commandsAsDateFormat||true,
		    renderer: $.extend({}, $.datepick.defaultRenderer,
		        	{picker: $.datepick.defaultRenderer.picker.
		            replace(/\{link:prev\}/, '{link:prevJump}{link:prev}').
		            replace(/\{link:next\}/, '{link:nextJump}{link:next}')})
		});

		if(configCalenderObject.filter=='ToDateAfterOneMonth'){
			if(currentDate.getMonth()==fromDate.getMonth()&& currentDate.getFullYear()==fromDate.getFullYear()){
				$('.toDate').val($.datepick.formatDate(configCalenderObject.dateFormat||'dd-mm-yyyy',currentDate));
			}else{
				$('.toDate').val($.datepick.formatDate(configCalenderObject.dateFormat||'dd-mm-yyyy',toDate));
			}
		}else{
			$('.toDate').val($.datepick.formatDate(configCalenderObject.dateFormat||'dd-mm-yyyy',fromDate));
		}
	}
}