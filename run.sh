#!/bin/bash
# Copyright (C) 2013-2024 Nanjing Pengyun Network Technology Co., Ltd.
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# 


pid=`netstat -tlnp | awk '/:8080 */ {split($NF,a,"/"); print a[1]}'`
kill -9 $pid
sleep 2
mvn clean install -DskipTests
cd target
tar -xvf pengyun-console-2.3.0-internal.tar.gz
cd pengyun-console-2.3.0
bin/startup.sh 
