define(['elementTemplateJs'],function(elementTemplateJs){
	var rowsPerPage	=45;
	var _this;
	var headerCollection,
	sortByLastCharOfWayBillNumber = false,
	currentDateTime;
	return ({
		renderElements : function(response){
			_this = this;
			var preUnloadingSheetList = response.preUnloadingSheetList;
			
			var sourceObj = new Array();
			
			_.each(preUnloadingSheetList, function(preUnloadingSheet){
				sourceObj.push(preUnloadingSheet.wayBillSourceBranchName);
			});
						
			var uniqSourceBranch = _.uniq(sourceObj);
			
			var sourceWiseColl = new Object();
			var arrList	= null;
			_.each(uniqSourceBranch, function(sourceBranch){
				arrList = _.where(preUnloadingSheetList, {wayBillSourceBranchName: sourceBranch});
				sourceWiseColl[sourceBranch] = arrList;
			});
			
			headerCollection = response.PrintHeaderModel;
			sortByLastCharOfWayBillNumber = response.sortByLastCharOfWayBillNumber;
			currentDateTime = response.currentDateTime;
			var showConsignorConsigneeNameInPrint = response.showConsignorConsigneeNameInPrint;
			var finalJsonObj = new Array();
			this.setSortedSources(sourceWiseColl,finalJsonObj);
			this.setDataForView(finalJsonObj,showConsignorConsigneeNameInPrint);
		},setDataForView:function(finalJsonObj,showConsignorConsigneeNameInPrint){
			var fileref = document.createElement("link");
			fileref.rel = "stylesheet";
			fileref.type = "text/css";
			fileref.href = "/ivcargo/resources/css/module/dispatch/preloadingsheet.css";
			document.getElementsByTagName("head")[0].appendChild(fileref)
			if(showConsignorConsigneeNameInPrint == true){
				rowsPerPage	=54;
				require(['text!/ivcargo/template/preunloading/preunloadingsheet_4.html'],function(PreLoadingSheet){
					var sortedJsonObj	= _.sortBy(finalJsonObj,'wayBillNumber');
					var chunkArray = sortedJsonObj.splitArray(rowsPerPage);
					var TotalCount = Object.keys(chunkArray).length;
					var totalNoOfLR = 0;
					var totalNoOfQuantity = 0;
					var totalActualWeight = 0;
					for(var i = 0;i<finalJsonObj.length;i++){
						var pendingDispatchModel  = finalJsonObj[i];
						if(pendingDispatchModel.consignmentSummaryQuantity > 0){
							totalNoOfQuantity += pendingDispatchModel.consignmentSummaryQuantity;
							totalActualWeight += pendingDispatchModel.consignmentSummaryActualWeight;
							totalNoOfLR++;
						}
					}
					for(var key in chunkArray){
						
						$("#myGrid").append(PreLoadingSheet);
						_this.renderTableValues(chunkArray[key],'.leftdivTableBody');
						$('.pageInfo').last().html("Page "+(parseInt(key)+parseInt(1))+" of "+TotalCount);
						$('.currentDateTime').last().html(currentDateTime);
						$('.driverMobileNumber').html(chunkArray[key][0].driverMobileNumber);
						$('.dispatchDateTime').html(chunkArray[key][0].dispatchDateTimeString);
						$('.vehicleNumber').html((chunkArray[key][0].vehicleNumber).toUpperCase());
					}
					$('.leftdivTableBody .divTableCell:last').fadeOut();
					$('.divTableFoot:not(:last)').each(function(){$(this).empty()});
					$('.totalNoOfLr').last().html('LRs- '+totalNoOfLR);
					$('.totalNoOfArticle').last().html(totalNoOfQuantity);
					$('.actualweight').html(totalActualWeight);
					_this.setHeaderData(headerCollection);
					window.print();
				})
			} else {
				require(['text!/ivcargo/template/preunloading/preunloadingsheet_3.html'],function(PreLoadingSheet){

					var chunkArray = finalJsonObj.splitArray(rowsPerPage);
					var TotalCount = Object.keys(chunkArray).length;
					for(var key in chunkArray){
						$("#myGrid").append(PreLoadingSheet);
						_this.renderTableValues(chunkArray[key],'.leftdivTableBody');
						$('.pageInfo').last().html("Page "+(parseInt(key)+parseInt(1))+" of "+TotalCount);
						$('.currentDateTime').last().html(currentDateTime);
					}
					_this.setHeaderData(headerCollection);
					window.print();
				})
			}
			
		},setHeaderData:function(headerCollection){
			$("*[data-accountgroup='name']").html(headerCollection.accountGroupName);
			$("*[data-branch='name']").html(headerCollection.branchName);
			$("*[data-branch='address']").html(headerCollection.branchAddress);
			$("*[data-branch='phonenumber']").html(headerCollection.branchContactDetailPhoneNumber);
			$("*[data-heading='heading']").html('Pre Loading Sheet');
			
			$(".preloadingSheetPage").each(function(i) {if(i!=0){$(this).addClass("page-break");}});
		},setSortedSources:function(sourceWiseColl,finalJsonObj){
			var sourceArray = new Array();
			for(sourceBranch in sourceWiseColl){
				sourceArray.push(sourceBranch);
			}
			sourceArray = sourceArray.sort(function(a, b) {return a.localeCompare(b);});

			for(var index in sourceArray){
				finalJsonObj.push({
					sourcebranch:sourceArray[index]
				})
				
				if(sortByLastCharOfWayBillNumber == 'true' || sortByLastCharOfWayBillNumber == true) {
					for(var i=0;(sourceWiseColl[sourceArray[index]]).length > i;i++) {
						var wayBillNumber	= sourceWiseColl[sourceArray[index]][i].wayBillNumber;
						sourceWiseColl[sourceArray[index]][i].lastCharWayBillNumber	= wayBillNumber.substring(wayBillNumber.length - 1,wayBillNumber.length);
					}
					
					var detsinationcollection = _.sortBy(sourceWiseColl[sourceArray[index]],'lastCharWayBillNumber');
				} else {
					var detsinationcollection = sourceWiseColl[sourceArray[index]];
				}
				
				
				
				for(var destkey in detsinationcollection){
					finalJsonObj.push(detsinationcollection[destkey]);
				}
			}
		},renderTable:function(chunkArray){
			var leftDataChunk = chunkArray.splitArray(Math.ceil(chunkArray.length/2));
			for(var leftData in leftDataChunk){
				if(leftData % 2 == 0){
					this.renderTableValues(leftDataChunk[leftData],'.leftdivTableBody');
				}else{
					this.renderTableValues(leftDataChunk[leftData],'.rightdivTableBody');
				}
			}
		},renderTableValues:function(chunkArray,className){
			var htmlVariable = '';
			for(var chunk in chunkArray){
				$.each( $(className).last(), function(i, left) {
					$('div', left).each(function() {
						if(typeof $(this).attr('data-cell') != "undefined" ){
							if(chunkArray[chunk][$(this).attr('data-cell')] != undefined){
								htmlVariable += '<div class="'+$(this).attr('class')+'">'+chunkArray[chunk][$(this).attr('data-cell')]+'</div>'
							}else{
								if($(this).attr('data-fullrow')){
									htmlVariable += '<div class="'+$(this).attr('class')+'"></div>'
								}
							}
						}
					});
				})
			}
			$(className).last().html(htmlVariable);
		}
	});
});
Object.defineProperty(Array.prototype, 'splitArray', {
	value: function(chunkSize) {
		var array=this;
		return [].concat.apply([],
				array.map(function(elem,i) {
					return i%chunkSize ? [] : [array.slice(i,i+chunkSize)];
				})
		);
	}
});