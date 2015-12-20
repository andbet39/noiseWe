'use strict';

/**
 * @ngdoc function
 * @name nosieApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the nosieApp
 */
angular.module('nosieApp')
  .controller('MainCtrl', function ($http,$scope,$rootScope,$geolocation,$routeParams) {
 		
 		var API_KEY = 'e397e7163ac378374bc4a39ba11f8bbd';

 		$scope.searchString ="";
 		$scope.photos = [];
 		$scope.message  = "";
    $scope.myPosition = {};

    $scope.selectImage =false;
    $scope.writeMessage = true;
    $scope.messagePosted = false;

    $scope.carouselOpt ={
        navigation: true, 
        pagination: true, 
        rewindNav : false,
        items : 5,
        margin :5,
        loop:true

    }

    

 		var c;

      $geolocation.getCurrentPosition({
            timeout: 60000
         }).then(function(position) {
            $scope.myPosition = position;
         });


  		$scope.search = function(message){

            console.log(message);

            $scope.message=message;          
            $scope.selectImage=true;
            $scope.writeMessage=false;
  				//url ='https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key='+API_KEY+'&text='+$scope.searchString+'&format=json&nojsoncallback=1'
  		  	var url = 'https://api.flickr.com/services/rest/?method=flickr.interestingness.getList&&api_key='+API_KEY+'&format=json&nojsoncallback=1'
      			$http.get(url)
      					.then(function successCallback(response) {
          						console.log(response);
                      
                      $scope.photos = response.data.photos.photo;
                      var url  = 'https://farm'+$scope.photos[0].farm+'.staticflickr.com/'+$scope.photos[0].server+'/'+ $scope.photos[0].id +'_'+ $scope.photos[0].secret +'_z.jpg';
                      
                      shuffleArray($scope.photos);

                      $scope.create();
                      $scope.reloadCanvas(url);

      		 			}, function errorCallback(response) {
       
       			 });
  		}

      if($rootScope.message != ""){
         $scope.search($rootScope.message );
         $rootScope.message ="";

      }

  		$scope.imageClick = function(photo){

  			console.log(photo);
           	var url  = 'https://farm'+photo.farm+'.staticflickr.com/'+photo.server+'/'+ photo.id +'_'+ photo.secret +'_z.jpg';
            $scope.reloadCanvas(url);

  		}

  		$scope.reloadCanvas = function(image){

			      $scope.canvas.clear();

			      fabric.Image.fromURL(image, function(oImg) {
 
               if(oImg.width > oImg.height){
                oImg.scaleToHeight($scope.canvas.height);
              }else{
                oImg.scaleToWidth($scope.canvas.width);
              }
			       
			        oImg.hasBorders=false;
			        oImg.hasControls =false;
			        oImg.hasRotatingPoint= false;

			        $scope.canvas.setBackgroundImage(oImg);

			        $scope.canvas.renderAll();
			      },{'crossOrigin':'anonymous'});


			      var text =  new fabric.Text($scope.message, {
			        fontFamily: 'Arial Black',
			        fontSize:50,
			        left: $scope.canvas.width/2,
			        top: $scope.canvas.height/2 ,
			        hasBorders: false,
			        hasControls: false,
			        hasRotatingPoint: false
			      });

			      $scope.formatted = wrapCanvasText(text,$scope.canvas,$scope.canvas.width-50,$scope.canvas.height,'center');

			      $scope.formatted.fill = '#ffffff';

			      $scope.canvas.add($scope.formatted);

			      $scope.formatted.centerV();
			      $scope.formatted.centerH();

			      $scope.formatted.stroke = '#000000';
			      $scope.formatted.strokeWidth =  2;

			      $scope.canvas.renderAll();

   			 };

	   $scope.create = function () {

	        c = document.getElementById('c');
 
	        c.width = 500;
	        c.height = 500;//window.innerHeight-200;


	        $scope.canvas = new fabric.Canvas("c");
	        $scope.canvas.allowTouchScrolling= false;

	   };
    

    $scope.post = function (){


      if($rootScope.parse != true){
          console.log('initialize parse');
         Parse.initialize("dcG3cpe1HQAwfzKBV9Tsuxaici1AKlb3udRrx2Me", "1HHiju4wsBWeSlbJ7WSZw0YUTENuDUtk9ujwAXLe");
         $rootScope.parse = true;

      }

      var imgData = $scope.canvas.toDataURL('png');
      console.log(imgData);


      var file = new Parse.File("image.png", { base64: imgData });

      $scope.myPromise = file.save().then(function() {


        var point = new Parse.GeoPoint({latitude: $scope.myPosition.coords.latitude, longitude: $scope.myPosition.coords.longitude});

        var post = new Parse.Object("Post");
            post.set("message", $scope.message);
            post.set("file", file);
            post.set("location",point);
            post.set("owner",$rootScope.currentUser);
            post.set("favs",0);
            post.save().then(function(object){
                            console.log("Post saved");

                              $scope.messagePosted =true;
                              $scope.selectImage = false;
                              $scope.$apply();

                        },function(error){
                          console.log("Error saving post");
                        });


                  }, function(error) {
                      console.log("Errro saving file")

                  });   

              };


  })
  .directive("owlCarousel", function() {
    return {
        restrict: 'E',
        transclude: false,
        link: function (scope) {
            scope.initCarousel = function(element) {
              // provide any default options you want
                var defaultOptions = {
                };
                var customOptions = scope.$eval($(element).attr('data-options'));
                // combine the two options objects
                for(var key in customOptions) {
                    defaultOptions[key] = customOptions[key];
                }
                // init carousel
                $(element).owlCarousel(defaultOptions);
            };
        }
    };
})
.directive('owlCarouselItem', [function() {
    return {
        restrict: 'A',
        transclude: false,
        link: function(scope, element) {
          // wait for the last item in the ng-repeat then call init
            if(scope.$last) {
                scope.initCarousel(element.parent());
            }
        }
    };
}]);


var shuffleArray = function(array) {
  var m = array.length, t, i;

  // While there remain elements to shuffle
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}


function wrapCanvasText(t, canvas, maxW, maxH, justify) {

  if (typeof maxH === "undefined") {
    maxH = 0;
  }
  var words = t.text.split(" ");
  var formatted = '';

  // This works only with monospace fonts
  justify = justify || 'left';

  // clear newlines
  var sansBreaks = t.text.replace(/(\r\n|\n|\r)/gm, "");
  // calc line height
  var lineHeight = new fabric.Text(sansBreaks, {
    fontFamily: t.fontFamily,
    fontSize: t.fontSize
  }).height;

  // adjust for vertical offset
  var maxHAdjusted = maxH > 0 ? maxH - lineHeight : 0;
  var context = canvas.getContext("2d");


  context.font = t.fontSize + "px " + t.fontFamily;
  var currentLine = '';
  var breakLineCount = 0;

  var n = 0;
  while (n < words.length) {
    var isNewLine = currentLine == "";
    var testOverlap = currentLine + ' ' + words[n];

    // are we over width?
    var w = context.measureText(testOverlap).width;

    if (w < maxW) { // if not, keep adding words
      if (currentLine != '') currentLine += ' ';
      currentLine += words[n];
      // formatted += words[n] + ' ';
    } else {

      // if this hits, we got a word that need to be hypenated
      if (isNewLine) {
        var wordOverlap = "";

        // test word length until its over maxW
        for (var i = 0; i < words[n].length; ++i) {

          wordOverlap += words[n].charAt(i);
          var withHypeh = wordOverlap + "-";

          if (context.measureText(withHypeh).width >= maxW) {
            // add hyphen when splitting a word
            withHypeh = wordOverlap.substr(0, wordOverlap.length - 2) + "-";
            // update current word with remainder
            words[n] = words[n].substr(wordOverlap.length - 1, words[n].length);
            formatted += withHypeh; // add hypenated word
            break;
          }
        }
      }
      while (justify == 'right' && context.measureText(' ' + currentLine).width < maxW)
        currentLine = ' ' + currentLine;

      while (justify == 'center' && context.measureText(' ' + currentLine + ' ').width < maxW)
        currentLine = ' ' + currentLine + ' ';

      formatted += currentLine + '\n';
      breakLineCount++;
      currentLine = "";

      continue; // restart cycle
    }
    if (maxHAdjusted > 0 && (breakLineCount * lineHeight) > maxHAdjusted) {
      // add ... at the end indicating text was cutoff
      formatted = formatted.substr(0, formatted.length - 3) + "...\n";
      currentLine = "";
      break;
    }
    n++;
  }

  if (currentLine != '') {
    while (justify == 'right' && context.measureText(' ' + currentLine).width < maxW)
      currentLine = ' ' + currentLine;

    while (justify == 'center' && context.measureText(' ' + currentLine + ' ').width < maxW)
      currentLine = ' ' + currentLine + ' ';

    formatted += currentLine + '\n';
    breakLineCount++;
    currentLine = "";
  }

  // get rid of empy newline at the end
  formatted = formatted.substr(0, formatted.length - 1);

  var ret = new fabric.Text(formatted, { // return new text-wrapped text obj
    left: t.left,
    top: t.top,
    fill: t.fill,
    fontFamily: t.fontFamily,
    fontSize: t.fontSize,
    originX: t.originX,
    originY: t.originY,
    angle: t.angle,
    hasBorders: t.hasBorders,
    hasControls: t.hasControls,
    hasRotatingPoint: t.hasRotatingPoint
  });
  return ret;
}