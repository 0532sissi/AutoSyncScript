/**
go语言中文网签到脚本

说明：
手动登录 https://studygolang.com 点击自己头像右边用户名下面的“个人资料设置”页面 如通知成功获取cookie, 则可以使用此签到脚本.
获取Cookie后, 请将Cookie脚本禁用并移除主机名，以免产生不必要的MITM.
脚本将在每天上午9点执行。 可以修改执行时间。

************************
[Mitm]
************************
hostname = studygolang.com


************************
QuantumultX 本地脚本配置:
************************

[task_local]
# go语言中文网签到
0 9 * * * iepngs/Script/master/studygolang/index.js

[rewrite_local]
# 获取Cookie
https:\/\/studygolang\.com\/account\/edit url script-request-header iepngs/Script/master/studygolang/index.js


************************
Loon 2.1.0+ 脚本配置:
************************

[Script]
# go语言中文网签到
cron "0 9 * * *" script-path=https://raw.githubusercontent.com/iepngs/Script/master/studygolang/index.js

# 获取Cookie 网站登录后点击自己头像右边用户名下面的“个人资料设置”页面
http-request https:\/\/studygolang\.com\/account\/edit script-path=https://raw.githubusercontent.com/iepngs/Script/master/studygolang/index.js


**/

const $hammer = (() => {
    const isRequest = "undefined" != typeof $request,
        isSurge = "undefined" != typeof $httpClient,
        isQuanX = "undefined" != typeof $task;

    const log = (...n) => { for (let i in n) console.log(n[i]) };
    const alert = (title, body = "", subtitle = "", link = "") => {
        if (isSurge) return $notification.post(title, subtitle, body, link);
        if (isQuanX) return $notify(title, subtitle, (link && !body ? link : body));
        log("==============📣系统通知📣==============");
        log("title:", title, "subtitle:", subtitle, "body:", body, "link:", link);
    };
    const read = key => {
        if (isSurge) return $persistentStore.read(key);
        if (isQuanX) return $prefs.valueForKey(key);
    },
        write = (key, val) => {
            if (isSurge) return $persistentStore.write(val, key);
            if (isQuanX) return $prefs.setValueForKey(key, val);
        };
    const request = (method, params, callback) => {
        /**
         * 
         * params(<object>): {url: <string>, headers: <object>, body: <string>} | <url string>
         * 
         * callback(
         *      error, 
         *      {status: <int>, headers: <object>, body: <string>} | ""
         * )
         * 
         */
        let options = {};
        if (typeof params == "string") {
            options.url = params;
        } else {
            options.url = params.url;
            if (typeof params == "object") {
                params.headers && (options.headers = params.headers);
                params.body && (options.body = params.body);
            }
        }
        method = method.toUpperCase();

        const writeRequestErrorLog = function (m, u) {
            return err => {
                log("=== request error -s--");
                log(`${m} ${u}`, err);
                log("=== request error -e--");
            };
        }(method, options.url);

        if (isSurge) {
            const _runner = method == "GET" ? $httpClient.get : $httpClient.post;
            return _runner(options, (error, response, body) => {
                if (error == null || error == "") {
                    response.body = body;
                    callback("", response);
                } else {
                    writeRequestErrorLog(error);
                    callback(error, "");
                }
            });
        }
        if (isQuanX) {
            options.method = method;
            $task.fetch(options).then(
                response => {
                    response.status = response.statusCode;
                    delete response.statusCode;
                    callback("", response);
                },
                reason => {
                    writeRequestErrorLog(reason.error);
                    callback(reason.error, "");
                }
            );
        }
    };
    const done = (value = {}) => {
        if (isQuanX) return isRequest ? $done(value) : null;
        if (isSurge) return isRequest ? $done(value) : $done();
    };
    return { isRequest, isSurge, isQuanX, log, alert, read, write, request, done };
})();

const CookieKey = "StudyGolang";

function GetCookie() {
    const CookieName = CookieKey + "的Cookie";
    try {
        if ($request.headers) {
            const CookieValue = $request.headers['Cookie'];
            const cachedCookie = $hammer.read(CookieKey);
            const dynamic = cachedCookie ? (cachedCookie == CookieValue ? "" : "更新") : "写入";
            if(dynamic){
                const result = $hammer.write(CookieKey, CookieValue);
                $hammer.alert(CookieName, dynamic + (result ? "成功🎉" : "失败"));
            }
        } else {
            $hammer.alert(CookieName, "请检查匹配URL或配置内脚本类型", "写入失败");
        }
    } catch (error) {
        $hammer.alert(CookieName, "未知错误", "写入失败")
        $hammer.log(error)
    }
    $hammer.done();
}

function checkin() {
    let options = {
        url: "https://studygolang.com/mission/daily/redeem",
        headers: {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            "Connection": "keep-alive",
            "Cookie": $hammer.read(CookieKey),
            "Host": "studygolang.com",
            "Referer": "https://studygolang.com/mission/daily",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36",
        }
    };
    $hammer.request("get", options, (error, response) => {
        if (error) {
            $hammer.alert(CookieKey, error, "签到请求失败");
            return $hammer.done();
        }
        $hammer.log(`${CookieKey}签到结果：`, response.body);
        $hammer.alert(CookieKey, "签到完成");
        $hammer.done();
    })
}

$hammer.isRequest ? GetCookie() : checkin();