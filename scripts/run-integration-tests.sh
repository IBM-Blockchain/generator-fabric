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

if [ "${TRAVIS}" = "true" ]
then
    sudo sh -c "curl https://raw.githubusercontent.com/kadwanev/retry/master/retry -o /usr/local/bin/retry && chmod +x /usr/local/bin/retry"
    RETRY="retry -t 10 -m 10 -x 60 --"
    sudo sh -c "curl https://raw.githubusercontent.com/travis-ci/gimme/master/gimme -o /usr/local/bin/gimme && chmod +x /usr/local/bin/gimme"
    eval "$(gimme 1.10)"
else
    RETRY=""
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"
if [ ! -d tmp ]
then
    mkdir tmp
else
    rm -rf tmp
    mkdir tmp
fi

for IMAGE in hyperledger/fabric-ca hyperledger/fabric-orderer hyperledger/fabric-peer hyperledger/fabric-tools hyperledger/fabric-ccenv hyperledger/fabric-javaenv
do
    docker pull nexus3.hyperledger.org:10001/${IMAGE}:amd64-1.3.0-stable
    docker tag nexus3.hyperledger.org:10001/${IMAGE}:amd64-1.3.0-stable ${IMAGE}:amd64-1.3.0-stable
    docker tag nexus3.hyperledger.org:10001/${IMAGE}:amd64-1.3.0-stable ${IMAGE}:amd64-1.3.0
    docker tag nexus3.hyperledger.org:10001/${IMAGE}:amd64-1.3.0-stable ${IMAGE}
done

pushd tmp
git clone -b master https://github.com/hyperledger/fabric-samples.git
pushd fabric-samples/basic-network
export FABRIC_DIR="$(pwd)"
./start.sh
popd
popd

rm -f generator-fabric-*.tgz
npm pack
npm install -g yo generator-fabric-*.tgz
rm -f generator-fabric-*.tgz

chaincode_tests() {
    LANGUAGES="go java javascript typescript"
    for LANGUAGE in ${LANGUAGES}
    do
        chaincode_test ${LANGUAGE}
    done
}

chaincode_test() {
    LANGUAGE=$1
    mkdir ${LANGUAGE}-chaincode
    pushd ${LANGUAGE}-chaincode
    ${LANGUAGE}_chaincode_package
    common_chaincode_deploy
    common_chaincode_test
    popd
}

go_chaincode_package() {
    export GOPATH=$PWD
    mkdir -p src/chaincode
    pushd src/chaincode
    yo fabric:chaincode -- --language=${LANGUAGE} --author="Lord Conga" --description="Lord Conga's Smart Chaincode" --name=${LANGUAGE}-chaincode --version=0.0.1 --license=Apache-2.0
    go get
    go test
    go build
    popd
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:7051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" \
        -v "$(pwd)":/opt/gopath \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp":/etc/hyperledger/msp/peer \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/users":/etc/hyperledger/msp/users \
        --network net_basic \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode package -n ${LANGUAGE}-chaincode -v 0.0.1 -p chaincode -l golang /opt/gopath/chaincode.cds
    date
}

java_chaincode_package() {
    yo fabric:chaincode -- --language=${LANGUAGE} --author="Lord Conga" --description="Lord Conga's Chaincode" --name=${LANGUAGE}-chaincode --version=0.0.1 --license=Apache-2.0
    ./gradlew build
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:7051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" \
        -v "$(pwd)":/tmp/chaincode \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp":/etc/hyperledger/msp/peer \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/users":/etc/hyperledger/msp/users \
        --network net_basic \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode package -n ${LANGUAGE}-chaincode -v 0.0.1 -p /tmp/chaincode -l java /tmp/chaincode/chaincode.cds
    date
}

javascript_chaincode_package() {
    yo fabric:chaincode -- --language=${LANGUAGE} --author="Lord Conga" --description="Lord Conga's Chaincode" --name=${LANGUAGE}-chaincode --version=0.0.1 --license=Apache-2.0
    npm test
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:7051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" \
        -v "$(pwd)":/tmp/chaincode \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp":/etc/hyperledger/msp/peer \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/users":/etc/hyperledger/msp/users \
        --network net_basic \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode package -n ${LANGUAGE}-chaincode -v 0.0.1 -p /tmp/chaincode -l node /tmp/chaincode/chaincode.cds
    date
}

typescript_chaincode_package() {
    yo fabric:chaincode -- --language=${LANGUAGE} --author="Lord Conga" --description="Lord Conga's Chaincode" --name=${LANGUAGE}-chaincode --version=0.0.1 --license=Apache-2.0
    npm test
    npm run build
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:7051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" \
        -v "$(pwd)":/tmp/chaincode \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp":/etc/hyperledger/msp/peer \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/users":/etc/hyperledger/msp/users \
        --network net_basic \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode package -n ${LANGUAGE}-chaincode -v 0.0.1 -p /tmp/chaincode -l node /tmp/chaincode/chaincode.cds
    date
}

common_chaincode_deploy() {
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:7051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" \
        -v "$(pwd)":/tmp/chaincode \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp":/etc/hyperledger/msp/peer \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/users":/etc/hyperledger/msp/users \
        --network net_basic \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode install /tmp/chaincode/chaincode.cds
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:7051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp":/etc/hyperledger/msp/peer \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/users":/etc/hyperledger/msp/users \
        --network net_basic \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n ${LANGUAGE}-chaincode -v 0.0.1 -c '{"Args":["init","a","100","b","200"]}'
    date
}

common_chaincode_test() {
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:7051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp":/etc/hyperledger/msp/peer \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/users":/etc/hyperledger/msp/users \
        --network net_basic \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode invoke -o orderer.example.com:7050 -C mychannel -n ${LANGUAGE}-chaincode -c '{"Args":["invoke","a","b","10"]}' --waitForEvent
    date
}

contract_tests() {
    LANGUAGES="javascript typescript"
    for LANGUAGE in ${LANGUAGES}
    do
        contract_test ${LANGUAGE}
    done
}

contract_test() {
    LANGUAGE=$1
    mkdir ${LANGUAGE}-contract
    pushd ${LANGUAGE}-contract
    ${LANGUAGE}_contract_package
    common_contract_deploy
    common_contract_test
    popd
}

javascript_contract_package() {
    yo fabric:contract -- --language=${LANGUAGE} --author="Lord Conga" --description="Lord Conga's Smart Contract" --name=${LANGUAGE}-contract --version=0.0.1 --license=Apache-2.0
    npm test
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:7051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" \
        -v "$(pwd)":/tmp/contract \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp":/etc/hyperledger/msp/peer \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/users":/etc/hyperledger/msp/users \
        --network net_basic \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode package -n ${LANGUAGE}-contract -v 0.0.1 -p /tmp/contract -l node /tmp/contract/contract.cds
    date
}

typescript_contract_package() {
    yo fabric:contract -- --language=${LANGUAGE} --author="Lord Conga" --description="Lord Conga's Smart Contract" --name=${LANGUAGE}-contract --version=0.0.1 --license=Apache-2.0
    npm test
    npm run build
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:7051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" \
        -v "$(pwd)":/tmp/contract \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp":/etc/hyperledger/msp/peer \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/users":/etc/hyperledger/msp/users \
        --network net_basic \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode package -n ${LANGUAGE}-contract -v 0.0.1 -p /tmp/contract -l node /tmp/contract/contract.cds
    date
}

common_contract_deploy() {
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:7051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" \
        -v "$(pwd)":/tmp/contract \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp":/etc/hyperledger/msp/peer \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/users":/etc/hyperledger/msp/users \
        --network net_basic \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode install /tmp/contract/contract.cds
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:7051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp":/etc/hyperledger/msp/peer \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/users":/etc/hyperledger/msp/users \
        --network net_basic \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n ${LANGUAGE}-contract -v 0.0.1 -c '{"Args":["instantiate"]}'
    date
}

common_contract_test() {
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:7051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp":/etc/hyperledger/msp/peer \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/users":/etc/hyperledger/msp/users \
        --network net_basic \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode invoke -o orderer.example.com:7050 -C mychannel -n ${LANGUAGE}-contract -c '{"Args":["transaction1","hello"]}' --waitForEvent
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:7051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp":/etc/hyperledger/msp/peer \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/users":/etc/hyperledger/msp/users \
        --network net_basic \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode invoke -o orderer.example.com:7050 -C mychannel -n ${LANGUAGE}-contract -c '{"Args":["transaction2","hello","world"]}' --waitForEvent
    date
}

pushd tmp
chaincode_tests
contract_tests
popd

pushd tmp/fabric-samples/basic-network
./stop.sh
./teardown.sh
popd
