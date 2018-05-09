
'use strict';
const shim = require('fabric-shim');
const util = require('util');

let Chaincode = class {

  async Init(stub) {
    console.info('=========== Instantiated tedarikzinciri chaincode ===========');
    return shim.success();
  }

  async Invoke(stub) {
    let ret = stub.getFunctionAndParameters();
    console.info(ret);

    let method = this[ret.fcn];
    if (!method) {
      console.error('no function of name:' + ret.fcn + ' found');
      throw new Error('Received unknown function ' + ret.fcn + ' invocation');
    }
    try {
      let payload = await method(stub, ret.params);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }

  async querySiparis(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting SiparisNumber ex: Siparis01');
    }
    let SiparisNumber = args[0];

    let SiparisAsBytes = await stub.getState(SiparisNumber); //get the Siparis from chaincode state
    if (!SiparisAsBytes || SiparisAsBytes.toString().length <= 0) {
      throw new Error(SiparisNumber + ' does not exist: ');
    }
    console.log(SiparisAsBytes.toString());
    return SiparisAsBytes;
  }

  async initLedger(stub, args) {
    console.info('============= START : Initialize Ledger ===========');
    let Siparisler = [];
    Siparisler.push({
      tedarikci_adi: 'Tedarikçi 1',
      durum: 'Beklemede',
      kalemler: [{ urun_id: 1, urun_adi: 'Elma', urun_miktar: 1 }]
    });

    Siparisler.push({
      tedarikci_adi: 'Tedarikçi 1',
      durum: 'Beklemede',
      kalemler: [{ urun_id: 2, urun_adi: 'Armut', urun_miktar: 1 }]
    });

    for (let i = 0; i < Siparisler.length; i++) {
      Siparisler[i].docType = 'Siparis';
      await stub.putState('Siparis' + i, Buffer.from(JSON.stringify(Siparisler[i])));
      console.info('Added <--> ', Siparisler[i]);
    }
    console.info('============= END : Initialize Ledger ===========');
  }

  async createSiparis(stub, args) {
    //args : Beklenen : ["Siparis1","Tedarikçi1","Elma:5,Armut:2"]
    console.info('============= START : Create Siparis ===========');
    if (args.length != 3) {
      throw new Error('Incorrect number of arguments. Expecting 3');
    }
    var siparis_kalemler_str = args[2].split(',');//Elma:5,Armut:2 gibi bir veri alacak
    var siparis_kalemler = [];
    for (let index = 0; index < siparis_kalemler_str.length; index++) {
      const element = siparis_kalemler_str[index];
      const element_split = element.split(':');
      siparis_kalemler.push({ urun_adi: element_split[0], urun_miktar: element_split[1] });
    }

    var Siparis = {
      docType: 'Siparis',
      tedarikci_adi: args[1],
      durum: "Beklemede",
      kalemler: siparis_kalemler
    };

    await stub.putState(args[0], Buffer.from(JSON.stringify(Siparis)));
    console.info('============= END : Create Siparis ===========');
  }

  async queryAllSiparisler(stub, args) {

    let startKey = 'Siparis0';
    let endKey = 'Siparis999';

    let iterator = await stub.getStateByRange(startKey, endKey);

    let allResults = [];
    while (true) {
      let res = await iterator.next();

      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        console.log(res.value.value.toString('utf8'));

        jsonRes.Key = res.value.key;
        try {
          jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
        } catch (err) {
          console.log(err);
          jsonRes.Record = res.value.value.toString('utf8');
        }
        allResults.push(jsonRes);
      }
      if (res.done) {
        console.log('end of data');
        await iterator.close();
        console.info(allResults);
        return Buffer.from(JSON.stringify(allResults));
      }
    }
  }

  async changeSiparisStatus(stub, args) {
    console.info('============= START : changeSiparisStatus ===========');
    if (args.length != 2) {
      throw new Error('Incorrect number of arguments. Expecting 2');
    }

    let SiparisAsBytes = await stub.getState(args[0]);
    let Siparis = JSON.parse(SiparisAsBytes);
    Siparis.durum = args[1];

    await stub.putState(args[0], Buffer.from(JSON.stringify(Siparis)));
    console.info('============= END : changeSiparisStatus ===========');
  }
};

shim.start(new Chaincode());