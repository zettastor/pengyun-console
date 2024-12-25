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
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import py.console.bean.ResultMessage;
import py.console.service.account.AccountSessionService;
import py.console.service.alert.imp.DtoLogServiceImpl;

/**
 * DtoLogAction.
 */
@SuppressWarnings("serial")
public class DtoLogAction extends ActionSupport {

  private static final Logger logger = LoggerFactory.getLogger(DtoLogAction.class);

  private AccountSessionService accountSessionService;
  private DtoLogServiceImpl dtoLogService;
  private String ids;

  public int pageSize;
  public int pageNo;
  public String sortFeild;
  public String sortDirection;

  private ResultMessage resultMessage;
  private final String resultMessageString = "resultMessage";

  /**
   * The name of this variable should never be changed -tyr.
   */
  private Map<String, Object> dataMap;

  public DtoLogAction() {
    super();
    this.dataMap = new HashMap<String, Object>();
  }

  private enum DtoStatus {
    GET,
    LIST,
    DELETE;
  }

  public AccountSessionService getAccountSessionService() {
    return accountSessionService;
  }

  public void setAccountSessionService(AccountSessionService accountSessionService) {
    this.accountSessionService = accountSessionService;
  }

  public DtoLogServiceImpl getDtoLogService() {
    return dtoLogService;
  }

  public void setDtoLogService(DtoLogServiceImpl dtoLogService) {
    this.dtoLogService = dtoLogService;
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

  public String getIds() {
    return ids;
  }

  public void setIds(String ids) {
    this.ids = ids;
  }

  public int getPageSize() {
    return pageSize;
  }

  public void setPageSize(int pageSize) {
    this.pageSize = pageSize;
  }

  public int getPageNo() {
    return pageNo;
  }

  public void setPageNo(int pageNo) {
    this.pageNo = pageNo;
  }

  public String getSortFeild() {
    return sortFeild;
  }

  public void setSortFeild(String sortFeild) {
    this.sortFeild = sortFeild;
  }

  public String getSortDirection() {
    return sortDirection;
  }

  public void setSortDirection(String sortDirection) {
    this.sortDirection = sortDirection;
  }
}
