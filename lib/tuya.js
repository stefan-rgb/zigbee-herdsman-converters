'use strict';

const dataTypes = {
    raw: 0, // [ bytes ]
    bool: 1, // [0/1]
    value: 2, // [ 4 byte value ]
    string: 3, // [ N byte string ]
    enum: 4, // [ 0-255 ]
    bitmap: 5, // [ 1,2,4 bytes ] as bits
};

const convertMultiByteNumberPayloadToSingleDecimalNumber = (chunks) => {
    // Destructuring "chunks" is needed because it's a Buffer
    // and we need a simple array.
    let value = 0;
    for (let i = 0; i < chunks.length; i++) {
        value = value << 8;
        value += chunks[i];
    }
    return value;
};

function getDataValue(dataType, data) {
    switch (dataType) {
    case dataTypes.raw:
        return data;
    case dataTypes.bool:
        return data[0] === 1;
    case dataTypes.value:
        return convertMultiByteNumberPayloadToSingleDecimalNumber(data);
    case dataTypes.string:
        // eslint-disable-next-line
        let dataString = '';
        // Don't use .map here, doesn't work: https://github.com/Koenkk/zigbee-herdsman-converters/pull/1799/files#r530377091
        for (let i = 0; i < data.length; ++i) {
            dataString += String.fromCharCode(data[i]);
        }
        return dataString;
    case dataTypes.enum:
        return data[0];
    case dataTypes.bitmap:
        return convertMultiByteNumberPayloadToSingleDecimalNumber(data);
    }
}

const convertDecimalValueTo4ByteHexArray = (value) => {
    const hexValue = Number(value).toString(16).padStart(8, '0');
    const chunk1 = hexValue.substr(0, 2);
    const chunk2 = hexValue.substr(2, 2);
    const chunk3 = hexValue.substr(4, 2);
    const chunk4 = hexValue.substr(6);
    return [chunk1, chunk2, chunk3, chunk4].map((hexVal) => parseInt(hexVal, 16));
};

module.exports = {
    getDataValue,
    dataTypes,
    convertDecimalValueTo4ByteHexArray,
};
