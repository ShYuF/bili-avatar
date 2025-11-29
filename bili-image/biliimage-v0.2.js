// ==UserScript==
// @name         bilibili image
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  remove bilibili image format suffix to get original image
// @author       SHYUF
// @include      /^https?:\/\/i\d\.hdslb\.com\/.*\.(?:jpg|png|jpeg|gif|bmp|webp|jpe)@.+\.(?:webp|avif)$/
// @include      /^https?:\/\/i\d\.hdslb\.com\/.*\.(?:jpg|png|jpeg|gif|bmp|webp|jpe)$/
// @run-at       document-start
// @icon         https://www.bilibili.com/favicon.ico
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_download
// @grant        GM_xmlhttpRequest
// @connect      hdslb.com
// ==/UserScript==

(function() {
    'use strict';

    // 存储键
    const STORAGE_KEY = 'biliImageRedirect_enabled';
    const RENAME_ENABLED_KEY = 'biliImageRename_enabled';
    const FIXED_NAME_KEY = '';    

    
    // 注册菜单命令
    function updateMenu() {
        const enabled = GM_getValue(STORAGE_KEY, false);
        const menuText = enabled ? '禁用后缀格式处理' : '启用后缀格式处理';
        GM_registerMenuCommand(menuText, function() {
            GM_setValue(STORAGE_KEY, !enabled);
            location.reload();
        });

        const renameEnabled = GM_getValue(RENAME_ENABLED_KEY, false);
        GM_registerMenuCommand(renameEnabled ? '禁用自定义下载' : '启用自定义下载', function() {
            GM_setValue(RENAME_ENABLED_KEY, !renameEnabled);
            location.reload();
        });

        if (renameEnabled) {
            const fixedName = GM_getValue(FIXED_NAME_KEY, '');
            GM_registerMenuCommand('自定义下载文件名', function() {
                const newName = prompt(
                    '自定义下载文件名（不含扩展名）：\n\n' +
                    '支持变量：\n' + 
                    '  {timestamp} ：当前时间戳\n' +
                    '  {date} ：当前日期（YYYYMMDD）\n' +
                    '  {time} ：当前时间（HHMMSS）\n' +
                    '  {YYYY}, {YY}, {MM}, {DD} ：年（四位 / 两位）、月、日\n' +
                    '  {hh}, {mm}, {ss} ：时、分、秒\n' +
                    '  {origin} ：原文件名（不含扩展名）\n' +
                    '  {ext} ：文件扩展名\n' +
                    '  {rd} ：8位随机字符串',
                    fixedName
                );
                if (newName !== null) {
                    GM_setValue(FIXED_NAME_KEY, newName.trim());
                    location.reload();
                }
            });
        }
    }
    updateMenu();

    function removeImageFormatSuffix() {
        var pattern = /^(.+\.(?:jpg|png|jpeg|gif|bmp|webp|jpe))@.+\.(?:webp|avif)$/i;

        var href = window.location.href;
        if (pattern.test(href)) {
            var new_href = href.replace(pattern, "$1");
            window.location.replace(new_href);
        }
    }

    function renameImage() {
        // 获取配置
        const fixedName = GM_getValue(FIXED_NAME_KEY, '');
        
        // 获取当前URL并提取扩展名
        const currentUrl = window.location.href;
        const extMatch = currentUrl.match(/\.([a-z]+)(?:\?|$)/i);
        const extension = extMatch ? extMatch[1] : 'jpg';

        function parseRegName(currentUrl, fixedName, extension) {
            const patterns = {
                // 时间相关
                "{timestamp}": () => String(Date.now()),
                "{date}": () => {
                    const date = new Date();
                    return date.getFullYear().toString() +
                        String(date.getMonth() + 1).padStart(2, '0') +
                        String(date.getDate()).padStart(2, '0');
                },
                "{time}": () => {
                    const date = new Date();
                    return String(date.getHours()).padStart(2, '0') +
                        String(date.getMinutes()).padStart(2, '0') +
                        String(date.getSeconds()).padStart(2, '0');
                },
                "{YYYY}": () => {
                    const date = new Date();
                    return String(date.getFullYear());
                },
                "{YY}": () => {
                    const date = new Date();
                    return String(date.getFullYear()).slice(-2);
                },
                "{MM}": () => {
                    const date = new Date();
                    return String(date.getMonth() + 1).padStart(2, '0');
                },
                "{DD}": () => {
                    const date = new Date();
                    return String(date.getDate()).padStart(2, '0');
                },
                "{hh}": () => {
                    const date = new Date();
                    return String(date.getHours()).padStart(2, '0');
                },
                "{mm}": () => {
                    const date = new Date();
                    return String(date.getMinutes()).padStart(2, '0');
                },
                "{ss}": () => {
                    const date = new Date();
                    return String(date.getSeconds()).padStart(2, '0');
                },
                // 原文件和后缀相关
                "{origin}": () => {
                    const urlParts = currentUrl.split('/');
                    const lastPart = urlParts[urlParts.length - 1];
                    return lastPart.split('.').slice(0, -1).join('.');
                },
                "{ext}": () => extension,
                // 短字符串
                "{rd}": () => Math.random().toString(36).substring(2, 10),
            };

            let fileName = fixedName || "{origin}";
            for (const [key, func] of Object.entries(patterns)) {
                fileName = fileName.replace(new RegExp(key, 'g'), func());
            }
            return `${fileName}.${extension}`;
        }
        const fileName = parseRegName(currentUrl, fixedName, extension);

        // 快捷键下载（Ctrl + S）
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                downloadWithFixedName(currentUrl, fileName);
            }
        });
        
        // 浮动下载按钮
        function createDownloadButton() {
            const button = document.createElement('div');
            button.textContent = `下载为 "${fileName}"`;
            button.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #00a1d6;
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                cursor: pointer;
                z-index: 10000;
                font-size: 14px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                user-select: none;
                transition: all 0.3s;
            `;
            button.onmouseover = () => {
                button.style.background = '#0090c7';
                button.style.transform = 'scale(1.05)';
            };
            button.onmouseout = () => {
                button.style.background = '#00a1d6';
                button.style.transform = 'scale(1)';
            };
            button.onclick = function() {
                downloadWithFixedName(currentUrl, fileName);
            };
            
            document.body.appendChild(button);
        }

        // 添加按钮
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createDownloadButton);
        } else {
            createDownloadButton();
        }

        // 使用GM_download下载文件
        function downloadWithFixedName(url, filename) {
            GM_download({
                url: url,
                name: filename,
                saveAs: true,
                onerror: function(error) {
                    console.error('下载失败:', error);
                }
            });
        }
    }

    if (GM_getValue(STORAGE_KEY, false)) {
        removeImageFormatSuffix();
    }

    if (GM_getValue(RENAME_ENABLED_KEY, false)) {
        renameImage();
    }
})();