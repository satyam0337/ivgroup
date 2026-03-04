/**
 * 
 */
define(['elementTemplateJs'],
       function(elementTemplateJs){
	var rowsPerPage	=84;
	var _this;
	var headerCollection
	,lsHeaderDetail
	,currentDateTime
	,lsSrcBranch
	,lsDestBranch
	;
	return({
		renderElements : function(response){
			_this = this;
			var minifiedLSSheet = response.dispatchLRSummary;
			var sortedDataArrayObject = _.sortBy(minifiedLSSheet, item => Number(item.wayBillNumber));
			headerCollection = response.PrintHeaderModel;
			lsHeaderDetail	 = response.dispatchLSHeader;
			lsSrcBranch  	 = response.lsSrcBranch;
			lsDestBranch 	 = response.lsDestBranch;

			this.setDataForView(sortedDataArrayObject);
		},setDataForView:function(sortedDataArrayObject){
			require(['text!/ivcargo/template/minifiedls/minifiedloadingsheet.html'],function(minifiedLoadingSheet){
				$("#myGrid").addClass('visible-print-block');
				var chunkArray = sortedDataArrayObject.splitArray(rowsPerPage);
				var TotalCount = Object.keys(chunkArray).length;
				var totalNoOfLR = 0;
				var totalNoOfQuantity = 0;
				var totalActualWeight = 0;
				for(var i = 0;i<sortedDataArrayObject.length;i++){
					var pendingDispatchModel  = sortedDataArrayObject[i];
					if(pendingDispatchModel.privateMark == undefined)
						pendingDispatchModel.privateMark = "--";

					if(pendingDispatchModel.wayBillArticleQuantity > 0){
						totalNoOfQuantity += pendingDispatchModel.wayBillArticleQuantity;
						totalActualWeight += pendingDispatchModel.wayBillActualWeight;
						totalNoOfLR++;
					}
				}
				
				for(var key in chunkArray){
					$("#myGrid").append(minifiedLoadingSheet);
					_this.renderTable(chunkArray[key]);
					$('.pageInfo').last().html("Page "+(parseInt(key)+parseInt(1))+" of "+TotalCount);
					$('.currentDateTime').last().html(currentDateTime);
				}
				$('.divTableFoot:not(:last)').each(function(){$(this).empty()});
				$('.totalNoOfLr').last().html(totalNoOfLR);
				$('.totalNoOfArticle').last().html(totalNoOfQuantity);
				$('.actualweight').last().html(totalActualWeight);
				_this.setHeaderData(headerCollection,lsHeaderDetail);
				hideLayer();
				window.print();
			})
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
		},setHeaderData:function(headerCollection,lsHeaderDetail){
			var data = lsHeaderDetail[0];
			if(typeof lsSrcBranch !== 'undefined' && lsSrcBranch != undefined 
					&& typeof lsDestBranch !== 'undefined' && lsDestBranch != undefined){
				if(lsSrcBranch.regionId == 404 && lsDestBranch.regionId == 268){
					$("*[data-accountgroup='name']").html('NM LOGISTICS');
				}  else if((lsSrcBranch.subRegionId == 2880 || lsSrcBranch.subRegionId == 4308)
						&& lsDestBranch.regionId == 770){
					$("*[data-accountgroup='name']").html('AGT LOGISTICS');
				} 	else {
					$("*[data-accountgroup='name']").html(headerCollection.accountGroupName);
				}
			} else {
				$("*[data-accountgroup='name']").html(headerCollection.accountGroupName);
			}
			$("*[data-branch='name']").html(headerCollection.branchName);
			$("*[data-branch='address']").html(headerCollection.branchAddress);
			$("*[data-branch='phonenumber']").html(headerCollection.branchContactDetailPhoneNumber);
			$("*[data-heading='heading']").html('Minified Loading Sheet');
			$("*[data-heading='vehicleNumber']").html(data.vehicleNumber);
			$("*[data-heading='lsNumber']").html(data.lsNumber);
			$("*[data-heading='lsSrcBranch']").html(data.dispatchLSSourceBranchName);
			$("*[data-heading='lsdate']").html(data.dispatchDateStr);
			$("*[data-heading='lsremark']").html(data.lsRemark);
			
			if(data.truckArrivalNumber != undefined){
				if(data.truckArrivalNumber == "--"){
					$("#truckArrivalRow").hide();
				} else {
					$("*[data-heading='truckArrivalNumber']").html(data.truckArrivalNumber);
				}
			} 
			$("*[data-heading='lsdate']").html(data.dispatchDateStr);
			$(".preloadingSheetPage").each(function(i) {if(i!=0){$(this).addClass("page-break");}});
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