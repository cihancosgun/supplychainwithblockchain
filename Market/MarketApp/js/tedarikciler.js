
var tedarikcilerApp = angular.module('tedarikcilerApp', []);

tedarikcilerApp.controller("myCtrl", function ($scope, $http, $timeout) {

    $scope.tedarikciler = [];
    $scope.newMode = true;
    $scope.data = { tedarikci_adi: "", tedarikci_adres: "", tedarikci_telefon: "", tedarikci_vergi_dairesi: "", tedarikci_vergi_no: "" };

    $scope.yeni = function () {
        $scope.data = { tedarikci_adi: "", tedarikci_adres: "", tedarikci_telefon: "", tedarikci_vergi_dairesi: "", tedarikci_vergi_no: "" };
        $scope.newMode = true;
        $("#myModal").modal('show');
    }

    $scope.kaydet = function () {

        $http({ method: "post", url: "http://localhost:3000/" + ($scope.newMode ? "tedarikciEkle" : "tedarikciGuncelle"), data: $scope.data }).
            then(function (response) {
                $scope.listele();
            }, function (response) {
                // $scope.data = response.data || 'Request failed';
                // $scope.status = response.status;
            });
        $("#myModal").modal('hide');
    }

    $scope.listele = function () {
        $http({ method: "get", url: "http://localhost:3000/tedarikciler" }).
            then(function (response) {
                $scope.tedarikciler = response.data.data;
            }, function (response) {
            });
    }

    $scope.sil = function (data) {
        if (confirm('Kaydı silmek istediğinize emin misiniz ?')) {
            $http({ method: "post", url: "http://localhost:3000/tedarikciSil", data: data }).
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

