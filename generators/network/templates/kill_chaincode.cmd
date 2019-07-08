rem Copyright IBM Corp All Rights Reserved
rem
rem SPDX-License-Identifier: Apache-2.0
rem

if not [%1] == [] (
    docker stop <%= dockerName %>-peer0.org1.example.com-%1-%2
    docker rm <%= dockerName %>-peer0.org1.example.com-%1-%2
) else (
    exit /b 1
)

exit /b 0
