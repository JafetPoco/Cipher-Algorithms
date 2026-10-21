// js/app.js
import { generateKey, OneTimePad } from "./algorithms/oneTimePad.js";
import { InterruptedTransposition } from "./algorithms/transposition.js";

const messageInput = document.getElementById('encryption-text');
const keyInput = document.getElementById('encryption-key');
const encryptedOutput = document.getElementById('encrypted-text');
const algorithmInput = document.getElementById('encryption-algorithm');

const textLabel = document.getElementById('text-label');
const keyLabel = document.getElementById('key-label');
const resultLabel = document.getElementById('result-label');
const actionBtn = document.getElementById('action-btn');
const generateKeyBtn = document.getElementById('generate-key-btn');
const alertBox = document.getElementById('alert');
const textCount = document.getElementById('text-count');
const keyCount = document.getElementById('key-count');
const operationInputs = document.querySelectorAll('input[name="operation"]');

const ciphers = {
    oneTimePad: new OneTimePad(),
    transposition: new InterruptedTransposition()
};
let cipher = ciphers.oneTimePad;
let autoRunTimer;

const interfaces = {
    encrypt: {
        textLabel: 'Texto a cifrar',
        textPlaceholder: 'Ingrese el texto a cifrar',
        keyLabel: 'Clave de cifrado',
        keyPlaceholder: 'Ingrese la clave de cifrado',
        resultLabel: 'Texto cifrado',
        resultPlaceholder: 'El texto cifrado aparecerá aquí…'
    },
    decrypt: {
        textLabel: 'Texto cifrado a descifrar',
        textPlaceholder: 'Ingrese el texto cifrado a descifrar',
        keyLabel: 'Clave de descifrado',
        keyPlaceholder: 'Ingrese la clave de descifrado',
        resultLabel: 'Texto descifrado',
        resultPlaceholder: 'El texto descifrado aparecerá aquí…'
    }
};

function getOperation() {
    return document.querySelector('input[name="operation"]:checked').value;
}

function selectCipher() {
    switch (algorithmInput.value) {
        case 'oneTimePad':
            cipher = ciphers.oneTimePad;
            return;
        case 'transposition':
            cipher = ciphers.transposition;
            return;
        default:
            throw new Error('Por ahora no está implementado el algoritmo. Intente con otro');
    }
}

function updateInterface() {
    const operation = getOperation();
    const config = interfaces[operation];
    const isOneTimePad = algorithmInput.value.trim() === 'oneTimePad';

    textLabel.textContent = config.textLabel;
    messageInput.placeholder = config.textPlaceholder;
    keyLabel.textContent = config.keyLabel;

    if (isOneTimePad) {
        keyInput.placeholder = operation === 'encrypt'
            ? 'Ingrese la clave de cifrado (mismo tamaño que el texto)'
            : 'Ingrese la clave de descifrado (mismo tamaño que el mensaje original)';
    } else {
        keyInput.placeholder = config.keyPlaceholder;
    }

    resultLabel.textContent = operation === 'encrypt' && isOneTimePad
        ? 'Texto cifrado (hexadecimal)'
        : config.resultLabel;
    encryptedOutput.placeholder = config.resultPlaceholder;
    actionBtn.textContent = operation === 'encrypt' ? 'Cifrar' : 'Descifrar';
    actionBtn.hidden = isOneTimePad;
    actionBtn.classList.toggle('hidden', isOneTimePad);
    generateKeyBtn.hidden = !isOneTimePad;
    generateKeyBtn.classList.toggle('hidden', !isOneTimePad);
}

function clearError() {
    alertBox.textContent = '';
    alertBox.classList.add('hidden');
}

function showError(message) {
    alertBox.textContent = message;
    alertBox.classList.remove('hidden');
}

function getOneTimePadKeyLength() {
    if (getOperation() === 'encrypt') {
        return new TextEncoder().encode(messageInput.value).length;
    }

    const cipherText = messageInput.value.trim();
    if (cipherText.length === 0 || cipherText.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(cipherText)) {
        throw new Error('Ingrese un texto cifrado hexadecimal válido para generar la clave.');
    }

    return cipherText.length / 2;
}

function createRandomKey() {
    clearError();

    try {
        const length = getOneTimePadKeyLength();
        if (length === 0) {
            throw new Error('Ingrese el texto original antes de generar la clave.');
        }

        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const randomBytes = generateKey(length);
        keyInput.value = Array.from(randomBytes, byte => alphabet[byte % alphabet.length]).join('');
        updateCounts();
        runCipher();
    } catch (error) {
        showError(`No se pudo generar la clave: ${error.message}`);
    }
}

algorithmInput.addEventListener('change', () => {
    selectCipher();
    updateInterface();
    clearTimeout(autoRunTimer);
    runCipher();
});

operationInputs.forEach(input => {
    input.addEventListener('change', () => {
        updateInterface();
        clearTimeout(autoRunTimer);
        runCipher();
    });
});

document.getElementById('clear-btn').addEventListener('click', () => {
    clearTimeout(autoRunTimer);
    messageInput.value = '';
    keyInput.value = '';
    encryptedOutput.value = '';
    clearError();
    updateCounts();
});

function updateCounts() {
    textCount.textContent = `(${messageInput.value.length})`;
    keyCount.textContent = `(${keyInput.value.length})`;
}

function runCipher() {
    clearTimeout(autoRunTimer);
    clearError();

    if (messageInput.value === '' || keyInput.value.trim() === '') {
        encryptedOutput.value = '';
        return;
    }

    try {
        selectCipher();
        const operation = getOperation();
        const input = messageInput.value;
        const key = keyInput.value;
        const result = operation === 'encrypt'
            ? cipher.encrypt(input, key)
            : cipher.decrypt(input, key);

        if (result instanceof Uint8Array) {
            encryptedOutput.value = operation === 'encrypt'
                ? Array.from(result).map(n => n.toString(16).padStart(2, '0')).join('')
                : new TextDecoder().decode(result);
        } else {
            encryptedOutput.value = result;
        }
    } catch (error) {
        encryptedOutput.value = '';
        showError(`No se pudo procesar el texto: ${error.message}`);
    }
}

function scheduleCipher() {
    updateCounts();
    clearTimeout(autoRunTimer);
    autoRunTimer = setTimeout(runCipher, 250);
}

actionBtn.addEventListener('click', runCipher);
generateKeyBtn.addEventListener('click', createRandomKey);
messageInput.addEventListener('input', scheduleCipher);
keyInput.addEventListener('input', scheduleCipher);

selectCipher();
updateInterface();
updateCounts();
