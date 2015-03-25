var allTestFiles = [];
var TEST_REGEXP = /Spec\.js$/;

var pathToModule = function(path) {
  return path.replace(/^\/base\//, '').replace(/\.js$/, '');
};

Object.keys(window.__karma__.files).forEach(function(file) {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    allTestFiles.push(pathToModule(file));
  }
});

console.log(allTestFiles)
requirejs.config({
    baseUrl: '/base',
    paths: {
        d3: 'node_modules/d3/d3',
        h3atmap: 'h3atmap'
    },
    shim:{
        'd3': {
            'exports': 'd3'
        }
    },
    deps: allTestFiles,
    callback: window.__karma__.start
});

