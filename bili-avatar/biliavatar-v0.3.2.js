// ==UserScript==
// @name         bilibili avatar
// @namespace    http://tampermonkey.net/
// @version      0.3.2
// @description  make bilibili space avatar clickable and easy to oprate
// @author       SHYUF
// @match        https://space.bilibili.com/*
// @include      /^https:\/\/space\.bilibili\.com\/\d+/
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
            var pattern = /^(.+\.(?:jpg|png|jpeg|gif|bmp))@.+\.(?:webp|avif)$/i;

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
            
            // 检查是否正在直播
            const live_element = document.querySelector(".live-ani");
            const is_live = live_element !== null;
            var live_link = null;

            if (is_live) {
                live_link = live_element.getAttribute("href");
                if (live_link && live_link.indexOf("http") !== 0) {
                    live_link = "https:" + live_link;
                }

                live_element.style.pointerEvents = "none";
            }

            // 创建下拉菜单
            function createdropdown_menu() {
                let existingMenu = document.querySelector(".avatar-dropdown-menu");
                if (existingMenu) {
                    existingMenu.remove();
                    return;
                }

                // 创建下拉菜单容器
                const dropdown_menu = document.createElement("div");
                dropdown_menu.className = "avatar-dropdown-menu";
                dropdown_menu.style.cssText = `
                    position: absolute;
                    top: 100%;
                    left: 0;
                    margin-top: 8px;
                    background: white;
                    border: 1px solid #e5e9ef;
                    border-radius: 6px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    z-index: 9999;
                    min-width: 80px;
                    overflow: hidden;
                `;

                // 创建下拉菜单项
                function createOption(text, onClick) {
                    const option = document.createElement("div");
                    option.className = "avatar-dropdown-item";
                    option.textContent = text;
                    option.style.cssText = `
                        padding: 8px 12px;
                        cursor: pointer;
                        transition: background-color 0.15s;
                        font-size: 16px;
                        text-align: center;
                        letter-spacing: 2px;
                        color: #333;
                    `;
                    option.addEventListener("mouseenter", () => {
                        option.style.backgroundColor = "#cdcdcdff";
                    });
                    option.addEventListener("mouseleave", () => {
                        option.style.backgroundColor = "white";
                    });
                    option.addEventListener("click", (e) => {
                        e.stopPropagation();
                        dropdown_menu.remove();
                        onClick();
                    });

                    // 添加分隔线
                    if (dropdown_menu && dropdown_menu.children.length > 0) {
                        const separator = document.createElement("div");
                        separator.style.cssText = `
                            height: 1px;
                            background-color: #e5e9ef;
                            margin: 1px 0;
                        `;
                        dropdown_menu.appendChild(separator);
                    }

                    dropdown_menu.appendChild(option);
                    return option;
                }

                // 创建头像选项
                const view_avatar_option = createOption("头像", openAvatarPage);

                // 如果正在直播
                if (is_live) {
                    const live_room_option = createOption("直播", () => {
                        window.open(live_link, "_blank");
                    });
                }
                return dropdown_menu;
            }

            // 打开头像页面
            function openAvatarPage() {
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
            .info-panel {
                margin-top: 20px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                text-align: center;
            }
            .info-item {
                color: #666;
                font-size: 14px;
                margin: 3px 0;
            }
            .image-wrapper {
                position: relative;
                border-radius: 1px;
                overflow: visible;
                box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
            }
            .img {
                max-width: 512px;
                max-height: 512px;
                border-radius: 0px;
                transition: transform 0.3s ease;
            }
            .btn-wrapper {
                margin-top: 5px;
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
                content: "";
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
                <img class="img" src="` + _src + `" alt="Avatar" scaled="false" onload="displayImageInfo()">
            </div>

            <div class="info-panel">
                <div class="info-item" id="dimensions">加载中</div>
                <div class="info-item" id="filesize">加载中</div>
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
            function displayImageInfo() {
                const img = document.querySelector("img");
                const dimensionsEl = document.getElementById("dimensions");
                const filesizeEl = document.getElementById("filesize");

                // 显示图片尺寸
                const width = img.naturalWidth;
                const height = img.naturalHeight;
                dimensionsEl.textContent = width + " × " + height + " px";

                // 获取图片文件大小
                fetch(img.src)
                    .then(response => {
                        const contentLength = response.headers.get('content-length');
                        if (contentLength) {
                            const sizeInBytes = parseInt(contentLength);
                            filesizeEl.textContent = formatFileSize(sizeInBytes);
                        } else {
                            return response.blob().then(blob => {
                                filesizeEl.textContent = formatFileSize(blob.size);
                            });
                        }
                    })
                    .catch(error => {
                        filesizeEl.textContent = "无法获取";
                        console.error("Error fetching file size:", error);
                    });
            }

            function formatFileSize(bytes) {
                if (bytes < 1024) {
                    return bytes + " B";
                } else if (bytes < 1024 * 1024) {
                    return (bytes / 1024).toFixed(2) + " KB";
                } else {
                    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
                }
            }

            function downloadImage() {
                const _img = document.querySelector("img");
                const _img_src = _img.src;
                const _suffix = _img_src.substring(_img_src.lastIndexOf("."));
                const _filename = "avatar" + _suffix;
                fetch(_img_src)
                    .then(response => response.blob())
                    .then(blob => {
                        const _url = URL.createObjectURL(blob);
                        const _a = document.createElement("a");
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
                    window.open(google_url, "_blank");
                }
            }
        </script>
    </body>
</html>
`;

                    const _blob = new Blob([_page_html], { type: "text/html;charset=utf-8" });
                    const _blob_url = URL.createObjectURL(_blob);
                    const _new_window = window.open(_blob_url, "_blank");
            }

            // 添加点击事件
            var avatar = document.querySelector(".avatar");
            if (avatar) {
                avatar.style.position = "relative";
                avatar.style.cursor = "pointer";

                avatar.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const menu = createdropdown_menu();
                    if (menu) {
                        avatar.appendChild(menu);
                    }
                });

                // 点击页面其他地方关闭下拉菜单
                document.addEventListener("click", () => {
                    const existingMenu = document.querySelector(".avatar-dropdown-menu");
                    if (existingMenu) {
                        existingMenu.remove();
                    }
                });
            }
        }
    }

    let q_avatar = setInterval(queryAvatar, 200);
})();