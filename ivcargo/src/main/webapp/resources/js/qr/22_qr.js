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
	
  webshot(`<!DOCTYPE html><html>
<body style="${data.bodyStyle};">
<table cellpadding="0", cellspacing="0" border="0" style="width:100%;height:100%; margin-top:0px;padding:25px;">
	<tbody>
	<tr>
	  <table  style="width:100%;margin-top:0px;height:100%;padding-left:90px;">
        <tbody>
		<tr>
			<td colspan="2" style="text-align: left;width:100%;">
				<span style="font-size: 50px;padding-left:200px;">KIINGS LOGISTICS</span><br>
				<span style="font-size: 30px;padding-left:50px;">A unit of Navnith Easymoves India Private Limited</span>
			</td>
		</tr>
        <tr>
			<td style="vertical-align: top;">${string}</td>
            <td style="vertical-align: top;width:100%;height:100%;">
            <table  style="width:100%;height:100%">
            <tbody>
            ${data.htmlTemplate}
                </tbody>
            </table>
            </td>
        </tr>
        </tbody>
    </table>
		</td>
	</tr>
	</tbody>
</table>
</body></html>`, data.qrCodeString+index+'.png', {streamType:'jpeg',siteType:'html'}, function(err) {
  cmd.run('rundll32 %SYSTEMROOT%\\system32\\shimgvw.dll,ImageView_PrintTo "'+__dirname+'\\'+data.qrCodeString+index+'.png"' +' "'+printerObj.qrCodePrinterName+'"');
  index+=1;
  setPrint(dataIn,index,res,printerObj);
  
});  
}
