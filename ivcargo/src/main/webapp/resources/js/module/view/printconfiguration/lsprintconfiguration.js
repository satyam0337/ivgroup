define(
		[
			'JsonUtility',
			'messageUtility',
			'/ivcargo/resources/js/generic/urlparameter.js',
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/stockOutLRs/stockoutlrsfilepath.js',
			'jquerylingua',
			'language',
			'bootstrapSwitch',
			'nodvalidation',
			'focusnavigation',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
			PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',// PopulateAutocomplete
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/dispatchlsprint/dispatchlsprintdestinationwise.js',
			],

			function(JsonUtility, MessageUtility, UrlParameter, FilePath, Lingua, Language,  BootstrapSwitch, NodValidation, FocusNavigation,BootstrapModal, Selection) {
			'use strict';
			var jsonObject = new Object(), myNod,  _this = '' ,images = [], printIds = [],imagesWithHeader = [],imageWithHeaderIds = [],imagesWithOutHeader = [],imageWithOutHeaderIds =[] ,
			printFormatIds =[],tempArray =[];
		   var 	valueForSelectSaveButton =0;
			return {
				getLsData: function() {
					_this=this;
					getJSON(jsonObject, WEB_SERVICE_URL + '/printConfigurationWS/getLSPrintConfigurationElement.do?', _this.setPrintElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				},
				validateCheckIsHoAddress : function(){
					var jsonObject 	= new Object();
					jsonObject["isHoAddress"] = $("#HOAddressForPrintConfiguration").prop("checked");
					jsonObject["printModuleId"] = 2;

					getJSON(jsonObject, WEB_SERVICE_URL + '/printConfigurationWS/updatePrintConfigurationIsHoAddress.do?',_this.checkIsHoAddress,EXECUTE_WITHOUT_ERROR);

				}, checkIsHoAddress: function(response) {

				},  
				
				

					
    	
				setPrintElements : function(response) {
					console.log("response123",response);
					printIds=response.lsprintIdList;
					var jsonObject 	= new Object();
					var loadelement = new Array();
					var baseHtml 	= new $.Deferred();	

					setTimeout(() =>{
						for(var i=0;i<response.allLsPrintConfiguration.length;i++)
							$("#lsprintConfiguration_"+i).html(response.allLsPrintConfiguration[i]);
					},100);
					
					setTimeout(() =>{
						$("#AccountGroupName").val(response.AccountGroupName); 
					},100);
					
					
					if(response.IsHoAddress  == true){
						setTimeout(() => {
							$('#HOAddressForPrintConfiguration').prop('checked',true);

						}, 100);

					}else{

						$('#HOAddressForPrintConfiguration').prop('checked', false);
					}
					if(response.IsMarkAndConditions  == true){
						setTimeout(() => {
							$('#ValidateHideOrShowTheTermAndCondition').prop('checked',true);
							$("#UpdateTermAndConditions").show();

							$("#termAndCondn").show();
						}, 100);

					}else{
						setTimeout(() => {
							$("#UpdateTermAndConditions").hide();
							$("#termAndCondn").hide();
							$('#ValidateHideOrShowTheTermAndCondition').prop('checked', false);
						}, 10);
					}


					$("*[data-selector='AccountGroupName'").html(response.AccountGroupName);

					images = [];
					printIds = [];
					imagesWithHeader = [];
					imagesWithOutHeader = [];
					imageWithHeaderIds = [];
					imageWithOutHeaderIds =[];
					var i = 0; 
                   		for(var j = 0; j < response.lsprintIdList.length ; j++){
						images[j]    =   "/ivcargo/resources/images/printconfiguration/lsprintconfigwithheader/lsprintconfig_"+response.lsprintIdList[j]+".jpg";
						             
						printIds[j]  =  response.lsprintIdList[j];
					}
                   		for(var j = 0; j < response.lsprintIdListWithHeader.length ; j++){
                   			imagesWithHeader[j]    =   "/ivcargo/resources/images/printconfiguration/lsprintconfigwithheader/lsprintconfig_"+response.lsprintIdListWithHeader[j]+".jpg";
    						             
                   			imageWithHeaderIds[j]  =  response.lsprintIdListWithHeader[j];
    					}
                   		for(var j = 0; j < response.lsprintIdListWithOutHeader.length ; j++){
                   			imagesWithOutHeader[j]    =   "/ivcargo/resources/images/printconfiguration/lsprintconfigwithheader/lsprintconfig_"+response.lsprintIdListWithOutHeader[j]+".jpg";
    						imageWithOutHeaderIds[j]  =  response.lsprintIdListWithOutHeader[j];
    					}
					loadelement.push(baseHtml);
					$("#mainContent").load("/ivcargo/html/module/printconfiguration/lsprintconfiguration.html",
							function() {
						baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						hideLayer();
						loadLanguageWithParams(FilePath.loadLanguage());
						
						$("#saveBtn").click(function() {
							_this.selectAllCheckBoxThatAreCheck(response);					
							_this.selectImage(valueForSelectSaveButton);
						});

						$("#customBtn").click(function() {
							_this.customImage();
						});
						
						
						$("#UpdateTermAndConditions").click(function(){
							var lengthOfTerm              = $("#termAndCondn").val();
							var lengthOfTermAndCondition  = lengthOfTerm.length;
							if(lengthOfTermAndCondition>0)
								_this.fetchTermAndConditionsDataFromDataBase();
						});
						
						$("#HOAddressForPrintConfiguration").click(function() {
							var isHoAddressValue        = _this.validateCheckIsHoAddress();
						});

						$("#ValidateHideOrShowTheTermAndCondition").click(function() {
							var isTermAndConditionValue =	_this.validateCheckIsTermAndCondition();
						});
						
						$('input[type="checkbox"]').click(function(){
							if($("#ValidateHideOrShowTheTermAndCondition").prop("checked") == true){
								$("#termAndConditionHideorShow").show();	
								$("#UpdateTermAndConditions").show();
								$("#termAndCondn").show();
							}
							else{
								$("#termAndConditionHideorShow").hide();
								$("#UpdateTermAndConditions").hide();
								$("#termAndCondn").hide();
							}
						});
						if($("#checkwithHeader").prop("checked") == false){
							$('#imageNumberDisplay').html(1+"/"+imageWithOutHeaderIds.length);
                           console.log("inside the ")
							$("#slide").attr('src','').promise().done(function() {
								valueForSelectSaveButton = 0;
								$(this).attr('src',images[0]);  
							});
							images   = Array.from(imagesWithOutHeader);
							printIds = Array.from(imageWithOutHeaderIds);
							tempArray=Array.from(printIds);
							_this.nextAndPreviousButtonEvent(images,printIds);
						}
					var type=	$("#checkwithHeader").val();
					$('#checkwithHeader').click(function(){

							console.log("type values",type);
							var imageNumberDisplayForFirstImage=1;
							if($("#checkwithHeader").prop("checked") == true){
								console.log("inside the withheader");
								$('#imageNumberDisplay').html(imageNumberDisplayForFirstImage+"/"+imagesWithHeader.length);

								$("#slide").attr('src','').promise().done(function() {
									valueForSelectSaveButton=0;
									$(this).attr('src',imagesWithHeader[0]);  
								});
								
								$("imageNumberDisplay").html(imageNumberDisplayForFirstImage+"/"+imageWithHeaderIds.length);
								images    = Array.from(imagesWithHeader);
								printIds  = Array.from(imageWithHeaderIds);	
								tempArray = Array.from(imageWithHeaderIds);	
								console.log(images);
						
								console.log(tempArray);
								_this.nextAndPreviousButtonEvent(images,printIds);
							}
							else{
								$('#imageNumberDisplay').html(imageNumberDisplayForFirstImage+"/"+imagesWithHeader.length);
								$("#slide").attr('src','').promise().done(function() {
									$(this).attr('src',images[0]);  
								});
								images    = Array.from(imagesWithOutHeader);
								printIds  = Array.from(imageWithOutHeaderIds);
								tempArray = Array.from(imageWithHeaderIds);	
								_this.nextAndPreviousButtonEvent(images,printIds);
							}
						});
						
					});
				},

				changeImg : function(valueOfimageWithHeader,index){
					var indexValue=index+1;
					var imageNumberDisplay=$('#imageNumberDisplay').html(indexValue+"/"+(valueOfimageWithHeader.length));
					$('#imageNumberDisplay').append(imageNumberDisplay);
					$("#slide").attr('src','').promise().done(function() {
						$(this).attr('src',valueOfimageWithHeader[index]);
						valueForSelectSaveButton=index;
					});
				}, 
				nextAndPreviousButtonEvent : function(imageColl,index){
					var  i = 1; 
					var previousButtonFlag = false;
					var nextButtonFlag     = true;
					var count1 = 0;
					$("#nextBtn").click(function() {
						previousButtonFlag = true;
						if(nextButtonFlag){
							if(i < imageColl.length-1){
								i++;
								if(i<=tempArray.length-1)
									_this.changeImg(imageColl,i);
							}
						
						}
					});
					i--;
					$("#prvBtn").click(function(){
						nextButtonFlag = true;
						if(previousButtonFlag){
							if(i > 0){
								i--;
							} 
							_this.changeImg(imageColl,i);
						}
					});
				},
				selectAllCheckBoxThatAreCheck :function(response){
					var allCheckBoxesThatAreCheck = new Array();
					var labelForShow = new Array();
                      $("input:checkbox[name=name]:checked").each(function () {
                          allCheckBoxesThatAreCheck.push($(this).attr("id"));
                          labelForShow.push(response.allLsPrintConfiguration[($(this).attr("id"))-1]);
                      });
                     
  					var jsonObject = new Object();
  					jsonObject["LsPrintConfigurationId"] = allCheckBoxesThatAreCheck.join(',');
  					jsonObject["LsPrintConfigurationLabel"] = labelForShow.join(',');
  					console.log("data world",jsonObject["LsPrintConfigurationLabel"]);
		//getJSON(jsonObject, WEB_SERVICE_URL + '/printConfigurationWS/updatePrintConfigurationAllLsColumnToDisplay.do?', _this.responseAfterPrintSelection, EXECUTE_WITHOUT_ERROR);
     		getJSON(jsonObject, WEB_SERVICE_URL + '/printConfigurationWS/insertPrintConfigurationAllLsColumnToDisplay.do?', _this.responseAfterPrintSelection, EXECUTE_WITHOUT_ERROR);

				},
				
				selectImage : function(index){
					showLayer();
					var jsonObject 	= new Object();
					jsonObject.printId = printIds[index];
					jsonObject.printModuleId = 2;
					//jsonObject.lsPrintId =1;
				
					getJSON(jsonObject, WEB_SERVICE_URL + '/printConfigurationWS/updateDataAfterImageSelectionLsPrint.do?', _this.responseAfterPrintSelection, EXECUTE_WITHOUT_ERROR);
				}, responseAfterPrintSelection : function(responseOut){
					hideLayer();
				}, customImage : function(){
					showLayer();
					var jsonObject 	= new Object();
					jsonObject.customPrint = true;
					jsonObject.printModuleId = 1;
					getJSON(jsonObject, WEB_SERVICE_URL + '/printConfigurationWS/updateDataAfterImageSelection.do?', _this.responseAfterPrintSelection, EXECUTE_WITHOUT_ERROR);
				},
			}
		});