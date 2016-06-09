var app = angular.module('auctionModule',[]);

app.factory('socket', function() {
	var socket = io.connect('http://localhost:3000');
	return socket;
});

app.factory('dataService', [
	'$http',
	function($http){
		var o = {
			auctionHistory: [],
			currentPrice: []
		};

		o.getAuctionHistory = function() {
			return $http.get('/history').success(function(data) {
				angular.copy(data, o.auctionHistory);
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
		$scope.auctionHistory = dataService.auctionHistory;
		$scope.errMessage = '';

		// ADD NEW DATA
		$scope.submitAuction = function() {
			socket.emit('new auction', $scope.newPrice);
		};

		socket.on('new price', function(data) {
			dataService.getAuctionHistory();
			dataService.getCurrentPrice();
		});

		socket.on('timeOut', function(data) {
			$scope.$apply(function() {
				$scope.errMessage = data;
			});
		});
	}
]);