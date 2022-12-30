#!/bin/bash
SCRIPTPATH=$(cd "$(dirname "$0")"; pwd)
ROOTPATH=$SCRIPTPATH/..
$ROOTPATH/tomcat/bin/startup.sh

# wait for 30 seconds to make sure console service bind port 8080
sleep 30

while true
do
    net_result=`netstat -npl | grep 8080`;
    if [ -z "$net_result" ]; then
        exit 1;
    fi

    sleep 10
done
