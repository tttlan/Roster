module.exports = {
    "parser": "babel-eslint",
    "parserOptions": {
        "ecmaVersion": 6,
        "sourceType": "module",
    },
    "ecmaFeatures": {
        "classes": true,
    },
    "rules": {
        "no-undef": 2,
        "eqeqeq": [1, "smart"],
        "no-eq-null": 1,
        "no-extra-semi": 2,
        "semi": [1, "always"],
        "space-before-blocks": 1,
        "space-before-function-paren": [1, {
            "anonymous": "never", 
            "named": "never"
        }]
    },
    "env": {
        "browser": true,
        "node": true,
        "jasmine": true,
    },
    "globals": {
        "Promise": true,
        "Symbol": true,
        "sherpa": true,
        "SHRP": true,
        "d3": true,
        "document": true,
        "define": true,
        "getComputedStyle": true,
        "angular": true,
        "_": true,
        "moment": true,
        "$": true,
        "jQuery": true,
        "google": true,
        "UTIL": true,
        "PDFJS": true,
        "DocumentTouch": true,  //modernizr uses this
        "yepnope": true,        //modernizr uses this
        "Modernizr": true,
        "Uint32Array": true,
        "Uint16Array": true,
        "Uint8Array": true,
        "Int32Array": true,
        "Int16Array": true,
        "Int8Array": true,
        "getJSONFixture": true, //jasmine
        "inject": true, //jasmine
        "Promise": true //es6 Promise
    }
}