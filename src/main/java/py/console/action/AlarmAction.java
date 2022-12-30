/*
 * Copyright (c) 2022. PengYunNetWork
 *
 * This program is free software: you can use, redistribute, and/or modify it
 * under the terms of the GNU Affero General Public License, version 3 or later ("AGPL"),
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 *  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 *
 *  You should have received a copy of the GNU Affero General Public License along with
 *  this program. If not, see <http://www.gnu.org/licenses/>.
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
