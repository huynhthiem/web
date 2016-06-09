var app = angular.module('flapperNews', ['ui.router']);

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/html/home.ejs',
      controller: 'MainCtrl',
      resolve: {
	    postPromise: ['posts', function(posts){
	      return posts.getAll();
	    }]
	  }
    })
	
	
    .state('posts', {
	  url: '/posts/{id}',
	  templateUrl: '/index.html',
	  controller: 'PostsCtrl',
	  resolve: {
	    post: ['$stateParams', 'posts', function($stateParams, posts) {
	      alert($stateParams.id);
		  //return posts.get($stateParams.id);
	    }]
	  }
	})
	.state('login', {
  url: '/login',
  templateUrl: '/html/login.ejs',
  controller: 'AuthCtrl',
  onEnter: ['$state', 'auth', function($state, auth){
    if(auth.isLoggedIn()){
      $state.go('home');
    }
  }]
})
.state('register', {
  url: '/register',
  templateUrl: '/html/register.ejs',
  controller: 'AuthCtrl',
  onEnter: ['$state', 'auth', function($state, auth){
    if(auth.isLoggedIn()){
      $state.go('home');
    }
  }]
})
.state('products', {
  url: '/products/{id}',
  templateUrl: '/html/product.ejs',
  controller: 'ProductCtrl',
  
});

  $urlRouterProvider.otherwise('home');
}]);

/* Controllers */
app.controller('DemoCtrl',['$scope','$stateParams'],function($scope,$stateParams){
	console.log($stateParams.id);
});
app.controller('MainCtrl', [
'$scope',
'posts',
'auth',
function($scope, posts, auth){
  $scope.posts = posts.posts;
  $scope.isLoggedIn = auth.isLoggedIn;

	$scope.addPost = function(){
	  if(!$scope.title || $scope.title === '') { return; }
	  posts.create({
	    title: $scope.title,
	    link: $scope.link,
	  });
	  $scope.title = '';
	  $scope.link = '';
	};

	$scope.incrementUpvotes = function(post) {
	  posts.upvote(post);
	};
}]);

app.controller('PostsCtrl', [
'$scope',
'posts',
'post',
'auth',
function($scope, posts, post, auth){
	alert(posts.get($stateParams.id));
	$scope.post = post;
	$scope.isLoggedIn = auth.isLoggedIn;
	
	$scope.addComment = function(){
	  if($scope.body === '') { return; }
	  posts.addComment(post._id, {
	    body: $scope.body,
	    author: 'user',
	  }).success(function(comment) {
	    $scope.post.comments.push(comment);
	  });
	  $scope.body = '';
	};

	$scope.incrementUpvotes = function(comment){
	  posts.upvoteComment(post, comment);
	};
}]);

app.controller('AuthCtrl', [
'$scope',
'$state',
'$window',
'auth',
function($scope, $state, $window, auth){
	 
  $scope.user = {};

  $scope.register = function(){
  	$scope.submitted = true;
    auth.register($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };

   $scope.loginOauth = function() {
    // auth.logInTwitter().error(function(error){
    //   $scope.error = error;
    // }).then(function(){
    //   $state.go('home');
    // });
      $window.location.href = '/auth/twitter';
    };

  $scope.logIn = function(){
  	$scope.submitted = true;
    auth.logIn($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };

}]);

app.controller('NavCtrl', [
'$scope',
'auth',
function($scope, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;
}]);

//---------------------
app.controller('ProductCtrl', [
'$scope',
'$stateParams',
function($scope, $stateParams){
  var id = $stateParams.id;
  console.log(id);
}]);

/* Factory Services */
app.factory('posts', ['$http', 'auth', function($http, auth){
  var o = {
    posts: []
  };

  o.getAll = function() {
    return $http.get('/posts').success(function(data){
      angular.copy(data, o.posts);
    });
  };

  o.create = function(post) {
	  return $http.post('/posts', post, {
    	headers: {Authorization: 'Bearer '+auth.getToken()}
  	}).success(function(data){
	    o.posts.push(data);
	  });
	};

	o.upvote = function(post) {
		return $http.put('/posts/' + post._id + '/upvote', null, {
    	headers: {Authorization: 'Bearer '+auth.getToken()}
  	}).success(function(data){
		  post.upvotes += 1;
		});
	};

	o.get = function(id) {
	  return $http.get('/posts/' + id).then(function(res){
	    return res.data;
	  });
	};

	o.addComment = function(id, comment) {
	  return $http.post('/posts/' + id + '/comments', comment, {
    	headers: {Authorization: 'Bearer '+auth.getToken()}
  	});
	};

	o.upvoteComment = function(post, comment) {
	  return $http.put('/posts/'+ post._id + '/comments/'+ comment._id + '/upvote', null, {
    	headers: {Authorization: 'Bearer '+auth.getToken()}
  	}).success(function(data){
	      comment.upvotes += 1;
	    });
	};

  return o;
}]);

app.factory('auth', ['$http', '$window', function($http, $window){
   var auth = {};

	auth.saveToken = function (token){
	  // $window.localStorage['flapper-news-token'] = token;
	  $window.localStorage.setItem ('flapper-news-token', token);
	};

	auth.getToken = function (){
	 // return $window.localStorage['flapper-news-token'];
	 return $window.localStorage.getItem ('flapper-news-token');
	};

	auth.isLoggedIn = function(){
	  var token = auth.getToken();

	  if(token){
	    var payload = JSON.parse($window.atob(token.split('.')[1]));

	    return payload.exp > Date.now() / 1000;
	  } else {
	    return false;
	  }
	};

	auth.currentUser = function(){
	  if(auth.isLoggedIn()){
	    var token = auth.getToken();
	    var payload = JSON.parse($window.atob(token.split('.')[1]));

	    return payload.username;
	  }
	};

	auth.register = function(user){
	  return $http.post('/register', user).success(function(data){
	    auth.saveToken(data.token);
	  });
	};

	auth.logInTwitter = function(){
		return $http.get('/auth/twitter/callback').success(function(data){
			auth.saveToken(data.token);
		});
	};

	auth.logIn = function(user){
	  return $http.post('/login', user).success(function(data){
	    auth.saveToken(data.token);
	  });
	};

	auth.logOut = function(){
	  $window.localStorage.removeItem('flapper-news-token');
	};

  return auth;
}]);


app.factory('socket', function() {
	var socket = io.connect('http://localhost:3000');
	return socket;
});

app.factory('dataService', [
	'$http',
	function($http){
		var o = {
			products: [],
			currentPrice: []
		};

		o.getAuctionHistory = function() {
			return $http.get('/history').success(function(data) {
				angular.copy(data, o.products);
			});
		};

		o.getCurrentPrice = function() {
			return $http.get('/currentPrice').success(function(data) {
				angular.copy(data, o.currentPrice);
			});
		};

		return o;
}]);


app.controller('auctionCtrl', [
	'$scope',
	'dataService',
	'socket',
	function($scope, dataService, socket) {
		// INIT DATA
		dataService.getAuctionHistory();
		dataService.getCurrentPrice();

		$scope.currentPrice = dataService.currentPrice;
		$scope.products = dataService.products;
		$scope.errMessage = '';
		$scope.datatime = [];

		// ADD NEW DATA
		$scope.submitAuction = function(id) {
			
			/* console.log(id)
			var myEl = angular.element( $( '#Hello' ) ).val();
			console.log(myEl); */
			console.log('#' + id.toString() +'.newPrice');
			var price = angular.element( $( '#' + id.toString() +'.newPrice' ) ).val();
			console.log(price);
			socket.emit('new auction',id,price);
		};

		socket.on('new price', function(data) {
			dataService.getAuctionHistory();
			dataService.getCurrentPrice();
		});
		/* socket.on('timeCount', function(id,data){
        initializeClock('clockdiv', data);
		console.log(data);
		}); */
		socket.on('timeOut', function(id,data) {
			$scope.$apply(function() {
				$scope.errMessage = data;
			});
		});
	}
]);