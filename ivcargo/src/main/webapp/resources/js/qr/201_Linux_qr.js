const express = require('express');
const bodyParser = require('body-parser');
const qr = require('qr-image');
const puppeteer = require('puppeteer');
const exec = require('child_process').exec;
const detect = require('detect-port');
const jsonfile = require('jsonfile');

const printConfigurationFile = "./printerConfig.json";

const app = express();

app.use(bodyParser.json({ limit: '10mb' }));

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.post('/printQrCode', function(req, res) {
    if (req.body && req.body.templateArray) {
        setDataForPrint(req.body.templateArray, res);
    } else {
        res.status(400).send("Missing templateArray in request body");
    }
});

const setDataForPrint = function(templateArray, res) {
    new Promise(function(resolve, reject) {
        jsonfile.readFile(printConfigurationFile, function(err, printerObj) {
            if (err) {
                reject(err);
            } else {
                resolve(printerObj);
            }
        });
    })
    .then(function(printerObj) {
        if (!printerObj || !printerObj.qrCodePrinterName) {
            throw new Error("Printer is not configured");
        }
        setPrint(templateArray, 0, res, printerObj);
    })
    .catch(function(error) {
        console.error("Error reading printer configuration:", error);
        res.status(500).send("Error printing QR codes");
    });
}

const setPrint = function(templateArray, index, res, printerObj) {
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
            <table cellpadding="0", cellspacing="0", border="0", style="width:100%;height:100%;margin-top:180px;padding:25px;">
                <tbody>
                    <tr>
                        <td>${qrCodeSvg}</td>
                        <td>
                            <table cellpadding="0", cellspacing="0", style="width:100%;height:100%">
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

    puppeteer.launch()
    .then(function(browser) {
        browser.newPage()
        .then(function(page) {
            page.setContent(html)
            .then(function() {
                page.screenshot({ path: `${data.qrCodeString}${index}.png` })
                .then(function() {
                    exec(`lp -d ${printerObj.qrCodePrinterName} ${data.qrCodeString}${index}.png`, function(error, stdout, stderr) {
                        if (error) {
                            console.error(`Error printing: ${error.message}`);
                            res.status(500).send("Error printing QR codes");
                            return;
                        }
                        if (stderr) {
                            console.error(`Print command stderr: ${stderr}`);
                            res.status(500).send("Error printing QR codes");
                            return;
                        }
                        browser.close();
                        setPrint(templateArray, index + 1, res, printerObj);
                    });
                });
            });
        });
    })
    .catch(function(error) {
        console.error("Error generating QR code image:", error);
        res.status(500).send("Error generating QR code image");
    });
}

const portCheckAndSet = function(port) {
    detect(port)
    .then(function(_port) {
        if (port == _port) {
            app.listen(port, function() {
                console.log(`IVCargo Service listening on ${port}!`);
            });
        } else {
            port += 1;
            portCheckAndSet(port);
        }
    })
    .catch(function(err) {
        console.log(err);
    });
}

portCheckAndSet(60081);