/**
 * 
 */

function findDataAfterValidation(){
	var searchByCollectionPerson = document.getElementById('searchByCollectionPerson');
	if(searchByCollectionPerson != null){
		if(searchByCollectionPerson.checked == true){
			if(!validateElement('searchCollectionPerson','Collection Person Name')){return false;}
			if(document.getElementById('selectedCollectionPersonId').value == 0){
				showMessage('error','Please Enter Proper Collection Person Name!');
				toogleElement('error','block');
				changeError1('searchCollectionPerson','0','0');
				$("#searchCollectionPerson").focus(); 
				return false;
			} else {
				if(document.getElementById("txnType").value == 0){
					showMessage('error','Please, Select Transaction Type.');
					toogleElement('error','block');
					changeError1('txnType','0','0');
					$("#txnType").focus(); 
					return false;
				} else {
					toogleElement('error','none');
					removeError('searchCollectionPerson');
					document.CreditPaymentModuleSerachCriteriaForm.pageId.value  	= 	'236';
					document.CreditPaymentModuleSerachCriteriaForm.eventId.value 	= 	'2' ;
					document.CreditPaymentModuleSerachCriteriaForm.action			=	"CreditPaymentModuleSerachCriteriaForm.do";
					showLayer();disableButtons();
					document.CreditPaymentModuleSerachCriteriaForm.submit();					
				}
			}
			
		}else {
			findData();
		}
	} else {
		findData();
	};
}


function findData() {
	var txnType 	= document.getElementById("txnType");
	var wbNumber	= document.getElementById("wbNumber");	
	var str		    = wbNumber.value.replace(/\s/g, '');
		if(str.length > 0) {
			  if(txnType.value == 0){
				var ele = document.getElementById('basicError');
				showMessage('error',"Please, Select Transaction Type.");
				toogleElement('error','block');
				changeError1('txnType','0','0');
				return false;
			 } else {
				toogleElement('error','none');
				removeError('txnType');
				document.CreditPaymentModuleSerachCriteriaForm.pageId.value  	= 	'236';
				document.CreditPaymentModuleSerachCriteriaForm.eventId.value 	= 	'2' ;
				document.CreditPaymentModuleSerachCriteriaForm.action			=	"CreditPaymentModuleSerachCriteriaForm.do";
				document.CreditPaymentModuleSerachCriteriaForm.submit();
			};
		}else {
			if(val()){
				document.CreditPaymentModuleSerachCriteriaForm.pageId.value  	= 	'236';
				document.CreditPaymentModuleSerachCriteriaForm.eventId.value 	= 	'2' ;
				document.CreditPaymentModuleSerachCriteriaForm.action			=	"CreditPaymentModuleSerachCriteriaForm.do";
				showLayer();disableButtons();
				document.CreditPaymentModuleSerachCriteriaForm.submit();
			};
			
	};	
}