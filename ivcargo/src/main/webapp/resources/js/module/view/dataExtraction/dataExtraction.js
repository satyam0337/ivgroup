var lhpvIds = [];
let	 id = 0;
let total = 0;
let a=0;
let loadingPercentAmt = 0;

define([
		 PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
		  PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
		  'selectizewrapper',
		 'JsonUtility',
		 'messageUtility',
		 'autocomplete',
		 'bootstrapSwitch',
		 'nodvalidation',
		 'focusnavigation',
		 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		],//PopulateAutocomplete
		 function(Selection, UrlParameter, Selectizewrapper) {
			'use strict';
		let jsonObject = new Object(), _this = this ,  processStartTime = null;;
		return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			this.$el.html(this.template);
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/dataExtractionWS/getDataExtractionAutocomplete.do?', _this.renderAllDetailsElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, renderAllDetailsElements : function(response) {
			let loadelement				= new Array();
			let baseHtml				= new $.Deferred();
			loadelement.push(baseHtml);
		
			$("#mainContent").load("/ivcargo/html/module/dataExtraction/dataExtraction.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function () {
				let keyObject = Object.keys(response);
							
				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute="+ element+ "]").removeClass("hide");
				}

				$("#proceedBtn").click(function() {
					const $btn = $(this);
					$btn.hide();
					
					 processStartTime = new Date();
					 
					const selectedValue = $("#functionalNameEle").val();
					const selected = response.autoCompleteList.find(item => item.functionalName === selectedValue);
				
					if (selected) 
						_this.onProceed(selected); // pass just the selected object
						
					showLayer();
				});
				
				let autoCompleteList	= response.autoCompleteList;

				Selectizewrapper.setAutocomplete({
					jsonResultList: autoCompleteList,
					valueField: 'functionalName',
					labelField: 'functionalName',
					searchField: 'functionalName',
					elementId: 'functionalNameEle',	 
					create: false,
					maxItems: 1,
					onChange: _this.functionalNameSelection
				});
				
				if(autoCompleteList.length == 1)
					_this.functionalNameSelection();
			});
		}, functionalNameSelection : function() {
			$('#bottom-border-boxshadow').addClass('hide');
			$('#downloadLink').empty();
			let jsonObject	= {};
			jsonObject.functionalName = $("#functionalNameEle").val();
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL+'/dataExtractionWS/getDataExtractionParameter.do', _this.setData, EXECUTE_WITH_ERROR);
		}, setData : function (response) {
			$('#proceedBtn').toggle(!!response.paramList);
			renderFormInputs(response.paramList, response.functionalName);
		}, onProceed : function(selectedItem) {
			const valid = validateDynamicInputs();
			if (!valid) {
				showAlertMessage('error', 'Please fill required fields');
				return false;
			}
			 
			let name = selectedItem.functionalName;
			jsonObject.functionalName = name;
			
			if (selectedItem.spOrSql === 'SP') {
				const inputsContainer = document.getElementById("dynamicInputs");
				//const inputElements = inputsContainer.querySelectorAll("input");
				const inputElements = inputsContainer.querySelectorAll("input, select");
				const inputParams = {};
			
				inputElements.forEach(input => {
					if (input.name)
						inputParams[input.name] = input.value;
				});
				
				jsonObject.inputParams = inputParams;
				jsonObject.functionalName = name;
				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL+'/dataExtractionWS/getSpDataFromInput.do', _this.responseExecute, EXECUTE_WITH_ERROR);
			} else {
				showLayer();				
				getJSON(jsonObject, WEB_SERVICE_URL+'/dataExtractionWS/getSqlStringsByFunctionalName.do', _this.replaceWhereClause, EXECUTE_WITH_ERROR);
			}
		}, responseExecute : function() {
			hideLayer();
		}, replaceWhereClause : function(response) {
			hideLayer();
			
			const sqlParts		= response.clubsqlString.sqlParts;
			const cleanSqlParts = sqlParts.filter(part => part !== null);
			const fullSQL		= cleanSqlParts.join('\n');
			
			const inputsContainer	= document.getElementById("dynamicInputs");
			//const inputElements		= inputsContainer.querySelectorAll("input");
			const inputElements = inputsContainer.querySelectorAll("input, select");

			const inputParams = {};
			
			inputElements.forEach(input => {
				if (input.name)
					inputParams[input.name] = input.value;
			});
			
			jsonObject.inputParams = inputParams;
			jsonObject.fullsqlParts = fullSQL;
			jsonObject.functionalName = response.functionalName;
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/dataExtractionWS/buildFinalSql.do', _this.setPlaceHolders, EXECUTE_WITH_ERROR);
		}, setPlaceHolders : function (response) {
			jsonObject.inputParams		= response.inputParams;
			jsonObject.fullsqlParts		= response.fullsqlParts;
			jsonObject.functionalName	= response.functionalName;
			jsonObject.sql				= response.sqlPart;
			
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL+'/dataExtractionWS/executeSpSQl.do', _this.downLoadExcel, EXECUTE_WITH_ERROR);
		}, downLoadExcel : function(data) {
			let errorMessage = data.message;
			
			if(errorMessage.messageId == 21 || errorMessage.messageId == 491) {
				hideLayer();
				return false;
			}
			
			let otherContent	= data.otherContent;
			
			if(otherContent != undefined && otherContent != null)
				$('#downloadLink').html(otherContent);
			
			hideLayer();
			$("#proceedBtn").show();
			
			const processEndTime = new Date();

			const formatTime = (date) =>
					date.getHours().toString().padStart(2, "0") + ":" +
					date.getMinutes().toString().padStart(2, "0");

			const startStr = formatTime(processStartTime);
			const endStr = formatTime(processEndTime);

			$("#progressContainer").addClass("hide");
			$("#finalMessage").text(`✅ Process Started @${startStr} and Completed @${endStr}`);
			$("#finalMessage").removeClass("hide");
		}
	});
});

function showLayer() {
	$("#progressContainer").removeClass("hide");
	$("#progressMessage").text("Processing - Please be patient...");
	$("#finalMessage").text("");
	$("#finalMessage").addClass("hide");
}

function hideLayer() {
	$("#progressContainer").addClass("hide");
}

function renderFormInputs(params, functionalName, preserveInputId = null, preserveInputValue = null) {
	const container = document.getElementById("dynamicInputs");
	container.innerHTML = "";

	let rowDiv = null;

	params.forEach((p, index) => {
		// Create new row every 2 inputs
		if (index % 2 === 0) {
			rowDiv = document.createElement("div");
			rowDiv.className = "row mb-3"; // spacing between rows
			container.appendChild(rowDiv);
		}

		const colDiv = document.createElement("div");
		colDiv.className = "col-md-3";

		const formGroup = document.createElement("div");
		formGroup.className = "form-group";

		const label = document.createElement("label");
		label.innerText = `${p.displayLabel} (${p.dataType})${p.isMandatory ? " *" : ""}`;
		label.htmlFor = p.isSql ? `${p.paramName}_${p.paramOrder}` : p.paramName;

		let input;
	
		if (p.dataType.toLowerCase().includes("date")) {
			input = document.createElement("input");
			input.type = "date";
			 // input.readOnly = true;
			const tzOffsetMs = (new Date()).getTimezoneOffset() * 60000;
			const todayLocalYYYYMMDD = new Date(Date.now() - tzOffsetMs).toISOString().split('T')[0];
			input.max = todayLocalYYYYMMDD;
			
		} else if (p.dataType.toLowerCase().includes("int") || p.dataType.toLowerCase().includes("number")) {
			input = document.createElement("input");
			// input.type = "number";
		} else {
			input = document.createElement("input");
			input.type = "text";
		}
		
		input.className = "form-control";
		input.name		= p.isSql ? `${p.paramName}_${p.paramOrder}` : p.paramName;
		input.id		= p.isSql ? `${p.paramName}_${p.paramOrder}` : p.paramName;
		input.value		= p.defaultValue || "";
		input.required	= p.isMandatory;
		
		input.addEventListener("keydown", function(e) {
			if (e.key === "Enter") {
				e.preventDefault();
				focusNextInput(e.target, container);
			}
		});

		if (input.id === preserveInputId)
			input.value = preserveInputValue;
		
		if (!p.isEditable) {
			input.readOnly = true;
			input.classList.add("readonly");
		}
		if (Array.isArray(p.optionList)) {
			const dataListId = `${input.id}_list`;
			input.setAttribute("list", dataListId);
			 input.readOnly = true;

			const dataList = document.createElement("datalist");
			dataList.id = dataListId;
			
			const accountGroupNameToIdMap = new Map(); 
			
			p.optionList.forEach(option => {
				accountGroupNameToIdMap.set(option.accountGroupName, option.accountGroupId); // store mapping
				 
				const opt = document.createElement("option");
				opt.value = option.accountGroupName; // user sees name
				dataList.appendChild(opt);
			});
			
			if (p.optionList.length > 0)
				input.value = p.optionList[0].accountGroupName;
			
			formGroup.appendChild(label);
			formGroup.appendChild(input);
			formGroup.appendChild(dataList)
		} else if (Array.isArray(p.branchList)) {
			const wrapper = document.createElement("div");
			wrapper.style.position = "relative";

			const label = document.createElement("label");
			label.innerText = `${p.displayLabel} (${p.dataType})${p.isMandatory ? " *" : ""}`;
			label.htmlFor = p.paramName;
			wrapper.appendChild(label);

			const input = document.createElement("input");
			input.type = "text";
			input.className = "form-control";
			input.name = p.isSql ? `${p.paramName}_${p.paramOrder}` : p.paramName;
			input.id = p.isSql ? `${p.paramName}_${p.paramOrder}` : p.paramName;
			//input.readOnly = true;
			input.required = p.isMandatory;
			wrapper.appendChild(input);

			const dropdown = document.createElement("div");
			dropdown.className = "checkbox-dropdown";
			dropdown.style.position = "absolute";
			dropdown.style.top = "100%";
			dropdown.style.left = "0";
			dropdown.style.width = "100%";
			dropdown.style.border = "1px solid #ccc";
			dropdown.style.maxHeight = "200px";
			dropdown.style.overflowY = "auto";
			dropdown.style.backgroundColor = "white";
			dropdown.style.zIndex = "1000";
			dropdown.style.display = "none";

			p.branchList.forEach(branch => {
				const item = document.createElement("div");
				item.className = "form-check";

				const checkbox = document.createElement("input");
				checkbox.type = "checkbox";
				checkbox.className = "form-check-input";
				checkbox.value = branch.branchName;
				checkbox.id = `${p.paramName}_${branch.branchId}`;

				const checkboxLabel = document.createElement("label");
				checkboxLabel.className = "form-check-label";
				checkboxLabel.innerText = branch.branchName;
				checkboxLabel.htmlFor = checkbox.id;

				checkbox.addEventListener("change", () => {
					const selected = Array.from(dropdown.querySelectorAll("input:checked"))
						.map(cb => cb.value);
					input.value = selected.join(",");
				});

				item.appendChild(checkbox);
				item.appendChild(checkboxLabel);
				dropdown.appendChild(item);
			});

			input.addEventListener("input", () => {
				const inputValue = input.value;
				const branches = inputValue.split(",");
				const currentTyping = branches[branches.length - 1].trim().toLowerCase(); // <-- only the last part

				dropdown.querySelectorAll(".form-check").forEach(item => {
					const text = item.querySelector("label").innerText.toLowerCase();
					item.style.display = text.includes(currentTyping) ? "" : "none";
				});

				dropdown.style.display = "block";
			});

			input.addEventListener("focus", () => {
				dropdown.style.display = "block";
			});
			
			document.addEventListener("click", function handleOutsideClick(e) {
				if (!wrapper.contains(e.target)) {
					dropdown.style.display = "none";
				}
			});
			
			wrapper.appendChild(dropdown);
			formGroup.appendChild(wrapper);
		} else if (Array.isArray(p.packingTypeList)) {
			const wrapper = document.createElement("div");
			wrapper.style.position = "relative";

			const label = document.createElement("label");
			label.innerText = `${p.displayLabel} (${p.dataType})${p.isMandatory ? " *" : ""}`;
			label.htmlFor = p.paramName;
			wrapper.appendChild(label);

			// Visible input (shows names)
			const input = document.createElement("input");
			input.type = "text";
			input.className = "form-control";
			input.readOnly = true; // user can't type free text, only select
			input.required = p.isMandatory;
			wrapper.appendChild(input);

			// Hidden input (stores IDs for backend)
			const hiddenInput = document.createElement("input");
			hiddenInput.type = "hidden";
			hiddenInput.name = p.isSql ? `${p.paramName}_${p.paramOrder}` : p.paramName;
			hiddenInput.id = p.isSql ? `${p.paramName}_${p.paramOrder}` : p.paramName;
			wrapper.appendChild(hiddenInput);

			// Dropdown container
			const dropdown = document.createElement("div");
			dropdown.className = "checkbox-dropdown";
			dropdown.style.position = "absolute";
			dropdown.style.top = "100%";
			dropdown.style.left = "0";
			dropdown.style.width = "100%";
			dropdown.style.border = "1px solid #ccc";
			dropdown.style.maxHeight = "200px";
			dropdown.style.overflowY = "auto";
			dropdown.style.backgroundColor = "white";
			dropdown.style.zIndex = "1000";
			dropdown.style.display = "none";

			// Build checkbox list
			p.packingTypeList.forEach(type => {
				const item = document.createElement("div");
				item.className = "form-check";

				const checkbox = document.createElement("input");
				checkbox.type = "checkbox";
				checkbox.className = "form-check-input";
				checkbox.value = type.packingTypeMasterId; // ✅ backend ID
				checkbox.dataset.name = type.packingGroupTypeName; // ✅ UI name
				checkbox.id = `${p.paramName}_${type.packingTypeMasterId}`;

				const checkboxLabel = document.createElement("label");
				checkboxLabel.className = "form-check-label";
				checkboxLabel.innerText = type.packingGroupTypeName;
				checkboxLabel.htmlFor = checkbox.id;

				// Update visible + hidden inputs on selection
				checkbox.addEventListener("change", () => {
					const selected = Array.from(dropdown.querySelectorAll("input:checked"));

					// Show names in UI
					input.value = selected.map(cb => cb.dataset.name).join(",");

					// Send IDs to backend
					hiddenInput.value = selected.map(cb => cb.value).join(",");
				});

				item.appendChild(checkbox);
				item.appendChild(checkboxLabel);
				dropdown.appendChild(item);
			});

			// Show dropdown on focus/click
			input.addEventListener("focus", () => {
				dropdown.style.display = "block";
			});
			input.addEventListener("click", () => {
				dropdown.style.display = "block";
			});

			// Hide dropdown when clicking outside
			document.addEventListener("click", function handleOutsideClick(e) {
				if (!wrapper.contains(e.target)) {
					dropdown.style.display = "none";
				}
			});

			wrapper.appendChild(dropdown);
			formGroup.appendChild(wrapper);
		}else if (Array.isArray(p.executiveList)) {
    		const wrapper = document.createElement("div");
  			wrapper.style.position = "relative";

    		const label = document.createElement("label");
    		label.innerText = `${p.displayLabel} (${p.dataType})${p.isMandatory ? " *" : ""}`;
    		label.htmlFor = p.paramName;
    		wrapper.appendChild(label);

    		// Visible input (shows selected names)
    		const input = document.createElement("input");
    		input.type = "text";
    		input.className = "form-control";
    		input.readOnly = true;
    		input.required = p.isMandatory;
    		wrapper.appendChild(input);

    		// Hidden input (stores IDs for backend)
    		const hiddenInput = document.createElement("input");
    		hiddenInput.type = "hidden";
    		hiddenInput.name = p.isSql ? `${p.paramName}_${p.paramOrder}` : p.paramName;
    		hiddenInput.id = p.isSql ? `${p.paramName}_${p.paramOrder}` : p.paramName;
    		wrapper.appendChild(hiddenInput);

    		// Dropdown container
    		const dropdown = document.createElement("div");
    		dropdown.className = "checkbox-dropdown";
    		dropdown.style.position = "absolute";
    		dropdown.style.top = "100%";
    		dropdown.style.left = "0";
    		dropdown.style.width = "100%";
    		dropdown.style.border = "1px solid #ccc";
    		dropdown.style.maxHeight = "200px";
    		dropdown.style.overflowY = "auto";
    		dropdown.style.backgroundColor = "white";
    		dropdown.style.zIndex = "1000";
    		dropdown.style.display = "none";

    		// Build checkbox list
    		p.executiveList.forEach(exec => {
	        	const item = document.createElement("div");
	        	item.className = "form-check";
	
	        	const checkbox = document.createElement("input");
	        	checkbox.type = "checkbox";
	        	checkbox.className = "form-check-input";
	        	checkbox.value = exec.executiveId;        // ✅ backend ID
	        	checkbox.dataset.name = exec.executiveName; // ✅ UI display name
	        	checkbox.id = `${p.paramName}_${exec.executiveId}`;
	
	        	const checkboxLabel = document.createElement("label");
	        	checkboxLabel.className = "form-check-label";
	        	checkboxLabel.innerText = exec.executiveName;
	        	checkboxLabel.htmlFor = checkbox.id;
	
	        	// Update visible + hidden inputs on selection
	        	checkbox.addEventListener("change", () => {
		            const selected = Array.from(dropdown.querySelectorAll("input:checked"));
		
		            // Show selected names in UI
		            input.value = selected.map(cb => cb.dataset.name).join(",");
		
		            // Send selected IDs to backend
		            hiddenInput.value = selected.map(cb => cb.value).join(",");
		        });
	
	       		item.appendChild(checkbox);
	        	item.appendChild(checkboxLabel);
	        	dropdown.appendChild(item);
	    	});

	    	// Show dropdown on focus/click
	    	input.addEventListener("focus", () => {
				dropdown.style.display = "block";
	    	});
			
	    	input.addEventListener("click", () => {
				dropdown.style.display = "block";
	    	});
	
	    	// Hide dropdown when clicking outside
	    	document.addEventListener("click", function handleOutsideClick(e) {
	        	if (!wrapper.contains(e.target)) {
					dropdown.style.display = "none";
	        	}
	    	});
	
	    	wrapper.appendChild(dropdown);
	    	formGroup.appendChild(wrapper);
		} else {
			// default input case (text/date/etc.)
			formGroup.appendChild(label);
			formGroup.appendChild(input);
		}
		
		colDiv.appendChild(formGroup);
		rowDiv.appendChild(colDiv);
	});
}

function validateDynamicInputs() {
	const container = document.getElementById("dynamicInputs");
	if (!container) return true;

	container.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
	container.querySelectorAll('.invalid-feedback').forEach(el => el.remove());

	let firstInvalid = null;
	let allValid = true;

	const inputs = Array.from(container.querySelectorAll('input'));

	let fromDate = null;
	let toDate = null;

	function isValidHtmlDate(value) {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

		const [year, month, day] = value.split("-").map(Number);
		const date = new Date(value);

		return (
			date.getFullYear() === year &&
			date.getMonth() === month - 1 &&
			date.getDate() === day
		);
	}

	function parseHtmlDate(value) {
		const [year, month, day] = value.split("-").map(Number);
		return new Date(year, month - 1, day);
	}

	inputs.forEach(input => {
		const required = input.hasAttribute('required') && input.required;
		if (!required) return;

		const type = (input.type || "").toLowerCase();
		let value = input.value?.trim() || "";
		let invalid = false;
		let message = "This field is required";

		if (value === "") {
			invalid = true;
			message = type === 'date' ? "Invalid date selected" : "This field is required";
		} else if (type === 'number') {
			if (isNaN(Number(value))) {
				invalid = true;
				message = "Enter a valid number";
			}
		} else if (type === 'date') {
			if (!isValidHtmlDate(value)) {
				invalid = true;
				message = "Invalid date selected";
			} else {
				if (input.id.toLowerCase().includes("from"))
					fromDate = value;
				
				if (input.id.toLowerCase().includes("to"))
					toDate = value;
			}
		}

		if (invalid) {
			allValid = false;
			input.classList.add('is-invalid');

			const feedback = document.createElement('div');
			feedback.className = 'invalid-feedback';
			feedback.innerText = message;

			if (input.parentNode) {
				input.parentNode.appendChild(feedback);
			}

			if (!firstInvalid) firstInvalid = input;

			const removeError = () => {
				input.classList.remove('is-invalid');
				const existing = input.parentNode?.querySelector('.invalid-feedback');
				if (existing) existing.remove();
				input.removeEventListener('input', removeError);
				input.removeEventListener('focus', removeError);
				input.removeEventListener('change', removeError);
			};

			input.addEventListener('input', removeError);
			input.addEventListener('focus', removeError);
			input.addEventListener('change', removeError);
		} else {
			input.classList.remove('is-invalid');
			const existing = input.parentNode?.querySelector('.invalid-feedback');
			if (existing) existing.remove();
		}
	});

	if (fromDate && toDate) {
		const from = parseHtmlDate(fromDate);
		const to = parseHtmlDate(toDate);

		if (to < from) {
			allValid = false;
			const toInput = inputs.find(input => input.id.toLowerCase().includes("to"));
			toInput.classList.add("is-invalid");

			const feedback = document.createElement("div");
			feedback.className = "invalid-feedback";
			feedback.innerText = "To Date cannot be earlier than From Date";
			toInput.parentNode.appendChild(feedback);

			if (!firstInvalid) {
				firstInvalid = toInput;
			}
		}
	}

	if (firstInvalid) {
		firstInvalid.focus();
		firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}

	return allValid;
}

function focusNextInput(currentElem, container) {
	const selector = 'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])';
	const focusables = Array.from(container.querySelectorAll(selector))
		.filter(el => el.offsetParent !== null);

	const idx = focusables.indexOf(currentElem);
	
	if (idx !== -1 && idx < focusables.length - 1) {
		focusables[idx + 1].focus();
	}
}