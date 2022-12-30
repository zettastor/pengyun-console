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
import org.apache.log4j.Logger;
import org.apache.thrift.TException;
import py.console.bean.Account;
import py.console.bean.ResultMessage;
import py.console.service.account.AccountService;
import py.console.service.account.AccountSessionService;
import py.console.utils.Constants;
import py.console.utils.ErrorCode;
import py.console.utils.ErrorCode2;
import py.console.utils.Utils;
import py.exception.EndPointNotFoundException;
import py.exception.GenericThriftClientFactoryException;
import py.exception.TooManyEndPointFoundException;
import py.thrift.share.AccountNotFoundExceptionThrift;
import py.thrift.share.AuthenticationFailedExceptionThrift;
import py.thrift.share.EndPointNotFoundExceptionThrift;
import py.thrift.share.InvalidInputExceptionThrift;
import py.thrift.share.LoadVolumeExceptionThrift;
import py.thrift.share.NetworkErrorExceptionThrift;
import py.thrift.share.ServiceHavingBeenShutdownThrift;
import py.thrift.share.ServiceIsNotAvailableThrift;
import py.thrift.share.TooManyEndPointFoundExceptionThrift;

/**
 * LoginAction.
 */
@SuppressWarnings("serial")
public class LoginAction extends ActionSupport {

  // private final static Log logger = LogFactory.getLog(LoginAction.class);
  private static final Logger logger = Logger.getLogger(LoginAction.class);

  private AccountSessionService accountSessionService;

  private AccountService accountService;

  private String accountName;

  private String password;

  private ResultMessage resultMessage;

  /**
   * The name of this instance should never be changed -tyr.
   */
  private Map<String, Object> dataMap;

  public String getAccountName() {
    return accountName;
  }

  public void setAccountName(String accountName) {
    this.accountName = accountName;
  }

  public String getPassword() {
    return password;
  }

  public ResultMessage getResultMessage() {
    return resultMessage;
  }

  public void setResultMessage(ResultMessage resultMessage) {
    this.resultMessage = resultMessage;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public AccountSessionService getAccountSessionService() {
    return accountSessionService;
  }

  public void setAccountSessionService(AccountSessionService accountSessionService) {
    this.accountSessionService = accountSessionService;
  }

  public AccountService getAccountService() {
    return accountService;
  }

  public void setAccountService(AccountService accountService) {
    this.accountService = accountService;
  }

  public Map<String, Object> getDataMap() {
    return dataMap;
  }

  public void setDataMap(Map<String, Object> dataMap) {
    this.dataMap = dataMap;
  }

  public LoginAction() {
    super();
    this.dataMap = new HashMap<String, Object>();
  }

  /**
   * login.
   *
   * @return ACTION_RETURN_STRING
   */
  public String login() {
    logger.debug("Start to process login action...");
    resultMessage = new ResultMessage();
    Map<String, Object> result = null;
    Account account = new Account();
    Map<String, Map<String, Boolean>> apisMap = new HashMap<>();
    try {
      result = accountService.authenticateAccount(accountName, password);
      apisMap = (Map<String, Map<String, Boolean>>) result.get("apisMap");
      account = (Account) result.get("account");
      if (account != null) {
        accountSessionService.setAccount(account);
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      } else {
        resultMessage.setMessage(ErrorCode2.ERROR_0001_AuthenticationFailed);
      }

    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (AuthenticationFailedExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0001_AuthenticationFailed);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (InvalidInputExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (TException e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }

    logger.debug("Done processing login action.");
    dataMap.put("resultMessage", resultMessage);
    dataMap.put("account", account);
    dataMap.put("apisMap", apisMap);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * logout.
   *
   * @return ACTION_RETURN_STRING
   */
  public String logout() {
    long accountId;
    resultMessage = new ResultMessage();
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    accountId = Long.parseLong(account.getAccountId());
    accountSessionService.setAccount(null);
    try {
      accountSessionService.logout(accountId);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ServiceIsNotAvailableThrift");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ServiceHavingBeenShutdownThrift");
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (TException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * judge Login.
   *
   * @return ACTION_RETURN_STRING
   */
  public String judgeLogin() {
    resultMessage = new ResultMessage();
    Account accountFromSession = accountSessionService.getAccount();
    if (accountFromSession != null) {
      resultMessage.setMessage(ErrorCode.getError0000Success(Utils.getLang()));
      dataMap.put("account", accountFromSession);
    } else {
      resultMessage.setMessage(ERROR);
    }
    dataMap.put("resultMessage", resultMessage);

    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * load Volume.
   *
   * @return ACTION_RETURN_STRING
   */
  public String loadVolume() {
    resultMessage = new ResultMessage();
    logger.debug("load volume...");
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    try {
      accountService.loadVolume(Long.valueOf(account.getAccountId()));
    } catch (NumberFormatException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NumberFormat");
      dataMap.put("resultMessage", resultMessage);
    } catch (LoadVolumeExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_VolumeLoadException");
      dataMap.put("resultMessage", resultMessage);
    } catch (EndPointNotFoundException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
      dataMap.put("resultMessage", resultMessage);
    } catch (TooManyEndPointFoundException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
      dataMap.put("resultMessage", resultMessage);
    } catch (GenericThriftClientFactoryException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
      dataMap.put("resultMessage", resultMessage);
    } catch (TException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
      dataMap.put("resultMessage", resultMessage);
    }
    return Constants.ACTION_RETURN_STRING;
  }
}
