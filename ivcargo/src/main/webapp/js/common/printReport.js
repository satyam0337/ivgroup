/**
 * @author Anant Chauhary	23-11-2015
 * 
 * Please add this file to create print button in that page where print is required
 */

function printTable(data, divId, titleId, titleName, printButtonDivId) {
	var accountGroupNameForPrint	= data.accountGroupNameForPrint;
	var branchAddress				= data.branchAddress;
	var branchPhoneNumber			= data.branchPhoneNumber;
	var isExcelButtonDisplay		= data.isExcelButtonDisplay;
	var isLaserPrintAllow			= data.isLaserPrintAllow;
	var isPlainPrintAllow			= data.isPlainPrintAllow;
	var printJsonObject			= new Object();
	var plainPrintJsonObject	= new Object();
	var excelDownLoadLink		= null;
	var fileName				= null;
	var onclickFun 				= null;
	var parentEle				= null;
	var imagePath;
	
	if(data.imagePath != undefined || data.imagePath != 'undefined'){
		imagePath = data.imagePath;
	}else{
		imagePath = null;
	}
	
	var tableRow		= createRow('', '');
	
	var laserPrintCol	= createNewColumn(tableRow, '', '', '', '', '', '');
	var plainPrintCol	= createNewColumn(tableRow, '', '', '', '', '', '');
	var excelButtonCol	= createNewColumn(tableRow, '', '', '', '', '', '');
	
	printJsonObject.type		= 'button';
	printJsonObject.id			= '';
	printJsonObject.class		= 'btn_print laserPrint';
	printJsonObject.style		= 'width: 90px;';
	printJsonObject.name		= '';
	printJsonObject.value		= 'Laser Print';
	printJsonObject.onclick		= 'printLaserDataForReport(escape("'+accountGroupNameForPrint+'"),escape("'+branchAddress+'"),"'+branchPhoneNumber+'", "'+titleName+'", "'+imagePath+'")';

	plainPrintJsonObject.type		= 'button';
	plainPrintJsonObject.id			= '';
	plainPrintJsonObject.class		= 'btn_print plainPrint';
	plainPrintJsonObject.style		= 'width: 90px;';
	plainPrintJsonObject.name		= '';
	plainPrintJsonObject.value		= 'Plain Print';
	plainPrintJsonObject.onclick	= 'printPlainDataForReport(escape("'+accountGroupNameForPrint+'"),escape("'+branchAddress+'"),"'+branchPhoneNumber+'", "'+titleName+'", "'+imagePath+'")';

	if(isLaserPrintAllow == 'true') {
		createInput(laserPrintCol, printJsonObject);
	}
	
	if(isPlainPrintAllow == 'true') {
		createInput(plainPrintCol, plainPrintJsonObject);
	}
	
	if(isExcelButtonDisplay == 'true') {
		
		fileName	= 'From_Region:_'+data.selectedRegion+'_From_Branch:_'+data.selectedSubRegion+'_From_Branch:_'+data.selectedBranch+'_From:_'+data.fromDate+'_To:_'+data.toDate+'';
		onclickFun 	= 'downloadToExcel(this, "'+divId+'", "'+titleId+'", "'+fileName+'")';
	
		excelDownLoadLink		= "<a href='#' id='excelDownLoadLink' class='excelButton' onclick='"+onclickFun+"'>"+"Download Excel"+'</a>';

		$(excelButtonCol).append(excelDownLoadLink);
	}
	
	parentEle	= $("#"+printButtonDivId);
	
	parentEle.append(tableRow);
}

function printPlainDataForReport(accountGroupName , branchAddress ,branchPhoneNo ,detailHeader,imagePath){
	$('#FilterRow').hide();
	childwin = window.open ('jsp/printData.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader+'&imagePath='+imagePath , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(plainData, 1000);
}

function printLaserDataForReport(accountGroupName, branchAddress, branchPhoneNo, detailHeader,imagePath){
	$('#FilterRow').hide();
	childwin = window.open ('jsp/print.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader+'&imagePath='+imagePath , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(afterDelayLaser, 1000);
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
	hideLayer();
	childwin.print();
	}, 4000);
	$('#FilterRow').show();
}
