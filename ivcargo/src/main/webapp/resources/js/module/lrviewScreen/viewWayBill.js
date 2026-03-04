/**
 * @Author Anant Chaudhary	30-07-2016
 */
var wayBill	= null, jsonData = null;
var isAssignedSourceBranch	= false, allowForPenalty = false;
var wayBillId = 0, executiveBranchId = 0, wayBillTypeId = 0, executiveType = 0;

function loadViewWayBill(waybillId) {
	//showLayer();
	
	wayBillId	= waybillId;
	
	let jsonObject = new Object()
			
	jsonObject.waybillId	= wayBillId;
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/lRSearchWS/getLRDetailsByWayBillIdOnWeb.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			hideLayer();
			
			if(data.message != undefined) {
				let errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}
			
			wayBill		= data.wayBill;
			jsonData	= data;
			isAssignedSourceBranch		= data.isAssignedSourceBranch;
			allowForPenalty				= data.allowForPenalty;
			executiveBranchId			= data.executiveBranchId;
			executiveType				= data.executiveType;
			wayBillTypeId				= wayBill.wayBillTypeId;
			
			hideBookingCharges();
			getShortProperties();
			getExcessFieldProperties();
			getDamageProperties();
			
			if(data.IsPartialDispatchDetailsDisplay)
				changeDisplayProperty('buttonForPartialDispatch', 'inline-block');
				
			if(data.totalInsurancePremium != undefined) {
				$('#cancellationCharge').val(data.totalInsurancePremium);
				$('#cancellationCharge').attr('disabled', true);
			}
			
			showHideEditLinks(data);
		}
	});
}

function displayPartialDispatchDetails(wayBillId) {
	showLayer();
	let jsonObject = new Object()
			
	jsonObject.waybillId	= wayBillId;
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/dispatchWs/getPartialDispatchDetailsByWayBillId.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			hideLayer();
			
			if(data.message != undefined) {
				let errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}
			
			let dispatchSummaryArr			= data.dispatchSummary;
			let pendingDispatchStockArray	= data.PENDINGDISPATCHSTOCK;
					
			let totalDispatchWeight			= 0;
			let totalDispatchArticle		= 0;

			createHeaderForPartialDispatch();
			$('#partialDispatchDetails tbody').empty();
							
			for(let dispatchSummary of dispatchSummaryArr) {
				totalDispatchWeight				+= dispatchSummary.totalActualWeight;
				totalDispatchArticle			+= dispatchSummary.totalNoOfPackages;
									
				let createRow					= createRowInTable('', '', '');
									
				let lsNumberCol					= createColumnInRow(createRow, '', '', '', '', '', '');
				let lsBranchCol					= createColumnInRow(createRow, '', '', '', '', '', '');
				let dispatchDateCol				= createColumnInRow(createRow, '', '', '', '', '', '');
				let dispatchWeightCol			= createColumnInRow(createRow, '', '', '', 'center', '', '');
				let dispatchQuantityCol			= createColumnInRow(createRow, '', '', '', 'center', '', '');
									
				appendValueInTableCol(lsNumberCol, dispatchSummary.lsNumber);
				appendValueInTableCol(lsBranchCol, dispatchSummary.lsBranch);
				appendValueInTableCol(dispatchDateCol, dispatchSummary.tripDateTimeForString);
				appendValueInTableCol(dispatchWeightCol, dispatchSummary.totalActualWeight);
				appendValueInTableCol(dispatchQuantityCol, dispatchSummary.totalNoOfPackages);
									
				appendRowInTable('partialDispatchDetails', createRow);
			}
							
			setGrandTotal(totalDispatchWeight, totalDispatchArticle);
					
			if(pendingDispatchStockArray != undefined && pendingDispatchStockArray.length > 0) {
				createHeaderForPendingDispatch();
				$('#pendingDispatchStockDetails tbody').empty();
							
				for(let j = 0; j < pendingDispatchStockArray.length; j++) {
					let pendingDispatchStock	= pendingDispatchStockArray[j];
								
					let createRow				= createRowInTable('', '', '');
							
					let branchNameCol			= createColumnInRow(createRow, '', '', '', '', '', '');
					let pendingWeightCol		= createColumnInRow(createRow, '', '', '', 'center', '', '');
					let pendingQuantityCol		= createColumnInRow(createRow, '', '', '', 'center', '', '');
								
					appendValueInTableCol(branchNameCol, pendingDispatchStock.branchName);
					appendValueInTableCol(pendingWeightCol, pendingDispatchStock.pendingWeight);
					appendValueInTableCol(pendingQuantityCol, pendingDispatchStock.pendingQuantity);
								
					appendRowInTable('pendingDispatchStockDetails', createRow);
				}
							
				changeDisplayProperty('pending-dispatch-border-style', 'block');
			}
			
			openDialog('dialogPartialDispatch');
		}
	});
}

function createHeaderForPartialDispatch() {
    $('#HeaderForPartialDispatch').empty();
    
	let createHeaderRow				= createRowInTable('', '', '');
	
	let lsNumberCol					= createColumnInRow(createHeaderRow, '', '', '', 'center', 'font-weight: bold;', '');
	let lsBranchCol					= createColumnInRow(createHeaderRow, '', '', '', 'center', 'font-weight: bold;', '');
	let dispatchDateCol				= createColumnInRow(createHeaderRow, '', '', '', 'center', 'font-weight: bold;', '');
	let dispatchWeightCol			= createColumnInRow(createHeaderRow, '', '', '', 'center', 'font-weight: bold;', '');
	let dispatchQuantityCol			= createColumnInRow(createHeaderRow, '', '', '', 'center', 'font-weight: bold;', '');
	
	appendValueInTableCol(lsNumberCol, 'LS Number');
	appendValueInTableCol(lsBranchCol, 'LS Branch');
	appendValueInTableCol(dispatchDateCol, 'LS Date');
	appendValueInTableCol(dispatchWeightCol, 'Dispatched Weight');
	appendValueInTableCol(dispatchQuantityCol, 'Dispatch Article');
	
	appendRowInTable('HeaderForPartialDispatch', createHeaderRow);
}

function createHeaderForPendingDispatch() {
   $('#HeaderForPendingDispatch').empty();
   
	let createHeaderRow			= createRowInTable('', '', '');
	
	let branchNameCol			= createColumnInRow(createHeaderRow, '', '', '', 'center', 'font-weight: bold;', '');
	let pendingWeightCol		= createColumnInRow(createHeaderRow, '', '', '', 'center', 'font-weight: bold;', '');
	let pendingQuantityCol		= createColumnInRow(createHeaderRow, '', '', '', 'center', 'font-weight: bold;', '');
	
	appendValueInTableCol(branchNameCol, 'Branch');
	appendValueInTableCol(pendingWeightCol, 'Pending Weight');
	appendValueInTableCol(pendingQuantityCol, 'Pending Article');
	
	appendRowInTable('HeaderForPendingDispatch', createHeaderRow);
}

function setGrandTotal(totalDispatchWeight, totalDispatchArticle) {
	$('#FooterForPartialDispatch').empty();
	
	let createTotalRow			= createRowInTable('', '', '');
	
	let grandTotalCol				= createColumnInRow(createTotalRow, '', '', '', 'center', 'font-weight: bold;', '');
	let lsBranchCol					= createColumnInRow(createTotalRow, '', '', '', 'center', 'font-weight: bold;', '');
	let dispatchDateCol				= createColumnInRow(createTotalRow, '', '', '', 'center', 'font-weight: bold;', '');
	let totalDispatchWeightCol		= createColumnInRow(createTotalRow, '', '', '', 'center', 'font-weight: bold;', '');
	let totalDispatchQuantityCol	= createColumnInRow(createTotalRow, '', '', '', 'center', 'font-weight: bold;', '');
	
	appendValueInTableCol(grandTotalCol, 'Total');
	appendValueInTableCol(lsBranchCol, '');
	appendValueInTableCol(dispatchDateCol, '');
	appendValueInTableCol(totalDispatchWeightCol, totalDispatchWeight);
	appendValueInTableCol(totalDispatchQuantityCol, totalDispatchArticle);
	
	appendRowInTable('FooterForPartialDispatch', createTotalRow);
}

function validateForPaymentTypeCheque() {
	let deliveryPaymentType = document.getElementById('deliveryPaymentType');
	let chequeDate 	= document.getElementById('chequeDate');
	let chequeNo 	= document.getElementById('chequeNo');
	let chequeAmount= document.getElementById('chequeAmount');
	let bankName 	= document.getElementById('bankName');
	if(deliveryPaymentType.value == 2) {
		if(chequeDate.value == '') {
			showMessage('error', chequeDateErrMsg);
			toogleElement('error','block');
			changeError1('chequeDate','0','0');
			return false;
		} else {
		    removeError('chequeDate');
			toogleElement('error','none');
		}
		if(chequeNo.value == 'Cheque No' || chequeNo.value == '') {
			showMessage('error', chequeNumberErrMsg);
			toogleElement('error','block');
			changeError1('chequeNo','0','0');
			return false;
		} else {
		    removeError('chequeNo');
			toogleElement('error','none');
		}
		if(chequeAmount.value == 'Cheque Amount' || chequeAmount.value == '') {
			showMessage('error', chequeAmountErrMsg);
			toogleElement('error','block');
			changeError1('chequeAmount','0','0');
			return false;
		} else {
		    removeError('chequeAmount');
			toogleElement('error','none');
		}
		if(bankName.value == 'Bank Name' || bankName.value == '') {
			showMessage('error',bankNameErrMsg);
			toogleElement('error','block');
			changeError1('bankName','0','0');
			return false;
		} else {
		    removeError('bankName');
			toogleElement('error','none');
		}
	}
	return true;
}

function getprevnextCharge(ele) {
	let ch 	= document.getElementById("deliveryCharges");
	let len = ch.getElementsByTagName("input").length;
		for( let i=0;i<len;i++){
		if(ch.getElementsByTagName("input")[i].name == ele.name) {
			if(ch.getElementsByTagName("input")[i]==null || i==0) {
				if(document.getElementById('chequeDetails') != null) {
					if(document.getElementById('chequeDetails').style.display == 'block') { 
						prev ='bankName'; 
					} else { 
						prev ='deliveryPaymentType'; 
					}
				}
			} else {
				prev=ch.getElementsByTagName("input")[i-1].name;
			}
			if(ch.getElementsByTagName("input")[i+1] !=null) {
				next=ch.getElementsByTagName("input")[i+1].name;
			} else {
				next = 'deliver';
			}
		}
	}
}

function charsForDate(e){
	let keynum;
	if(window.event){keynum = e.keyCode;} else if(e.which){keynum = e.which;}
	if(keynum == 8 || keynum == 45){return true;}
	if (keynum < 48 || keynum > 57 ) {return false;}
	return true;
}

function disableButtons(){
	let dueUnDeliver 				= document.getElementById("dueUnDeliver");
	let dueDeliver 					= document.getElementById("dueDeliver");
	let deliver 					= document.getElementById("deliver");
	let crCancelButton				= document.getElementById("crCancellationBtn");
	let cancelButton				= document.getElementById('cancelButton');
			if(dueUnDeliver != null){
				dueUnDeliver.className = 'btn_print_disabled';
				dueUnDeliver.disabled=true;
				dueUnDeliver.style.display ='none'; 
			}
			if(dueDeliver != null){
			    dueDeliver.className = 'btn_print_disabled';
				dueDeliver.disabled=true;
				dueDeliver.style.display ='none';
			}
			if(deliver != null){
				deliver.className = 'btn_print_disabled';
				deliver.disabled=true;
				deliver.style.display ='none';
			};
			if(crCancelButton != null){
				crCancelButton.className = 'btn_print_disabled';
				crCancelButton.disabled=true;
				crCancelButton.style.display ='none';
			};
			if(cancelButton != null){
				cancelButton.className = 'btn_print_disabled';
				cancelButton.disabled=true;
				cancelButton.style.display ='none';
			};
}

function crCancellationProcess() {
	if(document.getElementById('cancelCrForExecutive') != null) {
		let executiveId = document.getElementById('cancelCrForExecutive');
			
		if(executiveId.value <= 0) {
			showSpecificErrors('remarkError',"Please select Executive");
			toogleElement('remarkError','block');
			changeError1('cancelCrForExecutive','0','1000');
			return false;	
		} else {
			toogleElement('remarkError','none');
			removeError('cancelCrForExecutive');
		}
	} else {
		removeError('cancelCrForExecutive');
		toogleElement('error','none');
	};
	
	if(crCancellationRemark != null) {
		if(crCancellationRemark.value == 'Remark' || crCancellationRemark.value == '') {
			if(deliveryRemark != undefined){
				setTimeout(function(){if(deliveryRemark)crCancellationRemark.focus(); crCancellationRemark.select();},100);
				showMessage('error',ramarkErrMsg);
				toogleElement('error','block');
				changeError1('crCancellationRemark','0','0');
				return false;
			}
		};
	} else {
		removeError('crCancellationRemark');
		toogleElement('error','none');
	};

	ans=confirm("Are you sure you want to cancel CR ?");
	
	if(ans) {
		document.wayBillForm.pageId.value	= "19";
		document.wayBillForm.eventId.value	= "7";
		document.wayBillForm.action			= "CRCancellation.do";
		disableButtons();
		//Disable page
		showLayer();
		document.wayBillForm.submit();
	} else {
		return false;
	};
}

function validateReceiveAmount(obj) {
	let objName 	= obj.name;
	let objVal		= 0;
	let maxAmt 		= parseInt(document.getElementById("shortCreditGrandTotal").value,10);
	let minAmt 		= parseInt(document.getElementById("shortCreditReceivedAmtLimit").value,10);
	
	if(minAmt > 0) {
		maxAmt = maxAmt - minAmt;
	}
	let isObjValshldzero = false;

	if(obj.value.length > 0) {
		objVal = parseInt(obj.value,10);
	}
	if(objVal > maxAmt) {
		alert('You can not enter greater value than '+maxAmt);
		isObjValshldzero = true;
	}
	if(isObjValshldzero) {
		obj.value = 0;
		objVal = 0;
	}
	document.getElementById("shortCreditBalanceAmt").value = parseInt(document.getElementById("shortCreditGrandTotal").value,10) 
	- (parseInt(document.getElementById("shortCreditReceivedAmtLimit").value) + objVal);

}

function populateExecutiveByBranchId(bId,destObjId){
	let branchId=bId;

	if(branchId=='0'){	
		let d=document.getElementById(destObjId);
		d.options.length=1;
		d.options[0].text='ALL';
		d.options[0].value=0;		
		return false;
	}
	
	let xmlHttp;
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
	
	let browser=navigator.appName;
	if(browser=="Microsoft Internet Explorer"){
		browser="IE";
	}else{
		browser="NOTIE";
	}
	xmlHttp.onreadystatechange=function() {	  
		
		if(xmlHttp.readyState==4) {
			let str=xmlHttp.responseText;
			String.prototype.trim = function () {
			    return this.replace(/^\s*/, "").replace(/\s*$/, "");
			};	
			str = str.trim();
			let d=document.getElementById(destObjId);
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
			let tempQty = new Array();
			tempQty = str.split(",");
			d.options.length=1;
			d.options.length=tempQty.length;    
			
			let html="";
			let i=1;
			
			if(browser=="IE"){
				while (tempQty[i] != null) {
					let temp = new Array();
					temp=tempQty[i].split('=');
					d.options[i].text=temp[0];

					let m=parseInt(temp[1]);
					d.options[i].value=m;
					i=i+1;
				}
			}else{
				while (tempQty[i] != null) {
					let temp = new Array();
					temp=tempQty[i].split('=');
					d.options[i].textContent=temp[0];
					
					let m=parseInt(temp[1]);
					d.options[i].value=m;
					i=i+1;
				}
			}
			execReqd=false;
			}
		}
	};
	xmlHttp.open("GET","jsp/ajaxinterface.jsp?filter=5&branch="+branchId + '&displayOnlyActiveUsers=true&displaySuperAdmin=false',true);
	xmlHttp.send(null);
}

function getBrowserHeight() {
	let intH = 0;
	let intW = 0;
	 if(typeof window.innerWidth  == 'number') {
		intH = window.innerHeight;
		intW = window.innerWidth;
	} else if(document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
		intH = document.documentElement.clientHeight;
		intW = document.documentElement.clientWidth;
	} else  if(document.body && (document.body.clientWidth || document.body.clientHeight)) {
		intH = document.body.clientHeight;
		intW = document.body.clientWidth;
	}
	//intH = $('#mainTable').height()+150;intW = $('#mainTable').width()+150;
	return { width: parseInt(intW), height: parseInt(intH) };
}

function setLayerPosition() {
	let shadow = document.getElementById("shadow");
	let question = document.getElementById("question");
	let bws = getBrowserHeight();
	shadow.style.width = bws.width + "px";
	shadow.style.height = bws.height + "px";
	question.style.left = parseInt((bws.width - 350) / 2);
	question.style.top = parseInt((bws.height - 200) / 2);
	shadow = null;
	question = null;
}

function showLayer() {
	setLayerPosition();
	let shadow = document.getElementById("shadow");
	let question = document.getElementById("question");
	shadow.style.display = "block"; 
	question.style.display = "block";
	shadow = null;
	question = null;             
}

function hideLayer() {
	let shadow = document.getElementById("shadow");
	let question = document.getElementById("question");
	shadow.style.display = "none"; 
	question.style.display = "none";
	shadow = null;
	question = null; 
}

function openWindowForNextLRView() {
	let wayBillNumber 	= $('#wayBillNo').val();
	let nextWayBillNumber 	= null;
	let number 	= 0;
		
	if(wayBillNumber.includes("/")) {
		let strArr	= wayBillNumber.split("/");
		number	= Number(strArr[1]) + 1;
		nextWayBillNumber	= strArr[0] + "/" + number;
	} else {
		nextWayBillNumber	= Number(wayBillNumber) + 1;
	}
	
	window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillNumber='+nextWayBillNumber+'&TypeOfNumber='+1,'_self');
}

function openWindowForPrevLRView() {
	let wayBillNumber 	= $('#wayBillNo').val();
	let prevWayBillNumber 	= null;
	let number 	= 0;
		
	if(wayBillNumber.includes("/")) {
		let strArr	= wayBillNumber.split("/");
		number	= Number(strArr[1]) - 1;
		prevWayBillNumber	= strArr[0] + "/" + number;
	} else {
		prevWayBillNumber	= Number(wayBillNumber) - 1;
	}

	window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillNumber='+prevWayBillNumber+'&TypeOfNumber='+1,'_self');
}

function openCtoDetainRemarkPopup(lockRemark,releaseRemark,lockDate,releaseDate, lockedBy){
	$('#lockRemark').html(lockRemark);$('#releaseRemark').html(releaseRemark);$('#lockDate').html(lockDate);$('#releaseDate').html(releaseDate);$('#lockedBy').html(lockedBy);
	let modal = document.getElementById('ctoDetainModelpopup');
	let span = document.getElementsByClassName("close")[0];
	modal.style.display = "block";
	span.onclick = function() {
	    modal.style.display = "none";
	}
	window.onclick = function(event) {
	    if (event.target == modal) {
	        modal.style.display = "none";
	    }}}

function closeCtoDetainRemarkPopup(){
	let modal = document.getElementById('ctoDetainModelpopup');
    modal.style.display = "none";
}

function showInfo(elObj,tagToDisp) {
	div = document.getElementById('info');
	div.style.display='block';
	let elPos= findPos(elObj);
	div.style.left=elPos[0]+'px';
	div.style.top=elPos[1] -16 +'px';
	if(tagToDisp == 'Delivered To PhoneNo.') {
		tagToDisp = tagToDisp + ' : ' + elObj.value.length;
	}
	div.innerHTML=tagToDisp;
}
function hideInfo() {
	document.getElementById('info').style.display='none';
}

function showPhoto(masterid, moduleIdentifier) {
	childwin = window.open('photoService.do?pageId=340&eventId=2&modulename=viewPhotoUpload&masterid=' + masterid + '&moduleId=' + moduleIdentifier + '&redirectFilter=1','newwindow', config='height=600,width=825, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function showIDProofPhoto(masterid, moduleIdentifier) {
	childwin = window.open('photoService.do?pageId=340&eventId=2&modulename=viewPhotoUpload&masterid=' + masterid + '&moduleId=' + moduleIdentifier + '&isIDProofPhotoDetails=true','newwindow', config='height=600,width=825, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function viewSignatureService(crid) {
	childwin = window.open ('signatureService.do?pageId=340&eventId=2&modulename=viewGenerateCRSignatureService&crid='+crid,'newwindow',config='left=300,top=100,height=350,width=500, toolbar=no, menubar=no, scrollbars=yes, resizable=no,');
}
function editLrRateAfterDel(wayBillId,creditorId){
	childwin = window.open('editWayBillCharges.do?pageId=340&eventId=2&modulename=editLRRate&wayBillId='+wayBillId+'&creditorId='+creditorId+'&billId='+0+'&creditorInvoice=false&redirectFilter=1','mywin','left=100,top=70,width=1100,height=900,toolbar=no,resizable=no,scrollbars=yes');
}
function getShortCreditDetails(creditWayBillTxnId){
	childwin = window.open('shortCreditPaymentDetails.do?pageId=340&eventId=2&modulename=shortCreditPaymentDetails&creditWayBillTxnId=' + creditWayBillTxnId,'newwindow', config='height=600,width=825, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function getShortCreditBillDetails(shortCReditId){
	newwindow=window.open('stbsBillPaymentDetails.do?pageId=340&eventId=2&modulename=stbsBillPaymentDetails&shortCreditCollLedgerId='+shortCReditId,'newwindow', config='height=310,width=1200, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function viewShortSettlementDetails(shortReceiveId){
	childwin = window.open('shortReceiveSettlementDetails.do?pageId=340&eventId=2&modulename=shortReceiveSettlementDetails&shortReceiveId=' + shortReceiveId,'newwindow', config='height=600,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function viewDamageSettlementDetails(damageReceiveId){
	childwin = window.open('damageReceiveSettlementDetails.do?pageId=340&eventId=2&modulename=damageReceiveSettlementDetails&damageReceiveId=' + damageReceiveId,'newwindow', config='height=600,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function viewExcessSettlementDetails(excessReceiveId){
	childwin = window.open('excessReceiveSettlementDetails.do?pageId=340&eventId=2&modulename=excessReceiveSettlementDetails&excessReceiveId=' + excessReceiveId,'newwindow', config='height=600,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function updateSourceBranch(waybillId,bookingBranchId,sourceBranchId){
	childwin = window.open('updateSourceBranch.do?pageId=340&eventId=2&modulename=editLRSource&waybillId=' + waybillId+'&bookingBranchId='+bookingBranchId+'&sourceBranchId='+sourceBranchId+'&redirectFilter=1','newwindow', config='height=600,width=825, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function updatePrivateMarka(wayBillId){
	childwin = window.open('updatePrivateMarka.do?pageId=340&eventId=2&modulename=updateWayBillPrivateMarka&masterid=' + wayBillId,'newwindow', config='height=450,width=600, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function updateWayBillDelcaredValue(wayBillId) {
	childwin = window.open('updateDeclaredValue.do?pageId=340&eventId=2&modulename=updateWayBillDeclareValue&wayBillId=' + wayBillId,'newwindow', config='height=450,width=600, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function updateWayBillInvoiceNo(wayBillId){
	childwin = window.open ('updateWayBillInvoiceNo.do?pageId=340&eventId=2&modulename=updateLrInvoiceNumber&wayBillId='+wayBillId+'&redirectFilter=1','newwindow',config='left=300,top=100,height=500,width=700, toolbar=no, menubar=no, scrollbars=no, resizable=no,');
}
function updateOTLRNumber(wayBillId){
	childwin = window.open ('updateOTLRNumber.do?pageId=340&eventId=2&modulename=updateOTLRNumber&wayBillId='+wayBillId+'&redirectFilter=1','newwindow',config='left=300,top=100,height=500,width=900, toolbar=no, menubar=no, scrollbars=no, resizable=no,');
}
function sendLrPdfEmail(wayBillId, waybillNumber){
	childwin = window.open ('SendLrPdfEmail.do?pageId=294&eventId=16&wayBillId='+wayBillId+'&waybillNo='+waybillNumber,'newwindow',config='left=300,top=100,height=500,width=800, toolbar=no, menubar=no, scrollbars=no, resizable=no,');
}
function sendLrPrintEmail(wayBillId) {
	childwin = window.open("printWayBill.do?pageId=340&eventId=10&modulename=lrPrint&masterid=" + wayBillId + "&isRePrint=true&isLrPdfAllow=true&isPdfExportAllow=false","newwin","width=400,height=200");
}
function updateWayBillGodown(wayBillId, godownId,ReceivedAtBranchId) {
	childwin = window.open('updateWayBillGodown.do?pageId=340&eventId=2&modulename=updateWayBillGodown&wayBillId=' + wayBillId + '&godownId=' + godownId+ '&ReceivedAtBranchId=' + ReceivedAtBranchId,'newwindow', config='height=450,width=600, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function updateWayBillRemark(wayBillId){
	childwin = window.open ('updateWayBillRemark.do?pageId=340&eventId=2&modulename=updateWayBillRemark&wayBillId=' + wayBillId,'newwindow', config='height=450,width=600, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function updateBillingBranch(wayBillId,billingBranchId){
	childwin = window.open ('updateWayBillBillingBranch.do?pageId=340&eventId=2&modulename=updateBillingBranch&wayBillId=' + wayBillId+'&billingBranchId='+billingBranchId+'&redirectFilter=1','newwindow', config='height=450,width=1055, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function updateRecoveryBranch(wayBillId,recoveryBranchId){
	childwin = window.open ('updateRecoveryBranch.do?pageId=340&eventId=2&modulename=updateRecoveryBranch&wayBillId=' + wayBillId+'&recoveryBranchId='+recoveryBranchId+'&redirectFilter=1','newwindow', config='height=450,width=1055, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function viewLRRemarks(wayBillId){
	childwin = window.open ('lRRemarks.do?pageId=340&eventId=2&modulename=lRRemarks&wayBillId=' + wayBillId,'newwindow', config='left=200,top=130,width=1055,height=490, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function viewContainerDetails(wayBillId){
	childwin = window.open ('containerDetails.do?pageId=340&eventId=2&modulename=containerDetails&wayBillId=' + wayBillId,'newwindow', config='left=200,top=130,width=1055,height=490, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function viewUnclaimedGoodsNotice(wayBillId){
	childwin = window.open ('unclaimedGoodsNotice.do?pageId=340&eventId=2&modulename=viewUnclaimedGoodsNotice&wayBillId=' + wayBillId,'newwindow', config='left=200,top=130,width=1055,height=490, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function updateWayBillVehicleType(wayBillId, vehicleTypeId){
	childwin = window.open ('updateWayBillVehicleType.do?pageId=294&eventId=9&wayBillId='+wayBillId+'&vehicleTypeId='+vehicleTypeId,'newwindow',config='left=300,top=100,height=200,width=400, toolbar=no, menubar=no, scrollbars=no, resizable=no,');
}
function updateWayBillDeliveryTo(wayBillId, deliveryTo){
	childwin = window.open ('updateWayBillDeliveryTo.do?pageId=294&eventId=11&wayBillId='+wayBillId+'&deliveryTo='+deliveryTo,'newwindow',config='left=300,top=100,height=380,width=800, toolbar=no, menubar=no, scrollbars=no, resizable=no,');
}
function updateWayBillBookingType(wayBillId, bookingTypeId, status){
	childwin = window.open ('updateWayBillBookingType.do?pageId=294&eventId=13&wayBillId='+wayBillId+'&bookingTypeId='+bookingTypeId+'&status='+status+'&isReceiveCheck='+true,'newwindow',config='left=300,top=100,height=200,width=500, toolbar=no, menubar=no, scrollbars=no, resizable=no,');
}
function createMRForPaidandToPayLR(wayBillId) {
	if(!confirm('Are you sure you want to Create Invoice?'))
		return;

	childwin = window.open('createMRForPaidandToPayLR.do?pageId=340&eventId=2&modulename=createMRForPaidandToPayLR&masterid='+wayBillId+'&redirectFilter=1','newwindow','left=300,top=100,width=1000,height=350,toolbar=no,resizable=no,scrollbars=no');
}

function editManualWayBillNumber(wayBillId){
	childwin = window.open('editManualWayBillNo.do?pageId=340&eventId=2&modulename=updateLRNumber&masterid='+wayBillId+'&redirectFilter=1','newwindow','left=300,top=100,width=1000,height=350,toolbar=no,resizable=no,scrollbars=no');
}
function viewBillSummary(creditWayBillTxnId,wayBillNumber,dateToDisplay,wayBillId,txnTypeId) {
	window.open('viewBillSummary.do?pageId=236&eventId=16&creditWayBillTxnId='+creditWayBillTxnId+'&wayBillNumber='+wayBillNumber+'&dateToDisplay='+dateToDisplay+'&wayBillId='+wayBillId+'&txnTypeId='+txnTypeId,'mywin','left=20,top=20,width=700,height=500,toolbar=1,resizable=1,scrollbars=1');
}
function printWindowForMoneyReceipt(wayBillId,moduleIdentifier){
	childwin = window.open ("printMoneyReceipt.do?pageId=3&eventId=16&wayBillId="+wayBillId+"&moduleIdentifier="+moduleIdentifier+"&multipleCrModuleIdentifier=17"+"&ddmSettlementModuleIdentifier=20","newwindow",config="height=500,width=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no");
}

function printWindowBookingInvoicePrint(billId) {
	childwin = window.open('printWayBill.do?pageId=340&eventId=10&modulename=InvoicePrint&masterid=' + billId + '&isBkgDlyTimeInvoicePrint='+ true, 'newwindow', 'config=height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function printWindowForSTB(wayBillId){
	childwin = window.open ("printSTB.do?pageId=300&eventId=2&wayBillId="+wayBillId,"newwindow",config="height=500,width=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no");
}
function viewDetails(wayBillId) { childwin = window.open ('viewDetails.do?pageId=2&eventId=7&wayBillId='+wayBillId+'', 'newwindow', config='height=1000,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no'); }
function viewPODDetails(wayBillId) { 
	childwin = window.open ('viewDetails.do?pageId=340&eventId=2&modulename=viewPODStatusDetails&masterid='+wayBillId,'newwindow', config='height=350,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function showEditPODRequired(wayBillId,wayBillTypeId) { 
	childwin = window.open ('viewDetails.do?pageId=340&eventId=2&modulename=editPODRequired&masterid='+wayBillId+'&wayBillTypeId='+wayBillTypeId,'newwindow', config='height=350,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function showEditReservedLR(wayBillId) { 
	childwin = window.open ('viewDetails.do?pageId=340&eventId=2&modulename=editReservedLRBooking&masterid='+wayBillId,'newwindow', config='height=350,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function showEditPaymentRequired(wayBillId) { 
	childwin = window.open ('viewDetails.do?pageId=340&eventId=2&modulename=editPaymentRequired&masterid='+wayBillId,'newwindow', config='height=350,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function updateConsignment(wayBillId, wayBillNo,shortCreditLedgerNumber,allowEditRateAndConsignmentAfteSTBS ,billId){
	if(allowEditRateAndConsignmentAfteSTBS =='true') {
		showMessage('info',"You Can Not Edit Consignment as  LR No:"+wayBillNo+" Present in STBS No:"+shortCreditLedgerNumber);
		return false;
	}
	childwin = window.open('updateConsignment.do?pageId=340&eventId=2&modulename=editConsignment&wayBillId='+wayBillId+'&wayBillNo='+wayBillNo+'&billId='+billId+'&redirectFilter=1','newwindow','left=100,top=70,width=1100,height=900,toolbar=no,resizable=no,scrollbars=yes');
}
function updateWayBillFormType(wayBillId,formTypeIds) {
	childwin = window.open('updateWayBillFormType.do?pageId=340&eventId=2&modulename=updateWayBillFormType&wayBillId=' + wayBillId + '&formTypeIds=' + formTypeIds,'newwindow', config='height=400,width=825, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function getConfigDiscount(wayBillId,partyId){
	childwin = window.open('updateWayBillFormType.do?pageId=340&eventId=2&modulename=configDiscount&wayBillId=' + wayBillId + '&partyId=' + partyId ,'newwindow', config='height=500,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function viewWayBillExpense(wayBillId, wayBillNumber){
	childwin = window.open ("viewWayBillExpense.do?pageId=25&eventId=7&wayBillId="+wayBillId+"&wayBillNo="+wayBillNumber,"newwindow",config="height=500,width=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no");
}
function addWayBillIncome(wayBillId, wayBillNumber){
	childwin = window.open ('addWayBillIncome.do?pageId=340&eventId=2&modulename=addWayBillIncome&wayBillId='+wayBillId+'&wayBillNumber='+wayBillNumber,'newwindow', config='height=400,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function viewWayBillIncome(wayBillId, wayBillNumber){
	childwin = window.open ("viewWayBillIncome.do?pageId=25&eventId=13&wayBillId="+wayBillId+"&wayBillNo="+wayBillNumber,"newwindow",config="height=500,width=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no");
}
function customerEnquiry(wayBillId, wayBillNumber){
	childwin = window.open ("customerEnquiry.do?pageId=25&eventId=8&wayBillId="+wayBillId+"&wayBillNo="+wayBillNumber,"newwindow",config="height=450,width=600, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no");
}
function showEditPODRemark(wayBillId) { 
	childwin = window.open ('viewDetails.do?pageId=340&eventId=2&modulename=editPODRemark&wayBillId='+wayBillId+'&redirectFilter=1','newwindow', config='height=350,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function updateWayBillDeliveryPaymentType(crId){
	childwin = window.open ('updateWayBillDeliveryPaymentType.do?pageId=340&eventId=2&modulename=updateWayBillDeliveryPaymentType&masterid=' + crId,'newwindow', config='height=450,width=600, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function viewDoorPickupDetails(wayBillId){
	childwin = window.open ('viewDoorPickupDetails.do?pageId=340&eventId=2&modulename=DoorPickupDetails&masterid=' + wayBillId,'newwindow', config='height=450,width=1500, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function updateTransportationMode(wayBillId, billId) {
		childwin = window.open ('updateTransportationMode.do?pageId=340&eventId=2&modulename=updateTransportationMode&wayBillId='+wayBillId+'&billId='+billId+'&redirectFilter=1','newwindow', config='height=400,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function updateWayBillPaymentType(wayBillId, paymentMode) {
	childwin = window.open ('editWaybillPaymentMode.do?pageId=340&eventId=2&modulename=editWaybillPaymentMode&wayBillId='+wayBillId+'&paymentMode='+paymentMode+'&redirectFilter=1','newwindow', config='height=400,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function updateWayBillDate(wayBillId) {
	childwin = window.open ('editLrBookingDate.do?pageId=340&eventId=2&modulename=editLrBookingDate&wayBillId='+wayBillId+'&redirectFilter=1','newwindow', config='height=400,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function viewChequeBounceDetails(wayBillId, moduleIdentifier) {
	childwin = window.open ('viewChequeBounceDetails.do?pageId=340&eventId=2&modulename=viewChequeBounceDetails&wayBillId='+wayBillId+'&moduleId='+moduleIdentifier+'&redirectFilter=1','newwindow', config='height=400,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function lrReturnBooking(wayBillId) {
	childwin = window.open ('lrReturnBooking.do?pageId=340&eventId=2&modulename=returnLrBooking&wayBillId='+wayBillId+'&redirectFilter=1','newwindow', config='height=800,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function showOldNewLR(wayBillId) {
	window.open('SearchWayBillAction.do?pageId=3&eventId=8&wayBillId=' + wayBillId + '&id=search');
}
function openEwaybillDeatils(wayBillId){
    window.open ('Dispatch.do?pageId=340&eventId=2&modulename=consolidateEwaybillDetails&wayBillId='+wayBillId+'&redirectFilter=1','newwindow', config='height=800,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function updateAdditonalRemark(wayBillId){
	childwin = window.open('updateAdditonalRemark.do?pageId=340&eventId=2&modulename=updateWayBillAdditionalRemark&masterid=' + wayBillId,'newwindow', config='height=450,width=600, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function updateWithBillEstimate(wayBillId){
	childwin = window.open('updateWithBillEstimate.do?pageId=340&eventId=2&modulename=updateWithBillEstimate&masterid=' + wayBillId,'newwindow', config='height=450,width=600, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function updateCategoryType(wayBillId){
	childwin = window.open('updateCategoryType.do?pageId=340&eventId=2&modulename=updateCategoryType&masterid=' + wayBillId,'newwindow', config='height=800,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function updateGstType(wayBillId){
	childwin = window.open('updateGstType.do?pageId=340&eventId=2&modulename=updateGstType&masterid=' + wayBillId,'newwindow', config='height=450,width=600, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function viewInvoiceDetails(wayBillId){
	childwin = window.open ('invoiceDetails.do?pageId=340&eventId=2&modulename=lrInvoiceDetails&wayBillId=' + wayBillId,'newwindow', config='left=200,top=130,width=1055,height=490, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function editInvoiceDetails(wayBillId){
	childwin = window.open ('invoiceDetails.do?pageId=340&eventId=2&modulename=updateMultipleInvoiceDetails&wayBillId=' + wayBillId,'newwindow', config='left=200,top=130,width=1055,height=490, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function viewCODDetails(wayBillId) { 
	childwin = window.open ('viewDetails.do?pageId=340&eventId=2&modulename=codStatusDetails&masterid='+wayBillId,'newwindow', config='height=350,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function editPickupDetails(wayBillId){
	childwin = window.open ('pickupDetails.do?pageId=340&eventId=2&modulename=updatePickupDetails&wayBillId=' + wayBillId,'newwindow', config='left=200,top=130,width=1055,height=490, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function viewVehicleLocationDetails(wayBillId){
	childwin = window.open ('viewVehicleLocationDetails.do?pageId=340&eventId=2&modulename=viewVehicleLocationDetails&wayBillId=' + wayBillId,'newwindow', config='left=200,top=130,width=1055,height=490, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function updateLrPickupType(wayBillId){
	childwin = window.open ('updateLrPickupType.do?pageId=340&eventId=2&modulename=updateLrPickupType&masterid=' + wayBillId,'newwindow', config='left=200,top=130,width=800,height=300, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function updateConsigneePartyShortCreditTxn(wayBillId, consigneeCorporateAccountId) {
	let jsonObject			= new Object();
	
	jsonObject.ConsigneeCorporateAccountId		= consigneeCorporateAccountId;
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/partyMasterWS/updatePartyShortCreditTxn.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				let errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			}
			hideLayer();
		}
	});
}

function resendOTPForDeliveryLR(waybillId, wayBillNumber) {
	showLayer();
	let jsonObject = new Object()
			
	jsonObject.waybillId		= waybillId;
	jsonObject.wayBillNumber	= wayBillNumber;
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/lRSearchWS/resendOTPMessage.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				let errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			}
			hideLayer();
		}
	});
}

function showhidedetails(div,ahref){
    if(ahref == 'Consigneradd'){
        document.getElementById(div).style.display = '';
        document.getElementById('Consigneradd').style.visibility= 'hidden';
        document.getElementById('Consignersub').style.visibility= 'visible';
    } else if(ahref == 'Consignersub') {
        document.getElementById(div).style.display = 'none';
        document.getElementById('Consigneradd').style.visibility= 'visible';
        document.getElementById('Consignersub').style.visibility= 'hidden';
    } else if(ahref == 'Consigneeadd') {
  	  document.getElementById(div).style.display = '';
        document.getElementById('Consigneeadd').style.visibility= 'hidden';
        document.getElementById('Consigneesub').style.visibility= 'visible';
    } else if(ahref == 'Consigneesub') {
        document.getElementById(div).style.display = 'none';
        document.getElementById('Consigneeadd').style.visibility= 'visible';
        document.getElementById('Consigneesub').style.visibility= 'hidden';
    }
}
function fillclearText(text,text1){
	let textValue = text.value;
    if(textValue == '' ){
        text.value = text1;
    }else{
  	  text.value = textValue;
    };
}
function getAmountOnCancellation() {
	let gratdTotal= document.getElementById('grandTotal');
	let refundAmount = document.getElementById('refundAmount');
	let cancellationCharge = document.getElementById('cancellationCharge');
	refundAmount.value=parseFloat(gratdTotal.value-cancellationCharge.value);
}
function afterDelayForGroup() {
	childwin.document.getElementById('data').innerHTML= document.getElementById('PrintForGroup').innerHTML;
	childwin.print();
	childwin.close();
}

function showBillPaymentStatus(billId) { 
	childwin = window.open ('viewDetails.do?pageId=340&eventId=2&modulename=billPaymentDetails&billId='+billId,'newwindow', config='height=400,width=1500, toolbar=no, menubar=no, scrollbars=yes, resizable=yes,location=no, directories=no, status=no');
}
function showDummyLRMessage() { alert("You can not edit Dummy LR !!!!"); }

function calulateBillAmount() {
	let amount	= 0;
	let ch		= document.getElementById('deliveryCharges');
	
	if(ch != null) {
		let len =  ch.getElementsByTagName('input').length;
	
		for(let i=0;i<len;i++){
			if(ch.getElementsByTagName('input')[i].value.length > 0 
				  && 
				  (ch.getElementsByTagName('input')[i].name !='txtDelDisc'
					&& ch.getElementsByTagName('input')[i].name !='configOctroiAmount'
					&& ch.getElementsByTagName('input')[i].name !='configDamerageAmount')
				  ){
		   	amount = parseFloat(amount)+parseFloat(ch.getElementsByTagName('input')[i].value);
		  }
		}
	}
	if(document.getElementById('txtDelDisc')) {
		if(document.getElementById('txtDelDisc').value == '') {
			document.getElementById('txtDelDisc').value = '0';
		}
		document.getElementById('billAmount').value = parseFloat(amount) - parseFloat(document.getElementById('txtDelDisc').value);
	} else {
		document.getElementById('billAmount').value = parseFloat(amount);
	}
	calculateDeliveryTimeST();
}

function chkDiscount() {
if(document.getElementById('billAmount').value<0){
	alert('Invalid Discount !');
	document.getElementById('txtDelDisc').value = '0';
	document.getElementById('txtDelDisc').focus();
}
}
function setDeliveryHeader() {
let billAmount 				= document.getElementById('billAmount');
let grandTotal 				= document.getElementById('grandTotal');
let deliveryChargeHeader 	= document.getElementById('deliveryChargeHeader');
if(billAmount.value != grandTotal.value){
	if(deliveryChargeHeader != null){
		deliveryChargeHeader.innerHTML = 'OLD Delivery Charges';
	};
};
}
function pendingDelivery(str) {
let pendingDeliveryRemark = document.getElementById('PendingDeliveryRemark');
if(pendingDeliveryRemark != null){
	if(pendingDeliveryRemark.value == '' || pendingDeliveryRemark.value == 'Remark'){
		alert('Please Enter Remark');
		setTimeout(function(){if(pendingDeliveryRemark)pendingDeliveryRemark.focus();pendingDeliveryRemark.select();},100);
		return false;
	};
}
ans=confirm("Are you sure you want to do "+str+" ?");
if(ans){
	document.wayBillForm.pageId.value					=	"42";
	document.wayBillForm.eventId.value					=	"1";
	document.wayBillForm.DeliveryPendingString.value	=	str;
	document.wayBillForm.action							=	"DeliveryPending.do";
	showLayer();
	document.wayBillForm.submit();
}else{
	return false;
};
}


function receiveSingleWayBill(){
	let answer = confirm ("Are you sure you want to Receive waybill ?")
	if (answer){
		disableButtons();
		showLayer();	//Disable page
		document.wayBillForm.pageId.value="18";
		document.wayBillForm.eventId.value="9";
		document.wayBillForm.action="receivableForm.do";
		document.wayBillForm.submit();
	}
}

function shortCreditPaymentValidation(){
	if(document.getElementById('shortCreditPaymentMode').value == 0){
		showMessage('error', paymentModeErrMsg);
		toogleElement('error','block');
		changeError1('shortCreditPaymentMode','0','0');
		$("#shortCreditPaymentMode").focus();
		return false;
	} else { toogleElement('error','none'); }
	if(document.getElementById('shortCreditRemark').value.trim() == 'Remark' || document.getElementById('shortCreditRemark').value.trim() ==""){
		showMessage('error', ramarkErrMsg);
		toogleElement('error','block');
		changeError1('shortCreditRemark','0','0');
		$("#shortCreditRemark").focus();
		return false;
	} else { toogleElement('error','none'); }
	if(document.getElementById('shortCreditPaymentMode').value == PAYMENT_TYPE_CHEQUE_ID){
		if(document.getElementById('shortCreditChequeNumber').value.trim() == 'Cheque No' || document.getElementById('shortCreditChequeNumber').value.trim() ==""){
			showMessage('error', chequeNumberErrMsg);
			toogleElement('error','block');
			changeError1('shortCreditChequeNumber','0','0');
			$("#shortCreditChequeNumber").focus();
			return false;
		} else { toogleElement('error','none'); }
	if(document.getElementById('shortCreditBankName').value.trim() == 'Bank Name' || document.getElementById('shortCreditBankName').value.trim() ==""){
			showMessage('error','Please Enter Bank Name !');
			toogleElement('error','block');
			changeError1('shortCreditBankName','0','0');
			$("#shortCreditBankName").focus();
			return false;
		} else { toogleElement('error','none');	}
	if(document.getElementById('shortCreditChequeDate').value.trim() ==""){
			showMessage('error', chequeDateErrMsg);
			toogleElement('error','block');
			changeError1('shortCreditChequeDate','0','0');
			$("#shortCreditChequeDate").focus();
			return false;
		} else { toogleElement('error','none'); }
	} else { toogleElement('error','none'); }
	if(document.getElementById('shortCreditPaymentStatus').value == 0){
		showMessage('error','Please Select Payment Status !');
		toogleElement('error','block');
		changeError1('shortCreditPaymentStatus','0','0');
		$("#shortCreditPaymentStatus").focus();
		return false;
	} else { toogleElement('error','none'); }
	if(document.getElementById('shortCreditReceiveAmt').value.trim() == "" || parseInt(document.getElementById('shortCreditReceiveAmt').value.trim(),10) == 0 ){
		showMessage('error', receivedAmountErrMsg);
		toogleElement('error','block');
		changeError1('shortCreditReceiveAmt','0','0');
		$("#shortCreditReceiveAmt").focus();
		return false;
	} else { toogleElement('error','none'); }
	if(parseInt(document.getElementById('shortCreditReceiveAmt').value.trim(),10) < parseInt(document.getElementById('shortCreditGrandTotal').value.trim(),10) ){
		//selectOptionByValue(document.getElementById('shortCreditPaymentStatus'), BILL_CLEARANCE_STATUS_NEGOTIATED_ID);
	} else {
		selectOptionByValue(document.getElementById('shortCreditPaymentStatus'), BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID);
	}
	toogleElement('error','none');
	let paymentStatus 	= document.getElementById("shortCreditPaymentStatus").value;
	let disType 		= document.getElementById("discountTypes2").value;
	
	if(paymentStatus == BILL_CLEARANCE_STATUS_NEGOTIATED_ID && disType == 0){
		showMessage('error', discountTypeErrMsg);
		toogleElement('error','block');
		changeError1('discountTypes2','0','0');
		return false;
	} else {
	    removeError('discountTypes2');
		toogleElement('error','none');
		return true;
	}
}

function showHideChequeDetailsForCreditPayment(obj) {
	if(obj.value == PAYMENT_TYPE_CHEQUE_ID) {
		document.getElementById('shortCreditChequeNumber').style.display = 'block';
		document.getElementById('shortCreditBankName').style.display = 'block';
		document.getElementById('shortCreditChequeDate').style.display = 'block';
		document.getElementById('fd-but-shortCreditChequeDate').style.display = 'block';
	} else {
		document.getElementById('shortCreditChequeNumber').value = 'Cheque No';
		document.getElementById('shortCreditChequeNumber').style.display = 'none';
		document.getElementById('shortCreditBankName').value = 'Bank Name';
		document.getElementById('shortCreditBankName').style.display = 'none';
		document.getElementById('shortCreditChequeDate').value = '';
		document.getElementById('shortCreditChequeDate').style.display = 'none';
		document.getElementById('fd-but-shortCreditChequeDate').style.display = 'none';
	};
}

function openQrPrint(wayBillId) {
	childwin = window.open("printWayBill.do?pageId=340&eventId=10&modulename=qrprint&masterid=" + wayBillId + "&isRePrint=true&isQrBtnClicked=true","newwin","width=400,height=200");
}

function printWindowForCRPdf(crId,isPdfExportAllow){
	childwin = window.open("printWayBill.do?pageId=340&eventId=10&modulename=crPrint&masterid=" + crId + "&isRePrint=true&isCrPdfAllow=false&isPdfExportAllow="+isPdfExportAllow,"newwin","width=400,height=200");
}

shortcut.add('Alt+x',function() {window.location = deliveryPageUrl + '&wayBillId='+$('#wayBillId').val() + '&waybillNo='+$('#waybillNo').val()});

function cancelWayBill(waybillId) {
	showLayer();
	let jsonObject = new Object()
			
	jsonObject.waybillId		  			= waybillId;
	jsonObject.centerlizeCancelltaion	  	= $('#centerlizeCancelltaion').val();
	jsonObject.cancelForExecutive		  	= $('#cancelForExecutive').val();
	jsonObject.cancellationCharge		  	= $('#cancellationCharge').val();
	jsonObject.cancelRemark		 		 	= $('#cancelRemark').val();
	jsonObject.TokenCheckBox		 		= $('#TokenCheckBox').val();
	jsonObject.CustomerCheckBox		 		= $('#CustomerCheckBox').val();
	jsonObject.ConsignorLetterCheckBox		= $('#ConsignorLetterCheckBox').val();
	jsonObject.StatisticalChargeCheckBoxList= $('#StatisticalChargeCheckBoxList').val();
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/lrCancellationWS/cancelWayBill.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				let errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				
				setTimeout(() => {
					document.wayBillForm.pageId.value				= "3";
					document.wayBillForm.eventId.value				= "8";
					document.wayBillForm.wayBillId.value			= waybillId;
					document.wayBillForm.action						= "transportEdit.do";
					document.wayBillForm.submit();
				}, 1000);
				
				return;
			}
			hideLayer();
		}
	});
}

function updateLRType(wayBillId){
	 childwin = window.open ('updateLRType.do?pageId=25&eventId=35&wayBillId='+wayBillId+'&redirectTo=1','newwindow','left=200,top=100,width=850,height=660, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function saveShortCreditPayment(wayBillId,wayBillNo){
	if(shortCreditPaymentValidation()){
		if(confirm("Are you sure you want clear payment for this LR ?")){
			document.getElementById("saveShortCreditPaymentBtn").style.display = 'none';
			let shortCreditPaymentMode 	= document.getElementById('shortCreditPaymentMode').value;
			let shortCreditRemark	 	= document.getElementById('shortCreditRemark').value.trim();
			let shortCreditChequeNumber	= document.getElementById('shortCreditChequeNumber').value.trim();
			let shortCreditBankName		= document.getElementById('shortCreditBankName').value.trim();
			let shortCreditChequeDate	= document.getElementById('shortCreditChequeDate').value.trim();
			let shortCreditPaymentStatus= document.getElementById('shortCreditPaymentStatus').value.trim();
			let shortCreditReceiveAmt	= document.getElementById('shortCreditReceiveAmt').value.trim();
			let shortCreditTxnId		= document.getElementById('shortCreditTxnId').value.trim();
			let shortCreditGrandTotal	= document.getElementById('shortCreditGrandTotal').value.trim();
			let shortCreditBranchId		= document.getElementById('shortCreditBranchId').value.trim();
			let creditWayBillTxnId		= document.getElementById('creditWayBillTxnId').value.trim();
			let partyMasterId           =document.getElementById('partyMasterId').value.trim();
			let discountTypes2			= document.getElementById('discountTypes2').value.trim();
			let wayBillId					= wayBillId;
			let wayBillNo				= wayBillNo;
			
			$.get("/ivcargo/jsp/transport/ajaxinterfaceForTransport2.jsp",{filter:18,shortCreditPaymentMode:shortCreditPaymentMode,shortCreditRemark:shortCreditRemark,
				shortCreditChequeNumber:shortCreditChequeNumber,shortCreditBankName:shortCreditBankName,shortCreditChequeDate:shortCreditChequeDate,
				shortCreditPaymentStatus:shortCreditPaymentStatus,shortCreditReceiveAmt:shortCreditReceiveAmt,partyMasterId:partyMasterId,shortCreditTxnId:shortCreditTxnId,
				wayBillId:wayBillId,wayBillNo:wayBillNo,shortCreditGrandTotal:shortCreditGrandTotal,shortCreditBranchId:shortCreditBranchId,creditWayBillTxnId:creditWayBillTxnId,discountTypes2:discountTypes2},function(data){
			   	let response = $.trim(data);
			   if(response == 'success'){
				   	document.getElementById("shortCreditPaymentTable").style.display = 'none';
				   	document.wayBillForm.pageId.value="3";
		  	  		document.wayBillForm.eventId.value="8";
		  	  		document.wayBillForm.doNotPrint.value=true;
		  	  		document.wayBillForm.wayBillId.value=wayBillId;
		  	  		document.wayBillForm.action="waybill.do";
		  			document.wayBillForm.submit();
				}else{
					document.getElementById("saveShortCreditPaymentBtn").style.display='block';
					alert("Please Try Again !");
				};
	 		});
		};
	};
}

function selectOptionByValue(selObj, val){
	let A= selObj.options, L= A.length;
    while(L){
        if (A[--L].value== val){
            selObj.selectedIndex= L;
            L= 0;
        };
    };
}
function editLRRateHistory(wayBillId){
	childwin = window.open ('editLrRateHistory.do?pageId=340&eventId=2&modulename=editLrRateHistory&wayBillId=' + wayBillId,'newwindow', config='left=200,top=130,width=1055,height=490, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function editLRHistory(wayBillId){
	childwin = window.open ('editLrHistory.do?pageId=340&eventId=2&modulename=editLrHistory&wayBillId=' + wayBillId,'newwindow', config='left=200,top=60,width=1900,height=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function showLrDeliveryOrLrView(waybillNo,waybillId){
	let childwind;
	if(window.opener != undefined ){
		childwind	= window.opener;
		window.blur(); 
		childwind.focus();
		setTimeout(function(){
				childwind.callfromStockReport(waybillNo,waybillId);
			},5000); 
		childwind.focus();
		childwind.alert("Searching lr no. - "+waybillNo+" for delivery");
	}  else if (childwind != undefined && !childwind.closed) {
		if(childwind.location.pathname != deliveryPageUrl) {
			childwind.location = deliveryPageUrl;
			childwind.alert("Searching lr no. - "+waybillNo+" for delivery");
			setTimeout(function(){
				childwind.callfromStockReport(waybillNo,waybillId);
			},5000); 
		} else {
			setTimeout(function(){
				childwind.callfromStockReport(waybillNo,waybillId);
			},5000); 
			childwind.focus();
			childwind.alert("Searching lr no. - "+waybillNo+" for delivery");
		}
	}  else {
		childwind	= window.open(deliveryPageUrl, config='height=600,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no, directories=no, status=no');
		setTimeout(function(){
			childwind.callfromStockReport(waybillNo,waybillId);
		},5000); 
	}
}

function agentBillPrint(agentBillNumber) {
	window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillNumber='+agentBillNumber+'&TypeOfNumber='+23);
}

function exportLrPrintToPdf(wayBillId, accountGroupId , waybillNo) {
	
	showLayer();
	
	let jsonObject = new Object();
	
	$.ajax({
		type		: 	"GET",
		url			: 	'SendLrPdfEmail.do?pageId=294&eventId=17&wayBillId='+wayBillId+'&accountGroupId='+accountGroupId+'&waybillNo='+waybillNo+'&isLrPrintExportToPdf=true',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(response) {
			if (response.message != undefined) {
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			} else if(response.fileName != undefined && response.fileName != null)
				generateFileToDownload(response);//calling from genericfunctions.js
		}
	});
}

function exportLrPrintPdf(waybillId){
	childwin = window.open("printWayBill.do?pageId=340&eventId=10&modulename=lrPrint&masterid=" + waybillId + "&isRePrint=true&isLrPdfAllow=false&isPdfExportAllow=true","newwin","width=400,height=200");
}

function viewConsignmentDetails(wayBillId){
	childwin = window.open ('consignmentDetails.do?pageId=340&eventId=2&modulename=consignmentDetails&wayBillId=' + wayBillId,'newwindow', config='left=200,top=130,width=1055,height=490, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function viewLrwiseCostingDetails(wayBillId){
	childwin = window.open ('consignmentDetails.do?pageId=340&eventId=2&modulename=lrWiseCostingDetails&wayBillId=' + wayBillId,'newwindow', config='left=200,top=130,width=1055,height=490, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function editLRVehicleNumber(wayBillId){
	childwin = window.open ('editLRVehicleNumber.do?pageId=340&eventId=2&modulename=editLRVehicleNumber&wayBillId=' + wayBillId,'newwindow', config='left=200,top=130,width=1055,height=490, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function updateCustomerName(wayBillId){
	let url = encodeURI('updateCustomer.do?pageId=25&eventId=3&wayBillId='+wayBillId+'&redirectFilter=1&isUpdateCustomer=true');
	childwin = window.open (url,"newwindow",config="left=300,top=120,height=700,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no");
}

function addWayBillExpense(consigneeCorpAccountId, wayBillId){
	window.open ("addWayBillExpense.do?pageId=340&eventId=1&modulename=addWayBillExpense&consigneeCorpAccountId="+consigneeCorpAccountId+"&wayBillId="+wayBillId,"_blank");
}
function updateBillingParty(wayBillId,billingPartyId){
	childwin = window.open ('updateBillingParty.do?pageId=25&eventId=3&wayBillId='+wayBillId+'&billingPartyId='+billingPartyId+'&isUpdateBillingParty=true&redirectFilter=1','newwindow',config='left=300,top=120,height=500,width=900, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function updateTBBCust(wayBillId){
	childwin = window.open('updateTBBCustomer.do?pageId=25&eventId=3&wayBillId='+wayBillId+'&redirectFilter=1&isUpdateTBBCustomer=true','newwindow','left=300,top=120,height=500,width=900,toolbar=no,resizable=yes,scrollbars=yes');
}
function printWindowForGroup() {
	childwin = window.open ('jsp/PrintWayBill.jsp', 'newwindow', config='height=600,width=850, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(afterDelayForGroup, 1000);
}
function afterDelayForGroup() {childwin.document.getElementById('data').innerHTML= document.getElementById('PrintForGroup').innerHTML;}

function editTaxType(wayBillId){
	childwin = window.open ('consignmentDetails.do?pageId=340&eventId=2&modulename=editTaxType&redirectFilter=1&wayBillId=' + wayBillId,'newwindow', config='left=200,top=130,width=1055,height=490, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function editLRStPaidByAfterDel(wayBillId){
	childwin = window.open('editWayBillCharges.do?pageId=340&eventId=2&modulename=editStPaidBy&wayBillId='+wayBillId+'&billId='+0+'&creditorInvoice=false&redirectFilter=1','mywin','left=100,top=70,width=1100,height=900,toolbar=no,resizable=no,scrollbars=yes');
}
function updateWayBillDeliveryDate(wayBillId) {
	childwin = window.open ('editLrDeliveryDate.do?pageId=340&eventId=2&modulename=editLrDeliveryDate&masterid='+wayBillId+'&redirectFilter=1','newwindow', config='height=400,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function hideBookingCharges() {
	if(typeof otherChargesList === 'undefined' || otherChargesList == undefined)
		return;
	
	let	bookingChargeIdArray = otherChargesList.split(",");
	
	if(bookingChargeIdArray.length > 0) {
		for (let i = 0; i < bookingChargeIdArray.length; i++){
			changeDisplayProperty('label_' + bookingChargeIdArray[i], 'none');
			changeDisplayProperty('charge_' + bookingChargeIdArray[i], 'none');
		}
	}
}
function viewUploadedPdf(wayBillId) {
	childwin = window.open('viewUploadedPdf.do?pageId=340&eventId=2&modulename=viewUploadedPdf&masterid='+wayBillId+'&moduleId=6','mywin','left=100,top=70,width=1100,height=900,toolbar=no,resizable=no,scrollbars=yes');
}

function confirmCancel() {
	if (wayBillTypeId == WAYBILL_TYPE_CREDIT)
		alert('No refund for CREDITOR LR !'); 
	else if (wayBillTypeId == WAYBILL_TYPE_FOC)
		alert('No refund for FOC LR !');
	else if (wayBillTypeId == WAYBILL_TYPE_TO_PAY)
		alert('No refund for TOPAY LR !'); 
	
	if(wayBill.wayBillSourceBranchId == executiveBranchId || isAssignedSourceBranch || executiveType == EXECUTIVE_TYPE_GROUPADMIN) {
		if(allowForPenalty) {
			showCancelConfirmation($('#charge_12').val(), wayBillId);
			var response	= false;
		} else
			var response 	= confirm('Are you sure you want to cancel the LR ?' );

		if(response) {
			disableButtons();
			cancelWayBill(wayBillId);
		};
	} else
		alert("You can't cancel the LR of other Branch !");
}

function showCancelConfirmation(documentCharge, waybillId) {
    $.confirm({
		text: "<div><h1 style='color: #2CAE54;font-size:20px'>Are you want to sure cancel this LR because penalty amount is " + documentCharge +". "+"  </h1><p style='color: #E77072;font-size:15px'>Shortcut Keys : Enter = Yes, Esc = No</p></div>",
		typeAnimated: true,
		backgroundDismiss: false,
		keyboardEnabled: true,
		confirm: function() {
			cancelWayBill(waybillId);
		},
		cancel: function() {
		},
		open: function () {
      		$(".confirm").focus();
  		},
		dialogClass			: "modal-dialog",
		position			: 'center',
		confirmButton		: 'Yes',
		cancelButton		: 'NO',
		confirmButtonClass	: 'btn-info',
		cancelButtonClass	: 'btn-danger'
	});
}

function viewPartialConsignmentDetails(wayBillId){
	childwin = window.open ('partialConsignmentDetails.do?pageId=340&eventId=2&modulename=partialConsignmentDetails&wayBillId=' + wayBillId,'newwindow', config='left=200,top=130,width=1055,height=490, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function checkRemark() {
	if(executiveType == EXECUTIVE_TYPE_GROUPADMIN && jsonData.CentralizedCancellation) {
		var exec = document.getElementById('cancelForExecutive');
		
		if(exec != null && exec.value <= 0) {
			showSpecificErrors('remarkError',"Please select Executive");
			toogleElement('remarkError','block');
			changeError1('cancelForExecutive','0','1000'); return false;
		} else { 
			toogleElement('remarkError','none'); removeError('cancelForExecutive'); 
		}
	}
	
	var remark = document.getElementById("cancelRemark");
	
	if(remark.value == "") {
		showMessage('error', ramarkErrMsg);
		toogleElement('error','block');
		changeError1('cancelRemark','0','1000');
		return false;
	}
	
	toogleElement('error','no ne');removeError('cancelRemark');
		
	if(jsonData.displayDocumentReceivedFeild) {
		var tcb  = document.getElementById("TokenCheckBox");
		var ccb  = document.getElementById("CustomerCheckBox");
		var clcb = document.getElementById("ConsignorLetterCheckBox");
		var sccb = document.getElementById("StatisticalChargeCheckBoxList");
			
		if(!tcb.checked || !ccb.checked || !clcb.checked || !sccb.checked) {
			showMessage('error',receiveDocumentsErrMsg);
			toogleElement('error','block');
			return false;
		}
	}
	
	return true;
}

function showHideEditLinks(data) {
	if(data.allowToUpdatePickupType)
		$('#updateLrPickupType').removeClass('hide');
	else
		$('#updateLrPickupType').remove();
}

function editBookingRateForCommission(wayBillId){
	childwin = window.open ('editRateForCommission.do?pageId=340&eventId=2&modulename=wayBillBookingRate&wayBillId=' + wayBillId,'newwindow', config='left=200,top=130,width=1055,height=490, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function updateApprovalType(wayBillId){
	childwin = window.open ('updateApprovalType.do?pageId=340&eventId=2&modulename=updateApprovalType&masterid=' + wayBillId,'newwindow', config='left=200,top=130,width=800,height=300, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function resendSms(wayBillId){
	childwin = window.open('resendSms.do?pageId=340&eventId=2&modulename=resendSms&waybillId=' + wayBillId, 'newwindow', 'width=450,height=300,top=100,left=100,toolbar=no,menubar=no,scrollbars=yes,resizable=no,location=no,directories=no,status=no');
}
function updateLRDivision(wayBillId){
	childwin = window.open('updates.do?pageId=340&eventId=2&modulename=updateLRDivision&masterid=' + wayBillId,'newwindow', config='height=450,width=600, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
