@echo on
rem
rem Copyright IBM Corp All Rights Reserved
rem
rem SPDX-License-Identifier: Apache-2.0
rem
setlocal enabledelayedexpansion

SET CUSTOM_IMAGE=%1
if DEFINED CUSTOM_IMAGE (
    SET START_IMAGE=%CUSTOM_IMAGE%
) ELSE (
    SET START_IMAGE="ibmcom/ibp-microfab:0.0.11"
)

echo "Using image: %START_IMAGE%"

FOR /F "usebackq tokens=*" %%g IN (`docker ps -f label^=fabric-environment-name^="<%= name %> Microfab" -q -a`) do (SET CONTAINER=%%g)

IF DEFINED CONTAINER (
     docker start %CONTAINER%
     if !errorlevel! neq 0 (
        exit /b !errorlevel!
    )
) ELSE (
    SET MICROFAB_CONFIG=<%-microfabConfig%>
    docker run -e MICROFAB_CONFIG --label fabric-environment-name="<%= name %> Microfab" -d -p <%-port%>:<%-port%> %START_IMAGE%
)


exit /b 0