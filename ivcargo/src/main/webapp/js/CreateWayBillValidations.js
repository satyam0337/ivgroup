
function getFirstCharge(){

	if(isChargeDisplayable()){
	
	var ch =  document.getElementById("charges");
	if(ch.getElementsByTagName("input")[1] == null){
		next='discount';
	}
	else{
		next=ch.getElementsByTagName("input")[1].name;
	}
	}
	else{
		next = 'save';	
	}
		
}
/*
function checkOptionForNext(op){

	if(op == 1){
		if(document.getElementById('consignordetails').style.display == 'block'){

			next ='consignorEmail';
			
		}else{			
			
			next ='consigneeName';
		}
	}
	if(op == 2){
		if(document.getElementById('consigneedetails').style.display == 'block'){

			next ='consigneeEmail';
			
		}else{			
			
			next ='remark';
		}
	}
}

function checkOptionForPrev(op){

	if(op == 1){
		if(document.getElementById('consignordetails').style.display == 'block'){

			prev ='consignorFax';
			
		}else{			
			
			prev ='consignorPhn';
		}
	}
	if(op == 2){
		if(document.getElementById('consigneedetails').style.display == 'block'){

			prev ='consigneeFax';
			
		}else{			
			
			prev ='consigneePhn';
		}
	}
}
*/
function getLastCharge(){
	var ch =  document.getElementById("charges");
	var len =  ch.getElementsByTagName("input").length - 1;
		prev=ch.getElementsByTagName("input")[len].name;

}
		
function getprevnextCharge(ele){
	//alert("testing");	
	var ch =  document.getElementById("charges");
	var len =  ch.getElementsByTagName("input").length;
	var i=0;
		
	for(i=0;i<len;i++){
		
		if(ch.getElementsByTagName("input")[i].name == ele.name){
			if(ch.getElementsByTagName("input")[i-1]==null || i-1==0){
				prev = 'delete';
			}
			else{
				prev=ch.getElementsByTagName("input")[i-1].name;
			}
			if(ch.getElementsByTagName("input")[i+1] !=null){
				next=ch.getElementsByTagName("input")[i+1].name;
			}
			else{
				next = 'discount';
			}
		}
	}
}
		
		
		function checkBranch(){
			var article=document.getElementById('natureOfArticle');
			if(article.value== 0){
				var ele = document.getElementById('basicError');
				showSpecificErrors('basicError',"Please, select Nature of Article");
				toogleElement('basicError','block');
				changeError1('natureOfArticle','0','0');
				return false ;
			}else{
		
				toogleElement('basicError','none');
				removeError('natureOfArticle');
			} 
			var dest=document.getElementById('destinationCityId');
			if(dest.value== 0){
				var ele = document.getElementById('basicError');
				showSpecificErrors('basicError',"Please, select destnation city");
				toogleElement('basicError','block');
				changeError1('destinationCityId','0','0');
				return false;
			}else{
		        
				toogleElement('basicError','none');

			}
			
			var drop=document.getElementById('destinationBranchId');
			if(drop.value== 0){
				var ele = document.getElementById('basicError');
				showSpecificErrors('basicError',"Please, select drop point");
				toogleElement('basicError','block');
				changeError1('destinationBranchId','0','0');
				return false;
			}else{
		
				toogleElement('basicError','none');
				removeError('destinationBranchId');
			} 
			
			return true;
		}
		
		function homepage(){
			document.wayBillForm.pageId.value="0";
			document.wayBillForm.eventId.value="0";
			document.wayBillForm.action="Home.do";
			document.wayBillForm.submit();
		}

var browser="";
	function storeConsignment(random,row){

		var tableEl = document.getElementById("myTable");
		var typeofPackingId=tableEl.rows[row].cells[5].firstChild.nodeValue;
		var actualWeightKg=tableEl.rows[row].cells[6].firstChild.nodeValue;
		var actualWeightGm=tableEl.rows[row].cells[7].firstChild.nodeValue;
		var cftLength=tableEl.rows[row].cells[8].firstChild.nodeValue;
		var cftWidth=tableEl.rows[row].cells[9].firstChild.nodeValue;
		var cftHeight=tableEl.rows[row].cells[10].firstChild.nodeValue;
		var chargedWeightKg=tableEl.rows[row].cells[11].firstChild.nodeValue;
		var chargedWeightGm=tableEl.rows[row].cells[12].firstChild.nodeValue;
		var natureOfArticleId=document.wayBillForm.natureOfArticle.value;
		
		var para="filter=2&storageId="+random+"&pckid="+typeofPackingId+"&natart="+natureOfArticleId+"&actwtkg="+actualWeightKg+"&actwtgm="+actualWeightGm+"&len="+cftLength+"&wid="+cftWidth+"&ht="+cftHeight+"&chwtkg="+chargedWeightKg+"&chwtgm="+chargedWeightGm;	


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
			}
		}
		xmlHttp.open("GET","jsp/ajaxinterface.jsp?"+para,true);
		xmlHttp.send(null);
	}
	
	function selectTypeOfWeight(selected){

		if(selected == 1){
			
			if(document.getElementById('actualWeightKg') != null)
			{
				document.getElementById('actualWeightKg').name = 'actualWeightKg';
				document.getElementById('actualWeightGm').name = 'actualWeightGm';
				document.getElementById('actualWeightKg').id = 'actualWeightKg';
				document.getElementById('actualWeightGm').id = 'actualWeightGm';
				document.getElementById('actualWeightKg').disabled = false;
				document.getElementById('actualWeightGm').disabled = false;
				
			}
			else if(document.getElementById('chargedWeightKg') != null)
			{
				document.getElementById('chargedWeightKg').name = 'actualWeightKg';
				document.getElementById('chargedWeightGm').name = 'actualWeightGm';
				document.getElementById('chargedWeightKg').id = 'actualWeightKg';
				document.getElementById('chargedWeightGm').id = 'actualWeightGm';
				document.getElementById('actualWeightKg').disabled = false;
				document.getElementById('actualWeightGm').disabled = false;
			}
			
			
			
			document.wayBillForm.cftLength.disabled=true;
			document.wayBillForm.cftHeight.disabled=true;
			document.wayBillForm.cftWidth.disabled=true;
			document.wayBillForm.cftLength.value=0;
			document.wayBillForm.cftHeight.value=0;
			document.wayBillForm.cftWidth.value=0;
			
	
		}
		if(selected == 2){
			// means select cft and disable actual wt
			if(document.getElementById('actualWeightKg') != null)
			{
				document.getElementById('actualWeightKg').name = 'chargedWeightKg';
				document.getElementById('actualWeightGm').name = 'chargedWeightGm';
				document.getElementById('actualWeightKg').id = 'chargedWeightKg';
				document.getElementById('actualWeightGm').id = 'chargedWeightGm';
				document.getElementById('chargedWeightKg').disabled = true;
				document.getElementById('chargedWeightGm').disabled = true;
			}
			else if(document.getElementById('chargedWeightKg') != null)
			{
				document.getElementById('chargedWeightKg').name = 'chargedWeightKg';
				document.getElementById('chargedWeightGm').name = 'chargedWeightGm';
				document.getElementById('chargedWeightKg').id = 'chargedWeightKg';
				document.getElementById('chargedWeightGm').id = 'chargedWeightGm';
				document.getElementById('chargedWeightKg').disabled = true;
				document.getElementById('chargedWeightGm').disabled = true;
			}
			
			document.wayBillForm.cftLength.disabled=false;
			document.wayBillForm.cftHeight.disabled=false;
			document.wayBillForm.cftWidth.disabled=false;
			document.wayBillForm.cftLength.value=0;
			document.wayBillForm.cftHeight.value=0;
			document.wayBillForm.cftWidth.value=0;
			
			
			
		}	
	}
	function addConsignmentTableStructure()
	{
		//alert('addConsignmentTableStructure called');
		var tableEl = document.getElementById("myTable");
		var TableBody = document.getElementById("myTBody");
		TableBody.style.display = 'block';
		
		var tableEl1 = document.getElementById("myTable1");
		var TableBody1= document.getElementById("myTBody1");
		TableBody1.style.display = 'block';
		
		//checkForTable = checkForTable+1;
		
		//Create Row for tableEl
		var BaseRow1 = document.createElement("tr");
		//Create Row for tableEl1
		var BaseRow = document.createElement("tr");

		//create Columns for tableEl
		var Baseone = document.createElement("td");		 
		var Basetwo = document.createElement("td");		 
		var Basethree = document.createElement("td");		 
		var Basefour = document.createElement("td");		 
		var BaseNine = document.createElement("td"); 
		
		//create Columns for tableEl1
		var Basefive = document.createElement("td");
		var Basesix = document.createElement("td");		 
		var Baseseven = document.createElement("td");
		var Baseeight = document.createElement("td");
		var BaseTen = document.createElement("td"); 
		
		Baseone.innerHTML = "&nbsp;";
		Baseone.width = "5%";
		Basetwo.innerHTML = "Quantity";
		Basetwo.width = "15%";
		Basetwo.align = 'center';
		Basethree.innerHTML = "Type of Packing";
		Basethree.width = "30%";
		Basefour.align = 'center';
		Basefour.innerHTML = "Weight";
		Basefour.width = "40%";	
		BaseNine.innerHTML = "Amount";
		BaseNine.width = "10%";
		//BaseNine.style.display="none"; //hidden column
		
		
		Basefive.innerHTML = "&nbsp;";
		Basefive.width = "5%";
		Basesix.innerHTML = "Quantity";
		Basesix.width = "15%";
		Basesix.align = 'center';
		Baseseven.innerHTML = "Type of Packing";
		Baseseven.width = "30%";
		Baseeight.align = "center";
		Baseeight.innerHTML = "Weight";
		Baseeight.width = "40%";	
		BaseTen.innerHTML = "Amount";
		BaseTen.width = "10%";
		//BaseTen.style.display="none";//hidden column
		
		//Add columns to row of tableEl
		BaseRow.appendChild(Baseone);
		BaseRow.appendChild(Basetwo);
		BaseRow.appendChild(Basethree);
		BaseRow.appendChild(Basefour);
		BaseRow.appendChild(BaseNine);
		
		//Add columns to row of tableEl1
		BaseRow1.appendChild(Basefive);
		BaseRow1.appendChild(Basesix);
		BaseRow1.appendChild(Baseseven);
		BaseRow1.appendChild(Baseeight);
		BaseRow1.appendChild(BaseTen);
		
		
		//Add row to tableEl
		TableBody.appendChild(BaseRow);
		//Add row to tableEl1
		TableBody1.appendChild(BaseRow1);
		
		
	}
	//var checkForTable=1;
	function checkaddConsignmentTableStructure()
	{
		if(document.getElementById('myTable').rows[0] == null && document.getElementById('myTable1').rows[0] == null)
		{
			addConsignmentTableStructure();
		}
		
		else
		{
			
			if(document.getElementById('myTable').rows[0].cells[1].innerHTML != 'Quantity')
			{
				addConsignmentTableStructure();
			}
		
		}
		
		
		
	}
	var tempTable = document.createElement('table');
	tempTable.id = 'tempTable';
	var tempTbody = document.createElement('tbody');
	tempTable.appendChild(tempTbody);
	
	var consignment = 0;
	var lastTableEntry;
	
	function addConsignment(){
		var response;
		consignment = consignment+1;
		if(isAddLeftTable('myTable','myTable1'))
		{
			response=addConsignmentRight();
			lastTableEntry = 'right';
			document.getElementById("typeofPacking").selectedIndex=0;
		}
		else
		{
			response=addConsignmentLeft();			
			lastTableEntry = 'left';
			document.getElementById("typeofPacking").selectedIndex=0;
		}
		return response;
	}

	function addConsignmentLeft()
	{
		//alert('addConsignmentLeft called');
		var zero = 0;
		var tableEl = document.getElementById("myTable");
		var TableBody = document.getElementById("myTBody");
		TableBody.style.display = 'block';
		var typeofPackingId=document.wayBillForm.typeofPacking.value;
		var typeofPackingVal=document.wayBillForm.typeofPacking[document.wayBillForm.typeofPacking.selectedIndex].text;
		var quantity=  document.wayBillForm.quantity.value;
		var amount=document.getElementById('charge0');
		//var totalAmt=document.getElementById('totalAmt');
		//var grandTotal=document.getElementById('grandTotal');
		
		if(quantity<1){
			showSpecificErrors('weightError','Please select valid quantity');
			toogleElement('weightError','block');
			changeError1('quantity','0','700');
			document.wayBillForm.quantity.value=1;
			consignment = consignment-1;
			return false;
		}
		else{
			toogleElement('weightError','none');
			removeError('quantity');
		}
		
	    var error="";
		var flagcheck="";
		var flagcheck1="";
		var flagcheck2="";
		var typeOfWeight;
		
		if( document.getElementById('ActualRadio').checked == true ){
			typeOfWeight=1;
			var actualWeightKg=document.getElementById('actualWeightKg').value;
			var actualWeightGm=document.getElementById('actualWeightGm').value;
		}
		else if(document.getElementById('CFTRadio').checked == true){
			typeOfWeight=2;
			var cftLength=document.wayBillForm.cftLength.value;	
			var cftWidth=document.wayBillForm.cftWidth.value;
			var cftHeight=document.wayBillForm.cftHeight.value;
			
			var chargedWeightKg=document.wayBillForm.chargedWeightKg.value;
			var chargedWeightGm=document.wayBillForm.chargedWeightGm.value;
		}


		if(typeofPackingId==0){
			error= "Please select type of packing";
			showSpecificErrors('packageError',"Please select type of packing");
			toogleElement('packageError','block');
			//consignment = consignment-1;
			return false;
		}
			if(typeOfWeight==1){
						
						if((actualWeightKg==0) && (actualWeightGm==0)){
							error= "Please select Actual Weight";
							flagcheck='actualWeightGm';
							flagcheck1='actualWeightKg';
							
							if(cftLength==0 && cftWidth==0 && cftHeight==0){
							}
							
							showSpecificErrors('weightError',error);
							toogleElement('weightError','block');
							changeError1(flagcheck,'0','700');
							changeError1(flagcheck1,'0','700');
							consignment = consignment-1;
							return false;
							//return false;
						}else{
							removeError('actualWeightGm');
							removeError('actualWeightKg');
							toogleElement('weightError','none');
						}

					}
					else{
						
						if(cftLength<1 || cftWidth<1 || cftHeight<1 ){
							error="Please select correct length, weight, height";
							showSpecificErrors('weightError',error);
							toogleElement('weightError','block');
							consignment = consignment-1;
							return false;
						}else{
							toogleElement('weightError','none');
						}
					
					}
				
			
			
			if(typeOfWeight==1)
				
		{
				
			
			var NewRow = document.createElement("tr");
			var one = document.createElement("td");		 
			var two = document.createElement("td");		 
			var three = document.createElement("td");		 
			var four = document.createElement("td");		 
			var five = document.createElement("td");		 
			
			var str = typeofPackingId+','+actualWeightKg+','+actualWeightGm+','+zero+','+zero+','+zero+','+zero+','+zero+','+typeOfWeight+','+quantity;
			
			one.innerHTML = "<input name='checkbox2' id='checkbox2' type=checkbox value="+str+">";
			one.width="5%";
			two.innerHTML = quantity; 	 
			two.align ='center';
			two.width="15%";
			three.innerHTML = typeofPackingVal;
			three.width="30%";
			four.align = 'center';
			four.innerHTML = parseFloat(actualWeightKg)+ parseFloat(actualWeightGm)/1000 +" kg";
			four.width = "40%";
			five.innerHTML =amount.value ;
			five.width="10%";
			
			
			NewRow.appendChild(one);
			NewRow.appendChild(two);
			NewRow.appendChild(three);
			NewRow.appendChild(four);
			NewRow.appendChild(five);
			

			TableBody.appendChild(NewRow);
			document.wayBillForm.actualWeightKg.value=0;
			document.wayBillForm.actualWeightGm.value=0;
			document.wayBillForm.quantity.value=1;
			//Calculate Total
			calcTotalOnAddArticle();
			amount.value=0;
			
		}
			else
		{
				var NewRow = document.createElement("tr");
				var one = document.createElement("td");		 
				var two = document.createElement("td");		 
				var three = document.createElement("td");		 
				var four = document.createElement("td");		 
				var five = document.createElement("td");		 
				
				var str = typeofPackingId+','+zero+','+zero+','+cftLength+','+cftWidth+','+cftHeight+','+chargedWeightKg+','+chargedWeightGm+','+typeOfWeight+','+quantity;
				
				one.innerHTML = "<input name='checkbox2' id='checkbox2' type=checkbox value="+str+">";
				two.innerHTML = quantity; 	 
				three.innerHTML = typeofPackingVal; 	 		
				four.innerHTML = cftLength+" '' x "+cftWidth+" '' x "+cftHeight+" '' "+"==" +(parseFloat(chargedWeightKg)+parseFloat(chargedWeightGm)/1000).toFixed(3); +" kg";;
				five.innerHTML = amount.value;
				
				
				NewRow.appendChild(one);
				NewRow.appendChild(two);
				NewRow.appendChild(three);
				NewRow.appendChild(four);
				NewRow.appendChild(five);
				
				

				TableBody.appendChild(NewRow);
				document.wayBillForm.cftLength.value=0;	
				document.wayBillForm.cftWidth.value=0;
				document.wayBillForm.cftHeight.value=0;
				
				document.wayBillForm.chargedWeightKg.value=0;
				document.wayBillForm.chargedWeightGm.value=0;
				document.wayBillForm.quantity.value=1;
				//Calculate Total
				calcTotalOnAddArticle();
				amount.value=0;
		}
	}
	
	function addConsignmentRight()
	{
		var zero=0;
		var tableEl1 = document.getElementById("myTable1");
		var TableBody1 = document.getElementById("myTBody1");
		TableBody1.style.display = 'block';
		var typeofPackingId=document.wayBillForm.typeofPacking.value;
		var typeofPackingVal=document.wayBillForm.typeofPacking[document.wayBillForm.typeofPacking.selectedIndex].text;
		var quantity=  document.wayBillForm.quantity.value;
		var amount=document.getElementById('charge0');
		if(quantity<1){
			showSpecificErrors('weightError','Please select valid quantity');
			toogleElement('weightError','block');
			changeError1('quantity','0','700');
			document.wayBillForm.quantity.value=1;
			consignment = consignment-1;
			return false;
		}
		else{
			toogleElement('weightError','none');
			removeError('quantity');
		}
		
	    var error="";
		var flagcheck="";
		var flagcheck1="";
		var flagcheck2="";
		var typeOfWeight;
		if( document.getElementById('ActualRadio').checked == true ){
			typeOfWeight=1;
			var actualWeightKg=document.getElementById('actualWeightKg').value;
			var actualWeightGm=document.getElementById('actualWeightGm').value;
		}
		else if(document.getElementById('CFTRadio').checked == true){
			typeOfWeight=2;
			var cftLength=document.wayBillForm.cftLength.value;	
			var cftWidth=document.wayBillForm.cftWidth.value;
			var cftHeight=document.wayBillForm.cftHeight.value;
			
			var chargedWeightKg=document.wayBillForm.chargedWeightKg.value;
			var chargedWeightGm=document.wayBillForm.chargedWeightGm.value;
		}


		if(typeofPackingId==0){
			error= "Please select type of packing";
			showSpecificErrors('packageError',"Please select type of packing");
			toogleElement('packageError','block');
			consignment = consignment-1;
			return false;
		}
			if(typeOfWeight==1){
						
						if((actualWeightKg==0) && (actualWeightGm==0)){
							error= "Please select Actual Weight";
							flagcheck='actualWeightGm';
							flagcheck1='actualWeightKg';
							consignment = consignment-1;
							if(cftLength==0 && cftWidth==0 && cftHeight==0){
							}
								
							showSpecificErrors('weightError',error);
							toogleElement('weightError','block');
							changeError1(flagcheck,'0','700');
							changeError1(flagcheck1,'0','700');
							consignment = consignment-1;
							return false;
							//return false;
						}else{
							removeError('actualWeightGm');
							removeError('actualWeightKg');
							toogleElement('weightError','none');
						}

					}
					else{
						
						if(cftLength<1 || cftWidth<1 || cftHeight<1 ){
							error="Please select correct length, weight, height";
							showSpecificErrors('weightError',error);
							toogleElement('weightError','block');
							consignment = consignment-1;
							return false;
						}else{
							toogleElement('weightError','none');
						}
					
					}
				
			
			
			if(typeOfWeight==1)
				
		{
				
			
			var NewRow = document.createElement("tr");
			var one = document.createElement("td");		 
			var two = document.createElement("td");		 
			var three = document.createElement("td");		 
			var four = document.createElement("td");		 
			var five = document.createElement("td");		 
			
			var str = typeofPackingId+','+actualWeightKg+','+actualWeightGm+','+zero+','+zero+','+zero+','+zero+','+zero+','+typeOfWeight+','+quantity;
			
			one.innerHTML = "<input name='checkbox2' id='checkbox2' type=checkbox value="+str+">";
			one.width="5%";
			two.innerHTML = quantity; 	 
			two.align ='center';
			two.width="15%";
			three.innerHTML = typeofPackingVal;
			three.width="30%";
			four.align = 'center';
			four.innerHTML = parseFloat(actualWeightKg)+ parseFloat(actualWeightGm)/1000 +" kg";
			four.width = "40%";
			five.innerHTML = amount.value; 	 
			five.width="10%";
			//alert('addConsignmentRight called');
			
			NewRow.appendChild(one);
			NewRow.appendChild(two);
			NewRow.appendChild(three);
			NewRow.appendChild(four);
			NewRow.appendChild(five);
			

			TableBody1.appendChild(NewRow);
			document.wayBillForm.actualWeightKg.value=0;
			document.wayBillForm.actualWeightGm.value=0;
			document.wayBillForm.quantity.value=1;
			//Calculate Total
			calcTotalOnAddArticle();
			amount.value=0;
		}
			else
		{
				var NewRow = document.createElement("tr");
				var one = document.createElement("td");		 
				var two = document.createElement("td");		 
				var three = document.createElement("td");		 
				var four = document.createElement("td");		 
				var five = document.createElement("td");		 
				
				
				var str = typeofPackingId+','+zero+','+zero+','+cftLength+','+cftWidth+','+cftHeight+','+chargedWeightKg+','+chargedWeightGm+','+typeOfWeight+','+quantity;
				
				one.innerHTML = "<input name='checkbox2' id='checkbox2' type=checkbox value="+str+">";
				two.innerHTML = quantity; 	 
				three.innerHTML = typeofPackingVal; 	 		
				four.innerHTML = cftLength+" '' x "+cftWidth+" '' x "+cftHeight+" '' "+"==" +(parseFloat(chargedWeightKg)+parseFloat(chargedWeightGm)/1000).toFixed(3); +" kg";;
				five.innerHTML = amount.value; 	 		
				
				
				NewRow.appendChild(one);
				NewRow.appendChild(two);
				NewRow.appendChild(three);
				NewRow.appendChild(four);
				NewRow.appendChild(five);
				
				

				TableBody1.appendChild(NewRow);
				document.wayBillForm.cftLength.value=0;	
				document.wayBillForm.cftWidth.value=0;
				document.wayBillForm.cftHeight.value=0;
				
				document.wayBillForm.chargedWeightKg.value=0;
				document.wayBillForm.chargedWeightGm.value=0;
				document.wayBillForm.quantity.value=1;
				//Calculate Total
				calcTotalOnAddArticle();
				amount.value=0;
		}
	}
function calcTotalOnAddArticle(){
	var tbl_1 =document.getElementById('myTable');
	var tbl_2 =document.getElementById('myTable1');
	var totalAmt=document.getElementById('totalAmt');
	var grandTotal=document.getElementById('grandTotal');
	var tbl_1_amt=0;
	var tbl_2_amt=0;
	for (var i = 1; i < tbl_1.rows.length; ++i) {
		//alert('tbl_1_amt:'+tbl_1_amt);
		//alert('CellValue:'+ parseFloat(tbl_1.rows[i].cells[4].innerHTML));
		tbl_1_amt=tbl_1_amt+ parseFloat(tbl_1.rows[i].cells[4].innerHTML);
	}
	for (var i = 1; i < tbl_2.rows.length; ++i) {
		//alert('tbl_2_amt:'+tbl_2_amt);
		//alert('CellValue:'+ parseFloat(tbl_2.rows[i].cells[4].innerHTML));
		tbl_2_amt=tbl_2_amt+ parseFloat(tbl_2.rows[i].cells[4].innerHTML);
	}
	var amount=tbl_1_amt+tbl_2_amt;
	document.getElementById('totalFreight').value=parseFloat(document.getElementById('totalFreight').value)+parseFloat(document.getElementById('charge0').value);
	//alert(document.getElementById('totalFreight').value);
	
	var discAmount = 0;
	var elDiscount =document.getElementById('discount');
	var elIsDiscount =document.getElementById('isDiscountPercent');
	if (elDiscount!=null){
		if( elIsDiscount!= null)
		{
			if(elIsDiscount.checked){		
	
				discAmount=  amount - parseFloat(elDiscount.value) * parseFloat(amount) / 100;
			}
			else{
				discAmount=  amount - parseFloat(elDiscount.value);
			}
		}
		else{
			discAmount=  amount - parseFloat(elDiscount.value);
		}
	}
	totalAmt.value=amount.toFixed(2);
	grandTotal.value=discAmount.toFixed(2);
	//alert('totalAmt.value:'+totalAmt.value);
	//alert('grandTotal.value:'+grandTotal.value);
	
}	
function validateAddArticle(){
			
		//Quantity
		if(document.getElementById('quantity').value== 0){
				showSpecificErrors('packageError',"Please Enter Quantity");
				toogleElement('packageError','block');
				changeError1('typeofPacking','0','0');
				return false;
		  }
		  else{
			    removeError('typeofPacking');
	  			toogleElement('packageError','none');
		  }
	
    	// Check Type of packing
    	  if(document.getElementById('typeofPacking').value== 0){
  			showSpecificErrors('packageError',"Please select type of packing");
  			toogleElement('packageError','block');
  			changeError1('typeofPacking','0','0');
  			return false;
    	  }
    	  else{
    		    removeError('typeofPacking');
	  			toogleElement('packageError','none');
    	  }
    	  
    	  //Check Weights
    	  if((document.getElementById("actualWeightKg")!=null) && (document.getElementById("actualWeightGm")!=null)){
    	  if((document.getElementById("actualWeightKg").value==0) && (document.getElementById("actualWeightGm").value==0)){
    		  showSpecificErrors('weightError',"Please select Actual Weight");
				toogleElement('weightError','block');
				changeError1('actualWeightGm','0','0');
				changeError1('actualWeightKg','0','0');
	  			return false;
    	  }
    	  
    	  
    	  else{
				removeError('actualWeightGm');
				removeError('actualWeightKg');
				toogleElement('weightError','none');
			}
    	  }
    	  //Check L W H Values
    	  var elCFTLength=document.getElementById("cftLength");
    	  var elCFTWidth=document.getElementById("cftWidth");
    	  var elCFTHeight=document.getElementById("cftHeight");
    	  
    	  if(elCFTLength!=null  && elCFTWidth !=null && elCFTHeight !=null ){

    	  if(elCFTLength.disable==false && elCFTWidth.disable==false && elCFTHeight.disable==false ){

    		  if(elCFTLength.value<1 ||elCFTWidth.value<1 || elCFTHeight.value <1 ){
  				showSpecificErrors('weightError',"Please select correct length, weight, height");
  				toogleElement('weightError','block');
  				changeError1('cftHeight','0','0');
  				changeError1('cftWidth','0','0');
  				changeError1('cftLength','0','0');
  	  			return false;
      	  		}
    		  else{
					toogleElement('weightError','none');
					removeError('cftHeight');
					removeError('cftWidth');
					removeError('cftLength');
				}
        	  }
    	  }
    	  	return true;

          }

	function showInfo(toFocus,divid) {
        if(    document.getElementById(divid).style.display == 'none')    {
            document.getElementById(divid).style.display='block';
            eval('document.wayBillForm.' + toFocus + '.focus()');
        }else{
            document.getElementById(divid).style.display='none';
            eval('document.wayBillForm.' + nextfield + '.focus()');
        }   
        
        
    }

	
	function formValidations(){	
		var article=document.getElementById('natureOfArticle');
		if(article.value== 0){
			var ele = document.getElementById('basicError');
			showSpecificErrors('basicError',"Please, select Nature of Article");
			toogleElement('basicError','block');
			changeError1('natureOfArticle','0','0');
			return false;
		}else{
	
			toogleElement('basicError','none');
			removeError('natureOfArticle');
		} 
		var dest=document.getElementById('destinationCityId');
		if(dest.value== 0){
			var ele = document.getElementById('basicError');
			showSpecificErrors('basicError',"Please, select destnation city");
			toogleElement('basicError','block');
			changeError1('destinationCityId','0','0');
			return false;
		}else{
	        
			toogleElement('basicError','none');

		}
		
		var drop=document.getElementById('destinationBranchId');
		if(drop.value== 0){
			var ele = document.getElementById('basicError');
			showSpecificErrors('basicError',"Please, select drop point");
			toogleElement('basicError','block');
			changeError1('destinationBranchId','0','0');
			return false;
		}else{
	
			toogleElement('basicError','none');
			removeError('destinationBranchId');
		} 
		
		//Consignor details validations
		
		var name=document.getElementById('consignorName');
		if(name.value== "" || name.value == "Consigner Name"){
			var ele = document.getElementById('consignorError');
			showSpecificErrors('consignorError',"Consignor name can not be blank ");
			toogleElement('consignorError','block');
			changeError1('consignorName','0','0');
			
			return false;
		}else{
			toogleElement('consignorError','none');
			removeError('consignorName');
		}
		var addr=document.getElementById('consignorAddress');
		if(addr.value== ""){
			var ele = document.getElementById('consignorError');
			showSpecificErrors('consignorError',"Consignor Address can not be blank ");
			toogleElement('consignorError','block');
			changeError1('consignorAddress','0','0');
			return false;
		}
		else if(addr.value== "Address")
		{
				addr.value = 'NaN';
		}
		else{
			toogleElement('consignorError','none');
			removeError('consignorAddress');
		}
		var pin=document.getElementById('consignorPin');
		if(pin.value =="PIN No")
		{
			pin.value ='0';
		}
		
		var Phone=document.getElementById('consignorPhn');

		if(Phone.value== "" || Phone.value == "Phone no"){
			var ele = document.getElementById('consignorError');
			showSpecificErrors('consignorError',"Consignor Phone Number can not be blank ");
			toogleElement('consignorError','block');
			changeError1('consignorPhn','0','0');
			return false;
		}else{
			toogleElement('consignorError','none');
			removeError('consignorPhn');
		}
		/*
		var pin=document.getElementById('consignorPin');
		if(pin.value== ""){
			var ele = document.getElementById('consignorError');
			showSpecificErrors('consignorError',"Consignor PinCode can not be blank ");
			toogleElement('consignorError','block');
			changeError1('consignorPin','0','0');
			return false;
		}else{
			toogleElement('consignorError','none');
			removeError('consignorPin');
		}*/
		var contact=document.getElementById('consignorError');
		if(contact.value== ""){
			var ele = document.getElementById('consignorContactPerson');
			showSpecificErrors('consignorError',"Consignor ContactName can not be blank ");
			toogleElement('consignorError','block');
			changeError1('consignorError','0','0');
			return false;
		}else{
			toogleElement('consignorError','none');
			removeError('consignorError');
		}
		/*var phone=document.getElementById('consignorPin');
		if(phone.value== ""){
			var ele = document.getElementById('consignorError');
			showSpecificErrors('consignorError',"Consignor Phone Number can not be blank ");
			toogleElement('consignorError','block');
			changeError1('consignorPin','0','0');
			return false;
		}else{
			toogleElement('consignorError','none');
			removeError('consignorPin');
		}*/
		
		//Consignee details validations
		
		var cName=document.getElementById('consigneeName');
		if(cName.value== "" || cName.value == "Consignee Name"){
			var ele = document.getElementById('consignorError');
			showSpecificErrors('consignorError',"Consignee  Name can not be blank ");
			toogleElement('consignorError','block');
			changeError1('consigneeName','0','0');
			return false;
		}else{
			toogleElement('consignorError','none');
			removeError('consigneeName');
		}
		var cAddr=document.getElementById('consigneeAddress');
		if(cAddr.value== ""){
			var ele = document.getElementById('consignorError');
			showSpecificErrors('consignorError',"Consignee Address can not be blank ");
			toogleElement('consignorError','block');
			changeError1('consigneeAddress','0','0');
			return false;
		}else if(cAddr.value== "Address")
		{
			{
				cAddr.value = 'NaN';
			}
				
		}else{
			toogleElement('consignorError','none');
			removeError('consigneeAddress');
		}
		var cpin=document.getElementById('consigneePin');
		if(cpin.value =="PIN No")
		{
			cpin.value ='0';
		}
		
	
		/*var cPin=document.getElementById('consigneePin');
		if(cPin.value== ""){
			var ele = document.getElementById('consignorError');
			showSpecificErrors('consignorError',"Consignee PinCode can not be blank ");
			toogleElement('consignorError','block');
			changeError1('consigneePin','0','0');
			return false;
		}else{
			toogleElement('consignorError','none');
			removeError('consigneePin');
		}*/
		var cContact=document.getElementById('consigneeContactPerson');
		if(cContact.value== ""){
			var ele = document.getElementById('consignorError');
			showSpecificErrors('consignorError',"Consignee ContactName can not be blank ");
			toogleElement('consignorError','block');
			changeError1('consigneeContactPerson','0','0');
			return false;
		}else{
			toogleElement('consignorError','none');
			removeError('consigneeContactPerson');
		}
		var cPhone=document.getElementById('consigneePhn');

		if(cPhone.value== "" || cPhone.value == "Phone no"){
			var ele = document.getElementById('consignorError');
			showSpecificErrors('consignorError',"Consignee Phone Number can not be blank ");
			toogleElement('consignorError','block');
			changeError1('consigneePhn','0','0');
			return false;
		}else{
			toogleElement('consignorError','none');
			removeError('consigneePhn');
		}
		var random=Math.floor(Math.random()*1001);
		var i;
		
		var articleType =  document.getElementById("natureOfArticle");
		var docType = articleType.options[articleType.selectedIndex].text;
		
		if(docType.toUpperCase()=="MOTORCYCLE"){
			articleRequired = false;
		}else{
			
			var tableEl = document.getElementById("myTable");
			var tableEl1 = document.getElementById("myTable1");
			
			if(tableEl != null && tableEl1 != null){
					if(tableEl.rows.length==1 && tableEl1.rows.length==1 ){
						showSpecificErrors('packageError',"Please add atleast one article in this way bill");
						toogleElement('packageError','block');
						changeError1('myTable','0','700');
						return false;
					}else{
						toogleElement('packageError','none');
						removeError('myTable');
					}
					articleRequired = true;
			}	
		}
		/*
		var remark=document.getElementById('remark');
		if(remark.value== 0){
			showSpecificErrors('remarkError',"Please, enter a remark");
			toogleElement('remarkError','block');
			changeError1('remark','0','0');
			return false;
		}else{
	        
			toogleElement('remarkError','none');
			removeError('remark');

		}
		*/
		
		var tableEl = document.getElementById("myTable");
		var tableEl1 = document.getElementById("myTable1");
		
		if(tableEl != null && tableEl1 != null){
		
			if(document.wayBillForm.checkbox2.length != null){
			for (i = 0; i < document.wayBillForm.checkbox2.length; i++)
			{	
				document.wayBillForm.checkbox2[i].checked = true;
			}
			}
			else{			
				document.getElementById('checkbox2').checked = true;
			}
		}	
		if(!isChargeDisplayable()){
			getCharges();
			return;
		}
		document.wayBillForm.amount.disabled=false;
		document.wayBillForm.grandTotal.disabled=false;
		
		document.getElementById('consignorName').disabled=false;
		document.getElementById('consignorAddress').disabled=false;
		document.getElementById('consignorPin').disabled=false;
		document.getElementById('consignorContactPerson').disabled=false;
		document.getElementById('consignorPhn').disabled=false;
		document.getElementById('consignorEmail').disabled=false;
		document.getElementById('consignorDept').disabled=false;
		document.getElementById('consignorFax').disabled=false;
		document.getElementById('consigneeName').disabled=false;
		document.getElementById('consigneeAddress').disabled=false;
		document.getElementById('consigneePin').disabled=false;
		document.getElementById('consigneeContactPerson').disabled=false;
		document.getElementById('consigneePhn').disabled=false;
		document.getElementById('consigneeEmail').disabled=false;
		document.getElementById('consigneeDept').disabled=false;
		document.getElementById('consigneeFax').disabled=false;
		
		 if(document.getElementById('declaredValue').value.substr(0,7) == 'Declare')
        	 document.getElementById('declaredValue').value = '0'; 
		
		var wayBillType =  document.getElementById("wayBillType");
	    var value = wayBillType.value;
	    
	    if(value == '3'){
	    	if(document.wayBillForm.isDiscountPercent != null)
		    {	
	    		if(document.wayBillForm.isDiscountPercent.checked){
	    			document.wayBillForm.isDiscountPercent.checked = false;
		    	}
	    		document.getElementById('charge0').value=document.getElementById('totalFreight').value
	    		document.wayBillForm.submit();
	    	}

	    }else{ 
	    	if(document.wayBillForm.grandTotal.value > 0){
	    		document.getElementById('charge0').value=document.getElementById('totalFreight').value
				document.wayBillForm.submit();
			}else{
				alert('Charges Missing');
			}
	    }
		
	}

	
	function openCorporateSearch(accountGroupId ,flag){
		childwin = window.open ('Search.do?pageId=3&eventId=2&accountGroupId=' + accountGroupId + '&flag=' + flag + '' , 'newwindow', config='height=425,width=615, toolbar=no, menubar=no, scrollbars=no, resizable=no,location=no, directories=no, status=no');
	}

function calcGrandtotal(){

		
		var tx =  document.getElementById("taxes");
		var grandtotal = 0;
		var amount = parseFloat(document.wayBillForm.amount.value);
		var discAmount = 0;
		
	if(document.wayBillForm.isDiscountPercent != null)
	{
		if(document.wayBillForm.isDiscountPercent.checked){		

			discAmount=  amount - parseFloat(document.wayBillForm.discount.value) * parseFloat(document.wayBillForm.amount.value) / 100;
		}
		else{
			discAmount=  amount - parseFloat(document.wayBillForm.discount.value);
		}
		
	}
	else{
		discAmount=  amount - parseFloat(document.wayBillForm.discount.value);
	}
		/*if(discAmount < 0){
			document.wayBillForm.discount.value =0;
			discAmount =amount;

		}*/
		
	
	
		grandtotal = discAmount;
		
		for(i=0;i<	tx.getElementsByTagName("input").length;i=i+2){
			if(tx.getElementsByTagName("input")[i+1].checked){
				var calc = parseFloat(tx.getElementsByTagName("input")[i+1].value) * discAmount / 100;
				if(discAmount>750){
					tx.getElementsByTagName("input")[i].value = calc.toFixed(2);
					grandtotal = grandtotal + calc;
				}else{
					tx.getElementsByTagName("input")[i].value = 0;
				}
				

			}
			else{  
			
				grandtotal = grandtotal + parseFloat(tx.getElementsByTagName("input")[i].value) * grandtotal/100;			
			}
		}

		if(amount != 0){
			document.wayBillForm.grandTotal.value = (Math.round(grandtotal)).toFixed(2);
		}
		else
		{
			document.wayBillForm.grandTotal.value = 0;
		}
	}

	function isChargeDisplayable(){
		
		var d = document.getElementById("wayBillType");

		wayBillType= d.value;
		
		wayBillType = wayBillType.replace(/\n/g,'');
		wayBillType = wayBillType.replace(/\r/g,'');
		wayBillType = wayBillType.toUpperCase();

		if(wayBillType=="FOC" || wayBillType=="CREDIT"){
			return false;
		}
		else{
			return true;
		}
	}
	
	function calcTotal(){

		
		var ch =  document.getElementById("charges");
		var charge =0;
		
		for(i=0;i<	ch.getElementsByTagName("input").length;i++){
		charge = charge + parseFloat(ch.getElementsByTagName("input")[i].value);
		}
		document.wayBillForm.amount.value = charge.toFixed(2);
		calcGrandtotal();
		
	}


