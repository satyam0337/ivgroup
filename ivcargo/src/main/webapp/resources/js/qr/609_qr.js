const express = require('express');
const bodyParser = require('body-parser');
const qr = require('qr-image');
const webshot = require('webshot');
const cmd = require('node-cmd');
const detect = require('detect-port');
const jsonfile = require('jsonfile');

const printConfigurationFile = "./printerConfig.json";
let macAddressConst;

const app = express();

// Increase maximum request size to 10MB
app.use(bodyParser.json({ limit: '10mb' }));

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
});

app.get('/getSelectedPrinterName',function(req,res){
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed
	jsonfile.readFile(printConfigurationFile, function(err, obj) {
		res.send(obj);
	})
});

app.get('/updatePrinterName',function(req,res){
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed
	jsonfile.writeFile(printConfigurationFile, JSON.parse(req.query.jsonObj), function (err) {
		res.send(err);
	})
});

// CORS middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    if (req.method === 'OPTIONS') {
        res.sendStatus(200); // Respond to OPTIONS request
    } else {
        next(); // Pass control to the next middleware
    }
});

// Route to handle the POST request
app.post('/printQrCode', (req, res) => {
    // Check if req.body exists and contains the templateArray property
    if (req.body && req.body.templateArray) {
        // Proceed with printing logic
        setDataForPrint(req.body.templateArray, res);
    } else {
        // Return an error response if templateArray is missing
        res.status(400).send("Missing templateArray in request body");
    }
});

// Function to handle printing of QR codes
const setDataForPrint = (templateArray, res) => {
    new Promise((resolve, reject) => {
        jsonfile.readFile(printConfigurationFile, (err, printerObj) => {
            if (err) {
                reject(err);
            } else {
                resolve(printerObj);
            }
        });
    })
    .then(printerObj => {
        if (!printerObj || !printerObj.qrCodePrinterName) {
            throw new Error("Printer is not configured");
        }
        // Start printing process
        setPrint(templateArray, 0, res, printerObj);
    })
    .catch(error => {
        console.error("Error reading printer configuration:", error);
        res.status(500).send("Error printing QR codes");
    });
}

const setPrint = (templateArray, index, res, printerObj) => {
    const data = templateArray[index];
    if (!data) {
        res.send('All consignments have been printed!');
        return;
    }
    const qrCodeSvg = qr.imageSync(data.qrCodeString, { type: 'svg', size: data.qrCodeSize });
   
	const html = `
	       <!DOCTYPE html>
		<html>
	<body style="${data.bodyStyle}">
	  <table cellpadding="0" cellspacing="0" border="0" style="width:100%; height:100%; margin-top:250px; padding:25px;margin-left:100px;">
	    <tbody>
	      <tr>
	        <td align="right" style="padding-right: 100px;">
	          <table cellpadding="0" cellspacing="0" style="width:100%;padding-left: 100px;">
	            <tbody>
	              ${data.htmlTemplate}
	            </tbody>
	          </table>
	        </td>
	      </tr>
	    </tbody>
	  </table>
	</body>
		</html>

	    `;
    webshot(html, data.qrCodeString + index + '.png', { streamType: 'jpeg', siteType: 'html' }, err => {
        if (err) {
            console.error("Error generating QR code image:", err);
            res.status(500).send("Error generating QR code image");
            return;
        }
        cmd.run(`rundll32 %SYSTEMROOT%\\system32\\shimgvw.dll,ImageView_PrintTo "${__dirname}\\${data.qrCodeString}${index}.png" "${printerObj.qrCodePrinterName}"`);
        setPrint(templateArray, index + 1, res, printerObj);
    });
}

// Start the server
const portCheckAndSet = port => {
    detect(port)
    .then(_port => {
        if (port == _port) {
            app.listen(port, () => {
                console.log(`IVCargo Service listening on ${port}!`);
            });
        } else {
            port += 1;
            portCheckAndSet(port);
        }
    })
    .catch(err => {
        console.log(err);
    });
}

portCheckAndSet(60080);