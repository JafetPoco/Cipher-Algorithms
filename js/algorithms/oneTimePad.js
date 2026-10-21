// algorithms/oneTimePad.js

import { Cipher } from "../cipher.js";

export class OneTimePad extends Cipher {
    encrypt(text, key) {
        const textBytes = new TextEncoder().encode(text);
        const keyBytes = new TextEncoder().encode(key.trim());

        if (textBytes.length !== keyBytes.length) {
            throw new Error('La clave debe tener el mismo tamaño que el texto en bytes.');
        }

        const cipherBytes = new Uint8Array(textBytes.length);

        for (let i = 0; i < textBytes.length; i++) {
            cipherBytes[i] = textBytes[i] ^ keyBytes[i];
        }
        return cipherBytes;
    }

    decrypt(cipherBytes, key) {
        const text = hexaToNumber(cipherBytes.trim());
        const keyBytes = new TextEncoder().encode(key.trim());

        if (text.length !== keyBytes.length) {
            throw new Error('La clave no corresponde al texto cifrado.');
        }

        const textBytes = new Uint8Array(text.length);
        for (let i = 0; i < text.length; i++) {
            textBytes[i] = text[i] ^ keyBytes[i];
        }

        return textBytes;
    }
}

export function generateKey(length) {
    if (!Number.isInteger(length) || length < 0) {
        throw new Error('El tamaño de la clave debe ser un entero no negativo.');
    }

    const key = new Uint8Array(length);
    window.crypto.getRandomValues(key);
    return key;
}


function hexaToNumber(hexa) {
    if(hexa.length % 2 !== 0) {
        throw new Error('El texto cifrado debe tener un número par de caracteres hexadecimales.');
    }

    const bytes = new Uint8Array(hexa.length / 2);
    for (let i = 0; i < hexa.length; i += 2) {
        const hexPair = hexa.substr(i, 2);
        if (!/^[0-9a-f]{2}$/i.test(hexPair)) {
            throw new Error('El texto cifrado contiene caracteres que no son hexadecimales.');
        }
        bytes[i / 2] = Number.parseInt(hexPair, 16);
    }

    return bytes;
}

function parseShift(key) {
    const value = String(key).trim();

    if (!/^[+-]?\d+$/.test(value)) {
        throw new Error('La clave de One-Time Pad debe ser un número entero.');
    }

    return Number(value);
}