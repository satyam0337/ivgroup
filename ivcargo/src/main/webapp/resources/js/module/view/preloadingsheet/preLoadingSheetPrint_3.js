define(['elementTemplateJs'], function(elementTemplateJs) {
    var rowsPerPage = 5000;
    var _this;
    var headerCollection,
        currentDateTime, destBranchName = "";
    return ({
        renderElements: function(response) {
            _this = this;
            headerCollection = response.PrintHeaderModel;
            dispatchLSHeader = response.dispatchLSHeader;
            var pendingDispatchArraylist = response.pendingDispatchArraylist;
            currentDateTime = response.currentDateTime;
            if (response.destBrnachesNameCommaSep) {
                let branchesArray = response.destBrnachesNameCommaSep.split(",");
                if (branchesArray.length > 0) {
                    destBranchName = branchesArray[0].trim();
                }
            }
            this.setDataForView(pendingDispatchArraylist);
        },
        setDataForView: function(finalJsonObj) {
            require(['text!/ivcargo/template/preloading/preLoadingSheetPrint_3.html'], function(PreLoadingSheet) {
                var chunkArray = finalJsonObj.splitArray(rowsPerPage);
                var TotalCount = Object.keys(chunkArray).length;
                var TotalCount = Object.keys(chunkArray).length;
                var totalNoOfLR = 0;
                $("#myGridCustom").html('')
                for (var key in chunkArray) {
                    $("#myGridCustom").append(PreLoadingSheet);
                    _this.renderTableValues(chunkArray[key], '.leftdivTableBody');
                    $('.pageInfo').last().html("Page " + (parseInt(key) + parseInt(1)) + " of " + TotalCount);
                    $('.currentDateTime').html(currentDateTime);
                    $("*[data-date='date']").html(currentDateTime);
                }
                $('.leftdivTableBody .divTableCell:last').fadeOut();
                $('.divTableFoot:not(:last)').each(function() {
                    $(this).empty()
                });
                $('.totalNoOfLr').last().html('LRs- ' + totalNoOfLR);
                _this.setHeaderData(headerCollection);
                _this.setTableRowData(finalJsonObj);
                hideLayer();
                _this.showPrintOnPopup();
            })
        },
        setTableRowData: function(tableData) {
            hideLayer();
            $('#leftTable').empty();
            $('#rightTable').empty();
            let totalRows = 48;
            let midPoint = Math.ceil(tableData.length / 2);
            let countLeft = 0;
            let countRight = 0;
            for (let i = 0; i < midPoint; i++) {
                let el = tableData[i];
                if (el.wayBillNumber !== undefined) {
                    let wayBillDisplay = (el.ewaybillNumber !== '--') ? '**' + el.wayBillNumber : el.wayBillNumber;
                    let row = "<tr>" +
                        "<td style='text-align: center; border-right: 1px solid black; border-bottom: 1px solid black;'>" + wayBillDisplay + "</td>" +
                        "<td style='text-align: center; border-right: 1px solid black; border-bottom: 1px solid black;' class='ellipsis2' >" + el.pendingQuantity + " " + el.packingTypeMasterName + "</td>" +
                        "<td style='text-align: center; border-right: 1px solid black; border-bottom: 1px solid black;' class='ellipsis2' >" + el.wayBillRemark + "</td>" +
                        "</tr>";
                    $("#leftTable").append(row);
                    countLeft++;
                }
            }
            for (let i = midPoint; i < tableData.length; i++) {
                let el = tableData[i];
                if (el.wayBillNumber !== undefined) {
                    let wayBillDisplay = (el.ewaybillNumber !== '--') ? '**' + el.wayBillNumber : el.wayBillNumber;
                    let row = "<tr>" +
                        "<td style='text-align: center; border-right: 1px solid black; border-bottom: 1px solid black;'>" + wayBillDisplay + "</td>" +
                        "<td style='text-align: center; border-right: 1px solid black; border-bottom: 1px solid black;' class='ellipsis2' >" + el.pendingQuantity + " " + el.packingTypeMasterName + "</td>" +
                        "<td style='text-align: center; border-right: 1px solid black; border-bottom: 1px solid black;' class='ellipsis2' >" + el.wayBillRemark + "</td>" +
                        "</tr>";
                    $("#rightTable").append(row);
                    countRight++;
                }
            }
            let remainingRowsLeft = Math.max(0, totalRows - countLeft);
            for (let j = 0; j < remainingRowsLeft; j++) {
                let blankRow = "<tr>" +
                    "<td style='border-right: 1px solid black; border-bottom: 1px solid black;'>&nbsp;</td>" +
                    "<td style='border-right: 1px solid black; border-bottom: 1px solid black;'>&nbsp;</td>" +
                    "<td style='border-right: 1px solid black; border-bottom: 1px solid black;'>&nbsp;</td>" +
                    "</tr>";
                $("#leftTable").append(blankRow);
            }
            let remainingRowsRight = Math.max(0, totalRows - countRight);
            for (let j = 0; j < remainingRowsRight; j++) {
                let blankRow = "<tr>" +
                    "<td style='border-right: 1px solid black; border-bottom: 1px solid black;'>&nbsp;</td>" +
                    "<td style='border-right: 1px solid black; border-bottom: 1px solid black;'>&nbsp;</td>" +
                    "<td style='border-right: 1px solid black; border-bottom: 1px solid black;'>&nbsp;</td>" +
                    "</tr>";
                $("#rightTable").append(blankRow);
            }
        },
        setHeaderData: function(headerCollection) {
            $("*[data-accountgroup='name']").html(headerCollection.accountGroupName);
            $("*[data-branch='name']").html(headerCollection.branchName);
            $("*[data-branch='address']").html(headerCollection.branchAddress);
            $("*[data-branch='branchGSTN']").html(headerCollection.branchGSTN);
            $("*[data-branch='phonenumber']").html(headerCollection.branchContactDetailPhoneNumber);
            $("*[data-heading='heading']").html('Pre Loading Sheet');
            $("*[data-branch='destinationBranch']").html(destBranchName);
            $(".preloadingSheetPage").each(function(i) {
                if (i != 0) {
                    $(this).addClass("page-break");
                }
            });
        },
        renderTableValues: function(chunkArray, className) {
            var htmlVariable = '';
            for (var chunk in chunkArray) {
                $.each($(className).last(), function(i, left) {
                    $('div', left).each(function() {
                        if (typeof $(this).attr('data-cell') != "undefined") {
                            if (chunkArray[chunk][$(this).attr('data-cell')] != undefined) {
                                htmlVariable += '<div class="' + $(this).attr('class') + '">' + chunkArray[chunk][$(this).attr('data-cell')] + '</div>'
                            } else {
                                if ($(this).attr('data-fullrow')) {
                                    htmlVariable += '<div class="' + $(this).attr('class') + '"></div>'
                                }
                            }
                        }
                    });
                })
            }
            $(className).last().html(htmlVariable);
        },
        showPrintOnPopup: function() {
            var width = 1000;
            var height = 600;
            var left = parseInt((screen.availWidth / 2) - (width / 2));
            var top = parseInt((screen.availHeight / 2) - (height / 2));
            childwin = window.open('', 'newwindow', config = 'height=' + height + ',width=' + width + ',left=' + left + ',top=' + top + ', toolbar=no, menubar=no, scrollbars=no, resizable=no,location=no, directories=no, status=no');
            var clonedElement = $("#myGridCustom").clone(true);
            clonedElement.removeClass("hide");
            console.log(clonedElement, 'llllll')
            childwin.document.write(clonedElement.html());
            childwin.document.write('</body></html>');
            if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                childwin.print();
                childwin.close();
                doneTheStuff = false;
                childwin.opener.setValue(doneTheStuff);
            } else {
                setTimeout(function() {
                    childwin.print();
                    childwin.close();
                    doneTheStuff = false;
                    childwin.opener.setValue(doneTheStuff);
                }, 200)
            }
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