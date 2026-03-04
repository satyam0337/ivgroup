
function printList(){
	
	var content = document.getElementById('dispatchTable').innerHTML;
	var win = window.open ('html/print.html', 'newwindow', config='height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=yes,location=no, directories=no, status=yes');
	//alert('4');
	win.document.getElementById('results').innerHTML = content ;
	//alert(win.document.getElementById('results').innerHTML);
}

	function outboundSearchValidations(){		
		//Basic info validations
		var brchId = document.getElementById('brchId');
		var str=document.getElementById('wayBillNumber');
		var wayBillNumber = str.value;
		if(wayBillNumber.length== 0  || str.value == brchId.value+'/'){
			
			var dest=document.getElementById('destinationCityId');
			if(dest.value== 0){
				var ele = document.getElementById('searchError');
				showSpecificErrors('searchError',"Please, select a search criteria");
				toogleElement('searchError','block');
				return false;
			}else{

				toogleElement('searchError','none');
			}
		}else{
	
			toogleElement('searchError','none');
		}			

		return true;
		}
	/*
	function wayBillSearchValidations(){
		
		//Basic info validations
		var str=document.getElementById('wayBillNumber');
		var wayBillNumber = str.value;
		if(wayBillNumber.length== 0){
			
			var destCity=document.getElementById('destinationCityId').value;
			var destBranch = document.getElementById('destinationBranchId').value;
			var originCity = document.getElementById('originCityId').value;
			var originBranch = document.getElementById('sourceBranchId').value;
			var fromDate = document.getElementById('FromDate');
			var toDate = document.getElementById('ToDate');
			
			if(toDate.value < fromDate.value) {
				var ele = document.getElementById('searchError');
				showSpecificErrors('searchError',"To Date should be greater than or equal to From date");
				toogleElement('searchError','block');
				return false;	
			} else {
				toogleElement('searchError','none');
			}
			
			if(originCity==0 && destCity==0){
				var ele = document.getElementById('searchError');
				showSpecificErrors('searchError',"Please select any of the search criteria");
				toogleElement('searchError','block');
				return false;	
			}
			if(destCity != 0 && destBranch == 0){
			
				var ele = document.getElementById('searchError');
				showSpecificErrors('searchError',"Please select Destination Branch");
				toogleElement('searchError','block');
				return false;
			}
			
			if(destCity!=0 && originCity!=0 && originBranch ==0 ){
				var ele = document.getElementById('searchError');
				showSpecificErrors('searchError',"Please select origin Branch");
				toogleElement('searchError','block');
				return false;	
			}

		}
	
		toogleElement('searchError','none');
	
		document.wayBillSearchForm.submit();
		return true;
	}
	*/
	function callToEditWayBill(id ,flag){
		//alert(abc);
		//var chklen = document.listForm.checkbox.length;
		//var wayBillId;
		//alert(wayBillId = document.listForm.checkbox.value);
		/*var flag=false;
		
		if(chklen == undefined){
			if(document.listForm.checkbox.checked){
				wayBillId = document.listForm.checkbox.value;
				flag=false;
			}
		}else{
			for(var y=0;y<chklen;y++){
				if(document.getElementById("checkbox"+y).checked){
					wayBillId = document.getElementById("checkbox"+y).value;
					flag=false;
				}
			}
		}
		//alert(document.listForm.checkbox.value);
		//alert(chklen);
		
		
		if(flag){
				showSpecificErrors('errorselect',"Please, select a waybill.");
				toogleElement('errorselect','block');
				return false;
		}
		//alert(wayBillId);
		*/
//		alert("pop");
//		alert("flag "+flag);
		document.getElementById("wayBillId").value= id;
		document.getElementById("flag").value= flag;

//		if (document.getElementById("isDeliverLink")!=null){
//		document.getElementById("isDeliverLink").value=1;
//		}

		document.listForm.pageId.value="2";
		document.listForm.eventId.value="6";
		
		document.listForm.submit();
		
	}
	
	function callToReprintWayBill(id){
	/*	var chklen = document.listForm.checkbox.length;
		var wayBillId;
		var flag=true;
		if(chklen == undefined){
			if(document.listForm.checkbox.checked){
				wayBillId = document.listForm.checkbox.value;
				flag=false;
			}
		}else{
			for(var y=0;y<chklen;y++){
				if(document.getElementById("checkbox"+y).checked){
					wayBillId = document.getElementById("checkbox"+y).value;
					flag=false;
				}
			}
		
		}
		
		
		if(flag){
				showSpecificErrors('errorselect',"Please, select a waybill.");
				toogleElement('errorselect','block');
				return false;
		}*/
		childwin = window.open ('ViewWayBill.do?pageId=3&eventId=5&rp=1&wayBillId=' + id , 'newwindow', config='height=625,width=770, toolbar=no, menubar=no, scrollbars=yes, resizable=yes,location=no, directories=no, status=no');
		
	}