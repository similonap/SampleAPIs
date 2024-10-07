const crypto = require('crypto');


const algorithm = 'aes-256-cbc';
const key = Buffer.from("f2a2e745ed42b4f924c1c8983701b629d868ec7ec43042230d429e29fad2f34b", "hex");
const iv = Buffer.from("1916ff7af5c71cbfb46688c10a70ed7a", "hex");


// Function to encrypt text
function encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

// Function to decrypt text
function decrypt(encryptedText) {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = {
    encrypt,
    decrypt
}