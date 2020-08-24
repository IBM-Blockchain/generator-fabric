@echo on
rem
rem Copyright IBM Corp All Rights Reserved
rem
rem SPDX-License-Identifier: Apache-2.0
rem
setlocal enabledelayedexpansion
for /f "usebackq tokens=*" %%c in (`docker ps -f label^=fabric-environment-name^="<%= name %>" -q -a`) do (
    docker rm -f %%c
    if !errorlevel! neq 0 (
        exit /b !errorlevel!
    )
)
for /f "usebackq tokens=*" %%v in (`docker volume ls -f label^=fabric-environment-name^="<%= name %>" -q`) do (
    docker volume rm -f %%v
    if !errorlevel! neq 0 (
        exit /b !errorlevel!
    )
)
for /f "usebackq tokens=*" %%b in (`docker images "<%= name %>-*" -a -q`) do (
    docker volume rm -f %%b
    if !errorlevel! neq 0 (
        exit /b !errorlevel!
    )
)
if exist wallets (
    pushd wallets
    rmdir /q/s .
    popd
)
if exist gateways (
    pushd gateways
    rmdir /q/s .
    popd
)
if exist nodes (
    pushd nodes
    rmdir /q/s .
    popd
)
exit /b 0