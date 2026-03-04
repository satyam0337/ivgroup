function populateGodown(obj,id){

	if(document.getElementById('godownId') != null) {
		document.getElementById('godownId').options.length=1;;
		document.getElementById('godownId').options[0].text ='ALL';
		document.getElementById('godownId').options[0].value= 0 ;
	}
	
	populateGodownByBranchId(obj.value,id,false);
}
function populateGodownByBranchId(branchId,targetId,isDefaultSelect) {
	var target = document.getElementById(targetId);
	if(branchId<=0){
		target.options.length=1;
		target.options[0].text='ALL';
		target.options[0].value= 0;
		return false;
	}
	
	if(target == null)
		return;
	
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
			};
		};
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
			target.options[0].text	='ALL';
			target.options[0].value	= 0;
			target.selectedIndex=0;
			
			if((tempQty.length)==1 && isDefaultSelect ){
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
		};
	};
	xmlHttp.open("GET","jsp/ajaxinterface.jsp?filter=16&branchId="+branchId,true);
	xmlHttp.send(null);
}

function resetGodown() {
	
	if(document.getElementById('godownId'))
		document.getElementById('godownId').value = 0;
	
}