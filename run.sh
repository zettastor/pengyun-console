#!/bin/bash


pid=`netstat -tlnp | awk '/:8080 */ {split($NF,a,"/"); print a[1]}'`
kill -9 $pid
sleep 2
mvn clean install -DskipTests
cd target
tar -xvf pengyun-console-2.3.0-internal.tar.gz
cd pengyun-console-2.3.0
bin/startup.sh 
