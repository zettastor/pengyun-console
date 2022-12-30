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
