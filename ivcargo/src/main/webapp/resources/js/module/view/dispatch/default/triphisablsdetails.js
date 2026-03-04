define([
		'marionette'//Marionette
		,'elementmodel'//ElementModel
		,'elementTemplateJs'//elementTemplateJs
		,'text!'+PROJECT_IVVIEWPAGES+'/template/elementtemplate.html'//elementtemplate is javascript utility which consist of functions that operate on elements
		,'moment'
		,'nodvalidation'
		], function (Marionette, ElementModel, elementTemplateJs, ElementTemplate) {
	let _this, myNode;
		
	return Marionette.ItemView.extend({
		initialize: function(jsonObjectData) {
			//_this object is added because this object is not found in onRender function
			myNode		= jsonObjectData.node;
			_this = this;
		}, render : function() {
			//jsonutility.js
			getJSON(null, WEB_SERVICE_URL+'/tripHisabSettlementWS/loadElementForTripHisabLSDetails.do', _this.setElements, EXECUTE_WITH_ERROR);

			return _this;
		}, setElements : function(data) {
			//append value in template
			elementTemplateJs.appendElementInTemplate(data.ElementModelArray, ElementModel, ElementTemplate, _this);
			
			setTimeout(function() {
				_this.loadElements(data);
			}, 200);
		}, loadElements : function(response) {
			initialiseFocus('.modal-body');
			
			if(response.calculationOnDieselRequired && !response.defaultDieselByBranch) {
				let dieselLiterBy = new Object();
				dieselLiterBy.primary_key 	= 'deiselLiterById';
				dieselLiterBy.field 		= 'deiselLiterByName';
					
				$("#dieselLiterByEle").autocompleteCustom(dieselLiterBy);
					
				let dieselLiterByName = $("#dieselLiterByEle").getInstance();
					
				$(dieselLiterByName).each(function() {
					this.option.source = response.deiselLitreByArr;
				});
			}
			
			_this.setElementInNod(response);
		}, setElementInNod : function(response) {
			addElementToCheckEmptyInNode1(myNode, 'ravanaExpenseEle', 'Cannot be left blank');
			addElementToCheckNumericInNode(myNode, 'ravanaExpenseEle', 'Should be numeric');
			
			if(response.calculationOnDieselRequired) {
				if(!response.removeOdometerReadingKm) {
					addElementToCheckEmptyInNode1(myNode, 'kilometerReadingEle', 'Cannot be left blank');
					addElementToCheckNumericInNode(myNode, 'kilometerReadingEle', 'Should be numeric');
				}

				if(response.validateDieselLiter) {
					addElementToCheckEmptyInNode1(myNode, 'dieselLiterEle', 'Cannot be left blank');
					addElementToCheckNumericInNode(myNode, 'dieselLiterEle', 'Should be numeric');
				}
				
				if(!response.defaultDieselByBranch)
					addAutocompleteElementInNode(myNode, 'dieselLiterByEle', 'Select Diesel Added By !')
			}
			
			if(response.validateDieselRateOnDieselLiter)  {
				$('#dieselLiterEle').on('blur', function() {
					let deselLiterEle = $('#dieselLiterEle').val()
				
					if (deselLiterEle != '' ) {
						if (response.dieselPerRateRequired) {
							addElementToCheckEmptyInNode1(myNode, 'dieselRatePerLiterEle', 'Cannot be left blank');
							addElementToCheckFloatInNode(myNode, 'dieselRatePerLiterEle', 'Should be decimal');
						}
					} else 
						removeElementFromCheckEmptyInNode(myNode, 'dieselRatePerLiterEle');
				});
			} else  if(response.dieselPerRateRequired) {
				addElementToCheckEmptyInNode1(myNode, 'dieselRatePerLiterEle', 'Cannot be left blank');
				addElementToCheckFloatInNode(myNode, 'dieselRatePerLiterEle', 'Should be decimal');
			}
			
			addElementToCheckEmptyInNode1(myNode, 'tripHisabRemarkEle', 'Cannot be left blank');
		}
	});	
});
