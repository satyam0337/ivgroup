var PaymentTypeConstant = null;
define(
		[
		 'JsonUtility',
		 'messageUtility',
		 PROJECT_IVUIRESOURCES + '/resources/js/module/view/ddm/ddmChargeUpdateFilePath.js',
		 'jquerylingua',
		 'language',
		 'selectize',
		 'selectizewrapper',
		 'bootstrapSwitch',
		 'nodvalidation',
		 'focusnavigation',
		 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
		 PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js' ],
		 function(JsonUtility, MessageUtility, FilePath, Lingua, Language,Selectize, Selectizewrapper, BootstrapSwitch, NodValidation, FocusNavigation,
				 BootstrapModal,UrlParameter) {
			'use strict';
			var jsonObject = new Object(), myNod, remarkNod, corporateAccountId = 0, _this ,ddmNumber,branchId,branchName;
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
					this.$el.html(this.template);
					ddmNumber   = UrlParameter.getModuleNameFromParam('ddmNumber');
					branchId    = UrlParameter.getModuleNameFromParam('BranchId');
					branchName	= UrlParameter.getModuleNameFromParam('branchName');
				},
				render : function() {
					showLayer();

					var jsonObject 	= new Object();
					var loadelement = new Array();
					var baseHtml 	= new $.Deferred();
					loadelement.push(baseHtml);
				
					$("#mainContent").load("/ivcargo/html/module/ddm/ddmChargeUpdate.html",
							function() {
								baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						hideLayer();
						loadLanguageWithParams(FilePath.loadLanguage());
						
						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});
						
						_this.setBranchesAutocompleteInstance();
						$('#ddmNumber').val(ddmNumber);
						$('#branchEle').val(branchId);
						
						if(branchName != null) {
							branchName	= branchName.replace(/%20/g, " ");
							$('#controlinput_branchEle').val(branchName);
						}
						
						myNod.add({
							selector: '#ddmNumber',
							validate: 'presence',
							errorMessage: 'Enter DDM Bill Number !'
						});
						
						myNod.add({
							selector: '#branchEle',
							validate: 'presence',
							errorMessage: 'Select Branch !'
						});
						
						if(branchId > 0) {
							_this.onFind(_this);
						}
						
						$("#findBtn").click(function() {
							myNod.performCheck();
							
							if(myNod.areAll('valid')){
								_this.onFind(_this);
							}
						});
					});
				},setBranchesAutocompleteInstance : function(){
					Selectizewrapper.setAutocomplete({
							valueField:'branchId',
							labelField:'branchName',
							searchField: 'branchName',
							url:WEB_SERVICE_URL +'/selectOptionsWS/getAllBranchOptionByAccountGroup.do',
							preload:false,
							elementId:'branchEle',
							responseObjectKey:'sourceBranch'
						}
					)
				},onFind : function() {
					showLayer();
					var jsonObject 			= new Object();
					
					jsonObject.DDMNumber 	= $('#ddmNumber').val();
					jsonObject.branchId		= $('#branchEle').val();
					
					getJSON(jsonObject, WEB_SERVICE_URL + '/deliveryRunsheetWS/getDDMChargeForUpdate.do', _this.setBillDetailsData, EXECUTE_WITH_ERROR);
				},setBillDetailsData : function(response) {
					if(response.message != undefined) {
						hideLayer();
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						return;
					}
					
					showPartOfPage('bottom-border-boxshadow');
					removeTableRows('billDetails', 'tbody');
					removeTableRows('lrFooter', 'tfoot');
					_this.setDataInTable(response);
					hideLayer();
				},setDataInTable : function(data) {
					remarkNod			= nod();
					var columnArray		= new Array();
					var columnArray1	= new Array();
					
					var ddmDoorDeliveryChargesForUpdateList	= data.ddmDoorDeliveryChargesForUpdateList;
					
					var i ;
					
					for (i=0; i<ddmDoorDeliveryChargesForUpdateList.length; i++) {
						var obj	= ddmDoorDeliveryChargesForUpdateList[i];
						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i+1) + "<input  type='hidden' value='"+obj.ddmDoorDeliveryChargesId+"' id='ddmDoorDeliveryChargesId"+i+"'/></td>");
						columnArray.push("<input  type='hidden' value='"+obj.deliveryRunSheetLedgerDDMNumber+"' id='deliveryRunSheetLedgerDDMNumber"+i+"'/>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.wayBillNumber + "</td> <input  type='hidden' value='"+obj.deliveryRunSheetLedgerId+"' id='deliveryRunSheetLedgerId"+i+"'/>");						
						columnArray.push("<input  type='hidden' value='"+obj.deliveryRunSheetSummaryWayBillId+"' id='deliveryRunSheetSummaryWayBillId"+i+"'/>");						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><input class='form-control' type='text' id='doorDeliveryAmount"+i+"' placeholder='Door Delivery' value='"+obj.doorDeliveryAmount+"'  onfocus='this.select()' />");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><input class='form-control' type='text' id='hamaliAmount"+i+"' placeholder='Hamali'  value='"+obj.hamaliAmount+"'  onfocus='this.select()' /> ");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><input class='form-control' type='text' id='dlyCommAmount"+i+"' placeholder='Dly Comm' value='"+obj.dlyCommAmount+"'  onfocus='this.select()'/> ");
						
						$('#reportTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
					
						columnArray	= [];
					}
					
					columnArray1.push("<td colspan='5' style='text-align: center; vertical-align:middle;align:center;'><button  style='align:center' type='button' class='btn btn-info' id='"+i+"'>Save</button></td>");
					$('#reportTable tfoot').append('<tr>' + columnArray1.join(' ') + '</tr>');
					
					columnArray1	= [];
					
					$("#"+i).bind("click", function(){
					    _this.saveCharges(i);
					});
				},saveCharges : function(i) {
					var jsonInObject 	= new Object();
					var jsonArray 		= new Array();
					
					for(var j=0;j<i;j++){
						var jsonObject = new Object();
						
						remarkNod.add({
							selector: '#doorDeliveryAmount'+j,
							validate: 'integer',
							errorMessage: 'Enter Door Delivery Amount !'
						});
						remarkNod.add({
							selector: '#dlyCommAmount'+j,
							validate: 'integer',
							errorMessage: 'Enter Delivery Commission Amount !'
						});
						remarkNod.add({
							selector: '#hamaliAmount'+j,
							validate: 'integer',
							errorMessage: 'Enter Hamali Amount !'
						});
						
						jsonObject.DDMDoorDeliveryChargesId		= $('#ddmDoorDeliveryChargesId'+ j).val();
						jsonObject.DoorDeliveryAmount  	 		= $('#doorDeliveryAmount'+j).val();
						jsonObject.HamaliAmount  				= $('#hamaliAmount'+j).val();
						jsonObject.DlyCommAmount  				= $('#dlyCommAmount'+j).val();
						jsonObject.deliveryRunSheetLedgerId  	= $('#deliveryRunSheetLedgerId'+j).val();
						jsonObject.waybillId  					= $('#deliveryRunSheetSummaryWayBillId'+j).val();
						jsonObject.DDMNumber  					= $('#deliveryRunSheetLedgerDDMNumber'+j).val();
						jsonArray.push(jsonObject);
					}
					
					jsonInObject.array 	= JSON.stringify(jsonArray);
					
					var btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to Update charges ?",
						modalWidth 	: 	30,
						title		:	'Update Charges',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();

					console.log(jsonInObject);
					
					btModalConfirm.on('ok', function() {
						getJSON(jsonInObject, WEB_SERVICE_URL + '/deliveryRunsheetWS/updateDDMCharge.do', _this.showResponse, EXECUTE_WITH_ERROR);
						showLayer();
					});
				},showResponse : function(response) {
					if(response.message != undefined) {
						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						setTimeout(function(){ location.reload(); }, 1000);
						hideLayer();
						return;
					}
					
					hideLayer();
				}
			});
		});