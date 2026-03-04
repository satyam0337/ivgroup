//Adding String.prototype.trim
var iconForWarningMsg		= '<i class="fa fa-warning"></i>';

var alphaNumericAllowWarningMsg				= iconForWarningMsg+' Only A-Z and 0-9 allowed, No other Character Allowed !';
var numericAllowWarningMsg					= iconForWarningMsg+' Only 0-9 allowed !';
var characterAllowWarningMsg				= iconForWarningMsg+' Only A-Z allowed !';
var specialCharacterNumberAllowWarningMsg	= iconForWarningMsg+' Only Special Characters and 0-9 allowed, No other Character Allowed !'; 
var otherCharacterAllowWarningMsg			= iconForWarningMsg+' Other character not allowed !';

if(!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g,'');
  };
}

var execReqd=false; // for select or ALL executive condition
var allReqd=false;
var serchKeyFlag=false; // F2 search key flag
var destBranchCityId=0; // To store CityId of destination branches
var isValidationError=false; // To check if any validation error exist
var curSystemDate	= new Date();
var OTPNumber   	= 0;
var otpSendCount	= 0;
var clockTimer;

function isValidForPercent(event,param){
	if(isValidDiscount(event,param)){
		if(document.wayBillForm.isDiscountPercent != undefined) {
			if(param.value > 100){
				document.wayBillForm.isDiscountPercent.disabled = true;
			}else{
				document.wayBillForm.isDiscountPercent.disabled = false;
			}
		}
		return true;
	}else{
		return false;
	}
}

function discGratAmt(){
	if(isValidDiscount(event,param)){
		alert("param.value "+param.value);
		alert("document.wayBillForm.amount.value "+document.wayBillForm.amount.value);
		if(document.wayBillForm.amount.value < param.value){
			alert("param >");
			param.value = 0;
		}
		return true;
	}else{
		return false;
	}
}

function isValidDiscount(e, obj) {
	var keynum = e.which;
	if(obj.value.length==0 && keynum == 45)return true;
	else return	validAmount(e);
}
//validate mobile number
function mobileNumberValidation(id) {  
	  var reg = /^[789]\d{9}$/ig;
	  var phoneno = document.getElementById(id);
	  if(phoneno.value.length == 10 ){
		  	if( !phoneno.value.match(reg)){
				showSpecificErrors('basicError',"Not a valid Mobile Number !");
				toogleElement('basicError','block');
				changeError1(id,'0','0');
				document.getElementById(id).focus();
				return false;
		  	} else {
		  		toogleElement('basicError','none');
		  		removeError(id);
		  	};
	  }
	  return true;
}


function printData(accountGroupName , branchAddress ,branchPhoneNo ,detailHeader,imagePath){
	childwin = window.open ('jsp/print.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader+'&imagePath='+imagePath , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(afterDelay, 1000);
}

function printLaserData(accountGroupName , branchAddress ,branchPhoneNo,imagePath){
	var detailHeader = document.getElementById('reportName').innerHTML;
	childwin = window.open ('jsp/print.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader+'&imagePath='+imagePath , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(afterDelay, 1000);
}

function laserPrintData(accountGroupName , branchAddress ,branchPhoneNo,imagePath,setCustomPrint){
	var detailHeader = document.getElementById('reportName') != null ? document.getElementById('reportName').innerHTML : "";
	var customPrint	 = false;
	
	if(typeof setCustomPrint !== "undefined" && setCustomPrint != null){
		customPrint = setCustomPrint;
	}
	childwin = window.open ('jsp/print.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader+'&imagePath='+imagePath+'&customPrint='+customPrint , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(afterDelay, 1000);
}

function afterDelay() {
	let searchbutton = $(".searchBtn");
	$(".searchBtn").remove();
	// Clone reportData into a DOM fragment so we can modify it before sending
	let reportClone = document.createElement('div');
	reportClone.innerHTML = document.getElementById('reportData').innerHTML;
	// Remove billingPartyCol from this cloned DOM
	reportClone.querySelectorAll('.billingPartyCol').forEach(el => el.remove());
	// Put the modified HTML into a string
	let filteredReportData = reportClone.innerHTML;

	$(".lrNumber").append(searchbutton[0]);

	childwin.window.setTimeout(function() { 
		childwin.showLayer();
	}, 2000);

	childwin.window.setTimeout(function() { 
		childwin.document.getElementById('data').innerHTML = filteredReportData;
		childwin.hideLayer();
		childwin.print();
	}, 3000);
}

// Returns (month/week) Date from today date in yyyy-mm-dd format based on filter (month/week)
function getCustomDate(date,range,timefilter){
	var dateParts = date.split("-");
	var dt = new Date(parseInt(dateParts[2]),parseInt(dateParts[1],10)-1, parseInt(dateParts[0]));
	var customDate=null;
	if (range=='week') (timefilter == 'past') ? customDate = new Date(dt.getTime()-1000*60*60*24*7) : customDate =  new Date(dt.getTime()+1000*60*60*24*7);
	if (range=='month')(timefilter == 'past') ? customDate = new Date(dt.getTime()-1000*60*60*24*31) : customDate = new Date(dt.getTime()+1000*60*60*24*31);
	return customDate;
}

function makeTwoChars(inp) {
    return String(inp).length < 2 ? "0" + inp : inp;
}

function isSingleDigit(value){  // Returns true if the value passed is single digit else returns false
	 value=value/10;
	 if (parseInt(value)==0)
	 return true;
	 else return false;
}

function pageLoad(txt){
	var startindex=0;
	var endindex=-1;
	var loaddiv=document.getElementById('content-wrap');
	loaddiv.innerHTML='';
	while(txt.indexOf('<script ',endindex)>endindex)
	{
		startindex=txt.indexOf('<script ',endindex);
		endindex=txt.indexOf("/script>",endindex)+8;
		var scr=txt.substring(txt.indexOf('>',startindex)+1,endindex-9);
		var scriptObj=createScript('',scr);
		if(scr>2);
			loaddiv.appendChild(scriptObj);
	}
	loaddiv.innerHTML +=txt.substr(endindex);
}

function createScript(scriptid,scripttxt){
	var scriptObj=document.createElement('script');
	scriptObj.text=scripttxt;
	scriptObj.id=scriptid;
	return scriptObj;
}

function exportCSV(reportId){
	childwin = window.open ('ViewWayBill.do?pageId=16&eventId=1&reportId='+reportId, 'newwindow', config='height=0,width=0, toolbar=no, menubar=no, scrollbars=no, resizable=no,location=no, directories=no, status=no');
}

function deleteWayBills(tableId){
	var tableEl = document.getElementById(tableId);
	var found = false;
	var totalPkgs = 0;
	var totalAmt = 0;

	for (var row = tableEl.rows.length-1; row > 0; row--){
		if(tableEl.rows[row].cells[0].getElementsByTagName("input")[0].checked){
			var el = tableEl.rows[row];
			el.parentNode.removeChild(el);
			found=true;
		}else{
			totalPkgs = parseFloat(totalPkgs) + parseFloat(tableEl.rows[row].cells[8].firstChild.nodeValue);
			totalAmt = parseFloat(totalAmt) + parseFloat(tableEl.rows[row].cells[6].firstChild.nodeValue);
		}
	}

	document.getElementById("total").innerHTML = "Total No. Of Pkgs : &nbsp;&nbsp;"+totalPkgs+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Total Amount : &nbsp;&nbsp;"+totalAmt;

	if(!found){

		if(tableEl.rows.length==1){
				document.getElementById("errorSubmit").innerHTML="There is no WayBill to delete ";
				document.getElementById("errorSubmit").className = 'statusErr';
				document.getElementById("errorSubmit").style.display='block';
		}else{
				document.getElementById("errorSubmit").innerHTML="Please select atleast one WayBill to delete ";
				document.getElementById("errorSubmit").className = 'statusErr';
				document.getElementById("errorSubmit").style.display='block';
		}
	}
}

function isAddLeftTable(leftTableId,rightTableId){
	leftTable=document.getElementById(leftTableId);
	rightTable=document.getElementById(rightTableId);
	if(leftTable.rows.length<rightTable.rows.length || leftTable.rows.length==rightTable.rows.length )
		return false;
	else return true;
}

function deleteConsignment(tableId,tableId1){
	var tableEl = document.getElementById(tableId);
	var tableEl1 = document.getElementById(tableId1);
	var found = false;

	for (var row = tableEl.rows.length-1; row > 0; row--){
		if(tableEl.rows[row].cells[0].getElementsByTagName("input")[0].checked){

			var el = tableEl.rows[row];
			el.parentNode.removeChild(el);
			found=true;
		}
	}

	for (row = tableEl1.rows.length-1; row > 0; row--){
		if(tableEl1.rows[row].cells[0].getElementsByTagName("input")[0].checked){
			var el = tableEl1.rows[row];
			el.parentNode.removeChild(el);
			found=true;
		}
	}
	calcTotalOnAddArticle();

	if(!found){
		if(tableEl.rows.length==1){
				alert('There is no WayBill to delete !');
				return false;
		}else{
			alert('Please select atleast one WayBill to delete !');
			return false;
		}
	}
	return true;
}

function setMonthYear(obj)
{
    if((obj.value.length==1&&obj.value>31)||(obj.value.length==2&&obj.value>31)){
    	obj.value='';
        return true;
    }

    if(obj.value.length==2){
		 var today= serverCurrentDate;
		 var currMonth = today.getMonth()+1;
		 if (currMonth/10 < 1)
		 currMonth='0'+currMonth;
         var currYear  = today.getFullYear();
         obj.value=obj.value+'-'+currMonth+'-'+currYear;
	}
}

function ReceivedWayBill(tableId){

var tableEl = document.getElementById(tableId);

	var count = parseFloat(tableEl.rows.length-1);
	var ch=0;
	for(var i=0;i<count;i++){
		if(tableEl.rows[i].cells[0].firstChild.checked){
			ch=ch+1;
		}
	}
	if(ch==0){
		alert('Please select atleast one waybill to Received.');
	}else{
		var answer = confirm ("Received "+ch+" waybills?");
		if (answer){
		document.ReciveWayBillForm.pageId.value="18";
		document.ReciveWayBillForm.eventId.value="7";
		document.ReciveWayBillForm.action="receivableForm.do";
		document.ReciveWayBillForm.submit();
		}else{
			return false;
		}
	}
}

function showSpecificErrors(errorEl,msg){
	var ele = document.getElementById(errorEl);
	if(ele !=null){		
		ele.innerHTML = msg;
		ele.className = 'statusErr';
		isValidationError=true;
	}
}

function showSpecificSuccess(errorEl,msg){
	var ele = document.getElementById(errorEl);
	ele.innerHTML = msg;
	ele.className = 'statusInfo';
	isValidationError=true;
}

function toogleElement(EleName,style){
	var objEle = document.getElementById(EleName);
	if(objEle){
		objEle.style.display=style;
		(style=='block') ? isValidationError=true : isValidationError=false;
	}
}

function changeError1(id,xaxis,yaxis){
	document.getElementById(id).style.borderStyle="solid";
	document.getElementById(id).style.borderColor="red";
	document.getElementById(id).focus();
	//window.scrollTo(xaxis,yaxis);
}

function changeError(id,xaxis,yaxis){
	id.css({"border-color": "red", 
    "border-style":"solid"});
}

function getPosition(id) {
    var xPosition = 0;
    var yPosition = 0;
    element = document.getElementById(id);
    while(element) {
        xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
        element = element.offsetParent;
    }
    return { x: xPosition, y: yPosition };
}

function removeError(id){
	if(document.getElementById(id)!=null){
	document.getElementById(id).style.borderStyle="";
	document.getElementById(id).style.borderColor="";
	isValidationError=false;
	}
}

function removeError1(id){
	if(document.getElementById(id)!=null){
		
	}
}

function CalcKeyCode(aChar) {
	var character = aChar.substring(0,1);
	var code = aChar.charCodeAt(0);
	return code;
}

function noNumbers(evt){
	if (evt.ctrlKey ==1){
		return true;
	}else{
		var keynum = null;
		if(window.event){ // IE
			keynum = evt.keyCode;
		} else if(evt.which){ // Netscape/Firefox/Opera
			keynum = evt.which;
		}
		if(keynum!=null){
			if(keynum == 8){
				return true;
			} else if(keynum == 45 || keynum == 47) {
				return false;
			} else if (keynum < 48 || keynum > 57 ) {
				return false;
			}
		}
		return true;
	}
}

function confirmSaveWayBill(){
	var response=false;
		response=confirm('Are you sure you want to save WayBill ?');
		if (!response){
			if (isWayBillSaving!=null)
				isWayBillSaving=false;
		}
	return response;
}

function confirmSaveLR(){
	var response=false;
		response=confirm('Are you sure you want to save LR ?');
		if (!response){
			if (isWayBillSaving!=null)
				isWayBillSaving=false;
		}
	return response;
}

function validAmount(evt){
	if (evt.ctrlKey ==1){
		return true;
	}else{
		var keynum = null;
		if(window.event){ // IE
			keynum = evt.keyCode;
		} else if(evt.which){ // Netscape/Firefox/Opera
			keynum = evt.which;
		}
		if(keynum!=null){
			if(keynum == 8  || keynum == 46 ){
				return true;
			}
			if (keynum < 48 || keynum > 57 ) {
				return false;
			}
		}
		return true;
	}
}

function setFocusForDiscount(obj,text){
	if(obj.value != '' && obj.value != 0){
		if(document.getElementById(text).value == 'Remarks'){
			alert("Please Enter Remark");
			var obj = document.getElementById(text);
			setTimeout(function(){if(obj)obj.focus();obj.select();},100);
		}
	}
}

function isAmount(val){
	if(val.value==""){
		val.value=0;
	}
	if(!IsNumeric(val.value)){
		val.value=0;
	}
	return false;
}

function isNumeric(val) {

	var strPass = val.value;
	var strLength = strPass.length;
	var lchar = val.value.charAt((strLength) - 1);
	var cCode = CalcKeyCode(lchar);

	if (cCode < 48 || cCode > 57 ) {
		var myNumber = val.value.substring(0, (strLength) - 1);
		val.value = myNumber;
	}
	return false;
}

function clearIfNotNumeric(obj, text){

	 var textValue = obj.value;
	 
	
	 if((obj.value).indexOf('(') > -1) {
		 obj.value	=  (obj.value).substring(0,(obj.value).indexOf('('));
	 }
	 
	 if(obj.value.length > 0 && isNaN(obj.value)){
			obj.value=text;
			alert('Invalid Number !');
			setTimeout(function(){if(obj)obj.focus();obj.select();},100); // Used to set focus as obj.focus(); doesn't work after alert90
			return false;
		}else if(textValue == ''){
    	 obj.value = text;
     }else{
   	  text.value = textValue;
     }
	return false;
}

function clearIfNotAValidNumber(obj, text){
	 let textValue = obj.value;
	 
	 if(textValue.length > 0 && (isNaN(textValue) || textValue.indexOf('.') !== -1))  {
		obj.value = text;
		alert('Invalid Number !');
		setTimeout(function(){if(obj) {obj.focus();obj.select();}},100); // Used to set focus as obj.focus(); doesn't work after alert90
		return false;
	} else if(textValue == '') {
		obj.value = text;
	}

	return false;
}

function noSpclCharsExcludingForwardSlash(e) {

	var keynum = null;

	if(window.event) { // IE
		keynum = e.keyCode;
	} else if(e.which) {// Netscape/Firefox/Opera
		keynum = e.which;
	}

	if(keynum == 8 || keynum == 95 || keynum == 47){
		return true;
	}
	if((keynum > 32 && keynum < 48)|| (keynum > 57 && keynum < 65)|| (keynum > 90 && keynum < 97)|| (keynum > 122 && keynum < 127)) {
		return false;
	}
	return true;
}

function noSpclChars(e){

	var keynum =null;

	if(window.event){ // IE
		keynum = e.keyCode;
	} else if(e.which) {// Netscape/Firefox/Opera
		keynum = e.which;
	}
	if(keynum == 8 || keynum == 95 ){
		return true;
	}
	if ((keynum > 32 && keynum < 48)|| (keynum > 57 && keynum < 65)|| (keynum > 90 && keynum < 97)|| (keynum > 122 && keynum < 127) ) {
		return false;
	}
	return true;
}

function imposeMaxLength(field, maxlimit) {
	if (field.value.length > maxlimit) // if too long...trim it!
		field.value = field.value.substring(0, maxlimit);
}

function isNumericOrZero(val) {
 // alert("inside alert");
	var strPass = val.value;
	var strLength = strPass.length;
	var lchar = val.value.charAt((strLength) - 1);
	var cCode = CalcKeyCode(lchar);

	if (cCode < 48 || cCode > 57 ) {
		var myNumber = val.value.substring(0, (strLength) - 1);
		val.value=myNumber;
	}
	if(val.value==""){
		val.value=0;
	}
	return false;
}

function isZeroSetEmpty(val){
	if(val.value=="0"){
		val.value="";
	}
}

function isNumericOrOne(val) {

	var strPass = val.value;
	var strLength = strPass.length;
	var lchar = val.value.charAt((strLength) - 1);
	var cCode = CalcKeyCode(lchar);
	if (cCode < 48 || cCode > 57 ) {
		var myNumber = val.value.substring(0, (strLength) - 1);
		val.value=myNumber;
	}
	if(val.value==""){
		val.value=1;
	}
	return true;
}

function validateEmailId(id,errorMsg) {
	if(configuration != undefined && configuration != null && configuration.validateConsignorConsigneeEmail == 'true') {
		if(id == 'consignorEmail' && ($('#' + id).val() == '' || !isValidEmailId(id))) {
			showMessage("error", "Please Enter a Valid Consignor Email Address !");
			toogleElement(errorMsg,'block');
			return false;
		} else if(id == 'consigneeEmail' && ($('#' + id).val() == '' || !isValidEmailId(id))) {
			showMessage("error", "Please Enter a Valid Consignee Email Address !");
			toogleElement(errorMsg,'block');
			return false;
		}
	} else if(!isValidEmailId(id)) {
		showMessage('error', "Please enter a valid email address");
		toogleElement(errorMsg,'block');
		return false;
	}
	
	toogleElement(errorMsg,'none');
	return true;
}

// Validates Date in mm-dd-yyyy format
function isValidDate(date) {
	if(date != null){

		if ( date.match(/^(\d{1,2})\-(\d{1,2})\-(\d{4})$/) ) {
			var dd = RegExp.$1;
			var mm = RegExp.$2;
			var yy = RegExp.$3;

			// try to create the same date using Date Object
			var dt = new Date(parseFloat(yy), parseFloat(mm)-1, parseFloat(dd), 0, 0, 0, 0);
			// invalid day
			if ( parseFloat(dd) != dt.getDate() ) { return false; }
			// invalid month
			if ( parseFloat(mm)-1 != dt.getMonth() ) { return false; }
			// invalid year
			if ( parseFloat(yy) != dt.getFullYear() ) { return false; }
			// everything fine
			return true;
		} else {
			// not even a proper date
			return false;
		}
	}
}

function chkFutureDate(elementId) {
	var date 			= document.getElementById(elementId);
	var currentDate		= new Date(curSystemDate);
	var manualDate 		= new Date(curSystemDate);

	var manualDateParts = new String(date.value).split("-");
	manualDate.setDate(parseInt(manualDateParts[0], 10));
	manualDate.setMonth(parseInt(manualDateParts[1] - 1, 10));
	manualDate.setFullYear(parseInt(manualDateParts[2], 10));
	
	if(manualDate.getTime() > currentDate.getTime()) {
		showMessage('error', iconForErrMsg + ' ' + 'Future Date not allowed !!');
		toogleElement('error','block');
		changeError1(date.id,'0','0');
		return false;
	} else {
		toogleElement('error','none');
		removeError(date.id);
	}
	
	return true;
}

function isValidEmailId(id) {
    let email = document.getElementById(id).value;
	
	if(email.length <= 0) return true;
	
	//var emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	let multipleEmailRegex = /^([\w.-]+@[\w.-]+\.[a-zA-Z]{2,})(,\s*[\w.-]+@[\w.-]+\.[a-zA-Z]{2,})*$/;

	return multipleEmailRegex.test(email);
}

function populateDestBranches(accountGroupId,srcSubRegion,target){
	var srcSubRegionId=srcSubRegion.options[srcSubRegion.selectedIndex].value;
	if(srcSubRegionId==0){
		var d=document.getElementById(target);
		d.options.length=1;
		if (allReqd==true)d.options[0].text= 'ALL';
		else d.options[0].text= '--Select Branch--';
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
		try	{
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (e) {
			try	{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (e){
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

	xmlHttp.onreadystatechange=function(){
		if(xmlHttp.readyState==4)		{

			var str=xmlHttp.responseText;
			// Replace '?' with '-'
			str=str.replace(/\?/g, '-');
			var tempQty = new Array();
			tempQty = str.split(",");

			var d=document.getElementById(target);
			d.options.length=1;
			d.options.length=tempQty.length;
			if(tempQty.length==1){
				return;
			}
			var html="";
			var i=1;

			if(browser=="IE"){
				if (allReqd==true){
					d.options[0].text= 'ALL';
					d.options[0].value=0;
					allReqd=false;
					}
				while (tempQty[i] != null) {
					var temp = new Array();
					temp=tempQty[i].split('=');
					d.options[i].text=temp[0];
					var m=parseInt(temp[1]);
					d.options[i].value=m;
					i=i+1;
				}
			}else{
				if((tempQty.length-1)==1){
					d.options[1].textContent=tempQty[1].split('=')[0];
					d.options[1].value=parseInt(tempQty[1].split('=')[1]);
					d.selectedIndex=1;
					return;
				}
				if (allReqd==true){
					d.options[0].text= 'ALL';
					d.options[0].value=0;
					allReqd=false;
					}

				while (tempQty[i] != null) {
					var temp = new Array();
					temp=tempQty[i].split('=');
					d.options[i].textContent=temp[0];

					var m=parseInt(temp[1]);
					d.options[i].value=m;
					i=i+1;
				}
			}
			sortDropDownList(target);
		}
	};
	xmlHttp.open("GET","jsp/ajaxinterface.jsp?filter=1&acc="+accountGroupId+"&subRegion="+srcSubRegionId,true);
	xmlHttp.send(null);
}

function populateDestBranchesByCity(accountGroupId,srcSubRegion,target){
	var srcSubRegionId=srcSubRegion.options[srcSubRegion.selectedIndex].value;
	if(srcSubRegionId==0){
		var d=document.getElementById(target);
		d.options.length=1;
		if (allReqd==true)d.options[0].text= 'ALL';
		else d.options[0].text= '--Select Branch--';
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
		try	{
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (e) {
			try	{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (e){
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
	
	xmlHttp.onreadystatechange=function(){
		if(xmlHttp.readyState==4)		{
			
			var str=xmlHttp.responseText;
			// Replace '?' with '-'
			str=str.replace(/\?/g, '-');
			var tempQty = new Array();
			tempQty = str.split(",");
			
			var d=document.getElementById(target);
			d.options.length=1;
			d.options.length=tempQty.length;
			if(tempQty.length==1){
				return;
			}
			var html="";
			var i=1;
			
			if(browser=="IE"){
				if (allReqd==true){
					d.options[0].text= 'ALL';
					d.options[0].value=0;
					allReqd=false;
				}
				while (tempQty[i] != null) {
					var temp = new Array();
					temp=tempQty[i].split('=');
					d.options[i].text=temp[0];
					var m=parseInt(temp[1]);
					d.options[i].value=m;
					i=i+1;
				}
			}else{
				if((tempQty.length-1)==1){
					d.options[1].textContent=tempQty[1].split('=')[0];
					d.options[1].value=parseInt(tempQty[1].split('=')[1]);
					d.selectedIndex=1;
					return;
				}
				if (allReqd==true){
					d.options[0].text= 'ALL';
					d.options[0].value=0;
					allReqd=false;
				}
				
				while (tempQty[i] != null) {
					var temp = new Array();
					temp=tempQty[i].split('=');
					d.options[i].textContent=temp[0];
					
					var m=parseInt(temp[1]);
					d.options[i].value=m;
					i=i+1;
				}
			}
			sortDropDownList(target);
		}
	};
	xmlHttp.open("GET","jsp/ajaxinterface.jsp?filter=26&acc="+accountGroupId+"&city="+srcSubRegionId,true);
	xmlHttp.send(null);
}

function populateAllActiveDestBranches(accountGroupId,srcCity,target){
	var srcCityId=srcCity.options[srcCity.selectedIndex].value;
	if(srcCityId==0){
		var d=document.getElementById(target);
		d.options.length=1;
		if (allReqd==true)d.options[0].text= 'ALL';
		else d.options[0].text= '--Select Branch--';
		d.options[0].value=0;
		return false;
	} else if(srcCityId==-1){
		var d=document.getElementById(target);
		d.options.length=1;
		if (allReqd==true)d.options[0].text= 'ALL';
		else d.options[0].text= '--Select Branch--';
		d.options[0].value=-1;
		return false;
	}
	var xmlHttp;
	try	{
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	}
	catch (e) {
		// Internet Explorer
		try	{
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (e) {
			try	{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (e){
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

	xmlHttp.onreadystatechange=function(){
		if(xmlHttp.readyState==4)		{

			var str=xmlHttp.responseText;
			// Replace '?' with '-'
			str=str.replace(/\?/g, '-');
			var tempQty = new Array();
			tempQty = str.split(",");

			var d=document.getElementById(target);
			d.options.length=1;
			d.options.length=tempQty.length;
			if(tempQty.length==1){
				return;
			}
			var i=1;

			if(browser=="IE"){
				if (allReqd==true){
					d.options[0].text= 'ALL';
					d.options[0].value=0;
					allReqd=false;
					}
				while (tempQty[i] != null) {
					var temp = new Array();
					temp=tempQty[i].split('=');
					d.options[i].text=temp[0];
					var m=parseInt(temp[1]);
					d.options[i].value=m;
					i=i+1;
				}
			}else{
				if((tempQty.length-1)==1){
					d.options[1].textContent=tempQty[1].split('=')[0];
					d.options[1].value=parseInt(tempQty[1].split('=')[1]);
					d.selectedIndex=1;
					return;
				}
				if (allReqd==true){
					d.options[0].text= 'ALL';
					d.options[0].value=0;
					allReqd=false;
					}

				while (tempQty[i] != null) {
					var temp = new Array();
					temp=tempQty[i].split('=');
					d.options[i].textContent=temp[0];

					var m=parseInt(temp[1]);
					d.options[i].value=m;
					i=i+1;
				}
			}
			sortDropDownList(target);
		}
	};
	xmlHttp.open("GET","jsp/ajaxinterface.jsp?filter=24&acc="+accountGroupId+"&city="+srcCityId,true);
	xmlHttp.send(null);
}

function populateDestBranchesWithSelect(accountGroupId,srcCity,target){
	var srcCityId=srcCity.options[srcCity.selectedIndex].value;
	if(srcCityId==0){
		var d=document.getElementById(target);
		d.options.length=1;
		if (allReqd==true)d.options[0].text= 'ALL';
		else d.options[0].text= '--Select Branch--';
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
		try	{
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (e) {
			try	{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (e){
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

	xmlHttp.onreadystatechange=function(){
		if(xmlHttp.readyState==4)		{

			var str=xmlHttp.responseText;
			// Replace '?' with '-'
			str=str.replace(/\?/g, '-');
			var tempQty = new Array();
			tempQty = str.split(",");

			var d=document.getElementById(target);
			d.options.length=1;
			d.options.length=tempQty.length;
			if(tempQty.length==1){
				return;
			}
			var i=1;

			if(browser=="IE"){
				if (allReqd==true){
					d.options[0].text= 'ALL';
					d.options[0].value=0;
					allReqd=false;
				}
				while (tempQty[i] != null) {
					var temp = new Array();
					temp=tempQty[i].split('=');
					d.options[i].text=temp[0];
					var m=parseInt(temp[1]);
					d.options[i].value=m;
					i=i+1;
				}
			}else{
				if (allReqd==true){
					d.options[0].text= 'ALL';
					d.options[0].value=0;
					allReqd=false;
				}
				while (tempQty[i] != null) {
					var temp = new Array();
					temp=tempQty[i].split('=');
					d.options[i].textContent=temp[0];

					var m=parseInt(temp[1]);
					d.options[i].value=m;
					i=i+1;
				}
			}
			sortDropDownList(target);
		}
	};
	xmlHttp.open("GET","jsp/ajaxinterface.jsp?filter=1&acc="+accountGroupId+"&city="+srcCityId,true);
	xmlHttp.send(null);
}

function populateSelfGroupBranches(accountGroupId,srcCity,target) {
	var srcCityId=srcCity.options[srcCity.selectedIndex].value;
	if(srcCityId==0){
		var d=document.getElementById(target);
		d.options.length=1;
		if (allReqd==true)d.options[0].text= 'ALL';
		else d.options[0].text= '--Select Branch--';
		d.options[0].value=0;
		return false;

	}
	var xmlHttp;
	try
	{
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	}
	catch (e)
	{
		// Internet Explorer
		try
		{
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (e)
		{
			try
			{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (e)
			{
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

	xmlHttp.onreadystatechange=function()
	{
		if(xmlHttp.readyState==4)
		{

			var str=xmlHttp.responseText;
			// Replace '?' with '-'
			str=str.replace(/\?/g, '-');
			var tempQty = new Array();
			tempQty = str.split(",");

			var d=document.getElementById(target);
			d.options.length=1;
			d.options.length=tempQty.length;
			if(tempQty.length==1){
				return;
			}
			var i=1;

			if(browser=="IE"){
				if (allReqd==true){
					d.options[0].text= 'ALL';
					d.options[0].value=0;
					allReqd=false;
					}
				while (tempQty[i] != null) {
					var temp = new Array();
					temp=tempQty[i].split('=');
					d.options[i].text=temp[0];
					var m=temp[1];
					d.options[i].value=m;
					i=i+1;
				}
			}else{
				if((tempQty.length-1)==1){
					d.options[1].textContent=tempQty[1].split('=')[0];
					d.options[1].value=tempQty[1].split('=')[1];
					d.selectedIndex=1;
					return;
				}
				if (allReqd==true){
					d.options[0].text= 'ALL';
					d.options[0].value=0;
					allReqd=false;
					}

				while (tempQty[i] != null) {
					var temp = new Array();
					temp=tempQty[i].split('=');
					d.options[i].textContent=temp[0];

					var m=temp[1];
					d.options[i].value=m;
					// ("d.options[i].textContent="+d.options[i].textContent);
					i=i+1;
				}
			}
			sortDropDownList(target);
		}
	};

	xmlHttp.open("GET","jsp/ajaxinterface.jsp?filter=12&acc="+accountGroupId+"&city="+srcCityId,true);
	xmlHttp.send(null);
}

function populateBranchesExecutives(accountGroupId,srcCity,target){
	var srcCityId=srcCity.options[srcCity.selectedIndex].value;
	if(srcCityId==0){
		var d=document.getElementById(target);
		d.options.length=1;
		if (allReqd==true)d.options[0].text= 'ALL';
		else d.options[0].text= '--Select Branch--';
		d.options[0].value=0;
		return false;
	}
	var xmlHttp;
	try	{
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	}
	catch (e){
		// Internet Explorer
		try {
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (e){
			try {
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (e){
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

	xmlHttp.onreadystatechange=function(){
		if(xmlHttp.readyState==4){

			var str=xmlHttp.responseText;
			// Replace '?' with '-'
			str=str.replace(/\?/g, '-');
			var tempQty = new Array();
			tempQty = str.split(",");

			var d=document.getElementById(target);
			d.options.length=1;
			d.options.length=tempQty.length;
			if(tempQty.length==1){
				return;
			}
			var html="";
			var i=1;

			if(browser=="IE"){
				if (allReqd==true){
					d.options[0].text= 'ALL';
					d.options[0].value=0;
					allReqd=false;
					}
				while (tempQty[i] != null) {
					var temp = new Array();
					temp=tempQty[i].split('=');
					d.options[i].text=temp[0];
					var m=parseInt(temp[1]);
					d.options[i].value=m;
					i=i+1;
				}
			}else{
				if((tempQty.length-1)==1){
					d.options[1].textContent=tempQty[1].split('=')[0];
					d.options[1].value=parseInt(tempQty[1].split('=')[1]);
					d.selectedIndex=1;
					populateExecutive(d, true);
					return;
				} else {
					populateExecutive(d, true);
				}
				if (allReqd==true){
					d.options[0].text= 'ALL';
					d.options[0].value=0;
					allReqd=false;
					}

				while (tempQty[i] != null) {
					var temp = new Array();
					temp=tempQty[i].split('=');
					d.options[i].textContent=temp[0];

					var m=parseInt(temp[1]);
					d.options[i].value=m;
					i=i+1;
				}
			}
			sortDropDownList(target);
		}
	};
	xmlHttp.open("GET","jsp/ajaxinterface.jsp?filter=1&acc="+accountGroupId+"&city="+srcCityId,true);
	xmlHttp.send(null);
}

function populateSrcBranches(accountGroupId,city,target,branchId){
	var cityId=city.options[city.selectedIndex].value;
	if(cityId==0){
		var d=document.getElementById(target);
		d.options.length=1;
		d.options[0].text= '--Select Branch--';
		d.options[0].value=0;
		return false;
	}
	var xmlHttp;
	try	{
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	}
	catch (e){
		// Internet Explorer
		try	{
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (e){
			try	{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (e){
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

	xmlHttp.onreadystatechange=function(){
		if(xmlHttp.readyState==4){

			var str=xmlHttp.responseText;
			// Replace '?' with '-'
			str=str.replace(/\?/g, '-');
			// Store CityId of branches
			destBranchCityId=str.substring(str.lastIndexOf('=')+1, str.length);
			var tempQty = new Array();
			tempQty = str.split(",");
			var d=document.getElementById(target);
			d.options.length=1;
			d.options.length=tempQty.length;
			if(tempQty.length==1){
				return;
			}
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
				if((tempQty.length-1)==1){
					d.options[1].textContent=tempQty[1].split('=')[0];
					d.options[1].value=parseInt(tempQty[1].split('=')[1]);
					d.selectedIndex=1;
					return;
				}
				if (allReqd==true){
					d.options[0].text= 'ALL';
					d.options[0].value=0;
					allReqd=false;
					}

				while (tempQty[i] != null) {
					var temp = new Array();
					temp=tempQty[i].split('=');
					d.options[i].textContent=temp[0];

					var m=parseInt(temp[1]);
					d.options[i].value=m;
					i=i+1;
				}
			}
			sortDropDownList(target);
		}
	};
	xmlHttp.open("GET","jsp/ajaxinterface.jsp?filter=0&acc="+accountGroupId+"&city="+cityId+"&branchId="+branchId,true);
	xmlHttp.send(null);
}

function populateDestBranchesForDelivery(accountGroupId,srcCity,target,branchId){
	var srcCityId=srcCity.options[srcCity.selectedIndex].value;
	if(srcCityId==0){
		var d=document.getElementById(target);
		d.options.length=1;
		d.options[0].text= '--Select Branch--';
		d.options[0].value=0;
		return false;
	}
	var xmlHttp;
	try	{
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	}
	catch (e){
		// Internet Explorer
		try	{
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (e){
			try	{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (e){
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

	xmlHttp.onreadystatechange=function(){
		if(xmlHttp.readyState==4){

			var str=xmlHttp.responseText;
			// Replace '?' with '-'
			str=str.replace(/\?/g, '-');
			// Store CityId of branches
			destBranchCityId=str.substring(str.lastIndexOf('=')+1, str.length);
			var tempQty = new Array();
			tempQty = str.split(",");
			var d=document.getElementById(target);
			d.options.length=1;
			d.options.length=tempQty.length;
			if(tempQty.length==1){
				return;
			}
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
				if((tempQty.length-1)==1){
					d.options[1].textContent=tempQty[1].split('=')[0];
					d.options[1].value=parseInt(tempQty[1].split('=')[1]);
					d.selectedIndex=1;
					return;
				}
				if (allReqd==true){
					d.options[0].text= 'ALL';
					d.options[0].value=0;
					allReqd=false;
					}

				while (tempQty[i] != null) {
					var temp = new Array();
					temp=tempQty[i].split('=');
					d.options[i].textContent=temp[0];

					var m=parseInt(temp[1]);
					d.options[i].value=m;
					i=i+1;
				}
			}
			sortDropDownList(target);
		}
	};
	xmlHttp.open("GET","jsp/ajaxinterface.jsp?filter=0&acc="+accountGroupId+"&city="+srcCityId+"&branchId="+branchId,true);
	xmlHttp.send(null);
}

/*function populateActiveDestBranchesForDelivery(accountGroupId,srcCity,target,branchId){
	var srcCityId=srcCity.options[srcCity.selectedIndex].value;
	if(srcCityId==0){
		var d=document.getElementById(target);
		d.options.length=1;
		d.options[0].text= '--Select Branch--';
		d.options[0].value=0;
		return false;
	}
	var xmlHttp;
	try	{
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	}
	catch (e){
		// Internet Explorer
		try	{
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (e){
			try	{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (e){
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

	xmlHttp.onreadystatechange=function(){
		if(xmlHttp.readyState==4){

			var str=xmlHttp.responseText;
			// Replace '?' with '-'
			str=str.replace(/\?/g, '-');
			// Store CityId of branches
			destBranchCityId=str.substring(str.lastIndexOf('=')+1, str.length);
			var tempQty = new Array();
			tempQty = str.split(",");
			var d=document.getElementById(target);
			d.options.length=1;
			d.options.length=tempQty.length;
			if(tempQty.length==1){
				return;
			}
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
				if((tempQty.length-1)==1){
					d.options[1].textContent=tempQty[1].split('=')[0];
					d.options[1].value=parseInt(tempQty[1].split('=')[1]);
					d.selectedIndex=1;
					return;
				}
				if (allReqd==true){
					d.options[0].text= 'ALL';
					d.options[0].value=0;
					allReqd=false;
				}

				while (tempQty[i] != null) {
					var temp = new Array();
					temp=tempQty[i].split('=');
					d.options[i].textContent=temp[0];

					var m=parseInt(temp[1]);
					d.options[i].value=m;
					i=i+1;
				}
			}
			sortDropDownList(target);
		}
	};
	xmlHttp.open("GET","jsp/ajaxinterface.jsp?filter=13&acc="+accountGroupId+"&city="+srcCityId+"&branchId="+branchId,true);
	xmlHttp.send(null);
}*/

function populateAllBranches(accountGroupId,srcCity,target){
	var srcCityId=srcCity.options[srcCity.selectedIndex].value;
	if(srcCityId==0){
		var d=document.getElementById(target);
		d.options.length=1;
		if (allReqd==true)d.options[0].text= 'ALL';
		else d.options[0].text= '--Select Branch--';
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
		try	{
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (e) {
			try	{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (e){
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

	xmlHttp.onreadystatechange=function(){
		if(xmlHttp.readyState==4)		{

			var str=xmlHttp.responseText;
			// Replace '?' with '-'
			str=str.replace(/\?/g, '-');
			var tempQty = new Array();
			tempQty = str.split(",");

			var d=document.getElementById(target);
			d.options.length=1;
			d.options.length=tempQty.length;
			if(tempQty.length==1){
				return;
			}
			var html="";
			var i=1;

			if(browser=="IE"){
				if (allReqd==true){
					d.options[0].text= 'ALL';
					d.options[0].value=0;
					allReqd=false;
					}
				while (tempQty[i] != null) {
					var temp = new Array();
					temp=tempQty[i].split('=');
					d.options[i].text=temp[0];
					var m=parseInt(temp[1]);
					d.options[i].value=m;
					i=i+1;
				}
			}else{
				if((tempQty.length-1)==1){
					d.options[1].textContent=tempQty[1].split('=')[0];
					d.options[1].value=parseInt(tempQty[1].split('=')[1]);
					d.selectedIndex=1;
					return;
				}
				if (allReqd==true){
					d.options[0].text= 'ALL';
					d.options[0].value=0;
					allReqd=false;
					}

				while (tempQty[i] != null) {
					var temp = new Array();
					temp=tempQty[i].split('=');
					d.options[i].textContent=temp[0];

					var m=parseInt(temp[1]);
					d.options[i].value=m;
					i=i+1;
				}
			}
			sortDropDownList(target);
		}
	};
	xmlHttp.open("GET","jsp/ajaxinterface.jsp?filter=21&acc="+accountGroupId+"&city="+srcCityId,true);
	xmlHttp.send(null);
}

function populateDestBranchesForMultiLogins(accountGroupId,srcCity,target){
	var srcCityId=srcCity.options[srcCity.selectedIndex].value;
	if(srcCityId==0){
		var d=document.getElementById(target);
		d.options.length=1;
		d.options[0].text= '--Select Branch--';
		d.options[0].value=0;
		return false;

	}
	var xmlHttp;
	try
	{
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	}
	catch (e)
	{
		// Internet Explorer
		try
		{
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (e)
		{
			try
			{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (e)
			{
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

			var str = xmlHttp.responseText;
			// Replace '?' with '-'
			str=str.replace(/\?/g, '-');
			// Store CityId of branches
			destBranchCityId=str.substring(str.lastIndexOf(':')+1, str.length);
			str=str.substring(0,str.lastIndexOf(':'));
			var tempQty = new Array();
			tempQty = str.split(",");
			var d=document.getElementById(target);
			d.options.length=1;
			d.options.length=tempQty.length;
			if(tempQty.length==1){
				return;
			}
			var html="";
			var i=1;

			if(browser=="IE"){
				while (tempQty[i] != null) {
					var temp = new Array();
					temp=tempQty[i].split('=');
					d.options[i].text=temp[0];

					var m=temp[1];
					d.options[i].value=m;
					i=i+1;
				}
			}else{
				if((tempQty.length-1)==1){
					d.options[1].textContent=tempQty[1].split('=')[0];
					d.options[1].value=tempQty[1].split('=')[1];
					d.selectedIndex=1;
					return;
				}
				if (allReqd==true){
					d.options[0].text= 'ALL';
					d.options[0].value=0;
					allReqd=false;
				}

				while (tempQty[i] != null) {
					var temp = new Array();
					temp=tempQty[i].split('=');
					d.options[i].textContent=temp[0];

					var m=temp[1];
					d.options[i].value=m;
					i=i+1;
				}
			}
		}
	}

	xmlHttp.open("GET","jsp/ajaxinterface.jsp?filter=10&acc="+accountGroupId+"&city="+srcCityId,true);
	xmlHttp.send(null);
}

function populateBranchesForBooking(accountGroupId,srcCity,target){
	var srcCityId=srcCity.options[srcCity.selectedIndex].value;
	if(srcCityId==0){
		var d=document.getElementById(target);
		d.options.length=1;
		d.options[0].text= '--Select Branch--';
		d.options[0].value=0;
		return false;
	}
	var xmlHttp;
	try	{
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	}
	catch (e){
		// Internet Explorer
		try {
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (e){
			try	{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (e){
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

	xmlHttp.onreadystatechange=function(){
		if(xmlHttp.readyState==4){

			var str=xmlHttp.responseText;
			// Replace '?' with '-'
			str=str.replace(/\?/g, '-');
			var tempQty = new Array();
			tempQty = str.split(",");

			var d=document.getElementById(target);
			d.options.length=1;
			d.options.length=tempQty.length;
			if(tempQty.length==1){
				return;
			}
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

				if((tempQty.length-1)==1){
					d.options[1].textContent=tempQty[1].split('=')[0];
					d.options[1].value=parseInt(tempQty[1].split('=')[1]);
					d.selectedIndex=1;
					return;
				}

				if (allReqd==true) {
					d.options[0].text= 'ALL';
					d.options[0].value=0;
					allReqd=false;
				} /*else {
					d.options[0].text= '-Select Branch-';
					d.options[0].value=0;
				}*/

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
		sortDropDownList(target);
	};

	xmlHttp.open("GET","jsp/ajaxinterface.jsp?filter=7&acc="+accountGroupId+"&city="+srcCityId,true);
	xmlHttp.send(null);
}

function populateOwnGroupBranchesForBooking(accountGroupId,srcCity,target){
	var srcCityId=srcCity.options[srcCity.selectedIndex].value;
	if(srcCityId==0){
		var d=document.getElementById(target);
		d.options.length=1;
		d.options[0].text= '--Select Branch--';
		d.options[0].value=0;
		return false;
	}
	var xmlHttp;
	try	{
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	}
	catch (e){
		// Internet Explorer
		try {
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (e){
			try	{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (e){
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

	xmlHttp.onreadystatechange=function(){
		if(xmlHttp.readyState==4){

			var str=xmlHttp.responseText;
			// Replace '?' with '-'
			str=str.replace(/\?/g, '-');
			var tempQty = new Array();
			tempQty = str.split(",");

			var d=document.getElementById(target);
			d.options.length=1;
			d.options.length=tempQty.length;
			if(tempQty.length==1){
				return;
			}
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

				if((tempQty.length-1)==1){
					d.options[1].textContent=tempQty[1].split('=')[0];
					d.options[1].value=parseInt(tempQty[1].split('=')[1]);
					d.selectedIndex=1;
					return;
				}

				if (allReqd==true) {
					d.options[0].text= 'ALL';
					d.options[0].value=0;
					allReqd=false;
				} /*else {
					d.options[0].text= '-Select Branch-';
					d.options[0].value=0;
				}*/

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
		sortDropDownList(target);
	};

	xmlHttp.open("GET","jsp/ajaxinterface.jsp?filter=7&acc="+accountGroupId+"&city="+srcCityId+"&IsOwnGroupBranchesRequired="+true,true);
	xmlHttp.send(null);
}


function populateDestBranchesForSelf(accountGroupId,srcCity,branchId,target){
	var srcCityId=srcCity.options[srcCity.selectedIndex].value;
	if(srcCityId==0){
		var d=document.getElementById(target);
		d.options.length=1;
		if (allReqd==true)d.options[0].text= 'ALL';
			else d.options[0].text= '--Select Branch--';
		d.options[0].value=0;
		return false;
	}
	var xmlHttp;
	try	{
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	}
	catch (e){
		// Internet Explorer
		try	{
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (e){
			try	{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (e){
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

	xmlHttp.onreadystatechange=function(){
		if(xmlHttp.readyState==4){

			var str=xmlHttp.responseText;
			// Replace '?' with '-'
			str=str.replace(/\?/g, '-');
			var tempQty = new Array();
			tempQty = str.split(",");

			var d=document.getElementById(target);
			d.options.length=1;
			if(branchId==m) d.options.length=2;
			else  d.options.length=tempQty.length;
			if(tempQty.length==1){
				return;
			}
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

				if((tempQty.length-1)==1){
					d.options[1].textContent=tempQty[1].split('=')[0];
					d.options[1].value=parseInt(tempQty[1].split('=')[1]);
					d.selectedIndex=1;
					return;
				}
				if (allReqd==true){
					d.options[0].text= 'ALL';
					d.options[0].value=0;
					allReqd=false;
					}
				while (tempQty[i] != null) {
					var temp = new Array();
					temp=tempQty[i].split('=');
					var m=parseInt(temp[1]);
					if(branchId!=m)
					{
						d.options[i].textContent=temp[0];
						d.options[i].value=m;
						i=i+1;
					}
					else {
					d.options[1].textContent=temp[0];
					d.options[1].value=m;
					d.options.length=2;
					break;
					}
				}
			}
		}
	};
	xmlHttp.open("GET","jsp/ajaxinterface.jsp?filter=0&acc="+accountGroupId+"&city="+srcCityId+"&branchId="+branchId,true);
	xmlHttp.send(null);
}

function loginFormValidations(){

	// Basic info validations
	var str=document.getElementById('username');
	var username = str.value;

	if(username.length== 0){
		showSpecificErrors('loginError',"Please enter username.");
		toogleElement('loginError','block');
		return false;
	}else{
		toogleElement('loginError','none');
	}

	str=document.getElementById('password');
	var password = str.value;

	if(password.length== 0){
		showSpecificErrors('loginError',"Please enter password.");
		toogleElement('loginError','block');
		return false;
	}else{
		toogleElement('loginError','none');
	}
	loginForm.submit();
}

function populateBranchesByAgency(accountGroupId,agencyId){

	var agencyId=agencyId.options[agencyId.selectedIndex].value;

	if(agencyId==0){
		var d=document.getElementById('Branch');
		d.options.length=1;
		d.options[0].text=Select;
		d.options[0].value=0;
	}

	var xmlHttp;
	try	{
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	}
	catch (e){
		// Internet Explorer
		try	{
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (e){
			try	{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (e){
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

	xmlHttp.onreadystatechange=function(){
		if(xmlHttp.readyState==4){
			var str=xmlHttp.responseText;
			// Replace '?' with '-'
			str=str.replace(/\?/g, '-');
			var tempQty = new Array();
			tempQty = str.split(",");

			var d=document.getElementById('Branch');
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

				var de=document.getElementById('Executive');
				de.options.length=1;
				de.options[i].text='ALL';
				d.options[i].value=0;
			}
		}
	};
	xmlHttp.open("GET","jsp/ajaxinterface.jsp?filter=3&acc="+accountGroupId+"&agency="+agencyId,true);
	xmlHttp.send(null);
}

function populateExecutive(bId, displaySuperAdmin,displayOnlyActiveUsers){
var branchId=bId.options[bId.selectedIndex].value;
	if(branchId=='0'){
		var d=document.getElementById('Executive');
		d.options.length=1;
		if(execReqd==true){
			d.options[0].text= '--- Select Executive ---';
		}else{
			d.options[0].text= 'ALL';
		}
		d.options[0].value=0;
		return false;
	}

	var xmlHttp;
	try	{
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	}
	catch (e){
		// Internet Explorer
		try	{
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (e){
			try	{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (e){
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
	xmlHttp.onreadystatechange=function(){

		if(xmlHttp.readyState==4){
			var str=xmlHttp.responseText;
			String.prototype.trim = function () {
			    return this.replace(/^\s*/, "").replace(/\s*$/, "");
			};
			str = str.trim();
			var d=document.getElementById('Executive');
			if(str == '')
			{
				d.length=1;
				d.options[0].value = '0';
				if(browser=="IE"){
					d.options[0].text= 'No Executive';
				}else{
					d.options[0].textContent='No Executive';
				}
			} else {
				if(execReqd==true){
				d.options[0].text= '--- Select Executive ---';}
				else{d.options[0].text= 'ALL';}

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
			execReqd=false;

			}
		}
	};
	xmlHttp.open("GET","jsp/ajaxinterface.jsp?filter=5&branch="+branchId+'&displaySuperAdmin='+displaySuperAdmin+'&displayOnlyActiveUsers='+displayOnlyActiveUsers,true);
	xmlHttp.send(null);
}

function populateExecutiveByBranch(bId){
	var branchId=bId.options[bId.selectedIndex].value;
	if(branchId=='0'){
		var d=document.getElementById('Executive');
		d.options.length=1;
		d.options[0].text='ALL';
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
			var d=document.getElementById('Executive');
			if(str == '') {
				d.length=1;
				d.options[0].value = '0';
				if(browser=="IE"){
					d.options[0].text= 'No Executive';
				}else{
					d.options[0].textContent='No Executive';
				}
			} else {
				if(execReqd==true){
				d.options[0].text= 'Select';}
				else{d.options[0].text= 'ALL';}

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
			execReqd=false;

			}
		}
	};
	xmlHttp.open("GET","jsp/ajaxinterface.jsp?filter=5&branch="+branchId,true);
	xmlHttp.send(null);
}

function IsNumeric(sText){

	var ValidChars = "0123456789.";
	var IsNumber=true;
	var Char;
	var dot = 0;

	for (i = 0; i < sText.length && IsNumber == true; i++) {
		Char = sText.charAt(i);
			if(Char == ".") {
				dot = dot + 1;
			}

		if ((ValidChars.indexOf(Char) == -1) || (dot > 1))
		IsNumber = false;
	}
	return IsNumber;
}

// Method to disable all buttons of a form that cause form submit
function disableForm(theform) {
	if (document.all || document.getElementById) {
		for (i = 0; i < theform.length; i++) {
			var tempobj = theform.elements[i];
			if (tempobj.type.toLowerCase() == "button" || tempobj.type.toLowerCase() == "reset")
				{tempobj.disabled = true;
				}
		}
	return false;
	}
}
// to hide two buttons
function hideButtons(btn1,btn2){  
	var dispatchButton = document.getElementById(btn1);
	var delButton	   = document.getElementById(btn2);
		if(dispatchButton != null){
			dispatchButton.className = 'btn_print_disabled';
			dispatchButton.style.display ='none'; 
			dispatchButton.disabled=true;
		}
		if(delButton != null){
			delButton.className = 'btn_print_disabled';
			delButton.style.display ='none'; 
			delButton.disabled=true;
		}
}

// Method to check selected City CityId and selected Branch cityId

function checkDestBranchCity(cityCombo) {
	if(document.getElementById(cityCombo).value!=parseInt(destBranchCityId))
		return false;
	else return true;
}

function validateContactForSms(obj) {
	if(obj.value.length==10 ||obj.value.length==0) {
		toogleElement('basicError','none');
		removeError(obj.id);
		return true;
	} else{
		if(obj.value !='0000000000'){
		showSpecificErrors('basicError',"Phone Number may be incorrect, Please Check !");
		toogleElement('basicError','block');
		changeError1(obj.id,'0','0');
		return false;
		}
	}
}

function allowAlphanumeric(evt) {
	if (evt.ctrlKey == 1) {
		toogleElement('basicError','none');
		return true;
	} else {
		var keynum = null;

		if(window.event){ // IE
			keynum = evt.keyCode;
		} else if(evt.which){ // Netscape/Firefox/Opera
			keynum = evt.which;
		}

		if(keynum == 8 || keynum == 13 || keynum == null) {
			toogleElement('basicError','none');
			return true;
		}

		var charStr = String.fromCharCode(keynum);
		if (/[a-z0-9]/i.test(charStr)) {
			toogleElement('basicError','none');
			return true;
		} else {
			showSpecificErrors('basicError',"Only A-Z and 0-9 allowed, No other Character Allowed !");
			toogleElement('basicError','block');
			return false;
		}
	}
}

function validateMobileNumberForSms(obj) {
	if(obj.value.length==10 ||obj.value.length==0) {
		toogleElement('basicError','none');
		removeError(obj.id);
		return true;
	} else{
		if(obj.value !='0000000000'){
		showSpecificErrors('basicError',"Mobile Number may be incorrect, Please Check !  If you don't have Number, please enter zero ten times.");
		toogleElement('basicError','block');
		changeError1(obj.id,'0','0');
		return false;
		}
	}
}

function findPos(obj) {
	var curleft = curtop = 0;
	if (obj.offsetParent) {
		curleft = obj.offsetLeft;
		curtop = obj.offsetTop;
		while (obj = obj.offsetParent) {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		}
	}
	return [curleft,curtop];
}

function showNoOfDigits(elObj,divName){
	div=document.getElementById(divName);
	var elPos= findPos(elObj);
	div.style.left=elPos[0]+'px';
	div.style.top=elPos[1] -16 +'px';
	div.innerHTML='Digits : '+elObj.value.length;
}

function sortDropDownList(targetId) {
	var ddl = document.getElementById(targetId);
	var selectedValue = ddl.options[ddl.selectedIndex] != undefined ? ddl.options[ddl.selectedIndex].value : 0;
	var selectedIndex = null;
	var arrTexts = new Array();
	var txtAndVal = new Array();

	for(var i=0; i<ddl.length; i++){
		arrTexts[i] = ddl.options[i].text.toLowerCase()+'$$'+ddl.options[i].text+'^^'+ddl.options[i].value;
	}
	
	arrTexts.sort();
	
	for(i=0; i<ddl.length; i++){
		txtAndVal = arrTexts[i].split("$$")[1].split("^^");
		ddl.options[i].text = txtAndVal[0];
		ddl.options[i].value = txtAndVal[1];
		if(txtAndVal[1]==selectedValue){selectedIndex=i;}
	}
	ddl.options.selectedIndex= selectedIndex;
}

function sortDropDownListForAllAtDown(targetId,selectedItem) {
	var lb = document.getElementById(targetId);
	var selectedValue=lb.options[lb.selectedIndex].value;
	var selectedIndex=null;
	arrTexts = new Array();
	arrValues = new Array();
	arrOldTexts = new Array();

	for(var i=0; i<lb.length; i++){
		if(i+1 != lb.length){
			arrTexts[i] = lb.options[i+1].text;
			arrValues[i] = lb.options[i+1].value;
			arrOldTexts[i] = lb.options[i+1].text;
		}
	}

	arrTexts.sort();

	for(var i=0; i<lb.length; i++){
		if(i+1 != lb.length){
			lb.options[i+1].text = arrTexts[i];
			for(var j=0; j<lb.length; j++){
				if (arrTexts[i] == arrOldTexts[j]){
					lb.options[i+1].value = arrValues[j];
					if(arrValues[j]==selectedValue){selectedIndex=i+1;}
						j = lb.length;
				}
			}
		}
	}
	lb.options.selectedIndex= selectedIndex;
	populateAllAtDown(targetId,selectedItem);
}

function populateAllAtDown(targetId,selectedItem) {
	var target = document.getElementById(targetId);
	//alert(target.options.length);
	target.options.length = (target.options.length) + 1;
	//alert(target.options.length);
	target.options[target.options.length-1].text  = 'ALL';
	target.options[target.options.length-1].value = 0;
	for(var i=0; i<target.length; i++){
		if(target.options[i].value == selectedItem) { target.options.selectedIndex = i; }
	}
	return false;
};

function getCurrrentDate(){ //Returns Current System Date in dd-mm-yyyy format
	return makeTwoChars(curSystemDate.getDate())+'-'+ makeTwoChars(curSystemDate.getMonth()+1)+'-'+curSystemDate.getFullYear();
}

function initialiseDatePickers() {
	if(document.getElementById("toDate")!=null){
    // Add the onchange event handler to the start date input
    datePickerController.addEvent(document.getElementById("fromDate"), "change", setToDate);
    datePickerController.getDatePicker("toDate").setRangeHigh(curSystemDate.getFullYear()+''+makeTwoChars(curSystemDate.getMonth()+1)+''+makeTwoChars(curSystemDate.getDate()));
	}
}

function setToDate(){
	var fromDate = datePickerController.getDatePicker("fromDate");
    var toDate = datePickerController.getDatePicker("toDate");
	var dtLow = datePickerController.dateFormat(document.getElementById("fromDate").value, fromDate.format.charAt(0) == "m");;
	var dtHigh = getCustomDate(document.getElementById("fromDate").value,'month',null);
	document.getElementById("toDate").value=document.getElementById("fromDate").value;
    toDate.setRangeLow(dtLow);
    toDate.setRangeHigh(dtHigh.getFullYear()+''+makeTwoChars(dtHigh.getMonth()+1)+''+makeTwoChars(dtHigh.getDate()));
}

if(typeof datePickerController != 'undefined') {
datePickerController.addEvent(window, 'load', initialiseDatePickers);
}

function populateSubRegionsByRegionId(regionId,targetId,isDefaultSelect,isListAll) {
	var target = document.getElementById(targetId);
	if(regionId<=0){
		target.options.length=1;
		target.options[0].text=(allReqd)? 'ALL':'---- Sub Region ----';
		target.options[0].value=0;
		return false;
	}
	var xmlHttp;
	try	{
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	} catch (e) {
		// Internet Explorer
		try	{
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try	{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {
				alert("Your browser does not support AJAX!");
				return false;
			}
		}
	}
	xmlHttp.onreadystatechange = function() {
		if(xmlHttp.readyState == 4) {
			var str = xmlHttp.responseText;
			str = str.replace(/\?/g, '-').trim();// Replace '?' with '-'
			if(/error/i.test(str)){
				target.options.length=1;
				target.options[0].text= '---- Sub Region ----';
				target.options[0].value=0;
				alert(str);
				return;
			}
			var tempQty = str.split(",");
			target.options.length	= parseInt(tempQty.length) + 1;
			target.options[0].text	= (allReqd)?'ALL':'---- Sub Region ----';
			target.options[0].value	= 0;
			target.selectedIndex=0;

			if((tempQty.length)==1 && isDefaultSelect){
				target.options.length=tempQty.length;
				target.options[0].textContent=tempQty[0].split('=')[0];
				target.options[0].value=parseInt(tempQty[0].split('=')[1]);
				target.selectedIndex=0;
				return;
			}

			var i=0;
			while(tempQty[i] != null) {
				var temp = new Array();
				temp=tempQty[i].split('=');
				target.options[i+1].textContent=temp[0];
				var m=parseInt(temp[1]);
				target.options[i+1].value=m;
				i=i+1;
			}
			sortDropDownList(targetId);
		}
	};
	xmlHttp.open("GET","jsp/transport/ajaxinterfaceForTransport.jsp?filter=3&regionId="+regionId+"&isListAll="+isListAll,true);
	xmlHttp.send(null);
}

function populateSubRegionsByRegionIdWithAllOptionAtDown(regionId,targetId,isDefaultSelect,isListAll) {
	var target = document.getElementById(targetId);
	
	if(regionId<0){
		target.options.length=1;
		target.options[0].text='---- Area ----';
		target.options[0].value='-1';
		return false;
	}else if(regionId==0){
		target.options.length=1;
		target.options[0].text='ALL';
		target.options[0].value='0';
		return false;
		}
	var xmlHttp;
	try	{
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	} catch (e) {
		// Internet Explorer
		try	{
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try	{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {
				alert("Your browser does not support AJAX!");
				return false;
			}
		}
	}
	xmlHttp.onreadystatechange = function() {
		if(xmlHttp.readyState == 4) {
			var str = xmlHttp.responseText;
			str = str.replace(/\?/g, '-').trim();// Replace '?' with '-'
			if(/error/i.test(str)){
				alert(str);
				return;
			}
			var tempQty = new Array();
			tempQty = str.split(",");
			target.options.length	= parseInt(tempQty.length) + 1;
			target.options[0].text	= '---- Area ----';
			target.options[0].value	= '-1';
			target.selectedIndex=0;

			if((tempQty.length)==1 && isDefaultSelect){
				target.options.length=tempQty.length;
				target.options[0].textContent=tempQty[0].split('=')[0];
				target.options[0].value=parseInt(tempQty[0].split('=')[1]);
				target.selectedIndex=0;
				return;
			}

			var i=0;
			while(tempQty[i] != null) {
				var temp = new Array();
				temp=tempQty[i].split('=');
				target.options[i+1].textContent=temp[0];
				var m=parseInt(temp[1]);
				target.options[i+1].value=m;
				i=i+1;
			}
			sortDropDownList(targetId);

			if(allReqd){
				//alert(target.options.length);
				target.options.length = (target.options.length) + 1;
				//alert(target.options.length);
				target.options[target.options.length-1].text  = 'ALL';
				target.options[target.options.length-1].value = 0;
				return false;
			}
		}
	};
	xmlHttp.open("GET","jsp/transport/ajaxinterfaceForTransport.jsp?filter=3&regionId="+regionId+"&isListAll="+isListAll,true);
	xmlHttp.send(null);
}

function populateOwnGroupBranchesBySubRegionId(obj,targetId,isDefaultSelect,isListAll){
	
	var subRegionId		= obj.value;
	
	var target = document.getElementById(targetId);
	if(subRegionId<0){
		target.options.length=1;
		target.options[0].text=(allReqd)? 'ALL':'----  Select Branch  ----';
		target.options[0].value=0;
		return false;
	}else if(subRegionId==0){
		target.options.length=1;
		target.options[0].text='ALL';
		target.options[0].value='0';
		return false;
	}
	var xmlHttp;
	try	{
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	} catch (e) {
		// Internet Explorer
		try	{
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try	{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {
				alert("Your browser does not support AJAX!");
				return false;
			}
		}
	}
	xmlHttp.onreadystatechange = function() {
		if(xmlHttp.readyState == 4) {
			var str = xmlHttp.responseText;
			str = str.replace(/\?/g, '-').trim();// Replace '?' with '-'
			if(/error/i.test(str)){
				alert(str);
				return;
			}
			var tempQty = new Array();
			tempQty = str.split(",");
			target.options.length	= parseInt(tempQty.length) + 1;
			target.options[0].text	= (allReqd)?'ALL':'---- Select Branch  ----';
			target.options[0].value	= 0;
			target.selectedIndex=0;

			if((tempQty.length)==1 && isDefaultSelect){
				target.options.length=tempQty.length;
				target.options[0].textContent=tempQty[0].split('=')[0];
				target.options[0].value=parseInt(tempQty[0].split('=')[1]);
				target.selectedIndex=0;
				return;
			}

			var i=0;
			while(tempQty[i] != null) {
				var temp = new Array();
				temp=tempQty[i].split('=');
				target.options[i+1].textContent=temp[0];
				var m=parseInt(temp[1]);
				target.options[i+1].value=m;
				i=i+1;
			}
			sortDropDownList(targetId);
		}
	};
	xmlHttp.open("GET","jsp/transport/ajaxinterfaceForTransport.jsp?filter=73&subRegionId="+subRegionId+"&isListAll="+isListAll,true);
	xmlHttp.send(null);
}

function populateBranchesBySubRegionId(subRegionId,targetId,isDefaultSelect,isListAll) {
	var target = document.getElementById(targetId);
	if(subRegionId<0){
		target.options.length=1;
		target.options[0].text=(allReqd)? 'ALL':'----  Select Branch  ----';
		target.options[0].value=0;
		return false;
	}else if(subRegionId==0){
		target.options.length=1;
		target.options[0].text='ALL';
		target.options[0].value='0';
		return false;
	}
	var xmlHttp;
	try	{
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	} catch (e) {
		// Internet Explorer
		try	{
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try	{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {
				alert("Your browser does not support AJAX!");
				return false;
			}
		}
	}
	xmlHttp.onreadystatechange = function() {
		if(xmlHttp.readyState == 4) {
			var str = xmlHttp.responseText;
			str = str.replace(/\?/g, '-').trim();// Replace '?' with '-'
			if(/error/i.test(str)){
				alert(str);
				return;
			}
			var tempQty = new Array();
			tempQty = str.split(",");
			target.options.length	= parseInt(tempQty.length) + 1;
			target.options[0].text	= (allReqd)?'ALL':'---- Select Branch  ----';
			target.options[0].value	= 0;
			target.selectedIndex=0;

			if((tempQty.length)==1 && isDefaultSelect){
				target.options.length=tempQty.length;
				target.options[0].textContent=tempQty[0].split('=')[0];
				target.options[0].value=parseInt(tempQty[0].split('=')[1]);
				target.selectedIndex=0;
				return;
			}

			var i=0;
			while(tempQty[i] != null) {
				var temp = new Array();
				temp=tempQty[i].split('=');
				target.options[i+1].textContent=temp[0];
				var m=parseInt(temp[1]);
				target.options[i+1].value=m;
				i=i+1;
			}
			sortDropDownList(targetId);
		}
	};
	xmlHttp.open("GET","jsp/transport/ajaxinterfaceForTransport.jsp?filter=25&subRegionId="+subRegionId+"&isListAll="+isListAll,true);
	xmlHttp.send(null);
}

function populatePhysicalBranchesOnlyBySubRegionId(subRegionId,targetId,isDefaultSelect,isListAll) {
	var target = document.getElementById(targetId);
	if(subRegionId<=0){
		target.options.length=1;
		target.options[0].text=(allReqd)? 'ALL':'----  Select Branch  ----';
		target.options[0].value=0;
		return false;
	}
	var xmlHttp;
	try	{
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	} catch (e) {
		// Internet Explorer
		try	{
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try	{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {
				alert("Your browser does not support AJAX!");
				return false;
			}
		}
	}
	xmlHttp.onreadystatechange = function() {
		if(xmlHttp.readyState == 4) {
			var str = xmlHttp.responseText;
			str = str.replace(/\?/g, '-').trim();// Replace '?' with '-'
			if(/error/i.test(str)){
				alert(str);
				
				//Added by Anant Chaudhary	22-12-2015
				if(document.getElementById('subRegion') != null) {
					document.getElementById('subRegion').value = 0;
				}
				
				return;
			}
			var tempQty = new Array();
			tempQty = str.split(",");
			target.options.length	= parseInt(tempQty.length) + 1;
			target.options[0].text	= (allReqd)?'ALL':'---- Select Branch  ----';
			target.options[0].value	= 0;
			target.selectedIndex=0;

			if((tempQty.length)==1 && isDefaultSelect){
				target.options.length=tempQty.length;
				target.options[0].textContent=tempQty[0].split('=')[0];
				target.options[0].value=parseInt(tempQty[0].split('=')[1]);
				target.selectedIndex=0;
				return;
			}

			var i=0;
			while(tempQty[i] != null) {
				var temp = new Array();
				temp=tempQty[i].split('=');
				target.options[i+1].textContent=temp[0];
				var m=parseInt(temp[1]);
				target.options[i+1].value=m;
				i=i+1;
			}
			sortDropDownList(targetId);
		}
	};
	xmlHttp.open("GET","jsp/transport/ajaxinterfaceForTransport2.jsp?filter=27&subRegionId="+subRegionId+"&isListAll="+isListAll,true);
	xmlHttp.send(null);
}
		

function populateActivePhysicalBranchesOnlyBySubRegionId(subRegionId,targetId,isDefaultSelect,isListAll) {
	var target = document.getElementById(targetId);
	if(subRegionId<=0){
		target.options.length=1;
		target.options[0].text=(allReqd)? 'ALL':'----  Select Branch  ----';
		target.options[0].value=0;
		return false;
	}
	var xmlHttp;
	try	{
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	} catch (e) {
		// Internet Explorer
		try	{
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try	{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {
				alert("Your browser does not support AJAX!");
				return false;
			}
		}
	}
	xmlHttp.onreadystatechange = function() {
		if(xmlHttp.readyState == 4) {
			var str = xmlHttp.responseText;
			str = str.replace(/\?/g, '-').trim();// Replace '?' with '-'
			if(/error/i.test(str)){
				alert(str);
				
				//Added by Anant Chaudhary	22-12-2015
				if(document.getElementById('subRegion') != null) {
					document.getElementById('subRegion').value = 0;
				}
				
				return;
			}
			var tempQty = new Array();
			tempQty = str.split(",");
			target.options.length	= parseInt(tempQty.length) + 1;
			target.options[0].text	= (allReqd)?'ALL':'---- Select Branch  ----';
			target.options[0].value	= 0;
			target.selectedIndex=0;

			if((tempQty.length)==1 && isDefaultSelect){
				target.options.length=tempQty.length;
				target.options[0].textContent=tempQty[0].split('=')[0];
				target.options[0].value=parseInt(tempQty[0].split('=')[1]);
				target.selectedIndex=0;
				return;
			}

			var i=0;
			while(tempQty[i] != null) {
				var temp = new Array();
				temp=tempQty[i].split('=');
				target.options[i+1].textContent=temp[0];
				var m=parseInt(temp[1]);
				target.options[i+1].value=m;
				i=i+1;
			}
			sortDropDownList(targetId);
		}
	};
	xmlHttp.open("GET","jsp/transport/ajaxinterfaceForTransport2.jsp?filter=27&subRegionId="+subRegionId+"&isListAll="+isListAll+"&hideDeactiveBranches=true",true);
	xmlHttp.send(null);
}		
		
				
function populatePhysicalBranchesOnlyBySubRegionIdWithAllOptionAtDown(subRegionId,targetId,isDefaultSelect,isListAll) {
	var target = document.getElementById(targetId);
	if(subRegionId < 0) {
		target.options.length	= 1;
		target.options[0].text	= '---- Branch ----';
		target.options[0].value	= '-1';
		return false;
	} else if(subRegionId == 0) {
		target.options.length	= 1;
		target.options[0].text	= 'ALL';
		target.options[0].value	= '0';
		return false;
	}
	var xmlHttp;
	try	{
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	} catch (e) {
		// Internet Explorer
		try	{
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try	{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {
				alert("Your browser does not support AJAX!");
				return false;
			}
		}
	}
	xmlHttp.onreadystatechange = function() {
		if(xmlHttp.readyState == 4) {
			var str = xmlHttp.responseText;
			str = str.replace(/\?/g, '-').trim();// Replace '?' with '-'
			if(/error/i.test(str)){
				alert(str);
				return;
			}
			var tempQty = new Array();
			tempQty = str.split(",");
			target.options.length	= parseInt(tempQty.length) + 1;
			target.options[0].text	= '---- Branch ----';
			target.options[0].value	= '-1';
			target.selectedIndex=0;

			if((tempQty.length)==1 && isDefaultSelect){
				target.options.length=tempQty.length;
				target.options[0].textContent=tempQty[0].split('=')[0];
				target.options[0].value=parseInt(tempQty[0].split('=')[1]);
				target.selectedIndex=0;
				return;
			}

			var i=0;
			while(tempQty[i] != null) {
				var temp = new Array();
				temp=tempQty[i].split('=');
				target.options[i+1].textContent=temp[0];
				var m=parseInt(temp[1]);
				target.options[i+1].value=m;
				i=i+1;
			}
			sortDropDownList(targetId);

			if(allReqd){
				//alert(target.options.length);
				target.options.length = (target.options.length) + 1;
				//alert(target.options.length);
				target.options[target.options.length-1].text  = 'ALL';
				target.options[target.options.length-1].value = 0;
				return false;
			}
		}
	};
	xmlHttp.open("GET","jsp/transport/ajaxinterfaceForTransport2.jsp?filter=27&subRegionId="+subRegionId+"&isListAll="+isListAll,true);
	xmlHttp.send(null);
}

function populateBranchesWithCityBySubRegionId(subRegionId,targetId,isDefaultSelect,isListAll) {
	var target = document.getElementById(targetId);
	if(subRegionId<=0){
		target.options.length=1;
		target.options[0].text=(allReqd)? 'ALL':'----  Select Branch  ----';
		target.options[0].value=0;
		return false;
	}
	var xmlHttp;
	try	{
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	} catch (e) {
		// Internet Explorer
		try	{
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try	{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {
				alert("Your browser does not support AJAX!");
				return false;
			}
		}
	}
	xmlHttp.onreadystatechange = function() {
		if(xmlHttp.readyState == 4) {
			var str = xmlHttp.responseText;
			str = str.replace(/\?/g, '-').trim();// Replace '?' with '-'
			if(/error/i.test(str)){
				alert(str);
				return;
			}
			var tempQty = new Array();
			tempQty = str.split(",");
			target.options.length	= parseInt(tempQty.length) + 1;
			target.options[0].text	= (allReqd)?'ALL':'---- Select Branch  ----';
			target.options[0].value	= 0;
			target.selectedIndex=0;

			if((tempQty.length)==1 && isDefaultSelect){
				target.options.length=tempQty.length;
				target.options[0].textContent=tempQty[0].split('=')[0];
				target.options[0].value=(tempQty[0].split('=')[1]);
				target.selectedIndex=0;
				return;
			}

			var i=0;
			while(tempQty[i] != null) {
				var temp = new Array();
				temp=tempQty[i].split('=');
				target.options[i+1].textContent=temp[0];
				var m=(temp[1]);
				target.options[i+1].value=m;
				i=i+1;
			}
			sortDropDownList(targetId);
		}
	};
	xmlHttp.open("GET","jsp/transport/ajaxinterfaceForTransport.jsp?filter=67&subRegionId="+subRegionId+"&isListAll="+isListAll,true);
	xmlHttp.send(null);
}

function populateBranchesBySubRegionIdAndType(subRegionId,targetId,isDefaultSelect,isListAll,branchType) {
	var target = document.getElementById(targetId);
	if(subRegionId<=0){
		target.options.length=1;
		target.options[0].text=(allReqd)? 'ALL':'----  Select Branch  ----';
		target.options[0].value=0;
		return false;
	}
	var xmlHttp;
	try	{
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	} catch (e) {
		// Internet Explorer
		try	{
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try	{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {
				alert("Your browser does not support AJAX!");
				return false;
			}
		}
	}
	xmlHttp.onreadystatechange = function() {
		if(xmlHttp.readyState == 4) {
			var str = xmlHttp.responseText;
			str = str.replace(/\?/g, '-').trim();// Replace '?' with '-'
			if(/error/i.test(str)){
				alert(str);
				return;
			}
			var tempQty = new Array();
			tempQty = str.split(",");
			target.options.length	= parseInt(tempQty.length) + 1;
			target.options[0].text	= (allReqd)?'ALL':'---- Select Branch  ----';
			target.options[0].value	= 0;
			target.selectedIndex=0;

			if((tempQty.length)==1 && isDefaultSelect){
				target.options.length=tempQty.length;
				target.options[0].textContent=tempQty[0].split('=')[0];
				target.options[0].value=parseInt(tempQty[0].split('=')[1]);
				target.selectedIndex=0;
				return;
			}

			var i=0;
			while(tempQty[i] != null) {
				var temp = new Array();
				temp=tempQty[i].split('=');
				target.options[i+1].textContent=temp[0];
				var m=parseInt(temp[1]);
				target.options[i+1].value=m;
				i=i+1;
			}
			sortDropDownList(targetId);
		}
	};
	xmlHttp.open("GET","jsp/transport/ajaxinterfaceForTransport.jsp?filter=45&subRegionId="+subRegionId+"&isListAll="+isListAll+"&branchType="+branchType,true);
	xmlHttp.send(null);
}

function populatePhysicalBranchesBySubRegionIdAndType(subRegionId,targetId,isDefaultSelect,isListAll,branchType) {
	var target = document.getElementById(targetId);
	if(subRegionId<=0){
		target.options.length=1;
		target.options[0].text=(allReqd)? 'ALL':'----  Select Branch  ----';
		target.options[0].value=0;
		return false;
	}
	var xmlHttp;
	try	{
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	} catch (e) {
		// Internet Explorer
		try	{
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try	{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {
				alert("Your browser does not support AJAX!");
				return false;
			}
		}
	}
	xmlHttp.onreadystatechange = function() {
		if(xmlHttp.readyState == 4) {
			var str = xmlHttp.responseText;
			str = str.replace(/\?/g, '-').trim();// Replace '?' with '-'
			if(/error/i.test(str)){
				alert(str);
				return;
			}
			var tempQty = new Array();
			tempQty = str.split(",");
			target.options.length	= parseInt(tempQty.length) + 1;
			target.options[0].text	= (allReqd)?'ALL':'---- Select Branch  ----';
			target.options[0].value	= 0;
			target.selectedIndex=0;

			if((tempQty.length)==1 && isDefaultSelect){
				target.options.length=tempQty.length;
				target.options[0].textContent=tempQty[0].split('=')[0];
				target.options[0].value=parseInt(tempQty[0].split('=')[1]);
				target.selectedIndex=0;
				return;
			}

			var i=0;
			while(tempQty[i] != null) {
				var temp = new Array();
				temp=tempQty[i].split('=');
				target.options[i+1].textContent=temp[0];
				var m=parseInt(temp[1]);
				target.options[i+1].value=m;
				i=i+1;
			}
			sortDropDownList(targetId);
		}
	};
	xmlHttp.open("GET","jsp/ajaxinterface.jsp?filter=22&subRegionId="+subRegionId+"&isListAll="+isListAll+"&branchType="+branchType,true);
	xmlHttp.send(null);
}

function populateBranchesForDelivery(accountGroupId,srcCityId,target,branchId,isDefaultSelect){
	if(srcCityId==0){
		var d=document.getElementById(target);
		d.options.length=1;
		d.options[0].text= '--Select Branch--';
		d.options[0].value=0;
		return false;
	}
	var xmlHttp;
	try	{
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	}
	catch (e){
		// Internet Explorer
		try	{
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (e){
			try	{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (e){
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

	xmlHttp.onreadystatechange=function(){
		if(xmlHttp.readyState==4){

			var str=xmlHttp.responseText;
			// Replace '?' with '-'
			str=str.replace(/\?/g, '-');
			// Store CityId of branches
			destBranchCityId=str.substring(str.lastIndexOf('=')+1, str.length);
			var tempQty = new Array();
			tempQty = str.split(",");
			var d=document.getElementById(target);
			d.options.length=1;
			d.options.length=tempQty.length;
			if(tempQty.length==1){
				return;
			}
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
				if((tempQty.length-1)==1 && isDefaultSelect){
					d.options[1].textContent=tempQty[1].split('=')[0];
					d.options[1].value=parseInt(tempQty[1].split('=')[1]);
					d.selectedIndex=1;
					return;
				}
				if (allReqd==true){
					d.options[0].text= 'ALL';
					d.options[0].value=0;
					allReqd=false;
					}

				while (tempQty[i] != null) {
					var temp = new Array();
					temp=tempQty[i].split('=');
					d.options[i].textContent=temp[0];

					var m=parseInt(temp[1]);
					d.options[i].value=m;
					i=i+1;
				}
			}
			sortDropDownList(target);
		}
	};
	xmlHttp.open("GET","jsp/ajaxinterface.jsp?filter=0&acc="+accountGroupId+"&city="+srcCityId+"&branchId="+branchId,true);
	xmlHttp.send(null);
	}

function populateAssignedLocationsByLocationId(locationId,targetId,isDefaultSelect,isListAll) {
	var target = document.getElementById(targetId);
	if(locationId<=0){
		target.options.length=1;
		target.options[0].text=(allReqd)? 'ALL':'----  Select Destinaion Branch  ----';
		target.options[0].value=0;
		return false;
	}
	var xmlHttp;
	try	{
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	} catch (e) {
		// Internet Explorer
		try	{
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try	{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {
				alert("Your browser does not support AJAX!");
				return false;
			}
		}
	}
	xmlHttp.onreadystatechange = function() {
		if(xmlHttp.readyState == 4) {
			var str = xmlHttp.responseText;
			str = str.replace(/\?/g, '-').trim();// Replace '?' with '-'
			if(/error/i.test(str)){
				alert(str);
				return;
			}
			var tempQty = new Array();
			tempQty = str.split(",");
			target.options.length	= parseInt(tempQty.length) + 1;
			target.options[0].text	= (allReqd)?'ALL':'---- Select Destinaion Branch  ----';
			target.options[0].value	= 0;
			target.selectedIndex=0;

			if((tempQty.length)==1 && isDefaultSelect){
				target.options.length=tempQty.length;
				target.options[0].textContent=tempQty[0].split('=')[0];
				target.options[0].value=parseInt(tempQty[0].split('=')[1]);
				target.selectedIndex=0;
				return;
			}

			var i=0;
			while(tempQty[i] != null) {
				var temp = new Array();
				temp=tempQty[i].split('=');
				target.options[i+1].textContent=temp[0];
				var m=parseInt(temp[1]);
				target.options[i+1].value=m;
				i=i+1;
			}
			sortDropDownList(targetId);
		}
	};
	xmlHttp.open("GET","jsp/transport/ajaxinterfaceForTransport2.jsp?filter=10&locationId="+locationId+"&isListAll="+isListAll,true);
	xmlHttp.send(null);
}

function initCalender(configCalenderObject){
	configCalenderObject.filter=configCalenderObject.filter||"Default";
	
	if($.datepick == undefined) return;
	
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
	
	console.log('minDateFromProperty', minDateFromProperty)

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
			minDate:configCalenderObject.minDate||minDateFromProperty,  //minDateFromProperty - coming from header.jsp
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
	
		if(configCalenderObject.filter == 'ToDateAfterOneYear'){
			$.datepick.add(date	,0,'m');
		} else if(configCalenderObject.filter == 'ToDateAfterThreeMonth'){
			$.datepick.add(date	,configCalenderObject.numberOfDaysMonthYear||3,configCalenderObject.typeOfNumberOfDaysMonthYear||'m');//calculate date 3 month Range
		}else if (configCalenderObject.filter == 'ToDateAfterTwoYear') {
			$.datepick.add(date, 0, 'm');
		}else {
			$.datepick.add(date	,configCalenderObject.numberOfDaysMonthYear||1,configCalenderObject.typeOfNumberOfDaysMonthYear||'m');//calculate date 1 month Range
		}
		
		if(configCalenderObject.filter == 'ToDateAfterThreeMonth'){
			$.datepick.add(toDate	,configCalenderObject.numberOfDaysMonthYear||3,configCalenderObject.typeOfNumberOfDaysMonthYear||'m');//calculate date 3 month Range
			toDate.setDate(1,toDate.getMonth(),toDate.getFullYear());
			$.datepick.add(toDate,-1,'d');//calculate date 3 month Range
			$.datepick.add(date	,-1,'d');//calculate date 3 month Range
		} else if(configCalenderObject.filter == 'ToDateAfterOneMonth'){
			$.datepick.add(toDate	,configCalenderObject.numberOfDaysMonthYear||1,configCalenderObject.typeOfNumberOfDaysMonthYear||'m');//calculate date 1 month Range
			toDate.setDate(1,toDate.getMonth(),toDate.getFullYear());
			$.datepick.add(toDate,-1,'d');//calculate date 1 month Range
			$.datepick.add(date	,-1,'d');//calculate date 1 month Range
		}else if(configCalenderObject.filter == 'ToDateAfterOneYear'){
			//$.datepick.add(toDate,1,'m');
			toDate.setDate(date.getDate(),toDate.getMonth(),toDate.getFullYear());
		    $.datepick.add(toDate,1,'y');
			$.datepick.add(date	,1,'y');
		} else if (configCalenderObject.filter == 'ToDateAfterTwoYear') {
			toDate.setDate(date.getDate(), toDate.getMonth(), toDate.getFullYear());
			$.datepick.add(toDate, 2, 'y');
			$.datepick.add(date, 2, 'y');
			if (toDate > currentDate) {
				toDate = new Date(currentDate);
			}
			if (date > currentDate) {
				date = new Date(currentDate);
			}
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
			selectDefaultDate: true,
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
		
		if(configCalenderObject.filter=='ToDateAfterThreeMonth'){
			if(currentDate.getMonth() == fromDate.getMonth() && currentDate.getFullYear()==fromDate.getFullYear()){
				$('.toDate').val($.datepick.formatDate(configCalenderObject.dateFormat||'dd-mm-yyyy',currentDate));
			}else{
				$('.toDate').val($.datepick.formatDate(configCalenderObject.dateFormat||'dd-mm-yyyy',date));
			}
		} else if(configCalenderObject.filter=='ToDateAfterOneMonth'){
			if(currentDate.getMonth() == fromDate.getMonth() && currentDate.getFullYear()==fromDate.getFullYear()){
				$('.toDate').val($.datepick.formatDate(configCalenderObject.dateFormat||'dd-mm-yyyy',currentDate));
			}else{
				$('.toDate').val($.datepick.formatDate(configCalenderObject.dateFormat||'dd-mm-yyyy',date));
			}
		} else if(configCalenderObject.filter =='ToDateAfterOneYear'){
			if(currentDate.getMonth() == fromDate.getMonth() && currentDate.getFullYear() == fromDate.getFullYear()){
				$('.toDate').val($.datepick.formatDate(configCalenderObject.dateFormat||'dd-mm-yyyy',currentDate));
			}else if(currentDate.getFullYear() == fromDate.getFullYear()){
				$('.toDate').val($.datepick.formatDate(configCalenderObject.dateFormat||'dd-mm-yyyy',currentDate));
			}else if(fromDate.getMonth() > currentDate.getMonth()  && currentDate.getFullYear() == toDate.getFullYear()){
				$('.toDate').val($.datepick.formatDate(configCalenderObject.dateFormat||'dd-mm-yyyy',currentDate));
			}else if(toDate.getDate() > currentDate.getDate() && toDate.getMonth() == currentDate.getMonth()  && currentDate.getFullYear() == toDate.getFullYear() ){
				$('.toDate').val($.datepick.formatDate(configCalenderObject.dateFormat||'dd-mm-yyyy',currentDate));
			}else{
				$('.toDate').val($.datepick.formatDate(configCalenderObject.dateFormat||'dd-mm-yyyy',toDate));
			}
		} else if (configCalenderObject.filter == 'ToDateAfterTwoYear') {
			if (currentDate.getMonth() == fromDate.getMonth() && currentDate.getFullYear() == fromDate.getFullYear()) {
				$('.toDate').val($.datepick.formatDate(configCalenderObject.dateFormat || 'dd-mm-yyyy', currentDate));
			} else if (currentDate.getFullYear() == fromDate.getFullYear()) {
				$('.toDate').val($.datepick.formatDate(configCalenderObject.dateFormat || 'dd-mm-yyyy', currentDate));
			} else if (fromDate.getMonth() > currentDate.getMonth() && currentDate.getFullYear() == toDate.getFullYear()) {
				$('.toDate').val($.datepick.formatDate(configCalenderObject.dateFormat || 'dd-mm-yyyy', currentDate));
			} else if (toDate.getDate() > currentDate.getDate() && toDate.getMonth() == currentDate.getMonth() && currentDate.getFullYear() == toDate.getFullYear()) {
				$('.toDate').val($.datepick.formatDate(configCalenderObject.dateFormat || 'dd-mm-yyyy', currentDate));
			} else {
				$('.toDate').val($.datepick.formatDate(configCalenderObject.dateFormat || 'dd-mm-yyyy', toDate));
			}
		}else {
			$('.toDate').val($.datepick.formatDate(configCalenderObject.dateFormat||'dd-mm-yyyy',fromDate));
		}
		if(configCalenderObject.toDateOnlyAfterOneMonth != undefined && (configCalenderObject.toDateOnlyAfterOneMonth || 
																		configCalenderObject.toDateOnlyAfterOneMonth == 'true')){
				var fDateObj = new Date($('.fromDate').val().replace( /(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"))
					fDateObj.setMonth(fDateObj.getMonth() + 1);
					fDateObj.setDate(fDateObj.getDate() - 1);

					if(currentDate <= fDateObj)
					fDateObj	= currentDate;
					
				
				var day, month;
				if(fDateObj.getDate() < 10)
					day = '0'+fDateObj.getDate();
				else	
					day = fDateObj.getDate();
			
				if((fDateObj.getMonth() + 1) < 10)
					month = '0'+(fDateObj.getMonth() + 1);
				else
				   month = fDateObj.getMonth() + 1;
				
				$('.toDate').val(''+day+'-'+month+'-'+fDateObj.getFullYear());														
		}
	}
}

function getName(reportNameId,fileName) {
	var reportName = document.getElementById(reportNameId).innerHTML+fileName;
	var name=prompt("Please enter FileName",reportName);
	return fileName = (name!=null && name!="") ? name+".xls" : reportName+".xls" ;
}

function CreateLink(i){
	var a = document.getElementById("Excel").appendChild(document.createElement("a"));
	a.download =getName(i);
	a.href = 'data:application/vnd.ms-excel,' + encodeURIComponent(document.getElementById('reportData').innerHTML);
	a.innerHTML = "Download Excel";
	document.getElementById("Excelbutton").style.display="none";
}

function downloadToExcel(link,tableId,reportNameId,fileName){
	var arr = document.getElementsByClassName('titletd');
	for (var i = 0; i < arr.length; i++) {
		arr[i].setAttribute('style', 'font-weight:bold;');
	}
	link.href = "data:application/vnd.ms-excel," + encodeURIComponent(document.getElementById(tableId).innerHTML);
//	link.download = getName(reportNameId,fileName);
}

function downloadToExcelWithFileName(link, tableId, reportNameId, fileName) {
	let partyWiseGroupingExcelData = false;
	
	if(document.getElementById('partyWiseGroupingExcelData') != undefined)
		partyWiseGroupingExcelData = document.getElementById('partyWiseGroupingExcelData').value == 'true';
		
	const searchButtons = [...document.querySelectorAll('a.searchBtn')];

	if (searchButtons.length > 0) {
		searchButtons.forEach(button => {
			button._parentNode = button.parentNode;
			button.remove();
		});
	}

	if (fileName != null && fileName != undefined)
		fileName = fileName.replace(/\./g, '');

	Array.from(document.getElementsByClassName('titletd')).forEach(el => el.style.fontWeight = 'bold');

	// For temporarily hiding billingParty elements
	let removedElements = [];
	
	if (partyWiseGroupingExcelData) {
		Array.from(document.getElementsByClassName('billingPartyCol')).forEach(el => {
			el.remove();
		});
	} else if (reportNameId === 'Due Bill Creditor Wise') {
		Array.from(document.getElementsByClassName('billingPartyRow')).forEach(el => {
			const row = el.closest('tr');
			
			if (row) {
				removedElements.push({ element: row, parent: row.parentNode, nextSibling: row.nextSibling });
				row.remove();
			}
		});
	}
	
	// Temporarily hide print buttons
	let removedPrintButtons = [];
	
	Array.from(document.getElementsByClassName('printButton')).forEach(el => {
		const column = el.closest('td, th');
		removedPrintButtons.push({ element: column, parent: column.parentNode, nextSibling: column.nextSibling });
		column.remove();
	});

	link.href = `data:application/vnd.ms-excel,${encodeURIComponent(document.getElementById(tableId).innerHTML)}`;
	link.download = fileName;

	// Restore the removed billingParty elements back to their original positions
	if(removedElements.length > 0) {
		removedElements.forEach(({ element, parent, nextSibling }) => {
			if (nextSibling)
				parent.insertBefore(element, nextSibling);
			else
				parent.appendChild(element);
		});
	}
	
	if(removedPrintButtons.length > 0) {
		removedPrintButtons.forEach(({ element, parent, nextSibling }) => {
			if (nextSibling)
				parent.insertBefore(element, nextSibling);
			else
				parent.appendChild(element);
		});
	}

	if (searchButtons.length > 0) {
		searchButtons.forEach(button => button._parentNode.appendChild(button));
	}
}

function downloadToExcelWin(link,tableId,reportNameId,fileName) {
	var reportTitle = document.querySelector('h4[data-selector="header"]').innerText.trim();
	var fileName = reportTitle.replace(/\s+/g, "_") + ".xls";
	var arr = document.getElementsByClassName('titletd');
	
	for (var i = 0; i < arr.length; i++) {
		arr[i].setAttribute('style', 'font-weight:bold;');
	}

	var table = document.getElementById(tableId);
	var html = `<html xmlns:o="urn:schemas-microsoft-com:office:office"xmlns:x="urn:schemas-microsoft-com:office:excel"xmlns="http://www.w3.org/TR/REC-html40">
				<head><meta charset="UTF-8"></head><body><table border="1">${table.innerHTML}</table></body></html>`;

	var blob = new Blob([html], { type: "application/vnd.ms-excel" });
	var url = URL.createObjectURL(blob);
	link.href = url;
	link.download = fileName;
}

function consignerDetailsLength(id, msg) {
	var el =document.getElementById(id);
	var reg = /\s/g; //Match any white space including space, tab, form-feed, etc.
	var str = el.value.replace(reg, '');
	if (str.length < 4 || el.value == msg) {
		showSpecificErrors('consignorError','please enter party name of atleast 4 characters : '+msg);
		toogleElement('consignorError','block');
		changeError1(id,'0','700');
		el.focus();
		return false;
	} else {
		removeError(id);
		toogleElement('consignorError','none');
		return true;
	}
}

function setExcelButton(){
	if(document.getElementById('excelDownLoadLink') != null){
		var linkStyle = 'font-size: 13px;font-style: italic;font-weight: bold;font-family: arial,helvetica,sans-serif';
		var linkhref  = '#';
		var linkName  = 'Download Excel';
		
		var excelLink = document.createElement('a');
		excelLink.textContent = linkName;
		excelLink.id = 'excelButton';
		excelLink.href = linkhref;
		excelLink.style = linkStyle;
		document.getElementById('excelDownLoadLink').appendChild(excelLink);
		document.getElementById('excelButton').onclick = function(){excuteExcel(excelLink);};
		
		var excelLink2 = excelLink.cloneNode(true);
		excelLink2.id = 'excelButton2';
		document.getElementById('excelDownLoadLink2').appendChild(excelLink2);
		document.getElementById('excelButton2').onclick = function(){excuteExcel(excelLink2);};
	}
}

function excuteExcel(excelButtonLink){
	var selectedBranch 	= document.getElementById('selectedBranchForExcel').value;
	var fromDate 		= document.getElementById('fromDateForExcel').value;
	var toDate 			= document.getElementById('toDateForExcel').value;
	downloadToExcel(excelButtonLink,'reportData','reportName','_FromSubBranch_'+selectedBranch+'_ForPeriod_From_'+fromDate+'_To_'+toDate);
}

function fillclearText(text,text1) {
	var textValue = text.value;
	if(textValue == '') {
		text.value = text1;
	} else {
		text.value = textValue;
	};
}

function fillclearTextArea(text,text1) {
	var textValue = text.value;
	if(textValue == '') {
		text.value = text1;
	};
}

function showInfo(elObj,tagToDisp) {
	div = document.getElementById('info');
	div.style.display = 'block';
	var elPos = findPos(elObj);
	div.style.left = elPos[0]+'px';
	div.style.top = elPos[1] -36 +'px';
	div.innerHTML = tagToDisp;
}

function hideInfo() {
	document.getElementById('info').style.display = 'none';
}

function findPos(obj) {
	var curleft = curtop = 0;
	if (obj.offsetParent) {
		curleft = obj.offsetLeft;
		curtop = obj.offsetTop;
		while (obj = obj.offsetParent) {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		}
	}
	return [curleft,curtop];
}

function manageCancellationCharge(){
	if (!manageRefundAmount) {
		$('#cancellationRow').hide();
	}
}

function checkRefundAmount() {
	if ($('#refundAmount').val() < 0) {
		showMessage('error', 'Provide Appropriate Value For Refund Amount !' )
		$('#cancellationCharge').focus();
		return false;
	}
	return true
}

function validateConsignorGstn() {
	
	if(!validateTextFeild(1, 'consignorGstn', 'Please, Enter 15 digit GST Number !')) {
		return false;
	}

	return true;
}

function validateConsigneeGstn(){
	
	if(!validateTextFeild(1, 'consigneeGstn', 'Please, Enter 15 digit GST Number !')) {
		return false;
	}
	return true;
}

function updateGSTN(obj){
   var	prevConsignorGstn	=  document.getElementById('prevConsignorGstn').value; 
   var	prevConsigneeGstn	=  document.getElementById('prevConsigneeGstn').value; 
   
   if((obj.id == 'consignorGstn')){
	   if(prevConsignorGstn == '') {
		   updatePartyGstNumberForGroup(1);
	   } else {
		   if(prevConsignorGstn != 0) {
			   document.getElementById('consignorGstn').value = prevConsignorGstn;
		   }
	   }
	} else if((obj.id == 'consigneeGstn')) {
		if(prevConsigneeGstn == '') {
			updatePartyGstNumberForGroup(2);
		} else {
			if(prevConsigneeGstn != 0) {
				document.getElementById('consigneeGstn').value = prevConsigneeGstn;
			}
		}
	}   
}

function updatePartyGstNumberForGroup(partyType){
	var partyGstNumber 		= '';
	var partyId				= 0;

	if(partyType == 1){
		if (!validateConsignorGstn()) {
			return false;
		}
		
		partyGstNumber 		= $('#consignorGstn').val();
		partyId 			= $('#consignorCorpId').val();
	} else {
		if(partyType == 2){
			if (!validateConsigneeGstn()) {
				return false;
			}
			
			partyGstNumber 		= $('#consigneeGstn').val();
			partyId 			= $('#consigneeCorpId').val();
		}
	}
	var jsonObject					= new Object();

	jsonObject["gstNumber"]				= partyGstNumber;
	jsonObject["corporateAccountId"]	= partyId;
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/partyMasterWS/updatePartyGstNumber.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
		}
	});
	
}


/*
 * validate input elements with different cases 
 */
function validateTextFeild(filter, elementID, errorMsg) {
	var element = document.getElementById(elementID);

	switch (Number(filter)) {
	case 1:
		if (element.value != '' && element.value != null && element.value.length != 15) {
			showSpecificErrors('basicError',errorMsg);
			toogleElement('basicError','block');
			setTimeout(function(){ element.focus(); }, 10);
			return false;			
		} else {
			toogleElement('basicError','none');
			return true;
		}
		break;

	default:
		break;
	}

	return true;
}

function getSourceBranchObj(obj) {
	var jsonObject					= new Object();
	
	jsonObject.branchId		= $('#'+obj.id).val();
	jsonObject.filter		= 23;
	var jsonStr = JSON.stringify(jsonObject);
	
	$.getJSON("UpdateCorporatePartyGstAjaxAction.do?pageId=9&eventId=16",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
				} else {
					exeBranch	= data.branch;
				}
			});
}

function getDestinationBranchObj(obj) {
	var jsonObject					= new Object();

	jsonObject.branchId		= $('#'+obj.id).val();
	jsonObject.filter		= 23;
	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("UpdateCorporatePartyGstAjaxAction.do?pageId=9&eventId=16",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
				} else {
					destBranch	= data.branch;
				}
	});
}

function populateSUBREGIONSByRegionId(regionId,targetId,isDefaultSelect,isListAll){

	var target = document.getElementById(targetId);
	if(regionId<=0){
		target.options.length=1;
		target.options[0].text	= '---- Select Area ----';
		target.options[0].value	= -1;
		return false;
	}
	var xmlHttp;
	try	{
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	} catch (e) {
		// Internet Explorer
		try	{
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try	{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {
				alert("Your browser does not support AJAX!");
				return false;
			}
		}
	}
	xmlHttp.onreadystatechange = function() {
		if(xmlHttp.readyState == 4) {
			var str = xmlHttp.responseText;
			str = str.replace(/\?/g, '-').trim();// Replace '?' with '-'
			if(/error/i.test(str)){
				alert(str);
				return;
			}
			var tempQty = new Array();
			tempQty = str.split(",");
			target.options.length	= parseInt(tempQty.length) + 1;
			target.options[0].text	='---- Select Area ----';
			target.options[0].value	= -1;
			target.selectedIndex = 0;

			if((tempQty.length)==1 && isDefaultSelect){
				target.options.length=tempQty.length;
				target.options[0].textContent=tempQty[0].split('=')[0];
				target.options[0].value=parseInt(tempQty[0].split('=')[1]);
				target.selectedIndex=0;
				return;
			}

			var i=0;
			while(tempQty[i] != null) {
				var temp = new Array();
				temp=tempQty[i].split('=');
				target.options[i+1].textContent=temp[0];
				var m=parseInt(temp[1]);
				target.options[i+1].value=m;
				i=i+1;
			}
			sortDropDownList(targetId);

			if (allReqd == true) {
				target.options.length = (target.options.length) + 1;
				target.options[target.options.length-1].text  = 'ALL';
				target.options[target.options.length-1].value = 0;
				return false;
			}	
		}
	};
	xmlHttp.open("GET","jsp/transport/ajaxinterfaceForTransport.jsp?filter=3&regionId="+regionId+"&isListAll="+isListAll,true);
	xmlHttp.send(null);

}

function resetMultipleRemark(){
	if(configuration.multipleRemarkField == 'true'){
		$('#multiRemark').html('');
		$("#multiRemark").multiselect('destroy');
		setMultiSelectRemark();
	}
}
function setMultiSelectRemark() {
	if(configuration.multipleRemarkField == 'true' || configuration.multipleRemarkField == true){
		var multipleRemarksArray = (configuration.multipleRemarks).split("_");
		if(!jQuery.isEmptyObject(multipleRemarksArray)) {
			for(var i=0; i < multipleRemarksArray.length; i++) {
				createOption('multiRemark', parseInt(i), multipleRemarksArray[i]);
			}
		}
		multiselectRemark();
	}
}


function multiselectRemark(){
	$('#multiRemark').multiselect({
		header  :false,
		maxHeight:200
	});
	
	if(document.getElementById('multiRemark_ms') != null) {
		document.getElementById('multiRemark_ms').onfocus = function(){ showInfo(this, 'Multiple Remark');}
	}
	
	$(".ui-corner-all").css("width","200px");
	
	var remarkStr = "";
	var multipleRemarksArray = (configuration.multipleRemarks).split("_");
	$("#multiRemark").on("multiselectclick", function(event, ui) {
		for(var i=0; i<multipleRemarksArray.length; i++) {
			if(parseInt(ui.value) == i && ui.checked == true){
				remarkStr = remarkStr + multipleRemarksArray[i] + ",";
			}
			
			if(parseInt(ui.value) == i && ui.checked == false){
				var str = remarkStr.split(",");
				str.pop();
				var str2 = multipleRemarksArray[parseInt(ui.value)];
				for(var j=0; j<str.length; j++){
					if(str2 == str[j]){
						str.splice(j, 1);
					}
				}
				remarkStr = str.join(',');
				
				if(remarkStr != ''){
					remarkStr = remarkStr+",";
				}
			}
		}
		$('#remark').val(remarkStr);
	});
}

function populateActiveExecutiveByBranchId(bId,destObjId){
	
	var branchId=bId;
	
	if(branchId=='0'){	
		var d=document.getElementById(destObjId);
		d.options.length=1;
		d.options[0].text='ALL';
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
			var d=document.getElementById(destObjId);
			if(str == '') {
				d.length=1;
				d.options[0].value = '0';
				if(browser=="IE"){
					d.options[0].text= 'No Executive';
				}else{
					d.options[0].textContent='No Executive';
				}
			} else {
				if(execReqd==true){
				d.options[0].text= '---- Select ----';}
				else{d.options[0].text= 'ALL';}
			var tempQty = new Array();
			tempQty = str.split(",");
			d.options.length=1;
			d.options.length=tempQty.length;    
			
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
			execReqd=false;
			}
		}
	};
	xmlHttp.open("GET","jsp/ajaxinterface.jsp?filter=27&branch="+branchId,true);
	xmlHttp.send(null);
}

function allowOnlyNumeric(evt) {
	if (evt.ctrlKey == 1) {
		return true;
	} else {
		var keynum 	= null;

		if(window.event){ // IE
			keynum = evt.keyCode;
		} else if(evt.which){ // Netscape/Firefox/Opera
			keynum = evt.which;
		}

		if(keynum != null) {
			if(keynum == 13 || keynum == 8 || keynum == 45 || keynum == 47) {
				hideAllMessages();
				return true;
			} else if (keynum < 48 || keynum > 57) {
				showMessage('warning', numericAllowWarningMsg);
				return false;
			}
		}
		return true;
	}
}
function disableTextPasteOnNumberFeild(){
	var numbersFeild	=	document.querySelectorAll('input[type="number"]');
	for(var i=0; i<numbersFeild.length ; i++){
		$('#'+numbersFeild[i].id).on('paste', function (event) {
		  if (event.originalEvent.clipboardData.getData('Text').match(/[^\d]/)) {
		    event.preventDefault();
		  }
		});
	}
}
function populateExecutiveForId(bId, displaySuperAdmin,displayOnlyActiveUsers){
var branchId=bId;
	if(branchId=='0'){
		var d;
			d=document.getElementById('Executive');
			
			if(d==null || d==undefined)
				d=document.getElementById('executiveId');
				
		d.options.length=1;
		if(execReqd==true){
			d.options[0].text= '--- Select Executive ---';
		}else{
			d.options[0].text= 'ALL';
		}
		d.options[0].value=0;
		return false;
	}

	var xmlHttp;
	try	{
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	}
	catch (e){
		// Internet Explorer
		try	{
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (e){
			try	{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (e){
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
	xmlHttp.onreadystatechange=function(){

		if(xmlHttp.readyState==4){
			var str=xmlHttp.responseText;
			String.prototype.trim = function () {
			    return this.replace(/^\s*/, "").replace(/\s*$/, "");
			};
			str = str.trim();
			var d;
			d=document.getElementById('Executive');
			
			if(d==null || d==undefined)
				d=document.getElementById('executiveId');
				
			if(str == '')
			{
				d.length=1;
				d.options[0].value = '0';
				if(browser=="IE"){
					d.options[0].text= 'No Executive';
				}else{
					d.options[0].textContent='No Executive';
				}
			} else {
				if(execReqd==true){
				d.options[0].text= '--- Select Executive ---';}
				else{d.options[0].text= 'ALL';}

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
			execReqd=false;

			}
		}
	};
	xmlHttp.open("GET","jsp/ajaxinterface.jsp?filter=5&branch="+branchId+'&displaySuperAdmin='+displaySuperAdmin+'&displayOnlyActiveUsers='+displayOnlyActiveUsers,true);
	xmlHttp.send(null);
}

function populatePhysicalBranchesOnlyBySubRegionIdInCrossingRateMaster(subRegionId,targetId,isAllOption,isListAll) {
	var target = document.getElementById(targetId);
	if(subRegionId<=0){
		target.options.length=1;
		target.options[0].text=(allReqd)? 'ALL':'----  Select Branch  ----';
		target.options[0].value=0;
		return false;
	}
	var xmlHttp;
	try	{
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	} catch (e) {
		// Internet Explorer
		try	{
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try	{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {
				alert("Your browser does not support AJAX!");
				return false;
			}
		}
	}
	xmlHttp.onreadystatechange = function() {
		if(xmlHttp.readyState == 4) {
			var str = xmlHttp.responseText;
			str = str.replace(/\?/g, '-').trim();// Replace '?' with '-'
			if(/error/i.test(str)){
				alert(str);
				
				//Added by Anant Chaudhary	22-12-2015
				if(document.getElementById('subRegion') != null) {
					document.getElementById('subRegion').value = 0;
				}
				
				return;
			}
			var tempQty = new Array();
			tempQty = str.split(",");
			target.options.length	= parseInt(tempQty.length) + 1;
			target.options[0].text	= (allReqd)?'ALL':'---- Select Branch  ----';
			target.options[0].value	= 0;
			target.selectedIndex=0;

			var i=0;
			while(tempQty[i] != null) {
				var temp = new Array();
				temp=tempQty[i].split('=');
				target.options[i+1].textContent=temp[0];
				var m=parseInt(temp[1]);
				target.options[i+1].value=m;
				i=i+1;
			}
			sortDropDownList(targetId);
		}
	};
	xmlHttp.open("GET","jsp/transport/ajaxinterfaceForTransport2.jsp?filter=27&subRegionId="+subRegionId+"&isListAll="+isListAll+"&isAllOption=" + isAllOption,true);
	xmlHttp.send(null);
}

function setLayerPosition() {
	let shadow = document.getElementById("shadow");
	let question = document.getElementById("question");
	let bws = getBrowserHeight();
	
	if(shadow != null) {
		shadow.style.width = bws.width + "px";
		shadow.style.height = bws.height + "px";
	}
	
	if(question != null) {
		question.style.left = parseInt((bws.width - 350) / 2);
		question.style.top = parseInt((bws.height - 200) / 2);
	}
}
function allowCharacterAndSpaceOnly(evt) {
	if (evt.ctrlKey == 1) {
		return true;
	} else {
		var keynum = null;

		if(window.event){ // IE
			keynum = evt.keyCode;
		} else if(evt.which){ // Netscape/Firefox/Opera
			keynum = evt.which;
		}

		if(keynum == 8) {
			return true;
		}

		var charStr = String.fromCharCode(keynum);
		if (/^[a-zA-Z\s]$/.test(charStr)) {
			hideAllMessages();
			return true;
		} else {
			showMessage('warning', characterAllowWarningMsg);
			return false;
		}
	}
}

function getDeviceType() {
	const ua = navigator.userAgent;

	if (/Mobi|Android|iPhone/i.test(ua))
		return "Mobile";
	else if (/iPad|Tablet/i.test(ua))
		return "Tablet";

	return "Desktop";
}

function validateVehicleNumberForAlphaNumeric(vehicleNo) {
	const pattern = /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/;
	vehicleNo = vehicleNo.toUpperCase();

	if (!pattern.test(vehicleNo)) {
		setTimeout(function() { showMessage('error', 'Invalid Vehicle Number! The format is CCDDCCDDD where C = Any Character [A-Z] and D = any Digit [0-9]'); }, 100);
		return false;
	}

	return true;
}

function sendOTP() {
	$('#otpCheckBox').bind('change', function() {
		if (!$('#otpCheckBox').is(':checked')) return $('#otpInputDiv').hide();
		sendOTPRequest();
	});
	
	$('#resendOtpBtn').bind('click', function() {
		if (!$('#otpCheckBox').is(':checked')) return $('#otpInputDiv').hide();
		sendOTPRequest();
	});
	
	$('#otpCode').bind('input', function() {
		const enteredOTP = $('#otpCode').val().trim();
		if (enteredOTP.length === 4) {
			if (OTPNumber === 0) {
				showMessage('error', 'Please, request for OTP first!');
				$('#otpCode').val('').focus();
				return;
			}

			if (enteredOTP == OTPNumber) {
				showMessage('success', 'OTP verified successfully!');
				$('#otpInputDiv').hide();
				clearInterval(clockTimer);
				$('#otpVerificationStatusDiv').removeClass('hide');
				isOtpVerified = true;
				OTPNumber = 0;
			} else {
				showMessage('error', 'Invalid OTP! Please, try again.');
				$('#otpCode').val('').focus();
			}
		}
	});
	
}

function startClock() {
	var resendOtpTime = configuration.resendOtpTime * 60;
	clearInterval(clockTimer);
	const $clock = $("#clock"), $resendBtn = $("#resendOtpBtn"), $icon = $("#clockIcon");

	$clock.show(); 
	$resendBtn.show(); 
	$icon.show();

	clockTimer = setInterval(() => {
		$clock.text(`${String(Math.floor(resendOtpTime/60)).padStart(2,'0')}:${String(resendOtpTime%60).padStart(2,'0')}`);
		if (resendOtpTime-- <= 0) {
			clearInterval(clockTimer);
			$clock.hide(); 
			$resendBtn.removeClass('hide'); 
			$icon.hide();
		} else {
			$resendBtn.addClass('hide');
		}
	}, 1000);
}

function sendOTPRequest() {
	if (!$('#otpCheckBox').prop('checked')) return;
	
	if(otpSendCount >=  Number(configuration.resendOtpCount)) {
		showMessage('error', "Maximum OTP attempts exceeded. Please contact support.");
		$('#otpCheckBox').prop('checked', false);
		return;
	}
	
	const consignorPhn = $('#consignorPhn').val().trim();
	
	if (consignorPhn === '' || consignorPhn.length !== 10) {
		showMessage('error', validConsinorMobileErrMsg);
		$('#otpCheckBox').prop('checked', false);
		return;
	}
	
	const consignorName = $('#consignorName').val().trim();
	
	if (consignorName === '') {
		showMessage('error', validConsinorNameErrMsg);
		$('#otpCheckBox').prop('checked', false);
		return;
	}
	
	showLayer();
	OTPNumber = 0;

	const jsonObject = {
		deliveredMobileNo: $('#consignorPhn').val(),
		wayBillNumber: !jQuery.isEmptyObject($('#lrnumber').html()) ? $('#lrnumber').html().split(':')[1].trim() : '',
		consignorName: $('#consignorName').val(),
		moduleId : 6
	};

	$.post(`${WEB_SERVICE_URL}/lRSearchWS/resendOTPMessage.do`, jsonObject, data => {
		if (data.message) {
			const { typeName, typeSymble, description } = data.message;
			OTPNumber = data.otpNumber;
			isOtpVerified = false;
			showMessage(typeName, `${typeSymble} ${description}`);
			if (typeName === 'success') {
				$('#otpInputDiv').show();
				$('#otpCode').val('').focus();
				startClock(10);
				otpSendCount++;
			} else {
				$('#otpCheckBox').prop('checked', false);
			}
		}
		hideLayer();
	}, 'json');
}

function resetOtpData(){
	$('#otpCheckBox').prop('checked', false);
	isOtpVerified = false;
	clearInterval(clockTimer);
	$('#otpVerificationStatusDiv').addClass('hide');
	$('#otpInputDiv').hide();
}