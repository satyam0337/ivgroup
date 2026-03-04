define([  
        'slickGridWrapper2'
         ,'selectizewrapper'
		 ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
		,'JsonUtility'
        ,'messageUtility'
          ,'nodvalidation'
          ,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
          ,'focusnavigation'//import in require.config
          ],
          function(slickGridWrapper, Selectizewrapper, Selection) {
	'use strict';
	let jsonObject = new Object(), myNod,  _this = '', executive, configuration;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/sourceDestinationWiseBookingDetailsReportWS/getSourceDestinationWiseBookingDetailsReportElement.do?', _this.renderLRSearch, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, renderLRSearch : function (response) {
			executive				= response.executive;
			configuration 			= response;

			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/report/collectionreport/sourceDestinationWiseBookingDetailsReport/sourceDestinationWiseBookingDetailsReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
			
				let keyObject = Object.keys(response);
				
				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute="+ element+ "]").removeClass("hide");
				}
				
				let elementConfiguration	= new Object();

				elementConfiguration.dateElement	= $('#dateEle');

				response.elementConfiguration		= elementConfiguration;
				response.isCalenderSelection		= true;

				Selection.setSelectionToGetData(response);
			
				if(configuration.selectAllOptionOnlyGroupAdmin) {
					let branchCollection = response.branchList;
					branchCollection.unshift({branchId:-1, branchName:"ALL"});
				
					let destBranchCollection = response.destinationBranchList;
					destBranchCollection.unshift({branchId:-1, branchName:"ALL"});
				}
				if(response.branchList != null) {
					Selectizewrapper.setAutocomplete({
						jsonResultList	: 	response.branchList,
						valueField		:	'branchId',
						labelField		:	'branchName',
						searchField		:	'branchName',
						elementId		:	'branchEle',
						create			: 	false,
						maxItems		: 	configuration.noOfSelectSourceBranch
					});
				}

				let destinationBranchList = response.destinationBranchList;
				
				$('#branchEle').on('change', function() {
					const selectedBranchId = $('#branchEle').val();

					if (Number(selectedBranchId) === Number(executive.branchId)) {
						destinationBranchList = response.destinationBranchList;
					} else {
						if (response.execuBranchList == null) {
							destinationBranchList = response.destinationBranchList.filter(
								branch => Number(branch.branchId) === Number(executive.branchId)
							);
						} else {
							destinationBranchList = response.execuBranchList;
						}
					}

					let selectizeInstance = $('#destinationBranchEle')[0].selectize;
					if (selectizeInstance) {
						selectizeInstance.clearOptions();
						selectizeInstance.addOption(destinationBranchList);
						selectizeInstance.refreshOptions(false);
					}

				});


				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	destinationBranchList,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'destinationBranchEle',
					create			: 	false,
					maxItems		: 	configuration.noOfSelectDestinationBranch
				});
				
				let wayBillTypeArr		= response.wayBillTypeArr;
				let wayBillStatusArr	= response.wayBillStatusArr;
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	wayBillTypeArr,
					valueField		:	'wayBillTypeId',
					labelField		:	'wayBillType',
					searchField		:	'wayBillType',
					elementId		:	'wayBillTypeEle',
					create			: 	false,
					maxItems		: 	wayBillTypeArr.length
				});
	
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	wayBillStatusArr,
					valueField		:	'wayBillStatusId',
					labelField		:	'wayBillStatusName',
					searchField		:	'wayBillStatusName',
					elementId		:	'wbStatusEle',
					create			: 	false,
					maxItems		: 	wayBillStatusArr.length
				});
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				addAutocompleteElementInNode1(myNod, 'branchEle', 'Select proper Source Branch !')
				addAutocompleteElementInNode1(myNod, 'destinationBranchEle', 'Select proper Destination Branch !')
				
				if (executive.executiveType == EXECUTIVE_TYPE_BRANCHADMIN || executive.executiveType == EXECUTIVE_TYPE_EXECUTIVE)
					$('#branchEle').val(executive.branchId);
				
				hideLayer();
				
				$("#saveBtn").click(function() {
					myNod.performCheck();
				
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
			});
			
			return _this;
		}, onSubmit : function() {
			showLayer();
			let jsonObject = new Object();
				
			if($("#dateEle").attr('data-startdate') != undefined)
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 

			if($("#dateEle").attr('data-enddate') != undefined)
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 

			jsonObject["sourceBranch"] 				= $('#branchEle').val();
			jsonObject["destinationBranch"] 		= $('#destinationBranchEle').val();
			jsonObject["wayBillType"] 				= $('#wayBillTypeEle').val();
			jsonObject["wayBillStatus"] 			= $('#wbStatusEle').val();
				
			getJSON(jsonObject, WEB_SERVICE_URL+'/sourceDestinationWiseBookingDetailsReportWS/getSourceDestinationWiseBookingDetailsReportData.do', _this.setData, EXECUTE_WITH_ERROR);
		}, setData : function(response) {
			hideLayer();
			
			if (response.message != undefined) {
				$('#middle-border-boxshadow').addClass('hide');
				$('#bottom-border-boxshadow').addClass('hide');
				
				return;
			}
			
			$('#bottom-border-boxshadow').removeClass('hide');
			$('#middle-border-boxshadow').removeClass('hide');
			
			let bookingChargesNameHM	= response.chargesNameHM;
			let wayBillChargeHm			= response.lrWiseChargesHm;
			
			if(bookingChargesNameHM != undefined) {
				for(const element of response.CorporateAccount) {
					let obj			= element;
					let chargesMap	= wayBillChargeHm[obj.wayBillId]
					
					for(let chargeId in bookingChargesNameHM) {
						let chargeName	= bookingChargesNameHM[chargeId].replace(/[' ',.,/]/g,"");
						
						obj[chargeName]	= chargesMap != undefined ? (chargesMap[chargeId] != undefined ? chargesMap[chargeId] : 0) : 0;
					}
				}
			}
				
			slickGridWrapper.setGrid(response);
			
			let table = $('<table class="table table-bordered" />');

			let trHead = $('<tr class="danger"/>');
			trHead.append('<th>Category</th>');
			trHead.append('<th>No. of Packages</th>');

			for (let k in response.chargesNameHM) {
				trHead.append('<th>' + response.chargesNameHM[k] + '</th>');
			}

			trHead.append('<th>Amount</th>');
			table.append(trHead);

			let totalArticles = 0;
			let totalCharges = {};
			let totalGrand = 0;

			for (let k in response.chargesNameHM) {
				totalCharges[response.chargesNameHM[k]] = 0;
			}

			for (let i = 0; i < response.bookingSummaryList.length; i++) {
				const obj = response.bookingSummaryList[i];
				let trBody = $('<tr/>');

				trBody.append('<td>' + obj.wayBillType + '</td>');
				trBody.append('<td>' + (obj.totalArticles || 0) + '</td>');

				for (let k in response.chargesNameHM) {
					let chargeName = response.chargesNameHM[k];
					let chargeValue = obj[chargeName] || 0;
					trBody.append('<td class="text-right">' + toFixedWhenDecimal(chargeValue) + '</td>');

					totalCharges[chargeName] += chargeValue;
				}

				trBody.append('<td class="text-right">' + toFixedWhenDecimal(obj.grandTotal || 0) + '</td>');

				totalArticles += (obj.totalArticles || 0);
				totalGrand += (obj.grandTotal || 0);

				table.append(trBody);
			}

			let trFoot = $('<tr class="danger"/>');

			trFoot.append('<th>Total</th>');
			trFoot.append('<th>' + toFixedWhenDecimal(totalArticles) + '</th>');

			for (let k in response.chargesNameHM) {
				let chargeName = response.chargesNameHM[k];
				trFoot.append('<th class="text-right">' + toFixedWhenDecimal(totalCharges[chargeName]) + '</th>');
			}

			trFoot.append('<th class="text-right">' + toFixedWhenDecimal(totalGrand) + '</th>');
			table.append(trFoot);

			$('#bookedSummaryDiv').empty().append(table);
		}
	});
});