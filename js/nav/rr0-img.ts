export default navModule => {
  navModule
  /**
   * Picks last image from contents to set header background
   */
    .directive('img', [function () {
      'use strict';
      return {
        restrict: 'E',
        link: function (scope, elem, attrs) {
          var pageHeading = document.querySelector('header');
          if (pageHeading) {
            var style = window.getComputedStyle(pageHeading).backgroundImage;
            style += ', url(\'' + attrs.src + '\')';
            pageHeading.style.backgroundImage = style;
          }
        }
      };
    }]);
}