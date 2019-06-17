@echo off
rem
rem Copyright IBM Corp All Rights Reserved
rem
rem SPDX-License-Identifier: Apache-2.0
rem
setlocal enabledelayedexpansion

IF [%1] == [] (
    CALL :isRunning <%= dockerName %>_peer0.org1.example.com
) ELSE (
    for %%c in (<%= dockerName %>_orderer.example.com <%= dockerName %>_ca.org1.example.com <%= dockerName %>_peer0.org1.example.com <%= dockerName %>_couchdb <%= dockerName %>_logspout) do (
        CALL :isRunning %%i
    )
)
exit /b 0

:isRunning
  for /f "usebackq delims=" %~1 in (`docker inspect -f {{.State.Running}} %%c 2^>:NUL`) do set running=%~i
  if not !errorlevel! == 0 (
    exit /b 1
  )
  if not "!running!" == "true" (
    exit /b 1
  )
