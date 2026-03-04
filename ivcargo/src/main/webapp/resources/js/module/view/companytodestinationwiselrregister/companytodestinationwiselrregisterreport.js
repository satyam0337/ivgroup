

define([  'JsonUtility'
          ,'messageUtility'
          ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/companytodestinationwiselrregister/companytodestinationwiselrregisterreportfilepath.js'
          ,'jquerylingua'
          ,'language'
          ,'autocomplete'
          ,'autocompleteWrapper'
          ,'slickGridWrapper2'
          ,'nodvalidation'
          ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
          ,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
          ,'focusnavigation'//import in require.config
          ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/populatesubregionandbranch.js'//PopulateAutocomplete
          ],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper,
        		  slickGridWrapper2, NodValidation, BootstrapModal,datePickerUI,ElementFocusNavigation,PopulateAutocomplete) {
	'use strict';
	var jsonObject = new Object(), myNod,destinationWisePrintList,destinationWisePrintList1,weightWisePrintList, corporateAccountId = 0, tab = "createTab", _this = '', gridObject, corporateAccountId = 0,crossingTypeComboBoxShow = false, customerAccessId = 0, masterLangObj, masterLangKeySet, caLangObj, caLangKeySet ,reciveButtonRowId, sourceBranchListForSeparateWeight, sourceBranchArrForSeparateWeight 	= new Array(),crossingBranchIds;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/companyToDestinationWiseLRRegisterWS/getCompanyToDestinationWiseLRRegisterElements.do?',	_this.setDestinationWiseLsRegisterElements,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},setDestinationWiseLsRegisterElements : function(response){
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			var executive	= response.executive;
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/companytodestinationwiselrregister/companytodestinationsummaryreport.html",function() {
				baseHtml.resolve();
			});
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				var keyObject = Object.keys(response);
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show == false) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("hide");
					}
				}
				var options		= new Object();
				options.minDate	= response.minDateString;
				$("#dateEle").DatePickerCus(options);
				
				var regionAutoComplete = new Object();
				regionAutoComplete.primary_key  = 'regionId';
				regionAutoComplete.callBack 	= _this.onRegionSelect;
				regionAutoComplete.field 		= 'regionName';
				$("#regionEle").autocompleteCustom(regionAutoComplete);
				if (executive.executiveType == 1) {
					var autoRegionName = $("#regionEle").getInstance();
					$(autoRegionName).each(function() {
						this.option.source = response.regionList;
					});
				}
				var subRegionAutoComplete 			= new Object();
				subRegionAutoComplete.primary_key	= 'subRegionId';
				subRegionAutoComplete.callBack 		= _this.onSubRegionSelect;
				subRegionAutoComplete.field			= 'subRegionName';
				$("#subRegionEle").autocompleteCustom(subRegionAutoComplete);
				
				var branchAutoComplete 			= new Object();
				branchAutoComplete.primary_key  = 'branchId';
				branchAutoComplete.field 		= 'branchName';
				$("#branchEle").autocompleteCustom(branchAutoComplete);
				
				var companyNameAutoComplete 			= new Object();
				companyNameAutoComplete.primary_key 	= 'companyHeadMasterId';
				companyNameAutoComplete.callBack 		= _this.onCompanyNameSelect;
				companyNameAutoComplete.url 			= response.companyHeadMasterArr;
				companyNameAutoComplete.field 			= 'companyHeadName';
				$("#companyNameEle").autocompleteCustom(companyNameAutoComplete);
				
				var companyBranchAutoComplete 			= new Object();
				companyBranchAutoComplete.primary_key 	= 'branchId';
				//companyBranchAutoComplete.url 			= response.CompanyHeadToBranchMapperArr;
				companyBranchAutoComplete.field 		= 'branchName';
				$("#companyBranchEle").autocompleteCustom(companyBranchAutoComplete);
				
				masterLangObj = FilePath.loadLanguage();
				masterLangKeySet = loadLanguageWithParams(masterLangObj);
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector: '#regionEle',
					validate: 'validateAutocomplete:#regionEle_primary_key',
					errorMessage: 'Select proper Region !'
				});

				myNod.add({
					selector: '#subRegionEle',
					validate: 'validateAutocomplete:#subRegionEle_primary_key',
					errorMessage: 'Select proper Area !'
				});
				myNod.add({
					selector: '#companyNameEle',
					validate: 'validateAutocomplete:#companyNameEle_primary_key',
					errorMessage: 'Select Company !'
				});

				myNod.add({
					selector: '#branchEle',
					validate: 'validateAutocomplete:#branchEle_primary_key',
					errorMessage: 'Select proper Branch !'
				});
				
			/*	myNod.add({
					selector: '#companyBranchEle',
					validate: 'validateAutocomplete:#companyBranchEle_primary_key',
					errorMessage: 'Select proper Branch !'
				});*/

				if (executive.executiveType == 6) {
					$("#regionEle_primary_key").val(executive.regionId);
					var autoSubRegionName = $("#subRegionEle").getInstance();

					$(autoSubRegionName).each(function() {
						this.option.source = response.subRegionList;
					});
				}
				if (executive.executiveType == 7) {
					$("#regionEle_primary_key").val(executive.regionId);
					$("#subRegionEle_primary_key").val(executive.subRegionId);
					var autoBranchName = $("#branchEle").getInstance();

					$(autoBranchName).each(function() {
						this.option.source = response.branchList;
					})
				}
				if (executive.executiveType == 3) {
					$("#regionEle_primary_key").val(executive.regionId);
					$("#subRegionEle_primary_key").val(executive.subRegionId);
					$("#branchEle_primary_key").val(executive.branchId);
				}
				if (executive.executiveType == 4) {
					$("#regionEle_primary_key").val(executive.regionId);
					$("#subRegionEle_primary_key").val(executive.subRegionId);
					$("#branchEle_primary_key").val(executive.branchId);
				}
				hideLayer();
				$("#saveBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_this.onSubmit(_this);								
					}
				});
				$("#companyWiseLsDetailsBtn").click(function() {
						_this.getCompanyWisePrint();								
				});
				$("#companyWiseWeightDetailsBtn").click(function() {
					_this.getCompanyWiseWeightPrint();								
				});
				$("#WeightDetailsMoreThen5000Btn").click(function() {
					_this.getPopUpForCompanyWiseWeightMoreThan5000Print();								
				});
				var showTranshipmentButton = response.showTranshipmentButton;
				crossingBranchIds 	   = response.crossingBranchIds;
				if(showTranshipmentButton == true || showTranshipmentButton == 'true'){
					$('#transhipmentBtn').show();
				}
				$("#transhipmentBtn").click(function() {
					_this.getTranshipmentBranchData();								
				});
			});

		},onRegionSelect : function() {
			var jsonArray = new Array();
			jsonArray.push('#subRegionEle');
			jsonArray.push('#branchEle');
			jsonArray.push('#companyNameEle');
			jsonArray.push('#companyBranchEle');
			_this.resetAutcomplete(jsonArray);
			var jsonObject = new Object();
			jsonObject.regionSelectEle_primary_key = $("#" + $(this).attr("id") + "_primary_key").val();
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/selectOptionsWS/getSubRegionOption.do', _this.setSubRegion,EXECUTE_WITHOUT_ERROR);
		},setSubRegion : function(jsonObj) {
			for(var i=0;i<jsonObj.subRegion.length;i++){
				var subregionName = jsonObj.subRegion[i];
				if(subregionName.subRegionId == -1){
					jsonObj.subRegion.splice(i,1);
				}
			}
			var autoSubRegionName = $("#subRegionEle").getInstance();
			$(autoSubRegionName).each(function() {
				this.option.source = jsonObj.subRegion;
			});
		},onSubRegionSelect : function() {
			var jsonArray = new Array();
			jsonArray.push('#branchEle');
			jsonArray.push('#companyNameEle');
			jsonArray.push('#companyBranchEle');
			_this.resetAutcomplete(jsonArray);
			jsonObject = new Object();
			jsonObject.subRegionSelectEle_primary_key = $("#" + $(this).attr("id") + "_primary_key").val();
			getJSON(jsonObject,	WEB_SERVICE_URL + '/selectOptionsWS/getPhysicalBranchOption.do', _this.setBranch,EXECUTE_WITHOUT_ERROR);
		},setBranch : function (jsonObj) {
			if(jsonObj.sourceBranch != undefined){
				for(var i=0;i<jsonObj.sourceBranch.length;i++){
					var branch = jsonObj.sourceBranch[i];
					if(branch.branchId == -1){
						jsonObj.sourceBranch.splice(i,1);
					}
				}
			}
			var autoBranchName = $("#branchEle").getInstance();

			$(autoBranchName).each(function() {
				this.option.source = jsonObj.sourceBranch;
			})
		},onCompanyNameSelect : function() {
			var jsonArray = new Array();
			jsonArray.push('#companyBranchEle');
			_this.resetAutcomplete(jsonArray);
			var jsonObject = new Object();
			jsonObject.companyHeadMasterId = $("#" + $(this).attr("id") + "_primary_key").val();
			 getJSON(jsonObject, WEB_SERVICE_URL	+ '/companyToDestinationWiseLRRegisterWS/getCompanyBrancesList.do', _this.setCompanyBranch,EXECUTE_WITHOUT_ERROR);
		},setCompanyBranch : function(jsonObj) {
			var autoBranchName = $("#companyBranchEle").getInstance();
			$(autoBranchName).each(function() {
				this.option.source = jsonObj.CompanyHeadToBranchMapperArr;
				this.elem.combo_input.context.value = "ALL";
				document.getElementById(this.elem.combo_input.context.id+'_primary_key').value = "-1";
			})
		/*	$("#companyBranchEle").val("ALL");
			$("#companyBranchEle_primary_key").val("-1");*/
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
		},onSubmit : function() {
			showLayer();
			var jsonObject = new Object();
			
			if($("#dateEle").attr('data-startdate') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			}

			if($("#dateEle").attr('data-enddate') != undefined){
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			}
			jsonObject["regionId"] 				= $('#regionEle_primary_key').val();
			jsonObject["subRegionId"] 			= $('#subRegionEle_primary_key').val();
			jsonObject["branchId"] 				= $('#branchEle_primary_key').val();
			jsonObject["companyHeadMasterId"] 	= $('#companyNameEle_primary_key').val();
			if($('#companyBranchEle_primary_key').val() == ""){
				jsonObject["companyBranchId"] 		= -1;
			}else{
				jsonObject["companyBranchId"] 		= $('#companyBranchEle_primary_key').val();
			}
			$('.ac_navi').hide();
			$('.ac_result_area').hide();
			getJSON(jsonObject, WEB_SERVICE_URL+'/companyToDestinationWiseLRRegisterWS/getCompanyToDestinationWiseLRDetails.do', _this.setDestinationWiseLsRegisterTableData, EXECUTE_WITH_ERROR);
		},getTranshipmentBranchData : function() {
			showLayer();
			var jsonObject = new Object();
			
			if($("#dateEle").attr('data-startdate') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			}

			if($("#dateEle").attr('data-enddate') != undefined){
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			}
			jsonObject["regionId"] 				= $('#regionEle_primary_key').val();
			jsonObject["subRegionId"] 			= $('#subRegionEle_primary_key').val();
			jsonObject["branchIds"] 			= crossingBranchIds ;
			jsonObject["companyHeadMasterId"] 	= $('#companyNameEle_primary_key').val();
			if($('#companyBranchEle_primary_key').val() == ""){
				jsonObject["companyBranchId"] 		= -1;
			}else{
				jsonObject["companyBranchId"] 		= $('#companyBranchEle_primary_key').val();
			}
			$('.ac_navi').hide();
			$('.ac_result_area').hide();
			getJSON(jsonObject, WEB_SERVICE_URL+'/companyToDestinationWiseLRRegisterWS/getCompanyToDestinationWiseLRDetails.do', _this.setDestinationWiseLsRegisterTableData, EXECUTE_WITH_ERROR);
		},setDestinationWiseLsRegisterTableData : function(response) {
			if(response.message != undefined){
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			var deliveryColumnConfig	= response.reportData.columnConfiguration;
			var deliveryKeys	= _.keys(deliveryColumnConfig);
			var dcolConfig	= new Object();
			for (var i=0; i<deliveryKeys.length; i++) {
				var dObj	= deliveryColumnConfig[deliveryKeys[i]];
				if (dObj.show == true) {
					dcolConfig[deliveryKeys[i]]	= dObj;
				}
			}
			response.columnConfiguration	= dcolConfig;
			//response.Language	= masterLangKeySet;
			response.reportData.Language	= masterLangKeySet;
			response.weightReportData.Language	= masterLangKeySet;
			
			destinationWisePrintList	= response.reportData.CorporateAccount;
			sourceBranchListForSeparateWeight = response.reportData.sourceBranchListForSeparateWeight;
			//console.log('sourceBranchListForSeparateWeight',sourceBranchListForSeparateWeight);
			
			if(sourceBranchListForSeparateWeight != undefined && sourceBranchListForSeparateWeight.length > 0) {
				
				var sourceId		= sourceBranchListForSeparateWeight.split(",");
				
				for(var i = 0; i < sourceId.length; i++) {
					sourceBranchArrForSeparateWeight.push(Number(sourceId[i]));
				}
			}
			
			if(response.reportData.CorporateAccount != undefined && response.reportData.CorporateAccount.length > 0) {
				$('#bookingDetails').show();
				gridObject = slickGridWrapper2.setGrid(response.reportData);
				destinationWisePrintList1	 = JSON.parse(JSON.stringify(destinationWisePrintList));
				weightWisePrintList			 = response.weightReportData.CorporateAccount;
				
				var dataViewObject = grid.getData();
				var columnsArr = new Array();
				var columns = grid.getColumns();
				columns.forEach(function (col) {
					if(col.hasTotal){
						columnsArr.push(new Slick.Data.Aggregators.Sum(col.field));
					}
				});

				dataViewObject.setGrouping([{
					getter: 'lsDestinationBranchName',
					formatter: function (g) {
						return  g.value + "  <span style='color:green'>(" + g.count + " rows)</span>";
					},
					aggregators: columnsArr,
					aggregateCollapsed: true,
					lazyTotalsCalculation: true,
					comparer: function (a, b) {
						var x = a['value'], y = b['value'];
						return 1 * (x === y ? 0 : (x > y ? 1 : -1));
					    },
				},{
					getter: 'companyHeadName',
					formatter: function (g) {
						return  g.value + "  <span style='color:green'>(" + g.count + " rows)</span>";
					},
					aggregators: columnsArr,
					aggregateCollapsed: true,
					lazyTotalsCalculation: true,
					comparer: function (a, b) {
						var x = a['value'], y = b['value'];
						return 1 * (x === y ? 0 : (x > y ? 1 : -1));
					    },
					    collapsed:true
				}]);
			
				
			}
			hideLayer();
		},getCompanyWisePrint : function(){
			
			var columns = grid.getColumns();
			var destinationWiseFinalColl = new Object();
			var destinationwiseColl = new Object();
			var companyWiseDataCollArr;
			console.log('destinationWisePrintList ',destinationWisePrintList);
			console.log('destinationWisePrintList1 ',destinationWisePrintList1);
			var destinationSubregionwiseColl	= _.groupBy(destinationWisePrintList,'lsDestinationSubRegionId');
			_.each(destinationSubregionwiseColl, function(object){
				var brwiseColl	= _.groupBy(object,'lsDestinationBranchName');
				var brKeys		= _.sortBy(_.keys(brwiseColl));
				for ( var i = 0; i < brKeys.length; i++) {
					destinationwiseColl[brKeys[i]]	= brwiseColl[brKeys[i]];
				}
			});
			//var destinationwiseColl = _.groupBy(destinationWisePrintList,'lsDestinationBranchName');
			_.map(destinationwiseColl,function(destinationColl,destinationName){
				companyWiseDataCollArr = _.groupBy(destinationColl,'companyHeadName');
				var companyWiseDataCollKeys = _.sortBy(_.keys(companyWiseDataCollArr));
				var companyWiseDataCollArrSorted = new Object();
				for ( var i = 0; i < companyWiseDataCollKeys.length; i++ ) {
				    companyWiseDataCollArrSorted[companyWiseDataCollKeys[i]]	= companyWiseDataCollArr[companyWiseDataCollKeys[i]]
				}
				_.map(companyWiseDataCollArrSorted,function(lsData,companyName){
					var companyWiseData = new Object();
					companyWiseData['companyHeadName']  = companyName;

					_.each(columns,function(col){
						if(col.hasTotal){
							companyWiseData[col.field] = _.reduce(_.pluck(lsData, col.field), function(memo, num){ return memo + num; }, 0);
						}
					})
					var destinationWiseArr =  destinationWiseFinalColl[destinationName];
					if(destinationWiseArr == undefined){
						destinationWiseArr = new Array();
					}
					destinationWiseArr.push(companyWiseData);
					destinationWiseFinalColl[destinationName] = destinationWiseArr;
				})
				
			})
			/*var sortedObj = new Object();
			Object.keys(destinationWiseFinalColl).sort().forEach(function(key) {
		        var value = destinationWiseFinalColl[key];
		        delete destinationWiseFinalColl[key];
		        destinationWiseFinalColl[key] = value;
		    });*/


			_this.getPopUpForCompanyWisePrint(destinationWiseFinalColl);
			
		},getPopUpForCompanyWisePrint : function(lsNumberWiseColl){
			var finalObj = new Object();
			finalObj.destinationWiseColl = lsNumberWiseColl;
			var columnsArr = grid.getColumns();
			var finalCulumns = [{
				field : 'companyHeadName',
				dataType : 'text',
					hasTotal : false,
					id : 'companyHeadName',
					name : 'Company Name',
					printWidth : 10
			}]
			
			_.each(columnsArr,function(col){
				if(col.hasTotal){
					finalCulumns.push(col)
				}
			})
			finalObj.columns = finalCulumns;
			
			var accountGroupName = $("#accountGroupName").val();
			var headerDetails = $("#printDetails").val();
			var headerValue = $("*[data-selector='header']").html();
			var selectedDetails="";
			$("#ElementDiv").find('span').each(function(index) {
				if(!$(this).isHidden() && $(this).prop("id") != undefined && $(this).prop("id") != '' ){
					selectedDetails += "<b>"+$(this).html()+"</b> = "+ $("#"+$(this).prop("id")+'Ele').val()+"&emsp;";	
				}
			});
			
			finalObj.accountGroupdata = {
					accountGroupName : accountGroupName,
					headerDetails: headerDetails,
					headerValue: headerValue,
					selectedDetails:selectedDetails
			}
			
			var width = 800;
			var height = 500;
			var left = parseInt((screen.availWidth/2) - (width/2));
			var top = parseInt((screen.availHeight/2) - (height/2));
			var childWindow = window.open("/ivcargo/html/module/companytodestinationwiselrregister/companytodetailsdestinationwiseprint.html");
			childWindow.dataObject=finalObj;
		},getCompanyWiseWeightPrint : function(){
			
			var columns = grid.getColumns();
			var destinationWiseFinalColl = new Object();
			var destinationwiseColl = new Object();
			var companyWiseDataCollArr;
			var destinationSubregionwiseColl	= _.groupBy(destinationWisePrintList1,'lsDestinationSubRegionId');
			//console.log('destinationSubregionwiseColl ',destinationSubregionwiseColl);
			_.each(destinationSubregionwiseColl, function(object){
				var brwiseColl	= _.groupBy(object,'lsDestinationBranchName');
				//console.log('brwiseColl ',brwiseColl);
				var brKeys		= _.sortBy(_.keys(brwiseColl));
				//console.log('brKeys ',brKeys);
				for ( var i = 0; i < brKeys.length; i++) {
					destinationwiseColl[brKeys[i]]	= brwiseColl[brKeys[i]];
				}
			});
			//console.log('destinationwiseColl[brKeys[i]] ', destinationwiseColl);
			//var destinationwiseColl = _.groupBy(destinationWisePrintList,'lsDestinationBranchName');
			_.map(destinationwiseColl,function(destinationColl,destinationName){
				//console.log('destinationColl ', destinationColl);
				//console.log('sourceBranchArrForSeparateWeight ', sourceBranchArrForSeparateWeight);
				//console.log('sourceBranchArrForSeparateWeight.length '+ sourceBranchArrForSeparateWeight.length);
				if(sourceBranchArrForSeparateWeight != null && sourceBranchArrForSeparateWeight.length > 0 ){
					//console.log('destinationColl.length ', destinationColl.length);
					for(var j =0; j < destinationColl.length; j++){
						//console.log('destinationColl[j].wayBillSourceBranchId ', destinationColl[j].wayBillSourceBranchId);
						if(_.contains(sourceBranchArrForSeparateWeight, destinationColl[j].wayBillSourceBranchId)){
							destinationColl[j].companyHeadName = destinationColl[j].wayBillSourceBranchName.toUpperCase();
							//console.log('destinationColl[j].companyHeadName ', destinationColl[j].companyHeadName);
						}
					}
				}
				companyWiseDataCollArr = _.groupBy(destinationColl,'companyHeadName');
				//console.log('companyWiseDataCollArr ', companyWiseDataCollArr);
				var companyWiseDataCollKeys = _.sortBy(_.keys(companyWiseDataCollArr));
				var companyWiseDataCollArrSorted = new Object();
				for ( var i = 0; i < companyWiseDataCollKeys.length; i++ ) {
				    companyWiseDataCollArrSorted[companyWiseDataCollKeys[i]]	= companyWiseDataCollArr[companyWiseDataCollKeys[i]]
				}
				//console.log('companyWiseDataCollArrSorted ', companyWiseDataCollArrSorted);
				_.map(companyWiseDataCollArrSorted,function(lsData,companyName){
					var companyWiseData = new Object();
					companyWiseData['companyHeadName']  = companyName;
					_.each(columns,function(col){
						if(col.hasTotal){
							companyWiseData[col.field] = _.reduce(_.pluck(lsData, col.field), function(memo, num){ return memo + num; }, 0);
						}
					})
					//console.log('destinationName ', destinationName);
					var destinationWiseArr =  destinationWiseFinalColl[destinationName];
					if(destinationWiseArr == undefined){
						destinationWiseArr = new Array();
					}
					//console.log('companyWiseData ', companyWiseData);
					destinationWiseArr.push(companyWiseData);
					destinationWiseFinalColl[destinationName] = destinationWiseArr;
				})
				
			})
			//console.log('destinationWiseFinalColl ', destinationWiseFinalColl);
			/*var sortedObj = new Object();
			Object.keys(destinationWiseFinalColl).sort().forEach(function(key) {
		        var value = destinationWiseFinalColl[key];
		        delete destinationWiseFinalColl[key];
		        destinationWiseFinalColl[key] = value;
		    });*/


			_this.getPopUpForCompanyWiseWeightPrint(destinationWiseFinalColl);
			
		},getPopUpForCompanyWiseWeightPrint : function(lsNumberWiseColl){
			var finalObj = new Object();
			finalObj.destinationWiseColl = lsNumberWiseColl;
			var columnsArr = grid.getColumns();
			//console.log('columnsArr ',columnsArr);
			var finalCulumns = [{
				field : 'companyHeadName',
				dataType : 'text',
					hasTotal : false,
					id : 'companyHeadName',
					name : 'Company Name',
					printWidth : 10
			}]
			columnsArr = _.where(columnsArr, {id: "wayBillDispatchActualWeight"});
			_.each(columnsArr,function(col){
				if(col.hasTotal){
					finalCulumns.push(col)
				}
			})
			finalObj.columns = finalCulumns;
			
			var accountGroupName = $("#accountGroupName").val();
			var headerDetails = $("#printDetails").val();
			var headerValue = $("*[data-selector='header']").html();
			var selectedDetails="";
			$("#ElementDiv").find('span').each(function(index) {
				if(!$(this).isHidden() && $(this).prop("id") != undefined && $(this).prop("id") != '' ){
					selectedDetails += "<b>"+$(this).html()+"</b> = "+ $("#"+$(this).prop("id")+'Ele').val()+"&emsp;";	
				}
			});
			
			finalObj.weightWisePrintList = weightWisePrintList;
			finalObj.accountGroupdata = {
					accountGroupName : accountGroupName,
					headerDetails: headerDetails,
					headerValue: headerValue,
					selectedDetails:selectedDetails
			}
			
			var width = 800;
			var height = 500;
			var left = parseInt((screen.availWidth/2) - (width/2));
			var top = parseInt((screen.availHeight/2) - (height/2));
			var childWindow = window.open("/ivcargo/html/module/companytodestinationwiselrregister/companytodetailsdestinationwiseprint.html");
			childWindow.dataObject=finalObj;
		},getPopUpForCompanyWiseWeightMoreThan5000Print : function(){
			var finalObj = new Object();
			var columnsArr = grid.getColumns();
			console.log('columnsArr ',columnsArr);
			var finalCulumns = [{
				field : 'wayBillNumber',
				dataType : 'text',
					hasTotal : false,
					id : 'wayBillNumber',
					name : 'LR  Number',
					printWidth : 10
			},{
				field : 'wayBillSourceBranchName',
				dataType : 'text',
					hasTotal : false,
					id : 'wayBillSourceBranchName',
					name : 'From',
					printWidth : 10
			},{
				field : 'wayBillDestinationBranchName',
				dataType : 'text',
					hasTotal : false,
					id : 'wayBillDestinationBranchName',
					name : 'To',
					printWidth : 10
			},{
				field : 'wayBillDispatchActualWeight',
				dataType : 'text',
					hasTotal : true,
					id : 'wayBillDispatchActualWeight',
					name : 'Weight',
					printWidth : 10
			},{
				field : 'wayBillTypeString',
				dataType : 'text',
					hasTotal : false,
					id : 'wayBillTypeString',
					name : 'LR Type',
					printWidth : 10
			},{
				field : 'wayBillToPayAmount',
				dataType : 'text',
					hasTotal : true,
					id : 'wayBillToPayAmount',
					name : 'Booking Total',
					printWidth : 10
			}]
	
			console.log(finalCulumns);
			finalObj.columns = finalCulumns;
			
			var accountGroupName = $("#accountGroupName").val();
			var headerDetails = $("#printDetails").val();
			var headerValue = $("*[data-selector='header']").html();
			var selectedDetails="";
			$("#ElementDiv").find('span').each(function(index) {
				if(!$(this).isHidden() && $(this).prop("id") != undefined && $(this).prop("id") != '' ){
					selectedDetails += "<b>"+$(this).html()+"</b> = "+ $("#"+$(this).prop("id")+'Ele').val()+"&emsp;";	
				}
			});
			
			finalObj.weightWisePrintList = weightWisePrintList;
			finalObj.accountGroupdata = {
					accountGroupName : accountGroupName,
					headerDetails: headerDetails,
					headerValue: headerValue,
					selectedDetails:selectedDetails
			}
			
			var width = 800;
			var height = 500;
			var left = parseInt((screen.availWidth/2) - (width/2));
			var top = parseInt((screen.availHeight/2) - (height/2));
			var childWindow = window.open("/ivcargo/html/module/companytodestinationwiselrregister/companytodetailsdestinationwiseweightprint.html");
			childWindow.dataObject=finalObj;
		}
	});
});

function lsNumberSearch(grid,dataView,row){
	if(dataView.getItem(row).dispatchLedgerId != undefined){
		window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+dataView.getItem(row).dispatchLedgerId+'&wayBillNumber='+dataView.getItem(row).lsNumber+'&TypeOfNumber=2&BranchId=0&CityId=0&searchBy=');
	} 
}