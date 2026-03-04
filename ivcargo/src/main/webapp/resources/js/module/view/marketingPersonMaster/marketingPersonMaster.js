define(
		[
		 'JsonUtility'
		,'messageUtility'
		,PROJECT_IVUIRESOURCES + '/resources/js/module/view/marketingPersonMaster/marketingpersonlanguagefilepath.js'
		,'jquerylingua'
		,'language'
		,'autocomplete'
		,'autocompleteWrapper'
		,'slickGridWrapper3'
		,'bootstrapSwitch'
		,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		,PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'
		,'nodvalidation'
		,'focusnavigation'
		,PROJECT_IVUIRESOURCES + '/resources/js/module/view/marketingPersonMaster/marketingpersonviewall.js'
		],
function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper, slickGridWrapper3, BootstrapSwitch,BootstrapModal, Selection,myNod,
		ElementFocusNavigation, MarkngPerViewAll){
	'use strict';
	var jsonObject 		= new Object(), marketingPersonId = 0,  _this = '', gridObject, masterLangObj, masterLangKeySet, caLangObj, caLangKeySet, myNod, myNod2 
	,LangKeySet
	,isAllowToSave 		= true
	,isAllowToUpdate	= false
	,isAllowToDelete	= false;
	return Marionette.LayoutView
	.extend({
		initialize : function(masterObj) {
			_this = this;
		},
		render : function() {
			showLayer();
			getJSON(null, WEB_SERVICE_URL	+ '/MarketingPersonMasterWS/getMarketingPersonMasterElements.do?',	_this.renderMarketingPersonMasterElements, EXECUTE_WITH_ERROR);
			return _this;
		},renderMarketingPersonMasterElements : function(response) {
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/marketingPersonMaster/MarketingPersonMaster.html", function() {
				baseHtml.resolve();
			});
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				var marketingMasterProperties		= response.marketingPersonConfiguration;
				var keyObject 						= Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show == false) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("hide");
					}
					
					if (response[keyObject[i]].show == true) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("show");
					}
					
					if (response[keyObject[i]].validate == true) {
						$("*[data-attribute="+ keyObject[i]+ "]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
					}
				}
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				myNod2 = nod();
				myNod2.configure({
					parentClass:'validation-message'
				});
				
				
				var marketingPersonNameAutoComplete 			= new Object();
				marketingPersonNameAutoComplete.primary_key 	= 'marketingPersonId';
				marketingPersonNameAutoComplete.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getMarketingPersonsList.do';
				marketingPersonNameAutoComplete.callBack 		= _this.getMarketingPersonData;
				marketingPersonNameAutoComplete.field 			= 'marketingPersonName';
				$("#searchMarketingPersonEle").autocompleteCustom(marketingPersonNameAutoComplete);
				
				
				var elementConfiguration	= new Object();

				elementConfiguration.stateElement		= $('#marketingPersonStateEle');
				elementConfiguration.cityElement		= $('#marketingPersonCityEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');

				response.elementConfiguration	= elementConfiguration;
				response.sourceAreaSelection	= true;
				response.isPhysicalBranchesShow	= true;
				response.AllOptionsForSubRegion	= false;
				response.AllOptionsForBranch	= false;
				response.cityWithStateSelection	= true;
				
				var regionSubregionBranchSelectionToAllUser	= marketingMasterProperties.regionSubregionBranchSelectionToAllUser;
				if(regionSubregionBranchSelectionToAllUser){
					response.executive.executiveType	= EXECUTIVE_TYPE_GROUPADMIN;
				}
				Selection.setSelectionToGetData(response);
				
				if($("#regionEle_primary_key").val() == undefined){
					$("*[data-attribute=Region").addClass("hide");
					$("*[data-attribute=Region").removeClass("show");
				}
				if($("#subRegionEle_primary_key").val() == undefined){
					$("*[data-attribute=SubRegion").addClass("hide");
					$("*[data-attribute=SubRegion").removeClass("show");
				}
				if($("#branchEle_primary_key").val() == undefined){
					$("*[data-attribute=Branch").empty();
					for(var l=0; l < response.branchList.length; l++){
						if(response.branchList[l].branchId == response.executive.branchId){
							branchName = response.branchList[l].branchName;
						}
					}
					$('*[data-attribute=Branch').append("<label class='control-label' style='width:50%;font-size:15px;'><span id='branch'>Branch : "+branchName+"</span></label>");
				}
				
				if (executive.executiveType == EXECUTIVE_TYPE_GROUPADMIN) {
					myNod.add({
						selector		: '#regionEle',
						validate		: 'validateAutocomplete:#regionEle_primary_key',
						errorMessage	: 'Select proper Region !'
					});

					myNod.add({
						selector		: '#subRegionEle',
						validate		: 'validateAutocomplete:#subRegionEle_primary_key',
						errorMessage	: 'Select proper Area !'
					});

					myNod.add({
						selector		: '#branchEle',
						validate		: 'validateAutocomplete:#branchEle_primary_key',
						errorMessage	: 'Select proper Branch !'
					});

					myNod.add({
						selector		: '#partNameEle',
						validate		: 'validateAutocomplete:#partyNameEle',
						errorMessage	: 'Enter Party name !'
					});
				}
				if (executive.executiveType == EXECUTIVE_TYPE_REGIONADMIN) {
					myNod.add({
						selector		: '#subRegionEle',
						validate		: 'validateAutocomplete:#subRegionEle_primary_key',
						errorMessage	: 'Select proper Area !'
					});
					
					myNod.add({
						selector		: '#branchEle',
						validate		: 'validateAutocomplete:#branchEle_primary_key',
						errorMessage	: 'Select proper Branch !'
					});
					
				}
				if (executive.executiveType == EXECUTIVE_TYPE_SUBREGIONADMIN) {
					myNod.add({
						selector		: '#branchEle',
						validate		: 'validateAutocomplete:#branchEle_primary_key',
						errorMessage	: 'Select proper Branch !'
					});
					
				}
				
				 $('#saveBtn').click( function(){
					 if(isAllowToSave){
						 myNod.performCheck();
						 if(myNod.areAll('valid')) {
							 _this.onSubmit();
						 }
					 }
				 });
				 $('#updateBtn').click( function(){
					 if(isAllowToUpdate){
						 myNod2.add({
							 selector		: '#searchMarketingPersonEle',
							 validate		: 'validateAutocomplete:#searchMarketingPersonEle_primary_key',
							 errorMessage	: 'Please Select Marketing Person!'
						 });
						 myNod2.performCheck();
						 if(myNod2.areAll('valid')) {
							 _this.onUpdate();
						 }
					 }
				 });
				 $('#deleteBtn').click( function(){
					 if(isAllowToDelete){ 
						 myNod2.add({
								selector		: '#searchMarketingPersonEle',
								validate		: 'validateAutocomplete:#searchMarketingPersonEle_primary_key',
								errorMessage	: 'Please Select  Marketing Person!'
							});
						 myNod2.performCheck();
						 if(myNod2.areAll('valid')) {
							 _this.onDelete();
						}
					 }
				 });
				 $('#resetBtn').click( function(){
					 _this.resetElement();
				 });
				 $('#viewAllBtn').click( function(){
					 _this.viewAllMarketingPersonsData();
				 });
				
				var langObj 				= FilePath.loadLanguage();
				caLangKeySet 				= loadLanguageWithParams(langObj);
				_this.validateFields(response);
				_this.resetElement();
				hideLayer();
			});
			
			
		},onSubmit : function () {
			jsonObject = new Object();
			var $inputs = $('#details :input');
			$inputs.each(function(index) {
				if ($(this).val() != "") {
					if($(this).attr('name').split('E')[1] == 'le_primary_key'){
						jsonObject[$(this).attr('name').split('E')[0]+'Id'] = $.trim($(this).val());
					} else {
						jsonObject[$(this).attr('name').split('E')[0]] 		= $.trim($(this).val());
					}
				}
			});
			console.log("jsonObject",jsonObject);
			var btModalConfirm = new Backbone.BootstrapModal({
				content		: 	"Are you sure you want to save the Marketing Person ?",
				modalWidth 	: 	30,
				title		:	'Save Party',
				okText		:	'YES',
				showFooter 	: 	true,
				okCloses	:	true
			}).open();

			btModalConfirm.on('ok', function() {
				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL + '/MarketingPersonMasterWS/insertMarketingPersonData.do?',_this.afterSave, EXECUTE_WITH_ERROR);

			});
		},afterSave : function (response){
			if(response.marketingPersonId == undefined || response.marketingPersonId == 0){
				showMessage('error',response.message.description);
				hideLayer();
				return false;
			}
			showMessage('success','Data Inserted Successfully !');
			_this.resetElement();
			
		},resetElement : function (){
			var $inputs = $('#details :input');
			$inputs.each(function() {
				$(this).val("");
			});
			$("#searchMarketingPersonEle").val("");
			$("#searchMarketingPersonEle_Primary_key").val("");
			$("#saveBtn").removeClass("disabled");
			$("#updateBtn").addClass("disabled");
			$("#deleteBtn").addClass("disabled");
			isAllowToSave 		= true;
			isAllowToUpdate		= false;
			isAllowToDelete		= false;
			hideLayer();
			
		},onUpdate : function (){
			jsonObject 						= new Object();
			jsonObject.marketingPersonId	= $("#searchMarketingPersonEle_primary_key").val();
			var $inputs = $('#details :input');
			$inputs.each(function(index) {
				if ($(this).val() != "") {
					if($(this).attr('name').split('E')[1] == 'le_primary_key'){
						jsonObject[$(this).attr('name').split('E')[0]+'Id'] = $.trim($(this).val());
					} else {
						jsonObject[$(this).attr('name').split('E')[0]] = $.trim($(this).val());
					}
				}
			});
			console.log("jsonObject for update",jsonObject);
			var btModalConfirm = new Backbone.BootstrapModal({
				content		: 	"Are you sure you want to Update the Marketing Person ?",
				modalWidth 	: 	30,
				title		:	'Update Party',
				okText		:	'YES',
				showFooter 	: 	true,
				okCloses	:	true
			}).open();

			btModalConfirm.on('ok', function() {
				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL + '/MarketingPersonMasterWS/updateMarketingPersonData.do?',_this.afterUpdate, EXECUTE_WITH_ERROR);
			});
			
		},afterUpdate : function(response){
			if(response.message != undefined && response.message.type == 2){
				showMessage('error',response.message.description);
				hideLayer();
				return false;
			}
			_this.resetElement();
			hideLayer();
			
		},onDelete : function(){
			jsonObject 						= new Object();
			jsonObject.marketingPersonId	= $("#searchMarketingPersonEle_primary_key").val();
			
			console.log("jsonObject",jsonObject);
			var btModalConfirm = new Backbone.BootstrapModal({
				content		: 	"Are you sure you want to Delete the Marketing Person ?",
				modalWidth 	: 	30,
				title		:	'Delete Party',
				okText		:	'YES',
				showFooter 	: 	true,
				okCloses	:	true
			}).open();

			btModalConfirm.on('ok', function() {
				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL + '/MarketingPersonMasterWS/deleteMarketingPersonData.do?',_this.afterDelete, EXECUTE_WITH_ERROR);
			});
			
		},afterDelete : function(){
			
			$("#saveBtn").removeClass("disabled");
			$("#saveBtn").bind("click");
			$("#updateBtn").addClass("disabled");
			$("#deleteBtn").addClass("disabled");
			$("#updateBtn").unbind("click");
			$("#deleteBtn").unbind("click");
			_this.resetElement();
			hideLayer();
			
		},getMarketingPersonData : function(){
			showLayer();
			marketingPersonId 			 = $("#searchMarketingPersonEle_primary_key").val();
			var jsonObject 				 = new Object();
			jsonObject.marketingPersonId = marketingPersonId;
			getJSON(jsonObject, WEB_SERVICE_URL + '/MarketingPersonMasterWS/getMarketingPersonDataById.do?', _this.setAllDetails, EXECUTE_WITH_ERROR);
		
		},setAllDetails : function(response){
			if(response.marketingPerson == undefined || response.marketingPerson == null){
				showMessage('error',response.message.description);
				hideLayer();
				return false;
			}
			var marketingPerson 	= response.marketingPerson;
			
			$("#regionEle").val(marketingPerson.regionName);
			$("#regionEle_primary_key").val(marketingPerson.regionId);
			$("#subRegionEle").val(marketingPerson.subRegionName);
			$("#subRegionEle_primary_key").val(marketingPerson.subRegionId);
			$("#branchEle").val(marketingPerson.branchName);
			$("#branchEle_primary_key").val(marketingPerson.branchId);
			$("#marketingPersonAddressEle").val(marketingPerson.marketingPersonAddress);
			$("#MobileNumberEle").val(marketingPerson.marketingPersonMobileNumber);
			$("#PhoneNumberEle").val(marketingPerson.marketingPersonPhonNumber);
			$("#marketingPersonNameEle").val(marketingPerson.marketingPersonName);
			
			$("#saveBtn").addClass("disabled");
			$("#updateBtn").removeClass("disabled");
			$("#deleteBtn").removeClass("disabled");
			isAllowToSave 		= false;
			isAllowToUpdate		= true;
			isAllowToDelete		= true;
			hideLayer();
			
		},validateFields : function(data) {
			
			var keyObject = Object.keys(data);
			for (var i = 0; i < keyObject.length; i++) {
				if (data[keyObject[i]].validate == true) {
					if(keyObject[i] == 'MarketingPersonName'){
						myNod.add({
							selector		: '#marketingPersonNameEle',
							validate		: 'presence',
							errorMessage	: 'Please Enter Name!'
						});
					} else if(keyObject[i] == 'MarketingPersonAddress'){
						myNod.add({
							selector		: '#marketingPersonAddressEle',
							validate		: 'presence',
							errorMessage	: 'Please Enter Address!'
						});
					} else if(keyObject[i] == 'MarketingPersonPhonNumber'){
						myNod.add({
							selector		: '#PhoneNumberEle',
							validate		: ['integer','min-length:10','max-length:12'],
							errorMessage	: ['Please Enter Phone No','Minimum Length should 10','Max Length should be 10']
						});
					} else if(keyObject[i] == 'MarketingPersonMobileNumber'){
						myNod.add({
							selector		: '#MobileNumberEle',
							validate		: ['integer','min-length:10','max-length:10'],
							errorMessage	: ['Please Enter Mobile No','Minimum Length should 10','Max Length should be 10']
						});
					} else if(keyObject[i] == 'MarketingPersonState'){
						myNod.add({
							selector		: '#marketingPersonStateEle',
							validate		: 'validateAutocomplete:#marketingPersonStateEle_primary_key',
							errorMessage	: 'Please Select State!'
						});
					} else if(keyObject[i] == 'MarketingPersonCity'){
						myNod.add({
							selector		: '#marketingPersonCityEle',
							validate		: 'validateAutocomplete:#marketingPersonCityEle_primary_key',
							errorMessage	: 'Please Select City!'
						});
					} /*else if(keyObject[i] == 'Region'){
						myNod.add({
							selector		: '#regionEle',
							validate		: 'validateAutocomplete:#regionEle_primary_key',
							errorMessage	: 'Please Select Region!'
						});
					} else if(keyObject[i] == 'SubRegion'){
						myNod.add({
							selector		: '#subRegionEle',
							validate		: 'validateAutocomplete:#subRegionEle_primary_key',
							errorMessage	: 'Please Select SubRegion!'
						});
					} else if(keyObject[i] == 'Branch'){
						myNod.add({
							selector		: '#branchEle',
							validate		: 'validateAutocomplete:#branchEle_primary_key',
							errorMessage	: 'Please Select Branch!'
						});
					}*/
				}
			}
		}, viewAllMarketingPersonsData : function(){
			showLayer();
			var jsonObject 		= new Object();
			var btModal 		= new Backbone.BootstrapModal({
				content: 		  new MarkngPerViewAll(),
				modalWidth : 90,
				title:'All Marketing Persons'

			}).open();
			jsonObject.btModal = btModal;
			new MarkngPerViewAll(jsonObject)
			btModal.open();
		}
	
	});
});