var topRecords = 0;
define([  'JsonUtility'
          ,'messageUtility'
          ,'/ivcargo/resources/js/generic/urlparameter.js'
          ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/deliveryStockClearMaster/deliveryStockClearMasterFilePath.js'
          ,'jquerylingua'
          ,'language'
          ,'autocomplete'
          ,'autocompleteWrapper'
          ,'slickGridWrapper2'
          ,'nodvalidation'
          ,'focusnavigation'//import in require.config
          ,'selectizewrapper'
          ,'bootstrapSwitch'
		  ,'/ivcargo/resources/js/validation/regexvalidation.js'
          ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
          ,PROJECT_IVUIRESOURCES + '/resources/js/bootstrap/bootstrap-clockpicker.min.js'
          ,PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',
          ],
          function(JsonUtility, MessageUtility, UrlParameter, FilePath,Lingua, Language, AutoComplete, AutoCompleteWrapper,
        		  SlickGridWrapper,NodValidation,ElementFocusNavigation,Selectizewrapper,delBootstrapSwitch,RegexValidation,BootstrapModal,CLOCKPICKER,SelectOption) {
	'use strict';
	var jsonObject = new Object(), 
	myNod,  
	_this = '', 
	savedSuccess,
	masterLangObj, 
	masterLangKeySet,
	gridObject,
	executive,
	isRestrictDateSelection,
	noOfMonthAllow,
	isPercent=false,
	table,
	timeArr,
	DayConstant,
	entered = false,
	minimumLRsToDeliver,
	stoppageTimeHour,
	stoppageTimeMinute,
	hour,
	minute,
	aMPM="am",
	deliverLimitedLRs=false,
	doneTheStuff=false;
	
	
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/DeliveryStockClearMasterWS/getDeliveryStockClearMasterElementConfiguration.do?',_this.setMasterElements, EXECUTE_WITH_ERROR);
			return _this;
		},setMasterElements : function (response){
			var loadelement 	= new Array();
			var baseHtml 		= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/deliveryStockClearMaster/deliveryStockClearMaster.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				stoppageTimeHour		= response.stoppageTimeHour;
				stoppageTimeMinute		= response.stoppageTimeMinute;
				minimumLRsToDeliver		= response.minimumLRsToDeliver;
				topRecords              = response.topRecords;
				
				if(stoppageTimeHour > 12){
					hour 				= stoppageTimeHour - 12;
					aMPM				= "pm";
				}
				if(stoppageTimeMinute == 0){
					minute 				= "00";
				}
				$("*[data-selector='marqueeHeading']").html("Not more than "+minimumLRsToDeliver+" LRs can be Delivered after "+hour+":"+minute+aMPM+".");
				
				
				var deliveryTypeSelect 		= new Array();
				deliveryTypeSelect[0] = {'Id':1,'Value':'Specific LRs'};
				deliveryTypeSelect[1] = {'Id':2,'Value':'Till Receive Date'};

				var filter 		= new Array();
				filter[0] = {'Id':1,'Value':'Deliver given LRs'};
				filter[1] = {'Id':2,'Value':'Deliver all, except given LRs'};

				var crNoSelect 		= new Array();
				crNoSelect[0] = {'Id':1,'Value':'Yes'};
				crNoSelect[1] = {'Id':2,'Value':'No'};
				
				var discountArr		= new Array();
				discountArr[0] = {'Id':1,'Value':'Yes'};
				discountArr[1] = {'Id':2,'Value':'No'};

				var cashStmtEff		= new Array();
				cashStmtEff[0] = {'Id':1,'Value':'Yes'};
				cashStmtEff[1] = {'Id':2,'Value':'No'};
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	deliveryTypeSelect,
					valueField		:	'Id',
					labelField		:	'Value',
					searchField		:	'deliveryTypeEle',
					elementId		:	'deliveryTypeEle',
					create			: 	false,
					maxItems		: 	1,
					onChange		:   _this.onDeliveryTypeSelect
				});

				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	filter,
					valueField		:	'Id',
					labelField		:	'Value',
					searchField		:	'lrDeliveryTypeEle',
					elementId		:	'lrDeliveryTypeEle',
					create			: 	false,
					maxItems		: 	1,
					onChange		:   _this.onLRDeliveryTypeSelect
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	crNoSelect,
					valueField		:	'Id',
					labelField		:	'Value',
					searchField		:	'crNoEle',
					elementId		:	'crNoEle',
					create			: 	false,
					maxItems		: 	1,
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	discountArr,
					valueField		:	'Id',
					labelField		:	'Value',
					searchField		:	'discountEle',
					elementId		:	'discountEle',
					create			: 	false,
					maxItems		: 	1,
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	cashStmtEff,
					valueField		:	'Id',
					labelField		:	'Value',
					searchField		:	'cashStmtEffectEle',
					elementId		:	'cashStmtEffectEle',
					create			: 	false,
					maxItems		: 	1,
				});
				
				var elementConfiguration1				= new Object();
				var data = new Object();
				
				elementConfiguration1.singleDateElement	= $('#deliveryDateEle');
				data.elementConfiguration				= elementConfiguration1;
				data.isCalenderForSingleDate			= true;
				
				SelectOption.setSelectionToGetData(data);
				
				var elementConfiguration				= new Object();
				
				elementConfiguration.singleDateElement	= $('#receiveDateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				elementConfiguration.executiveElement	= $('#executiveEle');
				
				response.elementConfiguration			= elementConfiguration;
				response.sourceAreaSelection			= true;
				response.executiveWithBranchSelection	= true;
				response.executiveListByBranch			= true;
				response.isCalenderForSingleDate		= true;
				response.AllOptionsForRegion			= false;
				response.AllOptionsForSubRegion			= false;
				response.AllOptionsForBranch			= false;
				
				SelectOption.setSelectionToGetData(response);
				
				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector		: '#regionEle',
					validate		: 'presence',
					errorMessage	: 'Select proper Region'
				});
				
				myNod.add({
					selector		: '#subRegionEle',
					validate		: 'presence',
					errorMessage	: 'Select proper SubRegion'
				});
				
				myNod.add({
					selector		: '#branchEle',
					validate		: 'presence',
					errorMessage	: 'Select proper Branch'
				});
				
				myNod.add({
					selector		: '#executiveEle',
					validate		: 'presence',
					errorMessage	: 'Select proper Executive'
				});
				
				myNod.add({
					selector		: '#crNoEle',
					validate		: 'presence',
					errorMessage	: 'Select CR No'
				});
				
				myNod.add({
					selector		: '#discountEle',
					validate		: 'presence',
					errorMessage	: 'Select Delivery Discount'
				});
				
				myNod.add({
					selector		: '#cashStmtEffectEle',
					validate		: 'presence',
					errorMessage	: 'Select Cash Stmt Effect'
				});
				
				myNod.add({
					selector		: '#deliveryTypeEle',
					validate		: 'presence',
					errorMessage	: 'Select Delivery Type'
				});

				var selectize 		= $('#deliveryTypeEle').get(0).selectize;
				var current 		= selectize.setValue(2); 
				
				hideLayer();
				$("#saveBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_this.onSubmit(_this);								
					}
				});
			});
			return _this;
		},onLRDeliveryTypeSelect : function(value) {
			if(value == 2){
				if(!entered){
					entered = true;
					var btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"All the LRs, excluding the given LRs will get Delivered, Are you sure you want to proceed?",
						modalWidth 	: 	30,
						title		:	'Deliver Rest other LRs',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();

					btModalConfirm.on('ok', function() {
						$('#modalBody:first *:input[type!=hidden]:first').focus();
						var selectize 		= $('#lrDeliveryTypeEle').get(0).selectize;
						var current 		= selectize.setValue(2); 
						hideLayer();
						entered = false;
					});

					btModalConfirm.on('cancel', function() {
						$(".ok").removeClass('hide');
						$(".ok").attr("disabled", false);
						var selectize 		= $('#lrDeliveryTypeEle').get(0).selectize;
						var current 		= selectize.setValue(1); 
						hideLayer();
					});
				}
			}
		},onDeliveryTypeSelect : function(value) {
			if(value == 1){
				$("#lrNoDiv").removeClass("hide");
				$("#lrDeliveryType").removeClass("hide");
				
				var selectize 		= $('#lrDeliveryTypeEle').get(0).selectize;
				var current 		= selectize.setValue(1);
				next = 'lrNoFieldEle';
				myNod.add({
					selector		: '#lrNoFieldEle',
					validate		: 'presence',
					errorMessage	: 'Enter LR Numbers'
				});
			} else {
				myNod.remove("#lrNoFieldEle");
				$("#lrNoDiv").addClass("hide");
				$("#lrDeliveryType").addClass("hide");
			}
		},onSubmit : function() {
			$('#saveBtn').hide();
			var jsonObject 	= new Object();
			var lrNumbers	= $('#lrNoFieldEle').val();
			
			jsonObject["stoppageTimeHour"] 		= stoppageTimeHour;
			jsonObject["stoppageTimeMinute"] 		= stoppageTimeMinute;
			jsonObject["minimumLRsToDeliver"] 	= minimumLRsToDeliver;
			jsonObject["deliverLimitedLRs"] 	= deliverLimitedLRs;
			jsonObject["wayBillNumber"] 		= lrNumbers.replace(/\n/g, ",");
			jsonObject["deliveryType"] 			= $('#deliveryTypeEle').val();
			jsonObject["filter"] 				= $('#lrDeliveryTypeEle').val();
			jsonObject["cashStmtEffect"] 		= $('#cashStmtEffectEle').val();
			jsonObject["discount"] 				= $('#discountEle').val();
			jsonObject["lrSelection"]			= $('#lrSelectionEle').val();
			jsonObject["crNo"] 					= $('#crNoEle').val();
			jsonObject["regionId"] 				= $('#regionEle_primary_key').val();
			jsonObject["subRegionId"] 			= $('#subRegionEle_primary_key').val();
			jsonObject["branchId"] 				= $('#branchEle_primary_key').val();
			jsonObject["executiveId"] 			= $('#executiveEle_primary_key').val();
			jsonObject["isDestBranchWise"] 		= $('#destBranchEle').prop('checked');
			jsonObject["topRecords"] 		    = topRecords;
			
			if($("#receiveDateEle").attr('data-date') != undefined){
				jsonObject["receiveDate"] = $("#receiveDateEle").attr('data-date'); 
			} else {
				jsonObject["receiveDate"] = $("#receiveDateEle").attr('data-startdate'); 
			}

			if($("#deliveryDateEle").attr('data-date') != undefined){
				jsonObject["deliveryDate"] = $("#deliveryDateEle").attr('data-date'); 
			} else {
				jsonObject["deliveryDate"] = $("#receiveDateEle").attr('data-startdate'); 
			}

			var btModalConfirm = new Backbone.BootstrapModal({
				content		: 	"Are you sure you want to Deliver all these LRs?",
				modalWidth 	: 	30,
				title		:	'Delivery Stock Clear',
				okText		:	'YES',
				showFooter 	: 	true,
				okCloses	:	true
			}).open();
      
			btModalConfirm.on('ok', function() {
				$('#modalBody:first *:input[type!=hidden]:first').focus();
				if(!doneTheStuff) {
					getJSON(jsonObject, WEB_SERVICE_URL+'/DeliveryStockClearMasterWS/clearPendingDeliveryStock.do', _this.setSavingResponse, EXECUTE_WITH_ERROR);
					doneTheStuff	= true;
					showLayer();
				}
			});

			btModalConfirm.on('cancel', function() {
				$(".ok").removeClass('hide');
				$('#saveBtn').show();
				$(".ok").attr("disabled", false);
				doneTheStuff	= false;
				hideLayer();
			});
			
		},setSavingResponse : function(response){
			if(response.message != undefined){
				setTimeout(function(){
					location.reload();
				},1000);
				hideLayer();
				return;
			}
		}
	});
});