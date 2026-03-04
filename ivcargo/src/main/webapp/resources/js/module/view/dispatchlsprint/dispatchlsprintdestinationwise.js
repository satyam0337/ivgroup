var dispatchLedgerId	= 0;
var isInvalidEwayBillDataLr = [];
define(['JsonUtility',
		//jsonutility consist of ajax calls to send json object as an ajax hit to the url specified and get call back as specified
		'messageUtility',
		PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
		// to get parameter from url to send it to ws
		PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchlsprint/dispatchlsprintsetupdestinationwise.js',
		PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchlsprint/LoadingSheet_1.js',
		'jquerylingua',
		'language',
		PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchlsprint/lsprintsetupdestinationwise.js',
		PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchlsprint/lsprintsetupdestinationwiseBato.js',
		PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchlsprint/lsprintsetupdestinationwisewithoutsummary.js',
		PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchlsprint/dispatchlsprintsummary.js',
		PROJECT_IVUIRESOURCES+'/js/jspdf/html2canvas.js',
		 PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchlsprint/lsprintsetupdestinationwisePsr.js',
		
		],
		function(JsonUtility, MessageUtility, UrlParameter, LSPrintSetUp, LSPrintSetUp_1, jquerylingua, language,lsprintsetupdestinationwise,lsprintsetupdestinationwiseBato,lsprintsetupdestinationwisewithoutsummary,dispatchlsprintsummary,html2canvas,lsprintsetupdestinationwisePsr) {
	'use strict';// this basically give strictness to this specific js
	var 
	masterId = "0",
	jsonObject	= new Object(),
	pageBreaker,
	pageCounter,
	print_Model,
	printType,
	isSearchModule,
	lrDetailsPrint,
	tableDataHm	= new Object(),
	lr_Summary = new Object(),
	ls_lr_Form_Summary = new Object(),
	ls_Header = new Object(),
	flavor_default	= "loadingSheet_default",
	flavorConfiguration	= null,
	flavor_1	= "loadingSheet_1",//mps done
	flavor_2	= "loadingSheet_2",//jtm done
	flavor_3	= "loadingSheet_3",//abbas done
	flavor_5	= "loadingSheet_5", //KRL
	flavor_6	= "loadingSheet_6",//mrl done
	flavor_7	= "loadingSheet_7",//ats done
	flavor_8	= "loadingSheet_8",//gowtham
	flavor_9	= "loadingSheet_9",//bhaskar
	flavor_10	= "loadingSheet_10",// Konduskar
	flavor_11	= "loadingSheet_11",// Poornima
	flavor_12	= "loadingSheet_12",// Sri Sai 
	flavor_13	= "loadingSheet_13",// Jaypee 
	flavor_14	= "loadingSheet_14",// Swastik 
	flavor_15	= "loadingSheet_15",// aptc 
	flavor_16	= "loadingSheet_16",// scc	"loadingSheet_270"	 scc Crossing ls print
	flavor_17	= "loadingSheet_17",// Amr
	flavor_18	= "loadingSheet_18",// durgamba
	flavor_19	= "loadingSheet_19",// ops
	flavor_20	= "loadingSheet_20",// megha
	flavor_21	= "loadingSheet_21",// BCT
	flavor_22	= "loadingSheet_22",// Dhariwal
	flavor_23	= "loadingSheet_23",// SSC
	flavor_24	= "loadingSheet_24",// AR
	flavor_25	= "loadingSheet_25",// DEEJAY SPEED LOGISTICS (same As Flavour 12 but Only Without Summary)
	flavor_26	= "loadingSheet_26",// RMT
	flavor_27	= "loadingSheet_27",// ARL (Aditya Roadlines)
	flavor_28	= "loadingSheet_28",// Rajasthan Travals
	flavor_29	= "loadingSheet_29",// SkyCity
	flavor_30	= "loadingSheet_30",// KNS
	flavor_31	= "loadingSheet_31",// ARC (Amma Road Carriers)
	flavor_32	= "loadingSheet_32",// Shah
	flavor_33	= "loadingSheet_33",// CHIRAG_TRAVELS
	flavor_34	= "loadingSheet_34",// KOTHARI_TRAVELS
	flavor_35	= "loadingSheet_35",// Citylink 
	flavor_36	= "loadingSheet_36",// punjab Travels
	flavor_37	= "loadingSheet_37",// SAIKRISHNA Travels
	flavor_38	= "loadingSheet_38",// ANDHRA BOMBAY CARRIERS.
	flavor_39	= "loadingSheet_39",// SRL - SHREE KUMAR ROADLINES
	flavor_40	= "loadingSheet_40",// SAMARTH TRANSPORT COMPANY
	flavor_41	= "loadingSheet_41",//Namratha travels and cargo.
	flavor_42	= "loadingSheet_42",// V3 Express Cargo
	flavor_43	= "loadingSheet_43",// Kalptaru Roadlines
	flavor_44	= "loadingSheet_44",// SKL
	flavor_45	= "loadingSheet_45",// Srtc
	flavor_46	= "loadingSheet_46",// Swagat Roadways
	flavor_47	= "loadingSheet_47",// Intercity Travels
	flavor_48	= "loadingSheet_48",//Sri Sambasiva Cargo Carriers
	flavor_49	= "loadingSheet_49",//
	flavor_51	= "loadingSheet_51",//Asian			
	flavor_52	= "loadingSheet_52",// Ali
	flavor_53	= "loadingSheet_53",//vrc	
	flavor_54	= "loadingSheet_54",//ssts	
	flavor_55	= "loadingSheet_55",//dashmesh	
	flavor_56	= "loadingSheet_56",//kps	
	flavor_57	= "loadingSheet_57",//prabhat	
	flavor_58	= "loadingSheet_58",//sta	
	flavor_59	= "loadingSheet_59",//dynamic
	flavor_60	= "loadingSheet_60",//kcm
	flavor_61	= "loadingSheet_61",//Manish
	flavor_62	= "loadingSheet_62",//snt
	flavor_63	= "loadingSheet_63",//pptpl
	flavor_64	= "loadingSheet_64",//darshan
	flavor_65	= "loadingSheet_65",//manokamana
	flavor_66	= "loadingSheet_66",//shreeji
	flavor_67	= "loadingSheet_67",//ggs
	flavor_68	= "loadingSheet_68",//unique
	flavor_69	= "loadingSheet_69",//SJVT
	flavor_71	= "loadingSheet_71",//mls
	flavor_72	= "loadingSheet_72",//SL
	flavor_73	= "loadingSheet_73",//SMTC
	flavor_74	= "loadingSheet_74",//GTM
	flavor_75	= "loadingSheet_75",//SVR
	flavor_76	= "loadingSheet_76",//SKS Travels
	flavor_77	= "loadingSheet_77",//CXL
	flavor_78	= "loadingSheet_78",//stsf
	flavor_79	= "loadingSheet_79",//CCI
	flavor_80	= "loadingSheet_80",//Sun roadways
	flavor_82	= "loadingSheet_82",//MGT
	flavor_81	= "loadingSheet_81",//pr
	flavor_83	= "loadingSheet_83",//sugama
	flavor_84	= "loadingSheet_84",//aptCargo
	flavor_85	= "loadingSheet_85",//LGL
	flavor_86	= "loadingSheet_86",//RGLPL 
	flavor_89	= "loadingSheet_89",//KGS 
	flavor_88	= "loadingSheet_88",//KXCPL 
	flavor_87	= "loadingSheet_87",//HPS 
	flavor_90	= "loadingSheet_90",//DLT Logistic 
	flavor_91	= "loadingSheet_91",//APT Logistic 
	flavor_92	= "loadingSheet_92",//Seabird
	flavor_93	= "loadingSheet_93",//Mahesh mt
	flavor_94	= "loadingSheet_94",//JMBS
	flavor_95	= "loadingSheet_95",//Shiv
	flavor_96	= "loadingSheet_96",//SIRPL
	flavor_97	= "loadingSheet_97",//GEC
	flavor_98	= "loadingSheet_98",//SpeedLink
	flavor_99	= "loadingSheet_99",//Puneeth Cargo
	flavor_100	= "loadingSheet_100",//Sri Sivasai Transport
	flavor_101	= "loadingSheet_101",//Rajeshwari Parcel Service
	flavor_102	= "loadingSheet_102",//Milan Transport
	flavor_103	= "loadingSheet_103",//GTS
	flavor_104	= "loadingSheet_104",//sakar
	flavor_105	= "loadingSheet_105",//kgn
	flavor_106	= "loadingSheet_106",//sbt
	flavor_107	= "loadingSheet_107",//avtc
	flavor_108	= "loadingSheet_108",//srmt
	flavor_109	= "loadingSheet_109",//mpr
	flavor_110	= "loadingSheet_110",//scm
	flavor_111	= "loadingSheet_111",//ALT
	flavor_112	= "loadingSheet_112",//RDPS
	flavor_113	= "loadingSheet_113",//sadasiva
	flavor_114	= "loadingSheet_114",//Ansari Travels
	flavor_115	= "loadingSheet_115",//PTC
	flavor_116	= "loadingSheet_116",//Batco
	flavor_117	= "loadingSheet_117",//ternex
	flavor_118	= "loadingSheet_118",//RE
	flavor_119	= "loadingSheet_119",//Rectus
	flavor_120	= "loadingSheet_120",//Safar
	flavor_121	= "loadingSheet_121",//Patel
	flavor_122	= "loadingSheet_122",//ssls
	flavor_123	= "loadingSheet_123",//sjat
	flavor_124	= "loadingSheet_124",//ssl
	flavor_125	= "loadingSheet_125",//maheshCargo
	flavor_126	= "loadingSheet_126",//NTCP
	flavor_127	= "loadingSheet_127",//NVT
	flavor_128	= "loadingSheet_128",//PRC
	flavor_129	= "loadingSheet_129",//Urvashi
	flavor_130	= "loadingSheet_130",//DT
	flavor_131	= "loadingSheet_131",//ht
	flavor_132	= "loadingSheet_132",//CTG
	flavor_135	= "loadingSheet_135",//vc
	flavor_133	= "loadingSheet_133",//APS
	flavor_136	= "loadingSheet_136",//smps
	flavor_138	= "loadingSheet_138",//APS
	flavor_139	= "loadingSheet_139",//AV
	flavor_140	= "loadingSheet_140",//BABA
	flavor_142	= "loadingSheet_142",//Dhanam
	flavor_137	= "loadingSheet_137",//NR
	flavor_143	= "loadingSheet_143",//SN
	flavor_145	= "loadingSheet_145",//SC
	flavor_145_3  = "loadingSheet_145_3",//SC Inter Branch
	flavor_146	= "loadingSheet_146",//SKS
	flavor_148	= "loadingSheet_148",//SRR
	flavor_149	= "loadingSheet_149",//SHUBH
	flavor_150	= "loadingSheet_150",//SNTS
	flavor_151	= "loadingSheet_151",//Pooja
	flavor_152	= "loadingSheet_152",//JMGC
	flavor_151_4  = "loadingSheet_151_4",//Pooja Crossing Agent
	flavor_LsPrintConfiguration_2  = "LsPrintConfiguration_2",//NTCP
	flavor_153	= "loadingSheet_153",//hanumann
	flavor_154	= "loadingSheet_154",//Bharat
	flavor_155	= "loadingSheet_155",//Pankaj
	flavor_147	= "loadingSheet_147",//ST
	flavor_157	= "loadingSheet_157",//NM
	flavor_159	= "loadingSheet_159",//
	flavor_160	= "loadingSheet_160",//Suryadev
	flavor_158	= "loadingSheet_158",//SRLIPL
	flavor_162	= "loadingSheet_162",//ASHEESH
	flavor_163	= "loadingSheet_163",//ctc
	flavor_164	= "loadingSheet_164",//SBS
	flavor_165	= "loadingSheet_165",//Sairass
	
	flavor_166	= "loadingSheet_166",//smdtcl
	flavor_168	= "loadingSheet_168",//snlt
	flavor_169	= "loadingSheet_169",//NML
	flavor_170	= "loadingSheet_170",//atc
	flavor_171	= "loadingSheet_171",//ATL
	flavor_172	= "loadingSheet_172",//manoj
	flavor_laser_341  = "loadingSheet_Laser_341",//prabhat
	flavor_167	= "loadingSheet_167",//Laxmi
	flavor_174 =  "loadingSheet_174",//alok
	flavor_173	= "loadingSheet_173",//kkps
	flavor_Commission_180 =	 "lsCommission_554",//alok
	flavor_Commission_default =	 "lsCommission_default",//default
	flavor_181	= "loadingSheet_181",//HHCS
	flavor_179	= "loadingSheet_179", //btc

	flavor_176	= "loadingSheet_176",//ntcs
	flavor_183	= "loadingSheet_183",//OMTPT
	flavor_184	= "loadingSheet_184",//sgtt
	flavor_252	= "loadingSheet_252",// Dhariwal
	flavor_551	= "loadingSheet_551",//SGT
	flavor_564	= "loadingSheet_564",//SHARMATPT
	flavor_567	= "loadingSheet_567",//KAVILOGISTICS
	flavor_569	= "loadingSheet_569",//SHUBHAM
	flavor_557	= "loadingSheet_557",//SGT
	flavor_563	= "loadingSheet_563",//PSR
	flavor_574	= "loadingSheet_574",//kmp
	flavor_565	= "loadingSheet_565",//SSTPL
	flavor_570	= "loadingSheet_570",//HIRA
	flavor_571	= "loadingSheet_571",//UPGTC
	flavor_Commission_557 =	 "lsCommission_557",
	flavor_581	= "loadingSheet_581",//DEEPAK
	flavor_defaultNew  = "loadingSheet_defaultNew",
	flavor_582	= "loadingSheet_582",//sharmaCargo
	flavor_558	= "loadingSheet_558",//KCPL
	flavor_572	= "loadingSheet_572",//TCS
	flavor_573	= "loadingSheet_573",//Local Wheels
	flavor_586	= "loadingSheet_586",//VRPS
	flavor_584	= "loadingSheet_584",//mahasagar
	flavor_566	= "loadingSheet_566",//SPRS
	flavor_585	= "loadingSheet_585",//arcs
	flavor_578	= "loadingSheet_578",//KMPS
	flavor_589	= "loadingSheet_589",//MLT
	flavor_Commission_588 =	 "lsCommission_588",
	flavor_593	= "loadingSheet_593",//ganesh
	flavor_592 =  "loadingSheet_592",
	flavor_Commission_593 =	 "lsCommission_593",
	flavor_Commission_7 =  "lsCommission_7",//ktc
	flavor_Commission_597 =	 "lsCommission_597",
	flavor_595	= "loadingSheet_595",//kkn
	flavor_596	= "loadingSheet_596",//REL
	flavor_580 =  "loadingSheet_580", //Bhor
	flavor_598 =  "loadingSheet_598", //SKY 
	flavor_608 =  "loadingSheet_608", //PT 
	flavor_610 =  "loadingSheet_610", //Nts
	flavor_Commission_605 =	 "lsCommission_605",//USHA
	flavor_604 = "loadingSheet_604",//KR
	flavor_612 = "loadingSheet_612",//stcm
	flavor_609 =  "loadingSheet_609", //PT 
	flavor_616 = "loadingSheet_616",//YGTC
	flavor_617 = "loadingSheet_617",//Anand
	flavor_594 = "loadingSheet_594",//Jabbar
	flavor_615 = "loadingSheet_615",//Paulstrans
	flavor_623 = "loadingSheet_623",//sscs
	flavor_620	= "loadingSheet_620",//HA
	flavor_619 = "loadingSheet_619",//Renuka
	flavor_621	= "loadingSheet_621",//VPT
	flavor_628	= "loadingSheet_628",//JKTC
	flavor_627	= "loadingSheet_627",//JKTC
	flavor_625	= "loadingSheet_625",//Edisafe
	flavor_636	= "loadingSheet_636",//Mtivcargo
	flavor_631	= "loadingSheet_631",
	flavor_633	= "loadingSheet_633", //SBTR
	flavor_638	= "loadingSheet_638", //RTC
	flavor_626	= "loadingSheet_626", //SKM
	flavor_634	= "loadingSheet_634", //CRS
	flavor_635	= "loadingSheet_635", //CLS
	flavor_646	= "loadingSheet_646", //SBR
	flavor_644	= "loadingSheet_644",//PaSRLLP
	flavor_Commission_343 =	 "lsCommission_343",//STA
	flavor_651	= "loadingSheet_651", //ndtc
	flavor_Commission_641 =	 "lsCommission_641",
	flavor_649	= "loadingSheet_649", //samcargos,
	flavor_650	= "loadingSheet_650", //slpl
	flavor_643	= "loadingSheet_643", //srCargo
	flavor_678	= "loadingSheet_648", //dlsexpress
	flavor_470	= "loadingSheet_470",//GTT
	flavor_645 =  "loadingSheet_645", //SFC
	flavor_664	= "loadingSheet_664", //SUCCESS
	flavor_669	= "loadingSheet_669", //APRIM
	flavor_672	= "loadingSheet_672", //ALAYA
	flavor_605	= "loadingSheet_605", //USHA
	flavor_673	= "loadingSheet_673",//BNRACC
	flavor_642	= "loadingSheet_642",//Musafir
	flavor_Commission_622 =	 "lsCommission_622",
	flavor_675 =  "loadingSheet_675", //NBR
	flavor_231 = "loadingSheet_231", // DLS
	flavor_534 = "loadingSheet_534", //DLTP
	flavor_540 = "loadingSheet_540", //DHL
	flavor_679 =  "loadingSheet_679", //Omkar
	flavor_684	= "loadingSheet_684", //obl 
	flavor_685	= "loadingSheet_685", //ML
	flavor_694	= "loadingSheet_694", //RC 
	flavor_692	= "loadingSheet_692", //VMTCS
	flavor_700	= "loadingSheet_700", //reporter
	flavor_697	= "loadingSheet_697", //sangam 
	flavor_702	= "loadingSheet_702", //BMCC
	flavor_707	= "loadingSheet_707", //NTM
	flavor_710	= "loadingSheet_710", //SRES
	flavor_709	= "loadingSheet_709", //SAPAN
	flavor_705	= "loadingSheet_705", //PANINDIA
	flavor_711	= "loadingSheet_711", //SKLC
	flavor_691	= "loadingSheet_691", //SKLC
	flavor_698	= "loadingSheet_698", //SRST
	flavor_715	= "loadingSheet_715",// RoyalSC
	flavor_719	= "loadingSheet_719", //MAT
	flavor_714	= "loadingSheet_714",// MR
	flavor_720	= "loadingSheet_720", //FLYFS
	flavor_724	= "loadingSheet_724", // husmsafar
	flavor_727	= "loadingSheet_727",// Sharma
	flavor_Commission_721 =	 "lsCommission_721",//SETT
	flavor_712	= "loadingSheet_712",// shreeram
	flavor_731	= "loadingSheet_731",// Dolphin
	flavor_729	= "loadingSheet_729",// SSR
	flavor_717	= "loadingSheet_717",// HKT
	flavor_730	= "loadingSheet_730", // MKR
	flavor_734	= "loadingSheet_734",// HKT
	flavor_Commission_728 =  "lsCommission_728",
	flavor_Commission_718 =  "lsCommission_718",
	flavor_Commission_701 =  "lsCommission_701",
	flavor_Commission_945 =  "lsCommission_945",
	flavor_Commission_967 =  "lsCommission_967",
	flavor_Commission_973 =  "lsCommission_973",
	flavor_Commission_984 =  "lsCommission_984",
	flavor_704	= "loadingSheet_704",// Ambika
	flavor_741	= "loadingSheet_741",//AQJ
	flavor_737	 = "loadingSheet_737",//RGLPL 
	flavor_253	= "loadingSheet_253",// lavi
	flavor_743	= "loadingSheet_743",//DSE
	flavor_742	= "loadingSheet_742",// SES
	flavor_735	= "loadingSheet_735",//GURUKRUPA
	flavor_740	= "loadingSheet_740",//GLDTS
	flavor_680	= "loadingSheet_680",// SRSTC
	flavor_753	= "loadingSheet_753",// FASTLANE
	flavor_754	= "loadingSheet_754",// VEERTR
	flavor_345	= "loadingSheet_345",//kps	
	flavor_411	= "loadingSheet_411",//GTS
	flavor_345	= "loadingSheet_345",//kps	
	flavor_759	= "loadingSheet_759",// JAP
	flavor_751	= "loadingSheet_751",// NOVA
	flavor_763	= "loadingSheet_763",// GARUDA
	flavor_746	= "loadingSheet_746",// SAL
	flavor_746_3 = "loadingSheet_746_3",// SAL INTERN BRANCH
	flavor_764	= "loadingSheet_764",// VTIPL
	flavor_767	= "loadingSheet_767",// RAJSHAKTI
	flavor_750	= "loadingSheet_750",// RAJSHAKTI
	flavor_761	= "loadingSheet_761",// BALAJI
	flavor_771	= "loadingSheet_771",// SANDEEP
	flavor_775	= "loadingSheet_775",// SRKT
	flavor_770	= "loadingSheet_770",// GIR
	flavor_749	= "loadingSheet_749",// NAVBHARAT
	flavor_725	= "loadingSheet_725",// NAVBHARAT
	flavor_777	= "loadingSheet_777",// ATI
    flavor_667	= "loadingSheet_667",// BRC
	flavor_545  = "loadingSheet_545",// KKPS
	flavor_768	= "loadingSheet_768",// ACCURATE
	flavor_384  = "loadingSheet_384",// STR
	flavor_242  = "loadingSheet_242",// SVT
	flavor_463  = "loadingSheet_463",// VC
	flavor_409  = "loadingSheet_409",// SPEEDLINK
	flavor_237  = "loadingSheet_237",// MST
	flavor_50   = "loadingSheet_50",// FALCON
	flavor_245  = "loadingSheet_245",// SDK
	flavor_533  = "loadingSheet_533",// CTC
	flavor_499  = "loadingSheet_499",// nakoda
	flavor_Commission_689 =	 "lsCommission_689", // ncs
	flavor_769	= "loadingSheet_769",// GIRNAR
	flavor_778	= "loadingSheet_778",// PTLT
	flavor_538	= "loadingSheet_538",// SMDTCL
	flavor_402	= "loadingSheet_402",// seabird
	flavor_894  = "loadingSheet_894",// SSBT (similar to SC)
	flavor_883  = "loadingSheet_883",// KRT (similar to SSBT)
	flavor_915  = "loadingSheet_915",// BSR (similar to KRT)
	flavor_907  = "loadingSheet_907",// SVTC (similar to SSBT)
	flavor_772  = "loadingsheetDetails_772",// 
	flavor_928  = "loadingSheet_928",// LDPS 
	flavor_289  = "loadingSheet_289",// RT 
	flavor_474  = "loadingSheet_474",// RT 
	flavor_476	= "loadingSheet_476",//ATM
	
	//do not add any groups flavor which group id is more than 780

	lengthOfDataTable				= 0,
	flaverNo,
	dispatchLSPrintModel,packingTypeHM,
	subStringLength					= 12,
	isCrossingLS					= false,
	crossingTxnTypeId				= 0,
	crossingAgentId					= 0,
	totalCommission					=0,
	TRANSACTION_TYPE_DELIVERY_CROSSING				= 1,
	TRANSACTION_TYPE_BOOKING_CROSSING				= 2,
	deliveryCommission								= 0.0,
	lhpvChargeData, blhpvChargeData = null,
	isPrivateMarkExists					= false,
	removeAmountBranchIdsWise			= false,
	allowCollPercentage					= false,
	lsDestBranch						= false,
	lsSrcBranch							= false,
	allowFlavorTypeForLsSearch			= false,
	flavorTypeForLsSearch				= null,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(){
			
			//masterid is fetched and passed when the view is called and it is set to fetch it from webservice
			masterId		= UrlParameter.getModuleNameFromParam(MASTERID)
			printType		= UrlParameter.getModuleNameFromParam('Type')
			isSearchModule	= UrlParameter.getModuleNameFromParam('isSearchModule')
			lrDetailsPrint	= UrlParameter.getModuleNameFromParam('lrDetailsPrint');
			
			//initialize is the first function called on call new view()
			_this = this;
		}, render: function() {
			dispatchLedgerId	= masterId;
			jsonObject.dispatchLedgerId = masterId;
			jsonObject.isSearchModule = isSearchModule;
			getJSON(jsonObject, WEB_SERVICE_URL + '/dispatchWs/getDestinationWiseLoadingSheetPrintByDispatchLedgerId.do?', _this.onGetLSPrintByDLId, EXECUTE_WITHOUT_ERROR);
			
			return _this;
		}, onGetLSPrintByDLId : function(response) {			
			
			flavor_LsPrintConfiguration_2  = "LsPrintConfiguration_" + response.lsprintConfigurationID;

			_this.getObjectsFromCollection(response);
			hideLayer();
			
			
			flavorConfiguration					= response.FlavorConfiguration;
			flaverNo							= flavorConfiguration.dispatchLSPrintFlavor;
			subStringLength						= flavorConfiguration.subStringLength;
			isCrossingLS						= response.isCrossingLS;
			crossingTxnTypeId					= response.crossingTxnTypeId;
			crossingAgentId						= response.crossingAgentId;
			isPrivateMarkExists					= true;
			dispatchLSPrintModel				=	response.dispatchLSPrintModel;
			lsDestBranch						= response.lsDestBranch;
			lsSrcBranch							= response.lsSrcBranch;
			allowCollPercentage					= response.branchCommisionPropObj.allowCollectionPercentage;
			allowFlavorTypeForLsSearch			= flavorConfiguration.allowFlavorTypeForLsSearch;
			flavorTypeForLsSearch				= flavorConfiguration.flavorTypeForLsSearch;
			
			
		  totalCommission =	Object.values(response.dispatchLRSummary)
			.map(v => Object.values(v))
			.flat(Infinity)
			.map(v => v.deliveryCommission)
			.reduce((a, b) => a + b, 0)
			
			var executive	= response.executive;
			
			if((allowFlavorTypeForLsSearch === 'true' || allowFlavorTypeForLsSearch === true) && flavorTypeForLsSearch != null && (lrDetailsPrint === 'true' || lrDetailsPrint === true)) {
				flaverNo = flavorTypeForLsSearch;
			}
			
			if (((executive.accountGroupId > ACCOUNT_GROUP_ID_APT || executive.accountGroupId == ACCOUNT_GROUP_ID_DEMO) && flaverNo == flavor_default) 
				|| (flaverNo == flavor_1
				|| flaverNo == flavor_2
				|| flaverNo == flavor_3
				|| flaverNo == flavor_5
				|| flaverNo == flavor_6
				|| flaverNo == flavor_7
				|| flaverNo == flavor_8
				|| flaverNo == flavor_9
				|| flaverNo == flavor_10
				|| flaverNo == flavor_11
				|| flaverNo == flavor_12
				|| flaverNo == flavor_13
				|| flaverNo == flavor_14
				|| flaverNo == flavor_15
				|| flaverNo == flavor_16
				|| flaverNo == flavor_17
				|| flaverNo == flavor_18
				|| flaverNo == flavor_19
				|| flaverNo == flavor_21
				|| flaverNo == flavor_22
				|| flaverNo == flavor_20
				|| flaverNo == flavor_23
				|| flaverNo == flavor_24
				|| flaverNo == flavor_25
				|| flaverNo == flavor_27
				|| flaverNo == flavor_28
				|| flaverNo == flavor_29
				|| flaverNo == flavor_30
				|| flaverNo == flavor_31
				|| flaverNo == flavor_32
				|| flaverNo == flavor_33
				|| flaverNo == flavor_34
				|| flaverNo == flavor_35
				|| flaverNo == flavor_36
				|| flaverNo == flavor_37
				|| flaverNo == flavor_38
				|| flaverNo == flavor_39
				|| flaverNo == flavor_40
				|| flaverNo == flavor_41
				|| flaverNo == flavor_42
				|| flaverNo == flavor_43
				|| flaverNo == flavor_44
				|| flaverNo == flavor_45
				|| flaverNo == flavor_46
				|| flaverNo == flavor_47
				|| flaverNo == flavor_48
				|| flaverNo == flavor_49
				|| flaverNo == flavor_51
				|| flaverNo == flavor_52
				|| flaverNo == flavor_53
				|| flaverNo == flavor_54
				|| flaverNo == flavor_56
				|| flaverNo == flavor_58
				|| flaverNo == flavor_59
				|| flaverNo == flavor_60
				|| flaverNo == flavor_61
				|| flaverNo == flavor_62
				|| flaverNo == flavor_63
				|| flaverNo == flavor_65
				|| flaverNo == flavor_66
				|| flaverNo == flavor_67
				|| flaverNo == flavor_68
				|| flaverNo == flavor_69
				|| flaverNo == flavor_71
				|| flaverNo == flavor_72
				|| flaverNo == flavor_73
				|| flaverNo == flavor_74
				|| flaverNo == flavor_75
				|| flaverNo == flavor_76
				|| flaverNo == flavor_77
				|| flaverNo == flavor_78
				|| flaverNo == flavor_79
				|| flaverNo == flavor_80
				|| flaverNo == flavor_81
				|| flaverNo == flavor_82
				|| flaverNo == flavor_83
				|| flaverNo == flavor_84
				|| flaverNo == flavor_85
				|| flaverNo == flavor_86
				|| flaverNo == flavor_89
				|| flaverNo == flavor_87
				|| flaverNo == flavor_88
				|| flaverNo == flavor_90
				|| flaverNo == flavor_91
				|| flaverNo == flavor_772
				|| flaverNo == flavor_92
				|| flaverNo == flavor_93
				|| flaverNo == flavor_94
				|| flaverNo == flavor_95
				|| flaverNo == flavor_96
				|| flaverNo == flavor_97
				|| flaverNo == flavor_98
				|| flaverNo == flavor_99
				|| flaverNo == flavor_100
				|| flaverNo == flavor_101
				|| flaverNo == flavor_102
				|| flaverNo == flavor_103
				|| flaverNo == flavor_104
				|| flaverNo == flavor_105
				|| flaverNo == flavor_106
				|| flaverNo == flavor_107
				|| flaverNo == flavor_108
				|| flaverNo == flavor_109
				|| flaverNo == flavor_110
				|| flaverNo == flavor_111
				|| flaverNo == flavor_112
				|| flaverNo == flavor_113
				|| flaverNo == flavor_114
				|| flaverNo == flavor_115
				|| flaverNo == flavor_116
				|| flaverNo == flavor_118
				|| flaverNo == flavor_119
				|| flaverNo == flavor_120
				|| flaverNo == flavor_121
				|| flaverNo == flavor_122				
				|| flaverNo == flavor_123
				|| flaverNo == flavor_124
				|| flaverNo == flavor_125
				|| flaverNo == flavor_126
				|| flaverNo == flavor_127
				|| flaverNo == flavor_128
				|| flaverNo == flavor_129
				|| flaverNo == flavor_130
				|| flaverNo == flavor_131
				|| flaverNo == flavor_132
				|| flaverNo == flavor_135
				|| flaverNo == flavor_133
				|| flaverNo == flavor_136
				|| flaverNo == flavor_138
				|| flaverNo == flavor_139
				|| flaverNo == flavor_140
				|| flaverNo == flavor_142
				|| flaverNo == flavor_137
				|| flaverNo == flavor_143
				|| flaverNo == flavor_145_3
				|| flaverNo == flavor_146
				|| flaverNo == flavor_147
				|| flaverNo == flavor_148
				|| flaverNo == flavor_149
				|| flaverNo == flavor_150
				|| flaverNo == flavor_151
				|| flaverNo == flavor_151_4
				|| flaverNo == flavor_LsPrintConfiguration_2
				|| flaverNo == flavor_152
				|| flaverNo == flavor_153
				|| flaverNo == flavor_154
				|| flaverNo == flavor_157
				|| flaverNo == flavor_159
				|| flaverNo == flavor_160
				|| flaverNo == flavor_158
				|| flaverNo == flavor_162
				|| flaverNo == flavor_163
				|| flaverNo == flavor_164
				|| flaverNo == flavor_165
				|| flaverNo == flavor_166
				|| flaverNo == flavor_167
				|| flaverNo == flavor_168
				|| flaverNo == flavor_169
				|| flaverNo == flavor_170
				|| flaverNo == flavor_171
				|| flaverNo == flavor_172
				|| flaverNo == flavor_174
				|| flaverNo == flavor_173
				|| flaverNo == flavor_176
				|| flaverNo == flavor_179
				|| flaverNo == flavor_181
				|| flaverNo == flavor_183
				|| flaverNo == flavor_184
				|| flaverNo == flavor_252
				|| flaverNo == flavor_470
				|| flaverNo == flavor_551
				|| flaverNo == flavor_557
				|| flaverNo == flavor_Commission_557
				|| flaverNo == flavor_558
				|| flaverNo == flavor_563
				|| flaverNo == flavor_564
				|| flaverNo == flavor_567
				|| flaverNo == flavor_569
				|| flaverNo == flavor_570
				|| flaverNo == flavor_Commission_default
				|| flaverNo == flavor_574
				|| flaverNo == flavor_defaultNew
				|| flaverNo == flavor_571
				|| flaverNo == flavor_572
				|| flaverNo == flavor_573
				|| flaverNo == flavor_581
				|| flaverNo == flavor_586
				|| flaverNo == flavor_584
				|| flaverNo == flavor_566
				|| flaverNo == flavor_585 
				|| flaverNo == flavor_578
				|| flaverNo == flavor_Commission_588
				|| flaverNo == flavor_589
				|| flaverNo == flavor_593
				|| flaverNo == flavor_592
				|| flaverNo == flavor_595
				|| flaverNo == flavor_596
				|| flaverNo == flavor_598
				|| flaverNo == flavor_Commission_593
				|| flaverNo == flavor_Commission_7
				|| flaverNo == flavor_Commission_597
				|| flaverNo == flavor_580
				|| flaverNo == flavor_608
				|| flaverNo == flavor_610
				|| flaverNo == flavor_Commission_605
				|| flaverNo == flavor_604
				|| flaverNo == flavor_612
				|| flaverNo == flavor_609
				|| flaverNo == flavor_616
				|| flaverNo == flavor_594
				|| flaverNo == flavor_615
				|| flaverNo == flavor_623
				|| flaverNo == flavor_620
				|| flaverNo == flavor_621
				|| flaverNo == flavor_628
				|| flaverNo == flavor_619
				|| flaverNo == flavor_627
				|| flaverNo == flavor_625
				|| flaverNo == flavor_636
				|| flaverNo == flavor_631
				|| flaverNo == flavor_633
				|| flaverNo == flavor_638
				|| flaverNo == flavor_617
				|| flaverNo == flavor_626
				|| flaverNo == flavor_634
				|| flaverNo == flavor_646
				|| flaverNo == flavor_635
				|| flaverNo == flavor_644
				|| flaverNo == flavor_Commission_343
				|| flaverNo == flavor_651
				|| flaverNo == flavor_649
				|| flaverNo == flavor_Commission_641
				|| flaverNo == flavor_650
				|| flaverNo == flavor_643
				|| flaverNo == flavor_678
				|| flaverNo == flavor_Commission_641
				|| flaverNo == flavor_645
				|| flaverNo == flavor_664
				|| flaverNo == flavor_669
				|| flaverNo == flavor_672
				|| flaverNo == flavor_605
				|| flaverNo == flavor_673
				|| flaverNo == flavor_Commission_622
				|| flaverNo == flavor_675	
				|| flaverNo == flavor_231			
				|| flaverNo == flavor_540
				|| flaverNo == flavor_679	
				|| flaverNo == flavor_694		
				|| flaverNo == flavor_684
				|| flaverNo == flavor_685		
				|| flaverNo == flavor_692
				|| flaverNo == flavor_700
				|| flaverNo == flavor_697				
				|| flaverNo == flavor_702
				|| flaverNo == flavor_710
				|| flaverNo == flavor_707
				|| flaverNo == flavor_709
				|| flaverNo == flavor_705 
				|| flaverNo == flavor_711
				|| flaverNo == flavor_691
				|| flaverNo == flavor_698
				|| flaverNo == flavor_715
				|| flaverNo == flavor_719
				|| flaverNo == flavor_714
				|| flaverNo == flavor_720
				|| flaverNo == flavor_727
				|| flaverNo == flavor_724
				|| flaverNo == flavor_Commission_721
				|| flaverNo == flavor_712
				|| flaverNo == flavor_729
				|| flaverNo == flavor_Commission_728
				|| flaverNo == flavor_Commission_718
				|| flaverNo == flavor_Commission_701
				|| flaverNo == flavor_Commission_945
				|| flaverNo == flavor_Commission_967
				|| flaverNo == flavor_Commission_973
				|| flaverNo == flavor_Commission_984
				|| flaverNo == flavor_731
				|| flaverNo == flavor_704
				|| flaverNo == flavor_717
				|| flaverNo == flavor_730
				|| flaverNo == flavor_734
				|| flaverNo == flavor_737
				|| flaverNo == flavor_253
				|| flaverNo == flavor_742
				|| flaverNo == flavor_735
				|| flaverNo == flavor_740
				|| flaverNo == flavor_743
				|| flaverNo == flavor_680
				|| flaverNo == flavor_753
				|| flaverNo == flavor_754
				|| flaverNo == flavor_411
				|| flaverNo == flavor_345
				|| flaverNo == flavor_759
				|| flaverNo == flavor_751
				|| flaverNo == flavor_763
				|| flaverNo == flavor_746
				|| flaverNo == flavor_746_3
				|| flaverNo == flavor_764
				|| flaverNo == flavor_767
				|| flaverNo == flavor_750
				|| flaverNo == flavor_761
				|| flaverNo == flavor_771
				|| flaverNo == flavor_775
				|| flaverNo == flavor_770
				|| flaverNo == flavor_749
				|| flaverNo == flavor_725
				|| flaverNo == flavor_777
				|| flaverNo == flavor_667
				|| flaverNo == flavor_545
				|| flaverNo == flavor_768
				|| flaverNo == flavor_384
				|| flaverNo == flavor_242
				|| flaverNo == flavor_463
				|| flaverNo == flavor_409
				|| flaverNo == flavor_237
				|| flaverNo == flavor_50
				|| flaverNo == flavor_245				
				|| flaverNo == flavor_533
				|| flaverNo == flavor_769
				|| flaverNo == flavor_499
				|| flaverNo == flavor_534
				|| flaverNo == flavor_778
				|| flaverNo == flavor_538
				|| flaverNo == flavor_402
				|| flaverNo == flavor_289
				|| flaverNo == flavor_474
				//do not add any groups flavor which group id is more than 780
				|| (Number(flaverNo.split('_')[1]) >= ACCOUNT_GROUP_ID_REEHAN && flaverNo != flavor_894 && flaverNo != flavor_928  && flaverNo != flavor_883 && flaverNo != flavor_915  && flaverNo != flavor_907)
				
				) && (printType != 'printSummary')
				
				){
					
				lhpvChargeData			= _this.getArrayForLhpvCharges(response.lhpvChargeList);
				blhpvChargeData			= _this.getArrayForBlhpvCharges(response.blhpvChargeList, response.blhpvCreditAmountTxnArrList);

				var tableData			= _this.getArrayForTableDetails(lr_Summary, response.dispatchLSLRCharge, response.invoiceDetails,response);
				var totalObjects		= _this.setTotalsForFooter(response, tableData);
				var destWiseDispatchLSSummArrList	= response.destWiseDispatchLSSummModelArrList;
				var headerKey			= Object.keys(ls_Header);
				var headerObject1		= new Array();
				for (var l = 0; l < headerKey.length; l++) {
					headerObject1.push(ls_Header[headerKey[l]]);
				}
				
				var headerFooterData = _this.getHeaderAndFooterObject(headerObject1[0][0], response.lsDestBranch, response.lsSrcBranch);
				
				if(flavorConfiguration.lrNumberWiseSorting) {//gowtham, puneethcargo
					tableData	= _.sortBy(( _.sortBy(tableData, 'wayBillNumberWithoutBranchCode')), 'srcBranchCode');
					tableData	= _this.setSrNumber(tableData);
				}

				removeAmountBranchIdsWise  = isValueExistInArray((flavorConfiguration.doNotPrintAmountByBranchIds).split(","), dispatchLSPrintModel.lsBranchId);
				
				if(flaverNo == flavor_25 || flaverNo == flavor_81 || flaverNo == flavor_56	|| flaverNo == flavor_563
				|| flaverNo == flavor_83 || flaverNo == flavor_116 || flaverNo == flavor_133 || flaverNo == flavor_140 
				|| flaverNo == flavor_127 || flaverNo == flavor_150 || flaverNo == flavor_570 || flaverNo == flavor_173 
				|| flaverNo == flavor_581 || flaverNo == flavor_564 || flaverNo == flavor_596 || flaverNo == flavor_566 || flaverNo == flavor_616 || flaverNo == flavor_594 || flaverNo == flavor_615 || flaverNo == flavor_623
				|| flaverNo == flavor_627 || flaverNo == flavor_631 || flaverNo == flavor_617 || flaverNo == flavor_644	 || flaverNo == flavor_170 || flaverNo == flavor_651 || flaverNo == flavor_678 || flaverNo == flavor_231  || flaverNo == flavor_345) {		
					for(var i = 0; i < tableData.length; i++) {
						var waybillNumber = tableData[i].lrNumber;
						tableData[i].wayBillNumber = Number(waybillNumber.substr(waybillNumber.indexOf("/") + 1));
					}
					
					tableData	= _.sortBy(tableData, 'wayBillNumber');
					tableData	= _this.setSrNumber(tableData);
				}
				
				if(flavorConfiguration.sortByDispatchSummaryIdInDescendingOrder) {
					tableData	= _.sortBy(tableData, 'dispatchSummaryId');
					tableData	= tableData.reverse();
					tableData	= _this.setSrNumber(tableData);
				}
				
				if(flavorConfiguration.sortLRByDestinationBranchName) {
					tableData	= _.sortBy(tableData, 'lrDestinationBranch');
					tableData	= _this.setSrNumber(tableData);
				}
				if(flavorConfiguration.lrDateWiseSorting) {
					tableData	= _.sortBy(tableData, 'lrBookingDate');
					tableData	= _this.setSrNumber(tableData);
				}
				
				if(flavorConfiguration.sortByPrivateMark) {
					tableData	= _.sortBy(tableData, 'privateMark');
					tableData	= _this.setSrNumber(tableData);
				}
				
				if(flavorConfiguration.sortByLrType) {
					tableData	= _.sortBy(tableData, 'lrType');
					tableData	= _this.setSrNumber(tableData);
				} 
				
				if(flavorConfiguration.sortLRByConsigneeName){
					tableData	= _.sortBy(tableData, 'consignee');
					tableData	= _this.setSrNumber(tableData);
				}
				
				if(flaverNo == flavor_586) {
					tableData = _.sortBy(tableData, 'wayBillTypeId');
					tableData	= _this.setSrNumber(tableData);
				}
				
				if(flaverNo == flavor_2) {
					tableData = _.sortBy(tableData, 'wayBillTypeId');
					tableData = tableData.reverse();
					
					var paidTableData		= _this.getArrayForPaidTableDetails(lr_Summary, response.dispatchLSLRCharge);
				}
				
				if(flaverNo == flavor_3)
					var wayBillArr			= _this.getArrayForWayBillDetails(lr_Summary, response.dispatchLSLRCharge);
				
				if(flavorConfiguration.showDestinationWiseSummaryDetails)
					var DestWiseSummaryDetails			= _this.getArrayForDestinationWiseSummaryDetails(lr_Summary, response.dispatchLSLRCharge, lsDestBranch);
					
				if(flavorConfiguration.showPackingTypeWiseSummaryDetails)
					var packingTypeWiseSummaryDetails	= _this.getArrayForPackingTypeWiseSummaryDetails(response.packingTypeWiseQtyHM);
			
				require([LSPrintSetUp_1.getConfiguration(flaverNo, isCrossingLS, crossingAgentId),
						 LSPrintSetUp_1.getFilePathForLabel(flaverNo)], function(View, FilePath) {
					if(flaverNo == flavor_30 || flaverNo == flavor_40)
						pageBreaker		= 0;
					else
						pageBreaker		= Number(flavorConfiguration.pageBreakCount);
					
					if(flaverNo == flavor_2 || flaverNo == flavor_32 || flaverNo == flavor_36)
						pageCounter		= Math.floor(tableData.length / pageBreaker);
					else if(flaverNo == flavor_30 || flaverNo == flavor_40)
						pageCounter		= 0;
					else
						pageCounter		= Math.round(tableData.length / pageBreaker);
					
					if(flavorConfiguration.showLRWiseEWayBillDetails)
						LSPrintSetUp_1.setLRWiseEWayBillDetails(response.lrWiseEwayBillDetails);
					
					LSPrintSetUp_1.resetDataForAcwAndChw();
					
					var lastItrObj	= new Object();
					lastItrObj.lastITR	= false;
					
					if (pageCounter <= 0) {
						var pageNumber = 0;
						lastItrObj.lastITR	= true;
						_this.$el.html(_.template(View));
						LSPrintSetUp_1.checkCookieForPrint();
						LSPrintSetUp_1.setTotalsToFooter(totalObjects, tableData, flavorConfiguration);
						LSPrintSetUp_1.setbookingCommisionFromRateMaster(totalCommission,cartageAmount);
						
						if(flavorConfiguration.removeTableColumn && flaverNo != 'loadingSheet_defaultNew')
							LSPrintSetUp_1.removeTableColumn(response, isPrivateMarkExists, crossingAgentId, executive)
						
						if(flavorConfiguration.removeChargesColumn && flaverNo != 'loadingSheet_defaultNew')
							LSPrintSetUp_1.removeChargesColumn(response)
											
						LSPrintSetUp_1.setHeadersForPrint(headerFooterData, response, pageNumber, dispatchLSPrintModel);
						LSPrintSetUp_1.setInformationDivs(headerFooterData, response, tableData, removeAmountBranchIdsWise);
						LSPrintSetUp_1.setDataTableHeader();
						tableData.push(lastItrObj);
						
						LSPrintSetUp_1.setDataTableDetails(tableData, response);
						
						if(flavorConfiguration.showDestWiseDispatchLSSummary)
							LSPrintSetUp_1.setDestWiseDispatchLSSummary(tableData.length, destWiseDispatchLSSummArrList, flavorConfiguration);
						
						if(flaverNo == flavor_2)
							LSPrintSetUp_1.setDataTableDetailsWithoutPaid(tableData, paidTableData, lhpvChargeData, subStringLength);
						
						if(flaverNo == flavor_3)
							LSPrintSetUp_1.setWayBillArrDetails(wayBillArr, subStringLength);
						
						LSPrintSetUp_1.setSummaryTableHeaders();
						LSPrintSetUp_1.setSummaryTableDetails(response, tableData, null);					
						
						if (flavorConfiguration.showCommission30Table)
							LSPrintSetUp_1.setCommissionTable(lhpvChargeData, dispatchLSPrintModel, flavorConfiguration);
						
						if (allowCollPercentage == 'true' || allowCollPercentage)
							LSPrintSetUp_1.setCustomCommision(response, totalObjects);
						
						if(flavorConfiguration.showLhpvChargesDetails)
							LSPrintSetUp_1.setLhpvChargesDetails(lhpvChargeData,lsSrcBranch, blhpvChargeData, flavorConfiguration);
						
						if(flavorConfiguration.setDataTableDetailsWithoutSummary || flaverNo == flavor_16)
							LSPrintSetUp_1.setDataTableDetailsWithoutSummary(tableData, response);
						
						if(DestWiseSummaryDetails != undefined)
							LSPrintSetUp_1.setDestinationWiseSummaryDetails(DestWiseSummaryDetails);
						
						if(packingTypeWiseSummaryDetails != undefined)
							LSPrintSetUp_1.setPkgTypeWiseSummaryDetails(packingTypeWiseSummaryDetails);
						
						if(!flavorConfiguration.removeLrDetailsTotal || flaverNo == 'loadingSheet_defaultNew'
								&& (flavorConfiguration.pageWiseDataDisplay || lastItrObj.lastITR == true))
								LSPrintSetUp_1.setPageWiseTotals(response);
						
						if(flavorConfiguration.showSeparateCrossingDataInLsPrint)
							LSPrintSetUp_1.setCrossingWiseSummaryData(response);
						
						pageNumber++;
						$("*[data-footerpage='pageNo']").last().html(pageNumber);
						$("[data-footerpage='pagecounter']").html(pageCounter + 1);
						LSPrintSetUp_1.setFooterDiv(headerFooterData, response, totalObjects, tableData, isSearchModule);
						
						if(flaverNo == flavor_8 || flaverNo == flavor_99)
							LSPrintSetUp_1.removeSrNoColumn();
					} else {
						
						var pageNumber = 0;
						
						for (var j = 0; j < tableData.length; j += pageBreaker) {
							_this.$el.append(_.template(View));
							
							if (j + pageBreaker >= tableData.length) {
								lastItrObj.lastITR = true;
								$("#totalFooter").removeClass("hide");
							}
									LSPrintSetUp_1.setbookingCommisionFromRateMaster(totalCommission,cartageAmount);

							var chunkArray = tableData.slice(j, j + pageBreaker);
							LSPrintSetUp_1.setHeadersForPrint(headerFooterData, response, pageNumber, dispatchLSPrintModel);
							
							if(pageNumber != 0 && flaverNo == flavor_30){
								$(".reportHeaderType").last().hide();
								$(".header").last().hide();
							} 
							
							LSPrintSetUp_1.setInformationDivs(headerFooterData, response, tableData, removeAmountBranchIdsWise);
							LSPrintSetUp_1.setDataTableHeader();
							chunkArray.push(lastItrObj);
							LSPrintSetUp_1.setDataTableDetails(chunkArray, response);

							if(flaverNo == flavor_2)
								LSPrintSetUp_1.setDataTableDetailsWithoutPaid(chunkArray, paidTableData, lhpvChargeData, subStringLength);
							
							LSPrintSetUp_1.setTotalsToFooter(totalObjects, tableData, flavorConfiguration);
							
							if(flavorConfiguration.setDataTableDetailsWithoutSummary || flaverNo == flavor_16)
								LSPrintSetUp_1.setDataTableDetailsWithoutSummary(chunkArray, response);
							
							if(flavorConfiguration.showDestWiseDispatchLSSummary)
								LSPrintSetUp_1.setDestWiseDispatchLSSummary(chunkArray.length, destWiseDispatchLSSummArrList, flavorConfiguration);
							
							if(flaverNo == flavor_3)
								LSPrintSetUp_1.setWayBillArrDetails(wayBillArr, subStringLength);
							
							if(!flavorConfiguration.removeLrDetailsTotal || flaverNo == 'loadingSheet_defaultNew'
								&& (flavorConfiguration.pageWiseDataDisplay || lastItrObj.lastITR == true))
									LSPrintSetUp_1.setPageWiseTotals(response);
							
							LSPrintSetUp_1.setSummaryTableHeaders();
							LSPrintSetUp_1.setSummaryTableDetails(response, tableData, null);
							pageNumber++;
							$("*[data-footerpage='pageNo']").last().html(pageNumber);
							$("[data-footerpage='pagecounter']").html(pageCounter + 1);
						}
						
						if(flavorConfiguration.removeTableColumn && flaverNo != 'loadingSheet_defaultNew')
							LSPrintSetUp_1.removeTableColumn(response, isPrivateMarkExists, crossingAgentId, executive)
						
						if(flavorConfiguration.removeChargesColumn && flaverNo != 'loadingSheet_defaultNew')
							LSPrintSetUp_1.removeChargesColumn(response)
						
						if (flavorConfiguration.showCommission30Table)
							LSPrintSetUp_1.setCommissionTable(lhpvChargeData, dispatchLSPrintModel, flavorConfiguration);
						
						if(flavorConfiguration.showLhpvChargesDetails)
							LSPrintSetUp_1.setLhpvChargesDetails(lhpvChargeData,lsSrcBranch, blhpvChargeData, flavorConfiguration);
						
						if(DestWiseSummaryDetails != undefined) 
							LSPrintSetUp_1.setDestinationWiseSummaryDetails(DestWiseSummaryDetails);
							
						if(packingTypeWiseSummaryDetails != undefined)
							LSPrintSetUp_1.setPkgTypeWiseSummaryDetails(packingTypeWiseSummaryDetails);
						
						if(flavorConfiguration.showSeparateCrossingDataInLsPrint)
							LSPrintSetUp_1.setCrossingWiseSummaryData(response);
						
						LSPrintSetUp_1.setFooterDiv(headerFooterData, response, totalObjects, tableData, isSearchModule);
						_this.delegateEvents();
						LSPrintSetUp_1.checkCookieForPrint();
						
					}
					
					loadLanguageWithParams(FilePath.loadLanguage(flaverNo.toLowerCase()));
					
					if(response.SetUpConfig.gruopWiseLanguageFileLoad == 'true')
						loadLanguageWithParams(FilePath.loadLanguageGruopWise(print_Model.accountGroupId));
						
					setCompanyLogos(executive.accountGroupId);
					
					if(flavorConfiguration.showCompanyLogo){
						$(".companyLogo").removeClass('hide');
						$(".companyLogoCell").removeClass('hide');
					}
					
					if(flavorConfiguration.showCompanyWaterMarkLogo)
						$(".companyWaterMarkLogo").removeClass('hide');
					
					if (!isValueExistInArray((flavorConfiguration.branchesToPrintAmountColumn || "").split(","), executive.branchId))
						$('.showAmountColumn').remove();
					
					isInvalidEwayBillDataLr = tableData.filter(el => el.isInvalidEwayBill);
				
					if(isInvalidEwayBillDataLr.length > 0 && flavorConfiguration.showStarMarkOnInvalidEwayBill) {
							LSPrintSetUp_1.setIsInvalidEwayBillDataLr(isInvalidEwayBillDataLr)
					}
				});
				
				
			} else if(flaverNo == flavor_26){
				Object.defineProperty(Array.prototype, 'chunk_inefficient', {
					value: function(chunkSize) {
						var array=this;
						return [].concat.apply([],
								array.map(function(elem,i) {
									return i%chunkSize ? [] : [array.slice(i,i+chunkSize)];
								})
						);
					}
				});
				
				_this.$el.append(lsprintsetupdestinationwisewithoutsummary.setDefaultPrint(response));
				lsprintsetupdestinationwisewithoutsummary.applyCSS(response.SetUpConfig, true);
				lsprintsetupdestinationwisewithoutsummary.plainPrint(false);
		
			} else if(flaverNo == flavor_55 || flaverNo == flavor_64) {
				require([LSPrintSetUp_1.getConfiguration(flaverNo, isCrossingLS, crossingAgentId),
				LSPrintSetUp_1.getFilePathForLabel(flaverNo)], function(View, FilePath) {
					_this.$el.html(_.template(View));
					
			
					var tableDataForTruckDelivery  =  _this.getArrayForTableDetails(lr_Summary, response.dispatchLSLRCharge, response.invoiceDetails,response);
					var lastItrObj			= Object();
					var headerKey			= Object.keys(ls_Header);
					var headerObject1		= new Array();
					
					for (var l = 0; l < headerKey.length; l++) {
						headerObject1.push(ls_Header[headerKey[l]]);
					}
					
					var headerFooterData		= _this.getHeaderAndFooterObject(headerObject1[0][0], response.lsDestBranch, response.lsSrcBranch);
					tableDataForTruckDelivery	= _.sortBy(tableDataForTruckDelivery, 'lrDestinationBranch');
					tableDataForTruckDelivery	= _this.setSrNumber(tableDataForTruckDelivery);
					
					LSPrintSetUp_1.setHeadersForPrint(headerFooterData, response, 0, dispatchLSPrintModel);
					LSPrintSetUp_1.setInformationDivs(headerFooterData, response, tableData, removeAmountBranchIdsWise);
					LSPrintSetUp_1.setDataTableHeader();
					LSPrintSetUp_1.checkCookieForPrint();
					
					if(tableDataForTruckDelivery != undefined && tableDataForTruckDelivery.length > 0) {
						tableDataForTruckDelivery.push(lastItrObj);
						LSPrintSetUp_1.setDataTableTruckDetails(tableDataForTruckDelivery, response);
					} else {
						$("#truckDetails").addClass("hide");
						
						if(flavorConfiguration.showPopUpForTruckLs) {
							$('#popUpForPrint').bPopup({
							},function(){
								var _thisMod = this;
								$(this).html("<div class='confirm'><h1>Do You Want To Print Commision ? </h1><p>Shortcut Keys : Enter = Yes, Esc = No</p><button  id='cancelButton'>NO</button><button autofocus  id='confirm'>YES</button></div>");
								
								$('#confirm').focus();
								$("#confirm").click(function(){
									_thisMod.close();
									setTimeout(function(){window.print();},200);
								})
								$("#confirm").on('keydown', function(e) {
									if (e.which == 27) {  //escape
										$('.deliveryCommission').hide();
										$('.payableDetailOthers').hide();
										$('.payableDetail').hide();
										_thisMod.close();
										setTimeout(function(){window.print();},200);
									}
								});
								$("#cancelButton").click(function(){
									$('.deliveryCommission').hide();
									$('.payableDetailOthers').hide();
									$('.payableDetail').hide();
									_thisMod.close();
									setTimeout(function(){window.print();},200);
								});
							});
						}
					}
					
					var counter		= 0;
					var mainAttr	= new Array();
					var tbody		= $("[data-dataTableDetail='srNumber']").parent().parent().parent().parent();
					
					if( tableDataHm != undefined && Object.keys(tableDataHm).length > 0){
						for(var key in tableDataHm){
							var	tableData	= tableDataHm[key];
							
							if(flavorConfiguration.sortLRByDestinationBranchName)
								tableData	=_.sortBy(tableData, 'lrDestinationBranch');
							
							if(tableData.length == 0){
								lastItrObj.lastITR	= false;
								tableData.push(lastItrObj);
							} else {
								lastItrObj.lastITR	= true;
								tableData.push(lastItrObj);
							}
							
							tableData = _this.setSrNumber(tableData);
							tableData.pop();
							lengthOfDataTable = lengthOfDataTable + tableData.length;
							
							if(tableData.length > 0){
								counter ++;
								var tbody					= $("[data-dataTableDetail='srNumber']").parent().parent();
								tbody						= (tbody[tbody.length - 1]);
								columnObjectForDetails		= $("[data-row='dataTableDetails']").children();
								columnObjectForDataTableDetails		= columnObjectForDetails;
								var totalLRs						= 0;
								actualWeight						= 0;
								deliveryCommission					= 0;
								totalArticle						= 0;
								paidAmount							= 0;
								topayAmount							= 0;
								tbbAmount							= 0;
								toPayTotalPageWiseFreightCharge		= 0;
								freightCharge						= 0;
								unloadingAmount						= 0;
								stCharge							= 0;
								payableAmountCommissionWiseOthers	= 0;
								bkgTotal							= 0;
								pickupCharge						= 0;
								lc									= 0;
								var newtable	= $("<table class='width'></table>");
								var cpyHeader	= $("#headerTable").clone();
								
								cpyHeader[0].id = 'headerTable'+counter;
								$(cpyHeader[0]).addClass('page-break');
								
								if(tableDataForTruckDelivery != undefined && tableDataForTruckDelivery.length <= 0 && counter == 1)
									$('#headerTable').removeClass("page-break");
								
								if(counter > 1)
									mainAttr.push(cpyHeader);
								
								$($(cpyHeader[0]).find(".lrHandlingDestinationBranch"))[0].id = 'lrHandlingDestinationBranch_'+counter;
								$(newtable).append($("#dataTable").children().clone());
								var enter = false;
								

									for(var i = 0; i < tableData.length; i++) {
										if(!enter && tableData[i].lrHandlingDestinationBranch != undefined) {
											enter = true;
											
											if(counter == 1)
												$("#lrhandBranch").html(tableData[i].lrHandlingDestinationBranch);
											else
												$($(cpyHeader[0]).find(".lrHandlingDestinationBranch")).html(tableData[i].lrHandlingDestinationBranch);
										}
										
										totalLRs		= tableData[i].srNumber;
										actualWeight	= actualWeight + tableData[i].actualWeight;
										freightCharge	= freightCharge + tableData[i].freightCharge;
										pickupCharge	= pickupCharge + tableData[i].pickupCharge;
										lc				= lc + tableData[i].lc;

										unloadingAmount	= unloadingAmount + tableData[i].doorDeliveryCharge + tableData[i].unloadingAmount;
										totalArticle	= totalArticle + tableData[i].totalArticle;
										bkgTotal		= bkgTotal + tableData[i].amount;
										
										if(tableData[i].wayBillTypeId == WAYBILL_TYPE_TO_PAY)
											toPayTotalPageWiseFreightCharge	= toPayTotalPageWiseFreightCharge + tableData[i].freightCharge;
																				
										if(tableData[i].deliveryCommission != undefined)
											deliveryCommissionRate	= tableData[i].deliveryCommission;
											
										if(deliveryCommissionRate > 0){
											if(flavorConfiguration.calculateCommissionOnFreightCharge)
												deliveryCommission	 += deliveryCommissionRate * tableData[i].freightCharge / 100;
											else
												deliveryCommission	 += deliveryCommissionRate * tableData[i].amount / 100;
											
											payableAmountCommissionWiseOthers = toPayTotalPageWiseFreightCharge - deliveryCommission ;
										}
										
										var newtr	= $("<tr class='height30px'></tr>");
										
										for(var j = 0; j < columnObjectForDetails.length; j++) {
											var newtd = $("<td></td>");
											var dataPicker = $(columnObjectForDetails[j]).attr("data-dataTableDetail");
											$(newtd).attr("class", $(columnObjectForDetails[j]).attr("class"));
											$(newtd).attr("id", $(columnObjectForDetails[j]).attr("id"));
											
											if(flavorConfiguration.replacePaidTbbAmountWithLrType) {
												if (dataPicker == 'paidFreightCharge') {
													if (tableData[i]['lrType'] == 'Paid') {
														$(newtd).html("Paid");
														paidAmount		= paidAmount + tableData[i].amount;
														paidFreight		= paidFreight + tableData[i].freightCharge;
													}
													
													if ((tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit')) {
														$(newtd).html('TBB');
														tbbAmount		= tbbAmount + tableData[i].amount;
														tbbFright		= tbbFright + tableData[i].freightCharge;
													}
												} else if (dataPicker == 'toPayFreightCharge') {
													if (tableData[i]['lrType'] == 'To Pay') {
														$(newtd).html(tableData[i].amount);
														topayAmount				= topayAmount + tableData[i].amount;
														toPayFreight			= toPayFreight + tableData[i].freightCharge;
													}
												} else if (dataPicker == 'tbbFreightCharge') {
													if ((tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit')) {
														$(newtd).html('TBB');
														tbbAmount		= tbbAmount + tableData[i].amount;
														tbbFright		= tbbFright + tableData[i].freightCharge;
													}
												} else if(dataPicker == 'freightCharge' && flavorConfiguration.replacePaidTbbAmountWithLrDashed) {
													if(tableData[i]['lrType'] == 'Paid' || tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit')
														$(newtd).html('--');
													else
														$(newtd).html(tableData[i].freightCharge);
												} else
													$(newtd).html(tableData[i][dataPicker]);
											} else {
												if (dataPicker == 'paidFreightCharge') {
													if (tableData[i]['lrType'] == 'Paid') {
														$(newtd).html(tableData[i].amount);
														paidAmount		= paidAmount + tableData[i].amount;
														paidFreight		= paidFreight + tableData[i].freightCharge;
													}
												} else if (dataPicker == 'toPayFreightCharge') {
													if (tableData[i]['lrType'] == 'To Pay') {
														$(newtd).html(tableData[i].amount);
														topayAmount				= topayAmount + tableData[i].amount;
														toPayFreight			= toPayFreight + tableData[i].freightCharge;
													}
												} else if (dataPicker == 'tbbFreightCharge') {
													if ((tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit')) {
														$(newtd).html(tableData[i].amount);
														tbbAmount		= tbbAmount + tableData[i].amount;
														tbbFright		= tbbFright + tableData[i].freightCharge;
													}
												} else if(dataPicker == 'freightCharge' && flavorConfiguration.replacePaidTbbAmountWithLrDashed) {
													if(tableData[i]['lrType'] == 'Paid' || tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit')
														$(newtd).html('--');
													else
														$(newtd).html(tableData[i].freightCharge);
												} else
													$(newtd).html(tableData[i][dataPicker]);
											}
											
											$(newtr).append(newtd);
										}
										
										$(newtable).append(newtr);
										mainAttr.push(newtable);
									}
									
									if(payableAmountCommissionWiseOthers > 0)
										payableDetailOthers = 'PLEASE DEPOSIT THE BALANCE  IN BANK AND INFORM : ';
									else if(payableAmountCommissionWiseOthers < 0)
										payableDetailOthers = 'PLEASE COLLECT THE BALANCE FROM BRANCH : ';
									else
										payableDetailOthers = 'NILL : ';
									
									if(flavorConfiguration.replacePaidTbbAmountWithLrType) {
										if(flavorConfiguration.replacePaidTbbAmountWithLrDashed)
											freightCharge =	 '';
										
										$(newtable).append('<tr class="height30px"><td colspan="2" class="truncate borderTop borderBottom">Total</td><td class="truncate centerAlign borderTop borderBottom">'+totalArticle
										+'</td><td class="borderTop	 borderBottom infoStyle"> Wght : '+actualWeight+'</td><td class="truncate borderTop borderBottom">Total LRs : '+totalLRs +'</td><td class="truncate borderTop borderBottom centerAlign font20">'+freightCharge+'</td><td class="truncate borderTop borderBottom"></td><td class="truncate borderTop rightAlign font20  borderBottom">'+topayAmount
										+'<td class="truncate borderTop borderBottom"></td></td><td class="borderTop borderBottom"></td><td class="borderTop borderBottom"></td></tr>');
									} else {
										$(newtable).append('<tr class="height30px"><td colspan="2" class="truncate borderTop borderBottom">Total</td><td class="truncate centerAlign borderTop borderBottom">'+totalArticle
										+'</td><td class="borderTop truncate borderBottom infoStyle"> Wght : '+actualWeight+'</td><td class="truncate borderTop borderBottom">Total LRs : '+totalLRs +'</td><td class="truncate borderTop borderBottom rightAlign font20">'+paidAmount+'</td><td class="truncate borderTop rightAlign font20 borderBottom">'+topayAmount
										+'<td class="truncate borderTop borderBottom font20 rightAlign">'+tbbAmount+'</td></td><td class="borderTop borderBottom"></td><td class="borderTop borderBottom"></td></tr>');
									}
									
								$(newtable).append('<tr class="deliveryCommission"><td colspan="10" class="infoStyle"><span>GODOWN COMMISION : </span>'+Math.round(deliveryCommission)+'</td></tr>');
								$(newtable).append('<tr class="height30px payableDetailOthers"><td colspan="10" class="infoStyle"><span>'+payableDetailOthers+'</span><span id="payableAmountOth_'+key+'">'+Math.abs(Math.round(payableAmountCommissionWiseOthers))+'</span></td></tr>');
							} else if(Object.keys(tableDataHm).length == 1 && lengthOfDataTable == 0)
								$("#mainTable").addClass('hide');
						}
					} else
						$("#mainTable").addClass('hide');
				
					$("#mainTable").append(mainAttr);
					
					loadLanguageWithParams(FilePath.loadLanguage(flaverNo.toLowerCase()));
					
					if(response.SetUpConfig.gruopWiseLanguageFileLoad == 'true')
						loadLanguageWithParams(FilePath.loadLanguageGruopWise(print_Model.accountGroupId));
				});
			} else if(flaverNo == flavor_57 
					|| flaverNo == flavor_117 
					|| flaverNo == flavor_64 
					|| flaverNo == flavor_125 
					|| flaverNo == flavor_133
					|| flaverNo == flavor_laser_341
					|| flaverNo == flavor_145 
					|| flaverNo == flavor_894
					|| flaverNo == flavor_928
					|| flaverNo == flavor_883
					|| flaverNo == flavor_915
					|| flaverNo == flavor_907
					|| flaverNo == flavor_Commission_180 
					|| flaverNo == flavor_155
					|| flaverNo == flavor_565
					|| flaverNo == flavor_582
					|| flaverNo == flavor_Commission_7
					|| flaverNo == flavor_642
					|| flaverNo == flavor_Commission_721
					|| flaverNo == flavor_741
					|| flaverNo == flavor_Commission_689
					|| flaverNo == flavor_476
					
					) {
				require([LSPrintSetUp_1.getConfiguration(flaverNo, isCrossingLS, crossingAgentId),
				LSPrintSetUp_1.getFilePathForLabel(flaverNo)], function(View, FilePath) {
					_this.$el.html(_.template(View));
					var tableDataForDDDVDelivery	= response.dispatchLSPrintList;
					var tableDataHm					= response.tableDataHm;
					var lastItrObj			= Object();
					var headerKey			= Object.keys(ls_Header);
					var headerObject1		= new Array();
					var	normalLrPaidFreight				= 0,
					normalLrToPayFreight				= 0,
					normalLrToPayAmount					= 0,
					normalLrOtherChgTotal				= 0,
					normalLrTbbFreight					= 0,
					grandTotal							= 0,
					paidTotal							= 0,
					toPayTotal							= 0,
					tbbTotal							= 0,
					crossingLrPaidFreight				= 0,
					crossingLrToPayFreight				= 0,
					crossingLrTbbFreight				= 0,
					crossingLrOtherChgTotal				= 0,
					normalLrToPaidCartage				= 0,
					normalLrToPayCartage				= 0,
					normalLrTBBCartage				  	= 0;
					
					for (var l = 0; l < headerKey.length; l++) {
						headerObject1.push(ls_Header[headerKey[l]]);
					}
					
					var headerFooterData		= _this.getHeaderAndFooterObject(headerObject1[0][0], response.lsDestBranch, response.lsSrcBranch);
					tableDataForDDDVDelivery	= _.sortBy(tableDataForDDDVDelivery, 'lrDestinationBranch');
					tableDataForDDDVDelivery	= _this.setSrNumber(tableDataForDDDVDelivery);
					
					LSPrintSetUp_1.setHeadersForPrint(headerFooterData, response, 0, dispatchLSPrintModel);
					LSPrintSetUp_1.setInformationDivs(headerFooterData, response, tableData, removeAmountBranchIdsWise);
					LSPrintSetUp_1.setDataTableHeader();
					LSPrintSetUp_1.setSummaryTableHeaders();
					
					if(tableDataForDDDVDelivery != undefined && tableDataForDDDVDelivery.length > 0){
						tableDataForDDDVDelivery.push(lastItrObj);
						LSPrintSetUp_1.setDataTableDDDVDetails(tableDataForDDDVDelivery, response);
					} else {
					//	LSPrintSetUp_1.checkCookieForPrint();
						$("#truckDetails").addClass("hide");
							$('#popUpForPrint').bPopup({
							},function(){
								var _thisMod = this;
								$(this).html("<div class='confirm'><h1>Do You Want To Print Commision ? </h1><p>Shortcut Keys : Enter = Yes, Esc = No</p><button  id='cancelButton'>NO</button><button autofocus id='confirm'>YES</button></div>");
								
								$('#confirm').focus();
								$("#confirm").click(function(){
									_thisMod.close();
									setTimeout(function(){window.print();},200);
								})
								$("#confirm").on('keydown', function(e) {
									if (e.which == 27) {  //escape
										$('.deliveryCommission').hide();
										$('.payableDetailOthers').hide();
										$('.payableDetail').hide();
										_thisMod.close();
										setTimeout(function(){window.print();},200);
									}
								});
								$("#cancelButton").click(function(){
									$('.deliveryCommission').hide();
									$('.payableDetailOthers').hide();
									$('.payableDetail').hide();
									_thisMod.close();
									setTimeout(function(){window.print();},200);
								});
							});
						}
						
							$('#popUpForPrintForPrabhat').bPopup({
							},function(){
								var _thisMod = this;
								$(this).html("<div class='confirm'><h1>Do You Want To Print Commision ? </h1><p>Shortcut Keys : Enter = Yes, Esc = No</p><button  id='cancelButton'>NO</button><button autofocus id='confirm'>YES</button></div>");
								
								$('#cancelButton').focus();
								$("#confirm").click(function(){
									_thisMod.close();
									setTimeout(function(){window.print();},200);
								})
								$("#confirm").on('keydown', function(e) {
									if (e.which == 27) {  //escape
										$('.deliveryCommission').hide();
										$('.payableDetailOthers').hide();
										$('.payableDetail').hide();
										_thisMod.close();
										setTimeout(function(){window.print();},200);
									}
								});
								$("#cancelButton").click(function(){
									$('.deliveryCommission').hide();
									$('.payableDetailOthers').hide();
									$('.payableDetail').hide();
									_thisMod.close();
									setTimeout(function(){window.print();},200);
								});
							});
					
					var counter		= 0;
					var mainAttr	= new Array();
					var tbody		= $("[data-dataTableDetail='srNumber']").parent().parent().parent().parent();
					
					$("*[data-selector='otherNTCS']").attr('id','normalOther')
					if( tableDataHm != undefined && Object.keys(tableDataHm).length > 0) {
					
					
						let tableDataHmKeys = [];
						for (let k in tableDataHm) tableDataHmKeys.push(k)
						
						if (flaverNo == flavor_894 || flaverNo == flavor_928 || flaverNo == flavor_883 || flaverNo == flavor_915 || flaverNo == flavor_907) {
							let sortedTableDataHmKeys = []
							if (tableDataHmKeys.includes(WAYBILL_TYPE_TO_PAY.toString())) sortedTableDataHmKeys.push(WAYBILL_TYPE_TO_PAY.toString())
							if (tableDataHmKeys.includes(WAYBILL_TYPE_PAID.toString())) sortedTableDataHmKeys.push(WAYBILL_TYPE_PAID.toString())
							if (tableDataHmKeys.includes("0")) sortedTableDataHmKeys.push("0")
							if (tableDataHmKeys.includes(WAYBILL_TYPE_FOC.toString())) sortedTableDataHmKeys.push(WAYBILL_TYPE_FOC.toString())
							/*
							// using 0 for TBB because someone has hardcoded 0 for TBB, see LSPrintBllImpl.java...
							if(list.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT) {
								dispatchLSPrintModel.setWayBillTypeId(0);
								dispatchLSPrintModel.setLrType("TBB");
							}
							*/
							tableDataHmKeys = sortedTableDataHmKeys
						}
						
					
						for(var key of tableDataHmKeys) {
							var	tableData	= tableDataHm[key];
							
							if(flaverNo == flavor_145 || flaverNo == flavor_894 || flaverNo == flavor_928 || flaverNo == flavor_883 || flaverNo == flavor_915 || flaverNo == flavor_907 || flaverNo == flavor_565|| flaverNo == flavor_741)
								tableData = _.sortBy(tableData, 'lrNumber');
							
							if(tableData.length == 0) {
								lastItrObj.lastITR	= false;
								tableData.push(lastItrObj);
							} else {
								lastItrObj.lastITR	= true;
								tableData.push(lastItrObj);
							}
							
							if (flavorConfiguration.showLRFirstOnFixedDestinationBranch) {
								const arr1 = tableData.filter(item => item.wayBillDestinationBranchId == flavorConfiguration.fixedDestinationBranchToShowLRsFirst);
								const arr2 = tableData.filter(item => item.wayBillDestinationBranchId != flavorConfiguration.fixedDestinationBranchToShowLRsFirst);

								tableData = [...arr1, ...arr2];
							}
							
							tableData = _this.setSrNumber(tableData);
							
							tableData.pop();
							lengthOfDataTable = lengthOfDataTable + tableData.length;
							
							if(tableData.length > 0) {
								counter ++;
								var tbody					= $("[data-dataTableDetail='srNumber']").parent().parent();
								tbody						= (tbody[tbody.length - 1]);
								columnObjectForDetails		= $("[data-row='dataTableDetails']").children();
								columnObjectForDataTableDetails		= columnObjectForDetails;
								var totalLRs						= 0,
								actualWeight						= 0,	
								deliveryCommission					= 0,
								totalArticle						= 0,
								paidAmount							= 0,
								topayAmount							= 0,
								tbbAmount							= 0,
								toPayTotalPageWiseFreightCharge		= 0,
								freightCharge						= 0,
								payableAmountCommissionWiseOthers	= 0,
								bkgTotal							= 0,
								pickupCharge						= 0,
								totalHamaliChrg						= 0,
								otherAmount							= 0,
								loadingCharge						= 0,
								unloadingCharge						= 0,
								doorCollectionCharge				= 0,
								doorDeliveryCharge					= 0,
								doorPickupCharge					= 0,
								otherCharge							= 0,
								lrCharge							= 0,
								ddcCharge							= 0,
								toPayHamali							= 0,
								bkgTotalWithoutPaidAmt				= 0,
								csCharge							= 0;
								cartageAmount						= 0;
								var frtChargeOnArt					= 0;
								var bkgTotWithoutPaidAmt			= 0;
								var lrType          					= '';			
								var crossingSummary = new Object();
								
								var summaryTotalFlag		= false;
								var showConnectingAmount	= false;
								
								var newtable	= $("<table class='width'></table>");
								var cpyHeader	= $("#headerTable").clone();
								
								cpyHeader[0].id = 'headerTable'+counter;
								$(cpyHeader[0]).addClass('page-break');
								
								//var header = document.getElementById('headerTable'+counter);
								//$(cpyHeader[0]).children()[0]
								if(flavorConfiguration.lsPrintTruckAndDestWise && tableDataForTruckDelivery != undefined && tableDataForTruckDelivery.length <= 0 && counter == 1)
									$('#headerTable').removeClass("page-break");
								
								if(flavorConfiguration.lsPrintDDDVWise && tableDataForDDDVDelivery != undefined && tableDataForDDDVDelivery.length <= 0 && counter == 1)
									$('#headerTable').removeClass("page-break");
								
								if(counter > 1)
									mainAttr.push(cpyHeader);
								
								$("[data-info='lrType']").html(tableData[0].lrType);
								
								if(tableData[0].lrDispatchType != undefined && tableData[0].lrDispatchType == "crossing") {
									$("[data-info='lrDispatchType']").html(tableData[0].lrDispatchType + " Lr's");
									$("*[data-selector='otherNTCS']").removeAttr('id');
									$("*[data-selector='otherNTCS']").attr('data-hide', 'crossing')
									
									var showCrossingFreightAndCommissionBranchWise		  = flavorConfiguration.showCrossingFreightAndCommissionBranchWise;
									
									var branchesIdsArr				 = (flavorConfiguration.branchIdsForCrossingFreightAndCommission).split(",");
									var bookingSubRegionIdsArr		 = (flavorConfiguration.sourceSubRegionIdsforCrossingFreightAndCommission).split(",");
									var destSubRegionIdsAndRateArr	 = (flavorConfiguration.destinationSubRegionIdsforFreightAmountOnArticle).split(",");
									
									var	isAllowCrossingFreightAndCommissionforBranchIds	 = isValueExistInArray(branchesIdsArr, dispatchLSPrintModel.lsBranchId);
										
								}
									
								$("[data-info='wayBillExecutiveName']").html(response.dispatchLSHeader[tableData[0].wayBillSourceBranchId][0].dispatchLSExecutiveName);
								$($(cpyHeader[0]).find(".lrHandlingDestinationBranch"))[0].id = 'lrHandlingDestinationBranch_'+counter;
								$(newtable).append($("#dataTable").children().clone());
								
								var enter = false;
									for(var i = 0; i < tableData.length; i++) {
										if(tableData[i].isInvalidEwayBill == true)
											isInvalidEwayBillDataLr.push(tableData[i])
										
										if(!enter && tableData[i].lrHandlingDestinationBranch != undefined) {
											enter = true;
											
											if(counter == 1)
												$("#lrhandBranch").html(tableData[i].lrHandlingDestinationBranch);
											else
												$($(cpyHeader[0]).find(".lrHandlingDestinationBranch")).html(tableData[i].lrHandlingDestinationBranch);
										}
										
										totalLRs		= tableData[i].srNumber;
										actualWeight	= actualWeight + tableData[i].actualWeight;
										freightCharge	= freightCharge + tableData[i].freightCharge;
										totalArticle	= totalArticle + tableData[i].totalArticle;
										bkgTotal		= bkgTotal + tableData[i].amount;
										totalHamaliChrg	= totalHamaliChrg + tableData[i].hamaliCharge;
										otherAmount		= otherAmount+tableData[i].otherAmount;
										csCharge		= csCharge+tableData[i].csCharge;
										loadingCharge	= loadingCharge + tableData[i].loadingCharge;
										unloadingCharge	= unloadingCharge + tableData[i].unloadingCharge;
										doorCollectionCharge = doorCollectionCharge + tableData[i].doorCollectionCharge; 
										doorDeliveryCharge = doorDeliveryCharge + tableData[i].doorDeliveryCharge;
										doorPickupCharge = doorPickupCharge + tableData[i].doorPickupCharge;
										otherCharge		= otherCharge+tableData[i].otherCharge;
										lrCharge		= lrCharge + tableData[i].lrCharge;
										ddcCharge		= ddcCharge + tableData[i].ddcCharge;
										toPayHamali		= toPayHamali + tableData[i].toPayHamali;
										pickupCharge	= pickupCharge+tableData[i].pickupCharge;
										declaredValue	= tableData[i].declaredValue;
										grandTotal		= grandTotal + tableData[i].amount;
										cartageAmount	= cartageAmount+tableData[i].cartageAmount;
										lrType          = tableData[i].lrType;
										//Summary Object
										if(flavorConfiguration.displayLrTypeWiseTableDetails)
											LSPrintSetUp_1.LrTypeWiseSummary(tableData[i],i);
									
										if((tableData[i].wayBillTypeId == WAYBILL_TYPE_PAID && flavorConfiguration.replaceAmountWithZeroInPaidLR))
											bkgTotalWithoutPaidAmt		= bkgTotalWithoutPaidAmt + 0;
										else if((tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit') && flavorConfiguration.replaceAmountWithZeroInTBBLR)
											bkgTotalWithoutPaidAmt		= bkgTotalWithoutPaidAmt + 0;
										else
											bkgTotalWithoutPaidAmt		= bkgTotalWithoutPaidAmt + tableData[i].amount;
										
										if(tableData[i].wayBillTypeId == WAYBILL_TYPE_TO_PAY)
											toPayTotalPageWiseFreightCharge	= toPayTotalPageWiseFreightCharge + tableData[i].freightCharge;
										
										if(tableData[i].deliveryCommission != undefined)
											deliveryCommissionRate	= tableData[i].deliveryCommission;
										
										if(deliveryCommissionRate > 0) {
											if(flavorConfiguration.calculateCommissionOnFreightCharge)
												deliveryCommission		+= (deliveryCommissionRate * tableData[i].freightCharge / 100);
											else
												deliveryCommission		+= (deliveryCommissionRate * tableData[i].amount / 100);
											
											payableAmountCommissionWiseOthers = toPayTotalPageWiseFreightCharge - deliveryCommission ;
										}
										
										if(tableData[0].lrDispatchType != undefined && tableData[0].lrDispatchType == "normal") {
											if(tableData[i]['lrType'] == 'Paid'){
												normalLrPaidFreight = normalLrPaidFreight + tableData[i].freightCharge;
												normalLrToPaidCartage = normalLrToPaidCartage + tableData[i].cartageAmount;
											} else if (tableData[i]['lrType'] == 'To Pay') {
												normalLrToPayFreight	= normalLrToPayFreight + tableData[i].freightCharge;
												normalLrToPayAmount		= normalLrToPayAmount + tableData[i].amount;
												normalLrToPayCartage =	  normalLrToPayCartage + tableData[i].cartageAmount;
											} else if(tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit')
												normalLrTbbFreight	= normalLrTbbFreight + tableData[i].freightCharge;
												normalLrTBBCartage = normalLrTBBCartage + tableData[i].cartageAmount;

											normalLrOtherChgTotal	= normalLrOtherChgTotal+tableData[i].otherCharge;
										} else if(tableData[0].lrDispatchType != undefined && tableData[0].lrDispatchType == "crossing")
											crossingLrOtherChgTotal	= crossingLrOtherChgTotal+tableData[i].otherCharge;
										
										var newtr					= $("<tr class='height30px'></tr>");
										
										for(var j = 0; j < columnObjectForDetails.length; j++) {
											var newtd = $("<td></td>");
											var dataPicker = $(columnObjectForDetails[j]).attr("data-dataTableDetail");
											$(newtd).attr("class", $(columnObjectForDetails[j]).attr("class"));
											$(newtd).attr("id", $(columnObjectForDetails[j]).attr("id"));
											
											if(flavorConfiguration.replacePaidTbbAmountWithLrType) {
												if (dataPicker == 'paidFreightCharge') {
													if (tableData[i]['lrType'] == 'Paid') {
														$(newtd).html("Paid");
														paidAmount		= paidAmount + tableData[i].amount;
														paidFreight		= paidFreight + tableData[i].freightCharge;
													}
													
													if ((tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit')) {
														$(newtd).html('TBB');
														tbbAmount		= tbbAmount + tableData[i].amount;
														tbbFright		= tbbFright + tableData[i].freightCharge;
													}
												} else if (dataPicker == 'toPayFreightCharge') {
													if (tableData[i]['lrType'] == 'To Pay') {
														$(newtd).html(tableData[i].amount);
														topayAmount				= topayAmount + tableData[i].amount;
														toPayFreight			= toPayFreight + tableData[i].freightCharge;
													}
												} else if (dataPicker == 'tbbFreightCharge') {
													if ((tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit')) {
														$(newtd).html('TBB');
														tbbAmount		= tbbAmount + tableData[i].amount;
														tbbFright		= tbbFright + tableData[i].freightCharge;
													}
												} else
													$(newtd).html(tableData[i][dataPicker]);
											} else {
												if (dataPicker == 'paidFreightCharge') {
													if (tableData[i]['lrType'] == 'Paid') {
														$(newtd).html(tableData[i].amount);
														paidAmount		= paidAmount + tableData[i].amount;
														paidFreight		= paidFreight + tableData[i].freightCharge;
													}
												} else if (dataPicker == 'toPayFreightCharge') {
													if (tableData[i]['lrType'] == 'To Pay') {
														$(newtd).html(tableData[i].amount);
														topayAmount		= topayAmount + tableData[i].amount;
														toPayFreight	= toPayFreight + tableData[i].freightCharge;
													}
												} else if (dataPicker == 'tbbFreightCharge') {
													if ((tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit')) {
														$(newtd).html(tableData[i].amount);
														tbbAmount		= tbbAmount + tableData[i].amount;
														tbbFright		= tbbFright + tableData[i].freightCharge;
													}
												}
												
												if ((tableData[i]['lrType'] == 'FOC')) {
													if (dataPicker == 'freightCharge') {
														freightCharge	= freightCharge + 0;
														$(newtd).html(0);
													} else
														$(newtd).html(tableData[i][dataPicker]);
												} else if (dataPicker == 'otherCharge') {
													$(newtd).html(tableData[i][dataPicker]);
													
													if(tableData[i]['lrDispatchType'] == 'normal')
														$(newtd).attr('data-hide', 'normal')
													else if(tableData[i]['lrDispatchType'] == 'crossing')
														$(newtd).attr('data-hide', 'crossing');
												} else if (dataPicker == 'amount' && tableData[i].wayBillTypeId == WAYBILL_TYPE_PAID && flavorConfiguration.replaceAmountWithZeroInPaidLR)
													$(newtd).html('0');
												else if (dataPicker == 'amount' && (tableData[i]['lrType'] == 'TBB' || tableData[i]['lrType'] == 'Credit') && flavorConfiguration.replaceAmountWithZeroInTBBLR)
													$(newtd).html('0');
												else if(dataPicker == 'amount' && tableData[i]['lrDispatchType'] == 'crossing'){
													bkgTotWithoutPaidAmt += tableData[i].amount ;
													$(newtd).html(tableData[i][dataPicker]);
												} else
													$(newtd).html(tableData[i][dataPicker]);
												
												if(dataPicker == 'lrNumber' && tableData[i].isInvalidEwayBill && flavorConfiguration.showStarMarkOnInvalidEwayBill)
													$(newtd).html("**" + tableData[i][dataPicker]);
													
												if(tableData[0].lrDispatchType != undefined && tableData[0].lrDispatchType == "crossing") {
													if((dataPicker == 'freightCharge' || dataPicker == 'amount' || dataPicker == 'hamaliCharge' || dataPicker == 'csCharge' || dataPicker == 'otherCharge') && showCrossingFreightAndCommissionBranchWise && isAllowCrossingFreightAndCommissionforBranchIds) {
														if(isValueExistInArray(bookingSubRegionIdsArr, tableData[i].wayBillSourceBranchSubRegionId)) {
												
															for(var index = 0; index < destSubRegionIdsAndRateArr.length; index++) {
																var destSubId = parseInt(destSubRegionIdsAndRateArr[index].split("_")[0]);
															
																if(tableData[i].wayBillDestinationBranchSubRegionId == destSubId) {
																	var articleRate = parseInt(destSubRegionIdsAndRateArr[index].split("_")[1]);
																
																	if(dataPicker == 'freightCharge') {
																		summaryTotalFlag		= true;
																		showConnectingAmount	= true;
																		$(newtd).html(articleRate * tableData[i].totalArticle);
																		frtChargeOnArt += (articleRate * tableData[i].totalArticle);
																	
																		if(tableData[i].wayBillTypeId == WAYBILL_TYPE_PAID) {
																			paidTotal				+= (articleRate * tableData[i].totalArticle);
																			crossingLrPaidFreight	+= (articleRate * tableData[i].totalArticle);
																		} else if(tableData[i].wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
																			toPayTotal				+= (articleRate * tableData[i].totalArticle);
																			crossingLrToPayFreight	+= (articleRate * tableData[i].totalArticle);
																		} else if(tableData[i].wayBillTypeId == WAYBILL_TYPE_CREDIT) {
																			tbbTotal			+= (articleRate * tableData[i].totalArticle);
																			normalLrTbbFreight	+= (articleRate * tableData[i].totalArticle);
																		}
																	}
																
																	if (dataPicker == 'amount' && tableData[i].wayBillTypeId == WAYBILL_TYPE_PAID && flavorConfiguration.replaceAmountWithZeroInPaidLR)
																		$(newtd).html('0');
																	else if (dataPicker == 'amount' && tableData[i].wayBillTypeId == WAYBILL_TYPE_CREDIT && flavorConfiguration.replaceAmountWithZeroInTBBLR)
																		$(newtd).html('0');
																	else if(dataPicker == 'amount') {
																		$(newtd).html(tableData[i].amount);
																		//bkgTotWithoutPaidAmt += tableData[i].amount ;
																	}
																	
																	if(dataPicker == 'hamaliCharge'){
																		totalHamaliChrg	= totalHamaliChrg - tableData[i].hamaliCharge;
																		$(newtd).html(0);
																	}
																	
																	if(dataPicker == 'csCharge'){
																		csCharge		= csCharge-tableData[i].csCharge;
																		$(newtd).html(0);
																	}
																	
																	if(dataPicker == 'otherCharge'){
																		otherCharge		= otherCharge-tableData[i].otherCharge;
																		$(newtd).html(0);
																	}
																}
															}
														}else
															$(newtd).html(tableData[i][dataPicker]);
													}else if(dataPicker == 'amount' && ((tableData[i]['lrType'] == 'TBB') || (tableData[i]['lrType'] == 'Paid')) && flavorConfiguration.replacePaidAndTBBAmountWithBlank){
															$(newtd).html('');
													}else
														$(newtd).html(tableData[i][dataPicker]);
												} else if(dataPicker == 'freightCharge') {
													if(tableData[i].wayBillTypeId == WAYBILL_TYPE_PAID)
														paidTotal += tableData[i].freightCharge;
													
													if(tableData[i].wayBillTypeId == WAYBILL_TYPE_TO_PAY)
														toPayTotal += tableData[i].freightCharge;
													
													if(tableData[i].wayBillTypeId == WAYBILL_TYPE_CREDIT)
														tbbTotal += tableData[i].freightCharge;
												}
												
												if(dataPicker == 'pickupCartageWithHamali'){
													$(newtd).html(tableData[i]['toPayHamali'] + tableData[i]['cartageAmount'])													
												}
											}
											
											$(newtr).append(newtd);
										}
										
										$(newtable).append(newtr);
										mainAttr.push(newtable);
									}
									
									if(showCrossingFreightAndCommissionBranchWise) {
										crossingSummary.summaryTotalFlag	= summaryTotalFlag;
										crossingSummary.paidTotal			= paidTotal;
										crossingSummary.toPayTotal			= toPayTotal;
										crossingSummary.tbbTotal			= tbbTotal;
										grandTotal = paidTotal + toPayTotal + tbbTotal;
									}
									
									if(payableAmountCommissionWiseOthers > 0)
										payableDetailOthers = 'PLEASE DEPOSIT THE BALANCE  IN BANK AND INFORM : ';
									else if(payableAmountCommissionWiseOthers < 0)
										payableDetailOthers = 'PLEASE COLLECT THE BALANCE FROM BRANCH : ';
									else if(flavorConfiguration.showGodownComissnAndNill)
										payableDetailOthers = 'NILL : ';
									
									if(flavorConfiguration.replacePaidTbbAmountWithLrType) {
										$(newtable).append('<tr class="height30px"><td colspan="2" class="truncate borderTop borderBottom">Total</td><td class="truncate centerAlign borderTop borderBottom">'+totalArticle
										+'</td><td class="borderTop borderBottom infoStyle"> Wght : '+actualWeight+'</td><td class="truncate borderTop borderBottom">Total LRs : '+totalLRs +'</td><td class="truncate borderTop borderBottom centerAlign font20">'+freightCharge+'</td><td class="truncate borderTop borderBottom"></td><td class="truncate borderTop rightAlign font20  borderBottom">'+topayAmount
										+'<td class="truncate borderTop borderBottom"></td></td><td class="borderTop borderBottom"></td><td class="borderTop borderBottom"></td></tr>');
									} else if(flavorConfiguration.customizeTotalRowForTernex) {
										$(newtable).append('<tr class="height30px"><td colspan="5" class="truncate borderBottom centerAlign borderLeft">Total</td><td class="truncate centerAlign  borderBottom rightAlign">'+totalArticle
										+'</td><td colspan="5" class="borderBottom infoStyle"></td><td class=" borderBottom	  font13 rightAlign">'+freightCharge+'</td><td class="borderBottom borderLeft font13 rightAlign">'+otherAmount+'</td><td class=" borderBottom borderRight borderLeft font13 rightAlign">'+bkgTotal+'</td></tr>');
										setTimeout(function(){window.print();},200);
									} else if(flaverNo == flavor_476) {
										$(newtable).append('<tr class="height30px"><td class="truncate borderTop borderBottom  bold"  colspan="7"> </td>'
										+'<td class="truncate borderTop borderBottom  bold"> Total </td>'
										+'<td class="truncate borderTop centerAlign font20 borderBottom">'+bkgTotal
										+'</td><td class="borderTop borderBottom"></td></tr>');
									} else if(flaverNo == flavor_57) {
										$(newtable).append('<tr class="height30px"><td colspan="2" class="truncate borderTop borderBottom">Total</td><td class="truncate centerAlign borderTop borderBottom">'+totalArticle
										+'</td><td	class="borderTop borderBottom infoStyle"></td><td class="truncate borderTop borderBottom"><td class="truncate borderTop rightAlign font20 borderBottom">'+paidAmount
										+'<td class="borderTop borderBottom rightAlign">'+topayAmount+'</td><td class="borderTop borderBottom rightAlign">'+tbbAmount+'</td><td class="borderTop borderBottom"></td></tr>');
									} else if(flaverNo == flavor_laser_341) {
										$(newtable).append('<tr class="height30px"><td colspan="2" class="truncate borderTop borderBottom">Total</td><td class="truncate centerAlign borderTop borderBottom">'
										+'</td><td	class="borderTop borderBottom borderRight centerAlign infoStyle">'+totalArticle+'</td><td class="truncate centerAlign borderTop borderRight borderBottom"></td><td class="truncate borderTop borderBottom"><td class="truncate borderTop rightAlign font20 borderRight borderBottom">'+paidAmount
										+'<td class="borderTop borderBottom borderRight rightAlign">'+topayAmount+'</td><td class="borderTop borderBottom borderRight rightAlign">'+tbbAmount+'</td><td class="borderTop  borderBottom"></td></tr>');
									} else if(flaverNo == flavor_145) {
										$(newtable).append('<tr class="height30px"><td colspan="5" class="truncate borderTop borderBottom bold font20">Total</td><td class="truncate centerAlign borderTop borderBottom bold font20">'+totalArticle
										+'</td><td colspan="1" class="borderTop borderBottom infoStyle"></td><td class="borderTop borderBottom bold font20">'+actualWeight+'</td><td class="truncate borderTop rightAlign font20 borderBottom bold font20">'+Math.round(bkgTotal)+'</tr>');
									} else if(flaverNo == flavor_894 ) {
										$(newtable).append(
											'<tr class="height30px">' + 
											    '<td colspan="3" class="truncate borderTop borderBottom bold font20 verticalAlignMiddle">Total</td>' + 
											    '<td class="truncate textAlignRight verticalAlignMiddle paddingRight2px borderTop borderBottom bold font20">' + totalArticle + '</td>' +
											    '<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + freightCharge + '</td>' +
											    '<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + lrCharge + '</td>' +
											    '<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + toPayHamali + '</td>' +
											    '<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + ddcCharge + '</td>' +
											    '<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + otherCharge + '</td>' + 
											    '<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + bkgTotal + '</td>' + 
										    '</tr>'
								    	);
									}else if(flaverNo == flavor_928) {
											$(newtable).append(
												'<tr class="height30px">' + 
												    '<td colspan="3" class="truncate borderTop borderBottom bold font20 verticalAlignMiddle">Total</td>' + 
												    '<td class="truncate textAlignRight verticalAlignMiddle paddingRight2px borderTop borderBottom bold font20">' + totalArticle + '</td>' +
												    '<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + freightCharge + '</td>' +
												    '<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + toPayHamali + '</td>' +
													'<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + lrCharge + '</td>' +
												    '<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + doorPickupCharge + '</td>' +
													'<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + doorDeliveryCharge + '</td>' +
													'<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + otherCharge + '</td>' + 
												    '<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + bkgTotal + '</td>' + 
											    '</tr>'
									    	);
										} else if(flaverNo == flavor_883) {
										if(lrType == 'TBB' || lrType == 'Paid') {
											$(newtable).append(
												'<tr class="height30px">' + 
												    '<td colspan="3" class="truncate borderTop borderBottom bold font20 verticalAlignMiddle">Total</td>' + 
												    '<td class="truncate textAlignRight verticalAlignMiddle paddingRight2px borderTop borderBottom bold font20">' + totalArticle + '</td>' +
												    '<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + freightCharge + '</td>' +
												    '<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + lrCharge + '</td>' +
												    '<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + toPayHamali + '</td>' +
												    '<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + doorDeliveryCharge + '</td>' +
												    '<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + otherCharge + '</td>' + 
												    '<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px"></td>' + 
											    '</tr>'
									    	);
										}else{
											$(newtable).append(
												'<tr class="height30px">' + 
												    '<td colspan="3" class="truncate borderTop borderBottom bold font20 verticalAlignMiddle">Total</td>' + 
												    '<td class="truncate textAlignRight verticalAlignMiddle paddingRight2px borderTop borderBottom bold font20">' + totalArticle + '</td>' +
												    '<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + freightCharge + '</td>' +
												    '<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + lrCharge + '</td>' +
												    '<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + toPayHamali + '</td>' +
												    '<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + doorDeliveryCharge + '</td>' +
												    '<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + otherCharge + '</td>' + 
												    '<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + bkgTotal + '</td>' + 
											    '</tr>'
									    	);
										}
									} else if(flaverNo == flavor_915) {
										$(newtable).append(
											'<tr class="height30px">' + 
											    '<td colspan="3" class="truncate borderTop borderBottom bold font20 verticalAlignMiddle">Total</td>' + 
											    '<td class="truncate textAlignRight verticalAlignMiddle paddingRight2px borderTop borderBottom bold font20">' + totalArticle + '</td>' +
											    '<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + freightCharge + '</td>' +
											    '<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + lrCharge + '</td>' +
											    '<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + toPayHamali + '</td>' +
											    '<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + doorDeliveryCharge + '</td>' +
											    '<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + otherCharge + '</td>' + 
											    '<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + bkgTotal + '</td>' + 
										    '</tr>'
								    	);
									}else if(flaverNo == flavor_907) {
										$(newtable).append(
											'<tr class="height30px">' + 
											    '<td colspan="3" class="truncate borderTop borderBottom bold font20 verticalAlignMiddle">Total</td>' + 
											    '<td class="truncate textAlignRight verticalAlignMiddle paddingRight2px borderTop borderBottom bold font20">' + totalArticle + '</td>' +
											    '<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + freightCharge + '</td>' +
											    '<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + toPayHamali + '</td>' +
												'<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + lrCharge + '</td>' +
											    '<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + doorDeliveryCharge + '</td>' +
												'<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + doorPickupCharge + '</td>' +
												'<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + otherCharge + '</td>' + 
											    '<td class="truncate borderTop textAlignRight font20 borderBottom bold font20 verticalAlignMiddle paddingRight3px">' + bkgTotal + '</td>' + 
										    '</tr>'
								    	);
									}else if(flaverNo == flavor_741) {
									$(newtable).append('<tr class="height30px"><td colspan="5" class="truncate borderTop borderBottom bold font20">Total</td><td class="truncate centerAlign borderTop borderBottom bold font20">'+totalArticle
									+'</td><td colspan="1" class="borderTop borderBottom infoStyle"></td><td class="borderTop borderBottom bold font20">'+actualWeight+'</td><td class="truncate borderTop rightAlign font20 borderBottom bold font20">'+Math.round(bkgTotal)+'</tr>');
									} else if(flaverNo == flavor_565) {
										$(newtable).append('<tr class="height30px"><td colspan="2" class="truncate borderTop borderBottom bold font20">Total</td><td class="truncate centerAlign borderTop borderBottom bold font20">'+totalArticle+'</td><td class="truncate centerAlign borderTop borderBottom bold font20"></td><td class="truncate centerAlign borderTop borderBottom bold font20"></td><td class="truncate centerAlign borderTop borderBottom bold font20"></td><td class="truncate centerAlign borderTop borderBottom bold font20"></td><td class="truncate centerAlign borderTop borderBottom bold font20"><td class="truncate centerAlign borderTop borderBottom bold font20"></td><td colspan="5" class="truncate borderLeft borderTop	 font20 borderBottom bold font20">'+Math.round(bkgTotal)+'</tr>');
									} else if(flaverNo == flavor_582) {
										$(newtable).append('<tr class="height30px"><td colspan="2" class="truncate borderTop borderBottom bold font20">Total-------------------></td><td class="truncate centerAlign borderTop borderBottom bold font20"></td><td class="truncate centerAlign borderTop borderBottom bold font20"></td><td class="truncate centerAlign borderTop borderBottom bold font20">'+totalArticle+'</td><td class="truncate centerAlign borderTop borderBottom bold font20"></td><td class="truncate centerAlign borderTop borderBottom bold font20">'+actualWeight+'<td class="truncate borderLeft borderTop  font20 borderBottom bold font20">'+Math.round(bkgTotal)
										+'</tr> <tr class="height30px"><td colspan="2" class="truncate borderTop borderBottom bold font20">Total-------------------></td><td class="truncate centerAlign borderTop borderBottom bold font20">'+Math.round(bkgTotal)+'</td><td class="truncate centerAlign borderTop borderBottom bold font20"></td><td class="truncate centerAlign borderTop borderBottom bold font20">'+" "+'</td><td class="truncate centerAlign borderTop borderBottom bold font20"></td><td class="truncate centerAlign borderTop borderBottom bold font20">'+""+'<td class="truncate borderLeft borderTop	font20 borderBottom bold font20">'+""+'</tr>');
									}
									 else if(flaverNo == flavor_642) {
										$(newtable).append('<tr class="height30px"><td class="truncate borderTop borderBottom bold font20"></td><td class="truncate centerAlign borderTop borderBottom bold font20"></td><td class="truncate centerAlign borderTop borderBottom bold font20"></td><td class="truncate centerAlign borderTop borderBottom bold font20"></td><td class="truncate centerAlign borderTop borderBottom bold font20"></td><td class="truncate centerAlign borderTop borderBottom bold font20"></td><td class="truncate centerAlign borderTop borderBottom bold font20">'+totalArticle+'</td><td class="truncate borderTop borderBottom bold font20">'+cartageAmount+'</td><td	 class="truncate borderLeft borderTop  font20 borderBottom bold font20">'+Math.round(bkgTotal)+'</tr>');
									} else if(flaverNo == flavor_155) {
										$(newtable).append('<tr class="height30px"><td colspan="6" class="truncate borderTop borderBottom"></td><td class="truncate centerAlign borderTop borderBottom ">'+totalArticle
										+'</td><td class="borderTop borderBottom infoStyle ">'+declaredValue+'</td> <td> </td> <td> </td> <td class="borderTop borderBottom infoStyle ">'+grandTotal+'</td></tr>');
									} else if(flaverNo == flavor_Commission_180 || flaverNo == flavor_Commission_689) {
										if(frtChargeOnArt > 0) {
											$(newtable).append('<tr class="height30px"><td class="truncate borderTop borderBottom"></td><td class="truncate borderTop borderBottom"></td><td class="truncate borderTop borderBottom"></td><td class="truncate centerAlign borderTop borderBottom font27 bold">'+totalArticle
											+'</td><td class="truncate borderTop borderBottom"></td><td class="truncate borderTop borderBottom"></td><td class="truncate borderTop borderBottom"></td><td class="truncate borderTop borderBottom"></td><td class="truncate borderTop borderBottom"></td><td class="truncate borderTop borderBottom font27 bold">Total</td><td class="borderTop borderBottom font27 bold infoStyle ">'+frtChargeOnArt
											+'</td><td class="truncate borderTop borderBottom font27 bold rightAlign">'+totalHamaliChrg+'</td><td class="truncate borderTop borderBottom font27 bold rightAlign">'+csCharge+'</td><td class="truncate borderTop borderBottom font27 bold rightAlign ">'+otherCharge+'</td><td class="truncate borderTop borderBottom font27 bold rightAlign">'+bkgTotWithoutPaidAmt+'</td></tr>');
										} else {
											$(newtable).append('<tr class="height30px"><td class="truncate borderTop borderBottom"></td><td class="truncate borderTop borderBottom"></td><td class="truncate borderTop borderBottom"></td><td class="truncate centerAlign borderTop borderBottom font27 bold">'+totalArticle
											+'</td><td class="truncate borderTop borderBottom"></td><td class="truncate borderTop borderBottom"></td><td class="truncate borderTop borderBottom"></td><td class="truncate borderTop borderBottom"></td><td class="truncate borderTop borderBottom"></td><td class="truncate borderTop borderBottom font27 bold">Total</td><td class="borderTop borderBottom font27 bold infoStyle ">'+freightCharge
											+'</td><td class="truncate borderTop borderBottom font27 bold rightAlign">'+totalHamaliChrg+'</td><td class="truncate borderTop borderBottom font27 bold rightAlign">'+csCharge+'</td><td class="truncate borderTop borderBottom font27 bold rightAlign ">'+otherCharge+'</td><td class="truncate borderTop borderBottom font27 bold rightAlign">'+bkgTotalWithoutPaidAmt+'</td></tr>');
										}
									} else if(flaverNo == flavor_Commission_7 || flaverNo == flavor_Commission_721 ) {
										$(newtable).append('<tr class="height30px"><td class="truncate borderTop borderBottom"></td><td class="truncate borderTop borderBottom"></td><td class="truncate borderTop borderBottom"></td><td class="truncate borderTop borderBottom"></td><td class="truncate borderTop borderBottom"></td><td class="truncate borderTop borderBottom font27 bold"></td><td class="borderTop borderBottom font27 bold infoStyle ">Total</td><td class="truncate borderTop borderBottom font27 bold rightAlign">'+bkgTotalWithoutPaidAmt+'</td><td class="truncate borderTop borderBottom font27 bold rightAlign"></td><td class="truncate borderTop borderBottom font27 bold rightAlign "></td><td class="truncate borderTop borderBottom font27 bold rightAlign"></td></tr>');
									} else {
										$(newtable).append('<tr class="height30px"><td colspan="3" class="truncate borderTop borderBottom">Total</td><td class="truncate centerAlign borderTop borderBottom ">'+totalArticle
										+'</td><td class="borderTop borderBottom infoStyle "> Wght : '+actualWeight+'</td><td class="truncate borderTop borderBottom ">Total LRs : '+totalLRs +'</td><td class="truncate borderTop borderBottom rightAlign font20 ">'+paidAmount+'</td><td class="truncate borderTop rightAlign font20 borderBottom ">'+topayAmount
										+'<td class="truncate borderTop borderBottom font20 rightAlign">'+tbbAmount+'</td></td><td class="borderTop borderBottom"></td><td class="borderTop borderBottom"></td></tr>');
									}
									
									if(flaverNo != flavor_476 && flaverNo != flavor_145 && flaverNo != flavor_894 && flaverNo != flavor_928 && flaverNo != flavor_883 && flaverNo != flavor_915 && flaverNo != flavor_907  && flaverNo != flavor_741  && flaverNo != flavor_155
										&& flaverNo != flavor_Commission_180 && flaverNo != flavor_565 && flaverNo != flavor_Commission_7 && flaverNo != flavor_642 	|| flaverNo != flavor_Commission_689) {
										if(flavorConfiguration.showGodownComissnAndNill)
											var commissionTr	= '<tr class="deliveryCommission"><td colspan="11" class="infoStyle"><span>GODOWN COMMISION : </span>'+Math.round(deliveryCommission)+'</td></tr>'
										
										$(newtable).append(commissionTr);
											
										if(flavorConfiguration.showGodownComissnAndNill)
											var newtrForCommission		= '<tr class="height30px payableDetailOthers"><td colspan="11"><span>'+payableDetailOthers+'</span><span id="payableAmountOth_'+key+'">'+Math.abs(Math.round(payableAmountCommissionWiseOthers))+'</span></td></tr>';
											
										$(newtable).append(newtrForCommission);
									}
							} else if(Object.keys(tableDataHm).length == 1 && lengthOfDataTable == 0)
								$("#mainTable").addClass('hide');
						}
					} else
						$("#mainTable").addClass('hide');
					
					if (flavorConfiguration.showLsCommissionWiseDifferentPrint) {
						dispatchLSPrintModel.normalLrPaidFreight	= normalLrPaidFreight;
						dispatchLSPrintModel.normalLrToPayFreight	= normalLrToPayFreight;
						dispatchLSPrintModel.normalLrToPayAmount	= normalLrToPayAmount;
						dispatchLSPrintModel.normalLrTbbFreight		= normalLrTbbFreight;
						
						dispatchLSPrintModel.crossingLrPaidFreight	= crossingLrPaidFreight;
						dispatchLSPrintModel.crossingLrToPayFreight	= crossingLrToPayFreight;
						dispatchLSPrintModel.crossingLrToPayAmount	= bkgTotWithoutPaidAmt;
						dispatchLSPrintModel.crossingLrTbbFreight	= crossingLrTbbFreight;
						dispatchLSPrintModel.showConnectingAmount	= showConnectingAmount;
						
						LSPrintSetUp_1.setNormalLrsCommissionTable(dispatchLSPrintModel);
					}
				
					if(flavorConfiguration.displayLrTypeWiseTableDetails) {
						setTimeout(function(){window.print();},200);
					}
					
					$("#mainTable").append(mainAttr);
					
					if(flaverNo == flavor_Commission_180 	|| flaverNo == flavor_Commission_689)
						$("*[data-summarytotal='totalAmountNTCS']").html(grandTotal);
					
					LSPrintSetUp_1.setSummaryTableDetails(response, tableData, crossingSummary);
					loadLanguageWithParams(FilePath.loadLanguage(flaverNo.toLowerCase()));
					
					if(response.SetUpConfig.gruopWiseLanguageFileLoad == 'true')
						loadLanguageWithParams(FilePath.loadLanguageGruopWise(print_Model.accountGroupId));
				
					if (flaverNo == flavor_894 || flaverNo == flavor_928 || flaverNo == flavor_883 || flaverNo == flavor_915 || flaverNo == flavor_907) {
						setCompanyLogos(executive.accountGroupId);
					}
					
					if(isInvalidEwayBillDataLr.length > 0 && flavorConfiguration.showStarMarkOnInvalidEwayBill)
						LSPrintSetUp_1.setIsInvalidEwayBillDataLr(isInvalidEwayBillDataLr);
				});
			} else {
				Object.defineProperty(Array.prototype, 'chunk_inefficient', {
					value: function(chunkSize) {
						var array=this;
						return [].concat.apply([],
								array.map(function(elem,i) {
									return i%chunkSize ? [] : [array.slice(i,i+chunkSize)];
								})
						);
					}
				});
				
				response.displayLSTotalSummary		= flavorConfiguration.displayLSTotalSummary;
				
				if(response.accountGroupId == 233 || response.accountGroupId == 368 || response.accountGroupId == 442 || response.accountGroupId == 670 || response.accountGroupId == 772)
					_this.$el.append(lsprintsetupdestinationwiseBato.setDefaultPrint(response, printType)); // new Js for Bato And Default
				else if(response.accountGroupId == 563)
					_this.$el.append(lsprintsetupdestinationwisePsr.setDefaultPrint(response, printType));
				else if(printType == 'printSummary')
					_this.$el.append(dispatchlsprintsummary.setDefaultPrint(response, printType)); // new Js for APT And Default
				else
					_this.$el.append(lsprintsetupdestinationwiseBato.setDefaultPrint(response, printType)); // new Js for Bato And Default
			}
		}, getArrayForTableDetails : function(dispatchLRSummary, dispatchLSLRCharge, lrInvoiceDetail,response) {
			var numberOfLr							= 0;
			var dataKey				= Object.keys(dispatchLRSummary);
			var dataArray			= new Array();
			var srNo				= 1;
			var narrationForRT		= '';
			var crossingTotal		= 0;
			var chargeObj			= new Object();
			var truckDeliveryArray	= new Array();
			
			for (var i = 0; i < dataKey.length; i++) {
				var obj		= dispatchLRSummary[dataKey[i]];
				var objKey	= Object.keys(obj);
				
				for (var k = 0; k < objKey.length; k++) {
					var wayBillArray		= obj[objKey[k]];
					var dataArrayForMap		= new Array();
					
					for (var j = 0; j < wayBillArray.length; j++) {
						var dataObj	= wayBillArray[j];
						
						if (dispatchLSLRCharge[dataObj.wayBillId] == undefined) {
							chargeObj.wayBillFreightAmount			= 0;
							chargeObj.wayBillLoadingAmount			= 0;
							chargeObj.wayBillFOVAmount				= 0;
							chargeObj.wayBillOtherBookingAmount		= 0;
							chargeObj.wayBillStationaryAmount		= 0;
							chargeObj.wayBillHamaliAmount			= 0;
							chargeObj.srsHamaliCharge				= 0;
							chargeObj.wayBillTollAmount				= 0;
							chargeObj.wayBillReceiptAmount			= 0;
							chargeObj.wayBillDoorCollectionAmount	= 0;
							chargeObj.wayBillDoorDeliveryAmount		= 0;
							chargeObj.wayBillSmsAmount				= 0;
							chargeObj.wayBillDoorPickupAmount		= 0;
							chargeObj.wayBillDocCharge				= 0;
							chargeObj.wayBillInsurance				= 0;
							chargeObj.wayBillCrossingAmount			= 0;
							chargeObj.wayBillCodAmount				= 0;
							chargeObj.wayBillDocketAmount			= 0;
							chargeObj.wayBillCartageAmount			= 0;
							chargeObj.wayBillCollectionAmount		= 0;
							chargeObj.unloadingAmount				= 0;
							chargeObj.totalSksAmount				= 0;
							chargeObj.grandTotalSksAmnt				= 0;
							chargeObj.stCharge						= 0;
							chargeObj.totalFreight					= 0;
							chargeObj.totalLoading					= 0;
							chargeObj.totalUnloading				= 0;
							chargeObj.totalDoordelivery				= 0;
							chargeObj.totalST						= 0;
							chargeObj.totalOther					= 0;
							chargeObj.totalGST						= 0;
							chargeObj.wayBillServiceCharge			= 0;
							chargeObj.staticalCharge				= 0;
							chargeObj.tollGateCharge				= 0;
							chargeObj.cantonmentCharge				= 0;
							chargeObj.weightBridgeCharge			= 0;
							chargeObj.handlingCharge				= 0;
							chargeObj.wayBillDDCAmount				= 0;
							chargeObj.deliveryDDCCommission			= 0;
							chargeObj.totalFreightGst				= 0;
							chargeObj.wayBillPaidHamaliAmount		= 0;							
							chargeObj.pickupCharge					= 0;
							chargeObj.toPayHamaliCharge				= 0;
							chargeObj.iandSCharge					= 0;
							chargeObj.artCharge						= 0;
							chargeObj.surCharge						= 0;
							chargeObj.withPassCharge				= 0;
							chargeObj.lucCharge						= 0;
							chargeObj.vscCharge						= 0;
							chargeObj.doorBookCharge				= 0;
							chargeObj.lc							= 0;
							chargeObj.wayBillBuiltyAmount			= 0;
							chargeObj.csCharge						= 0;
							chargeObj.hcCharge						= 0;
							chargeObj.toPayHmali					= 0;
							chargeObj.wayBillCodVppAmount			= 0;
							chargeObj.cashRefund					=  0;
							chargeObj.afCharge						=  0;
							chargeObj.pfCharge						=  0;
							chargeObj.tempoBhadaBooking				=  0;
							chargeObj.crossingHire					=  0;
						} else {
							chargeObj	= dispatchLSLRCharge[dataObj.wayBillId][0];
						}
						
						var bookingDateWithoutYear = dataObj.wayBillBookingDateString.replace("-","/");
						
						dataObj.srNumber						= srNo;
						dataObj.srNumber1						= srNo;
						dataObj.lrNumber						= dataObj.wayBillNumber;
						dataObj.lrRemarkSubstring				= dataObj.lrRemark.substring(0,15);
						dataObj.bookingDate						= (dataObj.wayBillbookingDate).substring(0,8);
						dataObj.bookingDateWithoutYear			= bookingDateWithoutYear.substring(0,5);
						dataObj.lrSourceBranch					= dataObj.wayBillSourceBranchName;
						dataObj.lrDestinationBranch				= dataObj.wayBillDestinationBranchName;
						dataObj.lrDestinationBranchsubString	= dataObj.wayBillDestinationBranchName.substring(0,6);
						dataObj.lrSourceSubRegion				= dataObj.wayBillSourceBranchSubRegionName;
						dataObj.lrDestinationSubRegion			= dataObj.wayBillDestinationBranchSubRegionName;
						dataObj.isInvalidEwayBill				= dataObj.invalidEwayBill;
						dataObj.lrSourceBranchSubstring			= dataObj.wayBillSourceBranchName.substring(0,15);
						dataObj.lrDestinationBranchSubstring	= dataObj.wayBillDestinationBranchName.substring(0,15);
						dataObj.dispatchDateStr					= dataObj.dispatchDateStr;
						dataObj.podUpload						= dataObj.podUploadedStr;
						dataObj.podReceive						= dataObj.podReceivedStr;
						
						if(dataObj.paymentStatus == '--')
							dataObj.paymentStatus					= dataObj.wayBillStatusString;
						else
							dataObj.paymentStatus					= dataObj.paymentStatus;
						
						dataObj.weightRate					= dataObj.weightRate;
												
						let commaSepratedPartNumberandQuentity = [];
						
						for (let index in lrInvoiceDetail) {				 
							let insideObj = lrInvoiceDetail[index];
							
							for(let x in insideObj) {
								if(insideObj[x].wayBillId == dataObj.wayBillId && insideObj[x].partNumber != undefined)
									commaSepratedPartNumberandQuentity.push(insideObj[x].partNumber + "(" + insideObj[x].quantity + ")");	
							}
						 
							dataObj.commaSepratedPartNumberandQuentity = commaSepratedPartNumberandQuentity.join(', ') ;
						}
						
						if(dataObj.receivedLsDateTimes == undefined || dataObj.receivedLsDateTimes == null || dataObj.receivedLsDateTimes == 'null')
							dataObj.receivedLsDateTimes		= "--"

						if(dataObj.formNumber != undefined && typeof dataObj.formNumber !== 'undefined') {
							
							if(response.accountGroupId == ACCOUNT_GROUP_ID_CITY){
								dataObj.lrNumber	= "**"+ dataObj.wayBillNumber;
								dataObj.isBold = true
						}
							dataObj.formNumberHPSS	= "Y";
							if(flavorConfiguration.printAllEwayBill)
								dataObj.formNumberVeertr		= replaceSlash(dataObj.formNumber,',',', ');
									
						} else {
							dataObj.formNumberHPSS		= "N";
							dataObj.formNumberVeertr	= " ";
							dataObj.formNumber				= " ";
						}

						if(dataObj.fromNumber != '' && dataObj.formNumber != undefined && dataObj.formNumber !== ' '){
							dataObj.ewayBillCount  = dataObj.formNumber.split(',').length;
						}else{
							dataObj.ewayBillCount  = 0
						}
						

						
						if(dataObj.handlingBranchId > 0)
							dataObj.lrHandlingDestinationBranch	= dataObj.wayBillDestinationHandlingBranchName;
						else
							dataObj.lrHandlingDestinationBranch	= dataObj.wayBillDestinationBranchName;
						
						dataObj.lrSourceBranchAbrvn			= dataObj.wayBillSourceBranchAbrvtinCode;
						dataObj.lrDestinationBranchAbrvn		= dataObj.wayBillDestinationBranchAbrvtinCode;
						
						if(dataObj.wayBillSourceBranchCode != undefined)
							dataObj.lrSourceBranchCode			= dataObj.wayBillSourceBranchCode;
						else
							dataObj.lrSourceBranchCode			= dataObj.wayBillSourceBranchName;
						
						if(dataObj.wayBillDestinationBranchCode != undefined)
							dataObj.lrDestinationBranchCode		= dataObj.wayBillDestinationBranchCode;
						else
							dataObj.lrDestinationBranchCode			= dataObj.wayBillDestinationBranchName
						
						if(dataObj.wayBillSourceBranchAbrvtinCode != undefined && dataObj.wayBillSourceBranchAbrvtinCode.length > 0)
							dataObj.lrSourceBranchConditionalAbrvn	= dataObj.wayBillSourceBranchAbrvtinCode;
						else
							dataObj.lrSourceBranchConditionalAbrvn	= dataObj.wayBillSourceBranchName;
						
						if(dataObj.wayBillDestinationBranchAbrvtinCode != undefined && dataObj.wayBillDestinationBranchAbrvtinCode.length > 0)
							dataObj.lrDestBranchConditionalAbrvn	= dataObj.wayBillDestinationBranchAbrvtinCode;
						else
							dataObj.lrDestBranchConditionalAbrvn	= dataObj.wayBillDestinationBranchName;

						dataObj.consignor					= dataObj.wayBillConsignorName;
						dataObj.consignorFullName			= dataObj.wayBillConsignorName;
						dataObj.consignee					= dataObj.wayBillConsigneeName;
						dataObj.consigneeFullName			= dataObj.wayBillConsigneeName;
						dataObj.consigneeContact			= dataObj.wayBillConsigneeContactNumber;
						dataObj.consignorContact			= dataObj.wayBillConsignorContactNumber;
						dataObj.lrType						= dataObj.wayBillType;
						dataObj.consignmentPackingDetails	= dataObj.packingTypeString;
						dataObj.consigneeForMAT				= (dataObj.wayBillConsigneeName).substring(0,40);
						dataObj.consignorForSAL				= (dataObj.wayBillConsignorName).substring(0,20);
						dataObj.consigneeForSAL				= (dataObj.wayBillConsigneeName).substring(0,20);
						
						var packingTypeCommaSeperated			= dataObj.packingTypeCommaSeperated;
						
						var formNumberStr						= dataObj.formNumber;
						
						dataObj.packingTypeCommaSeperated	= packingTypeCommaSeperated;
						dataObj.consignmentPackingDetails1	= dataObj.packingTypeString;
						dataObj.consignmentPackingDetails2	= (dataObj.packingTypeString).substring(0,10);
						dataObj.freightCharge				= chargeObj.wayBillFreightAmount;
						dataObj.hamaliColl					= chargeObj.wayBillLoadingAmount + chargeObj.wayBillReceiptAmount + chargeObj.wayBillCollectionAmount;
						dataObj.loadingCharge				= chargeObj.wayBillLoadingAmount;
						dataObj.loadingChargeRT				= chargeObj.wayBillLoadingAmount;
						dataObj.loadingChargeformls			= chargeObj.wayBillLoadingAmount;
						dataObj.receiptCharge				= chargeObj.wayBillReceiptAmount;
						dataObj.collectionCharge			= chargeObj.wayBillCollectionAmount;
						dataObj.wayBillDocCharge			= chargeObj.wayBillDocCharge;
						dataObj.wayBillInsurance			= chargeObj.wayBillInsurance;
						dataObj.wayBillCrossingAmount		= chargeObj.wayBillCrossingAmount;
						dataObj.cartageAmount				= chargeObj.wayBillCartageAmount;
						dataObj.freightCharge				= chargeObj.wayBillFreightAmount;
						dataObj.CodAmount					= chargeObj.wayBillCodAmount;
						dataObj.DocketAmount				= chargeObj.wayBillDocketAmount;
						dataObj.unloadingAmount				= chargeObj.unloadingAmount;
						dataObj.amount						= dataObj.wayBillGrandTotal;
						dataObj.totalArticle				= dataObj.wayBillArticleQuantity;
						dataObj.invoiceNo					= dataObj.consignmentSummaryInvoiceNo; 
						dataObj.invoiceNoCommaWithSpace     = replaceSlash(dataObj.consignmentSummaryInvoiceNo,',',', ');
						dataObj.lrCharge					= chargeObj.wayBillLrCharge;
						dataObj.Crossingcharge				= chargeObj.wayBillCrossingAmount;
						dataObj.freightOm					= chargeObj.wayBillFreightAmount + chargeObj.wayBillStationaryAmount;
						
						if(dataObj.wayBillTypeId == WAYBILL_TYPE_FOC)
							dataObj.lrCharge						= 0;
												
						dataObj.sumOfOtherChargesForSugama  = chargeObj.wayBillServiceCharge+chargeObj.wayBillDoorDeliveryAmount+chargeObj.srsHamaliCharge+chargeObj.wayBillOtherBookingAmount+chargeObj.handlingCharge+chargeObj.wayBillDoorPickupAmount;
						dataObj.serviceCharge				= chargeObj.wayBillServiceCharge;
						dataObj.staticalCharge				= chargeObj.staticalCharge;
						dataObj.tollGateCharge				= chargeObj.tollGateCharge;
						dataObj.cantonmentCharge			= chargeObj.cantonmentCharge;
						dataObj.weightBridgeCharge			= chargeObj.weightBridgeCharge;
						dataObj.handlingCharge				= chargeObj.handlingCharge;
						dataObj.DDC							= chargeObj.wayBillDDCAmount;
						dataObj.csCharge					= chargeObj.csCharge;
						dataObj.consignorMobileNumber		= dataObj.wayBillConsignorMobileNumber;
						dataObj.consigneeMobileNumber		= dataObj.wayBillConsigneeMobileNumber;
						dataObj.loadedArticle				= dataObj.wayBillArticleQuantity
						
						if(dataObj.totalQuantity == 0)
							dataObj.remainingArticle		= 0;
						else
							dataObj.remainingArticle		= dataObj.totalQuantity - dataObj.loadedArticle
						
						dataObj.wayBillbookingDateTime		= dataObj.wayBillbookingDate;
						dataObj.pickupCharge				= chargeObj.pickupCharge;
						dataObj.wayBillCodVppAmount			= chargeObj.wayBillCodVppAmount;
						dataObj.cashRefund					= chargeObj.cashRefund;
						dataObj.afCharge					= chargeObj.afCharge;
						dataObj.pfCharge					= chargeObj.pfCharge;
						dataObj.tempoBhadaBooking			= chargeObj.tempoBhadaBooking;
						dataObj.crossingHire				= chargeObj.crossingHire;
						dataObj.ddcCharge					= chargeObj.ddcCharge;
						dataObj.dbcCharge					= chargeObj.dbcCharge;
						dataObj.commSres					= (10 * chargeObj.wayBillFreightAmount) / 100
						dataObj.consigneeNameWithMob		= dataObj.wayBillConsigneeName + "<br>" + dataObj.wayBillConsigneeMobileNumber;
						dataObj.consignorNameWithMob		= dataObj.wayBillConsignorName + "<br>" + dataObj.wayBillConsignorMobileNumber;
						dataObj.wayBillbookingDateBrTime	= dataObj.wayBillbookingDate.split(' ')[0] + "<br>" + dataObj.wayBillbookingDate.split(' ')[1] + " " + dataObj.wayBillbookingDate.split(' ')[2]
						dataObj.artWithPackingType			= dataObj.wayBillArticleQuantity + "-" + dataObj.articleTypeCommaSeperated 
						dataObj.packingtypeforMR			= dataObj.packingGroupTypeString.split(',');
						dataObj.consignmentSummaryString	= dataObj.consignmentSummaryString
						dataObj.consigneeNameWithMobAndAddress		= dataObj.wayBillConsigneeName + "<br>" + dataObj.consigneeAddress+ "("+ dataObj.wayBillConsigneeMobileNumber+")";
						dataObj.chargeAndAcualWt			= dataObj.wayBillActualWeight + "/" + dataObj.wayBillChargeWeight;
						if(dataObj.totalQuantity>0){
							dataObj.totalQuantity = dataObj.totalQuantity
						}else{
							dataObj.totalQuantity = dataObj.wayBillArticleQuantity
						}
						if(dataObj.packingtypeforMR.length > 1) {
							for(let i = 0; i < 1; i++) {
								dataObj.packtypeMR = dataObj.packingtypeforMR[i] + dataObj.packingtypeforMR[i + 1]
							}
						} else
							dataObj.packtypeMR = dataObj.packingtypeforMR
						
						if(dataObj.wayBillTypeId == WAYBILL_TYPE_TO_PAY)
							dataObj.amountPAY		= dataObj.wayBillGrandTotal;
						else
							dataObj.amountPAY		= 0;
						
						if(flavorConfiguration.doNotShowTBBAmount && dataObj.wayBillTypeId == WAYBILL_TYPE_CREDIT)
							dataObj.amount	= '';
							
						if(flavorConfiguration.doNotShowPaidAmount && dataObj.wayBillTypeId == WAYBILL_TYPE_PAID)
							dataObj.amount	= '';
						
						if(flavorConfiguration.showOnlyTopayHamali && dataObj.wayBillTypeId == WAYBILL_TYPE_TO_PAY){
							dataObj.topayHamali	= chargeObj.wayBillHamaliAmount;
							dataObj.topayTotalAmount	= dataObj.wayBillGrandTotal;
						}else{
							dataObj.topayHamali	= '';
							dataObj.topayTotalAmount	= '';
						}
							
						if(dataObj.wayBillTypeId == WAYBILL_TYPE_CREDIT)
							dataObj.amountForGARUDA		= 0;
						else
							dataObj.amountForGARUDA		= dataObj.wayBillGrandTotal;
						
						if(dataObj.wayBillTypeId == WAYBILL_TYPE_CREDIT || dataObj.wayBillTypeId == WAYBILL_TYPE_PAID)
							dataObj.amountTBB		= dataObj.wayBillGrandTotal;
						else
							dataObj.amountTBB		= 0;
						
						if(dataObj.wayBillTypeId == WAYBILL_TYPE_CREDIT || dataObj.wayBillTypeId == WAYBILL_TYPE_PAID || dataObj.wayBillTypeId == WAYBILL_TYPE_FOC)
							dataObj.amountHideToPay		= dataObj.wayBillGrandTotal;
						else
							dataObj.amountHideToPay		= ' ';
						
						if(dataObj.wayBillTypeId == WAYBILL_TYPE_CREDIT || dataObj.wayBillTypeId == WAYBILL_TYPE_TO_PAY || dataObj.wayBillTypeId == WAYBILL_TYPE_PAID)
							numberOfLr++;
						
						if(packingTypeCommaSeperated != undefined)
							dataObj.firstSaidToContain		= packingTypeCommaSeperated.split(", ")[0];
						else
							dataObj.firstSaidToContain		= '';
						
						if(packingTypeCommaSeperated != undefined)
							dataObj.saidToContain		= packingTypeCommaSeperated;
						else
							dataObj.saidToContain		= '';
						
						dataObj.zeroAmt		= 0;
										
						if(formNumberStr != undefined)
							dataObj.firstFormNumber		= formNumberStr.substring(0,12);
						else
							dataObj.firstFormNumber		= '';
						
						if (typeof dataObj.privateMark != 'undefined' || dataObj.privateMark != undefined) {
							dataObj.privateMarkForMGTS			= getFourBeforeSpecialCharacter(dataObj.privateMark)
							if(dataObj.privateMark.length > 15)
								dataObj.privateMarkNew			= (dataObj.privateMark).substring(0,15);
							else
								dataObj.privateMarkNew			= dataObj.privateMark;
						}
						
						if(typeof dataObj.packingTypeCommaSeperated != 'undefined' && dataObj.packingTypeCommaSeperated != undefined){
							dataObj.packingTypeCommaSeperatedSubstring	= dataObj.packingTypeCommaSeperated.substring(0,20);
							
							if(flaverNo == flavor_540)
								dataObj.packingTypeCommaSeperated	= dataObj.packingTypeCommaSeperated.substring(0,10);
						}
						
						if(flavorConfiguration.clubFreightChargeAndLoadingChargeForToPay && dataObj.wayBillTypeId  == WAYBILL_TYPE_TO_PAY)
							dataObj.fullToPayfreightCharge	= dataObj.wayBillGrandTotal;
						
						if(dataObj.wayBillTypeId == WAYBILL_TYPE_PAID || dataObj.wayBillTypeId	== WAYBILL_TYPE_TO_PAY)
							dataObj.totalAmountForGTM	= dataObj.wayBillGrandTotal;
						else
							dataObj.totalAmountForGTM	= 0;
						
						if(dataObj.wayBillCrossingAmount != undefined && dataObj.wayBillCrossingAmount > 0 && dataObj.lrNumber != undefined) {
							narrationForRT	+= dataObj.lrNumber+', ';
							crossingTotal	+= dataObj.wayBillCrossingAmount;
						}
						
						dataObj.narrationForRT		= narrationForRT;
						dataObj.crossingTotal		= crossingTotal;
						
						if(flavorConfiguration.replaceSelfLRNO && (dataObj.wayBillConsigneeName == "SELF" || dataObj.wayBillConsigneeName == "self"))
							dataObj.consignee =	 "SELF/" + dataObj.invoiceNo ;
						
						if(dataObj.consigneeTinNo != undefined)
							dataObj.consigneeTinNo				= dataObj.consigneeTinNo;
						else
							dataObj.consigneeTinNo				= "";	
						
						if(dataObj.consignorTinNo != undefined)
							dataObj.consignorTinNo				= dataObj.consignorTinNo;
						else
							dataObj.consignorTinNo				= "";
						
						if(PAYMENT_TYPE_CREDIT_ID == dataObj.paymentTypeId) {
							dataObj.balance						= dataObj.wayBillGrandTotal - dataObj.wayBillAdvancePaid;
							dataObj.advancePaid1					= dataObj.wayBillAdvancePaid;
						}
						
						if(flaverNo == flavor_2 && dataObj.wayBillTypeId == WAYBILL_TYPE_CREDIT)
							dataObj.wayBillTypeId			= 0;
						
						if(dataObj.wayBillTypeId == WAYBILL_TYPE_CREDIT)
							dataObj.lrType					= 'TBB';
							
						if(flavorConfiguration.isAllowShortFormateLrType) {
							if(dataObj.wayBillTypeId == WAYBILL_TYPE_PAID)
								dataObj.lrType					= 'P';
							else if(dataObj.wayBillTypeId == WAYBILL_TYPE_TO_PAY)	
								dataObj.lrType					= 'TP';
						}
						
						
						// FOR MKR
						if(dataObj.wayBillTypeId == WAYBILL_TYPE_TO_PAY)
							dataObj.totalAmountMKR		= dataObj.wayBillGrandTotal;
						else if(dataObj.wayBillTypeId == WAYBILL_TYPE_PAID)
							dataObj.totalAmountMKR		= 'PAID';
						else if(dataObj.wayBillTypeId == WAYBILL_TYPE_CREDIT)
							dataObj.totalAmountMKR		= ' ';
						else
							dataObj.totalAmountMKR		= dataObj.wayBillGrandTotal;
						
						/*	change configuration for abbas*/
						if(flavorConfiguration.showTBBWithBookingBranchName && dataObj.wayBillTypeId == WAYBILL_TYPE_CREDIT)
							dataObj.lrType					= dataObj.lrType + " at " + dataObj.wayBillSourceBranchSubRegionName;
						
						dataObj.fovCharge					= chargeObj.wayBillFOVAmount;
						dataObj.otherCharge					= chargeObj.wayBillOtherBookingAmount;
						dataObj.consigneeContact				= dataObj.wayBillConsigneeMobileNumber;
						
						if(flavorConfiguration.replaceWeightWithFTL && dataObj.bookingTypeId == BOOKING_TYPE_FTL_ID)
							dataObj.actualWeight				= BOOKING_TYPE_FTL_NAME;
						else
							dataObj.actualWeight				= dataObj.wayBillActualWeight;
						
						if(dataObj.wayBillActualWeight > 0)
							dataObj.actualWeightssr			= dataObj.wayBillActualWeight;
						else
							dataObj.actualWeightssr			= "Fixed";
							
						dataObj.chargeWeight				= dataObj.wayBillChargeWeight;
						dataObj.advancePaid					= dataObj.wayBillAdvancePaid;
						dataObj.stationaryCharge			= chargeObj.wayBillStationaryAmount;	
						dataObj.hamaliCharge				= chargeObj.wayBillHamaliAmount;
						dataObj.totalWithoutHamali			= dataObj.wayBillGrandTotal - chargeObj.wayBillHamaliAmount;
						dataObj.srsHamaliCharge				= chargeObj.srsHamaliCharge;
															
						dataObj.tollCharge					= chargeObj.wayBillTollAmount;				
						dataObj.doorCollectionCharge		= chargeObj.wayBillDoorCollectionAmount;		
						dataObj.doorDeliveryCharge			= chargeObj.wayBillDoorDeliveryAmount;		
						
						dataObj.stCharge					= chargeObj.stCharge;		
						dataObj.smsCharge					= chargeObj.wayBillSmsAmount;
						dataObj.serviceTax					= chargeObj.wayBillServiceTaxAmount;	
						dataObj.wayBillDocCharge			= chargeObj.wayBillDocCharge;	
						dataObj.wayBillInsurance			= chargeObj.wayBillInsurance;	
						dataObj.unloadingWithDoorDelAmount	= Math.round(chargeObj.unloadingAmount + chargeObj.wayBillDoorDeliveryAmount);
						dataObj.totaSks						= Math.round(chargeObj.wayBillFreightAmount + chargeObj.wayBillOtherBookingAmount + chargeObj.wayBillLoadingAmount + chargeObj.stCharge) ;
						dataObj.grandTotaLSks				= Math.round(dataObj.totaSks + dataObj.unloadingWithDoorDelAmount+dataObj.serviceTax);
						dataObj.otherAmount					= dataObj.wayBillGrandTotal - chargeObj.wayBillFreightAmount - chargeObj.wayBillServiceTaxAmount + chargeObj.wayBillServiceTaxAmount;
						dataObj.totalLRs					= srNo;
						dataObj.doorPickupCharge			= chargeObj.wayBillDoorPickupAmount;					
						dataObj.otherChargeAmountAptc		= dataObj.wayBillGrandTotal - chargeObj.wayBillFreightAmount - (dataObj.doorPickupCharge + dataObj.doorDeliveryCharge);
						dataObj.otherChargeOPs				= dataObj.wayBillGrandTotal - chargeObj.wayBillFreightAmount;
						dataObj.loadingChargeSks			+= chargeObj.wayBillLoadingAmount;
						dataObj.totalFreightGst				= Math.round(chargeObj.wayBillFreightAmount + chargeObj.wayBillServiceTaxAmount);
						dataObj.paidHamaliCharge			= chargeObj.wayBillPaidHamaliAmount;
						dataObj.toPayHamali					= chargeObj.toPayHamaliCharge;
						dataObj.iandSCharge					= chargeObj.iandSCharge;
						dataObj.unloadingCharge				= chargeObj.unloadingCharge;
						dataObj.surCharge					= chargeObj.surCharge;
						dataObj.artCharge					= chargeObj.artCharge;
						dataObj.withPassCharge				= chargeObj.withPassCharge;
						dataObj.lucCharge					= chargeObj.lucCharge;
						dataObj.vscCharge					= chargeObj.vscCharge;
						dataObj.doorBookCharge				= chargeObj.doorBookCharge;
						dataObj.lc							= chargeObj.lc;
						dataObj.wayBillBuiltyAmount			= chargeObj.wayBillBuiltyAmount;
						dataObj.csCharge					= chargeObj.csCharge;
						dataObj.stationary					= chargeObj.wayBillStationary;
						dataObj.declareValue				= Math.round(dataObj.declaredValue);
						dataObj.hcCharge					= chargeObj.hcCharge;
						dataObj.ddCharge					= chargeObj.ddCharge;
						dataObj.dcCharge					= chargeObj.dcCharge;
						dataObj.toPayHmali					= chargeObj.toPayHmali;
						dataObj.bookingTotal				= dataObj.amount - chargeObj.wayBillServiceTaxAmount;
															
						if(dataObj.actualWeight > 0)
							dataObj.rate					= parseFloat(dataObj.wayBillGrandTotal / dataObj.actualWeight).toFixed(1);
						else
							dataObj.rate					= 0;
						
						let crossingHamaliForLR = 0;
						if (response.crossingHamaliPerLR && response.crossingHamaliPerLR[dataObj.wayBillId] !== undefined) {
						    crossingHamaliForLR = response.crossingHamaliPerLR[dataObj.wayBillId];
						}
						dataObj.crossingHamali = crossingHamaliForLR;

						if(crossingTxnTypeId == TRANSACTION_TYPE_DELIVERY_CROSSING) {
							if(dataObj.wayBillTypeId == WAYBILL_TYPE_CREDIT || dataObj.wayBillTypeId == WAYBILL_TYPE_PAID) {
								dataObj.payableAmount		= dataObj.crossingHireAmt;
								dataObj.receivableAmount	= 0;
							} else if (dataObj.wayBillTypeId == WAYBILL_TYPE_TO_PAY){
								dataObj.payableAmount		= 0;
								dataObj.receivableAmount	= (dataObj.wayBillGrandTotal - dataObj.crossingHireAmt);
							}
						} else if (crossingTxnTypeId == TRANSACTION_TYPE_BOOKING_CROSSING) {
							if(dataObj.wayBillTypeId == WAYBILL_TYPE_CREDIT || dataObj.wayBillTypeId == WAYBILL_TYPE_PAID) {
								dataObj.payableAmount		= 0;
								dataObj.receivableAmount	= (dataObj.wayBillGrandTotal - dataObj.crossingHireAmt);
							} else if (dataObj.wayBillTypeId == WAYBILL_TYPE_TO_PAY){
								dataObj.payableAmount		= (dataObj.wayBillGrandTotal - dataObj.crossingHireAmt);
								dataObj.receivableAmount	= 0;
							}
						}
						
						var totalLRAndServiceCharge = dataObj.wayBillGrandTotal;
						
						dataObj.totalLRAndServiceCharge	 =	totalLRAndServiceCharge
						
						srNo++;
						dataObj.numberOfLr		= numberOfLr;
						dataArray.push(dataObj)
						
						if(flavorConfiguration.lsPrintTruckAndDestWise && dataObj.deliveryTypeId == DELIVERY_TO_TRUCK_DELIVERY_ID)
							truckDeliveryArray.push(dataObj);
						else
							dataArrayForMap.push(dataObj);
					}
					
					if(flavorConfiguration.lsPrintTruckAndDestWise) {
						if(objKey[k] in tableDataHm) {
							var dataset = tableDataHm[objKey[k]];
							
							for(var l = 0; l < dataArrayForMap.length; l++) {
								dataset.push(dataArrayForMap[l]);
							}
						} else
							tableDataHm[objKey[k]]	= dataArrayForMap;
					}
				}
			}
			
			if(flavorConfiguration.lsPrintTruckAndDestWise)
				return truckDeliveryArray;
			
			return dataArray;
		}, getArrayForDestinationWiseSummaryDetails : function(dispatchLRSummary, dispatchLSLRCharge, lsDestBranch) {
			var dataKey		= Object.keys(dispatchLRSummary);
			var dataArray	= new Array();
			var chargeObj	= new Object();
			
			for (var i = 0; i < dataKey.length; i++) {
				var obj			= dispatchLRSummary[dataKey[i]];
				var objKey		= Object.keys(obj);
				
				for (var k = 0; k < objKey.length; k++) {
					var objKey		= Object.keys(obj);
					
					for (var k = 0; k < objKey.length; k++) {
						var srNo		= 1;
						var totalArticle	= 0;
						var actualWeight	= 0;
						var chargeWeight	= 0;
						var crossing		= 0;
						var totalPaidFreightCharge	= 0;
						var totalPaidGrandTotal		= 0;
						var totalToPayFreightCharge	= 0;
						var totalToPayGrandTotal	= 0;
						var totalTBBFreightCharge	= 0;
						var totalTBBGrandTotal		= 0;
						var grandTotal				= 0;
						var totalBookingGrandTotal	= 0;
						var totalToPayHamali		= 0;
						var totalPaidTbb			= 0;
						
						for (var j = 0; j < obj[objKey[k]].length; j++) {
							var dataObj	= obj[objKey[k]][j];
							
							if (dispatchLSLRCharge[dataObj.wayBillId] != undefined)
								chargeObj	= dispatchLSLRCharge[dataObj.wayBillId][0];
							
							var dataObject	= new Object();
							totalArticle			+= Number(dataObj.wayBillArticleQuantity);
							actualWeight			+= Number(dataObj.wayBillActualWeight);
							chargeWeight			+= Number(dataObj.wayBillChargeWeight);
							grandTotal				+= Number(chargeObj.wayBillFreightAmount);
							
							if(dataObj.wayBillTypeId == WAYBILL_TYPE_PAID) {
								totalPaidFreightCharge		+= Number(chargeObj.wayBillFreightAmount);
								totalPaidGrandTotal			+= Number(dataObj.wayBillGrandTotal);
								totalPaidTbb				+= Number(dataObj.wayBillGrandTotal);
							} else if (dataObj.wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
								totalToPayFreightCharge		+= Number(chargeObj.wayBillFreightAmount);
								totalToPayGrandTotal		+= Number(dataObj.wayBillGrandTotal);
								totalToPayHamali			+= Number(chargeObj.toPayHamali);
							} else if (dataObj.wayBillTypeId == WAYBILL_TYPE_CREDIT) {
								totalTBBFreightCharge		+= Number(chargeObj.wayBillFreightAmount);
								totalTBBGrandTotal			+= Number(dataObj.wayBillGrandTotal);
								totalPaidTbb				+= Number(dataObj.wayBillGrandTotal);
							}
							
							totalBookingGrandTotal = totalPaidGrandTotal + totalToPayGrandTotal + totalTBBGrandTotal;
							
							dataObject.totalLRs						= srNo;
							dataObject.lrDestinationBranch			= dataObj.wayBillDestinationBranchName;
							dataObject.totalArticle					= totalArticle;
							dataObject.actualWeight					= actualWeight
							dataObject.chargeWeight					= chargeWeight
							dataObject.crossing						= crossing
							dataObject.totalToPayFreightCharge		= totalToPayFreightCharge;
							dataObject.totalPaidFreightCharge		= totalPaidFreightCharge;
							dataObject.totalTBBFreightCharge		= totalTBBFreightCharge;
							dataObject.grandTotal					= grandTotal;	
							dataObject.totalPaidGrandTotal			= totalPaidGrandTotal;	
							dataObject.totalToPayGrandTotal			= totalToPayGrandTotal;	
							dataObject.totalTBBGrandTotal			= totalTBBGrandTotal;	
							dataObject.totalBookingGrandTotal		= totalBookingGrandTotal;	
							dataObject.totalToPayHamali				= totalToPayHamali;	
							dataObject.wayBilldestBranchId			= dataObj.wayBillDestinationBranchId;
							dataObject.deliveryCommissionChargePerKgOnActualWeight = flavorConfiguration.deliveryCommissionChargePerKgOnActualWeight;
							dataObject.lsDestBranch					= lsDestBranch;
							dataObject.totalPaidTbb					= totalPaidTbb;
							srNo++;
						}
						
						dataArray.push(dataObject)
					}
				}
			}
			
			return dataArray;
		},getArrayForPackingTypeWiseSummaryDetails : function(packingTypeMap) {
			
			var dataKey		= Object.keys(packingTypeMap);
			var dataArray	= new Array();
		
			for (var i = 0; i < dataKey.length; i++) {
				var obj	= packingTypeMap[dataKey[i]];
				
				var dataObject	= new Object();
							
				dataObject.totalPkgs				= obj;		
				dataObject.packingTypeName			= dataKey[i];	
				
				dataArray.push(dataObject)
			}
			
			return dataArray;
		}, getArrayForPaidTableDetails : function(dispatchLRSummary, dispatchLSLRCharge) {

			var dataKey		= Object.keys(dispatchLRSummary);
			var dataArray	= new Array();
			var chargeObj	= new Object();
			
			for (var i = 0; i < dataKey.length; i++) {
				var obj	= dispatchLRSummary[dataKey[i]];
			
				for (var j = 0; j < obj.length; j++) {
					var dataObj	= obj[j];
					
					if(dataObj.wayBillTypeId == WAYBILL_TYPE_PAID || dataObj.wayBillTypeId == WAYBILL_TYPE_CREDIT) {
						if (dispatchLSLRCharge[dataObj.wayBillId] == undefined) {
							chargeObj.wayBillFreightAmount			= 0;
							chargeObj.wayBillLoadingAmount			= 0;
							chargeObj.wayBillFreightAmount			= 0;
							chargeObj.wayBillFOVAmount				= 0;
							chargeObj.wayBillOtherBookingAmount		= 0;
							chargeObj.wayBillStationaryAmount		= 0;
							chargeObj.wayBillHamaliAmount			= 0;
							chargeObj.wayBillTollAmount				= 0;
							chargeObj.wayBillDoorCollectionAmount	= 0;
							chargeObj.wayBillDoorDeliveryAmount		= 0;
							chargeObj.wayBillSmsAmount				= 0;
							chargeObj.wayBillLrCharge				= 0;
							chargeObj.wayBillBuiltyAmount			= 0;
							chargeObj.hcCharge						= 0;
							chargeObj.toPayHmali						= 0;
							chargeObj.ddCharge						= 0;
							chargeObj.dcCharge						= 0;

						} else {						
							chargeObj	= dispatchLSLRCharge[dataObj.wayBillId][0];
						}
						
						var dataObject	= new Object();
						dataObject.lrNumber						= dataObj.wayBillNumber;
						dataObject.lrDestinationBranch			= dataObj.wayBillDestinationBranchName;
						dataObject.consignor					= dataObj.wayBillConsignorName;
						dataObject.consignorFullName			= dataObj.wayBillConsignorName;
						dataObject.consignee					= dataObj.wayBillConsigneeName;
						dataObject.consigneeFullName			= dataObj.wayBillConsigneeName;
						dataObject.consigneeContact				= dataObj.wayBillConsigneeContactNumber;
						dataObject.consignorContact				= dataObj.wayBillConsignorContactNumber;
						dataObject.lrType						= dataObj.wayBillType;
						dataObject.consignmentPackingDetails	= dataObj.packingTypeString;
						dataObject.freightCharge				= chargeObj.wayBillFreightAmount;
						dataObject.loadingCharge				= chargeObj.wayBillLoadingAmount;
						dataObject.loadingChargeRT				= chargeObj.wayBillLoadingAmount;
						dataObject.loadingChargeformls			= chargeObj.wayBillLoadingAmount;
						dataObject.pickupCharge					= chargeObj.pickupCharge;
						dataObject.amount						= dataObj.wayBillGrandTotal;
						dataObject.totalArticle					= dataObj.wayBillArticleQuantity;
						dataObject.wayBillTypeId				= dataObj.wayBillTypeId;
						dataObject.declaredValue				= dataObj.declaredValue;
						dataObject.lrCharge						= dataObj.wayBillLrCharge;
						dataObject.stationaryCharge				= chargeObj.stationaryCharge;	
						
						if(dataObj.wayBillTypeId == WAYBILL_TYPE_FOC)
							dataObject.lrCharge						= 0;
						
						dataArray.push(dataObject)
					}
				}
			}
			
			return dataArray;
		}, getArrayForLhpvCharges : function(lhpvChargesList) {
			var dataObject	= new Object();
			dataObject.commision	= 0;
			dataObject.hamali		= 0;
			dataObject.crossing		= 0;
			dataObject.thapi		= 0;
			dataObject.paidDebit	= 0;
			dataObject.paidCredit	= 0;
			dataObject.serviceTax	= 0;
			dataObject.total		= 0;
			dataObject.refund		= 0;
			dataObject.lorryHireAmount		= 0;
			dataObject.lorryHireAdvance		= 0;
			dataObject.lorryHireBalance		= 0;
			dataObject.lessAdvance			= 0;
			dataObject.extraLorryHire		= 0;
			dataObject.TDS					= 0;
			dataObject.Loadingpoint			= 0;
			dataObject.Halting				= 0;
			dataObject.other				= 0;
			dataObject.lhpvhamali			= 0;
			dataObject.overload				= 0;
			dataObject.diesel				= 0;
			dataObject.balancePayableAtBranchId				= 0;
			
			if(lhpvChargesList != undefined && lhpvChargesList[0] != undefined) {
				dataObject.balancePayableAtBranchId		= lhpvChargesList[0].balancePayableAtBranchId;
				dataObject.balancePayableAtBranchName	= lhpvChargesList[0].balancePayableAtBranchName;
				dataObject.lhpvCreationDateTimeString	= lhpvChargesList[0].lhpvCreationDateTimeString;
				
				for (const element of lhpvChargesList) {
					if(element.lhpvChargeTypeMasterId == 2)
						dataObject.commision = element.chargeAmount;
					else if(element.lhpvChargeTypeMasterId == 26)
						dataObject.hamali = element.chargeAmount;
					else if(element.lhpvChargeTypeMasterId == 3)
						dataObject.crossing = element.chargeAmount;
					else if(element.lhpvChargeTypeMasterId == 54)
						dataObject.thapi = element.chargeAmount;
					else if(element.lhpvChargeTypeMasterId == 55)
						dataObject.paidDebit = element.chargeAmount;
					else if(element.lhpvChargeTypeMasterId == 56)
						dataObject.serviceTax = element.chargeAmount;
					else if(element.lhpvChargeTypeMasterId == 57)
						dataObject.refund = element.chargeAmount;
					else if(element.lhpvChargeTypeMasterId == 59)
						dataObject.paidCredit = element.chargeAmount;
					else if(element.lhpvChargeTypeMasterId == 4)
						dataObject.lorryHireAmount = element.chargeAmount;
					else if(element.lhpvChargeTypeMasterId == 5)
						dataObject.lorryHireAdvance = element.chargeAmount;
					else if(element.lhpvChargeTypeMasterId == 6)
						dataObject.lorryHireBalance = element.chargeAmount;
					else if(element.lhpvChargeTypeMasterId == 74)
						dataObject.lessAdvance = element.chargeAmount;
					else if(element.lhpvChargeTypeMasterId == 28)
						dataObject.extraLorryHire = element.chargeAmount;
					else if(element.lhpvChargeTypeMasterId == 17)
						dataObject.TDS = element.chargeAmount;
					else if(element.lhpvChargeTypeMasterId == 23)
						dataObject.Loadingpoint = element.chargeAmount;
					else if(element.lhpvChargeTypeMasterId == 78)
						dataObject.Halting = element.chargeAmount;
					else if(element.lhpvChargeTypeMasterId == 115)
						dataObject.other = element.chargeAmount;
					else if(element.lhpvChargeTypeMasterId == 101)
						dataObject.lhpvhamali = element.chargeAmount;
					else if(element.lhpvChargeTypeMasterId == 47)
						dataObject.overload = element.chargeAmount;
					else if(element.lhpvChargeTypeMasterId == 65)
						dataObject.diesel = element.chargeAmount;
				}
			}
			
			return dataObject;
		},getArrayForBlhpvCharges : function(blhpvChargesList,blhpvCreditAmountTxnArrList) {
			var dataObject	= new Object();
			dataObject.received		= 0;

			if(blhpvChargesList != undefined) {
				for (var i = 0; i < blhpvChargesList.length; i++) {
					if(blhpvChargesList[i].lhpvChargeTypeMasterId == 20 || blhpvChargesList[i].lhpvChargeTypeMasterId == 21)
						dataObject.received = blhpvChargesList[i].chargeAmount;
				}
			}
			
			if(blhpvCreditAmountTxnArrList != undefined) {
				for (var i = 0; i < blhpvCreditAmountTxnArrList.length; i++) {
					dataObject.received += blhpvCreditAmountTxnArrList[i].settledAmount;
				}
			}

			return dataObject;
		}, getArrayForWayBillDetails : function(dispatchLRSummary, dispatchLSLRCharge) {
			var dataKey		= Object.keys(dispatchLRSummary);
			var dataArray	= new Array();
			var chargeObj	= new Object();
			
			for (var i = 0; i < dataKey.length; i++) {
				var obj				= dispatchLRSummary[dataKey[i]];
				var dataKey1		= Object.keys(obj);
				
				for (var j = 0; j < dataKey1.length; j++) {
					var dataObjCheck	= obj[dataKey1[j]];
					
					for (var k = 0; k < dataObjCheck.length; k++) {
						var dataObj = dataObjCheck[k];
						
						if (dispatchLSLRCharge[dataObj.wayBillId] == undefined)
							chargeObj.wayBillFreightAmount			= 0;
						else				
							chargeObj	= dispatchLSLRCharge[dataObj.wayBillId][0];
						
						var dataObject	= new Object();
						
												
						dataObject.lrNumber						= dataObj.wayBillNumber;
						dataObject.lrSourceBranch				= dataObj.wayBillSourceBranchName;
						dataObject.lrDestinationBranch			= dataObj.wayBillDestinationBranchName;
						dataObject.handlingBranchId				= dataObj.handlingBranchId;
						
						if(dataObject.handlingBranchId > 0)
							dataObject.lrHandlingDestinationBranch	= dataObj.wayBillDestinationHandlingBranchName;
						else
							dataObject.lrHandlingDestinationBranch	= dataObj.wayBillDestinationBranchName;
						
						dataObject.consignor					= dataObj.wayBillConsignorName;
						dataObject.consignorFullName			= dataObj.wayBillConsignorName;
						dataObject.consignee					= dataObj.wayBillConsigneeName;
						dataObject.consigneeFullName			= dataObj.wayBillConsigneeName;
						dataObject.consigneeContact				= dataObj.wayBillConsigneeContactNumber;
						dataObject.consignorContact				= dataObj.wayBillConsignorContactNumber;
						dataObject.lrType						= dataObj.wayBillType;
						dataObject.consignmentPackingDetails	= dataObj.packingTypeString;
						dataObject.freightCharge				= chargeObj.wayBillFreightAmount;
						dataObject.totalArticle					= dataObj.wayBillArticleQuantity;
						dataObject.freightCharge				= chargeObj.wayBillFreightAmount+ "( "+ (dataObj.wayBillType).substring(0,1)+" )";
						dataObject.advancePaid					= dataObj.wayBillAdvancePaid;
						dataObject.wayBillTypeId				= dataObj.wayBillTypeId;
						dataObject.actualWeight					= dataObj.wayBillActualWeight;
						dataObject.chargeWeight					= dataObj.wayBillChargeWeight;
						dataObject.balance						= dataObj.wayBillGrandTotal - dataObj.wayBillAdvancePaid;	
						dataObject.partyTINNo					= dataObj.wayBillNumber;
						
						dataArray.push(dataObject)
					}
				}
			}
			
			return dataArray;
		}, getHeaderAndFooterObject : function(dispatchLSHeader, lsDestBranch, lsSrcBranch) {
			var headerObject				= new Object();
			headerObject.name				= dispatchLSHeader.dispatchLSAccountGroupName;
			headerObject.branchAddress		= dispatchLSHeader.dispatchLSExecutiveBranchAddress;
			headerObject.branchGSTN			= dispatchLSHeader.branchGSTN;
			headerObject.branchEmail		= dispatchLSHeader.branchEmail;
			headerObject.branchPhoneNumber	= dispatchLSHeader.dispatchLSExecutiveBranchPhoneNumber;
			headerObject.branchPhoneNumber2	= dispatchLSHeader.dispatchLSExecutiveBranchPhoneNumber2;
			headerObject.reportType			= dispatchLSHeader.reportType;
			headerObject.dispatchNumber		= dispatchLSHeader.lsNumber;
			headerObject.dispatchLedgerId 	= dispatchLSHeader.dispatchLedgerId;
			headerObject.dispatchRoute		= dispatchLSHeader.dispatchRouteNumber;
			headerObject.vehicleNumber		= dispatchLSHeader.vehicleNumber;
			headerObject.vehicleAgentName	= dispatchLSHeader.vehicleAgentName;
			headerObject.vehicleOwner		= dispatchLSHeader.vehicleOwner;
			headerObject.dispatchDate		= dispatchLSHeader.tripDateTimeString;
			headerObject.date				= dispatchLSHeader.dispatchDateStr;
			headerObject.time				= dispatchLSHeader.dispatchTimeStr;
			headerObject.fromBranch			= dispatchLSHeader.dispatchLSSourceBranchName;
			headerObject.fromBranchAbrvn	= dispatchLSHeader.dispatchLSSourceBranchAbrvnCode;
			headerObject.toBranch			= dispatchLSHeader.dispatchLSDestinationBranchName;
			headerObject.toBranchAbrvn		= dispatchLSHeader.dispatchLSDestinationBranchAbrvnCode;
			headerObject.preparedBy			= dispatchLSHeader.dispatchLSExecutiveName;
			headerObject.loadedBy			= dispatchLSHeader.dispatchLSSupervisorName;
			headerObject.branchMobileNumber	= dispatchLSHeader.dispatchLSExecutiveBranchMobileNumber;
			headerObject.branchMobileNumber2	= dispatchLSHeader.dispatchLSExecutiveBranchMobileNumber2;
			headerObject.engineNumber		= dispatchLSHeader.engineNumber;
			headerObject.chasisNumber		= dispatchLSHeader.chasisNumber;
			headerObject.imagePath			= dispatchLSHeader.imagePath;
			headerObject.accountGroupName	= dispatchLSHeader.accountGroupName;
			headerObject.crossingAgentId	= dispatchLSHeader.crossingAgentId;
			headerObject.crossingAgentName	= dispatchLSHeader.crossingAgentName;
			headerObject.OwnerPanNumber		= dispatchLSHeader.ownerPanNumber;
			headerObject.VehicleAgentMobileNumber	= dispatchLSHeader.vehicleAgentMobileNumber;
			headerObject.registeredOwner			= dispatchLSHeader.registeredOwner;
			headerObject.vehicleTypeName			= dispatchLSHeader.vehicleTypeName;
			headerObject.destMobileNumber			= lsDestBranch.branchContactDetailMobileNumber;
			headerObject.destbranchAddress			= lsDestBranch.branchAddress;
			headerObject.sourceBranchCode			= lsSrcBranch.branchCode;
			headerObject.destinationBranchCode		= lsDestBranch.branchCode;
			headerObject.sourceBranchAddress		= lsSrcBranch.branchAddress;
			headerObject.sourceBranchName			= lsSrcBranch.branchName;
			headerObject.sourceBranchMobileNumber	= lsSrcBranch.branchContactDetailMobileNumber;
			headerObject.sourceBranchGSTN			= lsSrcBranch.branchGSTN;
			headerObject.destBranchName				= lsDestBranch.branchName;
			headerObject.destBranchGSTN				= lsDestBranch.branchGSTN;
			headerObject.dispatchTime24HourFormat	= dispatchLSHeader.dispatchTime24HourFormat;
			headerObject.manualLs					= dispatchLSHeader.manualLs;
			headerObject.vehicleOwnerName			= dispatchLSHeader.vehicleOwnerName;
			headerObject.openingKm					= dispatchLSHeader.openingKm;
			headerObject.dispatchLSExecutiveBranchName	= dispatchLSHeader.dispatchLSExecutiveBranchName;
			headerObject.docketNumber					= dispatchLSHeader.docketNumber;
			headerObject.transportationModeName			= dispatchLSHeader.transportationModeName;
			headerObject.sealNumber						= dispatchLSHeader.sealNumber;
			headerObject.awbNumber						= dispatchLSHeader.awbNumber;
			headerObject.billSelectioTypeString			= dispatchLSHeader.billSelectioTypeString;
			headerObject.currentDateTime				= dispatchLSHeader.currentDateString + " " +  dispatchLSHeader.currentTimeString;
			headerObject.loaderName						= dispatchLSHeader.loaderName;
			headerObject.dayName						= findDayFromDate(dispatchLSHeader.dispatchDateStr);
			headerObject.arrivalDateTimeString			= dispatchLSHeader.arrivalDateTimeString;
			headerObject.flightNumber					= dispatchLSHeader.flightNumber;
			headerObject.airlineName					= dispatchLSHeader.airlineName;
			headerObject.loaderMobileNo					= dispatchLSHeader.loaderMobileNo;
			headerObject.bookingRRnumber				= dispatchLSHeader.bookingRRnumber;
			headerObject.vpsrlNumber					= dispatchLSHeader.vpsrlNumber;
			headerObject.trainName						= dispatchLSHeader.trainName;
			headerObject.vesselName						= dispatchLSHeader.vesselName;
			headerObject.coachNumber					= dispatchLSHeader.coachNo;
			headerObject.containerNumber				= dispatchLSHeader.containerNo;

			function findDayFromDate(dateString) {
				const [day, month, year] = dateString.split("-");
				const formattedDate = `${year}-${month}-${day}`;

				const date = new Date(formattedDate);

				const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
				const dayName = days[date.getDay()];

				return dayName;
			}
			
			if(headerObject.vehicleOwner == OWN_VEHICLE_ID)
				headerObject.startKM		= dispatchLSHeader.startKM;

			headerObject.receivedLedgerId	= dispatchLSHeader.receivedLedgerId;
			headerObject.turNumber			= dispatchLSHeader.turNumber;
			
			if(flaverNo == flavor_88) {
				if(headerObject.vehicleOwner == 1)
					headerObject.name	= dispatchLSHeader.dispatchLSAccountGroupName;
				else if(headerObject.vehicleOwner == 2 || headerObject.vehicleOwner == 3)
					headerObject.name	= dispatchLSHeader.vehicleAgentName;
			}
			
			if(dispatchLSHeader.driverName == undefined) dispatchLSHeader.driverName = "";
			if(dispatchLSHeader.cleanerName == undefined) dispatchLSHeader.cleanerName = "";
			if(dispatchLSHeader.driverMobileNumber == undefined) dispatchLSHeader.driverMobileNumber = "";
			
			headerObject.driverName		= dispatchLSHeader.driverName;
			headerObject.cleanerName	= dispatchLSHeader.cleanerName;
			
			if(dispatchLSHeader.driverMobileNumber != "")
				headerObject.driverNameWithNumber	= dispatchLSHeader.driverName + " (" + dispatchLSHeader.driverMobileNumber + ")";
			else
				headerObject.driverNameWithNumber	= dispatchLSHeader.driverName;
				
			if(dispatchLSHeader.driverMobileNumber != "")
				headerObject.cleanerNameWithNumber	= dispatchLSHeader.cleanerName + " (" + dispatchLSHeader.driverMobileNumber + ")";
			else
				headerObject.cleanerNameWithNumber	= dispatchLSHeader.cleanerName;
			
			if(flaverNo == flavor_40)
				headerObject.driverName	= (dispatchLSHeader.driverName).substring(0,15);
			
			if(flaverNo == flavor_63 )
				headerObject.vehicleAgentName		= dispatchLSHeader.vehicleAgentName + " (" + (dispatchLSHeader.vehicleAgentMobileNumber != undefined ? dispatchLSHeader.vehicleAgentMobileNumber : "--") + ")";
			
			if(flaverNo == flavor_93 || flaverNo == flavor_106) {
				if(headerObject.vehicleOwner == 1)
					headerObject.vehicleAgentName	= dispatchLSHeader.ownerName;
				else if(headerObject.vehicleOwner == 2 || headerObject.vehicleOwner == 3)
					headerObject.vehicleAgentName	= dispatchLSHeader.vehicleAgentName;
			}
			
			headerObject.sourceCityName			= dispatchLSHeader.dispatchLsSourceCityName;
			headerObject.destinationCityName	= dispatchLSHeader.dispatchLsDestinationCityName;
			headerObject.ownerName				= dispatchLSHeader.ownerName;
			headerObject.ownerAddress			= dispatchLSHeader.ownerAddress;
			headerObject.lhpvNumber				= dispatchLSHeader.lhpvNumber;
			headerObject.lsRemark				= dispatchLSHeader.lsRemark;
			headerObject.driverMobileNumber		= dispatchLSHeader.driverMobileNumber;
			headerObject.driverLicenceNumber	= dispatchLSHeader.driverLicenceNumber;
			headerObject.driverAddress			= dispatchLSHeader.driverAddress;
			headerObject.registerdOwnerName		= dispatchLSHeader.registerdOwnerName;
			headerObject.registerdOwnerAddr		= dispatchLSHeader.registerdOwnerAddr;
			headerObject.vehicleMasterAgentName	= dispatchLSHeader.vehicleMasterAgentName;

			if(dispatchLSHeader.insuranceName != undefined)
				headerObject.insuranceName		 = dispatchLSHeader.insuranceName;
			
			if(dispatchLSHeader.policyNo != undefined)
				headerObject.policyNo		 = dispatchLSHeader.policyNo;
			
			headerObject.dispatchLsSourceSubRegionName		= dispatchLSHeader.dispatchLsSourceSubRegionName;
			headerObject.dispatchLsDestinationSubRegionName = dispatchLSHeader.dispatchLsDestinationSubRegionName;
			headerObject.driver2Name						= dispatchLSHeader.driver2Name;
			headerObject.driver2MobileNumber				= dispatchLSHeader.driver2MobileNo1;
			headerObject.consolidatedEwaybillNumber			= dispatchLSHeader.consolidatedEwaybillNumber;
			headerObject.lsSourceBranchName					= dispatchLSHeader.lsSourceBranchName;
			
			return headerObject;
		}, getObjectsFromCollection : function(response) {
			lr_Summary				= new Object();
			ls_lr_Form_Summary		= new Object();
			ls_Header				= new Object();
			
			var keyAdd	= Object.keys(response.PrintHeaderModel);
			
			for (var i = 0; i < keyAdd.length; i++) {
				print_Model						= response.PrintHeaderModel[keyAdd[i]];
				lr_Summary[keyAdd[i]]			= response.dispatchLRSummary[keyAdd[i]]
				ls_lr_Form_Summary[keyAdd[i]]	= response.dispatchLSLRFormSummary[keyAdd[i]];
				ls_Header[keyAdd[i]]			= response.dispatchLSHeader[keyAdd[i]];
			}
		}, setSrNumber : function(dataArray){
			for(var i = 0; dataArray.length > i; i++) {
				dataArray[i].srNumber	= i + 1;
			}
			
			return dataArray;
		}, setTotalsForFooter : function(response, tableData) {
			var totalObject			= new Object();
			totalObject.totalNoOfArticles				= 0,
			totalObject.totalActualWeight				= 0,
			totalObject.totalChargedWeight				= 0,
			totalObject.totalBookingAmount				= 0,
			totalObject.totalFreight					= 0,
			totalObject.totalPayableAmount				= 0,
			totalObject.totalReceivableAmount			= 0,
			totalObject.totalCrossingHireAmount			= 0,
			totalObject.totalUnloadingAmount			= 0,
			totalObject.totaSks							= 0,
			totalObject.totalLoading					= 0,
			totalObject.totalUnloading					= 0,
			totalObject.totalDoordelivery				= 0,
			totalObject.totalST							= 0,
			totalObject.totalOther						= 0,
			totalObject.totalGST						= 0,
			totalObject.totalOtherMgt					= 0,
			totalObject.paidLRTotal						= 0,
			totalObject.toPayLRTotal					= 0,
			totalObject.paidFreightCharge				= 0,
			totalObject.totalfreightgst					= 0,
			totalObject.totalDoorcollection				= 0,
			totalObject.totalHamali						= 0,
			totalObject.totalPaidHamali					= 0,
			totalObject.totalToPayHamali				= 0,
			totalObject.totalHamaliForTOPAY				= 0,
			totalObject.totalHamaliForPaid				= 0,
			totalObject.totalFreightForTOPAY			= 0,
			totalObject.totalFreightForPaid				= 0,
			totalObject.totalIandSCharge				= 0,
			totalObject.totalLrCharge					= 0,
			totalObject.totalDoorPickup					= 0,
			totalObject.totalHandlingCharge				= 0,
			totalObject.totalLc							= 0,
			totalObject.totalBuiltyCharge				= 0,
			totalObject.totalServiceCharge				= 0,
			totalObject.totalCashRefund					= 0,
			totalObject.totalAfCharge					= 0,
			totalObject.totalPfCharge					= 0,
			totalObject.totaltempoBhadaBooking			= 0,
			totalObject.totalCrossingHire				= 0,
			totalObject.totalStationaryCharge			= 0,
			totalObject.totalSurCharge					= 0,
			totalObject.totalfreightOm					= 0,
			totalObject.totalDeclaredValue				= 0,
			totalObject.totalCommSres					= 0,
			totalObject.totalDDCCharge					= 0,
			
			totalObject.totalNoOfArticles					= response.totalNoOfArticles;
			totalObject.totalActualWeight					= response.totalActualWeight;
			totalObject.totalChargedWeight					= response.totalChargedWeight;
			totalObject.totalBookingAmount					= response.totalBookingAmount;
			totalObject.totalPayableAmount					= response.totalPayableAmount;
			totalObject.totalReceivableAmount				= response.totalReceivableAmount;
			totalObject.totalCrossingHireAmount				= response.totalCrossingHireAmount;
			totalObject.totalFreight						= response.totalFreight;
			totalObject.totalLoading						= response.totalLoading			
			totalObject.totalUnloading						= response.totalUnloading		
			totalObject.totalDoordelivery					= response.totalDoordelivery	
			totalObject.totalST								= response.totalST			
			totalObject.totalOther							= response.totalOther			
			totalObject.totalGST							= response.totalGST				
			totalObject.totalOtherMgt						= response.totalOtherMgt
			totalObject.paidLRTotal							= response.paidLrTotal		
			totalObject.toPayLRTotal						= response.toPayLrTotal	
			totalObject.paidFreightCharge					= response.paidFreightCharge	
			totalObject.totalDoorcollection					= response.totalDoorcollection	
			totalObject.totalHamali							= response.totalHamali
			totalObject.totalPaidHamali						= response.totalPaidHamali
			totalObject.totalToPayHamali					= response.toPayHamali
			totalObject.totalHamaliForTOPAY					= response.totalHamaliForTOPAY
			totalObject.totalHamaliForPaid					= response.totalHamaliForPaid
			totalObject.totalFreightForTOPAY				= response.totalFreightForTOPAY
			totalObject.totalFreightForPaid					= response.totalFreightForPaid
			totalObject.totalIandSCharge					= response.totalIandSCharge	
			totalObject.totalLrCharge						= response.totalLrCharge	
			totalObject.totalDoorPickup						= response.totalDoorPickup	
			totalObject.totalHandlingCharge					= response.totalHandlingCharge
			totalObject.totalLc								= response.totalLc
			totalObject.totalBuiltyCharge					= response.totalBuiltyCharge	
			totalObject.totalServiceCharge					= response.totalServiceCharge	
			totalObject.totalCashRefund						= response.totalCashRefund 
			totalObject.totalAfCharge						= response.totalAfCharge 
			totalObject.totalPfCharge						= response.totalPfCharge 
			totalObject.totaltempoBhadaBooking				= response.totaltempoBhadaBooking 
			totalObject.totalCrossingHire					= response.totalCrossingHire 
			totalObject.totalStationaryCharge				= response.totalStationaryCharge 
			totalObject.totalSurCharge						= response.totalSurCharge 
			totalObject.totalfreightOm						= response.totalfreightOm 
			totalObject.totalCommSres						= response.totalCommSres
			totalObject.totalDDCCharge						= response.totalDDCCharge
			
			
			if(tableData.length > 0) {
				var unloadingAmount = 0;
				var totalSksAmount = 0;
				var grandTotalSksAmnt  = 0;
				var	totalFreight = 0;
				var totalLoading = 0;
				var totalUnloading = 0;
				var totalDoordelivery = 0;
				var totalST = 0;
				var totalOther = 0;
				var totalGST = 0;
				var totalOtherMgt = 0;
				var totalCrossingChrg = 0;
				var totalFreightGst	  = 0;
				var	totalDoorcollection = 0;
				var totalHamali			= 0;
				var	totalPaidHamali		= 0;
				var grandTotalForMcargo	= 0;
				var totalPickup = 0;
				var totalToPayHamali = 0;
				var totalHamaliForTOPAY	= 0;
				var totalHamaliForPaid	= 0;
				var totalFreightForTOPAY	= 0;
				var totalFreightForPaid	= 0;
				var	totalIandSCharge	= 0;
				var	totalLrCharge	= 0;
				var	totalDoorPickup	= 0;
				var	totalHandlingCharge	= 0;
				var	totalSrsHamaliCharge	= 0;
				var totalLc				= 0;
				var totalBuiltyCharge	= 0;
				var totalFreightForTbb	= 0;
				var totalServiceCharge	= 0;
				var totalDirectAmt			= 0;
				var totalConnectingAmt		= 0;
				var totalHc				= 0;
				var kant				= 0;
				var balanceAmt			= 0;
				var totalLrAndServiceChargeNew	= 0;
				var totalCashRefund = 0;
				var totalAfCharge = 0;
				var totalPfCharge = 0;
				var totaltempoBhadaBooking = 0;
				var totalCrossingHire = 0;
				var totalCartage = 0;
				var totalCsCharge = 0;
				var totalStationaryCharge  = 0;
				var totalStationary  = 0;
				var totalSurCharge = 0;
				var totalDeclaredValue = 0;
				var totalfreightOm = 0;
				var totalCommSres =0;
				var totalDDCCharge =0;
				var totalLoadedArticle =0;
				let collectFromDriverAmt =0;
				var crossingNetUnloading = 0;
				var totalToPayMgllp = 0;
				var totalCrossingHamali = 0;

				for(var i = 0; i < tableData.length; i++) {
					
					if(tableData[i].doorDeliveryCharge != undefined && tableData[i].unloadingAmount != undefined) {
						unloadingAmount			= Math.round(unloadingAmount + tableData[i].doorDeliveryCharge + tableData[i].unloadingAmount);
						totalSksAmount			= Math.round(totalSksAmount + tableData[i].freightCharge + tableData[i].loadingCharge + tableData[i].stCharge + tableData[i].otherCharge);
						grandTotalSksAmnt		= Math.round(totalSksAmount + unloadingAmount);
						totalFreight			= Math.round(totalFreight + tableData[i].freightCharge);
						totalLoading			= Math.round(totalLoading + tableData[i].loadingCharge);
						totalUnloading			= Math.round(totalUnloading + tableData[i].unloadingAmount);
						totalDoordelivery		= Math.round(totalDoordelivery + tableData[i].doorDeliveryCharge);
						totalPickup				= Math.round(totalPickup + tableData[i].pickupCharge);
						totalST					= Math.round(totalST + tableData[i].stCharge);
						totalOther				= Math.round(totalOther + tableData[i].otherCharge);
						totalGST				= Math.round(totalGST + tableData[i].serviceTax);
						totalOtherMgt			= Math.round(totalOtherMgt + tableData[i].otherAmount);
						totalCrossingChrg		= tableData[i].crossingTotal;
						totalFreightGst			= Math.round(totalFreightGst + tableData[i].freightCharge + tableData[i].serviceTax);
						totalDoorcollection		= Math.round(totalDoorcollection + tableData[i].doorCollectionCharge);
						totalHamali				= Math.round(totalHamali + tableData[i].hamaliCharge);
						totalPaidHamali			= Math.round(totalPaidHamali + tableData[i].paidHamaliCharge);
						grandTotalForMcargo		= Math.round(grandTotalForMcargo + tableData[i].doorDeliveryCharge + tableData[i].hamaliCharge + tableData[i].doorCollectionCharge + tableData[i].otherCharge + tableData[i].freightCharge + tableData[i].serviceTax);
						totalToPayHamali		= Math.round(totalToPayHamali + tableData[i].toPayHamali);
						totalLrCharge			= Math.round(totalLrCharge + tableData[i].lrCharge);
						totalDoorPickup			= Math.round(totalDoorPickup + tableData[i].doorPickupCharge);
						totalHandlingCharge		= Math.round(totalHandlingCharge + tableData[i].handlingCharge);
						totalSrsHamaliCharge	= Math.round(totalSrsHamaliCharge + tableData[i].srsHamaliCharge);
						totalLc					= Math.round(totalLc + tableData[i].lc);
						totalBuiltyCharge		= Math.round(totalBuiltyCharge + tableData[i].wayBillBuiltyAmount);
						totalServiceCharge		= Math.round(totalServiceCharge + tableData[i].serviceCharge);
						totalHc					= Math.round(totalHc + tableData[i].hcCharge);
						totalCashRefund			= Math.round(totalCashRefund + tableData[i].cashRefund);
						totalAfCharge			= Math.round(totalAfCharge + tableData[i].afCharge);
						totalPfCharge			= Math.round(totalPfCharge + tableData[i].pfCharge);
						totaltempoBhadaBooking	= Math.round(totaltempoBhadaBooking + tableData[i].tempoBhadaBooking);
						totalCrossingHire		= Math.round(totalCrossingHire + tableData[i].crossingHire);
						totalStationaryCharge	= Math.round(totalStationaryCharge + tableData[i].wayBillStationaryAmount);
						totalStationary			= Math.round(totalStationary + tableData[i].stationaryCharge);
						totalSurCharge			= Math.round(totalSurCharge + tableData[i].surCharge);
						totalfreightOm			= Math.round(totalfreightOm + tableData[i].freightOm);
						totalDeclaredValue		= Math.round(totalDeclaredValue + Number(tableData[i].declaredValue));
						totalCommSres			= totalCommSres + tableData[i].commSres;
						totalDDCCharge			= Math.round(totalDDCCharge + tableData[i].ddcCharge);
						totalLoadedArticle		= Math.round(totalLoadedArticle + tableData[i].loadedArticle);
						totalCartage			= Math.round(totalCartage + tableData[i].cartageAmount);
						totalCsCharge			= Math.round(totalCsCharge + tableData[i].csCharge);
											 
						if(tableData[i].wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
							totalHamaliForTOPAY		=  Math.round(totalHamaliForTOPAY + tableData[i].hamaliCharge);
							totalFreightForTOPAY	=  Math.round(totalFreightForTOPAY + tableData[i].freightCharge);
							totalToPayMgllp			=  Math.round(totalToPayMgllp + tableData[i].amount);
						}
						
						if(tableData[i].wayBillTypeId == WAYBILL_TYPE_PAID) {
							totalHamaliForPaid		=  Math.round(totalHamaliForPaid + tableData[i].hamaliCharge);
							totalFreightForPaid		=  Math.round(totalFreightForPaid + tableData[i].freightCharge);
						}
						
						if(tableData[i].wayBillTypeId == WAYBILL_TYPE_CREDIT) {
							totalFreightForTbb		=  Math.round(totalFreightForTbb + tableData[i].freightCharge);
						}
						
						totalIandSCharge		= Math.round(totalIandSCharge + tableData[i].iandSCharge);
					} else if(tableData[i].lrType == 'TBB' || tableData[i].lrType == 'Credit' || tableData[i].wayBillTypeId == WAYBILL_TYPE_CREDIT)
						totalFreightForTbb		=  Math.round(totalFreightForTbb + tableData[i].freightCharge);						
						
					if(tableData[i].lrDispatchType != undefined && tableData[i].lrDispatchType=="crossing")
						totalConnectingAmt += tableData[i].freightCharge
					else 
						totalDirectAmt += tableData[i].freightCharge;

					if(response.dispatchLSPrintModel.crossingAgentId != undefined && response.dispatchLSPrintModel.crossingAgentId > 0){
						kant += tableData[i].crossingHireAmt;
						balanceAmt = balanceAmt + (tableData[i].amount - tableData[i].crossingHireAmt);
					}
					totalLrAndServiceChargeNew += tableData[i].totalLRAndServiceCharge;
				}
				
				if(lhpvChargeData.balancePayableAtBranchId == response.dispatchLSPrintModel.dispatchLSDestinationBranchId)
					collectFromDriverAmt	= lhpvChargeData.lorryHireBalance;

				if(response.netUnloading > 0)
					crossingNetUnloading		= Math.round(response.netUnloading * response.totalActualWeight);
				
				if(response.totalCrossingHamali > 0)
					totalCrossingHamali				= Math.round(response.totalCrossingHamali);
				
				let bookingCommPfCartage  = 0;
				
				if(totalCommission > 0)
					bookingCommPfCartage = Math.round(totalCommission - totalPfCharge - totalCartage)

				
				let	drInOurAcForMgllp = Math.round(totalToPayMgllp - (crossingNetUnloading + collectFromDriverAmt + totalCrossingHamali));
				
				let	drInOurAc = Math.round(totalToPayMgllp - (crossingNetUnloading + collectFromDriverAmt));
				
				totalObject.bookingCommPfCartage				= bookingCommPfCartage;
				totalObject.totalFreightForTbb					= totalFreightForTbb;
				totalObject.totalUnloadingAmount				= unloadingAmount;
				totalObject.totaSks								= totalSksAmount;
				totalObject.totalFreightGst						= totalFreightGst;
				totalObject.grandTotalSksAmnt					= grandTotalSksAmnt;
				totalObject.totalFreight						= totalFreight;
				totalObject.totalLoading						= totalLoading;			
				totalObject.totalUnloading						= totalUnloading;		
				totalObject.totalDoordelivery					= totalDoordelivery;	
				totalObject.totalST								= totalST;			
				totalObject.totalOther							= totalOther;			
				totalObject.totalGST							= totalGST; 
				totalObject.totalOtherMgt						= totalOtherMgt;
				totalObject.totalCrossingChrg					= totalCrossingChrg;
				totalObject.totalFreightGst						= totalFreightGst;
				totalObject.totalDoorcollection					= totalDoorcollection;
				totalObject.totalHamali							= totalHamali;
				totalObject.totalPaidHamali						= totalPaidHamali;
				totalObject.grandTotalForMcargo					= grandTotalForMcargo;
				totalObject.totalPickup							= totalPickup;
				totalObject.totalToPayHamali					= totalToPayHamali;
				totalObject.totalHamaliForTOPAY					= totalHamaliForTOPAY;
				totalObject.totalHamaliForPaid					= totalHamaliForPaid;
				totalObject.totalFreightForTOPAY				= totalFreightForTOPAY;
				totalObject.totalFreightForPaid					= totalFreightForPaid;
				totalObject.totalIandSCharge					= totalIandSCharge;
				totalObject.totalLrCharge						= totalLrCharge;
				totalObject.totalDoorPickup						= totalDoorPickup;
				totalObject.totalHandlingCharge					= totalHandlingCharge;
				totalObject.totalSrsHamaliCharge				= totalSrsHamaliCharge;
				totalObject.totalLc								= totalLc;
				totalObject.totalBuiltyCharge					= totalBuiltyCharge;
				totalObject.totalServiceCharge					= totalServiceCharge;
				totalObject.totalConnectingAmt					= totalConnectingAmt;
				totalObject.totalDirectAmt						= totalDirectAmt;
				totalObject.kant								= kant;
				totalObject.balanceAmt							= balanceAmt;
				totalObject.totalLrAndServiceChargeNew			= totalLrAndServiceChargeNew
				totalObject.totalCashRefund						= totalCashRefund;
				totalObject.totalAfCharge						= totalAfCharge;
				totalObject.totalPfCharge						= totalPfCharge;
				totalObject.totaltempoBhadaBooking				= totaltempoBhadaBooking;
				totalObject.totalCrossingHire					= totalCrossingHire;
				totalObject.totalStationaryCharge				= totalStationaryCharge;
				totalObject.totalStationary						= totalStationary;
				totalObject.totalSurCharge						= totalSurCharge;
				totalObject.totalfreightOm						= totalfreightOm;
				totalObject.totalDeclaredValue					= totalDeclaredValue;
				totalObject.totalCommSres						= Math.round(totalCommSres);
				totalObject.totalDDCCharge						= totalDDCCharge;
				totalObject.totalLoadedArticle					= totalLoadedArticle;
				totalObject.totalPfCharge					    = totalPfCharge;
				totalObject.collectFromDriverAmt                = collectFromDriverAmt;
				totalObject.crossingNetUnloading                = crossingNetUnloading;
				totalObject.drInOurAc                           = drInOurAc;
				totalObject.totalToPayMgllp                     = totalToPayMgllp;
				totalObject.totalCrossingHamali                      = totalCrossingHamali;
				totalObject.drInOurAcForMgllp                   = drInOurAcForMgllp;
				totalObject.totalCsCharge                   = totalCsCharge;
				totalObject.totalCartage                   = totalCartage;
			}
			return totalObject;
		}
		
	});
});
function replaceSlash(str,oldChar,replaceChar) {
	var charArray = str.split('');

	for (var i = 0; i < charArray.length; i++) {
		if (charArray[i] === oldChar) {
			charArray[i] = replaceChar;
		}
	}

	return charArray.join('');
}

function getFourBeforeSpecialCharacter(inputString) {
	const match = inputString.match(/([a-zA-Z0-9]{4})(?=\W)/);

	if (match)
		return match[1];
	else
		return inputString.slice(-4);
}
