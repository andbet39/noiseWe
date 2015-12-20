'use strict';

/**
 * @ngdoc function
 * @name nosieApp.controller:StreamCtrl
 * @description
 * # StreamCtrl
 * Controller of the nosieApp
 */
angular.module('nosieApp')
  .controller('StreamCtrl', function ($scope,$rootScope,$location,$geolocation) {
    $scope.posts=[];
    $scope.page = 0;

    $scope.displayLimit = 8;
    $scope.isLoadingMore = false;

    $geolocation.getCurrentPosition({
            timeout: 60000
         }).then(function(position) {
            $scope.myPosition = position;
         });


    $scope.loadMore = function(){

        $scope.page ++;
        $scope.isLoadingMore = true;
        $scope.doQuery($scope.query);

    }



    $scope.login = function(){

            var user = new Parse.User();
            user.set("username", generateId());
            user.set("password", "my pass");
           // user.set("email", "email@example.com");

        

            user.signUp(null, {
              success: function(user) {
                $rootScope.currentUser =user;
              },
              error: function(user, error) {
                // Show the error message somewhere and let the user try again.
                alert("Error: " + error.code + " " + error.message);
              }
            });
    }


    $scope.init = function  () {
      
       if($rootScope.parse != true){
          console.log('initialize parse');
         Parse.initialize("dcG3cpe1HQAwfzKBV9Tsuxaici1AKlb3udRrx2Me", "1HHiju4wsBWeSlbJ7WSZw0YUTENuDUtk9ujwAXLe");
         $rootScope.parse = true;

      }

      var currentUser = Parse.User.current();
        if (currentUser) {
            console.log(currentUser);
            $rootScope.currentUser =currentUser;
        } else {
            $scope.login();
        }


    }


    $scope.goMessage =  function(message){

      $rootScope.message = message;
      $location.path('message');

    }

    $scope.addFavs= function(post){
      console.log(post);

      var query = new Parse.Query('Activity');
      query.equalTo("on",post.obj);
      query.startsWith("type", "ADDFAVS");
      query.equalTo("user", $rootScope.currentUser);



      query.count({ 
        success: function(count) {
              

            if(count == 0){
              post.favs ++;
              $scope.$apply();

               var activity = new Parse.Object("Activity");
                activity.set("type","ADDFAVS");
                activity.set("on",post.obj);
                activity.set("user",$rootScope.currentUser);

                activity.save().then(function(){
                  post.obj.increment("favs");

                  
                  post.obj.save();
                 
                });
            }else{
              console.log("Cannot Favs more then once");
            }
         
        },
        error: function(error) {
          alert("Error: " + error.code + " " + error.message);
        }}
    );

    }


    $scope.querynear = function(){

      $scope.title  = "Nearest posts";
        $scope.page =0;
        $scope.isLoadingMore = false;

      var point = new Parse.GeoPoint({latitude: $scope.myPosition.coords.latitude, longitude: $scope.myPosition.coords.longitude});

      var query = new Parse.Query('Post');
      query.near("location",point);
$scope.query = query;
      $scope.doQuery(query);


    }

  $scope.querymine = function(){

      $scope.title  = "Mine posts";
      $scope.page =0;
        $scope.isLoadingMore = false;


      var query = new Parse.Query('Post');
      query.equalTo("owner",$rootScope.currentUser);
      query.descending("createdAt");
      
      $scope.query = query;


      $scope.doQuery(query);


    }

    $scope.doQuery = function(query){
    

    query.limit($scope.displayLimit);
    query.skip($scope.page * $scope.displayLimit);



      query.find({
        success: function(results) {

          if(!$scope.isLoadingMore){
            $scope.posts = [];
          }

          console.log(results);

          for (var i = 0; i < results.length; i++) {
            var object = results[i];

            

            var post ={}
            post.imgUrl = object.get('file').url();
            post.message= object.get('message');
            post.created = object.get('createdAt');
            post.favs = object.get('favs');
            post.obj = object;

            $scope.posts.push(post);
               
            $scope.$apply();

          }


        },
        error: function(error) {
          alert("Error: " + error.code + " " + error.message);
        }
      });
    }


    $scope.queryrecent = function () {

      $scope.posts=[];

      $scope.title  = "Recent posts";
      $scope.page =0;
        $scope.isLoadingMore = false;
    
     var query = new Parse.Query('Post');
     query.descending("createdAt");
     $scope.query = query;
     $scope.doQuery(query);



    };


    $scope.queryfavs = function () {

      $scope.posts=[];

      $scope.title  = "Favorites posts";

      
     $scope.page =0;
        $scope.isLoadingMore = false;

      var query = new Parse.Query('Post');
      query.descending("favs");
     // query.descending("createdAt");
$scope.query = query;
     $scope.doQuery(query);



    };

    $scope.init();
    $scope.queryrecent();


  });


function byteToHex(byte) {
  return ('0' + byte.toString(16)).slice(-2);
}

// str generateId(int len);
//   len - must be an even number (default: 40)
function generateId(len) {
  var arr = new Uint8Array((len || 20) / 2);
  window.crypto.getRandomValues(arr);
  return [].map.call(arr, byteToHex).join("");
}



