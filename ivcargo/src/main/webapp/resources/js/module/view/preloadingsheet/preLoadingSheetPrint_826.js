define(['elementTemplateJs'
	],function(elementTemplateJs){
	var rowsPerPage	=90;
	var _this;
	var headerCollection,
	sortWayBillNumberWithoutBranchCode	= false,
	sortWayBillWithDestBranchWise	= false,
	accountGroupId					=	0,
	currentDateTime,destBrnachesNameCommaSep="";
	var dataView;
	var destBranchArray = new Array();
	return ({
		renderElements : function(response){
			$('#dataPopup').remove();
			hideLayer();
			_this = this;
			var pendingSheet = response.pendingDispatchmodelColl;
			sortWayBillNumberWithoutBranchCode = response.sortWayBillNumberWithoutBranchCode;
			sortWayBillWithDestBranchWise = response.sortWayBillWithDestBranchWise;
			headerCollection = response.PrintHeaderModel;
			currentDateTime = response.currentDateTime;
			destBrnachesNameCommaSep	= response.destBrnachesNameCommaSep;
			accountGroupId	= response.accountGroupId;
				var finalJsonObj = new Array();
				this.setSortedSources(pendingSheet,finalJsonObj);
				this.setDataForView(finalJsonObj);
		
		},setDataForView:function(finalJsonObj){
			if(dataView == undefined){
				require(['text!/ivcargo/template/preloading/preLoadingSheetPrint_826.html'],function(PreLoadingSheet){
					_this.setData(finalJsonObj,PreLoadingSheet);
				})
			}else{
				_this.setData(finalJsonObj,dataView);
			}

		},setData:function(finalJsonObj,PreLoadingSheet){
			$("#myGrid").addClass('visible-print-block');
			var chunkArray = finalJsonObj.splitArray(rowsPerPage);
			var TotalCount = Object.keys(chunkArray).length;
			var totalNoOfLR = 0;
			var totalNoOfQuantity = 0;
			var totalActualWeight = 0;
			var totalChargedWeight = 0;
			var sourcebranch = 0;
			for(var i = 0;i<finalJsonObj.length;i++){
				var pendingDispatchModel  = finalJsonObj[i];
				if(pendingDispatchModel.pendingQuantity > 0){
					totalNoOfQuantity += pendingDispatchModel.pendingQuantity;
					totalActualWeight += pendingDispatchModel.consignmentSummaryActualWeight;
					totalChargedWeight += pendingDispatchModel.consignmentSummaryChargedWeight
					totalNoOfLR++;
				}
			}
			for(var key in chunkArray){
				$("#myGrid").append(PreLoadingSheet);
				_this.renderTable(chunkArray[key]);
				$('.pageInfo').last().html("PAGE NO. "+(parseInt(key)+parseInt(1)));
				$('.currentDateTime').last().html(currentDateTime);
			}
			$('.summaryinfo:not(:last)').each(function(){$(this).empty()});
			$('.summaryTable:not(:last)').each(function(){$(this).empty()});
			$("*[data-cell='totalNoOfLr']").html(totalNoOfLR);
			$("*[data-cell='totalNoOfArticle']").html(totalNoOfQuantity);
			$("*[data-cell='totalActualWeight']").html(totalActualWeight);
			$("*[data-cell='totalChargeWeight']").html(totalChargedWeight);
			
			_this.setHeaderData(headerCollection,chunkArray);
			hideLayer();	
			_this.showPrintOnPopup();

		},renderTable:function(chunkArray){
			var leftDataChunk = chunkArray.splitArray(Math.ceil(chunkArray.length/2));
			for(var leftData in leftDataChunk){
				if(leftData % 2 == 0){
					this.renderTableValues(leftDataChunk[leftData],'.leftdivTableBody');
				}else{
					this.renderTableValues(leftDataChunk[leftData],'.rightdivTableBody');
				}
			}
		},setHeaderData:function(headerCollection,chunkArray){
			$("*[data-accountgroup='name']").html(headerCollection.accountGroupName);
			$("*[data-branch='name']").html(headerCollection.branchName);
			$("*[data-branch='address']").html(headerCollection.branchAddress);
			$("*[data-branch='phonenumber']").html(headerCollection.branchContactDetailMobileNumber);
			$("*[data-heading='heading']").html('Luggage Report');
			$("*[data-branch='sourcebranch']").html(headerCollection.branchName);
			$("*[data-branch='destinationBranch']").html(destBranchArray.join());
			$("*[data-branch='destinationBranch']").html(destBrnachesNameCommaSep);
			$(".preloadingSheetPage").each(function(i) {if(i!=0){$(this).addClass("page-break");}});
		},renderTableValues:function(chunkArray,className){
			var htmlVariable = '';
			for(var chunk in chunkArray){
				$.each( $(className).last(), function(i, left) {
					$('div', left).each(function() {
						if(typeof $(this).attr('data-cell') != "undefined" ){
							if(chunkArray[chunk][$(this).attr('data-cell')] != undefined){
															console.log('[[888[[',chunkArray[chunk][$(this).attr('data-cell')])

							let value = chunkArray[chunk][$(this).attr('data-cell')]
							let formattedValue;
								if (/^\d{2}-\d{2}-\d{2}$/.test(value)) {
									var parts = value.split('-');
									formattedValue = parts[0] + '/' + parts[1];
								} else {
									formattedValue = value;
								}

							 htmlVariable += '<div class="'+$(this).attr('class')+'">'+formattedValue+'</div>'
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
		},showPrintOnPopup:function(){
			var width = 1000;
			var height = 600;
			var left = parseInt((screen.availWidth/2) - (width/2));
			var top = parseInt((screen.availHeight/2) - (height/2));
			childwin = window.open ('', 'newwindow', config='height='+height+',width='+width+',left='+left+ ',top='+top+', toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
			childwin.document.write('<html><head><title>Print it!</title></head><body>')
			childwin.document.write($("#myGrid").html());
			childwin.document.write('</body></html>');
			if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
				childwin.print();
				childwin.close();
				doneTheStuff	= false;
				childwin.opener.setValue(doneTheStuff);
			}else{
				setTimeout(function(){
					childwin.print();
					childwin.close();
					doneTheStuff	= false;
					childwin.opener.setValue(doneTheStuff);
				},200)
			}
		},setSortedSources:function(pendingSheet,finalJsonObj){
			if(sortWayBillNumberWithoutBranchCode == 'true' || sortWayBillNumberWithoutBranchCode == true){
				var sourceArray = new Array();
				for(sourceBranch in pendingSheet){
					sourceArray.push(sourceBranch);
				}
				var indexArray = new Array();
				var wayBillArray = new Array();
				for(var index in sourceArray){
					indexArray.push(pendingSheet[sourceArray[index]]);
				}
				for(var f=0;indexArray.length > f;f++){
					var temp = indexArray[f];
					for(var t=0;temp.length > t;t++){
						wayBillArray.push(temp[t]);
					}
				}
	
				for(var i=0;(wayBillArray).length > i;i++) {
					var wayBillNumber	= wayBillArray[i].wayBillNumber;
					wayBillArray[i].wayBillNumberWithoutBranchCode = Number(wayBillNumber.substr(wayBillNumber.indexOf("/") + 1));
				}
				
				var detsinationcollection	= _.sortBy(wayBillArray,'wayBillNumberWithoutBranchCode');
				for(var destkey in detsinationcollection){
					finalJsonObj.push(detsinationcollection[destkey]);
				}
			}else if(sortWayBillWithDestBranchWise == 'true' || sortWayBillWithDestBranchWise == true) {
				
				var sourceArray = new Array();
				for(sourceBranch in pendingSheet){
					sourceArray.push(sourceBranch);
				}
				sourceArray = sourceArray.sort(function(a, b) {return a.localeCompare(b);});

				for(var index in sourceArray){
					finalJsonObj.push({
						sourcebranch:sourceArray[index]
					})
					
				for(var i=0;(pendingSheet[sourceArray[index]]).length > i;i++){
					
					var destBranch = pendingSheet[sourceArray[index]][i].wayBillDestinationBranchName;
					var check = _this.isValueExistInArray(destBranchArray,destBranch);
					if(!check){
						destBranchArray.push(destBranch);
					}
				}
					var detsinationcollection = _.sortBy(pendingSheet[sourceArray[index]],'wayBillDestinationBranchName');

					for(var destkey in detsinationcollection){
						finalJsonObj.push(detsinationcollection[destkey]);
					}
				}
			}else if(accountGroupId == 563){
						var sourceArray = new Array();
						for(sourceBranch in pendingSheet){
							sourceArray.push(sourceBranch);
						}
						var indexArray = new Array();
						var wayBillArray = new Array();
						
						for(var index in sourceArray){
							indexArray.push(pendingSheet[sourceArray[index]]);
						}
						for(var f=0;indexArray.length > f;f++){
							var temp = indexArray[f];
							for(var t=0;temp.length > t;t++){
								wayBillArray.push(temp[t]);
							}
						}
				
				var wayBillArraywithBranchCode = new Array();
				var wayBillArraywithOutBranchCode = new Array();
						for(var i=0;(wayBillArray).length > i;i++) {
							var wayBillNumber	= wayBillArray[i].wayBillNumber;
							if(wayBillNumber.includes("/")){
							wayBillArray[i].wayBillNumberWithoutBranchCode = Number(wayBillNumber.substr(wayBillNumber.indexOf("/") + 1));
							wayBillArraywithBranchCode.push(wayBillArray[i]) 
							}else{
								wayBillArray[i].wayBillNumberWithoutBranchCode = Number(wayBillNumber.substr(wayBillNumber.indexOf("/") + 1));
							wayBillArraywithOutBranchCode.push(wayBillArray[i]) 
							}
							
						}
						var wayBillArraywithBranchCodeCol	= _.sortBy(wayBillArraywithBranchCode,'wayBillNumberWithoutBranchCode');
						var wayBillArraywithOutBranchCodeCol	= _.sortBy(wayBillArraywithOutBranchCode,'wayBillNumberWithoutBranchCode');
						
						var detsinationcollection = new Array();
						detsinationcollection.push(wayBillArraywithBranchCodeCol);
						detsinationcollection.push(wayBillArraywithOutBranchCodeCol);
						for(var destkey in detsinationcollection){
							for(var key in detsinationcollection[destkey]){
							finalJsonObj.push(detsinationcollection[destkey][key]);
							}
						}
				}else {
				var sourceArray = new Array();
				for(sourceBranch in pendingSheet){
					sourceArray.push(sourceBranch);
				}
				sourceArray = sourceArray.sort(function(a, b) {return a.localeCompare(b);});

				for(var index in sourceArray){

					for(var i=0;(pendingSheet[sourceArray[index]]).length > i;i++) {
						var wayBillNumber	= pendingSheet[sourceArray[index]][i].wayBillNumber;
							pendingSheet[sourceArray[index]][i].wayBillNumberWithoutBranchCode	= Number(wayBillNumber.substr(wayBillNumber.indexOf("/") + 1));
					}
					
					var detsinationcollection	= _.sortBy(pendingSheet[sourceArray[index]],'wayBillNumberWithoutBranchCode');

					for(var destkey in detsinationcollection){
						finalJsonObj.push(detsinationcollection[destkey]);
					}
				}
			}
					
		},isValueExistInArray(arr, value) {

			for(var i = 0; i < arr.length; i++) {
				if(arr[i] == value) {
					return true;
				}
			}
			
			return false;
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