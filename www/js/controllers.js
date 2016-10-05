angular.module('app.controllers', [])
    .controller('formCtrl', function($scope, $cordovaCamera) {

        //Inicializar variables
        $scope.forma=document.getElementById('myForm');
        $scope.myimage = {
            src: "img/people.jpg",
            file: null,
            state: false,
            name: "image"
        };
        var metadata = {
            contentType: 'image/jpeg'
        };
        $scope.user = {
            name: "",
            email: ""
        };
        $scope.nacimiento = {
            valor: false
        };
        $scope.options = {
            availableOptions: [
                { id: '1', name: 'Antioquia' },
                { id: '2', name: 'Cuindinamarca' }
            ],
            selectedOptionDep: { id: '1', name: 'Antioquia' },
            availabeCitiesAntioquia: [
                { id: '1', name: 'Medellin' },
                { id: '2', name: 'Envigado' },
                { id: '3', name: 'Itagui' },
                { id: '4', name: 'Sabaneta' },
                { id: '5', name: 'Estrella' },
                { id: '6', name: 'La ceja' },
                { id: '7', name: 'Rionegro' },
                { id: '8', name: 'Santa Fe de Antioquia' },
                { id: '9', name: 'Marinilla' }
            ],
            availabeCitiesCundiamarca: [
                { id: '1', name: 'Bogota DC' },
                { id: '2', name: 'Fontibon' },
                { id: '3', name: 'Suba' },
                { id: '4', name: 'Zipaquira' },
                { id: '5', name: 'Girardot' },
                { id: '6', name: 'Soacha' }
            ],
            selectedOptionCityAnt: { id: '1', name: 'Medellin' },
            selectedOptionCityCund: { id: '1', name: 'Bogota DC' }
        };

        var storage;
        var storageRef;
        var imagesRef;
        var opciones;
        var downloadURL;
        document.addEventListener("deviceready", function() {
            opciones = {
                quality: 75,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: false,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 512,
                targetHeight: 512,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false,
                correctOrientation: true
            };
            storage = firebase.storage();
            storageRef = storage.ref();
            imagesRef = storageRef.child('images');

        }, false);


        $scope.deletePhoto = function() {
            $scope.myimage.state = false;
            $scope.myimage.src = "img/people.jpg";
            $scope.myimage.file = null;

        };

        $scope.takePic = function() {
            $cordovaCamera.getPicture(opciones).then(function(imageData) {
                //var image = document.getElementById('myImage');
                $scope.myimage.file = b64toBlob(imageData, 'image/jpeg');;
                $scope.myimage.state = true;
                $scope.myimage.src = "data:image/jpeg;base64," + imageData;
            }, function(err) {
                // error
            });


        };


        function writeUserData(user, born, country, city, image) {
            var newPostKey = firebase.database().ref().child('users').push().key;
            var request = {
                username: user.name,
                email: user.email,
                country: country,
                city: city
            };
            if (born) {
                request["born"] = true;
            } else { request["born"] = false; }
            if (image.state) {
                request["image"] = true;

            } else {
                request["image"] = false;
            }
            firebase.database().ref('users/' + newPostKey).set(request);

            if (image.state == true) {
                var uploadTask = storageRef.child('images/' + newPostKey + '.jpg').put(image.file, metadata);
                //alert("Imagen:" + image);
                uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
                    function(snapshot) {
                        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('Upload is ' + progress + '% done');
                        switch (snapshot.state) {
                            case firebase.storage.TaskState.PAUSED: // or 'paused'
                                console.log('Upload is paused');
                                break;
                            case firebase.storage.TaskState.RUNNING: // or 'running'
                                console.log('Upload is running');
                                break;
                        }
                    },
                    function(error) {
                        switch (error.code) {
                            case 'storage/unauthorized':
                                // User doesn't have permission to access the object
                                alert("Sin permiso");
                                break;

                            case 'storage/canceled':
                                // User canceled the upload
                                alert("Cancelada");
                                break;

                            case 'storage/unknown':
                                // Unknown error occurred, inspect error.serverResponse
                                alert("Desconocido");
                                break;
                        }
                    },
                    function() {
                        // Upload completed successfully, now we can get the download URL
                        downloadURL = uploadTask.snapshot.downloadURL;
                    });

            } else {

                //Alerta no hay imagen.
                alert("No hay imagen");
            }



        };





        $scope.submit = function() {
           


                alert("Hello " + $scope.user.name + "\n email:" + $scope.user.email + "\n Colombiano: " + $scope.nacimiento.valor +
                    "\n Departamento: " + $scope.options.selectedOptionDep.name);
                if ($scope.options.selectedOptionDep.id == 1) {
                    writeUserData($scope.user,
                        $scope.nacimiento.valor,
                        $scope.options.selectedOptionDep.name,
                        $scope.options.selectedOptionCityAnt.name,
                        $scope.myimage
                    );
                } else {
                    writeUserData($scope.user,
                        $scope.nacimiento.valor,
                        $scope.options.selectedOptionDep.name,
                        $scope.options.selectedOptionCityCund.name,
                        $scope.myimage
                    );

                }
            
        };

        function b64toBlob(b64Data, contentType, sliceSize) {
            contentType = contentType || '';
            sliceSize = sliceSize || 512;

            var byteCharacters = atob(b64Data);
            var byteArrays = [];

            for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                var slice = byteCharacters.slice(offset, offset + sliceSize);

                var byteNumbers = new Array(slice.length);
                for (var i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }

                var byteArray = new Uint8Array(byteNumbers);

                byteArrays.push(byteArray);
            }

            var blob = new Blob(byteArrays, { type: contentType });
            return blob;
        };


        //Fin
    });
