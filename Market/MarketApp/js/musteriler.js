
var musterilerApp = angular.module('musterilerApp', []);

musterilerApp.controller("myCtrl", function ($scope, $http, $timeout) {

    $scope.musteriler = [];
    $scope.newMode = true;
    $scope.data = { musteri_adi: "", musteri_adres: "", musteri_telefon: "", musteri_vergi_dairesi: "", musteri_vergi_no: "" };

    $scope.yeni = function () {
        $scope.data = { musteri_adi: "", musteri_adres: "", musteri_telefon: "", musteri_vergi_dairesi: "", musteri_vergi_no: "" };
        $scope.newMode = true;
        $("#myModal").modal('show');
    }

    $scope.kaydet = function () {

        $http({ method: "post", url: "http://localhost:3000/" + ($scope.newMode ? "musteriEkle" : "musteriGuncelle"), data: $scope.data }).
            then(function (response) {
                $scope.listele();
            }, function (response) {
                // $scope.data = response.data || 'Request failed';
                // $scope.status = response.status;
            });
        $("#myModal").modal('hide');
    }

    $scope.listele = function () {
        $http({ method: "get", url: "http://localhost:3000/musteriler" }).
            then(function (response) {
                $scope.musteriler = response.data.data;
            }, function (response) {
            });
    }

    $scope.sil = function (data) {
        if (confirm('Kaydı silmek istediğinize emin misiniz ?')) {
            $http({ method: "post", url: "http://localhost:3000/musteriSil", data: data }).
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

