define([	
			'/ivcargo/resources/js/generic/urlparameter.js'
			,PROJECT_IVUIRESOURCES + '/resources/js/module/view/editvoucher/editvoucherdetailsfilepath.js'
			,'JsonUtility'
			,'messageUtility'
			,'jquerylingua'
			,'language'
	        ,'autocomplete'
	        ,'autocompleteWrapper'
	        ,'nodvalidation'
	        ,'focusnavigation'//import in require.config
	        ,'selectizewrapper'
	        ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	        ,'/ivcargo/resources/js/module/redirectAfterUpdate.js'
	        ],function(UrlParameter, FilePath) {
	'use strict';
	let _this = '', voucherDetailsId,redirectFilter = 0,modifyExpenseAmount = false, incomeExpenseChargeToExclude = null, chargeMasterList = null,
	expenseDetailsList = null, isFromVoucherApproval = false;
;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			
			voucherDetailsId	= UrlParameter.getModuleNameFromParam('voucherDetailsId');
			redirectFilter   	= UrlParameter.getModuleNameFromParam('redirectFilter');
			isFromVoucherApproval   	= UrlParameter.getModuleNameFromParam('isFromVoucherApproval');
		}, render : function() {
			let jsonObject = new Object();
			jsonObject["voucherDetailsId"] 			= voucherDetailsId;
			getJSON(jsonObject, WEB_SERVICE_URL + '/UpdateVoucherDetailsWS/getVoucherDetails.do?', _this.renderVoucherDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, renderVoucherDetails : function(response) {
			let loadelement = [];
			let baseHtml 	= new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/editvoucherdetails/editVoucherDetail.html", function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				loadLanguageWithParams(FilePath.loadLanguage());
				expenseDetailsList				= response.expenseDetailsList;
				chargeMasterList				= response.chargeMasterList;
				incomeExpenseChargeToExclude	= response.incomeExpenseChargeIdListToExclude;
				modifyExpenseAmount   			= response.modifyExpenseAmount
				_this.createHeader();
				_this.setData(expenseDetailsList, chargeMasterList);
				hideLayer();
				
				$("#saveBtn").click(function() {
					_this.updateExpenseDetails();								
				});
			});
		}, createHeader : function() {
			$('#headingtr').empty();
			
			let createRow							= createRowInTable('', 'danger', '');
			
			let srNoCol						= createColumnInRow(createRow, '', '', '', 'center', '', '');
			let expenseNameCol				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			let modifiedExpenseNameCol		= createColumnInRow(createRow, '', '', '', 'center', '', '');
			let expenseAmountCol			= createColumnInRow(createRow, '', '', '', 'center', '', '');
			
			if(modifyExpenseAmount)
				var modifiedExpenseAmountCol	= createColumnInRow(createRow, '', '', '', 'center', '', '');
			
			let expenseRemarkCol			= createColumnInRow(createRow, '', '', '', 'center', '', '');
			let modifiedRemarkCol			= createColumnInRow(createRow, '', '', '', 'center', '', '');
			
			appendValueInTableCol(srNoCol, '<b>Sr No</b><input type="checkbox" id="selectAll" name="selectAll" value="Select All" onclick="selectAllWayBills(this.checked);"></input');
			appendValueInTableCol(expenseNameCol, '<b>Existing Expense</b>');
			appendValueInTableCol(modifiedExpenseNameCol, '<b>Update Expense</b>');
			appendValueInTableCol(expenseAmountCol, '<b>Amount (&nbsp;&#x20B9;&nbsp;)</b>');
			
			if(modifyExpenseAmount)
				appendValueInTableCol(modifiedExpenseAmountCol, '<b>Update Amount (&nbsp;&#x20B9;&nbsp;)</b>');
			
			appendValueInTableCol(expenseRemarkCol, '<b> Existing Remark</b>');
			appendValueInTableCol(modifiedRemarkCol, '<b> Update Remark</b>');
			
			appendRowInTable('headingtr', createRow);
			
			$("#selectAll").bind("click", function() {
			    _this.selectAllWayBills(this.checked);
			});
			
		}, setData : function(expenseDetailsList) {
			removeTableRows('editIncomeExpenseVoucherDetailsDiv', 'tbody');
			
			for(const element of expenseDetailsList) {
				let expenseDetailId				= parseInt(element.expenseId);
				let incomeExpenseChargeMasterId	= parseInt(element.expenseChargeMasterId);
				let executiveId					= parseInt(element.executiveId);
				let branchId					= parseInt(element.branchId);
				let paymentVoucherNumber		= parseInt(element.paymentVoucherNumber);
				let expenseVoucherDetailsId		= parseInt(element.expenseVoucherDetailsId);

				let createRow					= createRowInTable('tr_' + expenseDetailId, 'tr_' + expenseDetailId, '');
				let expenseName				= element.expenseName;
				let expenseAmount			= element.amount+'&nbsp;&#x20B9;&nbsp;';
				let expenseRemark			= element.remark;
				
				let srNoCol					= createColumnInRow(createRow, 'expense_'+expenseDetailId, 'expense_'+expenseDetailId, '', '', '', '');
				let expenseNameCol			= createColumnInRow(createRow, 'prevExpenseName_'+expenseDetailId, 'prevExpenseName_'+expenseDetailId, '', '', '', '');
				let modifiedExpenseNameCol	= createColumnInRow(createRow, 'modifiedExpenseName_'+expenseDetailId, 'modifiedExpenseName_'+expenseDetailId, '', '', '', '');
				let expenseAmountCol		= createColumnInRow(createRow, 'expenseAmount_'+expenseDetailId, 'expenseAmount_'+expenseDetailId, '', 'right', '', '');
							
				if(modifyExpenseAmount)
					var modifiedExpenseAmountCol= createColumnInRow(createRow, 'modifiedExpenseAmountCol_'+expenseDetailId, 'modifiedExpenseAmountCol_'+expenseDetailId, '', 'right', '', '');
				
				let expenseRemarkCol		= createColumnInRow(createRow, 'expensePrevRemark_'+expenseDetailId, 'expensePrevRemark_'+expenseDetailId, '', '', '', '');
				let modifiedRemarkCol		= createColumnInRow(createRow, 'modifiedRemark_'+expenseDetailId, 'modifiedRemark_'+expenseDetailId, '', '', '', '');
				
				appendValueInTableCol(srNoCol, '<input type="checkbox" name="expenseDetail" id="expenseDetail_' + expenseDetailId + '" maxlength="50" value='+expenseDetailId+"_"+incomeExpenseChargeMasterId+"_"+branchId+"_"+executiveId+"_"+paymentVoucherNumber+"_"+expenseVoucherDetailsId+' class="form-control">');
				appendValueInTableCol(expenseNameCol, expenseName);
				appendValueInTableCol(modifiedExpenseNameCol, '<select name="modifiedExpense_' + expenseDetailId + '" id="modifiedExpense_' + expenseDetailId + '" class="selectpicker form-control"></select>');
				
				appendValueInTableCol(expenseAmountCol, expenseAmount);
			
				if (modifyExpenseAmount) {
					let expenseAmountForInput = element.amount;

					appendValueInTableCol(modifiedExpenseAmountCol,'<input name="modifiedExpenseAmount_' + expenseDetailId + '" id="modifiedExpenseAmount_' + expenseDetailId + '" maxlength="10" class="form-control" type="text" placeholder="Update Amount" value="' + expenseAmountForInput + '" data-expense-amount="' + expenseAmountForInput + '" oninput="this.value = this.value.replace(/[^0-9]/g, \'\');" />');
				}
				
				appendValueInTableCol(expenseRemarkCol, expenseRemark);
				appendValueInTableCol(modifiedRemarkCol, '<input name="modifiedRemarkInput_' + expenseDetailId + '" id="modifiedRemarkInput_' + expenseDetailId + '" maxlength="180" class="form-control"  type="text" placeholder="Remark" >');
				appendRowInTable('editIncomeExpenseVoucherDetailsDiv', createRow);
				_this.setExpenseList(expenseDetailId, incomeExpenseChargeMasterId);
			}
		}, selectAllWayBills : function(param) {
			let tab 	= document.getElementById('editIncomeExpenseVoucherDetailsDiv');
			let count 	= parseFloat(tab.rows.length - 1);
			let row;

			for (row = count; row > 0; row--) {
				if(tab.rows[row].cells[0].firstElementChild) {
					tab.rows[row].cells[0].firstElementChild.checked = param;
				};
			};
		}, setExpenseList : function(expenseDetailId, incomeExpenseChargeMasterId) {
			createOption('modifiedExpense_' + expenseDetailId, 0, '---Select Expense---');

			if(!jQuery.isEmptyObject(chargeMasterList)) {	
				for(const element of chargeMasterList) {
					let createExpenseOption = isValueExistInArray(incomeExpenseChargeToExclude, element.incomeExpenseChargeMasterId);
					
					if(!createExpenseOption)
						createOptionWithSelected('modifiedExpense_'+ expenseDetailId, element.incomeExpenseChargeMasterId, element.chargeName, incomeExpenseChargeMasterId == element.incomeExpenseChargeMasterId);
				}
			}		
		}, updateExpenseDetails : function() { 
		 	let checkBoxArray	= getAllCheckBoxSelectValue('expenseDetail');
			
			if(checkBoxArray.length <= 0) {
				showMessage('error', iconForErrMsg + 'Please Select Expense !');
				return false;
			}
			
			let usedExpenseIds = new Set();

			let jsonArray	= new Array();
						
			for(const element of checkBoxArray) {
				let value			= element;
				
				let jsonObjectNew = new Object();
				let expenseDetailId			= value.split("_")[0];
				
				jsonObjectNew.expenseId						= expenseDetailId;
				jsonObjectNew.prevExpenseChargeMasterId		= value.split("_")[1];
				jsonObjectNew.prevExpenseName				= $("#prevExpenseName_" + expenseDetailId).html();
				jsonObjectNew.expenseChargeMasterId			= $("#modifiedExpense_" + expenseDetailId).val();
				jsonObjectNew.expenseName					= $("#modifiedExpense_" + expenseDetailId + " option:selected").text();
				jsonObjectNew.prevRemark					= $("#expensePrevRemark_" + expenseDetailId).html();
				jsonObjectNew.remark						= $("#modifiedRemarkInput_" + expenseDetailId).val();
				jsonObjectNew.prevBranchId					= value.split("_")[2];
				jsonObjectNew.prevExecutiveId				= value.split("_")[3];
				jsonObjectNew.prevExpenseAmount 			= Number($("#expenseAmount_" + expenseDetailId).html().replace(/[^0-9.]/g, ""));

				if (usedExpenseIds.has(jsonObjectNew.expenseChargeMasterId)) {
					showMessage('error', iconForErrMsg + ' Duplicate Expense is not allowed!');
					return false; 
				}
				
				usedExpenseIds.add(jsonObjectNew.expenseChargeMasterId);

				if(modifyExpenseAmount)
					jsonObjectNew.amount	= $("#modifiedExpenseAmount_" + expenseDetailId).val();
				
				if(jsonObjectNew.updatedIncomeExpenseChargeMasterId <= 0) {
					showMessage('error', iconForErrMsg + 'Please Select Expense !');
					return false;
				}
				
				jsonArray.push(jsonObjectNew);
			}
			
			let jsonObject = new Object();
			jsonObject.expenseDetailArr			= JSON.stringify(jsonArray);
			jsonObject["redirectTo"] 			= Number(redirectFilter);
			jsonObject["isFromVoucherApproval"] = isFromVoucherApproval;
			jsonObject["exepenseVoucherDetailsId"]	= voucherDetailsId;

			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL+'/UpdateVoucherDetailsWS/updateVoucherDetails.do', _this.onUpdate, EXECUTE_WITH_ERROR); //submit JSON
		}, onUpdate : function(response) {
			if(isFromVoucherApproval != undefined && isFromVoucherApproval != null && (isFromVoucherApproval == true || isFromVoucherApproval == 'true')) {
				if(opener.document.getElementById('expenseAmount_' + voucherDetailsId) != null) {
					opener.document.getElementById('expenseAmount_' + voucherDetailsId).innerHTML = response.totalAmount;
				
					if(response.remarkString != undefined)
						opener.document.getElementById('expenseRemark_' + voucherDetailsId).innerHTML = response.remarkString;
				
					if(response.expenseString != null)
						opener.document.getElementById('expenseName_' + voucherDetailsId).innerHTML = response.expenseString;
				}
					
				window.close();
			} else
				redirectToAfterUpdate(response);
		}, createOptionWithSelected(Id, key, value, isSelected = false) {
			var newOption = $("<option />");
			newOption.attr('id', key); 
			newOption.val(key);
			newOption.html(value);
			newOption.prop('selected', isSelected); 
			
			$('#' + Id).append(newOption);
		}
	});
});