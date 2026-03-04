var qr = require('qr-image');
const path = require('path');
var cmd=require('node-cmd');
var webshot = require('webshot');
const express = require('express');
var macAddressConst;
const detect = require('detect-port');
const app = express();
var jsonfile = require('jsonfile');
const printConfigurationFile = "./printerConfig.json"
 app.get('/printQrCode', function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed
	setDataForPrint(req.query,res);
})

app.get('/getIvcargoServiceVersion', function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed
	res.send("1.0");
})

require('getmac').getMac(function(err,macAddress){
    if (err)  throw err
		macAddressConst = macAddress;
	})

app.get('/getIVCargoMacAddress',function(req,res){
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed
	res.send(macAddressConst);
})

app.get('/getAllPrinterList',function(req,res){
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed
	let finalArr = [];
	cmd.get(
        'wmic printer get name',
        function(err, data, stderr){
            let arr =  data.split("\n");
			for(let data in arr){
				if(data > 0){
					let name = arr[data].replace(/(?:\\[rn]|[\r\n]+)+/g, "");
					if(name.replace(/\s/g,"") !== ""){
						finalArr.push(name.trim());
					}
				}
			}
			res.send(finalArr);		
        }
    );
	
	
})

app.get('/getSelectedPrinterName',function(req,res){
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed
	jsonfile.readFile(printConfigurationFile, function(err, obj) {
		res.send(obj);
	})
})


app.get('/updatePrinterName',function(req,res){
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed
	jsonfile.writeFile(printConfigurationFile, JSON.parse(req.query.jsonObj), function (err) {
		res.send(err);
	})
})

const portCheckAndSet = (port) =>{
  detect(port)
  .then(_port => {
    if (port == _port) {
      app.listen(port, function () {
		console.log(`IVCargo Service listening on ${port}!`)
		})
    } else {
		port = port+1;
      return portCheckAndSet(port);
    }
  })
  .catch(err => {
    console.log(err);
  });
}

portCheckAndSet(60080);

const setDataForPrint = (data,res) =>{
	
	jsonfile.readFile(printConfigurationFile, function(err, obj) {
		if(obj === undefined){
			res.send("File Not found");
		}else{
			if(obj.qrCodePrinterName === undefined){
				res.send("Printer is not configured");
			}else{
				setPrint(data.templateArray,0,res,obj);
			}
		}
	})
	
	
}

var setPrint = (dataIn, index, res,printerObj) =>{
	
	var data = dataIn[index];
	if(data === undefined){
		res.send('All Consignments got printed!')
		return;
	}
	
	var string = qr.imageSync(data.qrCodeString, { type: 'svg' ,size : data.qrCodeSize });
	var srcBranchAbrvtinCode = "";
	var destinationAbrvtinCode = "";
	var waybillNo = "";
	var destinationBranch = "";
	var destBranchAbrvtinCode = "";
	var numberOfQuntity = "";
	var QrCodeForSugama = false;
	if(data.srcBranchAbrvtinCode != undefined || data.srcBranchAbrvtinCode != 'undefined'){
		var srcBranchAbrvtinCode = data.srcBranchAbrvtinCode;
	}
	if(data.destinationAbrvtinCode != undefined || data.destinationAbrvtinCode != 'undefined'){
		var destinationAbrvtinCode = data.destinationAbrvtinCode;
	}
	if(data.waybillNo != undefined || data.waybillNo != 'undefined'){
		var waybillNo = data.waybillNo;
	}
	if(data.destinationBranch != undefined || data.destinationBranch != 'undefined'){
		var destinationBranch = data.destinationBranch;
	}
	if(data.destBranchAbrvtinCode != undefined || data.destBranchAbrvtinCode != 'undefined' ){
		var destBranchAbrvtinCode = data.destBranchAbrvtinCode;
	}
	if(data.numberOfQuntity != undefined || data.numberOfQuntity != 'undefined'){
		var numberOfQuntity = data.numberOfQuntity;
	}
	if(data.QrCodeForSugama != undefined || data.QrCodeForSugama != 'undefined'){
		var QrCodeForSugama = data.QrCodeForSugama;
	}
if(QrCodeForSugama == true || QrCodeForSugama == 'true'){
  webshot(`<!DOCTYPE html><html>
<body style="${data.bodyStyle};">
<table 
	style="width: 1000px; height: 407px; margin-top: 180px; border: solid 1px;"
	cellpadding="0" cellspacing="0">
	<tr>
		<td width="100%">
			<table width="100%" cellpadding="0" cellspacing="0">
				<tr>
					<td style="border-bottom: 1px solid black; text-align: center;padding-bottom: 10px;"><span>SUGAMA
							EXPRESS CARGO</span></td>
				</tr>
				<tr>
					<td>
						<table width="100%" cellpadding="0" cellspacing="0">
							<tr>
								<td width="35%" style="border: solid 1px;">
									<table width="100%" cellpadding="0" cellspacing="0"
										height="115px">
										<tr>
											<td width="100%" style="text-align:center;"><span>${string}</span></td>
										</tr>
									</table>
								</td>
								<td width="65%" style="border: solid 1px;">
									<table width="100%" cellpadding="0" cellspacing="0">
										<tr>
											<td
												style="border-bottom: 1px solid black; border-right: 1px solid black; padding-bottom: 25px;"><span
												style="font-size: 70px;">LR No : </span><span
												style="font-size: 110px;">${waybillNo}</span>
											<td>
										</tr>
										<tr>
											<td
												style="border-right: 1px solid black; padding-bottom: 10px;"><span>To
													: </span><span>${destinationBranch}</span>
											<td>
										</tr>
									</table>
								</td>
							</tr>
						</table>
					</td>
				</tr>
				<tr>
					<td width="100%">
						<table width="100%" cellpadding="0" cellspacing="0">
							<tr>
								<td width="30%"
									style="border-right: 1px solid black; border-bottom: 1px solid black; padding-left: 10px;"><span style="font-size:90px;">${srcBranchAbrvtinCode}</span></td>
								<td width="20%"
									style="border-right: 1px solid black; border-bottom: 1px solid black; padding-left: 10px;"><span style="font-size: 45px;">${numberOfQuntity}</span></td>
								<td width="50%"
									style="border-right: 1px solid black; border-bottom: 1px solid black; padding-left: 10px;"><span
									style="font-size: 110px;">${destBranchAbrvtinCode}</span></td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
		</td>
	</tr>
</table>
</body></html>`, data.qrCodeString+index+'.png', {streamType:'jpeg',siteType:'html'}, function(err) {
  cmd.run('rundll32 %SYSTEMROOT%\\system32\\shimgvw.dll,ImageView_PrintTo "'+__dirname+'\\'+data.qrCodeString+index+'.png"' +' "'+printerObj.qrCodePrinterName+'"');
  index+=1;
  setPrint(dataIn,index,res,printerObj);
  
});
}else{
	 webshot(`<!DOCTYPE html><html>
			 <body style="${data.bodyStyle}">
			 <table cellpadding="0", cellspacing="0" border="0" style="width:100%;height:100%">
			 	<tbody>
			 	<tr>
			 		<td>${string}</td>
			 		<td>
			 		<table cellpadding="0", cellspacing="0" style="width:100%;height:100%">
			 		<tbody>
			 		${data.htmlTemplate}
			 			</tbody>
			 		</table>
			 		</td>
			 	</tr>
			 	</tbody>
			 </table>
			 </body></html>`, data.qrCodeString+'.png', {customCSS : "margin:0;padding:0;",streamType:"jpeg",zoomFactor: 1,siteType:'html',windowSize:{ width:'window', height: 'window' },shotSize: {width: 'all', height: 'all'}}, function(err) {
			   //cmd.run(`mspaint /pt ${data.qrCodeString}.png "${printerObj.qrCodePrinterName}"`);
			   cmd.run(`rundll32 %SYSTEMROOT%\system32\shimgvw.dll,ImageView_PrintTo "%cd%\${data.qrCodeString}.png" "FinePrint"`);
			   
			   index+=1;
			   setPrint(dataIn,index,res,printerObj)
			 });  
}
}
