function sortDropDownList(targetId) {
	var ddl = document.getElementById(targetId);
	
	if(ddl != null) {
		var selectedValue = ddl.options[ddl.selectedIndex].value;
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
}