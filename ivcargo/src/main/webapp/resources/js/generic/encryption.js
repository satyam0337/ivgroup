/**
 * Anant 18-Jul-2025 1:06:55 pm 2025
 */
var secret = "2vEm6ljOKeZbtDG7zCXqfi3dCVtUjB9wLUJkKsIsXks=";

/* 
function getAesKey(secret) {
	// SHA-1 hash, then first 16 bytes (128 bits)
	const sha1 = CryptoJS.SHA1(CryptoJS.enc.Utf8.parse(secret));
	const key = CryptoJS.lib.WordArray.create(sha1.words.slice(0, 4)); // 16 bytes
	return key;
}

function encryptValue(text) {
	const key = getAesKey(secret);
	const encrypted = CryptoJS.AES.encrypt(text, key, {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7
	});

	return CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
}
*/

function getAesKey(secret) {
	const sha1 = CryptoJS.SHA1(CryptoJS.enc.Utf8.parse(secret));
	return CryptoJS.lib.WordArray.create(sha1.words.slice(0, 4));
}

function encryptValue(text) {
	console.log("CryptoJS::= ", typeof(CryptoJS));
	
	const key = getAesKey(secret);
	const encrypted = CryptoJS.AES.encrypt(text, key, {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7
	});

	// Convert WordArray to Uint8Array (raw bytes)
	const wordArray = encrypted.ciphertext;
	const byteArray = [];

	for (let i = 0; i < wordArray.sigBytes; i++) {
		const byte = (wordArray.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xFF;
		byteArray.push(byte);
	}

	return encodeUrlSafeBase64(byteArray);
}

function encodeUrlSafeBase64(byteArray) {
	const base64abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"; // URL-safe
	let result = "", i;
  
	for (i = 2; i < byteArray.length; i += 3) {
		result += base64abc[byteArray[i - 2] >> 2];
		result += base64abc[((byteArray[i - 2] & 0x03) << 4) | (byteArray[i - 1] >> 4)];
		result += base64abc[((byteArray[i - 1] & 0x0f) << 2) | (byteArray[i] >> 6)];
 		result += base64abc[byteArray[i] & 0x3f];
	}

	let remaining = byteArray.length % 3;
 
 	if (remaining === 1) {
		i = byteArray.length - 1;
		result += base64abc[byteArray[i] >> 2];
		result += base64abc[(byteArray[i] & 0x03) << 4];
	} else if (remaining === 2) {
		i = byteArray.length - 2;
		result += base64abc[byteArray[i] >> 2];
		result += base64abc[((byteArray[i] & 0x03) << 4) | (byteArray[i + 1] >> 4)];
		result += base64abc[(byteArray[i + 1] & 0x0f) << 2];
	}

	return result;
}

function encryptGlobalParams(inputData = {} ) {
	const { url, options = [], type } = inputData;
	const keysToExclude = ['pageId', 'eventId', 'multipleCrPrint', 'searchBy', 'TypeOfNumber'
		, 'wayBillNumber', 'redirectFilter', 'wbStatus', 'billStatusId', 'dateToDisplay', 'txnTypeId', 'Type', 'isSecPrint', 'isSearchModule'
		, 'msg', 'lsNo', 'wayBillNo', 'billNo', 'moduleIdentifier', 'flag', 'destGodownSubRegion', 'destGodownBranchId', 'masterid2', 'isDispatchForOwnGroup'
		, 'isFromPartyOutStanding', 'scrSubRegion', 'scrBranch', 'desSubRegion', 'desBranch', 'date'
		, 'totalLoadingTimeHamali', 'loadedById', 'printType', 'sourceSubRegionName', 'destinationSubRegionName'
		, 'sourceBranchId', 'destinationBranchId', 'DataByBranchId', 'redirectTo', 'moduleId', 'timeDuration', 'NumberType'
	]; // <-- Skipped from encryption

	const [baseUrl, queryString] = url.split('?'); // get path and query params
	const splitKeyVal = queryString?.split('&') || [];

	const encryptedParams = splitKeyVal.map((keyVal) => {
		const [key, value] = keyVal.split('=');

		if ((key == 'pageId' && value == '4' && key == 'eventId' && value == '5')
			|| keysToExclude.includes(key)
			|| !isNumericValue(value)) {
			return `${key}=${value}`;
		}

		const encryptedValue = encryptValue(value);
		return `${key}=${encryptedValue}`;
	});

	const encryptedUrl = `${baseUrl}?${encryptedParams.join('&')}`;

	switch (type) {
		case 1:
			return window.open(encryptedUrl, ...options);
		case 2:
			return window.location.href = encryptedUrl;
		default:
			return encryptedUrl;
	}
}

function isNumericValue(str) {
	if (typeof str != "string") return false // we only process strings!  
	
	return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
		!isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}