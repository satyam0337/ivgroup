 var isDetail = false; var isSummary = false;
 
function validation(){ 
	var regionId = $("#region").val();  var subRegionId = $("#subRegion").val();  var branchId = $("#branch").val(); 
	var type = $("#type").val();  var reportType = $("#reportType").val();  if(regionId <0){ showSpecificErrors('basicError','Please Select Region !');
		toogleElement('basicError','block'); changeError1('region','0','0'); $("#region").focus();  return false; } 
	
	if(subRegionId <0){ showSpecificErrors('basicError','Please Select SubRegion !');
	toogleElement('basicError','block'); changeError1('subRegion','0','0'); $("#subRegion").focus();  return false; } 
	
	if(branchId <0){ showSpecificErrors('basicError','Please Select Branch !');
	toogleElement('basicError','block'); changeError1('branch','0','0'); $("#branch").focus();  return false; } 
	
	
	if(type <=0){ showSpecificErrors('basicError','Please Select Type !');
		toogleElement('basicError','block'); changeError1('type','0','0'); $("#type").focus();  return false; }	 if(reportType <=0){ showSpecificErrors('basicError','Please Select Report Type !'); toogleElement('basicError','block'); changeError1('reportType','0','0'); $("#reportType").focus();  return false; }	 
}

function storeSelectedValues(){ var selectedRegion = document.getElementById('region'); if(selectedRegion != null){ document.getElementById('selectedRegion').value = selectedRegion.options[selectedRegion.selectedIndex].text; }
	var selectedSubRegion = document.getElementById('subRegion'); if(selectedSubRegion != null){ document.getElementById('selectedSubRegion').value = selectedSubRegion.options[selectedSubRegion.selectedIndex].text; }
	var selectedBranch = document.getElementById('branch'); if(selectedBranch != null){ document.getElementById('selectedBranch').value = selectedBranch.options[selectedBranch.selectedIndex].text; } 
}

function printPlainData(accountGroupName , branchAddress ,branchPhoneNo ,imagePath){ detailHeader = document.getElementById('reportName').innerHTML; childwin = window.open ('jsp/printData.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader+'&imagePath='+imagePath , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(waitForPlainDelay, 500); 
}

function waitForPlainDelay() { var dataTableId = 'results'; var wbNoSize = 8; var remarkSize = 8; var nameSize = 10; var srcDestSize = 8; childwin.document.getElementById('data').innerHTML= document.getElementById('reportData').innerHTML;
	$('#data',childwin.document).removeClass().attr({'align': 'left'}); $('table',childwin.document).removeClass().removeAttr('style').css({'border':'0px'});
	$('#printHeader',childwin.document).attr({'width':'100%'}); $('#printTimeTbl',childwin.document).attr({'width':'100%'}); $('#'+dataTableId,childwin.document).css('width','100%'); $("th:contains('Collection')",childwin.document).text('Col');
	$("th:contains('Statistical')",childwin.document).text('Stcl'); $("th:contains('Form Charges')",childwin.document).text('F C'); $("th:contains('Hamali')",childwin.document).text('Hml'); $("th:contains('Door Delivery')",childwin.document).text('D.D');
	$('td',childwin.document).removeClass().addClass('datatd_plain_text'); $('#groupName',childwin.document).removeClass().addClass('datatd_plain_text').css({"font-weight":"bold","font-size":"22px",'letter-spacing': '7px', 'text-align': 'center'});
	$("td:contains('Register')",childwin.document).css({"font-weight":"bold","font-size":"15px",'letter-spacing': '5px'}); $('th',childwin.document).removeClass().addClass('datatd_plain_text').css("font-weight", "bold");
	$('#'+dataTableId+' tr',childwin.document).each(function(){  var src = $(this).find("td").eq(4).text().trim(); if(src.length > srcDestSize)$(this).find("td").eq(4).text(src.substring(0,srcDestSize)); 	var name = $(this).find("td").eq(5).text().trim();
	    	if(name.length > nameSize)$(this).find("td").eq(5).text(name.substring(0,nameSize)); var name = $(this).find("td").eq(6).text().trim(); if(name.length > nameSize)$(this).find("td").eq(6).text(name.substring(0,nameSize)); });
	var lastRow = $('#'+dataTableId+' tr:last',childwin.document)[0]; var zeroCols = new Array(); var idx = 0;
	for(var i=0;i< lastRow.cells.length;i++){ if(parseInt(lastRow.cells[i].innerHTML,10)==0){ zeroCols[idx]=i; idx++; } } var delColNo = 0;
	for(var i=0;i<zeroCols.length;i++){ var colNo = (zeroCols[i]-delColNo)+1; $('#'+dataTableId+' td:nth-child('+colNo+')',childwin.document).remove(); $('#'+dataTableId+' th:nth-child('+colNo+')',childwin.document).remove(); delColNo++; } childwin.print(); 
}

function printPlainCategoryWiseBooking(accountGroupName , branchAddress ,branchPhoneNo ,detailHeader,imagePath){
	detailHeader = document.getElementById('reportName').innerHTML; childwin = window.open ('jsp/printData.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader+'&imagePath='+imagePath , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(waitForPlainDelayForDetailAndSummary, 500);
}

function printPlainCategoryWiseBookingIncoming(accountGroupName , branchAddress ,branchPhoneNo ,detailHeader,imagePath){
	detailHeader = document.getElementById('reportName').innerHTML; childwin = window.open ('jsp/printData.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader+'&imagePath='+imagePath , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(waitForPlainDelayForDetailAndSummaryIncoming, 500); 
}

function waitForPlainDelayForDetailAndSummary() {
	var dataTableId = 'results'; var wbNoSize = 8; var remarkSize = 8; var nameSize = 10; var srcDestSize = 8;
	if(isDetail == true){ childwin.document.getElementById('data').innerHTML= document.getElementById('detailTable').innerHTML; }else if(isSummary == true){  childwin.document.getElementById('data').innerHTML= document.getElementById('detailTable1').innerHTML; }	
	$('#data',childwin.document).removeClass().attr({'align': 'left'}); $('table',childwin.document).removeClass().removeAttr('style').css({'border':'0px'});
	$('#printHeader',childwin.document).attr({'width':'100%'}); $('#printTimeTbl',childwin.document).attr({'width':'100%'}); $('#'+dataTableId,childwin.document).css('width','100%'); $("th:contains('Collection')",childwin.document).text('Col');
	$("th:contains('Statistical')",childwin.document).text('Stcl'); $("th:contains('Form Charges')",childwin.document).text('F C'); $("th:contains('Hamali')",childwin.document).text('Hml'); $("th:contains('Door Delivery')",childwin.document).text('D.D');
	$('td',childwin.document).removeClass().addClass('datatd_plain_text'); $('#groupName',childwin.document).removeClass().addClass('datatd_plain_text').css({"font-weight":"bold","font-size":"22px",'letter-spacing': '7px', 'text-align': 'center'});
	$("td:contains('Register')",childwin.document).css({"font-weight":"bold","font-size":"15px",'letter-spacing': '5px'}); $('th',childwin.document).removeClass().addClass('datatd_plain_text').css("font-weight", "bold");
	$('#'+dataTableId+' tr',childwin.document).each(function(){ var src = $(this).find("td").eq(4).text().trim(); if(src.length > srcDestSize)$(this).find("td").eq(4).text(src.substring(0,srcDestSize)); var name = $(this).find("td").eq(5).text().trim();
	    	if(name.length > nameSize)$(this).find("td").eq(5).text(name.substring(0,nameSize));  var name = $(this).find("td").eq(6).text().trim(); if(name.length > nameSize)$(this).find("td").eq(6).text(name.substring(0,nameSize)); });
	var lastRow = $('#'+dataTableId+' tr:last',childwin.document)[0]; var zeroCols = new Array(); var idx = 0; var delColNo = 0;
	for(var i=0;i<zeroCols.length;i++){ var colNo = (zeroCols[i]-delColNo)+1; $('#'+dataTableId+' td:nth-child('+colNo+')',childwin.document).remove(); $('#'+dataTableId+' th:nth-child('+colNo+')',childwin.document).remove(); delColNo++; } childwin.print(); 
}

function waitForPlainDelayForDetailAndSummaryIncoming() { var dataTableId = 'results'; var wbNoSize = 8; var remarkSize = 8; var nameSize = 10; var srcDestSize = 8;
	if(isDetail == true){ childwin.document.getElementById('data').innerHTML= document.getElementById('detailTableIncoming').innerHTML; }else if(isSummary == true){  childwin.document.getElementById('data').innerHTML= document.getElementById('detailTable1Incoming').innerHTML; }	
	$('#data',childwin.document).removeClass().attr({'align': 'left'}); $('table',childwin.document).removeClass().removeAttr('style').css({'border':'0px'});
	$('#printHeader',childwin.document).attr({'width':'100%'}); $('#printTimeTbl',childwin.document).attr({'width':'100%'}); $('#'+dataTableId,childwin.document).css('width','100%'); $("th:contains('Collection')",childwin.document).text('Col');
	$("th:contains('Statistical')",childwin.document).text('Stcl'); $("th:contains('Form Charges')",childwin.document).text('F C'); $("th:contains('Hamali')",childwin.document).text('Hml');
	$("th:contains('Door Delivery')",childwin.document).text('D.D'); $('td',childwin.document).removeClass().addClass('datatd_plain_text'); $('#groupName',childwin.document).removeClass().addClass('datatd_plain_text').css({"font-weight":"bold","font-size":"22px",'letter-spacing': '7px', 'text-align': 'center'});
	$("td:contains('Register')",childwin.document).css({"font-weight":"bold","font-size":"15px",'letter-spacing': '5px'}); $('th',childwin.document).removeClass().addClass('datatd_plain_text').css("font-weight", "bold");
	$('#'+dataTableId+' tr',childwin.document).each(function(){  var src = $(this).find("td").eq(4).text().trim(); if(src.length > srcDestSize)$(this).find("td").eq(4).text(src.substring(0,srcDestSize));
	   	var name = $(this).find("td").eq(5).text().trim(); if(name.length > nameSize)$(this).find("td").eq(5).text(name.substring(0,nameSize));  var name = $(this).find("td").eq(6).text().trim(); if(name.length > nameSize)$(this).find("td").eq(6).text(name.substring(0,nameSize)); });
	var lastRow = $('#'+dataTableId+' tr:last',childwin.document)[0]; var zeroCols = new Array(); var idx = 0; var delColNo = 0;
	for(var i=0;i<zeroCols.length;i++){ var colNo = (zeroCols[i]-delColNo)+1; $('#'+dataTableId+' td:nth-child('+colNo+')',childwin.document).remove(); $('#'+dataTableId+' th:nth-child('+colNo+')',childwin.document).remove(); delColNo++; } childwin.print(); 
}

function printPlainSubRegionWiseSummary(accountGroupName , branchAddress ,branchPhoneNo ,detailHeader,imagePath){ detailHeader = document.getElementById('reportName').innerHTML; childwin = window.open ('jsp/printData.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader+'&imagePath='+imagePath , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(waitForPlainDelayForSubRegionWiseSummary, 500); 
}

function printPlainSubRegionWiseSummaryIncoming(accountGroupName , branchAddress ,branchPhoneNo ,detailHeader,imagePath){ detailHeader = document.getElementById('reportName').innerHTML; childwin = window.open ('jsp/printData.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader+'&imagePath='+imagePath , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(waitForPlainDelayForSubRegionWiseSummaryIncoming, 500);
}

function waitForPlainDelayForSubRegionWiseSummary() {
	var dataTableId = 'results'; var wbNoSize = 8; var remarkSize = 8; var nameSize = 10; var srcDestSize = 8;
	childwin.document.getElementById('data').innerHTML= document.getElementById('subRegionSummaryTable').innerHTML; $('#data',childwin.document).removeClass().attr({'align': 'left'});
	$('table',childwin.document).removeClass().removeAttr('style').css({'border':'0px'}); $('#printHeader',childwin.document).attr({'width':'100%'}); $('#printTimeTbl',childwin.document).attr({'width':'100%'}); $('#'+dataTableId,childwin.document).css('width','100%');
	$("th:contains('Collection')",childwin.document).text('Col'); $("th:contains('Statistical')",childwin.document).text('Stcl'); $("th:contains('Form Charges')",childwin.document).text('F C'); $("th:contains('Hamali')",childwin.document).text('Hml');
	$("th:contains('Door Delivery')",childwin.document).text('D.D'); $('td',childwin.document).removeClass().addClass('datatd_plain_text'); $('#groupName',childwin.document).removeClass().addClass('datatd_plain_text').css({"font-weight":"bold","font-size":"22px",'letter-spacing': '7px', 'text-align': 'center'});
	$("td:contains('Register')",childwin.document).css({"font-weight":"bold","font-size":"15px",'letter-spacing': '5px'}); $('th',childwin.document).removeClass().addClass('datatd_plain_text').css("font-weight", "bold");
	$('#'+dataTableId+' tr',childwin.document).each(function(){ var src = $(this).find("td").eq(4).text().trim(); if(src.length > srcDestSize)$(this).find("td").eq(4).text(src.substring(0,srcDestSize)); var name = $(this).find("td").eq(5).text().trim();
	    	if(name.length > nameSize)$(this).find("td").eq(5).text(name.substring(0,nameSize));  var name = $(this).find("td").eq(6).text().trim(); if(name.length > nameSize)$(this).find("td").eq(6).text(name.substring(0,nameSize)); });
	var lastRow = $('#'+dataTableId+' tr:last',childwin.document)[0]; var zeroCols = new Array(); var idx = 0; var delColNo = 0; for(var i=0;i<zeroCols.length;i++){ var colNo = (zeroCols[i]-delColNo)+1;
		$('#'+dataTableId+' td:nth-child('+colNo+')',childwin.document).remove(); $('#'+dataTableId+' th:nth-child('+colNo+')',childwin.document).remove(); delColNo++; } childwin.print(); }

function waitForPlainDelayForSubRegionWiseSummaryIncoming() {
	var dataTableId = 'results'; var wbNoSize = 8; var remarkSize = 8; var nameSize = 10; var srcDestSize = 8; childwin.document.getElementById('data').innerHTML= document.getElementById('subRegionSummaryTableIncoming').innerHTML;
	$('#data',childwin.document).removeClass().attr({'align': 'left'}); $('table',childwin.document).removeClass().removeAttr('style').css({'border':'0px'});
	$('#printHeader',childwin.document).attr({'width':'100%'}); $('#printTimeTbl',childwin.document).attr({'width':'100%'}); $('#'+dataTableId,childwin.document).css('width','100%'); $("th:contains('Collection')",childwin.document).text('Col');
	$("th:contains('Statistical')",childwin.document).text('Stcl'); $("th:contains('Form Charges')",childwin.document).text('F C'); $("th:contains('Hamali')",childwin.document).text('Hml'); $("th:contains('Door Delivery')",childwin.document).text('D.D');
	$('td',childwin.document).removeClass().addClass('datatd_plain_text'); $('#groupName',childwin.document).removeClass().addClass('datatd_plain_text').css({"font-weight":"bold","font-size":"22px",'letter-spacing': '7px', 'text-align': 'center'});
	$("td:contains('Register')",childwin.document).css({"font-weight":"bold","font-size":"15px",'letter-spacing': '5px'}); $('th',childwin.document).removeClass().addClass('datatd_plain_text').css("font-weight", "bold");
	$('#'+dataTableId+' tr',childwin.document).each(function(){  var src = $(this).find("td").eq(4).text().trim(); if(src.length > srcDestSize)$(this).find("td").eq(4).text(src.substring(0,srcDestSize));
	   	var name = $(this).find("td").eq(5).text().trim(); if(name.length > nameSize)$(this).find("td").eq(5).text(name.substring(0,nameSize)); var name = $(this).find("td").eq(6).text().trim(); if(name.length > nameSize)$(this).find("td").eq(6).text(name.substring(0,nameSize)); });
	var lastRow = $('#'+dataTableId+' tr:last',childwin.document)[0]; var zeroCols = new Array(); var idx = 0; var delColNo = 0;
	for(var i=0;i<zeroCols.length;i++){ var colNo = (zeroCols[i]-delColNo)+1; $('#'+dataTableId+' td:nth-child('+colNo+')',childwin.document).remove(); $('#'+dataTableId+' th:nth-child('+colNo+')',childwin.document).remove(); delColNo++; } childwin.print(); 
}

function printLeserCategoryWiseBooking(accountGroupName , branchAddress ,branchPhoneNo ,detailHeader,imagePath){ detailHeader = document.getElementById('reportName').innerHTML; childwin = window.open ('jsp/print.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader+'&imagePath='+imagePath , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(setAfterDelayBooking, 1000); 
}

function printLeserCategoryWiseBookingIncoming(accountGroupName , branchAddress ,branchPhoneNo ,detailHeader,imagePath){ detailHeader = document.getElementById('reportName').innerHTML; childwin = window.open ('jsp/print.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader+'&imagePath='+imagePath , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(setAfterDelayBookingIncoming, 1000); 
}

function setAfterDelayBooking() { if(isDetail == true){ childwin.document.getElementById('data').innerHTML= document.getElementById('detailTable').innerHTML; }else if(isSummary == true){ childwin.document.getElementById('data').innerHTML= document.getElementById('detailTable1').innerHTML; }	
	childwin.print(); 
}

function setAfterDelayBookingIncoming() {
	if(isDetail == true){ childwin.document.getElementById('data').innerHTML= document.getElementById('detailTableIncoming').innerHTML; }else if(isSummary == true){ childwin.document.getElementById('data').innerHTML= document.getElementById('detailTable1Incoming').innerHTML; }	
	childwin.print(); 
}

function printLeserSubRegionWiseBooking(accountGroupName , branchAddress ,branchPhoneNo ,detailHeader,imagePath){ detailHeader = document.getElementById('reportName').innerHTML; childwin = window.open ('jsp/print.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader+'&imagePath='+imagePath , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(setAfterDelaySubRegion, 1000); 
}

function printLeserSubRegionWiseBookingIncoming(accountGroupName , branchAddress ,branchPhoneNo ,detailHeader,imagePath){ detailHeader = document.getElementById('reportName').innerHTML; childwin = window.open ('jsp/print.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader+'&imagePath='+imagePath , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(setAfterDelaySubRegionIncoming, 1000); 
}

function setAfterDelaySubRegion() { childwin.document.getElementById('data').innerHTML= document.getElementById('subRegionSummaryTable').innerHTML; childwin.print(); }

function setAfterDelaySubRegionIncoming() { childwin.document.getElementById('data').innerHTML= document.getElementById('subRegionSummaryTableIncoming').innerHTML; childwin.print(); }

function openWindowForView(id,type,branchId) {	 window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+id+'&NumberType='+type+'&BranchId='+branchId); }
