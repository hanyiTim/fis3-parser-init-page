/**
 *
 *
 *
 * 
 */
var cc_widgets={};   //储存 page html 用到的 widget；
var cc_no_repeat={};   //依赖的js css 去重；
var __widget_dir=fis.get("fyg_conf")["widget_dir"] || "widget/";
module.exports=function(content,file,setting){
	//初始化 page  html页面，添加对应的widget js文件，以及页面对应js执行script
	var init_pageHtml=function(content,file){
		var cheerio=require("cheerio"),
		$=cheerio.load(content),
		$_widget=$("[data-widgetname]"),
		$_head=$("head"),
		$_script=$("script[data-name]");
		var cc_main=$_script.data("main"),
			cc_name=$_script.data("name");

		var file_requires=file.requires;

		cc_widgets[cc_name]=[];
		cc_no_repeat[cc_name]={};

		var cc_script="<script>var main=require('"+cc_name+"');main."+cc_main+"();</script>";
		var arr_js=[],
			arr_scss=[];

		//对html rquires 属性 添加依赖
		if(file_requires && file_requires.length>0){
			for(var i=0;i<file_requires.length;i++){
				if(/.*\.s?css/.test(file_requires[i])){
					arr_scss.push('<link rel=\"stylesheet\"" href=\"'+file_requires[i]+'\" \/\>');
				}
				else if(/.*\.js/.test(file_requires)){
					arr_js.push("<script src=\'"+file_requires[i]+"\'></script>");
				}
			}
		};
		//对html 添加 widget[js,scss] 依赖
		$_widget.each(function(index,item){
			var $_item=$(item),
				cc_widgetname=$_item.data("widgetname");
			if(cc_widgetname && cc_widgets[cc_name]){
				if(!cc_no_repeat[cc_name][cc_widgetname]){
					cc_no_repeat[cc_name][cc_widgetname]=true;

					cc_widgets[cc_name].push(__widget_dir+cc_widgetname+"\/"+cc_widgetname);
					arr_js.push("<script src=\'"+__widget_dir+cc_widgetname+"\/"+cc_widgetname+"\'></script>");
					arr_scss.push("<link rel=\'stylesheet\' href=\'"+__widget_dir+cc_widgetname+"\/"+cc_widgetname+".scss"+"\'\/\>");
				}
				
			}
		});
		$_script.after(cc_script);
		$_script.before(arr_js.join("\n"));
		$_head.append(arr_scss.join("\n"));
		return $.html();
	};
	//添加 页面对应的 vue component 依赖
	var init_pageJs=function(content,file){
		var arr_require=["var Vue=require('Vue');\n"];
		if(cc_widgets[file.filename].length>0){
			for(var i=0;i<cc_widgets[file.filename].length;i++){
				arr_require.push("require('"+cc_widgets[file.filename][i]+"');\n");
			}
		}
		return arr_require.join("")+content;
	};
	if(file._likes.isHtmlLike){
		content=init_pageHtml(content,file);
	}
	else if(file._likes.isJsLike){
		content=init_pageJs(content,file);
	}

	return content;
};