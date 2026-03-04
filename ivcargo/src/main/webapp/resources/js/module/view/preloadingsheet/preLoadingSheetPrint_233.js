define(['elementTemplateJs'], function(elementTemplateJs) {
	var rowsPerPage = 80;
	var _this;
	var headerCollection,
		currentDateTime, destBrnachesNameCommaSep = "";
	var dataView;
	var latestResponse; // ← NEW: To access response flags later

	return ({
		renderElements: function(response) {
			$('#dataPopup').remove();
			hideLayer();
			_this = this;
			latestResponse = response; // ← SAVE response for column visibility

			var pendingSheet = response.pendingDispatchmodelColl;
			headerCollection = response.PrintHeaderModel;
			destBrnachesNameCommaSep = response.destBrnachesNameCommaSep;
			currentDateTime = response.currentDateTime;
			var showSourceSelectionPopUpInPreloadingSheetPrint = response.showSourceSelectionPopUpInPreloadingSheetPrint;
			if (showSourceSelectionPopUpInPreloadingSheetPrint == 'true' || showSourceSelectionPopUpInPreloadingSheetPrint == true) {
				var sourceBranchArr = _.keys(pendingSheet);
				$("#myGrid").append('<div style="display: none;" id="dataPopup"></div>');
				_this.showPopUpWindow(sourceBranchArr, pendingSheet, showSourceSelectionPopUpInPreloadingSheetPrint);
			} else {
				var finalJsonObj = new Array();
				this.setSortedSources(pendingSheet, finalJsonObj);
				this.setDataForView(finalJsonObj, showSourceSelectionPopUpInPreloadingSheetPrint);
			}

		},
		showPopUpWindow: function(sourceBranchArr, pendingSheet, showSourceSelectionPopUpInPreloadingSheetPrint) {
			$('#dataPopup').bPopup({}, function() {
				var _thisMod = this;
				var keyCollection = _this.createCheckBoxFeild(sourceBranchArr);
				$(this).html("<div class='confirm'><h1 style='font-size:20px;color: #0073BA;'>Please select Source Branch To Print.</h1><table align='center'>" + keyCollection + "</table><p style='font-size:12px;'>Shortcut Keys : Enter = Yes, Esc = No</p><br/><button id='cancelButton'>NO</button><button autofocus data-btmodel='confirm' id='confirm'>YES</button></div>")
				$("#selectAll").click(function() {
					if ($(this).prop("checked")) {
						$(".checkBoxClass").prop("checked", true);
					} else {
						$(".checkBoxClass").prop("checked", false);
					}
				});
				$("#confirm").focus();
				$("[data-btmodel='confirm']").click(function() {
					_thisMod.close();
					var finalSourceObj = new Object();
					_.each(sourceBranchArr, function(sourceBranchName) {
						if ($('#' + sourceBranchName.split('(')[0].trim().replace(/ /g, "_")).is(':checked')) {
							finalSourceObj[sourceBranchName] = pendingSheet[sourceBranchName]
						}
					})
					var finalJsonObj = new Array();
					_this.setSortedSources(finalSourceObj, finalJsonObj);
					_this.setDataForView(finalJsonObj, showSourceSelectionPopUpInPreloadingSheetPrint);
				})
				$("#confirm").on('keydown', function(e) {
					if (e.which == 27) { //escape
						_thisMod.close();
					}
				});
				$("#cancelButton").click(function() {
					_thisMod.close();
				})
			})
		},
		setDataForView: function(finalJsonObj, showSourceSelectionPopUpInPreloadingSheetPrint) {
			if (dataView == undefined) {
				require(['text!/ivcargo/template/preloading/preloadingsheet_5.html'], function(PreLoadingSheet) {
					_this.setData(finalJsonObj, showSourceSelectionPopUpInPreloadingSheetPrint, PreLoadingSheet);
				})
			} else {
				_this.setData(finalJsonObj, showSourceSelectionPopUpInPreloadingSheetPrint, dataView);
			}

		},
		setData: function(finalJsonObj, showSourceSelectionPopUpInPreloadingSheetPrint, PreLoadingSheet) {
			$("#myGrid").empty().addClass('visible-print-block'); // ← Important: clear previous print
			var chunkArray = finalJsonObj.splitArray(rowsPerPage);
			var TotalCount = Object.keys(chunkArray).length;
			var totalNoOfLR = 0;
			var totalNoOfQuantity = 0;
			var totalActualWeight = 0;
			var totalChargedWeight = 0;
			for (var i = 0; i < finalJsonObj.length; i++) {
				var pendingDispatchModel = finalJsonObj[i];
				if (pendingDispatchModel.pendingQuantity > 0) {
					totalNoOfQuantity += pendingDispatchModel.pendingQuantity;
					totalActualWeight += pendingDispatchModel.consignmentSummaryActualWeight;
					totalChargedWeight += pendingDispatchModel.consignmentSummaryChargedWeight
					totalNoOfLR++;
				}
			}
			for (var key in chunkArray) {
				$("#myGrid").append(PreLoadingSheet);
				_this.renderTable(chunkArray[key]);
				$('.pageInfo').last().html("Page " + (parseInt(key) + parseInt(1)) + " of " + TotalCount);
				$('.currentDateTime').last().html(currentDateTime);
			}

			$('.summaryinfo:not(:last)').each(function() {
				$(this).empty()
			});
			$('.summaryTable:not(:last)').each(function() {
				$(this).empty()
			});
			$("*[data-cell='totalNoOfLr']").html(totalNoOfLR);
			$("*[data-cell='totalNoOfArticle']").html(totalNoOfQuantity);
			$("*[data-cell='totalActualWeight']").html(totalActualWeight);
			$("*[data-cell='totalChargeWeight']").html(totalChargedWeight);

			_this.setHeaderData(headerCollection);

			// ←←← NEW: Apply column hide/show logic here
			_this.applyColumnVisibility();

			hideLayer();
			_this.showPrintOnPopup();

		},
		// ←←← NEW FUNCTION: Hide/Show columns based on response flags
		applyColumnVisibility: function() {
		    var hideActualWeight = (latestResponse.hideActualWeight === true || latestResponse.hideActualWeight === 'true');
		    var showGodownName = (latestResponse.showGodownName === true || latestResponse.showGodownName === 'true');
		    if (hideActualWeight) {
		        $('[data-column="actualWeight"]').hide();
		    } else {
		        $('[data-column="actualWeight"]').show();
		    }

		    if (showGodownName) {
		        $('[data-column="godown"]').show();
		    } else {
		        $('[data-column="godown"]').hide();
		    }
		},
		renderTable: function(chunkArray) {
			var leftDataChunk = chunkArray.splitArray(Math.ceil(chunkArray.length / 2));
			for (var leftData in leftDataChunk) {
				if (leftData % 2 == 0) {
					this.renderTableValues(leftDataChunk[leftData], '.leftdivTableBody');
				} else {
					this.renderTableValues(leftDataChunk[leftData], '.rightdivTableBody');
				}
			}
		},
		setHeaderData: function(headerCollection) {
			$("*[data-accountgroup='name']").html(headerCollection.accountGroupName);
			$("*[data-branch='name']").html(headerCollection.branchName);
			$("*[data-branch='address']").html(headerCollection.branchAddress);
			$("*[data-branch='phonenumber']").html(headerCollection.branchContactDetailPhoneNumber);
			$("*[data-heading='heading']").html('Pre Loading Sheet');
			$("*[data-heading='currentTimeStamp']").html(currentDateTime);
			$("*[data-branch='destinationBranch']").html(destBrnachesNameCommaSep);

			$(".preloadingSheetPage").each(function(i) {
				if (i != 0) {
					$(this).addClass("page-break");
				}
			});
		},
		renderTableValues: function(chunkArray, className) {
		    var htmlVariable = '';
		    var $templateRow = $(className).last().find('.divTableRow').first();

		    for (var chunk in chunkArray) {
		        var $newRow = $('<div class="divTableRow"></div>');

		        $('div', $templateRow).each(function() {
		            var $cell = $(this);
		            var dataCell = $cell.attr('data-cell');
		            var isFullRow = $cell.attr('data-fullrow');

		            if (dataCell && chunkArray[chunk][dataCell] !== undefined) {
		                // Clone the cell with ALL attributes + data-column!
		                var $newCell = $cell.clone();
		                $newCell.html(chunkArray[chunk][dataCell]);
		                $newRow.append($newCell);
		            } else if (isFullRow) {
		                var $newCell = $cell.clone();
		                $newCell.html('');
		                $newRow.append($newCell);
		            }
		        });

		        htmlVariable += $newRow[0].outerHTML;
		    }

		    $(className).last().html(htmlVariable);
		},
		showPrintOnPopup: function() {
			var width = 1000;
			var height = 600;
			var left = parseInt((screen.availWidth / 2) - (width / 2));
			var top = parseInt((screen.availHeight / 2) - (height / 2));
			childwin = window.open('', 'newwindow', config = 'height=' + height + ',width=' + width + ',left=' + left + ',top=' + top + ', toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
			childwin.document.write('<html><head><title>Print it!</title></head><body>')
			childwin.document.write($("#myGrid").html());
			childwin.document.write('</body></html>');
			if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
				childwin.print();
			} else {
				setTimeout(function() {
					childwin.print();
					childwin.close();
					doneTheStuff = false;
					childwin.opener.setValue(doneTheStuff);
				}, 200)
			}
		},
		setSortedSources: function(pendingSheet, finalJsonObj) {
			var sourceArray = new Array();
			for (sourceBranch in pendingSheet) {
				sourceArray.push(sourceBranch);
			}
			sourceArray = sourceArray.sort(function(a, b) {
				return a.localeCompare(b);
			});
			for (var index in sourceArray) {
				finalJsonObj.push({
					sourcebranch: sourceArray[index]
				})

				for (var i = 0; (pendingSheet[sourceArray[index]]).length > i; i++) {
					var wayBillNumber = pendingSheet[sourceArray[index]][i].wayBillNumber;
					pendingSheet[sourceArray[index]][i].sortByWayBillNumber = Number(wayBillNumber);
				}
				pendingSheet[sourceArray[index]] = _.sortBy(pendingSheet[sourceArray[index]], 'sortByWayBillNumber');
				var detsinationcollection = pendingSheet[sourceArray[index]];
				for (var destkey in detsinationcollection) {
					finalJsonObj.push(detsinationcollection[destkey]);
				}
			}
		},
		createCheckBoxFeild: function(sourceArray) {
			var collection = '';
			collection += "<tr><td colspan='2' style='background-color: #E2E2E2;color: #0073BA;font-size:15px'><b><input type='checkbox' id='selectAll' checked>SelectAll<b></td></tr>";

			for (var i = 0; i < sourceArray.length; i++) {
				if (i % 2 == 0) {
					collection += "<tr><td style='background-color: #E2E2E2;font-size:15px'><b><input type='checkbox' id=" + sourceArray[i].split('(')[0].trim().replace(/ /g, "_") + " value=" + sourceArray[i].split('(')[0].trim() + " class='checkBoxClass' checked>&nbsp;&nbsp;" + sourceArray[i].split('(')[0].trim() + "</b></td>";
				} else {
					collection += "<td style='background-color: #E2E2E2;font-size:15px'><b><input type='checkbox' id=" + sourceArray[i].split('(')[0].trim().replace(/ /g, "_") + " value=" + sourceArray[i].split('(')[0].trim() + " class='checkBoxClass' checked>&nbsp;&nbsp;" + sourceArray[i].split('(')[0].trim() + "</b></td></tr>";
				}
			}
			return collection;
		}
	});
});

Object.defineProperty(Array.prototype, 'splitArray', {
	value: function(chunkSize) {
		var array = this;
		return [].concat.apply([],
			array.map(function(elem, i) {
				return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
			})
		);
	}
});