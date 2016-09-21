angular.module('app.controllers', [])
   .controller('formCtrl', function($scope) {



   	 $scope.clientSideList = [
    { text: "Si", value: true },
    { text: "No", value: false }
  ];
   $scope.data = {
    clientSide: false
  };

    $scope.submit=function(username){
    	alert("Hello "+username);
    }
});