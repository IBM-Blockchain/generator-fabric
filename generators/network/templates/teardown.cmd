@echo off
rem
rem Copyright IBM Corp All Rights Reserved
rem
rem SPDX-License-Identifier: Apache-2.0
rem

rem Shut down the Docker containers for the system tests.
docker-compose -f docker-compose.yml kill && docker-compose -f docker-compose.yml down

rem remove chaincode docker images
for /f "tokens=*" %%i in ('docker ps -aq --filter "name=<%= name %>-*"') do docker rm -f %%i
for /f "tokens=*" %%i in ('docker images -aq "<%= name %>-*"') do docker rmi -f %%i

# remove previous crypto material and config transactions
rm -fr admin-msp/* configtx/* crypto-config/* gateways/* nodes/* wallets/*

rem Your system is now clean
