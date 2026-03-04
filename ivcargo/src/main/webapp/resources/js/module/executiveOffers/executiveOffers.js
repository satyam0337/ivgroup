define([
    PROJECT_IVUIRESOURCES + '/resources/js/generic/urlparameter.js',
    'JsonUtility',
    'messageUtility'
], function (UrlParameter) {
    'use strict';

    let jsonObject = new Object(),
        _this = '',
        transferLedgerId;

    return Marionette.LayoutView.extend({
        initialize: function () {
            _this = this;
            transferLedgerId = UrlParameter.getModuleNameFromParam(MASTERID);
        },

        render: function () {
            // Directly call getJSON for fetching current offers
            getJSON({}, WEB_SERVICE_URL + '/tceBookingWS/getCurrentOffersFromTranCE.do?', response => {
                try {
                    _this.getResponseForOffers(response);  // Set the offers after getting the response
                } catch (error) {
                    console.error("Error processing the offers:", error);
                }
            }, error => {
                console.error("Error fetching current offers:", error);
            });

            return _this;
        },

        getResponseForOffers: function(responseOut) {
            hideLayer();

            let loadelement = new Array();
            let baseHtml = new $.Deferred();
            loadelement.push(baseHtml);

            // Load the HTML template for the Executive Offers
            $("#mainContent").load("/ivcargo/template/executiveoffers/executiveOffers.html", function () {
                baseHtml.resolve();
            });

            $.when.apply($, loadelement).done(function() {
                // Call setOffers to handle the response data and render the new tab
                _this.setOffers(responseOut);
            });
        },

setOffers: function(response) {

    if (typeof response.allOffers === 'string') {
        try {
            response.allOffers = JSON.parse(response.allOffers);
        } catch (e) {
            alert("Error: Failed to parse 'allOffers' JSON.");
            return;
        }
    }

    // Ensure allOffers is now an array
    if (!Array.isArray(response.allOffers)) {
        alert("Error: 'allOffers' is not an array.");
        return;
    }

    // HTML structure with inline styles for the table
    const htmlContent = `
       <style>
            .table-container { max-width: 95%; margin: 20px auto; padding: 20px; background-image: url('https://media.giphy.com/media/5x9MRvwkInOQ5ZD2Y4/giphy.gif'); background-size: cover; background-position: center; background-attachment: fixed; background-repeat: no-repeat; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-radius: 8px; overflow-x: auto; }
              .legend { display: flex; justify-content: space-around; margin-bottom: 20px; font-size: 25px;  color: #fff;}
            .legend-item { display: flex; align-items: center;   color: #fff;}
            .legend-color { width: 20px; height: 20px; margin-right: 10px; border-radius: 4px; }
            .legend-expired { background-color: #e74c3c; } /* Red */
            .legend-ongoing { background-color: #f39c12; } /* Orange */
            .legend-upcoming { background-color: #2ecc71; } /* Green */
            table { width: 100%; border-collapse: collapse; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            th, td { padding: 15px; font-size: 16px; border-bottom: 1px solid #ddd; text-align: center; }
            th { background-color: #3498db; color: #fff; }
            .progress { width: 100%; height: 25px; background-color: #d6e7f0; border-radius: 10px; overflow: hidden; }
            .progress-bar { height: 100%; text-align: center; font-weight: bold; line-height: 25px; transition: width 0.3s; color: #fff; }
            .btn-close { background-color: #3498db; color: #fff; padding: 12px 20px; font-size: 20px; font-weight: bold; border: none; cursor: pointer; margin-top: 20px; border-radius: 30px; width: 200px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); transition: background-color 0.3s, transform 0.3s, box-shadow 0.3s; } .btn-close:hover { background-color: #2980b9; transform: translateY(-5px); box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2); } .btn-close:active { background-color: #1f6fa2; transform: translateY(2px); }
            .custom-tooltip {
                display: none;
                position: absolute;
                background-color: #fff;
                border: 1px solid #ddd;
                padding: 10px;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                color: #555;
                z-index: 1000;
                max-width: 300px;
            }
            .custom-tooltip span.label {
                color: #3498db;
                font-weight: bold;
                display: block;
                margin-bottom: 5px;
            }
            .custom-tooltip span.no-terms {
                color: #e74c3c;
                font-weight: bold;
            }
       </style>

        <div class="table-container">
           <div class="legend">
               <div class="legend-item"><div class="legend-color legend-expired"></div>Offer Expired</div>
               <div class="legend-item"><div class="legend-color legend-ongoing"></div>Ongoing Offer</div>
               <div class="legend-item"><div class="legend-color legend-upcoming"></div>Upcoming Offer</div>
           </div>
            <h2>Executive Offers</h2>
            <table id="offersTable">
                <thead>
                    <tr>
                        <th>Reward</th>
                        <th>Description</th>
                        <th>Applicable On</th>
                        <th>Progress</th>
                        <th>Target Achieved</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                    </tr>
                </thead>
                <tbody id="offersTableBody"></tbody>
            </table>
            <button class="btn-close" id="closeBtn">Close</button>
        </div>`;

    // Insert the HTML content into the main content area
    $("#mainContent").html(htmlContent);

    // Separate offers by their status
    const ongoingOffers = [];
    const upcomingOffers = [];
    const expiredOffers = [];

   const now = new Date(); // Current date and time

response.allOffers.forEach(({ offerStartDate, offerEndDate, rewardAmount, offerDescription, applicableOn, type, totalRecords, totalAmount, totalActualWeight, termsConditions }) => {
    const getProgress = () => type === 1 ? totalRecords : type === 2 ? totalAmount : totalActualWeight || 0;
    const progressValue = getProgress();

    // Convert offer dates to Date objects
    const startDate = new Date(offerStartDate);
    const endDate = new Date(offerEndDate);

    console.log("now", now);
    console.log("startDate", startDate);
    console.log("endDate", endDate);

    // Check for no progress condition
    const isNoProgress = Math.abs(progressValue) <= 0.01;

    // Determine progress text and color
    let progressText = isNoProgress ? 'No Progress 😞' : `${Math.round(Math.min(100, (progressValue / applicableOn) * 100))}% ⏳`;
    let progressPercentage = isNoProgress ? 100 : Math.min(100, (progressValue / applicableOn) * 100); // Set width to 100% for no progress
    let progressColor = isNoProgress ? '#555' : '#3498db'; // Set color to dark gray (#555) for no progress

    // Target achieved calculation
    const targetAchievedText = isNoProgress
        ? 'No Progress 😞'
        : progressValue >= applicableOn
            ? 'Target Achieved 🏆'
            : `${Math.min(progressValue, applicableOn)} / ${applicableOn} ⏳`;
    const targetAchievedColor = isNoProgress
        ? '#555'
        : progressValue >= applicableOn
            ? '#2ecc71'
            : progressColor;

    // Determine row background color based on offer status
    let rowBgColor = '';
    let status = '';
    if (now >= startDate && now <= endDate) {
        console.log("Offer is ongoing.");
        rowBgColor = '#f39c12'; // Orange for ongoing
        status = 'ongoing';
    } else if (now < startDate) {
        console.log("Offer is upcoming.");
        rowBgColor = '#2ecc71'; // Green for upcoming
        status = 'upcoming';
    } else if (now > endDate) {
        console.log("Offer has expired.");
        rowBgColor = '#e74c3c'; // Red for expired
        status = 'expired';
    }

    // Create the row
    const tooltipContent = termsConditions
        ? `<span class="label">Terms and Conditions for Offer:</span><span>${termsConditions}</span>`
        : `<span class="no-terms">No terms and conditions for offer</span>`;
    const row = `
        <tr class="tooltip-row" data-tooltip="${tooltipContent.replace(/"/g, '&quot;')}">
            <td style="background-color: ${rowBgColor};">${rewardAmount} 💰</td>
            <td style="background-color: ${rowBgColor};">${offerDescription}</td>
            <td style="background-color: ${rowBgColor};">${applicableOn} ${type === 1 ? 'LRs 📦' : type === 2 ? 'Rs 💵' : 'Kg ⚖️'}</td>
            <td style="background-color: ${rowBgColor};">
                <div class="progress">
                    <div class="progress-bar" style="width: ${progressPercentage}%; background-color: ${progressColor};">
                        ${progressText}
                    </div>
                </div>
            </td>
            <td style="background-color: ${rowBgColor};">
                <div class="progress">
                    <div class="progress-bar" style="width: ${progressPercentage}%; background-color: ${targetAchievedColor};">
                        <span>${targetAchievedText}</span>
                    </div>
                </div>
            </td>
            <td style="background-color: ${rowBgColor};">${startDate.toLocaleDateString()}</td>
            <td style="background-color: ${rowBgColor};">${endDate.toLocaleDateString()}</td>
        </tr>`;

    // Push row into the corresponding array
    if (status === 'ongoing') {
        ongoingOffers.push(row);
    } else if (status === 'upcoming') {
        upcomingOffers.push(row);
    } else if (status === 'expired') {
        expiredOffers.push(row);
    }
});


    // Insert the rows into the table: Ongoing first, Upcoming second, and Expired last
    const tableBody = $("#offersTableBody");
    tableBody.append(ongoingOffers.join(''));
    tableBody.append(upcomingOffers.join(''));
    tableBody.append(expiredOffers.join(''));


    $("body").on("mouseenter", ".tooltip-row", function (e) {
        const tooltip = $(".custom-tooltip");
        if (!tooltip.length) {
            $("body").append('<div class="custom-tooltip"></div>');
        }
        $(".custom-tooltip").html($(this).data("tooltip")).css({
            top: e.pageY + 10,
            left: e.pageX + 10,
            display: "block",
        });
    });

    $("body").on("mousemove", ".tooltip-row", function (e) {
        $(".custom-tooltip").css({
            top: e.pageY + 10,
            left: e.pageX + 10,
        });
    });

    $("body").on("mouseleave", ".tooltip-row", function () {
        $(".custom-tooltip").hide();
    });
    // Close button functionality
    $("#closeBtn").on("click", function() {
        window.close();
    });
}





    });
});
