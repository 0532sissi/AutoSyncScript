/* 
打开活动页面自动注入console，需要手动执行脚本

[rewrite_local]
# 京东活动
https://.*\.m\.jd\.com/babelDiy/Zeus/.*/index\.html url script-response-body https://raw.githubusercontent.com/id77/QuantumultX/master/Script/jd_hd.js

[mitm]
hostname = *.m.jd.com
*/

let html = $response.body;

html =
  html.replace(/(<\/html>)/g, '') +
  `
  <script>

    const script = document.createElement('script');
    script.src = "https://cdn.bootcss.com/vConsole/3.2.0/vconsole.min.js";
    // script.doneState = { loaded: true, complete: true};
    script.onload = function() {
        init();
        console.log("初始化成功");
    };
    
    
    document.getElementsByTagName('head')[0].appendChild(script);
    
    
    function init () {
      
      window.vConsole = new VConsole({ defaultPlugins: ["system", "element"] });
      const myPlugin = new VConsole.VConsolePlugin("jd_hd", "京东活动");
      vConsole.addPlugin(myPlugin);

      myPlugin.on("renderTab", function (callback) {
        var html = \`
                    <ul>
                      <li> 📎可能需要运行多次，查看输出日志，有失败的任务，刷新页面继续执行</li>
                      <li> 📎经测试，抽奖需要手动</li>
                      <li> 👇点击下方执行按钮运行任务脚本</li>
                    </ul>  
                    \`;
                    
        callback(html);
      });
      
      myPlugin.on("addTool", function (callback) {
       
        var toolList = [];
        toolList.push({
          name: "脚本1",
          global: false,
          onClick: function (event) {
            vConsole.showTab("default");
            
            // 脚本1
            eval(function(p,a,c,k,e,d){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)d[e(c)]=k[c]||e(c);k=[function(e){return d[e]}];e=function(){return'\\\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\\\b'+e(c)+'\\\\b','g'),k[c]);return p}(' e 9=4.3(\\'9\\');9.d=\"b/6\";9.a=\"5://c.2/8/7.8\";4.1.0(9);',62,15,'appendChild|body|com|createElement|document|https|javascript|jdqmyy|js|script|src|text|tyh52|type|var'.split('|'),0,{}))
          }

        },
        {
          name: "脚本2",
          global: false,
          onClick: function (event) {
            vConsole.showTab("default");
             
             // 脚本2
             eval(function(){function c(){var d=document.getElementById(\"loadJs\"),e=document.createElement(\"script\");d&&document.getElementsByTagName(\"head\")[0].removeChild(d),e.id=\"loadJs\",e.type=\"text/javascript\",e.src=\"https://krapnik.cn/tools/JDCouponAssistant/bundle.js\",document.getElementsByTagName(\"head\")[0].appendChild(e)}c()}())

         }
          
        });
        callback(toolList);
      });
      
      myPlugin.on('ready', function() {
      
          //vConsole.show();
	      setTimeout(() => vConsole.showTab("jd_hd"), 300);

      });
      
    }
  </script>
</html>
`;

$done({ body: html });
