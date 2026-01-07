@echo off
chcp 65001 >nul
title ArtFlow AI - 本地开发服务器

echo ╔════════════════════════════════════════╗
echo ║       ArtFlow AI 本地开发服务器        ║
echo ╚════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [1/3] 检查 Node.js 环境...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)
echo      √ Node.js 已安装

echo [2/3] 检查依赖...
if not exist "node_modules" (
    echo      正在安装依赖，请稍候...
    npm install
    if %errorlevel% neq 0 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
)
echo      √ 依赖已就绪

echo [3/3] 启动开发服务器...
echo.
echo ════════════════════════════════════════
echo   服务器启动后，请访问:
echo   http://localhost:3000
echo.
echo   按 Ctrl+C 停止服务器
echo ════════════════════════════════════════
echo.

:: 延迟3秒后自动打开浏览器
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"

:: 启动开发服务器
npm run dev

pause
