define(['elementTemplateJs'
	],function(elementTemplateJs){
	var rowsPerPage	=90;
	var _this;
	var headerCollection,
	currentDateTime,destBrnachesNameCommaSep="";
	var dataView;
	var destBranchArray = new Array();
	return ({
		renderElements : function(response){
			$('#dataPopup').remove();
			hideLayer();
			_this = this;
			var pendingSheet 			= response.pendingDispatchmodelColl;
			headerCollection 			= response.PrintHeaderModel;
			currentDateTime 			= response.currentDateTime;
			destBrnachesNameCommaSep	= response.destBrnachesNameCommaSep;
			
			var finalJsonObj = new Array();
			this.setSortedSources(pendingSheet,finalJsonObj);
			this.setDataForView(finalJsonObj);
		},setDataForView:function(finalJsonObj){
			if(dataView == undefined){
				require(['text!/ivcargo/template/preloading/preloadingsheet_554.html'],function(PreLoadingSheet){
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
				$('.pageInfo').last().html("Page "+(parseInt(key)+parseInt(1))+" of "+TotalCount);
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

		},
		renderTable:function(chunkArray){
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
			
			$(".isPrivateMarkCol").css({'color':'white','border-bottom':'1px solid black','border-right':'1px solid black'});
			
			$(".preloadingSheetPage").each(function(i) {if(i!=0){$(this).addClass("page-break");}});
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