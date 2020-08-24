#!/usr/bin/env bash
#
# SPDX-License-Identifier: Apache-2.0
#

set -ex

if [ -n "${TF_BUILD}" ]
then
    sudo sh -c "curl https://raw.githubusercontent.com/kadwanev/retry/master/retry -o /usr/local/bin/retry && chmod +x /usr/local/bin/retry"
    RETRY="retry -t 10 -m 10 -x 60 --"
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

if [ "$1" == "contract_tests" ] || [ "$1" == "chaincode_tests" ]
then
    pushd tmp
    curl -sSL http://bit.ly/2ysbOFE | bash -s 1.4.4
    pushd fabric-samples/basic-network
    export FABRIC_DIR="$(pwd)"
    ./start.sh
    popd
    popd
fi

if [ "$1" == "private_contract_tests" ]
then
    pushd tmp
    curl -sSL http://bit.ly/2ysbOFE | bash -s 1.4.4
    mkdir yofn
    pushd yofn
    cp ../../scripts/network/*.* ./
    export NETWORK_DIR="$(pwd)"
    chmod +x *.sh
    ./generate.sh && ./start.sh
    popd
    popd
fi

rm -f generator-fabric-*.tgz
npm pack
npm install -g yo generator-fabric-*.tgz
rm -f generator-fabric-*.tgz

chaincode_tests() {
    LANGUAGES="go java javascript kotlin typescript"
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
    yo fabric:chaincode -- --language=${LANGUAGE} --author="Lord Conga" --description="Lord Conga's Chaincode" --name=${LANGUAGE}-chaincode --version=0.0.1 --license=Apache-2.0
    go get
    go test
    go build
    go mod vendor
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:7051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" \
        -v "$(pwd)":/opt/gopath/src/chaincode \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp":/etc/hyperledger/msp/peer \
        -v "${FABRIC_DIR}/crypto-config/peerOrganizations/org1.example.com/users":/etc/hyperledger/msp/users \
        --network net_basic \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode package -n ${LANGUAGE}-chaincode -v 0.0.1 -p chaincode -l golang /opt/gopath/src/chaincode/chaincode.cds
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
    npm audit --audit-level=moderate
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

kotlin_chaincode_package() {
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

typescript_chaincode_package() {
    yo fabric:chaincode -- --language=${LANGUAGE} --author="Lord Conga" --description="Lord Conga's Chaincode" --name=${LANGUAGE}-chaincode --version=0.0.1 --license=Apache-2.0
    npm audit --audit-level=moderate
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
    CONTRACT="default"

    if [ -z "$1" ]; then
        LANGUAGES="java javascript kotlin typescript"
    else
        LANGUAGES="$1"
    fi
    for LANGUAGE in ${LANGUAGES}
    do
        contract_test ${LANGUAGE} ${CONTRACT}
    done
}

private_contract_tests() {
    CONTRACT="private"

    if [ -z "$1" ]; then
        LANGUAGES="javascript typescript"
    else
        LANGUAGES="$1"
    fi
    for LANGUAGE in ${LANGUAGES}
    do
        contract_test ${LANGUAGE} ${CONTRACT}
    done
}

contract_test() {
    CONTRACT=$2
    LANGUAGE=$1
    mkdir ${LANGUAGE}-${CONTRACT}-contract
    pushd ${LANGUAGE}-${CONTRACT}-contract
    ${LANGUAGE}_${CONTRACT}_contract_package
    if [ ${CONTRACT} == "default" ]; then
        common_contract_deploy
        common_contract_test
    else [ ${CONTRACT} == "private" ]
        private_contract_deploy
        private_contract_test
    fi
    popd
}

java_default_contract_package() {
    yo fabric:contract -- --contractType=${CONTRACT} --language=${LANGUAGE} --author="Lord Conga" --description="Lord Conga's Smart Contract" --name=${LANGUAGE}-${CONTRACT}-contract --version=0.0.1 --license=Apache-2.0 --asset conga
    ./gradlew clean build shadowJar
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
        peer chaincode package -n ${LANGUAGE}-${CONTRACT}-contract -v 0.0.1 -p /tmp/contract -l java /tmp/contract/contract.cds
    date
}

kotlin_default_contract_package() {
    yo fabric:contract -- --contractType=${CONTRACT} --language=${LANGUAGE} --author="Lord Conga" --description="Lord Conga's Smart Contract" --name=${LANGUAGE}-${CONTRACT}-contract --version=0.0.1 --license=Apache-2.0 --asset conga
    ./gradlew clean build shadowJar
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
        peer chaincode package -n ${LANGUAGE}-${CONTRACT}-contract -v 0.0.1 -p /tmp/contract -l java /tmp/contract/contract.cds
    date
}

javascript_default_contract_package() {
    yo fabric:contract -- --contractType=${CONTRACT} --language=${LANGUAGE} --author="Lord Conga" --description="Lord Conga's Smart Contract" --name=${LANGUAGE}-${CONTRACT}-contract --version=0.0.1 --license=Apache-2.0 --asset conga
    npm audit --audit-level=moderate
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
        peer chaincode package -n ${LANGUAGE}-${CONTRACT}-contract -v 0.0.1 -p /tmp/contract -l node /tmp/contract/contract.cds
    date
}

typescript_default_contract_package() {
    yo fabric:contract -- --contractType=${CONTRACT} --language=${LANGUAGE} --author="Lord Conga" --description="Lord Conga's Smart Contract" --name=${LANGUAGE}-${CONTRACT}-contract --version=0.0.1 --license=Apache-2.0 --asset conga
    npm audit --audit-level=moderate
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
        peer chaincode package -n ${LANGUAGE}-${CONTRACT}-contract -v 0.0.1 -p /tmp/contract -l node /tmp/contract/contract.cds
    date
}

java_private_contract_package() {
    yo fabric:contract -- --contractType=${CONTRACT} --mspId Org1MSP --language=${LANGUAGE} --author="Lord Conga" --description="Lord Conga's Smart Contract" --name=${LANGUAGE}-${CONTRACT}-contract --version=0.0.1 --license=Apache-2.0 --asset PrivateConga
    jq ".[0].policy = \"OR('Org1MSP.member')\"" collections.json > collections-cli.json
    ./gradlew clean build shadowJar
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:17051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org1/org1Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org1/ca-tls-root.pem" \
        -v "$(pwd)":/tmp/contract \
        -v "${NETWORK_DIR}/wallets/Org1":/etc/hyperledger/fabric/Org1 \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode package -n ${LANGUAGE}-${CONTRACT}-contract -v 0.0.1 -p /tmp/contract -l java /tmp/contract/contract.cds
    date
}

javascript_private_contract_package() {
    yo fabric:contract -- --contractType=${CONTRACT} --mspId Org1MSP --language=${LANGUAGE} --author="Lord Conga" --description="Lord Conga's Smart Contract" --name=${LANGUAGE}-${CONTRACT}-contract --version=0.0.1 --license=Apache-2.0 --asset PrivateConga
    jq ".[0].policy = \"OR('Org1MSP.member')\"" collections.json > collections-cli.json
    npm audit --audit-level=moderate
    npm test
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:17051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org1/org1Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org1/ca-tls-root.pem" \
        -v "$(pwd)":/tmp/contract \
        -v "${NETWORK_DIR}/wallets/Org1":/etc/hyperledger/fabric/Org1 \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode package -n ${LANGUAGE}-${CONTRACT}-contract -v 0.0.1 -p /tmp/contract -l node /tmp/contract/contract.cds
    date
}

typescript_private_contract_package() {
    yo fabric:contract -- --contractType=${CONTRACT} --mspId Org1MSP --language=${LANGUAGE} --author="Lord Conga" --description="Lord Conga's Smart Contract" --name=${LANGUAGE}-${CONTRACT}-contract --version=0.0.1 --license=Apache-2.0 --asset PrivateConga
    jq ".[0].policy = \"OR('Org1MSP.member')\"" collections.json > collections-cli.json
    npm audit --audit-level=moderate
    npm test
    npm run build
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:17051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org1/org1Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org1/ca-tls-root.pem" \
        -v "$(pwd)":/tmp/contract \
        -v "${NETWORK_DIR}/wallets/Org1":/etc/hyperledger/fabric/Org1 \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode package -n ${LANGUAGE}-${CONTRACT}-contract -v 0.0.1 -p /tmp/contract -l node /tmp/contract/contract.cds
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
        peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -v 0.0.1 -c '{"Args":[]}'
    date
}

private_contract_deploy() {
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:17051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org1/org1Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org1/ca-tls-root.pem" \
        -v "$(pwd)":/tmp/contract \
        -v "${NETWORK_DIR}/wallets/Org1":/etc/hyperledger/fabric/Org1 \
        -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode install /tmp/contract/contract.cds
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org2.example.com:17056" \
        -e "CORE_PEER_LOCALMSPID=Org2MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org2/org2Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org2/ca-tls-root.pem" \
        -v "$(pwd)":/tmp/contract \
        -v "${NETWORK_DIR}/wallets/Org2":/etc/hyperledger/fabric/Org2 \
        -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode install /tmp/contract/contract.cds
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:17051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org1/org1Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org1/ca-tls-root.pem" \
        -v "$(pwd)":/tmp/contract \
        -v "${NETWORK_DIR}/wallets/Org1":/etc/hyperledger/fabric/Org1 \
        -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode instantiate -o orderer.example.com:17061 --cafile Orderer/ca-tls-root.pem --tls true -C mychannel --collections-config /tmp/contract/collections-cli.json -n ${LANGUAGE}-${CONTRACT}-contract -v 0.0.1 -c '{"Args":[]}'
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
        peer chaincode query -o orderer.example.com:7050 -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["congaExists","1001"]}'
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
        peer chaincode invoke -o orderer.example.com:7050 -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["createConga","1001","conga 1001 value"]}' --waitForEvent
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
        peer chaincode query -o orderer.example.com:7050 -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["congaExists","1001"]}'
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
        peer chaincode query -o orderer.example.com:7050 -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["readConga","1001"]}'
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
        peer chaincode invoke -o orderer.example.com:7050 -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["updateConga","1001","conga 1001 new value"]}' --waitForEvent
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
        peer chaincode query -o orderer.example.com:7050 -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["readConga","1001"]}'
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
        peer chaincode invoke -o orderer.example.com:7050 -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["deleteConga","1001"]}' --waitForEvent
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
        peer chaincode query -o orderer.example.com:7050 -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["congaExists","1001"]}'
    date
}

private_contract_test() {
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:17051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org1/org1Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org1/ca-tls-root.pem" \
        -v "$(pwd)":/tmp/contract \
        -v "${NETWORK_DIR}/wallets/Org1":/etc/hyperledger/fabric/Org1 \
        -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode query -o orderer.example.com:17061 --cafile Orderer/ca-tls-root.pem --tls true -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["privateCongaExists","1001"]}'
    date
    TRANSIENT=$(echo -n "100" | base64 | tr -d \\n)
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:17051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org1/org1Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org1/ca-tls-root.pem" \
        -e "TRANSIENT=${TRANSIENT}" \
        -v "$(pwd)":/tmp/contract \
        -v "${NETWORK_DIR}/wallets/Org1":/etc/hyperledger/fabric/Org1 \
        -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode invoke -o orderer.example.com:17061 --cafile Orderer/ca-tls-root.pem --tls true -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["createPrivateConga","1001"]}' --transient "{\"privateValue\":\"${TRANSIENT}\"}" --waitForEvent
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:17051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org1/org1Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org1/ca-tls-root.pem" \
        -v "$(pwd)":/tmp/contract \
        -v "${NETWORK_DIR}/wallets/Org1":/etc/hyperledger/fabric/Org1 \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode query -o orderer.example.com:17061 --cafile Orderer/ca-tls-root.pem --tls true -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["privateCongaExists","1001"]}'
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:17051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org1/org1Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org1/ca-tls-root.pem" \
        -v "$(pwd)":/tmp/contract \
        -v "${NETWORK_DIR}/wallets/Org1":/etc/hyperledger/fabric/Org1 \
        -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode query -o orderer.example.com:17061 --cafile Orderer/ca-tls-root.pem --tls true -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["readPrivateConga","1001"]}'
    date
    TRANSIENT=$(echo -n "125" | base64 | tr -d \\n)
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:17051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org1/org1Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org1/ca-tls-root.pem" \
        -v "$(pwd)":/tmp/contract \
        -v "${NETWORK_DIR}/wallets/Org1":/etc/hyperledger/fabric/Org1 \
        -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode invoke -o orderer.example.com:17061 --cafile Orderer/ca-tls-root.pem --tls true -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["updatePrivateConga","1001"]}' --transient "{\"privateValue\":\"${TRANSIENT}\"}" --waitForEvent
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:17051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org1/org1Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org1/ca-tls-root.pem" \
        -v "$(pwd)":/tmp/contract \
        -v "${NETWORK_DIR}/wallets/Org1":/etc/hyperledger/fabric/Org1 \
        -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode query -o orderer.example.com:17061 --cafile Orderer/ca-tls-root.pem --tls true -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["readPrivateConga","1001"]}'
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:17051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org1/org1Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org1/ca-tls-root.pem" \
        -v "$(pwd)":/tmp/contract \
        -v "${NETWORK_DIR}/wallets/Org1":/etc/hyperledger/fabric/Org1 \
        -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode invoke -o orderer.example.com:17061 --cafile Orderer/ca-tls-root.pem --tls true -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["verifyPrivateConga","1001","{\"privateValue\":\"125\"}"]}' --waitForEvent
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:17051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org1/org1Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org1/ca-tls-root.pem" \
        -v "$(pwd)":/tmp/contract \
        -v "${NETWORK_DIR}/wallets/Org1":/etc/hyperledger/fabric/Org1 \
        -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode invoke -o orderer.example.com:17061 --cafile Orderer/ca-tls-root.pem --tls true -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["deletePrivateConga","1001"]}' --waitForEvent
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:17051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org1/org1Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org1/ca-tls-root.pem" \
        -v "$(pwd)":/tmp/contract \
        -v "${NETWORK_DIR}/wallets/Org1":/etc/hyperledger/fabric/Org1 \
        -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode query -o orderer.example.com:17061 --cafile Orderer/ca-tls-root.pem --tls true -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["privateCongaExists","1001"]}'
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org2.example.com:17056" \
        -e "CORE_PEER_LOCALMSPID=Org2MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org2/org2Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org2/ca-tls-root.pem" \
        -v "$(pwd)":/tmp/contract \
        -v "${NETWORK_DIR}/wallets/Org2":/etc/hyperledger/fabric/Org2 \
        -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode query -o orderer.example.com:17061 --cafile Orderer/ca-tls-root.pem --tls true -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["privateCongaExists","1001"]}'
    date
    TRANSIENT=$(echo -n "100" | base64 | tr -d \\n)
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org2.example.com:17056" \
        -e "CORE_PEER_LOCALMSPID=Org2MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org2/org2Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org2/ca-tls-root.pem" \
        -e "TRANSIENT=${TRANSIENT}" \
        -v "$(pwd)":/tmp/contract \
        -v "${NETWORK_DIR}/wallets/Org2":/etc/hyperledger/fabric/Org2 \
        -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode invoke -o orderer.example.com:17061 --cafile Orderer/ca-tls-root.pem --tls true -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["createPrivateConga","1001"]}' --transient "{\"privateValue\":\"${TRANSIENT}\"}" --waitForEvent
    date
    set +e
    docker run \
        -e "CORE_PEER_ADDRESS=peer0.org2.example.com:17056" \
        -e "CORE_PEER_LOCALMSPID=Org2MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org2/org2Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org2/ca-tls-root.pem" \
        -v "$(pwd)":/tmp/contract \
        -v "${NETWORK_DIR}/wallets/Org2":/etc/hyperledger/fabric/Org2 \
        -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode query -o orderer.example.com:17061 --cafile Orderer/ca-tls-root.pem --tls true -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["readPrivateConga","1001"]}'
    if [ $? == 0 ]; then
        echo error should have failed
        exit 1
    fi
    set -e
    date
    TRANSIENT=$(echo -n "125" | base64 | tr -d \\n)
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org2.example.com:17056" \
        -e "CORE_PEER_LOCALMSPID=Org2MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org2/org2Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org2/ca-tls-root.pem" \
        -e "TRANSIENT=${TRANSIENT}" \
        -v "$(pwd)":/tmp/contract \
        -v "${NETWORK_DIR}/wallets/Org2":/etc/hyperledger/fabric/Org2 \
        -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode invoke -o orderer.example.com:17061 --cafile Orderer/ca-tls-root.pem --tls true -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["updatePrivateConga","1001"]}'  --transient "{\"privateValue\":\"${TRANSIENT}\"}" --waitForEvent
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org2.example.com:17056" \
        -e "CORE_PEER_LOCALMSPID=Org2MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org2/org2Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org2/ca-tls-root.pem" \
        -v "$(pwd)":/tmp/contract \
        -v "${NETWORK_DIR}/wallets/Org2":/etc/hyperledger/fabric/Org2 \
        -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode invoke -o orderer.example.com:17061 --cafile Orderer/ca-tls-root.pem --tls true -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["verifyPrivateConga","1001","{\"privateValue\":\"125\"}"]}' --waitForEvent
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org2.example.com:17056" \
        -e "CORE_PEER_LOCALMSPID=Org2MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org2/org2Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org2/ca-tls-root.pem" \
        -v "$(pwd)":/tmp/contract \
        -v "${NETWORK_DIR}/wallets/Org2":/etc/hyperledger/fabric/Org2 \
        -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode invoke -o orderer.example.com:17061 --cafile Orderer/ca-tls-root.pem --tls true -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["deletePrivateConga","1001"]}' --waitForEvent
    date
}

network_test() {
    date
    mkdir yofn
    pushd yofn
    yo fabric:network -- --name yofn --dockerName yofn --startPort 17050 --endPort 17069 --numOrganizations 2
    if ./is_generated.sh
    then
        echo is_generated.sh should not return 0 before generate.sh is run
        exit 1
    fi
    ./generate.sh
    if ! ./is_generated.sh
    then
        echo is_generated.sh should return 0 after generate.sh is run
        exit 1
    elif ! ./is_running.sh
    then
        echo is_running.sh should return 0 after generate.sh is run
        exit 1
    fi
    ./stop.sh
    if ./is_running.sh
    then
        echo is_running.sh should not return 0 after stop.sh is run
        exit 1
    fi
    ./start.sh
    if ! ./is_running.sh
    then
        echo is_running.sh should return 0 after start.sh is run
        exit 1
    fi
    ./teardown.sh
    if ./is_running.sh
    then
        echo is_running.sh should not return 0 after stop.sh is run
        exit 1
    elif ./is_generated.sh
    then
        echo is_generated.sh should not return 0 after teardown.sh is run
        exit 1
    fi
    popd
}

pushd tmp
if [ -z "$1" ]
then
    chaincode_tests
    contract_tests
    private_contract_tests
    network_test
else
    $1 $2
fi
popd

if [ "$1" == "contract_tests" ]
then
    pushd tmp/fabric-samples/basic-network
    # Don't really care if these stop/teardown scripts fail
    set +e
    ./stop.sh
    ./teardown.sh
    popd
fi

if [ "$1" == "private_contract_tests" ]
then
    pushd tmp/yofn
    # Don't really care if these stop/teardown scripts fail
    set +e
    ./stop.sh
    ./teardown.sh
    popd
fi
