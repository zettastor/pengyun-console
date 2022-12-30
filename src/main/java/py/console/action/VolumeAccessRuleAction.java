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

import static py.console.utils.ErrorCode2.ERROR_0000_SUCCESS;
import static py.console.utils.ErrorCode2.ERROR_0019_SessionOut;
import static py.console.utils.ErrorCode2.ERROR_0058_AccessRuleNotApplied;
import static py.console.utils.ErrorCode2.ERROR_PermissionNotGrantException;

import com.opensymphony.xwork2.ActionContext;
import com.opensymphony.xwork2.ActionSupport;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import net.sf.json.JSONArray;
import org.apache.commons.lang.StringUtils;
import org.apache.struts2.ServletActionContext;
import org.apache.thrift.TException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import py.common.RequestIdBuilder;
import py.console.bean.Account;
import py.console.bean.ResultMessage;
import py.console.bean.SimpleDriverMetadata;
import py.console.bean.SimpleIscsiAccessRule;
import py.console.bean.SimpleVolume2AccessRuleRelationship;
import py.console.bean.SimpleVolumeAccessRule;
import py.console.bean.SimpleVolumeMetadata;
import py.console.service.access.rule.VolumeAccessRuleOperationResult;
import py.console.service.access.rule.VolumeAccessRuleService;
import py.console.service.account.AccountSessionService;
import py.console.utils.Constants;
import py.console.utils.ErrorCode2;
import py.exception.EndPointNotFoundException;
import py.exception.GenericThriftClientFactoryException;
import py.exception.TooManyEndPointFoundException;
import py.thrift.infocenter.service.FailedToTellDriverAboutAccessRulesExceptionThrift;
import py.thrift.share.AccessDeniedExceptionThrift;
import py.thrift.share.AccessRuleNotAppliedThrift;
import py.thrift.share.AccessRuleNotFoundThrift;
import py.thrift.share.AccessRuleUnderOperationThrift;
import py.thrift.share.AccountNotFoundExceptionThrift;
import py.thrift.share.ApplyFailedDueToConflictExceptionThrift;
import py.thrift.share.ApplyFailedDueToVolumeIsReadOnlyExceptionThrift;
import py.thrift.share.ChapSameUserPasswdErrorThrift;
import py.thrift.share.EndPointNotFoundExceptionThrift;
import py.thrift.share.InvalidInputExceptionThrift;
import py.thrift.share.IscsiAccessRuleDuplicateThrift;
import py.thrift.share.IscsiAccessRuleFormatErrorThrift;
import py.thrift.share.IscsiAccessRuleNotFoundThrift;
import py.thrift.share.IscsiAccessRuleUnderOperationThrift;
import py.thrift.share.IscsiBeingDeletedExceptionThrift;
import py.thrift.share.IscsiNotFoundExceptionThrift;
import py.thrift.share.NetworkErrorExceptionThrift;
import py.thrift.share.PermissionNotGrantExceptionThrift;
import py.thrift.share.ResourceNotExistsExceptionThrift;
import py.thrift.share.ServiceHavingBeenShutdownThrift;
import py.thrift.share.ServiceIsNotAvailableThrift;
import py.thrift.share.TooManyEndPointFoundExceptionThrift;
import py.thrift.share.VolumeAccessRuleDuplicateThrift;
import py.thrift.share.VolumeBeingDeletedExceptionThrift;
import py.thrift.share.VolumeNotFoundExceptionThrift;

/**
 * VolumeAccessRuleAction.
 */
@SuppressWarnings("serial")
public class VolumeAccessRuleAction extends ActionSupport {

  private static final Logger logger = LoggerFactory.getLogger(VolumeAccessRuleAction.class);

  private VolumeAccessRuleService volumeAccessRuleService;

  private AccountSessionService accountSessionService;

  private String ruleId;

  private String remoteHostName;

  private String readWritePermission;

  private String volumeId;

  private List<Long> ruleIdList;

  private List<SimpleVolumeAccessRule> ruleList;

  private String jsonSimpleVolumeAccessRuleList;

  private SimpleVolumeAccessRule simpleVolumeAccessRule;

  private List<SimpleVolumeAccessRule> simpleVolumeAccessRuleList;

  private List<SimpleVolume2AccessRuleRelationship> simpleVolume2AccessRuleRelationshipList;

  private String isConfirm;

  private VolumeAccessRuleOperationResult operationResult;

  private ResultMessage resultMessage;

  private String orderDir;

  private String initiatorName;

  private String user;

  private String passwd;

  private String outUser;

  private String outPasswd;

  private String permission;

  private String ruleNotes;

  private String iscsiRulesJson;

  private String idsJson;

  private String driverContainerId;

  private String snapshotId;

  private String driverType;

  private String driverKeysJson;

  /**
   * The name of this instance should never be changed -tyr.
   */
  private Map<String, Object> dataMap;

  public Map<String, Object> getDataMap() {
    return dataMap;
  }

  public void setDataMap(Map<String, Object> dataMap) {
    this.dataMap = dataMap;
  }

  public String getRuleId() {
    return ruleId;
  }

  public void setRuleId(String ruleId) {
    this.ruleId = ruleId;
  }

  public String getRemoteHostName() {
    return remoteHostName;
  }

  public void setRemoteHostName(String remoteHostName) {
    this.remoteHostName = remoteHostName;
  }

  public String getReadWritePermission() {
    return readWritePermission;
  }

  public void setReadWritePermission(String readWritePermission) {
    this.readWritePermission = readWritePermission;
  }

  public ResultMessage getResultMessage() {
    return resultMessage;
  }

  public void setResultMessage(ResultMessage resultMessage) {
    this.resultMessage = resultMessage;
  }

  public List<SimpleVolumeAccessRule> getSimpleVolumeAccessRuleList() {
    return simpleVolumeAccessRuleList;
  }

  public String getInitiatorName() {
    return initiatorName;
  }

  public void setInitiatorName(String initiatorName) {
    this.initiatorName = initiatorName;
  }

  public String getUser() {
    return user;
  }

  public void setUser(String user) {
    this.user = user;
  }

  public String getPasswd() {
    return passwd;
  }

  public void setPasswd(String passwd) {
    this.passwd = passwd;
  }

  public String getOutUser() {
    return outUser;
  }

  public void setOutUser(String outUser) {
    this.outUser = outUser;
  }

  public String getOutPasswd() {
    return outPasswd;
  }

  public void setOutPasswd(String outPasswd) {
    this.outPasswd = outPasswd;
  }

  public String getPermission() {
    return permission;
  }

  public void setPermission(String permission) {
    this.permission = permission;
  }

  public String getRuleNotes() {
    return ruleNotes;
  }

  public void setRuleNotes(String ruleNotes) {
    this.ruleNotes = ruleNotes;
  }

  public String getIscsiRulesJson() {
    return iscsiRulesJson;
  }

  public void setIscsiRulesJson(String iscsiRulesJson) {
    this.iscsiRulesJson = iscsiRulesJson;
  }

  public void setSimpleVolumeAccessRuleList(
      List<SimpleVolumeAccessRule> simpleVolumeAccessRuleList) {
    this.simpleVolumeAccessRuleList = simpleVolumeAccessRuleList;
  }

  public VolumeAccessRuleService getVolumeAccessRuleService() {
    return volumeAccessRuleService;
  }

  public void setVolumeAccessRuleService(VolumeAccessRuleService volumeAccessRuleService) {
    this.volumeAccessRuleService = volumeAccessRuleService;
  }

  public SimpleVolumeAccessRule getSimpleVolumeAccessRule() {
    return simpleVolumeAccessRule;
  }

  public void setSimpleVolumeAccessRule(SimpleVolumeAccessRule simpleVolumeAccessRule) {
    this.simpleVolumeAccessRule = simpleVolumeAccessRule;
  }

  public String getDriverContainerId() {
    return driverContainerId;
  }

  public void setDriverContainerId(String driverContainerId) {
    this.driverContainerId = driverContainerId;
  }

  public String getSnapshotId() {
    return snapshotId;
  }

  public void setSnapshotId(String snapshotId) {
    this.snapshotId = snapshotId;
  }

  public String getDriverType() {
    return driverType;
  }

  public void setDriverType(String driverType) {
    this.driverType = driverType;
  }

  public String getVolumeId() {
    return volumeId;
  }

  public void setVolumeId(String volumeId) {
    this.volumeId = volumeId;
  }

  public String getIdsJson() {
    return idsJson;
  }

  public void setIdsJson(String idsJson) {
    this.idsJson = idsJson;
  }

  public String getDriverKeysJson() {
    return driverKeysJson;
  }

  public void setDriverKeysJson(String driverKeysJson) {
    this.driverKeysJson = driverKeysJson;
  }

  public String getJsonSimpleVolumeAccessRuleList() {
    return jsonSimpleVolumeAccessRuleList;
  }

  public void setJsonSimpleVolumeAccessRuleList(String jsonSimpleVolumeAccessRuleList) {
    this.jsonSimpleVolumeAccessRuleList = jsonSimpleVolumeAccessRuleList;
  }

  public List<SimpleVolume2AccessRuleRelationship> getSimpleVolume2AccessRuleRelationshipList() {
    return simpleVolume2AccessRuleRelationshipList;
  }

  public void setSimpleVolume2AccessRuleRelationshipList(
      List<SimpleVolume2AccessRuleRelationship> simpleVolume2AccessRuleRelationshipList) {
    this.simpleVolume2AccessRuleRelationshipList = simpleVolume2AccessRuleRelationshipList;
  }

  public VolumeAccessRuleOperationResult getOperationResult() {
    return operationResult;
  }

  public void setOperationResult(VolumeAccessRuleOperationResult operationResult) {
    this.operationResult = operationResult;
  }

  public List<Long> getRuleIdList() {
    return ruleIdList;
  }

  /**
   * set Rule Id List.
   *
   * @param ruleIdListJson String
   */
  public void setRuleIdList(String ruleIdListJson) {
    this.ruleIdList = new ArrayList<Long>();
    JSONArray jsonArray = JSONArray.fromObject(ruleIdListJson);
    @SuppressWarnings("unchecked") List<String> jsonList = (List<String>) JSONArray
        .toCollection(jsonArray, String.class);
    for (String jsonObject : jsonList) {
      this.ruleIdList.add(Long.valueOf(jsonObject));
    }
  }

  public List<SimpleVolumeAccessRule> getRuleList() {
    return ruleList;
  }

  /**
   * set Rule List.
   *
   * @param ruleJson String
   */
  public void setRuleList(String ruleJson) {
    this.ruleList = new ArrayList<>();
    JSONArray ruleJsonObject = JSONArray.fromObject(ruleJson);
    logger.warn("ruleJsonObject is {}", ruleJsonObject);
    for (int i = 0; i < ruleJsonObject.size(); i++) {
      SimpleVolumeAccessRule rule = new SimpleVolumeAccessRule();
      rule.setRuleId(ruleJsonObject.getJSONObject(i).getString("id"));
      rule.setRemoteHostName(ruleJsonObject.getJSONObject(i).getString("host"));
      rule.setPermission(ruleJsonObject.getJSONObject(i).getString("permission"));
      ruleList.add(rule);
    }
    logger.debug("rulelist is {}", ruleList);
  }

  public String getIsConfirm() {
    return isConfirm;
  }

  public void setIsConfirm(String isConfirm) {
    this.isConfirm = isConfirm;
  }

  public AccountSessionService getAccountSessionService() {
    return accountSessionService;
  }

  public void setAccountSessionService(AccountSessionService accountSessionService) {
    this.accountSessionService = accountSessionService;
  }

  /**
   * VolumeAccessRuleAction.
   */
  public VolumeAccessRuleAction() {
    super();
    this.dataMap = new HashMap<String, Object>();
    resultMessage = new ResultMessage();
  }

  /**
   * list Volume Access Rules DT.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listVolumeAccessRulesDt() {
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
    String[] cols = {"null", "ruleId", "remoteHostName", "permission", "status"};
    // 获取客户端需要那一列排序
    String orderColumn = "0";
    orderColumn = request.getParameter("order[0][column]");
    orderColumn = cols[Integer.parseInt(orderColumn)];
    // 获取排序方式 默认为asc
    orderDir = "asc";
    orderDir = request.getParameter("order[0][dir]");

    // 获取用户过滤框里的字符
    String searchValue = request.getParameter("search[value]");

    Account account = accountSessionService.getAccount();
    if (account == null) {
      dataMap.put("recordsTotal", "0");
      dataMap.put("recordsFiltered", "0");
      dataMap.put("draw", draw);
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    simpleVolumeAccessRuleList = new ArrayList<SimpleVolumeAccessRule>();

    try {
      simpleVolumeAccessRuleList = volumeAccessRuleService
          .listVolumeAccessRules(Long.valueOf(account.getAccountId()));
      recordsTotal = String.valueOf(simpleVolumeAccessRuleList.size());

      // search
      List<SimpleVolumeAccessRule> ruleTmpList = new ArrayList<>();
      if (!searchValue.equals("")) {
        for (SimpleVolumeAccessRule rule : simpleVolumeAccessRuleList) {
          if (rule.getRemoteHostName().toLowerCase().contains(searchValue.toLowerCase())) {
            ruleTmpList.add(rule);
          }
        }
      } else {
        ruleTmpList.addAll(simpleVolumeAccessRuleList);
      }
      recordsFiltered = String.valueOf(ruleTmpList.size());
      // sort
      switch (orderColumn) {
        case "remoteHostName":
          Collections.sort(ruleTmpList, new SortByHostName());
          break;
        case "permission":
          Collections.sort(ruleTmpList, new SortByPermission());
          break;
        case "status":
          Collections.sort(ruleTmpList, new SortByStatus());
          break;
        default:
          Collections.sort(ruleTmpList, new SortByHostName());
      }
      // pagination
      simpleVolumeAccessRuleList.clear();
      int size = Integer.parseInt(start) + Integer.parseInt(length);
      if (size > ruleTmpList.size()) {
        size = ruleTmpList.size();
      }
      for (int i = Integer.parseInt(start); i < size; i++) {
        simpleVolumeAccessRuleList.add(ruleTmpList.get(i));
      }
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (TException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("data", simpleVolumeAccessRuleList);
    dataMap.put("recordsTotal", recordsTotal);
    dataMap.put("recordsFiltered", recordsFiltered);
    dataMap.put("resultMessage", resultMessage);
    dataMap.put("draw", draw);

    return Constants.ACTION_RETURN_STRING;
  }

  class SortByHostName implements Comparator<SimpleVolumeAccessRule> {

    public int compare(SimpleVolumeAccessRule s1, SimpleVolumeAccessRule s2) {
      if (s1.getRemoteHostName().equals(s2.getRemoteHostName())) {
        return 0;
      }
      if (s1.getRemoteHostName().compareToIgnoreCase(s2.getRemoteHostName()) > 0) {
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

  class SortByPermission implements Comparator<SimpleVolumeAccessRule> {

    public int compare(SimpleVolumeAccessRule s1, SimpleVolumeAccessRule s2) {
      if (s1.getPermission().equals(s2.getPermission())) {
        return 0;
      }
      if (s1.getPermission().compareToIgnoreCase(s2.getPermission()) > 0) {
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

  class SortByStatus implements Comparator<SimpleVolumeAccessRule> {

    public int compare(SimpleVolumeAccessRule s1, SimpleVolumeAccessRule s2) {
      if (s1.getStatus().equals(s2.getStatus())) {
        return 0;
      }
      if (s1.getStatus().compareToIgnoreCase(s2.getStatus()) > 0) {
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

  /**
   * list Volume Access Rules.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listVolumeAccessRules() {
    Account account = accountSessionService.getAccount();

    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    simpleVolumeAccessRuleList = new ArrayList<SimpleVolumeAccessRule>();

    try {
      simpleVolumeAccessRuleList = volumeAccessRuleService
          .listVolumeAccessRules(Long.valueOf(account.getAccountId()));
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (TException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }

    int i = 0;
    while (i < simpleVolumeAccessRuleList.size()) {
      SimpleVolumeAccessRule simpleVolumeAccessRule = simpleVolumeAccessRuleList.get(i);
      if (remoteHostName != null && !remoteHostName.equals("") && !simpleVolumeAccessRule
          .getRemoteHostName()
          .contains(remoteHostName)) {
        simpleVolumeAccessRuleList.remove(i);
        continue;
      }
      i++;
    }
    dataMap.put("resultMessage", resultMessage);
    dataMap.put("simpleVolumeAccessRuleList", simpleVolumeAccessRuleList);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * create Volume Access Rule.
   *
   * @return ACTION_RETURN_STRING
   */
  public String createVolumeAccessRule() {
    Account account = accountSessionService.getAccount();

    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }

    simpleVolumeAccessRule = new SimpleVolumeAccessRule();
    simpleVolumeAccessRule.setRuleId("" + RequestIdBuilder.get());
    simpleVolumeAccessRule.setRemoteHostName(remoteHostName);
    simpleVolumeAccessRule.setPermission(readWritePermission);
    simpleVolumeAccessRuleList = new ArrayList<SimpleVolumeAccessRule>();
    simpleVolumeAccessRuleList.add(simpleVolumeAccessRule);

    try {
      volumeAccessRuleService
          .createVolumeAccessRules(simpleVolumeAccessRuleList,
              Long.valueOf(account.getAccountId()));
      simpleVolumeAccessRule.setMessage(ERROR_0000_SUCCESS);
    } catch (VolumeAccessRuleDuplicateThrift e) {
      simpleVolumeAccessRule.setMessage("ERROR_VolumeAccessRuleDuplicateThrift");
      logger.error("exception catch: ", e);
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("exception catch: ", e);
      simpleVolumeAccessRule.setMessage(ERROR_PermissionNotGrantException);
    } catch (TooManyEndPointFoundExceptionThrift e) {
      simpleVolumeAccessRule.setMessage("ERROR_0049_TooManyEndPointFound");
      logger.error("exception catch: ", e);
    } catch (AccountNotFoundExceptionThrift e) {
      simpleVolumeAccessRule.setMessage("ERROR_0003_AccountNotExists");
      logger.error("exception catch: ", e);
    } catch (EndPointNotFoundExceptionThrift e) {
      simpleVolumeAccessRule.setMessage("ERROR_EndPointNotFound");
      logger.error("exception catch: ", e);
    } catch (ServiceIsNotAvailableThrift e) {
      simpleVolumeAccessRule.setMessage("ERROR_0065_ServiceIsNotAvailable");
      logger.error("exception catch: ", e);
    } catch (InvalidInputExceptionThrift e) {
      simpleVolumeAccessRule.setMessage("ERROR_0040_InvalidInput");
      logger.error("exception catch: ", e);
    } catch (NetworkErrorExceptionThrift e) {
      simpleVolumeAccessRule.setMessage("ERROR_NetworkErrorException");
      logger.error("exception catch: ", e);
    } catch (ServiceHavingBeenShutdownThrift e) {
      simpleVolumeAccessRule.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
      logger.error("exception catch: ", e);
    } catch (TException e) {
      simpleVolumeAccessRule.setMessage("ERROR_NetworkErrorException");
      logger.error("exception catch: ", e);
    }
    dataMap.put("resultMessage", resultMessage);
    dataMap.put("simpleVolumeAccessRule", simpleVolumeAccessRule);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * get Access Rule.
   *
   * @return ACTION_RETURN_STRING
   */
  public String getAccessRule() {
    Account account = accountSessionService.getAccount();

    if (account == null) {
      resultMessage.setMessage(ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<SimpleVolumeAccessRule> accessRuleList = new ArrayList<SimpleVolumeAccessRule>();
    try {
      accessRuleList = volumeAccessRuleService
          .getVolumeAccessRules(Long.parseLong(volumeId), Long.valueOf(account.getAccountId()));
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (Exception e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0010_InternalError");
    }

    dataMap.put("accessRuleList", accessRuleList);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * apply Volume Access Rules.
   *
   * @return ACTION_RETURN_STRING
   */
  public String applyVolumeAccessRules() {
    Account account = accountSessionService.getAccount();

    if (account == null) {
      resultMessage.setMessage(ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }

    List<SimpleVolumeAccessRule> allRules;
    try {
      allRules = volumeAccessRuleService
          .listVolumeAccessRules(Long.valueOf(account.getAccountId()));
    } catch (Exception e) {
      logger.error("exception catch: ", e);
      return ERROR;
    }

    simpleVolumeAccessRuleList = new ArrayList<SimpleVolumeAccessRule>();
    try {
      simpleVolumeAccessRuleList = volumeAccessRuleService
          .getVolumeAccessRules(Long.parseLong(volumeId), Long.valueOf(account.getAccountId()));
    } catch (Exception e) {
      logger.error("exception catch: ", e);
      return ERROR;
    }
    int allWriteAccessCount = 0;
    // first count how many write access rule had been applied
    for (SimpleVolumeAccessRule simpleVolumeAccessRule : simpleVolumeAccessRuleList) {
      if (simpleVolumeAccessRule.getPermission().equals(Constants.READ_WRITE)) {
        allWriteAccessCount++;
      }
    }
    logger.debug("volume:{} has applied these rules :{}", volumeId, simpleVolumeAccessRuleList);
    List<Long> canApplyRuleList = new ArrayList<>();
    for (Long applyingRuleId : ruleIdList) {
      SimpleVolumeAccessRule applyingRule = null;
      // try to find rule which is related to applyingRuleId
      for (SimpleVolumeAccessRule simpleVolumeAccessRule : allRules) {
        if (applyingRuleId.equals(Long.parseLong(simpleVolumeAccessRule.getRuleId()))) {
          applyingRule = simpleVolumeAccessRule;
          break;
        }
      }
      // if rule not found in rule store
      if (applyingRule == null) {
        // TODO: throw an exception to warn user?
        logger.warn("can not find this rule by rule id:{}", applyingRuleId);
        continue;
      }
      logger.debug("applyingRule is {}", applyingRule);
      // if this applying rule has already applied
      if (simpleVolumeAccessRuleList.contains(applyingRule)) {
        continue;
      }

      if (applyingRule.getPermission() == Constants.READ_WRITE) {
        logger.debug("allWriteAccessCount is {}", allWriteAccessCount);
        allWriteAccessCount++;
        canApplyRuleList.add(applyingRuleId);
      } else {
        canApplyRuleList.add(applyingRuleId);
      }

      // if (allWriteAccessCount > 2) {
      //   resultMessage.setMessage(ErrorCode2.ERROR_0047_TooManyReadWritePermissions);
      //   dataMap.put("resultMessage", resultMessage);
      //   return Constants.ACTION_RETURN_STRING;
      // }
    }

    try {
      operationResult = volumeAccessRuleService
          .applyVolumeAccessRules(Long.parseLong(volumeId), canApplyRuleList,
              Long.valueOf(account.getAccountId()));
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (NumberFormatException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    } catch (VolumeNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0011_VolumeNotFound");
    } catch (VolumeBeingDeletedExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0005_VolumeBeenDeleted");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (FailedToTellDriverAboutAccessRulesExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0012_VolumeNotAvailable");
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (ApplyFailedDueToVolumeIsReadOnlyExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_ApplyFailedDueToVolumeIsReadOnly");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (AccessDeniedExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_AccessDeniedException");
    } catch (InvalidInputExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resultMessage", resultMessage);
    dataMap.put("operationResult", operationResult);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * cancle Volume Access Rules.
   *
   * @return ACTION_RETURN_STRING
   */
  public String cancleVolumeAccessRules() {
    resultMessage = new ResultMessage();
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    try {
      operationResult = volumeAccessRuleService
          .cancelVolumeAccessRules(Long.parseLong(volumeId), ruleIdList,
              Long.valueOf(account.getAccountId()));
      resultMessage.setMessage(ERROR_0000_SUCCESS);
    } catch (AccessRuleNotAppliedThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ERROR_0058_AccessRuleNotApplied);
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (VolumeNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0011_VolumeNotFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (AccessDeniedExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_AccessDeniedException");
    } catch (FailedToTellDriverAboutAccessRulesExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_FailedToTellDriverAboutAccessRules");
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (InvalidInputExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    } catch (TException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }

    dataMap.put("resultMessage", resultMessage);
    dataMap.put("operationResult", operationResult);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * query Volume Access Rules.
   *
   * @return ACTION_RETURN_STRING
   */
  public String queryVolumeAccessRules() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    simpleVolumeAccessRuleList = new ArrayList<SimpleVolumeAccessRule>();
    try {
      simpleVolumeAccessRuleList = volumeAccessRuleService
          .getVolumeAccessRules(Long.parseLong(volumeId), Long.valueOf(account.getAccountId()));
    } catch (Exception e) {
      return ERROR;
    }
    dataMap.put("resultMessage", resultMessage);
    dataMap.put("simpleVolumeAccessRuleList", simpleVolumeAccessRuleList);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * list Volume2 Access Rules Relationship.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listVolume2AccessRulesRelationship() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    simpleVolume2AccessRuleRelationshipList = new ArrayList<SimpleVolume2AccessRuleRelationship>();

    if (volumeId == null) {
      dataMap
          .put("simpleVolume2AccessRuleRelationshipList", simpleVolume2AccessRuleRelationshipList);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }

    simpleVolumeAccessRuleList = new ArrayList<SimpleVolumeAccessRule>();
    try {
      simpleVolumeAccessRuleList = volumeAccessRuleService
          .listVolumeAccessRules(Long.valueOf(account.getAccountId()));
    } catch (Exception e) {
      return ERROR;
    }

    List<SimpleVolumeAccessRule> appliedSimpleVolumeAccessRuleList =
        new ArrayList<SimpleVolumeAccessRule>();
    try {
      appliedSimpleVolumeAccessRuleList = volumeAccessRuleService
          .getVolumeAccessRules(Long.parseLong(volumeId), Long.valueOf(account.getAccountId()));
    } catch (Exception e) {
      return ERROR;
    }
    for (SimpleVolumeAccessRule simpleVolumeAccessRule : appliedSimpleVolumeAccessRuleList) {
      SimpleVolume2AccessRuleRelationship simpleVolume2AccessRuleRelationship =
          new SimpleVolume2AccessRuleRelationship();
      simpleVolume2AccessRuleRelationship.setVolumeId(volumeId);
      simpleVolume2AccessRuleRelationship.setSimpleVolumeAccessRule(simpleVolumeAccessRule);
      simpleVolume2AccessRuleRelationship.setIsApplied(true);
      simpleVolume2AccessRuleRelationshipList.add(simpleVolume2AccessRuleRelationship);
    }

    List<SimpleVolumeAccessRule> notAppliedSimpleVolumeAccessRuleList =
        new ArrayList<SimpleVolumeAccessRule>();
    for (SimpleVolumeAccessRule simpleVolumeAccessRule : simpleVolumeAccessRuleList) {
      boolean isApplied = false;
      for (SimpleVolumeAccessRule appliedSimpleVolumeAccessRule :
          appliedSimpleVolumeAccessRuleList) {
        if (simpleVolumeAccessRule.getRuleId().equals(appliedSimpleVolumeAccessRule.getRuleId())) {
          isApplied = true;
          break;
        }
      }
      if (!isApplied) {
        notAppliedSimpleVolumeAccessRuleList.add(simpleVolumeAccessRule);
      }
    }

    for (SimpleVolumeAccessRule simpleVolumeAccessRule : notAppliedSimpleVolumeAccessRuleList) {
      SimpleVolume2AccessRuleRelationship simpleVolume2AccessRuleRelationship =
          new SimpleVolume2AccessRuleRelationship();
      simpleVolume2AccessRuleRelationship.setVolumeId(volumeId);
      simpleVolume2AccessRuleRelationship.setSimpleVolumeAccessRule(simpleVolumeAccessRule);
      simpleVolume2AccessRuleRelationship.setIsApplied(false);
      simpleVolume2AccessRuleRelationshipList.add(simpleVolume2AccessRuleRelationship);
    }

    int i = 0;
    while (i < simpleVolume2AccessRuleRelationshipList.size()) {
      SimpleVolume2AccessRuleRelationship simpleVolume2AccessRuleRelationship =
          simpleVolume2AccessRuleRelationshipList
          .get(i);
      if (remoteHostName != null && !remoteHostName.equals("") && !remoteHostName
          .equals(simpleVolume2AccessRuleRelationship.getSimpleVolumeAccessRule()
              .getRemoteHostName())) {
        simpleVolume2AccessRuleRelationshipList.remove(i);
        continue;
      }
      i++;
    }

    dataMap.put("simpleVolume2AccessRuleRelationshipList", simpleVolume2AccessRuleRelationshipList);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * delete Volume Access Rules.
   *
   * @return ACTION_RETURN_STRING
   */
  public String deleteVolumeAccessRules() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    logger.debug("is confirm {}", isConfirm);
    try {
      operationResult = volumeAccessRuleService
          .deleteVolumeAccessRules(Long.parseLong(account.getAccountId()), ruleList,
              Boolean.valueOf(isConfirm));
      operationResult.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (FailedToTellDriverAboutAccessRulesExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_FailedToTellDriverAboutAccessRules");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }

    dataMap.put("operationResult", operationResult);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * list Iscsi Access Rules DT.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listIscsiAccessRulesDt() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      dataMap.put("recordsTotal", "0");
      dataMap.put("recordsFiltered", "0");
      dataMap.put("draw", "0");
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    ActionContext cxt = ActionContext.getContext();
    HttpServletRequest request = (HttpServletRequest) cxt.get(ServletActionContext.HTTP_REQUEST);
    // 获取请求次数
    String draw = "0";
    // 总记录数
    String recordsTotal = "0";

    // 过滤后记录数
    String recordsFiltered = "0";
    // 定义列名
    String[] cols = {"null", "ruleId", "ruleNotes", "initiatorName", "permission", "user",
        "outUser", "status"};
    // 获取客户端需要那一列排序
    String orderColumn = "0";

    List<SimpleIscsiAccessRule> simpleIscsiAccessRules = new ArrayList<>();

    try {
      simpleIscsiAccessRules = volumeAccessRuleService
          .listIscsiAccessRules(Long.valueOf(account.getAccountId()));

      //            simpleVolumeAccessRuleList = volumeAccessRuleService
      //                    .listVolumeAccessRules(Long.valueOf(account.getAccountId()));
      recordsTotal = String.valueOf(simpleIscsiAccessRules.size());

      if (request != null) {

        draw = request.getParameter("draw");

        orderColumn = request.getParameter("order[0][column]");
        orderColumn = cols[Integer.parseInt(orderColumn)];
        // 获取排序方式 默认为asc
        orderDir = "asc";
        orderDir = request.getParameter("order[0][dir]");

        // 获取用户过滤框里的字符
        String searchValue = request.getParameter("search[value]");
        // search
        List<SimpleIscsiAccessRule> ruleTmpList = new ArrayList<>();
        if (!searchValue.equals("")) {
          for (SimpleIscsiAccessRule rule : simpleIscsiAccessRules) {
            if (rule.getInitiatorName().toLowerCase().contains(searchValue.toLowerCase())
                || rule.getRuleNotes().toLowerCase().contains(searchValue.toLowerCase())) {
              ruleTmpList.add(rule);
            }
          }
        } else {
          ruleTmpList.addAll(simpleIscsiAccessRules);
        }
        recordsFiltered = String.valueOf(ruleTmpList.size());
        // sort
        switch (orderColumn) {
          case "initiatorName":
            Collections.sort(ruleTmpList, new SortByInitiatorNameIscsi());
            break;
          case "permission":
            Collections.sort(ruleTmpList, new SortByPermissionIscsi());
            break;
          case "status":
            Collections.sort(ruleTmpList, new SortByStatusIscsi());
            break;
          case "user":
            Collections.sort(ruleTmpList, new SortByUserIscsi());
            break;
          case "outUser":
            Collections.sort(ruleTmpList, new SortByOutUserIscsi());
            break;
          case "ruleNotes":
            Collections.sort(ruleTmpList, new SortByRuleNotesIscsi());
            break;
          default:
            Collections.sort(ruleTmpList, new SortByInitiatorNameIscsi());
        }
        // pagination
        simpleIscsiAccessRules.clear();
        // 数据起始位置
        String start = request.getParameter("start");
        // 数据长度
        String length = request.getParameter("length");
        int size = Integer.parseInt(start) + Integer.parseInt(length);
        if (size > ruleTmpList.size()) {
          size = ruleTmpList.size();
        }
        for (int i = Integer.parseInt(start); i < size; i++) {
          simpleIscsiAccessRules.add(ruleTmpList.get(i));
        }
      }

      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (TException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("data", simpleIscsiAccessRules);
    dataMap.put("recordsTotal", recordsTotal);
    dataMap.put("recordsFiltered", recordsFiltered);
    dataMap.put("resultMessage", resultMessage);
    dataMap.put("draw", draw);

    return Constants.ACTION_RETURN_STRING;
  }

  class SortByStatusIscsi implements Comparator<SimpleIscsiAccessRule> {

    public int compare(SimpleIscsiAccessRule s1, SimpleIscsiAccessRule s2) {
      if (s1.getStatus().equals(s2.getStatus())) {
        return 0;
      }
      if (s1.getStatus().compareToIgnoreCase(s2.getStatus()) > 0) {
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

  class SortByInitiatorNameIscsi implements Comparator<SimpleIscsiAccessRule> {

    public int compare(SimpleIscsiAccessRule s1, SimpleIscsiAccessRule s2) {
      if (s1.getInitiatorName().equals(s2.getInitiatorName())) {
        return 0;
      }
      if (s1.getInitiatorName().compareToIgnoreCase(s2.getInitiatorName()) > 0) {
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

  class SortByUserIscsi implements Comparator<SimpleIscsiAccessRule> {

    public int compare(SimpleIscsiAccessRule s1, SimpleIscsiAccessRule s2) {
      if (s1.getUser().equals(s2.getUser())) {
        return 0;
      }
      if (s1.getUser().compareToIgnoreCase(s2.getUser()) > 0) {
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

  class SortByOutUserIscsi implements Comparator<SimpleIscsiAccessRule> {

    public int compare(SimpleIscsiAccessRule s1, SimpleIscsiAccessRule s2) {
      if (s1.getOutUser().equals(s2.getOutUser())) {
        return 0;
      }
      if (s1.getOutUser().compareToIgnoreCase(s2.getOutUser()) > 0) {
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

  class SortByRuleNotesIscsi implements Comparator<SimpleIscsiAccessRule> {

    public int compare(SimpleIscsiAccessRule s1, SimpleIscsiAccessRule s2) {
      if (s1.getRuleNotes().equals(s2.getRuleNotes())) {
        return 0;
      }
      if (s1.getRuleNotes().compareToIgnoreCase(s2.getRuleNotes()) > 0) {
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

  class SortByPermissionIscsi implements Comparator<SimpleIscsiAccessRule> {

    public int compare(SimpleIscsiAccessRule s1, SimpleIscsiAccessRule s2) {
      if (s1.getPermission().equals(s2.getPermission())) {
        return 0;
      }
      if (s1.getPermission().compareToIgnoreCase(s2.getPermission()) > 0) {
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

  /**
   * create Iscsi Access Rules.
   *
   * @return ACTION_RETURN_STRING
   */
  public String createIscsiAccessRules() {
    Account account = accountSessionService.getAccount();

    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }

    SimpleIscsiAccessRule rule = new SimpleIscsiAccessRule();
    rule.setRuleId(String.valueOf(RequestIdBuilder.get()));
    rule.setRuleNotes(ruleNotes);
    rule.setInitiatorName(initiatorName);
    rule.setPermission(permission);
    rule.setUser(user);
    rule.setPasswd(passwd);
    rule.setOutUser(outUser);
    rule.setOutPasswd(outPasswd);
    List<SimpleIscsiAccessRule> ruleList = new ArrayList<>();
    ruleList.add(rule);
    try {
      volumeAccessRuleService
          .createIscsiAccessRules(Long.valueOf(account.getAccountId()), ruleList);
      resultMessage.setMessage(ERROR_0000_SUCCESS);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (IscsiAccessRuleFormatErrorThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_IscsiAccessRuleFormatError");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_PermissionNotGrantException");
    } catch (IscsiAccessRuleDuplicateThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_IscsiAccessRuleDuplicate");
    } catch (InvalidInputExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (ChapSameUserPasswdErrorThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_ChapSameUserPasswdError");
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_ChapSameUserPasswdError");
    } catch (TException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }

    dataMap.put("resultMessage", resultMessage);
    dataMap.put("rule", rule);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * delete Iscsi Access Rules.
   *
   * @return ACTION_RETURN_STRING
   */
  public String deleteIscsiAccessRules() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    Map<String, Object> response = new HashMap<>();
    logger.debug("is confirm {}", isConfirm);
    logger.debug("iscsiRulesJson is {}", iscsiRulesJson);
    List<SimpleIscsiAccessRule> rulesList = new ArrayList<>();
    JSONArray ruleJsonObjectArray = JSONArray.fromObject(iscsiRulesJson);
    logger.debug("ruleJsonObjectArray is {}", ruleJsonObjectArray);
    for (int i = 0; i < ruleJsonObjectArray.size(); i++) {
      SimpleIscsiAccessRule rule = new SimpleIscsiAccessRule();
      rule.setRuleId(ruleJsonObjectArray.getJSONObject(i).getString("id"));
      rule.setRuleNotes(ruleJsonObjectArray.getJSONObject(i).getString("ruleNotes"));
      rule.setInitiatorName(ruleJsonObjectArray.getJSONObject(i).getString("initiatorName"));
      rule.setUser(ruleJsonObjectArray.getJSONObject(i).getString("user"));
      rule.setOutUser(ruleJsonObjectArray.getJSONObject(i).getString("outUser"));
      rule.setPermission(ruleJsonObjectArray.getJSONObject(i).getString("permission"));
      rulesList.add(rule);
    }

    try {
      response = volumeAccessRuleService
          .deleteIscsiAccessRules(Long.valueOf(account.getAccountId()), rulesList,
              Boolean.valueOf(isConfirm));

      if (response.get("beAppliedRule2Drivers") != null) {
        Map<SimpleIscsiAccessRule, Object> beAppliedRule2Drivers = new HashMap<>();
        beAppliedRule2Drivers = (Map<SimpleIscsiAccessRule, Object>) response
            .get("beAppliedRule2Drivers");
        if (beAppliedRule2Drivers.size() > 0) {
          dataMap.put("beAppliedRule2Drivers", beAppliedRule2Drivers);
        }
      }
      if (response.get("iscsiAccessRulesHasAction") != null) {
        List<SimpleIscsiAccessRule> iscsiAccessRulesHasAction = new ArrayList<>();
        iscsiAccessRulesHasAction = (List<SimpleIscsiAccessRule>) response
            .get("iscsiAccessRulesHasAction");
        if (iscsiAccessRulesHasAction.size() > 0) {
          dataMap.put("iscsiAccessRulesHasAction", iscsiAccessRulesHasAction);
        }
      }
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (EndPointNotFoundException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TooManyEndPointFoundException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (GenericThriftClientFactoryException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_GenericThriftClientFactory");
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (FailedToTellDriverAboutAccessRulesExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_FailedToTellDriverAboutAccessRules");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_PermissionNotGrantException");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (Exception e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;

  }

  /**
   * cancel Iscsi Access Rules.
   *
   * @return ACTION_RETURN_STRING
   */
  public String cancelIscsiAccessRules() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }

    List<Long> idsList = new ArrayList<>();
    if (idsJson != null && !idsJson.equals("")) {
      logger.debug("idsJson is {}", idsJson);
      JSONArray idsJsonArray = JSONArray.fromObject(idsJson);
      idsList = (List<Long>) JSONArray.toList(idsJsonArray, Long.class);
      logger.debug("idsList is {}", idsList);
    }

    SimpleDriverMetadata driverMetadata = new SimpleDriverMetadata();
    driverMetadata.setVolumeId(volumeId);
    driverMetadata.setSnapshotId(snapshotId);
    driverMetadata.setDriverContainerId(driverContainerId);
    driverMetadata.setDriverType(driverType);

    Map<String, Object> response = new HashMap<>();
    try {
      response = volumeAccessRuleService
          .cancelIscsiAccessRules(Long.valueOf(account.getAccountId()), idsList, driverMetadata);
      if (response.get("iscsiAccessRulesHasAction") != null) {
        List<SimpleIscsiAccessRule> iscsiAccessRulesHasAction = new ArrayList<>();
        iscsiAccessRulesHasAction = (List<SimpleIscsiAccessRule>) response
            .get("iscsiAccessRulesHasAction");
        if (iscsiAccessRulesHasAction.size() > 0) {
          dataMap.put("iscsiAccessRulesHasAction", iscsiAccessRulesHasAction);
        }
      }
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (AccessRuleNotAppliedThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0058_AccessRuleNotApplied");
    } catch (FailedToTellDriverAboutAccessRulesExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_FailedToTellDriverAboutAccessRules");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_PermissionNotGrantException");
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (AccessDeniedExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0050_AccessDenied");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * apply Iscsi Access Rules.
   *
   * @return ACTION_RETURN_STRING
   */
  public String applyIscsiAccessRules() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }

    List<Long> idsList = new ArrayList<>();
    if (idsJson != null && !idsJson.equals("")) {
      logger.debug("idsJson is {}", idsJson);
      JSONArray idsJsonArray = JSONArray.fromObject(idsJson);
      idsList = (List<Long>) JSONArray.toList(idsJsonArray, Long.class);
      logger.debug("idsList is {}", idsList);
    }
    SimpleDriverMetadata driverMetadata = new SimpleDriverMetadata();
    driverMetadata.setVolumeId(volumeId);
    driverMetadata.setSnapshotId(snapshotId);
    driverMetadata.setDriverContainerId(driverContainerId);
    driverMetadata.setDriverType(driverType);
    try {
      volumeAccessRuleService
          .applyIscsiAccessRules(Long.valueOf(account.getAccountId()), idsList, driverMetadata);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (AccessRuleNotAppliedThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0058_AccessRuleNotApplied");
    } catch (FailedToTellDriverAboutAccessRulesExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_FailedToTellDriverAboutAccessRules");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_PermissionNotGrantException");
    } catch (IscsiBeingDeletedExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_IscsiBeingDeletedException");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (ApplyFailedDueToConflictExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_ApplyFailedDueToVolumeIsReadOnly");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (AccessDeniedExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_AccessDeniedException");
    } catch (IscsiNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_PermissionNotGrantException");
    } catch (TException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * list All Iscsi Access Rules On Driver.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listAllIscsiAccessRulesOnDriver() {

    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<SimpleIscsiAccessRule> simpleIscsiAccessRulesList = new ArrayList<>();
    List<SimpleIscsiAccessRule> appliedIscsiAccessRulesList = new ArrayList<>();
    SimpleDriverMetadata driverMetadata = new SimpleDriverMetadata();
    driverMetadata.setVolumeId(volumeId);
    driverMetadata.setSnapshotId(snapshotId);
    driverMetadata.setDriverContainerId(driverContainerId);
    driverMetadata.setDriverType(driverType);

    try {
      simpleIscsiAccessRulesList = volumeAccessRuleService
          .listIscsiAccessRules(Long.valueOf(account.getAccountId()));
      appliedIscsiAccessRulesList = volumeAccessRuleService
          .getIscsiAccessRulesAppliedOnOneDriver(Long.valueOf(account.getAccountId()),
              driverMetadata);
      for (SimpleIscsiAccessRule rule : simpleIscsiAccessRulesList) {
        for (SimpleIscsiAccessRule appliedRule : appliedIscsiAccessRulesList) {
          if (rule.getRuleId().equals(appliedRule.getRuleId())) {
            rule.setApplied(true);
          }
        }
      }
      dataMap.put("simpleIscsiAccessRulesList", simpleIscsiAccessRulesList);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
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
   * get Applied Volumes.
   *
   * @return ACTION_RETURN_STRING
   */
  public String getAppliedVolumes() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<SimpleVolumeMetadata> appliedVolume = new ArrayList<>();
    if (!StringUtils.isEmpty(ruleId)) {
      try {
        appliedVolume = volumeAccessRuleService
            .getAppliedVolumes(Long.valueOf(account.getAccountId()), Long.valueOf(ruleId));
        dataMap.put("appliedVolume", appliedVolume);
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      } catch (ServiceIsNotAvailableThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
      } catch (ServiceHavingBeenShutdownThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
      } catch (EndPointNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_EndPointNotFound");
      } catch (TooManyEndPointFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
      } catch (NetworkErrorExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_NetworkErrorException");
      } catch (PermissionNotGrantExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_PermissionNotGrantException");
      } catch (TException e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_NetworkErrorException");
      }
    } else {
      logger.error("Invalid input ");
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    }

    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * get Unapplied Volumes.
   *
   * @return ACTION_RETURN_STRING
   */
  public String getUnappliedVolumes() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<SimpleVolumeMetadata> unappliedVolume = new ArrayList<>();
    if (!StringUtils.isEmpty(ruleId)) {
      try {
        unappliedVolume = volumeAccessRuleService
            .getUnappliedVolumes(Long.valueOf(account.getAccountId()), Long.valueOf(ruleId));
        dataMap.put("unappliedVolume", unappliedVolume);
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      } catch (ServiceIsNotAvailableThrift e) {
        logger.error("exception catch", e);
        resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
      } catch (VolumeNotFoundExceptionThrift e) {
        logger.error("exception catch", e);
        resultMessage.setMessage("ERROR_0011_VolumeNotFound");
      } catch (NetworkErrorExceptionThrift e) {
        logger.error("exception catch", e);
        resultMessage.setMessage("ERROR_NetworkErrorException");
      } catch (AccessDeniedExceptionThrift e) {
        logger.error("exception catch", e);
        resultMessage.setMessage("ERROR_0050_AccessDenied");
      } catch (TooManyEndPointFoundExceptionThrift e) {
        logger.error("exception catch", e);
        resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
      } catch (ServiceHavingBeenShutdownThrift e) {
        logger.error("exception catch", e);
        resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
      } catch (EndPointNotFoundExceptionThrift e) {
        logger.error("exception catch", e);
        resultMessage.setMessage("ERROR_EndPointNotFound");
      } catch (ResourceNotExistsExceptionThrift e) {
        logger.error("exception catch", e);
        resultMessage.setMessage("ERROR_ResourceNotExistsException");
      } catch (InvalidInputExceptionThrift e) {
        logger.error("exception catch", e);
        resultMessage.setMessage("ERROR_0040_InvalidInput");
      } catch (AccountNotFoundExceptionThrift e) {
        logger.error("exception catch", e);
        resultMessage.setMessage("ERROR_0003_AccountNotExists");
      } catch (TException e) {
        logger.error("exception catch", e);
        resultMessage.setMessage("ERROR_NetworkErrorException");
      }
    } else {
      logger.error("Invalid input ");
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    }

    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * apply Volume Access Rule On Volumes.
   *
   * @return ACTION_RETURN_STRING
   */
  public String applyVolumeAccessRuleOnVolumes() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    if (!StringUtils.isEmpty(ruleId) && !StringUtils.isEmpty(idsJson)) {
      List<Long> volumeIdsList = new ArrayList<>();
      logger.debug("idsJson is {}", idsJson);
      JSONArray idsJsonArray = JSONArray.fromObject(idsJson);
      volumeIdsList = (List<Long>) JSONArray.toList(idsJsonArray, Long.class);
      logger.debug("volumeIdsList is {}", volumeIdsList);
      List<SimpleVolumeMetadata> errorList = new ArrayList<>();
      try {
        errorList = volumeAccessRuleService
            .applyVolumeAccessRuleOnVolumes(Long.valueOf(account.getAccountId()),
                Long.valueOf(ruleId),
                volumeIdsList);
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
        dataMap.put("errorList", errorList);
      } catch (ApplyFailedDueToVolumeIsReadOnlyExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_ApplyFailedDueToVolumeIsReadOnly");
      } catch (AccessRuleNotFoundThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_AccessRuleNotFound");
      } catch (VolumeBeingDeletedExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0005_VolumeBeenDeleted");
      } catch (VolumeNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0011_VolumeNotFound");
      } catch (ServiceIsNotAvailableThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
      } catch (AccessRuleUnderOperationThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_AccessRuleUnderOperation");
      } catch (ServiceHavingBeenShutdownThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
      } catch (PermissionNotGrantExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage(ERROR_PermissionNotGrantException);
      } catch (AccountNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0002_AccountExists");
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
    } else {
      logger.error("Invalid input ");
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * cancel Vol Access Rule All Applied.
   *
   * @return ACTION_RETURN_STRING
   */
  public String cancelVolAccessRuleAllApplied() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    if (!StringUtils.isEmpty(ruleId) && !StringUtils.isEmpty(idsJson)) {
      List<Long> volumeIdsList = new ArrayList<>();
      logger.debug("idsJson is {}", idsJson);
      JSONArray idsJsonArray = JSONArray.fromObject(idsJson);
      volumeIdsList = (List<Long>) JSONArray.toList(idsJsonArray, Long.class);
      logger.debug("volumeIdsList is {}", volumeIdsList);

      try {
        volumeAccessRuleService
            .cancelVolAccessRuleAllApplied(Long.valueOf(account.getAccountId()),
                Long.valueOf(ruleId),
                volumeIdsList);
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      } catch (AccessRuleNotAppliedThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0058_AccessRuleNotApplied");
      } catch (ServiceHavingBeenShutdownThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
      } catch (AccessRuleNotFoundThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_AccessRuleNotFound");
      } catch (AccessRuleUnderOperationThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_AccessRuleUnderOperation");
      } catch (ServiceIsNotAvailableThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
      } catch (PermissionNotGrantExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage(ERROR_PermissionNotGrantException);
      } catch (AccountNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0002_AccountExists");
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
    } else {
      logger.error("Invalid input ");
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * get Drivers Be Applied One Iscsis Rule.
   *
   * @return ACTION_RETURN_STRING
   */
  public String getDriversBeAppliedOneIscsisRule() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<SimpleDriverMetadata> appliedDrivers = new ArrayList<>();
    if (!StringUtils.isEmpty(ruleId)) {
      try {
        appliedDrivers = volumeAccessRuleService
            .getDriversBeAppliedOneIscsisRule(Long.valueOf(account.getAccountId()),
                Long.valueOf(ruleId));

        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      } catch (EndPointNotFoundException e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_EndPointNotFound");
      } catch (TooManyEndPointFoundException e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
      } catch (GenericThriftClientFactoryException e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_GenericThriftClientFactoryException");
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
      } catch (Exception e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_NetworkErrorException");
      }
    } else {
      logger.error("Invalid input ");
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    }
    dataMap.put("appliedDrivers", appliedDrivers);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * get Drivers Be Unapplied One Iscsis Rule.
   *
   * @return ACTION_RETURN_STRING
   */
  public String getDriversBeUnappliedOneIscsisRule() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<SimpleDriverMetadata> unappliedDrivers = new ArrayList<>();
    if (!StringUtils.isEmpty(ruleId)) {
      try {
        unappliedDrivers = volumeAccessRuleService
            .getDriversBeUnappliedOneIscsisRule(Long.valueOf(account.getAccountId()),
                Long.valueOf(ruleId));

        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      } catch (EndPointNotFoundException e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_EndPointNotFound");
      } catch (TooManyEndPointFoundException e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
      } catch (GenericThriftClientFactoryException e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_GenericThriftClientFactoryException");
      } catch (ServiceIsNotAvailableThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
      } catch (ServiceHavingBeenShutdownThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
      } catch (Exception e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0010_InternalError");
      }
    } else {
      logger.error("Invalid input ");
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    }
    dataMap.put("unappliedDrivers", unappliedDrivers);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * apply Iscsi Access Rule On Iscsis.
   *
   * @return ACTION_RETURN_STRING
   */
  public String applyIscsiAccessRuleOnIscsis() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    if (!StringUtils.isEmpty(ruleId) && !StringUtils.isEmpty(driverKeysJson)) {
      logger.debug("driverKeysJson is {}", driverKeysJson);
      List<SimpleDriverMetadata> driversList = new ArrayList<>();
      JSONArray driverJsonObjectArray = JSONArray.fromObject(driverKeysJson);
      logger.debug("driverJsonObjectArray is {}", driverJsonObjectArray);
      for (int i = 0; i < driverJsonObjectArray.size(); i++) {
        SimpleDriverMetadata driver = new SimpleDriverMetadata();
        driver.setDriverContainerId(
            driverJsonObjectArray.getJSONObject(i).getString("driverContainerId"));
        driver.setVolumeId(driverJsonObjectArray.getJSONObject(i).getString("volumeId"));
        driver.setSnapshotId(driverJsonObjectArray.getJSONObject(i).getString("snapshotId"));
        driver.setDriverType(driverJsonObjectArray.getJSONObject(i).getString("driverType"));
        driversList.add(driver);
      }

      try {
        volumeAccessRuleService
            .applyIscsiAccessRuleOnIscsis(Long.valueOf(account.getAccountId()),
                Long.valueOf(ruleId),
                driversList);
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      } catch (ServiceIsNotAvailableThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
      } catch (IscsiAccessRuleNotFoundThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_IscsiAccessRuleNotFound");
      } catch (ApplyFailedDueToConflictExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_ApplyFailedDueToConflictException");
      } catch (IscsiNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_IscsiNotFoundException");
      } catch (ServiceHavingBeenShutdownThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
      } catch (IscsiAccessRuleUnderOperationThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_IscsiAccessRuleUnderOperation");
      } catch (IscsiBeingDeletedExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_IscsiBeingDeletedException");
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
    } else {
      logger.error("Invalid input ");
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * cancel Iscsi Access Rule All Applied.
   *
   * @return ACTION_RETURN_STRING
   */
  public String cancelIscsiAccessRuleAllApplied() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    if (!StringUtils.isEmpty(ruleId) && !StringUtils.isEmpty(driverKeysJson)) {
      logger.debug("driverKeysJson is {}", driverKeysJson);
      List<SimpleDriverMetadata> driversList = new ArrayList<>();
      JSONArray driverJsonObjectArray = JSONArray.fromObject(driverKeysJson);
      logger.debug("driverJsonObjectArray is {}", driverJsonObjectArray);
      for (int i = 0; i < driverJsonObjectArray.size(); i++) {
        SimpleDriverMetadata driver = new SimpleDriverMetadata();
        driver.setDriverContainerId(
            driverJsonObjectArray.getJSONObject(i).getString("driverContainerId"));
        driver.setVolumeId(driverJsonObjectArray.getJSONObject(i).getString("volumeId"));
        driver.setSnapshotId(driverJsonObjectArray.getJSONObject(i).getString("snapshotId"));
        driver.setDriverType(driverJsonObjectArray.getJSONObject(i).getString("driverType"));
        driversList.add(driver);
      }

      try {
        volumeAccessRuleService
            .cancelIscsiAccessRuleAllApplied(Long.valueOf(account.getAccountId()),
                Long.valueOf(ruleId),
                driversList);
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      } catch (AccessRuleNotAppliedThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0058_AccessRuleNotApplied");
      } catch (IscsiAccessRuleNotFoundThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_IscsiAccessRuleNotFound");
      } catch (IscsiAccessRuleUnderOperationThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_IscsiAccessRuleUnderOperation");
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
    } else {
      logger.error("Invalid input ");
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

}
