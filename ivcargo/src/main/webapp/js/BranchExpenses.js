
var branchExpensesCount = 2;
var curDate;
var curId				= 3;
var date				= "date_";
var IncomeExpheadName	= "IncomeExpheadName_";
var headId				= "headId_";
var amount				= "amount_";
var remark				= "remark_";
var branchExpenseNewFlowAllow;

function formValidation() {

	var table 		= document.getElementById('mainTable');
	var rowCount 	= table.rows.length;

	for (var i = 1; i <= rowCount - 2; i++) {

//		if(!chkDate(document.getElementById('date_'+i).value)) {
		if(!chkDate(document.getElementById('date_1').value)) {
			return false;
		}

		/*var el;

		if (headId == "headId_") {
			el = document.getElementById(headId+''+i);
		} else {
			el = document.getElementById(headId);
		}*/

		//if(el.value == 0){

		if(document.getElementById('headId_'+i).value == "0"){
			showMessage('error', properExpenseTypeErrMsg);
			toogleElement('error','block');
			changeError1('IncomeExpheadName_'+i,'0','0');
			return false;
		}

		if(document.getElementById('IncomeExpheadName_'+i).value == 0){
			showMessage('error', expenseTypeErrMsg);
			toogleElement('error','block');
			changeError1('IncomeExpheadName_'+i,'0','0');
			return false;
		}

		if(document.getElementById('amount_'+i).value == 0) {
			if(validateElement('amount_'+i, 'Enter Amount')) {
			}else{
				return false;
			}
		}

		if(document.getElementById('remark_'+i).value == 0) {
			if(validateElement('remark_'+i, 'Enter Remark')) {
			}else{
				return false;
			}
		}
	}

	return true;
}

function validateElement(element,msg){
	var el = document.getElementById(element);
	if (el.value <= 0){
		showMessage('error',"Please, "+msg+' !');
		toogleElement('error','block');
		changeError1(element,'0','0');
		return false;
	} else {
		toogleElement('error','none');
		removeError(element);
	}
	return true;
}

function saveWayBillExpenses() {

	if(formValidation() && confirm('Are you sure you want to save these Branch Expenses ?')) {
		document.getElementById('branchExpensesCount').value = branchExpensesCount;
		disableButtons();
		showLayer();
		var jsonObject				= new Object();
		var jsonObjectdata;
		var table 		= document.getElementById('mainTable');
		var rowCount 	= table.rows.length;
		
		var 			ary = [];

		for (var i = 1; i <= rowCount - 2; i++) {

			jsonObjectdata			= new Object();

			jsonObjectdata.wayBillId				= 0;
			jsonObjectdata.wayBillNo				= 0;
//			jsonObjectdata.date						= document.getElementById('date_'+i).value;
			//jsonObjectdata.branchExpenseCount		= document.getElementById('branchExpensesCount').value;
			jsonObjectdata.amount					= document.getElementById('amount_'+i).value;
			jsonObjectdata.remark					= document.getElementById('remark_'+i).value;
			jsonObjectdata.headId					= document.getElementById('headId_'+i).value;

			jsonObject[i] = jsonObjectdata;
			ary.push(jsonObjectdata);
		}
		
		var otherDetails	= new Object();
		
		otherDetails.branchExpenseCount = branchExpensesCount;
		otherDetails.expenseDateForAll	= $("#expenseDateForAll").val();
		otherDetails.branchExpenses		= JSON.stringify(ary);
		
		$.ajax({
			type		: 	"POST",
			url			: 	WEB_SERVICE_URL + '/branchIncomeExpenseWS/insertBranchExpense.do',
			data		:	otherDetails,
			dataType	: 	'json',
			success		: 	function(data) {
				if (data.message != undefined) {
					hideLayer();
					var errorMessage = data.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					
					if(errorMessage.typeName == 'error') {
						$('#saveExpense').show();
						$("#saveExpense").attr("disabled", false);
						hideLayer();
					} else {
						document.getElementById('paymentVoucherNumber').innerHTML 	= data.PaymentVoucherSequenceNumber;
						document.getElementById('voucherDetailsId').value			= data.exepenseVoucherDetailsId; 
						document.getElementById('datasaved').removeAttribute("hidden"); 
						branchExpenseNewFlowAllow = data.branchExpensePrintNewFlowAllow;
						openPrintForVoucherBill();
						
						document.getElementById('IncomeExpheadName_1').value = ""; 
						document.getElementById('amount_1').value = ""; 
						document.getElementById('remark_1').value = "";
						document.getElementById('headId_1').value = 0;
						clearallrows();
						enableButtons();
						resetDate();
						hideLayer();
					}
				}
			}
		});
	} 
}

function clearallrows() {

	var table = document.getElementById("mainTable");
	var rowCount	= table.rows.length;

	for (var i = 0; i < rowCount; i++) {
		var row = table.rows[i];
		var rowid = row.id;

		if (i > 2) {
			$(document.getElementById(rowid)).remove();
			i--;
			rowCount	= table.rows.length;
		}
	}
}

function disableButtons(){
	var saveButton	= document.getElementById('save');

	if(saveButton != null){
		saveButton.className = 'btn_print_disabled';
		saveButton.disabled=true;
		saveButton.style.display ='none';
	}
}

function enableButtons(){
	var saveButton	= document.getElementById('save');

	saveButton.className = 'btn_print';
	saveButton.disabled=false;
	saveButton.style.display ='block';
}

function addNewRow() {

	var table = document.getElementById('mainTable');
	var rowCount = table.rows.length;

	if (rowCount > 6) {
		alert('You can not add more then 5 Expense !');
		return false;
	}

	var row = table.insertRow(rowCount);
	var curRow = table.rows[rowCount-1];
	var curId = parseInt(curRow.id);
	var nextId = curId+1;

	row.id=nextId+'row';

	var cell1 = row.insertCell(0);
//	var element1 = document.getElementById('date_'+curId).cloneNode(true);
//	element1.style.className = 'date-picker-control';
//	element1.id = 'date_'+nextId;
//	element1.name = 'date_'+nextId;
//	element1.value = document.getElementById('date_1').value;

//	var element2 = document.getElementById('fd-but-date_'+curId).cloneNode(true);
//	element2.id = 'fd-but-date_'+nextId;
//	element2.name = 'fd-but-date_'+nextId;

//	cell1.appendChild(element1);
//	cell1.appendChild(element2);

	var cell2 = row.insertCell(1);
	var element3 = document.getElementById('IncomeExpheadName_'+curId).cloneNode(true);
	element3.id ='IncomeExpheadName_'+nextId;
	element3.name ='IncomeExpheadName_'+nextId;
	element3.value = '';
	element3.selectedIndex=0;

	var elementhead = document.getElementById('headId_'+curId).cloneNode(true);
	elementhead.id ='headId_'+nextId;
	elementhead.name ='headId_'+nextId;
	elementhead.value ='0';
	elementhead.selectedIndex=0;

	cell2.appendChild(elementhead);
	cell2.appendChild(element3);

	var cell3 = row.insertCell(2);
	var element4 = document.getElementById('amount_'+curId).cloneNode(true);
	element4.id ='amount_'+nextId;
	element4.name ='amount_'+nextId;
	element4.value = '';
	element4.onfocus = "prev='"+'IncomeExpheadName_'+nextId+"';next='"+'remark_'+nextId+"';"; 
	cell3.appendChild(element4);

	var cell4 = row.insertCell(3);
	var element5 = document.getElementById('remark_'+curId).cloneNode(true);
	element5.id ='remark_'+nextId;
	element5.name ='remark_'+nextId;
	element5.value = '';
	cell4.appendChild(element5);

	var cell5 = row.insertCell(4);
	var element6 = document.getElementById(curId+'deleteRow').cloneNode(true);
	element6.style.display ='table-cell';
	element6.id =nextId+'deleteRow';
	element6.name =nextId+'deleteRow';
	cell5.appendChild(element6);

	branchExpensesCount++;
	autocomp(row.id,element3.id);
}

function deleteCurRow(obj){

	var table = document.getElementById('mainTable');
	var rowCount = table.rows.length;

	if (rowCount > 3) {
		if(obj.id == '1deleteRow'){
			alert('You can not delete this row');
			return;
		}

		var curId = parseInt(obj.id);
		$(document.getElementById(curId+'row')).remove();

	} else {
		alert('You can not delete last row');
	}

	table = document.getElementById("mainTable");
	rowCount	= table.rows.length;
	var j = 1;

	for (var i = 0; i < rowCount; i++) {
		var row = table.rows[i];
		var rowid = row.id;

		if (i > 1) {

			if($("#"+rowid).find('input[id=date_'+i+']')) {

				$("#"+rowid).find('input[id=date_'+i+']').attr("name", "date_"+j);
				$("#"+rowid).find('input[id=date_'+i+']').attr("id", "date_"+j);

				$("#"+rowid).find('input[id=IncomeExpheadName_'+i+']').attr("name", "IncomeExpheadName_"+j);
				$("#"+rowid).find('input[id=IncomeExpheadName_'+i+']').attr("id", "IncomeExpheadName_"+j);

				$("#"+rowid).find('input[id=amount_'+i+']').attr("name", "amount_"+j);
				$("#"+rowid).find('input[id=amount_'+i+']').attr("id", "amount_"+j);

				$("#"+rowid).find('textarea[id=remark_'+i+']').attr("name", "remark_"+j);
				$("#"+rowid).find('textarea[id=remark_'+i+']').attr("id", "remark_"+j);

				$("#"+rowid).find('input[id=headId_'+i+']').attr("name", "headId_"+j);
				$("#"+rowid).find('input[id=headId_'+i+']').attr("id", "headId_"+j);

				$("#"+rowid).find('input[id='+i+'deleteRow]').attr("name", j+"deleteRow");
				$("#"+rowid).find('input[id='+i+'deleteRow]').attr("id", j+"deleteRow");

				$("#"+rowid).find('a[id=fd-but-date_'+i+']').attr("name", "fd-but-date_"+j);
				$("#"+rowid).find('a[id=fd-but-date_'+i+']').attr("id", "fd-but-date_"+j);

				$("#"+rowid).attr("id", j+"row");
				j++;
			}
		}
	}
}

function resetError(el){
	toogleElement('error','none');
	removeError(el.id);
};

function openPrintForVoucherBill() {
	if(branchExpenseNewFlowAllow == true){
		newwindow=window.open('BillPrint.do?pageId=25&eventId=43&voucherDetailsId='+document.getElementById('voucherDetailsId').value, 'newwindow', config='height=410,width=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	}
	else {
		newwindow=window.open('BillPrint.do?pageId=25&eventId=16&voucherDetailsId='+document.getElementById('voucherDetailsId').value, 'newwindow', config='height=410,width=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	}
}

function setvalues(object) {

	var id		= object.id;
	var part	= id.split("_");
	var count	= part[1];

	date				= "date_"+count;
	IncomeExpheadName	= "IncomeExpheadName_"+count;
	headId				= "headId_"+count;
	amount				= "amount_"+count;
	remark				= "remark_"+count;
}

function selectItem(li) {
	findValue(li);
}

function findValue(li) {
	if( li == null ) return alert("No match!");
	// if coming from an AJAX call, let's use the Id as the value
	if( !!li.extra ) var sValue = li.extra[0];
	// otherwise, let's just display the value in the text box
	else var sValue = li.selectValue;
	document.getElementById(headId).value= sValue;
	document.getElementById(amount).focus();
}

function lookupAjax(){
	var oSuggest = $("#"+IncomeExpheadName)[0].autocompleter;
	oSuggest.findValue();
	return false;
}

function resetHeadId(){
	document.getElementById(headId).value = 0;
}

function setExpenseDateForAll (){
	document.getElementById("expenseDateForAll").value = document.getElementById("date_1").value ; 
}

/// START <--Script to disable page on save
function getBrowserHeight() {
	var intH = 0;
	var intW = 0;
	/* if(typeof window.innerWidth  == 'number' ) {
       intH = window.innerHeight;
       intW = window.innerWidth;
	} else if(document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
          intH = document.documentElement.clientHeight;
          intW = document.documentElement.clientWidth;
	} else if(document.body && (document.body.clientWidth || document.body.clientHeight)) {
           intH = document.body.clientHeight;
           intW = document.body.clientWidth;
          }
    return { width: parseInt(intW), height: parseInt(intH) }; */
	intH = $('#mainTable1').height()+150;intW = $('#mainTable1').width()+150;return { width: parseInt(intW), height: parseInt(intH) };
}

function setLayerPosition() {
	var shadow = document.getElementById("shadow");
	var question = document.getElementById("question");
	var bws = getBrowserHeight();
	shadow.style.width = bws.width + "px";
	shadow.style.height = bws.height + "px";
	question.style.left = parseInt((bws.width - 350) / 2);
	question.style.top = parseInt((bws.height - 200) / 2);
	shadow = null;
	question = null;
}

function showLayer() {
	setLayerPosition();
	var shadow = document.getElementById("shadow");
	var question = document.getElementById("question");
	shadow.style.display = "block"; 
	question.style.display = "block";
	shadow = null;
	question = null;             
}

function hideLayer() {
	var shadow = document.getElementById("shadow");
	var question = document.getElementById("question");
	shadow.style.display = "none"; 
	question.style.display = "none";
	shadow = null;
	question = null; 
}

window.onresize = setLayerPosition;
/// END -->Script to disable page on save
