// algorithms/transposition.js

import { Cipher } from "../cipher.js";

export class UninterruptedTransposition extends Cipher {
    encrypt(text, key) {
        const keyNumber = transformKey(key);
        const textChars = normalizeText(text);
        const columns = keyNumber.length;
        const rows = Math.ceil(textChars.length / columns);
        const cipherText = [];

        for (let number = 1; number <= columns; number++) {
            const column = keyNumber.indexOf(number);

            for (let row = 0; row < rows; row++) {
                const index = row * columns + column;

                if (index < textChars.length) {
                    cipherText.push(textChars[index]);
                }
            }
        }

        return cipherText.join("");
    }

    decrypt(cipherText, key) {
        const keyNumber = transformKey(key);
        const cipherChars = normalizeText(cipherText);
        const columns = keyNumber.length;
        const fullRows = Math.floor(cipherChars.length / columns);
        const remainder = cipherChars.length % columns;
        const plainChars = new Array(cipherChars.length);
        let position = 0;

        for (let number = 1; number <= columns; number++) {
            const column = keyNumber.indexOf(number);
            const columnLength = fullRows + (column < remainder ? 1 : 0);

            for (let row = 0; row < columnLength; row++) {
                plainChars[row * columns + column] = cipherChars[position++];
            }
        }

        return plainChars.join("");
    }
}

export class InterruptedTransposition extends Cipher {
    encrypt(text, key) {
        const keyNumber = transformKey(key);
        const textChars = normalizeText(text);
        const columns = keyNumber.length;
        const matrix = [];

        let position = 0;
        let rowIndex = 0;

        while (position < textChars.length) {
            const rowNumber = (rowIndex % columns) + 1;
            const rowLength = keyNumber.indexOf(rowNumber) + 1;
            const row = new Array(rowLength).fill(null);

            for (let column = 0; column < rowLength && position < textChars.length; column++) {
                row[column] = textChars[position++];
            }

            matrix.push(row);
            rowIndex++;
        }

        const cipherText = [];

        for (let number = 1; number <= columns; number++) {
            const column = keyNumber.indexOf(number);

            for (const row of matrix) {
                if (column < row.length && row[column] !== null) {
                    cipherText.push(row[column]);
                }
            }
        }

        return cipherText.join("");
    }

    decrypt(cipherText, key) {
        const keyNumber = transformKey(key);
        const cipherChars = normalizeText(cipherText);
        const columns = keyNumber.length;
        const rowLengths = [];
        let remaining = cipherChars.length;
        let rowIndex = 0;

        while (remaining > 0) {
            const rowNumber = (rowIndex % columns) + 1;
            const rowLength = keyNumber.indexOf(rowNumber) + 1;
            const length = Math.min(rowLength, remaining);
            rowLengths.push(length);
            remaining -= length;
            rowIndex++;
        }

        const rows = rowLengths.map(length => new Array(length));
        let position = 0;

        for (let number = 1; number <= columns; number++) {
            const column = keyNumber.indexOf(number);

            for (let row = 0; row < rows.length; row++) {
                if (column < rows[row].length) {
                    rows[row][column] = cipherChars[position++];
                }
            }
        }

        return rows.map(row => row.join("")).join("");
    }
}

function normalizeText(text) {
    return Array.from(String(text).toUpperCase().replaceAll(/\s+/g, ""));
}

function transformKey(key) {
  const normalizedKey = String(key).trim();

  if (!normalizedKey) {
    throw new Error("La clave de transposición no puede estar vacía.");
  }

  const letters = Array.from(normalizedKey.toUpperCase());

  const ordenadas = letters
    .map((letter, index) => ({ letter, index }))
    .sort((a, b) =>
      a.letter.localeCompare(b.letter) || a.index - b.index
    );

  const numberKey = new Array(letters.length);

  ordenadas.forEach((item, index) => {
    numberKey[item.index] = index + 1;
  });

  return numberKey;
}
