define([  'JsonUtility'
          ,'messageUtility'
          ,'/ivcargo/resources/js/generic/urlparameter.js'
          ,'nodvalidation'
          ,'focusnavigation'//import in require.config
          ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
          ],
          function() {
	'use strict';
	var jsonObject = new Object(), myNod,  _this = '',	configHamaliForVehicleTypeId = 0;
	return Marionette.LayoutView.extend({
		initialize : function(jsonObjectData) {

			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element
			//this object is not found in other function so _this has been created
			_this 				= this;
			jsonObject 			= jsonObjectData.dataView;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/configHamaliMasterForVehicleTypeWS/getConfigHamaliMasterForVehicleTypeElements.do?', _this.setElements, EXECUTE_WITH_ERROR);
		},setElements : function (response){
			configHamaliForVehicleTypeId	= jsonObject.configHamaliForVehicleTypeId;
			
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			
			setTimeout(function(){
				$("#modalBody").load("/ivcargo/html/master/updateConfigHamaliMaster.html",function() {
					baseHtml.resolve();
				});
			},200);
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("show");
				}
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				myNod.add({
					selector		: '#bharaiEle',
					validate		: 'float',
					errorMessage	: 'value should be decimal number'
				});
				
				myNod.add({
					selector		: '#thappiEle',
					validate		: 'float',
					errorMessage	: 'value should be decimal number'
				});

				myNod.add({
					selector		: '#waraiEle',
					validate		: 'float',
					errorMessage	: 'value should be decimal number'
				});
				
				myNod.add({
					selector		: '#utraiEle',
					validate		: 'float',
					errorMessage	: 'value should be decimal number'
				});
				
				myNod.add({
					selector		: '#loadingTimeHamaliEle',
					validate		: 'float',
					errorMessage	: 'value should be decimal number'
				});
			
				myNod.add({
					selector		: '#unloadingTimeHamaliEle',
					validate		: 'float',
					errorMessage	: 'value should be decimal number'
				});
				
				myNod.add({
					selector		: '#loadingPerTonEle',
					validate		: 'float',
					errorMessage	: 'value should be decimal number'
				});
				
				myNod.add({
					selector		: '#unloadingPerTonEle',
					validate		: 'float',
					errorMessage	: 'value should be decimal number'
				});
				
				myNod.add({
					selector		: '#loadingLevyEle',
					validate		: 'float',
					errorMessage	: 'value should be decimal number'
				});
				
				myNod.add({
					selector		: '#thappiLevyEle',
					validate		: 'float',
					errorMessage	: 'value should be decimal number'
				});
				
				$('#bharaiEle').val(jsonObject.bharai);
				$('#thappiEle').val(jsonObject.thappi);
				$('#waraiEle').val(jsonObject.warai);
				$('#utraiEle').val(jsonObject.utrai);
				$('#loadingTimeHamaliEle').val(jsonObject.loadingTimeHamali);
				$('#unloadingTimeHamaliEle').val(jsonObject.unloadingTimeHamali);
				$('#loadingPerTonEle').val(jsonObject.loadingPerTon);
				$('#unloadingPerTonEle').val(jsonObject.unloadingPerTonEle);
				$('#loadingLevyEle').val(jsonObject.loadingLevy);
				$('#thappiLevyEle').val(jsonObject.thappiLevy);
				
				hideLayer();
				
				$("#updateBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onUpdate();								
				});
			});
			return _this;
		}, onUpdate : function() {
			if (confirm('Are you sure you want to Update?')) {
				showLayer();
				
				var jsonObject = new Object();
				
				jsonObject["configHamaliForVehicleTypeId"] 		= configHamaliForVehicleTypeId;
				jsonObject["bharaiEle"] 						= $('#bharaiEle').val();
				jsonObject["thappiEle"] 						= $('#uptdestinationBranchEle').val();
				jsonObject["waraiEle"] 							= $('#upttxnTypeEle').val();
				jsonObject["utraiEle"] 							= $('#utraiEle').val();
				jsonObject["loadingTimeHamaliEle"] 				= $('#chargeTypeMasterEle').val();
				jsonObject["unloadingTimeHamaliEle"] 			= $('#uptbookingTypeEle').val();
				jsonObject["loadingPerTonEle"] 					= $('#uptcommissionTypeEle').val();
				jsonObject["unloadingPerTonEle"] 				= $('#uptvehicleTypeEle').val();
				jsonObject["loadingLevyEle"] 					= $('#uptweightConfigEle').val();
				jsonObject["thappiLevyEle"] 					= $('#uptpackingTypeEle').val();
				
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/configHamaliMasterForVehicleTypeWS/updateConfigHamaliRates.do?', setSuccessAfterUpdate, EXECUTE_WITH_ERROR);
			} else {
				hideLayer();
			}
		},setSuccessAfterUpdate : function(response){
			if(response.message != undefined){
				var MyRouter = new Marionette.AppRouter({});
				MyRouter.navigate('&modulename=configHamaliMasterDetails',{trigger: true});
				location.reload();
				hideLayer();
				return;
			}

			hideLayer();
		}
	});
});