import { jwtDecode } from "./jwt-decode.js";
import { inflate } from "./pako.esm.mjs";

document.getElementById('decoderForm').addEventListener('submit', function (event) {
    event.preventDefault();

    document.getElementById('jwtOutput').style.display = 'none';
    document.getElementById('output').textContent = '';

    let inputParts = document.getElementById('cookieInput').value.split('.');
    let cookiePayload = inputParts.length > 1 ? inputParts[1] : "";
    cookiePayload = cookiePayload.replace(/\-/g, '+').replace(/\_/g, '/');

    while (cookiePayload.length % 4) {
        cookiePayload += '=';
    }

    let decodedPayload;
    try {
        decodedPayload = atob(cookiePayload);
    } catch (e) {
        document.getElementById('output').textContent = 'Invalid base64 encoding.';
        return;
    }

    try {
        const decompressedPayload = inflate(new Uint8Array(decodedPayload.split('').map(c => c.charCodeAt(0))), { to: 'string' });
        processDecodedData(decompressedPayload);
    } catch (e) {
        processDecodedData(decodedPayload);
    }
});

function processDecodedData(decodedData) {
    try {
        const formattedJson = JSON.stringify(JSON.parse(decodedData), null, 4);
        document.getElementById('output').textContent = formattedJson;
        if (isJwt(decodedData)) {
            displayJwtData(decodedData);
        }
    } catch (jsonError) {
        document.getElementById('output').textContent = decodedData;
        if (isJwt(decodedData)) {
            displayJwtData(decodedData);
        }
    }
}

function displayJwtData(jwtData) {
    const decodedJwt = jwtDecode(jwtData);
    document.getElementById('jwtOutput').style.display = 'block';
    document.getElementById('jwtOutput').textContent = JSON.stringify(decodedJwt, null, 4);
}

function isJwt(data) {
    try {
        const parts = data.split('.');
        return parts.length === 3 && JSON.parse(atob(parts[1]));
    } catch (error) {
        return false;
    }
}
