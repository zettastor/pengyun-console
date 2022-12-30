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
import py.console.bean.Account;
import py.console.bean.ResultMessage;
import py.console.bean.ZookeeperStatus;
import py.console.service.account.AccountSessionService;
import py.console.service.checkservice.CheckStatusService;
import py.console.utils.Constants;
import py.console.utils.ErrorCode2;
import py.thrift.share.AccountNotFoundExceptionThrift;
import py.thrift.share.EndPointNotFoundExceptionThrift;
import py.thrift.share.NetworkErrorExceptionThrift;
import py.thrift.share.PermissionNotGrantExceptionThrift;
import py.thrift.share.ServiceHavingBeenShutdownThrift;
import py.thrift.share.ServiceIsNotAvailableThrift;
import py.thrift.share.TooManyEndPointFoundExceptionThrift;
import py.thrift.systemdaemon.service.IllegalParameterExceptionThrift;

/**
 * ZookeeperStatusAction.
 */
@SuppressWarnings("serial")
public class ZookeeperStatusAction extends ActionSupport {

  private static final Logger logger = LoggerFactory.getLogger(ZookeeperStatusAction.class);

  private AccountSessionService accountSessionService;
  private CheckStatusService checkStatusService;
  private ResultMessage resultMessage;
  private final String resultMessageString = "resultMessage";

  /**
   * The name of this variable should never be changed -tyr.
   */
  private Map<String, Object> dataMap;

  public ZookeeperStatusAction() {
    super();
    this.dataMap = new HashMap<String, Object>();
  }

  public String checkZookeeperStatus() {
    return choiceAction(ServiceStatus.ZOOKEEPER);
  }

  private String choiceAction(ServiceStatus tag) {
    resultMessage = new ResultMessage();
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put(resultMessageString, resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }

    try {
      switch (tag) {
        case ZOOKEEPER:
          List<ZookeeperStatus> zookeeperStatusList = checkStatusService
              .listZookeeperServiceStatus(Long.parseLong(account.getAccountId()));
          logger.info("get the zookeeperStatusList:{}", zookeeperStatusList);
          if (null == zookeeperStatusList) {
            resultMessage.setMessage("response result is null");
            dataMap.put(resultMessageString, resultMessage);
            return Constants.ACTION_RETURN_STRING;
          }
          dataMap.put("zookeeperStatusList", zookeeperStatusList);
          break;
        default:
      }
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      dataMap.put(resultMessageString, resultMessage);
      return Constants.ACTION_RETURN_STRING;

    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("choiceAction caught an exception ", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
      dataMap.put(resultMessageString, resultMessage);
      return Constants.ACTION_RETURN_STRING;
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("choiceAction caught an exception ", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
      dataMap.put(resultMessageString, resultMessage);
      return Constants.ACTION_RETURN_STRING;
    } catch (IllegalParameterExceptionThrift e) {
      logger.error("choiceAction caught an exception ", e);
      resultMessage.setMessage("ERROR_IllegalParameterException");
      dataMap.put(resultMessageString, resultMessage);
      return Constants.ACTION_RETURN_STRING;
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("choiceAction caught an exception ", e);
      resultMessage.setMessage("ERROR_PermissionNotGrantException");
      dataMap.put(resultMessageString, resultMessage);
      return Constants.ACTION_RETURN_STRING;
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("choiceAction caught an exception ", e);
      resultMessage.setMessage("ERROR_AccountNotFoundException");
      dataMap.put(resultMessageString, resultMessage);
      return Constants.ACTION_RETURN_STRING;
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("choiceAction caught an exception ", e);
      resultMessage.setMessage("ERROR_EndPointNotFoundException");
      dataMap.put(resultMessageString, resultMessage);
      return Constants.ACTION_RETURN_STRING;
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("choiceAction caught an exception ", e);
      resultMessage.setMessage("ERROR_TooManyEndPointFoundException");
      dataMap.put(resultMessageString, resultMessage);
      return Constants.ACTION_RETURN_STRING;
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("choiceAction caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
      dataMap.put(resultMessageString, resultMessage);
      return Constants.ACTION_RETURN_STRING;
    } catch (Exception e) {
      logger.error("choiceAction caught an exception ", e);
      resultMessage.setMessage("ERROR_0010_InternalError");
      dataMap.put(resultMessageString, resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }

  }

  private enum ServiceStatus {
    ZOOKEEPER;
  }

  public AccountSessionService getAccountSessionService() {
    return accountSessionService;
  }

  public void setAccountSessionService(AccountSessionService accountSessionService) {
    this.accountSessionService = accountSessionService;
  }

  public CheckStatusService getCheckStatusService() {
    return checkStatusService;
  }

  public void setCheckStatusService(
      CheckStatusService checkStatusService) {
    this.checkStatusService = checkStatusService;
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