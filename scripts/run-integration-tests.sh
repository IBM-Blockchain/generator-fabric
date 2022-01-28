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

tmpdir=$(mktemp -d 2>/dev/null || mktemp -d -t 'yofn')
echo "Created test directory ${tmpdir}"

curl https://raw.githubusercontent.com/kadwanev/retry/master/retry -o ${tmpdir}/retry && chmod +x ${tmpdir}/retry

if [ "$1" != "network_test" ]; then
    pushd ${tmpdir}
    export MICROFAB_CONFIG='{
        "ordering_organization": {
            "name": "Orderer"
        },
        "endorsing_organizations":[
            {
                "name": "Org1"
            },
            {
                "name": "Org2"
            }
        ],
        "channels":[
            {
                "name": "mychannel",
                "endorsing_organizations":[
                    "Org1",
                    "Org2"
                ]
            }
        ],
        "capability_level":"V2_0"
    }'

    mkdir chaincode
    docker run --name microfab -d --rm -v ${tmpdir}/chaincode:/chaincode:ro -p 8080:8080 -e MICROFAB_CONFIG ibmcom/ibp-microfab

    cat << ADMIN-ORG1-ENV-EOF > admin-org1.env
CORE_PEER_LOCALMSPID=Org1MSP
CORE_PEER_MSPCONFIGPATH=/opt/microfab/data/admin-org1
CORE_PEER_ADDRESS=org1peer-api.127-0-0-1.nip.io:8080
ADMIN-ORG1-ENV-EOF

    cat << ADMIN-ORG2-ENV-EOF > admin-org2.env
CORE_PEER_LOCALMSPID=Org2MSP
CORE_PEER_MSPCONFIGPATH=/opt/microfab/data/admin-org2
CORE_PEER_ADDRESS=org2peer-api.127-0-0-1.nip.io:8080
ADMIN-ORG2-ENV-EOF

    popd
fi

rm -f generator-fabric-*.tgz
npm pack
npm install -g yo generator-fabric-*.tgz
rm -f generator-fabric-*.tgz

common_package() {
    : ${NAME:?}
    CHAINCODE_LANGUAGE=$1
    TYPE=$2
    date
    ${RETRY} docker exec \
        --env-file ${tmpdir}/admin-org1.env \
        -w /home/ibp-user \
        microfab \
        /opt/fabric/bin/peer lifecycle chaincode package ${NAME}.tar.gz --path /chaincode/${NAME} --lang ${CHAINCODE_LANGUAGE} --label ${NAME}
    date
}

common_deploy() {
    : ${NAME:?}
    : ${CONTRACT:?}
    date
    ${RETRY} docker exec \
        --env-file ${tmpdir}/admin-org1.env \
        -w /home/ibp-user \
        microfab \
        /opt/fabric/bin/peer lifecycle chaincode install ${NAME}.tar.gz
    date
    ${RETRY} docker exec \
        --env-file ${tmpdir}/admin-org2.env \
        -w /home/ibp-user \
        microfab \
        /opt/fabric/bin/peer lifecycle chaincode install ${NAME}.tar.gz
    date
    ${RETRY} docker exec \
        --env-file ${tmpdir}/admin-org1.env \
        -w /home/ibp-user \
        microfab \
        /opt/fabric/bin/peer lifecycle chaincode queryinstalled >& ${tmpdir}/queryinstalled.txt
    cat ${tmpdir}/queryinstalled.txt
    PACKAGE_ID=$(sed -n "/${NAME}/{s/^Package ID: //; s/, Label:.*$//; p;}" ${tmpdir}/queryinstalled.txt)
    date

    if [ ${CONTRACT} == "default" ]; then
        ${RETRY} docker exec \
            --env-file ${tmpdir}/admin-org1.env \
            -w /home/ibp-user \
            microfab \
            /opt/fabric/bin/peer lifecycle chaincode approveformyorg -o orderer-api.127-0-0-1.nip.io:8080 --channelID mychannel --name ${NAME} --version 0.0.1 --package-id ${PACKAGE_ID} --sequence 1 --waitForEvent
        date
        ${RETRY} docker exec \
            --env-file ${tmpdir}/admin-org2.env \
            -w /home/ibp-user \
            microfab \
            /opt/fabric/bin/peer lifecycle chaincode approveformyorg -o orderer-api.127-0-0-1.nip.io:8080 --channelID mychannel --name ${NAME} --version 0.0.1 --package-id ${PACKAGE_ID} --sequence 1 --waitForEvent
        date
        ${RETRY} docker exec \
            --env-file ${tmpdir}/admin-org1.env \
            -w /home/ibp-user \
            microfab \
            /opt/fabric/bin/peer lifecycle chaincode checkcommitreadiness --channelID mychannel --name ${NAME} --version 0.0.1 --sequence 1
        date
        ${RETRY} docker exec \
            --env-file ${tmpdir}/admin-org1.env \
            -w /home/ibp-user \
            microfab \
            /opt/fabric/bin/peer lifecycle chaincode commit -o orderer-api.127-0-0-1.nip.io:8080 --channelID mychannel --name ${NAME} --version 0.0.1 --sequence 1
        date
    else
        ${RETRY} docker exec \
            --env-file ${tmpdir}/admin-org1.env \
            -w /home/ibp-user \
            microfab \
            /opt/fabric/bin/peer lifecycle chaincode approveformyorg -o orderer-api.127-0-0-1.nip.io:8080 --channelID mychannel --name ${NAME} --collections-config /chaincode/${NAME}/collections.json --version 0.0.1 --package-id ${PACKAGE_ID} --sequence 1 --waitForEvent
        date
        ${RETRY} docker exec \
            --env-file ${tmpdir}/admin-org2.env \
            -w /home/ibp-user \
            microfab \
            /opt/fabric/bin/peer lifecycle chaincode approveformyorg -o orderer-api.127-0-0-1.nip.io:8080 --channelID mychannel --name ${NAME} --collections-config /chaincode/${NAME}/collections.json --version 0.0.1 --package-id ${PACKAGE_ID} --sequence 1 --waitForEvent
        date
        ${RETRY} docker exec \
            --env-file ${tmpdir}/admin-org1.env \
            -w /home/ibp-user \
            microfab \
            /opt/fabric/bin/peer lifecycle chaincode checkcommitreadiness --channelID mychannel --name ${NAME} --collections-config /chaincode/${NAME}/collections.json --version 0.0.1 --sequence 1
        date
        ${RETRY} docker exec \
            --env-file ${tmpdir}/admin-org1.env \
            -w /home/ibp-user \
            microfab \
            /opt/fabric/bin/peer lifecycle chaincode commit -o orderer-api.127-0-0-1.nip.io:8080 --channelID mychannel --name ${NAME} --collections-config /chaincode/${NAME}/collections.json --version 0.0.1 --sequence 1
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
    NAME=${LANGUAGE}-${CONTRACT}-chaincode
    pushd ${tmpdir}/chaincode
    mkdir ${NAME}
    pushd ${NAME}
    yo fabric:chaincode -- --language=${LANGUAGE} --author="Lord Conga" --description="Lord Conga's Chaincode" --name=${NAME} --version=0.0.1 --license=Apache-2.0
    ${LANGUAGE}_chaincode_package
    common_deploy "chaincode"
    common_chaincode_test
    popd
    popd
}

go_chaincode_package() {
    go get
    go test
    go build
    GO111MODULE=on go mod vendor
    common_package "golang" "chaincode"
}

java_chaincode_package() {
    ./gradlew build
    common_package "java" "chaincode"
}

javascript_chaincode_package() {
    npm audit --audit-level=moderate
    npm test
    common_package "node" "chaincode"
}

kotlin_chaincode_package() {
    ./gradlew build
    common_package "java" "chaincode"
}

typescript_chaincode_package() {
    npm audit --audit-level=moderate
    npm test
    npm run build
    common_package "node" "chaincode"
}

common_chaincode_test() {
    : ${NAME:?}

    date
    ${RETRY} docker exec \
        --env-file ${tmpdir}/admin-org1.env \
        -w /home/ibp-user \
        microfab \
        /opt/fabric/bin/peer chaincode invoke -o orderer-api.127-0-0-1.nip.io:8080 -C mychannel -n ${NAME} -c '{"Args":["init","a","100","b","200"]}' --waitForEvent

    date
    ${RETRY} docker exec \
        --env-file ${tmpdir}/admin-org1.env \
        -w /home/ibp-user \
        microfab \
        /opt/fabric/bin/peer chaincode invoke -o orderer-api.127-0-0-1.nip.io:8080 -C mychannel -n ${NAME} -c '{"Args":["invoke","a","b","10"]}' --waitForEvent

    date
}

contract_tests() {
    CONTRACT="default"

    if [ -z "$1" ]; then
        LANGUAGES="go java javascript typescript kotlin"
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
        LANGUAGES="go java javascript typescript"

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
    NAME=${LANGUAGE}-${CONTRACT}-contract
    pushd ${tmpdir}/chaincode
    mkdir ${NAME}
    pushd ${NAME}
    if [ ${CONTRACT} == "default" ]; then
        yo fabric:contract --  --contractType=${CONTRACT} --language=${LANGUAGE} --author="Lord Conga" --description="Lord Conga's Smart Contract" --name=${NAME} --version=0.0.1 --license=Apache-2.0 --asset conga
        ${LANGUAGE}_${CONTRACT}_contract_package
        common_deploy "contract"
        common_contract_test
    else
        yo fabric:contract --  --contractType=${CONTRACT} --mspId Org1MSP --language=${LANGUAGE} --author="Lord Conga" --description="Lord Conga's Smart Contract" --name=${NAME} --version=0.0.1 --license=Apache-2.0 --asset PrivateConga
        ${LANGUAGE}_${CONTRACT}_contract_package
        common_deploy "contract"
        private_contract_test
    fi
    popd
    popd
}

java_default_contract_package() {
    ./gradlew clean build shadowJar
    pushd build/libs
    common_package "java" "contract"
    popd
}

kotlin_default_contract_package() {
    ./gradlew clean build shadowJar
    pushd build/libs
    common_package "java" "contract"
    popd
}

go_default_contract_package() {
    go get
    go test
    go build
    GO111MODULE=on go mod vendor
    common_package "golang" "contract"
}

javascript_default_contract_package() {
    npm audit --audit-level=moderate
    npm test
    common_package "node" "contract"
}

typescript_default_contract_package() {
    npm audit --audit-level=moderate
    npm test
    npm run build
    common_package "node" "contract"
}

java_private_contract_package() {
    ./gradlew clean build shadowJar
    common_package "java" "contract"
}

javascript_private_contract_package() {
    npm audit --audit-level=moderate
    npm test
    common_package "node" "contract"
}

typescript_private_contract_package() {
    npm audit --audit-level=moderate
    npm test
    npm run build
    common_package "node" "contract"
}

go_private_contract_package() {
    go get
    go test
    go build
    GO111MODULE=on go mod vendor
    common_package "golang" "contract"
}

common_contract_test() {
    : ${NAME:?}

    date
    ${RETRY} docker exec \
        --env-file ${tmpdir}/admin-org1.env \
        -w /home/ibp-user \
        microfab \
        /opt/fabric/bin/peer chaincode query -o orderer-api.127-0-0-1.nip.io:8080 -C mychannel -n ${NAME} -c '{"Args":["congaExists","1001"]}'

    date
    ${RETRY} docker exec \
        --env-file ${tmpdir}/admin-org1.env \
        -w /home/ibp-user \
        microfab \
        /opt/fabric/bin/peer chaincode invoke -o orderer-api.127-0-0-1.nip.io:8080 -C mychannel -n ${NAME} -c '{"Args":["createConga","1001","conga 1001 value"]}' --waitForEvent

    date
    ${RETRY} docker exec \
        --env-file ${tmpdir}/admin-org1.env \
        -w /home/ibp-user \
        microfab \
        /opt/fabric/bin/peer chaincode query -o orderer-api.127-0-0-1.nip.io:8080 -C mychannel -n ${NAME} -c '{"Args":["congaExists","1001"]}'

    date
    ${RETRY} docker exec \
        --env-file ${tmpdir}/admin-org1.env \
        -w /home/ibp-user \
        microfab \
        /opt/fabric/bin/peer chaincode query -o orderer-api.127-0-0-1.nip.io:8080 -C mychannel -n ${NAME} -c '{"Args":["readConga","1001"]}'

    date
    ${RETRY} docker exec \
        --env-file ${tmpdir}/admin-org1.env \
        -w /home/ibp-user \
        microfab \
        /opt/fabric/bin/peer chaincode invoke -o orderer-api.127-0-0-1.nip.io:8080 -C mychannel -n ${NAME} -c '{"Args":["updateConga","1001","conga 1001 new value"]}' --waitForEvent

    date
    ${RETRY} docker exec \
        --env-file ${tmpdir}/admin-org1.env \
        -w /home/ibp-user \
        microfab \
        /opt/fabric/bin/peer chaincode query -o orderer-api.127-0-0-1.nip.io:8080 -C mychannel -n ${NAME} -c '{"Args":["readConga","1001"]}'

    date
    ${RETRY} docker exec \
        --env-file ${tmpdir}/admin-org1.env \
        -w /home/ibp-user \
        microfab \
        /opt/fabric/bin/peer chaincode invoke -o orderer-api.127-0-0-1.nip.io:8080 -C mychannel -n ${NAME} -c '{"Args":["deleteConga","1001"]}' --waitForEvent

    date
    ${RETRY} docker exec \
        --env-file ${tmpdir}/admin-org1.env \
        -w /home/ibp-user \
        microfab \
        /opt/fabric/bin/peer chaincode query -o orderer-api.127-0-0-1.nip.io:8080 -C mychannel -n ${NAME} -c '{"Args":["congaExists","1001"]}'

    date
}

private_contract_test() {
    : ${NAME:?}

    date
    ${RETRY} docker exec \
        --env-file ${tmpdir}/admin-org1.env \
        -w /home/ibp-user \
        microfab \
        /opt/fabric/bin/peer chaincode query -o orderer-api.127-0-0-1.nip.io:8080 -C mychannel -n ${NAME} -c '{"Args":["privateCongaExists","1001"]}'

    date
    priVal="privateValue"
    TRANSIENT=$(echo -n "100" | base64 | tr -d \\n)
    ${RETRY} docker exec \
        --env-file ${tmpdir}/admin-org1.env \
        -w /home/ibp-user \
        microfab \
        /opt/fabric/bin/peer chaincode invoke -o orderer-api.127-0-0-1.nip.io:8080 -C mychannel -n ${NAME} -c '{"Args":["createPrivateConga","1001"]}' --transient "{\""${priVal}"\":\""${TRANSIENT}"\"}" --waitForEvent

    date
    ${RETRY} docker exec \
        --env-file ${tmpdir}/admin-org1.env \
        -w /home/ibp-user \
        microfab \
        /opt/fabric/bin/peer chaincode query -o orderer-api.127-0-0-1.nip.io:8080 -C mychannel -n ${NAME} -c '{"Args":["privateCongaExists","1001"]}'

    date
    ${RETRY} docker exec \
        --env-file ${tmpdir}/admin-org1.env \
        -w /home/ibp-user \
        microfab \
        /opt/fabric/bin/peer chaincode query -o orderer-api.127-0-0-1.nip.io:8080 -C mychannel -n ${NAME} -c '{"Args":["readPrivateConga","1001"]}'

    date
    TRANSIENT=$(echo -n "125" | base64 | tr -d \\n)
    ${RETRY} docker exec \
        --env-file ${tmpdir}/admin-org1.env \
        -w /home/ibp-user \
        microfab \
        /opt/fabric/bin/peer chaincode invoke -o orderer-api.127-0-0-1.nip.io:8080 -C mychannel -n ${NAME} -c '{"Args":["updatePrivateConga","1001"]}' --transient "{\""${priVal}"\":\""${TRANSIENT}"\"}" --waitForEvent

    date
    ${RETRY} docker exec \
        --env-file ${tmpdir}/admin-org1.env \
        -w /home/ibp-user \
        microfab \
        /opt/fabric/bin/peer chaincode query -o orderer-api.127-0-0-1.nip.io:8080 -C mychannel -n ${NAME} -c '{"Args":["readPrivateConga","1001"]}'

    date
    ${RETRY} docker exec \
        --env-file ${tmpdir}/admin-org1.env \
        -w /home/ibp-user \
        microfab \
        /opt/fabric/bin/peer chaincode invoke -o orderer-api.127-0-0-1.nip.io:8080 -C mychannel -n ${NAME} -c '{"Args":["verifyPrivateConga","Org1MSP","1001","{\"privateValue\":\"125\"}"]}' --waitForEvent

    date
    ${RETRY} docker exec \
        --env-file ${tmpdir}/admin-org1.env \
        -w /home/ibp-user \
        microfab \
        /opt/fabric/bin/peer chaincode invoke -o orderer-api.127-0-0-1.nip.io:8080 -C mychannel -n ${NAME} -c '{"Args":["deletePrivateConga","1001"]}' --waitForEvent

    date
    ${RETRY} docker exec \
        --env-file ${tmpdir}/admin-org1.env \
        -w /home/ibp-user \
        microfab \
        /opt/fabric/bin/peer chaincode query -o orderer-api.127-0-0-1.nip.io:8080 -C mychannel -n ${NAME} -c '{"Args":["privateCongaExists","1001"]}'

    date
}

network_test() {
    date
    mkdir yofn
    pushd yofn
    yo fabric:network -- --name yofn --dockerName yofn --port 8080 --numOrganizations 2 --fabricCapabilities V2_0
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
    fi
    popd
}

pushd ${tmpdir}
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
    set +e
    docker stop microfab
fi