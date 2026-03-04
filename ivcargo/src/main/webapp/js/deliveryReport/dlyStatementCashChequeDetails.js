
var ACCOUNTGROUPID_LMT = 201;
var hideColumnCrNoPartyNameInReport = false;
var hideColumnExeNameInReport       = false;
var removeColumn  = false;
function printPlainDataNew(accountGroupName , branchAddress ,branchPhoneNo ,imagePath,removeSpecificColumnFromPrintForPsr){
	if(typeof showPopForXpAnd7Print !== 'undefined' && (showPopForXpAnd7Print == true || showPopForXpAnd7Print == 'true')){
		checkCookie(accountGroupName , branchAddress ,branchPhoneNo ,imagePath);
	} else{
		var detailHeader = document.getElementById('reportName').innerHTML;
		childwin = window.open ('jsp/printData.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader+'&imagePath='+imagePath , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		window.setTimeout(waitForPlainDelay, 1000);
		removeColumn = removeSpecificColumnFromPrintForPsr;
	}
}

//------------------------------------old version-------------------------------------------------------------
function waitForPlainDelay() {
	var dataTableId = 'results';
	var wbNoSize = 8;
	var nameSize = 8;
	childwin.document.getElementById('data').innerHTML = document.getElementById('reportData').innerHTML;
	$('#data',childwin.document).removeClass().attr({'align': 'left'});
	$('table',childwin.document).removeClass().removeAttr('style').css({'border':'0px'});
	$('#printHeader',childwin.document).css('width','100%');
	$('#printTimeTbl',childwin.document).css('width','100%');
	$('td',childwin.document).removeClass().addClass('datatd_plain_text');
	$('td',childwin.document).removeClass().addClass('datatd_plain_text').css({"border":"none"});
	$('td',childwin.document).removeClass().addClass('fontSizeFortableData');
	$('#groupName',childwin.document).removeClass().addClass('datatd_plain_text').css({"font-weight":"bold","font-size":"22px",'letter-spacing': '7px', 'text-align': 'center'});
	$("td:contains('Cash-Cheque')",childwin.document).css({"font-weight":"bold","font-size":"18px",'letter-spacing': '5px'});
	$('th',childwin.document).removeClass().addClass('datatd_plain_text').css("font-weight", "bold");
	$('th',childwin.document).removeClass().addClass('datatd_plain_text').css({"border":"none"});
	$('th',childwin.document).removeClass().addClass('fontSizeFortableData');
	$("th:contains('Octroi Service')",childwin.document).text('O S');
	$("th:contains('Octroi Form')",childwin.document).text('O F');
	$("th:contains('Octroi')",childwin.document).text('Oct');
	$("th:contains('Hamali')",childwin.document).text('Hml');
	$("th:contains('Demurrage')",childwin.document).text('Dmrg');
	$("th:contains('Other')",childwin.document).text('Othr');
	$("th:contains('Door Delivery')",childwin.document).text('D.D');
	if(childwin.document.getElementById(dataTableId)){
		$('#'+dataTableId,childwin.document).css('width','100%');
		var deliveryPaymentType = document.getElementById('deliveryPaymentType').value;
		if(deliveryPaymentType == 0 || deliveryPaymentType ==  TransportCommonMaster.PAYMENT_TYPE_CREDIT_ID  ){
			$('#'+dataTableId+' tr',childwin.document).each(function(){
				var formatColNo = 0;
				if(/Sr.No/i.test($('#'+dataTableId+' tr:eq(0) > th:eq(0)').text().trim())){
					formatColNo = 1;
				}
			    var txt = $(this).find("td").eq(formatColNo).text().trim();
				if(txt != null && txt.length >0){
					var txtArr = new String(txt).split("/");
					txt = txtArr[0]+"/"+txtArr[1].substring(0,wbNoSize);
					$(this).find("td").eq(formatColNo).text(txt);
				}
				
			});
		}else{
			$('#'+dataTableId+' tr',childwin.document).each(function(){
			    var src = $(this).find("td").eq(4).text().trim();
				    $(this).find("td").eq(4).text(src.substring(0,wbNoSize));
				if(deliveryPaymentType ==  TransportCommonMaster.PAYMENT_TYPE_CASH_ID  ){
					if(accountGroupId == ACCOUNTGROUPID_LMT){ 
						$(this).find("td").eq(6).remove();
						$(this).find("th").eq(6).remove();
					 } 
				}else{
			    	var name = $(this).find("td").eq(6).text().trim();
			    	if(name.length > nameSize)$(this).find("td").eq(6).text(name.substring(0,nameSize));
				}
			});
		}
		if(accountGroupId == ACCOUNTGROUPID_LMT){ 
			if(deliveryPaymentType == 0){ 
				$('#'+dataTableId+' tr',childwin.document).find('th:eq(19)').remove();
			}
		}
		$('#'+dataTableId+' tr',childwin.document).each(function(){
		if(hideColumnCrNoPartyNameInReport == false || hideColumnCrNoPartyNameInReport == 'false'){
			$(this).find("th").eq(0).remove();
			$(this).find("td").eq(0).remove();
			}
		if(hideColumnExeNameInReport == false || hideColumnExeNameInReport == 'false'){
			$(this).find("th").eq(13).remove();
			$(this).find("td").eq(13).remove();
			}
			});
		
		$('#'+dataTableId,childwin.document).find("a").contents().unwrap();
		var lastRow = $('#'+dataTableId+' tr:last',childwin.document)[0];
		var zeroCols = new Array();
		var idx = 0;
		for(var i=0;i< lastRow.cells.length;i++){
			if(parseInt(lastRow.cells[i].innerHTML,10)==0){
				zeroCols[idx]=i;
				idx++;
			}
		}
		
		var delColNo = 0;
		for(var i=0;i<zeroCols.length;i++){
			var colNo = (zeroCols[i]-delColNo)+1;
			$('#'+dataTableId+' td:nth-child('+colNo+')',childwin.document).remove();
			$('#'+dataTableId+' th:nth-child('+colNo+')',childwin.document).remove();
			delColNo++;
		}
		
		if(removeColumn == true || removeColumn == 'true'){
		$('#'+dataTableId+' tr',childwin.document).each(function(){
			$(this).find("th").eq(3).remove();
			$(this).find("th").eq(3).remove();
			$(this).find("th").eq(3).remove();
			$(this).find("th").eq(3).remove();
			$(this).find("td").eq(3).remove();
			$(this).find("td").eq(3).remove();
			$(this).find("td").eq(3).remove();
			$(this).find("td").eq(3).remove();
			
			
			});
		}
	}
	childwin.print();
}

//----------------------------- new version print --------------------->>
function waitForNewDelay() {
	
		var dataTableId = 'results';
		var wbNoSize = 8;
		var nameSize = 8;
		childwin.document.getElementById('data').innerHTML = document.getElementById('reportData').innerHTML;
		$('#data',childwin.document).removeClass().attr({'align': 'left'});
		$('table',childwin.document).removeClass().removeAttr('style').css({'border':'0px'});
		$('#printHeader',childwin.document).css('width','100%');
		$('#printTimeTbl',childwin.document).css('width','100%');
		$('td',childwin.document).removeClass().addClass('datatd_plain_text');
		$('td',childwin.document).removeClass().addClass('datatd_plain_text').css({"border":"none"});
		$('td',childwin.document).removeClass().addClass('fontSizeFortableData').css({"font-size":"15px",'letter-spacing': '6px'});;
		$('#groupName',childwin.document).removeClass().addClass('datatd_plain_text').css({"font-weight":"bold","font-size":"20px",'letter-spacing': '10px', 'text-align': 'center'});
		$("td:contains('Cash-Cheque')",childwin.document).css({"font-weight":"bold","font-size":"18px",'letter-spacing': '15px'});
		$('th',childwin.document).removeClass().addClass('datatd_plain_text').css("font-weight", "bold");
		$('th',childwin.document).removeClass().addClass('datatd_plain_text').css({"border":"none"});
		$('th',childwin.document).removeClass().addClass('fontSizeFortableData');
		$("th:contains('Octroi Service')",childwin.document).text('O S');
		$("th:contains('Octroi Form')",childwin.document).text('O F');
		$("th:contains('Octroi')",childwin.document).text('Oct');
		$("th:contains('Hamali')",childwin.document).text('Hml');
		$("th:contains('Demurrage')",childwin.document).text('Dmrg');
		$("th:contains('Other')",childwin.document).text('Othr');
		$("th:contains('Door Delivery')",childwin.document).text('D.D');
		if(childwin.document.getElementById(dataTableId)){
			$('#'+dataTableId,childwin.document).css('width','100%');
			var deliveryPaymentType = document.getElementById('deliveryPaymentType').value;
			if(deliveryPaymentType == 0 || deliveryPaymentType ==  TransportCommonMaster.PAYMENT_TYPE_CREDIT_ID  ){
				$('#'+dataTableId+' tr',childwin.document).each(function(){
					var formatColNo = 0;
					if(/Sr.No/i.test($('#'+dataTableId+' tr:eq(0) > th:eq(0)').text().trim())){
						formatColNo = 1;
					}
				    var txt = $(this).find("td").eq(formatColNo).text().trim();
					if(txt != null && txt.length >0){
						var txtArr = new String(txt).split("/");
						txt = txtArr[0]+"/"+txtArr[1].substring(0,wbNoSize);
						$(this).find("td").eq(formatColNo).text(txt);
					}
				});
			}else{
				$('#'+dataTableId+' tr',childwin.document).each(function(){
				    var src = $(this).find("td").eq(4).text().trim();
					    $(this).find("td").eq(4).text(src.substring(0,wbNoSize));
					if(deliveryPaymentType == TransportCommonMaster.PAYMENT_TYPE_CASH_ID ){
						if(accountGroupId == 201){ 
							$(this).find("td").eq(6).remove();
							$(this).find("th").eq(6).remove();	
						 } 
					}
					else{
				    	var name = $(this).find("td").eq(6).text().trim();
				    	if(name.length > nameSize)$(this).find("td").eq(6).text(name.substring(0,nameSize));
					}
				});
			}
		if(accountGroupId == 201){
				if(deliveryPaymentType == 0){ 
					$('#'+dataTableId+' tr',childwin.document).find('th:eq(19)').remove();
				}
			}
			$('#'+dataTableId,childwin.document).find("a").contents().unwrap();
			var lastRow = $('#'+dataTableId+' tr:last',childwin.document)[0];
			var zeroCols = new Array();
			var idx = 0;
			for(var i=0;i< lastRow.cells.length;i++){
				if(parseInt(lastRow.cells[i].innerHTML,10)==0){
					zeroCols[idx]=i;
					idx++;
				}
			}
			var delColNo = 0;
			for(var i=0;i<zeroCols.length;i++){
				var colNo = (zeroCols[i]-delColNo)+1;
				$('#'+dataTableId+' td:nth-child('+colNo+')',childwin.document).remove();
				$('#'+dataTableId+' th:nth-child('+colNo+')',childwin.document).remove();
				delColNo++;
			}
		}
		childwin.print();
	}
///-------------- End new version print-------------------------->>> 
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


function printLaserDataNew(accountGroupName , branchAddress ,branchPhoneNo,imagePath ,showCrNoPartyNameColumnInPrint ,showExecuteNameColumnInPrint){
	var detailHeader = document.getElementById('reportName').innerHTML;
	childwin = window.open ('jsp/print.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader+'&imagePath='+imagePath , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(afterDelayNew, 1000);
	hideColumnCrNoPartyNameInReport = showCrNoPartyNameColumnInPrint;	
	hideColumnExeNameInReport       = showExecuteNameColumnInPrint;
}

function afterDelayNew() {
	var searchbutton	= $(".searchBtn");
	$(".searchBtn").remove();
	var reportdata =  document.getElementById('reportData').innerHTML;
	$(".lrNumber").append(searchbutton[0]);
	childwin.window.setTimeout(function() { 
		childwin.showLayer();
	}, 2000);
	childwin.window.setTimeout(function() { 
	var dataTableId = 'results';
	childwin.document.getElementById('data').innerHTML= reportdata;
		$('#'+dataTableId+' tr',childwin.document).each(function(){
		if(hideColumnCrNoPartyNameInReport == false || hideColumnCrNoPartyNameInReport == 'false'){
			$(this).find("th").eq(0).remove();
			$(this).find("td").eq(0).remove();
			}
		if(hideColumnExeNameInReport == false || hideColumnExeNameInReport == 'false'){
			$(this).find("th").eq(13).remove();
			$(this).find("td").eq(13).remove();
			}
			});
	childwin.hideLayer();
	childwin.print();
	}, 3000);

}

function storeSelectedValues() {
	var selectedRegion 				= document.getElementById('region');
	var selectedSubRegion 			= document.getElementById('subRegion');
	var selectedBranch 				= document.getElementById('branch');
	var selectedDeliveryPaymentType = document.getElementById('deliveryPaymentType');
	var selectedLRType 				= document.getElementById('lrType');
	var selectedDeliveryTypeId 		= document.getElementById('deliveryTypeId');
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

function populateExecutivesByBranch(value,displayActiveUser){
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
	xmlHttp.open("GET","jsp/ajaxinterface.jsp?filter=5&branch="+branchId+'&displayOnlyActiveUsers='+displayActiveUser,true);
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
function printLaserDataNew(accountGroupName , branchAddress ,branchPhoneNo,imagePath,removeSpecificColumnFromPrintForPsr){
	var detailHeader = document.getElementById('reportName').innerHTML;
	childwin = window.open ('jsp/print.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader+'&imagePath='+imagePath , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(afterDelayNew, 1000);
	removeColumn = removeSpecificColumnFromPrintForPsr;
}

function afterDelayNew() {
	var searchbutton	= $(".searchBtn");
	$(".searchBtn").remove();
	var reportdata =  document.getElementById('reportData').innerHTML;
	$(".lrNumber").append(searchbutton[0]);
	childwin.window.setTimeout(function() { 
		childwin.showLayer();
	}, 2000);
	childwin.window.setTimeout(function() { 
	childwin.document.getElementById('data').innerHTML= reportdata;
	
	if(removeColumn == true || removeColumn == 'true'){
		var dataTableId = 'results';
		$('#'+dataTableId+' tr',childwin.document).each(function(){
			$(this).find("th").eq(3).remove();
			$(this).find("th").eq(3).remove();
			$(this).find("th").eq(3).remove();
			$(this).find("th").eq(3).remove();
			$(this).find("td").eq(3).remove();
			$(this).find("td").eq(3).remove();
			$(this).find("td").eq(3).remove();
			$(this).find("td").eq(3).remove();
			

			});
		}
	
	childwin.hideLayer();
	childwin.print();
	}, 3000);
}
//end  ------------------work down for cookie and pop up for old and new version print-->>