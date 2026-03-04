var _thisPopulate,
isPhysicalBranchesShow,
executive,
executiveType,
ExecutiveTypeConstant,
elementConfiguration,
optionsForDate,
executiveListByBranch,
isDisplaySuperAdmin 	= false,
AllOptionsForRegion  	= true,
AllOptionsForSubRegion  = true,
AllOptionsForBranch 	= true,
AllOptionForDestinationBranch	= false,
AllOptionForDestinationRegion	= true,
AllOptionsForDestSubRegion		= false,
allOptionsForOperationalBranch 	= false,
AllOptionInVehicleAgent 	= false,
AllOptionsForExecutive 	= false,
isDisplayDeActiveBranch	= true,
showAllExecutiveOfBranch	= false,
displayOnlyActiveUsers	= false,
isFromCashStatement		= false,
isGroupAdmin			= false,
isRegionAdmin			= false,
isSubRegionAdmin		= false,
isNormalUser			= false,
isOnChange				= false,
regionId				= 0,
subRegionId				= 0,
branchId				= 0,
paymentTypeId			= 0,
subRegionEle,
branchEle,
isOperationalDestBranchesShow	= false,
isOperationalBranchSelection	= false,
isToOperationalBranchSelection	= false,
dataFromDRServer				= false,
godownListByBranch = false,
multipleSourceBranchSelection = false,
multipleDestBranchSelection = false,
isLRTypeSelection	= false,
allOptionsForGroup	= false,
displayAllGroups	= false,
displayActiveGroups	= true,
vehicleAgentSelection = false,
crossingAgentSelectionWithSelectize = false,
getAgentWiseVehicleAutoComplete = true,
showAllOptionInAgent = false,
viewAllVehicle	= false, companyWiseStateAndBranchSelection = false, branchWithStateSelection = false, destinationBranchWithStateSelection = false,
AllOptionInPartyAutocomplete = false, isShowDeactivateParty = false, isSearchByAllParty = true, allOptionsInCollectionPerson = false, showOnlyAgentBranch = false,
isRegionOnGroupSelection = false, destinationCityWithStateSelection = false, sourceDestSubregionSelection = false,hideOwnVehicleNumbers	= false,
AllOptionForDivision = true, unifiedAreaSelection = false, unifiedToAreaSelection = false;

define([
		'selectizewrapper',
		'JsonUtility', 
		'autocomplete',
		'autocompleteWrapper',
		'nodvalidation',
		PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'], 
	function(Selectizewrapper) {
	return {
		setSelectionToGetData : function(response) {
			_thisPopulate = this;
			
			if(response.isGroupAdmin != undefined) isGroupAdmin	= response.isGroupAdmin;
			if(response.isRegionAdmin != undefined) isRegionAdmin = response.isRegionAdmin;
			if(response.isSubRegionAdmin != undefined) isSubRegionAdmin	= response.isSubRegionAdmin;
			if(response.isNormalUser != undefined) isNormalUser	= response.isNormalUser;
			if(response.getAgentWiseVehicleAutoComplete != undefined) getAgentWiseVehicleAutoComplete	= response.getAgentWiseVehicleAutoComplete;
			if(response.isRegionOnGroupSelection != undefined) isRegionOnGroupSelection	= response.isRegionOnGroupSelection;
			
			executive							= response.executive;
			executiveType						= response.executiveType;
			ExecutiveTypeConstant				= response.ExecutiveTypeConstant;
			let isCalenderSelection				= response.isCalenderSelection;
			let isCalenderForSingleDate			= response.isCalenderForSingleDate;
			isPhysicalBranchesShow				= response.isPhysicalBranchesShow;
			let isStockType						= response.stockType;
			let sourceAreaSelection				= response.sourceAreaSelection;
			let sourceRegionSubRegionForAllUser	= response.sourceRegionSubRegionForAllUser;
			let sourceAreaSelectionWithSelectize= response.sourceAreaSelectionWithSelectize;
			let destAreaSelectionWithSelectize	= response.destinationAreaSelectionWithSelectize;
			let allSelectionForAllExecutive		= response.allSelectionForAllExecutive;
			let destinationAreaSelection		= response.destinationAreaSelection;
			let destinationRegionSubregionSelection		= response.destinationRegionSubregionSelection;
			let sourceSubRegionBranchSelection	= response.sourceSubRegionBranchSelection;
			let destSubRegionBranchSelection	= response.destinationSubRegionBranchSelection;
			let cityWithStateSelection			= response.cityWithStateSelection;
			let countryWithCityAndStateSelection			= response.countryWithCityAndStateSelection;
				destinationCityWithStateSelection			= response.destinationCityWithStateSelection;
			let companyHeaderName							= response.companyHeaderName;
			let partySelection								= response.partySelection;
			let partySelectionWithoutSelectize				= response.partySelectionWithoutSelectize;
			let billingPartySelection						= response.billingPartySelection;
			let executiveListSelection						= response.executiveListSelection;
			let billingPartySelectionWithSelectize			= response.billingPartySelectionWithSelectize;
			let collectionPersonSelection		= response.collectionPersonSelection;
			let executiveTypeWiseCollectionPersonSelection	= response.executiveTypeWiseCollectionPersonSelection;
			let partyAgentNameSelection			= response.partyAgentNameSelection;
			let accountGroupSelection			= response.accountGroupSelection;
			let vehicleSelection				= response.vehicleSelection;
			let groupMergingVehicleSelection	= response.groupMergingVehicleSelection;
			let vehicleSelectionWithSelectize	= response.vehicleSelectionWithSelectize;
			optionsForDate						= response.optionsForDate;
			elementConfiguration				= response.elementConfiguration;
			let options							= response.options;
			let executiveTypeWiseBranch			= response.executiveTypeWiseBranch;
			let sourceStateSelection			= response.sourceStateSelection;
			let destStateSelection				= response.destStateSelection;
			let bankNameSelection				= response.bankNameSelection;
			let paymentTypeSelection			= response.paymentTypeSelection;
			let isThreeMonthsCalenderSelection	= response.isThreeMonthsCalenderSelection;
			let showMonthWiseDateSelection		= response.showMonthWiseDateSelection;
			let isSixMonthsCalenderSelection	= response.isSixMonthsCalenderSelection;
			let companySelection				= response.companySelection;
			let voucherTypeSelection			= response.voucherTypeSelection;
			let ledgerNameSelection				= response.ledgerNameSelection;
			if(response.sourceDestSubregionSelection != undefined) sourceDestSubregionSelection	= response.sourceDestSubregionSelection;
			let executiveWithBranchSelection	= response.executiveWithBranchSelection;
			let destinationBranchSelection		= response.destinationBranchSelection;
			let destinationBranchSelectionWithSelectize		= response.destinationBranchSelectionWithSelectize;
			let monthLimit						= response.monthLimit;
			executiveListByBranch				= response.executiveListByBranch;
			isOperationalDestBranchesShow		= response.isOperationalDestBranchesShow;
			let agentBranchSelection			= response.agentBranchSelection;
			godownListByBranch					= response.godownListByBranch;
			isLRTypeSelection					= response.isLRTypeSelection;
			vehicleAgentSelection				= response.vehicleAgentSelection;
			crossingAgentSelectionWithSelectize	= response.crossingAgentSelectionWithSelectize;
			companyWiseStateAndBranchSelection	= response.companyWiseStateAndBranchSelection;
			branchWithStateSelection			= response.branchWithStateSelection;
			destinationBranchWithStateSelection	= response.destinationBranchWithStateSelection;
			AllOptionInPartyAutocomplete		= response.AllOptionInPartyAutocomplete;
			unifiedAreaSelection				= response.unifiedAreaSelection;
			unifiedToAreaSelection				= response.unifiedToAreaSelection;
			
			if(response.isDisplayDeActiveBranch != undefined) isDisplayDeActiveBranch = response.isDisplayDeActiveBranch;
			if(response.isShowDeactivateParty != undefined) isShowDeactivateParty = response.isShowDeactivateParty;
			if(response.isSearchByAllParty != undefined) isSearchByAllParty	= response.isSearchByAllParty;
			if(response.isOperationalBranchSelection != undefined) isOperationalBranchSelection	= response.isOperationalBranchSelection;
			if(response.isToOperationalBranchSelection != undefined) isToOperationalBranchSelection	= response.isToOperationalBranchSelection;
			if(response.dataFromDRServer != undefined) dataFromDRServer	= response.dataFromDRServer;
			if(response.AllOptionsForRegion != undefined) AllOptionsForRegion = response.AllOptionsForRegion;
			if(response.AllOptionsForSubRegion != undefined) AllOptionsForSubRegion	= response.AllOptionsForSubRegion;
			if(response.AllOptionsForBranch != undefined) AllOptionsForBranch = response.AllOptionsForBranch;
			if(response.AllOptionForDestinationBranch != undefined) AllOptionForDestinationBranch = response.AllOptionForDestinationBranch;
			if(response.AllOptionForDestinationRegion != undefined) AllOptionForDestinationRegion = response.AllOptionForDestinationRegion;
			if(response.AllOptionsForDestSubRegion != undefined) AllOptionsForDestSubRegion	= response.AllOptionsForDestSubRegion;
			if(response.AllOptionsForOperationalBranch != undefined) allOptionsForOperationalBranch	= response.AllOptionsForOperationalBranch;
			if(response.AllOptionsForExecutive != undefined) AllOptionsForExecutive	= response.AllOptionsForExecutive;
			if(response.allOptionsForGroup != undefined) allOptionsForGroup	= response.allOptionsForGroup;
			if(response.displayAllGroups != undefined) displayAllGroups	= response.displayAllGroups;
			if(response.displayActiveGroups != undefined) displayActiveGroups = response.displayActiveGroups;
			if(response.showAllExecutiveOfBranch != undefined) showAllExecutiveOfBranch	= response.showAllExecutiveOfBranch;
			if(response.showAllOptionInAgent != undefined) showAllOptionInAgent = response.showAllOptionInAgent;
			if(response.displayOnlyActiveUsers != undefined) displayOnlyActiveUsers	= response.displayOnlyActiveUsers;
			if(response.viewAllVehicle != undefined) viewAllVehicle	= response.viewAllVehicle;
			if(response.AllOptionInVehicleAgent != undefined) AllOptionInVehicleAgent	= response.AllOptionInVehicleAgent;
			if(response.allOptionsInCollectionPerson != undefined) allOptionsInCollectionPerson	= response.allOptionsInCollectionPerson;
			if(response.showOnlyAgentBranch != undefined) showOnlyAgentBranch = response.showOnlyAgentBranch;
			if(response.AllOptionForDivision != undefined) AllOptionForDivision = response.AllOptionForDivision;
			if(response.hideOwnVehicleNumbers != undefined) hideOwnVehicleNumbers	= response.hideOwnVehicleNumbers;

			if(typeof options == 'undefined' || !options)
				options		= new Object();

			if(typeof isThreeMonthsCalenderSelection !== 'undefined' && isThreeMonthsCalenderSelection)
				options.threeMonthDateRange = true;
			
			if(typeof dataFromDRServer !== 'undefined' && dataFromDRServer)
				options.dataFromDRServer = true;

			if(typeof isSixMonthsCalenderSelection !== 'undefined' && isSixMonthsCalenderSelection)
				options.sixMonthDateRange = true;
				
			if(typeof showMonthWiseDateSelection !== 'undefined' && showMonthWiseDateSelection)
				options.showMonthWiseDateSelection = true;
				
			options.ThisYearDateRange 	 = typeof response.isCurrentYearCalenderSelection !== 'undefined' && response.isCurrentYearCalenderSelection;
			options.oneYearDateRange 	 = typeof response.isOneYearCalenderSelection !== 'undefined' && response.isOneYearCalenderSelection;
			options.twoYearDateRange 	 = typeof response.isTwoYearCalenderSelection !== 'undefined' && response.isTwoYearCalenderSelection;
			options.threeYearDateRange 	 = typeof response.isThreeYearCalenderSelection !== 'undefined' && response.isThreeYearCalenderSelection;
			options.fourYearDateRange 	 = typeof response.isFourYearCalenderSelection !== 'undefined' && response.isFourYearCalenderSelection;
			options.fiveYearDateRange 	 = typeof response.isFiveYearCalenderSelection !== 'undefined' && response.isFiveYearCalenderSelection;
			options.lastFinancialOneYear = typeof response.lastFinancialOneYear !== 'undefined' && response.lastFinancialOneYear;
			
			if(typeof response.minDate !== 'undefined' && response.minDate != '')
				options.minDate			= response.minDate;

			if(typeof response.maxDate !== 'undefined' && response.maxDate != '')
				options.maxDate			= response.maxDate;
			
			if (typeof response.startDate !== 'undefined' && response.startDate != '')
				options.startDate = response.startDate;

			if(typeof response.multipleSourceBranchSelection !== 'undefined')
				multipleSourceBranchSelection		= response.multipleSourceBranchSelection;
				
			if(typeof response.multipleDestBranchSelection !== 'undefined')
				multipleDestBranchSelection		= response.multipleDestBranchSelection;

			if(typeof monthLimit !== 'undefined' && monthLimit)
				options.monthLimit = response.monthLimit;
			
			if(typeof isCalenderSelection !== 'undefined' && isCalenderSelection) 
				$(elementConfiguration.dateElement).DatePickerCus(options);
			else if(typeof isCalenderForSingleDate !== 'undefined' && isCalenderForSingleDate)
				$(elementConfiguration.singleDateElement).SingleDatePickerCus(options);
			else if($('*[data-attribute=date]').length > 0)
				$(elementConfiguration.dateElement).DatePickerCus(options);
			
			if(typeof sourceAreaSelection !== 'undefined' && sourceAreaSelection) {
				if (executive.executiveType == EXECUTIVE_TYPE_GROUPADMIN || typeof allSelectionForAllExecutive !== 'undefined' && allSelectionForAllExecutive) {
					_thisPopulate.setAutocompleteInstanceOfRegion();
					_thisPopulate.setAutocompleteInstanceOfSubRegion();
					_thisPopulate.setAutocompleteInstanceOfBranch();
					
					if(typeof executiveListByBranch !== 'undefined' && executiveListByBranch)
						_thisPopulate.setAutocompleteInstanceOfExecutive(response);
						
					if(typeof godownListByBranch !== 'undefined' && godownListByBranch)
						_thisPopulate.setAutocompleteInstanceOfGodown();
					
					_thisPopulate.setRegion(response);
					_thisPopulate.setAllOptionInSubRegionBranch();
					_thisPopulate.setAllOptionInBranch();
					
					if(typeof executiveListByBranch !== 'undefined' && executiveListByBranch)
						_thisPopulate.setAllOptionInExecutive();
				} else if (executive.executiveType == EXECUTIVE_TYPE_REGIONADMIN) {
					$(elementConfiguration.regionElement).val(executive.regionId);
					_thisPopulate.setAutocompleteInstanceOfSubRegion();
					_thisPopulate.setAutocompleteInstanceOfBranch();

					if(typeof executiveListByBranch !== 'undefined' && executiveListByBranch)
						_thisPopulate.setAutocompleteInstanceOfExecutive(response);
						
					if(typeof godownListByBranch !== 'undefined' && godownListByBranch)
						_thisPopulate.setAutocompleteInstanceOfGodown();
					
					_thisPopulate.setSubRegion(response);
					_thisPopulate.setAllOptionInBranch();
					
					if(typeof executiveListByBranch !== 'undefined' && executiveListByBranch)
						_thisPopulate.setAllOptionInExecutive();
				} else if (executive.executiveType == EXECUTIVE_TYPE_SUBREGIONADMIN) {
					$(elementConfiguration.regionElement).val(executive.regionId);
					$(elementConfiguration.subregionElement).val(executive.subRegionId);
					_thisPopulate.setAutocompleteInstanceOfBranch();

					if(typeof executiveListByBranch !== 'undefined' && executiveListByBranch)
						_thisPopulate.setAutocompleteInstanceOfExecutive(response);
						
					if(typeof godownListByBranch !== 'undefined' && godownListByBranch)
						_thisPopulate.setAutocompleteInstanceOfGodown();
					
					_thisPopulate.setBranch(response);
					
					if(typeof executiveListByBranch !== 'undefined' && executiveListByBranch)
						_thisPopulate.setAllOptionInExecutive();
				} else if(executive.executiveType == EXECUTIVE_TYPE_BRANCHADMIN) {
					if(typeof executiveListByBranch !== 'undefined' && executiveListByBranch) {
						_thisPopulate.setAutocompleteInstanceOfExecutive(response);
						_thisPopulate.setExecutive(response);
					}
						
					if(typeof godownListByBranch !== 'undefined' && godownListByBranch) {
						_thisPopulate.setAutocompleteInstanceOfGodown();
						_thisPopulate.setGodown(response);
					}
						
					$(elementConfiguration.regionElement).val(executive.regionId);
					$(elementConfiguration.subregionElement).val(executive.subRegionId);
					$(elementConfiguration.branchElement).val(executive.branchId);
				} else if (executive.executiveType == EXECUTIVE_TYPE_EXECUTIVE) {
					$(elementConfiguration.regionElement).val(executive.regionId);
					$(elementConfiguration.subregionElement).val(executive.subRegionId);
					$(elementConfiguration.branchElement).val(executive.branchId);
				}
			} 
			
			if(typeof sourceAreaSelectionWithSelectize !== 'undefined' && sourceAreaSelectionWithSelectize) {
				if(sourceRegionSubRegionForAllUser || executiveType == EXECUTIVE_TYPE_GROUPADMIN)
					_thisPopulate.setRegionOptionWithSelectize(response);
				else if (executiveType == EXECUTIVE_TYPE_REGIONADMIN)
					_thisPopulate.setSubRegionOptionWithSelectize(response);
				else if (executiveType == EXECUTIVE_TYPE_SUBREGIONADMIN)
					_thisPopulate.setBranchOptionWithSelectize(response);
				else if(isOperationalBranchSelection && (executiveType == EXECUTIVE_TYPE_BRANCHADMIN || executiveType == EXECUTIVE_TYPE_EXECUTIVE))
					_thisPopulate.setOperationalBranchOptionWithSelectize(response);
			}
			
			if(typeof destAreaSelectionWithSelectize !== 'undefined' && destAreaSelectionWithSelectize)
				_thisPopulate.setDestRegionOptionWithSelectize(response);
			
			if(typeof destinationAreaSelection !== 'undefined' && destinationAreaSelection) {
				_thisPopulate.setAutocompleteInstanceOfDestRegion();
				_thisPopulate.setAutocompleteInstanceOfDestSubRegion();
				_thisPopulate.setAutocompleteInstanceOfDestBranch();
				_thisPopulate.setDestRegion(response);
				_thisPopulate.setAllOptionInDestSubRegionBranch();
				_thisPopulate.setAllOptionInDestBranch();
			}
			
			if(typeof destinationRegionSubregionSelection !== 'undefined' && destinationRegionSubregionSelection) {
				_thisPopulate.setAutocompleteInstanceOfDestRegion();
				_thisPopulate.setAutocompleteInstanceOfDestSubRegion();
				_thisPopulate.setDestRegion(response);
			}
			
			if(typeof executiveTypeWiseBranch !== 'undefined' && executiveTypeWiseBranch) {
				if(typeof response.branchList !== 'undefined' && response.branchList !== 'undefined') {
					_thisPopulate.setAutocompleteInstanceOfBranch();
					_thisPopulate.setBranch(response);
				} else
					_thisPopulate.setExecutiveWiseBranchAutocompleteWithSelectize();
			}
			
			if(typeof sourceStateSelection !== 'undefined' && sourceStateSelection) {
				_thisPopulate.setAutocompleteInstanceOfSrcState();
				_thisPopulate.setSrcState(response);
			}
			
			if(typeof destStateSelection !== 'undefined' && destStateSelection) {
				_thisPopulate.setAutocompleteInstanceOfDestState();
				_thisPopulate.setDestState(response);
			}
			
			if(partySelection !== 'undefined' && partySelection)
				_thisPopulate.setPartyList(response);
				
			if(partySelectionWithoutSelectize !== 'undefined' && partySelectionWithoutSelectize)
				_thisPopulate.setPartyAutocomplete(elementConfiguration);
				
			if(billingPartySelection !== 'undefined' && billingPartySelection)
				_thisPopulate.setBillingPartyAutocomplete(elementConfiguration);
				
			if(billingPartySelectionWithSelectize !== 'undefined' && billingPartySelectionWithSelectize)
				_thisPopulate.setBillingPartySelection(elementConfiguration);
			
			if(typeof accountGroupSelection !== 'undefined' && accountGroupSelection)
				_thisPopulate.setAccountGroupList(response);
				
			if(typeof collectionPersonSelection !== 'undefined' && collectionPersonSelection)
				_thisPopulate.setCollectionPersonAutocomplete();
				
			if(typeof executiveTypeWiseCollectionPersonSelection !== 'undefined' && executiveTypeWiseCollectionPersonSelection)
				_thisPopulate.setExecutiveTypeWiseCollectionPersonAutocomplete();
				
			if(typeof executiveListSelection !== 'undefined' && executiveListSelection)
				_thisPopulate.setAutocompleteInstanceOfExecutive(response);
				
			if(typeof partyAgentNameSelection !== 'undefined' && partyAgentNameSelection)
				_thisPopulate.setPartyAgentNameAutocomplete();
			
			if(typeof isStockType !== 'undefined' && isStockType) {
				_thisPopulate.setStockTypeInstance();
				_thisPopulate.setStockType(response);
			}
			
			if(typeof companyHeaderName !== 'undefined' && companyHeaderName)
				_thisPopulate.setCompanyHeaderName(response);
				
			if(typeof companyWiseStateAndBranchSelection !== 'undefined' && companyWiseStateAndBranchSelection) {
				_thisPopulate.setAutocompleteInstanceOfCompanyName();
				_thisPopulate.setAutocompleteInstanceOfSrcState();
				_thisPopulate.setAutocompleteInstanceOfBranch();
				_thisPopulate.setCompanyHeadName(response);
			} else if(typeof branchWithStateSelection !== 'undefined' && branchWithStateSelection) {
				_thisPopulate.setAutocompleteInstanceOfSrcState();
				_thisPopulate.setAutocompleteInstanceOfBranch();
				_thisPopulate.setSrcState(response);
			}
			
			if(typeof destinationBranchWithStateSelection !== 'undefined' && destinationBranchWithStateSelection) {
				_thisPopulate.setAutocompleteInstanceOfDestState();
				_thisPopulate.setAutocompleteInstanceOfDestBranch();
				_thisPopulate.setDestState(response);
			}
			
			if(typeof vehicleSelection !== 'undefined' && vehicleSelection) {
				_thisPopulate.setAutocompleteInstanceOfVehicle(response);
				
				if(response.vehicleNumberMaster != undefined)
					_thisPopulate.setVehicle(response);
			}
			
			if(typeof groupMergingVehicleSelection !== 'undefined' && groupMergingVehicleSelection)
				_thisPopulate.setSelectizeOfGroupMergingVehicle();
			
			if(typeof bankNameSelection !== 'undefined' && bankNameSelection) {
				if(response.bankList != undefined) {
					_thisPopulate.setAutocompleteInstanceOfBankName();
					_thisPopulate.setBankName(response);
				} else
					_thisPopulate.setBankNameSelection();
			}
			
			if(typeof paymentTypeSelection !== 'undefined' && paymentTypeSelection) {
				_thisPopulate.setAutocompleteInstanceOfPaymentType();
				_thisPopulate.setPaymentType(response);
			}
			
			if(typeof companySelection !== 'undefined' && companySelection) {
				_thisPopulate.setAutocompleteInstanceOfCompany();
				_thisPopulate.setCompany(response);
			}
			
			if(typeof voucherTypeSelection !== 'undefined' && voucherTypeSelection) {
				_thisPopulate.setAutocompleteInstanceOfVoucherType();
				_thisPopulate.setVoucherType(response);
			}
			
			if(typeof ledgerNameSelection !== 'undefined' && ledgerNameSelection) {
				_thisPopulate.setAutocompleteInstanceOfLedgerName();
				_thisPopulate.setLedgerName(response);
			}

			if(typeof countryWithCityAndStateSelection !== 'undefined' && countryWithCityAndStateSelection) {
				_thisPopulate.setAutocompleteInstanceOfCountry();
				_thisPopulate.setAutocompleteInstanceOfState();
				_thisPopulate.setAutocompleteInstanceOfCity();
				_thisPopulate.setCountry(response);
			} else if(typeof cityWithStateSelection !== 'undefined' && cityWithStateSelection) {
				_thisPopulate.setAutocompleteInstanceOfState();
				_thisPopulate.setAutocompleteInstanceOfCity();
				_thisPopulate.setState(response);
			}
			
			if(typeof destinationCityWithStateSelection !== 'undefined' && destinationCityWithStateSelection) {
				_thisPopulate.setAutocompleteInstanceOfDestState();
				_thisPopulate.setAutocompleteInstanceOfDestCity();
				_thisPopulate.setDestState(response);
			}
			
			if(sourceDestSubregionSelection) {
				_thisPopulate.setAutocompleteInstanceOfSrcSubRegion();
				_thisPopulate.setAutocompleteInstanceOfDestSubRegion();
				_thisPopulate.setSrcSubRegion(response);
				_thisPopulate.setDestSubRegion(response);
			}
			
			if(unifiedAreaSelection != undefined && unifiedAreaSelection && response.unifiedAreaList != undefined) {
				_thisPopulate.setAutocompleteInstanceOfUnifiedArea();
				_thisPopulate.setUnifiedArea(response);
			}
			
			if(unifiedToAreaSelection != undefined && unifiedToAreaSelection) {
				_thisPopulate.setAutocompleteInstanceOfUnifiedToArea();
				_thisPopulate.setUnifiedToArea(response);
			}
			
			if(typeof executiveWithBranchSelection !== 'undefined' && executiveWithBranchSelection
					&& (typeof sourceAreaSelection == 'undefined' || !sourceAreaSelection)) {
				_thisPopulate.setAutocompleteInstanceOfBranch();
				_thisPopulate.setAutocompleteInstanceOfExecutive(response);
				_thisPopulate.setBranch(response);
			}
			
			if(typeof destinationBranchSelection != 'undefined' && destinationBranchSelection) {
				_thisPopulate.setAutocompleteInstanceOfDestBranch();
				_thisPopulate.setDestinationBranch(response);
			}
			
			if(typeof destinationBranchSelectionWithSelectize != 'undefined' && destinationBranchSelectionWithSelectize)
				_thisPopulate.setDestBranchOptionWithSelectize(response);
			
			if(typeof response.isDisplaySuperAdmin !== 'undefined' && response.isDisplaySuperAdmin)
				isDisplaySuperAdmin 	= response.isDisplaySuperAdmin;
			
			if(typeof agentBranchSelection !== 'undefined' && agentBranchSelection)
				_thisPopulate.setAgentBranches(response);
				
			if(typeof isLRTypeSelection !== 'undefined' && isLRTypeSelection) {
				_thisPopulate.setAutocompleteInstanceOfLRType();
				_thisPopulate.setLRTypes(response);
			}
			
			if(typeof response.transportationModeList !== 'undefined' && response.transportationModeList) {
				_thisPopulate.setAutocompleteInstanceOfTransportationMode();
				_thisPopulate.setTransportationMode(response);
			}
			
			if(typeof sourceSubRegionBranchSelection !== 'undefined' && sourceSubRegionBranchSelection) {
				_thisPopulate.setAutocompleteInstanceOfSubRegion();
				_thisPopulate.setAutocompleteInstanceOfBranch();
				_thisPopulate.setSubRegion(response);
				_thisPopulate.setAllOptionInBranch();
			}
			
			if(typeof destSubRegionBranchSelection !== 'undefined' && destSubRegionBranchSelection) {
				_thisPopulate.setAutocompleteInstanceOfDestSubRegion();
				_thisPopulate.setAutocompleteInstanceOfDestBranch();
				
				if(isToOperationalBranchSelection)
					_thisPopulate.setAutocompleteInstanceOfToOperationalBranch();	
				
				_thisPopulate.setDestSubRegion(response);
				_thisPopulate.setAllOptionInDestBranch();
			}
			
			if(typeof vehicleAgentSelection !== 'undefined' && vehicleAgentSelection)
				_thisPopulate.setVehicleAgent();
			
			if(typeof response.vehicleTypeSelection !== 'undefined' && response.vehicleTypeSelection)
				_thisPopulate.setVehicleType(response);
			
			if(typeof vehicleSelectionWithSelectize !== 'undefined' && vehicleSelectionWithSelectize)
				_thisPopulate.setVehicleAutocompleteWithSelectize(response);
				
			if(typeof crossingAgentSelectionWithSelectize !== 'undefined' && crossingAgentSelectionWithSelectize)
				_thisPopulate.setCrossingAgentWithSelectize();
			
			if(response.businessType !== 'undefined' && response.businessType && response.businessTypeList != undefined)
				_thisPopulate.setBusinessType(response);
			
			if(typeof response.chargeTypeList !== 'undefined')	
				_thisPopulate.setChargeTypeSection(response);
				
			if(typeof response.bookingCharges !== 'undefined')
				_thisPopulate.setBookingCharges(response);
				
			if(typeof response.packingTypeForGroupList !== 'undefined')
				_thisPopulate.setPackingTypeForGroups(response);
			
			if(typeof response.lrType !== 'undefined' && response.lrType && response.wayBillTypeList != undefined)
				_thisPopulate.setLRTypeSelectionWithSelectize(response);
				
			if(typeof response.cftUnit !== 'undefined' && response.cftUnit && response.cftUnitList != undefined)
				_thisPopulate.setUnitTypeSelection(response);
			
			if(typeof response.bookingTypeList !== 'undefined')
				_thisPopulate.setBookingTypeSelection(response);
				
			if(typeof response.billSelectionList !== 'undefined')
				_thisPopulate.setBillSelection(response);
				
			if(typeof response.hamalTeamLeaderSelection !== 'undefined' && response.hamalTeamLeaderSelection)
				_thisPopulate.setHamalTeamLeader(response);
			
			if(typeof response.crossingAgentSrcSelection !== 'undefined' && response.crossingAgentSrcSelection)
				_thisPopulate.setCrossingAgentSourceAutocomplete(response);
			
			if(typeof response.divisionSelection !== 'undefined' && response.divisionSelection)
				_thisPopulate.setDivisionList(response);
			
			if(typeof response.serviceTypeSelection !== 'undefined' && response.serviceTypeSelection)
				_thisPopulate.setServiceTypeSelectionList();
				
			if(typeof response.vendorNameSelection !== 'undefined' && response.vendorNameSelection)
				_thisPopulate.setVendorNameAutocomplete();		
			
			if(typeof response.isPackingTypeSelection !== 'undefined' && response.isPackingTypeSelection)
				_thisPopulate.setPackingTypeAutocomplete(response);		
		}, setAutocompleteInstanceOfRegion : function() {
			let regionAutoComplete 				= new Object();
			regionAutoComplete.primary_key 		= 'regionId';
			regionAutoComplete.callBack 		= _thisPopulate.setSubregionOnRegionSelect;
			regionAutoComplete.field 			= 'regionName';
			$(elementConfiguration.regionElement).autocompleteCustom(regionAutoComplete);
		}, setAutocompleteInstanceOfSubRegion : function() {
			let subRegionAutoComplete 			= new Object();
			subRegionAutoComplete.primary_key 	= 'subRegionId';
			subRegionAutoComplete.callBack 		= _thisPopulate.setBranchOnSubRegionSelect;
			subRegionAutoComplete.field 		= 'subRegionName';
			$(elementConfiguration.subregionElement).autocompleteCustom(subRegionAutoComplete);
		}, setAutocompleteInstanceOfBranch : function() {
			let branchAutoComplete 				= new Object();
			branchAutoComplete.primary_key 		= 'branchId';
			
			if(typeof executiveListByBranch !== 'undefined' && executiveListByBranch)
				branchAutoComplete.callBack		= _thisPopulate.setExecutiveOnBranchSelect;
			else if(typeof godownListByBranch !== 'undefined' && godownListByBranch)
				branchAutoComplete.callBack		= _thisPopulate.setGodownOnBranchSelect;
			
			branchAutoComplete.field 			= 'branchName';
			
			$(elementConfiguration.branchElement).autocompleteCustom(branchAutoComplete);
		}, setAutocompleteInstanceOfSrcState : function() {
			let srcStateAutoComplete 			= new Object();
			srcStateAutoComplete.primary_key 	= 'stateId';
			srcStateAutoComplete.field 			= 'stateName';
			
			if(typeof branchWithStateSelection !== 'undefined' && branchWithStateSelection 
				|| typeof companyWiseStateAndBranchSelection !== 'undefined' && companyWiseStateAndBranchSelection)
				srcStateAutoComplete.callBack		= _thisPopulate.setSrcBranchesOnStateSeletion;
			
			$(elementConfiguration.srcStateElement).autocompleteCustom(srcStateAutoComplete);
		}, setAutocompleteInstanceOfDestState : function() {
			let destStateAutoComplete 			= new Object();
			destStateAutoComplete.primary_key 	= 'stateId';
			destStateAutoComplete.field 		= 'stateName';
			
			if(typeof destinationBranchWithStateSelection !== 'undefined' && destinationBranchWithStateSelection)
				destStateAutoComplete.callBack		= _thisPopulate.setDestBranchesOnDestStateSeletion;
			else if(typeof destinationCityWithStateSelection !== 'undefined' && destinationCityWithStateSelection)
				destStateAutoComplete.callBack		= _thisPopulate.setDestCityOnStateSelect;
			
			$(elementConfiguration.destStateElement).autocompleteCustom(destStateAutoComplete);
		}, setRegion : function(response) {
			let regionList	= response.regionList;
			
			if(!AllOptionsForRegion && regionList != undefined)
				regionList 	= regionList.filter(function (el) {return el.regionId != -1;});
			
			let autoRegionName		= $(elementConfiguration.regionElement).getInstance();
			
			$(autoRegionName).each(function() {
				this.option.source 	= regionList;
			});
		}, setSubRegion : function(response) {
			let subRegionList	= response.subRegionList;
			
			if(!AllOptionsForSubRegion && subRegionList != undefined)
				subRegionList 	= subRegionList.filter(function (el) {return el.subRegionId != -1;});
			
			let autoSubRegionName		= $(elementConfiguration.subregionElement).getInstance();
			
			$(autoSubRegionName).each(function() {
				this.option.source 	= subRegionList;
			});
		}, setBranch : function(response) {
			let branchList	= response.branchList;
				
			if(!AllOptionsForBranch && branchList != undefined)
				branchList 	= branchList.filter(function (el) {return el.branchId != -1;});
				
			let autoBranchName 		= $(elementConfiguration.branchElement).getInstance();

			$(autoBranchName).each(function() {
				this.option.source 	= branchList;
			});
			
			_thisPopulate.setBranchGSTN(response.branchGSTN);
		}, setDestinationBranch : function(response) {
			let branchList	= response.branchList;
				
			if(!AllOptionForDestinationBranch && branchList != undefined)
				branchList 	= branchList.filter(function (el) {return el.branchId != -1;});
				
			let autoBranchName 		= $(elementConfiguration.destBranchElement).getInstance();

			$(autoBranchName).each(function() {
				this.option.source 	= branchList;
			});
		}, setExecutiveWiseBranchAutocompleteWithSelectize : function() {
			if($('#branchEle').length) {
				Selectizewrapper.setAutocomplete({
					url				: 	WEB_SERVICE_URL+'/selectOptionsWS/getExecutiveTypeWiseAllActiveBranches.do?',
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'branchEle',
					responseObjectKey : 'branch',
					create			: 	false,
					maxItems		: 	1
				});
			}
		}, setSrcState : function(response) {
			let srcAutoStateName 	= $(elementConfiguration.srcStateElement).getInstance();

			$(srcAutoStateName).each(function() {
				this.option.source 	= response.stateList;
			});
		}, setDestState : function(response) {
			if(response.stateList == undefined) return;
			
			let toAutoStateName 	= $(elementConfiguration.destStateElement).getInstance();

			$(toAutoStateName).each(function() {
				this.option.source 	= response.stateList;
			});
		}, setSubregionOnRegionSelect : function(regionId) {
			let jsonArray = new Array();
			jsonArray.push(elementConfiguration.subregionElement);
			jsonArray.push(elementConfiguration.branchElement);
			_thisPopulate.resetAutcomplete(jsonArray);
			
			let jsonObject = new Object();
			
			if(isFromCashStatement)
				jsonObject.regionSelectEle_primary_key 	   = regionId;
			else
				jsonObject.regionSelectEle_primary_key = $("#" + $(this).attr("id") + "_primary_key").val();
			
			if(isRegionOnGroupSelection && $('#accountGroupEle').val() > 0)
				jsonObject.accountGroupId	= $('#accountGroupEle').val();

			jsonObject.AllOptionsForSubRegion 	   = AllOptionsForSubRegion;
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/selectOptionsWS/getSubRegionOption.do', _thisPopulate.setSubRegionOnRegion, EXECUTE_WITHOUT_ERROR);
		}, setSubRegionOnRegion : function(response) {
			let autoSubRegionName = $(elementConfiguration.subregionElement).getInstance();
			let subRegionArr	  = response.subRegion;
			
			if(isFromCashStatement && ((isGroupAdmin || isRegionAdmin) && subRegionArr != undefined && subRegionArr.length > 0)) {
				let arr	= subRegionArr.filter(function(e) { return e.subRegionId == subRegionId;});
					
				if(arr.length > 0)
					subRegionEle.val(arr[0].subRegionName);
			}
			
			$(autoSubRegionName).each(function() {
				this.option.source = subRegionArr;
			});
		}, setBranchOnSubRegionSelect : function(subRegionId) {
			let jsonArray = new Array();
			jsonArray.push(elementConfiguration.branchElement);
			_thisPopulate.resetAutcomplete(jsonArray);
			
			if($('#isExcludeOperationalBranch').exists())
				isPhysicalBranchesShow		=  $('#isExcludeOperationalBranch').is(':checked');
			
			let jsonObject = new Object();
					
			if(isFromCashStatement)
				jsonObject.subRegionSelectEle_primary_key = subRegionId;
			else
				jsonObject.subRegionSelectEle_primary_key = $("#" + $(this).attr("id") + "_primary_key").val();
					
			jsonObject.AllOptionsForBranch 			= AllOptionsForBranch;
			jsonObject.isDisplayDeActiveBranch		= isDisplayDeActiveBranch;
			jsonObject.showOnlyAgentBranch			= showOnlyAgentBranch;
			
			if(isRegionOnGroupSelection && $('#accountGroupEle').val() > 0)
				jsonObject.accountGroupId	= $('#accountGroupEle').val();

			if(typeof isPhysicalBranchesShow !== 'undefined' && isPhysicalBranchesShow)
				getJSON(jsonObject,	WEB_SERVICE_URL + '/selectOptionsWS/getPhysicalBranchOption.do', _thisPopulate.setBranchesOnSubregion, EXECUTE_WITHOUT_ERROR);
			else
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/selectOptionsWS/getBranchOption.do', _thisPopulate.setBranchesOnSubregion, EXECUTE_WITH_ERROR);
		}, setBranchesOnSubregion : function(response) {
			let autoBranchName = $(elementConfiguration.branchElement).getInstance();
			let branchArr	   = response.sourceBranch;
			
			if(isFromCashStatement && branchArr != undefined) {
				let arr	= branchArr.filter(function(e) {return e.branchId == branchId;});
				
				if(arr.length > 0) {
					if(isNormalUser)
						branchEle.val(branchId);
					else
						branchEle.val(arr[0].branchName);
				}
			}
			
			$(autoBranchName).each(function() {
				this.option.source = branchArr;
			});
		}, setAutocompleteInstanceOfDestRegion : function() {
			let regionAutoComplete 				= new Object();
			regionAutoComplete.primary_key 		= 'regionId';
			regionAutoComplete.callBack 		= _thisPopulate.setDestSubregionOnDestRegionSelect;
			regionAutoComplete.field 			= 'regionName';
			$(elementConfiguration.destRegionElement).autocompleteCustom(regionAutoComplete);
		}, setAutocompleteInstanceOfDestSubRegion : function() {
			let subRegionAutoComplete 			= new Object();
			subRegionAutoComplete.primary_key 	= 'subRegionId';
			subRegionAutoComplete.callBack 		= _thisPopulate.setDestBranchOnDestSubRegionSelect;
			subRegionAutoComplete.field 		= 'subRegionName';
			$(elementConfiguration.destSubregionElement).autocompleteCustom(subRegionAutoComplete);
		}, setAutocompleteInstanceOfDestBranch : function() {
			let branchAutoComplete 				= new Object();
			branchAutoComplete.primary_key 		= 'branchId';
			branchAutoComplete.field 			= 'branchName';
			
			if(isToOperationalBranchSelection)
				branchAutoComplete.callBack 		= _thisPopulate.setDestOperationalBranchOnDestBranchSelect;
				
			$(elementConfiguration.destBranchElement).autocompleteCustom(branchAutoComplete);
		}, setAutocompleteInstanceOfToOperationalBranch : function() {
			let branchAutoComplete 				= new Object();
			branchAutoComplete.primary_key 		= 'branchId';
			branchAutoComplete.field 			= 'branchName';
			$(elementConfiguration.destOperationalBranchElement).autocompleteCustom(branchAutoComplete);
		}, setDestRegion : function(response) {
			let autoRegionName		= $(elementConfiguration.destRegionElement).getInstance();
			
			let regionList	= response.regionList;
				
			if(!AllOptionForDestinationRegion && regionList != undefined)
				regionList 	= regionList.filter(function (el) {return el.regionId != -1;});
			
			$(autoRegionName).each(function() {
				this.option.source 	= regionList;
			});
		}, setAutocompleteInstanceOfSrcSubRegion : function() {
			let srcSubRegionAutoComplete 			= new Object();
			srcSubRegionAutoComplete.primary_key 	= 'subRegionId';
			srcSubRegionAutoComplete.field 			= 'subRegionName';
			$(elementConfiguration.srcSubRegionElement).autocompleteCustom(srcSubRegionAutoComplete);
		}, setDestSubregionOnDestRegionSelect : function() {
			let jsonArray = new Array();
			jsonArray.push(elementConfiguration.destSubregionElement);
			jsonArray.push(elementConfiguration.destBranchElement);
			_thisPopulate.resetAutcomplete(jsonArray);
			
			let regionId = $("#" + $(this).attr("id") + "_primary_key").val();
			
			if(regionId == undefined || regionId == 0) return;
			
			let jsonObject = new Object();
			jsonObject.regionSelectEle_primary_key = regionId;
			jsonObject.AllOptionsForSubRegion 	   = AllOptionsForDestSubRegion;
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/selectOptionsWS/getSubRegionOption.do', _thisPopulate.setDestSubRegionOnDestRegion,EXECUTE_WITHOUT_ERROR);
		}, setDestSubRegionOnDestRegion : function(response) {
			let autoSubRegionName = $(elementConfiguration.destSubregionElement).getInstance();

			$(autoSubRegionName).each(function() {
				this.option.source = response.subRegion;
			});
		}, setDestBranchOnDestSubRegionSelect : function() {
			if(sourceDestSubregionSelection)
				return;
			
			let jsonArray = new Array();
			jsonArray.push(elementConfiguration.destBranchElement);
			
			if(isToOperationalBranchSelection)
				jsonArray.push(elementConfiguration.destOperationalBranchElement);
				
			_thisPopulate.resetAutcomplete(jsonArray);
			
			let subRegionId = $("#" + $(this).attr("id") + "_primary_key").val();
			
			if(subRegionId == undefined || subRegionId == 0) return;
			
			let jsonObject = new Object();
			jsonObject.subRegionSelectEle_primary_key 	= subRegionId;
			jsonObject.AllOptionsForBranch 				= AllOptionForDestinationBranch;
				
			if(typeof isPhysicalBranchesShow !== 'undefined' && isPhysicalBranchesShow) {
				if(typeof isOperationalDestBranchesShow !== 'undefined' && isOperationalDestBranchesShow)
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/selectOptionsWS/getDestPhysicalAndOperationalBranchOption.do', _thisPopulate.setDestBranchesOnDestSubregion, EXECUTE_WITHOUT_ERROR);
				else
					getJSON(jsonObject,	WEB_SERVICE_URL + '/selectOptionsWS/getPhysicalBranchOption.do', _thisPopulate.setDestBranchesOnDestSubregion, EXECUTE_WITHOUT_ERROR);
			} else
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/selectOptionsWS/getBranchOption.do', _thisPopulate.setDestBranchesOnDestSubregion, EXECUTE_WITHOUT_ERROR);
		}, setDestBranchesOnDestSubregion : function(response) {
			let autoBranchName = $(elementConfiguration.destBranchElement).getInstance();

			$(autoBranchName).each(function() {
				this.option.source = response.sourceBranch;
			});
		}, setDestOperationalBranchOnDestBranchSelect : function() {
			let jsonArray = new Array();
			jsonArray.push(elementConfiguration.destOperationalBranchElement);
			_thisPopulate.resetAutcomplete(jsonArray);
			
			let areaBranchId = $("#" + $(this).attr("id") + "_primary_key").val();
			
			if(areaBranchId == undefined || areaBranchId == 0) return;
			
			let jsonObject = new Object();
			jsonObject.areaBranchId 	= areaBranchId;
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/selectOptionsWS/getOperationalBranchOption.do', _thisPopulate.setDestOperationalBranchesOnDestBranch, EXECUTE_WITHOUT_ERROR);
		}, setDestOperationalBranchesOnDestBranch : function(response) {
			let autoBranchName = $(elementConfiguration.destOperationalBranchElement).getInstance();

			$(autoBranchName).each(function() {
				this.option.source = response.branchModelArr;
			});
		}, setStockTypeInstance : function() {
			let autoStockTypeName 			= new Object();
			autoStockTypeName.primary_key 	= 'stockTypeId';
			autoStockTypeName.field 		= 'stockTypeName';

			$(elementConfiguration.stockTypeElement).autocompleteCustom(autoStockTypeName);
		}, setStockType : function(response) {
			let autoStockTypeName 		= $(elementConfiguration.stockTypeElement).getInstance();

			$(autoStockTypeName).each(function() {
				this.option.source 	= response.STOCKTYPE;
			});
		}, setCompanyHeaderName : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.companyHeadMasterArr,
				valueField		:	'companyHeadMasterId',
				labelField		:	'companyHeadName',
				searchField		:	'companyHeadName',
				elementId		:	'companyNameEle',
				onChange		:	_thisPopulate.setCompanyBranchOnCompanyNameSelect,
				create			: 	false,
				maxItems		: 	1
			});
		}, setCompanyBranchOnCompanyNameSelect : function(companyHeadMasterId) {
			let jsonObject = new Object();
			jsonObject.companyHeadMasterId 	= companyHeadMasterId;
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/companyToDestinationWiseLRRegisterWS/getCompanyBrancesList.do', _thisPopulate.setCompanyBranchOnCompanyName, EXECUTE_WITHOUT_ERROR);
		}, setCompanyBranchOnCompanyName : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.CompanyHeadToBranchMapperArr,
				valueField		:	'branchId',
				labelField		:	'branchName',
				searchField		:	'branchName',
				elementId		:	'companyBranchEle',
				create			: 	false,
				maxItems		: 	1
			});
		}, setPartyList : function(response) {
			if(response.corporateAccountArr != undefined) {
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.corporateAccountArr,
					valueField		:	'corporateAccountId',
					labelField		:	'corporateAccountName',
					searchField		:	'corporateAccountName',
					elementId		:	'partyNameEle',
					create			: 	false,
					maxItems		: 	1
				});
			} else {
				Selectizewrapper.setAutocomplete({
					url				: 	WEB_SERVICE_URL+'/autoCompleteWS/getPartyDetailsAutocomplete.do?isSearchByAllParty=' + isSearchByAllParty + '&isShowDeactivateParty=' + isShowDeactivateParty + '&showAlloption=' + AllOptionInPartyAutocomplete,
					valueField		:	'corporateAccountId',
					labelField		:	'corporateAccountDisplayName',
					searchField		:	'corporateAccountDisplayName',
					elementId		:	'partyNameEle',
					responseObjectKey : 'result',
					create			: 	false,
					maxItems		: 	1
				});
			}
		}, setPartyAutocomplete : function(elementConfiguration) {
			let autoComplete 			= new Object();
			autoComplete.primary_key 	= 'corporateAccountId';
			autoComplete.field 			= 'corporateAccountDisplayName';
			autoComplete.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getPartyDetailsAutocomplete.do?isSearchByAllParty=' + isSearchByAllParty + '&isShowDeactivateParty=' + isShowDeactivateParty + '&showAlloption=' + AllOptionInPartyAutocomplete;
			
			$(elementConfiguration.partyNameElement).autocompleteCustom(autoComplete);
		}, setGSTAutocomplete : function(elementConfiguration) {
			let autoComplete 			= new Object();
			autoComplete.primary_key 	= 'corporateAccountId';
			autoComplete.field 			= 'gstn';
			autoComplete.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getPartyGstnAutocomplete.do?isSearchByAllParty=' + isSearchByAllParty + '&isShowDeactivateParty=' + isShowDeactivateParty + '&showAlloption=' + AllOptionInPartyAutocomplete;
			
			$(elementConfiguration.gstElement).autocompleteCustom(autoComplete);
		}, setPartyMobileNumberAutocomplete : function(elementConfiguration) {
			let autoComplete 			= new Object();
			autoComplete.primary_key 	= 'corporateAccountId';
			autoComplete.field 			= 'corporateAccountMobileNumber';
			autoComplete.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getPartyMobileNoAutocomplete.do?isSearchByAllParty=' + isSearchByAllParty + '&isShowDeactivateParty=' + isShowDeactivateParty + '&showAlloption=' + AllOptionInPartyAutocomplete;
			
			$(elementConfiguration.partyMobileElement).autocompleteCustom(autoComplete);
		}, setBillingPartyAutocomplete : function(elementConfiguration) {
			let autoComplete 			= new Object();
			autoComplete.primary_key 	= 'corporateAccountId';
			autoComplete.field 			= 'corporateAccountDisplayName';
			autoComplete.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getTBBPartyDetailsAutocomplete.do?';
			
			$(elementConfiguration.billingPartyNameElement).autocompleteCustom(autoComplete);
		}, setBillingPartySelection : function() {
			Selectizewrapper.setAutocomplete({
				url				: 	WEB_SERVICE_URL+'/autoCompleteWS/getTBBPartyDetailsAutocomplete.do?',
				valueField		:	'corporateAccountId',
				labelField		:	'corporateAccountDisplayName',
				searchField		:	'corporateAccountDisplayName',
				elementId		:	'billingPartyNameEle',
				responseObjectKey : 'result',
				create			: 	false,
				maxItems		: 	1
			});
		}, setCollectionPersonAutocomplete : function() {
			let autoComplete 			= new Object();
			autoComplete.primary_key 	= 'collectionPersonMasterId';
			autoComplete.field 			= 'name';
			autoComplete.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getCollectionPersonAutocomplete.do?allOptionsInCollectionPerson=' + allOptionsInCollectionPerson;
			
			$(elementConfiguration.collectionPersonNameElement).autocompleteCustom(autoComplete);
		}, setExecutiveTypeWiseCollectionPersonAutocomplete : function() {
			let autoComplete 			= new Object();
			autoComplete.primary_key 	= 'collectionPersonMasterId';
			autoComplete.field 			= 'name';
			autoComplete.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getCollectionPersonAutocompleteExecutiveWise.do?allOptionsInCollectionPerson=' + allOptionsInCollectionPerson;
			
			$(elementConfiguration.collectionPersonNameElement).autocompleteCustom(autoComplete);
		}, setPartyAgentNameAutocomplete : function() {
			let autoComplete 			= new Object();
			autoComplete.primary_key 	= 'partyAgentCommisionId';
			autoComplete.field 			= 'displayName';
			autoComplete.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getPartyAgentCommisionAutocomplete.do';
			
			$(elementConfiguration.partyAgentNameElement).autocompleteCustom(autoComplete);
		}, setAccountGroupList : function(response) {
			if(typeof response.accountGroupList !== 'undefined' && response.accountGroupList) {
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.accountGroupList,
					valueField		:	'accountGroupId',
					labelField		:	'accountGroupWithGroupCode',
					searchField		:	'accountGroupWithGroupCode',
					elementId		:	'accountGroupEle',
					create			: 	false,
					maxItems		: 	1,
					onChange		:	_thisPopulate.getRegionOnAccountGroupChange
				});
			} else {
				Selectizewrapper.setAutocomplete({
					url					: WEB_SERVICE_URL + '/autoCompleteWS/getAccountGroupDetailsByName.do?allOptionsForGroup=' + allOptionsForGroup + '&displayActiveGroups=' + displayActiveGroups + '&displayAllGroups=' + displayAllGroups,
					valueField			: 'accountGroupId',
					labelField			: 'accountGroupDescription',
					searchField			: 'accountGroupDescription',
					elementId			: 'accountGroupEle',
					responseObjectKey 	: 'result',
					create				: false,
					maxItems			: 1,
					onChange			: _thisPopulate.getRegionOnAccountGroupChange
				});
			}
		}, setAutocompleteInstanceOfVehicle : function(response) {
			let vehicleAutoComplete 			= new Object();

			if(response.vehicleNumberMaster == undefined)
				vehicleAutoComplete.url = WEB_SERVICE_URL+'/autoCompleteWS/getVehicleNumberAutocomplete.do?viewAll=' + viewAllVehicle+'&hideOwnVehicleNumbers='+hideOwnVehicleNumbers;
			
			vehicleAutoComplete.primary_key 	= 'vehicleNumberMasterId';
			vehicleAutoComplete.field 			= 'vehicleNumber';
			$(elementConfiguration.vehicleElement).autocompleteCustom(vehicleAutoComplete);
		}, setVehicle : function(response) {
			let autoVehicleName 		= $(elementConfiguration.vehicleElement).getInstance();

			$(autoVehicleName).each(function() {
				this.option.source 	= response.vehicleNumberMaster;
			});
		}, setAutocompleteInstanceOfBankName : function() {
			let bankNameAutoComplete 			= new Object();
			bankNameAutoComplete.primary_key 	= 'bankId';
			bankNameAutoComplete.field 			= 'bankName';
			$(elementConfiguration.bankNameElement).autocompleteCustom(bankNameAutoComplete);
		}, setBankName : function(response) {
			let bankName 		= $(elementConfiguration.bankNameElement).getInstance();

			$(bankName).each(function() {
				this.option.source 	= response.bankList;
			});
		}, setBankNameSelection : function() {
			Selectizewrapper.setAutocomplete({
				url: 					WEB_SERVICE_URL + '/autoCompleteWS/getBankNameAutocomplete.do?',
				valueField: 			'bankId',
				labelField: 			'bankName',
				searchField: 			'bankName',
				elementId: 				'bankNameEle',
				responseObjectKey: 		'result',
				create: 				false,
				maxItems: 				1
			});		
		}, setAutocompleteInstanceOfPaymentType : function() {
			let paymentTypeAutoComplete 			= new Object();
			paymentTypeAutoComplete.primary_key 	= 'paymentTypeId';
			paymentTypeAutoComplete.field 			= 'paymentTypeName';
			$(elementConfiguration.paymentTypeElement).autocompleteCustom(paymentTypeAutoComplete);
		}, setPaymentType : function(response) {
			let paymentType 		= $(elementConfiguration.paymentTypeElement).getInstance();

			$(paymentType).each(function() {
				this.option.source 	= response.paymentTypeList;
			});
		}, setAutocompleteInstanceOfCompany : function() {
			let companyNameAutoComplete 			= new Object();
			companyNameAutoComplete.primary_key 	= 'groupWiseCompanyNameId';
			companyNameAutoComplete.field 			= 'groupWiseCompanyName';
			$(elementConfiguration.companyElement).autocompleteCustom(companyNameAutoComplete);
		}, setCompany : function(response) {
			let companyName 		= $(elementConfiguration.companyElement).getInstance();

			$(companyName).each(function() {
				this.option.source 	= response.groupWiseCompanyNameList;
			});
		}, setAutocompleteInstanceOfVoucherType : function() {
			let voucherTypeAutoComplete 			= new Object();
			voucherTypeAutoComplete.primary_key 	= 'voucherTypeId';
			voucherTypeAutoComplete.field 			= 'voucherTypeName';
			$(elementConfiguration.voucherTypeElement).autocompleteCustom(voucherTypeAutoComplete);
		}, setVoucherType : function(response) {
			let voucherType 		= $(elementConfiguration.voucherTypeElement).getInstance();

			$(voucherType).each(function() {
				this.option.source 	= response.VoucherTypeForSelection;
			});
		}, setAutocompleteInstanceOfLedgerName : function() {
			let ledgerNameAutoComplete 				= new Object();
			ledgerNameAutoComplete.primary_key 		= 'incomeExpenseChargeMasterId';
			ledgerNameAutoComplete.field 			= 'chargeName';
			$(elementConfiguration.ledgerNameElement).autocompleteCustom(ledgerNameAutoComplete);
		}, setLedgerName : function(response) {
			let ledgerName 		= $(elementConfiguration.ledgerNameElement).getInstance();

			$(ledgerName).each(function() {
				this.option.source 	= response.IncomeExpenseChargeMasterList;
			});
		}, setAutocompleteInstanceOfCountry : function() {
			let countryAutoComplete 			= new Object();
			countryAutoComplete.primary_key 	= 'countryId';
			countryAutoComplete.field 			= 'countryName';
			countryAutoComplete.callBack 		= _thisPopulate.setStateOnCountrySelection;
			$(elementConfiguration.countryElement).autocompleteCustom(countryAutoComplete);
		}, setAutocompleteInstanceOfState : function() {
			let stateNameAutoComplete 				= new Object();
			stateNameAutoComplete.primary_key 		= 'stateId';
			stateNameAutoComplete.field 			= 'stateName';
			stateNameAutoComplete.callBack 			= _thisPopulate.setCityOnStateSelect;
			$(elementConfiguration.stateElement).autocompleteCustom(stateNameAutoComplete);
		}, setAutocompleteInstanceOfCity : function() {
			let cityNameAutoComplete 				= new Object();
			cityNameAutoComplete.primary_key 		= 'cityId';
			cityNameAutoComplete.field 				= 'cityName';
			$(elementConfiguration.cityElement).autocompleteCustom(cityNameAutoComplete);
		}, setCountry : function(response) {
			let countryName 		= $(elementConfiguration.countryElement).getInstance();

			$(countryName).each(function() {
				this.option.source 	= response.countryList;
			});
		}, setState : function(response) {
			let stateName 		= $(elementConfiguration.stateElement).getInstance();

			$(stateName).each(function() {
				this.option.source 	= response.stateList;
			});
			
			if(typeof destinationCityWithStateSelection !== 'undefined' && destinationCityWithStateSelection)
				_thisPopulate.setDestState(response);
		}, setStateOnCountrySelection : function() {
			let jsonArray = new Array();
			jsonArray.push(elementConfiguration.stateElement);
			_thisPopulate.resetAutcomplete(jsonArray);
			
			let countryId	= $("#" + $(this).attr("id") + "_primary_key").val();
			
			if(countryId == undefined || countryId == 0) return;
			
			let jsonObject = new Object();
			jsonObject.CountryId = countryId;
			getJSON(jsonObject,	WEB_SERVICE_URL + '/selectOptionsWS/getStateByCountryId.do', _thisPopulate.setState, EXECUTE_WITHOUT_ERROR);
		}, setCityOnStateSelect : function() {
			let jsonArray = new Array();
			jsonArray.push(elementConfiguration.cityElement);
			_thisPopulate.resetAutcomplete(jsonArray);
			
			let stateId = $("#" + $(this).attr("id") + "_primary_key").val();
			
			if(stateId == undefined || stateId == 0) return;
			
			let jsonObject = new Object();
			jsonObject.stateId = stateId;
			getJSON(jsonObject,	WEB_SERVICE_URL + '/cityWS/getCityForDropDown.do', _thisPopulate.setCity, EXECUTE_WITHOUT_ERROR);
		}, setCity : function(response) {
			let cityName 		= $(elementConfiguration.cityElement).getInstance();

			$(cityName).each(function() {
				this.option.source 	= response.city;
			});
		}, setSrcSubRegion : function(response) {
			let srcAutoSubRegionName 	= $(elementConfiguration.srcSubRegionElement).getInstance();

			$(srcAutoSubRegionName).each(function() {
				this.option.source 	= response.subRegionList;
			});
		}, setDestSubRegion : function(response) {
			let destAutoSubRegionName 	= $(elementConfiguration.destSubregionElement).getInstance();

			$(destAutoSubRegionName).each(function() {
				this.option.source 	= response.toSubRegionList;
			});
		}, setAutocompleteInstanceOfExecutive : function(response) {
			let executiveNameAutoComplete 				= new Object();
			
			if(response.executiveList != undefined)
				executiveNameAutoComplete.url 		= response.executiveList;	
			
			executiveNameAutoComplete.primary_key 		= 'executiveId';
			executiveNameAutoComplete.field 			= 'executiveName';
			$(elementConfiguration.executiveElement).autocompleteCustom(executiveNameAutoComplete);
		}, setExecutiveOnBranchSelect : function() {
			let jsonArray = new Array();
			jsonArray.push(elementConfiguration.executiveElement);
			_thisPopulate.resetAutcomplete(jsonArray);
			
			let sourceBranchId = $("#" + $(this).attr("id") + "_primary_key").val();
			
			if(sourceBranchId == undefined || sourceBranchId == 0)
				return;
			
			let jsonObject = new Object();
			jsonObject.sourceBranchId 			= sourceBranchId;
			jsonObject.displaySuperAdmin 		= isDisplaySuperAdmin;
			jsonObject.AllOptionsForExecutive 	= AllOptionsForExecutive;
			jsonObject.showAllExecutiveOfBranch	= showAllExecutiveOfBranch;
			jsonObject.displayOnlyActiveUsers	= displayOnlyActiveUsers;
			getJSON(jsonObject,	WEB_SERVICE_URL + '/selectOptionsWS/getExecutiveListByBranch.do', _thisPopulate.setExecutive, EXECUTE_WITHOUT_ERROR);
		}, setExecutive : function(response) {
			let executiveName 		= $(elementConfiguration.executiveElement).getInstance();

			$(executiveName).each(function() {
				this.option.source 	= response.executiveList;
			});
		}, resetAutcomplete : function (jsonArray) {
			for ( let eleId in jsonArray) {
				let elem = $(jsonArray[eleId]).getInstance();
				
				$(elem).each(function() {
					let elemObj = this.elem.combo_input;
					
					$(elemObj).each(function() {
						$("#" + $(this).attr("id")).val('');
						$("#" + $(this).attr("id") + '_primary_key').val("");
					})
				})
			}
		}, setDropDownForCashStatementLink(cashStatementObj) {
			isFromCashStatement = cashStatementObj.isFromCashStatement;
			regionId			= cashStatementObj.regionId;
			subRegionId			= cashStatementObj.subRegionId;
			branchId			= cashStatementObj.branchId;
			paymentTypeId		= cashStatementObj.paymentTypeId;
			isGroupAdmin		= cashStatementObj.isGroupAdmin;
			isRegionAdmin		= cashStatementObj.isRegionAdmin;
			isSubRegionAdmin	= cashStatementObj.isSubRegionAdmin;
			isNormalUser		= cashStatementObj.isNormalUser;
			subRegionEle		= cashStatementObj.subRegionEle;
			branchEle			= cashStatementObj.branchEle;
			
			_thisPopulate = this;
			
			if(isFromCashStatement) {
				if(isGroupAdmin || isRegionAdmin)
					_thisPopulate.setSubregionOnRegionSelect(regionId);
				
				_thisPopulate.setBranchOnSubRegionSelect(subRegionId);
				
				setTimeout(function() {
					isFromCashStatement	= false;
				}, 1000);
			}
		}, setAgentBranches : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.branchList,
				valueField		:	'branchId',
				labelField		:	'branchName',
				searchField		:	'branchName',
				elementId		:	'branchEle',
				create			: 	false,
				maxItems		: 	1,
				onChange		: _thisPopulate.getOperationalBranchesOnBranchSelect
			});
		}, setAutocompleteInstanceOfGodown : function() {
			let godownNameAutoComplete 				= new Object();
			godownNameAutoComplete.primary_key 		= 'godownId';
			godownNameAutoComplete.field 			= 'name';
			$(elementConfiguration.godownElement).autocompleteCustom(godownNameAutoComplete);
		}, setGodownOnBranchSelect : function() {
			let jsonArray = new Array();
			jsonArray.push(elementConfiguration.godownElement);
			_thisPopulate.resetAutcomplete(jsonArray);
			
			let branchId = $("#" + $(this).attr("id") + "_primary_key").val();
			
			if(branchId != undefined && branchId != 0) {
				let jsonObject = new Object();
				jsonObject.branchId 	= branchId;
				getJSON(jsonObject,	WEB_SERVICE_URL + '/selectOptionsWS/getGodownList.do', _thisPopulate.setGodown, EXECUTE_WITHOUT_ERROR);
			}
		}, setGodown : function(response) {
			let godownName 		= $(elementConfiguration.godownElement).getInstance();

			$(godownName).each(function() {
				this.option.source 	= response.GODOWN_LIST;
			});
		}, setRegionOptionWithSelectize : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: response.regionList,
				valueField		: 'regionId',
				labelField		: 'regionName',
				searchField		: 'regionName',
				elementId		: 'regionEle',
				create			: false,
				maxItems		: 1,
				onChange		: _thisPopulate.getSubRegionsOnRegionSelect
			});
		}, getSubRegionsOnRegionSelect : function(regionId) {
			let jsonObject = new Object();
			
			if(regionId > 0)
				jsonObject.regionId		= regionId;
			else
				jsonObject.regionId		= (elementConfiguration.regionElement).val();
			
			jsonObject.AllOptionsForSubRegion	= AllOptionsForSubRegion;
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/selectOptionsWS/getSubRegionOption.do', _thisPopulate.setSubRegionOptionWithSelectize, EXECUTE_WITHOUT_ERROR);
		}, setSubRegionOptionWithSelectize : function(response) {
			let subRegionList	= response.subRegion;

			Selectizewrapper.setAutocomplete({
				jsonResultList	: subRegionList,
				valueField		: 'subRegionId',
				labelField		: 'subRegionName',
				searchField		: 'subRegionName',
				elementId		: 'subRegionEle',
				maxItems		: 1,
				onChange		: _thisPopulate.getBranchesOnSubRegionSelect
			});
			
			if(subRegionList != undefined && subRegionList.length == 1)
				_thisPopulate.getBranchesOnSubRegionSelect(subRegionList[0].subRegionId);
		}, getBranchesOnSubRegionSelect : function(subRegionId) {
			let jsonObject = new Object();
			
			if(subRegionId > 0)
				jsonObject.subRegionId 				= subRegionId;
			else
				jsonObject.subRegionId 				= (elementConfiguration.subregionElement).val();
			
			jsonObject.AllOptionsForBranch 			= AllOptionsForBranch;
			jsonObject.AllOptionsForSubRegion		= AllOptionsForSubRegion;
			jsonObject.isDisplayDeActiveBranch		= isDisplayDeActiveBranch;
			
			if(typeof isPhysicalBranchesShow !== 'undefined' && isPhysicalBranchesShow)
				getJSON(jsonObject,	WEB_SERVICE_URL + '/selectOptionsWS/getPhysicalBranchOption.do', _thisPopulate.setBranchOptionWithSelectize, EXECUTE_WITHOUT_ERROR);
			else
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/selectOptionsWS/getBranchOption.do', _thisPopulate.setBranchOptionWithSelectize, EXECUTE_WITH_ERROR);
		}, setBranchOptionWithSelectize : function(response) {
			let maxItems	= 1;
			
			if(multipleSourceBranchSelection)
				maxItems	= (response.sourceBranch).length;
			
			Selectizewrapper.setAutocomplete({
				jsonResultList	: response.sourceBranch,
				valueField		: 'branchId',
				labelField		: 'branchName',
				searchField		: 'branchName',
				elementId		: 'branchEle',
				maxItems		: maxItems,
				onChange		:_thisPopulate.getOperationalBranchesOnBranchSelect
			});
		}, getOperationalBranchesOnBranchSelect : function(branchId) {
			if(!$('#locationBranchEle').exists() || !isOperationalBranchSelection) return;
			
			let jsonObject = new Object();
			
			if(branchId > 0)
				jsonObject.bookingBranchId		= branchId;
			else
				jsonObject.bookingBranchId		= (elementConfiguration.branchElement).val();
			
			jsonObject.AllOptionsForOperationalBranch	= allOptionsForOperationalBranch;
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/selectOptionsWS/getBranchAutocompleteBySourceBranchId.do', _thisPopulate.setOperationalBranchOptionWithSelectize, EXECUTE_WITHOUT_ERROR);
		}, setOperationalBranchOptionWithSelectize : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: response.branchList,
				valueField		: 'locationsMappingAssignedLocationId',
				labelField		: 'locationsMappingName',
				searchField		: 'locationsMappingName',
				elementId		: 'locationBranchEle',
				maxItems		: 1
			});
		}, setDestRegionOptionWithSelectize : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: response.regionList,
				valueField		: 'regionId',
				labelField		: 'regionName',
				searchField		: 'regionName',
				elementId		: 'destRegionEle',
				maxItems		: 1,
				onChange		: _thisPopulate.getDestSubRegionsOnRegionSelect
			});
		}, getDestSubRegionsOnRegionSelect : function(regionId) {
			let jsonObject = new Object();
			
			if(regionId > 0)
				jsonObject.regionId		= regionId;
			else
				jsonObject.regionId		= (elementConfiguration.destRegionElement).val();
			
			jsonObject.AllOptionsForSubRegion	= AllOptionsForDestSubRegion;
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/selectOptionsWS/getSubRegionOption.do', _thisPopulate.setDestSubRegionOptionWithSelectize, EXECUTE_WITHOUT_ERROR);
		}, setDestSubRegionOptionWithSelectize : function(response) {
			let subRegionList	= response.subRegion;

			Selectizewrapper.setAutocomplete({
				jsonResultList	: subRegionList,
				valueField		: 'subRegionId',
				labelField		: 'subRegionName',
				searchField		: 'subRegionName',
				elementId		: 'destSubRegionEle',
				maxItems		: 1,
				onChange		: _thisPopulate.getDestBranchesOnSubRegionSelect
			});
			
			if(subRegionList != undefined && subRegionList.length == 1)
				_thisPopulate.getDestBranchesOnSubRegionSelect(subRegionList[0].subRegionId);
		}, getDestBranchesOnSubRegionSelect : function(subRegionId) {
			let jsonObject = new Object();
			
			if(subRegionId > 0)
				jsonObject.subRegionId 				= subRegionId;
			else
				jsonObject.subRegionId 				= (elementConfiguration.destSubregionElement).val();

			jsonObject.AllOptionsForBranch 			= AllOptionForDestinationBranch;
			jsonObject.isDisplayDeActiveBranch		= isDisplayDeActiveBranch;
			
			if(jsonObject.subRegionId <= 0)
				return;
			
			if(typeof isPhysicalBranchesShow !== 'undefined' && isPhysicalBranchesShow)
				getJSON(jsonObject,	WEB_SERVICE_URL + '/selectOptionsWS/getPhysicalBranchOption.do', _thisPopulate.setDestBranchOptionWithSelectize, EXECUTE_WITHOUT_ERROR);
			else
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/selectOptionsWS/getBranchOption.do', _thisPopulate.setDestBranchOptionWithSelectize, EXECUTE_WITH_ERROR);
		}, setDestBranchOptionWithSelectize : function(response) {
			let maxItems	= 1;
			
			if(multipleDestBranchSelection)
				maxItems	= (response.sourceBranch).length;
				
			Selectizewrapper.setAutocomplete({
				jsonResultList	: response.sourceBranch,
				valueField		: 'branchId',
				labelField		: 'branchName',
				searchField		: 'branchName',
				elementId		: 'destBranchEle',
				maxItems		: maxItems
			});
		}, changeOnIncomingOutgoing : function(modeType, executiveType, regionId, subRegionId) {
			if(modeType == RATE_TYPE_INCOMING_ID) {
				if(executiveType == EXECUTIVE_TYPE_BRANCHADMIN || executiveType == EXECUTIVE_TYPE_EXECUTIVE) {
					$('#srcBranchSelection').removeClass('hide');
					$('#destBranchSelection').addClass('hide');
				} else if(executiveType == EXECUTIVE_TYPE_REGIONADMIN) {
					$("#regionCol").removeClass("hide");
					$("#subRegionCol").removeClass("hide");
					$("#destRegionCol").addClass("hide");
					$("#destSubRegionCol").removeClass("hide");
					_thisPopulate.getDestSubRegionsOnRegionSelect(regionId);
				} else if(executiveType == EXECUTIVE_TYPE_SUBREGIONADMIN) {
					$("#regionCol").removeClass("hide");
					$("#subRegionCol").removeClass("hide");
					$("#destRegionCol").addClass("hide");
					$("#destSubRegionCol").addClass("hide");
					_thisPopulate.getDestBranchesOnSubRegionSelect(subRegionId);
				} else
					$('#destBranchSelection').removeClass('hide');
			} else if(executiveType == EXECUTIVE_TYPE_BRANCHADMIN || executiveType == EXECUTIVE_TYPE_EXECUTIVE) {
				$('#srcBranchSelection').addClass('hide');
				$('#destBranchSelection').removeClass('hide');
			} else if(executiveType == EXECUTIVE_TYPE_REGIONADMIN) {
				$("#regionCol").addClass("hide");
				$("#subRegionCol").removeClass("hide");
				$("#destRegionCol").removeClass("hide");
				$("#destSubRegionCol").removeClass("hide");
				_thisPopulate.getSubRegionsOnRegionSelect(regionId);
			} else if(executiveType == EXECUTIVE_TYPE_SUBREGIONADMIN) {
				$("#regionCol").addClass("hide");
				$("#subRegionCol").addClass("hide");
				$("#destRegionCol").removeClass("hide");
				$("#destSubRegionCol").removeClass("hide");
				_thisPopulate.getBranchesOnSubRegionSelect(subRegionId);
			} else
				$('#srcBranchSelection').removeClass('hide');
		}, setAutocompleteInstanceOfLRType : function() {
			let autoLrTypeName 			= new Object();
			autoLrTypeName.primary_key 	= 'wayBillTypeId';
			autoLrTypeName.field 		= 'wayBillType';

			$(elementConfiguration.lrTypeEle).autocompleteCustom(autoLrTypeName);
		}, setLRTypes : function(response) {
			let autoLrTypeName 	= $(elementConfiguration.lrTypeEle).getInstance();

			$(autoLrTypeName).each(function() {
				this.option.source 	= response.wayBillTypeList;
			});
		}, setVehicleAgent : function() {
			Selectizewrapper.setAutocomplete({
				url 				: WEB_SERVICE_URL+'/autoCompleteWS/getVehicleAgentAutocomplete.do?viewAll=' + AllOptionInVehicleAgent,
				valueField			: 'vehicleAgentMasterId',
				labelField			: 'name',
				searchField			: 'name',
				elementId			: 'vehicleAgentEle',
				responseObjectKey 	: 'result',
				onChange			: _thisPopulate.getAgentWiseVehicleAutoComplete
			});
		}, getAgentWiseVehicleAutoComplete : function() {
			if(!$('#vehicleAgentEle').exists() || !getAgentWiseVehicleAutoComplete)
				return;
			
			let jsonObject = new Object();
			jsonObject.vehicleAgentMasterId = Number($('#vehicleAgentEle').val());
					
			if(jsonObject.vehicleAgentMasterId <= 0)
				return false;
					
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/vehicleWS/getAgentVehicleNumberAutocomplete.do', _thisPopulate.setVehicleAutocompleteWithSelectize, EXECUTE_WITHOUT_ERROR);
		}, setVehicleAutocompleteWithSelectize : function(response) {
			const defaultUrl = WEB_SERVICE_URL + '/autoCompleteWS/getVehicleNumberAutocomplete.do?';
			
			if(response.vehicleNumberMaster != undefined) {
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.vehicleNumberMaster,
					valueField		:	'vehicleNumberMasterId',
					labelField		:	'vehicleNumber',
					searchField		:	'vehicleNumber',
					elementId		:	'vehicleNumberEle',
				});
			} else {
				Selectizewrapper.setAutocomplete({
					url 				: response.url || defaultUrl,
					valueField			: 'vehicleNumberMasterId',
					labelField			: 'vehicleNumber',
					searchField			: 'vehicleNumber',
					elementId			: 'vehicleNumberEle',
					responseObjectKey 	: 'result'
				});
			}
		}, setCrossingAgentWithSelectize : function() {
			Selectizewrapper.setAutocomplete({
				url 				: WEB_SERVICE_URL + '/autoCompleteWS/getCrossingAgentAutocomplete.do?ShowAllOptionInAgent=' + showAllOptionInAgent,
				valueField			: 'crossingAgentMasterId',
				labelField			: 'name',
				searchField			: 'name',
				elementId			: 'crossingAgentEle',
				responseObjectKey 	: 'result'
			});
		}, getElementData : function() {
			let jsonObject = new Object();
			setElementData(jsonObject);
			return jsonObject;
		}, setVehicleType : function(response) {
			let maxItemsVehicleType	= typeof response.multipleVehicleTypeSelection !== 'undefined' && response.multipleVehicleTypeSelection ? response.vehicleTypeList : 1;
			
			Selectizewrapper.setAutocomplete({
				jsonResultList	: response.vehicleTypeList,
				valueField		: 'vehicleTypeId',
				labelField		: 'name',
				searchField		: 'name',
				elementId		: 'vehicleTypeEle',
				maxItems		: maxItemsVehicleType
			});
		}, setBusinessType : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: response.businessTypeList,
				valueField		: 'businessTypeId',
				labelField		: 'businessTypeName',
				searchField		: 'businessTypeName',
				elementId		: 'businessTypeEle'
			});
		}, setChargeTypeSection : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: response.chargeTypeList,
				valueField		: 'chargeTypeId',
				labelField		: 'chargeTypeName',
				searchField		: 'chargeTypeName',
				elementId		: 'chargeTypeEle'
			});
		}, setBookingCharges : function(response) {
			let maxItemsLR		= typeof response.multipleBookingChargesSelection !== 'undefined' && response.multipleBookingChargesSelection ? (response.bookingCharges).length : 1;
			
			Selectizewrapper.setAutocomplete({
				jsonResultList	: response.bookingCharges,
				valueField		: 'chargeTypeMasterId',
				labelField		: 'chargeTypeMasterName',
				searchField		: 'chargeTypeMasterName',
				elementId		: 'chargesEle',
				maxItems		: maxItemsLR
			});
		}, setPackingTypeForGroups : function(response) {
			let maxItemsLR		= typeof response.multiplePackingTypesSelection !== 'undefined' && response.multiplePackingTypesSelection ? (response.packingTypeForGroupList).length : 1;
			
			Selectizewrapper.setAutocomplete({
				jsonResultList	: response.packingTypeForGroupList,
				valueField		: 'typeOfPackingMasterId',
				labelField		: 'packingTypeName',
				searchField		: 'packingTypeName',
				elementId		: 'packingTypeEle',
				maxItems		: maxItemsLR
			});
		}, setLRTypeSelectionWithSelectize : function(response) {
			let maxItemsLR		= typeof response.multipleLRTypeSelection !== 'undefined' && response.multipleLRTypeSelection ? (response.wayBillTypeList).length : 1;
			
			Selectizewrapper.setAutocomplete({
				jsonResultList	: response.wayBillTypeList,
				valueField		: 'wayBillTypeId',
				labelField		: 'wayBillType',
				searchField		: 'wayBillType',
				elementId		: 'lrTypeEle',
				maxItems		: maxItemsLR
			});
		}, setUnitTypeSelection : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: response.cftUnitList,
				valueField		: 'cftUnitId',
				labelField		: 'cftUnitName',
				searchField		: 'cftUnitName',
				elementId		: 'cftUnitEle'
			});
		}, setBookingTypeSelection : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: response.bookingTypeList,
				valueField		: 'bookingTypeId',
				labelField		: 'bookingTypeName',
				searchField		: 'bookingTypeName',
				elementId		: 'bookingTypeEle'
			});
		}, setBillSelection : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: response.billSelectionList,
				valueField		: 'billSelectionId',
				labelField		: 'billSelectionName',
				searchField		: 'billSelectionName',
				elementId		: 'billSelectionEle',
				create			: false,
				maxItems		: 1
			});
		}, setNodElementForValidation : function(response) {
			let myNod = nod();
						
			myNod.configure({
				parentClass:'validation-message'
			});
				
			if(response.region) {
				addAutocompleteElementInNode(myNod, 'regionEle', 'Select Region !')
				$("*[data-attribute=region]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
			}
								
			if(response.subRegion) {
				addAutocompleteElementInNode(myNod, 'subRegionEle', 'Select Sub-Region !')
				$("*[data-attribute=subRegion]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
			}
								
			if(response.branch) {
				if($('#branchEle_primary_key').exists())
					addAutocompleteElementInNode(myNod, 'branchEle', 'Select Branch !')
				else
					addAutocompleteElementInNode1(myNod, 'branchEle', 'Select Branch !')
					
				$("*[data-attribute=branch]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
			}
			
			if(response.destinationAreaSelection) {
				if($('#destRegionEle').exists()) {
					addAutocompleteElementInNode(myNod, 'destRegionEle', 'Select To Region !')
					$("*[data-attribute=destRegion]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
				}
									
				if($('#destSubRegionEle').exists() && response.destSubRegion) {
					addAutocompleteElementInNode(myNod, 'destSubRegionEle', 'Select To Sub-Region !')
					$("*[data-attribute=destSubRegion]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
				}
									
				if($('#destBranchEle').exists() && response.destBranch) {
					if($('#destBranchEle_primary_key').exists())
						addAutocompleteElementInNode(myNod, 'destBranchEle', 'Select To Branch !')
					else
						addAutocompleteElementInNode1(myNod, 'destBranchEle', 'Select To Branch !')
						
					$("*[data-attribute=destBranch]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
				}
			} else {
				if($('#destSubRegionEle').exists() && response.destSubRegion) {
					addAutocompleteElementInNode(myNod, 'destSubRegionEle', 'Select To Sub-Region !')
					$("*[data-attribute=destSubRegion]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
				}
							
				if($('#destBranchEle').exists() && response.destBranch) {
					if($('#destBranchEle_primary_key').exists())
						addAutocompleteElementInNode(myNod, 'destBranchEle', 'Select To Branch !')
					else
						addAutocompleteElementInNode1(myNod, 'destBranchEle', 'Select To Branch !')
						
					$("*[data-attribute=destBranch]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
				}
			}
				
			if(response.type) {
				addAutocompleteElementInNode(myNod, 'typeEle', 'Select proper Type !')
				$("*[data-attribute=type]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
			}
			
			if(response.lrType) {
				addAutocompleteElementInNode(myNod, 'lrTypeEle', 'Select proper LR Type !')
				$("*[data-attribute=lrType]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
			}
				
			if(response.lrMode) {
				addAutocompleteElementInNode(myNod, 'lrModeEle', 'Select proper Mode !')
				$("*[data-attribute=lrMode]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
			}
				
			if(response.vehicleNo) {
				addAutocompleteElementInNode(myNod, 'vehicleNoEle', 'Select proper Vehicle Number !')
				$("*[data-attribute=vehicleNo]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
			} else if(response.vehicleNumber) {
				if($('#vehicleNumberEle_primary_key').exists())
					addAutocompleteElementInNode(myNod, 'vehicleNumberEle', 'Select proper Vehicle Number !')
				else
					addAutocompleteElementInNode1(myNod, 'vehicleNumberEle', 'Select proper Vehicle Number !')
				
				$("*[data-attribute=vehicleNumber]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
			}
			
			if(response.driverName) {
				addAutocompleteElementInNode(myNod, 'driverNameEle', 'Select proper Driver Name !')
				$("*[data-attribute=driverName]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
			}
				
			if(response.transportationMode) {
				addAutocompleteElementInNode(myNod, 'transportationModeEle', 'Select proper TransPort Mode !');
				$("*[data-attribute=transportationMode]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
			}
			
			if(response.paymentMode && $('#paymentTypeEle').is(":visible")) {
				addAutocompleteElementInNode(myNod, 'paymentTypeEle', 'Select proper Payment Type !');
				$("*[data-attribute=paymentMode]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
			}
			
			if(response.txnType) {
				addAutocompleteElementInNode(myNod, 'txnTypeEle', 'Select proper Type !')
				$("*[data-attribute=txnType]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
			}
			
			if(response.partyAgent) {
				addAutocompleteElementInNode(myNod, 'partyAgentEle', 'Select Party Agent !')
				$("*[data-attribute=partyAgent]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
			}
			
			if(response.categoryType) {
				addAutocompleteElementInNode(myNod, 'categoryTypeEle', 'Select proper Category !')
				$("*[data-attribute=categoryType]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
			}
			
			if(response.country) {
				addAutocompleteElementInNode(myNod, 'countryEle', 'Select proper Country !')
				$("*[data-attribute=country]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
			}
			
			if(response.state) {
				addAutocompleteElementInNode(myNod, 'stateEle', 'Select proper State !')
				$("*[data-attribute=state]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
			}
			
			if(response.city) {
				addAutocompleteElementInNode(myNod, 'cityEle', 'Select proper City !')
				$("*[data-attribute=city]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
			}
			
			if(response.toState) {
				addAutocompleteElementInNode(myNod, 'toStateEle', 'Select proper To State !')
				$("*[data-attribute=toState]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
			}
			
			if(response.toCity) {
				addAutocompleteElementInNode(myNod, 'toCityEle', 'Select proper To City !')
				$("*[data-attribute=toCity]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
			}
				
			if(response.collectionPerson) {
				addAutocompleteElementInNode(myNod, 'collectionPersonEle', 'Select proper Collection Person !')
				$("*[data-attribute=collectionPerson]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
			}
				
			return myNod;
		}, setSaidToContainAutocomplete : function(response) {
			let maxItems	= 1;
			
			if(response.maxItemsForSaidToContain != undefined)
				maxItems	= response.maxItemsForSaidToContain;
				
			Selectizewrapper.setAutocomplete({
				url				: WEB_SERVICE_URL + '/autoCompleteWS/getAllConsignmentGoodsDetailsByName.do?accountGroupId=' + response.accountGroupId,
				valueField		:	'consignmentGoodsId',
				labelField		:	'name',
				searchField		:	'name',
				elementId		:	response.saidToContainEle,
				responseObjectKey : 'result',
				create			: 	false,
				maxItems		: 	maxItems
			});
		}, setPackingTypeAutocomplete : function(response) {
			let maxItems	= 1;
			
			if(response.maxItemsForPackingType != undefined)
				maxItems	= response.maxItemsForPackingType;
				
			Selectizewrapper.setAutocomplete({
				url				: WEB_SERVICE_URL + '/autoCompleteWS/getPackingTypeByNameAndGroupId.do?accountGroupId=' + response.accountGroupId + '&allOptionForPackingType=' + response.allOptionForPackingType,
				valueField		:	'packingTypeMasterId',
				labelField		:	'packingGroupTypeName',
				searchField		:	'packingGroupTypeName',
				elementId		:	response.packingTypeEle,
				responseObjectKey : 'result',
				create			: 	false,
				maxItems		: 	maxItems
			});
		}, setExecutiveAutocomplete : function(response) {
			let maxItems	= 1;
			
			if(response.maxItemsForExecutive != undefined)
				maxItems	= response.maxItemsForExecutive;
				
			Selectizewrapper.setAutocomplete({
				url				: WEB_SERVICE_URL + '/autoCompleteWS/getExecutiveAutocomplete.do?accountGroupId=' + response.accountGroupId,
				valueField		:	'executiveId',
				labelField		:	'executiveName',
				searchField		:	'executiveName',
				elementId		:	response.executiveElement,
				responseObjectKey : 'result',
				create			: 	false,
				maxItems		: 	maxItems
			});
		}, setSelectizeOfGroupMergingVehicle : function() {
			Selectizewrapper.setAutocomplete({
				url				: WEB_SERVICE_URL + '/selectOptionsWS/getGroupMergingVehicleNumberList.do?showOnlyActiveVehicles=' + elementConfiguration.showOnlyActiveVehicles + '&showAllOptionInVehicleNumber=' + elementConfiguration.showAllOptionInVehicleNumber,
				valueField		:	'vehicleNumberMasterId',
				labelField		:	'vehicleNumber',
				searchField		:	'vehicleNumber',
				elementId		:	elementConfiguration.vehicleElement,
				responseObjectKey : 'vehicleNumber',
				create			: 	false,
				maxItems		: 	1
			});
		}, setAutocompleteInstanceOfTransportationMode : function() {
			let transportModeName 			= new Object();
			transportModeName.primary_key 	= 'transportModeId';
			transportModeName.field 		= 'transportModeName';

			$(elementConfiguration.transportationModeEle).autocompleteCustom(transportModeName);
		}, setTransportationMode : function(response) {
			let transportModeName 	= $(elementConfiguration.transportationModeEle).getInstance();

			$(transportModeName).each(function() {
				this.option.source 	= response.transportationModeList;
			});
		}, setSelectionDataFromAnotherReport : function(response) {
			let isGroupAdmin = false, isRegionAdmin	= false,
			isSubRegionAdmin = false, isNormalUser = false;
			let executive	= response.executive;
	
			$("#dateEle").attr('data-startdate', response.fromDate);
			$("#dateEle").attr('data-enddate', response.toDate); 
			$("#dateEle").val(response.fromDate + ' - ' + response.toDate);

			$('#subRegionEle_primary_key').val(response.subRegionId);
			$('#branchEle_primary_key').val(response.branchId);

			if(response.regionList != undefined) {
				let regionList	= response.regionList;
				regionList 	= regionList.filter(function (el) {return el.regionId == response.regionId;});

				$("#regionEle").val(regionList[0].regionName);
				$('#regionEle_primary_key').val(regionList[0].regionId);
			}
			
			let paymentTypeConstantsArr	= response.paymentTypeList;
			
			if(paymentTypeConstantsArr != undefined && paymentTypeConstantsArr.length > 0) {
				for(const element of paymentTypeConstantsArr) {
					if(response.paymentType == element.paymentTypeId) {
						$('#paymentTypeEle').val(element.paymentTypeName);
						$('#paymentTypeEle_primary_key').val(element.paymentTypeId);
					}
				}
			}
			
			if(executive.executiveType == EXECUTIVE_TYPE_GROUPADMIN)
				isGroupAdmin		= true;
			else if(executive.executiveType == EXECUTIVE_TYPE_REGIONADMIN)
				isRegionAdmin		= true;
			else if(executive.executiveType == EXECUTIVE_TYPE_SUBREGIONADMIN)
				isSubRegionAdmin	= true;
			else
				isNormalUser		= true;
					
			response.isFromCashStatement	= response.isFromAnotherReport;
			response.branchId				= response.sourceBranchId;
			response.subRegionEle			= $('#subRegionEle');
			response.branchEle				= $('#branchEle');
			response.isGroupAdmin			= isGroupAdmin;
			response.isRegionAdmin			= isRegionAdmin;
			response.isSubRegionAdmin		= isSubRegionAdmin;
			response.isNormalUser			= isNormalUser;
			
			this.setDropDownForCashStatementLink(response);
		}, setAutocompleteInstanceOfCompanyName : function() {
			let companyNameAutoComplete 			= new Object();
			companyNameAutoComplete.primary_key 	= 'companyHeadMasterId';
			companyNameAutoComplete.field 			= 'companyHeadName';
			companyNameAutoComplete.callBack 		= _thisPopulate.setSourceStateOnCompanySelect;
			$(elementConfiguration.companyNameElement).autocompleteCustom(companyNameAutoComplete);
		}, setCompanyHeadName : function(response) {
			let companyName 		= $(elementConfiguration.companyNameElement).getInstance();

			$(companyName).each(function() {
				this.option.source 	= response.companyHeadMasterArr;
			});
		}, setSourceStateOnCompanySelect : function() {
			let jsonArray = new Array();
			jsonArray.push(elementConfiguration.srcStateElement);
			jsonArray.push(elementConfiguration.branchElement);
			_thisPopulate.resetAutcomplete(jsonArray);
			
			let jsonObject = new Object();
			jsonObject.companyHeadMasterId = $("#" + $(this).attr("id") + "_primary_key").val();
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/selectOptionsWS/getStateListByCompanyWise.do', _thisPopulate.setSrcState, EXECUTE_WITHOUT_ERROR);
		}, setSrcBranchesOnStateSeletion : function() {
			let jsonArray = new Array();
			jsonArray.push(elementConfiguration.branchElement);
			_thisPopulate.resetAutcomplete(jsonArray);

			let jsonObject = new Object();
			jsonObject.stateId = $("#" + $(this).attr("id") + "_primary_key").val();
			jsonObject.companyHeadMasterId = $("#companyNameEle_primary_key").val();
			jsonObject.isOnlyPhysicalBranch = isPhysicalBranchesShow;
			getJSON(jsonObject,	WEB_SERVICE_URL + '/selectOptionsWS/getBranchListByCompanyStateIdWise.do', _thisPopulate.setBranch, EXECUTE_WITHOUT_ERROR);
		}, setDestBranchesOnDestStateSeletion : function() {
			let jsonArray = new Array();
			jsonArray.push(elementConfiguration.destBranchElement);
			_thisPopulate.resetAutcomplete(jsonArray);

			let jsonObject = new Object();
			jsonObject.stateId = $("#" + $(this).attr("id") + "_primary_key").val();
			getJSON(jsonObject,	WEB_SERVICE_URL + '/selectOptionsWS/getBranchListByStateId.do', _thisPopulate.setDestinationBranch, EXECUTE_WITHOUT_ERROR);
		}, setBranchGSTN : function (branchGSTN) {
			if(branchGSTN != undefined)
				$("#GSTNEle").val(branchGSTN);
			else
				$("#GSTNEle").val("--");
		}, setBranchAutocompleteWithSelectize : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.branchList,
				valueField		:	'branchId',
				labelField		:	'branchName',
				searchField		:	'branchName',
				elementId		:	'branchEle',
				create			: 	false,
				maxItems		: 	1
			});
		}, setHamalTeamLeader : function(response) {
			let hamalLeaderAutoComplete 			= new Object();
			hamalLeaderAutoComplete.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getHamalTeamLeaderAutocomplete.do?';
			hamalLeaderAutoComplete.primary_key 	= 'hamalMasterId';
			hamalLeaderAutoComplete.field 			= 'displayName';
			$(elementConfiguration.hamalTeamLeaderElement).autocompleteCustom(hamalLeaderAutoComplete);
		}, setCrossingAgentSourceAutocomplete : function(response) {
			Selectizewrapper.setAutocomplete({
				url				: WEB_SERVICE_URL+'/autoCompleteWS/getSourceCrossingAgentMaster.do?crossingAgentType=' + response.crossingAgentType,
				valueField		:	'crossingAgentMasterId',
				labelField		:	'name',
				searchField		:	'name',
				elementId		:	elementConfiguration.crossingAgentSrcElement,
				responseObjectKey : 'result',
				create			: 	false,
				maxItems		: 	1
			});
		}, setSourceBranchAutocomplete : function(elementConfiguration) {
			Selectizewrapper.setAutocomplete({
				url				: WEB_SERVICE_URL+'/autoCompleteWS/getDeliveryPointDestinationBranch.do?branchType=3&isOwnBranchRequired=true&isOwnBranchWithLocationsRequired=false&branchNetworkConfiguration=false&isOnlyPhysicalBranchesRequired=false',
				valueField		:	'branchId',
				labelField		:	'branchDisplayName',
				searchField		:	'branchDisplayName',
				elementId		:	elementConfiguration.branchElement,
				responseObjectKey : 'branchModel',
				create			: 	false,
				maxItems		: 	1
			});
		}, setDeliveryDestinationAutocomplete : function(elementConfiguration) {
			Selectizewrapper.setAutocomplete({
				url				: WEB_SERVICE_URL+'/autoCompleteWS/getDeliveryPointDestinationBranch.do?branchType=3&isOwnBranchRequired=true&isOwnBranchWithLocationsRequired=false&branchNetworkConfiguration=false&isOnlyPhysicalBranchesRequired=false',
				valueField		:	'branchId',
				labelField		:	'branchDisplayName',
				searchField		:	'branchDisplayName',
				elementId		:	elementConfiguration.destBranchElement,
				responseObjectKey : 'branchModel',
				create			: 	false,
				maxItems		: 	1
			});
		}, setCrossingAgentBookingSourceMap : function(elementConfiguration, crossingAgentId) {
			Selectizewrapper.setAutocomplete({
				url				: WEB_SERVICE_URL+'/autoCompleteWS/getCrossingAgentBookingSourceMap.do?crossingAgentId=' + crossingAgentId,
				valueField		:	'bookingLocationId',
				labelField		:	'branchWithSubRegionName',
				searchField		:	'branchWithSubRegionName',
				elementId		:	elementConfiguration.branchElement,
				responseObjectKey : 'result',
				create			: 	false,
				maxItems		: 	1
			});
		}, setPartyAutocompleteWithCallback : function(partyNameElement, response, callBack) {
			let autoComplete 			= new Object();
			autoComplete.primary_key 	= 'corporateAccountId';
			autoComplete.field 			= 'corporateAccountDisplayName';
			autoComplete.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getPartyDetailsAutocomplete.do?isSearchByAllParty=' + response.isSearchByAllParty + '&isShowDeactivateParty=' + response.isShowDeactivateParty + '&showAlloption=' + response.AllOptionInPartyAutocomplete;
			
			if(callBack != null)
				autoComplete.callBack 			= callBack;
			
			$(partyNameElement).autocompleteCustom(autoComplete);
		}, setDivisionList : function(response) {
			let divisionAutoComplete 			= new Object();
			divisionAutoComplete.url 			= WEB_SERVICE_URL+'/selectOptionsWS/getDivisionMasterAutocomplete.do?AllOptionForDivision=' + AllOptionForDivision;
			divisionAutoComplete.primary_key 	= 'divisionMasterId';
			divisionAutoComplete.field 			= 'name';
			$(elementConfiguration.divisionElement).autocompleteCustom(divisionAutoComplete);
		}, getRegionOnAccountGroupChange : function() {
			if(!isRegionOnGroupSelection) return;
			
			let jsonObject					= new Object();
			jsonObject.accountGroupId	= $('#accountGroupEle').val();
					
			getJSON(jsonObject, WEB_SERVICE_URL + '/selectOptionsWS/getRegionOption.do?', _thisPopulate.setRegionOption, EXECUTE_WITH_ERROR);
		}, setRegionOption : function(response) {
			let srcAutoRegionName 	= $(elementConfiguration.regionElement).getInstance();

			$(srcAutoRegionName).each(function() {
				this.option.source 	= response.region;
			});
		}, setAllOptionInSubRegionBranch : function() {
			$("#regionEle").on("change", function() {
				let ALLTEXT = "ALL";
				let setId = "-1";
				
				let jsonArray = new Array();
				jsonArray.push(elementConfiguration.branchElement);
				
				if(typeof executiveListByBranch !== 'undefined' && executiveListByBranch)
					jsonArray.push(elementConfiguration.executiveElement);
				
				_thisPopulate.resetAutcomplete(jsonArray);
								
				if($(this).val() == ALLTEXT) {
					$("#subRegionEle").val(ALLTEXT);
					$("#subRegionEle_primary_key").val(setId);
					$("#subRegionEle").trigger('change');
				
					$("#branchEle").val(ALLTEXT);
					$("#branchEle_primary_key").val(setId);
					
					if(typeof executiveListByBranch !== 'undefined' && executiveListByBranch) {
						$("#executiveEle").val(ALLTEXT);
						$("#executiveEle_primary_key").val(setId);
					}
				} else {
					$("#executiveEle").val('');
					$("#executiveEle_primary_key").val(0);
				}
			});
		}, setAllOptionInBranch : function() {
			$("#subRegionEle").on("change", function() {
				let ALLTEXT = "ALL";
				let setId = "-1";
										
				if($(this).val() == ALLTEXT) {
					$("#branchEle").val(ALLTEXT);
					$("#branchEle_primary_key").val(setId);
					
					if(typeof executiveListByBranch !== 'undefined' && executiveListByBranch) {
						$("#executiveEle").val(ALLTEXT);
						$("#executiveEle_primary_key").val(setId);
					}
				} else {
					$("#executiveEle").val('');
					$("#executiveEle_primary_key").val(0);
				}
			});
		}, setAllOptionInExecutive : function() {
			$("#branchEle").on("change", function() {
				let ALLTEXT = "ALL";
				let setId = "-1";
													
				if($(this).val() == ALLTEXT) {
					$("#executiveEle").val(ALLTEXT);
					$("#executiveEle_primary_key").val(setId);
				}
			});
		}, setServiceTypeSelectionList : function() {
			Selectizewrapper.setAutocomplete({
				url         : WEB_SERVICE_URL + '/autoCompleteWS/getVendorServiceTypeNameAutocomplete.do?',
				valueField  : 'serviceTypeMasterId', 
				labelField  : 'serviceName',   
				searchField : 'serviceName',  
				elementId   : elementConfiguration.serviceType,
				responseObjectKey : 'result',  
				create      : false,       
				maxItems    : null
			});
		}, setVendorNameAutocomplete: function() {
			Selectizewrapper.setAutocomplete({
				url			: WEB_SERVICE_URL + '/autoCompleteWS/getVendorNamesAutocomplete.do?',
				valueField	: 'vendorMasterId',
				labelField	: 'displayName',
				searchField	: ['name', 'mobileNumber'],
				elementId	: elementConfiguration.searchVendorName,
				responseObjectKey: 'result',
				create		: false,
				maxItems	: 1
			});
		}, setAutocompleteInstanceOfDestCity : function() {
			let cityNameAutoComplete 				= new Object();
			cityNameAutoComplete.primary_key 		= 'cityId';
			cityNameAutoComplete.field 				= 'cityName';
			$(elementConfiguration.destCityElement).autocompleteCustom(cityNameAutoComplete);
		}, setDestCityOnStateSelect : function() {
			let jsonArray = new Array();
			jsonArray.push(elementConfiguration.destCityElement);
			_thisPopulate.resetAutcomplete(jsonArray);
					
			let stateId = $("#" + $(this).attr("id") + "_primary_key").val();
					
			if(stateId == undefined || stateId == 0) return;
					
			let jsonObject = new Object();
			jsonObject.stateId = stateId;
			getJSON(jsonObject,	WEB_SERVICE_URL + '/cityWS/getCityForDropDown.do', _thisPopulate.setDestCity, EXECUTE_WITHOUT_ERROR);
		}, setDestCity : function(response) {
			let cityName 		= $(elementConfiguration.destCityElement).getInstance();

			$(cityName).each(function() {
				this.option.source 	= response.city;
			});
		}, setAllOptionInDestSubRegionBranch : function() {
			(elementConfiguration.destRegionElement).on("change", function() {
				let ALLTEXT = "ALL";
				let setId = "-1";
						
				let jsonArray = new Array();
				jsonArray.push(elementConfiguration.destSubregionElement);
				jsonArray.push(elementConfiguration.destBranchElement);
				_thisPopulate.resetAutcomplete(jsonArray);
				
				let toSubRegionEle = elementConfiguration.destSubregionElement.replace(/[()$]/g, '');
				let toBranchEle = elementConfiguration.destBranchElement.replace(/[()$]/g, '');
										
				if($(this).val() == ALLTEXT) {
					(elementConfiguration.destSubregionElement).val(ALLTEXT);
					$("#" + toSubRegionEle + "_primary_key").val(setId);
					(elementConfiguration.destSubregionElement).trigger('change');
						
					(elementConfiguration.destBranchElement).val(ALLTEXT);
					$("#" + toBranchEle + "_primary_key").val(setId);
				}
			});
		}, setAllOptionInDestBranch : function() {
			(elementConfiguration.destSubregionElement).on("change", function() {
				let ALLTEXT = "ALL";
				let setId = "-1";
												
				if($(this).val() == ALLTEXT) {
					let toBranchEle = elementConfiguration.destBranchElement.replace(/[()$]/g, '');
					(elementConfiguration.destBranchElement).val(ALLTEXT);
					$("#" + toBranchEle + "_primary_key").val(setId);
				}
			});
		}, setAutocompleteInstanceOfUnifiedArea : function() {
			let unifiedAreaAutoComplete = new Object();
			unifiedAreaAutoComplete.primary_key = 'id';
			unifiedAreaAutoComplete.field       = 'DisplayName';
			$(elementConfiguration.unifiedAreaElement).autocompleteCustom(unifiedAreaAutoComplete);
		}, setAutocompleteInstanceOfUnifiedToArea : function() {
			let unifiedAreaAutoComplete = new Object();
			unifiedAreaAutoComplete.primary_key = 'id';
			unifiedAreaAutoComplete.field       = 'DisplayName';
			$(elementConfiguration.unifiedToAreaElement).autocompleteCustom(unifiedAreaAutoComplete);
		}, setUnifiedArea: function(response) {
			let autoUnifiedArea = $(elementConfiguration.unifiedAreaElement).getInstance();
		
			$(autoUnifiedArea).each(function() {
				this.option.source = response.unifiedAreaList;
			});
		}, setUnifiedToArea: function(response) {
			let autoUnifiedArea = $(elementConfiguration.unifiedToAreaElement).getInstance();
			
			$(autoUnifiedArea).each(function() {
				this.option.source = response.unifiedToAreaList;
			});
		}
	}
});

function setElementData(jsonObject) {
	if($("#dateEle").attr('data-startdate') != undefined)
		jsonObject["fromDate"] 	= $("#dateEle").attr('data-startdate'); 

	if($("#dateEle").attr('data-enddate') != undefined)
		jsonObject["toDate"] 	= $("#dateEle").attr('data-enddate'); 
			
	if($('#regionEle_primary_key').exists())
		jsonObject["regionId"] 	= $('#regionEle_primary_key').val();
	else
		jsonObject["regionId"]	= $('#regionEle').val();
				
	if($('#subRegionEle_primary_key').exists())
		jsonObject["subRegionId"] 	= $('#subRegionEle_primary_key').val();
	else
		jsonObject["subRegionId"]	= $('#subRegionEle').val();
				
	if($('#branchEle_primary_key').exists())
		jsonObject["sourceBranchId"] 	= $('#branchEle_primary_key').val();
	else
		jsonObject["sourceBranchId"]	= $('#branchEle').val();
				
	if($('#vehicleNumberEle_primary_key').exists())
		jsonObject["vehicleNumberMasterId"] = $('#vehicleNumberEle_primary_key').val();
	else
		jsonObject["vehicleNumberMasterId"]	= $('#vehicleNumberEle').val();
				
	if($('#vehicleAgentEle_primary_key').exists())
		jsonObject["vehicleAgentMasterId"] 	= $('#vehicleAgentEle_primary_key').val();
	else
		jsonObject["vehicleAgentMasterId"]	= $('#vehicleAgentEle').val();
				
	if($('#destRegionEle_primary_key').exists())
		jsonObject["destinationRegionId"] 	= $('#destRegionEle_primary_key').val();
	else
		jsonObject["destinationRegionId"]	= $('#destRegionEle').val();
				
	if($('#destSubRegionEle_primary_key').exists())
		jsonObject["destinationSubRegionId"] 	= $('#destSubRegionEle_primary_key').val();
	else
		jsonObject["destinationSubRegionId"]	= $('#destSubRegionEle').val();
				
	if($('#destBranchEle_primary_key').exists())
		jsonObject["destinationBranchId"] 	= $('#destBranchEle_primary_key').val();
	else
		jsonObject["destinationBranchId"]	= $('#destBranchEle').val();
				
	jsonObject["bankAccountId"]			= $('#bankEle_primary_key').val();
	jsonObject["stateId"] 				= $('#srcStateEle_primary_key').val();
	jsonObject["toStateId"] 			= $('#toStateEle_primary_key').val();
	jsonObject["companyHeadMasterId"] 	= $("#companyNameEle_primary_key").val();
			
	if($('#crossingAgentEle_primary_key').exists())
		jsonObject["crossingAgentId"] 	= $('#crossingAgentEle_primary_key').val();
	else
		jsonObject["crossingAgentId"] 	= $('#crossingAgentEle').val();
				
	if($('#partyNameEle_primary_key').exists())
		jsonObject["corporateAccountId"] 	= $('#partyNameEle_primary_key').val();
	else
		jsonObject["corporateAccountId"] 	= $('#partyNameEle').val();
			
	if($('#billSelectionEle_primary_key').exists())
		jsonObject["billSelectionId"] 	= $('#billSelectionEle_primary_key').val();
	else
		jsonObject["billSelectionId"] 	= $('#billSelectionEle').val();
				
	if($('#transportationModeEle_primary_key').exists())
		jsonObject["transportationModeId"] 	= $('#transportationModeEle_primary_key').val();
	else
		jsonObject["transportationModeId"] 	= $('#transportationModeEle').val();
				
	jsonObject["bookingTypeId"]				= $('#bookingTypeEle_primary_key').val();
	jsonObject["paymentTypeId"] 			= $('#paymentTypeEle_primary_key').val();
	jsonObject["searchType"]	 			= $('#searchTypeEle_primary_key').val();
	jsonObject["driverMasterId"]	 		= $('#driverNameEle_primary_key').val();
	jsonObject["partyAgentId"] 				= $('#partyAgentEle_primary_key').val();
	jsonObject["selectedExecutiveId"] 		= $('#executiveEle_primary_key').val();
	
	if($('#collectionPersonEle_primary_key').exists())
		jsonObject["collectionPersonId"] 	= $('#collectionPersonEle_primary_key').val();
	else
		jsonObject["collectionPersonId"] 	= $('#collectionPersonEle').val();
	
	if($('#lrTypeEle_primary_key').exists())
		jsonObject["lrType"] 	= $('#lrTypeEle_primary_key').val();
	else
		jsonObject["lrType"] 	= $('#lrTypeEle').val();
	
	if($('#divisionEle_primary_key').exists())
		jsonObject["divisionId"] 	= $('#divisionEle_primary_key').val();
	else
		jsonObject["divisionId"] 	= $('#divisionEle').val();
	
	if($('#packingTypeEle_primary_key').exists())
		jsonObject["packingTypeMasterId"] 	= $('#packingTypeEle_primary_key').val();
	else
		jsonObject["packingTypeMasterId"] 	= $('#packingTypeEle').val();
	
	jsonObject.vehicleOwnerTypeId = $("#vehicleOwnerTypeEle_primary_key").val();
}