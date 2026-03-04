define([
        'marionette'
        ,'constant'
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/master/filepath/macAddressMasterFilePath.js'
        ,'jquerylingua'
        ,'language'
        ,'errorshow'
        ,'JsonUtility'
        ,'messageUtility'
        ,'nodvalidation'
        ,'validation'
        ,'autocompleteWrapper'
        ,'focusnavigation'
        ,'slickGridWrapper3'
        ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'//PopulateAutocomplete
        ], function(Marionette,Constant,FilePath,jquerylingua,
        		Language,errorshow,JsonUtility,MessageUtility,NodValidation,Validation,AutocompleteUtils,ElementFocusNavigation,SlickGridWrapper3,Selection){
	'use strict'; 
	var LangKeySet,
	myNod,
	macIpAddressConfiguration,
	ipAddressValidationId,
	_this;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			this.$el.html(this.template);
		}, render : function() {
			getJSON(null, WEB_SERVICE_URL	+ '/macAddressMasterWS/getMacAddressElementConfiguration.do?',	_this.setElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setElements: function(response) {
			var jsonObject 		= new Object();
			var loadelement 	= new Array();
			var baseHtml 		= new $.Deferred();
			loadelement.push(baseHtml);
		
			$("#mainContent").load("/ivcargo/html/master/macaddressmaster.html",
					function() {
						baseHtml.resolve();
			});
			
			var executive				= response.executive;
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				var keyObject 		= Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show == false) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("hide");
					}
				}
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				macIpAddressConfiguration	= response['macIpAddressConfiguration'];
				
				_this.setCreateData(response);
				
				var langObj 				= FilePath.loadLanguage();
				LangKeySet 					= loadLanguageWithParams(langObj);
				
				hideLayer();
			});
		}, setCreateData : function(response) {
			var elementConfiguration	= new Object();
			
			response.executiveWithBranchSelection	= true;
			response.executiveListByBranch			= true;
			
			elementConfiguration.branchElement		= $('#branchEle');
			elementConfiguration.executiveElement	= $('#executiveEle');
			
			response.elementConfiguration			= elementConfiguration;
			
			Selection.setSelectionToGetData(response);
			
			myNod.add({
				selector		: '#branchEle',
				validate		: 'validateAutocomplete:#branchEle_primary_key',
				errorMessage	: 'Select Valid Branch !'
			});
			
			myNod.add({
				selector		: '#executiveEle',
				validate		: 'validateAutocomplete:#executiveEle_primary_key',
				errorMessage	: 'Select Valid Executive !'
			});
			
			myNod.add({
				selector		: '#macAddressEle',
				validate		: 'presence',
				errorMessage	: 'Enter Mac Address'
			});
			
			if (macIpAddressConfiguration.Description) {
				myNod.add({
					selector		: '#macAddressDesEle',
					validate		: 'presence',
					errorMessage	: 'Enter Description'
				});
			}
			
			if(macIpAddressConfiguration.MacAddressByBranchLevel) {
				$('#updateDiv').empty();
				$('#deleteDiv').empty();
			}
			
			$('#executiveEle').change(function() {
				_this.getMacAddressDetails();
			})

			$("#saveBtn").click(function() {
				myNod.performCheck();
				
				if(myNod.areAll('valid')) {
					_this.saveMacAddressDetails();
				}
			});
			
			$("#updateBtn").click(function() {
				myNod.performCheck();
				
				if(myNod.areAll('valid')) {
					_this.updateMacAddressDetails();
				}
			});
			
			$("#deleteBtn").click(function() {
				myNod.performCheck();
				
				if(myNod.areAll('valid')) {
					_this.deleteMacAddressDetails();
				}
			});
		},setButtons : function(flag) {
			if (flag == false) {
				$("#saveBtn").addClass("disabled");
				$("#deleteBtn").removeClass("disabled");
				$('#updateBtn').removeClass("disabled");
			} else if(flag == true) {
				$("#saveBtn").removeClass("disabled");
				$("#deleteBtn").addClass("disabled");
				$('#updateBtn').addClass("disabled");
			}
		},showResponseAfterOperation : function (response) {
			if (response.message != undefined) {
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				$("#macAddressEle").val("");
				$("#macAddressDesEle").val("");
				$("#saveBtn").removeClass("disabled");
				return;
			}
			
			hideLayer();
		}, getMacAddressDetails : function () {
			var jsonObject	= new Object();
			
			var $inputs = $('#top-border-boxshadow :input');
			$inputs.each(function (index){if($(this).val() != ""){jsonObject[$(this).attr('name')] = $.trim($(this).val());}});
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/macAddressMasterWS/getMacAddressByExecutiveId.do', _this.setForEdit, EXECUTE_WITH_ERROR);
		}, setForEdit : function (response) {
			var macIPAddressMaster	= response.MacIPAddressMaster;
			
			if(macIPAddressMaster != undefined || response.MacIPAddressMasterList != undefined) {
				if(macIpAddressConfiguration.MacAddressByUserLevel) {
					ipAddressValidationId	= macIPAddressMaster.ipAddressValidationId;
					$("#macAddressEle").val(macIPAddressMaster.macAddress);
					$("#macAddressDesEle").val(macIPAddressMaster.description);
					
					_this.setButtons(false);
				} else {
					if(response.MacIPAddressMasterList != undefined && response.MacIPAddressMasterList.CorporateAccount != undefined) {
						
						$("#bottom-border-boxshadow").removeClass("hide");
						
						var ColumnConfig 			= response.MacIPAddressMasterList.columnConfiguration;
						var columnKeys				= _.keys(ColumnConfig);
	
						var bcolConfig				= new Object();
	
						for (var i = 0; i < columnKeys.length; i++) {
							var bObj	= ColumnConfig[columnKeys[i]];
	
							if (bObj.show == true) {
								bcolConfig[columnKeys[i]] = bObj;
							}
						}
	
						response.MacIPAddressMasterList.columnConfiguration		= _.values(bcolConfig);
						response.MacIPAddressMasterList.Language				= LangKeySet;
	
						gridObject = SlickGridWrapper3.applyGrid(
								{
									ColumnHead					: response.MacIPAddressMasterList.columnConfiguration, // *compulsory // for table headers
									ColumnData					: _.values(response.MacIPAddressMasterList.CorporateAccount), 	// *compulsory // for table's data
									Language					: response.MacIPAddressMasterList.Language, 			// *compulsory for table's header row language
									ShowPrintButton				: false,
									ShowCheckBox				: false,
									removeSelectAllCheckBox		: 'false',
									fullTableHeight				: true,
									rowHeight 					: 	30,
									DivId						: 'MacDetailsDiv',				// *compulsary field // division id where slickgrid table has to be created
									SerialNo:[{						// optional field // for showing Row number
										showSerialNo	: false,
										searchFilter	: false,          // for search filter on serial no
										ListFilter		: false				// for list filter on serial no
									}],
									InnerSlickId				: 'editReportDivInner', // Div Id
									InnerSlickHeight			: '250px',
									NoVerticalScrollBar			: false //optional for no vertical scrolling & if set true remove height attribute to Grid Div
								});
					}
				}
			} else {
				_this.setButtons(true);
			}
		}, saveMacAddressDetails : function() {
			if (confirm("Are you sure?")) {
				showLayer();

				var jsonObject = _this.getData();
				
				getJSON(jsonObject, WEB_SERVICE_URL+'/macAddressMasterWS/saveMacAddressDetails.do', _this.showResponseAfterOperation, EXECUTE_WITH_ERROR);
			}
		}, updateMacAddressDetails : function() {
			if (confirm("Are you sure?")) {
				showLayer();

				var jsonObject = _this.getData();
				
				jsonObject.ipAddressValidationId	= ipAddressValidationId;
				
				getJSON(jsonObject, WEB_SERVICE_URL+'/macAddressMasterWS/updateMacAddressDetails.do', _this.showResponseAfterOperation, EXECUTE_WITH_ERROR);
			}
		}, deleteMacAddressDetails : function() {
			if (confirm("Are you sure?")) {
				showLayer();
				var jsonObject = new Object();
				
				jsonObject.ipAddressValidationId	= ipAddressValidationId;
			
				getJSON(jsonObject, WEB_SERVICE_URL+'/macAddressMasterWS/deleteMacAddressDetails.do', _this.showResponseAfterOperation, EXECUTE_WITH_ERROR);
			}
		}, getData : function() {
			var jsonObject	= new Object();
			
			var $inputs = $('#top-border-boxshadow :input');
			$inputs.each(function (index){if($(this).val() != ""){jsonObject[$(this).attr('name')] = $.trim($(this).val());}});
		
			var $inputs = $('#middle-border-boxshadow :input');
			$inputs.each(function (index){if($(this).val() != ""){jsonObject[$(this).attr('name')] = $.trim($(this).val());}});
			
			return jsonObject;
		}
	});
});