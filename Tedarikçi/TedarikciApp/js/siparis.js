
var siparisApp = angular.module('siparisApp', []);

siparisApp.controller("myCtrl", function ($scope, $http, $timeout) {

    $scope.tedarikciler = [];
    $scope.tedarikci = {};
    $scope.urunler = [];
    $scope.urun = {};
    $scope.siparis = [];
    $scope.newMode = true;
    $scope.data = { tedarikci_adi: "", kalemler: [] };

    $scope.listele = function () {
        $http({ method: "get", url: "http://localhost:3001/siparisler" }).
            then(function (response) {
                $scope.siparis = response.data.data;
                console.log($scope.siparis);
            }, function (response) {
            });
    }


    $scope.guncelle = function (data) {
        $scope.data = { tedarikci_adi: data.Record.tedarikci_adi };
        $scope.data.kalemler = data.Record.kalemler;
        for (let index = 0; index < $scope.data.kalemler.length; index++) {
            $scope.data.kalemler[index].urun_miktar = parseFloat($scope.data.kalemler[index].urun_miktar);
        }
        console.log($scope.data);
        $("#myModal").modal('show');
    }

    $scope.siparisGonder = function (data) {
        if (confirm('Dikkat : Siparişi göndermek istediğinize emin misiniz ?')) {
            data.Record.durum = "Gönderildi";
            $http({ method: "post", url: "http://localhost:3001/siparisDurumGuncelle", data: data }).
                then(function (response) {
                    $scope.listele();
                }, function (response) {
                });
        }
    }

    $scope.listele();

});

