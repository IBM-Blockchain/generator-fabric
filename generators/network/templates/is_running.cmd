@echo off
rem
rem Copyright IBM Corp All Rights Reserved
rem
rem SPDX-License-Identifier: Apache-2.0
rem
setlocal enabledelayedexpansion
for %%c in (<%= name %>_orderer.example.com <%= name %>_ca.org1.example.com <%= name %>_peer0.org1.example.com <%= name %>_couchdb <%= name %>_logspout) do (
  for /f "usebackq delims=" %%i in (`docker inspect -f {{.State.Running}} %%c 2^>:NUL`) do set running=%%i
  if not !errorlevel! == 0 (
    exit /b 1
  )
  if not "!running!" == "true" (
    exit /b 1
  )
)
exit /b 0