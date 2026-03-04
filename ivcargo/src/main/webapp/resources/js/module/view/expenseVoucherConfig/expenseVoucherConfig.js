define([ 'marionette'
	,'JsonUtility'
	,'messageUtility'
	,'/ivcargo/resources/js/generic/urlparameter.js'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/expenseVoucherConfig/expenseVoucherConfigFilePath.js'
	,'jquerylingua'
	,'language'
	,'nodvalidation'
	,'focusnavigation'
	,'selectizewrapper'
	,'slickGridWrapper2'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'/ivcargo/resources/js/validation/regexvalidation.js'
	],
	function(Marionette, JsonUtility, MessageUtility, UrlParameter, FilePath, jquerylingua, language, NodValidation, FocusNavigation, Selectizewrapper, slickGridWrapper2, Selection, regexvalidation) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	masterLangKeySet,
	gridObject,
	masterLangObj,
	myNod,
	OfficeExpenseChargesList,
	LRExpenseChargesList,
	chargeTypeModelArr,
	branchIds,
	partyName,
	expenseName,
	doneTheStuff = false,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			_this = this;
		}, render: function() {

			getJSON(jsonObject, WEB_SERVICE_URL + '/expenseVoucherConfigWS/getExpenseVoucherConfigElementConfiguration.do?', _this.setElements, EXECUTE_WITHOUT_ERROR);

		}, setElements : function(response) {

			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/expenseVoucherConfig/expenseVoucherConfig.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();

				masterLangObj 						= FilePath.loadLanguage();
				masterLangKeySet 					= loadLanguageWithParams(masterLangObj);

				OfficeExpenseChargesList			= response.OfficeExpenseChargesList;
				LRExpenseChargesList				= response.LRExpenseChargesList;

				var partyNameAutoComplete 			= new Object();
				partyNameAutoComplete.primary_key 	= 'corporateAccountId';
				partyNameAutoComplete.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getPartyDetailsAutocomplete.do';
				partyNameAutoComplete.field 		= 'corporateAccountDisplayName';
				$("#partyNameEle").autocompleteCustom(partyNameAutoComplete);
				
				var expenseTypeArr 					= new Array();
				expenseTypeArr[0] 					= {'Id':1,'Value':'LR Expenses'};
				expenseTypeArr[1] 					= {'Id':3,'Value':'Office Expenses'};

				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	expenseTypeArr,
					valueField		:	'Id',
					labelField		:	'Value',
					searchField		:	'Value',
					elementId		:	'expenseTypeEle',
					create			: 	false,
					maxItems		: 	1,
					onChange		:   _this.onExpenseTypeChange
				});

				Selectizewrapper.setAutocomplete({
					valueField		:	'incomeExpenseChargeMasterId',
					labelField		:	'chargeName',
					searchField		:	'chargeName',
					elementId		:	'chargeNameEle',
					create			: 	false,
				});

				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.branchList,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'branchNameEle',
					create			: 	false,
					maxItems		: 	1000
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.branchList,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'branchEle',
					create			: 	false,
					maxItems		: 	1
				});
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector		: '#chargeNameEle_wrapper',
					validate		: 'validateAutocomplete:#chargeNameEle',
					errorMessage	: 'Please Select Atleast 1 Charge !'
				});
				
				myNod.add({
					selector		: '#expenseTypeEle_wrapper',
					validate		: 'validateAutocomplete:#expenseTypeEle',
					errorMessage	: 'Please Select Expense Type !'
				});

				myNod.add({
					selector		: '#branchNameEle_wrapper',
					validate		: 'validateAutocomplete:#branchNameEle',
					errorMessage	: 'Please Select Branch !'
				});

				hideLayer();

				$("#saveChargesBtn").click(function() {
					_this.onSubmit();								
				});
				
				$("#add").click(function() {
					_this.onAdd();								
				});

				$("#view").click(function(response) {
					_this.onView(response);								
				});

				$("#searchBtn").click(function() {
					_this.getBranchExpenseConfig();								
				});
				
				$("#addChargesBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')) {
						_this.addCharges();								
					}
				});

			});
		}, onAdd : function() {
			
			$('#top-border-boxshadow').removeClass('hide');
			$('#saveChargesBtn').removeClass('hide');
			$('#left-border-boxshadow').addClass('hide');
			$('#branchWiseExpenseConfigId').addClass('hide');
			$('#branchWiseExpenseConfigId').empty();
			var selectize 		= $('#branchEle').get(0).selectize;
			selectize.setValue(0); 
			
		}, onView : function(response) {
			
			$('#left-border-boxshadow').removeClass('hide');
			$('#top-border-boxshadow').addClass('hide');
			$('#middle-border-boxshadow').addClass('hide');
			$('#branchConfigtable tbody').empty();
			$('#saveChargesBtn').addClass('hide');
			
		}, getBranchExpenseConfig : function() {

			if($("#branchEle").val() == ""){
				showMessage('info','Please select a branch');
				hideLayer();
				return;
			}
			
			var jsonObject			= new Object();
			
			jsonObject.branchId 	= $("#branchEle").val();

			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/expenseVoucherConfigWS/getBranchWiseExpenseConfigDetails.do?',_this.setResponse, EXECUTE_WITHOUT_ERROR);

		}, setResponse : function(response) {

			if(response.message != undefined) {
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			}
			
			$('#branchWiseExpenseConfigId').empty();
			$('#branchWiseExpenseConfigId').removeClass('hide');
			var ColumnConfig		= response.ExpenseVoucherConfig.columnConfiguration;
			var columnKeys			= _.keys(ColumnConfig);
			var bcolConfig			= new Object();
			
			for (var i=0; i<columnKeys.length; i++) {
				var bObj		= ColumnConfig[columnKeys[i]];
				if (bObj.show == true) {
					bcolConfig[columnKeys[i]]	= bObj;
				}
			}
			response.ExpenseVoucherConfig.columnConfiguration		= _.values(bcolConfig);
			response.ExpenseVoucherConfig.Language					= masterLangKeySet;
			
			hideLayer();
			gridObject = slickGridWrapper2.setGrid(response.ExpenseVoucherConfig);
			slickGridWrapper2.updateRowColor(gridObject,'chargeAllowed',false,'highlight-row-red');
			
		}, addCharges : function() {
			
			var jsonObject							= new Object();

			branchIds								= $("#branchNameEle").val();
			partyName								= $("#partyNameEle").val();
			var hasAll								= branchIds.indexOf('-1') != -1; // true
			
			if(hasAll){
				var selectize 		= $('#branchNameEle').get(0).selectize;
				selectize.setValue(-1);
				$('#branchConfigtable tbody').empty();
			}
			
			var expenseSelectize  					= $('#chargeNameEle').get(0).selectize;
			var currentExpense 						= expenseSelectize.getValue();
			var expenseObj	 						= expenseSelectize.options[ currentExpense ];
			expenseName			 					= expenseObj.chargeName;

			jsonObject.expenseTypeId 				= $("#expenseTypeEle").val();
			jsonObject.incomeExpenseChargeMasterId 	= $("#chargeNameEle").val();
			jsonObject.branchId 					= $("#branchNameEle").val();
			jsonObject.partyId						= $("#partyNameEle_primary_key").val();
			
			jsonObject.chargeName 					= expenseName;
			jsonObject.partyName 					= partyName;

			getJSON(jsonObject, WEB_SERVICE_URL	+ '/expenseVoucherConfigWS/getPreviousExpenseConfigDetails.do?',_this.setExpenseVoucherConfig, EXECUTE_WITHOUT_ERROR);
		}, onExpenseTypeChange : function(value) {
			chargeTypeModelArr	= new Array();

			if(value == 1){
				$("*[data-attribute=partyName]").removeClass("hide");
				chargeTypeModelArr = LRExpenseChargesList;
				
			} else if (value == 3){
				$("*[data-attribute=partyName]").addClass("hide");
				chargeTypeModelArr = OfficeExpenseChargesList;
			} 

			setTimeout(() => {
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	chargeTypeModelArr,
					valueField		:	'incomeExpenseChargeMasterId',
					labelField		:	'chargeName',
					searchField		:	'chargeName',
					elementId		:	'chargeNameEle',
					create			: 	true,
					maxItems		: 	1
				});
			}, 200);


		}, setExpenseVoucherConfig : function(response) {

			var ExpenseVoucherConfig = response.ExpenseVoucherConfig;

			if(ExpenseVoucherConfig != undefined && ExpenseVoucherConfig.length > 0) {
				var selectize 		= $('#expenseTypeEle').get(0).selectize;
				selectize.setValue(0); 
				var selectize 		= $('#chargeNameEle').get(0).selectize;
				selectize.setValue(0); 
				var selectize 		= $('#branchNameEle').get(0).selectize;
				selectize.setValue(0); 
				$('#partyNameEle').val('');
			
				$('#middle-border-boxshadow').removeClass('hide');
				var columnArray		= new Array();

				for (var i = 0; i < ExpenseVoucherConfig.length; i++) {
					var obj			= ExpenseVoucherConfig[i];
					var firstEle	= ExpenseVoucherConfig[0];
					var focusId 	= firstEle.branchId + "_" + firstEle.incomeExpenseChargeMasterId + "_" + firstEle.expenseTypeId;
					
					setTimeout(() => {
						$('#limit_'+focusId).focus();
					}, 200);
					
					var primaryId 	= obj.branchId + "_" + obj.incomeExpenseChargeMasterId + "_" + obj.expenseTypeId + "_" + obj.partyId;
					
					if(!$('#'+primaryId ).exists()){
						columnArray.push("<td class='hide' id='updateRecord_"+primaryId+"' value='"+obj.updateRecord+"' style='text-align: center; vertical-align: middle;'>" + obj.updateRecord + "</td>");
						columnArray.push("<td class='hide' id='incomeExpenseChargeMasterId_"+primaryId+"' value="+obj.incomeExpenseChargeMasterId+" style='text-align: center; vertical-align: middle;'>" + obj.incomeExpenseChargeMasterId + "</td>");
						columnArray.push("<td class='hide' id='primaryId_"+primaryId+"' value="+obj.expenseVoucherConfigId+" style='text-align: center; vertical-align: middle;'>" + obj.expenseVoucherConfigId + "</td>");
						columnArray.push("<td class='hide' id='expenseTypeId_"+primaryId+"' value="+obj.expenseTypeId+" style='text-align: center; vertical-align: middle;'>" + obj.expenseTypeId + "</td>");
						columnArray.push("<td class='hide' id='partyId_"+primaryId+"' value="+obj.partyId+" style='text-align: center; vertical-align: middle;'>" + obj.partyId + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='chargeName_" + primaryId + "' name='chargeName_" + primaryId + "' value='"+ obj.chargeName +"'>" + obj.chargeName + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='expenseTypeName_" + primaryId + "' name='expenseTypeName_" + primaryId + "' value='"+ obj.expenseTypeName +"'>" + obj.expenseTypeName + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='partyName_" + primaryId + "' name='partyName_" + primaryId + "' value='"+ obj.partyId +"'>" + partyName + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='branchName_" + primaryId + "' name='branchName_" + primaryId + "' value='"+ obj.branchId +"'>" + obj.branchName + "</td>");

						if(obj.updateRecord) {
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" +
									"<input data-tooltip='' disabled='disabled' style='text-align: right;height: 30px;' class='commonLimit form-control height30px' onkeypress='if(this.value==&#39;0&#39;)this.value=&#39;&#39;; return allowOnlyNumeric(event);' type='text' " +
									"value='"+obj.limit+"'  id='limit_" + primaryId + "' />" +
							"</td>");
						} else {
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" +
									"<input data-tooltip='' style='text-align: right;height: 30px;' class='commonLimit form-control height30px' onkeypress='if(this.value==&#39;0&#39;)this.value=&#39;&#39;; return allowOnlyNumeric(event);' type='text' " +
									"value='"+0+"'  id='limit_" + primaryId + "' />" +
							"</td>");
						}

						if(obj.expenseVoucherConfigId > 0) {
							columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;' id='editLimit_" + primaryId + "'><b style='font-size: 14px'>Edit</b></a></td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;' id='deleteLimit_" + obj.expenseVoucherConfigId + "'><b style='font-size: 14px'>Remove</b></a></td>");
						} else {
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>&nbsp;</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;' id='deleteLimit_" + primaryId + "'><b style='font-size: 14px'>Remove</b></a></td>");
						}
						
						columnArray.push("<td style='text-align: center; vertical-align: middle;' >"
								+ "<input data-tooltip='' id = 'chargeAllowed_"+primaryId+"' class='singleCheckBox' type='checkbox' ></td>");

						$('#branchConfigtable tbody').append('<tr id="'+primaryId+'">' + columnArray.join(' ') + '</tr>');

						if(obj.expenseVoucherConfigId > 0 && !obj.markForDelete) {
							$("#deleteLimit_" + obj.expenseVoucherConfigId).bind("click", function() {
								var elementId		= $(this).attr('id');
								var id				= elementId.split('deleteLimit_')[1];
								_this.deleteExpenseVoucherConfigFromDB(id);
							});
						} else {
							$("#deleteLimit_" + primaryId).bind("click", function() {
								var elementId		= $(this).attr('id');
								var id				= elementId.split('deleteLimit_')[1];
								_this.deleteExpenseVoucherConfigFromTable(id);
							});
						}

						$("#editLimit_" + primaryId).bind("click", function() {
							var elementId		= $(this).attr('id');
							var id				= elementId.split('editLimit_')[1];
							$('#limit_'+id).prop('disabled',false);
						});
						
						if(obj.updateRecord)
							$('#chargeAllowed_' + primaryId).prop('checked', obj.chargeAllowed);
						else
							$('#chargeAllowed_' + primaryId).prop('checked', true);

						columnArray	= [];
					} else {
						showMessage('info','Please enter different branch !');
						hideLayer();
						return;
					}
				}
				hideLayer();
			}
		}, deleteExpenseVoucherConfigFromTable : function(id) {
			$('#'+id).remove();
		}, deleteExpenseVoucherConfigFromDB : function(id) {
			if (confirm("Are you sure to remove expense config?")) {
				showLayer();
				var jsonObject = new Object();
				
				jsonObject.expenseVoucherConfigId		= id;
				
				getJSON(jsonObject, WEB_SERVICE_URL+'/expenseVoucherConfigWS/deleteExpenseVoucherConfig.do', _this.showResponseAfterOperation, EXECUTE_WITH_ERROR);
			}
		}, onSubmit : function() {
			if($('#branchConfigTbody tr').length == 0) {
				showMessage('error','Please Add Expenses !');
				return;
			}
			
			if(!doneTheStuff) {
				doneTheStuff		= true;
				var branchIdArr		= new Array();
				var tbody			= $('#branchConfigTbody')[0].childNodes;

				for(var t = 0; t < tbody.length; t++) {
					branchIdArr.push(tbody[t].id);
				}

				var branchWiseArr 	= new Array();
				var limitArr		= new Array();

				for(var i = 0; i < branchIdArr.length; i++) {
					var branchWiseObj 							= new Object();
					var obj 									= branchIdArr[i];
					branchWiseObj.expenseVoucherConfigId		= $('#primaryId_' + obj).html();
					branchWiseObj.branchId 						= obj.split('_')[0];
					branchWiseObj.incomeExpenseChargeMasterId 	= $('#incomeExpenseChargeMasterId_' + obj).html();;
					branchWiseObj.expenseTypeId					= $('#expenseTypeId_' + obj).html();
					branchWiseObj.partyId						= $('#partyId_' + obj).html();
					branchWiseObj.limit							= $('#limit_' + obj).val();
					branchWiseObj.chargeAllowed					= $('#chargeAllowed_' + obj).prop("checked");
					branchWiseObj.updateRecord					= $('#updateRecord_' + obj).html();

					branchWiseArr.push(branchWiseObj);
					limitArr.push(branchWiseObj);
				}

				limitArr = limitArr.filter(function(el) { return (el.chargeAllowed && el.limit <= 0 ); }); 

				if(limitArr.length > 0) {
					showMessage('info','Please enter limit for expense !');
					hideLayer();
					doneTheStuff = false;
					return;
				}

				showLayer();
				
				if(branchWiseArr.length > 0) {
					if (confirm("Are you sure to save?")) {
						$('#saveChargesBtn').addClass('hide');
						
						jsonObject					= new Object();
						jsonObject.branchWiseArr	= JSON.stringify(branchWiseArr);
						
						getJSON(jsonObject, WEB_SERVICE_URL	+ '/expenseVoucherConfigWS/insertExpenseVoucherConfigurations.do?',	_this.setSuccess, EXECUTE_WITHOUT_ERROR);
					} else {
						hideLayer();
						doneTheStuff = false;
					}
				} 
				
			}
		}, setSuccess : function (response) {
			hideLayer();
			
			if(response.message != undefined) {
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				
				if(errorMessage.type == 1)//success
					location.reload();
			}
		}, showResponseAfterOperation : function (response) {
			hideLayer();

			if(response.message != undefined) {
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}

			setTimeout(() => {
				if(response.primaryId != undefined){
					$('#'+response.primaryId).remove();
				}

				if($('#branchConfigtable tr').length - 1 < 1){
					location.reload();
				}
			}, 500);
			
			showMessage('info', 'Expense removed successfully.');
			hideLayer();
		}
	});
});

function selectAll(param){

	if(param == true){
		$(".singleCheckBox").prop('checked',true)
	}else if(param == false){
		$(".singleCheckBox").prop('checked',false)
	}
}
function setValuesForAll(value){
	$('.commonLimit').val(value);
}
