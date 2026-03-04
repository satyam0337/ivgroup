define([
	'marionette',
	'selectizewrapper',
	PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',
	'JsonUtility',
	'messageUtility',
	'nodvalidation',
	'focusnavigation'
],
function(Marionette, Selectizewrapper, Selection) {
	'use strict';

	let myNod = null, showTransportationMode = false, showTransportationCategory = false, showTaxType = false, groupedTaxModels = {}, otherTaxConfigs = {},
	isDuplicateTaxExist = false, selectedGroupId = null, selectedModuleTypeId = null, _this = null, modeNameMap = {}, categoryNameMap = {}, typeNameMap = {};

	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
			this.initializeNodValidation();
		}, initializeNodValidation: function() {
			myNod = nod({
				parentClass: 'validation-message',
				delay: 300,
				submit: null,
				disableSubmit: false
			});
		}, render: function() {
			const jsonObject = {};
			getJSON(jsonObject, WEB_SERVICE_URL + '/taxMasterWS/getTaxMasterElementConfiguration.do?', _this.setElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setElements: function(response) {
			if(response.message != undefined && response.message.type == MESSAGE_TYPE_ERROR)
				return;

			let loadElements = [];
			let htmlLoadDeferred = new $.Deferred();
			loadElements.push(htmlLoadDeferred);

			$('#mainContent').load('/ivcargo/html/master/taxMaster/taxMaster.html', function() {
				htmlLoadDeferred.resolve();
			});

			$.when.apply($, loadElements).done(function() {
				initialiseFocus();
				
				if(response.showAllGroupsOption) {
					response.accountGroupSelection	= response.showAllGroupsOption;
					$('#accountGroupSelection').removeClass('hide');
				}
								
				Selection.setSelectionToGetData(response);
				
				_this.taxTypes = (response.taxMasterList || []).map(function(item, idx) {
					return {
						taxMasterId: item.taxMasterId,
						taxMasterName: item.taxMasterName,
						editable: idx === 0
					};
				});

				let moduleTypeList = response.moduleTypeList || [];
				
				_this.setupBaseValidationRules();
				_this.initializeModuleTypeDropdown(moduleTypeList);
				_this.setupEventHandlers();
				hideLayer();
			}).fail(function(error) {
				showAlertMessage('error', 'Failed to load tax master configuration');
			});
		}, initializeModuleTypeDropdown: function(moduleTypeList) {
			Selectizewrapper.setAutocomplete({
				jsonResultList: moduleTypeList,
				valueField: 'moduleTypeForTaxId',
				labelField: 'moduleTypeForTaxName',
				searchField: 'moduleTypeForTaxName',
				elementId: 'moduleTypeEle',
				create: false,
				maxItems: 1,
				onInitialize: function(selectize) {
					selectize.settings.openOnFocus = false;
				}
			});
		}, setupEventHandlers: function() {
			$('#accountGroupEle').on('change', function() {
				_this.clearDropdowns(['moduleTypeEle']);
				_this.removePropertyDropdownValidations();
				_this.clearAndDestroyPropertyDropdowns();
								
				selectedGroupId = $(this).val();
				selectedModuleTypeId = null;
				_this.resetAll();
			});

			$('#moduleTypeEle').off('change').on('change', function() {
				_this.removePropertyDropdownValidations();
				_this.clearAndDestroyPropertyDropdowns();
				_this.resetAll();

				myNod.performCheck('#accountGroupEle, #moduleTypeEle');
				
				if (!myNod.areAll('valid'))
					return;
								
				selectedModuleTypeId = $(this).val();
				_this.loadGroupConfiguration();
			});
		}, clearDropdowns: function(ids) {
			ids.forEach(function(id) {
				let $el = $('#' + id);
				// Clear the selectize instance if it exists
				if ($el.length && $el[0].selectize) {
					$el[0].selectize.clear();
				}
			});
		}, clearAndDestroyPropertyDropdowns: function() {
			['transportationModeEle', 'transportationCategoryEle', 'taxTypeEle'].forEach(function(id) {
				let $el = $('#' + id);
				
				// Clear and destroy the selectize instance if it exists
				if ($el.length && $el[0].selectize) {
					$el[0].selectize.clear();
					$el[0].selectize.destroy();
					$el.removeData('selectize');
				}
			});
		}, setupBaseValidationRules: function() {
			addAutocompleteElementInNode1(myNod, 'accountGroupEle', 'Please select a Customer Group');
			addAutocompleteElementInNode1(myNod, 'moduleTypeEle', 'Please select a Module Type');
		}, setupDynamicValidationRules: function() {
			_this.removePropertyDropdownValidations();
			
			if (showTransportationMode)
				addAutocompleteElementInNode1(myNod, 'transportationModeEle', 'Please select Transportation Mode');

			if (showTransportationCategory)
				addAutocompleteElementInNode1(myNod, 'transportationCategoryEle', 'Please select Transportation Category');

			if (showTaxType)
				addAutocompleteElementInNode1(myNod, 'taxTypeEle', 'Please select Tax Type');
		}, removePropertyDropdownValidations: function() {
			['#transportationModeEle', '#transportationCategoryEle', '#taxTypeEle'].forEach(function(selector) {
				myNod.remove(selector);
			});
		}, loadGroupConfiguration: function() {
			if (!selectedGroupId || !selectedModuleTypeId) {
				_this.hideAllDropdowns();
				$('#middle-border-boxshadow').addClass('hide');
				return;
			}

			_this.resetTaxes();
			$('#middle-border-boxshadow').addClass('hide');

			showLayer();
			
			const jsonObject = {
				configAccountGroupId: selectedGroupId,
				moduleType: selectedModuleTypeId
			};
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/taxMasterWS/getGroupConfiguration.do?', _this.handleGroupConfigResponse, EXECUTE_WITHOUT_ERROR);
		},	handleGroupConfigResponse: function(response) {
			hideLayer();
			
			if(response.message != undefined && response.message.type == MESSAGE_TYPE_ERROR)
				return;
									
			showTransportationMode		= response.showTransportationMode || false;
			showTransportationCategory	= response.showTransportationCategory || false;
			showTaxType					= response.showTaxType || false;
			groupedTaxModels			= response.groupedTaxModels || {};
			otherTaxConfigs				= response.otherTaxConfigs || {};
			isDuplicateTaxExist			= response.isDuplicateTaxExist || false;
			_this.createNameMaps(response);

			let isExist	= response.isExist || false;

			if (showTransportationMode && response.transportationModeList)
				_this.initializeTransportationModeDropdown(response.transportationModeList);

			if (showTransportationCategory && response.transportationCategoryList)
				_this.initializeTransportationCategoryDropdown(response.transportationCategoryList);

			if (showTaxType && response.taxTypeList)
				_this.initializeTaxTypeDropdown(response.taxTypeList);

			_this.setupDynamicValidationRules();
			
			if (isExist) {
				_this.showRelevantDropdowns();
				_this.bindDropdownChanges();
				$('#middle-border-boxshadow').addClass('hide');
				$('#incompatibleConfigsSection').remove();
			} else
				_this.handleNormalTaxCase();
		}, initializeTransportationModeDropdown: function(transportationModeList) {
			Selectizewrapper.setAutocomplete({
				jsonResultList: transportationModeList,
				valueField: 'transportModeId',
				labelField: 'transportModeName',
				searchField: 'transportModeName',
				elementId: 'transportationModeEle',
				create: false,
				maxItems: 1,
				onInitialize: function(selectize) {
					selectize.settings.openOnFocus = false;
					selectize.settings.closeAfterSelect = true;
				}
			});
		}, initializeTransportationCategoryDropdown: function(transportationCategoryList) {
			Selectizewrapper.setAutocomplete({
				jsonResultList: transportationCategoryList,
				valueField: 'transportCategoryId',
				labelField: 'transportCategoryName',
				searchField: 'transportCategoryName',
				elementId: 'transportationCategoryEle',
				create: false,
				maxItems: 1,
				onInitialize: function(selectize) {
					selectize.settings.openOnFocus = false;
					selectize.settings.closeAfterSelect = true;
				}
			});
		}, initializeTaxTypeDropdown: function(taxTypeList) {
			Selectizewrapper.setAutocomplete({
				jsonResultList: taxTypeList,
				valueField: 'taxTypeId',
				labelField: 'taxTypeName',
				searchField: 'taxTypeName',
				elementId: 'taxTypeEle',
				create: false,
				maxItems: 1,
				onInitialize: function(selectize) {
					selectize.settings.openOnFocus = false;
					selectize.settings.closeAfterSelect = true;
				}
			});
		}, bindDropdownChanges: function() {
			$('#transportationModeEle, #transportationCategoryEle, #taxTypeEle').off('change');
			
			if (showTransportationMode) {
				$('#transportationModeEle').on('change', function() {
					_this.clearDropdowns(['transportationCategoryEle', 'taxTypeEle']);
					_this.reloadLatestTaxes();
				});
			}
			
			if (showTransportationCategory) {
				$('#transportationCategoryEle').on('change', function() {
					_this.clearDropdowns(['taxTypeEle']);
					_this.reloadLatestTaxes();
				});
			}
			
			if (showTaxType) {
				$('#taxTypeEle').on('change', function() {
					_this.reloadLatestTaxes();
				});
			}
		}, validateDropdownSelections: function() {
			myNod.performCheck();
			
			if (!myNod.areAll('valid'))
				return false;

			let selectors = [];
			if (showTransportationMode) selectors.push('#transportationModeEle');
			if (showTransportationCategory) selectors.push('#transportationCategoryEle');
			if (showTaxType) selectors.push('#taxTypeEle');

			if (selectors.length > 0) {
				myNod.performCheck(selectors.join(', '));
				return myNod.areAll('valid');
			}

			return true;
		},	setupInputValidation: function() {
			// Function to handle input validation and formatting
			const handleInput = function($input) {
				let value = $input.val();
				
				if (value) {
					let numValue = parseFloat(value) || 0;
					if (numValue > 9999.99) {
						// Restore previous valid value
						$input.val($input.data('lastValidValue') || '');
						return false;
					}
				}
				
				// Store last valid value
				$input.data('lastValidValue', value);
				return true;
			};
			
			// Function to validate and format decimal input
			const validateDecimalInput = function(value, $input) {
				let newValue = value;
				
				// 1. Allow only digits and one decimal point
				newValue = newValue.replace(/[^\d.]/g, '');
				
				// 2. Allow only one decimal point
				let decimalCount = (newValue.match(/\./g) || []).length;
				if (decimalCount > 1) {
					// Remove extra decimal points (keep only first one)
					let parts = newValue.split('.');
					newValue = parts[0] + '.' + parts.slice(1).join('');
				}
				
				// 3. Limit to 2 decimal places after decimal point
				if (newValue.includes('.')) {
					let parts = newValue.split('.');
					if (parts[1].length > 2) {
						parts[1] = parts[1].substring(0, 2);
						newValue = parts[0] + '.' + parts[1];
					}
				}
				
				// 4. Prevent multiple leading zeros
				if (newValue.startsWith('00')) {
					// Remove all leading zeros except one
					newValue = newValue.replace(/^0+/, '0');
				}
				
				// 5. Prevent multiple zeros before decimal
				if (newValue.includes('.')) {
					let parts = newValue.split('.');
					if (parts[0].length > 1 && parts[0].startsWith('0') && parts[0] !== '0') {
						// Remove leading zeros before decimal
						let newInteger = parts[0].replace(/^0+/, '');
						if (newInteger === '') newInteger = '0';
						newValue = newInteger + '.' + (parts[1] || '');
					}
				} else if (newValue.length > 1 && newValue.startsWith('0') && newValue !== '0') {
					// For whole numbers without decimal, remove leading zeros
					newValue = newValue.replace(/^0+/, '');
					if (newValue === '') newValue = '0';
				}
				
				// Update the input if value changed
				if (newValue !== value) {
					$input.val(newValue);
				}
				
				return newValue;
			};
			
			// Function to format value for display (removes .00 if whole number)
			const formatValueForDisplay = function(numValue) {
				let formattedValue = numValue.toFixed(2);
				// Remove trailing .00 if it's a whole number
				if (formattedValue.endsWith('.00')) {
					formattedValue = formattedValue.replace('.00', '');
				}
				return formattedValue;
			};
			
			// Function to calculate and update CGST/SGST values from IGST
			const updateCGSTSGSTFromIGST = function(igstVal, isTaxAmount) {
				if (isTaxAmount) {
					// For tax amount fields
					let cgstVal = (igstVal / 2).toFixed(2);
					// Remove .00 suffix if whole number
					if (cgstVal.endsWith('.00')) {
						cgstVal = cgstVal.replace('.00', '');
					}
					$('input.tax-amount-cgst').val(cgstVal).data('lastValidValue', cgstVal);
					$('input.tax-amount-sgst').val(cgstVal).data('lastValidValue', cgstVal);
				} else {
					// For least taxable amount fields
					$('input.least-taxable-cgst').val(igstVal).data('lastValidValue', igstVal);
					$('input.least-taxable-sgst').val(igstVal).data('lastValidValue', igstVal);
				}
			};
			
			// Tax amount inputs (now max 9999.99 instead of 100)
			$('input[class*="tax-amount-"]').off('input.validate').on('input.validate', function(e) {
				let $this = $(this);
				let value = $this.val();
				let isIGST = $this.hasClass('tax-amount-igst');
				
				// If field is empty and user starts typing, clear the placeholder zeros
				if ($this.data('isInitialZero') && value !== '0' && value !== '0.0' && value !== '0.00' && value.length > 0) {
					$this.removeData('isInitialZero');
				}
				
				// Validate and format the input
				value = validateDecimalInput(value, $this);
				
				// Handle the input validation
				if (!handleInput($this)) {
					return;
				}
				
				// Trigger IGST auto-calc if this is IGST input
				if (isIGST) {
					let igstVal = parseFloat($this.val()) || 0;
					// Only update if value is valid
					if (igstVal <= 9999.99) {
						updateCGSTSGSTFromIGST(igstVal, true);
					}
				}
			}).off('focus').on('focus', function() {
				let $this = $(this);
				// Store original value on focus for comparison
				$this.data('originalFocusValue', $this.val());
				// If the value is 0 or 0.00, clear it for editing
				if ($this.val() === '0' || $this.val() === '0.00' || $this.val() === '0.0') {
					$this.data('isInitialZero', true);
					$this.val('');
				}
			}).off('blur').on('blur', function() {
				let $this = $(this);
				let value = $this.val();
				let isIGST = $this.hasClass('tax-amount-igst');
				
				// Final validation on blur
				value = validateDecimalInput(value, $this);
				
				// If field is empty on blur, restore to 0
				if (value === '' && $this.data('isInitialZero')) {
					$this.val('0');
					$this.removeData('isInitialZero');
					
					if (isIGST) {
						updateCGSTSGSTFromIGST(0, true);
					}
				}
				// Format to 2 decimal places if it's a valid number
				else if (value !== '' && !isNaN(parseFloat(value))) {
					let numValue = parseFloat(value);
					// Only format if it's within limits
					if (numValue <= 9999.99) {
						let formattedValue = formatValueForDisplay(numValue);
						$this.val(formattedValue);
						$this.data('lastValidValue', formattedValue);
						
						if (isIGST) {
							updateCGSTSGSTFromIGST(numValue, true);
						}
					}
				}
			});
			
			// Minimum taxable amount inputs (max 9999.99)
			$('input[class*="least-taxable-"]').off('input.validate').on('input.validate', function(e) {
				let $this = $(this);
				let value = $this.val();
				let isIGST = $this.hasClass('least-taxable-igst');
				
				// If field is empty and user starts typing, clear the placeholder zeros
				if ($this.data('isInitialZero') && value !== '0' && value !== '0.0' && value !== '0.00' && value.length > 0) {
					$this.removeData('isInitialZero');
				}
				
				// Validate and format the input
				value = validateDecimalInput(value, $this);
				
				// Handle the input validation
				if (!handleInput($this)) {
					return;
				}
				
				// Trigger IGST auto-calc if this is IGST input
				if (isIGST) {
					let leastAmount = parseFloat($this.val()) || 0;
					// Only update if value is valid
					if (leastAmount <= 9999.99) {
						updateCGSTSGSTFromIGST(leastAmount, false);
					}
				}
			}).off('focus').on('focus', function() {
				let $this = $(this);
				// Store original value on focus for comparison
				$this.data('originalFocusValue', $this.val());
				// If the value is 0 or 0.00, clear it for editing
				if ($this.val() === '0' || $this.val() === '0.00' || $this.val() === '0.0') {
					$this.data('isInitialZero', true);
					$this.val('');
				}
			}).off('blur').on('blur', function() {
				let $this = $(this);
				let value = $this.val();
				let isIGST = $this.hasClass('least-taxable-igst');
				
				// Final validation on blur
				value = validateDecimalInput(value, $this);
				
				// If field is empty on blur, restore to 0
				if (value === '' && $this.data('isInitialZero')) {
					$this.val('0');
					$this.removeData('isInitialZero');
					
					if (isIGST) {
						updateCGSTSGSTFromIGST(0, false);
					}
				}
				// Format to 2 decimal places if it's a valid number
				else if (value !== '' && !isNaN(parseFloat(value))) {
					let numValue = parseFloat(value);
					// Only format if it's within limits
					if (numValue <= 9999.99) {
						let formattedValue = formatValueForDisplay(numValue);
						$this.val(formattedValue);
						$this.data('lastValidValue', formattedValue);
						
						if (isIGST) {
							updateCGSTSGSTFromIGST(numValue, false);
						}
					}
				}
			});
			
			// Also handle paste events
			$('input[class*="tax-amount-"], input[class*="least-taxable-"]').off('paste.validate').on('paste.validate', function(e) {
				// Get pasted data
				let pastedData = e.originalEvent.clipboardData.getData('text');
				
				// Clean and validate the pasted data
				let tempInput = $('<input>').val(pastedData);
				pastedData = validateDecimalInput(pastedData, tempInput);
				
				// Update clipboard data with cleaned value
				e.originalEvent.clipboardData.setData('text', pastedData);
				
				// Let the paste happen, then sanitize
				setTimeout(() => {
					let $this = $(this);
					
					// Clear initial zero flag if pasting
					$this.removeData('isInitialZero');
					
					// Get and clean the pasted value
					let currentValue = $this.val();
					currentValue = validateDecimalInput(currentValue, $this);
					
					let numValue = parseFloat(currentValue) || 0;
					
					// Check max value
					if (numValue > 9999.99) {
						$this.val('');
						showAlertMessage('error', 'Value cannot exceed 9999.99');
						return;
					}
					
					// Format after paste
					if (currentValue !== '' && !isNaN(numValue)) {
						let formattedValue = formatValueForDisplay(numValue);
						$this.val(formattedValue);
						$this.data('lastValidValue', formattedValue);
					}
					
					// Trigger auto-calc if needed
					if ($this.hasClass('tax-amount-igst')) {
						let igstVal = parseFloat($this.val()) || 0;
						if (igstVal <= 9999.99) {
							updateCGSTSGSTFromIGST(igstVal, true);
						}
					} else if ($this.hasClass('least-taxable-igst')) {
						let leastAmount = parseFloat($this.val()) || 0;
						if (leastAmount <= 9999.99) {
							updateCGSTSGSTFromIGST(leastAmount, false);
						}
					}
				}, 10);
			});
			
			// Initialize with 0 for both tax amount and least taxable
			$('input[class*="tax-amount-"]').each(function() {
				let $this = $(this);
				if ($this.val() === '' || $this.val() === '0.00') {
					$this.val('0');
					$this.data('isInitialZero', true);
					$this.data('lastValidValue', '0');
				}
			});
			
			$('input[class*="least-taxable-"]').each(function() {
				let $this = $(this);
				if ($this.val() === '') {
					$this.val('0');
					$this.data('isInitialZero', true);
					$this.data('lastValidValue', '0');
				}
			});
		}, handleNormalTaxCase: function() {
			let baseKey		= _this.getCurrentBaseKey();
			let seqGroups	= _this.getSequenceGroups(baseKey);
			
			let hasAnyTaxes = seqGroups.some(function(key) {
				return groupedTaxModels[key] && groupedTaxModels[key].length > 0;
			});

			$('#middle-border-boxshadow').removeClass('hide');
			_this.showRelevantDropdowns();
			
			if (hasAnyTaxes)
				_this.renderMultiChargesTableWithButtons(seqGroups);
			else
				_this.renderNoTaxesChargesTable();

			_this.handleIncompatibleConfigsDisplay();
		}, renderMultiChargesTableWithButtons: function(keys) {
			let container = $('#taxGroupContainers').empty();

			let key = keys[0];
			let taxList = groupedTaxModels[key] || [];

			let $groupDiv = $('<div class="tax-group mb-5"></div>');
			let $table = $('<table class="table table-bordered table-hover"></table>');
			
			$table.append(
				'<thead class="bg-light text-center"><tr>' +
				'<th class="col-1">Sr No.</th>' +
				'<th class="col-4">Tax Name</th>' +
				'<th class="col-3">Tax Amount(%)</th>' +
				'<th class="col-4">Minimum Taxable Amount</th>' +
				'</tr></thead>'
			);

			let $tbody = $('<tbody></tbody>');
			_this.fillTaxRowsWithActions(taxList, $tbody);
			$table.append($tbody);
			$groupDiv.append($table);
			container.append($groupDiv);

			_this.renderActionButtons(taxList);
		},		fillTaxRowsWithActions: function(taxList, $tbody) {
			let len = _this.taxTypes.length;
			
			for (let i = len-1; i >= 0; i--) {
				let type = _this.taxTypes[i];
				let isIGST = type.taxMasterId == IGST_MASTER_ID;
				let taxEntry = taxList.find(function(t) { return t.taxMasterId === type.taxMasterId; });

				let $row = $('<tr></tr>')
					.append($('<td></td>').addClass('text-center').text(len - i))
					.append($('<td></td>').addClass('text-center').text(type.taxMasterName));

				// Tax Amount input
				let $taxAmountCell = $('<td></td>').addClass('text-center');
				let taxAmountValue = '0';
				
				if (taxEntry && taxEntry.taxAmount !== null && taxEntry.taxAmount !== undefined) {
					let taxAmountNum = parseFloat(taxEntry.taxAmount);
					if (taxAmountNum === 0) {
						taxAmountValue = '0';
					} else {
						// Format to 2 decimal places, removing trailing .00 if whole number
						taxAmountValue = taxAmountNum.toFixed(2);
						if (taxAmountValue.endsWith('.00')) {
							taxAmountValue = taxAmountValue.replace('.00', '');
						}
					}
				}
				
				let $taxAmountInput = $('<input type="text" class="form-control text-center" inputmode="decimal">')
					.val(taxAmountValue)
					.prop('readonly', !isIGST)
					.prop('disabled', !isIGST)
					.addClass('tax-amount-' + type.taxMasterName.toLowerCase());
				
				// Add pattern attribute for mobile keyboards
				$taxAmountInput.attr('pattern', '^\\d*\\.?\\d{0,2}$');
				
				if (isIGST) {
					$taxAmountInput.data('original-value', taxAmountValue);
					$taxAmountInput.data('isInitialZero', taxAmountValue === '0' || taxAmountValue === '0.00');
				} else {
					$taxAmountInput.addClass('bg-light text-muted');
					$taxAmountInput.data('isInitialZero', taxAmountValue === '0' || taxAmountValue === '0.00');
				}
				
				$taxAmountCell.append($taxAmountInput);
				$row.append($taxAmountCell);

				// Minimum Taxable Amount input
				let $leastTaxableCell = $('<td></td>').addClass('text-center');
				let leastTaxableValue = '0';
				
				if (taxEntry && taxEntry.leastTaxableAmount !== null && taxEntry.leastTaxableAmount !== undefined) {
					let leastTaxableNum = parseFloat(taxEntry.leastTaxableAmount);
					if (leastTaxableNum === 0) {
						leastTaxableValue = '0';
					} else {
						// Format to 2 decimal places, removing trailing .00 if whole number
						leastTaxableValue = leastTaxableNum.toFixed(2);
						if (leastTaxableValue.endsWith('.00')) {
							leastTaxableValue = leastTaxableValue.replace('.00', '');
						}
					}
				}
				
				let $leastTaxableInput = $('<input type="text" class="form-control text-center" inputmode="decimal">')
					.val(leastTaxableValue)
					.prop('readonly', !isIGST)
					.prop('disabled', !isIGST)
					.addClass('least-taxable-' + type.taxMasterName.toLowerCase());
				
				// Add pattern attribute for mobile keyboards
				$leastTaxableInput.attr('pattern', '^\\d*\\.?\\d{0,2}$');
				
				if (isIGST) {
					$leastTaxableInput.data('original-value', leastTaxableValue);
					$leastTaxableInput.data('isInitialZero', leastTaxableValue === '0' || leastTaxableValue === '0.00');
				} else {
					$leastTaxableInput.addClass('bg-light text-muted');
					$leastTaxableInput.data('isInitialZero', leastTaxableValue === '0' || leastTaxableValue === '0.00');
				}
				
				$leastTaxableCell.append($leastTaxableInput);
				$row.append($leastTaxableCell);

				$tbody.append($row);
			}
			
			// Setup validation after adding inputs
			setTimeout(() => _this.setupInputValidation(), 0);
		}, renderActionButtons: function(taxList) {
			let $actionButtons = $('#taxActionButtons').empty();
			
			if (taxList && taxList.length > 0) {
				$actionButtons.append(
					$('<button></button>')
						.addClass('btn btn-primary btn-sm me-2')
						.text('Update')
						.click(function(e) {
							e.preventDefault();
							e.stopPropagation();
							
							if (isDuplicateTaxExist) {
								showAlertMessage('error', 'Duplicate Tax already exists, Can Cause Unnecessary Behaviour');
								return;
							}
							_this.updateTaxes();
						})
				).append(
					$('<button></button>')
						.addClass('btn btn-danger btn-sm')
						.text('Deactivate')
						.click(function(e) {
							e.preventDefault();
							e.stopPropagation();
							
							if (isDuplicateTaxExist) {
								showAlertMessage('error', 'Duplicate Tax already exists, Can Cause Unnecessary Behaviour');								
								return;
							}

							if (confirm('Are you sure you want to delete this tax group?'))
								_this.deactivateTaxes();
						})
				);
			} else {
				$actionButtons.append(
					$('<button></button>').addClass('btn btn-success btn-sm').text('Apply')
						.click(function(e) {
							e.preventDefault();
							e.stopPropagation();
							
							if (isDuplicateTaxExist) {
								showAlertMessage('error', 'Tax already exists in different selection');								
								return;
							}
							
							_this.saveTaxes();
						})
				);
			}
		},	updateTaxes: function() {
			let igstInput = $('input.tax-amount-igst');
			let leastTaxableInput = $('input.least-taxable-igst');
			
			// Final validation before processing
			let igstVal = parseFloat(igstInput.val()) || 0;
			let leastTaxableAmount = parseFloat(leastTaxableInput.val()) || 0;
			let originalIgst = parseFloat(igstInput.data('original-value')) || 0;
			let originalLeastTaxable = parseFloat(leastTaxableInput.data('original-value')) || 0;
			
			// Check if values exceed max limits - BOTH now up to 9999.99
			if (igstVal > 9999.99) {
				showAlertMessage('error', 'Tax Amount cannot exceed 9999.99');
				return;
			}
			
			if (leastTaxableAmount > 9999.99) {
				showAlertMessage('error', 'Minimum Taxable Amount cannot exceed 9999.99');
				return;
			}
			
			if (igstVal <= 0 || isNaN(igstVal)) {
				showAlertMessage('error', 'Please enter a valid IGST amount greater than 0');
				return;
			}
			
			if (leastTaxableAmount < 0 || isNaN(leastTaxableAmount)) {
				showAlertMessage('error', 'Please enter a valid Least Taxable Amount');
				return;
			}
			
			// Check if ANY field has changed (not just IGST)
			let hasChanged = false;
			
			// Check if IGST changed
			if (igstVal !== originalIgst) {
				hasChanged = true;
			}
			
			// Check if Least Taxable Amount changed
			if (leastTaxableAmount !== originalLeastTaxable) {
				hasChanged = true;
			}
			
			// If nothing changed, show error
			if (!hasChanged) {
				showAlertMessage('error', 'Cannot update - No changes detected. Please modify at least one field before updating.');
				return;
			}

			showLayer();
			getJSON(_this.getObjectForSave(), WEB_SERVICE_URL + '/taxMasterWS/updateTaxes.do?', _this.handleUpdateTaxesResponse, EXECUTE_WITHOUT_ERROR);
		},	getObjectForSave : function() {
			let igstInput = $('input.tax-amount-igst');
			let igstVal = parseFloat(igstInput.val()) || 0;
			let leastTaxableInput = $('input.least-taxable-igst');
			let leastTaxableAmount = parseFloat(leastTaxableInput.val()) || 0;
			
			// Format values properly with 2 decimal places
			let cgstVal = (igstVal / 2).toFixed(2);
			let sgstVal = (igstVal / 2).toFixed(2);
			let formattedLeastTaxable = leastTaxableAmount.toFixed(2);
			
			const jsonObject = {
				igst: igstVal.toFixed(2),  // Format to 2 decimal places
				cgst: cgstVal,
				sgst: sgstVal,
				leastTaxableAmount: formattedLeastTaxable,	// Format to 2 decimal places
				configAccountGroupId: selectedGroupId,
				moduleType: selectedModuleTypeId,
				transportationModeId: $('#transportationModeEle').val(),
				transportationCategoryId: $('#transportationCategoryEle').val(),
				taxTypeId: $('#taxTypeEle').val()
			};
							
			return jsonObject;
		}, handleUpdateTaxesResponse: function(response) {
			hideLayer();
			
			if(response.message != undefined && response.message.type == MESSAGE_TYPE_ERROR) {
				showAlertMessage('error', response.message.description);
				return;
			}
			
			if (response.message != undefined && response.message.type == MESSAGE_TYPE_SUCCESS) {
				showAlertMessage('success', response.message.description);
				refreshCache(TAX_MASTER_FOR_GROUP, selectedGroupId);
				_this.reloadLatestTaxes();
			} else {
				showAlertMessage('error', response.message || 'Update failed');
			}
		},		saveTaxes: function() {
			let igstInput = $('input.tax-amount-igst');
			let leastTaxableInput = $('input.least-taxable-igst');
			
			let igstVal = parseFloat(igstInput.val()) || 0;
			let leastTaxableAmount = parseFloat(leastTaxableInput.val()) || 0;
			
			// Check if values exceed max limits - BOTH now up to 9999.99
			if (igstVal > 9999.99) {
				showAlertMessage('error', 'Tax Amount cannot exceed 9999.99');
				return;
			}
			
			if (leastTaxableAmount > 9999.99) {
				showAlertMessage('error', 'Minimum Taxable Amount cannot exceed 9999.99');
				return;
			}
			
			if (igstVal <= 0 || isNaN(igstVal)) {
				showAlertMessage('error', 'Please enter a valid IGST amount greater than 0');
				return;
			}
			
			if (leastTaxableAmount < 0 || isNaN(leastTaxableAmount)) {
				showAlertMessage('error', 'Please enter a valid Minimum Taxable Amount');
				return;
			}

			showLayer();
			getJSON(_this.getObjectForSave(), WEB_SERVICE_URL + '/taxMasterWS/saveTaxes.do?', _this.handleSaveTaxesResponse, EXECUTE_WITHOUT_ERROR);
		}, handleSaveTaxesResponse: function(response) {
			hideLayer();
			
			if (response.message != undefined && response.message.type == MESSAGE_TYPE_SUCCESS) {
				refreshCache(TAX_MASTER_FOR_GROUP, selectedGroupId);
				_this.reloadLatestTaxes();
			}
		}, deactivateTaxes: function() {
			showLayer();
			getJSON(_this.getObjectForSave(), WEB_SERVICE_URL + '/taxMasterWS/deactivateTaxes.do?', _this.handleDeactivateTaxesResponse, EXECUTE_WITHOUT_ERROR);
		}, handleDeactivateTaxesResponse: function(response) {
			hideLayer();
			
			if (response.message != undefined && response.message.type == MESSAGE_TYPE_SUCCESS) {
				refreshCache(TAX_MASTER_FOR_GROUP, selectedGroupId);
				_this.reloadLatestTaxes();
			}
		}, reloadLatestTaxes: function() {
			if (!_this.validateDropdownSelections()) return;
			
			showLayer();
			
			getJSON(_this.getObjectForSave(), WEB_SERVICE_URL + '/taxMasterWS/getTaxes.do?', _this.handleReloadTaxesResponse, EXECUTE_WITHOUT_ERROR);
		},	handleReloadTaxesResponse: function(response) {
			hideLayer();
			
			if(response.message != undefined && response.message.type == MESSAGE_TYPE_ERROR)
				return;
										
			groupedTaxModels		= response.groupedTaxModels || {};
			isDuplicateTaxExist		= response.isDuplicateTaxExist || false;
			
			// ADD THIS LINE: Store incompatible configs
			otherTaxConfigs			= response.otherTaxConfigs || {};
			
			let baseKey		= _this.getCurrentBaseKey();
			let seqGroups	= _this.getSequenceGroups(baseKey);
			
			if ($('#middle-border-boxshadow').hasClass('hide')) {
				$('#middle-border-boxshadow').removeClass('hide');
			}
			
			let hasAnyTaxes = seqGroups.some(function(key) {
				return groupedTaxModels[key] && groupedTaxModels[key].length > 0;
			});

			if (hasAnyTaxes)
				_this.renderMultiChargesTableWithButtons(seqGroups);
			else
				_this.renderNoTaxesChargesTable();

			_this.handleIncompatibleConfigsDisplay();
		},	getSequenceGroups: function(baseKey) {
			let out = [];
			// Just use the baseKey as-is (no seqGroup in key)
			if (groupedTaxModels.hasOwnProperty(baseKey)) {
				out.push(baseKey);
			}
			return out;
		}, showRelevantDropdowns: function() {
			$('[data-attribute=transportationMode]').toggleClass('hide', !showTransportationMode);
			$('[data-attribute=transportationCategory]').toggleClass('hide', !showTransportationCategory);
			$('[data-attribute=taxType]').toggleClass('hide', !showTaxType);
		}, hideAllDropdowns: function() {
			$('[data-attribute=transportationMode]').addClass('hide');
			$('[data-attribute=transportationCategory]').addClass('hide');
			$('[data-attribute=taxType]').addClass('hide');
		}, resetTaxes: function() {
			$('#taxGroupContainers').empty();
			$('#taxActionButtons').empty();
			$('#incompatibleConfigsSection').remove();
		}, resetAll: function() {
			_this.resetTaxes();
			_this.hideAllDropdowns();
			$('#middle-border-boxshadow').addClass('hide');
			$('#incompatibleConfigsSection').remove();
		},	renderNoTaxesChargesTable: function() {
			let $container = $('#taxGroupContainers').empty();
			let $table = $('<table class="table table-bordered table-hover"></table>');
			
			$table.append(
				'<thead class="bg-light text-center"><tr>' +
				'<th class="col-1">Sr No.</th>' +
				'<th class="col-4">Tax Name</th>' +
				'<th class="col-3">Tax Amount (%)</th>' +
				'<th class="col-4">Minimum Taxable Amount</th>' +
				'</tr></thead><tbody>'
			);

			let $tbody = $('<tbody></tbody>');
			
			for (let i = _this.taxTypes.length - 1; i >= 0; i--) {
				let type = _this.taxTypes[i];
				let isIGST = type.taxMasterId == IGST_MASTER_ID;
				
				let $row = $('<tr></tr>')
					.append($('<td></td>').addClass('text-center').text(_this.taxTypes.length - i))
					.append($('<td></td>').addClass('text-center').text(type.taxMasterName));

				let $taxAmountCell = $('<td></td>').addClass('text-center');
				let $taxAmountInput = $('<input type="text" class="form-control text-center" inputmode="decimal">')
					.val('0')
					.prop('readonly', !isIGST)
					.prop('disabled', !isIGST)
					.addClass('tax-amount-' + type.taxMasterName.toLowerCase());
				
				// Add pattern attribute
				$taxAmountInput.attr('pattern', '^\\d*\\.?\\d{0,2}$');
				
				if (!isIGST) {
					$taxAmountInput.addClass('bg-light text-muted');
				}
				
				$taxAmountInput.data('isInitialZero', true);
				$taxAmountInput.data('lastValidValue', '0');
				
				$taxAmountCell.append($taxAmountInput);
				$row.append($taxAmountCell);

				let $leastTaxableCell = $('<td></td>').addClass('text-center');
				let $leastTaxableInput = $('<input type="text" class="form-control text-center" inputmode="decimal">')
					.val('0')
					.prop('readonly', !isIGST)
					.prop('disabled', !isIGST)
					.addClass('least-taxable-' + type.taxMasterName.toLowerCase());
				
				// Add pattern attribute
				$leastTaxableInput.attr('pattern', '^\\d*\\.?\\d{0,2}$');
				
				if (!isIGST) {
					$leastTaxableInput.addClass('bg-light text-muted');
				}
				
				$leastTaxableInput.data('isInitialZero', true);
				$leastTaxableInput.data('lastValidValue', '0');
				
				$leastTaxableCell.append($leastTaxableInput);
				$row.append($leastTaxableCell);

				$tbody.append($row);
			}

			$table.append($tbody);
			$container.append($table);

			_this.renderActionButtons(null);
			
			// Setup validation after rendering
			setTimeout(() => _this.setupInputValidation(), 0);
		}, showIncompatibleConfigsSection: function() {
			// Check before creating
			const hasIncompatibleConfigs = otherTaxConfigs && 
										   Object.keys(otherTaxConfigs).length > 0;
			
			if (!hasIncompatibleConfigs) {
				$('#incompatibleConfigsSection').remove();
				return;
			}
			
			// Count total incompatible tax sets
			let totalIncompatibleSets = 0;
			$.each(otherTaxConfigs, function(configKey, seqGroups) {
				$.each(seqGroups, function(seqKey, taxList) {
					if (taxList.length >= 3) totalIncompatibleSets++;
				});
			});
			
			// Create SLIDABLE section with fixed height and scroll
			const $section = $(`
				<div id="incompatibleConfigsSection" class="card marginTop20px">
					<div class="card-header text-center bg-warning text-dark d-flex justify-content-between align-items-center">
						<div>
							<h5 class="mb-0"><b>⚠️ Incompatible Tax Configurations (${totalIncompatibleSets})</b></h5>
							<small class="text-muted">These tax sets don't match the current pattern</small>
						</div>
						<button class="btn btn-sm btn-outline-dark toggle-slide-btn" title="Expand/Collapse">
							<i class="glyphicon glyphicon-resize-vertical"></i>
						</button>
					</div>
					<div class="card-body p-2" id="incompatibleConfigsBody" style="max-height: 300px; overflow-y: auto;">
						<!-- Config cards will be rendered here -->
					</div>
				</div>
			`);
			
			// Add toggle functionality
			$section.find('.toggle-slide-btn').click(function() {
				const $body = $section.find('#incompatibleConfigsBody');
				const $icon = $(this).find('i');
				
				if ($body.css('max-height') === '300px') {
					$body.css('max-height', '600px'); // Expand
					$icon.removeClass('glyphicon-resize-vertical').addClass('glyphicon-resize-small');
					$(this).attr('title', 'Collapse');
				} else {
					$body.css('max-height', '300px'); // Collapse
					$icon.removeClass('glyphicon-resize-small').addClass('glyphicon-resize-vertical');
					$(this).attr('title', 'Expand');
				}
			});
			
			$('#middle-border-boxshadow').after($section);
		}, renderIncompatibleConfigsCards: function() {
			const $body = $('#incompatibleConfigsBody').empty();
			if (!otherTaxConfigs || Object.keys(otherTaxConfigs).length === 0) return;
			
			let configCount = 1;
			
			$.each(otherTaxConfigs, function(configKey, seqGroups) {
				$.each(seqGroups, function(seqKey, taxList) {
					if (taxList.length < 3) return true;
					
					// UNIVERSAL PARSER - handles both Booking (3 parts) and Invoice (2 parts)
					let mode = 0, category = 0, type = 0;
					let isInvoiceTax = false;
					
					const parts = configKey.split('|');
					for (let i = 0; i < parts.length; i++) {
						const part = parts[i];
						if (part.startsWith('mode:')) {
							mode = parseInt(part.substring(5)) || 0;
						} else if (part.startsWith('category:')) {
							category = parseInt(part.substring(9)) || 0;
						} else if (part.startsWith('type:')) {
							type = parseInt(part.substring(5)) || 0;
						}
					}
					
					// Detect if this is Invoice tax (no category dimension)
					isInvoiceTax = selectedModuleTypeId == 2; 
					
					// Get sample tax
					const sampleTax = taxList[0];
					
					// USE NAME MAPS FOR DISPLAY (ADDED THIS SECTION)
					const modeName = modeNameMap[mode] || `ID:${mode}`;
					const categoryName = categoryNameMap[category] || `ID:${category}`;
					const typeName = typeNameMap[type] || `ID:${type}`;
					
					// Build display text with NAMES instead of IDs
					let dimensionText = '';
					if (isInvoiceTax) {
						dimensionText = `Mode: ${modeName} (${mode}) | Type: ${typeName} (${type})`;
					} else {
						dimensionText = `Mode: ${modeName} (${mode}) | Category: ${categoryName} (${category}) | Type: ${typeName} (${type})`;
					}
					
					// Create card
					const cardHtml = `
						<div class="mb-3 p-3 border rounded incompatible-config-card" 
							 data-mode="${mode}" 
							 data-category="${category}"
							 data-type="${type}"
							 data-is-invoice="${isInvoiceTax}"
							 data-sample='${JSON.stringify(sampleTax)}'>
							<div class="d-flex justify-content-between align-items-start mb-2">
								<div>
									<h6 class="text-danger mb-1">Tax Configuration ${configCount++}</h6>
									<small class="text-muted">${dimensionText}</small>
								</div>
								<button class="btn btn-danger btn-sm deactivate-config-btn">
									<i class="glyphicon glyphicon-trash"></i> Remove
								</button>
							</div>
							<div class="table-responsive">
								<table class="table table-sm table-bordered mb-0">
									<thead class="bg-light">
										<tr>
											<th class="text-center">Tax</th>
											<th class="text-center">Amount (%)</th>
											<th class="text-center">Min Amount</th>
										</tr>
									</thead>
									<tbody>
										${taxList.map(tax => `
											<tr>
												<td class="text-center">${_this.getTaxNameById(tax.taxMasterId)}</td>
												<td class="text-center">${parseFloat(tax.taxAmount || 0).toFixed(2)}</td>
												<td class="text-center">${parseFloat(tax.leastTaxableAmount || 0).toFixed(2)}</td>
											</tr>
										`).join('')}
									</tbody>
								</table>
							</div>
						</div>
					`;
					
					$body.append(cardHtml);
				});
			});
		}, bindIncompatibleConfigEvents: function() {
			// Remove existing handlers
			$('#incompatibleConfigsBody').off('click', '.deactivate-config-btn');
			
			// Add new handler
			$('#incompatibleConfigsBody').on('click', '.deactivate-config-btn', function(e) {
				e.preventDefault();
				e.stopPropagation();
				
				const $btn = $(this);
				const $card = $btn.closest('.incompatible-config-card');
				const mode = $card.data('mode');
				const category = $card.data('category');
				const type = $card.data('type');
				const sampleTax = $card.data('sample');
				
				if (confirm('Are you sure you want to remove this incompatible tax configuration?')) {
					_this.deactivateIncompatibleConfig(mode, category, type, sampleTax);
				}
			});
		}, deactivateIncompatibleConfig: function(mode, category, type, sampleTax) {
			showLayer();
			const $card = $(`.incompatible-config-card[data-mode="${mode}"][data-category="${category}"][data-type="${type}"]`);
			  $card.remove();
			  
			if ($('.incompatible-config-card').length === 0) {
				_this.clearIncompatibleConfigsSection();
			}
			
			// Use existing deactivateTaxes endpoint
			const jsonObject = {
				configAccountGroupId: selectedGroupId,
				moduleType: selectedModuleTypeId,
				transportationModeId: mode,
				transportationCategoryId: category,
				taxTypeId: type,
				igst: sampleTax.taxMasterId === 4 ? sampleTax.taxAmount : 0,
				cgst: sampleTax.taxMasterId === 3 ? sampleTax.taxAmount : 0,
				sgst: sampleTax.taxMasterId === 2 ? sampleTax.taxAmount : 0,
				leastTaxableAmount: sampleTax.leastTaxableAmount || 0
			};
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/taxMasterWS/deactivateTaxes.do?', _this.handleDeactivateConfigResponse, EXECUTE_WITHOUT_ERROR);
		}, handleDeactivateConfigResponse: function(response) {
			hideLayer();
			
			if(response.message != undefined && response.message.type == MESSAGE_TYPE_ERROR) {
				showAlertMessage('error', response.message.description);
				return;
			}
			
			if (response.message != undefined && response.message.type == MESSAGE_TYPE_SUCCESS) {
				showAlertMessage('success', response.message.description);
				refreshCache(TAX_MASTER_FOR_GROUP, selectedGroupId);
				_this.reloadLatestTaxes();
			} else {
				showAlertMessage('error', response.message || 'Deactivation failed');
			}
		}, getCurrentBaseKey: function() {
			const mode = $('#transportationModeEle').val() || '0';
			const type = $('#taxTypeEle').val() || '0';
			
			const isInvoice = selectedModuleTypeId == 2; 
			
			if (isInvoice) {
				// Invoice: mode + type only
				return `mode:${mode}|type:${type}`;
			} else {
				// Booking: mode + category + type
				const category = $('#transportationCategoryEle').val() || '0';
				return `mode:${mode}|category:${category}|type:${type}`;
			}
		}, handleIncompatibleConfigsDisplay: function() {
			// Remove previous section
			$('#incompatibleConfigsSection').remove();
			
			// Check if we have incompatible configs
			const hasIncompatibleConfigs = otherTaxConfigs && Object.keys(otherTaxConfigs).length > 0;
			
			if (!hasIncompatibleConfigs) {
				return; // Nothing to show
			}
			
			// Create and show section
			_this.showIncompatibleConfigsSection();
			_this.renderIncompatibleConfigsCards();
			_this.bindIncompatibleConfigEvents();
		}, getTaxNameById: function(taxMasterId) {
			if (taxMasterId == 4) return 'IGST';
			if (taxMasterId == 3) return 'CGST';
			if (taxMasterId == 2) return 'SGST';
			return 'Tax ' + taxMasterId;
		},	clearIncompatibleConfigsSection: function() {
			// Remove all incompatible config sections
			$('.incompatible-config-section').remove();
			$('#incompatibleConfigsSection').remove();
			$('#incompatibleConfigsBody').empty();
		}, createNameMaps: function(response) {
			// Reset maps
			modeNameMap = {};
			categoryNameMap = {};
			typeNameMap = {};
			
			// Build mode map
			if (response.transportationModeList && Array.isArray(response.transportationModeList)) {
				response.transportationModeList.forEach(function(mode) {
					modeNameMap[mode.transportModeId] = mode.transportModeName || mode.displayName || mode.shortName;
				});
			}
			
			// Build category map  
			if (response.transportationCategoryList && Array.isArray(response.transportationCategoryList)) {
				response.transportationCategoryList.forEach(function(category) {
					categoryNameMap[category.transportCategoryId] = category.transportCategoryName;
				});
			}
			
			// Build type map
			if (response.taxTypeList && Array.isArray(response.taxTypeList)) {
				response.taxTypeList.forEach(function(type) {
					typeNameMap[type.taxTypeId] = type.taxTypeName;
				});
			}

			// Add default "None" for 0
			modeNameMap[0] = "None";
			categoryNameMap[0] = "None";
			typeNameMap[0] = "None";
		}
	});
});