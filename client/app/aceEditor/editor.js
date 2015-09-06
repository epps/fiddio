angular.module('fiddio')

.controller( 'AceController', [ 'RecordMode', 'PlaybackMode', '$rootScope', function( RecordMode, PlaybackMode, $rootScope) {
  var vm = this; // initializes the view-model var (`vm`) for use in the controllerAs syntax

  vm.currentlyRecording = RecordMode.getRecordingStatus;
  vm.recordOptions = RecordMode.recordOptions;
  vm.startRecording = function(){
    RecordMode.startRecording().then(function(success){
      RecordMode.setRecordingStatus(true);
    });
  };
  vm.stopRecording = function(){
    RecordMode.stopRecording(RecordMode.getRecordingStatus())
    .then(function(blob) {
      RecordMode.setRecordingStatus(false);
    });
  };
  vm.uploadChanges = function(){
    RecordMode.uploadEditorChanges(RecordMode.getRecordingStatus());
    // console.log($rootScope.$stateParams);
  };
  vm.playRecording = PlaybackMode.startPlayback;
  vm.setEditorText = RecordMode.setEditorText;

  vm.playbackOptions = PlaybackMode.playbackOptions;

  }]);
