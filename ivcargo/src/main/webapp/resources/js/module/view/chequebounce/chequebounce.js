var doneTheStuff				= false;
define(
		[
			'JsonUtility',
			'messageUtility',
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/chequebounce/chequebouncefilepath.js',
			'jquerylingua',
			'language',
			'autocomplete',
			'autocompleteWrapper',
			'bootstrapSwitch',
			'nodvalidation',
			'focusnavigation',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
			'/ivcargo/resources/js/generic/urlparameter.js',
			PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',
			'selectizewrapper',
			'/ivcargo/resources/js/module/redirectAfterUpdate.js',
			,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
			],
			
			function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper, BootstrapSwitch, NodValidation, FocusNavigation,
					BootstrapModal,UrlParameter,Selection,Selectizewrapper,datePickerUI) {
			'use strict';
			var 
			myNod, 
			corporateAccountId = 0,
			_this = '',
			masterLangObj,
			masterLangKeySet,
			chequeBounceDetailsList,
			billIdIdArrayList =new Array();
			
			return Marionette.LayoutView.extend({
				initialize : function(masterObj) {
					_this = this;
				}, render : function() {
					getJSON(null, WEB_SERVICE_URL	+ '/chequeBounceWS/getChequeBounceElement.do?',_this.renderChequeBounceElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderChequeBounceElements : function(response) {
					showLayer();
					var jsonObject 			= new Object();
					var loadelement			= new Array();
					var baseHtml 			= new $.Deferred();
					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/chequebounce/chequeBounce.html",
							function() {
						baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						hideLayer();

						masterLangObj 		= FilePath.loadLanguage();
						masterLangKeySet 	= loadLanguageWithParams(masterLangObj);

						response.executiveTypeWiseBranch	= true;

						var elementConfiguration	= new Object();

						elementConfiguration.branchElement		= $('#branchEle');

						response.elementConfiguration	= elementConfiguration;

						Selection.setSelectionToGetData(response);
						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});
						
						myNod.add({
							selector		: '#numberEle',
							validate		: 'presence',
							errorMessage	: 'Enter Number !'
						});
						
						myNod.add({
							selector		: '#searchType',
							validate		: 'presence',
							errorMessage	: 'Select Type !'
						});

						$("#findBtn").click(function() {
							myNod.performCheck();
							
							if(myNod.areAll('valid')) {
								_this.chequeBounceDetails();
							}
						});
						
						$("#searchType").change (function(){
							initialiseFocus();
							refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
							removeTableRows('chequeBounceDetailsTable', 'thead');
							removeTableRows('chequeBounceDetailsTable', 'tbody');
							$('#chequeBounceSelection input[type="text"]').val('');
							_this.showHideBranchSelection();
						});

						
					});
				},chequeBounceDetails : function(){
					showLayer();
					var jsonObject = new Object();

					var numberEle					= $('#numberEle').val();
					jsonObject["number"]			= numberEle.replace(/\s+/g, "");
					
					jsonObject["searchType"] 		= $('#searchType').val();
					jsonObject["branchId"] 			= $('#branchEle_primary_key').val();

					getJSON(jsonObject, WEB_SERVICE_URL+'/chequeBounceWS/getchequeBounceDetails.do?', _this.setChequeBounceDetails, EXECUTE_WITH_ERROR);
				},setChequeBounceDetails : function(response){
					hideLayer();
					chequeBounceDetailsList			= response.chequeBounceDetailsList;
					var columnHeadArray				= new Array();
					var columnArray					= new Array();
					var billIdIdArrayList			= new Array();
					var searchType					= $('#searchType').val();
					var chequeBounceConfig			= response.chequeBouncePropObj;
					var showManualDate				= chequeBounceConfig.showManualDate;
					
					if(response.message != undefined) {
						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);;
						
						$("#bottom-border-boxshadow").css("display", "none");
						$('#bottom-border-boxshadow').addClass('hide');
						hideLayer();
						
						return;
					}
					
					$("#bottom-border-boxshadow").css("display", "block");															
					$('#chequeBounceDetails').removeClass('hide');
					$('#bottom-border-boxshadow').removeClass('hide');
					$('#remark').removeClass('hide');
					$('#saveButton').removeClass('hide');
					
					
					columnHeadArray.push("<th style='text-align: center; verticle-align: middle;'><input type='checkbox' name='selectAll' id='selectAll' value='reportTable' onclick='selectAllCheckBox(this.checked,this.value);'/></th>")
					if(searchType == 12){
						columnHeadArray.push("<th style='text-align: center; verticle-align: middle;'>Bill Number</th>")
						columnHeadArray.push("<th style='text-align: center; verticle-align: middle;'>Branch</th>")
					} else {
						if(searchType == 1){
							columnHeadArray.push("<th style='text-align: center; verticle-align: middle;'>CR Number</th>")
						} else {
							columnHeadArray.push("<th style='text-align: center; verticle-align: middle;'>LR Number</th>")
						}
						columnHeadArray.push("<th style='text-align: center; verticle-align: middle;'>Source Branch</th>")
						columnHeadArray.push("<th style='text-align: center; verticle-align: middle;'>Destination Branch</th>")
					}
					columnHeadArray.push("<th style='text-align: center; verticle-align: middle;'>Party Name</th>")
					columnHeadArray.push("<th style='text-align: center; verticle-align: middle;'>Cheque Date</th>")
					columnHeadArray.push("<th style='text-align: center; verticle-align: middle;'>Cheque Number</th>")
					columnHeadArray.push("<th style='text-align: center; verticle-align: middle;'>Cheque Amount</th>")
					columnHeadArray.push("<th style='text-align: center; verticle-align: middle;'>Bank Name</th>")
					columnHeadArray.push("<th style='text-align: center; verticle-align: middle;'>Remark</th>")
					
					if(!$('#chequeBounceDetailsTableHeader').exists()){	
						$('#chequeBounceDetailsTable thead').append('<tr id="chequeBounceDetailsTableHeader" class="text-info text-center">' + columnHeadArray.join(' ') + '</tr>');
					}
					
					for(var i =0 ; i< chequeBounceDetailsList.length; i++){
						var columnArray					= new Array();
						
						billIdIdArrayList.push(chequeBounceDetailsList[i].billId)
						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='checkbox' name='billToAdd' id='billToAdd_"+chequeBounceDetailsList[i].billId+"' value='"+ chequeBounceDetailsList[i].billId +"'/></td>");
						if(searchType == 12){
							columnArray.push("<td style='text-align: center; verticle-align: middle;'>"+chequeBounceDetailsList[i].billNumber+"" 
									+"<input type = 'hidden' id='billId_"+chequeBounceDetailsList[i].billId+"' value ='"+chequeBounceDetailsList[i].billClearanceId+"'/>"
									+"<input type = 'hidden' id='billNumber_"+chequeBounceDetailsList[i].billId+"' value ='"+chequeBounceDetailsList[i].billNumber+"'/>"+"</td>")
						} else {
							columnArray.push("<td style='text-align: center; verticle-align: middle;'>"+chequeBounceDetailsList[i].wayBillNumber+"" 
									+"<input type = 'hidden' id='billId_"+chequeBounceDetailsList[i].billId+"' value ='"+chequeBounceDetailsList[i].billId+"'/>"
									+"<input type = 'hidden' id='billNumber_"+chequeBounceDetailsList[i].billId+"' value ='"+chequeBounceDetailsList[i].wayBillNumber+"'/>"+"</td>")
						}
						
						columnArray.push("<td style='text-align: center; verticle-align: middle;'>"+chequeBounceDetailsList[i].sourceBranchName+""
								+"<input type = 'hidden' id='sourceBranchId_"+chequeBounceDetailsList[i].billId+"' value ='"+chequeBounceDetailsList[i].sourceBranchId+"'/>"+"</td>")
						
						if(searchType == 12){
							columnArray.push("<td style='text-align: center; verticle-align: middle;'>"+chequeBounceDetailsList[i].partyName+""
									+"<input type = 'hidden' id='corporateAccountId_"+chequeBounceDetailsList[i].billId+"' value ='"+chequeBounceDetailsList[i].corporateAccountId+"'/>"+"</td>")
						} else {
							columnArray.push("<td style='text-align: center; verticle-align: middle;'>"+chequeBounceDetailsList[i].destinationBranchName+""
									+"<input type = 'hidden' id='destinationBranchId_"+chequeBounceDetailsList[i].billId+"' value ='"+chequeBounceDetailsList[i].destinationBranchId+"'/>"+"</td>")
							columnArray.push("<td style='text-align: center; verticle-align: middle;'>"+chequeBounceDetailsList[i].partyName+""
									+"<input type = 'hidden' id='corporateAccountId_"+chequeBounceDetailsList[i].billId+"' value ='"+chequeBounceDetailsList[i].corporateAccountId+"'/>"+"</td>")
						}
						
						columnArray.push("<td id='chequeDate_"+chequeBounceDetailsList[i].billId+"' style='text-align: center; verticle-align: middle;'>"+chequeBounceDetailsList[i].chequeDateString+"</td>")
						columnArray.push("<td id='chequeNumber_"+chequeBounceDetailsList[i].billId+"' style='text-align: center; verticle-align: middle;'>"+chequeBounceDetailsList[i].chequeNumber+"</td>")
					
						if(searchType == 12){
							columnArray.push("<td id='chequeAmount_"+chequeBounceDetailsList[i].billId+"' style='text-align: center; verticle-align: middle;'>"+chequeBounceDetailsList[i].totalReceivedAmount+"</td>")
						} else {
							columnArray.push("<td id='chequeAmount_"+chequeBounceDetailsList[i].billId+"' style='text-align: center; verticle-align: middle;'>"+chequeBounceDetailsList[i].chequeAmount+"</td>")
						}
						columnArray.push("<td id='bankName_"+chequeBounceDetailsList[i].billId+"' style='text-align: center; verticle-align: middle;'>"+chequeBounceDetailsList[i].bankName+"</td>")
						columnArray.push("<td style='text-align: right; verticle-align: middle;'><input type='text'id='remark_"+chequeBounceDetailsList[i].billId+"'class='form-control' required/></td>");	
						
						if(!$('#masterId_'+ chequeBounceDetailsList[i].billId ).exists()){
							$('#chequeBounceDetailsTable tbody').append('<tr id="masterId_'+chequeBounceDetailsList[i].billId+'">' + columnArray.join(' ') +'</tr>');
						}
					}
					if(showManualDate) {
						$("#manualDate")[0].valueAsDate = new Date();
						$('[data-attribute="manualDate"]').removeClass('hide');
					}
					
					$('#selectAll').bind("click", function() {
						_this.selectAllCheckBox(this.checked);
					});
					
					$(".saveBtn").click(function(){
							_this.submitData();
					});

					hideLayer();
				}, getBillIdWiseData:function(){
					var billId 				= 0;
					var billIdWiseObj		= new Object;

					$('input[name=billToAdd]:checked').each(function() {

						billId					= this.value;
						var billDetailsObj		= new Object();

						
						billDetailsObj.type						= $('#searchType').val();
						billDetailsObj.billId					= billId;
						billDetailsObj.sourceBranchId			= $('#sourceBranchId_'+billId).val();
						billDetailsObj.destinationBranchId		= $('#destinationBranchId_'+billId).val();
						billDetailsObj.corporateAccountId		= $('#corporateAccountId_'+billId).val();
						billDetailsObj.chequeDate				= $('#chequeDate_'+billId).html();
						billDetailsObj.chequeNumber				= $('#chequeNumber_'+billId).html();
						billDetailsObj.chequeAmount				= $('#chequeAmount_'+billId).html();
						billDetailsObj.bankName					= $('#bankName_'+billId).html();
						billDetailsObj.remark					= $('#remark_'+billId).val();
						billDetailsObj.chequeBounceRemark		= $('#chequeBounceRemark').val();
						billDetailsObj.moduleIdentifier			= $('#searchType').val();
						billDetailsObj.number                   = $('#billNumber_'+billId).val();
						if($('#searchType').val() == 12){
							billDetailsObj.billClearnceId		= $('#billId_'+billId).val();
						}
						
						billIdWiseObj['billId_' + billId]		= billDetailsObj;
					});

					return billIdWiseObj;
				},submitData : function(){
					var jsonObject		= new Object();
					var checkBoxArray	= new Array();
					
					$.each($("input[name=billToAdd]:checked"), function(){ 
						checkBoxArray.push($(this).val());
					});
					
					if(checkBoxArray.length == 0){
						showMessage('error', 'Please Select At least One LR!');
						hideLayer();
						return;
					}
					
					var manualDateVal = $('#manualDate').val();
					var isManualDateVisible = !$('[data-attribute="manualDate"]').hasClass('hide');

					if (isManualDateVisible) {

						if (!manualDateVal) {
							showMessage('error', 'Please select Date!');
							hideLayer();
							$('#manualDate').focus();
							return;
						}

						var parts = manualDateVal.split('-');
						var manualDateTs = new Date(
							parseInt(parts[0], 10),
							parseInt(parts[1], 10) - 1,
							parseInt(parts[2], 10)
						).getTime();

						var today = new Date();
						var todayTs = new Date(
							today.getFullYear(),
							today.getMonth(),
							today.getDate()
						).getTime();

						//Future date not allowed
						if (manualDateTs > todayTs) {
							showMessage('error', 'Selected date cannot be in the future!');
							hideLayer();
							$('#manualDate').focus();
							return;
						}

						// Before cheque date not allowed
						var billDataObj = _this.getBillIdWiseData();
						var maxChequeDateTs = 0;
						var maxChequeDateStr = '';

						$.each(billDataObj, function(key, bill) {
							var chequeTs = parseDDMMYYYY(bill.chequeDate);
							if (chequeTs && chequeTs > maxChequeDateTs) {
								maxChequeDateTs = chequeTs;
								maxChequeDateStr = bill.chequeDate;
							}
						});

						if (manualDateTs < maxChequeDateTs) {
							showMessage(
								'error',
								'Selected date cannot be before Cheque Date (' + maxChequeDateStr + ')'
							);
							hideLayer();
							$('#manualDate').focus();
							return;
						}
					}

					
					jsonObject["type"]					= $('#searchType').val();
					jsonObject["billIdWiseData"]		= JSON.stringify(_this.getBillIdWiseData());
					jsonObject["billIds"]				= checkBoxArray.join(',');
					jsonObject.manualDate			 	= isManualDateVisible ? manualDateVal : null;

					if(!doneTheStuff){
						doneTheStuff = true;
						var btModalConfirm = new Backbone.BootstrapModal({
							content		: 	'Are you sure you want to Save ?',
							modalWidth 	: 	30,
							title		:	'Save Cheque Bounce Entry',
							okText		:	'YES',
							showFooter 	: 	true,
							okCloses	:	true
						}).open();
						
						btModalConfirm.on('ok', function() {
							getJSON(jsonObject, WEB_SERVICE_URL+'/chequeBounceWS/saveChequeBounceDetails.do?', _this.responseAfter, EXECUTE_WITH_ERROR);
							
							doneTheStuff = false;
							btModalConfirm.close();
							showLayer();
							
						});
						btModalConfirm.on('cancel', function() {
							doneTheStuff = false;
						});
					}
				},responseAfter : function(response){
					hideLayer();
					if(response.message != undefined) {
						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					}
					
					$("#bottom-border-boxshadow").css("display", "none");
					$('#bottom-border-boxshadow').addClass('hide');
					
					$("#searchType").val(0);
					$('#chequeBounceSelection input[type="text"]').val('');
					$('#chequeBounceDetailsTable tbody').empty();
					
				},selectAllCheckBox : function(param) {

					var table 		 	= document.getElementById('chequeBounceDetailsTable');
					var count 			= parseFloat(table.rows.length-1);
					var totalAmount		= 0;	
					if(param == true){
						for(var row = 1 ; row < table.rows.length; row++){
							if(table.rows[row].cells[0].firstChild != null){	
								table.rows[row].cells[0].firstChild.checked = true;
							}
						}
					} else if(param == false){
						for(row = 1 ; row <  table.rows.length ; row++){
							if(table.rows[row].cells[0].firstChild != null){	
								table.rows[row].cells[0].firstChild.checked = false;
							}
						}
					}

				},showHideBranchSelection : function(){
					var searchType	= $('#searchType').val();
					
					if(searchType == 6){
						$("*[data-attribute='branch']").hide();
					} else {
						$("*[data-attribute='branch']").show();
					}
				}
			});
		});
		
		
function parseDDMMYYYY(dateStr) {
    if (!dateStr) return null;
    var parts = dateStr.split('-');	
    return new Date(parts[2], parts[1] - 1, parts[0]).setHours(0,0,0,0);
}
