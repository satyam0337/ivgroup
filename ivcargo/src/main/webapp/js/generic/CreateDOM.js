
/*
 * create new options in HTML select pass HTMl select id , option key and value.
 */
function createOption(Id,key,value) {
	var newOption = $("<option />");
	$('#'+Id).append(newOption);
	newOption.attr('id',key);
	newOption.val(key);
	newOption.html(value);
}

/*
 * create new options in HTML select pass HTMl select id , option key and value with Different Id and Value.
 */
function createNewOption(Id,optionId,optionValue,htmlText) {
	var newOption = $("<option />");
	$('#'+Id).append(newOption);
	newOption.attr('id',optionId);
	newOption.val(optionValue);
	newOption.html(htmlText);
}

/*
 * 
 */
/*
 * create new options in html on secong position select pass HTMl select id , option key and value.
 */
function createSecondOptions(Id,key,value) {
	$('#'+Id+' option:first').after(
			$('<option />', {
				value :	key
				,text  :	value
			})
	);
}

/*
 * Remove option from HTML select with HTML select id and option value.
 * if value is null then it will remove all options 
 */
function removeOption(Id,value) {
	if(value != null) {
		$('#'+Id+' option[value='+value+']').remove();
	} else {
		$('#'+Id+' option[value]').remove();
	}
}

/*
 * Create <li> tag with parentId as id of tag to append and jsonobject of attribute 
 */
function createList(parentId, jsonObject) {
	var newItem = $("<li />");
	$('#'+parentId).append(newItem);

	newItem.attr({
		id		: jsonObject.id
	});

	if(jsonObject.style) {
		newItem.attr( {
			style : jsonObject.style
		});
	};

	if(jsonObject.class) {
		newItem.attr( {
			class : jsonObject.class
		});
	};

	if(jsonObject.html) {
		newItem.html(jsonObject.html);
	};

	return newItem;
}

/*
 * create new label with parent id which have to append it and some general configuration.
 */
function createLabel(parentEle,Id,Value,Style,Class,For) {
	var labels = $('<label/>');
	$(parentEle).append(labels);

	labels.attr( {
		id			: Id,
		style		: Style,
		class		: Class,
		'for'		: For
	});

	labels.html(Value);
	return labels;
}

/*
 * create new row with parent id which have to append it and some general configuration.
 */
function createRow(Id,Style){
	var newRow 	=  $('<tr/>');
	newRow.attr({
		id : Id
		,style : Style
	});
	return newRow;
}

/*
 * create new column with parent id which have to append it and some general configuration.
 */
function createColumn(tableRow, Id, Width, Align, Style, Collspan) {
	var newCol 	=  $('<td/>');
	newCol.attr({
		id 			: Id
		,width		: Width
		,align		: Align
		,colspan 	: Collspan
		,style		: Style
	});
	$(tableRow).append(newCol);
	return newCol;
}

function createNewColumn(tableRow ,Id, Class, Width, Align, Style, Collspan) {
	var newCol 	=  $('<td/>');
	newCol.attr({
		id 			: Id
		,class		: Class
		,width		: Width
		,align		: Align
		,colspan 	: Collspan
		,style		: Style
	});
	$(tableRow).append(newCol);
	return newCol;
}

function createCheckBox(parentEle,jsonObject) {

	var inputs = $('<input type='+jsonObject.type+' />');
	parentEle.append(inputs);


	inputs.attr ({
		id			: jsonObject.id
		,name		: jsonObject.name
		,value		: jsonObject.value
		,checked	: jsonObject.checked
	});
	
	if(jsonObject.style) {
		inputs.attr( {
			style : jsonObject.style
		});
	};

	if(jsonObject.class) {
		inputs.attr( {
			class : jsonObject.class
		});
	};
	
	return inputs;
}
/*
 * create new <div> with parent id which have to append it and some general configuration.
 */
function createDiv(parentId, jsonObject) {
	var newDiv 	=  $('<div/>');

	newDiv.attr({
		id		: jsonObject.id,
		class	: jsonObject.class
	});

	if(jsonObject.style) {
		newDiv.attr( {
			style : jsonObject.style
		});
	};

	if(jsonObject.align) {
		newDiv.attr( {
			align : jsonObject.align
		});
	};

	if(jsonObject.html) {
		newDiv.attr( {
			html : jsonObject.html
		});
	};

	parentId.append(newDiv);
	return newDiv;
}

/*
 * create All kind of input tag passed in json object with parent id which have to append it and some general configuration.
 */
function createInput(parentEle,jsonObject) {

	var inputs = $('<input type='+jsonObject.type+' />');
	parentEle.append(inputs);


	inputs.attr ({
		id			: jsonObject.id
		,name		: jsonObject.name
		,value		: jsonObject.value
	});

	if(jsonObject.style) {
		inputs.attr( {
			style : jsonObject.style
		});
	};

	if(jsonObject.class) {
		inputs.attr( {
			class : jsonObject.class
		});
	};

	if(jsonObject.disabled) {
		inputs.attr( {
			disabled : jsonObject.disabled
		});
	};

	if(jsonObject.maxlength) {
		inputs.attr( {
			maxlength : jsonObject.maxlength
		});
	};

	if(jsonObject.readonly) {
		inputs.attr( {
			readonly : jsonObject.readonly
		});
	};

	if(jsonObject.onblur) {
		inputs.attr( {
			onblur : jsonObject.onblur
		});
	};

	if(jsonObject.onkeypress) {
		inputs.attr( {
			onkeypress : jsonObject.onkeypress
		});
	};

	if(jsonObject.onfocus) {
		inputs.attr( {
			onfocus : jsonObject.onfocus
		});
	};

	if(jsonObject.onkeydown) {
		inputs.attr( {
			onkeydown : jsonObject.onkeydown
		});
	};

	if(jsonObject.onkeyup) {
		inputs.attr( {
			onkeyup : jsonObject.onkeyup
		});
	};

	if(jsonObject.onclick) {
		inputs.attr( {
			onclick : jsonObject.onclick
		});
	};

	if(jsonObject.onmouseup) {
		inputs.attr( {
			onmouseup : jsonObject.onmouseup
		});
	};

	if(jsonObject.onmousedown) {
		inputs.attr( {
			onmousedown : jsonObject.onmousedown
		});
	};
	
	if(jsonObject.onpaste) {
		inputs.attr( {
			onpaste : jsonObject.onpaste
		});
	};

	if(jsonObject.placeholder) {
		inputs.attr( {
			placeholder : jsonObject.placeholder
		});
	};
	
	if(jsonObject.checked) {
		inputs.attr( {
			checked : jsonObject.checked
		});
	};

	return inputs;
}

/*
 * create new <div> with parent id which have to append it and some general configuration.
 */

function createButton(parentEle,jsonObject) {
	var button = $('<button type='+jsonObject.type+' />');
	parentEle.append(button);


	button.attr ({
		id			: jsonObject.id
		,name		: jsonObject.name
		,value		: jsonObject.value
	});

	if(jsonObject.class) {
		button.attr( {
			class : jsonObject.class
		});
	};

	if(jsonObject.onclick) {
		button.attr( {
			onclick : jsonObject.onclick
		});
	};

	if(jsonObject.html) {
		button.html(jsonObject.html);
	};

	if(jsonObject.style) {
		button.attr( {
			style : jsonObject.style
		});
	};

	if(jsonObject.onmouseover) {
		button.attr( {
			onmouseover : jsonObject.onmouseover
		});
	};

	return button;
}

/*
 * Create <a> tag with id and value as html 
 */
function createHyperLink(jsonObject) {
	var newItem = $("<a />");

	newItem.attr({
		id		: jsonObject.id
	});

	newItem.attr({
		href		: jsonObject.href
	});

	if(jsonObject.style) {
		newItem.attr( {
			style : jsonObject.style
		});
	};

	if(jsonObject.class) {
		newItem.attr( {
			class : jsonObject.class
		});
	};

	if(jsonObject.html) {
		newItem.html(jsonObject.html);
	};

	if(jsonObject.onClick) {
		newItem.attr( {
			onClick : jsonObject.onClick
		});
	};

	return newItem;
}

// Append Row In given Table body At last position
function appendHeaderRow (tableId,rowEle) {
	$('#'+tableId+' > thead:last').append(rowEle);
}

// Append Row In given Table body At last position
function appendRow (tableId,rowEle) {
	$('#'+tableId+' > tbody:last').append(rowEle);
}

function createTable (id,className) {
	
	var	table = $(document.createElement('table'));
	
	table.attr("id", id);
	table.attr("class", className);
	
	return table; 
}

function removeTableData (tableId) {
	
	$('#'+tableId).find('tr').remove();
	
}

function removeTableDataExceptHeader (tableId) {
	
	$('#'+tableId).find('tr').slice(1).remove();
	
}

function removeTableBodyData (tableId) {

	$('#'+tableId+'> tbody > tr').remove();
	
}

function removeAllContentFromDiv (divId) {
	
	
	$('#'+divId).empty();
	
}

function changeElementId (element,newId) {
	$(element).attr('id',newId);
}

function changeElementName (element,newName) {
	$(element).attr('name',newName);
}

function createOptionWithSelected(Id, key, value, isSelected = false) {
	var newOption = $("<option />");
	newOption.attr('id', key); 
	newOption.val(key);
	newOption.html(value);
	newOption.prop('selected', isSelected); 
			
	$('#' + Id).append(newOption);
}