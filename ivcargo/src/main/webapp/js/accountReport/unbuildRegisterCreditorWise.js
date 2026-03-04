/**
 * @Author Anant Chaudhary 06-02-2016	
 */


function printPlainData(accountGroupName , branchAddress ,branchPhoneNo ,imagePath){
	var detailHeader = document.getElementById('reportName').innerHTML;
	childwin = window.open ('jsp/printData.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader+'&imagePath='+imagePath , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(waitForPlainDelay, 500);
}

function waitForPlainDelay() {
	var dataTableId = 'results';
	var wbNoSize = 8;
	var remarkSize = 8;
	var nameSize = 8;
	var srcDestSize = 12;
	childwin.document.getElementById('data').innerHTML= document.getElementById('reportData').innerHTML;
	$('#data',childwin.document).removeClass().attr({'align': 'left'});
	//Replace Style Classes
	$('table',childwin.document).removeClass().removeAttr('style').css({'border':'0px'});
	$('#printHeader',childwin.document).css('width','100%');
	$('#printTimeTbl',childwin.document).css('width','100%');
	$('#'+dataTableId,childwin.document).css('width','100%');
	$('td',childwin.document).removeClass().addClass('datatd_plain_text');
	$('#groupName',childwin.document).removeClass().addClass('datatd_plain_text').css({"font-weight":"bold","font-size":"22px",'letter-spacing': '7px', 'text-align': 'center'});
	$("td:contains('Unbilled')",childwin.document).css({"font-weight":"bold","font-size":"15px",'letter-spacing': '5px'});
	$('th',childwin.document).removeClass().addClass('datatd_plain_text').css("font-weight", "bold");
	
	$('#'+dataTableId+' tr',childwin.document).each(function(){
		//Format the Way Bill No column
	    var wbNo = $(this).find("td").eq(2).text().trim();
		    $(this).find("td").eq(2).text(wbNo.substring(0,wbNoSize));
	    //Format the Source column
	    var src = $(this).find("td").eq(3).text().trim();
	    	if(src.length > srcDestSize)$(this).find("td").eq(3).text(src.substring(0,srcDestSize));
	   	//Format the Destination column
	    var dest = $(this).find("td").eq(4).text().trim();
	    	if(dest.length > srcDestSize)$(this).find("td").eq(4).text(dest.substring(0,srcDestSize));
	});
	childwin.print();
}

function ValidateFormElement() {

	var region = document.getElementById('region');
	if(region != null) {
		if(region.options[region.selectedIndex].value == '-1') {
			showMessage('error',regionNameErrMsg);
			toogleElement('error','block');
			changeError1('region','0','0');
			$("#region").focus(); 
			return false;
		}
	}
	var dataTypeId = document.getElementById('dataTypeId');
	if(dataTypeId != null) {
		if(dataTypeId.options[dataTypeId.selectedIndex].value == '0'){
			var ele = document.getElementById('basicError');
			showMessage('error',dataSelectErrMsg);
			toogleElement('error','block');
			return false;
		} else {
			toogleElement('error','none');	
		}
	}
	var subRegion =document.getElementById('subRegion');
	if(subRegion != null) {
		if(subRegion.options[subRegion.selectedIndex].value == '-1') {
			showMessage('error',areaSelectErrMsg);
			toogleElement('error','block');
			changeError1('subRegion','0','0');
			$("#subRegion").focus(); 
			return false;
		}
	}
	
	var branch = document.getElementById('branch');
	if(branch != null) {
		if(branch.options[branch.selectedIndex].value == '-1') {
			showMessage('error',branchNameErrMsg);
			toogleElement('error','block');
			changeError1('branch','0','0');
			$("#branch").focus(); 
			return false;
		}
	}
	return true;
}

function storeSelectedValues(){
	var selectedRegion = document.getElementById('region');
	if(selectedRegion != null){
		document.getElementById('selectedRegion').value = selectedRegion.options[selectedRegion.selectedIndex].text;
	}
	var selectedSubRegion = document.getElementById('subRegion');
	if(selectedSubRegion != null){
		document.getElementById('selectedSubRegion').value = selectedSubRegion.options[selectedSubRegion.selectedIndex].text;
	}
	var selectedBranch = document.getElementById('branch');
	if(selectedBranch != null){
		document.getElementById('selectedBranch').value = selectedBranch.options[selectedBranch.selectedIndex].text;
	}
	var selectedTypeOfData = document.getElementById('dataTypeId');
	if(selectedTypeOfData != null){
		document.getElementById('selectedTypeOfData').value = selectedTypeOfData.options[selectedTypeOfData.selectedIndex].text;
	}
}

function openWindowForView(id,type,branchId) {	
	window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+id+'&NumberType='+type+'&BranchId='+branchId);
}