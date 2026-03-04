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
			],

			function(JsonUtility, MessageUtility, UrlParameter, FilePath, Lingua, Language,  BootstrapSwitch, NodValidation, FocusNavigation,BootstrapModal, Selection) {
			'use strict';
			var jsonObject = new Object(), myNod,  _this = '' ,images = [], printIds = [],imagesWithHeader = [],imageWithHeaderIds = [],imagesWithOutHeader = [],imageWithOutHeaderIds =[] , printFormatIds =[],
			a3printIdsForPrintConfIds = [],a4printIdsForPrintConfIds =[],tempArray =[],changeImageValueId =[],tempArray1 =[];
			var printId=0,markup,value,limitForTermAndCondition=0, lineCount=0;
			var valueForSelectSaveButton=0,limitofTermAndConditionRow=0;
			return {
			getLrData: function() {
				_this = this;
					getJSON(jsonObject, WEB_SERVICE_URL + '/printConfigurationWS/getLRPrintConfigurationElement.do?', _this.setPrintElements,EXECUTE_WITHOUT_ERROR);
					return _this;
				},
				validateCheckIsHoAddress : function(){
					var jsonObject 	= new Object();
					jsonObject["isHoAddress"] = $("#HOAddressForPrintConfiguration").prop("checked");
					jsonObject["printModuleId"] = 1;

					getJSON(jsonObject, WEB_SERVICE_URL + '/printConfigurationWS/updatePrintConfigurationIsHoAddress.do?',_this.checkIsHoAddress,EXECUTE_WITHOUT_ERROR);

				}, checkIsHoAddress: function(response) {

				},  

				fetchTermAndConditionsDataFromDataBase : function(){
					var tempStore="";
					let count= lineCount;
					value=$("#termAndCondn").val();
					const gh=($("#termAndCondn").val()).split("\n");
					for(let l=0;l<tempArray1.length;l++){
						if(tempArray1[l]=='2' || tempArray1[l]=='10')  
						{count++;
						for(let k = lineCount;k < gh.length;k++){
							if(k <= limitForTermAndCondition){
								tempStore += gh[k]+'<br>'
							}
							else{
								alert("Your"+limitForTermAndCondition +"line in term and condition store only if you insert the 5 line then data is not store please remove the "+limitForTermAndCondition);
								return ;
								break;
							}
						}}
						if(count==1)
							break;
					}

					var jsonObject 	= new Object();
					jsonObject["printModuleId"] = 1;
					jsonObject["isTermAndCondition"] = $("#ValidateHideOrShowTheTermAndCondition").prop("checked");
					if(count<limitForTermAndCondition)
						jsonObject["isTermAndConditionData"] = tempStore;
					getJSON(jsonObject, WEB_SERVICE_URL + '/printConfigurationWS/updatePrintConfigurationTermAndConditionDataByAccountGroupId.do?',_this.checkIsHoAddress,EXECUTE_WITHOUT_ERROR);

				}, checkIsTermAndConditionsData: function(response) {

				},  

				validateCheckIsTermAndCondition : function(){
					var jsonObject 	= new Object();
					jsonObject["printModuleId"] = 1;
					jsonObject["isTermAndCondition"] = $("#ValidateHideOrShowTheTermAndCondition").prop("checked");
					jsonObject["isTermAndCondition"] = $("#ValidateHideOrShowTheTermAndCondition").prop("checked");  
					jsonObject["isTermAndConditionData"] = $("#UpdateTermAndConditionsInput").val();
					getJSON(jsonObject, WEB_SERVICE_URL + '/printConfigurationWS/updatePrintConfigurationIsTermAndConditionDataByAccountGroupId.do?',_this.checkIsTermAndCondition,EXECUTE_WITHOUT_ERROR);

				}, checkIsTermAndCondition: function(response) {
				},       
				setSelectType : function(){

					_this.setSelectTypeAutocompleteInstance();

					var autoSelectType = $("#selectPrintFormat").getInstance();

					var SelectTYPE = [
						{ "selectTypeId":1, "selectPrintFormat": "All" },
						{ "selectTypeId":2, "selectPrintFormat": "A4-3Copy" },
						{ "selectTypeId":3, "selectPrintFormat": "A4-2Copy" },
						]


					$( autoSelectType ).each(function() {
						this.option.source = SelectTYPE;
					})
				},
				setSelectTypeAutocompleteInstance : function() {
					var autoSelectTypeName 			= new Object();
					autoSelectTypeName.primary_key 	= 'selectTypeId';
					autoSelectTypeName.field 		= 'selectPrintFormat';
					autoSelectTypeName.callBack		= callBackFunction;

					$(document).ready(function(){
						$('#selectPrintFormat').val("All");
					});

					function callBackFunction() {

						var count=0;
						var selectedText = $("#selectPrintFormat").find("option:selected").text();
						var selectedValue = $("#selectPrintFormat").val();
						switch(selectedValue){ 

						case "A4-3Copy" :
							changeImageValueId = [];
	     			            
    			            	
    			               images =[];	
    					       var indexValueForImage =-1;
    					       tempArray = [];
    					       printIds =[];
    					       var loadImageForfirstTime =false;
 								 if($("#checkwithHeader").prop("checked") == true){
 									for(var i = 0;i < imageWithHeaderIds.length; i++)
 										for( k = 0;k < a3printIdsForPrintConfIds.length; k++)
 											if((imageWithHeaderIds[i]) == (a3printIdsForPrintConfIds[k]))
 												count++;
 									
    					           for(var i=0;i<imageWithHeaderIds.length;i++){
    					        	   
    					        	   for( k=0;k<a3printIdsForPrintConfIds.length;k++)
    					        		   {  
    					        		   if(imageWithHeaderIds[i] == (a3printIdsForPrintConfIds[k]))
    					        			   { 
    					        			if(!loadImageForfirstTime){
    					        				valueForSelectSaveButton = k;
    					        				$('#imageNumberDisplay').html(1+"/"+count);
 		           	     					   {$("#slide").attr('src','').promise().done(function() {
 		   	     					              $(this).attr('src',"/ivcargo/resources/images/printconfiguration/lrprintconfig/lrprintconfigwithheader/lrprintconfig_"+a3printIdsForPrintConfIds[k]+".jpg");  
 									            });}
 					        			   }
    					        		loadImageForfirstTime = true;
    					        			
 					        			   indexValueForImage++;
    					        		      	 
    					        			  images[indexValueForImage]= "/ivcargo/resources/images/printconfiguration/lrprintconfig/lrprintconfigwithheader/lrprintconfig_"+a3printIdsForPrintConfIds[k]+".jpg";
    					        			tempArray.push(a3printIdsForPrintConfIds[k]);
    					        			printIds.push(a3printIdsForPrintConfIds[k]);
    					        		   
    					        			  }
    					        		
    					        			   }
    					           } _this.nextAndPreviousButtonEvent(images,printIds);
 								 }
 						
 								 
 							else{
					        	loadImageForfirstTime=false;
					        	for(var i = 0;i < imageWithHeaderIds.length; i++)
									for( k = 0;k < a3printIdsForPrintConfIds.length; k++)
										if((imageWithHeaderIds[i]) == (a3printIdsForPrintConfIds[k]))
											count++;
								
					        	for(var i=0;i<imageWithOutHeaderIds.length;i++){
					        	    for( k=0;k<a3printIdsForPrintConfIds.length;k++)
					        		   { 
                                     if((imageWithOutHeaderIds[i]) == (a3printIdsForPrintConfIds[k]))
                                        {
					        		      if(!loadImageForfirstTime){
					        		    	  $('#imageNumberDisplay').html(1+"/"+count);
					        		    	$("#slide").attr('src','').promise().done(function() {
		   	     					              $(this).attr('src',"/ivcargo/resources/images/printconfiguration/lrprintconfig//lrprintconfigwithoutheader/lrprintconfig_"+a3printIdsForPrintConfIds[k]+".jpg");  
									            });
					        		      }
					                 loadImageForfirstTime=true;
					                indexValueForImage++;
				                         images[indexValueForImage]= "/ivcargo/resources/images/printconfiguration/lrprintconfig//lrprintconfigwithoutheader/lrprintconfig_"+a3printIdsForPrintConfIds[k]+".jpg";
				        			      tempArray.push(a3printIdsForPrintConfIds[k]);

                                        }}

									printIds=Array.from(tempArray);
					        	}
					        _this.nextAndPreviousButtonEvent(images,printIds);
 							}
    			              
    				              break;
						
							
							
						case "A4-2Copy":
							changeImageValueId = [];
							images =[];
							 printIds =[];
							tempArray =[];
							var indexValueForImage =-1;

							var  loadImageForfirstTime =false;
							if($("#checkwithHeader").prop("checked") == true){
								for(var i = 0;i < imageWithHeaderIds.length; i++)
									for( k = 0;k < a4printIdsForPrintConfIds.length; k++)
										if((imageWithHeaderIds[i]) == (a4printIdsForPrintConfIds[k]))
											count++;
								
									for(var i = 0;i < imageWithHeaderIds.length; i++){
										for( k = 0;k < a4printIdsForPrintConfIds.length; k++)
										{  
											if(imageWithHeaderIds[i] == a4printIdsForPrintConfIds[k])
											{
												if(!loadImageForfirstTime){
													$('#imageNumberDisplay').html(1+"/"+count);
													valueForSelectSaveButton =k;
													{$("#slide").attr('src','').promise().done(function() {
														printIds = a4printIdsForPrintConfIds[k]
														$(this).attr('src',"/ivcargo/resources/images/printconfiguration/lrprintconfig/lrprintconfigwithheader/lrprintconfig_"+a4printIdsForPrintConfIds[k]+".jpg");  
													});}
												}
												loadImageForfirstTime = true;
												indexValueForImage++;
												images[indexValueForImage] = "/ivcargo/resources/images/printconfiguration/lrprintconfig/lrprintconfigwithheader/lrprintconfig_"+a4printIdsForPrintConfIds[k]+".jpg";
												printIds = Array.from(a4printIdsForPrintConfIds);
												tempArray.push(a4printIdsForPrintConfIds[k]);
											}


										} 
										_this.nextAndPreviousButtonEvent(images,printIds); }

								}
							else{
								for(var i= 0 ;i < imageWithOutHeaderIds.length; i++)
									for( k= 0 ;k < a4printIdsForPrintConfIds.length; k++)
										if((imageWithOutHeaderIds[i]) == (a4printIdsForPrintConfIds[k]))
											count++;
								
								
									loadImageForfirstTime=false;
									for(var i=0;i<imageWithOutHeaderIds.length;i++){
										for(var k=0;k<a4printIdsForPrintConfIds.length;k++)
										{ 
											if((imageWithOutHeaderIds[i]) == (a4printIdsForPrintConfIds[k]))
											{
												if(!loadImageForfirstTime){
													$('#imageNumberDisplay').html(1+"/"+count);
									           	  {$("#slide").attr('src','').promise().done(function() {
														$(this).attr('src',"/ivcargo/resources/images/printconfiguration/lrprintconfig//lrprintconfigwithoutheader/lrprintconfig_"+a4printIdsForPrintConfIds[k]+".jpg");  
													});}
												}
												loadImageForfirstTime = true;
												indexValueForImage++;
												images[indexValueForImage] = "/ivcargo/resources/images/printconfiguration/lrprintconfig//lrprintconfigwithoutheader/lrprintconfig_"+a4printIdsForPrintConfIds[k]+".jpg";
												printIds = Array.from(a4printIdsForPrintConfIds);
												tempArray.push(a4printIdsForPrintConfIds[k]);
												printIds.push(a4printIdsForPrintConfIds[k]);
											}
											}
							
										printIds=Array.from(tempArray);
										}
										_this.nextAndPreviousButtonEvent(images,printIds);
								}
									
							break;
							
						default :
						{
							images = [];
							printIds =[];
							$("#slide").attr('src','').promise().done(function() {
								$('#imageNumberDisplay').html(1+"/"+printFormatIds.length);
								valueForSelectSaveButton = 0;
								$(this).attr('src',"/ivcargo/resources/images/printconfiguration/lrprintconfig/lrprintconfig_"+printFormatIds[0]+".jpg");  
							});
							for(var j = 0;j < printFormatIds.length; j++)
							{
								images[j]= "/ivcargo/resources/images/printconfiguration/lrprintconfig/lrprintconfig_"+printFormatIds[j]+".jpg";
								printIds = Array.from(printFormatIds);
								tempArray.push(printFormatIds[k]);

								_this.nextAndPreviousButtonEvent(images,printIds[j]);
							}
							break;	 
						}
						}}

					$("#selectPrintFormat").autocompleteCustom(autoSelectTypeName)
				},
				setPrintElements : function(response) {
					printId=response.printId;
					var jsonObject 	= new Object();
					var loadelement = new Array();
					var baseHtml 	= new $.Deferred();	

					tempArray1=Array.from(response.printIdList)                  
					limitofTermAndConditionRow		          =response.LimitOfTermAndConditon;

					if(response.LimitOfTermAndConditon !=null){
						limitForTermAndCondition = response.LimitOfTermAndConditon;
					}
					if(response.PrintId)
						setTimeout(() =>{	 {
							$("#existingLrPrintImage").attr('src','').promise().done(function() {
								$(this).attr('src',existingLrPrintFormat);  
							}); 
						} },100);
					if(response.IsMarkAndConditionsData != null )
						setTimeout(() =>{
							var tempTermAndCondition="",term="";
							tempTermAndCondition = response.IsMarkAndConditionsData;
							lineCount            =	countNumberOfLine(tempTermAndCondition);           
							term                 =	tempTermAndCondition.replaceAll("<br>","\n");
							$("#termAndCondn").html(term);
						},100);
					setTimeout(() =>{
						$("#AccountGroupName").val(response.AccountGroupName); 

					},100);
					function countNumberOfLine(valueFromdatabase) {
						return (valueFromdatabase.match(/<br>/g)).length-1;
					}
					if(response.IsMarkAndConditions == true){
						setTimeout(() =>{
							var 	tempTermAndCondition=response.IsMarkAndConditionsData;
							term =	tempTermAndCondition.replaceAll("<br>","\n");
							$("#termAndCondn").html(term);

							$("#termAndCondn").val(response.IsMarkAndConditionsData);
							$('#ValidateHideOrShowTheTermAndCondition').prop('checked',true);
						}, 100);
					}
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
					printFormatIds =[];
					imagesWithHeader = [];
					imagesWithOutHeader = [];
					imageWithHeaderIds = [];
					imageWithOutHeaderIds =[];
					a3printIdsForPrintConfIds =[];
					a4printIdsForPrintConfIds =[];
					var i = 0; 
					var existingLrPrintFormat ="/ivcargo/resources/images/printconfiguration/lrprintconfig/lrprintconfig_"+response.PrintId+".jpg";
					for(var j = 0; j < response.printIdList.length ; j++){
						images[j]    =   "/ivcargo/resources/images/printconfiguration/lrprintconfig/lrprintconfig_"+response.printIdList[j]+".jpg";
						printIds[j]  =  response.printIdList[j];
					}
					for(var j = 0; j < response.printFormatForImage.length ; j++){
						 printFormatIds[j]        =  response.printFormatForImage[j];

					}
					for(var j = 0; j <response.printIdListForWithHeader.length; j++){
						imagesWithHeader[j]      =  "/ivcargo/resources/images/printconfiguration/lrprintconfig/lrprintconfigwithheader/lrprintconfig_"+response.printIdListForWithHeader[j]+".jpg";
						imageWithHeaderIds[j]    =  response.printIdListForWithHeader[j];
						imagesWithOutHeader[j]   =  "/ivcargo/resources/images/printconfiguration/lrprintconfig/lrprintconfigwithoutheader/lrprintconfig_"+response.printIdListforWithOutHeader[j]+".jpg";
						imageWithOutHeaderIds[j] =  response.printIdListforWithOutHeader[j];
					}
					images= [];
					for(var j = 0;j < response.PrintListForA3.length; j++)
					{
						images[j]                     =  "/ivcargo/resources/images/printconfiguration/lrprintconfig/lrprintconfig_"+response.PrintListForA3[j]+".jpg";
						a3printIdsForPrintConfIds[j]  =  response.PrintListForA3[j];
					}
					for(var j = 0;j < response.PrintListForA4.length; j++)
					{
						images[j]                     =  "/ivcargo/resources/images/printconfiguration/lrprintconfig/lrprintconfig_"+response.PrintListForA4[j]+".jpg";
						a4printIdsForPrintConfIds[j]  =  response.PrintListForA4[j];
					}
					loadelement.push(baseHtml);
					$("#mainContent").load("/ivcargo/html/module/printconfiguration/lrprintconfiguration.html",
							function() {
						baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						hideLayer();
						loadLanguageWithParams(FilePath.loadLanguage());
						_this.setSelectType();
						
						$("#saveBtn").click(function() {
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

							$("#slide").attr('src','').promise().done(function() {
								valueForSelectSaveButton = 0;
								$(this).attr('src',imagesWithOutHeader[0]);  
							});
							images   = Array.from(imagesWithOutHeader);
							printIds = Array.from(imageWithOutHeaderIds);
							tempArray= Array.from(imageWithHeaderIds);	
							_this.nextAndPreviousButtonEvent(images,printIds);
						}

						$('input[type="checkbox"]').click(function(){
							var imageNumberDisplayForFirstImage=1;
							if($("#checkwithHeader").prop("checked") == true){
								$('#imageNumberDisplay').html(imageNumberDisplayForFirstImage+"/"+imagesWithHeader.length);

								$("#slide").attr('src','').promise().done(function() {
									valueForSelectSaveButton=0;
									$(this).attr('src',imagesWithHeader[0]);  
								});
								
								$("imageNumberDisplay").html(imageNumberDisplayForFirstImage+"/"+imageWithHeaderIds.length);
								images    = Array.from(imagesWithHeader);
								printIds  = Array.from(imageWithHeaderIds);	
								tempArray = Array.from(imageWithHeaderIds);	
								_this.nextAndPreviousButtonEvent(images,printIds);
							}
							else{
								$('#imageNumberDisplay').html(imageNumberDisplayForFirstImage+"/"+imagesWithHeader.length);
								$("#slide").attr('src','').promise().done(function() {
									$(this).attr('src',imagesWithOutHeader[0]);  
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
				selectImage : function(index){
					showLayer();
					var jsonObject 	= new Object();
					jsonObject.printId = printIds[index];
					jsonObject.printModuleId = 1;
					jsonObject.imageWithHeaderId = imageWithHeaderIds[index];
					jsonObject.printModuleId = 1;
					jsonObject.imageWithOutHeaderId =imageWithOutHeaderIds[index];
					jsonObject.printModuleId = 1;
					jsonObject.printFormatIds=printFormatIds[index];
					jsonObject.printModuleId = 1;
					getJSON(jsonObject, WEB_SERVICE_URL + '/printConfigurationWS/updateDataAfterImageSelection.do?', _this.responseAfterPrintSelection, EXECUTE_WITHOUT_ERROR);
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
				