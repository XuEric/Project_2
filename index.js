const {Block, Blockchain} = require("./simpleChain");
const express = require('express');
const bodyParser = require('body-parser');


let bc = new Blockchain();

const app = express();

app.use(bodyParser.json());

app.get('/block/:blockId', function getBlock(req, res) {
    console.log('GET request to the block:' + req.params.blockId);

    bc.getBlock(req.params.blockId).then(value => {
        res.send(value);
    }).catch(err => {
        console.log("get block with error:" + err);
        res.status(500).send("get block with error:" + err);
    });
});

app.post('/block', function addBlock(req, res) {
    console.log(req.body.body);

    let added = -1;
    bc.addBlock(new Block(req.body.body)).then(height => {
        console.log("block added:" + height);
        added = height;
    }).catch(err => {
        console.log("add with error:" + err);
        res.status(500).send("get block with error:" + err);
    });

    console.log("get block for return:" + added);
    setTimeout(function () {
        bc.getBlock(added).then(b => {
            res.send(b);
        }).catch(err => {
            console.log("get block with error:" + err);
            res.status(500).send("get block with error:" + err);
        });
    }, 500);
});

app.listen(8000, () => console.log('Example app listening on port 8000!'));

