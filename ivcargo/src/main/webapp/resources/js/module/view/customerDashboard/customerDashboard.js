define([
	'messageUtility',
	'JsonUtility',
	'validation',
	PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
	PROJECT_IVUIRESOURCES + '/resources/js/datepicker/datepickerwrapper.js',
	'focusnavigation'
], function() {
	'use strict';

	let jsonObject = {}, _this = '', config = {};

	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
			jsonObject.executiveIdCheck = localStorage.getItem("executiveIdCheck") || null;
			jsonObject.accountGroupId	= localStorage.getItem("accountGroupId") || null;
		}, render : function() {
			getJSON({}, WEB_SERVICE_URL + "/dashboard/config.do?", _this.setElementDetails,	EXECUTE_WITH_ERROR);
			return _this;
		}, setElementDetails: function(response) {
			config	= response;
			
			// --- Load HTML first ---
			let loadelement = [];
			let baseHtml = new $.Deferred();
			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/customerDashboard/customerDashboard.html", function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				hideLayer();

				document.querySelectorAll("#contentbox .card-header h5").forEach(h => {

					h.style.textTransform = "uppercase";

					h.style.letterSpacing = "-0.5px";

				});
				// --- Dashboard Data Initialization ---
				const allCards = [
					config.bookingCard,
					config.deliveryCard,
					config.outstandingCard,
					config.pendingDispatchCard,
					config.pendingReceiveCard,
					config.pendingDeliveryCard,
					config.pendingFundReceiveCard,
					config.pendingBLHPVPayableBranchWiseCard
				];

				if (allCards.every(v => v === false || v === "false")) {
					const content = document.getElementById("contentbox");
						
					if (content) {
						content.innerHTML = `
							<div style="padding:30px; text-align:center; color:#c0392b; font-size:20px; font-weight:bold;">
								No Dashboard Cards Are Enabled.<br>
								Please Contact Admin To Configure Dashboard.
							</div>
						`;
					}

					return; // Stop loading data/fetch calls
				}

				applyCardVisibility(config);

				// hide cards before loader shows
				if (!config.bookingCard) skipCard("bookingFlipCard");
				if (!config.deliveryCard) skipCard("deliveryFlipCard");
				if (!config.outstandingCard) skipCard("Outstanding");
				if (!config.pendingDispatchCard) skipCard("pendingDispatchFlipCard");
				if (!config.pendingReceiveCard) skipCard("pendingReceiveFlipCard");
				if (!config.pendingDeliveryCard) skipCard("pendingDeliveryFlipCard");
				if (!config.pendingFundReceiveCard) skipCard("pendingFundReceiveCard");
				if (!config.pendingBLHPVPayableBranchWiseCard) skipCard("pendingBLHPVPayableBranchWiseCard");

				// --- Show loader for all cards initially ---
				const loaderCards = [
					"bookingFlipCard",
					"deliveryFlipCard",
					"pendingDispatchFlipCard",
					"pendingReceiveFlipCard",
					"pendingDeliveryFlipCard",
					"Outstanding",
					"pendingFundReceiveCard",
					"pendingBLHPVFlipCard"
				];
				
				loaderCards.forEach(id => showCardLoader(id));

				// --- Fetch Functions ---
				const fetchBooking = function() {
					getJSON(jsonObject, WEB_SERVICE_URL + '/dashboard/booking.do?', function(response) {
						if (response && response.notAllowed) {
							const bifEl = document.getElementById("bookingBifurcation");
							if (bifEl) bifEl.innerText = "";

							showNotAllowedMessage("bookingTotal", "bookingFlipCard");
							return;
						}
						
						if (response) {
							animateCount("bookingTotal", response.BookingTotal || 0, '₹');

							// Extract bifurcation values
							const paid = Number(response.PaidTotal) || 0;
							const toPay = Number(response.ToPayTotal) || 0;
							const tbb = Number(response.TBBTotal) || 0;

							// ✅ Update bifurcation text with actual data
							const bifurcationEl = document.getElementById("bookingBifurcation");
						
							if (bifurcationEl) {
								bifurcationEl.innerText =
									`(Paid: ${paid.toLocaleString()}, ToPay: ${toPay.toLocaleString()}, TBB: ${tbb.toLocaleString()})`;
							}

							// Other stats (if used elsewhere)
							animateCount("bookingWeight", response.BookingActualWeight || 0, ' kg');
							animateCount("bookingQty", response.BookingQuantity || 0, ' pcs');
							animateCount("bookedLrCount", response.BookingNoOfRecords || 0, ' LRs');
						}

						hideCardLoader("bookingFlipCard");
					}, EXECUTE_WITHOUT_ERROR_MESSAGE);
				};

				const fetchDelivery = function() {
					getJSON(jsonObject, WEB_SERVICE_URL + '/dashboard/delivery.do?', function(response) {
						if (response && response.notAllowed) {
							showNotAllowedMessage("deliveryTotal", "deliveryFlipCard");
							return;
						}

						if (response) {
							animateCount("deliveryTotal", response.DeliveryTotal || 0, '₹');
							animateCount("deliveryWeight", response.DeliveryActualWeight || 0, ' kg');
							animateCount("deliveryQty", response.DeliveryQuantity || 0, ' pcs');
							animateCount("deliveredLrCount", response.DeliveryNoOfRecords || 0, ' LRs');
						}
						
						hideCardLoader("deliveryFlipCard");
					}, EXECUTE_WITHOUT_ERROR_MESSAGE);
				};

				const fetchOutstanding = function() {
					getJSON(jsonObject, WEB_SERVICE_URL + '/dashboard/outstanding.do?', function(response) {

						if (response && response.notAllowed) {
							showNotAllowedMessage("outStandingTotal", "Outstanding");
							return;
						}
						
						if (response) {
							animateCount("outStandingTotal", Math.floor(response.OutstandingTotal || 0), '₹');
						}
						
						hideCardLoader("Outstanding");
					}, EXECUTE_WITHOUT_ERROR_MESSAGE);
				};

				const fetchPendingDispatch = function() {
					getJSON(jsonObject, WEB_SERVICE_URL + '/dashboard/pending/dispatch.do?', function(response) {
						if (response && response.notAllowed) {
							showNotAllowedMessage("pendingDispatch", "pendingDispatchFlipCard");
							return;
						}
						
						if (response) {
							animateCount("pendingDispatch", response.PendingDispatchCount || 0, 'LRs');
							animateCount("pendingDispatchWeight", response.PendingDispatchWeight || 0, ' kg');
							animateCount("pendingDispatchQty", response.PendingDispatchQuantity || 0, ' pcs');
						}
						
						hideCardLoader("pendingDispatchFlipCard");
					}, EXECUTE_WITHOUT_ERROR_MESSAGE);
				};

				const fetchPendingReceive = function() {
					getJSON(jsonObject, WEB_SERVICE_URL + '/dashboard/pending/receive.do?', function(response) {
						if (response && response.notAllowed) {
							showNotAllowedMessage("pendingReceive", "pendingReceiveFlipCard");
							return;
						}
						
						if (response) {
							animateCount("pendingReceive", response.PendingReceiveCount || 0, 'LRs');
							animateCount("pendingReceiveWeight", response.PendingReceiveWeight || 0, ' kg');
							animateCount("pendingReceiveQty", response.PendingReceiveQuantity || 0, ' pcs');
						}
						
						hideCardLoader("pendingReceiveFlipCard");
					}, EXECUTE_WITHOUT_ERROR_MESSAGE);
				};

				const fetchPendingDelivery = function() {
					getJSON(jsonObject, WEB_SERVICE_URL + '/dashboard/pending/delivery.do?', function(response) {
						if (response && response.notAllowed) {
							showNotAllowedMessage("pendingDelivery", "pendingDeliveryFlipCard");
							return;
						}
						
						if (response) {
							animateCount("pendingDelivery", response.PendingDeliveryCount || 0, 'LRs');
							animateCount("pendingDeliveryWeight", response.PendingDeliveryWeight || 0, ' kg');
							animateCount("pendingDeliveryQty", response.PendingDeliveryQuantity || 0, ' pcs');
						}
						
						hideCardLoader("pendingDeliveryFlipCard");
					}, EXECUTE_WITHOUT_ERROR_MESSAGE);
				};

				const fetchPendingFundReceive = function() {
					getJSON(jsonObject, WEB_SERVICE_URL + '/dashboard/pending/fundreceive.do?', function(response) {
						if (response && response.notAllowed) {
							showNotAllowedMessage("pendingFundReceive", "pendingFundReceiveCard");
							return;
						}
						
						if (response) {
							animateCount("pendingFundReceive", response.PendingFundReceiveCount || 0, 'Fund Transfers');
						}
						
						hideCardLoader("pendingFundReceiveCard");
					}, EXECUTE_WITHOUT_ERROR_MESSAGE);
				};
				
				const fetchLastUpdated = function() {
					const el = document.getElementById("dashboardLastUpdated");
					if (!el) return;

					getJSON(jsonObject, WEB_SERVICE_URL + '/dashboard/lastUpdated.do?', function(response) {
						const lastUpdated = response?.lastUpdated?.lastUpdated;

						if (typeof lastUpdated === "string") {
							el.innerHTML = `This Live Dashboard Updates In Every <strong style="color:#c0392b;">10 Minutes</strong>, Last Updated Date Time: 
							<strong style="color:#1e90ff;">${lastUpdated}</strong>`;
						} else {
							el.innerHTML = `This Live Dashboard Updates In Every <strong style="color:#c0392b;">10 Minutes</strong>, Last Updated Date Time: 
							<strong style="color:#1e90ff;">--</strong>`;
						}

					}, EXECUTE_WITHOUT_ERROR_MESSAGE);
				};
				
				const fetchPendingBLHPVPayableBranchWise = function() {
					getJSON(jsonObject, WEB_SERVICE_URL + '/dashboard/pending/blhpv.do?', function(response) {
							if (response && response.notAllowed) {
								showNotAllowedMessage("pendingBLHPVCount", "pendingBLHPVFlipCard");
								return;
							}

							if (response) {
								animateCount("pendingBLHPVCount", response.PendingBLHPVPayableCount || 0, "BLHPVs");
								animateCount("pendingBLHPVBalance", response.PendingBLHPVPayableBalance || 0, "₹");
							}

							hideCardLoader("pendingBLHPVFlipCard");
						},
						EXECUTE_WITHOUT_ERROR_MESSAGE
					);
				};

				// --- Load All Cards ---
				if (config.bookingCard) fetchBooking();
				if (config.deliveryCard) fetchDelivery();
				if (config.outstandingCard) fetchOutstanding();
				//	fetchPending();
				if (config.pendingDispatchCard) fetchPendingDispatch();
				if (config.pendingReceiveCard) fetchPendingReceive();
				if (config.pendingDeliveryCard) fetchPendingDelivery();
				if (config.pendingFundReceiveCard) fetchPendingFundReceive();
				if (config.pendingBLHPVPayableBranchWiseCard) fetchPendingBLHPVPayableBranchWise();

				fetchLastUpdated();

				// --- Initialize Flip Cards ---
				const flipCards = [
					"bookingFlipCard",
					"deliveryFlipCard",
					"pendingDispatchFlipCard",
					"pendingReceiveFlipCard",
					"pendingDeliveryFlipCard",
					"pendingBLHPVFlipCard"
				];

				flipCards.forEach(id => {
					const el = document.getElementById(id);
					if (!el) return;

					let flipState = 0;
					el.classList.add("flipped-0");

					el.addEventListener("click", () => {
						if (el.id === "pendingBLHPVFlipCard") {
							flipState = (flipState === 0) ? 2 : 0;
						} else {
							const isFourFace = el.classList.contains("four-face");
							const maxFaces = isFourFace ? 4 : 3;
							flipState = (flipState + 1) % maxFaces;
						}
						// Preserve any other classes, remove old flipped-* first
						el.className = el.className.replace(/flipped-\d/, '') + ` flipped-${flipState}`;
					});
				});

			});

			return _this;
		}
	});
});


function skipCard(id) {
	let col = document.getElementById(id);
	if (!col) return;

	// Hide its bootstrap column, not the inner card
	let wrapper = col.closest(".col-md-4, .col-md-3");
	if (wrapper) {
		wrapper.classList.add("hidden-card");
	}
}


// ==================================================================================
// BLOCK 3: APPLY VISIBILITY FROM CONFIG
// ==================================================================================
function applyCardVisibility(config) {

	const map = {
		bookingCard: "bookingFlipCard",
		deliveryCard: "deliveryFlipCard",
		outstandingCard: "Outstanding",
		pendingDispatchCard: "pendingDispatchFlipCard",
		pendingReceiveCard: "pendingReceiveFlipCard",
		pendingDeliveryCard: "pendingDeliveryFlipCard",
		pendingFundReceiveCard: "pendingFundReceiveCard",
	    pendingBLHPVPayableBranchWiseCard: "pendingBLHPVFlipCard" 
	};

	for (let key in map) {

		const cardId = map[key];
		const card = document.getElementById(cardId);
		if (!card) continue;

		const col = card.closest(".col-md-3, .col-md-4");
		if (!col) continue;

		if (config[key] === true || config[key] === "true") {
			col.style.display = "block";  // SHOW entire column
		} else {
			col.style.display = "none";	 // HIDE entire column
		}
	}
}

// ---------------------- Utility Functions ----------------------
function animateCount(elId, endValue, unit = '') {
	const el = document.getElementById(elId);
	if (!el) return;
	
	 const Rupee = "\u20B9";  // FIX: Unicode rupee symbol

	let start = 0;
	const duration = 1000;
	const increment = endValue / (duration / 16);
	
	function counter() {
		start += increment;

		let displayValue;
		if (unit.trim() === 'kg') displayValue = formatIndianNumber(start.toFixed(2));
		else displayValue = formatIndianNumber(Math.floor(start));

		if (start >= endValue) {
			displayValue = (unit.trim() === 'kg') ? formatIndianNumber(endValue.toFixed(2)) : formatIndianNumber(Math.floor(endValue));
			el.innerText = (unit === '₹') ? Rupee + displayValue : displayValue + (unit ? ' ' + unit : '');
		} else {
			el.innerText = (unit === '₹') ? Rupee + displayValue : displayValue + (unit ? ' ' + unit : '');
			requestAnimationFrame(counter);
		}
	}

	counter();
	setHoverInWords(elId, endValue, unit);

	// --- Pending hyperlink logic ---
	if (elId.startsWith("pending")) {
		el.style.cursor = "pointer";
		el.style.color = "#007bff";
		el.style.textDecoration = "underline";

		el.addEventListener("mouseover", () => el.style.color = "#0056b3");
		el.addEventListener("mouseout", () => el.style.color = "#007bff");

		el.addEventListener("click", (e) => {
			e.stopPropagation();
			e.preventDefault();
			
			if (elId === "pendingBLHPVCount" || elId === "pendingBLHPVBalance") {
				window.open("/ivcargo/PendingBLHPVLedgerReport.do?pageId=50&eventId=148&check=byPayBranch", "_blank");
				return;
			}

			window.open(`report.do?pageId=340&eventId=3&modulename=pendingBranchOperations&target=${elId}`, "_blank");
		});
	}
}

// ---------------- Loader Functions ----------------
function showCardLoader(flipCardId) {
	const card = document.getElementById(flipCardId);
	if (!card) return;

	const wrapper = card.querySelector('.second-row-card, .card');
	if (!wrapper) return;

	wrapper.classList.add("loading"); // HIDE CONTENT

	wrapper.style.position = 'relative';

	const oldLoader = wrapper.querySelector('.card-loader-overlay');
	if (oldLoader) oldLoader.remove();

	const overlay = document.createElement('div');
	overlay.className = 'card-loader-overlay';

	const spinner = document.createElement('div');
	spinner.className = 'loader-circle';

	const text = document.createElement('div');
	text.className = 'loader-text';
	text.innerText = 'Loading...';

	overlay.appendChild(spinner);
	overlay.appendChild(text);
	wrapper.appendChild(overlay);
}

function hideCardLoader(flipCardId) {
	const card = document.getElementById(flipCardId);
	if (!card) return;

	const wrapper = card.querySelector('.second-row-card, .card');
	if (!wrapper) return;

	wrapper.classList.remove("loading"); // SHOW CONTENT

	const overlay = wrapper.querySelector('.card-loader-overlay');
	if (overlay) overlay.remove();
}

// ---------------- Helper Functions ----------------
function formatIndianNumber(num) {
	const str = num.toString().split('.');
	let lastThree = str[0].slice(-3);
	let otherNumbers = str[0].slice(0, -3);
	if (otherNumbers !== '') lastThree = ',' + lastThree;
	const res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
	return str[1] ? res + '.' + str[1] : res;
}

function numberToWords(num, includeOnly = true) {
	const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 
			   'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 
			   'Seventeen', 'Eighteen', 'Nineteen'];
	const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

	if (num === 0) return 'Zero';

	num = Math.floor(num);

	const crore = Math.floor(num / 10000000);
	const lakh = Math.floor((num % 10000000) / 100000);
	const thousand = Math.floor((num % 100000) / 1000);
	const hundred = Math.floor((num % 1000) / 100);
	const rem = num % 100;

	let str = '';

	if (crore > 0) str += convertTwoDigit(crore) + ' Crore ';
	if (lakh > 0) str += convertTwoDigit(lakh) + ' Lakh ';
	if (thousand > 0) str += convertTwoDigit(thousand) + ' Thousand ';
	if (hundred > 0) str += a[hundred] + ' Hundred ';
	if (rem > 0) str += (str !== '' ? 'and ' : '') + convertTwoDigit(rem) + ' ';

	return str.trim() + (includeOnly ? ' Only' : '');

	function convertTwoDigit(n) {
		if (n < 20) return a[n];
		else {
			let ten = Math.floor(n / 10);
			let unit = n % 10;
			return b[ten] + (unit ? ' ' + a[unit] : '');
		}
	}
}



function setHoverInWords(elId, value, unit = '') {
	const el = document.getElementById(elId);
	if (!el) return;

	const roundedValue = Math.floor(value);
	const displayValue = formatIndianNumber(roundedValue);

	let text = '';
	if (unit.trim() === '₹') {
		text = numberToWords(roundedValue); // Keep "Only" for amount
	} else if (unit.trim() === 'kg') {
		text = displayValue + ' kg (' + numberToWords(roundedValue, false) + ' kg)'; // Remove "Only"
	} else if (unit.trim() === 'pcs') {
		text = displayValue + ' pcs (' + numberToWords(roundedValue, false) + ' Pieces)';
	} else if (unit.trim() === 'LRs') {
		text = displayValue + ' LRs (' + numberToWords(roundedValue, false) + ' LRs)';
	} else if (unit.trim() === 'Fund Transfers') {
		text = displayValue + ' Fund Transfers (' + numberToWords(roundedValue, false) + ' Fund Transfers)';
	} else {
		text = displayValue + (unit ? ' ' + unit : '');
	}

	// Remove existing tooltip if any
	let existingTooltip = document.querySelector(`#tooltip-${elId}`);
	if (existingTooltip) existingTooltip.remove();

	const tooltip = document.createElement('span');
	tooltip.id = `tooltip-${elId}`;
	tooltip.className = 'tooltip-text';
	tooltip.innerText = text;

	tooltip.style.position = 'fixed';
	tooltip.style.left = '0';
	tooltip.style.top = '0';
	tooltip.style.backgroundColor = 'rgba(0,0,0,0.8)';
	tooltip.style.color = '#fff';
	tooltip.style.padding = '6px 12px';
	tooltip.style.borderRadius = '6px';
	tooltip.style.fontSize = '0.85rem';
	tooltip.style.lineHeight = '1.3';
	tooltip.style.whiteSpace = 'normal';
	tooltip.style.maxWidth = '250px';
	tooltip.style.textAlign = 'center';
	tooltip.style.opacity = '0';
	tooltip.style.transition = 'opacity 0.2s, transform 0.2s';
	tooltip.style.pointerEvents = 'none';
	tooltip.style.zIndex = '9999';

	const arrow = document.createElement('span');
	arrow.style.position = 'absolute';
	arrow.style.left = '50%';
	arrow.style.transform = 'translateX(-50%)';
	arrow.style.borderWidth = '6px';
	arrow.style.borderStyle = 'solid';
	tooltip.appendChild(arrow);

	document.body.appendChild(tooltip);

	el.addEventListener('mouseover', () => {
		const rect = el.getBoundingClientRect();
		const ttRect = tooltip.getBoundingClientRect();
		const spaceAbove = rect.top;
		const spaceBelow = window.innerHeight - rect.bottom;

		let top;

		if (spaceAbove > ttRect.height + 10) {
			// Show above
			top = rect.top - ttRect.height - 10;
			arrow.style.top = '100%';
			arrow.style.borderColor = 'rgba(0,0,0,0.8) transparent transparent transparent';
		} else {
			// Show below
			top = rect.bottom + 10;
			arrow.style.top = '-12px';
			arrow.style.borderColor = 'transparent transparent rgba(0,0,0,0.8) transparent';
		}

		tooltip.style.top = `${top}px`;
		tooltip.style.left = `${rect.left + rect.width / 2}px`;
		tooltip.style.transform = 'translateX(-50%)';
		tooltip.style.opacity = '1';
	});

	el.addEventListener('mouseout', () => {
		tooltip.style.opacity = '0';
	});
}

function showNotAllowedMessage(elementId, cardId) {
	const el = document.getElementById(elementId);
	const card = document.getElementById(cardId);

	if (el) {
		el.innerHTML = '<span style="color:#c0392b; font-weight:bold; font-size:15px;">This widget is not applicable for your company</span>';
		el.style.cursor = "default";
		el.style.textDecoration = "none";
		el.style.color = "#c0392b";
	}

	if (card) {
		card.classList.add("no-flip");
		card.style.cursor = "not-allowed";

		card.className = card.className.replace(/flipped-\d/g, "");

		card.onclick = function(e) {
			e.stopPropagation();
			e.preventDefault();
			return false;
		};
	}

	// 🔥 Force hide loader AFTER DOM update
	requestAnimationFrame(() => hideCardLoader(cardId));
}

