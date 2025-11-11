// ==UserScript==
// @name         bilibili image
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  remove bilibili image format suffix to get original image
// @author       SHYUF
// @include      /^https?:\/\/i\d\.hdslb\.com\/.*\.(?:jpg|png|jpeg|gif|bmp)@.+\.(?:webp|avif)$/
// @include      /^https?:\/\/i\d\.hdslb\.com\/.*\.(?:jpg|png|jpeg|gif|bmp)$/
// @run-at       document-start
// @icon         https://www.bilibili.com/favicon.ico
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function() {
    'use strict';

    // 默认启用
    const STORAGE_KEY = 'biliImageRedirect_enabled';
    
    // 注册菜单命令
    function updateMenu() {
        const enabled = GM_getValue(STORAGE_KEY, false);
        const menuText = enabled ? '禁用图片处理' : '启用图片处理';
        GM_registerMenuCommand(menuText, function() {
            GM_setValue(STORAGE_KEY, !enabled);
            location.reload();
        });
    }
    
    updateMenu();

    function removeImageFormatSuffix() {
        var pattern = /^(.+\.(?:jpg|png|jpeg|gif|bmp))@.+\.(?:webp|avif)$/i;

        var href = window.location.href;
        if (pattern.test(href)) {
            var new_href = href.replace(pattern, "$1");
            window.location.replace(new_href);
        }
    }

    if (GM_getValue(STORAGE_KEY, false)) {
        removeImageFormatSuffix();
    }
})();