/**********
  🐬主要作者：Evilbutcher （签到、cookie等主体逻辑编写）
  📕地址：https://github.com/evilbutcher

  🐬次要作者: toulanboy （细节完善，支持多平台）
  📕地址：https://github.com/toulanboy/scripts

  🐬 另，感谢@Seafun、@jaychou、@柠檬精、@MEOW帮忙测试及提供建议。

  📌不定期更新各种签到、有趣的脚本，欢迎star🌟

  *************************
  【配置步骤，请认真阅读】
  *************************
  1. 根据你当前的软件，配置好srcipt。 Tips:由于是远程文件，记得顺便更新文件。
  2. 进入超话，我的，关注页面，提示获取已关注超话链接成功，点进一个超话页面，手动签到一次，提示获取超话签到链接成功，即可注释掉重写。
  3. 回到quanx等软件，关掉获取cookie的rewrite。（loon是关掉获取cookie的脚本）


  *************************
  【Surge 4.2+ 脚本配置】
  *************************
  微博超话cookie获取 = type=http-request,pattern=https:\/\/api\.weibo\.cn\/2\/cardlist?,script-path=https://raw.githubusercontent.com/toulanboy/scripts/master/weibo/weibotalk.cookie.js,requires-body=false
  微博超话cookie2获取 = type=http-request,pattern=https:\/\/api\.weibo\.cn\/2\/page\/button?,script-path=https://raw.githubusercontent.com/toulanboy/scripts/master/weibo/weibotalk.cookie.js,requires-body=false
  微博超话 = type=cron,cronexp="5 0  * * *",script-path=https://raw.githubusercontent.com/toulanboy/scripts/master/weibo/weibotalk.js,wake-system=true,timeout=600

  [MITM]
  hostname = api.weibo.cn

  *************************
  【Loon 2.1+ 脚本配置】
  *************************
  [script]
  cron "5 0 * * *" script-path=https://raw.githubusercontent.com/toulanboy/scripts/master/weibo/weibotalk.js, timeout=600, tag=微博超话
  http-request https:\/\/api\.weibo\.cn\/2\/cardlist? script-path=https://raw.githubusercontent.com/toulanboy/scripts/master/weibo/weibotalk.cookie.js,requires-body=false, tag=微博超话cookie获取
  http-request https:\/\/api\.weibo\.cn\/2\/page\/button? script-path=https://raw.githubusercontent.com/toulanboy/scripts/master/weibo/weibotalk.cookie.js,requires-body=false, tag=微博超话cookie获取2
  
  [MITM]
  hostname = api.weibo.cn

  *************************
  【 QX 1.0.10+ 脚本配置 】 
  *************************
  [rewrite_local]
  https:\/\/api\.weibo\.cn\/2\/cardlist? url script-request-header https://raw.githubusercontent.com/toulanboy/scripts/master/weibo/weibotalk.cookie.js
  https:\/\/api\.weibo\.cn\/2\/page\/button? url script-request-header https://raw.githubusercontent.com/toulanboy/scripts/master/weibo/weibotalk.cookie.js

  [task]
  5 0 * * * https://raw.githubusercontent.com/toulanboy/scripts/master/weibo/weibotalk.js, tag=微博超话

  [MITM]
  hostname = api.weibo.cn

  *********/
  
$ = new Env("微博超话")
const tokenurl = "evil_tokenurl";
const tokencheckinurl = "evil_tokencheckinurl";
const tokenheaders = "evil_tokenheaders";
const tokencheckinheaders = "evil_tokencheckinheaders";

var time = 0; //任务执行间隔
var number;
var allnumber;
var pagenumber;
var listurl = $.getdata(tokenurl);
var listheaders = $.getdata(tokenheaders);
var checkinurl = $.getdata(tokencheckinurl);
var checkinheaders = $.getdata(tokencheckinheaders);
const m = "GET";
$.message = [];
$.name_list = []
$.id_list = []
$.val_list = []

  !(async () => {
    await getnumber(time);
    for (j = 1; j <= pagenumber; j++) {
      await getid(j);
    }
    for (var i in $.name_list) {
      await checkin($.id_list[i], $.name_list[i], $.val_list[i], time);
      $.wait(500)
    }
    $.msg("微博超话", "", `${$.message}`);
  })()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.done()
  })


function getnumber(s) {
  return new Promise((resove) => {
    var idrequest = {
      url: listurl,
      method: m,
      header: listheaders
    };
    $.get(idrequest, (error, response, data) => {
      var body = response.body;
      var obj = JSON.parse(body);
      //console.log(obj);
      allnumber = obj.cardlistInfo.total;
      console.log("关注超话" + allnumber + "个");
      $.message += `关注超话${allnumber}个`;
      pagenumber = Math.ceil(allnumber / 20);
      //$notify("超话","",JSON.stringify($.message))
      resove();
    });
  });
}

//获取超话签到id
function getid(j) {


  var getlisturl = listurl.replace(
    new RegExp("&page=.*?&"),
    "&page=" + j + "&"
  );
  //console.log(getlisturl);
  var idrequest = {
    url: getlisturl,
    method: m,
    header: listheaders
  };
  return new Promise((resove) => {
    $.get(idrequest, (error, response, data) => {
      var body = response.body;
      var obj = JSON.parse(body);
      //console.log(obj);
      var group = obj.cards[0]["card_group"];
      //console.log(group);
      number = group.length;
      //console.log(number);
      for (i = 0; i < number; i++) {
        // console.log(group[i])
        var name = group[i]["title_sub"];
        $.name_list.push(name)
        // console.log($.name_list)
        console.log(name)

        var val = group[i].desc;
        $.val_list.push(val)
        console.log(val)

        var id = group[i].scheme.slice(33, 71);
        $.id_list.push(id)
        console.log(id)
        // checkin(id, name, val, time);
      }
      resove()
    })
  })
}




//签到
function checkin(id, name, val, s) {

  var sendcheckinurl = checkinurl
    .replace(new RegExp("&fid=.*?&"), "&fid=" + id + "&")
    .replace(new RegExp("pageid%3D.*?%26"), "pageid%3D" + id + "%26");
  var checkinrequest = {
    url: sendcheckinurl,
    method: m,
    header: checkinheaders
  };
  return new Promise(resolve => {
    $.get(checkinrequest, (error, response, data) => {
      //console.log(response)

      if ((response.statusCode == 418)) {
        $.message += `【${name}】：${val}-"签到太频繁啦，请稍后再试"`;
        console.log(`【${name}】：${val}-"签到太频繁啦，请稍后再试"`);
      } else {
        var body = response.body;
        var obj = JSON.parse(body);
        //console.log(obj);
        var result = obj.result;
        //console.log(result);
        if (result == 1) {
          $.message += `\n【${name}】：${val}-${obj.button.name}`;
          console.log(`【${name}】：${val}-${obj.button.name}`);
        } else if (result == 382004) {
          $.message += `\n【${name}】：${val}-${obj.error_msg}`;
          console.log(`【${name}】：${val}-${obj.error_msg}`);
        } else if (result == 388000) {
          $.message += `\n【${name}】："需要拼图验证⚠️"`;
          console.log(`【${name}】："需要拼图验证⚠️"`);
        } else if (result == 382010) {
          $.message += `\n【${name}】："超话不存在⚠️"`;
          console.log(`【${name}】："超话不存在⚠️"`);
        } else {
          $.message += `\n【${name}】："未知错误⚠️"`;
          console.log(`【${name}】："未知错误⚠️"`);
          console.log(response)
        }
      }
      resolve();
    })

  })
}

//@Chavy
function Env(s) {
  this.name = s, this.data = null, this.logs = [], this.isSurge = (() => "undefined" != typeof $httpClient), this.isQuanX = (() => "undefined" != typeof $task), this.isNode = (() => "undefined" != typeof module && !!module.exports), this.log = ((...s) => {
    this.logs = [...this.logs, ...s], s ? console.log(s.join("\n")) : console.log(this.logs.join("\n"))
  }), this.msg = ((s = this.name, t = "", i = "") => {
    this.isSurge() && $notification.post(s, t, i), this.isQuanX() && $notify(s, t, i);
    const e = ["", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];
    s && e.push(s), t && e.push(t), i && e.push(i), console.log(e.join("\n"))
  }), this.getdata = (s => {
    if (this.isSurge()) return $persistentStore.read(s);
    if (this.isQuanX()) return $prefs.valueForKey(s);
    if (this.isNode()) {
      const t = "box.dat";
      return this.fs = this.fs ? this.fs : require("fs"), this.fs.existsSync(t) ? (this.data = JSON.parse(this.fs.readFileSync(t)), this.data[s]) : null
    }
  }), this.setdata = ((s, t) => {
    if (this.isSurge()) return $persistentStore.write(s, t);
    if (this.isQuanX()) return $prefs.setValueForKey(s, t);
    if (this.isNode()) {
      const i = "box.dat";
      return this.fs = this.fs ? this.fs : require("fs"), !!this.fs.existsSync(i) && (this.data = JSON.parse(this.fs.readFileSync(i)), this.data[t] = s, this.fs.writeFileSync(i, JSON.stringify(this.data)), !0)
    }
  }), this.wait = ((s, t = s) => i => setTimeout(() => i(), Math.floor(Math.random() * (t - s + 1) + s))), this.get = ((s, t) => this.send(s, "GET", t)), this.post = ((s, t) => this.send(s, "POST", t)), this.send = ((s, t, i) => {
    if (this.isSurge()) {
      const e = "POST" == t ? $httpClient.post : $httpClient.get;
      e(s, (s, t, e) => {
        t && (t.body = e, t.statusCode = t.status), i(s, t, e)
      })
    }
    this.isQuanX() && (s.method = t, $task.fetch(s).then(s => {
      s.status = s.statusCode, i(null, s, s.body)
    }, s => i(s.error, s, s))), this.isNode() && (this.request = this.request ? this.request : require("request"), s.method = t, s.gzip = !0, this.request(s, (s, t, e) => {
      t && (t.status = t.statusCode), i(null, t, e)
    }))
  }), this.done = ((s = {}) => this.isNode() ? null : $done(s))
}