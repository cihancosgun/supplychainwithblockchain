
var urunlerApp = angular.module('urunlerApp', []);

urunlerApp.controller("myCtrl", function ($scope, $http, $timeout) {

    $scope.urunler = [];
    $scope.newMode = true;
    $scope.data = { urun_adi: "", urun_cinsi: "", urun_miktar: 0, urun_fiyat: 0, urun_kritik_miktar: 0 };

    $scope.getUrunSatirClass = function (urun) {
        return urun.urun_miktar <= urun.urun_kritik_miktar ? { "background-color": "red" } : { "background-color": "white" };
    }

    $scope.yeni = function () {
        $scope.data = { urun_adi: "", urun_cinsi: "", urun_miktar: 0, urun_fiyat: 0, urun_kritik_miktar: 0 };
        $scope.newMode = true;
        $("#myModal").modal('show');
    }

    $scope.kaydet = function () {

        $http({ method: "post", url: "http://localhost:3000/" + ($scope.newMode ? "urunEkle" : "urunGuncelle"), data: $scope.data }).
            then(function (response) {
                $scope.listele();
            }, function (response) {
                // $scope.data = response.data || 'Request failed';
                // $scope.status = response.status;
            });
        $("#myModal").modal('hide');
    }

    $scope.listele = function () {
        $http({ method: "get", url: "http://localhost:3000/urunler" }).
            then(function (response) {
                $scope.urunler = response.data.data;
            }, function (response) {
            });
    }

    $scope.sil = function (data) {
        if (confirm('Kaydı silmek istediğinize emin misiniz ?')) {
            $http({ method: "post", url: "http://localhost:3000/urunSil", data: data }).
                then(function (response) {
                    $scope.listele();
                }, function (response) {
                });
        }
    }

    $scope.guncelle = function (data) {
        $scope.data = data;
        $scope.newMode = false;
        $("#myModal").modal('show');
    }

    $scope.listele();

});

