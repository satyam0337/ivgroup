define(function(require) {
	return {
		loadLanguage:function(flavor){
			//global variable Language file Path Needs to be present in every HTML file
			var globalLanguageObj = new Object();
			//file path needs to be specified from languages folder
			globalLanguageObj.filePath 		= PROJECT_IVUIRESOURCES+'/resources/data/languages/module/partyagentcommisionmodule';
			//file name for language to be specified
			globalLanguageObj.fileName 		= flavor
			return globalLanguageObj;
		}
	}
});