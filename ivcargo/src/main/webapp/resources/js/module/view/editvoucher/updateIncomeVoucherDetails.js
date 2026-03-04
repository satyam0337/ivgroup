var wayBillIncomeDetailsList 	= null;
var chargeMasterList			= null;
var incomeExpenseChargeToExclude	= null;
define([	'JsonUtility'
			,'messageUtility'
			,'/ivcargo/resources/js/generic/urlparameter.js'
			,PROJECT_IVUIRESOURCES + '/resources/js/module/view/editvoucher/editvoucherdetailsfilepath.js'
			,'jquerylingua'
			,'language'
	        ,'autocomplete'
	        ,'autocompleteWrapper'
	        ,'nodvalidation'
	        ,'focusnavigation'//import in require.config
	        ,'selectizewrapper'
	        ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	        ,'/ivcargo/resources/js/module/redirectAfterUpdate.js'
	        ],function(JsonUtility, MessageUtility, UrlParameter, FilePath,Lingua, Language, AutoComplete, AutoCompleteWrapper,
		 NodValidation,ElementFocusNavigation,Selectizewrapper,BootstrapModal){
	'use strict';
	var jsonObject = new Object(), myNod,  _this = '', masterLangObj, masterLangKeySet ,voucherDetailsId,redirectFilter = 0;;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj){
			_this = this;
			voucherDetailsId	= UrlParameter.getModuleNameFromParam('branchIncomeVoucherDetailsId');
			redirectFilter   	= UrlParameter.getModuleNameFromParam('redirectFilter');
			console.log('redirectFilter ',redirectFilter)
		},render : function(){
			var jsonObject = new Object();
			jsonObject["voucherDetailsId"] 			= voucherDetailsId;
			getJSON(jsonObject, WEB_SERVICE_URL + '/UpdateVoucherDetailsWS/getIncomeVoucherDetails.do?', _this.renderVoucherDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		},renderVoucherDetails : function(response){
			console.log(response)
			var loadelement = [];
			var baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/editvoucherdetails/editVoucherDetail.html",
					function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function(){
				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				wayBillIncomeDetailsList	= response.wayBillIncomeDetailsList;
				chargeMasterList	= response.chargeMasterList;
				incomeExpenseChargeToExclude	= response.incomeExpenseChargeIdListToExclude;
				_this.createHeader();
				_this.setData(wayBillIncomeDetailsList,chargeMasterList);
				hideLayer();
				$("#saveBtn").click(function() {
					_this.updateExpenseDetails();								
				});
			});
			
			
		},createHeader : function(){
			
			$('#headingtr').empty();
			
			var createRow							= createRowInTable('', 'success', '');
			
			var srNoCol						= createColumnInRow(createRow, '', '', '', 'center', '', '');
			var incomeNameCol				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			var modifiedIncomeNameCol		= createColumnInRow(createRow, '', '', '', 'center', '', '');
			var incomeAmountCol				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			var incomeRemarkCol				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			var modifiedRemarkCol			= createColumnInRow(createRow, '', '', '', 'center', '', '');
			
			appendValueInTableCol(srNoCol, '<b>Sr No</b><input type="checkbox" id="selectAll" name="selectAll" value="Select All" onclick="selectAllWayBills(this.checked);"></input');
			appendValueInTableCol(incomeNameCol, '<b>Existing Income </b>');
			appendValueInTableCol(modifiedIncomeNameCol, '<b>Update Income</b>');
			appendValueInTableCol(incomeAmountCol, '<b>Amount (&nbsp;&#x20B9;&nbsp;)</b>');
			appendValueInTableCol(incomeRemarkCol, '<b> Existing Remark</b>');
			appendValueInTableCol(modifiedRemarkCol, '<b> Update Remark</b>');
			
			appendRowInTable('headingtr', createRow);
			
			$("#selectAll").bind("click", function() {
			    _this.selectAllWayBills(this.checked);
			});
			
		},setData : function(wayBillIncomeDetailsList){
			removeTableRows('editIncomeExpenseVoucherDetailsDiv', 'tbody');
			for(var i = 0; i < wayBillIncomeDetailsList.length; i++){
				
				var incomeDetailId				= parseInt(wayBillIncomeDetailsList[i].wayBillIncomeId);
				var incomeExpenseChargeMasterId	= parseInt(wayBillIncomeDetailsList[i].incomeChargeId);
				var executiveId					= parseInt(wayBillIncomeDetailsList[i].executiveId);
				var branchId					= parseInt(wayBillIncomeDetailsList[i].branchId);
				var receiptVoucherNumber		= parseInt(wayBillIncomeDetailsList[i].receiptVoucherNumber);
				var incomeVoucherDetailsId		= parseInt(wayBillIncomeDetailsList[i].voucherDetailsId);
				
				var createRow							= createRowInTable('tr_'+incomeDetailId, 'tr_'+incomeDetailId, '');
				
				var incomeName				= wayBillIncomeDetailsList[i].incomeName;
				var incomeAmount			= wayBillIncomeDetailsList[i].amount+'&nbsp;&#x20B9;&nbsp;';
				var incomeRemark			= wayBillIncomeDetailsList[i].remark;
				
				var srNoCol					= createColumnInRow(createRow, 'income_'+incomeDetailId, 'income_'+incomeDetailId, '', '', '', '');
				var incomeNameCol			= createColumnInRow(createRow, 'prevIncomeName_'+incomeDetailId, 'prevIncomeName_'+incomeDetailId, '', '', '', '');
				var modifiedIncomeNameCol	= createColumnInRow(createRow, 'modifiedIncomeName_'+incomeDetailId, 'modifiedIncomeName_'+incomeDetailId, '', '', '', '');
				var incomeAmountCol			= createColumnInRow(createRow, 'incomeAmount_'+incomeDetailId, 'incomeAmount_'+incomeDetailId, '', 'right', '', '');
				var incomeRemarkCol			= createColumnInRow(createRow, 'incomePrevRemark_'+incomeDetailId, 'incomePrevRemark_'+incomeDetailId, '', '', '', '');
				var modifiedRemarkCol		= createColumnInRow(createRow, 'modifiedRemark_'+incomeDetailId, 'modifiedRemark_'+incomeDetailId, '', '', '', '');
				
				
				appendValueInTableCol(srNoCol, '<input type="checkbox" name="incomeDetail" id="incomeDetail_' + incomeDetailId + '" maxlength="50" value='+incomeDetailId+"_"+incomeExpenseChargeMasterId+"_"+branchId+"_"+executiveId+"_"+receiptVoucherNumber+"_"+incomeVoucherDetailsId+' class="form-control">');
				appendValueInTableCol(incomeNameCol, incomeName);
				appendValueInTableCol(modifiedIncomeNameCol, '<select name="modifiedIncome_' + incomeDetailId + '" id="modifiedIncome_' + incomeDetailId + '" class="selectpicker form-control"></select>');
				appendValueInTableCol(incomeAmountCol, incomeAmount);
				appendValueInTableCol(incomeRemarkCol, incomeRemark);
				appendValueInTableCol(modifiedRemarkCol, '<input name="modifiedRemarkInput_' + incomeDetailId + '" id="modifiedRemarkInput_' + incomeDetailId + '" maxlength="180" class="form-control"  type="text" placeholder="Remark" >');
				appendRowInTable('editIncomeExpenseVoucherDetailsDiv', createRow);
				_this.setIncomeList(incomeDetailId);
			}
		}, selectAllWayBills : function(param) {

			var tab 	= document.getElementById('editIncomeExpenseVoucherDetailsDiv');
			var count 	= parseFloat(tab.rows.length - 1);
			var row;

			if(param == true) {
				for (row = count; row > 0; row--) {
					if(tab.rows[row].cells[0].firstElementChild) {
						tab.rows[row].cells[0].firstElementChild.checked = true;
					};
				};
			} else if(param == false) {
				for (row = count; row > 0; row--) {
					if(tab.rows[row].cells[0].firstElementChild) {
						tab.rows[row].cells[0].firstElementChild.checked = false;
					};
				};
			};
		},setIncomeList : function(incomeDetailId){
			createOption('modifiedIncome_'+incomeDetailId, 0, '---Select Income---');
			if(!jQuery.isEmptyObject(chargeMasterList)) {	
				for(var i = 0; i < chargeMasterList.length; i++) {
					var createExpenseOption = _this.isValueExistInArray(incomeExpenseChargeToExclude,chargeMasterList[i].incomeExpenseChargeMasterId);
					if(!createExpenseOption){
						createOption('modifiedIncome_'+ incomeDetailId, chargeMasterList[i].incomeExpenseChargeMasterId, chargeMasterList[i].chargeName);
					}
				}
			}
		},updateExpenseDetails : function(){
			showLayer();
			var checkBoxArray	= getAllCheckBoxSelectValue('incomeDetail');
			console.log('checkBoxArray ',checkBoxArray)
			
			var jsonArray	= new Array();
			
			var jsonObject = new Object();
			
			if(checkBoxArray.length <=0 ){
				showMessage('error', iconForErrMsg + 'Please Select Income !');
				hideLayer();
				return false;
			}
			
			for(var i = 0;i<checkBoxArray.length;i++){
				
				var value									= 	checkBoxArray[i];
				
				var jsonObjectNew = new Object();
				
				var wayBillIncomeId		= value.split("_")[0];
				
				jsonObjectNew.wayBillIncomeId						= wayBillIncomeId;
				jsonObjectNew.prevIncomeChargeMasterId				= value.split("_")[1];
				jsonObjectNew.prevIncomeName						= $("#prevIncomeName_" + wayBillIncomeId).html();
				jsonObjectNew.updatedIncomeChargeMasterId			= $("#modifiedIncome_" + wayBillIncomeId).val();
				jsonObjectNew.updatedIncomeName						= $("#modifiedIncome_" + wayBillIncomeId + " option:selected").text();
				jsonObjectNew.prevRemark							= $("#incomePrevRemark_" + wayBillIncomeId).html();
				jsonObjectNew.updatedRemark							= $("#modifiedRemarkInput_" + wayBillIncomeId).val();
				jsonObjectNew.prevBranchId							= value.split("_")[2];
				jsonObjectNew.prevExecutiveId						= value.split("_")[3];
				jsonObjectNew.receiptVoucherNumber					= value.split("_")[4];
				jsonObjectNew.wayBillIncomeVoucherDetailsId			= value.split("_")[5];
				
				if(jsonObjectNew.updatedIncomeChargeMasterId <=0 ){
					showMessage('error', iconForErrMsg + 'Please Select Expense !');
					hideLayer();
					return false;
				}
				
				/*if(jsonObjectNew.prevIncomeChargeMasterId == jsonObjectNew.updatedIncomeChargeMasterId){
					showMessage('error', iconForErrMsg + ' Selected expense '+jsonObjectNew.updatedExpenseName+' and the Prev Expense '+jsonObjectNew.prevExpenseName+' Is Same !');
					hideLayer();
					return false;
				} */
				
				jsonArray.push(jsonObjectNew);
			}
			
			jsonObject.incomeDetailArr		= JSON.stringify(jsonArray);
			jsonObject["redirectTo"] 		= Number(redirectFilter);
			getJSON(jsonObject, WEB_SERVICE_URL+'/UpdateVoucherDetailsWS/updateIncomeVoucherDetails.do', _this.onUpdate, EXECUTE_WITH_ERROR); //submit JSON
			
		} ,onUpdate : function(response){
			redirectToAfterUpdate(response);
		},isValueExistInArray : function(arr, value){
			for(var i = 0; i < arr.length; i++) {
				if(arr[i] == value) {
					return true;
				}
			}
			
			return false;
		}
	});
});