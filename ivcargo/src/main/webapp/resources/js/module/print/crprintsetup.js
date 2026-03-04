
define(['/ivcargo/resources/js/barcode/qrcode/qrcode.js'],function(QRCodeJS) {
	'use strict';// this basically give strictness to this specific js
	return {
		getConfiguration : function(configuration ,billSelectionId){
			var josnObject = new Object();
			josnObject.ajtcCrPrint			= 'text!/ivcargo/html/print/delivery/247_delivery.html';
			josnObject.atsCrPrint			= 'text!/ivcargo/html/print/delivery/251_delivery.html';
			josnObject.dhariwalCrPrint		= 'text!/ivcargo/html/print/delivery/252_delivery.html';
			josnObject.batcCRPrint			= 'text!/ivcargo/html/print/delivery/232_delivery.html';
			josnObject.sngtCRPrint			= 'text!/ivcargo/html/print/delivery/202_delivery.html';
			josnObject.ndtCRPrint			= 'text!/ivcargo/html/print/delivery/244_delivery.html';
			josnObject.aecCRPrint			= 'text!/ivcargo/html/print/delivery/263_delivery.html';
			josnObject.kumarCrPrint			= 'text!/ivcargo/html/print/delivery/13_delivery.html';
			josnObject.mayurraCrPrint		= 'text!/ivcargo/html/print/delivery/38_delivery.html';
			josnObject.netcCrPrint			= 'text!/ivcargo/html/print/delivery/209_delivery.html';
			josnObject.bhaskarCrPrint		= 'text!/ivcargo/html/print/delivery/268_delivery.html';
			josnObject.konduskarCrPrint		= 'text!/ivcargo/html/print/delivery/269_delivery.html';
			josnObject.konduskarCrLaserPrint= 'text!/ivcargo/html/print/delivery/269_laser_delivery.html';
			josnObject.royalCRPrint			= 'text!/ivcargo/html/print/delivery/1_delivery.html';
			josnObject.royalCRPlainprint	= 'text!/ivcargo/html/print/delivery/1_plainprintdelivery.html';
			josnObject.stcCrPrint			= 'text!/ivcargo/html/print/delivery/21_delivery.html';
			josnObject.khtcCrPrint			= 'text!/ivcargo/html/print/delivery/204_delivery.html';
			josnObject.falconCrPrint		= 'text!/ivcargo/html/print/delivery/50_delivery.html';
			josnObject.southernCrPrint		= 'text!/ivcargo/html/print/delivery/6_delivery.html';
			josnObject.aptcCRPrint			= 'text!/ivcargo/html/print/delivery/274_delivery.html';
			josnObject.srsCRPrint			= 'text!/ivcargo/html/print/delivery/17_delivery.html';
			josnObject.sccCRPrint			= 'text!/ivcargo/html/print/delivery/scc_delivery.html';
			josnObject.sccOldCRPrint		= 'text!/ivcargo/html/print/delivery/scc_OldPrintdelivery.html';
			josnObject.sstCRPrint			= 'text!/ivcargo/html/print/delivery/41_delivery.html';
			josnObject.mtlCRPrint			= 'text!/ivcargo/html/print/delivery/9_delivery.html';
			josnObject.stCRPrint			= 'text!/ivcargo/html/print/delivery/45_delivery.html';
			josnObject.slCRPrint			= 'text!/ivcargo/html/print/delivery/281_delivery.html';
			josnObject.opsCRPrint			= 'text!/ivcargo/html/print/delivery/280_delivery.html';
			josnObject.meghaCRPrint			= 'text!/ivcargo/html/print/delivery/283_delivery.html';
			josnObject.jagrutiCRPrint		= 'text!/ivcargo/html/print/delivery/217_delivery.html';
			josnObject.htcCRPrint			= 'text!/ivcargo/html/print/delivery/227_delivery.html';
			josnObject.aciplCRPrint			= 'text!/ivcargo/html/print/delivery/acipl_delivery.html';
			josnObject.punjabCRPrint		= 'text!/ivcargo/html/print/delivery/307_delivery.html';
			josnObject.srlCRPrint			= 'text!/ivcargo/html/print/delivery/309_delivery.html';
			josnObject.sktCRPrint			= 'text!/ivcargo/html/print/delivery/310_delivery.html';
			josnObject.nepalganjCRPrint		= 'text!/ivcargo/html/print/delivery/311_delivery.html';
			josnObject.scmCRPrint			= 'text!/ivcargo/html/print/delivery/315_delivery.html';
			josnObject.srisaiCRPrint		= 'text!/ivcargo/html/print/delivery/271_delivery.html';
			josnObject.coastelCRPrint		= 'text!/ivcargo/html/print/delivery/321_delivery.html';
			josnObject.jayramCRPrintLinux	= 'text!/ivcargo/html/print/delivery/jayram_delivery_linux.html';
			josnObject.srtcCRPrint			= 'text!/ivcargo/html/print/delivery/326_delivery.html';
			josnObject.sccCRPrintWithLabels	= 'text!/ivcargo/html/print/delivery/scc_withLabels_delivery.html';
			josnObject.sreCRPrint			= 'text!/ivcargo/html/print/delivery/14_delivery.html';		
			josnObject.kcmCRPrint			= 'text!/ivcargo/html/print/delivery/336_delivery.html';
			josnObject.rajkamalCRPrint		= 'text!/ivcargo/html/print/delivery/337_delivery.html';
			josnObject.csplCRPrint			= 'text!/ivcargo/html/print/delivery/39_delivery.html';
			josnObject.shreejiCRPrint		= 'text!/ivcargo/html/print/delivery/338_delivery.html';
			josnObject.prabhatCRPrint		= 'text!/ivcargo/html/print/delivery/341_delivery.html';
			josnObject.maheshCrPrint			= 'text!/ivcargo/html/print/elivery/334_delivery.html';
			josnObject.anandCrPrint		   = 'text!/ivcargo/html/print/delivery/617_delivery.html';
			josnObject.jktcCRPrint		   = 'text!/ivcargo/html/print/delivery/628_delivery.html';
			
			if(configuration.crPrintPermissionForNewGroups)
				josnObject.defaultNewCRPrint  = 'text!/ivcargo/html/print/delivery/defaultNew_delivery.html';			
			else if(configuration.accountGroupId > ACCOUNT_GROUP_ID_APT || configuration.accountGroupId == ACCOUNT_GROUP_ID_DEMO)
				josnObject.dashmeshCRPrint	= 'text!/ivcargo/html/print/delivery/default_delivery_new.html';
			else
				josnObject.dashmeshCRPrint	= 'text!/ivcargo/html/print/delivery/342_delivery.html';
			
			josnObject.shrikantCRPrint		= 'text!/ivcargo/html/print/delivery/343_delivery.html';
			josnObject.vijayantCRPrint		= 'text!/ivcargo/html/print/delivery/344_delivery.html';
			josnObject.kpsCRPrint			= 'text!/ivcargo/html/print/delivery/345_delivery.html';
			josnObject.manishCRPrint		= 'text!/ivcargo/html/print/delivery/348_delivery.html';
			josnObject.shriCRPrint			= 'text!/ivcargo/html/print/delivery/350_delivery.html';
			josnObject.pptplCRPrint			= 'text!/ivcargo/html/print/delivery/pptpl_delivery.html';
			josnObject.prcCRPrint			= 'text!/ivcargo/html/print/delivery/351_delivery.html';
			josnObject.knsCRPrint			= 'text!/ivcargo/html/print/delivery/293_delivery.html';
			josnObject.uniqueCRPrint		= 'text!/ivcargo/html/print/delivery/355_delivery.html';
			josnObject.dslCRPrint			= 'text!/ivcargo/html/print/delivery/259_delivery.html';
			josnObject.sjvtCRPrint			= 'text!/ivcargo/html/print/delivery/358_delivery.html';
			josnObject.ashwmeghCRPrint		= 'text!/ivcargo/html/print/delivery/359_delivery.html';
			josnObject.ggsCRPrint			= 'text!/ivcargo/html/print/delivery/354_delivery.html';
			josnObject.svrcrprint			= 'text!/ivcargo/html/print/delivery/362_delivery.html';
			josnObject.secCRPrint			= 'text!/ivcargo/html/print/delivery/363_delivery.html';
			josnObject.gtmCRPrint			= 'text!/ivcargo/html/print/delivery/370_delivery.html';
			josnObject.cxlCRPrint			= 'text!/ivcargo/html/print/delivery/372_delivery.html';
			josnObject.mgtCRPrint			= 'text!/ivcargo/html/print/delivery/376_delivery.html';
			josnObject.loadmanCRPrint		= 'text!/ivcargo/html/print/delivery/378_delivery.html';
			josnObject.prCRPrint			= 'text!/ivcargo/html/print/delivery/379_delivery.html';
			josnObject.skstravels			= 'text!/ivcargo/html/print/delivery/366_delivery.html';
			josnObject.sugamaCrPrint		= 'text!/ivcargo/html/print/delivery/383_delivery.html';
			josnObject.srttCrPrint			= 'text!/ivcargo/html/print/delivery/386_delivery.html';
			josnObject.cciCRPrint			= 'text!/ivcargo/html/print/delivery/374_delivery.html';
			josnObject.kgsCRPrint			= 'text!/ivcargo/html/print/delivery/382_delivery.html';
			josnObject.rglplCRPrint			= 'text!/ivcargo/html/print/delivery/385_delivery.html';
			josnObject.lglCRPrint			= 'text!/ivcargo/html/print/delivery/377_delivery.html';
			josnObject.hpsCRPrint			= 'text!/ivcargo/html/print/delivery/388_delivery.html';
			josnObject.rectusCRPrint		= 'text!/ivcargo/html/print/delivery/395_delivery.html';
			josnObject.kxcplCRPrint			= 'text!/ivcargo/html/print/delivery/392_delivery.html';
			josnObject.svrlCRPrint			= 'text!/ivcargo/html/print/delivery/391_delivery.html';
			josnObject.dltCRPrint			= 'text!/ivcargo/html/print/delivery/398_delivery.html';
			josnObject.klCRPrint			= 'text!/ivcargo/html/print/delivery/397_delivery.html';
			josnObject.seabirdCRPrint		= 'text!/ivcargo/html/print/delivery/402_delivery.html';
			josnObject.crPrint_409			= 'text!/ivcargo/html/print/delivery/409_delivery.html';
			josnObject.crPrint_407			= 'text!/ivcargo/html/print/delivery/407_delivery.html';
			josnObject.crPrint_410			= 'text!/ivcargo/html/print/delivery/410_delivery.html';
			josnObject.crPrint_389			= 'text!/ivcargo/html/print/delivery/389_delivery.html';
			josnObject.crPrint_393			= 'text!/ivcargo/html/print/delivery/393_delivery.html';
			josnObject.crPrint_413			= 'text!/ivcargo/html/print/delivery/413_delivery.html';
			josnObject.crPrint_415			= 'text!/ivcargo/html/print/delivery/415_delivery.html';
			josnObject.crPrint_411			= 'text!/ivcargo/html/print/delivery/411_delivery.html';
			josnObject.crPrintDotMatrix_411	= 'text!/ivcargo/html/print/delivery/411DotMatrix_delivery.html';
			josnObject.crPrint_417			= 'text!/ivcargo/html/print/delivery/417_delivery.html';
			josnObject.crPrint_423			= 'text!/ivcargo/html/print/delivery/423_delivery.html';
			josnObject.crPrint_422			= 'text!/ivcargo/html/print/delivery/422_delivery.html';
			josnObject.crPrint_439			= 'text!/ivcargo/html/print/delivery/439_delivery.html';
			josnObject.crPrint_446			= 'text!/ivcargo/html/print/delivery/446_delivery.html';
			josnObject.crPrint_449			= 'text!/ivcargo/html/print/delivery/449_delivery.html';
			josnObject.crPrint_3			= 'text!/ivcargo/html/print/delivery/3_delivery.html';
			josnObject.crPrint_468			= 'text!/ivcargo/html/print/delivery/468_delivery.html';
			josnObject.crPrint_471			= 'text!/ivcargo/html/print/delivery/471_delivery.html';
			josnObject.crPrint_453			= 'text!/ivcargo/html/print/delivery/453_delivery.html';
			josnObject.crPrint_498			= 'text!/ivcargo/html/print/delivery/498_delivery.html';
			josnObject.crPrint_489			= 'text!/ivcargo/html/print/delivery/489_delivery.html';
			josnObject.crPrint_288			= 'text!/ivcargo/html/print/delivery/288_delivery.html';
			josnObject.crPrint_466			= 'text!/ivcargo/html/print/delivery/466_delivery.html';
			josnObject.crPrint_460			= 'text!/ivcargo/html/print/delivery/460_delivery.html';
			josnObject.crPrint_525			= 'text!/ivcargo/html/print/delivery/525_delivery.html';
			josnObject.crPrint_529			= 'text!/ivcargo/html/print/delivery/529_delivery.html';
			josnObject.sbsCrPrint			= 'text!/ivcargo/html/print/delivery/531_delivery.html';
			josnObject.crPrint_532			= 'text!/ivcargo/html/print/delivery/532_delivery.html';
			josnObject.crPrint_537		   = 'text!/ivcargo/html/print/delivery/537_delivery.html';
			josnObject.crPrint_538		  = 'text!/ivcargo/html/print/delivery/538_delivery.html';
			josnObject.crPrint_544		   = 'text!/ivcargo/html/print/delivery/544_delivery.html';
			josnObject.crPrint_643		   = 'text!/ivcargo/html/print/delivery/643_delivery.html';
			josnObject.crPrint_648		   = 'text!/ivcargo/html/print/delivery/648_delivery.html';
		
			if(configuration.EstimatedWiseCrPrint && billSelectionId >1)
				josnObject.crPrint_555	 = 'text!/ivcargo/html/print/delivery/555_delivery2.html';
			else
				josnObject.crPrint_555		   = 'text!/ivcargo/html/print/delivery/555_delivery.html'
			
			josnObject.crPrint_566		   = 'text!/ivcargo/html/print/delivery/566_delivery.html';
			josnObject.crPrint_563		   = 'text!/ivcargo/html/print/delivery/563_delivery.html';
			josnObject.crPrint_579		   = 'text!/ivcargo/html/print/delivery/579_delivery.html';
			josnObject.crPrint_578		   = 'text!/ivcargo/html/print/delivery/578_delivery.html';
			josnObject.sstplCRPrint			= 'text!/ivcargo/html/print/delivery/565_delivery.html';
			josnObject.demoCRPrint		   = 'text!/ivcargo/html/print/delivery/396_delivery.html';
			josnObject.crPrint_564		   = 'text!/ivcargo/html/print/delivery/564_delivery.html';
			josnObject.crPrint_589		  = 'text!/ivcargo/html/print/delivery/589_delivery.html';
			josnObject.crPrint_592		   =  'text!/ivcargo/html/print/delivery/592_delivery.html';
			josnObject.sccCrPrintLabelsNew	= 'text!/ivcargo/html/print/delivery/sccCrPrintLabelsNew.html';
			josnObject.crPrint_441		   = 'text!/ivcargo/html/print/delivery/441_delivery.html';
			josnObject.crPrint_604		   =  'text!/ivcargo/html/print/delivery/604_delivery.html';
			josnObject.crPrint_594		   = 'text!/ivcargo/html/print/delivery/594_delivery.html';			  
			josnObject.crPrint_615		   = 'text!/ivcargo/html/print/delivery/615_delivery.html';
			josnObject.crPrint_624		   = 'text!/ivcargo/html/print/delivery/624_delivery.html';
			josnObject.crPrint_616		   = 'text!/ivcargo/html/print/delivery/616_delivery.html';
			josnObject.crPrint_627		   = 'text!/ivcargo/html/print/delivery/627_delivery.html';
			josnObject.crPrint_633		  = 'text!/ivcargo/html/print/delivery/633_delivery.html';
			josnObject.crPrint_631		   = 'text!/ivcargo/html/print/delivery/631_delivery.html';
			josnObject.crPrint_625		   = 'text!/ivcargo/html/print/delivery/625_delivery.html';
			josnObject.crPrint_470		   = 'text!/ivcargo/html/print/delivery/470_delivery.html';
			josnObject.crPrint_651		   = 'text!/ivcargo/html/print/delivery/651_delivery.html';
			josnObject.crPrint_644		   = 'text!/ivcargo/html/print/delivery/644_delivery.html';
			
			//josnObject.crprint_668		 = 'text!/ivcargo/html/print/delivery/crprint_668.html';
			/*
				Do not add here
			*/

			if (josnObject[configuration.crPrintType] != undefined)
				return josnObject[configuration.crPrintType];
			
			return 'text!/ivcargo/html/print/delivery/' + configuration.crPrintType + '.html';
		}, getFilePathForLabel : function(configuration) {
			var josnObject = new Object();

			josnObject.ajtcCrPrint		= '/ivcargo/resources/js/module/print/deliveryprint/ajtccrprintfilepath.js';
			josnObject.atsCrPrint		= '/ivcargo/resources/js/module/print/deliveryprint/atscrprintfilepath.js';
			josnObject.dhariwalCrPrint	= '/ivcargo/resources/js/module/print/deliveryprint/dhariwalcrprintfilepath.js';
			josnObject.batcCRPrint		= '/ivcargo/resources/js/module/print/deliveryprint/batccrprintfilepath.js';
			josnObject.sngtCRPrint		= '/ivcargo/resources/js/module/print/deliveryprint/sngtcrprintfilepath.js';
			josnObject.ndtCRPrint		= '/ivcargo/resources/js/module/print/deliveryprint/ndtcrprintfilepath.js';
			josnObject.aecCRPrint		= '/ivcargo/resources/js/module/print/deliveryprint/aeccrprintfilepath.js';
			josnObject.kumarCrPrint		= '/ivcargo/resources/js/module/print/deliveryprint/kumarcrprintfilepath.js';
			josnObject.mayurraCrPrint	= '/ivcargo/resources/js/module/print/deliveryprint/mayurracrprintfilepath.js';
			josnObject.netcCrPrint		= '/ivcargo/resources/js/module/print/deliveryprint/netccrprintfilepath.js';
			josnObject.bhaskarCrPrint	= '/ivcargo/resources/js/module/print/deliveryprint/bhaskarcrprintfilepath.js';
			josnObject.konduskarCrPrint			= '/ivcargo/resources/js/module/print/deliveryprint/konduskarcrprintfilepath.js';
			josnObject.konduskarCrLaserPrint	= '/ivcargo/resources/js/module/print/deliveryprint/konduskarcrlaserprintfilepath.js';
			josnObject.royalCRPrint				= '/ivcargo/resources/js/module/print/deliveryprint/royalcrprintfilepath.js';
			josnObject.royalCRPlainprint		= '/ivcargo/resources/js/module/print/deliveryprint/royalcrplainprintfilepath.js';
			josnObject.stcCrPrint				= '/ivcargo/resources/js/module/print/deliveryprint/stccrprintfilepath.js';
			josnObject.khtcCrPrint				= '/ivcargo/resources/js/module/print/deliveryprint/khtccrprintfilepath.js';
			josnObject.falconCrPrint			= '/ivcargo/resources/js/module/print/deliveryprint/falconcrprintfilepath.js';
			josnObject.southernCrPrint			= '/ivcargo/resources/js/module/print/deliveryprint/southerncrprintfilepath.js';
			josnObject.aptcCRPrint				= '/ivcargo/resources/js/module/print/deliveryprint/aptccrprintfilepath.js';
			josnObject.srsCRPrint				= '/ivcargo/resources/js/module/print/deliveryprint/srscrprintfilepath.js';
			josnObject.sccCRPrint				= '/ivcargo/resources/js/module/print/deliveryprint/scccrprintfilepath.js';
			josnObject.sccOldCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/scccrprintfilepath.js';
			josnObject.sstCRPrint				= '/ivcargo/resources/js/module/print/deliveryprint/sstcrprintfilepath.js';
			josnObject.mtlCRPrint				= '/ivcargo/resources/js/module/print/deliveryprint/mtlcrprintfilepath.js';
			josnObject.stCRPrint				= '/ivcargo/resources/js/module/print/deliveryprint/stcrprintfilepath.js';
			josnObject.slCRPrint				= '/ivcargo/resources/js/module/print/deliveryprint/slcrprintfilepath.js';
			josnObject.opsCRPrint				= '/ivcargo/resources/js/module/print/deliveryprint/opscrprintfilepath.js';
			josnObject.meghaCRPrint				= '/ivcargo/resources/js/module/print/deliveryprint/meghacrprintfilepath.js';
			josnObject.jagrutiCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/jagruticrprintfilepath.js';
			josnObject.htcCRPrint				= '/ivcargo/resources/js/module/print/deliveryprint/htccrprintfilepath.js';
			josnObject.aciplCRPrint				= '/ivcargo/resources/js/module/print/deliveryprint/aciplcrprintfilepath.js';
			josnObject.punjabCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/punjabcrprintfilepath.js';
			josnObject.srlCRPrint				= '/ivcargo/resources/js/module/print/deliveryprint/srlcrprintfilepath.js';
			josnObject.sktCRPrint				= '/ivcargo/resources/js/module/print/deliveryprint/sktcrprintfilepath.js';
			josnObject.nepalganjCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/nepalganjcrprintfilepath.js';		
			josnObject.scmCRPrint				= '/ivcargo/resources/js/module/print/deliveryprint/scmcrprintfilepath.js';
			josnObject.srisaiCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/srisaicrprintfilepath.js';
			josnObject.coastelCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/coastelcrprintfilepath.js';
			josnObject.jayramCRPrintLinux	= '/ivcargo/resources/js/module/print/deliveryprint/jayramcrprintlinuxfilepath.js';
			josnObject.srtcCRPrint			 = '/ivcargo/resources/js/module/print/deliveryprint/srtccrprintfilepath.js';
			josnObject.sccCRPrintWithLabels ='/ivcargo/resources/js/module/print/deliveryprint/scccrprintfilepath.js';
			josnObject.sreCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/srecrprintfilepath.js';
			josnObject.kcmCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/kcmcrprintfilepath.js';
			josnObject.rajkamalCRPrint		= '/ivcargo/resources/js/module/print/deliveryprint/rajkamalcrprintfilepath.js';
			josnObject.csplCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/csplcrprintfilepath.js';
			josnObject.shreejiCRPrint		= '/ivcargo/resources/js/module/print/deliveryprint/shreejicrprintfilepath.js';
			josnObject.prabhatCRPrint		= '/ivcargo/resources/js/module/print/deliveryprint/prabhatcrprintfilepath.js';
			josnObject.maheshCrPrint		= '/ivcargo/resources/js/module/print/deliveryprint/maheshcrprintfilepath.js';
			josnObject.anandCrPrint			= '/ivcargo/resources/js/module/print/deliveryprint/anandcrprintfilepath.js';
			josnObject.jktcCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/jktccrprintfilepath.js';
			josnObject.crPrint_625			= '/ivcargo/resources/js/module/print/deliveryprint/edisafecrprintfilepath.js';
						
			if(configuration.crPrintPermissionForNewGroups){
				josnObject.defaultNewCRPrint = '/ivcargo/resources/js/module/print/deliveryprint/defaultnewcrprintfilepath.js';
			}else if(configuration.accountGroupId > ACCOUNT_GROUP_ID_APT || configuration.accountGroupId == ACCOUNT_GROUP_ID_DEMO) {
				josnObject.dashmeshCRPrint	= '/ivcargo/resources/js/module/print/deliveryprint/defaultnewcrprintfilepath.js';
			} else {
				josnObject.dashmeshCRPrint	 = '/ivcargo/resources/js/module/print/deliveryprint/dashmeshcrprintfilepath.js';
			}
			
			josnObject.shrikantCRPrint		= '/ivcargo/resources/js/module/print/deliveryprint/shrikantcrprintfilepath.js';
			josnObject.vijayantCRPrint		= '/ivcargo/resources/js/module/print/deliveryprint/vijayantcrprintfilepath.js';
			josnObject.kpsCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/kpscrprintfilepath.js';
			josnObject.manishCRPrint		= '/ivcargo/resources/js/module/print/deliveryprint/manishcrprintfilepath.js';
			josnObject.shriCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/shricrprintfilepath.js';
			josnObject.pptplCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/pptplcrprintfilepath.js';
			josnObject.prcCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/prccrprintfilepath.js';
			josnObject.knsCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/knscrprintfilepath.js';
			josnObject.uniqueCRPrint		= '/ivcargo/resources/js/module/print/deliveryprint/uniquecrprintfilepath.js';
			josnObject.dslCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/dslcrprintfilepath.js';
			josnObject.sjvtCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/sjvtcrprintfilepath.js';
			josnObject.ashwmeghCRPrint		= '/ivcargo/resources/js/module/print/deliveryprint/ashwmeghcrprintfilepath.js';
			josnObject.svrcrprint			= '/ivcargo/resources/js/module/print/deliveryprint/svrcrprintfilepath.js';
			josnObject.ggsCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/ggscrprintfilepath.js';
			josnObject.secCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/seccrprintfilepath.js';
			josnObject.gtmCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/gtmcrprintfilepath.js';
			josnObject.cxlCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/cxlcrprintfilepath.js';
			josnObject.mgtCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/mgtcrprintfilepath.js';
			josnObject.loadmanCRPrint		= '/ivcargo/resources/js/module/print/deliveryprint/loadmancrprintfilepath.js';
			josnObject.prCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/prcrprintfilepath.js';
			josnObject.skstravels			= '/ivcargo/resources/js/module/print/deliveryprint/sksTravelscrprintfilepath.js';
			josnObject.sugamaCrPrint		= '/ivcargo/resources/js/module/print/deliveryprint/sugamacrprintfilepath.js';
			josnObject.srttCrPrint			= '/ivcargo/resources/js/module/print/deliveryprint/srttcrprintfilepath.js';
			josnObject.cciCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/ccicrprintfilepath.js';
			josnObject.kgsCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/kgscrprintfilepath.js';
			josnObject.rglplCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/rglplcrprintfilepath.js';
			josnObject.lglCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/lglcrprintfilepath.js';
			josnObject.hpsCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/hpscrprintfilepath.js';
			josnObject.rectusCRPrint		= '/ivcargo/resources/js/module/print/deliveryprint/rectuscrprintfilepath.js';
			josnObject.kxcplCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/kxcplcrprintfilepath.js';
			josnObject.svrlCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/svrlcrprintfilepath.js';
			josnObject.dltCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/dltcrprintfilepath.js';
			josnObject.klCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/klcrprintfilepath.js';
			josnObject.seabirdCRPrint		= '/ivcargo/resources/js/module/print/deliveryprint/seabirdcrprintfilepath.js';
			josnObject.crPrint_409			= '/ivcargo/resources/js/module/print/deliveryprint/speedlinkcrprintfilepath.js';
			josnObject.crPrint_407			= '/ivcargo/resources/js/module/print/deliveryprint/shivcrprintfilepath.js';
			josnObject.crPrint_410			= '/ivcargo/resources/js/module/print/deliveryprint/puneethcargocrprintfilepath.js';
			josnObject.crPrint_389			= '/ivcargo/resources/js/module/print/deliveryprint/rpscrprintfilepath.js';
			josnObject.crPrint_393			= '/ivcargo/resources/js/module/print/deliveryprint/srltcrprintfilepath.js';
			josnObject.crPrint_413			= '/ivcargo/resources/js/module/print/deliveryprint/sivsaicrprintfilepath.js';
			josnObject.crPrint_415			= '/ivcargo/resources/js/module/print/deliveryprint/milanTransportcrprintfilepath.js';
			josnObject.crPrint_411			= '/ivcargo/resources/js/module/print/deliveryprint/gtscrprintfilepath.js';
			josnObject.crPrintDotMatrix_411 = '/ivcargo/resources/js/module/print/deliveryprint/gtsdotmatrixcrprintfilepath.js';
			josnObject.crPrint_417			= '/ivcargo/resources/js/module/print/deliveryprint/kgncrprintfilepath.js';
			josnObject.crPrint_423			= '/ivcargo/resources/js/module/print/deliveryprint/avtccrprintfilepath.js';
			josnObject.crPrint_422			= '/ivcargo/resources/js/module/print/deliveryprint/psscrprintfilepath.js';
			josnObject.crPrint_439			= '/ivcargo/resources/js/module/print/deliveryprint/ptccrprintfilepath.js';
			josnObject.crPrint_446			= '/ivcargo/resources/js/module/print/deliveryprint/safarcrprintfilepath.js';
			josnObject.crPrint_449			= '/ivcargo/resources/js/module/print/deliveryprint/sslscrprintfilepath.js';
			josnObject.crPrint_3			= '/ivcargo/resources/js/module/print/deliveryprint/kcplcrprintfilepath.js';
			josnObject.crPrint_468			= '/ivcargo/resources/js/module/print/deliveryprint/htcrprintfilepath.js';
			josnObject.crPrint_471			= '/ivcargo/resources/js/module/print/deliveryprint/ctgcrprintfilepath.js';
			josnObject.crPrint_453			= '/ivcargo/resources/js/module/print/deliveryprint/maheshcargocrprintfilepath.js';
			josnObject.crPrint_498			= '/ivcargo/resources/js/module/print/deliveryprint/netplcrprintfilepath.js';
			josnObject.crPrint_489			= '/ivcargo/resources/js/module/print/deliveryprint/nrcrprintfilepath.js';
			josnObject.crPrint_288			= '/ivcargo/resources/js/module/print/deliveryprint/3xCargocrprintfilepath.js';
			josnObject.crPrint_466			= '/ivcargo/resources/js/module/print/deliveryprint/sccrprintfilepath.js';
			josnObject.crPrint_460			= '/ivcargo/resources/js/module/print/deliveryprint/srrcrprintfilepath.js';
			josnObject.crPrint_525			= '/ivcargo/resources/js/module/print/deliveryprint/shatabdicrprintfilepath.js';
			josnObject.crPrint_529			= '/ivcargo/resources/js/module/print/deliveryprint/istccrprintfilepath.js';
			josnObject.crPrint_532			= '/ivcargo/resources/js/module/print/deliveryprint/asheeshcrprintfilepath.js';
			josnObject.sbsCrPrint			= '/ivcargo/resources/js/module/print/deliveryprint/sbscrprintfilepath.js';
			josnObject.crPrint_537			= '/ivcargo/resources/js/module/print/deliveryprint/snltcrprintfilepath.js';
			josnObject.crPrint_538			= '/ivcargo/resources/js/module/print/deliveryprint/smdtclcrprintfilepath.js';
			josnObject.crPrint_544			= '/ivcargo/resources/js/module/print/deliveryprint/singleCrMultiLrPrint_544.js';
			josnObject.crPrint_555			= '/ivcargo/resources/js/module/print/deliveryprint/btccrprintfilepath.js';
			josnObject.crPrint_563			= '/ivcargo/resources/js/module/print/deliveryprint/psrcrprintfilepath.js';
			josnObject.crPrint_566			= '/ivcargo/resources/js/module/print/deliveryprint/sprscrprintfilepath.js';
			josnObject.crPrint_579			= '/ivcargo/resources/js/module/print/deliveryprint/gcmcrprintfilepath.js';
			josnObject.crPrint_578			= '/ivcargo/resources/js/module/print/deliveryprint/kmpscrprintfilepath.js';
			josnObject.sstplCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/sstplcrprintfilepath.js';
			josnObject.demoCRPrint			= '/ivcargo/resources/js/module/print/deliveryprint/democrprintfilepath.js';
			josnObject.crPrint_564			= '/ivcargo/resources/js/module/print/deliveryprint/sharmatptcrprintfilepath.js';
			josnObject.crPrint_589		   = '/ivcargo/resources/js/module/print/deliveryprint/mltcrprintfilepath.js';
			josnObject.crPrint_592		   = '/ivcargo/resources/js/module/print/deliveryprint/aircrprintfilepath.js';
			josnObject.sccCrPrintLabelsNew	= '/ivcargo/resources/js/module/print/deliveryprint/sccCrPrintLabelsNewfilepath.js';
			josnObject.crPrint_441			= '/ivcargo/resources/js/module/print/deliveryprint/recrprintfilepath.js';		
			josnObject.crPrint_604			= '/ivcargo/resources/js/module/print/deliveryprint/krcrprintfilepath.js';
			josnObject.crPrint_594			= '/ivcargo/resources/js/module/print/deliveryprint/jabbarcrprintfilepath.js';			  
			josnObject.crPrint_615			= '/ivcargo/resources/js/module/print/deliveryprint/paulstranscrprintfilepath.js';
			josnObject.crPrint_624			= '/ivcargo/resources/js/module/print/deliveryprint/gtccrprintfilepath.js';
			josnObject.crPrint_616			= '/ivcargo/resources/js/module/print/deliveryprint/ygtccrprintfilepath.js';
			josnObject.crPrint_627			= '/ivcargo/resources/js/module/print/deliveryprint/shahulcrprintfilepath.js';
			josnObject.crPrint_633			= '/ivcargo/resources/js/module/print/deliveryprint/sbtrcrprintfilepath.js';
			josnObject.crPrint_631			= '/ivcargo/resources/js/module/print/deliveryprint/shivamcrprintfilepath.js';
			josnObject.crPrint_643			= '/ivcargo/resources/js/module/print/deliveryprint/srcargocrprintfilepath.js';
			josnObject.crPrint_470			= '/ivcargo/resources/js/module/print/deliveryprint/gttcrprintfilepath.js';
			josnObject.crPrint_648			= '/ivcargo/resources/js/module/print/deliveryprint/dlsexpresscrprintfilepath.js';
			josnObject.crPrint_651			= '/ivcargo/resources/js/module/print/deliveryprint/ndtccrprintfilepath.js';
			josnObject.crPrint_644			= '/ivcargo/resources/js/module/print/deliveryprint/psrllpcrprintfilepath.js';
			
			//josnObject.crprint_668			= '/ivcargo/resources/js/module/print/deliveryprint/crprintfilepath.js';
			/*
				Do not add here
			*/
	
			if (josnObject[configuration.crPrintType] != undefined)
				return josnObject[configuration.crPrintType];
			
			return '/ivcargo/resources/js/module/print/deliveryprint/crprintfilepath.js';
		}, setHeaderDetails : function(responseOut) {
			let accountGroupObj		= responseOut.PrintHeaderModel;
			let accountGroupName	= accountGroupObj.accountGroupName;
			let crprintList 	= responseOut.crprintlist;
			$("*[data-account='name']").html(accountGroupObj.accountGroupName);
			$("*[data-account='accountGroupName']").html(accountGroupName.toUpperCase());
			$("*[data-account='address']").html(accountGroupObj.branchAddress + ". ");
			$("*[data-account='email']").html(accountGroupObj.branchContactDetailEmailAddress);
			
			if(accountGroupObj.accountGroupId == ACCOUNT_GROUP_ID_GLDTS) {
				if(accountGroupObj.branchId == POLUR_BRANCH_740)
					$(".showSecondTable").addClass('hide');
				else
					$(".showTable").addClass('hide');
			}
			
			if(accountGroupObj.branchContactDetailMobileNumber != undefined)
				$("*[data-account='mobileNumber']").html(accountGroupObj.branchContactDetailMobileNumber);
			
			if(accountGroupObj.branchAddress != undefined)
				$("*[data-account='addressbranch']").html(accountGroupObj.branchAddress.substring(0, 35)+". ");
			else
				$("*[data-account='addressbranch']").html(' ');
			
			if(accountGroupObj.branchContactDetailPhoneNumber != undefined)
				$("*[data-account='number']").html(accountGroupObj.branchContactDetailPhoneNumber);
			else
				$("*[data-account='number']").html(accountGroupObj.branchContactDetailMobileNumber);
			
			$("*[data-account='gstn']").html(accountGroupObj.branchGSTNNumber);
			$("*[data-account='branchPanNumber']").html(accountGroupObj.branchPanNumber);
			
			if(accountGroupObj.branchContactDetailEmailAddress != undefined)	
				$("*[data-account='branchContactDetailEmailAddress']").html(accountGroupObj.branchContactDetailEmailAddress);
			else	
				$("*[data-account='branchContactDetailEmailAddress']").html('--');
			  
			$("*[data-account='cityName']").html(accountGroupObj.cityName);
			$("*[data-account='branchAddressPincode']").html(accountGroupObj.branchAddressPincode);
			
			let paymentQrBasePath = '/ivcargo/images/QR/' + accountGroupObj.accountGroupId + '/' + responseOut.crprintlist.settledByBranchId;
			let possibleExtensions = ['.jpeg', '.jpg', '.png'];

			let paymentQrPath = null;

			for (const element of possibleExtensions) {
				let currentPath = paymentQrBasePath + element;
				
				if (imageSrcExists(currentPath)) {
					paymentQrPath = currentPath;
					break;
				}
			}

			setCompanyLogos(accountGroupObj.accountGroupId);

			if(paymentQrPath != undefined && paymentQrPath != null)
				$(".paymentQrPath").attr("src", paymentQrPath);
				
			if(crprintList.wayBillTypeId == WAYBILL_TYPE_CREDIT)	
			   $("*[data-label='crLabel']").html('Delivery Note/CR');

			 if(responseOut.configuration.showCompanyLogo)
				$(".companyLogoHideTd").removeClass('hide');
			
			 if(responseOut.configuration.showCompanyWaterMarkLogo)
			 	$(".companyWaterMarkLogo").removeClass('hide');
			 					
			
		}, setConsignorname : function(responseOut) {
			let consignorObj	= responseOut.consignor;
			let consigneeObj	= responseOut.consignee;
			let crprintList		= responseOut.crprintlist;
			let wayBillTypeId	= crprintList.wayBillTypeId;
			
			$("*[data-consignor='name']").html(consignorObj.customerDetailsName.replace(/ /g, "&nbsp;"));
			$("*[data-consignor='nameWithSpace']").html(consignorObj.customerDetailsName);
			console.log(consignorObj.customerDetailsName,"consignorObj.customerDetailsName")
			$("*[data-consignor='nameSubString']").html((consignorObj.customerDetailsName).substring(0,20) + '..');
			
			if(consignorObj.customerDetailsAddress != undefined)
				$("*[data-consignor='address']").html(consignorObj.customerDetailsAddress.replace(/ /g, "&nbsp;"));
			else
				$("*[data-consignor='address']").html("--");
			
			if(consignorObj.customerDetailsphoneNumber != undefined) {
				$("*[data-consignor='number']").html(consignorObj.customerDetailsphoneNumber.replace(/ /g, "&nbsp;"));
				$("*[data-consignor='numberhide1']").html(consignorObj.customerDetailsphoneNumber.substr(0, 2) + "xxxxxxxx");
			} else
				$("*[data-consignor='number']").html("");

			if(consignorObj.gstn != undefined)
				$("*[data-consignor='gstn']").html(consignorObj.gstn.replace(/ /g, "&nbsp;"));
			else
				$("*[data-consignor='gstn']").html('');

			$("*[data-consignee='name']").html(consigneeObj.customerDetailsName.replace(/ /g, "&nbsp;"));
			$("*[data-consignee='nameWithSpace']").html(consigneeObj.customerDetailsName);
			
			if(wayBillTypeId == WAYBILL_TYPE_CREDIT)
				$("*[data-consignee-tbb='name']").html(crprintList.corporateAccountName);
			else
				$("*[data-consignee-tbb='name']").html(consigneeObj.customerDetailsName.replace(/ /g, "&nbsp;"));
			
			$("*[data-consignee='nameSubString']").html((consigneeObj.customerDetailsName).substring(0,20) + '..');
			
			if(consigneeObj.customerDetailsAddress != undefined)
				$("*[data-consignee='address']").html(consigneeObj.customerDetailsAddress.replace(/ /g, "&nbsp;"));
			
			if(consigneeObj.customerDetailsphoneNumber != undefined) {
				$("*[data-consignee='number']").html(consigneeObj.customerDetailsphoneNumber.replace(/ /g, "&nbsp;"));
				$("*[data-consignee='numberhide1']").html(consigneeObj.customerDetailsphoneNumber.substr(0, 2) + "xxxxxxxx");
			} else
				$("*[data-consignee='number']").html("");
			
			if(consigneeObj.gstn != undefined)
				$("*[data-consignee='gstn']").html(consigneeObj.gstn.replace(/ /g, "&nbsp;"));
			else
				$("*[data-consignee='gstn']").html('');
			
			if(wayBillTypeId == WAYBILL_TYPE_PAID || wayBillTypeId == WAYBILL_TYPE_CREDIT)
				$("*[data-cr='customerName']").html("<span><b>Consignor : </b></span>"+consignorObj.customerDetailsName.replace(/ /g, "&nbsp;"));
			else
				$("*[data-cr='customerName']").html("<span><b>Consignee : </b></span> "+consigneeObj.customerDetailsName.replace(/ /g, "&nbsp;"));
			
			if(wayBillTypeId == WAYBILL_TYPE_PAID || wayBillTypeId == WAYBILL_TYPE_CREDIT)
				$("*[data-cr='customerNewName']").html(consignorObj.customerDetailsName.replace(/ /g, "&nbsp;"));
			else
				$("*[data-cr='customerNewName']").html(consigneeObj.customerDetailsName.replace(/ /g, "&nbsp;"));
	
			//For SAPAN Group
	
			if(wayBillTypeId == WAYBILL_TYPE_PAID && crprintList.deliveryTotal == 0) {
				$("*[data-cr='billingPartyName']").html(consignorObj.customerDetailsName.replace(/ /g, "&nbsp;"));
				
				if(consignorObj.gstn != undefined)
					$("*[data-cr='billingPartyGstin']").html(consignorObj.gstn.replace(/ /g, "&nbsp;"));
			} else if(wayBillTypeId == WAYBILL_TYPE_CREDIT || crprintList.paymentType == PAYMENT_TYPE_BILL_CREDIT_ID) {
				$("*[data-cr='billingPartyName']").html(crprintList.corporateAccountName);
				$("*[data-cr='billingPartyGstin']").html(crprintList.corporateAccountGstin);
			} else {
				$("*[data-cr='billingPartyName']").html(consigneeObj.customerDetailsName.replace(/ /g, "&nbsp;"));
			
				if(consigneeObj.gstn != undefined)
					$("*[data-cr='billingPartyGstin']").html(consigneeObj.gstn.replace(/ /g, "&nbsp;"));
			}
		}, setCrDetails : function(responseOut) {
			let crprintList			= responseOut.crprintlist;
			let configation			= responseOut.configuration;
			let wayBillTypeId		= crprintList.wayBillTypeId;
			let paymentType			= crprintList.paymentType;
			var config										= responseOut.configuration;
			
			if(crprintList.wayBillDeliveryNumber != undefined)
				$("*[data-cr='crNo']").html(crprintList.wayBillDeliveryNumber.replace(/ /g, "&nbsp;"));
			
			$("*[data-cr='lrNo']").html(crprintList.wayBillNumber.replace(/ /g, "&nbsp;"));
			$("*[data-cr='lrType']").html(crprintList.wayBillType.replace(/ /g, "&nbsp;"));
			$("*[data-cr='date']").html(crprintList.deliveryDateTimeString);
			$("*[data-cr='time']").html(crprintList.deliveryDateTimeString.replace(/ /g, "&nbsp;"));
			$("*[data-cr='bookingDateTime']").html(crprintList.bookingDateTimeString.replace(/ /g, "&nbsp;"));
			$("*[data-cr='crSource']").html(crprintList.wayBillSourceBranchName.replace(/ /g, "&nbsp;"));
			$("*[data-cr='crSourceWithSubregion']").html(crprintList.wayBillSourceBranchName +'('+crprintList.wayBillSourceSubregionName+')');
			$("*[data-cr='divisionName']").html(crprintList.divisionName);

			const receiveDateFormated = new Date(convertDateToOtheFormat(crprintList.wayBillReceiveTimeString,4,'-'));
			const deliveryDateFormated = new Date( convertDateToOtheFormat(crprintList.deliveryDate,4,'-'));
			const diffDays = diffBetweenTwoDate(receiveDateFormated,deliveryDateFormated);
			const demDays = diffDays > 7 ? diffDays-7 : 0
			
			$("*[data-cr='receiveToDeliveryDaysDiff']").html(diffDays);
			$("*[data-cr='demDays']").html(demDays);

			let [day, month, year] = crprintList.bookingDate.split("-")
				$("*[data-cr='dateDay']").html(day)
				$("*[data-cr='dateMonth']").html(month)
				$("*[data-cr='dateYear']").html(year)

			if(crprintList.formNumber != undefined){
				let formNumberSplited = crprintList.formNumber.split(',');
				$("*[data-cr='formNumber']").html(crprintList.formNumber.replace(/ /g, "&nbsp;"));
				$("*[data-cr='ewaybillFirstNumber']").html(formNumberSplited[0])
				
				var formNumberRow = replaceSlash(crprintList.formNumber,',',', ')

				if(formNumberSplited.length > 4)
					$("*[data-cr='EWayBillNoMinified']").html(formNumberSplited[0] +', '+formNumberSplited[1] +', '+formNumberSplited[2] +', '+formNumberSplited[3]);
				else
					$("*[data-cr='EWayBillNoMinified']").html(formNumberRow);
				
							
			}
			
			if(crprintList.wayBillSourceBranchName != undefined && crprintList.wayBillSourceBranchName != null)
				$("*[data-cr='crSourceWithSubString']").html(crprintList.wayBillSourceBranchName.substring(0,19));
			else
				$("*[data-cr='crSourceWithSubString']").html(' ');
			
			if(crprintList.wayBillSourceBranchAbrvn != undefined)
				$("*[data-cr='crSourceAbrvn']").html(crprintList.wayBillSourceBranchAbrvn.replace(/ /g, "&nbsp;"));
			else
				$("*[data-cr='crSourceAbrvn']").html('-');
			
			$("*[data-cr='corporateAccountName']").html(crprintList.corporateAccountName);
			$("*[data-cr='crDestination']").html(crprintList.wayBillDestinationBranchName.replace(/ /g, "&nbsp;"));
			$("*[data-cr='crDestinationWithSubregion']").html(crprintList.wayBillDestinationBranchName+'('+crprintList.wayBillDestinationSubregionName+')');
			
			if(crprintList.wayBillDestinationBranchAbrvn != undefined)
				$("*[data-cr='crDestinationAbrvn']").html(crprintList.wayBillDestinationBranchAbrvn.replace(/ /g, "&nbsp;"));
			else
				$("*[data-cr='crDestinationAbrvn']").html('-');
			
			if(crprintList.destinationBranchNumber != undefined)
				$("*[data-cr='crDestinationNumber']").html(crprintList.destinationBranchNumber.replace(/ /g, "&nbsp;"));
			else
				$("*[data-cr='crDestinationNumber']").html('');
				
			if(crprintList.consignmentSummaryDeliveryToContact != undefined) {
				$("*[data-cr='crDestinationMobileNumber1']").html(crprintList.consignmentSummaryDeliveryToContact.replace(/ /g, "&nbsp;"));
				
				if(crprintList.consignmentSummaryDeliveryToContact2 != undefined) {
					$("*[data-cr='crDestinationMobileNumber2']").html(crprintList.consignmentSummaryDeliveryToContact2.replace(/ /g, "&nbsp;"));
					$("*[data-cr='crDestinationMobileNumberBoth']").html(crprintList.consignmentSummaryDeliveryToContact.replace(/ /g, "&nbsp;") +" / " +crprintList.consignmentSummaryDeliveryToContact2.replace(/ /g, "&nbsp;"));
				} else
					$("*[data-cr='crDestinationMobileNumberBoth']").html(crprintList.consignmentSummaryDeliveryToContact.replace(/ /g, "&nbsp;"));
				
				$("*[data-cr='crSourceBranchMobileNumber1']").html(crprintList.sourceBranchMobileNumber);
				$("*[data-cr='crSourceBranchMobileNumber2']").html(crprintList.sourceBranchMobileNumber2);
			} else {
				$("*[data-cr='crDestinationMobileNumber1']").html('--');
				$("*[data-cr='crSourceBranchMobileNumber1']").html('--');
				$("*[data-cr='crSourceBranchMobileNumber2']").html('--');
				$("*[data-cr='crDestinationMobileNumber2']").html("--");
				$("*[data-cr='crDestinationMobileNumberBoth']").html("--");
			}
			$("*[data-cr='crSourceBranchPhNumber']").html(crprintList.sourceBranchPhoneNumber.replace(/ /g, "&nbsp;"));
			$("*[data-cr='crSourceSubregion']").html(crprintList.wayBillSourceSubregionName.replace(/ /g, "&nbsp;"));
			$("*[data-cr='crDestinationSubregion']").html(crprintList.wayBillDestinationSubregionName.replace(/ /g, "&nbsp;"));
			$("*[data-cr='crDestinationCity']").html(crprintList.wayBillDestinationSubregionName);
			$("*[data-cr='quantity']").html(crprintList.quantity);
			$("*[data-cr='receiveDate']").html(crprintList.wayBillReceiveTimeString.replace(/ /g, "&nbsp;"));
			$("*[data-cr='deliveryDate']").html(crprintList.deliveryDate.replace(/ /g, "&nbsp;"));
			$("*[data-cr='deliveryDate1']").html(crprintList.deliveryDate.replace(/ /g, "&nbsp;")+'<br/>'+crprintList.deliveryTime.replace(/ /g, "&nbsp;"));
			$("*[data-cr='deliveryTime']").html(crprintList.deliveryTime.replace(/ /g, "&nbsp;"));
			$("*[data-cr='bookingDate']").html(crprintList.bookingDate.replace(/ /g, "&nbsp;"));
			$("*[data-cr='quantityAndPackingType']").html(crprintList.quantity + ' - ' + crprintList.packingTypeMasterName);
			$("*[data-cr='deliveryAt']").html(crprintList.deliveryStr);
			$("*[data-cr='packingTypeName']").html(crprintList.packingTypeMasterName);
			$("*[data-cr='bookingTotal']").html(crprintList.bookingChargesSum);
			$("*[data-cr='bookngTotal']").html(crprintList.bookingChargesSum);
			$("*[data-cr='bookingSumTotal']").html(crprintList.bookingChargesSum);
			$("*[data-cr='sourceBranchAddr']").html(crprintList.sourceBranchAddress);
			$("*[data-cr='branchCode']").html(crprintList.branchCode + " / ");
			$("*[data-cr='TobranchCode']").html(crprintList.branchCode);
			$("*[data-cr='FrombranchCode']").html(crprintList.sourceBranchCode);
			$("*[data-cr='deliveryTotalBatco']").html(crprintList.bookingChargesSum + crprintList.deliverySumCharges);
			$("*[data-cr='consolidateEWaybillNumber']").html(crprintList.consolidateEWaybillNumber);

			if(crprintList.consignmentSummaryDeliveryToAddress != undefined)
				$("*[data-cr='deliveryBranchAdd']").html(crprintList.consignmentSummaryDeliveryToAddress);
			else
				$("*[data-cr='deliveryBranchAdd']").html("-");
			
			$("*[data-cr='deliveryBranchName']").html(crprintList.deliveryBranchName);
			$("*[data-cr='deliverySumCharges']").html(crprintList.deliverySumCharges);
			$("*[data-cr='grandTotal']").html(crprintList.grandTotal);
			$("*[data-cr='grandTotalInWordNew']").html(convertNumberToWord(crprintList.grandTotal));
			$("*[data-cr='grandTotalInWordDecimal']").html(convertNumberToWords(crprintList.grandTotal));
			$("*[data-cr='grandTotalRoundOf']").html(Math.round(crprintList.grandTotal));
			$("*[data-cr='deliveryTo']").html(crprintList.deliveredToName);
			$("*[data-cr='deliveryBy']").html(crprintList.settledByExecutive);
			$("*[data-cr='collectionPersonName']").html(crprintList.collectionPersonName);
			$("*[data-cr='deliveredToGodownName']").html(crprintList.deliveredToGodownName);
			$("*[data-cr='deliveredToGodownNumber']").html(crprintList.deliveredToGodownNumber);
			$("*[data-cr='deliveredToGodownAddress']").html(crprintList.deliveredToGodownAddress);
			$("*[data-cr='turNo']").html(crprintList.turNo);
			$("*[data-cr='lsvehicleNo']").html(crprintList.vehicleNo);
			$("*[data-cr='dataLoggerNumber']").html(crprintList.dataLoggerNumber);
			$("*[data-cr='insurancePolicyNumber']").html(crprintList.insurancePolicyNumber);
			$("*[data-cr='temperature']").html(crprintList.temperature);
			$("*[data-cr='connectivityTypeName']").html(crprintList.connectivityTypeName);
			$("*[data-cr='forwardTypeName']").html(crprintList.forwardTypeName);
			$("*[data-cr='declarationTypeName']").html(crprintList.declarationTypeName);
			$("*[data-cr='transportationModeName']").html(crprintList.transportationModeName);
																
			if(crprintList.tdsAmount > 0)
				$("*[data-cr='tdsAmount']").html(crprintList.tdsAmount);
			else
				$(".tdsAmount").hide();
			
			if(crprintList.consignmentSummaryDeliveryToAddress != undefined)
				$("*[data-cr='deliveryBranchAddWithSubString']").html(crprintList.consignmentSummaryDeliveryToAddress.substring(0,70));
			else
				$("*[data-cr='deliveryBranchAddWithSubString']").html(' ');
		
			if(configation.showDdmCreatedByIfCRSettledByNotPresent && crprintList.settledByExecutive == "--")
				$("*[data-cr='deliveryBy']").html(crprintList.ddmCreatedByExecutive);
			
			$("*[data-cr='deliveredToNumber']").html(crprintList.deliveredToNumber);
			$("*[data-cr='deliveredToNameWithNumber']").html((crprintList.deliveredToName)+ ' ('+crprintList.deliveredToNumber+')');
			$("*[data-cr='deliveryDiscount']").html(crprintList.deliveryDiscount);
			$("*[data-cr='currentDate']").html(responseOut.currentDate);
			$("*[data-cr='currentTime']").html(responseOut.currentTime);
			$("*[data-cr='bookingType']").html(crprintList.wayBillType);
			$("*[data-cr='declaredValue']").html(crprintList.consignmentSummaryDeclaredValue);
			$("*[data-cr='deliveryTotal']").html(crprintList.deliveryTotal);
			$("*[data-cr='deliveryTotalwithoutgst']").html(crprintList.deliveryTotal - crprintList.deliveryTimeTax );
			$("*[data-cr='deliveryTimeTax']").html(crprintList.deliveryTimeTax);
			$("*[data-cr='deliveryTimeTaxRoundOf']").html(Math.round(crprintList.deliveryTimeTax));
			$("*[data-cr='deliveryDisAmount']").html("-"+crprintList.deliveryDiscount);
		
			if(crprintList.deliveryTimeTax > 0)
				$("*[data-cr='deliveryTimeTax1']").html(crprintList.deliveryTimeTax);
			else
				$("*[data-cr='deliveryTimeTax1']").html(crprintList.deliveryTimeUnAddedTaxAmount);
			
			if(crprintList.deliveryDiscount > 0) {
				$("*[data-cr='deliveryDisAmount1']").html("-"+crprintList.deliveryDiscount);
				$("*[data-cr='deliveryDiscount']").html(crprintList.deliveryDiscount);
			} else {
				$("#dlydiscount").hide();
				$(".dlydiscounthide").hide();
			}
			
			if(crprintList.eWayBillStatus != null)
				$("*[data-cr='eWayBillStatus']").html(crprintList.eWayBillStatus);
			
			//for SNGT Case - start
			if(crprintList.deliveryTimeTax > 0)
				$(".servicetax").show();
			
			if(configation.isDeliveryDiscountShow && crprintList.deliveryDiscount > 0)
				$("#deliverydiscount").removeClass('hide');
			
			if(crprintList.chequeNumber != undefined && crprintList.chequeNumber != '')
				$("#chequeNo").removeClass('hide');
				
			$("*[data-cr='vehicleNumber']").html(crprintList.ddmVehicleNumber);
			$("*[data-cr='driverName']").html(crprintList.ddmDriverName);
			$("*[data-cr='privateMark']").html(crprintList.privateMark);
			$("*[data-cr='actualWeight']").html(crprintList.actualWeight);
			$("*[data-cr='chargeWeight']").html(crprintList.chargeWeight);
			$("*[data-cr='wayBillReceiveTimeString']").html(crprintList.wayBillReceiveTimeString);
			$("*[data-cr='invoiceNo']").html(crprintList.invoiceNo);
			$("*[data-cr='grandTotalInWord']").html(convertNumberToWord(crprintList.deliverySumCharges));
			$("*[data-cr='grandTotalInWord1']").html(convertNumberToWord(crprintList.grandTotal));
			$("*[data-cr='chequeNumber']").html(crprintList.chequeNumber);
			$("*[data-cr='remark']").html(crprintList.remark);
			$("*[data-cr='vehicleNo']").html(crprintList.vehicleNo);
			$("*[data-cr='bookingDatewithoutTime']").html(crprintList.bookingDate);
			$("*[data-cr='pkgNameWithQtynoBrace']").html(crprintList.quantity + ' ' + crprintList.packingTypeMasterName);
			$("*[data-cr='saidToContainList']").html(crprintList.saidToContain);
			$("*[data-cr='sourceBranchGSTN']").html(crprintList.sourceBranchGSTN);
			$("*[data-cr='deliveryBranchGSTN']").html(crprintList.deliveryBranchGSTN);
			
			if(crprintList.chequeDateStr != undefined && crprintList.chequeDateStr != '')
				$("*[data-cr='chequeDateStr']").html(crprintList.chequeDateStr);
			
			if(crprintList.ddmVehicleNumber != undefined)
				$("#withoutddm").remove();
			else
				$("#ddm").remove();
			
			$("*[data-cr='deliveryPaymentType']").html(crprintList.paymentTypeString);

			if(paymentType == PAYMENT_TYPE_CASH_ID || paymentType == PAYMENT_TYPE_ONLINE_RTGS_ID || paymentType == PAYMENT_TYPE_ONLINE_NEFT_ID) {
				$("*[data-cr='txnWiseEngb']").html(crprintList.paymentTypeString);
				$("#cheque").addClass("hide");
			} else if(paymentType == PAYMENT_TYPE_CHEQUE_ID)
				$("*[data-cr='txnWiseEngb']").html(crprintList.chequeNumber);
			else
				$("*[data-cr='txnWiseEngb']").html(" ");
			
			if(crprintList.remark != undefined && crprintList.remark != null)
				$("*[data-cr='remarkWithSubString']").html(crprintList.remark.substring(0, 29));
			else
				$("*[data-cr='remarkWithSubString']").html(' ');
			
			if(crprintList.bankName != undefined && crprintList.bankName != 'undefined')
				$("*[data-cr='bankName']").html(crprintList.bankName);
			
			let whitespace = /\S/;
			
			if(whitespace.test(crprintList.remark))
				$("*[data-cr='remark1']").html('('+crprintList.remark+')');
			else
				$("*[data-cr='remark1']").html('');
			
			if(crprintList.taxById == TAX_PAID_BY_CONSINGOR_ID || crprintList.taxById == TAX_PAID_BY_CONSINGEE_ID) {
				if(configation.showBranchGSTNByGSTPaidBy)
					$('.branchGSTN').css('display', 'none');
				
				$("*[data-cr='taxpaidby']").html(crprintList.taxPaidByName);
				$("*[data-cr='taxPaidBySSTPL']").html("YES");
			} else if(crprintList.taxById == TAX_PAID_BY_TRANSPORTER_ID){
				$("*[data-cr='taxpaidby']").html(crprintList.taxPaidByName);
				$("*[data-cr='taxPaidBySSTPL']").html("No");
			}
			
			if(crprintList.taxById == TAX_PAID_BY_EXEMPTED_ID)
				$("*[data-cr='taxPaidBySSTPL']").html("No/Exempted");

			
			$("*[data-cr='noofArticles']").html(crprintList.noOfArticle);
			$("*[data-consignmentRate='rate']").html(crprintList.weightRate);

			if(configation.removeInvoiceLable && crprintList.invoiceNo == '') {
				$("*[data-selector='invoiceNo']").remove();
				$("*[data-cr='invoiceNo']").remove();
			}
			
			if(crprintList.billSelectionId == BOOKING_WITHOUT_BILL) {
				$(".withbill").hide();
				$(".withoutbill").show();
				$('.BillCrTable').hide()
				$('.EstimateCrTable').show()
			} else {
				$(".withbill").show();
				$(".withoutbill").hide();
			}
			
			if(paymentType == PAYMENT_TYPE_CASH_ID || paymentType == PAYMENT_TYPE_CREDIT_ID || paymentType == PAYMENT_TYPE_BILL_CREDIT_ID) {
				$("*[data-cr='cashorcheque']").html(crprintList.paymentTypeString);
				$("#chequetwo").addClass("hide");
			} else {
				$("*[data-cr='cashorcheque']").html(crprintList.chequeNumber);
				$("#chequeone").addClass("hide");
			}
			
			if(paymentType == PAYMENT_TYPE_CASH_ID)
				$(".refnohide").hide();
			
			if(crprintList.collectionPersonName != undefined)
				$("*[data-cr='deliveryToOrCollectionPeron']").html(crprintList.collectionPersonName);
			else
				$("*[data-cr='deliveryToOrCollectionPeron']").html(crprintList.deliveredToName);
				
			// DDM CASE -->
			$("*[data-cr='deliveryPersonName']").html(crprintList.deliveredToPersonName);
			$("*[data-cr='deliveryPersonPhoneNumber']").html(crprintList.deliveredToPersonMobileNumber);
			
			if(wayBillTypeId == WAYBILL_TYPE_PAID) {
				$("*[data-cr='payerName']").html(crprintList.consignerName.replace(/ /g, "&nbsp;"));
				$("*[data-cr='grandTotalDLSE']").html(((crprintList.grandTotal)) - (crprintList.bookingChargesSum));
				$("*[data-cr='payerGstn']").html(crprintList.consignorGstnNumber);
			} else if(wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
				$("*[data-cr='payerName']").html(crprintList.consigneeName.replace(/ /g, "&nbsp;"));
				$("*[data-cr='grandTotalDLSE']").html(crprintList.grandTotal);
				$("*[data-cr='payerGstn']").html(crprintList.consigneeGstnNumber);
			} else if(wayBillTypeId == WAYBILL_TYPE_CREDIT) {
				$("*[data-cr='payerName']").html(crprintList.corporateAccountName.replace(/ /g, "&nbsp;"));
				$("*[data-cr='grandTotalDLSE']").html(crprintList.grandTotal);
				$("*[data-cr='payerGstn']").html(crprintList.corporateAccountGstin);
			}
			 
			if(wayBillTypeId == WAYBILL_TYPE_PAID || wayBillTypeId == WAYBILL_TYPE_CREDIT)
				$(".hideRoundOff").hide();
				
			if(wayBillTypeId == WAYBILL_TYPE_CREDIT)	
				$("*[data-label='crLabel']").html('Delivery Note/CR');
			
			for (var i = 1; i <= 4; i++) {
				if (document.getElementById("barcode" + i)) {
					var qrcode1 = new QRCode(document.getElementById("barcode" + i), {
						width: config.QrCodeHeight,
						height: config.QrCodeWidth
					});

					qrcode1.makeCode(responseOut.wayBillId + "~" + responseOut.wayBillNumber + "~" + QR_CODE_USING_WAYBILL_NUMBER + "~" + 0);
				}
			}
				
		}, setDeliveryCharges : function(wayBillDlyCharges, configation, responseOut) {
			var classNameofName		= $("*[data-chargename='dynamic']").attr('class');
			var classNameofVal		= $("*[data-chargevalue='dynamic']").attr('class');
			var crprintList			= responseOut.crprintlist;
			var wayBillTypeId		= crprintList.wayBillTypeId;
			
			var tbody = $("*[data-chargevalue='dynamic']").parent().parent();
			if(configation.dynamicChargesOnTd) {
				var newtr = $("<tr/>")
				for(var index in wayBillDlyCharges){

					var newtdChargename = $("<td></td>");
					newtdChargename.attr("class",classNameofName);
					newtdChargename.attr("data-selector",'chargeName'+wayBillDlyCharges[index].wayBillChargeMasterId);

					newtr.append(newtdChargename);

					var newtdChargeVal = $("<td></td>");
					newtdChargeVal.attr("class",classNameofVal);
					newtdChargeVal.attr("data-selector",'chargeValue'+wayBillDlyCharges[index].wayBillChargeMasterId);
					newtr.append(newtdChargeVal);

					$(tbody).before(newtr);
				}
			} else {
				if (configation.hideChargesForTBB) {
					if (crprintList.wayBillTypeId == WAYBILL_TYPE_PAID || crprintList.wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
						for (var index in wayBillDlyCharges) {

							var newtr = $("<tr/>")
							var newtdChargename = $("<td></td>");
							newtdChargename.attr("class", classNameofName);
							newtdChargename.attr("data-selector", 'chargeName' + wayBillDlyCharges[index].wayBillChargeMasterId);

							newtr.append(newtdChargename);

							var newtdChargeVal = $("<td></td>");
							newtdChargeVal.attr("class", classNameofVal);
							newtdChargeVal.attr("data-selector", 'chargeValue' + wayBillDlyCharges[index].wayBillChargeMasterId);
							newtr.append(newtdChargeVal);

							$(tbody).before(newtr);
						}
					}
				} else {
					for(var index in wayBillDlyCharges) {
						var newtr = $("<tr/>")
						var newtdChargename = $("<td></td>");
						newtdChargename.attr("class",classNameofName);
						newtdChargename.attr("data-selector",'chargeName'+wayBillDlyCharges[index].wayBillChargeMasterId);
	
						newtr.append(newtdChargename);
	
						var newtdChargeVal = $("<td></td>");
						newtdChargeVal.attr("class",classNameofVal);
						newtdChargeVal.attr("data-selector",'chargeValue'+wayBillDlyCharges[index].wayBillChargeMasterId);
						newtr.append(newtdChargeVal);
	
						$(tbody).before(newtr);
					}	
				}
			}

			for(var index in wayBillDlyCharges){
				$("*[data-selector = 'chargeName"+wayBillDlyCharges[index].wayBillChargeMasterId+"']").html(wayBillDlyCharges[index].chargeTypeMasterName);
				$("*[data-selector = 'chargeValue"+wayBillDlyCharges[index].wayBillChargeMasterId+"']").html(wayBillDlyCharges[index].wayBillDeliverychargeAmount);
				
				if(wayBillDlyCharges[index].wayBillDeliverychargeAmount > 0) {
					if(wayBillDlyCharges[index].wayBillChargeMasterId == UNLOADING)
						$(".unloadingChargeSection").show();
					else if(wayBillDlyCharges[index].wayBillChargeMasterId == DAMERAGE)
						$(".demurrageChargeSection").show();
				}
			}
			
			var totalDeliveryCharges = 0;

			for(var index in wayBillDlyCharges) {
				totalDeliveryCharges = totalDeliveryCharges + wayBillDlyCharges[index].wayBillDeliverychargeAmount;
				
				if(wayBillDlyCharges[index].wayBillChargeMasterId == OCTROI_DELIVERY)
					totalDeliveryCharges = totalDeliveryCharges - wayBillDlyCharges[index].wayBillDeliverychargeAmount;
				
				if(wayBillDlyCharges[index].wayBillChargeMasterId == DELIVERY_GIC)
					totalDeliveryCharges = totalDeliveryCharges - wayBillDlyCharges[index].wayBillDeliverychargeAmount;
			}
			
			let deliveryChargesWithoutDiscount	= crprintList.deliverySumCharges - crprintList.deliveryDiscount;

			// For GLDTS 
			if(wayBillTypeId == WAYBILL_TYPE_PAID) {
				$("*[data-cr='grandTotalgldts']").html(Math.round(deliveryChargesWithoutDiscount));
				$("*[data-cr='grandTotalInWordgldts']").html(convertNumberToWord(Math.round(deliveryChargesWithoutDiscount)));
			} else {
				$("*[data-cr='grandTotalgldts']").html(Math.round(crprintList.grandTotal));
				$("*[data-cr='grandTotalInWordgldts']").html(convertNumberToWord(Math.round(crprintList.grandTotal)));
			}
			
			if(wayBillTypeId == WAYBILL_TYPE_PAID || wayBillTypeId == WAYBILL_TYPE_CREDIT || wayBillTypeId == WAYBILL_TYPE_FOC) {
				$("*[data-selector='totalDeliveryCharges']").html(totalDeliveryCharges);
				$("*[data-cr='grandTotalsre']").html(crprintList.deliverySumCharges);
				$("*[data-cr='igst5perGrandTotal']").html((crprintList.deliverySumCharges* 0.05).toFixed(2));
				$("*[data-cr='grandTotalshahul']").html(crprintList.bookingChargesSum - crprintList.deliveryDiscount);
				$("*[data-cr='grandTotalkcm']").html(crprintList.deliverySumCharges + Math.round(crprintList.deliveryTimeTax));
				$("*[data-cr='grandTotalmlt']").html(deliveryChargesWithoutDiscount);
				$("*[data-cr='grandtotalInWordmlt']").html(convertNumberToWord(deliveryChargesWithoutDiscount));
				$("*[data-cr='grandTotalmahesh']").html(deliveryChargesWithoutDiscount + crprintList.bookingChargesSum);
				$("*[data-cr='bookingTotalMahesh']").html(crprintList.bookingChargesSum);
				$("*[data-cr='bookingTotalInFreightGirnar']").html(0);
				$("*[data-cr='grandTotalGirnar']").html(deliveryChargesWithoutDiscount + Math.round(crprintList.deliveryTimeGst));
				$("*[data-cr='grandTotalsreInWord']").html(convertNumberToWord(crprintList.deliverySumCharges));

				if(crprintList.paymentType == PAYMENT_TYPE_CASH_ID)
					$("*[data-cr='txnWiseEngbAndTotal']").html('<b>Cash :</b> '+ crprintList.deliverySumCharges);
				else
					$("*[data-cr='txnWiseEngbAndTotal']").html('<b>Chq No:</b>' + crprintList.chequeNumber + "/");
			} else if(wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
				totalDeliveryCharges = totalDeliveryCharges + crprintList.bookingChargesSum;
				let totalLRAmount	= crprintList.deliverySumCharges + crprintList.bookingChargesSum;
					
				$("*[data-selector='totalDeliveryCharges']").html(totalDeliveryCharges);
				$("*[data-cr='bookingTotalInFreightGirnar']").html(crprintList.bookingChargesSum);
				$("*[data-cr='grandTotalGirnar']").html(deliveryChargesWithoutDiscount + crprintList.bookingChargesSum +  Math.round(crprintList.deliveryTimeGst));
				// $("*[data-selector='totalDeliveryChargesWithTds']").html(totalDeliveryCharges-crprintList.tdsAmount);
				$("*[data-cr='grandTotalsre']").html(totalLRAmount);
				$("*[data-cr='igst5perGrandTotal']").html((totalLRAmount * 0.05).toFixed(2));
				$("*[data-cr='grandTotalmlt']").html(totalLRAmount - crprintList.deliveryDiscount);
				$("*[data-cr='grandTotalkcm']").html(totalLRAmount + Math.round(crprintList.deliveryTimeTax));
				$("*[data-cr='grandtotalInWordmlt']").html(convertNumberToWord(totalLRAmount - crprintList.deliveryDiscount));
				$("*[data-cr='grandTotalshahul']").html(crprintList.bookingChargesSum - crprintList.deliveryDiscount);
				$("*[data-cr='grandTotalsreInWord']").html(convertNumberToWord(totalLRAmount));

				if(crprintList.paymentType == PAYMENT_TYPE_CASH_ID)
					$("*[data-cr='txnWiseEngbAndTotal']").html('<b>Cash : </b>'+ crprintList.deliverySumCharges + crprintList.bookingChargesSum);
				else
					$("*[data-cr='txnWiseEngbAndTotal']").html('<b>Chq No : </b>' + crprintList.chequeNumber +"/ ");
			}
			
			var deliveryGrandTotal = totalDeliveryCharges + crprintList.deliveryTimeGst;
			
			if(crprintList.deliveryDiscount > 0 && (wayBillTypeId == WAYBILL_TYPE_TO_PAY || wayBillTypeId == WAYBILL_TYPE_PAID)) {
				$(".dlydiscount").show();
				var dlyDisc = crprintList.deliveryDiscount;
				$("*[data-cr='deliveryDisscount']").html(dlyDisc);
			} else
				$(".dlydiscount").hide();
			
			if(crprintList.deliveryDiscount > 0) {
				$(".dlydisamnt").show();
				var dlyDisc = crprintList.deliveryDiscount;
				$("*[data-cr='deliveryDisAmnt']").html(dlyDisc);
				totalDeliveryCharges = totalDeliveryCharges - dlyDisc;
				
				deliveryGrandTotal	 = deliveryGrandTotal - dlyDisc;
				$("*[data-selector='totalDeliveryCharges']").html(totalDeliveryCharges);
			} else
				$(".dlydisamnt").hide();
			
			$("*[data-selector='totalDeliveryChargesWithTds']").html(totalDeliveryCharges-crprintList.tdsAmount);
			
			$("*[data-selector='deliveryGrandTotal']").html(deliveryGrandTotal);			
			$("*[data-selector='deliveryGrandTotalwithoutdiscount']").html(deliveryGrandTotal - crprintList.deliveryDiscount);	
			$("*[data-selector='deliveryGrandTotalInWords']").html(convertNumberToWord(Math.round(deliveryGrandTotal)));
			$("*[data-selector='deliveryGrandTotalwithoutdiscountInword']").html(convertNumberToWord(Math.round(deliveryGrandTotal - crprintList.deliveryDiscount)));
				
			if(deliveryGrandTotal == 0)
				$("*[data-selector='deliveryGrandTotalInWords']").html("Zero");
			
			if(configation.removeStaticChargesWithZeroAmt) {
				$("#chargesTable tbody tr").each(function() {
					var trToRemove	= $(this).closest('tr');
					// Within tr we find the last td child element and get
					// content
					var value	=	$(this).find("td:last-child").html();
					
					if(value !='' && value != undefined && value == 0)
						trToRemove.remove();
				});
			}
			

			$("*[data-chargevalue='dynamic']").parent().remove()
		}, setBookingCharges : function(wayBillBkgCharges, configation, responseOut) {
			var crprintList					= responseOut.crprintlist;
			var wayBillTypeId				= crprintList.wayBillTypeId;
			var showBookingChargesOnToPay	= configation.showBookingChargesOnToPay;
			
			$(".freightChargeSection").hide();
			$(".loadingChargeSection").hide();
			$(".doordeliveryChargeSection").hide();
			$(".labourChargeSection").hide();
			$(".codDodChargeSection").hide();
			$(".fovChargeSection").hide();
			$(".otherBkgChargeSection").hide();
			$(".stChargeSection").hide();
			$(".gstSelection").hide();
			$(".emptyCell").hide();
			$("*[data-cr='bookingcharges']").html(crprintList.bookingChargesSum);
			
			if(wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
				$("*[data-cr='bookingTotalwithoutPaidHamali']").html(crprintList.bookingChargesSum);
				$("*[data-cr='grandTotalwithoutPaidHamali']").html(crprintList.grandTotal);
				$('.bookingchargesSc').removeClass('hide');
				$("*[data-cr='grandTotalmahesh']").html(crprintList.deliverySumCharges + crprintList.bookingChargesSum - crprintList.deliveryDiscount);
				$("*[data-cr='bookingTotalMahesh']").html(crprintList.bookingChargesSum);
			}	
			
			$("*[data-cr='deliveryAmount1']").html(crprintList.deliveryTotal);
			$("*[data-cr='bookingTotalnew1']").html(crprintList.bookingChargesSum);
			$("*[data-cr='deliveryTimeTax']").html(crprintList.deliveryTimeTax);
			$("*[data-cr='BookingGrandTotal']").html(crprintList.grandTotal);
			
			let deliveryChargesWithoutDiscount	= crprintList.deliverySumCharges - crprintList.deliveryDiscount;
			
			if(wayBillTypeId == WAYBILL_TYPE_PAID) {
				$("*[data-cr='grandTotalAsheesh']").html(crprintList.deliveryTotal);				
				$("*[data-cr='bookingTotalAsheesh']").html(0);
				$("*[data-cr='bookingTotalTIL']").html(0);
				$("*[data-cr='grandTotalTIL']").html(deliveryChargesWithoutDiscount);
				$("*[data-cr='grandtotalInWordTIL']").html(convertNumberToWord(deliveryChargesWithoutDiscount));
				$("*[data-cr='bookingTotalMGLLP']").html("PAID");
				$("*[data-cr='grandTotalAsheeshInWord']").html(convertNumberToWord(Math.round(crprintList.deliveryTotal)) + '&nbsp;Only');
				$("*[data-cr='bookingTotalnewforndtc']").html(0);
				$("*[data-cr='grandTotal2']").html(crprintList.deliveryTotal);
			} else if(wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
				$("*[data-cr='grandTotalAsheesh']").html(Math.round(crprintList.grandTotal));
				$("*[data-cr='bookingTotalAsheesh']").html(Math.round(crprintList.bookingChargesSum));
				$("*[data-cr='bookingTotalTIL']").html(Math.round(crprintList.bookingChargesSum));
				$("*[data-cr='bookingTotalMGLLP']").html(Math.round(crprintList.bookingChargesSum));
				$("*[data-cr='grandTotalTIL']").html((crprintList.deliverySumCharges + crprintList.bookingChargesSum) - crprintList.deliveryDiscount);
				$("*[data-cr='grandtotalInWordTIL']").html(convertNumberToWord((crprintList.deliverySumCharges + crprintList.bookingChargesSum) - crprintList.deliveryDiscount));
				
			
				var roundOff = (Math.round(crprintList.grandTotal) - (crprintList.bookingChargesSum	 + deliveryChargesWithoutDiscount)).toFixed(2);
			
				if(roundOff > 0)
					$("*[data-cr='grandTotalAsheeshRoundOff']").html("+"+roundOff);
				else if(roundOff <0)
					$("*[data-cr='grandTotalAsheeshRoundOff']").html(""+roundOff);
				else
					$("*[data-cr='grandTotalAsheeshRoundOff']").html("0.00");
			
				$("*[data-cr='grandTotalAsheeshInWord']").html(convertNumberToWord(Math.round(crprintList.grandTotal))+'&nbsp; Only');
				$("*[data-cr='grandTotalKlcrg']").html(crprintList.deliveryTotal);
				$(".chargesForKlcrgzero").hide();
				$("*[data-cr='bookingTotalnewforndtc']").html(crprintList.bookingChargesSum);
				$("*[data-cr='grandTotal2']").html(crprintList.grandTotal);
			} else if(wayBillTypeId == WAYBILL_TYPE_CREDIT) {	
				$("*[data-cr='grandTotalAsheesh']").html("TBB");
				$("*[data-cr='bookingTotalAsheesh']").html("TBB");
				$("*[data-cr='bookingTotalTIL']").html(Math.round(crprintList.bookingChargesSum));
				$("*[data-cr='grandTotalTIL']").html((crprintList.deliverySumCharges + crprintList.bookingChargesSum) - crprintList.deliveryDiscount);
				$("*[data-cr='grandtotalInWordTIL']").html(convertNumberToWord((crprintList.deliverySumCharges + crprintList.bookingChargesSum) - crprintList.deliveryDiscount));
				$("*[data-cr='bookingTotalMGLLP']").html("TBB");
				$("*[data-cr='grandTotalAsheeshInWord']").html("TBB");
				$("*[data-cr='grandTotalKlcrg']").html("credit");
				$(".chargesForKlcrg").hide();
				$(".chargesForKlcrgzero").show();
				$("*[data-cr='bookingTotalnewforndtc']").html(0);
				$("*[data-cr='grandTotal2']").html(crprintList.grandTotal);
			}
			if(wayBillTypeId == WAYBILL_TYPE_TO_PAY || (wayBillTypeId == WAYBILL_TYPE_CREDIT && crprintList.paymentType == PAYMENT_TYPE_BILL_CREDIT_ID)) {
				$("*[data-cr='bookingTotalBillCredit']").html(Math.round(crprintList.bookingChargesSum));
				$("*[data-cr='grandDeliveryTotal']").html(Math.round(crprintList.grandTotal))
			} else if(wayBillTypeId == WAYBILL_TYPE_CREDIT || wayBillTypeId == WAYBILL_TYPE_PAID) {
				$("*[data-cr='bookingTotalBillCredit']").html(0);
				$("*[data-cr='grandDeliveryTotal']").html(Math.round(crprintList.deliveryTotal))
			}
			
			if(wayBillTypeId == WAYBILL_TYPE_PAID || wayBillTypeId == WAYBILL_TYPE_CREDIT) {
				$("*[data-cr='bookingTotalnew']").html(0);
				$("*[data-cr='bookingTotalRoundOff']").html(0);
				$("*[data-cr='grandTotal1']").html(crprintList.deliveryTotal);
				$("*[data-cr='grandTotalroundof']").html(Math.round(crprintList.deliveryTotal));
				$("*[data-cr='grandTotalWithTDS']").html(Math.round(crprintList.deliveryTotal - crprintList.tdsAmount));
				$("*[data-cr='grandTotalforkxcpl']").html(crprintList.deliveryTotal + crprintList.deliveryDiscount);
				$("*[data-cr='grandTotalInWordforkxcpl']").html(convertNumberToWord((deliveryChargesWithoutDiscount)));
				$("*[data-cr='grandTotalInWordforkl']").html(convertNumberToWord(Math.round(crprintList.deliveryTotal)));
			} else {
				$("*[data-cr='bookingTotalnew']").html(Math.round(crprintList.bookingChargesSum));
				$("*[data-cr='bookingTotalRoundOff']").html(crprintList.bookingChargesSum);
				$("*[data-cr='grandTotal1']").html(crprintList.grandTotal);
				$("*[data-cr='grandTotalroundof']").html(Math.round(crprintList.grandTotal));
				$("*[data-cr='grandTotalWithTDS']").html(Math.round(crprintList.grandTotal - crprintList.tdsAmount ));
				$("*[data-cr='grandTotalforkxcpl']").html(crprintList.grandTotal + crprintList.deliveryDiscount);
				$("*[data-cr='grandTotalInWordforkxcpl']").html(convertNumberToWord(crprintList.grandTotal - crprintList.tdsAmount));
				$("*[data-cr='grandTotalInWordforkl']").html(convertNumberToWord(Math.round(crprintList.grandTotal)));
			}

			$("[data-cr='grandTotalBalaji'").html(crprintList.bookingChargesSum + crprintList.deliveryTotal)

			for(var index in wayBillBkgCharges) {
				$("*[data-selector='chargeName"+wayBillBkgCharges[index].chargeTypeMasterId+"']").html(wayBillBkgCharges[index].chargeTypeMasterName);
				$("*[data-selector='chargeValue"+wayBillBkgCharges[index].chargeTypeMasterId+"']").html(wayBillBkgCharges[index].wayBillBookingChargeChargeAmount);
				
				if(wayBillBkgCharges[index].chargeTypeMasterId == FREIGHT) {
					$("*[data-cr='bookingTotalMcargo']").html(wayBillBkgCharges[index].wayBillBookingChargeChargeAmount);
					$("*[data-cr='grandTotalMcargo']").html(wayBillBkgCharges[index].wayBillBookingChargeChargeAmount);
				}
				
				if(wayBillBkgCharges[index].chargeTypeMasterId == FREIGHT && wayBillTypeId == WAYBILL_TYPE_TO_PAY)
					$("*[data-cr='bookingTotalKonduskar']").html(wayBillBkgCharges[index].wayBillBookingChargeChargeAmount);
			  
				if(showBookingChargesOnToPay && wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
					$(".emptyCell").show();
					if(wayBillBkgCharges[index].chargeTypeMasterId == FREIGHT)
						$(".freightChargeSection").show();
					else if(wayBillBkgCharges[index].chargeTypeMasterId == LC)
						$(".loadingChargeSection").show();
					else if(wayBillBkgCharges[index].chargeTypeMasterId == DD)
						$(".doordeliveryChargeSection").show();
					else if(wayBillBkgCharges[index].chargeTypeMasterId == LABOUR)
						$(".labourChargeSection").show();
					else if(wayBillBkgCharges[index].chargeTypeMasterId == COD_DOD)
						$(".codDodChargeSection").show();
					else if(wayBillBkgCharges[index].chargeTypeMasterId == FOV)
						$(".fovChargeSection").show();
					else if(wayBillBkgCharges[index].chargeTypeMasterId == OTHER_BOOKING)
						$(".otherBkgChargeSection").show();
					else if(wayBillBkgCharges[index].chargeTypeMasterId == ST_CHARGE_BOOKING)
						$(".stChargeSection").show();
				}
				
				if(wayBillBkgCharges[index].chargeTypeMasterId == FREIGHT && wayBillTypeId == WAYBILL_TYPE_CREDIT)
					$("*[data-cr='totalFreightCharge']").html(wayBillBkgCharges[index].wayBillBookingChargeChargeAmount);
				else if(wayBillTypeId == WAYBILL_TYPE_PAID || wayBillTypeId == WAYBILL_TYPE_TO_PAY)
					$("*[data-cr='totalFreightCharge']").html(crprintList.bookingChargesSum);
		  
				if(wayBillTypeId == WAYBILL_TYPE_TO_PAY && wayBillBkgCharges[index].chargeTypeMasterId == PAID_HAMALI && wayBillBkgCharges[index].wayBillBookingChargeChargeAmount > 0) {
					$("*[data-cr='bookingTotalMahesh']").html(crprintList.bookingChargesSum - wayBillBkgCharges[index].wayBillBookingChargeChargeAmount);
					$("*[data-cr='bookingTotalwithoutPaidHamali']").html(crprintList.bookingChargesSum - wayBillBkgCharges[index].wayBillBookingChargeChargeAmount);
					$("*[data-cr='grandTotalwithoutPaidHamali']").html(crprintList.grandTotal - wayBillBkgCharges[index].wayBillBookingChargeChargeAmount);
					$("*[data-cr='grandTotalmahesh']").html(crprintList.grandTotal - wayBillBkgCharges[index].wayBillBookingChargeChargeAmount);
				}
			}
			
			if(wayBillTypeId == WAYBILL_TYPE_TO_PAY)
				$("*[data-selector='freightCharge']").html(crprintList.bookingChargesSum);
			else {
				$("*[data-selector='freightCharge']").html(0);
				$('.freightChargeReplaceWithZero').html(0);
			}
			
			if(wayBillTypeId == WAYBILL_TYPE_PAID){
				$("*[data-cr='bookingcharges1']").html('0');
				$("*[data-cr='grandTotalmlTbb']").html(deliveryChargesWithoutDiscount);
				$(".showTableMlt").hide();
			}
			else{
				$("*[data-cr='bookingcharges1']").html(crprintList.bookingChargesSum);
				$("*[data-cr='grandTotalmlTbb']").html(deliveryChargesWithoutDiscount + crprintList.bookingChargesSum);
				$(".showTableMlt").show();
			}
				
				
			var classNameofName		= $("*[data-Bookingchargename='dynamic']").attr('class');
			var classNameofVal		= $("*[data-Bookingchargevalue='dynamic']").attr('class');
			
			var tbody = $("*[data-Bookingchargevalue='dynamic']").parent().parent();	
			
			for (var index in wayBillBkgCharges) {
				var newtr = $("<tr/>")
				var newtdChargename = $("<td></td>");
				newtdChargename.attr("class", classNameofName);
				newtdChargename.attr("data-selector", 'chargeName' + wayBillBkgCharges[index].wayBillBookingChargesId);

				newtr.append(newtdChargename);

				var newtdChargeVal = $("<td></td>");
				newtdChargeVal.attr("class", classNameofVal);
				newtdChargeVal.attr("data-selector", 'chargeValue' + wayBillBkgCharges[index].wayBillBookingChargesId);
				newtr.append(newtdChargeVal);

				$(tbody).before(newtr);
			}
				
			for(var index in wayBillBkgCharges){
				$("*[data-selector = 'chargeName"+wayBillBkgCharges[index].wayBillBookingChargesId+"']").html(wayBillBkgCharges[index].chargeTypeMasterName);
				$("*[data-selector = 'chargeValue"+wayBillBkgCharges[index].wayBillBookingChargesId+"']").html(wayBillBkgCharges[index].wayBillBookingChargeChargeAmount);
			}	
				
			$("*[data-Bookingchargevalue='dynamic']").parent().remove()
			
			if(wayBillTypeId != WAYBILL_TYPE_TO_PAY) {
					$('.showZeroCharge').html(0)
			}else if(wayBillTypeId != WAYBILL_TYPE_TO_PAY && wayBillTypeId != WAYBILL_TYPE_CREDIT){
					$('.showZeroForPaidFoc').html(0)
			}

		}, setConsignment : function(responseOut) {
			var crprintList				= responseOut.crprintlist;
			var showQuantity			= false;
			var showPackingType			= false;
			var showSaidToContain		= false;
			var showSeperater			= false;
			var consignmentArr				= responseOut.consignmentMap;
			var classNameofQty				= $("*[data-consignmentquantity='dynamic']").attr('class');
			var classNameofPackingType		= $("*[data-consignmentpackingtype='dynamic']").attr('class');
			var classNameofSeperator		= $("*[data-consignmentseperator='dynamic']").attr('class');
			var classNameofSaidToContain	= $("*[data-consignmentsaidtocontain='dynamic']").attr('class');

			$("*[data-consignmentquantity='dynamic']").each(function(){
				showQuantity			= true;
			});

			$("*[data-consignmentpackingtype='dynamic']").each(function(){
				showPackingType			= true;
			});

			$("*[data-consignmentseperator='dynamic']").each(function(){
				showSeperater		= true;
			})

			$("*[data-consignmentsaidtocontain='dynamic']").each(function(){
				showSaidToContain = true;
			});

			var tbody = $("*[data-consignmentquantity='dynamic']").parent().parent();

			for(var index in consignmentArr){
				var newtr = $("<tr/>")

				if(showQuantity){
					var newtdQuantity = $("<td></td>");
					newtdQuantity.attr("class",classNameofQty);
					newtdQuantity.attr("data-selector",'qty'+consignmentArr[index].consignmentDetailsId);					
					newtr.append(newtdQuantity);
				}

				if(showPackingType){
					var newtdPackingType = $("<td></td>");
					newtdPackingType.attr("class",classNameofPackingType);
					newtdPackingType.attr("data-selector",'packingtype'+consignmentArr[index].consignmentDetailsId);
					newtr.append(newtdPackingType);
				}

				if(showSeperater){
					var newtdSeperator = $("<td></td>");
					newtdSeperator.attr("class",classNameofSeperator);
					newtdSeperator.attr("data-selector",'seperator');
					newtr.append(newtdSeperator);
				}

				if(showSaidToContain){
					var newtdSaidToContain = $("<td></td>");
					newtdSaidToContain.attr("class",classNameofSaidToContain);
					newtdSaidToContain.attr("data-selector",'saidToCOntain'+consignmentArr[index].consignmentDetailsId);
					newtr.append(newtdSaidToContain);
				}

				$(tbody).before(newtr);
			}
		
			for(var index in consignmentArr) {
				var pos 				= Number(index) + Number(1);
				
				$("*[data-consignmentquantityData='"+index+"']").html(consignmentArr[index].quantity);
				$("*[data-consignmentpackingtypeData='"+index+"']").html(consignmentArr[index].packingTypeName);
				$("*[data-consignmentsaidtocontainData='"+index+"']").html(consignmentArr[index].saidToContain);
				$("*[data-consignmentAmount='"+index+"']").html(consignmentArr[index].amount);
				
				if (consignmentArr[index].length > 0 || consignmentArr[index].breadth > 0 || consignmentArr[index].height > 0) {
					$("*[data-consignmentcftlength='" + (pos) + "']").html(consignmentArr[index].length);
					$("*[data-consignmentcftbreadth='" + (pos) + "']").html(consignmentArr[index].breadth);
					$("*[data-consignmentcftheight='" + (pos) + "']").html(consignmentArr[index].height);
				}
				
				if(crprintList.chargeTypeId == CHARGETYPE_ID_QUANTITY)
					$("*[data-consignmentRate='"+index+"']").html(consignmentArr[index].articleRate);
				else if(crprintList.chargeTypeId == CHARGETYPE_ID_WEIGHT)
					$("*[data-consignmentRate='1']").html(consignmentArr[index].weightRate);
				else
					$("*[data-consignmentRate='1']").html("0");
				
				$("*[data-consignmentseperatorData='"+index+"']").html("of");				
				$("*[data-selector='qty"+consignmentArr[index].consignmentDetailsId+"']").html(consignmentArr[index].quantity);
				$("*[data-selector='packingtype"+consignmentArr[index].consignmentDetailsId+"']").html(consignmentArr[index].packingTypeName);
				$("*[data-selector='saidToCOntain"+consignmentArr[index].consignmentDetailsId+"']").html(consignmentArr[index].saidToContain);
			}

			this.setPackingTypeName(consignmentArr)
			this.setPackingTypeNameWithQuantity(consignmentArr)
		}, setExecutiveDetails : function(responseOut) {
			$("*[data-executive='name'").html(responseOut.executiveName);
		}, setCurrentDateTime : function(responseOut) {
			$("*[data-time='current'").html(responseOut.currentTime);
		}, setPackingTypeName : function(consignmentArr) {
			var article = null;
			for(var index in consignmentArr){
				if(article != null){		  
					article = article + consignmentArr[index].packingTypeName;
				}	else {
					article = consignmentArr[index].packingTypeName;		  
				}
				if(index < consignmentArr.length-1)
					article = article + ", ";
			}
			$("*[data-lr='packingTypeName']").html(article);
			
		}, setPackingTypeNameWithQuantity : function(consignmentArr) {
			var article = null;
			var packing = '';
			var saidToContain = '';
			
			for(var index = 0; index < consignmentArr.length; index++) {
				if(article != null)	  
					article = article + consignmentArr[index].quantity + " "+ consignmentArr[index].packingTypeName;
				else
					article = consignmentArr[index].quantity + " " + consignmentArr[index].packingTypeName;		  

				packing			= packing + consignmentArr[index].packingTypeName;
				saidToContain	= saidToContain + consignmentArr[index].saidToContain;
				
				if(index < consignmentArr.length - 1) {
					article = article + ", ";
					packing = packing + " , ";
					saidToContain = saidToContain + " , ";
				}
			}

			$("*[data-lr='pkgNameWithQty']").html("( " +article+" )");
			$("*[data-lr='pkgNameWithQtynoBrace']").html(article);
			$("*[data-lr='QtyWithpkgName']").html("("+packing+")");
			$("*[data-cr='saidtocontainlist']").html(saidToContain);
			$("*[data-lr='pkgNameJAP']").html(packing);
			
		}, disableRightClick:  function (){
			var message="Function Disabled!"; 
			function clickIE4(){ if (event.button==2){ alert(message); return false; } } 
			function clickNS4(e){ if (document.layers||document.getElementById&&!document.all){ if (e.which==2||e.which==3){ alert(message); return false; } } } if (document.layers){ document.captureEvents(Event.MOUSEDOWN); document.onmousedown=clickNS4; } else if (document.all&&!document.getElementById){ document.onmousedown=clickIE4; } document.oncontextmenu=new Function("alert(message);return false") ;
		}, setDataOnWayBillType: function(responseOut) {
			var crprintList						= responseOut.crprintlist;
			var configation						= responseOut.configuration;
			var wayBillTypeId					= crprintList.wayBillTypeId;
			var isDisplayWayBillTypeWiseData	= configation.isDisplayWayBillTypeWiseData;
			
			let deliveryChargesWithoutDiscount	= crprintList.deliverySumCharges - crprintList.deliveryDiscount;
			
			if(isDisplayWayBillTypeWiseData) {
				if(wayBillTypeId == WAYBILL_TYPE_PAID || wayBillTypeId == WAYBILL_TYPE_CREDIT) {
					if(configation.removeBookingTotalAmtEffect) {
						$("*[data-selector='bookingTotal']").remove();
						$("*[data-cr='bookingTotal']").remove();
						$("*[data-cr='bookngTotal']").html('0');
						$("*[data-cr='bookingTotalwithoutPaidHamali']").remove();
						$("*[data-cr='grandTotal']").html(((crprintList.deliverySumCharges)) - (crprintList.deliveryDiscount));
						
						if(crprintList.paymentType == PAYMENT_TYPE_BILL_CREDIT_ID) {
							$(".bookingTotalForNR").removeClass('hide');
							$("*[data-cr='bookngTotalForNR']").html(crprintList.bookingChargesSum);
							$("*[data-selector='bookngTotalForNR']").html("Booking Total");
							$("*[data-selector='grandTotalForNR']").html("Grand Total");
							$("*[data-selector='grandTotalForNRAmt']").html(Math.round(crprintList.grandTotal));
							$(".grandTotalsForNR").addClass('hide');
						}
					}
					
					$("*[data-cr='grandTotalndt']").html(((crprintList.deliverySumCharges)) - (crprintList.deliveryDiscount));
					$("*[data-cr='grandTotalwithoutPaidHamali']").html(((crprintList.deliverySumCharges)) - (crprintList.deliveryDiscount));
					$("*[data-cr='grandtotalscc']").html(crprintList.deliverySumCharges);
					$("*[data-cr='grandtotalhtc']").html(crprintList.deliverySumCharges);
					$("*[data-cr='grandtotalInWordscc']").html(convertNumberToWord(crprintList.deliverySumCharges));
					$("*[data-cr='grandtotalWithGst']").html(((crprintList.deliverySumCharges) - (crprintList.deliveryDiscount) + (crprintList.deliveryTimeTax)));
					$("*[data-cr='grandtotalInWordggs']").html(convertNumberToWord((crprintList.deliverySumCharges - crprintList.tdsAmount) - (crprintList.deliveryDiscount)));
				} else {
					$("*[data-cr='bookingTotal1']").html(crprintList.bookingChargesSum);
					$("*[data-cr='grandTotalndt']").html(crprintList.grandTotal);
					$("*[data-cr='grandtotalscc']").html(((crprintList.deliverySumCharges)) + (crprintList.bookingChargesSum));
					$("*[data-cr='grandtotalInWordscc']").html(convertNumberToWord(crprintList.deliverySumCharges +crprintList.bookingChargesSum));
					$("*[data-cr='grandtotalWithGst']").html(crprintList.grandTotal);
					$("*[data-cr='grandtotalhtc']").html(crprintList.grandTotal);
					$("*[data-cr='bookngTotal']").html(crprintList.bookingChargesSum);
					$("*[data-cr='grandtotalInWordggs']").html(convertNumberToWord(crprintList.grandTotal - crprintList.tdsAmount));
				}
				
				if(configation.showTotalWayBillWise) {
					if(wayBillTypeId == WAYBILL_TYPE_PAID) {
						$("*[data-cr='bookingTotalaptc']").html(crprintList.bookingChargesSum);
						$("*[data-cr='grandTotalaptc']").html(((crprintList.deliverySumCharges)) - (crprintList.deliveryDiscount));
						$("*[data-cr='grandTotalInWordaptc']").html(convertNumberToWord(Math.round(crprintList.deliverySumCharges)));
					} else {
						$("*[data-cr='bookingTotalaptc']").html(0);
						$("*[data-cr='grandTotalaptc']").html(crprintList.grandTotal);
						$("*[data-cr='grandTotalInWordaptc']").html(convertNumberToWord(Math.round(crprintList.grandTotal)));
					}
				}
			}
			
			if(wayBillTypeId == WAYBILL_TYPE_TO_PAY || wayBillTypeId == WAYBILL_TYPE_CREDIT) {
				$('.hideBookingCharges').removeClass('hide');
				$("*[data-cr='bookngChargesTotal']").html(crprintList.bookingChargesSum);
				$("*[data-cr='bookingAndDeliveryTotal']").html(crprintList.grandTotal);
			} else
				$("*[data-cr='bookingAndDeliveryTotal']").html(crprintList.deliverySumCharges + Math.round(crprintList.deliveryTimeTax));
				
			if(configation.doNotShowAmountOnPrint) {
				if(wayBillTypeId == WAYBILL_TYPE_CREDIT) {
					$("*[data-cr='bookngTotal']").html('0');
					$("*[data-cr='grandTotalCspl']").html(deliveryChargesWithoutDiscount);
					$("*[data-cr='grandTotalLrTypeWise']").html('TBB');
					$("*[data-cr='grandTotalKCPL']").html('credit');
					$('.chargesCredit').html('0');
				} else {
					$("*[data-cr='bookngTotal']").html(crprintList.bookingChargesSum);
				//	$("*[data-cr='grandTotalKCPL']").html(crprintList.bookingChargesSum);

					$("*[data-cr='grandTotalCspl']").html(crprintList.bookingChargesSum + deliveryChargesWithoutDiscount);
					
					if(wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
						$("*[data-cr='grandTotalLrTypeWise']").html(convertNumberToWord(crprintList.grandTotal));
						$("*[data-cr='grandTotalKCPL']").html(crprintList.grandTotal);
					} else if(wayBillTypeId == WAYBILL_TYPE_PAID) {
						$("*[data-cr='grandTotalKCPL']").html(crprintList.deliveryTotal);
						$("*[data-cr='grandTotalLrTypeWise']").html(convertNumberToWord(crprintList.deliverySumCharges + Math.round(crprintList.deliveryTimeTax)));
					}
				}
				
			}
		}, showPopUp : function(responseOut, isPdfExportAllow) {
			var showPopup = false;
			var conf					= responseOut.configuration;
			var crPrintList				= responseOut.crprintlist;
			var wayBillTypeId				= crPrintList.wayBillTypeId;
			var _this = this;
			
			if(conf.showCompanyNamePopup)
				showPopup			= true;
				
			if(conf.isWayBillTypeWisePopupAllowed) {
				var wayBillTypeIdsForPopup	= conf.wayBillTypeIdsForPopup;
				var wayBillTypeIdList		= wayBillTypeIdsForPopup.split(',');
				
				showPopup			= isValueExistInArray(wayBillTypeIdList, wayBillTypeId);
			}	
				
			if(showPopup) {
				$('#popUpDataUpdate').bPopup({
				},function(){
					var _thisMod = this;
					$(this).html("<div class='confirm'><table align='center'><tr><td colspan='3' style='text-align:center'><h1>Select Company Name</h1></td></tr><tr><td><input type='radio' name='company' value='company' checked>Company</td><td><input type='radio' name='company' value='Agency'>Agency</td><td><input type='radio' name='company' value='Carrier'>Carrier</td></tr></table><button id='cancelButton'>NO</button><button autofocus id='confirm'>YES</button></div>");
					var selectedOption;

					$('#confirm').focus();

					$("#confirm").click(function(){
						selectedOption	= $("input[name='company']:checked").val();
						
						if(selectedOption == 'company') {
							$('.company').html('');
							$('.gstn').append('Transporter Gst :');
							$('.companygstn').append('24AABPP5788K1Z7');
						} else if(selectedOption == 'Agency'){
							$('.company').html('AGENCY');
							$('.gstn').append('Transporter Gst : ');
							$('.companygstn').append('24AGNPP7567J1ZO');
						} else if(selectedOption == 'Carrier'){
							$('.company').html('CARRIER');
							$('.gstn').append('Transporter Gst :');
							$('.companygstn').append('27AFYPP5490E1ZQ');
						}

						_thisMod.close();
						_this.printWindow(isPdfExportAllow);
					})

					$("#confirm").on('keydown', function(e) {
						if (e.which == 27) {  // escape
							_thisMod.close();
							window.close();
						}
					});

					$("#cancelButton").click(function(){
						_thisMod.close();
						_this.printWindow(isPdfExportAllow);
					})

				});
				
				
				$('#popUpContentFor625').bPopup({
				}, function() {
					var _thisMod = this;
					$(this).html("<div class='confirm' style='height:150px;width:300px; padding:5px'>"
						+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
						+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' id='lrPrint' name='print' checked/>&nbsp;<b style='font-size:14px;'>CR Print</b><div><br/>"
						+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox'	id='invoicePrint' name='print' checked/>&nbsp;<b style='font-size:14px;'>Invoice Print</b><div><br/>"
						+ "<button id='cancelButton'>Cancel</button>"
						+ "<button autofocus id='confirm'>Print</button></center></div>")

					$("#confirm").focus();

					$("#lrPrint").prop("checked", true);
					$("#cancelButton").click(function() {
						$('.showHideFirstTable').css('display', 'block');
						$('.showHideSecondTable').css('display', 'none');
						_thisMod.close();
						_this.printWindow(isPdfExportAllow);

					});
					$('#confirm').click(function() {
						 if($('#lrPrint').prop('checked') && $('#invoicePrint').prop('checked')){
							$('.showHideSecondTable').css('display', 'block');
							$('.showHideFirstTable').css('display', 'block');
						}else if ($('#lrPrint').prop('checked')){
							$('.showHideFirstTable').css('display', 'block');
							$('.showHideSecondTable').css('display', 'none');
						}else if ($('#invoicePrint').prop('checked')) {
							$('.showHideSecondTable').css('display', 'block');
							$('.showHideFirstTable').css('display', 'none');
							$('.showHideSecondTableId').css('display', 'revert');
						}
						_thisMod.close();
						_this.printWindow(isPdfExportAllow);

					});

					$('#confirm').on('keydown', function(e) {
						if (e.which == 27) {  //escape
							window.close();
						}
					});

				});
				$('#popUpSugama').bPopup({
					},function(){
						var _thisMod = this;
						$(this).html("<div class='confirm' style='height:180px'><h1>Print option</h1><br><center>" +
								"<input type='checkbox' name='bifurcation' id='bifurcation' style='font-weight: bold;font-size: 20px;' checked />Print Bifurcation</center> " +
								"<br><br><button type='button' name='cancel' id='cancel' class='btn-primary'>Cancel</button>" +
						"<button type='button' name='printCharges' id='printCharges' class='btn-primary' style='margin-left: 50px;'>Print</button>");
	
						$('.confirm').focus();
						$('#printCharges').focus();
						
						$("#printCharges").click(function(){
							if ( $("#bifurcation").is(":checked") ) {
								$(".chargesTotal").show();
								$(".bookingDeliveryCharges").show();
							} else if ( $("#bifurcation").not(":checked") ) {
								$(".bookingDeliveryCharges").hide();
								$(".chargesTotal").show();
							}
						  _thisMod.close();
						  _this.printWindow(isPdfExportAllow);
						});
						
						$("#confirm").on('keydown', function(e) {
						if (e.which == 27) {  // escape
							_thisMod.close();
							window.close();
						}
					});

					$("#cancelButton").click(function(){
						_thisMod.close();
						_this.printWindow(isPdfExportAllow);
					})
	
					});
			} else if(conf.allowCookiesBasedDifferentPrint == 'false' || conf.allowCookiesBasedDifferentPrint == false)	 
				_this.printWindow(isPdfExportAllow);
		}, printWindow : function(isPdfExportAllow) {
			if(!isPdfExportAllow) {
				setTimeout(function(){window.print();window.close();},500);
			}
		}, openPrintTypePopup : function(isPdfExportAllow) {
			var _this = this;
			$('#popUpPsr').bPopup({
			},function() {
				var _thisMod = this;
				$(this).html("<div class='confirm' style='height:250px;width:300px; padding:5px'>"
						+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
						+ "<div style='text-align:left;color:black;font-size:17px;'><input type='radio'	 id='printLaser' checked='' name='print'/>&nbsp;<b style='font-size:14px;'>Laser Print</b><div><br/>"
						+ "<div style='text-align:left;color:black;font-size:17px;'><input type='radio' id='printDotMatrix' checked='' name='print'/>&nbsp;<b style='font-size:14px;'>DotMatrix Print</b><div><br/>"
						+ "<div style='text-align:left;color:black;font-size:17px;'><input type='radio' id='printDotMatrix2' checked='' name='print'/>&nbsp;<b style='font-size:14px;'>DotMatrix Print 2</b><div><br/>"
						+ "<button id='cancelButton'>Cancel</button>"
						+ "<button autofocus id='confirm'>Print</button></center></div>")
				
				$("#confirm").click(function() {
					if($("#printLaser").prop('checked')) {
						var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)print\s*\=\s*([^;]*).*$)|^.*$/, "$1");
						
						if (cookieValue == "")	
							document.cookie	= "print=laserlr; expires=Fri, 31 Dec 9999 23:59:59 GMT";
				
						_this.setLaserPrint();
						_thisMod.close();
					};
			
					if($("#printDotMatrix").prop('checked')) {
						var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)print\s*\=\s*([^;]*).*$)|^.*$/, "$1");
						
						if (cookieValue == "")
							document.cookie	= "print=dotmatrixlr; expires=Fri, 31 Dec 9999 23:59:59 GMT";
					
						_this.setDotMatrixPrintOrCallPopup();
						_thisMod.close();
					};
					if($("#printDotMatrix2").prop('checked')) {
						var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)print\s*\=\s*([^;]*).*$)|^.*$/, "$1");
						
						if (cookieValue == "")
							document.cookie	= "print=dotmatrix2lr; expires=Fri, 31 Dec 9999 23:59:59 GMT";
					
						_this.setDotMatrixPrint2OrCallPopup();
						_thisMod.close();
					};
					
					_this.printWindow(isPdfExportAllow);
					_thisMod.close();
				});

				$("#cancelButton").click(function(){
					window.close();
					_thisMod.close();
				});
			});
		}, checkCookieForPrint : function(isPdfExportAllow) {
			var _this = this;
			
			var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)print\s*\=\s*([^;]*).*$)|^.*$/, "$1");
				
			if(cookieValue == "laserlr") {
				_this.setLaserPrint();
				_this.printWindow(isPdfExportAllow);
			} else if(cookieValue == "dotmatrixlr") {
				_this.setDotMatrixPrintOrCallPopup();
				_this.printWindow(isPdfExportAllow);
			} else if(cookieValue == "dotmatrix2lr") {
				_this.setDotMatrixPrint2OrCallPopup();
				_this.printWindow(isPdfExportAllow);
			} else
				_this.openPrintTypePopup(isPdfExportAllow);
		}, setLaserPrint : function() {
			$('.showHideFirstTable').css('display', 'block');
			$('.showHideSecondTable').css('display', 'none');
			$('.showHideThirdTable').css('display', 'none');

		}, setDotMatrixPrintOrCallPopup : function() {
			$('.showHideFirstTable').css('display', 'none');
			$('.showHideSecondTable').css('display', 'block');
			$('.showHideThirdTable').css('display', 'none');

		}, setDotMatrixPrint2OrCallPopup : function() {
			$('.showHideFirstTable').css('display', 'none');
			$('.showHideSecondTable').css('display', 'none');
			$('.showHideThirdTable').css('display', 'block');

		}, setTaxDetails : function(responseOut) {
			var wayBillTaxTxnHM		= responseOut.wayBillTaxTxnHM;

			if(wayBillTaxTxnHM != undefined && wayBillTaxTxnHM != null) {
				for (var key in wayBillTaxTxnHM) {
					console.log("wayBillTaxTxnHM[key]",wayBillTaxTxnHM[key])
					if(key == SGST_MASTER_ID)
						$("*[data-gst='sgst']").html(Math.round(wayBillTaxTxnHM[key]));
					
					if(key == CGST_MASTER_ID)
						$("*[data-gst='cgst']").html(Math.round(wayBillTaxTxnHM[key]));
					
					if(key == IGST_MASTER_ID)
						$("*[data-gst='igst']").html(Math.round(wayBillTaxTxnHM[key]));
					
					if(key == SGST_MASTER_ID)
						$("*[data-gst='sgstWithoutRoundOff']").html(wayBillTaxTxnHM[key]);
					
					if(key == CGST_MASTER_ID)
						$("*[data-gst='cgstWithoutRoundOff']").html(wayBillTaxTxnHM[key]);
					
					if(key == IGST_MASTER_ID)
						$("*[data-gst='igstWithoutRoundOff']").html(wayBillTaxTxnHM[key]);
					
					if (key == SGST_MASTER_ID && Math.round(wayBillTaxTxnHM[key]) == 0)
						$(".sgstrow").hide();	
					
					if(key == CGST_MASTER_ID && Math.round(wayBillTaxTxnHM[key]) == 0)
						$(".cgstrow").hide();
					
					if(key == IGST_MASTER_ID && Math.round(wayBillTaxTxnHM[key]) == 0)
						$(".igstrow").hide();
				}
			} else {
				$(".sgstrow").hide();
				$(".cgstrow").hide();
				$(".igstrow").hide();
			}
		}, setBookingTaxDetails : function(responseOut, configuration) {
			var wayBillBookingTaxTxnHM		= responseOut.wayBillBookingTaxTxnHM;
			var crprintList					= responseOut.crprintlist;
			var showBookingChargesOnToPay	= configuration.showBookingChargesOnToPay;
			
			if(wayBillBookingTaxTxnHM != undefined) {
				for (var key in wayBillBookingTaxTxnHM) {
					if(key == SGST_MASTER_ID)
						$("*[data-BkgSgst='sgst']").html(Math.round(wayBillBookingTaxTxnHM[key]));
					
					if(key == CGST_MASTER_ID)
						$("*[data-BkgCgst='cgst']").html(Math.round(wayBillBookingTaxTxnHM[key]));
					
					if(key == IGST_MASTER_ID)
						$("*[data-BkgIgst='igst']").html(Math.round(wayBillBookingTaxTxnHM[key]));
						
					if(crprintList.wayBillTypeId == WAYBILL_TYPE_TO_PAY){
						if(key == SGST_MASTER_ID)
							$("*[data-BkgSgst='sgst1']").html(Math.round(wayBillBookingTaxTxnHM[key]));
						
						if(key == CGST_MASTER_ID)
							$("*[data-BkgCgst='cgst1']").html(Math.round(wayBillBookingTaxTxnHM[key]));
						
						if(key == IGST_MASTER_ID)
							$("*[data-BkgIgst='igst1']").html(Math.round(wayBillBookingTaxTxnHM[key]));
					}
				}
				if(showBookingChargesOnToPay && crprintList.wayBillTypeId == WAYBILL_TYPE_TO_PAY && crprintList.bookingTimeGst > 0) {
					$(".gstSelection").show();
					$("*[data-BkgGst='commonGst']").html(Math.round(crprintList.bookingTimeGst));
				}
			}
		}, generatePdf(responseOut, isCrPdfAllow,isPdfExportAllow) {
			if(isCrPdfAllow == true || isCrPdfAllow == 'true') {
				var configation	= responseOut.configuration;
				var crprintList = responseOut.crprintlist;
				
				if(configation.isAllowPhotoSubregionWise) {
					if(crprintList.deliverySubRegionId == 3728) {
						$("#header").attr('src', '270_3728.png');
						$("#header").css('width','100%');
					} else if(crprintList.deliverySubRegionId == 3840) {
						$("#header").attr('src', '270_3840_cr.png');
						$("#header").css('width','100%');
					}
				}
				
				$("#header").css('display','block');
				var _this = this;
				var jsonObject = new Object();
				jsonObject.crId		= crprintList.crId;
				jsonObject.crPrint = $("#mainContent").html();
				$("#header").css('display','none');
				getJSON(jsonObject, WEB_SERVICE_URL + '/crPrintWS/generateCRPrintPdfByCRId.do?', _this.getResponse, EXECUTE_WITHOUT_ERROR);
			} else if(isPdfExportAllow == true || isPdfExportAllow == 'true'){
				var configation	= responseOut.configuration;
				var crprintList = responseOut.crprintlist;
				
				if(configation.isAllowPhotoSubregionWise) {
					if(crprintList.deliverySubRegionId == 3728) {
						$("#header").attr('src', '270_3728.png');
						$("#header").css('width','100%');
					} else if(crprintList.deliverySubRegionId == 3840) {
						$("#header").attr('src', '270_3840_cr.png');
						$("#header").css('width','100%');
					}
				}
				
				$("#header").css('display','block');
				var _this = this;
				var jsonObject = new Object();
				jsonObject.crId		= crprintList.crId;
				jsonObject.crPrint = $("#mainContent").html();
				$("#header").css('display','none');
				getJSON(jsonObject, WEB_SERVICE_URL + '/crPrintWS/generateCRPrintPdfExportByCRId.do?', _this.getResponseAfterExport, EXECUTE_WITH_ERROR);
			}
		}, getResponseAfterExport(response) {
			generateFileToDownload(response);//calling from genericfunction.js
		}, getResponse() {
			
		}, setMutipleCrDetails(response) {
			var _this = this;
			var crprintHM		= response.crprintHm;
			var wayBillTotalHM	= response.wayBillTotalHM;
			var crprintList	= new Array();
			var lrNumberString	= null;
			var tdsAmount	= 0;
			var deliveryDiscount	= 0;
			var totalAmount	= 0;
			var grandTotal	= 0;
			
			if(crprintHM != null) {
				for(var key in crprintHM) {
					crprintList	= crprintHM[key];
					
					if(lrNumberString != null)
						lrNumberString = lrNumberString + ", " + crprintList[0].wayBillNumber;
					else
						lrNumberString = crprintList[0].wayBillNumber;
					
					tdsAmount += crprintList[0].tdsAmount;
					deliveryDiscount += crprintList[0].deliveryDiscount;
				}
				
				$("*[data-cr='lrNumberString']").html(lrNumberString);
				$("*[data-cr='deliveryDate']").html(crprintList[0].deliveryDate);
				$("*[data-cr='deliveryBranchName']").html(crprintList[0].deliveryBranchName);
				$("*[data-cr='wayBillDeliveryNumber']").html(crprintList[0].wayBillDeliveryNumber);
				$("*[data-cr='chequeNumber']").html(crprintList[0].chequeNumber);
				$("*[data-cr='bankName']").html(crprintList[0].bankName);
				$("*[data-cr='chequeDateStr']").html(crprintList[0].chequeDateStr);
				$("*[data-cr='tdsAmount']").html(tdsAmount);
				$("*[data-cr='deliveryDiscount']").html(deliveryDiscount);
				$("*[data-cr='consigneeName']").html(crprintList[0].consigneeName);
				
				if(crprintList[0].paymentType == PAYMENT_TYPE_CASH_ID) {
					$("*[data-cr='txnWiseEngb']").html(crprintList[0].paymentTypeString);
					$("#cheque").addClass("hide");
				} else if(crprintList[0].paymentType == PAYMENT_TYPE_ONLINE_RTGS_ID) {
					$("*[data-cr='txnWiseEngb']").html(crprintList[0].paymentTypeString);
					$("#cheque").addClass("hide");
				} else if(crprintList[0].paymentType == PAYMENT_TYPE_ONLINE_NEFT_ID) {
					$("*[data-cr='txnWiseEngb']").html(crprintList[0].paymentTypeString);
					$("#cheque").addClass("hide");
				} else if(crprintList[0].paymentType == PAYMENT_TYPE_CHEQUE_ID)
					$("*[data-cr='txnWiseEngb']").html(crprintList[0].chequeNumber);
				else
					$("*[data-cr='txnWiseEngb']").html(" ");
			}
			
			if(wayBillTotalHM != null ) {
				for(var key2 in wayBillTotalHM){
					totalAmount += wayBillTotalHM[key2];
				}
			}
			
			$("*[data-cr='TotalAmount']").html(totalAmount + deliveryDiscount);
			grandTotal = totalAmount - tdsAmount;
			$("*[data-cr='grandTotal']").html(grandTotal);
			$("*[data-cr='grandTotalInWord']").html(convertNumberToWord(grandTotal));
			
			_this.printWindow();
		}, setBranchWiseBankDetails : function(bankAccountList) {
			if(bankAccountList == undefined || bankAccountList == null || bankAccountList.length == 0)
				return;
			
			$("*[data-bankData='bankAccountName']").html(bankAccountList[0].bankAccountName);
			$("*[data-bankData='bankAccountNumber']").html(bankAccountList[0].bankAccountNumber);
			$("*[data-bankData='ifscCode']").html(bankAccountList[0].ifscCode);
		}
	};
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
