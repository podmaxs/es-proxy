var gulp        = require('gulp'),
	express     = require('express'),
	browserSync = require('browser-sync').create(),
	path        = require('path'),
	rootPath    = '../es-app/public_html/',
	filesEdited = [],
	matchRules  = [];

function onChange(data){
	var file = {path: data.path, type: path.extname(data.path),fileName: path.basename(data.path)};
	filesEdited.push(file);
	browserSync.reload();
}

function replaceHtml(req, res, html) {
	for(var i in filesEdited){
		var file = filesEdited[i];
		var reg 	= file.type=='.css'?'/<link([^>]+)href="[^"]+' + file.fileName + '["]([^>]*)>/g':'/<script([^>]+)src="[^"\']+' + file.fileName + '[\'"]([^>]*)>/g';
		var line 	= html.match(eval(reg));
		var patter 	= file.type=='.css'? new RegExp(eval('/href=(["][^"]+)' + file.type + '["]/g'), "g"):new RegExp(eval('/src=(["][^"]+)' + file.type + '["]/g'), "g");
		if(line && line[0]){
			line[0]     = file.type=='.css'? line[0].replace(patter, ' href="' + createPath(file.path) + '"'):line[0].replace(patter, ' src="' + createPath(file.path) + '"');
			html        = html.replace(eval(reg), line[0]);
		}else{
			console.log('No found ' + createPath(file.path));
		}
		
	}
	return html;
}
function createPath(path){
	return path.replace('/home/mpiccinini/workspace/es-app/public_html/app/','http://localhost:2121/app/')
}

gulp.task('serve', function() {
    browserSync.init({
        proxy: "http://mpiccinini.tk",
        rewriteRules:  [{
		match: /<html[^>](.|\r|\n)+/im,
			fn: function(req, res, match) {
				match = replaceHtml(req, res, match);
				return match;
			}
		}],
        port: '2000'
    });

    var app = new express();

    app.use('/app', express.static('/home/mpiccinini/workspace/es-app/public_html/app/'));
    app.listen(2121);

    gulp.watch(rootPath+"**/*.js").on('change', onChange);
    gulp.watch(rootPath+"**/*.css").on('change', onChange);
});

gulp.task('default', ['serve']);
//gulp.start.apply(gulp, ['serve']);