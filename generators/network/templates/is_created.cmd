@echo off
rem
rem Copyright IBM Corp All Rights Reserved
rem
rem SPDX-License-Identifier: Apache-2.0
rem
setlocal enabledelayedexpansion
for %%v in (<%= name %>_orderer.example.com <%= name %>_ca.org1.example.com <%= name %>_peer0.org1.example.com <%= name %>_couchdb <%= name %>_logspout) do (
  docker volume inspect %%v > :NUL 2>&1
  if !ERRORLEVEL! == 0 ( 
    exit /b 0
  )
)
exit /b 1