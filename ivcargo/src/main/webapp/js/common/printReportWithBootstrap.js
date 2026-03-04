/**
 * @author Anant Chauhary	23-11-2015
 * 
 * Please add this file to create print button in that page where print is required
 */

var printLogoInLaserPrint	= false;

function printTable(data, divId, titleId, titleName, printButtonDivId) {
	var accountGroupNameForPrint	= data.accountGroupNameForPrint;
	
	if(data.printLogoInLaserPrint != undefined)
		printLogoInLaserPrint		= data.printLogoInLaserPrint;
	
	var branchAddress				= data.branchAddress;
	var branchPhoneNumber			= data.branchPhoneNumber;
	var isExcelButtonDisplay		= data.isExcelButtonDisplay;
	var isLaserPrintAllow			= data.isLaserPrintAllow;
	var isPlainPrintAllow			= data.isPlainPrintAllow;
	var isPdfButtonDisplay			= data.isPdfButtonDisplay;
	var printJsonObject			= new Object();
	var plainPrintJsonObject	= new Object();
	var printPdfJsonObject		= new Object();
	var excelDownLoadLink		= null;
	var fileName				= null;
	var onclickFun 				= null;
	var parentEle				= null;
	var imagePath				= null;
	var	fromDate				= null;
	var	toDate					= null;
	var	showFromAndToDateInReportData	= data.showFromAndToDateInReportData;
	var isPartyWiseBillsStatusReport	= data.isPartyWiseBillsStatusReport;
	
	if(data.imagePath != undefined && data.imagePath != 'undefined')
		imagePath = data.imagePath;
	
	if(showFromAndToDateInReportData) {
		fromDate 	= data.fromDate;
		toDate 		= data.toDate;
	}
	
	var tableRow		= createRow('', '');
	
	var laserPrintCol	= createNewColumn(tableRow, '', '', '', '', '', '');
	var plainPrintCol	= createNewColumn(tableRow, '', '', '', '', '', '');
	var excelButtonCol	= createNewColumn(tableRow, '', '', '', '', '', '');
	var pdfButtonCol	= createNewColumn(tableRow, '', '', '', '', '', '');
	
	printJsonObject.type		= 'button';
	printJsonObject.id			= '';
	printJsonObject.class		= 'btn btn-success';
	printJsonObject.style		= '';
	printJsonObject.name		= '';
	printJsonObject.value		= 'Laser Print';
	printJsonObject['data-tooltip']		= 'Laser Print';
	printJsonObject.onclick		= 'printLaserDataForReport(escape("'+accountGroupNameForPrint+'"),escape("'+branchAddress+'"),"'+branchPhoneNumber+'", "'+titleName+'", "'+imagePath+'", "'+fromDate+'", "'+toDate+'")';

	plainPrintJsonObject.type		= 'button';
	plainPrintJsonObject.id			= '';
	plainPrintJsonObject.class		= 'btn btn-success';
	plainPrintJsonObject.style		= '';
	plainPrintJsonObject.name		= '';
	plainPrintJsonObject.value		= 'Plain Print';
	plainPrintJsonObject['data-tooltip']		= 'Plain Print';
	plainPrintJsonObject.onclick	= 'printPlainDataForReport(escape("'+accountGroupNameForPrint+'"),escape("'+branchAddress+'"),"'+branchPhoneNumber+'", "'+titleName+'", "'+imagePath+'", "'+fromDate+'", "'+toDate+'")';
	
	printPdfJsonObject.type			= 'button';
	printPdfJsonObject.id			= '';
	printPdfJsonObject.class		= 'btn btn-success';
	printPdfJsonObject.style		= '';
	printPdfJsonObject.name			= '';
	printPdfJsonObject.value		= 'PDF';
	printPdfJsonObject['data-tooltip']		= 'PDF';
	printPdfJsonObject.onclick		= 'printPdfDataForReport(escape("'+accountGroupNameForPrint+'"),escape("'+branchAddress+'"),"'+branchPhoneNumber+'", "'+titleName+'", "'+imagePath+'")';

	if(isLaserPrintAllow == 'true')
		createInput(laserPrintCol, printJsonObject);
	
	if(isPlainPrintAllow == 'true')
		createInput(plainPrintCol, plainPrintJsonObject);
		
	if(isExcelButtonDisplay == 'true') {
		fileName	= 'From_Region:_'+data.selectedRegion+'_From_Branch:_'+data.selectedSubRegion+'_From_Branch:_'+data.selectedBranch+'_From:_'+data.fromDate+'_To:_'+data.toDate+'';
		
		if(isPartyWiseBillsStatusReport == 'true') {
			if (window.navigator.userAgent.indexOf("Linux") != -1)
				onclickFun 	= 'downloadToExcel(this, "'+divId+'", "'+titleId+'", "'+fileName+'")';
			else
				onclickFun 	= 'downloadToExcelWin(this, "'+divId+'", "'+titleId+'", "'+fileName+'")';
		} else
			onclickFun 	= 'downloadToExcel(this, "'+divId+'", "'+titleId+'", "'+fileName+'")';
	
		excelDownLoadLink		= "<a href='#' id='excelDownLoadLink' class='excelButton' onclick='"+onclickFun+"'>"+"Download Excel"+'</a>';

		$(excelButtonCol).append(excelDownLoadLink);
	}
	
	if(isPdfButtonDisplay == 'true'){
		createInput(pdfButtonCol, printPdfJsonObject);
	}
	
	parentEle	= $("#"+printButtonDivId);
	
	parentEle.append(tableRow);
}

function printPlainDataForReport(accountGroupName , branchAddress ,branchPhoneNo ,detailHeader,imagePath,fromDate,toDate){
	$('#FilterRow').hide();
	childwin = window.open ('jsp/printData.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader+'&imagePath='+imagePath+'&fromDate='+fromDate+'&toDate='+toDate , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(plainData, 1000);
}

function printLaserDataForReport(accountGroupName, branchAddress, branchPhoneNo, detailHeader, imagePath, fromDate, toDate) {
	$('#FilterRow').hide();
	
	if(typeof isCRMPage != 'undefined' && isCRMPage != undefined && isCRMPage)
		childwin = window.open ('html/header/printheader.html');
	else
		childwin = window.open ('jsp/print.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader+'&imagePath='+imagePath+'&fromDate='+fromDate+'&toDate='+toDate+'&printLogo=' + printLogoInLaserPrint , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	
	window.setTimeout(afterDelayLaser, 1000);
}

function printPdfDataForReport(accountGroupName, branchAddress, branchPhoneNo, detailHeader, imagePath){
	$('#FilterRow').hide();
	childwin = window.open ('jsp/print.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader+'&imagePath='+imagePath , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(afterDelayPdfLaser, 1000);
}

function plainData(){
	childwin.window.setTimeout(function() { 
		waitForPlainDelay();
	}, 4000);
	$('#FilterRow').show();
}

function afterDelayLaser() {
	var reportdata =  document.getElementById('reportData').innerHTML;
	childwin.window.setTimeout(function() { 
	childwin.document.getElementById('data').innerHTML= reportdata;
	
	for(var i = 0; i <= reportdata.length; i++){
		if(childwin.document.getElementsByClassName("hyperLink")[i] != null ) {
			childwin.document.getElementsByClassName("hyperLink")[i].removeAttribute("href"); 
			childwin.document.getElementsByClassName("hyperLink")[i].removeAttribute("target"); 
		}
	}
	
	if(childwin.document.getElementById("selectedData") != null) {
		childwin.document.getElementById("selectedData").removeAttribute("style");
		childwin.document.getElementById("selectedData1").removeAttribute("style");
		childwin.document.getElementById("selectedData2").removeAttribute("style");
		childwin.document.getElementById("printedOnDate").style.display ='none';
	}
	
	hideLayer();
	childwin.print();
	}, 4000);
	$('#FilterRow').show();
}

function afterDelayPdfLaser(){
	var reportdata =  document.getElementById('reportData').innerHTML;
	childwin.window.setTimeout(function() { 
	childwin.document.getElementById('data').innerHTML= reportdata;
	if(childwin.document.getElementById("selectedData") != null) {
		childwin.document.getElementById("selectedData").removeAttribute("style");
		childwin.document.getElementById("selectedData1").removeAttribute("style");
		childwin.document.getElementById("selectedData2").removeAttribute("style");
		childwin.document.getElementById("printedOnDate").style.display ='none';
	}
	
	hideLayer();
	downloadPdf('data');
	}, 4000);
	$('#FilterRow').show();
}

function waitForPlainDelay(){
	var dataTableId = 'reportData';
	var wbNoSize = 8;
	var remarkSize = 8;
	var nameSize = 10;
	var srcDestSize = 6;
	
	if(typeof isCRMPage != 'undefined' && isCRMPage != undefined && isCRMPage)
		childwin.document.getElementById('mainContent').innerHTML= document.getElementById('reportData').innerHTML;
	else
		childwin.document.getElementById('data').innerHTML= document.getElementById('reportData').innerHTML;

	$('#data',childwin.document).removeClass().attr({'align': 'left'});
	//Replace Style Classes
	$('#data',childwin.document).css('width','100%');
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

function downloadPdf(divId){
	
	showLayer();
	
	var jsonObject = new Object();
	
	jsonObject.reportPdf = childwin.document.getElementById('contentbox').innerHTML;
	console.log('jsonObject ',jsonObject)
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL+'/reportPDFWS/getReportPdfToExport.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(response) {
			console.log('response ',response)
			if (response.message != undefined) {
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			} else if(response.fileName != undefined && response.fileName != null) {
				generateFileToDownload(response);//calling from genericfunction.js
			}
		}
	});
	
}

/*function window_focus(){
    window.removeEventListener('focus', window_focus, false);                   
   // window.URL.revokeObjectURL(downloadLink.href);
    setTimeout(function(){window.close();},600);
}*/
