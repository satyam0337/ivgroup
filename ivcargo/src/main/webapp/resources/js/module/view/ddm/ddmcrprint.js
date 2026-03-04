define(
		[
			'slickGridWrapper3',
			PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
			PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js',//ModelUrls
			'JsonUtility',
			'messageUtility',
			'nodvalidation',
			'focusnavigation',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		],//PopulateAutocomplete
			function(slickGridWrapper3, Selection) {
			'use strict';
			var 
			_this = '',
			childwin,
			deliveryRunSheetLedgerId;

			var jsonObject = new Object(), myNod, _this = '';
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/ddmCRPrintWS/getDdmCRPrintElement.do?',	_this.renderElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderElements : function(response) {
					showLayer();

					let loadelement = new Array();
					let baseHtml 	= new $.Deferred();
					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/ddm/ddmCRPrint.html", function() {
						baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						hideLayer();
						initialiseFocus();
						
						$('#ddmNumberEle').focus();

						response.executiveTypeWiseBranch	= true;

						let elementConfiguration	= new Object();

						elementConfiguration.branchElement		= $('#branchEle');

						response.elementConfiguration	= elementConfiguration;

						Selection.setSelectionToGetData(response);
						
						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});
						
						myNod.add({
							selector		: '#ddmNumberEle',
							validate		: 'presence',
							errorMessage	: 'Enter DDM No !'
						});
						myNod.add({
							selector		: '#branchEle',
							validate		: 'presence',
							errorMessage	: 'Select Branch !'
						});

						$("#findDDMCR").click(function() {
							myNod.performCheck();
							
							if(myNod.areAll('valid'))
								_this.ddmDetails();
						});

						$("#printDDM").click(function() {
							_this.printDDM();
						});

						$("#printMultiCR").click(function() {
							_this.printMultiCR();
						});
					});
				}, ddmDetails : function() {
					showLayer();
					let jsonObject = new Object();

					jsonObject["DDMNumber"] 		= $('#ddmNumberEle').val();
					jsonObject["sourceBranchId"] 	= $('#branchEle_primary_key').val();

					getJSON(jsonObject, WEB_SERVICE_URL+'/ddmCRPrintWS/getDDMDetails.do?', _this.ddmDetailsByDDMNumber, EXECUTE_WITH_ERROR);
					
				}, ddmDetailsByDDMNumber : function(response) {
					if(response.message != undefined){
						hideLayer();
						$('#middle-border-boxshadow').addClass('hide');
						$('#bottom-border-boxshadow').addClass('hide');
						let errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + '  ' +  errorMessage.description);
						return;
					}
					
					deliveryRunSheetLedgerId	= response.deliveryRunSheetLedgerId;

					if(response.tableConfig != undefined && response.tableConfig.CorporateAccount != undefined) {
						$('#middle-border-boxshadow').removeClass('hide');
						hideAllMessages();
						
						let tableProperties1	= response.tableConfig.tableProperties;

						slickGridWrapper3.applyGrid({
									ColumnHead			: _.values(response.tableConfig.columnConfiguration), // *compulsory // for table headers
									ColumnData			: _.values(response.tableConfig.CorporateAccount), 	// *compulsory // for table's data
									tableProperties		: tableProperties1,
									ShowPrintButton		: false,
									DivId				: 'ddmDetailsDiv',				// *compulsary field // division id where slickgrid table has to be created
									SerialNo:[{						// optional field // for showing Row number
										showSerialNo	: tableProperties1.showSerialNumber,
										searchFilter	: false,          // for search filter on serial no
										ListFilter		: false,				// for list filter on serial no
										title			: "Sr No."
									}],
									NoVerticalScrollBar:false //optional for no vertical scrolling & if set true remove height attribute to Grid Div
								});
					}

					if(response.tableConfig1 != undefined && response.tableConfig1.CorporateAccount != undefined) {
						$('#bottom-border-boxshadow').removeClass('hide');
						hideAllMessages();
						
						let tableProperties	= response.tableConfig1.tableProperties;
						let language	= {'partialheader' : 'Print CR'};
				
						slickGridWrapper3.applyGrid({
							ColumnHead			: _.values(response.tableConfig1.columnConfiguration), // *compulsory // for table headers
							ColumnData			: _.values(response.tableConfig1.CorporateAccount), 	// *compulsory // for table's data
							tableProperties		: tableProperties,
							Language			: language,
							SerialNo:[{						// optional field // for showing Row number
								showSerialNo	: tableProperties.showSerialNumber,
								SearchFilter	: false,	// for search filter on serial no
								ListFilter		: false,	// for list filter on serial no
								title			: "Sr No."
							}],
							NoVerticalScrollBar			: false //optional for no vertical scrolling & if set true remove height attribute to Grid Div
						});
					} else {
						$('#bottom-border-boxshadow').addClass('hide');
					}

					hideLayer();
				}, printMultiCR	: function(){
					let jsonObject	= {};
					let selectionMsg	= ' Please, Select atleast 1 LR for Print !';
					let selectedLRDetails = slickGridWrapper3.getValueForSelectedData({InnerSlickId : 'ddmCRDetailsDiv'}, selectionMsg);

					if(typeof selectedLRDetails == 'undefined')
						return;

					if(typeof selectedLRDetails !== 'undefined') {
						let selectedLRDetailsLength	= selectedLRDetails.length;
						let	crIds					= [];

						for(let i = 0; i < selectedLRDetailsLength; i++) {
							crIds.push(selectedLRDetails[i].crId)
						}
						
						jsonObject.crIds		= crIds.join(',');
					}
					
					localStorage.setItem("crIdString", jsonObject.crIds);
					window.open('printWayBill.do?pageId=340&eventId=10&modulename=multiCRPrint&masterid=0','newwindow', 'config=height=300,width=425, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
				}, printDDM	: function() {
					window.open('DoorDeliveryPrint.do?pageId=304&eventId=5&deliveryRunSheetLedgerId='+deliveryRunSheetLedgerId, 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
				}
			});
		});
