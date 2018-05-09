const express = require('express');
const app = express();
const DEBUGPREFIX = "DEBUG: ";
const bodyParser = require('body-parser');
const cors = require('cors');
const dateFormat = require('dateformat');
const mysql = require('mysql');
const http = require('http');

//config begin

var config = {
    mysqlHost: "localhost",
    mysqlUser: "root",
    mysqlPassword: "root",
    mysqlDb: "tezmarket",
    createDB: false // ilk çalıştırmada true olarak ayarlanmalı.
};

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

// db functions begin

function getMySQLConnection() {
    var con = mysql.createConnection({
        host: config.mysqlHost,
        user: config.mysqlUser,
        password: config.mysqlPassword
    });
    return con;
}

function getMySQLConnectionWithDb() {
    var con = mysql.createConnection({
        host: config.mysqlHost,
        user: config.mysqlUser,
        password: config.mysqlPassword,
        database: config.mysqlDb
    });
    return con;
}

function createDb() {
    var con = getMySQLConnection();
    con.connect(function (err) {
        if (err) throw err;

        con.query("CREATE DATABASE " + config.mysqlDb + " CHARACTER SET utf8 COLLATE utf8_general_ci", function (err, result) {
            if (err) throw err;
            debug("Database created");
            con = getMySQLConnectionWithDb();

            var sql = "CREATE TABLE urunler (urun_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, urun_adi VARCHAR(255), urun_cinsi VARCHAR(255), urun_fiyat FLOAT, urun_miktar FLOAT, urun_kritik_miktar FLOAT)";
            con.query(sql, function (err, result) {
                if (err) throw err;
                debug("urunler table created");

                var sql = "CREATE TABLE musteriler (musteri_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, musteri_adi VARCHAR(255), musteri_telefon VARCHAR(255), musteri_adres VARCHAR(255), musteri_vergi_dairesi VARCHAR(255), musteri_vergi_no VARCHAR(255))";
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    debug("musteriler table created");

                    var sql = "CREATE TABLE tedarikciler (tedarikci_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, tedarikci_adi VARCHAR(255), tedarikci_telefon VARCHAR(255), tedarikci_adres VARCHAR(255), tedarikci_vergi_dairesi VARCHAR(255), tedarikci_vergi_no VARCHAR(255))";
                    con.query(sql, function (err, result) {
                        if (err) throw err;
                        debug("tedarikciler table created");
                    });

                    var sql = "CREATE TABLE satis_faturasi (fatura_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, fatura_tarihi DATE, musteri_id INT, musteri_adi VARCHAR(255), musteri_telefon VARCHAR(255), musteri_adres VARCHAR(255), musteri_vergi_dairesi VARCHAR(255), musteri_vergi_no VARCHAR(255))";
                    con.query(sql, function (err, result) {
                        if (err) throw err;
                        debug("satis_faturasi table created");

                        var sql = "CREATE TABLE satis_faturasi_kalem (fatura_kalem_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, fatura_id INT, urun_id INT, urun_adi VARCHAR(255), urun_miktar FLOAT, urun_fiyat FLOAT, urun_tutar FLOAT)";
                        con.query(sql, function (err, result) {
                            if (err) throw err;
                            debug("satis_faturasi_kalem table created");

                            var sql = "CREATE TABLE siparis (siparis_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, siparis_tarihi DATE, tedarikci_id INT, tedarikci_adi VARCHAR(255), tedarikci_telefon VARCHAR(255), tedarikci_adres VARCHAR(255), tedarikci_vergi_dairesi VARCHAR(255), tedarikci_vergi_no VARCHAR(255), siparis_durum VARCHAR(255))";
                            con.query(sql, function (err, result) {
                                if (err) throw err;
                                debug("siparis table created");

                                var sql = "CREATE TABLE siparis_kalem (siparis_kalem_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, siparis_id INT,urun_id INT, urun_adi VARCHAR(255), urun_miktar FLOAT, urun_fiyat FLOAT, urun_tutar FLOAT)";
                                con.query(sql, function (err, result) {
                                    if (err) throw err;
                                    debug("siparis_kalem table created");
                                });
                            });

                        });
                    });
                });
            });
        });

        debug("Connected!");
    });
}

// db functions end


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
    var data = { "peers": ["peer0.market.tedarikzinciri.com", "peer1.market.tedarikzinciri.com"] };
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
    req.write("username=admin&orgName=market");
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
        "peers": ["peer0.market.tedarikzinciri.com", "peer1.market.tedarikzinciri.com"],
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
        "peers": ["peer0.market.tedarikzinciri.com", "peer1.market.tedarikzinciri.com"],
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
        path: "/channels/mychannel/chaincodes/mycc?peer=peer0.market.tedarikzinciri.com&fcn=queryAllSiparisler&args=%5B%22a%22%5D",
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



if (config.createDB) {
    createDb();
}
enrollToChain();

app.post('/urunEkle', function (req, res) {
    var data = req.body;
    var con = getMySQLConnectionWithDb();
    var sql = "insert into  urunler ( urun_adi , urun_cinsi, urun_fiyat , urun_miktar , urun_kritik_miktar ) values ('" +
        data.urun_adi + "', '" + data.urun_cinsi + "', " + data.urun_fiyat + ", " + data.urun_miktar + ", " + data.urun_kritik_miktar + ")";
    con.query(sql, function (err, result) {
        if (err) throw err;
        debug("urun eklendi : " + JSON.stringify(data));
        res.json(200, { "result": "ok" });
    });
});

app.post('/urunGuncelle', function (req, res) {
    var data = req.body;
    var con = getMySQLConnectionWithDb();
    var sql = "update urunler set  urun_adi = '" + data.urun_adi + "', urun_cinsi = '" + data.urun_cinsi + "', urun_fiyat =" + data.urun_fiyat + ", urun_miktar =" + data.urun_miktar + ", urun_kritik_miktar = " + data.urun_kritik_miktar + " where urun_id = " + data.urun_id;
    con.query(sql, function (err, result) {
        if (err) throw err;
        debug("urun güncellendi : " + JSON.stringify(data));
        res.json(200, { "result": "ok" });
    });
});


app.get('/urunler', function (req, res) {
    var data = req.body;
    var con = getMySQLConnectionWithDb();
    var sql = "select * from urunler";
    con.query(sql, function (err, result) {
        if (err) throw err;
        res.json(200, { "data": result });
    });
});

app.get('/kritikUrunler', function (req, res) {
    var data = req.body;
    var con = getMySQLConnectionWithDb();
    var sql = "select * from urunler where urun_miktar <= urun_kritik_miktar";
    con.query(sql, function (err, result) {
        if (err) throw err;
        res.json(200, { "data": result });
    });
});

app.post('/urunSil', function (req, res) {
    var data = req.body;
    var con = getMySQLConnectionWithDb();
    var sql = "delete from urunler where urun_id = " + data.urun_id;
    con.query(sql, function (err, result) {
        if (err) throw err;
        debug("urun silindi : " + JSON.stringify(data));
        res.json(200, { "result": "ok" });
    });
});

app.post('/musteriEkle', function (req, res) {
    var data = req.body;
    debug("musteri eklendi : " + JSON.stringify(data));
    var con = getMySQLConnectionWithDb();
    var sql = "insert into  musteriler ( musteri_adi, musteri_telefon, musteri_adres, musteri_vergi_dairesi, musteri_vergi_no ) values ('" +
        data.musteri_adi + "', '" + data.musteri_telefon + "', '" + data.musteri_adres + "', '" + data.musteri_vergi_dairesi + "', '" + data.musteri_vergi_no + "')";
    con.query(sql, function (err, result) {
        if (err) throw err;
        debug("musteri eklendi : " + JSON.stringify(data));
        res.json(200, { "result": "ok" });
    });
});

app.post('/musteriGuncelle', function (req, res) {
    var data = req.body;
    var con = getMySQLConnectionWithDb();
    var sql = "update musteriler set  musteri_adi = '" + data.musteri_adi + "', musteri_telefon = '" + data.musteri_telefon + "', musteri_adres ='" + data.musteri_adres + "', musteri_vergi_dairesi ='" + data.musteri_vergi_dairesi + "', musteri_vergi_no = '" + data.musteri_vergi_no + "' where musteri_id = " + data.musteri_id;
    con.query(sql, function (err, result) {
        if (err) throw err;
        debug("musteri güncellendi : " + JSON.stringify(data));
        res.json(200, { "result": "ok" });
    });
});


app.get('/musteriler', function (req, res) {
    var data = req.body;
    var con = getMySQLConnectionWithDb();
    var sql = "select * from musteriler";
    con.query(sql, function (err, result) {
        if (err) throw err;
        res.json(200, { "data": result });
    });
});

app.post('/musteriSil', function (req, res) {
    var data = req.body;
    var con = getMySQLConnectionWithDb();
    var sql = "delete from musteriler where musteri_id = " + data.musteri_id;
    con.query(sql, function (err, result) {
        if (err) throw err;
        debug("musteri silindi : " + JSON.stringify(data));
        res.json(200, { "result": "ok" });
    });
});

app.post('/tedarikciEkle', function (req, res) {
    var data = req.body;
    debug("tedarikci eklendi : " + JSON.stringify(data));
    var con = getMySQLConnectionWithDb();
    var sql = "insert into  tedarikciler ( tedarikci_adi, tedarikci_telefon, tedarikci_adres, tedarikci_vergi_dairesi, tedarikci_vergi_no ) values ('" +
        data.tedarikci_adi + "', '" + data.tedarikci_telefon + "', '" + data.tedarikci_adres + "', '" + data.tedarikci_vergi_dairesi + "', '" + data.tedarikci_vergi_no + "')";
    con.query(sql, function (err, result) {
        if (err) throw err;
        debug("tedarikci eklendi : " + JSON.stringify(data));
        res.json(200, { "result": "ok" });
    });
});

app.post('/tedarikciGuncelle', function (req, res) {
    var data = req.body;
    var con = getMySQLConnectionWithDb();
    var sql = "update tedarikciler set  tedarikci_adi = '" + data.tedarikci_adi + "', tedarikci_telefon = '" + data.tedarikci_telefon + "', tedarikci_adres ='" + data.tedarikci_adres + "', tedarikci_vergi_dairesi ='" + data.tedarikci_vergi_dairesi + "', tedarikci_vergi_no = '" + data.tedarikci_vergi_no + "' where tedarikci_id = " + data.tedarikci_id;
    con.query(sql, function (err, result) {
        if (err) throw err;
        debug("tedarikci güncellendi : " + JSON.stringify(data));
        res.json(200, { "result": "ok" });
    });
});


app.get('/tedarikciler', function (req, res) {
    var data = req.body;
    var con = getMySQLConnectionWithDb();
    var sql = "select * from tedarikciler";
    con.query(sql, function (err, result) {
        if (err) throw err;
        res.json(200, { "data": result });
    });
});

app.post('/tedarikciSil', function (req, res) {
    var data = req.body;
    var con = getMySQLConnectionWithDb();
    var sql = "delete from tedarikciler where tedarikci_id = " + data.tedarikci_id;
    con.query(sql, function (err, result) {
        if (err) throw err;
        debug("tedarikci silindi : " + JSON.stringify(data));
        res.json(200, { "result": "ok" });
    });
});

function kalemlerEkle(fatura_id, kalemler, idx, callback) {
    var con = getMySQLConnectionWithDb();
    var sql = "insert into satis_faturasi_kalem (fatura_id, urun_id, urun_adi, urun_miktar, urun_fiyat, urun_tutar) values (" + fatura_id
        + ", " + kalemler[idx].urun_id + ", '" + kalemler[idx].urun_adi + "', " + kalemler[idx].urun_miktar + "," + kalemler[idx].urun_fiyat + "," + kalemler[idx].urun_tutar + ")";
    con.query(sql, function (err, result) {

        var sql = "update urunler set  urun_miktar = urun_miktar - " + kalemler[idx].urun_miktar + " where urun_id = " + kalemler[idx].urun_id;
        con.query(sql, function (err, result) {
            if (kalemler.length - 1 == idx) {
                callback();
            } else {
                kalemlerEkle(fatura_id, kalemler, idx + 1, callback);
            }
        });
    });
}

app.post('/satisEkle', function (req, res) {
    var data = req.body;
    debug("satis eklendi : " + JSON.stringify(data));
    var con = getMySQLConnectionWithDb();
    var sql = "insert into  satis_faturasi ( fatura_tarihi, musteri_id, musteri_adi, musteri_telefon, musteri_adres, musteri_vergi_dairesi, musteri_vergi_no ) values ('" + data.fatura_tarihi + "', " + data.musteri_id + ",   '" +
        data.musteri_adi + "', '" + data.musteri_telefon + "', '" + data.musteri_adres + "', '" + data.musteri_vergi_dairesi + "', '" + data.musteri_vergi_no + "')";
    con.query(sql, function (err, result) {
        if (err) throw err;

        var sql = "Select max(fatura_id) fatura_id from satis_faturasi";
        con.query(sql, function (err, result) {
            if (err) throw err;

            var fatura_id = result[0].fatura_id;
            kalemlerEkle(fatura_id, data.kalemler, 0, function () {
                debug("satis eklendi : " + JSON.stringify(data));
                res.json(200, { "result": "ok" });
            })
        });

    });
});


app.get('/satislar', function (req, res) {
    var data = req.body;
    var con = getMySQLConnectionWithDb();
    var sql = "select * from satis_faturasi";
    con.query(sql, function (err, result) {
        if (err) throw err;
        res.json(200, { "data": result });
    });
});

app.post('/satisKalemler', function (req, res) {
    var data = req.body;
    var con = getMySQLConnectionWithDb();
    var sql = "select * from satis_faturasi_kalem where fatura_id = " + req.body.fatura_id;
    con.query(sql, function (err, result) {
        if (err) throw err;
        res.json(200, { "data": result });
    });
});

app.post('/satisSil', function (req, res) {
    var data = req.body;
    var con = getMySQLConnectionWithDb();
    var sql = "delete from satis_faturasi where fatura_id = " + data.fatura_id;
    con.query(sql, function (err, result) {

        var sql = "delete from satis_faturasi_kalem where fatura_id = " + data.fatura_id;
        con.query(sql, function (err, result) {
            if (err) throw err;
            debug("satis silindi : " + JSON.stringify(data));
            res.json(200, { "result": "ok" });
        });

    });
});


function siparisKalemlerEkle(siparis_id, kalemler, idx, callback) {
    var con = getMySQLConnectionWithDb();
    var sql = "insert into siparis_kalem (siparis_id, urun_id, urun_adi, urun_miktar, urun_fiyat, urun_tutar) values (" + siparis_id
        + ", " + kalemler[idx].urun_id + ", '" + kalemler[idx].urun_adi + "', " + kalemler[idx].urun_miktar + "," + kalemler[idx].urun_fiyat + "," + kalemler[idx].urun_tutar + ")";
    con.query(sql, function (err, result) {
        if (kalemler.length - 1 == idx) {
            callback();
        } else {
            kalemlerEkle(siparis_id, kalemler, idx + 1, callback);
        }
    });
}

function siparisKalemleriStokaEkle(kalemler, idx, callback) {
    var con = getMySQLConnectionWithDb();
    var sql = "update urunler set urun_miktar = urun_miktar + " + kalemler[idx].urun_miktar + " where urun_adi = '"+kalemler[idx].urun_adi+"'";
    con.query(sql, function (err, result) {
        if (kalemler.length - 1 == idx) {
            callback();
        } else {
            siparisKalemleriStokaEkle(kalemler, idx + 1, callback);
        }
    });
}

app.post('/siparisEkle', function (req, res) {
    var data = req.body;
    debug("siparis eklendi : " + JSON.stringify(data));
    createSiparisOnChain(data, function (result) {
        res.json(200, { "result": "ok" });
    });   
});


app.post('/siparisDurumGuncelle', function (req, res) {
    var data = req.body;
    debug("siparis güncellendi : " + JSON.stringify(data));
    siparisDurumGuncelle(data, function (result) {
        res.json(200, { "result": "ok" });
    });   
});

app.post('/siparisMalKabul', function (req, res) {
    var data = req.body;
    debug("siparis stoğa eklendi : " + JSON.stringify(data));
    siparisKalemleriStokaEkle(data.Record.kalemler, 0, function(){
		res.json(200, { "result": "ok" });
	});
});


app.get('/siparisler', function (req, res) {
    getAllSiparislerOnChain(function (result) {
        res.json(200, { data: result });
    })
});


app.listen(3000, () => console.log('Market Uygulama Sunucusu Başlatıldı, Port No : 3000!'));
