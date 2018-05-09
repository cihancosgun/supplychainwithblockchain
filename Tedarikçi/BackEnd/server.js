const express = require('express');
const app = express();
const DEBUGPREFIX = "DEBUG: ";
const bodyParser = require('body-parser');
const cors = require('cors');
const dateFormat = require('dateformat');
const http = require('http');
 

var token = "";

//confi 
var debug = function (str) {
    console.log(DEBUGPREFIX + str);
};


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
var router = express.Router();
app.use('/', router);

app.get('/', function (req, res) {
    res.json(200, { "msg": "hello world" });
});


//chain functions begin
function joinToChainChannel() {
    console.log("joinToChainChannel called");
    var req = http.request({
        hostname: "localhost",
        port: 4000,
        path: "/channels/mychannel/peers",
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'authorization': 'Bearer ' + token
        }
    }, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
            console.log(data);
        });
        resp.on('end', () => {
            var result = JSON.parse(data)
            console.log("joinedToChainChannel" + data);
        });

    }).on("error", (err) => {
        console.error(err);
        throw err;
    });
    var data = { "peers": ["peer0.tedarikci1.tedarikzinciri.com", "peer1.tedarikci1.tedarikzinciri.com"] };
    req.write(JSON.stringify(data));
    req.end();
}

function enrollToChain() {
    var req = http.request({
        hostname: "localhost",
        port: 4000,
        path: "/users",
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    }, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            var result = JSON.parse(data)
            token = result.token;
            console.log(token);
        });

    }).on("error", (err) => {
        console.error(err);
        throw err;
    });
    req.write("username=admin&orgName=tedarikci1");
    req.end();
}

function createSiparisOnChain(data, callback) {
    console.log("createSiparisOnChain called");
    var req = http.request({
        hostname: "localhost",
        port: 4000,
        path: "/channels/mychannel/chaincodes/mycc",
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'authorization': 'Bearer ' + token
        }
    }, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
            console.log(data);
        });
        resp.on('end', () => {
            //var result = JSON.parse(data)
            console.log("createSiparisOnChain" + data);
            callback(data);
        });

    }).on("error", (err) => {
        console.error(err);
        throw err;
    });
    var kalemler = "";//"Elma:5,Armut:2"
    for (let index = 0; index < data.kalemler.length; index++) {
        const element = data.kalemler[index];
        kalemler = kalemler + element.urun_adi + ":" + element.urun_miktar + ",";
    }
    kalemler = kalemler.substring(0, kalemler.length - 1);
    var data = {
        "peers": ["peer0.tedarikci1.tedarikzinciri.com", "peer1.tedarikci1.tedarikzinciri.com"],
        "fcn": "createSiparis",
        "args": ["Siparis" + data.siparis_id, data.tedarikci_adi, kalemler]
    };
    console.log(data);
    req.write(JSON.stringify(data));
    req.end();
}

function siparisDurumGuncelle(data, callback) {
    console.log("siparisDurumGuncelle called");
    var req = http.request({
        hostname: "localhost",
        port: 4000,
        path: "/channels/mychannel/chaincodes/mycc",
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'authorization': 'Bearer ' + token
        }
    }, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
            console.log(data);
        });
        resp.on('end', () => {
            console.log("siparisDurumGuncelle" + data);
            callback(data);
        });

    }).on("error", (err) => {
        console.error(err);
        throw err;
    });
    var data = {
        "peers": ["peer0.tedarikci1.tedarikzinciri.com", "peer1.tedarikci1.tedarikzinciri.com"],
        "fcn": "changeSiparisStatus",
        "args": [data.Key, data.Record.durum]
    };
    console.log(data);
    req.write(JSON.stringify(data));
    req.end();
}

function getAllSiparislerOnChain(callback) {
    var req = http.request({
        hostname: "localhost",
        port: 4000,
        path: "/channels/mychannel/chaincodes/mycc?peer=peer0.tedarikci1.tedarikzinciri.com&fcn=queryAllSiparisler&args=%5B%22a%22%5D",
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'authorization': 'Bearer ' + token
        }
    }, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            var result = JSON.parse(data.replace('a now has ', '').replace(' after the move', ''));
            console.log(result);
            callback(result);
        });

    }).on("error", (err) => {
        console.error(err);
        throw err;
    });
    req.end();
}


//chain functions end


enrollToChain();

app.post('/siparisDurumGuncelle', function (req, res) {
    var data = req.body;
    debug("siparis güncellendi : " + JSON.stringify(data));
    siparisDurumGuncelle(data, function (result) {
        res.json(200, { "result": "ok" });
    });   
});


app.get('/siparisler', function (req, res) {
    getAllSiparislerOnChain(function (result) {
        res.json(200, { data: result });
    })
});


app.listen(3001, () => console.log('Tedarikçi Uygulama Sunucusu Başlatıldı, Port No : 3001!'));