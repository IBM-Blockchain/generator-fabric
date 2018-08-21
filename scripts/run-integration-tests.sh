#!/usr/bin/env bash
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

set -ex

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"
if [ ! -d tmp ]
then
    mkdir tmp
else
    rm -rf tmp
    mkdir tmp
fi

pushd tmp
git clone -b release-1.2 https://github.com/hyperledger/fabric-samples.git
pushd fabric-samples/basic-network
export FABRIC_DIR="$(pwd)"
./start.sh
popd
popd

rm -f generator-fabric-*.tgz
npm pack
npm install -g yo generator-fabric-*.tgz
rm -f generator-fabric-*.tgz

pushd tmp
LANGUAGES="javascript typescript"
for LANGUAGE in ${LANGUAGES}
do
    mkdir ${LANGUAGE}-contract
    pushd ${LANGUAGE}-contract
    yo fabric:chaincode -- --language=${LANGUAGE} --author="Lord Conga" --description="Lord Conga's Smart Contract" --name=${LANGUAGE}-contract --version=0.0.1 --license=Apache-2.0
    npm install
    npm test
    if [ ${LANGUAGE} = "typescript" ]
    then
        npm run build
    fi
    date
    docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:7051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" \
        -v "$(pwd)":/tmp/chaincode \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp":/etc/hyperledger/msp/peer \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/users":/etc/hyperledger/msp/users \
        --network net_basic \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode install -n ${LANGUAGE}-contract -v 0.0.1 -p /tmp/chaincode -l node
    date
    docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:7051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" \
        -v "$(pwd)":/tmp/chaincode \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp":/etc/hyperledger/msp/peer \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/users":/etc/hyperledger/msp/users \
        --network net_basic \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n ${LANGUAGE}-contract -v 0.0.1 -l node -c '{"Args":["init","a","100","b","200"]}'
    date
    docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:7051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" \
        -v "$(pwd)":/tmp/chaincode \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp":/etc/hyperledger/msp/peer \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/users":/etc/hyperledger/msp/users \
        --network net_basic \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode invoke -o orderer.example.com:7050 -C mychannel -n ${LANGUAGE}-contract -c '{"Args":["invoke","a","b","10"]}' --waitForEvent
    date
    popd
done
popd

pushd tmp/fabric-samples/basic-network
./stop.sh
./teardown.sh
popd
