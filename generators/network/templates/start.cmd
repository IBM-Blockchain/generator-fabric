@echo on
rem
rem Copyright IBM Corp All Rights Reserved
rem
rem SPDX-License-Identifier: Apache-2.0
rem
setlocal enabledelayedexpansion


FOR /F "usebackq tokens=*" %%g IN (`docker ps -f label^=fabric-environment-name^="<%= name %> Microfab" -q -a`) do (SET CONTAINER=%%g)

IF DEFINED CONTAINER (
     docker start %CONTAINER%
     if !errorlevel! neq 0 (
        exit /b !errorlevel!
    )
) ELSE (
    SET MICROFAB_CONFIG=<%-microfabConfig%>
    docker run -e MICROFAB_CONFIG --label fabric-environment-name="<%= name %> Microfab" -d -p <%-port%>:<%-port%> ibmcom/ibp-microfab:0.0.7
)


exit /b 0