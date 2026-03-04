function printPlainData(accountGroupName , branchAddress ,branchPhoneNo ,imagePath){
	if(typeof showPopForXpAnd7Print !== 'undefined' && (showPopForXpAnd7Print == true || showPopForXpAnd7Print == 'true')){
		checkCookie(accountGroupName , branchAddress ,branchPhoneNo ,imagePath);
	} else{
		var detailHeader = document.getElementById('reportName').innerHTML;
		childwin = window.open ('jsp/printData.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader+'&imagePath='+imagePath , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		window.setTimeout(waitForPlainDelay, 1000);
	}
}

function printPaymentTypeWiseTable(accountGroupName , branchAddress ,branchPhoneNo ,detailHeader,imagePath){ 
	detailHeader = document.getElementById('reportName').innerHTML; 
	childwin = window.open ('jsp/printData.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader+'&imagePath='+imagePath , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(waitForPrintPaymentTypeWiseTable, 500);
}

function waitForPrintPaymentTypeWiseTable() {
	
	var dataTableId = 'result1';
	
	childwin.document.getElementById('data').innerHTML= document.getElementById('paymentTypeTable').innerHTML;
	
	childwin.print();
}

function waitForPlainDelay() {
	var dataTableId = 'results';
	
	childwin.document.getElementById('data').innerHTML= document.getElementById('reportData').innerHTML;
	$('#data',childwin.document).removeClass().attr({'align': 'left'});
	//Replace Style Classes
	$('table',childwin.document).removeClass().removeAttr('style').css({'border':'0px'});
	$('#printHeader',childwin.document).css('width','100%');
	$('#printTimeTbl',childwin.document).css('width','100%');
	$('#'+dataTableId,childwin.document).css('width','100%');
	
	$("th:contains('Octroi Service')",childwin.document).text('O S');
	$("th:contains('Octroi Form')",childwin.document).text('O F');
	$("th:contains('Octroi')",childwin.document).text('Oct');
	$("th:contains('Hamali')",childwin.document).text('Hml');
	$("th:contains('Demurrage')",childwin.document).text('Dmrg');
	$("th:contains('Other')",childwin.document).text('Othr');
	$("th:contains('Door Delivery')",childwin.document).text('D.D');
	
	$('td',childwin.document).removeClass().addClass('datatd_plain_text');
	$('#groupName',childwin.document).removeClass().addClass('datatd_plain_text').css({"font-weight":"bold","font-size":"22px",'letter-spacing': '7px', 'text-align': 'center'});
	$("td:contains('Cash-Cheque')",childwin.document).css({"font-weight":"bold","font-size":"15px",'letter-spacing': '5px'});
	$('th',childwin.document).removeClass().addClass('datatd_plain_text').css("font-weight", "bold");
	
	//Remove 0 value cols
	var lastRow 	= $('#'+dataTableId+' tr:last',childwin.document)[0];
	var zeroCols 	= new Array();
	var idx 		= 0;
	
	for(var i = 0; i < lastRow.cells.length; i++) {
		if(parseInt(lastRow.cells[i].innerHTML, 10) == 0) {
			zeroCols[idx] = i;
			idx++;
		}
	}
	
	var delColNo = 0;
	
	for(var i = 0; i < zeroCols.length; i++) {
		var colNo = (zeroCols[i] - delColNo) + 1;
		$('#'+dataTableId+' td:nth-child('+colNo+')', childwin.document).remove();
		$('#'+dataTableId+' th:nth-child('+colNo+')', childwin.document).remove();
		delColNo++;
	}
	
	childwin.print();
}
//----------------------------- new version print --------------------->>
function waitForNewDelay() {
	var dataTableId = 'results';
	
	childwin.document.getElementById('data').innerHTML= document.getElementById('reportData').innerHTML;
	$('#data',childwin.document).removeClass().attr({'align': 'left'});
	//Replace Style Classes
	$('table',childwin.document).removeClass().removeAttr('style').css({'border':'0px'});
	$('#printHeader',childwin.document).css('width','100%');
	$('#printTimeTbl',childwin.document).css('width','100%');
	$('#'+dataTableId,childwin.document).css('width','100%');
	
	$("th:contains('Octroi Service')",childwin.document).text('O S');
	$("th:contains('Octroi Form')",childwin.document).text('O F');
	$("th:contains('Octroi')",childwin.document).text('Oct');
	$("th:contains('Hamali')",childwin.document).text('Hml');
	$("th:contains('Demurrage')",childwin.document).text('Dmrg');
	$("th:contains('Other')",childwin.document).text('Othr');
	$("th:contains('Door Delivery')",childwin.document).text('D.D');
	
	$('td',childwin.document).removeClass().addClass('datatd_plain_text');
	$('#groupName',childwin.document).removeClass().addClass('datatd_plain_text').css({"font-weight":"bold","font-size":"22px",'letter-spacing': '7px', 'text-align': 'center'});
	$("td:contains('Cash-Cheque')",childwin.document).css({"font-weight":"bold","font-size":"15px",'letter-spacing': '5px'});
	$('th',childwin.document).removeClass().addClass('datatd_plain_text').css("font-weight", "bold");
	
	//Remove 0 value cols
	var lastRow 	= $('#'+dataTableId+' tr:last',childwin.document)[0];
	var zeroCols 	= new Array();
	var idx 		= 0;
	
	for(var i = 0; i < lastRow.cells.length; i++) {
		if(parseInt(lastRow.cells[i].innerHTML, 10) == 0) {
			zeroCols[idx] = i;
			idx++;
		}
	}
	
	var delColNo = 0;
	
	for(var i = 0; i < zeroCols.length; i++) {
		var colNo = (zeroCols[i] - delColNo) + 1;
		$('#'+dataTableId+' td:nth-child('+colNo+')', childwin.document).remove();
		$('#'+dataTableId+' th:nth-child('+colNo+')', childwin.document).remove();
		delColNo++;
	}
	
	childwin.print();
}
//-------------- End new version print-------------------------->>> 
function ValidateFormElement() {
	var regionId 	= getValueFromInputField('region'); 
	var subRegionId = getValueFromInputField('subRegion'); 
	var branchId 	= getValueFromInputField('branch'); 
	if(regionId != null) {
		if(regionId <= 0) {
			showMessage('error', regionNameErrMsg);
			changeError1('region', '0', '0');
			return false;
		}
	}
	if(subRegionId != null) {
		if(subRegionId <= 0) {
			showMessage('error', subRegionNameErrMsg);
			changeError1('subRegion', '0', '0');
			return false;
		}
	}
	if(branchId != null) {
		if(branchId <= 0) {
			showMessage('error', branchNameErrMsg);
			changeError1('branch', '0', '0');
			return false;
		}
	}
	return true;
}

function storeSelectedValues() {
	var selectedRegion 				= document.getElementById('region');
	var selectedSubRegion 			= document.getElementById('subRegion');
	var selectedBranch 				= document.getElementById('branch');
	var selectedDeliveryPaymentType = document.getElementById('deliveryPaymentType');
	var selectedLRType 				= document.getElementById('lrType');
	if(selectedRegion != null) {
		setValueToTextField('selectedRegion', selectedRegion.options[selectedRegion.selectedIndex].text);
	}
	if(selectedSubRegion != null) {
		setValueToTextField('selectedSubRegion', selectedSubRegion.options[selectedSubRegion.selectedIndex].text);
	}
	if(selectedBranch != null) {
		setValueToTextField('selectedBranch', selectedBranch.options[selectedBranch.selectedIndex].text);
	}
	if(selectedDeliveryPaymentType != null) {
		setValueToTextField('selectedDeliveryPaymentType', selectedDeliveryPaymentType.options[selectedDeliveryPaymentType.selectedIndex].text);
	}
}

function openWindowForView(id,type,branchId) {	
	window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+id+'&NumberType='+type+'&BranchId='+branchId);
}

function populateExecutivesByBranch(value){
	var branchId	= value;
	var d=document.getElementById('executiveId');
	if(branchId=='-1'){
		d.options.length=1;
		d.options[0].text= 'ALL';
		d.options[0].value=-1;
		return false;
	}
	if(branchId=='0'){
		d.options.length=1;
		d.options[0].text= 'ALL';
		d.options[0].value=0;
		return false;
	} 
	
	var xmlHttp;
	try	{
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	}
	catch (e) {
		// Internet Explorer
		try {
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (e) {
			try {
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (e) {
				alert("Your browser does not support AJAX!");
				return false;
			}
		}
	}

	var browser=navigator.appName;
	if(browser=="Microsoft Internet Explorer"){
		browser="IE";
	}else{
		browser="NOTIE";
	}
	xmlHttp.onreadystatechange=function() {

		if(xmlHttp.readyState==4) {
			var str=xmlHttp.responseText;
			String.prototype.trim = function () {
				return this.replace(/^\s*/, "").replace(/\s*$/, "");
			};
			str = str.trim();
			var d=document.getElementById('executiveId');
			if(str == '') {
				d.length=1;
				allReqd = false;
				d.options[0].value = 0;
				if(browser=="IE"){
					d.options[0].text= 'No Executive';
				}else{
					d.options[0].textContent='No Executive';
				}
			} else {
				var tempQty = new Array();
				tempQty = str.split(",");
				d.options.length=1;
				d.options.length=tempQty.length;

				var html="";
				var i=1;
				if(browser=="IE"){
					while (tempQty[i] != null) {
						var temp = new Array();
						temp=tempQty[i].split('=');
						d.options[i].text=temp[0];

						var m=parseInt(temp[1]);
						d.options[i].value=m;
						i=i+1;
					}
				}else{
					while (tempQty[i] != null) {
						var temp = new Array();
						temp=tempQty[i].split('=');
						d.options[i].textContent=temp[0];

						var m=parseInt(temp[1]);
						d.options[i].value=m;
						i=i+1;
					}
				}
			}
		}
	};
	xmlHttp.open("GET","jsp/ajaxinterface.jsp?filter=5&branch="+branchId,true);
	xmlHttp.send(null);
}
//start---------------- work down for cookie and pop up for old and new version print -->>
function checkCookie(accountGroupName , branchAddress ,branchPhoneNo ,imagePath) {
	var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)print\s*\=\s*([^;]*).*$)|^.*$/, "$1");
	if (cookieValue == ""){		
	}
	if(cookieValue == "laser") {
		var detailHeader = document.getElementById('reportName').innerHTML;
		childwin = window.open ('jsp/printData.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader+'&imagePath='+imagePath , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		window.setTimeout(waitForNewDelay, 500);
		setNewVersionPrint(accountGroupName , branchAddress ,branchPhoneNo ,imagePath);
	} else if(cookieValue == "dotmatrix") {
		var detailHeader = document.getElementById('reportName').innerHTML;
		childwin = window.open ('jsp/printData.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader+'&imagePath='+imagePath , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		window.setTimeout(waitForPlainDelay, 500);
		setOldVersionPrint(accountGroupName , branchAddress ,branchPhoneNo ,imagePath);
	} else {		
		ShowDialogForPrint();
	}
}
function setNewVersionPrint(accountGroupName , branchAddress ,branchPhoneNo ,imagePath){
	var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)print\s*\=\s*([^;]*).*$)|^.*$/, "$1");
	if (cookieValue == ""){		
		document.cookie	= "print=laser; expires=Fri, 31 Dec 9999 23:59:59 GMT";
	}
	var detailHeader = document.getElementById('reportName').innerHTML;
	childwin = window.open ('jsp/printData.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader+'&imagePath='+imagePath , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(waitForNewDelay, 500);
	HideSaidToContainDialog();
}
function setOldVersionPrint(accountGroupName , branchAddress ,branchPhoneNo ,imagePath){	
	var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)print\s*\=\s*([^;]*).*$)|^.*$/, "$1");
	if (cookieValue == ""){		
		document.cookie	= "print=dotmatrix; expires=Fri, 31 Dec 9999 23:59:59 GMT";
	}
	var detailHeader = document.getElementById('reportName').innerHTML;
	childwin = window.open ('jsp/printData.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader+'&imagePath='+imagePath , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(waitForPlainDelay, 500);
	HideSaidToContainDialog();
}
function ShowDialogForPrint(){
    $("#companyNameOverlay").show();
    $("#companyNameDialog").fadeIn(300);
}
function HideSaidToContainDialog(){
    $("#companyNameOverlay").hide();
    $("#companyNameDialog").fadeOut(0);
}
function calcelDialog(){
	 $("#companyNameOverlay").hide();
	 $("#companyNameDialog").fadeOut(0);
}
function printPlainCategoryWisePendingStock(accountGroupName , branchAddress ,branchPhoneNo ,detailHeader,imagePath){
	detailHeader 	= document.getElementById('reportName').innerHTML;
	childwin 		= window.open ('jsp/printData.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader+'&imagePath='+imagePath , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(waitForPlainDelayForPendingStockDetail, 1000);
}

function waitForPlainDelayForPendingStockDetail() { 
	var dataTableId = 'result2';
	
	childwin.document.getElementById('data').innerHTML= document.getElementById('pendingStockDetailsTable').innerHTML;
	$('#data',childwin.document).removeClass().attr({'align': 'left'});
	//Replace Style Classes
	$('table',childwin.document).removeClass().removeAttr('style').css({'border':'0px'});
	$('#printHeader',childwin.document).css('width','100%');
	$('#printTimeTbl',childwin.document).css('width','100%');
	$('#'+dataTableId,childwin.document).css('width','100%');
	
	$("th:contains('Octroi Service')",childwin.document).text('O S');
	$("th:contains('Octroi Form')",childwin.document).text('O F');
	$("th:contains('Octroi')",childwin.document).text('Oct');
	$("th:contains('Hamali')",childwin.document).text('Hml');
	$("th:contains('Demurrage')",childwin.document).text('Dmrg');
	$("th:contains('Other')",childwin.document).text('Othr');
	$("th:contains('Door Delivery')",childwin.document).text('D.D');
	
	$('td',childwin.document).removeClass().addClass('datatd_plain_text');
	$('#groupName',childwin.document).removeClass().addClass('datatd_plain_text').css({"font-weight":"bold","font-size":"22px",'letter-spacing': '7px', 'text-align': 'center'});
	$("td:contains('Cash-Cheque')",childwin.document).css({"font-weight":"bold","font-size":"15px",'letter-spacing': '5px'});
	$('th',childwin.document).removeClass().addClass('datatd_plain_text').css("font-weight", "bold");
	
	//Remove 0 value cols
	var lastRow 	= $('#'+dataTableId+' tr:last',childwin.document)[0];
	var zeroCols 	= new Array();
	var idx 		= 0;
	
	for(var i = 0; i < lastRow.cells.length; i++) {
		if(parseInt(lastRow.cells[i].innerHTML, 10) == 0) {
			zeroCols[idx] = i;
			idx++;
		}
	}
	
	var delColNo = 0;
	
	for(var i = 0; i < zeroCols.length; i++) {
		var colNo = (zeroCols[i] - delColNo) + 1;
		$('#'+dataTableId+' td:nth-child('+colNo+')', childwin.document).remove();
		$('#'+dataTableId+' th:nth-child('+colNo+')', childwin.document).remove();
		delColNo++;
	}
	
	childwin.print();
}

function printLeserCategoryWisePendingStock(accountGroupName , branchAddress ,branchPhoneNo ,detailHeader,imagePath){ 
	detailHeader = document.getElementById('reportName').innerHTML; 
	childwin = window.open ('jsp/printData.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader+'&imagePath='+imagePath , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(setAfterDelayPendingStock, 500);
}

function setAfterDelayPendingStock() {
	
	childwin.document.getElementById('data').innerHTML= document.getElementById('pendingStockDetailsTable').innerHTML;
	
	childwin.print();
}
//end  ------------------work down for cookie and pop up for old and new version print-->>