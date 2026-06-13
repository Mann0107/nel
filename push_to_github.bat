@echo off
title Push Neel India to GitHub
color 0B
echo ======================================================================
echo             NEEL INDIA - AUTOMATED GITHUB REPO PUBLISHER             
echo ======================================================================
echo.

:: Verify Git is installed in CMD path
git --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Git is not installed or not configured in your PATH environment variable.
    echo Please install Git from: https://git-scm.com/downloads
    echo.
    echo Once installed, restart your terminal/PC and double-click this script again.
    echo.
    pause
    exit /b
)

echo [1/3] Initializing local Git repository...
if not exist .git (
    git init
)
echo.

echo [2/3] Staging and committing files (excluding node_modules)...
git add .
git commit -m "Initial commit of Neel India E-Commerce codebase"
git branch -M main
echo.

echo [3/3] Linking remote repository and pushing...
:: Remove remote origin if it already exists to prevent errors
git remote remove origin >nul 2>&1
git remote add origin https://github.com/Mann0107/Neel.git

echo Uploading to GitHub (main branch)...
git push -u origin main

if %errorlevel% equ 0 (
    color 0A
    echo.
    echo ======================================================================
    echo   Code successfully pushed to: https://github.com/Mann0107/Neel.git
    echo ======================================================================
) else (
    color 0C
    echo.
    echo [ERROR] Git push failed. 
    echo * Make sure you have authorized access to push to this repository.
    echo * If this is an empty repo, check if you need to run git pull first.
)
echo.
pause
