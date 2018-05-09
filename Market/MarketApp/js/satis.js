
var satisApp = angular.module('satisApp', []);

satisApp.controller("myCtrl", function ($scope, $http, $timeout) {

    $scope.musteriler = [];
    $scope.musteri = {};
    $scope.urunler = [];
    $scope.urun = {};
    $scope.satis = [];
    $scope.newMode = true;
    $scope.data = { fatura_tarihi: new Date(), musteri_adi: "", musteri_adres: "", musteri_telefon: "", musteri_vergi_dairesi: "", musteri_vergi_no: "", kalemler: [] };

    $scope.yeni = function () {
        $scope.data = { fatura_tarihi: new Date(), musteri_adi: "", musteri_adres: "", musteri_telefon: "", musteri_vergi_dairesi: "", musteri_vergi_no: "", kalemler: [] };
        $scope.newMode = true;
        $("#myModal").modal('show');
    }

    $scope.kaydet = function () {
        $scope.data.fatura_tarihi = $scope.data.fatura_tarihi.toISOString().slice(0, 19).replace('T', ' ');
        $http({ method: "post", url: "http://localhost:3000/" + ($scope.newMode ? "satisEkle" : "satisGuncelle"), data: $scope.data }).
            then(function (response) {
                $scope.listele();
            }, function (response) {
                // $scope.data = response.data || 'Request failed';
                // $scope.status = response.status;
            });
        $("#myModal").modal('hide');
    }

    $scope.getMusteriler = function () {
        $http({ method: "get", url: "http://localhost:3000/musteriler" }).
            then(function (response) {
                $scope.musteriler = response.data.data;
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

    $scope.setMusteri = function (m) {
        $scope.data.musteri_id = m.musteri_id;
        $scope.data.musteri_adi = m.musteri_adi;
        $scope.data.musteri_adres = m.musteri_adres;
        $scope.data.musteri_telefon = m.musteri_telefon;
        $scope.data.musteri_vergi_dairesi = m.musteri_vergi_dairesi;
        $scope.data.musteri_vergi_no = m.musteri_vergi_no;
    }

    $scope.yeniSatir = function () {
        $scope.data.kalemler.push({ urun_id: 0, urun_adi: "", urun_miktar: 0, urun_fiyat: 0, urun_tutar: 0 });
    }

    $scope.setUrun = function (urun, satir) {
        satir.urun_id = urun.urun_id;
        satir.urun_adi = urun.urun_adi;
        satir.urun_fiyat = urun.urun_fiyat;
        satir.urun_mevcut_miktar = urun.urun_miktar;
        satir.urun_kritik_miktar = urun.urun_kritik_miktar;
    }

    $scope.setMiktarFiyat = function (satir) {
        satir.urun_tutar = satir.urun_fiyat * satir.urun_miktar;
        var kalan = satir.urun_mevcut_miktar - satir.urun_miktar;
        if (kalan < satir.urun_kritik_miktar) {
            alert("Dikkat : Ürün stoğu kritik miktarın altına iniyor! Kritik Miktar : " + satir.urun_kritik_miktar + " , Kalan : " + kalan);
        }

        if (kalan < 0) {
            alert("Dikkat : Ürün stoğu 0 ın altına düşemez! Kalan : " + kalan);
            satir.urun_miktar = 0;
            satir.urun_tutar = satir.urun_fiyat * satir.urun_miktar;
        }
    }

    $scope.listele = function () {
        $http({ method: "get", url: "http://localhost:3000/satislar" }).
            then(function (response) {
                $scope.satis = response.data.data;
            }, function (response) {
            });
    }

    $scope.sil = function (data) {
        if (confirm('Kaydı silmek istediğinize emin misiniz ?')) {
            $http({ method: "post", url: "http://localhost:3000/satisSil", data: data }).
                then(function (response) {
                    $scope.listele();
                }, function (response) {
                });
        }
    }

    $scope.guncelle = function (data) {

        $http({ method: "post", url: "http://localhost:3000/satisKalemler", data: { fatura_id: data.fatura_id } }).
            then(function (response) {
                data.kalemler = response.data.data;
                $scope.data = data;

                $scope.newMode = false;
                $("#myModal").modal('show');
            }, function (response) {
            });
    }

    $scope.listele();
    $scope.getMusteriler();
    $scope.getUrunler();

});

