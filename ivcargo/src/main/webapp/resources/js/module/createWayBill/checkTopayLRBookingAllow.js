function checkTopayLRBookingAllow() {
	var wayBillType;
	var destinationBranch;
	var allowAjaxCheck;
	wayBillType = $('#wayBillType').val();
	allowAjaxCheck = configuration.AllowAjaxCheckOnDestinationBranchSelect;
	var jsonObject					= new Object();
	destinationBranch	= $('#destinationIdEle_primary_key').val();	
	var jsonStr = JSON.stringify(jsonObject);
	var element = document.getElementById("destinationIdEle");
	if(wayBillType==2 && allowAjaxCheck && destinationBranch!=null){
		$.getJSON("Ajax.do?pageId=314&eventId=4&filter=5&wayBillType="+wayBillType+"&destinationBranch="+destinationBranch,
				{json:jsonStr}, function(data) {
					if (!jQuery.isEmptyObject(data)) {
						if(!data.result){
							showMessage('error', topayBookingNotAllowedForBranch);
							changeError1("destinationIdEle", '0', '0');
							element.focus();
							return false;
							//showMessage("error", topayBookingNotAllowedForBranch);
						}else{
							toogleElement('error','block');
							removeError('destinationIdEle');
						}
					}
		});
	}
	
}
/*if(article.value== 0){
	var ele = document.getElementById('basicError');
	showSpecificErrors('basicError',"Please, select Nature of Article");
	toogleElement('basicError','block');
	changeError1('natureOfArticle','0','0');
	document.getElementById('grandTotal').focus();
	return false;
}else{

	toogleElement('basicError','none');
	removeError('natureOfArticle');
} */