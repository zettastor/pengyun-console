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
import py.console.service.alert.imp.DtoUserServiceImpl;

/**
 * DtoUserAction.
 */
@SuppressWarnings("serial")
public class DtoUserAction extends ActionSupport {

  private static final Logger logger = LoggerFactory.getLogger(DtoUserAction.class);

  private AccountSessionService accountSessionService;
  private DtoUserServiceImpl dtoUserService;
  private String dtoUser;
  private String ids;

  private long id;
  private boolean flag;
  private String idFlags;
  private ResultMessage resultMessage;
  private final String resultMessageString = "resultMessage";
  /**
   * The name of this variable should never be changed -tyr.
   */
  private Map<String, Object> dataMap;

  public DtoUserAction() {
    super();
    this.dataMap = new HashMap<String, Object>();
  }

  private enum DtoStatus {
    SAVE,
    UPDATE,
    UPDATE_FLAG,
    LIST,
    GET,
    DELETE;
  }

  public AccountSessionService getAccountSessionService() {
    return accountSessionService;
  }

  public void setAccountSessionService(AccountSessionService accountSessionService) {
    this.accountSessionService = accountSessionService;
  }

  public DtoUserServiceImpl getDtoUserService() {
    return dtoUserService;
  }

  public void setDtoUserService(DtoUserServiceImpl dtoUserService) {
    this.dtoUserService = dtoUserService;
  }

  public String getDtoUser() {
    return dtoUser;
  }

  public void setDtoUser(String dtoUser) {
    this.dtoUser = dtoUser;
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

  public long getId() {
    return id;
  }

  public void setId(long id) {
    this.id = id;
  }

  public boolean isFlag() {
    return flag;
  }

  public void setFlag(boolean flag) {
    this.flag = flag;
  }

  public String getIdFlags() {
    return idFlags;
  }

  public void setIdFlags(String idFlags) {
    this.idFlags = idFlags;
  }

}
