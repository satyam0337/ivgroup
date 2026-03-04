/**
 * Anant 27-11-2025
 */
define([
	PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
],
	function(Selection) {
		let _thisPopulate1;
	return {
		createUI : function(response) {
			_thisPopulate1 = this;
			
			var elementConfiguration					= new Object();
			
			const container = document.getElementById("contentbox");
			container.innerHTML = ""; // clear old UI

			// Wrapper card
			const topCard = el("div", { class: "card mb-4 shadow-sm", id: "top-border-boxshadow" });

			const header = el("div", { class: "card-header text-center" });
			header.append(el("h4", { "data-selector": "header", class: "mb-0" }));
			topCard.append(header);

			const body = el("div", { class: "card-body", id: "ElementDiv" });

			// ----------------------------------------------
			// DATE ROW
			// ----------------------------------------------
			if(response.isCalenderSelection) {
				elementConfiguration.dateElement			= $('#dateEle');
				body.append(_thisPopulate1.date_panel());
			}

			// ----------------------------------------------
			// REGION / SUBREGION / BRANCH
			// ----------------------------------------------
			if(response.sourceAreaSelection) {
				elementConfiguration.regionElement			= $('#regionEle');
				elementConfiguration.subregionElement		= $('#subRegionEle');
				elementConfiguration.branchElement			= $('#branchEle');
								
				const row1 = el("div", { class: "row mb-3" });
				row1.append(_thisPopulate1.createField("region", "region", "Select Region", 'From Region'));
				row1.append(_thisPopulate1.createField("subRegion", "subRegion", "Select Sub-Region", 'From Sub-Region'));
				row1.append(_thisPopulate1.createField("branch", "branch", "Select Branch", 'From Branch'));
				body.append(row1);
			}

			// ----------------------------------------------
			// TO REGION / TO SUB REGION / TO BRANCH
			// ----------------------------------------------
			if(response.destinationAreaSelection) {
				elementConfiguration.destRegionElement		= $('#destRegionEle');
				elementConfiguration.destSubregionElement	= $('#destSubRegionEle');
				elementConfiguration.destBranchElement		= $('#destBranchEle');
								
				const row2 = el("div", { class: "row mb-3" });
				row2.append(_thisPopulate1.createField("toRegion", "destRegion", "Select Region", "To Region"));
				row2.append(_thisPopulate1.createField("toSubRegion", "destSubRegion", "Select Sub-Region", "To Sub-Region"));
				row2.append(_thisPopulate1.createField("toBranch", "destBranch", "Select Branch", 'To Branch'));
				body.append(row2);
			}
			
			response.elementConfiguration				= elementConfiguration;
			
			Selection.setSelectionToGetData(response);

			// ----------------------------------------------
			// SEARCH BUTTON
			// ----------------------------------------------
			body.append(_thisPopulate1.search_button());
			topCard.append(body);

			// ----------------------------------------------
			// RESULT CARD
			// ----------------------------------------------
			const resultCard = el("div", {
				class: "card shadow-sm d-none",
				id: "middle-border-boxshadow"
			});

			const resultHeader = el("div", { class: "card-header text-center" });
			resultHeader.append(el("h4", { "data-selector": "subHeader", class: "mb-0" }));
			resultCard.append(resultHeader);

			const resultBody = el("div", { class: "card-body" });
			resultBody.append(el("div", { id: "reportDetails" }));
			resultCard.append(resultBody);

			// ----------------------------------------------
			// APPEND BOTH CARDS TO MAIN CONTAINER
			// ----------------------------------------------
			container.append(topCard);
			container.append(resultCard);
			
			_thisPopulate1.showSelectionElement(response);
		}, createUI_BS3 : function(response) {
			_thisPopulate1 = this;
			
			const container = document.getElementById("contentbox");
			container.innerHTML = ""; // clear old UI
				
			var elementConfiguration					= new Object();

			// =======================
			// TOP PANEL (panel-info)
			// =======================
			const panelGroup = el_bs3("div", { class: "panel-group" });
			const panel = el_bs3("div", { class: "panel panel-info", id: "top-border-boxshadow" });

			// Header
			const panelHeading = el_bs3("div", { class: "panel-heading text-center" });
			panelHeading.append(el_bs3("h4", { "data-selector": "header" }, response.reportName));
			panel.append(panelHeading);

			// Body
			const panelBody = el_bs3("div", { class: "panel-body", id: "ElementDiv" });

			// =======================
			// DATE ROW
			// =======================
			if(response.isCalenderSelection) {
				elementConfiguration.dateElement			= $('#dateEle');
				panelBody.append(_thisPopulate1.date_panel_bs3());
			}

			// =======================
			// REGION / SUBREGION / BRANCH ROW
			// =======================
			if(response.sourceAreaSelection) {
				elementConfiguration.regionElement			= $('#regionEle');
				elementConfiguration.subregionElement		= $('#subRegionEle');
				elementConfiguration.branchElement			= $('#branchEle');
			
				const row1 = el_bs3("div", { class: "row", style: "padding-top:10px;" });
				row1.append(_thisPopulate1.createField_bs3("region", "region", "glyphicon-th", "Select Region", 'From Region'));
				row1.append(_thisPopulate1.createField_bs3("subRegion", "subRegion", "glyphicon-th", "Select Sub-Region", 'From Sub-Region'));
				row1.append(_thisPopulate1.createField_bs3("branch", "branch", "glyphicon-th", "Select Branch", 'From Branch'));
				panelBody.append(row1);
			}

			// =======================
			// TO REGION SETS
			// =======================
			if(response.destinationAreaSelection) {
				elementConfiguration.destRegionElement		= $('#destRegionEle');
				elementConfiguration.destSubregionElement	= $('#destSubRegionEle');
				elementConfiguration.destBranchElement		= $('#destBranchEle');
				
				const row2 = el_bs3("div", { class: "row", style: "padding-top:10px;" });
				row2.append(_thisPopulate1.createField_bs3("toRegion", "destRegion", "glyphicon-th", "Select Region", 'To Region'));
				row2.append(_thisPopulate1.createField_bs3("toSubRegion", "destSubRegion", "glyphicon-th", "Select Sub-Region", 'To Sub-Region'));
				row2.append(_thisPopulate1.createField_bs3("toBranch", "destBranch", "glyphicon-th", "Select Branch", 'To Branch'));
				panelBody.append(row2);
			}
			
			// =======================
			// SEARCH BUTTON ROW
			// =======================
			panelBody.append(_thisPopulate1.search_button_bs3());
			panel.append(panelBody);
			panelGroup.append(panel);

			// Append to main container
			container.append(panelGroup);

			// =======================
			// RESULT PANEL (panel-success)
			// =======================
			container.append(_thisPopulate1.resultPanel_bs3(response));
			
			_thisPopulate1.showSelectionElement(response);

			response.elementConfiguration		= elementConfiguration;
									
			setTimeout(function() {
				Selection.setSelectionToGetData(response);
			}, 5000);
		}, createField : function(labelId, attrName, placeholder, title) {
			// ----------------------------------------------
			// Function to build an input row (Region, Branch etc.)
			// ----------------------------------------------
				
			const col = el("div", { class: "col-5 d-none", "data-attribute": attrName });
			col.append(el("label", { class: "form-label" },
				`<span id="${labelId}" data-selector="${labelId}">${title}</span>`
			));

			const group = el("div", { class: "input-group" });
			group.append(el("span", { class: "input-group-text" }, `<i class="bi bi-grid"></i>`));
			group.append(el("input", {
				class: "form-control",
				type: "text",
				id: `${attrName}Ele`,
				name: `${attrName}Ele`,
				placeholder,
				"data-tooltip": placeholder
			}));

			col.append(group);
			return col;
		}, createField_bs3 : function(labelId, attrName, icon, placeholder, labelValue) {
			const col = el_bs3("div", {
				class: "col-xs-5 hide",
				"data-attribute": attrName
			});

			const label = el_bs3("label", { class: "col-xs-3" },
				`<span id="${labelId}" data-selector="${labelId}">${labelValue}</span>`
			);

			const wrap = el_bs3("div", { class: "col-xs-8 validation-message" });

			const inner = el_bs3("div", { class: "left-inner-addon" });
			inner.innerHTML = `
				<i class="glyphicon ${icon}"></i>
				<input class="form-control" type="text"
					name="${attrName}Ele"
					placeholder="${placeholder}"
					data-tooltip="${placeholder}"
					id="${attrName}Ele"/>
			`;

			wrap.append(inner);
			col.append(label);
			col.append(wrap);

			return col;
		}, date_panel : function() {
			const dateRow = el("div", { class: "row mb-3" });
			const dateCol = el("div", { class: "col-5", "data-attribute": "date" });

			dateCol.append(el("label", { class: "form-label" },
				`<span id="date" data-selector="date">Date</span>`
			));

			const dateGroup = el("div", { class: "input-group" });
			dateGroup.append(el("span", { class: "input-group-text" }, `<i class="bi bi-calendar-event"></i>`));

			dateGroup.append(el("input", {
				class: "form-control",
				type: "text",
				id: "dateEle",
				name: "dateEle",
				placeholder: "Select Date",
				"data-tooltip": "Date"
			}));

			dateCol.append(dateGroup);
			dateRow.append(dateCol);
			
			return dateRow;
		}, date_panel_bs3 : function() {
			const dateRow = el_bs3("div", { class: "row" });
			const dateCol = el_bs3("div", {
				class: "col-xs-5",
				"data-attribute": "date",
				style: "padding-top:10px;"
			});

			dateCol.append(
				el_bs3("label", { class: "col-xs-3" },
					`<span id="date" data-selector="date">Date: </span>`
				)
			);

			const dateWrap = el_bs3("div", { class: "col-xs-8 validation-message" });
			const dateInner = el_bs3("div", { class: "left-inner-addon" });

			dateInner.innerHTML = `
				<i class="glyphicon glyphicon-calendar"></i>
				<input class="form-control" type="text"
					name="dateEle"
					placeholder="Select Date"
					data-tooltip="Date"
					id="dateEle"/>
			`;

			dateWrap.append(dateInner);
			dateCol.append(dateWrap);
			dateRow.append(dateCol);
						
			return dateRow;
		}, search_button : function() {
			const btnRow = el("div", { class: "row mb-3" });
			const btnCol = el("div", { class: "col-8 ps-4" });

			const btn = el("button", {
				class: "btn btn-primary",
				id: "searchBtn",
				"data-tooltip": "Search"
			});

			btn.append(el("span", { "data-selector": "search" }));

			btnCol.append(btn);
			btnRow.append(btnCol);
						
			return btnRow;
		}, search_button_bs3 : function() {
			const btnRow = el_bs3("div", { class: "row", style: "padding-bottom:10px;" });
			const btnCol = el_bs3("div", { class: "col-xs-8", style: "padding-left:30px;" });

			const searchBtn = el_bs3("button", {
				class: "btn btn-primary",
				id: "searchBtn",
				"data-tooltip": "Search"
			});

			searchBtn.append(el_bs3("span", { "data-selector": "search" }, "Find"));
			btnCol.append(searchBtn);
			btnRow.append(btnCol);
				
			return btnRow;
		}, resultPanel_bs3 : function(response) {
			const resultGroup = el_bs3("div", { class: "panel-group" });
			const resultPanel = el_bs3("div", {
				class: "panel panel-success hide",
				id: "middle-border-boxshadow"
			});

			const resultHeading = el_bs3("div", { class: "panel-heading text-center" });
			resultHeading.append(
				el_bs3("h4", { "data-selector": "subHeader" }, response.reportName + " Details")
			);

			const resultBody = el_bs3("div", { class: "panel-body" });
			resultBody.append(el_bs3("div", { id: "reportDetails" }));

			resultPanel.append(resultHeading);
			resultPanel.append(resultBody);
			resultGroup.append(resultPanel);
							
			return resultGroup;
		}, showSelectionElement : function(response) {
			let keyObject = Object.keys(response);
														
			for (var i = 0; i < keyObject.length; i++) {
				if (response[keyObject[i]]) {
					$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
					$("*[data-attribute="+ keyObject[i]+ "]").removeClass("d-none");
				}
			}
		}
	}
})

// Helper function to create elements
const el = (tag, attrs = {}, html = "") => {
	const element = document.createElement(tag);
	
	Object.entries(attrs).forEach(([key, value]) => {
		if (key === "class") element.className = value;
		else element.setAttribute(key, value);
	});
	
	if (html) element.innerHTML = html;
	return element;
};
			
// Helper element creator
const el_bs3 = (tag, attrs = {}, html = "") => {
	const elem = document.createElement(tag);
	
	Object.entries(attrs).forEach(([k, v]) => elem.setAttribute(k, v));
	if (html) elem.innerHTML = html;
	return elem;
};