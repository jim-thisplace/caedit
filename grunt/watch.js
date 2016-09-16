// Watches for changes to CSS or email templates then runs grunt tasks
module.exports = {
    "options" : {
        "livereload"    : true,
        "debounceDelay" : 750
    },
    "build"   : {
        "files" : [
            "src/**/*",
            "scripts/**/*",
            "assets/**/*"
        ],
        "tasks" : [
            "clean",
            "build"
        ]
    }
};
