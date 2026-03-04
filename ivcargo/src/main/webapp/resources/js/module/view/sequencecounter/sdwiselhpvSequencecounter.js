define(
		[
			'JsonUtility',
			'messageUtility',
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/sequencecounter/sdwiselhpvSequencecounterfilepath.js',
			'jquerylingua',
			'language',
			'autocomplete',
			'autocompleteWrapper',
			'bootstrapSwitch',
			'nodvalidation',
			'focusnavigation',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
			PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',//PopulateAutocomplete
			PROJECT_IVUIRESOURCES+'/resources/js/module/view/sequencecounter/LhpvSequenceDetails.js'],//PopulateAutocomplete

			function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper, BootstrapSwitch, NodValidation, FocusNavigation,
					BootstrapModal, Selection, LhpvSequenceDetails) {
			'use strict';
			var jsonObject = new Object(), myNod,myNod2, corporateAccountId = 0,  _this = '';
			return Marionette.LayoutView.extend({
				initialize : function(masterObj) {
					_this = this;
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/sdWiseLHPVSeqCounterWS/getSDWiseLHPVSeqCounterElement.do?',	_this.renderCreditorInvoiceElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderCreditorInvoiceElements : function(response) {
					showLayer();

					var jsonObject 	= new Object();
					var loadelement = new Array();
					var baseHtml 	= new $.Deferred();
					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/sequencecounter/SDwiseLhpvSequenceCounter.html",
							function() {
						baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						hideLayer();
						loadLanguageWithParams(FilePath.loadLanguage());
						$("#middle-border-boxshadow").hide();
						$("#bottom-border-boxshadow").hide();
						_this.setAutocompleteInstanceOfBranch();
						_this.setSrcBranch(response);

						var regionAutoComplete 			= new Object();
						regionAutoComplete.primary_key 	= 'regionId';
						regionAutoComplete.callBack 	= _this.onRegionSelect;
						regionAutoComplete.field 		= 'regionName';
						$("#regionEle").autocompleteCustom(regionAutoComplete);

						var autoRegionName = $("#regionEle").getInstance();
						$(autoRegionName).each(function() {
							this.option.source = response.regionList;
						});

						var subRegionAutoComplete 			= new Object();
						subRegionAutoComplete.primary_key 	= 'subRegionId';
						subRegionAutoComplete.callBack 		= _this.onSubRegionSelect;
						subRegionAutoComplete.field 		= 'subRegionName';
						$("#subRegionEle").autocompleteCustom(subRegionAutoComplete);

						var branchAutoComplete 			= new Object();
						branchAutoComplete.primary_key 	= 'branchId';
						branchAutoComplete.field 		= 'branchName';
						branchAutoComplete.callBack		= _this.onBranchSelect;
						$("#branchEle").autocompleteCustom(branchAutoComplete);

						myNod = nod();
						myNod2 = nod();
						myNod.configure({
							parentClass:'validation-message'
						});

						myNod.add({
							selector		: '#srcBranchEle',
							validate		: 'presence',
							errorMessage	: 'Select Branch !'
						});
						myNod.add({
							selector		: '#regionEle',
							validate		: 'presence',
							errorMessage	: 'Select Region !'
						});
						myNod.add({
							selector		: '#subRegionEle',
							validate		: 'presence',
							errorMessage	: 'Select SubRegion !'
						});
						/*myNod.add({
							selector		: '#branchEle',
							validate		: 'presence',
							errorMessage	: 'Select Dest Branch !'
						});*/

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
							selector		: '#maxRangeEle',
							validate 		: 'checkGreater:#minRangeEle:#maxRangeEle',
							errorMessage	: 'Should Be Gretaer Than Min Range'
						});

						myNod2.add({
							selector		: '#srcBranchEle',
							validate		: 'presence',
							errorMessage	: 'Select Branch !'
						});
						myNod2.add({
							selector: '#manualMinRangeEle',
							validate: 'checkForNumber:#manualMinRangeEle',
							errorMessage: 'Enter Min Range !'
						});

						myNod2.add({
							selector: '#manualMaxRangeEle',
							validate: 'checkForNumber:#manualMaxRangeEle',
							errorMessage: 'Enter Max Range !'
						});

						myNod2.add({
							selector		: '#manualMaxRangeEle',
							validate 		: 'checkGreater:#manualMinRangeEle:#manualMaxRangeEle',
							errorMessage	: 'Should Be Gretaer Than Min Range'
						});

						$("#saveLHPVSequence").click(function() {
							myNod.performCheck();

							if(myNod.areAll('valid')) {
								_this.saveLHPVSequence(_this);
							}
						});

						$("#saveManaulLHPVSequence").click(function() {
							myNod2.performCheck();

							if(myNod2.areAll('valid')) {
								_this.saveManaulLHPVSequence();
							}
						});

						$("#viewAllSequences").click(function() {
							_this.viewAllLhpvSequences();
						});

						$("#add").click(function(){
							_this.addSequences();
						});

					});
				}, setAutocompleteInstanceOfBranch : function() {
					var branchAutoComplete 				= new Object();
					branchAutoComplete.primary_key 		= 'branchId';
					branchAutoComplete.field 			= 'branchName';
					branchAutoComplete.callBack			= _this.onSrcBranchSelect;
					$("#srcBranchEle").autocompleteCustom(branchAutoComplete);
				}, setSrcBranch : function(response) {
					var autoBranchName 		= $("#srcBranchEle").getInstance();

					$(autoBranchName).each(function() {
						this.option.source 	= response.sourceBranchList;
					});
				},onRegionSelect : function() {
					var jsonArray = new Array();
					jsonArray.push('#subRegionEle');
					jsonArray.push('#branchEle');
					_this.resetAutcomplete(jsonArray);
					var jsonObject = new Object();
					jsonObject.regionSelectEle_primary_key = $("#" + $(this).attr("id") + "_primary_key").val();
					jsonObject.AllOptionsForSubRegion 		   = false;
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/selectOptionsWS/getSubRegionOption.do', _this.setSubRegion,EXECUTE_WITHOUT_ERROR);
				},setSubRegion : function(jsonObj) {
					var autoSubRegionName = $("#subRegionEle").getInstance();

					$(autoSubRegionName).each(function() {
						this.option.source = jsonObj.subRegion;
					});
				},onSubRegionSelect : function() {
					var jsonArray = new Array();
					jsonArray.push('#branchEle');
					_this.resetAutcomplete(jsonArray);
					jsonObject = new Object();
					jsonObject.subRegionSelectEle_primary_key = $("#" + $(this).attr("id") + "_primary_key").val();
					jsonObject.AllOptionsForBranch 		   = false;
					getJSON(jsonObject,	WEB_SERVICE_URL + '/selectOptionsWS/getPhysicalBranchOption.do', _this.setBranch,EXECUTE_WITHOUT_ERROR);
				},setBranch : function (jsonObj) {
					var autoBranchName = $("#branchEle").getInstance();

					$(autoBranchName).each(function() {
						this.option.source = jsonObj.sourceBranch;
					})
					_this.setRangeSequence();
				},setRangeSequence : function() {
					var jsonObject = new Object();
					$("#minRangeEle").val('');
					$("#maxRangeEle").val('');
					$("#nextValueEle").val('');
					$("#minRangeEle").prop('disabled', false);
					$("#maxRangeEle").prop('disabled', false);
					
					jsonObject.SrcBranchId		= $('#srcBranchEle_primary_key').val();
					jsonObject.DestRegionId		= $('#regionEle_primary_key').val();
					jsonObject.DestSubRegionId	= $('#subRegionEle_primary_key').val();
					
					getJSON(jsonObject,	WEB_SERVICE_URL + '/sdWiseLHPVSeqCounterWS/getLhpvSequenceRange.do',_this.setRange,EXECUTE_WITHOUT_ERROR);
				},setRange : function(response){
					
					console.log('response',response)
					var rangeSeuqence 		= response.sdWiseLhpvSeqCounter;
					//var manualRangeSequence = response.manualLHPVSequenceCounter;
					
					if(typeof rangeSeuqence !== 'undefined') {
						$("#minRangeEle").val(rangeSeuqence.minRange);
						$("#maxRangeEle").val(rangeSeuqence.maxRange);
						$("#nextValueEle").val(rangeSeuqence.nextVal);
						
						$("#minRangeEle").prop('disabled', true);
						$("#maxRangeEle").prop('disabled', true);
					}
					
					/*if(typeof manualRangeSequence !== 'undefined') {
						$("#manualMinRangeEle").val(manualRangeSequence.minRange);
						$("#manualMaxRangeEle").val(manualRangeSequence.maxRange);
						
						$("#manualMinRangeEle").prop('disabled', true);
						$("#manualMaxRangeEle").prop('disabled', true);
					}*/
				},onSrcBranchSelect : function() {
					var jsonObject = new Object();
					$("#manualMinRangeEle").val('');
					$("#manualMaxRangeEle").val('');
					$("#manualMinRangeEle").prop('disabled', false);
					$("#manualMaxRangeEle").prop('disabled', false);
					
					jsonObject.SrcBranchId		= $('#srcBranchEle_primary_key').val();

					getJSON(jsonObject,	WEB_SERVICE_URL + '/lhpvSequenceCounterWS/getManualLhpvSequenceRange.do',_this.setManualSequence,EXECUTE_WITHOUT_ERROR);
				},setManualSequence : function(response){
					var manualRangeSequence = response.manualLHPVSequenceCounter;
					
					if(typeof manualRangeSequence !== 'undefined') {
						$("#manualMinRangeEle").val(manualRangeSequence.minRange);
						$("#manualMaxRangeEle").val(manualRangeSequence.maxRange);
						
						$("#manualMinRangeEle").prop('disabled', true);
						$("#manualMaxRangeEle").prop('disabled', true);
					}
				},onBranchSelect : function() {
					var jsonObject = new Object();
					$("#minRangeEle").val('');
					$("#maxRangeEle").val('');
					$("#nextValueEle").val('');
					$("#minRangeEle").prop('disabled', false);
					$("#maxRangeEle").prop('disabled', false);
					
					jsonObject.SrcBranchId		= $('#srcBranchEle_primary_key').val();
					jsonObject.DestRegionId		= $('#regionEle_primary_key').val();
					jsonObject.DestSubRegionId	= $('#subRegionEle_primary_key').val();
					jsonObject.DestBranchId 	= $('#branchEle_primary_key').val();

					getJSON(jsonObject,	WEB_SERVICE_URL + '/sdWiseLHPVSeqCounterWS/getLhpvSequenceRange.do',_this.setSequence,EXECUTE_WITHOUT_ERROR);
				},setSequence : function(response){
					var rangeSeuqence 		= response.sdWiseLhpvSeqCounter;
					var manualRangeSequence = response.manualLHPVSequenceCounter;
					
					if(typeof rangeSeuqence !== 'undefined') {
						$("#minRangeEle").val(rangeSeuqence.minRange);
						$("#maxRangeEle").val(rangeSeuqence.maxRange);
						$("#nextValueEle").val(rangeSeuqence.nextVal);
						
						$("#minRangeEle").prop('disabled', true);
						$("#maxRangeEle").prop('disabled', true);
					}
					
					if(typeof manualRangeSequence !== 'undefined') {
						$("#manualMinRangeEle").val(manualRangeSequence.minRange);
						$("#manualMaxRangeEle").val(manualRangeSequence.maxRange);
						
						$("#manualMinRangeEle").prop('disabled', true);
						$("#manualMaxRangeEle").prop('disabled', true);
					}
				},resetAutcomplete : function (jsonArray) {
					for ( var eleId in jsonArray) {
						var elem = $(jsonArray[eleId]).getInstance();
						$(elem).each(function() {
							var elemObj = this.elem.combo_input;
							$(elemObj).each(function() {
								$("#" + $(this).attr("id")).val('');
								$("#" + $(this).attr("id") + '_primary_key').val("");
							})
						})
					}
				}, saveLHPVSequence : function() {
					showLayer();
					var jsonObject = new Object();

					jsonObject.SrcBranchId		= $('#srcBranchEle_primary_key').val();
					jsonObject.DestRegionId		= $('#regionEle_primary_key').val();
					jsonObject.DestSubRegionId	= $('#subRegionEle_primary_key').val();
					jsonObject.DestBranchId		= $('#branchEle_primary_key').val();
					jsonObject.lhpvSequenceMin	= $('#minRangeEle').val();
					jsonObject.lhpvSequenceMax	= $('#maxRangeEle').val();
					jsonObject.nextVal			= $('#nextValueEle').val();

					getJSON(jsonObject, WEB_SERVICE_URL + '/sdWiseLHPVSeqCounterWS/addSDWiseLHPVSeqCounter.do', _this.showLHPVSequence, EXECUTE_WITH_ERROR);
				},showLHPVSequence : function(response) {
					if(response.message != undefined) {
						hideLayer();
						return;
					}
				}, saveManaulLHPVSequence : function() {
					showLayer();
					var jsonObject = new Object();

					jsonObject.SrcBranchId		= $('#srcBranchEle_primary_key').val();
					jsonObject.LhpvSequenceMin	= $('#manualMinRangeEle').val();
					jsonObject.LhpvSequenceMax	= $('#manualMaxRangeEle').val();

					getJSON(jsonObject, WEB_SERVICE_URL + '/lhpvSequenceCounterWS/addManualLhpvSeqCounter.do', _this.showManaulLHPVSequence, EXECUTE_WITH_ERROR);
				},showManaulLHPVSequence : function(response) {
					if(response.message != undefined){
						$("#minRangeEle").val('');
						$("#maxRangeEle").val('');
						hideLayer();
						return;
					}
				},viewAllLhpvSequences	: function() {
					var jsonObject 		= new Object();
					var object 			= new Object();
					object.elementValue = jsonObject;

					var btModal = new Backbone.BootstrapModal({
						content: new LhpvSequenceDetails(object),
						modalWidth : 80,
						title:'LHPV Sequence Details'

					}).open();
					object.btModal = btModal;
					new LhpvSequenceDetails(object)
					btModal.open();
				},addSequences	: function() {
					$("#middle-border-boxshadow").toggle(900);
					$("#bottom-border-boxshadow").toggle(900);
				}
			});
		});