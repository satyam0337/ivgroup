define([ 
		'marionette'
		,'/ivcargo/resources/js/generic/urlparameter.js'
		,'selectizewrapper'
		,'JsonUtility'
		,'messageUtility'
		,'nodvalidation'
		,'focusnavigation'
		,'/ivcargo/resources/js/module/redirectAfterUpdate.js'
	], function(Marionette, UrlParameter, Selectizewrapper) {
	'use strict';// this basically give strictness to this specific js
	let jsonObject	= new Object(),
	wayBillId, previousFormTypesIds, myNod,
	selectMaxItems = 15, formsWithSingleSlection,
	isUpdateWaybillFormType	 = true, formsWithNumberHM	= null, groupConfigurationConfig = null,
	validEwabill = true, formNumerString	= null, isPrevEwaybillsAvailable = false,
	showCheckForRemoveOldFormType =false, _this = '', sourceBranchId  = 0;
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(){
			//initialize is the first function called on call new view()
			_this = this;
			wayBillId				= UrlParameter.getModuleNameFromParam('wayBillId');
			previousFormTypesIds	= UrlParameter.getModuleNameFromParam('formTypeIds');
			
			jsonObject.waybillId	= wayBillId;
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/updateWayBillFormTypeWS/getDetailsToUpdate.do?', _this.renderUpdateWayBillFormType, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, renderUpdateWayBillFormType : function(response) {
			if(response.message != undefined) {
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				
				setTimeout(() => {
					window.close();
				}, 1000);
				
				return;
			}
			
			let loadelement = new Array();
			let baseHtml	= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/waybill/update/updateWayBillFormType.html", function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				formsWithSingleSlection		= response.FormsWithSingleSlection;
				formsWithNumberHM			= response.formsWithNumberHM;
				groupConfigurationConfig		= response.groupConfigurationConfig;
				showCheckForRemoveOldFormType	= groupConfigurationConfig.showCheckForRemoveOldFormType;
				sourceBranchId					= response.sourceBranchId;
				isPrevEwaybillsAvailable		= response.isPrevEwaybillsAvailable;
				
				if(formsWithSingleSlection)
					selectMaxItems	= 1;
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	:	response.FormTypeForGroup,
					valueField		:	'formTypeMasterId',
					labelField		:	'formTypeName',
					searchField		:	'formTypeName',
					elementId		:	'formTypes',
					create			:	false,
					onChange		:	_this.displayOtherFeildOnChange,
					maxItems		:	selectMaxItems
				});
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector		: '#formTypes',
					validate		: 'validateAutocomplete:#formTypes',
					errorMessage	: 'Select Form Type !'
				});
				
				hideLayer();
				
				_this.displayOtherFeildOnChange();

				$('#formNumber0').keypress(function(event) {
					_this.validateFormType(event);
				});

				$("#addNewRow").click(function() {
					_this.addNewRow(true);
				});
				
				$("#btRemove").click(function() {
					_this.removeLastRow();
				});
				
				if(showCheckForRemoveOldFormType) {
					if(previousFormTypesIds != 0)
						$('#isCheckForDiv').removeClass('hide');
					
					$("#isCheckForDelete").click(function() {
						_this.checkForDelete();
					});
				}
								
				$(".saveBtn").click(function() {
					myNod.performCheck();
					
					if(isUpdateWaybillFormType) {
						if(myNod.areAll('valid')) {
							if($('#formTypes').val() == E_WAYBILL_ID)
								_this.getFormNumberValue();
							
							if(validEwabill) {
								if(groupConfigurationConfig.validateEwaybillNumberByApi != undefined && groupConfigurationConfig.validateEwaybillNumberByApi
									&& $('#formTypes').val() == E_WAYBILL_ID)
									_this.validateEwaybillData(_this);
								else
									_this.updateFormType(_this);
							}
						}
					} else if(formsWithSingleSlection) {
						if($('#formTypes').val() == E_WAYBILL_ID)
							showMessage('error', eWaybillNumberLenErrMsg);
						else if($('#formTypes').val() == E_SUGAM_NO_ID && groupConfigurationConfig.validateESugamNumberInput)
							showMessage('error', eSugamNumberLenErrMsg);
						else if($('#formTypes').val() == HSN_CODE)
							showMessage('error', hsnCodeErrorMsg);
					} else {
						let formTypeArr		= ($('#formTypes').val()).split(',');
							
						if(isValueExistInArray(formTypeArr, E_WAYBILL_ID))
							showMessage('error', eWaybillNumberLenErrMsg);
						else if(isValueExistInArray(formTypeArr, E_SUGAM_NO_ID) && groupConfigurationConfig.validateESugamNumberInput)
							showMessage('error', eSugamNumberLenErrMsg);
					}
				});
			});
		}, displayOtherFeildOnChange : function() {
			isUpdateWaybillFormType	= true;
			
			let formTypeArr		= ($('#formTypes').val()).split(',');

			let ewayBillArr 	= formTypeArr.filter(function (el) { return el == E_WAYBILL_ID; });
			let sugamNumberArr	= formTypeArr.filter(function (el) { return el == E_SUGAM_NO_ID; });
			let sacCodeArr		= formTypeArr.filter(function (el) { return el == SAC_CODE; });
			let hsnCodeArr		= formTypeArr.filter(function (el) { return el == HSN_CODE; });
			let formNumberArr	= formTypeArr.filter(function (el) { return el == WAY_BILL_FORM_ID || el == WAYBILL_AND_CC_ID; });
			
			if(ewayBillArr.length == 0) {
				myNod.remove('#formNumber0');
				$("*[data-attribute='formNumberLabel']").addClass("hide");
				$("*[data-attribute='addNewRowEwayBillNumber']").addClass("hide");
			} else if(ewayBillArr.length > 0) {
				addElementToCheckEmptyInNode(myNod, 'formNumber0', 'Insert Form Number !');
				$("*[data-attribute='addNewRowEwayBillNumber']").removeClass("hide");
				isUpdateWaybillFormType	= true;
			}
			
			if(sacCodeArr.length == 0) {
				myNod.remove('#sacNumber');
				$("*[data-attribute='sacNumberDiv']").addClass("hide");
			} else if(sacCodeArr.length > 0) {
				addElementToCheckEmptyInNode(myNod, 'sacNumber', 'Insert SAC Number !');
				$("*[data-attribute='sacNumberDiv']").removeClass("hide");
				isUpdateWaybillFormType	= true;
			}
			
			if(hsnCodeArr.length == 0) {
				myNod.remove('#hsnNumber');
				$("*[data-attribute='hsnNumberDiv']").addClass("hide");
			} else if(hsnCodeArr.length > 0) {
				addElementToCheckEmptyInNode(myNod, 'hsnNumber', 'Insert HSN Number !');
				$("*[data-attribute='hsnNumberDiv']").removeClass("hide");
				isUpdateWaybillFormType	= true;
			}
			
			if(sugamNumberArr.length == 0) {
				myNod.remove('#sugamNumber');
				$("*[data-attribute='sugamNumberDiv']").addClass("hide");
			} else if(sugamNumberArr.length > 0 && groupConfigurationConfig.validateESugamNumberInput) {
				addElementToCheckEmptyInNode(myNod, 'sugamNumber', 'Insert E-Sugam Number !');
				$("*[data-attribute='sugamNumberDiv']").removeClass("hide");
				isUpdateWaybillFormType	= false;
			}
			
			if(formNumberArr.length == 0) {
				$("*[data-attribute='otherFormNumberDiv']").addClass("hide");
			} else if(formNumberArr.length > 0) {
				$("*[data-attribute='otherFormNumberDiv']").removeClass("hide");
				isUpdateWaybillFormType	= true;
			}
			
			_this.setFormNumberValue();
		}, validateEwaybillData : function() {
			_this.validateEwayBillNumberByApi();
		}, validateEwayBillNumberByApi : function() {
			let checkBoxArray	= new Array();
			let inputCount = $('.formNumberDiv').length;

			for(let i = 0; i < inputCount; i++) {
				let ewaybillVal		= $('#formNumber' + i).val();
					
				if(ewaybillVal == null || ewaybillVal == undefined || ewaybillVal == '')
					continue;
					
				if(ewaybillVal.length != 12) {
					showMessage('error', '<i class="fa fa-times-circle"></i> Enter 12 digit E-Way Bill Number');
					validEwabill	= false;
					return;
				}
			}
				
			for (let i = 0; i < inputCount; i++) {
			    let val = $('#formNumber' + i).val()?.trim(); 
			    if (val) checkBoxArray.push(val); 
			}

			formNumerString = checkBoxArray.join(',');
			
			if(formNumerString != null && formNumerString.length > 0) {
				showLayer();

				let jsonObject				= new Object();
				jsonObject.moduleId			= EWAYBILL_DETAILS_BY_EWAYBILL_NO_WHILE_EDIT_FORM_TYPE;

				jsonObject.eWayBillNumberArray	= formNumerString;
				jsonObject.waybillId			= wayBillId;
				jsonObject.sourceBranchId		= sourceBranchId;

				$.ajax({
					type		:	"POST",
					url			:	WEB_SERVICE_URL + '/FetchEwayBillDataWS/validateEwayBillNumberByApi.do',
					data		:	jsonObject,
					dataType	:	'json',
					success		:	function(data) {
						if(data.message != undefined) {
							hideLayer();
							let errorMessage = data.message;
							showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
							return;
						}

						hideLayer();

						if(data.exceptionCode == 204) {
							showLargeMessage('info', "Invalid E-Waybill No is : " + formNumerString);
							return;
						}
							
						let eWayBillValidationHM = data.eWayBillNoValidationHM;

						if(typeof eWayBillValidationHM !== 'undefined' && eWayBillValidationHM != null) {
							let arr = [];
							let str = "";
							
							for(let key in eWayBillValidationHM) {
								if(eWayBillValidationHM.hasOwnProperty(key)) {
									let eWayBillValidationDetails	= eWayBillValidationHM[key];
							
									if(!eWayBillValidationDetails)
										arr.push(key);
								}
							}
								
							if(groupConfigurationConfig.validateDuplicateEwaybillNumberOnLrNumber) {
								for(let key in eWayBillValidationHM) {
									if(eWayBillValidationHM.hasOwnProperty(key)) {
										let ewayBillDetail	= eWayBillValidationHM[key];
											
										if(ewayBillDetail.usedEWayBillNumber) {
											showMessage('error', "E-Waybill number is already added in this LR. " + ewayBillDetail.usedEwayBillLrNo);
											return;
										}
									}
								}
							} 
								
							if(arr.length > 0) {
								for(const element of arr) {
									str = str + ',' + element;
								}
							
								str = str.substring(1);
								
								showMessage('info', "Invalid E-Waybill No is : "+str);
							
								if(arr.length > 5)
									showLargeMessage('info', "Invalid E-Waybill No is : " + str);
								else
									showMessage('info', "Invalid E-Waybill No is : " + str);
							} else
								_this.updateFormType();
						}
					}	
				});
			}
		}, updateFormType : function() {
			let jsonObject			= new Object();
			let isCheckForDelete	= $('#isCheckForDelete').is(':checked');
			
			if(showCheckForRemoveOldFormType) {
				if($('#isCheckForDelete').exists())
					 isCheckForDelete = $('#isCheckForDelete').is(':checked');
				
				if(isCheckForDelete && !_this.checkForDelete())
					return false;
			}
			
			jsonObject.FormTypesIds			= $('#formTypes').val();
			
			let formTypeArr		= jsonObject.FormTypesIds.split(',');

			for (let id of formTypeArr) {
				if(id == E_WAYBILL_ID) {
					if(!isCheckForDelete && !isPrevEwaybillsAvailable && formNumerString.length == 0) {
						showMessage('error', 'Please enter atleast 1 E-WayBill !');
						return;
					}
					
					jsonObject.formNumber		= formNumerString;
				} else if(id == WAY_BILL_FORM_ID || id == WAYBILL_AND_CC_ID)
					jsonObject.formNumber		= $('#otherFormNumber').val()
					
				if(id == SAC_CODE)
					jsonObject.sacNumber		= $('#sacNumber').val();
					
				if(id == HSN_CODE)
					jsonObject.hsnNumber		= $('#hsnNumber').val();
				
				if(id == E_SUGAM_NO_ID)
					jsonObject.sugamNumber		= $('#sugamNumber').val();
			}

			jsonObject.PreviousFormTypesIds	= previousFormTypesIds;
			jsonObject.waybillId			= wayBillId;
			jsonObject.isCheckForDelete		= isCheckForDelete;
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/updateWayBillFormTypeWS/updateWayBillFormType.do?', _this.redirectToPage, EXECUTE_WITHOUT_ERROR);
		}, redirectToPage : function(response) {
			redirectToAfterUpdate(response);
			
			hideLayer();
		}, validateFormType : function(event) {
			let value = $('#formTypes').val();
			isUpdateWaybillFormType	= true;
			
			if(value == E_WAYBILL_ID) {
				_this.validateEWayBillNumber(event);
			} else if(value == E_SUGAM_NO_ID && groupConfigurationConfig.validateESugamNumberInput) {
				_this.validateEWayBillNumber(event);
				
				$('#sugamNumber').blur(function () {
					if($('#sugamNumber').val().length != 11) {
						isUpdateWaybillFormType	= false;
						showMessage('error', eSugamNumberLenErrMsg);
					}
				});
			} else if(value == HSN_CODE) {
				$('#hsnNumber').blur(function () {
					if($('#hsnNumber').val().length <= 0) {
						isUpdateWaybillFormType	= false;
						showMessage('error', hsnCodeErrorMsg);
					}
				});
			}
		}, validateEWayBillNumber : function(event) {
			if (event.which != 8 && event.which != 0 && (event.which < 48 || event.which > 57))
				event.preventDefault(); 
		}, addNewRow : function(isAddNewRow) {
			let inputCount = $('.formNumberDiv').length;
				
			for(let i = 0; i < inputCount; i++) {
				let ewaybillVal		= $('#formNumber' + i).val();

				if(ewaybillVal == '') {
					showMessage('error', 'Enter E-Way Bill Number');
					$('#formNumber' + i).css('border-color', 'red');
					$('#formNumber' + i).focus();
					return;
				} else if(ewaybillVal != undefined && ewaybillVal.length != 12) {
					showMessage('error', '<i class="fa fa-times-circle"></i> Enter 12 digit E-Way Bill Number');
					return;
				}
			}
				
			if(isAddNewRow) {
				_this.addNewEwayBillFields(inputCount);
				$("*[data-attribute='formNumberLabel']").removeClass("hide");
			}
		 }, getFormNumberValue : function() {
			validEwabill	= true;
			let checkBoxArray	= new Array();
			let inputCount = document.getElementById('formNumberLabel').getElementsByTagName('input').length;
			
			for(let i = 0; i < inputCount; i++) {
				let ewaybillVal		= $('#formNumber' + i).val();
			
				if(ewaybillVal == null || ewaybillVal == undefined || ewaybillVal == '')
					continue;
					
				if(ewaybillVal.length != 12) {
					showMessage('error', '<i class="fa fa-times-circle"></i> Enter 12 digit E-Way Bill Number');
					validEwabill	= false;
					return;
				}
			}
			
			for(let i = 0; i < inputCount; i++) {
				if($('#formNumber' + i).val() != '')
					checkBoxArray.push($('#formNumber' + i).val());
			}
			
			formNumerString		= checkBoxArray.join(',');
		 }, removeLastRow : function() {
			let lastIndex = $('.formNumberDiv').length;
			
			if (lastIndex === 0) return;
			
			$("#formNumberDiv" + (lastIndex - 1)).remove();
			
			if(lastIndex == 1)
				$("*[data-attribute='formNumberLabel']").addClass("hide");
		 }, setFormNumberValue : function() {
			let selectedFormTypeId = ($('#formTypes').val()).split(',');
			
			let ewayBillArr = selectedFormTypeId.filter(function (el) { return el == E_WAYBILL_ID; });
			
			if(ewayBillArr.length == 0) {
				myNod.remove('#formNumber0');
				$("*[data-attribute='formNumberLabel']").addClass("hide");
				$("*[data-attribute='addNewRowEwayBillNumber']").addClass("hide");
				$('#formNumberLabel').empty();
			}
			
			for(const element of selectedFormTypeId) {
				if(element == E_WAYBILL_ID) {
					let inputCount = $('.formNumberDiv').length
								
					for(let i = 0; i < inputCount; i++) {
						if($('#formNumber' + i).val() == undefined || $('#formNumber' + i).val() == "")
							$('#formNumberDiv' + i).remove();
					}
					
					let eWayBillStringFromDB	= formsWithNumberHM[element];
		
					let formNumberStringArr	= new Array();
					
					if(eWayBillStringFromDB != undefined && eWayBillStringFromDB != "")
						formNumberStringArr	= eWayBillStringFromDB.split(',');
		
					let ewayBillCount	= formNumberStringArr.length;
						
					for(let i = 0; i < ewayBillCount; i++) {
						$("*[data-attribute='formNumberLabel']").removeClass("hide");
						_this.addNewEwayBillFields(i);
						$('#formNumber' + i).val(formNumberStringArr[i]);
					}
				} else if(formsWithNumberHM[element] != undefined) { 
					if(element == SAC_CODE)
						$('#sacNumber').val(formsWithNumberHM[element]);
					else if(element == HSN_CODE)
						$('#hsnNumber').val(formsWithNumberHM[element]);
					else if(element == E_SUGAM_NO_ID)
						$('#sugamNumber').val(formsWithNumberHM[element]);
					else if(element == WAY_BILL_FORM_ID || element == WAYBILL_AND_CC_ID)
						$('#otherFormNumber').val(formsWithNumberHM[element]);
				}
			}
		}, reSetFormNumberValue : function() {
			let inputCount = $('.formNumberDiv').length
			
			for(let i = 1; i < inputCount; i++) {
				$('#formNumber' + i).remove();
				$('#formNumberLabel' + i).remove();
			}
		}, checkForDelete : function() {
			let isCheckForDelete			= $('#isCheckForDelete').is(':checked');
			
			if(previousFormTypesIds != 0) {
				let previousFormTypesIdArray	=  previousFormTypesIds.split(',')
				let formTypeId					= Number($('#formTypes').val());	
				
				if(isCheckForDelete && !isValueExistInArray(previousFormTypesIdArray,formTypeId)) {
					showMessage('error', 'Please select	 Form Type From Previous Form Type ');
					$("#isCheckForDelete"). prop("checked", false);
					return false;
				}
			}

			return true;
		}, addNewEwayBillFields : function(id) {
			let newField = '<div id="formNumberDiv' + id + '" class="formNumberDiv">'
				+ '<label class="col-xs-3" id="formNumberLabel0"><span id="formNumberLabel0" data-selector="formNumberLabel">Number</span></label>'
				+ '<div class="col-xs-8 validation-message">'
					+ '<div class="left-inner-addon">'
						+ '<input class="form-control text-uppercase" type="text" name="formNumber" data-tooltip="Form Number" onkeypress="allowDecimalNumberOnly(event);" onkeyup ="formNumberValidation(this)"'
							+ 'placeholder="Insert Form Number" id="formNumber' + id + '" maxlength="12" />'
					+ '</div>'
				+ '</div>'
			+ '</div>';
			
			$('#formNumberLabel').append(newField);
		}
	});
});

function allowDecimalNumberOnly(event) {
	let value = $('#formTypes').val();
	
	if(value == E_WAYBILL_ID && (event.which != 8 && event.which != 0 && (event.which < 48 || event.which > 57)))
		 event.preventDefault();
}

function formNumberValidation(eWaybill) {
	if(eWaybill.value.length == 12) {
		let textBoxCount = document.getElementById('formNumberLabel').getElementsByTagName('input').length;
		
		let currentIndex = parseInt(eWaybill.id.replace('formNumber', ''), 10);

		for(let i = 0; i < textBoxCount; i++) {
			let ele = document.getElementById('formNumber' + i);
		
			if(ele == null)
				continue;
		
			if(eWaybill.id != ele.id) {
				if(eWaybill.value == $('#formNumber' + i).val()) {
					showMessage('error', '<i class="fa fa-times-circle"></i> Enter another EwayBill No.');
					changeTextFieldColor(eWaybill.id, '', '', 'red');
					$('#' + eWaybill.id).val('');
					$('#' + eWaybill.id).focus();
					return false;
				} else {
					changeTextFieldColor(eWaybill.id, '', '', 'blue');
					$('#saveBtn').prop('disabled', false);
				}
			} else {
				$('#saveBtn').prop('disabled', false);
			}
		}
		
		if (currentIndex === textBoxCount - 1) {
			$('#addNewRow').click()

			setTimeout(() => {
				$('#formNumber' + (currentIndex + 1)).focus();
			}, 50);
		}
	}
}