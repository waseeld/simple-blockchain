const crypto = require('crypto');
const EC = require('elliptic').ec;
const bs58 = require('bs58');

// Create an instance of the elliptic curve
const ec = new EC('secp256k1');

class Wallet {
    constructor(seed = null) {
        this.keys = this.createWallet(seed);
    }

    // Create a wallet with a seed, generating a public/private key pair
    createWallet(seed = null) {
        const seedBuffer = seed ? Buffer.from(seed, 'utf8') : crypto.randomBytes(32);
        // console.log('Seed Buffer:', seedBuffer.toString('hex'));

        const keyPair = ec.keyFromPrivate(seedBuffer);
        const publicKey = keyPair.getPublic('hex');
        const privateKey = keyPair.getPrivate('hex');

        // console.log('Generated Public Key:', publicKey);
        // console.log('Generated Private Key:', privateKey);

        return { publicKey, privateKey, seed: seedBuffer.toString('hex') };
    }

    // Generate an address from the public key
    getAddress() {
        const sha256Hash = crypto.createHash('sha256').update(this.keys.publicKey, 'hex').digest('hex');
        // Step 2: RIPEMD-160 hash of the SHA-256 hash
        const ripemd160Hash = crypto.createHash('ripemd160').update(sha256Hash).digest();
        const address = bs58.default.encode(ripemd160Hash);
        return address;
    }

    // Make a transaction and sign it
    makeTransaction(recipientAddress, amount) {
        const transaction = {
            sender: this.getAddress(),
            recipient: recipientAddress,
            amount,
            timestamp: Date.now()
        };

        const signature = this.signTransaction(transaction);
        return { transaction, signature };
    }

    // Sign a transaction with the private key
    signTransaction(transaction) {
        const keyPair = ec.keyFromPrivate(this.keys.privateKey, 'hex');
        const transactionHash = crypto.createHash('sha256').update(JSON.stringify(transaction)).digest();
        const signature = keyPair.sign(transactionHash);
        return signature.toDER('hex');
    }

    // Verify a transaction using the public key
    verifyTransaction(transaction, signature) {
        const keyPair = ec.keyFromPublic(this.keys.publicKey, 'hex');
        const transactionHash = crypto.createHash('sha256').update(JSON.stringify(transaction)).digest();
        return keyPair.verify(transactionHash, signature);
    }
}

// Example usage
// const seed = 'I love my room'; // Ensure this is a valid seed
// const myWallet = new Wallet(seed);
// console.log('Public Key:', myWallet.keys.publicKey);
// console.log('Private Key:', myWallet.keys.privateKey);
// console.log('Address:', myWallet.getAddress());

// const recipientAddress = 'recipientAddressExample';
// const { transaction, signature } = myWallet.makeTransaction(recipientAddress, 100);
// console.log('Transaction:', transaction);
// console.log('Signature:', signature);

// const isValid = myWallet.verifyTransaction(transaction, signature);
// console.log('Is transaction valid?', isValid);

module.exports = Wallet