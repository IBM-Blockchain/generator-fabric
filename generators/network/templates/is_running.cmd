@echo off
rem
rem Copyright IBM Corp All Rights Reserved
rem
rem SPDX-License-Identifier: Apache-2.0
rem
 
for /f "usebackq tokens=*" %%i in (`docker ps -f label^=fabric-environment-name^="<%= name %> Microfab" -q`) do set container=%%i

if not defined container (
    exit /b 1
) else (
    for /f "usebackq tokens=*" %%n in (`docker container port %container% ^| find /v /c ""`) do set NUM_CONTAINERS=%%n
    if "%NUM_CONTAINERS%"=="0" (
        exit /b 1
 
    )
    exit /b 0
)