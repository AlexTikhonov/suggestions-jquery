module.exports = function(grunt){

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        banner: [
            '/**',
            ' <%= pkg.description %>, version <%= pkg.version %>',
            '',
            ' <%= pkg.description %> is freely distributable under the terms of MIT-style license',
            ' Built on DevBridge Autocomplete for jQuery (https://github.com/devbridge/jQuery-Autocomplete)',
            ' For details, see <%= pkg.homepage %>',
            '/\n'].join('\n *'),

        includes: {
            options: {
                banner: '<%= banner %>',
                includePath: 'src/includes/',
                includeRegexp: /^\/\/include\s+"(\S+)"\s*$/
            },
            files: {
                expand: true,
                cwd: 'src/',
                src: '*.js',
                dest: 'dist/js/'
            }
        },

        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            jsmin: {
                options: {
                    mangle: true,
                    beautify: false
                },
                files: [{
                    expand: true,
                    cwd: 'dist/js/',
                    src: ['*.js', '!*.min.js'],
                    dest: 'dist/js/',
                    rename: function (dest, src) {
                        return dest + src.replace(/.js$/, '.min.js');
                    }
                }]
            }
        },

        jasmine: {
            options: {
                specs: 'test/specs/*.js',
                helpers: 'test/helpers/*.js',
                vendor: 'test/vendor/*.js',
                outfile: 'test/runner.html',
                keepRunner: true
            },
            js: {
                src: 'dist/js/jquery.suggestions.js'
            },
            jsmin: {
                src: 'dist/js/jquery.suggestions.min.js'
            }
        },

        less: {
            js: {
                expand: true,
                cwd: 'less/',
                src: '*.less',
                dest: 'dist/css/',
                ext: '.css'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-includes');

    grunt.registerTask('test', ['jasmine:js', 'jasmine:jsmin']);
    grunt.registerTask('build', ['less', 'includes', 'uglify:jsmin', 'test']);
    grunt.registerTask('default', ['build']);
};
