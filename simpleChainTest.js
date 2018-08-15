const {Block, Blockchain} = require("./simpleChain");

let bc = new Blockchain();

// bc.getBlock(3).then(value => {
//     console.log(value);
// });

bc.getBlockHeight().then(value => {
    console.log("height:" + value);
});

testBuildBlock();

// testValidation();

function testBuildBlock() {
    (function theLoop(i) {
        setTimeout(function () {
            bc.addBlock(new Block("test block")).then(
                value => {
                    console.log("height:" + value + "added.");
                }
            );
            // bc.dumpChain();
            // bc.validateChain();
            if (--i) theLoop(i);
        }, 500);
    })(10);
}

function testValidation() {
    let inducedErrorBlocks = [2, 4, 7];

    for (var i = 0; i < inducedErrorBlocks.length; i++) {
        let k = inducedErrorBlocks[i];

        bc.chain.get(k, function (err, value) {
            if (err) {
                return console.log('previous block Not found!', err);
            }

            let block = JSON.parse(value);

            block.body = 'induced chain error';
            let v = JSON.stringify(block);
            bc.chain.put(k, v, function (err) {
                if (err) return console.log('Block ' + k + ' submission failed', err);
                console.log("key:" + k + ",value:" + v + " added");
            })

        });
    }

    bc.validateChain();
}