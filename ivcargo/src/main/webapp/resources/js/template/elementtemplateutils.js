define(function() {
	return {
		//function returns array oject of tab URLs
		appendElementInTemplate : function(ElementModelArray, ElementModel, ElementTemplate, _this, masterIdDataObj){
			let eleArr 			= ElementModelArray;
			let uniqueRegionId 	= new Object();
			
			//loop to get list of region id in all element model
			for  (let j = 0; j < eleArr.length; j++) {
				let jsonObjRes;
				
				if(typeof eleArr[j] == 'object')
					jsonObjRes = eleArr[j];
				else
					jsonObjRes = JSON.parse(eleArr[j]);

				//check if the object exists and the data from the object then only set the elemntValue else set the default value of Elementmodel
				if(masterIdDataObj != undefined && masterIdDataObj != null &&
						masterIdDataObj[jsonObjRes.dataDtoKey] != null && masterIdDataObj[jsonObjRes.dataDtoKey] != undefined) {
					jsonObjRes.elementDefaultValue = masterIdDataObj[jsonObjRes.dataDtoKey];
				}

				let jsonmodel = new ElementModel(jsonObjRes).toJSON();

				let newArr = [];
				
				if(uniqueRegionId[jsonmodel.divRegion] != null)
					newArr = uniqueRegionId[jsonmodel.divRegion];
				
				newArr.push(jsonmodel);
				uniqueRegionId[jsonmodel.divRegion] = newArr;
			}

			let divArray	= Object.keys(uniqueRegionId);
			
			var $finalHTML = $("<div></div>"); 
			
			for(let i = 0; i < divArray.length; i++) {
				let finalObj =  uniqueRegionId[divArray[i]];
				let $divElement = $("<div></div>").addClass("row");
				$divElement.attr("id",divArray[i]);

				for(let j = 0; j < finalObj.length;j++) {
					let elementObject = finalObj[j];
					let elementImage = null;
					
					if(elementObject.elementImageUrl != "")
						elementImage = "<image src='" + elementObject.elementGlyphicon + "' ></image>" 
					else
						elementImage ="<i class='" + elementObject.elementGlyphicon + "'></i>";

					elementObject.elementImageTag = elementImage;
					_.templateSettings.variable = "";
					elementObject.labelTag ="";

					if(elementObject.showLabel) {
						if(elementObject.setDefaultLabel)
							elementObject.labelTag = "<label class="+elementObject.labelCss+"><span id="+elementObject.labelId+" data-selector="+elementObject.labelId+">"+elementObject.labelValue+"</span></label>"
						else
							elementObject.labelTag = "<label class="+elementObject.labelCss+"><span id="+elementObject.labelId+" data-selector="+elementObject.labelId+"></span></label>"
					}

					$divElement.append(_.template(ElementTemplate)(elementObject))
				}
				
				$finalHTML.append($divElement);
			}
			_this.$el.append($finalHTML);
		}, appendMasterTabInTemplate : function(ElementModelArr, ElementTemplate, _this){
			var eleArr = ElementModelArr;
			//variable needs to be added to pass in the Array in template
			_.templateSettings.variable = "eleArr";
			_this.$el.append(_.template(ElementTemplate)(eleArr));
		}, appendDetailsForViewById : function(ElementModelArr, ElementModel, ElementTemplate, _this, viewModelCollection) {
			var jsonArr  =[];
			var finalJsonObj = new Object();
			var eleArr = ElementModelArr;
			for  (var j=0; j < eleArr.length;j++) {

				var jsonmodel = new ElementModel(JSON.parse(eleArr[j]));

				var jsonObj = jsonmodel.toJSON();
				var dtoObj = viewModelCollection.dtoObj;
				if(dtoObj != undefined && dtoObj != ''
					&& jsonObj.dataDtoKey != undefined){
					jsonObj.elementDefaultValue =  dtoObj[jsonObj.dataDtoKey];
				}

				jsonArr.push(jsonObj);
			}
			finalJsonObj.rows = jsonArr;
			//need to explicitly remove the variable parameter
			_.templateSettings.variable = "finalJsonObj";
			_this.$el.append(_.template(ElementTemplate)(finalJsonObj));
		}, appendDataInTable : function(ElementModelArr, ElementModel, _this, languageData, data, ElementTemplate, callBackFunction) {
			var $table = $('<table class="table" id="consignemntQuantity"/>');
			$thead = $(' <thead class="thead-inverse"/>');

			var elementModArr = ElementModelArr.consignment;
			var weightModel	= ElementModelArr.partialWeight;
			$trObj = $("<tr/>");

			for(var i=0; i<elementModArr.length; i++){
				var jsonObj = JSON.parse(elementModArr[i]);
				$trObj.append( '<th><span data-selector="'+jsonObj["labelId"]+'">'+languageData[jsonObj["labelId"]]+'</span></th>' );
			}

			$thead.append($trObj);

			$table.append($thead);

			//tbody call
			var respData = data.packingTypeMaster;
			var actualWeight = data.ACTUALWEIGHT;
			var $tbody = $(' <tbody/>');

			var validationObj = new Array();
			var elementValObj = new Array();
			var weightValObj = new Array();
			var totalQuantity=0;
			for(var j=0;j<respData.length;j++){
				var $trObj = $("<tr/>");

				for(var i=0; i<elementModArr.length; i++){
					var jsonObj = new ElementModel(JSON.parse(elementModArr[i]));
					var finalJsonObj = jsonObj.toJSON();
					if(finalJsonObj["elementType"] == "text"){
						$trObj.append( '<td style="line-height: 2;font-size: larger;">'+ respData[j][finalJsonObj["dataDtoKey"]] +'</td>' );
					}else if(finalJsonObj["elementType"] == "number"){
						totalQuantity += parseInt(respData[j][finalJsonObj["dataDtoKey"]]);
						finalJsonObj.elementId = finalJsonObj.elementId+''+respData[j][finalJsonObj["primaryIdDtoName"]]
						finalJsonObj.elementDefaultValue = respData[j][finalJsonObj["dataDtoKey"]];
						validationObj.push({
							selector: '#'+finalJsonObj.elementId,
							validate: 'max-number:'+respData[j][finalJsonObj["dataDtoKey"]],
							errorMessage: 'Value cannot be more than '+respData[j][finalJsonObj["dataDtoKey"]]
						});
						validationObj.push({
							selector: '#'+finalJsonObj.elementId,
							validate: 'presence',
							errorMessage: 'Cannot be left blank !'
						});
						validationObj.push({
							selector: '#'+finalJsonObj.elementId,
							validate: 'min-number:0',
							errorMessage: 'Value cannot be less than 0.'
						});
						validationObj.push({
							selector: '#'+finalJsonObj.elementId,
							validate: 'integer',
							errorMessage: 'value should be non-decimal number'
						});

						elementValObj.push({
							elementId:"#"+finalJsonObj.elementId,
							elementData :respData[j]
						});
						var $tdObj = $("<td/>")
						$tdObj.append(_.template(ElementTemplate)(finalJsonObj));
						$trObj.append( $tdObj );
					}
				}
				$tbody.append($trObj);
			}
			
			$table.append($trObj);
			$table.append($tbody);
			
			if(isNaN(actualWeight)){
				actualWeight = 0;
			}
			_this.$el.append($table);
			
			var $weighttable = $('<table class="table"/>');
			var $trObj = $("<tr/>");
			var $tdObj =  '<td style="line-height: 2;font-size: larger;"><b> Weight </b> : '+ actualWeight +'</td>' 
			
			$trObj.append($tdObj)
			
			var $tdWeightObj = $("<td/>")
			
			var jsonObj = new ElementModel(JSON.parse(weightModel));
			
			var finalJsonObj = jsonObj.toJSON();
			
			finalJsonObj.labelTag ="";
			
			finalJsonObj.elementDefaultValue = actualWeight;
			
			if(finalJsonObj.showLabel){
				finalJsonObj.labelTag = "<label class="+finalJsonObj.labelCss+"><span id="+finalJsonObj.labelId+" data-selector="+finalJsonObj.labelId+"><b>"+languageData[finalJsonObj["labelId"]]+"</b></span></label>"
			}
			$tdWeightObj.append(_.template(ElementTemplate)(finalJsonObj)); 
			weightValObj.push({
				elementId:"#"+finalJsonObj.elementId,
			});
			
			validationObj.push({
				selector: '#'+finalJsonObj.elementId,
				validate: 'max-number:'+actualWeight,
				errorMessage: 'Value cannot be more than '+actualWeight
			});
			validationObj.push({
				selector: '#'+finalJsonObj.elementId,
				validate: 'presence',
				errorMessage: 'Cannot be left blank !'
			});
			
			validationObj.push({
				selector: '#'+finalJsonObj.elementId,
				validate: 'integer',
				errorMessage: 'value should be non-decimal number'
			});
			if(actualWeight > 0){
				validationObj.push({
					selector: '#'+finalJsonObj.elementId,
					validate: 'min-number:1',
					errorMessage: 'Value cannot be 0.'
				});
			}else{
				validationObj.push({
					selector: '#'+finalJsonObj.elementId,
					validate: 'min-number:0',
					errorMessage: 'Value cannot be less than 0.'
				});
			}

			
			$trObj.append($tdWeightObj);
			
			var $tdObj = $("<td/>")
			
			$tdObj.append($tdObj);
			
			$weighttable.append($trObj);
			
			_this.$el.append($weighttable);
			
			var outObject = new Object();
			outObject.validationObj = validationObj;
			outObject.elementValObj = elementValObj;
			outObject.weightValObj = weightValObj;
			outObject.totalQuantity = totalQuantity;
			outObject.totalWeight = actualWeight;
			
			setTimeout(callBackFunction, 200,outObject);
		}
	}});

function getUniqueArr(arrayList){
	var n = {},r=[];
	
	for(var i = 0; i < arrayList.length; i++){
		if (!n[arrayList[i]]) {
			n[arrayList[i]] = true;
			r.push(arrayList[i]);
		}
	}
		
	return r;/*.sort(function(a, b) {return a.localeCompare(b);})*/
}