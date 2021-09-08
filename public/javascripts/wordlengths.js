var keypressed = false;

function focusText() {
  keypressed = true;
  var el = document.getElementById("mainText");
  if (document.activeElement !== el) {
    el.focus();
    window.getSelection().selectAllChildren(el);
    window.getSelection().collapseToEnd();
  }
}

var app = angular.module('wordlengths', ['ngSanitize']);

app.directive('contenteditable', ['$sce', function ($sce) {
    return {
      restrict: 'A', // only activate on element attribute
      require: '?ngModel', // get a hold of NgModelController
      link: function (scope, element, attrs, ngModel) {
        if (!ngModel) return; // do nothing if no ng-model

        // Specify how UI should be updated
        ngModel.$render = function () {
          element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));
        };

        // Listen for change events to enable binding
        element.on('blur keyup change', function () {
          scope.$evalAsync(read);
        });
        read(); // initialize

        // Write data to the model
        function read() {
          var html = element.html();
          // When we clear the content editable the browser leaves a <br> behind
          // If strip-br attribute is provided then we strip this out
          if (attrs.stripBr && html == '<br>') {
            html = '';
          }
          ngModel.$setViewValue(html);
        }
      }
    };
  }]);

app.controller('wordlengthsController', function($scope) {

    $scope.mainText = "";
    $scope.lineLengths = [];
    $scope.dom = null;

    $scope.mainTextChanged = function() {
      var el = document.createElement('html');
      el.innerHTML = $scope.mainText;
      var lines = el.getElementsByTagName("div");

      $scope.lineLengths = Array.from(lines).map(x => x.innerText).map(x => x.replace(/\W/g, '')).map(x => x.length);
      $scope.lineLengthsString = $scope.lineLengths.join("\n");

      console.log($scope.lineLengths);
      console.log($scope.mainText);

      if (keypressed) {
        localforage.setItem("mainText", $scope.mainText);
      }
    };

    localforage.getItem("mainText", function(err, value) {
      if (err) {
        console.log(err);
      }
      else {
        $scope.mainText = value;
        $scope.mainTextChanged();
        console.log(value);
        $scope.$apply();
      }
    })
  
});

app.filter('range', function(){
    return function(n) {
      var res = [];
      for (var i = 0; i < n; i++) {
        res.push(i);
      }
      return res;
    };
  });