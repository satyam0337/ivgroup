/**
 * @author Anant Chauhary	21-07-2016
 * 
 * Please add this file to create print button in that page where print is required
 */

function printTable(data, divId, titleId, titleName, printButtonDivId) {
	var configuration				= data.configuration;
	var printHeaderModel			= data.PrintHeaderModel;
	var accountGroupName			= printHeaderModel.accountGroupName;
	var branchAddress				= printHeaderModel.branchAddress;
	var branchPhoneNumber			= printHeaderModel.branchPhoneNumber;
	var isExcelButtonDisplay		= configuration.isExcelButtonDisplay;
	var isLaserPrintAllow			= configuration.isLaserPrintAllow;
	var isPlainPrintAllow			= configuration.isPlainPrintAllow;
	var printJsonObject				= new Object();
	var plainPrintJsonObject		= new Object();
	var excelDownLoadLink			= null;
	var fileName					= null;
	var onclickFun 					= null;
	var parentEle					= null;
	
	var tableRow		= createRowInTable('', '', '');
	
	var laserPrintCol	= createColumnInRow(tableRow, '', '', '', '', '', '');
	var plainPrintCol	= createColumnInRow(tableRow, '', '', '', '', '', '');
	var excelButtonCol	= createColumnInRow(tableRow, '', '', '', '', '', '');
	
	printJsonObject.type		= 'button';
	printJsonObject.id			= '';
	printJsonObject.class		= 'btn_print laserPrint';
	printJsonObject.style		= 'width: 90px;';
	printJsonObject.name		= '';
	printJsonObject.value		= 'Laser Print';
	printJsonObject.onclick		= 'printLaserData(escape("' + accountGroupName + '"),escape("' + branchAddress + '"),"' + branchPhoneNumber + '", "' + titleName + '")';

	plainPrintJsonObject.type		= 'button';
	plainPrintJsonObject.id			= '';
	plainPrintJsonObject.class		= 'btn_print plainPrint';
	plainPrintJsonObject.style		= 'width: 90px;';
	plainPrintJsonObject.name		= '';
	plainPrintJsonObject.value		= 'Plain Print';
	plainPrintJsonObject.onclick	= 'printPlainData(escape("' + accountGroupName + '"),escape("' + branchAddress + '"),"' + branchPhoneNumber + '", "' + titleName + '")';

	if(isLaserPrintAllow == 'true') {
		createInput(laserPrintCol, printJsonObject);
	}
	
	if(isPlainPrintAllow == 'true') {
		createInput(plainPrintCol, plainPrintJsonObject);
	}
	
	if(isExcelButtonDisplay == 'true') {
		
		fileName	= 'From_Region:_' + data.selectedRegion + '_From_Branch:_' + data.selectedSubRegion + '_From_Branch:_' + data.selectedBranch + '_From:_' + data.fromDate + '_To:_' + data.toDate + '';
		onclickFun 	= 'downloadToExcel(this, "' + divId + '", "' + titleId + '", "' + fileName+'")';
	
		excelDownLoadLink		= "<a href='#' id='excelDownLoadLink' class='excelButton' onclick='"+onclickFun+"'>"+"Download Excel"+'</a>';

		appendValueInTableCol(excelButtonCol, excelDownLoadLink);
	}
	
	appendRowInTable(printButtonDivId, tableRow);
}

function printPlainData(accountGroupName, branchAddress, branchPhoneNo, detailHeader) {
	childwin = window.open ('jsp/printData.jsp?accountGroupName=' + accountGroupName + '&branchAddress=' + branchAddress + '&branchPhoneNo=' + branchPhoneNo + '&detailHeader=' + detailHeader , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(plainData, 1000);
}

function printLaserData(accountGroupName, branchAddress, branchPhoneNo, detailHeader){
	childwin = window.open ('jsp/print.jsp?accountGroupName=' + accountGroupName + '&branchAddress=' + branchAddress + '&branchPhoneNo=' + branchPhoneNo + '&detailHeader=' + detailHeader , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(afterDelayLaser, 1000);
}

function plainData(){
	childwin.window.setTimeout(function() { 
		waitForPlainDelay();
	}, 4000);
}

function afterDelayLaser() {
	var reportdata =  getValueFromHtmlTag('reportData');
	childwin.window.setTimeout(function() { 
		childwin.document.getElementById('data').innerHTML	= reportdata;
		hideLayer();
		childwin.print();
	}, 4000);
}

function waitForPlainDelay() {
	var dataTableId = 'trafficSearchDetails';
	var wbNoSize = 8;
	var remarkSize = 8;
	var nameSize = 10;
	var srcDestSize = 6;
	childwin.document.getElementById('data').innerHTML	= document.getElementById('trafficSearchDetails').innerHTML;
	$('#data',childwin.document).removeClass().attr({'align': 'left'});
	//Replace Style Classes
	$('table',childwin.document).removeClass().removeAttr('style').css({'border':'0px'});
	$('#printHeader',childwin.document).css('width','100%');
	$('#printTimeTbl',childwin.document).css('width','100%');
	$('#'+dataTableId,childwin.document).css('width','100%');
	$('td',childwin.document).removeClass().addClass('datatd_plain_text');
	$('#groupName',childwin.document).removeClass().addClass('datatd_plain_text').css({"font-weight":"bold","font-size":"22px",'letter-spacing': '5px', 'text-align': 'center'});
	$("td:contains('Summary')",childwin.document).css({"font-weight":"bold","font-size":"15px",'letter-spacing': '5px'});
	$('th',childwin.document).removeClass().addClass('datatd_plain_text').css("font-weight", "bold");
	$('#'+dataTableId+' tr',childwin.document).each(function(){
		
		//Format the Dest column
	    var src = $(this).find("td").eq(1).text().trim();
	    	if(src.length > srcDestSize)$(this).find("td").eq(1).text(src.substring(0,srcDestSize));
	});
	
	childwin.print();
}