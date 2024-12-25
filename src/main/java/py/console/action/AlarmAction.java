/**
* Copyright (C) 2013-2024 Nanjing Pengyun Network Technology Co., Ltd.
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/ 

package py.console.action;

import com.opensymphony.xwork2.ActionSupport;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import py.console.bean.ResultMessage;
import py.console.bean.SimpleAlarm;
import py.console.service.account.AccountSessionService;
import py.console.service.alarm.impl.AlarmServiceImpl;

/**
 * AlarmAction.
 */
@SuppressWarnings("serial")
public class AlarmAction extends ActionSupport {

  private static final Logger logger = LoggerFactory.getLogger(AlarmAction.class);
  private AccountSessionService accountSessionService;
  private AlarmServiceImpl alarmService;
  private List<SimpleAlarm> alarmList;

  private ResultMessage resultMessage;
  private final String resultMessageString = "resultMessage";

  /**
   * The name of this variable should never be changed -tyr.
   */
  private Map<String, Object> dataMap;

  public AlarmAction() {
    super();
    this.dataMap = new HashMap<String, Object>();
  }

  public List<SimpleAlarm> getAlarmList() {
    return alarmList;
  }

  public void setAlarmList(List<SimpleAlarm> alarmList) {
    this.alarmList = alarmList;
  }

  public AccountSessionService getAccountSessionService() {
    return accountSessionService;
  }

  public void setAccountSessionService(AccountSessionService accountSessionService) {
    this.accountSessionService = accountSessionService;
  }

  public AlarmServiceImpl getAlarmService() {
    return alarmService;
  }

  public void setAlarmService(AlarmServiceImpl alarmService) {
    this.alarmService = alarmService;
  }

  public ResultMessage getResultMessage() {
    return resultMessage;
  }

  public void setResultMessage(ResultMessage resultMessage) {
    this.resultMessage = resultMessage;
  }

  public Map<String, Object> getDataMap() {
    return dataMap;
  }

  public void setDataMap(Map<String, Object> dataMap) {
    this.dataMap = dataMap;
  }


}
