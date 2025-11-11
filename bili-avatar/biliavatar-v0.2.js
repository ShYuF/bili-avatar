// ==UserScript==
// @name         bilibili avatar
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  make bilibili space avatar clickable and easy to oprate
// @author       SHYUF
// @match        https://space.bilibili.com/*
// @icon         https://www.bilibili.com/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    "use strict";

    // 查询头像
    const avatar_css_selector = ".avatar > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > picture:nth-child(1) > img:nth-child(2)";
    function queryAvatar() {
        var avatar_selector = document.querySelector(avatar_css_selector);
        if (avatar_selector) {
            clearInterval(q_avatar);

            var i_src = avatar_selector.getAttribute("src");
            var pattern = /(.+\.(?:jpg|png|jpeg|gif|bmp))@.+\.webp/i;

            // 正则替换
            function regReplace() {
                var g_src = i_src;
                if (i_src && pattern.test(i_src)) {
                    g_src = i_src.replace(pattern, "$1");
                }

                if (g_src.indexOf("http") !== 0) {
                    g_src = "https:" + g_src;
                }
                return g_src;
            }
            var _src = regReplace();

            // 添加点击事件
            var avatar = document.querySelector(".avatar");
            if (avatar) {
                avatar.addEventListener("click", () => {
                    // 弹出新页面显示头像
                const _page_html = `
<html>
    <head>
        <title>avatar</title>
        <meta charset="UTF-8">
        <style>
            body {
                margin: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background-color: aliceblue;
                overflow: auto;
            }
            .container {
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .image-wrapper {
                position: relative;
                border-radius: 1px;
                overflow: visible;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }
            .img {
                max-width: 512px;
                max-height: 512px;
                border-radius: 0px;
                transition: transform 0.3s ease;
            }
            .btn-wrapper {
                margin-top: 20px;
                display: flex;
                flex-direction: row;
                gap: 20px;
            }
            .btn {
                position: relative;
                padding: 12px 24px;
                font-size: 16px;
                font-weight: 600;
                line-height: 1.3;
                color: white;
                align-items: center;
                display: flex;
                flex-direction: column;
                margin-top: 30px;
                margin-left: 10px;
                margin-right: 10px;
                gap: 2px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                border-radius: 30px;
                cursor: pointer;
                box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
                transition: all 0.3s ease;
                overflow: hidden;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .btn:before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                transition: left 0.5s;
            }
            .btn:hover:before {
                left: 100%;
            }
            .btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 12px 30px rgba(102, 126, 234, 0.6);
            }
            .btn:active {
                transform: translateY(-1px);
                box-shadow: 0 6px 15px rgba(102, 126, 234, 0.4);
            }
            .btn .icon {
                margin-right: 8px;
                font-size: 18px;
            }
            .btn .text {
                color: rgba(255,255,255,0.9);
                font-size: 14px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                text-align: center;
                opacity: 0.8;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            .btn .text .line1 {
            }
            .btn .text .line2 {
                font-size: 12px;
                opacity: 0.6;
            }
        </style>
    </head> 
    <body>
        <div class="container">
            <div class="image-wrapper">
                <img class="img" src="` + _src + `" alt="Avatar" scaled="false">
            </div>

            <div class="btn-wrapper">
                <button class="btn" id="download" onclick="downloadImage()">
                    <div class="text">
                        <span class="line1">下载图片</span>
                        <span class="line2">Download</span>
                    </div>
                </button>
                <button class="btn" id="search" onclick="searchByUrl()">
                    <div class="text">
                        <span class="line1">以图搜图</span>
                        <span class="line2">Search by Image</span>
                    </div>
                </button>
            </div>
        </div>

        <script>
            function downloadImage() {
                const _img = document.querySelector("img");
                const _img_src = _img.src;
                const _suffix = _img_src.substring(_img_src.lastIndexOf("."));
                const _filename = "avatar" + _suffix;
                fetch(_img_src)
                    .then(response => response.blob())
                    .then(blob => {
                        const _url = URL.createObjectURL(blob);
                        const _a = document.createElement('a');
                        _a.href = _url;
                        _a.download = _filename;
                        _a.click();
                        URL.revokeObjectURL(_url);
                    });
            }

            function searchByUrl() {
                var _url = document.querySelector("img").src;
                if (_url) {
                    _url = encodeURIComponent(_url);
                    const google_url = "https://lens.google.com/uploadbyurl?url=" + _url;
                    // https://www.google.com/searchbyimage?sbisrc=google&image_url=
                    // https://www.google.com/searchbyimage?client=Chrome&image_url=
                    window.open(google_url, '_blank');
                }
            }
        </script>
    </body>
</html>
`;

                    const _blob = new Blob([_page_html], { type: "text/html;charset=utf-8" });
                    const _blob_url = URL.createObjectURL(_blob);
                    const _new_window = window.open(_blob_url, "_blank");
                });
                avatar.setAttribute("style", "cursor: pointer;");
            }
        }
    }

    let q_avatar = setInterval(queryAvatar, 200);
})();