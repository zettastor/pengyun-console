#!/bin/bash
SCRIPTPATH=$(cd "$(dirname "$0")"; pwd)
ROOTPATH=$SCRIPTPATH/..
$ROOTPATH/tomcat/bin/shutdown.sh
