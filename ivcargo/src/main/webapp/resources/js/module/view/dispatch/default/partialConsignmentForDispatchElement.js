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
		//template for element
		,'text!'+PROJECT_IVVIEWPAGES+'/template/elementtemplate.html'
		,'elementmodel'//ElementModel
		,'slickGridWrapper'
		//text! is used to convert the html to plain text which helps to fetch HTML through require
		,'nodvalidation'//import in require.config
		,'errorshow'//import in require.config
		,'focusnavigation'//import in require.config
	], function (Marionette, ElementTemplate, ElementModel, SlickGridWrapper) {
	'use strict';// this basically give strictness to this specific js
	let myNod,
	//global objects
	elemntFocus = new Object(), jsonObject,
	row, grid, dataView, btModal, partialAutoCalculateWeightConfirmation = false,
	_this;

	return Marionette.ItemView.extend({
		initialize: function(jsonObjectData) {
			jsonObject = jsonObjectData;
		}, render: function(){
			//_this object is added because this object is not found in onRender function
			_this = this; 
			//this object is created to synchronize the flow when data is fetched from the method
			row 		= jsonObject.row; 
			grid 		= jsonObject.grid;
			dataView 	= jsonObject.dataView;
			btModal 	= jsonObject.btModal;
			partialAutoCalculateWeightConfirmation = jsonObject.partialAutoCalculateWeightConfirmation;

			let object = new Object();
			object.PENDINGDISPATCHSTOCKID = jsonObject.pendingDispatchStockId 
			getJSON(object, WEB_SERVICE_URL+'/loadingSheetWS/getConsignmentDetailsByPendingDispatchStockId.do?', _this.setElements, EXECUTE_WITH_ERROR);

			return _this;
		}, setElements : function(response) {
			_this.appendDataInTable(response, _this, _this.afterFillingElements);
		}, afterFillingElements : function(eleObj) {
			hideLayer();

			let quantity 		= eleObj.totalQuantity;
			let weight 			= eleObj.totalWeight;
			let weightValObj 	= eleObj.weightValObj;
			
			if(weight > 0 && partialAutoCalculateWeightConfirmation) {
				let perQtyWeight 	= weight / quantity;
				let elementValObj 	= eleObj.elementValObj;
			
				if(elementValObj.length > 0) {
					for(const element of elementValObj) {
						$(element["elementId"]).keyup(function() {
							_this.updateWeight(elementValObj, perQtyWeight, weightValObj[0]["elementId"]);
						});
						
						$(element["elementId"]).change(function() {
							_this.updateWeight(elementValObj, perQtyWeight, weightValObj[0]["elementId"]);
						});
					}
					
					$( "#consignemntQuantity :input" ).last().keyup( function(e){
						if(e.which == $.ui.keyCode.ENTER || e.keyCode == $.ui.keyCode.ENTER)
							$('.btn.ok').focus();
					});
				}
			}
			
			$("#modalBody :input").each(function () {
				$(this).focus(function() {$(this).select();})
			})
			
			document.getElementById('dispatchWeightEle').readOnly = 'readonly'
			
			myNod = nod();
			myNod.configure({
				parentClass:'validation-message'
			});
			
			myNod.add(eleObj.validationObj);
			
			btModal.on('ok', function() {
				let totalQuantity = 0;
				let consignmentValue = "";
				let consignmentArray = new Array();
				let consignmentQuantityObj = new Object;
				
				myNod.performCheck();
				
				if(myNod.areAll('valid')) {
					let elementValObj 	= eleObj.elementValObj;
					let weightValObj 	= eleObj.weightValObj;

					if(elementValObj.length > 0) {
						for(const element of elementValObj) {
							totalQuantity = parseInt(totalQuantity) +  parseInt($(element["elementId"]).val());
							consignmentArray.push($(element["elementId"]).val() + " " + element["elementData"].packingTypeMasterName);
							consignmentQuantityObj[element["elementData"].consignmentDetailsId]	= $(element["elementId"]).val();
						}
					}
					
					if(totalQuantity <= 0) {
						showMessage('error', "LR Number " + dataView.getItem(row).wayBillNumber + " has been removed as the total qunatity was less than 1");
						dataView.deleteItem(dataView.getItem(row).id);
					} else {
						dataView.refresh();
						dataView.beginUpdate();
						
						consignmentValue = consignmentArray.join(" / ");
						
						dataView.getItem(row).pendingWeight 	= $(weightValObj[0]["elementId"]).val();
						dataView.getItem(row).pendingQuantity 	= totalQuantity;
						dataView.getItem(row).articleDetails 	= consignmentValue;

						let consignmentDetailsArr	= dataView.getItem(row).consignmentDetails;

						for (const element of consignmentDetailsArr) {
							element['consignmentDetailsQuantity'] = consignmentQuantityObj[element['consignmentDetailsId']];
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
				if(e.which == $.ui.keyCode.ENTER || e.keyCode == $.ui.keyCode.ENTER)
					$('.btn.ok').focus();
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
		}, updatePartialColor : function(slickgrid){
			SlickGridWrapper.updateRowColor(slickgrid, 'partial', true, 'highlight-row');
		}, updateWeight : function(elementValObj, perQtyWeight, weightId) {
			let totalQuantity = 0;
			
			if(elementValObj.length > 0) {
				for(const element of elementValObj) {
					totalQuantity = parseInt(totalQuantity) + parseInt($(element["elementId"]).val());
				}
				
				let totalWeight = totalQuantity * perQtyWeight;
				
				if(isNaN(totalWeight))
					totalWeight = 0;
				
				$(weightId).val(parseInt(totalWeight));
			}
		}, appendDataInTable : function(response, _this, callBackFunction) {
			let elementModArr 	= response.ElementModelArray;
			let respData 		= response.packingTypeMaster;
			let actualWeight 	= response.actualWeight;
			
			let $table = $('<table class="table" id="consignemntQuantity"/>');
			let $thead = $('<thead class="thead-inverse"/>');

			let $trObj = $("<tr/>");

			for(const element of elementModArr) {
				if(element.dataDtoKey != 'pendingWeight')
					$trObj.append( '<th><span data-selector="' + element.labelId + '">' + element.labelValue + '</span></th>' );
			}

			$thead.append($trObj);
			$table.append($thead);
			
			let $tbody = $('<tbody/>');

			let validationObj 	= new Array();
			let elementValObj 	= new Array();
			let weightValObj 	= new Array();
			let totalQuantity	= 0;
			let finalJsonObj	= null;
			
			for(const element of respData) {
				let $trObj = $("<tr/>");

				for(const element1 of elementModArr) {
					if(element1.dataDtoKey == 'pendingWeight')
						continue;
						
					let jsonObj 	= new ElementModel(element1);
					finalJsonObj 	= jsonObj.toJSON();
					
					if(finalJsonObj.elementType == "text") {
						$trObj.append('<td style="line-height: 2;font-size: larger;">'+ element[finalJsonObj.dataDtoKey] + '</td>');
					} else if(finalJsonObj.elementType == "number") {
						totalQuantity 	+= parseInt(element[finalJsonObj.dataDtoKey]);
						
						finalJsonObj.elementId 				= finalJsonObj.elementId + '' + element[finalJsonObj.primaryIdDtoName]
						finalJsonObj.elementDefaultValue 	= element[finalJsonObj.dataDtoKey];
						
						validationObj.push({
							selector: '#' + finalJsonObj.elementId,
							validate: 'max-number:' + element[finalJsonObj.dataDtoKey],
							errorMessage: 'Value cannot be more than ' + element[finalJsonObj.dataDtoKey]
						});
				
						validationObj.push({
							selector: '#' + finalJsonObj.elementId,
							validate: 'presence',
							errorMessage: 'Cannot be left blank !'
						});
				
						validationObj.push({
							selector: '#' + finalJsonObj.elementId,
							validate: 'min-number:0',
							errorMessage: 'Value cannot be less than 0.'
						});
				
						validationObj.push({
							selector: '#' + finalJsonObj.elementId,
							validate: 'integer',
							errorMessage: 'Value should be non-decimal number'
						});

						elementValObj.push({
							elementId:"#" + finalJsonObj.elementId,
							elementData : element
						});
				
						let $tdObj = $("<td/>")
						$tdObj.append(_.template(ElementTemplate)(finalJsonObj));
						$trObj.append( $tdObj );
					}
				}
				
				$tbody.append($trObj);
			}
			
			$table.append($trObj);
			$table.append($tbody);
			
			if(isNaN(actualWeight))
				actualWeight = 0;
			
			_this.$el.append($table);
			
			let $weighttable = $('<table class="table"/>');
			$trObj 	= $("<tr/>");
			
			$trObj.append('<td style="line-height: 2;font-size: larger;"><b> Weight </b> : '+ actualWeight +'</td>');
			
			let $tdWeightObj = $("<td/>")
			
			let newWeightModel = elementModArr.filter(function (el) {
				return el.dataDtoKey == 'pendingWeight';
			});
			
			let jsonObj = new ElementModel(newWeightModel[0]);
			
			finalJsonObj = jsonObj.toJSON();
			
			finalJsonObj.labelTag 				= "";
			finalJsonObj.elementDefaultValue  	= actualWeight;
			
			if(finalJsonObj.showLabel)
				$trObj.append("<td><label class=" + finalJsonObj.labelCss + "><span id=" + finalJsonObj.labelId + " data-selector=" + finalJsonObj.labelId + "><b>" + finalJsonObj.labelValue + "</b></span></label></td>");
			
			$tdWeightObj.append(_.template(ElementTemplate)(finalJsonObj)); 
			
			weightValObj.push({
				elementId:"#" + finalJsonObj.elementId,
			});
			
			validationObj.push({
				selector: '#' + finalJsonObj.elementId,
				validate: 'max-number:' + actualWeight,
				errorMessage: 'Value cannot be more than '+ actualWeight
			});
			
			validationObj.push({
				selector: '#' + finalJsonObj.elementId,
				validate: 'presence',
				errorMessage: 'Cannot be left blank !'
			});
			
			validationObj.push({
				selector: '#'+finalJsonObj.elementId,
				validate: 'integer',
				errorMessage: 'value should be non-decimal number'
			});
			
			if(actualWeight > 0) {
				validationObj.push({
					selector: '#' + finalJsonObj.elementId,
					validate: 'min-number:1',
					errorMessage: 'Value cannot be 0.'
				});
			} else {
				validationObj.push({
					selector: '#' + finalJsonObj.elementId,
					validate: 'min-number:0',
					errorMessage: 'Value cannot be less than 0.'
				});
			}
			
			$trObj.append($tdWeightObj);
			
			let $tdObj = $("<td/>")
			
			$tdObj.append($tdObj);
			
			$weighttable.append($trObj);
			
			_this.$el.append($weighttable);
			
			let outObject = new Object();
			outObject.validationObj 	= validationObj;
			outObject.elementValObj 	= elementValObj;
			outObject.weightValObj 		= weightValObj;
			outObject.totalQuantity 	= totalQuantity;
			outObject.totalWeight 		= actualWeight;
			
			setTimeout(callBackFunction, 500, outObject);
		}
	});	
});