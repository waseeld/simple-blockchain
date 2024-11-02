var crypto = require('crypto');
var RaniDb = require("ranidb");
var { Blockchain } = require("./src/BlockChain_Core")
var wallets = require("./src/wallet")

var db = new RaniDb("./Node.json");

var BlockCha = new Blockchain(db.getAll())
// BlockCha.difficulty = 5;
var myWallet = new wallets("I love my room")
var AliWallet = new wallets("I love my f")

var Transactions = [
    myWallet.makeTransaction(AliWallet.getAddress(), 640),
    AliWallet.makeTransaction(myWallet.getAddress(), 556),
    myWallet.makeTransaction(AliWallet.getAddress(), 640),
    AliWallet.makeTransaction(myWallet.getAddress(), 511)
]
Transactions.forEach((tra, i) => {
    // var Isvalid = myWallet.verifyTransaction(tra.transaction, tra.signature)
    Transactions[i] = {
        index: i,
        hash: crypto.createHash('sha256').update(Transactions[i].index + JSON.stringify(tra.transaction) + tra.signature).digest('hex'),
        ...tra
    }
})

BlockCha.addBlock(Transactions)
db.save(BlockCha.chain)
// console.log(JSON.stringify(BlockCha.chain, null, 4))


console.log("Is the blockchain are validate ? " + BlockCha.vaildate())

console.log("myWallet")

console.log('Public Key:', myWallet.keys);
console.log('Address:', myWallet.getAddress());

console.log("\n\nAliWallet")

console.log('Public Key:', AliWallet.keys);
console.log('Address:', AliWallet.getAddress());