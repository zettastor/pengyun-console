#!/bin/env python
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

import  xml.dom.minidom
import os
import shutil


print "Changing the logo and company info, according to company name"
#open xml file
dom=xml.dom.minidom.parse("company_setting.xml");
#get document element
root=dom.documentElement

company=root.getElementsByTagName("company")[0]

companyName=company.firstChild.data

print "Company name is "+companyName

# setting logo
path_logo="./console/tomcat/webapps/ROOT/images/"

os.rename(path_logo+companyName+"_logo",path_logo+"logo")

for parent,dirnames,filenames in os.walk(path_logo):
	for dirname in dirnames:
		if dirname.endswith("_logo"):
			shutil.rmtree(path_logo+dirname)

# setting info
path_info="./console/tomcat/webapps/ROOT/page/"

os.rename(path_info+companyName+"_foot.jsp",path_info+"foot.jsp")

for parent,dirnames,filenames in os.walk(path_info):
	for filename in filenames:
		if filename.endswith("_foot.jsp"):
			os.remove(path_info+filename)


