#!/usr/bin/env bash
#
# SPDX-License-Identifier: Apache-2.0
#

set -ex

if [ -n "${TF_BUILD}" ]; then
    sudo sh -c "curl https://raw.githubusercontent.com/kadwanev/retry/master/retry -o /usr/local/bin/retry && chmod +x /usr/local/bin/retry"
    RETRY="retry -t 10 -m 10 -x 60 --"
else
    RETRY=""
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"
if [ ! -d tmp ]; then
    mkdir tmp
else
    rm -rf tmp
    mkdir tmp
fi

if [ "$1" != "network_test" ]; then
    pushd tmp
    curl -sSL http://bit.ly/2ysbOFE | bash -s 2.0.0
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

common_package() {
    CHAINCODE_LANGUAGE=$1
    TYPE=$2
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:17051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org1/org1Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org1/ca-tls-root.pem" \
        -v "$(pwd)":/tmp/${TYPE} \
        -v "${NETWORK_DIR}/wallets/Org1":/etc/hyperledger/fabric/Org1 \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer lifecycle chaincode package /tmp/${TYPE}/${TYPE}.tar.gz --path /tmp/${TYPE} --lang ${CHAINCODE_LANGUAGE} --label ${LANGUAGE}-${CONTRACT}-${TYPE}
    date
}

common_deploy() {
    TYPE=$1
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:17051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org1/org1Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org1/ca-tls-root.pem" \
        -v "$(pwd)":/tmp/${TYPE} \
        -v "${NETWORK_DIR}/wallets/Org1":/etc/hyperledger/fabric/Org1 \
        -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer lifecycle chaincode install /tmp/${TYPE}/${TYPE}.tar.gz
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org2.example.com:17056" \
        -e "CORE_PEER_LOCALMSPID=Org2MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org2/org2Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org2/ca-tls-root.pem" \
        -v "$(pwd)":/tmp/${TYPE} \
        -v "${NETWORK_DIR}/wallets/Org2":/etc/hyperledger/fabric/Org2 \
        -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer lifecycle chaincode install /tmp/${TYPE}/${TYPE}.tar.gz
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
        peer lifecycle chaincode queryinstalled >&log.txt
    cat log.txt
    PACKAGE_ID=$(sed -n "/${LANGUAGE}-${CONTRACT}-${TYPE}/{s/^Package ID: //; s/, Label:.*$//; p;}" log.txt)
    date

    if [ ${CONTRACT} == "default" ]; then
        ${RETRY} docker run \
            -e "CORE_PEER_ADDRESS=peer0.org1.example.com:17051" \
            -e "CORE_PEER_LOCALMSPID=Org1MSP" \
            -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org1/org1Admin" \
            -e "CORE_PEER_TLS_ENABLED=true" \
            -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org1/ca-tls-root.pem" \
            -v "$(pwd)":/tmp/${TYPE} \
            -v "${NETWORK_DIR}/wallets/Org1":/etc/hyperledger/fabric/Org1 \
            -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
            --network yofn \
            --rm \
            hyperledger/fabric-tools \
            peer lifecycle chaincode approveformyorg -o orderer.example.com:17061 --ordererTLSHostnameOverride orderer.example.com --tls true --cafile /etc/hyperledger/fabric/Org1/ca-tls-root.pem --channelID mychannel --name ${LANGUAGE}-${CONTRACT}-${TYPE} --version 0.0.1 --package-id ${PACKAGE_ID} --sequence 1 --waitForEvent
        date
        ${RETRY} docker run \
            -e "CORE_PEER_ADDRESS=peer0.org2.example.com:17056" \
            -e "CORE_PEER_LOCALMSPID=Org2MSP" \
            -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org2/org2Admin" \
            -e "CORE_PEER_TLS_ENABLED=true" \
            -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org2/ca-tls-root.pem" \
            -v "$(pwd)":/tmp/${TYPE} \
            -v "${NETWORK_DIR}/wallets/Org2":/etc/hyperledger/fabric/Org2 \
            -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
            --network yofn \
            --rm \
            hyperledger/fabric-tools \
            peer lifecycle chaincode approveformyorg -o orderer.example.com:17061 --ordererTLSHostnameOverride orderer.example.com --tls true --cafile /etc/hyperledger/fabric/Org2/ca-tls-root.pem --channelID mychannel --name ${LANGUAGE}-${CONTRACT}-${TYPE} --version 0.0.1 --package-id ${PACKAGE_ID} --sequence 1 --waitForEvent
        date
        ${RETRY} docker run \
            -e "CORE_PEER_ADDRESS=peer0.org1.example.com:17051" \
            -e "CORE_PEER_LOCALMSPID=Org1MSP" \
            -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org1/org1Admin" \
            -e "CORE_PEER_TLS_ENABLED=true" \
            -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org1/ca-tls-root.pem" \
            -v "$(pwd)":/tmp/${TYPE} \
            -v "${NETWORK_DIR}/wallets/Org1":/etc/hyperledger/fabric/Org1 \
            -v "${NETWORK_DIR}/wallets/Org2":/etc/hyperledger/fabric/Org2 \
            -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
            --network yofn \
            --rm \
            hyperledger/fabric-tools \
            peer lifecycle chaincode commit -o orderer.example.com:17061 --ordererTLSHostnameOverride orderer.example.com --tls true --cafile /etc/hyperledger/fabric/Org1/ca-tls-root.pem --channelID mychannel --name ${LANGUAGE}-${CONTRACT}-${TYPE} --version 0.0.1 --sequence 1 --peerAddresses peer0.org1.example.com:17051 --peerAddresses peer0.org2.example.com:17056 --tlsRootCertFiles /etc/hyperledger/fabric/Org1/org1peer1tls/ca.crt --tlsRootCertFiles /etc/hyperledger/fabric/Org2/org2peer1tls/ca.crt
        date
    else
        ${RETRY} docker run \
            -e "CORE_PEER_ADDRESS=peer0.org1.example.com:17051" \
            -e "CORE_PEER_LOCALMSPID=Org1MSP" \
            -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org1/org1Admin" \
            -e "CORE_PEER_TLS_ENABLED=true" \
            -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org1/ca-tls-root.pem" \
            -v "$(pwd)":/tmp/${TYPE} \
            -v "${NETWORK_DIR}/wallets/Org1":/etc/hyperledger/fabric/Org1 \
            -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
            --network yofn \
            --rm \
            hyperledger/fabric-tools \
            peer lifecycle chaincode approveformyorg -o orderer.example.com:17061 --ordererTLSHostnameOverride orderer.example.com --tls true --cafile /etc/hyperledger/fabric/Org1/ca-tls-root.pem --channelID mychannel --name ${LANGUAGE}-${CONTRACT}-${TYPE} --collections-config /tmp/contract/collections.json --version 0.0.1 --package-id ${PACKAGE_ID} --sequence 1 --waitForEvent
        date
        ${RETRY} docker run \
            -e "CORE_PEER_ADDRESS=peer0.org2.example.com:17056" \
            -e "CORE_PEER_LOCALMSPID=Org2MSP" \
            -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org2/org2Admin" \
            -e "CORE_PEER_TLS_ENABLED=true" \
            -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org2/ca-tls-root.pem" \
            -v "$(pwd)":/tmp/${TYPE} \
            -v "${NETWORK_DIR}/wallets/Org2":/etc/hyperledger/fabric/Org2 \
            -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
            --network yofn \
            --rm \
            hyperledger/fabric-tools \
            peer lifecycle chaincode approveformyorg -o orderer.example.com:17061 --ordererTLSHostnameOverride orderer.example.com --tls true --cafile /etc/hyperledger/fabric/Org2/ca-tls-root.pem --channelID mychannel --name ${LANGUAGE}-${CONTRACT}-${TYPE} --collections-config /tmp/contract/collections.json --version 0.0.1 --package-id ${PACKAGE_ID} --sequence 1 --waitForEvent
        date
        ${RETRY} docker run \
            -e "CORE_PEER_ADDRESS=peer0.org1.example.com:17051" \
            -e "CORE_PEER_LOCALMSPID=Org1MSP" \
            -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org1/org1Admin" \
            -e "CORE_PEER_TLS_ENABLED=true" \
            -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org1/ca-tls-root.pem" \
            -v "$(pwd)":/tmp/contract \
            -v "${NETWORK_DIR}/wallets/Org1":/etc/hyperledger/fabric/Org1 \
            -v "${NETWORK_DIR}/wallets/Org2":/etc/hyperledger/fabric/Org2 \
            -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
            --network yofn \
            --rm \
            hyperledger/fabric-tools \
            peer lifecycle chaincode commit -o orderer.example.com:17061 --ordererTLSHostnameOverride orderer.example.com --tls true --cafile /etc/hyperledger/fabric/Org1/ca-tls-root.pem --channelID mychannel --name ${LANGUAGE}-${CONTRACT}-${TYPE} --collections-config /tmp/contract/collections.json --version 0.0.1 --sequence 1 --peerAddresses peer0.org1.example.com:17051 --peerAddresses peer0.org2.example.com:17056 --tlsRootCertFiles /etc/hyperledger/fabric/Org1/org1peer1tls/ca.crt --tlsRootCertFiles /etc/hyperledger/fabric/Org2/org2peer1tls/ca.crt
        date
    fi
}

chaincode_tests() {
    LANGUAGES="go java javascript kotlin typescript"
    for LANGUAGE in ${LANGUAGES}; do
        chaincode_test ${LANGUAGE}
    done
}

chaincode_test() {
    LANGUAGE=$1
    CONTRACT="default"
    mkdir ${LANGUAGE}-chaincode
    pushd ${LANGUAGE}-chaincode
    ${LANGUAGE}_chaincode_package
    common_deploy "chaincode"
    common_chaincode_test
    popd
}

go_chaincode_package() {
    yo fabric:chaincode -- --language=${LANGUAGE} --author="Lord Conga" --description="Lord Conga's Chaincode" --name=${LANGUAGE}-${CONTRACT}-chaincode --version=0.0.1 --license=Apache-2.0
    go get
    go test
    go build
    go mod vendor
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:17051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org1/org1Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org1/ca-tls-root.pem" \
        -v "$(pwd)":/opt/gopath/src/chaincode \
        -v "${NETWORK_DIR}/wallets/Org1":/etc/hyperledger/fabric/Org1 \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer lifecycle chaincode package /opt/gopath/src/chaincode/chaincode.tar.gz --path /opt/gopath/src/chaincode --lang golang --label ${LANGUAGE}-${CONTRACT}-chaincode
    date
}

java_chaincode_package() {
    yo fabric:chaincode -- --language=${LANGUAGE} --author="Lord Conga" --description="Lord Conga's Chaincode" --name=${LANGUAGE}-${CONTRACT}-chaincode --version=0.0.1 --license=Apache-2.0
    ./gradlew build
    common_package "java" "chaincode"
}

javascript_chaincode_package() {
    yo fabric:chaincode -- --language=${LANGUAGE} --author="Lord Conga" --description="Lord Conga's Chaincode" --name=${LANGUAGE}-${CONTRACT-}chaincode --version=0.0.1 --license=Apache-2.0
    npm audit --audit-level=moderate
    npm test
    common_package "node" "chaincode"
}

kotlin_chaincode_package() {
    yo fabric:chaincode -- --language=${LANGUAGE} --author="Lord Conga" --description="Lord Conga's Chaincode" --name=${LANGUAGE}-${CONTRACT}-chaincode --version=0.0.1 --license=Apache-2.0
    ./gradlew build
    common_package "java" "chaincode"
}

typescript_chaincode_package() {
    yo fabric:chaincode -- --language=${LANGUAGE} --author="Lord Conga" --description="Lord Conga's Chaincode" --name=${LANGUAGE}-${CONTRACT}-chaincode --version=0.0.1 --license=Apache-2.0
    npm audit --audit-level=moderate
    npm test
    npm run build
    common_package "node" "chaincode"
}

common_chaincode_test() {
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:17051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org1/org1Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org1/ca-tls-root.pem" \
        -v "$(pwd)":/tmp/contract \
        -v "${NETWORK_DIR}/wallets/Org1":/etc/hyperledger/fabric/Org1 \
        -v "${NETWORK_DIR}/wallets/Org2":/etc/hyperledger/fabric/Org2 \
        -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode invoke -o orderer.example.com:17061 -C mychannel -n ${LANGUAGE}-${CONTRACT}-chaincode -c '{"Args":["init","a","100","b","200"]}' --ordererTLSHostnameOverride orderer.example.com --tls true --cafile /etc/hyperledger/fabric/Org1/ca-tls-root.pem --waitForEvent --peerAddresses peer0.org1.example.com:17051 --peerAddresses peer0.org2.example.com:17056 --tlsRootCertFiles /etc/hyperledger/fabric/Org1/org1peer1tls/ca.crt --tlsRootCertFiles /etc/hyperledger/fabric/Org2/org2peer1tls/ca.crt
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:17051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org1/org1Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org1/ca-tls-root.pem" \
        -v "$(pwd)":/tmp/contract \
        -v "${NETWORK_DIR}/wallets/Org1":/etc/hyperledger/fabric/Org1 \
        -v "${NETWORK_DIR}/wallets/Org2":/etc/hyperledger/fabric/Org2 \
        -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode invoke -o orderer.example.com:17061 -C mychannel -n ${LANGUAGE}-${CONTRACT}-chaincode -c '{"Args":["invoke","a","b","10"]}' --ordererTLSHostnameOverride orderer.example.com --tls true --cafile /etc/hyperledger/fabric/Org1/ca-tls-root.pem --waitForEvent --peerAddresses peer0.org1.example.com:17051 --peerAddresses peer0.org2.example.com:17056 --tlsRootCertFiles /etc/hyperledger/fabric/Org1/org1peer1tls/ca.crt --tlsRootCertFiles /etc/hyperledger/fabric/Org2/org2peer1tls/ca.crt
    date
}

contract_tests() {
    CONTRACT="default"

    if [ -z "$1" ]; then
        LANGUAGES="typescript"
    else
        LANGUAGES="$1"
    fi
    for LANGUAGE in ${LANGUAGES}; do
        contract_test ${LANGUAGE} ${CONTRACT}
    done
}

private_contract_tests() {
    CONTRACT="private"

    if [ -z "$1" ]; then
        LANGUAGES="java javascript typescript"
    else
        LANGUAGES="$1"
    fi
    for LANGUAGE in ${LANGUAGES}; do
        contract_test ${LANGUAGE} ${CONTRACT}
    done

}

contract_test() {
    LANGUAGE=$1
    CONTRACT=$2
    mkdir ${LANGUAGE}-${CONTRACT}-contract
    pushd ${LANGUAGE}-${CONTRACT}-contract
    ${LANGUAGE}_${CONTRACT}_contract_package
    common_deploy "contract"
    if [ ${CONTRACT} == "default" ]; then
        common_contract_test
    else
        private_contract_test
    fi
    popd
}

java_default_contract_package() {
    yo fabric:contract -- --contractType=${CONTRACT} --language=${LANGUAGE} --author="Lord Conga" --description="Lord Conga's Smart Contract" --name=${LANGUAGE}-${CONTRACT}-contract --version=0.0.1 --license=Apache-2.0 --asset conga
    ./gradlew clean build shadowJar
    pushd build/libs
    common_package "java" "contract"
    mv contract.tar.gz ../../
    popd
}

kotlin_default_contract_package() {
    yo fabric:contract -- --contractType=${CONTRACT} --language=${LANGUAGE} --author="Lord Conga" --description="Lord Conga's Smart Contract" --name=${LANGUAGE}-${CONTRACT}-contract --version=0.0.1 --license=Apache-2.0 --asset conga
    ./gradlew clean build shadowJar
    pushd build/libs
    common_package "java" "contract"
    mv contract.tar.gz ../../
    popd
}

javascript_default_contract_package() {
    yo fabric:contract -- --contractType=${CONTRACT} --language=${LANGUAGE} --author="Lord Conga" --description="Lord Conga's Smart Contract" --name=${LANGUAGE}-${CONTRACT}-contract --version=0.0.1 --license=Apache-2.0 --asset conga
    npm audit --audit-level=moderate
    npm test
    common_package "node" "contract"
}

typescript_default_contract_package() {
    yo fabric:contract -- --contractType=${CONTRACT} --language=${LANGUAGE} --author="Lord Conga" --description="Lord Conga's Smart Contract" --name=${LANGUAGE}-${CONTRACT}-contract --version=0.0.1 --license=Apache-2.0 --asset conga
    npm audit --audit-level=moderate
    npm test
    npm run build
    common_package "node" "contract"
}

java_private_contract_package() {
    yo fabric:contract -- --contractType=${CONTRACT} --mspId Org1MSP --language=${LANGUAGE} --author="Lord Conga" --description="Lord Conga's Smart Contract" --name=${LANGUAGE}-${CONTRACT}-contract --version=0.0.1 --license=Apache-2.0 --asset PrivateConga
    ./gradlew clean build shadowJar
    common_package "java" "contract"
}

javascript_private_contract_package() {
    yo fabric:contract -- --contractType=${CONTRACT} --mspId Org1MSP --language=${LANGUAGE} --author="Lord Conga" --description="Lord Conga's Smart Contract" --name=${LANGUAGE}-${CONTRACT}-contract --version=0.0.1 --license=Apache-2.0 --asset PrivateConga
    npm audit --audit-level=moderate
    npm test
    common_package "node" "contract"
}

typescript_private_contract_package() {
    yo fabric:contract -- --contractType=${CONTRACT} --mspId Org1MSP --language=${LANGUAGE} --author="Lord Conga" --description="Lord Conga's Smart Contract" --name=${LANGUAGE}-${CONTRACT}-contract --version=0.0.1 --license=Apache-2.0 --asset PrivateConga
    npm audit --audit-level=moderate
    npm test
    npm run build
    common_package "node" "contract"
}

common_contract_test() {
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
        peer chaincode query -o orderer.example.com:17061 -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["congaExists","1001"]}'

    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:17051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org1/org1Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org1/ca-tls-root.pem" \
        -v "$(pwd)":/tmp/contract \
        -v "${NETWORK_DIR}/wallets/Org1":/etc/hyperledger/fabric/Org1 \
        -v "${NETWORK_DIR}/wallets/Org2":/etc/hyperledger/fabric/Org2 \
        -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode invoke -o orderer.example.com:17061 -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["createConga","1001","conga 1001 value"]}' --ordererTLSHostnameOverride orderer.example.com --tls true --cafile /etc/hyperledger/fabric/Org1/ca-tls-root.pem --waitForEvent --peerAddresses peer0.org1.example.com:17051 --peerAddresses peer0.org2.example.com:17056 --tlsRootCertFiles /etc/hyperledger/fabric/Org1/org1peer1tls/ca.crt --tlsRootCertFiles /etc/hyperledger/fabric/Org2/org2peer1tls/ca.crt

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
        peer chaincode query -o orderer.example.com:17061 -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["congaExists","1001"]}'
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
        peer chaincode query -o orderer.example.com:17061 -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["readConga","1001"]}'
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:17051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org1/org1Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org1/ca-tls-root.pem" \
        -v "$(pwd)":/tmp/contract \
        -v "${NETWORK_DIR}/wallets/Org1":/etc/hyperledger/fabric/Org1 \
        -v "${NETWORK_DIR}/wallets/Org2":/etc/hyperledger/fabric/Org2 \
        -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode invoke -o orderer.example.com:17061 -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["updateConga","1001","conga 1001 new value"]}' --ordererTLSHostnameOverride orderer.example.com --tls true --cafile /etc/hyperledger/fabric/Org1/ca-tls-root.pem --waitForEvent --peerAddresses peer0.org1.example.com:17051 --peerAddresses peer0.org2.example.com:17056 --tlsRootCertFiles /etc/hyperledger/fabric/Org1/org1peer1tls/ca.crt --tlsRootCertFiles /etc/hyperledger/fabric/Org2/org2peer1tls/ca.crt

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
        peer chaincode query -o orderer.example.com:17061 -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["readConga","1001"]}'
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:17051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org1/org1Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org1/ca-tls-root.pem" \
        -v "$(pwd)":/tmp/contract \
        -v "${NETWORK_DIR}/wallets/Org1":/etc/hyperledger/fabric/Org1 \
        -v "${NETWORK_DIR}/wallets/Org2":/etc/hyperledger/fabric/Org2 \
        -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode invoke -o orderer.example.com:17061 -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["deleteConga","1001"]}' --ordererTLSHostnameOverride orderer.example.com --tls true --cafile /etc/hyperledger/fabric/Org1/ca-tls-root.pem --waitForEvent --peerAddresses peer0.org1.example.com:17051 --peerAddresses peer0.org2.example.com:17056 --tlsRootCertFiles /etc/hyperledger/fabric/Org1/org1peer1tls/ca.crt --tlsRootCertFiles /etc/hyperledger/fabric/Org2/org2peer1tls/ca.crt

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
        peer chaincode query -o orderer.example.com:17061 -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["congaExists","1001"]}'
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
        -v "${NETWORK_DIR}/wallets/Org2":/etc/hyperledger/fabric/Org2 \
        -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode query -o orderer.example.com:17061 -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["privateCongaExists","1001"]}'
    date
    TRANSIENT=$(echo -n "100" | base64 | tr -d \\n)
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:17051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org1/org1Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org1/ca-tls-root.pem" \
        -v "$(pwd)":/tmp/contract \
        -v "${NETWORK_DIR}/wallets/Org1":/etc/hyperledger/fabric/Org1 \
        -v "${NETWORK_DIR}/wallets/Org2":/etc/hyperledger/fabric/Org2 \
        -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode invoke -o orderer.example.com:17061 -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["createPrivateConga","1001"]}' --transient "{\"privateValue\":\"${TRANSIENT}\"}" --ordererTLSHostnameOverride orderer.example.com --tls true --cafile /etc/hyperledger/fabric/Org1/ca-tls-root.pem --waitForEvent --peerAddresses peer0.org1.example.com:17051 --peerAddresses peer0.org2.example.com:17056 --tlsRootCertFiles /etc/hyperledger/fabric/Org1/org1peer1tls/ca.crt --tlsRootCertFiles /etc/hyperledger/fabric/Org2/org2peer1tls/ca.crt
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:17051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org1/org1Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org1/ca-tls-root.pem" \
        -v "$(pwd)":/tmp/contract \
        -v "${NETWORK_DIR}/wallets/Org1":/etc/hyperledger/fabric/Org1 \
        -v "${NETWORK_DIR}/wallets/Org2":/etc/hyperledger/fabric/Org2 \
        -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode query -o orderer.example.com:17061 -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["privateCongaExists","1001"]}'
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
        peer chaincode query -o orderer.example.com:17061 -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["readPrivateConga","1001"]}'
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
        -v "${NETWORK_DIR}/wallets/Org2":/etc/hyperledger/fabric/Org2 \
        -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode invoke -o orderer.example.com:17061 -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["updatePrivateConga","1001"]}' --transient "{\"privateValue\":\"${TRANSIENT}\"}" --ordererTLSHostnameOverride orderer.example.com --tls true --cafile /etc/hyperledger/fabric/Org1/ca-tls-root.pem --waitForEvent --peerAddresses peer0.org1.example.com:17051 --peerAddresses peer0.org2.example.com:17056 --tlsRootCertFiles /etc/hyperledger/fabric/Org1/org1peer1tls/ca.crt --tlsRootCertFiles /etc/hyperledger/fabric/Org2/org2peer1tls/ca.crt
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:17051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org1/org1Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org1/ca-tls-root.pem" \
        -v "$(pwd)":/tmp/contract \
        -v "${NETWORK_DIR}/wallets/Org1":/etc/hyperledger/fabric/Org1 \
        -v "${NETWORK_DIR}/wallets/Org2":/etc/hyperledger/fabric/Org2 \
        -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode query -o orderer.example.com:17061 -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["readPrivateConga","1001"]}'
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:17051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org1/org1Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org1/ca-tls-root.pem" \
        -v "$(pwd)":/tmp/contract \
        -v "${NETWORK_DIR}/wallets/Org1":/etc/hyperledger/fabric/Org1 \
        -v "${NETWORK_DIR}/wallets/Org2":/etc/hyperledger/fabric/Org2 \
        -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode invoke -o orderer.example.com:17061 -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["verifyPrivateConga","1001","{\"privateValue\":\"125\"}"]}' --ordererTLSHostnameOverride orderer.example.com --tls true --cafile /etc/hyperledger/fabric/Org1/ca-tls-root.pem --waitForEvent --peerAddresses peer0.org1.example.com:17051 --peerAddresses peer0.org2.example.com:17056 --tlsRootCertFiles /etc/hyperledger/fabric/Org1/org1peer1tls/ca.crt --tlsRootCertFiles /etc/hyperledger/fabric/Org2/org2peer1tls/ca.crt
    date
    ${RETRY} docker run \
        -e "CORE_PEER_ADDRESS=peer0.org1.example.com:17051" \
        -e "CORE_PEER_LOCALMSPID=Org1MSP" \
        -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/Org1/org1Admin" \
        -e "CORE_PEER_TLS_ENABLED=true" \
        -e "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/Org1/ca-tls-root.pem" \
        -v "$(pwd)":/tmp/contract \
        -v "${NETWORK_DIR}/wallets/Org1":/etc/hyperledger/fabric/Org1 \
        -v "${NETWORK_DIR}/wallets/Org2":/etc/hyperledger/fabric/Org2 \
        -v "${NETWORK_DIR}/wallets/Orderer":/etc/hyperledger/fabric/Orderer \
        --network yofn \
        --rm \
        hyperledger/fabric-tools \
        peer chaincode invoke -o orderer.example.com:17061 -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["deletePrivateConga","1001"]}' --ordererTLSHostnameOverride orderer.example.com --tls true --cafile /etc/hyperledger/fabric/Org1/ca-tls-root.pem --waitForEvent --peerAddresses peer0.org1.example.com:17051 --peerAddresses peer0.org2.example.com:17056 --tlsRootCertFiles /etc/hyperledger/fabric/Org1/org1peer1tls/ca.crt --tlsRootCertFiles /etc/hyperledger/fabric/Org2/org2peer1tls/ca.crt
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
        peer chaincode query -o orderer.example.com:17061 -C mychannel -n ${LANGUAGE}-${CONTRACT}-contract -c '{"Args":["privateCongaExists","1001"]}'
    date
}

network_test() {
    date
    mkdir yofn
    pushd yofn
    yo fabric:network -- --name yofn --dockerName yofn --startPort 17050 --endPort 17069 --numOrganizations 2
    if ./is_generated.sh; then
        echo is_generated.sh should not return 0 before generate.sh is run
        exit 1
    fi
    ./generate.sh
    if ! ./is_generated.sh; then
        echo is_generated.sh should return 0 after generate.sh is run
        exit 1
    elif ! ./is_running.sh; then
        echo is_running.sh should return 0 after generate.sh is run
        exit 1
    fi
    ./stop.sh
    if ./is_running.sh; then
        echo is_running.sh should not return 0 after stop.sh is run
        exit 1
    fi
    ./start.sh
    if ! ./is_running.sh; then
        echo is_running.sh should return 0 after start.sh is run
        exit 1
    fi
    ./teardown.sh
    if ./is_running.sh; then
        echo is_running.sh should not return 0 after stop.sh is run
        exit 1
    elif ./is_generated.sh; then
        echo is_generated.sh should not return 0 after teardown.sh is run
        exit 1
    fi
    popd
}

pushd tmp
if [ -z "$1" ]; then
    chaincode_tests
    contract_tests
    private_contract_tests
    network_test
else
    $1 $2
fi
popd

if [ "$1" != "network_test" ]; then
    pushd tmp/yofn
    # Don't care if this script fails
    set +e
    ./network.sh down
    popd
fi
