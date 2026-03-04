define(
		[
			'slickGridWrapper2',
			PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
			'selectizewrapper',
			PROJECT_IVUIRESOURCES+'/resources/js/module/view/partyAgentCommissionRateMaster/partyAgentCommissionRateMasterDetails.js',
			'JsonUtility',
			'messageUtility',
			'autocomplete',
			'autocompleteWrapper',
			'nodvalidation',
			'focusnavigation',
			PROJECT_IVUIRESOURCES+'/resources/js/backbone/backbone.bootstrap-modal.js',
			PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'//PopulateAutocomplete
			],//PopulateAutocomplete

			function(slickGridWrapper2, UrlParameter, Selectizewrapper, PartyAgentCommisionRateDetails) {
			'use strict';

			var jsonObject = new Object(),
			myNod,
			_this = '',
			gridObject,
			groupConfiguration,
			showViewAllPartyAgentCommisionRate = false,
			dataUpdated = false,
			savedSuccess = false,
			dataDeleted = false;

			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
					savedSuccess 						= UrlParameter.getModuleNameFromParam('savedSuccess');
					showViewAllPartyAgentCommisionRate	= UrlParameter.getModuleNameFromParam('updateCount');
					dataUpdated 						= UrlParameter.getModuleNameFromParam('dataUpdate');
					dataDeleted 						= UrlParameter.getModuleNameFromParam('dataDelete');

				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/partyAgentCommissionRateMasterWS/getPartyAgentCommisionRateElement.do?',	_this.setPartyAgentCommisionElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, setPartyAgentCommisionElements : function(response) {
					showLayer();
					
					var loadelement 		= new Array();
					var baseHtml 			= new $.Deferred();
					groupConfiguration		= response;
					
					loadelement.push(baseHtml);
					$("#mainContent").load("/ivcargo/html/module/partyAgentCommissionRateMaster/partyAgentCommissionRateMaster.html",function() {
						baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						hideLayer();
						
						$("#middle-border-boxshadow").hide();
						$("#bottom-border-boxshadow").css("opacity", 0);

						var partyAgentAutoComplete 			= new Object();
						partyAgentAutoComplete.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getPartyAgentCommisionAutocomplete.do?';
						partyAgentAutoComplete.primary_key 	= 'partyAgentCommisionId';
						partyAgentAutoComplete.field 		= 'displayName';
						$("#partyAgentCommisionEle").autocompleteCustom(partyAgentAutoComplete);

						Selectizewrapper.setAutocomplete({
							jsonResultList	: 	response.commissionTypeArr,
							valueField		:	'commisionTypeId',
							labelField		:	'commisionTypeName',
							searchField		:	'commisionTypeName',
							elementId		:	'commisionTypeEle',
							create			: 	false,
							maxItems		: 	1,
							onChange		: _this.onCommissionTypeSelect
						});

						Selectizewrapper.setAutocomplete({
							jsonResultList	: 	response.weightConfigList,
							valueField		:	'weightConfigId',
							labelField		:	'weightConfigName',
							searchField		:	'weightConfigName',
							elementId		:	'weightConfigEle',
							create			: 	false,
							maxItems		: 	1
						});
						
						if(groupConfiguration.showPackingGroupSelection) {
							if(groupConfiguration.showPackingGroupSelectionWithPackingType) {
								Selectizewrapper.setAutocomplete({
									jsonResultList	: 	response.packingGroupTypeList,
									valueField		:	'packingGroupTypeId',
									labelField		:	'packingGroupTypeName',
									searchField		:	'packingGroupTypeName',
									elementId		:	'packingGroupEle',
									create			: 	false,
									maxItems		: 	1,
									onChange		: _this.onPackingGroupSelect
								});
							} else {
								Selectizewrapper.setAutocomplete({
									jsonResultList	: 	response.packingGroupTypeList,
									valueField		:	'packingGroupTypeId',
									labelField		:	'packingGroupTypeName',
									searchField		:	'packingGroupTypeName',
									elementId		:	'packingGroupEle',
									create			: 	false,
									maxItems		: 	response.packingTypeForGroupList.length
								});
							}
						} else {
							Selectizewrapper.setAutocomplete({
								jsonResultList	: 	response.packingTypeForGroupList,
								valueField		:	'typeOfPackingMasterId',
								labelField		:	'packingTypeName',
								searchField		:	'packingTypeName',
								elementId		:	'packingTypeEle',
								create			: 	false,
								maxItems		: 	response.packingTypeForGroupList.length
							});
						}

						
						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});

						myNod.add({
							selector		: '#partyAgentCommisionNameEle',
							validate		: 'presence',
							errorMessage	: 'Enter Name !'
						});
						myNod.add({
							selector: '#commisionTypeEle',
							validate: 'validateAutocomplete:#commisionTypeEle',
							errorMessage: 'Select Proper Commission Type !'
						});
						myNod.add({
							selector: '#commissionValueEle',
							validate: 'presence',
							errorMessage: 'Please Enter Amount'
						});
						
						$("#saveBtn").click(function() {
							myNod.performCheck();
							if(myNod.areAll('valid')) {
								_this.savePartyAgentCommision(_this);
							}
						});

						$("#viewAllPartyAgent").click(function() {
							_this.viewAllPartyAgentCommisionRate();
						});

						$("#add").click(function(){
							_this.addPartyAgentCommision();
						});

						if((showViewAllPartyAgentCommisionRate == 'true' || showViewAllPartyAgentCommisionRate == true)) {
							_this.viewAllPartyAgentCommisionRate();
						}
						
						if(savedSuccess != null && (savedSuccess == 'true' || savedSuccess == true)) {
							showMessage('success','Data Saved Successfully !');
						} else if(dataUpdated != null && (dataUpdated == 'true' || dataUpdated == true)) {
							showMessage('success','Data Updated Successfully !');
						} else if(dataDeleted != null && (dataDeleted == 'true' || dataDeleted == true)) {
							showMessage('success','Data Deleted Successfully !');
						}
					});
				},onCommissionTypeSelect : function (){
					if($('#commisionTypeEle').val() == 5){
						$('#weightConfigId').removeClass('hide');
						$("#weightConfigEle").prop('disabled', false);
						myNod.add({
							selector: '#weightConfigEle',
							validate: 'presenceIfNotDisable:#weightConfigEle',
							errorMessage: 'Select Proper Weight Config !'
						});
					}else{
						$('#weightConfigId').addClass('hide');
						$("#weightConfigEle").prop('disabled', true);
					}
					
					if($('#commisionTypeEle').val() == 4){
						if(groupConfiguration.showPackingGroupSelection) {
							$('#packingGroupId').removeClass('hide');
							$("#packingGroupEle").prop('disabled', false);
							myNod.add({
								selector: '#packingGroupEle',
								validate: 'presenceIfNotDisable:#packingGroupEle',
								errorMessage: 'Select Proper Packing Group !'
							});
						} else {
							$('#packingTypeId').removeClass('hide');
							$("#packingTypeEle").prop('disabled', false);
							myNod.add({
								selector: '#packingTypeEle',
								validate: 'presenceIfNotDisable:#packingTypeEle',
								errorMessage: 'Select Proper Packing Type !'
							});
						}
					}else{
						if(groupConfiguration.showPackingGroupSelection) {
							$('#packingGroupId').addClass('hide');
							$("#packingGroupEle").prop('disabled', true);
						} else {
							$('#packingTypeId').addClass('hide');
							$("#packingTypeEle").prop('disabled', true);
						}
					}
				},onPackingGroupSelect : function (){
					
					var jsonObject = new Object();

					jsonObject["packingGroupMaster"] 		= $('#packingGroupEle').val();
					
					getJSON(jsonObject, WEB_SERVICE_URL + '/partyAgentCommissionRateMasterWS/getPackingTypeByPackingGroupId.do', _this.setPackingTypeForGroup, EXECUTE_WITH_ERROR);
				}, setPackingTypeForGroup : function(response) {
					
					$('#packingTypeId').removeClass('hide');
					$("#packingTypeEle").prop('disabled', false);
					myNod.add({
						selector: '#packingTypeEle',
						validate: 'presenceIfNotDisable:#packingTypeEle',
						errorMessage: 'Select Proper Packing Type !'
					});
					
					Selectizewrapper.setAutocomplete({
						jsonResultList	: 	response.packingTypeForGroupList,
						valueField		:	'typeOfPackingMasterId',
						labelField		:	'packingTypeName',
						searchField		:	'packingTypeName',
						elementId		:	'packingTypeEle',
						create			: 	false,
						maxItems		: 	response.packingTypeForGroupList.length
					});
				}, savePartyAgentCommision : function() {
					showLayer();
					var jsonObject = new Object();

					jsonObject["partyAgentCommisionId"] 	= $('#partyAgentCommisionEle_primary_key').val();
					jsonObject["commisionTypeId"] 			= $('#commisionTypeEle').val();
					jsonObject["weightConfigId"] 			= $('#weightConfigEle').val();
					jsonObject["packingTypeMasterStr"] 		= $('#packingTypeEle').val();
					jsonObject["packingGroupMasterStr"] 	= $('#packingGroupEle').val();
					jsonObject["commisionValue"] 			= $('#commissionValueEle').val();
					
					getJSON(jsonObject, WEB_SERVICE_URL + '/partyAgentCommissionRateMasterWS/addPartyAgentCommisionRate.do', _this.afterSave, EXECUTE_WITH_ERROR);
				},afterSave	: function(response) {
					if(response.message != undefined){
						var errorMessage = response.message;
						//showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
						var MyRouter = new Marionette.AppRouter({});
						MyRouter.navigate('&modulename=partyAgentCommisionRateMaster&savedSuccess=true',{trigger: true});
						location.reload();
						hideLayer();
						return;
					}
				},viewAllPartyAgentCommisionRate	: function() {
					showLayer();
					getJSON(jsonObject, WEB_SERVICE_URL + '/partyAgentCommissionRateMasterWS/getAllPartyAgentCommisionRateDetails.do', _this.setAllPartyAgentCommisionRate, EXECUTE_WITH_ERROR);
				},setAllPartyAgentCommisionRate	: function(response) {
					if(response.message != undefined){
						hideLayer();
						return;
					}

					if(response.CorporateAccount != undefined && response.CorporateAccount.length > 0) {
						gridObject = slickGridWrapper2.setGrid(response);
					}

					gridObject.onDblClick.subscribe(function (e, args){
						var cell = gridObject.getCellFromEvent(e)
						var row = cell.row;
						var dataView = gridObject.getData();
						var item = dataView.getItem(row);
						_this.getDataPopForUpdate(item,response);
					});
					
					$("#middle-border-boxshadow").hide();
					$("#bottom-border-boxshadow").hide();
					$("#bottom-border-boxshadow").css("opacity", 1);
					$("#bottom-border-boxshadow").toggle("slide", { direction: "up" }, 500);
					
					hideLayer();
				},addPartyAgentCommision	: function() {

					$("#middle-border-boxshadow").hide();
					$("#bottom-border-boxshadow").css("opacity", 0);
					$("#middle-border-boxshadow").removeClass("hide");
					$("#middle-border-boxshadow").toggle("slide", { direction: "left" }, 500);
					
				},getDataPopForUpdate:function(item){
					var jsonObject = new Object();

					if(item.partyAgentCommisionRateId != undefined && item.partyAgentCommisionRateId > 0) {
						jsonObject["partyAgentCommisionRateId"] 		= item.partyAgentCommisionRateId;
					}

					var object 			= new Object();
					object.elementValue = jsonObject;

					var btModal = new Backbone.BootstrapModal({
						content: new PartyAgentCommisionRateDetails(object),
						modalWidth : 60,
						title:'Update / Delete Party Agent Commision Rate'

					}).open();
					object.btModal = btModal;
					new PartyAgentCommisionRateDetails(object)
					btModal.open();
				}
			});
		});