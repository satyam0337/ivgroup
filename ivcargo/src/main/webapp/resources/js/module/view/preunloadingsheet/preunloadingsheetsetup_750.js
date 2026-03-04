define(['elementTemplateJs'],function(elementTemplateJs){
	let rowsPerPage	=90;
	let _this;
	let headerCollection,
	currentDateTime;
	return ({
		renderElements : function(response){
			_this = this;
			let preUnloadingSheetList = response.preUnloadingSheetList;
			
			let sourceObj = new Array();
			
			_.each(preUnloadingSheetList, function(preUnloadingSheet){
				sourceObj.push(preUnloadingSheet.wayBillSourceBranchName);
			});
						
			let uniqSourceBranch = _.uniq(sourceObj);
			
			let sourceWiseColl = new Object();
			let arrList	= null;
			_.each(uniqSourceBranch, function(sourceBranch){
				arrList = _.where(preUnloadingSheetList, {wayBillSourceBranchName: sourceBranch});
				sourceWiseColl[sourceBranch] = arrList;
			});
			
			headerCollection = response.PrintHeaderModel;
			currentDateTime = response.currentDateTime;
			let showDatainTabularFormat	= response.showDatainTabularFormat;
			let finalJsonObj = new Array();
			this.setSortedSources(sourceWiseColl,finalJsonObj);
			this.setDataForView(finalJsonObj,showDatainTabularFormat);
		},setDataForView:function(finalJsonObj,showDatainTabularFormat){
			let fileref = document.createElement("link");
			fileref.rel = "stylesheet";
			fileref.type = "text/css";
			fileref.href = "/ivcargo/resources/css/module/dispatch/preloadingsheet.css";
			document.getElementsByTagName("head")[0].appendChild(fileref)

			if(showDatainTabularFormat	== true) {
				require(['text!/ivcargo/template/preunloading/preunloadingsheet_6.html'],function(PreLoadingSheet){
					
					let chunkArray = finalJsonObj.splitArray(rowsPerPage);
					let TotalCount = Object.keys(chunkArray).length;
					for(let key in chunkArray){
						$("#myGrid").append(PreLoadingSheet);
						_this.renderTable(chunkArray[key]);
						$('.pageInfo').last().html("Page "+(parseInt(key)+parseInt(1))+" of "+TotalCount);
						$('.currentDateTime').last().html(currentDateTime);
					}
					_this.setHeaderData(headerCollection);
					window.print();
				})
			} else {
				require(['text!/ivcargo/template/preunloading/preunloadingsheet_750.html'],function(PreLoadingSheet){
					
					let chunkArray = finalJsonObj.splitArray(rowsPerPage);
					let TotalCount = Object.keys(chunkArray).length;
					for(let key in chunkArray){
						$("#myGrid").append(PreLoadingSheet);
						_this.renderTable(chunkArray[key]);
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
			let sourceArray = new Array();
			for(let sourceBranch in sourceWiseColl){
				sourceArray.push(sourceBranch);
			}
			sourceArray = sourceArray.sort(function(a, b) {return a.localeCompare(b);});

			for(let index in sourceArray){
				finalJsonObj.push({
					sourcebranch:sourceArray[index]
				})
				let detsinationcollection = sourceWiseColl[sourceArray[index]];
				for(let destkey in detsinationcollection){
					finalJsonObj.push(detsinationcollection[destkey]);
				}
			}
		},renderTable:function(chunkArray){
			let leftDataChunk = chunkArray.splitArray(Math.ceil(chunkArray.length/2));
			for(let leftData in leftDataChunk){
				if(leftData % 2 == 0){
					this.renderTableValues(leftDataChunk[leftData],'.leftdivTableBody');
				}else{
					this.renderTableValues(leftDataChunk[leftData],'.rightdivTableBody');
				}
			}
		},renderTableValues:function(chunkArray,className){
			console.log("chunkArray : " , chunkArray);
			let htmlVariable = '';
			for(var chunk in chunkArray){
				$.each( $(className).last(), function(i, left) {
					$('div', left).each(function() {
						if(typeof $(this).attr('data-cell') != "undefined" ){
							if(chunkArray[chunk][$(this).attr('data-cell')] != undefined){
								console.log("$(this).attr('data-cell') : " , $(this).attr('data-cell'));
								htmlVariable += '<div class="'+$(this).attr('class')+'">'+chunkArray[chunk][$(this).attr('data-cell')]+'</div>'
							}else if($(this).attr('data-fullrow'))
								htmlVariable += '<div class="'+$(this).attr('class')+'"></div>'
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
		let array=this;
		return [].concat(...array.map(function(elem,i) {
					return i%chunkSize ? [] : [array.slice(i,i+chunkSize)];
				})
		);
	}
});