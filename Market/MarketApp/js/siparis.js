
var siparisApp = angular.module('siparisApp', []);

siparisApp.controller("myCtrl", function ($scope, $http, $timeout) {

    $scope.tedarikciler = [];
    $scope.tedarikci = {};
    $scope.urunler = [];
    $scope.urun = {};
    $scope.siparis = [];
    $scope.newMode = true;
    $scope.data = { tedarikci_adi: "", kalemler: [] };

    $scope.yeni = function () {
        $scope.data = { tedarikci_adi: "", kalemler: [] };
        $scope.newMode = true;
        $("#myModal").modal('show');
    }

    $scope.kaydet = function () {
        //$scope.data.siparis_tarihi = $scope.data.siparis_tarihi.toISOString().slice(0, 19).replace('T', ' ');
        $scope.data.siparis_id = $scope.siparis.length + 1;
        $http({ method: "post", url: "http://localhost:3000/siparisEkle", data: $scope.data }).
            then(function (response) {
                $scope.listele();
            }, function (response) {
            });
        $("#myModal").modal('hide');
    }

    $scope.malKabul = function (data) {
        $scope.data.siparis_id = $scope.siparis.length + 1;
        $http({ method: "post", url: "http://localhost:3000/siparisMalKabul", data: data }).
            then(function (response) {
                data.Record.durum = "Sipariş kabul edildi";
                $http({ method: "post", url: "http://localhost:3000/siparisDurumGuncelle", data: data }).
                    then(function (response) {
                        $scope.listele();
                    }, function (response) {
                    });
            }, function (response) {
            });
    }

    $scope.gettedarikciler = function () {
        $http({ method: "get", url: "http://localhost:3000/tedarikciler" }).
            then(function (response) {
                $scope.tedarikciler = response.data.data;
            }, function (response) {
            });
    }

    $scope.getUrunler = function () {
        $http({ method: "get", url: "http://localhost:3000/urunler" }).
            then(function (response) {
                $scope.urunler = response.data.data;
            }, function (response) {
            });
    }

    $scope.settedarikci = function (m) {
        $scope.data.tedarikci_id = m.tedarikci_id;
        $scope.data.tedarikci_adi = m.tedarikci_adi;
    }

    $scope.yeniSatir = function () {
        $scope.data.kalemler.push({ urun_id: 0, urun_adi: "", urun_miktar: 0 });
    }

    $scope.kritikUrunler = function () {
        $http({ method: "get", url: "http://localhost:3000/kritikUrunler" }).
            then(function (response) {
                $scope.data.kalemler = response.data.data;
            }, function (response) {
            });
    }

    $scope.setUrun = function (urun, satir) {
        satir.urun_id = urun.urun_id;
        satir.urun_adi = urun.urun_adi;
        satir.urun_fiyat = urun.urun_fiyat;
        satir.urun_mevcut_miktar = urun.urun_miktar;
        satir.urun_kritik_miktar = urun.urun_kritik_miktar;
    }

    $scope.setMiktarFiyat = function (satir) {
        //satir.urun_tutar = satir.urun_fiyat * satir.urun_miktar;
    }

    $scope.listele = function () {
        $http({ method: "get", url: "http://localhost:3000/siparisler" }).
            then(function (response) {
                $scope.siparis = response.data.data;
                console.log($scope.siparis);
            }, function (response) {
            });
    }

    $scope.sil = function (data) {
        if (confirm('Kaydı silmek istediğinize emin misiniz ?')) {
            $http({ method: "post", url: "http://localhost:3000/siparisSil", data: data }).
                then(function (response) {
                    $scope.listele();
                }, function (response) {
                });
        }
    }

    $scope.guncelle = function (data) {
        $scope.newMode = false;
        $scope.data = { tedarikci_adi: data.Record.tedarikci_adi };
        $scope.data.kalemler = data.Record.kalemler;
        for (let index = 0; index < $scope.data.kalemler.length; index++) {
            $scope.data.kalemler[index].urun_miktar = parseFloat($scope.data.kalemler[index].urun_miktar);
        }
        console.log($scope.data);
        $("#myModal").modal('show');
    }

    $scope.listele();
    $scope.gettedarikciler();
    $scope.getUrunler();

});

