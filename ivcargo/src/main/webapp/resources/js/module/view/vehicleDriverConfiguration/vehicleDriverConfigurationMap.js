define([
	'marionette'
    ,'JsonUtility'
    ,'messageUtility'
    ,'/ivcargo/resources/js/generic/urlparameter.js'
    ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/vehicleDriverConfiguration/vehicleDriverMappingConfigurationFilePath.js'
    ,'jquerylingua'
    ,'language'
    ,'nodvalidation'
	 ,'focusnavigation'
	 ,'selectizewrapper',
	 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
	 '/ivcargo/resources/js/module/redirectAfterUpdate.js'
],function(Marionette, JsonUtility, MessageUtility, UrlParameter, FilePath, jquerylingua, language, NodValidation, FocusNavigation, Selectizewrapper,BootstrapModal){
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	vehicleNumberMasterId,
	vehicleDriverMapIds,
	myNod,
	_this = '';
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			//initialize is the first function called on call new view()
			_this = this;
			vehicleNumberMasterId 				= UrlParameter.getModuleNameFromParam('vehicleNumberMasterId');
			
			jsonObject.vehicleNumberMasterId	= vehicleNumberMasterId;
		},render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/driverWS/getDriverListToUpdate.do?', _this.renderDriverListToMap, EXECUTE_WITHOUT_ERROR);
			return _this;
		},renderDriverListToMap : function(response){
			console.log('response.driverMasterList.length ',response.driverMasterList.length);
			if(response.driverMasterList.length == 0){
				showMessage('info', '<i class="fa fa-info-circle"></i> No records found, please try again. ');
				hideLayer();
				return;
			}
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/vehicleDriverConfigurationMapping/vehicleDriverMappingConfiguration.html",
					function() {
						baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function(){
				loadLanguageWithParams(FilePath.loadLanguage());
				
				for(var i = 0; i < response.driverMasterList.length; i++) {
					$('#mappingDriverEle').append('<option value="'+response.driverMasterList[i].driverMasterId+'">'+response.driverMasterList[i].driverName+'</option>');
				}
				
				vehicleDriverMapIds	= response.vehicleDriverMapIds;
				console.log('vehicleDriverMapIds ',vehicleDriverMapIds)
				if(vehicleDriverMapIds != undefined && typeof vehicleDriverMapIds != 'undefined'){
					var temp = new Array();
					temp = vehicleDriverMapIds.split(",");
					$("#mappingDriverEle").val(temp);
				}
				
				hideLayer();
				
				$(".saveBtn").click(function(){
					_this.mapDriverToVehicle();
				})
				
			});
			
			
		},mapDriverToVehicle : function(){
			
			jsonObject = new Object();
			
			if($('#mappingDriverEle').exists() && $('#mappingDriverEle').is(":visible")){
				var selO = document.getElementsByName('mappingDriverEle')[0];
			   
				var selValues = [];
			    for(var i=0; i < selO.length; i++){
			        if(selO.options[i].selected){
			            selValues.push(selO.options[i].value);
			        }
			    }
				jsonObject["driverMasterIds"]					= selValues.join();
				jsonObject["prevDriverMasterIds"]				= vehicleDriverMapIds;
				jsonObject["vehicleNumberMasterId"]				= vehicleNumberMasterId; 
				jsonObject["redirectTo"] 						= Number(6);
				console.log('jsonObject ',jsonObject)
				var btModalConfirm = new Backbone.BootstrapModal({
					content		: 	"Are you sure, you want to Assign Driver To Vehicle ?",
					modalWidth 	: 	30,
					title		:	'Map Driver',
					okText		:	'YES',
					showFooter 	: 	true,
					okCloses	:	true
				}).open();
				
				btModalConfirm.on('ok', function() {
					showLayer();
					getJSON(jsonObject, WEB_SERVICE_URL + '/driverWS/addRemoveDriverForVehicle.do?',_this.afterSave, EXECUTE_WITH_ERROR);
					hideLayer();
				});
			}
		},afterSave : function(response){
			if(response.message != undefined) {
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				setTimeout(function() { 
					window.close();
				}, 1500);
			}
		}
	});
});