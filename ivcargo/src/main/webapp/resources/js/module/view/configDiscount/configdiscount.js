define(['JsonUtility',
	'messageUtility',
	PROJECT_IVUIRESOURCES + '/resources/js/module/view/configDiscount/configdiscountfilepath.js',
	'jquerylingua',
	'language',
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
	'nodvalidation',
	'focusnavigation',
	PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
	'selectizewrapper',
	'/ivcargo/resources/js/module/redirectAfterUpdate.js',
	],
	function(JsonUtility, MessageUtility, FilePath, Lingua, Language, 
			UrlParameter, NodValidation, FocusNavigation,BootstrapModal, Selectizewrapper) {
	'use strict';
	var jsonObject 					= new Object(), myNod, masterLangObj, masterLangKeySet, gridObject , _this;
	var wayBillId 					= 0;
	var partyId 					= 0;
	var CONFIG_TYPE_WEIGHT_ID		= 1;
	var CONFIG_TYPE_FIXED_ID		= 2;
	var CONFIG_TYPE_QUANTITY_ID		= 3;
	var CONFIG_TYPE_AMOUNT_ID		= 4;
	var configuration,
	showDemurrageCalculation	= false,
	reDirectToOldPage			= false,
	showDemurrageAmount			= false;
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			//initialize is the first function called on call new view()
			_this                               = this;
			wayBillId 	                        = UrlParameter.getModuleNameFromParam('wayBillId');
			partyId 	                        = UrlParameter.getModuleNameFromParam('partyId');
			jsonObject.waybillId				= wayBillId;
			jsonObject.corporateAccountId		= partyId;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/configDiscountWS/getConfigDiscountElement.do?',_this.setConfigDiscountElement, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setConfigDiscountElement : function(response) {
			var loadelement          = new Array();
			var baseHtml 	         = new $.Deferred();
			var executive	         = response.executive;
			configuration	     	 = response.configDiscountConfiguration;
			showDemurrageCalculation = configuration.showDemurrageCalculation;
			reDirectToOldPage		 = configuration.reDirectToOldPage;
			showDemurrageAmount		 = configuration.showDemurrageAmount;
			if(showDemurrageAmount){
				var damerageAmount		 = response.damurrageCalculation.damerageAmount;
			}
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/configDiscount/ConfigDiscount.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.discountList,
					valueField		:	'discountMasterId',
					labelField		:	'discountName',
					searchField		:	'discountName',
					elementId		:	'dicsountChargesEle',
					create			: 	false,
					maxItems		: 	1
				});
				if(showDemurrageAmount){
					$("#demurrage").removeClass("hide");
					$("#demurrageAmt").val(damerageAmount);
				}

				/*myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector: '#discount',
					validate: 'presence',
					errorMessage: 'Enter Discount !'
				});

				myNod.add({
					selector: '#discount',
					validate: 'float',
					errorMessage: 'Enter Discount !'
				});*/

				/*myNod.add({
					selector		: '#discount',
					validate		: 'validateAutocomplete:#discount',
					errorMessage	: 'Select Discount !'
				});*/

				$("#updateBtn").click(function() {
					/*myNod.performCheck();

					if(myNod.areAll('valid')) {
						_this.onUpdate(_this);
					}*/
					
					if($('#discount').val() == '' || $('#discount').val() == null){
						showMessage('error', 'Please enter discount ');
						return;
					}
					
					if($('#dicsountChargesEle').val() == '' || $('#dicsountChargesEle').val() == null){
						showMessage('error', 'Please select discount charges ');
						return;
					}
					
					_this.onUpdate(_this);
				});
				if(showDemurrageCalculation){
					_this.demurrageCalculation(response.damurrageCalculation);
				} else {
					$("#bottom-border-boxshadow").addClass("hide");
				}
			});		
			
			hideLayer();
		},onUpdate : function() {
			jsonObject["discount"] 					= $('#discount').val();
			jsonObject["dicsountChargesEle"] 		= $('#dicsountChargesEle').val();
			jsonObject["waybillId"] 				= wayBillId;
			jsonObject["remark"] 					= $('#remarkEle').val();
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL +'/configDiscountWS/updateConfigDiscountDetails.do', _this.redirectToPage, EXECUTE_WITHOUT_ERROR);
		},redirectToPage : function(response) {
			if(reDirectToOldPage){
				response.redirectTo = 9;
				redirectToAfterUpdate(response);
			} else {
				redirectToAfterUpdate(response);
			}
			hideLayer();
		}, demurrageCalculation : function(response) {
			
			var exemptedDays		= 0;
			var chargeableDays		= 0;
			var finalDamerageAmount = 0.00;
			var qtyDamerageAmount   = 0.00;
			var wgtDamerageAmount   = 0.00;
			var waybill				= response.wayBill[0];
			var delRateList			= response.deliveryRateMasterDetails;
			var storageDays			= response.storageDays;
			var consignmentDetails	= response.consignmentDetails;
			var quantity			= waybill.consignmentSummaryQuantity;
			var actualWeight		= waybill.consignmentSummaryActualWeight;
			var chargeWeight		= waybill.consignmentSummaryChargeWeight;

			if(delRateList != undefined){
				exemptedDays = delRateList[0].noOfDays;
					_this.calculateDammurage(delRateList,chargeWeight,consignmentDetails,exemptedDays,chargeableDays,wgtDamerageAmount,qtyDamerageAmount,storageDays);
			}
			
			$("#article").html(quantity);
			$("#weight").html(chargeWeight);
			$("#storageDays").html(storageDays);
			
			$("#exemptedDays").keyup(function(e){
				
				 if (/\D/g.test(this.value)){this.value = this.value.replace(/\D/g, '');}
				if(storageDays < Number(this.value)){
					$("#exemptedDays").val(exemptedDays);
				} else {
					chargeableDays  	= storageDays - this.value;
					$("#chargeableDays").val(chargeableDays);
				}
				_this.calculateDammurage(delRateList,chargeWeight,consignmentDetails,this.value,$("#chargeableDays").val(),wgtDamerageAmount,qtyDamerageAmount,storageDays,true);
			})
			
			$("#lumpsumDiscount").keyup(function(){
				
				if (/\D/g.test(this.value)){this.value = this.value.replace(/\D/g, '');}
				if($("#lumpsumDisc").is(':checked')){
					$("#discount").val(this.value);
				}
			});
			$("#chargeableDays").keyup(function(){
				
				 if (/\D/g.test(this.value)){this.value = this.value.replace(/\D/g, '');}
				 if(storageDays < Number(this.value)){
					 $("#exemptedDays").val(exemptedDays);
					 $("#chargeableDays").val(0);
				 }
				_this.calculateDammurage(delRateList,chargeWeight,consignmentDetails,exemptedDays,this.value,wgtDamerageAmount,qtyDamerageAmount,storageDays,true);
			})
			
			$("#demmurageasPerWt").click(function(){
				
				_this.setValueToDiscount(this,$("#demmurageAsPerWt").html(),$("#demmurageAsPerArt").html());
			});
			$("#demmurageasPerArt").click(function(){
				
				_this.setValueToDiscount(this,$("#demmurageAsPerWt").html(),$("#demmurageAsPerArt").html());
			});
			$("#lumpsumDisc").click(function(){
				
				_this.setValueToDiscount(this,$("#demmurageAsPerWt").html(),$("#demmurageAsPerArt").html());
			});
	
		}, setValueToDiscount: function(element,wgtDamerageAmount,qtyDamerageAmount){
			
			if(element != undefined && element.name != undefined){
			
				var checkedValue  	= null; 
				var inputElements 	= $('.messageCheckbox');
				
				for(var i = 0 ; i < inputElements.length; i++){
				      if(element != inputElements[i] && inputElements[i].checked){
				    	  $(inputElements[i]).trigger('click');
				      } 
				}
				if(element.checked){
					if(element.name == 'demmurageasPerWt'){
						$("#discount").val(wgtDamerageAmount);
					} else if(element.name == 'demmurageasPerArt'){
						$("#discount").val(qtyDamerageAmount);
					} else if (element.name == 'lumpsumDisc'){
						$("#discount").val($("#lumpsumDiscount").val());
					}
				}
			} else {
				$("#discount").val(0);
			}
		},calculateDammurage  : function(delRateList,chargeWeight,consignmentDetails,exemptedDays,chargeableDays,wgtDamerageAmount,qtyDamerageAmount,storageDays,fromevent){
			
			for(var i in delRateList){
				var rate				= delRateList[i].rate;
				if(chargeableDays <= 0 && !fromevent){
					
					if (delRateList[i].daysFromReceivedDate) {                                               
						chargeableDays	= storageDays;  
					} else if (storageDays > delRateList[i].noOfDays) {                                            
						chargeableDays	= storageDays - delRateList[i].noOfDays;                                     
					} else {                                                                                               
						chargeableDays	= 0;                                                                               
					}  
				} 
				
				if(delRateList[i].configTypeId == CONFIG_TYPE_QUANTITY_ID){
					for(var j = 0; j < consignmentDetails.length; j++){
						if(consignmentDetails[j].packingTypeMasterId == delRateList[i].packingTypeId || (delRateList[i].packingTypeId == 0)){
							qtyDamerageAmount += (consignmentDetails[j].quantity * rate * chargeableDays);
						}
					}
				} else if (delRateList[i].configTypeId == CONFIG_TYPE_WEIGHT_ID){
					wgtDamerageAmount += (chargeWeight * rate * chargeableDays);
				}
			}
		
			$("#exemptedDays").val(exemptedDays);
			$("#chargeableDays").val(chargeableDays);
			
			if(Math.round(wgtDamerageAmount) < 0){
				$("#demmurageAsPerWt").html(0);
				$("#chargeableDays").val(0);
			} else {
				$("#demmurageAsPerWt").html(Math.round(wgtDamerageAmount));
			}
			if(Math.round(qtyDamerageAmount) < 0){
				$("#demmurageAsPerArt").html(0);
				$("#chargeableDays").val(0);
			} else {
				$("#demmurageAsPerArt").html(Math.round(qtyDamerageAmount));
			}
			_this.setValueToDiscount(0,$("#demmurageAsPerWt").html(),$("#demmurageAsPerArt").html());
		}
	});
});