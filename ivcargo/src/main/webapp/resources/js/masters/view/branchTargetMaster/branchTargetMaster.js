define(['JsonUtility'
	,'messageUtility'
	,'/ivcargo/resources/js/generic/urlparameter.js'
	,PROJECT_IVUIRESOURCES + '/resources/js/masters/view/branchTargetMaster/branchtargetmasterfilepath.js'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'slickGridWrapper2'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	,'selectizewrapper'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'/ivcargo/resources/js/module/redirectAfterUpdate.js'
	],function(JsonUtility, MessageUtility, UrlParameter, FilePath,Lingua, Language, AutoComplete, AutoCompleteWrapper,slickGridWrapper2
			,NodValidation,ElementFocusNavigation,Selectizewrapper,BootstrapModal){
	'use strict';
	var jsonObject = new Object(), myNod,  _this = '', masterLangObj, masterLangKeySet,gridObject ,redirectFilter = 0, minBackYears =0,
	isBranchExists = false, dataUpdated = false,branchTargetMasterId = 0,sourceBranchId = 0,allowToDeleteBranchTargetMasterDetails = false;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj){
			_this = this;
			this.$el.html(this.template);
		},render : function(){
			var jsonObject = new Object();
			getJSON(jsonObject, WEB_SERVICE_URL + '/branchTargetMasterWS/getBranchTargetMasterElements.do?', _this.renderBranchTargetMasterElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		},renderBranchTargetMasterElements : function(response){
			showLayer();
			var jsonObject 				= new Object();
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			var lrTypeList 				= response.WAYBILL_TYPE;
			var minBackYears			= response.inputProperties.minBackYears;
			var minFutureYears			= response.inputProperties.minFutureYears;
			
			loadelement.push(baseHtml);
			
			var keyObject = Object.keys(response);
			
			for (var i = 0; i < keyObject.length; i++) {
				if (response[keyObject[i]].show == true) {
					$("*[data-attribute="+ keyObject[i]+ "]").addClass("show");
				}
			}

			$("#mainContent").load("/ivcargo/html/master/branchTargetMaster.html",
					function() {
				baseHtml.resolve();
			});

			hideLayer();
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				var sourceBranchNameAutoComplete = new Object();
				sourceBranchNameAutoComplete.primary_key 	= 'branchId';
				sourceBranchNameAutoComplete.url 			=  response.branchList;
				sourceBranchNameAutoComplete.field 			= 'branchName';
				$("#branchEle").autocompleteCustom(sourceBranchNameAutoComplete);

				var lrTypeAutoComplete = new Object();
				lrTypeAutoComplete.primary_key 	= 'wayBillTypeId';
				lrTypeAutoComplete.url 			=  lrTypeList;
				lrTypeAutoComplete.field 		= 'wayBillType';
				$("#lrTypeEle").autocompleteCustom(lrTypeAutoComplete);

				/*$('.numericInput').on('keypress blur',function(){
					_this.isNumberKey(evt);
				});*/

				/*$('#branchEle').on('blur', function(event){
					var object = new Object();
					object.sourceBranchId = $('#branchEle_primary_key').val();
					getJSON(object, WEB_SERVICE_URL+'/selectOptionsWS/getExecutiveListByBranch.do', _this.setExecutive, EXECUTE_WITH_ERROR);
				});*/

				var start = new Date();
				start.setFullYear(start.getFullYear() - minBackYears);
				var end = new Date();
				end.setFullYear(end.getFullYear() + minFutureYears);

				$('#fromDateEle').datepicker({
					changeMonth: true,
					changeYear: true,
					minDate: start,
					maxDate: end - 2,
					dateFormat: '01-04-yy',
					showButtonPanel: true,
					defaultDate: '01-04-2017',
					yearRange: start.getFullYear() + ':' + end.getFullYear(),
					onClose: function(dateText, inst) { 
						var month = $("#ui-datepicker-div .ui-datepicker-month :selected").val();
						var year = $("#ui-datepicker-div .ui-datepicker-year :selected").val();
						$(this).datepicker('setDate', new Date(year, month, 1));
						setTimeout(function () {
							$('#toDateEle').focus();
						}, 100);
					}
				});

				var fromDateVal 	= $("#fromDateEle").val();
				var fromMydate = new Date(fromDateVal);

				$('#toDateEle').datepicker({
					changeMonth: true,
					changeYear: true,
					minDate: start,
					maxDate: end,
					dateFormat: '31-03-yy',
					showButtonPanel: true,
					defaultDate: '31-03-2018',
					yearRange: start.getFullYear() + ':' + end.getFullYear(),
					onClose: function(dateText, inst) { 
						var month = $("#ui-datepicker-div .ui-datepicker-month :selected").val();
						var year = $("#ui-datepicker-div .ui-datepicker-year :selected").val();
						$(this).datepicker('setDate', new Date(year, month, 1));
					}
				});

				$('#fromDateEle').on('click  keypress focus keyup',function(){
					setTimeout(function(){ $('.ui-datepicker-year','.ui-datepicker-title').attr('style', 'color: black !important');
					$('.ui-datepicker-calendar').css('display','none');
					$('.ui-datepicker-month').css('display','none');
					}, 10);
					
				});
				$('#toDateEle').on('click  keypress focus keyup',function(){
					setTimeout(function(){ $('.ui-datepicker-year','.ui-datepicker-title').attr('style', 'color: black !important');
					$('.ui-datepicker-calendar').css('display','none');
					$('.ui-datepicker-month').css('display','none');
					}, 10);
				});
				$('#saveBtn').click(function(){
					var fromDate = $('#fromDateEle').val();
					var toDate = $('#toDateEle').val();
					var fd 	= new Date(curSystemDate);
					var td 	= new Date(curSystemDate);
					var fromDateParts = new String(fromDate).split("-");
					var toDateParts = new String(toDate).split("-");

					fd.setFullYear(parseInt(fromDateParts[2],10));
					fd.setMonth(parseInt(fromDateParts[1]-1,10));
					fd.setDate(parseInt(fromDateParts[0],10));
					
					td.setFullYear(parseInt(toDateParts[2],10));
					td.setMonth(parseInt(toDateParts[1]-1,10));
					td.setDate(parseInt(toDateParts[0],10));
					td.setHours(0,0,0,0);
					var diffDays	= diffBetweenTwoDate(fd, td);
					
					if(diffDays > 366 || diffDays < 363){
						showMessage('error','Financial year can be only for 1 year, from 1st April to 31st March !');
						$('#toDateEle').focus();
						return false;
					}
					_this.checkValidInputsAndInsert();
				});
				$('#viewBtn').click(function(){
					_this.viewAllBranchTargets();
				});

			});

		}, checkValidInputsAndInsert : function(){
			
			myNod = nod();
			myNod.configure({
				parentClass:'validation-message'
			});
			
			var jsonObject 				= new Object();
			
			jsonObject.sourceBranchId 	= $('#branchEle_primary_key').val();
			jsonObject.actualWeight	 	= $('#actWeightEle').val();
			jsonObject.chargedWeight	= $('#chgWeightEle').val();
			jsonObject.wayBillTypeId	= $('#lrTypeEle_primary_key').val();
			jsonObject.bookingTotal		= $('#bookingTotalEle').val();
			jsonObject.fromDate			= $('#fromDateEle').val();
			jsonObject.toDate			= $('#toDateEle').val();

			myNod.add({
				selector		: '#branchEle',
				validate		: 'presence',
				errorMessage	: 'Select, Proper Branch'
			});
			
			myNod.add({
				selector		: '#actWeightEle',
				validate		: 'presence',
				errorMessage	: 'Enter Actual Weight'
			});

			myNod.add({
				selector		: '#actWeightEle',
				validate		: 'float',
				errorMessage	: 'Amount should be decimal number'
			});
			
			myNod.add({
				selector		: '#chgWeightEle',
				validate		: 'presence',
				errorMessage	: 'Enter Charged Weight'
			});
			
			myNod.add({
				selector		: '#chgWeightEle',
				validate		: 'float',
				errorMessage	: 'Amount should be decimal number'
			});
			
			myNod.add({
				selector		: '#bookingTotalEle',
				validate		: 'presence',
				errorMessage	: 'Enter Booking Total Amount'
			});
			
			myNod.add({
				selector		: '#bookingTotalEle',
				validate		: 'float',
				errorMessage	: 'Amount should be decimal number'
			});

			myNod.add({
				selector		: '#lrTypeEle',
				validate		: 'validateAutocomplete:#lrTypeEle_primary_key',
				errorMessage	: 'Select, Proper LR Type'
			});
			
			myNod.performCheck();
			
			if(myNod.areAll('valid')) {
				if(!_this.validateOtherData()) {
					return false;
				}
				
				getJSON(jsonObject, WEB_SERVICE_URL+'/branchTargetMasterWS/insertBranchTargetMasterDetails.do', _this.setResponseAfterInsert, EXECUTE_WITH_ERROR);
			}
		}, validateOtherData : function() {
			if($('#fromDateEle').val() == ''){
				showMessage('error','Date Not Selected !');
				$('#fromDateEle').focus();
				return false;
			}
			if($('#toDateEle').val() == ''){
				showMessage('error','Date Not Selected !');
				$('#toDateEle').focus();
				return false;
			}
			
			return true;
		},setResponseAfterInsert : function(response){
			branchTargetMasterId = response.branchTargetMasterId;
			if(branchTargetMasterId > 0){
				showMessage('success', 'Data Inserted Successfully');
			}
			_this.resetFields();
			hideLayer();
			console.log('Success insert', response)
		}, resetFields : function(){
			$('#branchEle').val('');
			$('#actWeightEle').val('');
			$('#chgWeightEle').val('');
			$('#lrTypeEle').val('');
			$('#bookingTotalEle').val('');
			$('#fromDateEle').val('');
			$('#toDateEle').val('');
		}, viewAllBranchTargets : function(){
			showLayer();
			var jsonObject 				= new Object();
			getJSON(jsonObject, WEB_SERVICE_URL + '/branchTargetMasterWS/getBranchTargetMasterViewAllBranchDetails.do?',_this.viewBranchTargetDetails, EXECUTE_WITH_ERROR);
		}, viewBranchTargetDetails : function(response){
			
			$("#branchTargetDetailsDiv").empty();
			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				var errorMessage = response.message;
				showMessage('error', errorMessage.description);
				return;
			}
			if(typeof response.branchTargetMasterTableConfig == 'undefined'){
				hideLayer();
				return false;
			}
			//sourceBranchId = response.branchTargetMasterTableConfig.CorporateAccount.sourceBranchId;
			if(response.branchTargetMasterTableConfig != undefined){
				var branchTargetMasterColumnConfig 	 	= response.branchTargetMasterTableConfig.columnConfiguration;
				var branchTargetMasterColumnKeys		= _.keys(branchTargetMasterColumnConfig);

				allowToDeleteBranchTargetMasterDetails	= response.allowToDeleteBranchTargetMasterDetails;

				if(allowToDeleteBranchTargetMasterDetails) {
					response.branchTargetMasterTableConfig.tableProperties.showDeleteButton = true;
				}
				for (var i = 0; i < branchTargetMasterColumnKeys.length ; i++) {

					var bObj	= branchTargetMasterColumnConfig[branchTargetMasterColumnKeys[i]];
					if(bObj != null){
						if (bObj.show == true) {
							branchTargetMasterColumnConfig[branchTargetMasterColumnKeys[i]] = bObj;
						}
					}
				}
				response.branchTargetMasterTableConfig.columnConfiguration							= branchTargetMasterColumnConfig;
				response.branchTargetMasterTableConfig.Language										= masterLangKeySet;
				response.branchTargetMasterTableConfig.tableProperties.callBackFunctionForDelete 	= _this.deleteBranchTargetDetails;
			}
			if(response.branchTargetMasterTableConfig != undefined  && response.branchTargetMasterTableConfig.CorporateAccount) {
				$('#middle-border-boxshadow').removeClass('hide');
				hideAllMessages();
				gridObject = slickGridWrapper2.setGrid(response.branchTargetMasterTableConfig);

			} else {
				$('#middle-border-boxshadow').addClass('hide');
			}
			hideLayer();

		},deleteBranchTargetDetails : function(grid, dataView, args,e){
			hideLayer();
			var row = args.row;

			if(dataView.getItem(row).branchTargetMasterId != undefined) {
				var branchTargetMasterId = dataView.getItem(row).branchTargetMasterId;
				_this.onDelete(branchTargetMasterId, dataView, grid, args, e);
			}
		},onDelete  : function(branchTargetMasterId, dataView, grid, args, e) {
			jsonObject = new Object();
			jsonObject.branchTargetMasterId 	= branchTargetMasterId;

			var btModalConfirm = new Backbone.BootstrapModal({
				content		: 	"Are you sure, You want to Delete the Branch Details ?",
				modalWidth 	: 	30,
				title		:	'DELETE Branch Target Details',
				okText		:	'YES',
				showFooter 	: 	true,
				okCloses	:	true
			}).open();

			btModalConfirm.on('ok', function() {
				showLayer();
				if(grid != null){
					_this.afterDeleteParty(dataView,grid,args,e);
				}
				getJSON(jsonObject, WEB_SERVICE_URL + '/branchTargetMasterWS/deleteSingleBranchTargetMasterDetails.do?',_this.afterDelete, EXECUTE_WITH_ERROR);

			});

		},afterDeleteParty  :  function(dataView,grid,args,e){
			var cell = grid.getCellFromEvent(e);
			if (grid.getColumns()[cell.cell].id == "DeleteButton") {
				dataView.deleteItem(dataView.getItem(args.row).id);
				grid.invalidate();

			}
			hideLayer();
		},afterDelete  :  function(){
			_this.resetFields();
			hideLayer();
		}
	});
});