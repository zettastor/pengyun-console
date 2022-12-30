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
