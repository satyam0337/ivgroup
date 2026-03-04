/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
        'marionette'//Marionette
        //marionette JS framework
        ,'elementmodel'//ElementModel
        //Elementmodel consist of default values which is passed when setting it in template
        ,'elementTemplateJs'//elementTemplateJs
        //elementtemplate is javascript utility which consist of functions that operate on elements
        ,'text!'+PROJECT_IVVIEWPAGES+'/template/elementtemplate.html'
        //text! is used to convert the html to plain text which helps to fetch HTML through require
        //template for element
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/partialconsignmentfilepath.js'//FilePath
        //filepath is defined to get the language path from where should the language file should be loaded for label
        ,'jquerylingua'//import in require.config
        ,'language'//import in require.config
        ,'nodvalidation'//import in require.config
        ,'errorshow'//import in require.config
        ,'focusnavigation'//import in require.config
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/loaddispatchmodelurls.js'
        ,'slickGridWrapper'
        ], function (Marionette, ElementModel,elementTemplateJs,ElementTemplate,FilePath,jquerylingua,Language,NodValidation,Error,ElementFocusNavigation
        		,ModelUrls,SlickGridWrapper) {
	'use strict';// this basically give strictness to this specific js
	var myNod,
	//global objects
	ElementModelArray=new Object(),
	elemntFocus = new Object(),
	deferred,
	jsonObject,
	row, 
	grid,
	dataView,
	btModal,
	_this;

	return Marionette.ItemView.extend({
		initialize: function(jsonObjectData) {
			jsonObject = jsonObjectData;
		},
		render: function(){
			//_this object is added because this object is not found in onRender function
			_this = this; 

			//this is the first method called when this function is called
			//triggerMethod onBeforeRender
			this.triggerMethod("before:render");
			//triggerMethod onRender
			this.triggerMethod("render");
			//triggerMethod onAfterRender
			this.triggerMethod("after:render");
		},
		onBeforeRender: function() {
			//code which needs to be rendered before render
		}, 
		onRender: function(){
			//this object is created to synchronize the flow when data is fetched from the method
			deferred = Marionette.Deferred();
			//this object is created to synchronize the flow when data is fetched from the method
			row 		= jsonObject.row; 
			grid 		= jsonObject.grid;
			dataView 	= jsonObject.dataView;
			btModal 	= jsonObject.btModal;

			var pendingDispatchStockId = dataView.getItem(row).pendingDispatchStockId;
			if(pendingDispatchStockId == undefined || pendingDispatchStockId <= 0){
				showMessage('error','Provide a valid LS Number');
			}
			var object = new Object();
			object.PENDINGDISPATCHSTOCKID = pendingDispatchStockId 
			getJSON(object, WEB_SERVICE_URL+'/dispatchWs/getConsignmentDetailsByPendingDispatchStockId.do?', _this.setElements, EXECUTE_WITH_ERROR);

			return _this;
		},
		onAfterRender: function() {
			//code which needs to be rendered after render
		}, setElements : function(response) {
			ElementModelArray.consignment = ModelUrls.urlPartialConsignment();
			ElementModelArray.partialWeight = ModelUrls.urlPartialWeight();
			var langObj = FilePath.loadLanguage();
			var languageData = loadLanguageWithParams(langObj);
			elementTemplateJs.appendDataInTable(ElementModelArray, ElementModel, _this, languageData, response, ElementTemplate, _this.afterFillingElements);

		}, afterFillingElements : function(EleObj) {
			hideLayer();

			var quantity 		= EleObj.totalQuantity;
			var weight 			= EleObj.totalWeight;
			var weightValObj 	= EleObj.weightValObj;
			
			if(weight > 0 && partialAutoCalculateWeightConfirmation) {
				var perQtyWeight 	= weight / quantity;
				var elementValObj 	= EleObj.elementValObj;
			
				if(elementValObj.length > 0) {
					for(var i = 0; i < elementValObj.length; i++) {
						$(elementValObj[i]["elementId"]).keyup(function() {
							_this.updateWeight(elementValObj, perQtyWeight, weightValObj[0]["elementId"]);
						});
						
						$(elementValObj[i]["elementId"]).change(function() {
							_this.updateWeight(elementValObj, perQtyWeight, weightValObj[0]["elementId"]);
						});
					}
					
					$( "#consignemntQuantity :input" ).last().keyup( function(e){
						if(e.which == $.ui.keyCode.ENTER || e.keyCode == $.ui.keyCode.ENTER){
							$('.btn.ok').focus();
						}
					});
				}
			}
			
			$("#modalBody :input").each(function (index){
				var element = this;
				$(element).focus(function() {$(this).select();})
			})
			
			document.getElementById('dispatchWeightEle').readOnly = 'readonly'
			
			myNod = nod();
			myNod.configure({
				parentClass:'validation-message'
			});
			
			myNod.add(EleObj.validationObj);
			
			btModal.on('ok', function() {
				var totalQuantity = 0;
				var consignmentValue = "";
				var consignmentArray = new Array();
				var consignmentQuantityObj = new Object;
				myNod.performCheck();
				
				if(myNod.areAll('valid')) {
					var elementValObj 	= EleObj.elementValObj;
					var weightValObj 	= EleObj.weightValObj;

					if(elementValObj.length > 0) {
						for(var i = 0; i < elementValObj.length; i++) {
							totalQuantity = parseInt(totalQuantity)+ parseInt($(elementValObj[i]["elementId"]).val());
							consignmentArray.push($(elementValObj[i]["elementId"]).val() + " " + elementValObj[i]["elementData"].packingTypeMasterName);
							consignmentQuantityObj[elementValObj[i]["elementData"].consignmentDetailsId]	= $(elementValObj[i]["elementId"]).val();
						}
					}
					
					if(totalQuantity <= 0) {
						showMessage('error',"LR Number " + dataView.getItem(row).wayBillNumber + " has been removed as the total qunatity was less than 1");
						dataView.deleteItem(dataView.getItem(row).id);
					} else {
						dataView.refresh();
						dataView.beginUpdate();
						consignmentValue = consignmentArray.join(" / ");
						dataView.getItem(row).pendingWeight = $(weightValObj[0]["elementId"]).val();
						dataView.getItem(row).pendingQuantity = totalQuantity;

						dataView.getItem(row).articleDetails = consignmentValue;

						var consignmentDetailsArr	= dataView.getItem(row).consignmentDetails;

						for (var i = 0; i < consignmentDetailsArr.length; i++) {
							consignmentDetailsArr[i]['consignmentDetailsQuantity'] = consignmentQuantityObj[consignmentDetailsArr[i]['consignmentDetailsId']];
						}

						dataView.getItem(row).consignmentDetails	= consignmentDetailsArr;

						dataView.getItem(row).partial	= true;

						dataView.endUpdate();

						dataView.refresh();
						_this.updatePartialColor(grid);
						grid.invalidate();
						grid.render();
					}
					
					$('.slick-header-columns').children().eq(2).trigger('click');  // eq(2) for the 3rd col

					btModal.close();
					setTimeout(function(){document.getElementById('singlelrEle').focus()}, 500);
				}
			});

			$( "#dispatchWeightEle" ).keydown(function( e ) {
				if(e.which == $.ui.keyCode.ENTER||e.keyCode == $.ui.keyCode.ENTER){
					$('.btn.ok').focus();
				}
			})
			btModal.on('close cancel', function() {
				$("#singlelrEle").focus();
			});

			initialiseFocus('.modal-content');
			elemntFocus.elementId = '#dispatchWeightEle';
			elemntFocus.nextElementId = '.ok';
			elemntFocus.previousElementId = '.ok';

			setNextPreviousNavigationForElements(elemntFocus);
			$("#modalBody :input").first().focus();
			hideLayer();
		},updatePartialColor:function(slickgrid){
			SlickGridWrapper.updateRowColor(slickgrid, 'partial', true, 'highlight-row');
		}, updateWeight : function(elementValObj, perQtyWeight, weightId) {
			var totalQuantity = 0;
			if(elementValObj.length > 0) {
				for(var i = 0; i < elementValObj.length; i++) {
					totalQuantity = parseInt(totalQuantity) + parseInt($(elementValObj[i]["elementId"]).val());
				}
				
				var totalWeight = totalQuantity * perQtyWeight;
				
				if(isNaN(totalWeight))
					totalWeight = 0;
				
				$(weightId).val(parseInt(totalWeight));
			}
		}
	});	
});