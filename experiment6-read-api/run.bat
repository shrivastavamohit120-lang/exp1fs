@echo off
setlocal
title Experiment 6 - Scalable Read API
cd /d "%~dp0"

where java >nul 2>nul
if errorlevel 1 goto nojava
where mvn >nul 2>nul
if errorlevel 1 goto nomvn

echo ============================================================
echo  Starting Experiment 6 - Scalable Read APIs (Spring Boot)
echo  First run downloads dependencies, please wait...
echo  When you see "Started ScalableReadApiApplication" open:
echo      http://localhost:8080/
echo  Press Ctrl+C to stop.
echo ============================================================
call mvn spring-boot:run
goto end

:nojava
echo [ERROR] Java was not found. Install JDK 17 or newer and make sure "java" is on PATH.
goto end

:nomvn
echo [ERROR] Maven was not found. Install Apache Maven 3.6+ and make sure "mvn" is on PATH.
echo         https://maven.apache.org/download.cgi

:end
pause
