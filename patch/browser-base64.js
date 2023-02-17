"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encode = exports.decode = void 0;
var bytes_1 = require("@ethersproject/bytes");
/**
 * @desc Fix atob not exist error
 * @url https://github.com/ethers-io/ethers.js/issues/3460
 */
var Buffer = require('buffer/').Buffer;
function atob(str) {
    return Buffer.from(str, 'base64').toString('binary');
}
function btoa(str) {
    return Buffer.from(str, 'binary').toString('base64');
}
function decode(textData) {
    textData = atob(textData);
    var data = [];
    for (var i = 0; i < textData.length; i++) {
        data.push(textData.charCodeAt(i));
    }
    return (0, bytes_1.arrayify)(data);
}
exports.decode = decode;
function encode(data) {
    data = (0, bytes_1.arrayify)(data);
    var textData = "";
    for (var i = 0; i < data.length; i++) {
        textData += String.fromCharCode(data[i]);
    }
    return btoa(textData);
}
exports.encode = encode;
//# sourceMappingURL=browser-base64.js.map
