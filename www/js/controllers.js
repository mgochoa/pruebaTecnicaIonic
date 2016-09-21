angular.module('app.controllers', [])
   .controller('formCtrl', function($scope,$cordovaCamera) {
      document.addEventListener("deviceready", function () {

    var opciones = {
      quality: 50,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: true,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 100,
      targetHeight: 100,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false,
    correctOrientation:true
    };

    $cordovaCamera.getPicture(opciones).then(function(imageData) {
      var image = document.getElementById('myImage');
      image.src = "data:image/jpeg;base64," + imageData;
    }, function(err) {
      // error
    });

  }, false);


$scope.user={
  name:"",
  email:""
}
$scope.options={
    availableOptions: [
      {id: '1', name: 'Antioquia'},
      {id: '2', name: 'Cuindinamarca'}
    ],
    selectedOptionDep: {id: '1', name: 'Antioquia'},
     availabeCitiesAntioquia:[
     	 {id: '1', name: 'Medellin'},
      {id: '2', name: 'Envigado'},
      {id: '3', name: 'La ceja'}
     	],
     	availabeCitiesCundiamarca:[
     	 {id: '1', name: 'Bogota DC'},
      {id: '2', name: 'Fontibon'},
      {id: '3', name: 'Suba'}
     	],
     	selectedOptionCityAnt: {id: '1', name: 'Medellin'},
      selectedOptionCityCund: {id: '1', name: 'Bogota DC'}
    };


   	$scope.nacimiento={
      valor:false
    }

    $scope.submit=function(){
      
      alert("Hello "+$scope.user.name+"\n email:"+$scope.user.email+"\n Colombiano: "+ $scope.nacimiento.valor +
        "\n Departamento: "+ $scope.options.selectedOptionDep.name);
    }
});