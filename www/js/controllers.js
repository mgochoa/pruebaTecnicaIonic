angular.module('app.controllers', [])
    .controller('formCtrl', function($scope, $cordovaCamera, $cordovaImagePicker, $cordovaFile, $cordovaGeolocation, $ionicPopup, $ionicModal, $timeout, $ionicLoading) {

        //Inicializar variables
        $scope.forma = document.getElementById('myForm');
        var newPostKey;
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
                { id: '1', name: 'Medellín' },
                { id: '2', name: 'Envigado' },
                { id: '3', name: 'Itagüí' },
                { id: '4', name: 'Sabaneta' },
                { id: '5', name: 'Estrella' }
            ],
            availabeCitiesCundiamarca: [
                { id: '1', name: 'Bogota DC' },
                { id: '2', name: 'Fontibon' },
                { id: '3', name: 'Suba' },
                { id: '4', name: 'Zipaquira' },
                { id: '5', name: 'Girardot' }
            ],
            selectedOptionCityAnt: { id: '1', name: 'Medellin' },
            selectedOptionCityCund: { id: '1', name: 'Bogota DC' }
        };

        var storage;
        var storageRef;
        var imagesRef;
        var opciones;
        var optionsPicker;
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
            optionsPicker = {
                quality: 75,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,


                targetWidth: 512,
                targetHeight: 512


            };
            storage = firebase.storage();
            storageRef = storage.ref();
            imagesRef = storageRef.child('images');

        }, false);

        initLocation();
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
        $scope.pickImage = function() {
            // Image picker will load images according to these settings

            $cordovaCamera.getPicture(optionsPicker).then(function(imageData) {
                //var image = document.getElementById('myImage');
                $scope.myimage.file = b64toBlob(imageData, 'image/jpeg');;
                $scope.myimage.state = true;
                $scope.myimage.src = "data:image/jpeg;base64," + imageData;
            }, function(err) {
                // error
            });
        };


        function writeUserData(user, born, country, city, image) {
            newPostKey = firebase.database().ref().child('users').push().key;
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
                var uploadTask = storageRef.child("images/profile.jpg").put(image.file, metadata);
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

            }



        };




        $scope.submit = function() {



            // alert("Hello " + $scope.user.name + "\n email:" + $scope.user.email + "\n Colombiano: " + $scope.nacimiento.valor +
            //"\n Departamento: " + $scope.options.selectedOptionDep.name);

            $ionicLoading.show({
                template: 'Loading...'
            }).then(function() {
                console.log("The loading indicator is now displayed");
            });




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
            firebase.database().ref('users/' + newPostKey).on('value', function(snapshot) {
                $scope.u = snapshot.val();
                $scope.uimage = "";
                console.log($scope.u.image);

                if ($scope.u.image) {
                    firebase.storage().ref("images/profile.jpg").getDownloadURL().then(function(url) {
                        // Get the download URL for 'images/stars.jpg'
                        // This can be inserted into an <img> tag
                        // This can also be downloaded directly
                        console.log(url);
                        $scope.uimage = url;
                    }).catch(function(error) {
                        // Handle any errors
                    });
                }

            });
            $ionicLoading.hide().then(function() {
                console.log("The loading indicator is now hidden");
            });
            $ionicModal.fromTemplateUrl('my-modal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.modal = modal;
            });
            $timeout(function() {
                $scope.modal.show();
            }, 0)

        };

        function initLocation() {

            var posOptions = { timeout: 10000, enableHighAccuracy: false };
            $cordovaGeolocation
                .getCurrentPosition(posOptions)
                .then(function(position) {
                    var lat = position.coords.latitude
                    var long = position.coords.longitude

                    var geocoder = new google.maps.Geocoder;
                    geocoder.geocode({ 'location': { lat: lat, lng: long } }, function(results, status) {
                        if (status === google.maps.GeocoderStatus.OK) {
                            if (results[1]) {
                                console.log(results[1].formatted_address);
                                var ciudad = document.getElementById('cuerpo');
                                if (results[1].formatted_address.includes("Medellín")) {
                                    var alertPopup = $ionicPopup.alert({
                                        title: 'Ubicación',
                                        template: 'Usted está en Medellín'
                                    });

                                    alertPopup.then(function(res) {
                                        ciudad.style.backgroundColor = "#4CAF50";
                                    });



                                } else if (results[1].formatted_address.includes("Envigado")) {

                                    var alertPopup = $ionicPopup.alert({
                                        title: 'Ubicación',
                                        template: 'Usted está en Envigado'
                                    });

                                    alertPopup.then(function(res) {
                                        ciudad.style.backgroundColor = "#CDDC39";
                                    });




                                } else {
                                    var alertPopup = $ionicPopup.alert({
                                        title: 'Ubicación',
                                        template: results[1].formatted_address
                                    });

                                    alertPopup.then(function(res) {

                                    });

                                }

                            } else {
                                alert('No results found');
                            }
                        } else {
                            alert('Geocoder failed due to: ' + status);
                        }
                    });
                }, function(err) {
                    // error
                });

            // handle event
            //console.log("State Params: ", data.stateParams);
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
            };

            var blob = new Blob(byteArrays, { type: contentType });
            return blob;
        };



        //Fin
    });
