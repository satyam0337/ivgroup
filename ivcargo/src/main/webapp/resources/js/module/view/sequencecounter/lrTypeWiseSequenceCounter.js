define(
		[
			'JsonUtility',
			'messageUtility',
			'autocomplete',
			'autocompleteWrapper',
			'bootstrapSwitch',
			'nodvalidation',
			'focusnavigation',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		],	function() {
			'use strict';
			let jsonObject = new Object(), myNod, _this = '',sequenceCounterId = 0,showRangeInLrTypeWiseSequenceCounter = false;
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/lrSequenceCounterWS/loadLRTypeWiseSequenceCounterMaster.do?', _this.renderCreditorInvoiceElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderCreditorInvoiceElements : function(response) {
					showLayer();

					let loadelement = new Array();
					let baseHtml 	= new $.Deferred();
					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/sequencecounter/lrTypeWiseSequenceCounter.html", function() {
						baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						hideLayer();
						_this.setAutocompleteInstanceOfBranch();
						_this.setSrcBranch(response);
						
						$('#srcBranchEle').focus();
						
						$('#srcBranchEle').on('change', function() {
							_this.onSequenceTypeSelect();
							$('#wayBillTypeId').focus();
						})
						
						$('#wayBillTypeId').on('change', function() {
							_this.onSequenceTypeSelect();
							$('#sequenceTypeId').focus();
						})
						
						$('#sequenceTypeId').on('change', function() {
							_this.onSequenceTypeSelect();
						})
						
						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});

						myNod.add({
							selector		: '#srcBranchEle',
							validate		: 'presence',
							errorMessage	: 'Select Branch !'
						});
						
						myNod.add({
							selector		: '#wayBillTypeId',
							validate		: 'presence',
							errorMessage	: 'Select Type !'
						});
						
						myNod.add({
							selector		: '#sequenceTypeId',
							validate		: 'presence',
							errorMessage	: 'Select Sequence Type !'
						});

						showRangeInLrTypeWiseSequenceCounter = response.showRangeInLrTypeWiseSequenceCounter;
						
						if (showRangeInLrTypeWiseSequenceCounter) {
							$('[data-attribute="minRange"]').removeClass('hide');
							$('[data-attribute="maxRange"]').removeClass('hide');

							myNod.add({
								selector: '#minRangeEle',
								validate: 'checkForNumber:#minRangeEle',
								errorMessage: 'Enter Min Range !'
							});

							myNod.add({
								selector: '#maxRangeEle',
								validate: 'checkForNumber:#maxRangeEle',
								errorMessage: 'Enter Max Range !'
							});

							myNod.add({
								selector: '#maxRangeEle',
								validate: 'checkGreater:#minRangeEle:#maxRangeEle',
								errorMessage: 'Should Be Gretaer Than Min Range'
							});
						} else
							$("#nextValueEle").prop('disabled', false);

						$("#saveLrSequence").click(function() {
							myNod.performCheck();

							if(myNod.areAll('valid'))
								_this.saveLrSequence(_this);
						});
						
						$("#updateLrSequence").click(function() {
							myNod.performCheck();

							if(myNod.areAll('valid'))
								_this.updateLrSequence();
						});
					});
				}, setAutocompleteInstanceOfBranch : function() {
					let branchAutoComplete 				= new Object();
					branchAutoComplete.primary_key 		= 'branchId';
					branchAutoComplete.field 			= 'branchName';
					branchAutoComplete.callBack			= _this.resetAllField;
					$("#srcBranchEle").autocompleteCustom(branchAutoComplete);
					
					let wayBillTypeId 				= new Object();
					wayBillTypeId.primary_key 		= 'wayBillTypeId';
					wayBillTypeId.field 			= 'wayBillTypeName';
					$("#wayBillTypeId").autocompleteCustom(wayBillTypeId);
					
					let sequenceTypeId 				= new Object();
					sequenceTypeId.primary_key 		= 'sequenceType';
					sequenceTypeId.field 			= 'sequenceTypeName';
					sequenceTypeId.callBack			= _this.resetAllField;
					$("#sequenceTypeId").autocompleteCustom(sequenceTypeId);
					
				}, setSrcBranch : function(response) {
					let autoBranchName 		= $("#srcBranchEle").getInstance();

					$(autoBranchName).each(function() {
						this.option.source 	= response.sourceBranchList;
					});
					
					let wayBillTypeId 		= $("#wayBillTypeId").getInstance();

					$(wayBillTypeId).each(function() {
						this.option.source = response.wayBillTypeList;
					});
					
					let sequenceTypeId 		= $("#sequenceTypeId").getInstance();

					$(sequenceTypeId).each(function() {
						this.option.source = response.wayBillSequenceTypeList;
					});
				}, onSequenceTypeSelect : function() {
					let jsonObject = new Object();
					_this.resetAllField();
					
					jsonObject.sourceBranchId	= $('#srcBranchEle_primary_key').val();
					jsonObject.wayBillTypeId	= $('#wayBillTypeId_primary_key').val();
					jsonObject.sequenceTypeId	= $('#sequenceTypeId_primary_key').val();
					
					if(jsonObject.srcBranchId != '' && jsonObject.wayBillTypeId != '' && jsonObject.sequenceTypeId != '')
						getJSON(jsonObject,	WEB_SERVICE_URL + '/lrSequenceCounterWS/getLrTypeWiseSequenceCounter.do',_this.setSequence,EXECUTE_WITHOUT_ERROR);
				}, setSequence : function(response) {
					let rangeSeuqence 		= response.sequenceCounter;
					
					if(typeof rangeSeuqence !== 'undefined') {
						$("#minRangeEle").val(rangeSeuqence.minRange);
						$("#maxRangeEle").val(rangeSeuqence.maxRange);
						$("#nextValueEle").val(rangeSeuqence.nextVal);
						
						$("#saveLrSequence").prop('disabled', true);
						$("#updateLrSequence").prop('disabled', false);
						sequenceCounterId	= rangeSeuqence.sequenceCounterId;
					}
				}, saveLrSequence : function() {
					showLayer();
					let jsonObject = new Object();

					jsonObject.sourceBranchId	= $('#srcBranchEle_primary_key').val();
					jsonObject.minRange			= $('#minRangeEle').val();
					jsonObject.maxRange			= $('#maxRangeEle').val();
					jsonObject.nextValue		= $('#nextValueEle').val();
					jsonObject.wayBillTypeId	= $('#wayBillTypeId_primary_key').val();
					jsonObject.sequenceTypeId	= $('#sequenceTypeId_primary_key').val();
					jsonObject.showRangeInLrTypeWiseSequenceCounter	= showRangeInLrTypeWiseSequenceCounter;

					getJSON(jsonObject, WEB_SERVICE_URL + '/lrSequenceCounterWS/insertLrTypeWiseSequence.do', _this.setLrSequence, EXECUTE_WITH_ERROR);
				}, setLrSequence : function(response) {
					hideLayer();
					
					if(response.message != undefined && response.success != undefined) {
						$("#saveLrSequence").prop('disabled', true);
						$("#updateLrSequence").prop('disabled', false);
						$('#nextValueEle').val($('#minRangeEle').val());
					}
				}, updateLrSequence : function() {
					showLayer();
					let jsonObject = new Object();
					
					jsonObject.minRange				= $('#minRangeEle').val();
					jsonObject.maxRange				= $('#maxRangeEle').val();
					jsonObject.nextValue			= $('#nextValueEle').val();
					jsonObject.sequenceCounterId	= sequenceCounterId;
					jsonObject.showRangeInLrTypeWiseSequenceCounter	= showRangeInLrTypeWiseSequenceCounter;

					getJSON(jsonObject, WEB_SERVICE_URL + '/lrSequenceCounterWS/updateLrTypeWiseSequence.do', _this.updateLrSequences, EXECUTE_WITH_ERROR);
				}, updateLrSequences : function(response) {
					
					if(response.message != undefined) {
						$("#saveLrSequence").prop('disabled', true);
						$("#updateLrSequence").prop('disabled', false);
						hideLayer();
					}
					
					if(response.success != undefined)
						$('#nextValueEle').val($('#minRangeEle').val())
				}, resetAllField : function() {
					$("#minRangeEle").val('');
					$("#maxRangeEle").val('');
					$("#nextValueEle").val('');
					$("#saveLrSequence").prop('disabled', false);
					$("#updateLrSequence").prop('disabled', true);
				}
			});
		});