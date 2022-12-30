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

import static py.console.utils.ErrorCode2.ERROR_CRUDBuiltInRoleException;
import static py.console.utils.ErrorCode2.ERROR_PermissionNotGrantException;

import com.opensymphony.xwork2.ActionContext;
import com.opensymphony.xwork2.ActionSupport;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.servlet.http.HttpServletRequest;
import net.sf.json.JSONArray;
import org.apache.commons.lang.StringUtils;
import org.apache.struts2.ServletActionContext;
import org.apache.thrift.TException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import py.console.bean.Account;
import py.console.bean.AccountList;
import py.console.bean.ApiToAuthorize;
import py.console.bean.DeleteAccountResult;
import py.console.bean.ResetPasswordResult;
import py.console.bean.Resource;
import py.console.bean.ResultMessage;
import py.console.bean.Role;
import py.console.bean.SimpleVolumeMetadata;
import py.console.service.account.AccountService;
import py.console.service.account.AccountSessionService;
import py.console.utils.Constants;
import py.console.utils.ErrorCode2;
import py.thrift.infocenter.service.CreateRoleNameExistedExceptionThrift;
import py.thrift.share.AccessDeniedExceptionThrift;
import py.thrift.share.AccountAlreadyExistsExceptionThrift;
import py.thrift.share.AccountNotFoundExceptionThrift;
import py.thrift.share.ApiToAuthorizeThrift;
import py.thrift.share.CrudBuiltInRoleExceptionThrift;
import py.thrift.share.CrudSuperAdminAccountExceptionThrift;
import py.thrift.share.DeleteLoginAccountExceptionThrift;
import py.thrift.share.DeleteRoleExceptionThrift;
import py.thrift.share.EndPointNotFoundExceptionThrift;
import py.thrift.share.InsufficientPrivilegeExceptionThrift;
import py.thrift.share.InvalidInputExceptionThrift;
import py.thrift.share.NetworkErrorExceptionThrift;
import py.thrift.share.OlderPasswordIncorrectExceptionThrift;
import py.thrift.share.PermissionNotGrantExceptionThrift;
import py.thrift.share.ResourceThrift;
import py.thrift.share.RoleNotExistedExceptionThrift;
import py.thrift.share.RoleThrift;
import py.thrift.share.ServiceHavingBeenShutdownThrift;
import py.thrift.share.ServiceIsNotAvailableThrift;
import py.thrift.share.TooManyEndPointFoundExceptionThrift;

/**
 * This action supply the function update user password now maybe add function update username,
 * delete user.
 */
@SuppressWarnings("serial")
public class AccountAction extends ActionSupport {

  private static final Logger logger = LoggerFactory.getLogger(AccountAction.class);

  private AccountSessionService accountSessionService;

  private AccountService accountService;

  private ResultMessage resultMessage;

  private DeleteAccountResult deleteAccountResult;

  private String newPassword;

  private String oldPassword;

  private String accountName;

  private String accountType;

  private AccountList accountList;

  private String accountId;

  private List<SimpleVolumeMetadata> volumeList;

  private ResetPasswordResult resetPasswordResult;

  private String orderDir;

  private String roleName;

  private String roleId;

  private String description;

  private String apiNamesJson;

  private String idsJson;

  private String roleIdsJson;

  private String resourcesJson;

  private String targetAccountId;

  /**
   * The name of this instance should never be changed -tyr.
   */
  private Map<String, Object> dataMap;

  /**
   * Account Action.
   */
  public AccountAction() {
    super();
    this.dataMap = new HashMap<String, Object>();
    resultMessage = new ResultMessage();
  }

  /**
   * create.
   *
   * @return ACTION_RETURN_STRING
   */
  public String create() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }

    Account newAccount = buildAccountFormRequest();
    Set<Long> roleIdsSet = new HashSet<>();
    if (!StringUtils.isEmpty(roleIdsJson)) {
      logger.debug("roleIdsJson is {}", roleIdsJson);
      JSONArray idsJsonArray = JSONArray.fromObject(roleIdsJson);
      for (String roleId : (List<String>) JSONArray.toList(idsJsonArray, String.class)) {
        roleIdsSet.add(Long.valueOf(roleId));
      }
      logger.debug("roleIdsSet is {}", roleIdsSet);
    }
    try {
      if (accountService.createAccount(newAccount, Long.valueOf(account.getAccountId()),
          roleIdsSet)) {
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);

      }
    } catch (AccountAlreadyExistsExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_AccountAlreadyExistsException");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (InvalidInputExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (AccessDeniedExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0050_AccessDenied");
    } catch (TException e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }

    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * update Password.
   *
   * @return ACTION_RETURN_STRING
   */
  public String updatePassword() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    try {
      if (accountService.updateUser(account, newPassword, oldPassword)) {
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      }
    } catch (OlderPasswordIncorrectExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_OlderPasswordIncorrectExceptionThrift");
    } catch (InsufficientPrivilegeExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_InsufficientPrivilegeExceptionThrift");
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0003_AccountNotExists);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (InvalidInputExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TException e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * list Account.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listAccount() {
    logger.debug("Start to process listAccount action...");
    Account account = accountSessionService.getAccount();
    if (account == null) {
      accountList.setMessage(ErrorCode2.ERROR_0001_AuthenticationFailed);
      dataMap.put("accountList", accountList);
      return Constants.ACTION_RETURN_STRING;
    }

    Set<Long> idsSet = null;
    if (!StringUtils.isEmpty(idsJson)) {
      idsSet = new HashSet<>();
      logger.debug("idsJson is {}", idsJson);
      JSONArray idsJsonArray = JSONArray.fromObject(idsJson);
      for (String accountId : (List<String>) JSONArray.toList(idsJsonArray, String.class)) {
        idsSet.add(Long.valueOf(accountId));
      }
      logger.debug("idsSet is {}", idsSet);
    }

    accountList = new AccountList();
    List<Account> accounts;
    try {

      accounts = accountService.getAll(Long.parseLong(account.getAccountId()), idsSet);

      accountList.setAccountList(accounts);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (InvalidInputExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (AccessDeniedExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0050_AccessDenied");
    } catch (TException e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    logger.debug("Done processing listAccount action.");
    dataMap.put("accountList", accountList);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * list Account DT.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listAccountDt() {
    ActionContext cxt = ActionContext.getContext();
    HttpServletRequest request = (HttpServletRequest) cxt.get(ServletActionContext.HTTP_REQUEST);
    // 获取请求次数
    String draw = "0";
    draw = request.getParameter("draw");
    // 数据起始位置
    String start = request.getParameter("start");
    // 数据长度
    String length = request.getParameter("length");

    // 总记录数
    String recordsTotal = "0";

    // 过滤后记录数
    String recordsFiltered = "0";

    // 定义列名
    String[] cols = {"null", "accountId", "accountName", "accountType"};
    // 获取客户端需要那一列排序
    String orderColumn = "0";
    orderColumn = request.getParameter("order[0][column]");
    orderColumn = cols[Integer.parseInt(orderColumn)];
    // 获取排序方式 默认为asc
    orderDir = "asc";
    orderDir = request.getParameter("order[0][dir]");

    // 获取用户过滤框里的字符
    String searchValue = request.getParameter("search[value]");
    logger.debug("Start to process listAccount action...");
    Account account = accountSessionService.getAccount();
    if (account == null) {
      dataMap.put("recordsTotal", "0");
      dataMap.put("recordsFiltered", "0");
      dataMap.put("draw", draw);
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<Account> accounts = new ArrayList<>();
    List<Account> accountsReturn = new ArrayList<>();
    try {
      accounts = accountService.getAll(Long.parseLong(account.getAccountId()), null);
      recordsTotal = String.valueOf(accounts.size());
      List<Account> accountsTmpList = new ArrayList<Account>();
      // search
      if (!searchValue.equals("")) {
        for (Account accoutToChoose : accounts) {
          if (accoutToChoose.getAccountName().toLowerCase().contains(searchValue.toLowerCase())) {
            accountsTmpList.add(accoutToChoose);
          }
        }
      } else {
        accountsTmpList = accounts;
      }
      recordsFiltered = String.valueOf(accountsTmpList.size());
      // sort

      switch (orderColumn) {
        case "accountName":
          Collections.sort(accountsTmpList, new SortByName());
          break;
        case "accountType":
          Collections.sort(accountsTmpList, new SortByType());
          break;
        default:
          Collections.sort(accountsTmpList, new SortByName());
      }
      // pagination
      int size = Integer.parseInt(start) + Integer.parseInt(length);
      if (size > accountsTmpList.size()) {
        size = accountsTmpList.size();
      }
      for (int i = Integer.parseInt(start); i < size; i++) {
        accountsReturn.add(accountsTmpList.get(i));
      }
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (InvalidInputExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (AccessDeniedExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0050_AccessDenied");
    } catch (TException e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }

    logger.debug("Done processing listAccount action.");
    dataMap.put("data", accountsReturn);
    dataMap.put("recordsTotal", recordsTotal);
    dataMap.put("recordsFiltered", recordsFiltered);
    dataMap.put("draw", draw);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * reset Password.
   *
   * @return ACTION_RETURN_STRING
   */
  public String resetPassword() {
    Account account = accountSessionService.getAccount();
    resetPasswordResult = new ResetPasswordResult();
    if (account == null) {
      resetPasswordResult.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resetPasswordResult", resetPasswordResult);
      return Constants.ACTION_RETURN_STRING;
    }
    try {
      String resetPassword = accountService
          .resetPassword(Long.parseLong(account.getAccountId()), Long.parseLong(accountId));
      if (resetPassword != null) {
        resetPasswordResult.setPassword(resetPassword);
        resetPasswordResult.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
        dataMap.put("resetPasswordResult", resetPasswordResult);
        return Constants.ACTION_RETURN_STRING;
      }
    } catch (NumberFormatException e) {
      resetPasswordResult.setMessage("ERROR_0040_InvalidInput");
    } catch (AccountNotFoundExceptionThrift e) {
      resetPasswordResult.setMessage(ErrorCode2.ERROR_0003_AccountNotExists);
    } catch (AccessDeniedExceptionThrift e) {
      resetPasswordResult.setMessage(ErrorCode2.ERROR_0016_NoPermission);
    } catch (PermissionNotGrantExceptionThrift e) {
      resetPasswordResult.setMessage(ERROR_PermissionNotGrantException);
    } catch (ServiceIsNotAvailableThrift e) {
      resetPasswordResult.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      resetPasswordResult.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (ServiceHavingBeenShutdownThrift e) {
      resetPasswordResult.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (NetworkErrorExceptionThrift e) {
      resetPasswordResult.setMessage("ERROR_NetworkErrorException");
    } catch (InvalidInputExceptionThrift e) {
      resetPasswordResult.setMessage("ERROR_0040_InvalidInput");
    } catch (EndPointNotFoundExceptionThrift e) {
      resetPasswordResult.setMessage("ERROR_EndPointNotFound");
    } catch (TException e) {
      resetPasswordResult.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resetPasswordResult", resetPasswordResult);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * delete Account.
   *
   * @return ACTION_RETURN_STRING
   */
  public String deleteAccount() {
    Account account = accountSessionService.getAccount();
    deleteAccountResult = new DeleteAccountResult();
    if (account == null) {
      deleteAccountResult.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("deleteAccountResult", deleteAccountResult);
      return Constants.ACTION_RETURN_STRING;
    }

    if (StringUtils.isEmpty(idsJson)) {
      deleteAccountResult.setMessage("ERROR_InvalidInputException");
    } else {
      logger.debug("idsJson is {}", idsJson);
      Set<Long> idsSet = new HashSet<>();
      Set<Long> deleteIdsSet;
      JSONArray idsJsonArray = JSONArray.fromObject(idsJson);
      for (String deletingAccountId : (List<String>) JSONArray.toList(idsJsonArray, String.class)) {
        idsSet.add(Long.valueOf(deletingAccountId));
      }
      logger.debug("idsSet is {}", idsSet);
      try {
        deleteIdsSet = accountService.delete(idsSet, Long.valueOf(account.getAccountId()));
        if (deleteIdsSet.size() != idsSet.size()) {
          idsSet.removeIf(id -> deleteIdsSet.contains(id));
        }
        dataMap.put("idsSet", idsSet);
        deleteAccountResult.setMessage(ErrorCode2.ERROR_0000_SUCCESS);

      } catch (AccountNotFoundExceptionThrift e) {
        deleteAccountResult.setMessage(ErrorCode2.ERROR_0003_AccountNotExists);
      } catch (PermissionNotGrantExceptionThrift e) {
        deleteAccountResult.setMessage(ERROR_PermissionNotGrantException);
      } catch (DeleteLoginAccountExceptionThrift e) {
        deleteAccountResult.setMessage("ERROR_DeleteLoginAccountException");
      } catch (TooManyEndPointFoundExceptionThrift e) {
        deleteAccountResult.setMessage("ERROR_0049_TooManyEndPointFound");
      } catch (EndPointNotFoundExceptionThrift e) {
        deleteAccountResult.setMessage("ERROR_EndPointNotFound");
      } catch (ServiceIsNotAvailableThrift e) {
        deleteAccountResult.setMessage("ERROR_0065_ServiceIsNotAvailable");
      } catch (InvalidInputExceptionThrift e) {
        deleteAccountResult.setMessage("ERROR_0040_InvalidInput");
      } catch (ServiceHavingBeenShutdownThrift e) {
        deleteAccountResult.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
      } catch (NetworkErrorExceptionThrift e) {
        deleteAccountResult.setMessage("ERROR_NetworkErrorException");
      } catch (AccessDeniedExceptionThrift e) {
        deleteAccountResult.setMessage("ERROR_0050_AccessDenied");
      } catch (TException e) {
        deleteAccountResult.setMessage("ERROR_NetworkErrorException");
      }

    }
    dataMap.put("deleteAccountResult", deleteAccountResult);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * obtain Snapshot Show Flag.
   *
   * @return ACTION_RETURN_STRING
   */
  public String obtainSnapshotShowFlag() {

    String snapshotShowFlag = accountService.obtainSnapshotShowFlag();
    String csiShowFlag = accountService.obtainCsiFlag();
    dataMap.put("snapshotShowFlag", snapshotShowFlag);
    dataMap.put("csi", csiShowFlag);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * list Api.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listApi() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    String snapshotShowFlag = accountService.obtainSnapshotShowFlag();
    List<ApiToAuthorizeThrift> apisList = new ArrayList<>();
    try {
      apisList = accountService.listApi(Long.valueOf(account.getAccountId()));
      Map<String, List<ApiToAuthorizeThrift>> apisMap = new HashMap<>();
      for (ApiToAuthorizeThrift api : apisList) {
        if (apisMap.containsKey(api.getCategory())) {
          apisMap.get(api.getCategory()).add(api);
        } else {
          List<ApiToAuthorizeThrift> apiListForCategory = new ArrayList<>();
          apiListForCategory.add(api);
          apisMap.put(api.getCategory(), apiListForCategory);
        }
      }

      logger.debug("apisMap is {}", apisMap);
      for (Map.Entry<String, List<ApiToAuthorizeThrift>> entry : apisMap.entrySet()) {
        // 判断是否显示快照相关
        if (!("false".equals(snapshotShowFlag) && entry.getKey().equals("SnapShot"))) {
          dataMap.put(entry.getKey(), entry.getValue());
        }

      }

      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
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
    dataMap.put("apisList", apisList);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * create Role.
   *
   * @return ACTION_RETURN_STRING
   */
  public String createRole() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<String> apisList;
    if (StringUtils.isEmpty(roleName) || StringUtils.isEmpty(apiNamesJson)) {
      resultMessage.setMessage("ERROR_InvalidInputException");
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;

    } else {
      logger.debug("apiNamesJson is {}", apiNamesJson);
      JSONArray apisJsonArray = JSONArray.fromObject(apiNamesJson);
      apisList = (List<String>) JSONArray.toList(apisJsonArray, String.class);
      Set<String> apisSet = new HashSet<>();
      apisSet.addAll(apisList);
      logger.debug("apisList is {}", apisList);
      try {
        accountService.createRole(Long.valueOf(account.getAccountId()), roleName, description,
            apisSet);
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      } catch (PermissionNotGrantExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage(ERROR_PermissionNotGrantException);
      } catch (ServiceIsNotAvailableThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
      } catch (AccountNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0003_AccountNotExists");
      } catch (CreateRoleNameExistedExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_CreateRoleNameExistedException");
      } catch (ServiceHavingBeenShutdownThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
      } catch (NetworkErrorExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_NetworkErrorException");
      } catch (EndPointNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_EndPointNotFound");
      } catch (TooManyEndPointFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
      } catch (TException e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_NetworkErrorException");
      }
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * update Role.
   *
   * @return ACTION_RETURN_STRING
   */
  public String updateRole() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<String> apisList = new ArrayList<>();
    if (StringUtils.isEmpty(roleName) || StringUtils.isEmpty(apiNamesJson) || StringUtils.isEmpty(
        roleId)) {
      resultMessage.setMessage("ERROR_InvalidInputException");

    } else {
      logger.debug("apiNamesJson is {}", apiNamesJson);
      JSONArray apisJsonArray = JSONArray.fromObject(apiNamesJson);
      apisList = (List<String>) JSONArray.toList(apisJsonArray, String.class);
      Set<String> apisSet = new HashSet<>();
      apisSet.addAll(apisList);
      logger.debug("apisList is {}", apisList);
      try {
        accountService
            .updateRole(Long.valueOf(account.getAccountId()), Long.valueOf(roleId), roleName,
                description,
                apisSet);
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      } catch (PermissionNotGrantExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage(ERROR_PermissionNotGrantException);
      } catch (CrudBuiltInRoleExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage(ERROR_CRUDBuiltInRoleException);
      } catch (TooManyEndPointFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
      } catch (AccountNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0003_AccountNotExists");
      } catch (RoleNotExistedExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_RoleNotExistedException");
      } catch (EndPointNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_EndPointNotFound");
      } catch (ServiceIsNotAvailableThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
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
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * list Roles.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listRoles() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    Set<Long> idsSet = null;
    if (!StringUtils.isEmpty(idsJson)) {
      idsSet = new HashSet<>();
      logger.debug("idsJson is {}", idsJson);
      JSONArray idsJsonArray = JSONArray.fromObject(idsJson);
      for (String accountId : (List<String>) JSONArray.toList(idsJsonArray, String.class)) {
        idsSet.add(Long.valueOf(accountId));
      }
      logger.debug("idsSet is {}", idsSet);
    }
    List<RoleThrift> rolesListThrift;
    List<Role> rolesList = new ArrayList<>();
    String snapshotShowFlag = accountService.obtainSnapshotShowFlag();
    try {
      rolesListThrift = accountService.listRoles(Long.valueOf(account.getAccountId()), idsSet);
      for (RoleThrift roleThrift : rolesListThrift) {
        Role role = new Role();
        role.setRoleId(String.valueOf(roleThrift.getId()));
        role.setName(roleThrift.getName());
        role.setDescription(roleThrift.getDescription());
        Map<String, List<ApiToAuthorize>> apiType2Apis = new HashMap<>();
        Set<ApiToAuthorizeThrift> apiToAuthorizeThriftSet = roleThrift.getPermissions();
        for (ApiToAuthorizeThrift apiToAuthorizeThrift : apiToAuthorizeThriftSet) {
          ApiToAuthorize apiToAuthorize = new ApiToAuthorize();
          String apiType = apiToAuthorizeThrift.getCategory();
          apiToAuthorize.setApiName(apiToAuthorizeThrift.getApiName());
          apiToAuthorize.setCategory(apiType);
          apiToAuthorize.setChineseText(apiToAuthorizeThrift.getChineseText());
          apiToAuthorize.setEnglishText(apiToAuthorizeThrift.getEnglishText());
          List<ApiToAuthorize> apisInType = apiType2Apis.get(apiType);
          if (apisInType == null) {
            apisInType = new ArrayList<>();
            // 判断是否显示快照相关
            if (!("false".equals(snapshotShowFlag) && apiType.equals("SnapShot"))) {
              apiType2Apis.put(apiType, apisInType);
            }

          }
          apisInType.add(apiToAuthorize);
        }
        role.setPermissions(apiType2Apis);
        rolesList.add(role);
      }

      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (ServiceIsNotAvailableThrift serviceIsNotAvailableThrift) {
      serviceIsNotAvailableThrift.printStackTrace();
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TException e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }

    dataMap.put("rolesList", rolesList);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;

  }

  /**
   * list Resource.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listResource() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<ResourceThrift> resourceThrifts = new ArrayList<>();
    List<Resource> resourceList = new ArrayList<>();

    try {
      resourceThrifts = accountService.listResource(Long.valueOf(account.getAccountId()));
      for (ResourceThrift resourceThrift : resourceThrifts) {
        Resource resource = new Resource();
        resource.setResourceId(String.valueOf(resourceThrift.getResourceId()));
        resource.setResourceName(resourceThrift.getResourceName());
        resource.setResourceType(resourceThrift.getResourceType());
        resourceList.add(resource);

      }
      logger.debug("resourceList is {}", resourceList);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TException e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    Map<String, List<Resource>> resourceMap = new HashMap<>();
    for (Resource resource : resourceList) {
      String resourceType = resource.getResourceType();
      List<Resource> currentResourceList = resourceMap.get(resourceType);
      if (currentResourceList == null) {
        List<Resource> list = new ArrayList<>();
        list.add(resource);
        resourceMap.put(resourceType, list);
      } else {
        currentResourceList.add(resource);
      }
    }

    dataMap.put("resourceList", resourceMap);
    // dataMap.put("resourceList", resourceList);
    dataMap.put("resultMessage", resultMessage);

    return Constants.ACTION_RETURN_STRING;

  }

  /**
   * delete Roles.
   *
   * @return ACTION_RETURN_STRING
   */
  public String deleteRoles() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    if (StringUtils.isEmpty(idsJson)) {
      resultMessage.setMessage("ERROR_InvalidInputException");
    } else {
      logger.debug("idsJson is {}", idsJson);
      Set<Long> idsSet = new HashSet<>();
      Set<Long> deleteIdsSet;
      JSONArray idsJsonArray = JSONArray.fromObject(idsJson);
      for (String roleId : (List<String>) JSONArray.toList(idsJsonArray, String.class)) {
        idsSet.add(Long.valueOf(roleId));
      }
      logger.debug("idsSet is {}", idsSet);
      try {
        deleteIdsSet = accountService.deleteRoles(Long.valueOf(account.getAccountId()), idsSet);
        if (deleteIdsSet.size() != idsSet.size()) {
          Iterator<Long> it = idsSet.iterator();
          while (it.hasNext()) {
            long id = it.next();
            if (deleteIdsSet.contains(id)) {
              it.remove();
            }
          }

        }
        dataMap.put("idsSet", idsSet);
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);

      } catch (DeleteRoleExceptionThrift e) {
        logger.error("Exception catch ", e);
        dataMap.put("failedRoleId2Cause", e.getFailedRoleName2Cause());
        resultMessage.setMessage("ERROR_DeleteRoleException");
      } catch (PermissionNotGrantExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage(ERROR_PermissionNotGrantException);
      } catch (ServiceIsNotAvailableThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
      } catch (AccountNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0003_AccountNotExists");
      } catch (TooManyEndPointFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
      } catch (EndPointNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_EndPointNotFound");
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

    }

    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;

  }

  /**
   * assign Roles.
   *
   * @return ACTION_RETURN_STRING
   */
  public String assignRoles() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    if (StringUtils.isEmpty(roleIdsJson) || StringUtils.isEmpty(accountId)) {
      resultMessage.setMessage("ERROR_InvalidInputException");
    } else {
      logger.debug("roleIdsJson is {}", roleIdsJson);
      Set<Long> roleIdsSet = new HashSet<>();
      JSONArray idsJsonArray = JSONArray.fromObject(roleIdsJson);
      for (String roleId : (List<String>) JSONArray.toList(idsJsonArray, String.class)) {
        roleIdsSet.add(Long.valueOf(roleId));
      }
      logger.debug("roleIdsSet is {}", roleIdsSet);

      try {
        accountService.assignRoles(Long.valueOf(account.getAccountId()), Long.valueOf(accountId),
            roleIdsSet);
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      } catch (PermissionNotGrantExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage(ERROR_PermissionNotGrantException);
      } catch (CrudSuperAdminAccountExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_CRUDSuperAdminAccountException");
      } catch (AccountNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0003_AccountNotExists");
      } catch (ServiceIsNotAvailableThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
      } catch (ServiceHavingBeenShutdownThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
      } catch (NetworkErrorExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_NetworkErrorException");
      } catch (EndPointNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_EndPointNotFound");
      } catch (TooManyEndPointFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
      } catch (TException e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_NetworkErrorException");
      }

    }

    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * assign Resource.
   *
   * @return ACTION_RETURN_STRING
   */
  public String assignResource() {

    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    logger.debug("resourcesJson is {}", resourcesJson);
    logger.debug("targetAccountId is {}", targetAccountId);
    if (StringUtils.isEmpty(resourcesJson) || StringUtils.isEmpty(targetAccountId)) {
      resultMessage.setMessage("ERROR_InvalidInputException");
    } else {
      logger.debug("resourcesJson is {}", resourcesJson);
      Set<Long> resourceIdsSet = new HashSet<>();
      JSONArray idsJsonArray = JSONArray.fromObject(resourcesJson);
      for (String resourdeId : (List<String>) JSONArray.toList(idsJsonArray, String.class)) {
        resourceIdsSet.add(Long.valueOf(resourdeId));
      }
      logger.debug("resourceIdsSet is {}", resourceIdsSet);

      try {
        accountService.assignResource(Long.valueOf(account.getAccountId()),
            Long.valueOf(targetAccountId),
            resourceIdsSet);
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      } catch (PermissionNotGrantExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage(ERROR_PermissionNotGrantException);
      } catch (ServiceIsNotAvailableThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
      } catch (AccountNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0003_AccountNotExists");
      } catch (TooManyEndPointFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
      } catch (ServiceHavingBeenShutdownThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
      } catch (NetworkErrorExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_NetworkErrorException");
      } catch (EndPointNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_EndPointNotFound");
      } catch (TException e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_NetworkErrorException");
      }

    }

    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  private Account buildAccountFormRequest() {
    Account account = new Account();
    account.setAccountName(accountName);
    account.setPassword(newPassword);

    return account;
  }

  class SortByName implements Comparator<Account> {

    public int compare(Account s1, Account s2) {
      if (s1.getAccountName().equals(s2.getAccountName())) {
        return 0;
      }
      if (s1.getAccountName().compareToIgnoreCase(s2.getAccountName()) > 0) {
        if (orderDir.equals("asc")) {
          return 1;
        }
        return -1;
      }
      if (orderDir.equals("asc")) {
        return -1;
      }
      return 1;
    }
  }

  class SortByType implements Comparator<Account> {

    public int compare(Account s1, Account s2) {
      if (s1.getAccountType().equals(s2.getAccountType())) {
        return 0;
      }
      if (s1.getAccountType().compareToIgnoreCase(s2.getAccountType()) > 0) {
        if (orderDir.equals("asc")) {
          return 1;
        }
        return -1;
      }
      if (orderDir.equals("asc")) {
        return -1;
      }
      return 1;
    }
  }

  public String getAccountName() {
    return accountName;
  }

  public void setAccountName(String accountName) {
    this.accountName = accountName;
  }

  public String getAccountType() {
    return accountType;
  }

  public void setAccountType(String accountType) {
    this.accountType = accountType;
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

  public String getNewPassword() {
    return newPassword;
  }

  public void setNewPassword(String newPassword) {
    this.newPassword = newPassword;
  }

  public String getOldPassword() {
    return oldPassword;
  }

  public void setOldPassword(String oldPassword) {
    this.oldPassword = oldPassword;
  }

  public ResultMessage getResultMessage() {
    return resultMessage;
  }

  public void setResultMessage(ResultMessage resultMessage) {
    this.resultMessage = resultMessage;
  }

  public AccountList getAccountList() {
    return accountList;
  }

  public void setAccountList(AccountList accountList) {
    this.accountList = accountList;
  }

  public String getAccountId() {
    return accountId;
  }

  public void setAccountId(String accountId) {
    this.accountId = accountId;
  }

  public ResetPasswordResult getResetPasswordResult() {
    return resetPasswordResult;
  }

  public void setResetPasswordResult(ResetPasswordResult resetPasswordResult) {
    this.resetPasswordResult = resetPasswordResult;
  }

  public List<SimpleVolumeMetadata> getVolumeList() {
    return volumeList;
  }

  public void setVolumeList(List<SimpleVolumeMetadata> volumeList) {
    this.volumeList = volumeList;
  }

  public DeleteAccountResult getDeleteAccountResult() {
    return deleteAccountResult;
  }

  public void setDeleteAccountResult(DeleteAccountResult deleteAccountResult) {
    this.deleteAccountResult = deleteAccountResult;
  }

  public Map<String, Object> getDataMap() {
    return dataMap;
  }

  public void setDataMap(Map<String, Object> dataMap) {
    this.dataMap = dataMap;
  }

  public String getOrderDir() {
    return orderDir;
  }

  public void setOrderDir(String orderDir) {
    this.orderDir = orderDir;
  }

  public String getRoleName() {
    return roleName;
  }

  public void setRoleName(String roleName) {
    this.roleName = roleName;
  }

  public String getRoleId() {
    return roleId;
  }

  public void setRoleId(String roleId) {
    this.roleId = roleId;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getApiNamesJson() {
    return apiNamesJson;
  }

  public void setApiNamesJson(String apiNamesJson) {
    this.apiNamesJson = apiNamesJson;
  }

  public String getIdsJson() {
    return idsJson;
  }

  public void setIdsJson(String idsJson) {
    this.idsJson = idsJson;
  }

  public String getRoleIdsJson() {
    return roleIdsJson;
  }

  public void setRoleIdsJson(String roleIdsJson) {
    this.roleIdsJson = roleIdsJson;
  }

  public String getResourcesJson() {
    return resourcesJson;
  }

  public void setResourcesJson(String resourcesJson) {
    this.resourcesJson = resourcesJson;
  }

  public String getTargetAccountId() {
    return targetAccountId;
  }

  public void setTargetAccountId(String targetAccountId) {
    this.targetAccountId = targetAccountId;
  }
}
