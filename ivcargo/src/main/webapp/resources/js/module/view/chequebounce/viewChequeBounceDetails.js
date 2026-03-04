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
			billIdIdArrayList =new Array(),
			wayBillId,
			moduleId,
			jsonObject;
			
			return Marionette.LayoutView.extend({
				initialize : function(masterObj) {
					_this = this;
					
					wayBillId			= UrlParameter.getModuleNameFromParam('wayBillId');
					moduleId			= UrlParameter.getModuleNameFromParam('moduleId');
					jsonObject = new Object();
					
					jsonObject["wayBillId"] 		= wayBillId;
					jsonObject["moduleId"] 			= moduleId;
				
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/chequeBounceWS/showChequeBounceDetailsByWayBillId.do?',_this.renderChequeBounceElements, EXECUTE_WITH_ERROR);
					return _this;
				}, renderChequeBounceElements : function(response) {
					hideLayer();
					if(response.message != undefined) {
						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);;
						hideLayer();
						setTimeout(function(){
							window.close();
						},1500)
						return;
					}
					var jsonObject 			= new Object();
					var loadelement			= new Array();
					var baseHtml 			= new $.Deferred();
					loadelement.push(baseHtml);
					$("#mainContent").load("/ivcargo/html/module/chequebounce/chequeBounceSearchView.html",
							function() {
						baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						hideLayer();

						masterLangObj 		= FilePath.loadLanguage();
						masterLangKeySet 	= loadLanguageWithParams(masterLangObj);

						response.executiveTypeWiseBranch	= true;

						_this.setChequeBounceDetails(response);
						
					});
				},setChequeBounceDetails : function(response){
					hideLayer();

					chequeBounceDetailsList			= response.chequeBounceDetailsList;
					var columnHeadArray				= new Array();
					var columnArray					= new Array();
					var billIdIdArrayList			= new Array();
					var searchType					= $('#searchType').val();
					
					columnHeadArray.push("<th style='text-align: center; verticle-align: middle;'>Type</th>")
					columnHeadArray.push("<th style='text-align: center; verticle-align: middle;'>Remark</th>")
					columnHeadArray.push("<th style='text-align: center; verticle-align: middle;'>Party Name</th>")
					columnHeadArray.push("<th style='text-align: center; verticle-align: middle;'>Cheque Date</th>")
					columnHeadArray.push("<th style='text-align: center; verticle-align: middle;'>Cheque Number</th>")
					columnHeadArray.push("<th style='text-align: center; verticle-align: middle;'>Cheque Amount</th>")
					columnHeadArray.push("<th style='text-align: center; verticle-align: middle;'>Bank Name</th>")
					
					$('#chequeBounceDetailsTable thead').append('<tr id="chequeBounceDetailsTableHeader" class="text-info text-center">' + columnHeadArray.join(' ') + '</tr>');
					
					for(var i =0 ; i< chequeBounceDetailsList.length; i++){
						var columnArray					= new Array();
						
						billIdIdArrayList.push(chequeBounceDetailsList[i].billId)
						
						columnArray.push("<td style='text-align: center; verticle-align: middle;'>"+chequeBounceDetailsList[i].moduleName+"</td>")
						columnArray.push("<td style='text-align: center; verticle-align: middle;'>"+chequeBounceDetailsList[i].remark+"</td>")
						columnArray.push("<td style='text-align: center; verticle-align: middle;'>"+chequeBounceDetailsList[i].partyName+"</td>")
						columnArray.push("<td style='text-align: center; verticle-align: middle;'>"+chequeBounceDetailsList[i].chequeDateString+"</td>")
						columnArray.push("<td style='text-align: center; verticle-align: middle;'>"+chequeBounceDetailsList[i].chequeNumber+"</td>")
						columnArray.push("<td style='text-align: center; verticle-align: middle;'>"+chequeBounceDetailsList[i].chequeAmount+"</td>")
						columnArray.push("<td style='text-align: center; verticle-align: middle;'>"+chequeBounceDetailsList[i].bankName+"</td>")
						
						$('#chequeBounceDetailsTable tbody').append('<tr id="masterId_'+chequeBounceDetailsList[i].billId+'">' + columnArray.join(' ') +'</tr>');
					}

					hideLayer();
				}
			});
		});