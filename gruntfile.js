module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    coffee: {
      options: {
        separator: '\n',
        join: false
      },
      compile: {
        files: {
          'dist/<%= pkg.name %>-<%= pkg.version %>.js': ['src/**/*.js.coffee']
        }
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: [ 'src/**/*.js' ],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
        maxLineLen: 8192,
        wrap: true,
        sourceMap: true
      },
      build: {
        src: 'dist/<%= pkg.name %>-<%= pkg.version %>.js',
        dest: 'dist/<%= pkg.name %>-<%= pkg.version %>-min.js'
      }
    },
    jshint: {
      files: ['gruntfiles.js', 'dist/**/*.js'],
      options: {
        globals: {
          console: true,
          module: true,
          document: true
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', ['coffee', 'uglify'])
}