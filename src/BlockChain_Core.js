var crypto = require('crypto');

class Block {
    constructor(index, data, previousHash = '0', timestamp, nonce=0) {
        this.index = index;
        if(timestamp == null){
            this.timestamp = Math.floor(Date.now() / 1000); // Unix timestamp
        }else{
            this.timestamp = timestamp;
        }
        this.data = data;
        this.previousHash = previousHash;
        this.nonce = nonce;
        this.hash = this.calculateHash();

        this.difficulty = 5;
    }


    calculateHash() {
        return crypto
          .createHash('sha256')
          .update(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce)
          .digest('hex');
    }

    mineBlock(difficulty) {
        this.difficulty = difficulty;

        const startTime = Date.now();
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        const endTime = Date.now();
        console.log(`Block mined: ${this.hash}`);
        console.log(`Mining took ${(endTime - startTime) / 1000} seconds`);
    }
    
    getBlock(){
        return { 
            hash: this.hash,
            index: this.index,
            nonce: this.nonce,
            difficulty: this.difficulty,
            data: this.data,
            timestamp: this.timestamp,
            previousHash: this.previousHash,
        }
    }
}

class Blockchain {
    constructor(Blockchain){
        this.difficulty = 5; // Adjust difficulty as needed

        if (Blockchain != null && Blockchain.length > 0) {
            this.chain = Blockchain;
        }else{
            this.chain = [this.CreateGenisBlock()]
        }
    }

    CreateGenisBlock(){
        var newBlock = new Block(0, [], '0');
        newBlock.mineBlock(this.difficulty);
        return newBlock.getBlock()
    }

    getLeastBlock(){
        return this.chain[this.chain.length - 1];
    }

    addBlock(data, timestamp, index, previousHash){
        var index = this.getLeastBlock().index + 1;
        if (previousHash == null) {
            previousHash = this.getLeastBlock().hash
        }
        var newBlock = new Block(index, data, previousHash, timestamp);
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock.getBlock())
    }

    hash(block){
        // this.index + this.previousHash + this.timestamp + JSON.stringify(this.data)
        return crypto.createHash('sha256')
            .update( block.index + block.previousHash +block.timestamp + JSON.stringify(block.data))
            .digest('hex')
    }

    vaildate(){
        for (let i = 1; i < this.chain.length; i++) {
            var cureentBlock = this.chain[i];
            var preivousBlock = this.chain[i -1];

            if (cureentBlock.hash !== this.hash(cureentBlock)) {
                console.log(cureentBlock.hash +" "+ this.hash(cureentBlock))
                return false
            }

            if (cureentBlock.previousHash !== this.hash(preivousBlock)) {
                return false
            }
        }

        return true
    }
}

module.exports = {
    Block: Block,
    Blockchain: Blockchain
}