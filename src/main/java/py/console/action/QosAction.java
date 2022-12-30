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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import net.sf.json.JSONArray;
import org.apache.commons.lang.StringUtils;
import org.apache.thrift.TException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import py.console.bean.Account;
import py.console.bean.IoLimitation;
import py.console.bean.IoLimitationEntry;
import py.console.bean.QosMigrationRule;
import py.console.bean.ResultMessage;
import py.console.bean.SimpleDriverMetadata;
import py.console.bean.SimpleStoragePool;
import py.console.service.account.AccountSessionService;
import py.console.service.qos.QosService;
import py.console.utils.Constants;
import py.console.utils.ErrorCode2;
import py.thrift.infocenter.service.FailedToTellDriverAboutAccessRulesExceptionThrift;
import py.thrift.share.AccessRuleNotAppliedThrift;
import py.thrift.share.AccountNotFoundExceptionThrift;
import py.thrift.share.ApplyFailedDueToVolumeIsReadOnlyExceptionThrift;
import py.thrift.share.EndPointNotFoundExceptionThrift;
import py.thrift.share.InvalidInputExceptionThrift;
import py.thrift.share.IoLimitationTimeInterLeavingThrift;
import py.thrift.share.IoLimitationsDuplicateThrift;
import py.thrift.share.MigrationRuleNotExists;
import py.thrift.share.NetworkErrorExceptionThrift;
import py.thrift.share.PermissionNotGrantExceptionThrift;
import py.thrift.share.ServiceHavingBeenShutdownThrift;
import py.thrift.share.ServiceIsNotAvailableThrift;
import py.thrift.share.TooManyEndPointFoundExceptionThrift;
import py.thrift.share.VolumeBeingDeletedExceptionThrift;
import py.thrift.share.VolumeNotFoundExceptionThrift;

public class QosAction extends ActionSupport {

  private static final Logger logger = LoggerFactory.getLogger(QosAction.class);
  private Map<String, Object> dataMap;
  private ResultMessage resultMessage;
  private AccountSessionService accountSessionService;
  private QosService qosService;
  private String minMigrationSpeed;
  private String maxMigrationSpeed;
  private String ruleName;
  private String ruleId;
  private String rulesJson;
  private String commit;
  private String poolIdsJson;
  private String limitationId;
  private String limitationName;
  private String limitType;
  private String entriesJson;
  private String ioLimitationsJson;
  private String driverKeysJson;
  private String strategy;

  private String mode;
  private String startTime;
  private String endTime;
  private String waitTime;
  private String ignoreMissPagesAndLogs;

  /**
   * QosAction.
   */
  public QosAction() {
    super();
    this.dataMap = new HashMap<String, Object>();
    resultMessage = new ResultMessage();
  }

  /**
   * list Migration Rules.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listMigrationRules() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<QosMigrationRule> ruleList = new ArrayList<>();
    try {

      ruleList = qosService.listMigrationRules(Long.valueOf(account.getAccountId()));
      dataMap.put("ruleList", ruleList);

      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (Exception e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("ruleList", ruleList);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * cancel Migration Rules.
   *
   * @return ACTION_RETURN_STRING
   */
  public String cancelMigrationRules() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    if (!StringUtils.isEmpty(ruleId) && !StringUtils.isEmpty(poolIdsJson)) {
      List<Long> poolIdsList = new ArrayList<>();
      logger.debug("idsJson is {}", poolIdsJson);
      JSONArray idsJsonArray = JSONArray.fromObject(poolIdsJson);
      poolIdsList = (List<Long>) JSONArray.toList(idsJsonArray, Long.class);
      logger.debug("idsList is {}", poolIdsList);
      try {
        qosService
            .cancelMigrationRules(Long.valueOf(account.getAccountId()), poolIdsList,
                Long.valueOf(ruleId));
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      } catch (FailedToTellDriverAboutAccessRulesExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_FailedToTellDriverAboutAccessRules");
      } catch (ServiceIsNotAvailableThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
      } catch (PermissionNotGrantExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_PermissionNotGrantException");
      } catch (ServiceHavingBeenShutdownThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
      } catch (AccessRuleNotAppliedThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0058_AccessRuleNotApplied");
      } catch (AccountNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0003_AccountNotExists");
      } catch (TooManyEndPointFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
      } catch (NetworkErrorExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_NetworkErrorException");
      } catch (EndPointNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_EndPointNotFound");
      } catch (Exception e) {
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
   * apply Migration Rules.
   *
   * @return ACTION_RETURN_STRING
   */
  public String applyMigrationRules() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    if (!StringUtils.isEmpty(ruleId) && !StringUtils.isEmpty(poolIdsJson)) {
      List<Long> poolIdsList = new ArrayList<>();
      logger.debug("poolIdsJson is {}", poolIdsJson);
      JSONArray idsJsonArray = JSONArray.fromObject(poolIdsJson);
      poolIdsList = (List<Long>) JSONArray.toList(idsJsonArray, Long.class);
      logger.debug("poolIdsList is {}", poolIdsList);
      try {
        qosService.applyMigrationRules(Long.valueOf(account.getAccountId()), poolIdsList,
            Long.valueOf(ruleId));
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      } catch (FailedToTellDriverAboutAccessRulesExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_FailedToTellDriverAboutAccessRules");
      } catch (ApplyFailedDueToVolumeIsReadOnlyExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_ApplyFailedDueToVolumeIsReadOnly");
      } catch (VolumeBeingDeletedExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_VolumeDeletingException");
      } catch (VolumeNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0011_VolumeNotFound");
      } catch (ServiceIsNotAvailableThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
      } catch (PermissionNotGrantExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_PermissionNotGrantException");
      } catch (ServiceHavingBeenShutdownThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
      } catch (AccountNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0003_AccountNotExists");
      } catch (TooManyEndPointFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
      } catch (NetworkErrorExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_NetworkErrorException");
      } catch (EndPointNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_EndPointNotFound");
      } catch (Exception e) {
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
   * get Applied Storage Pools.
   *
   * @return ACTION_RETURN_STRING
   */
  public String getAppliedStoragePools() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    if (!StringUtils.isEmpty(ruleId)) {
      try {
        List<SimpleStoragePool> appliedPoolList = qosService
            .getAppliedStoragePools(Long.valueOf(account.getAccountId()), Long.valueOf(ruleId));
        dataMap.put("appliedPoolList", appliedPoolList);
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      } catch (PermissionNotGrantExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_PermissionNotGrantException");
      } catch (ServiceIsNotAvailableThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
      } catch (ServiceHavingBeenShutdownThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
      } catch (MigrationRuleNotExists e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_MigrationRuleNotExists");
      } catch (TooManyEndPointFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
      } catch (NetworkErrorExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_NetworkErrorException");
      } catch (EndPointNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_EndPointNotFound");
      } catch (Exception e) {
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
   * get Un Applied Pools.
   *
   * @return ACTION_RETURN_STRING
   */
  public String getUnAppliedPools() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    if (!StringUtils.isEmpty(ruleId)) {
      try {
        List<SimpleStoragePool> appliedPoolList = qosService
            .getUnAppliedPools(Long.valueOf(account.getAccountId()), Long.valueOf(ruleId));
        dataMap.put("appliedPoolList", appliedPoolList);
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      } catch (PermissionNotGrantExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_PermissionNotGrantException");
      } catch (ServiceIsNotAvailableThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
      } catch (ServiceHavingBeenShutdownThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
      } catch (MigrationRuleNotExists e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_MigrationRuleNotExists");
      } catch (TooManyEndPointFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
      } catch (NetworkErrorExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_NetworkErrorException");
      } catch (EndPointNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_EndPointNotFound");
      } catch (Exception e) {
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
   * create Io Limitations.
   *
   * @return ACTION_RETURN_STRING
   */
  public String createIoLimitations() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    if (!StringUtils.isEmpty(limitationName) && !StringUtils.isEmpty(limitType)) {
      List<IoLimitationEntry> entriesList = new ArrayList<>();
      if (!StringUtils.isEmpty(entriesJson)) {
        logger.debug("entriesJson is {}", entriesJson);
        JSONArray entriesJsonObjectArray = JSONArray.fromObject(entriesJson);
        logger.debug("entriesJsonObjectArray is {}", entriesJsonObjectArray);
        for (int i = 0; i < entriesJsonObjectArray.size(); i++) {
          IoLimitationEntry entry = new IoLimitationEntry();
          entry.setUpperLimitedIoPs(entriesJsonObjectArray.getJSONObject(i).getString(
              "upperLimitedIOPS"));
          entry.setLowerLimitedIoPs(entriesJsonObjectArray.getJSONObject(i).getString(
              "lowerLimitedIOPS"));
          entry.setUpperLimitedThroughput(
              entriesJsonObjectArray.getJSONObject(i).getString("upperLimitedThroughput"));
          entry.setLowerLimitedThroughput(
              entriesJsonObjectArray.getJSONObject(i).getString("lowerLimitedThroughput"));
          entry.setStartTime(entriesJsonObjectArray.getJSONObject(i).getString("startTime"));
          entry.setEndTime(entriesJsonObjectArray.getJSONObject(i).getString("endTime"));
          entriesList.add(entry);
        }
      }

      IoLimitation ioLimitation = new IoLimitation();
      ioLimitation.setLimitationName(limitationName);
      ioLimitation.setLimitType(limitType);
      ioLimitation.setEntries(entriesList);
      try {
        qosService.createIoLimitations(Long.valueOf(account.getAccountId()), ioLimitation);
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      } catch (PermissionNotGrantExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_PermissionNotGrantException");
      } catch (ServiceIsNotAvailableThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
      } catch (ServiceHavingBeenShutdownThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
      } catch (InvalidInputExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0040_InvalidInput");
      } catch (IoLimitationsDuplicateThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_IOLimitationsDuplicate");
      } catch (IoLimitationTimeInterLeavingThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_IOLimitationTimeInterLeaving");
      } catch (AccountNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0003_AccountNotExists");
      } catch (TooManyEndPointFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
      } catch (NetworkErrorExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_NetworkErrorException");
      } catch (EndPointNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_EndPointNotFound");
      } catch (Exception e) {
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
   * update Io Limitations.
   *
   * @return ACTION_RETURN_STRING
   */
  public String updateIoLimitations() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    if (!StringUtils.isEmpty(limitationId) && !StringUtils.isEmpty(limitationName) && !StringUtils
        .isEmpty(limitType) && !StringUtils.isEmpty(entriesJson)) {
      List<IoLimitationEntry> entriesList = new ArrayList<>();
      if (!StringUtils.isEmpty(entriesJson)) {
        logger.debug("entriesJson is {}", entriesJson);
        JSONArray entriesJsonObjectArray = JSONArray.fromObject(entriesJson);
        logger.debug("entriesJsonObjectArray is {}", entriesJsonObjectArray);
        for (int i = 0; i < entriesJsonObjectArray.size(); i++) {
          IoLimitationEntry entry = new IoLimitationEntry();
          entry.setUpperLimitedIoPs(entriesJsonObjectArray.getJSONObject(i).getString(
              "upperLimitedIOPS"));
          entry.setLowerLimitedIoPs(entriesJsonObjectArray.getJSONObject(i).getString(
              "lowerLimitedIOPS"));
          entry.setUpperLimitedThroughput(
              entriesJsonObjectArray.getJSONObject(i).getString("upperLimitedThroughput"));
          entry.setLowerLimitedThroughput(
              entriesJsonObjectArray.getJSONObject(i).getString("lowerLimitedThroughput"));
          entry.setStartTime(entriesJsonObjectArray.getJSONObject(i).getString("startTime"));
          entry.setEndTime(entriesJsonObjectArray.getJSONObject(i).getString("endTime"));
          entriesList.add(entry);
        }
      }
      IoLimitation ioLimitation = new IoLimitation();
      ioLimitation.setLimitationId(limitationId);
      ioLimitation.setLimitationName(limitationName);
      ioLimitation.setLimitType(limitType);
      ioLimitation.setEntries(entriesList);
      try {
        qosService.updateIoLimitations(Long.valueOf(account.getAccountId()), ioLimitation);
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      } catch (PermissionNotGrantExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_PermissionNotGrantException");
      } catch (ServiceIsNotAvailableThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
      } catch (ServiceHavingBeenShutdownThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
      } catch (InvalidInputExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0040_InvalidInput");
      } catch (IoLimitationsDuplicateThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_IOLimitationsDuplicate");
      } catch (IoLimitationTimeInterLeavingThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_IOLimitationTimeInterLeaving");
      } catch (AccountNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0003_AccountNotExists");
      } catch (TooManyEndPointFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
      } catch (NetworkErrorExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_NetworkErrorException");
      } catch (EndPointNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_EndPointNotFound");
      } catch (Exception e) {
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
   * list Io Limitations.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listIoLimitations() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<IoLimitation> ioLimitationList = new ArrayList<>();
    try {
      ioLimitationList = qosService.listIoLimitations(Long.valueOf(account.getAccountId()));

      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_PermissionNotGrantException");
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (Exception e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("ioLimitationList", ioLimitationList);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * delete Io Limitations.
   *
   * @return ACTION_RETURN_STRING
   */
  public String deleteIoLimitations() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    logger.debug("confirm is {}", commit);
    logger.debug("ioLimitationsJson is {}", ioLimitationsJson);
    if (!StringUtils.isEmpty(commit) && !StringUtils.isEmpty(ioLimitationsJson)) {
      Map<String, Object> response = new HashMap<>();
      List<IoLimitation> ioLimitationsList = new ArrayList<>();
      JSONArray ioLimitationJsonObjectArray = JSONArray.fromObject(ioLimitationsJson);
      logger.debug("ioLimitationJsonObjectArray is {}", ioLimitationJsonObjectArray);
      for (int i = 0; i < ioLimitationJsonObjectArray.size(); i++) {
        IoLimitation ioLimitation = new IoLimitation();
        ioLimitation.setLimitationId(
            ioLimitationJsonObjectArray.getJSONObject(i).getString("limitationId"));
        ioLimitation
            .setLimitationName(
                ioLimitationJsonObjectArray.getJSONObject(i).getString("limitationName"));
        ioLimitation.setLimitType(
            ioLimitationJsonObjectArray.getJSONObject(i).getString("limitType"));
        ioLimitationsList.add(ioLimitation);
      }
      try {
        response = qosService.deleteIoLimitations(Long.valueOf(account.getAccountId()),
            ioLimitationsList,
            Boolean.valueOf(commit));
        if (response.get("beAppliedIOLimitation2Drivers") != null) {
          Map<IoLimitation, Object> beAppliedIoLimitation2Drivers = new HashMap<>();
          beAppliedIoLimitation2Drivers = (Map<IoLimitation, Object>) response
              .get("beAppliedIoLimitation2Drivers");
          if (beAppliedIoLimitation2Drivers.size() > 0) {
            dataMap.put("beAppliedIOLimitation2Drivers", beAppliedIoLimitation2Drivers);
          }
          logger.debug(" beAppliedIoLimitation2Drivers is {}", beAppliedIoLimitation2Drivers);
        }

        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      } catch (PermissionNotGrantExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_PermissionNotGrantException");
      } catch (ServiceIsNotAvailableThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
      } catch (ServiceHavingBeenShutdownThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
      } catch (FailedToTellDriverAboutAccessRulesExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_FailedToTellDriverAboutAccessRules");
      } catch (AccountNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0003_AccountNotExists");
      } catch (TooManyEndPointFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
      } catch (NetworkErrorExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_NetworkErrorException");
      } catch (EndPointNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_EndPointNotFound");
      } catch (Exception e) {
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
   * get Io Limitation Applied Drivers.
   *
   * @return ACTION_RETURN_STRING
   */
  public String getIoLimitationAppliedDrivers() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<SimpleDriverMetadata> appliedDrivers = new ArrayList<>();
    if (!StringUtils.isEmpty(limitationId)) {

      try {
        appliedDrivers = qosService.getIoLimitationAppliedDrivers(
            Long.valueOf(account.getAccountId()),
            Long.valueOf(limitationId));

        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      } catch (PermissionNotGrantExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_PermissionNotGrantException");
      } catch (ServiceIsNotAvailableThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
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
   * get Io Limitation Unapplied Drivers.
   *
   * @return ACTION_RETURN_STRING
   */
  public String getIoLimitationUnappliedDrivers() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<SimpleDriverMetadata> unappliedDrivers = new ArrayList<>();
    if (!StringUtils.isEmpty(limitationId)) {

      try {
        unappliedDrivers = qosService.getIoLimitationUnappliedDrivers(
            Long.valueOf(account.getAccountId()),
            Long.valueOf(limitationId));

        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      } catch (ServiceIsNotAvailableThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
      } catch (ServiceHavingBeenShutdownThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
      } catch (PermissionNotGrantExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_PermissionNotGrantException");
      } catch (AccountNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0003_AccountNotExists");
      } catch (TooManyEndPointFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
      } catch (NetworkErrorExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_NetworkErrorException");
      } catch (EndPointNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_EndPointNotFound");
      } catch (Exception e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_NetworkErrorException");
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
   * apply Io Limitations.
   *
   * @return ACTION_RETURN_STRING
   */
  public String applyIoLimitations() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<SimpleDriverMetadata> failedDriverList = new ArrayList<>();
    if (!StringUtils.isEmpty(limitationId) && !StringUtils.isEmpty(driverKeysJson)) {
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
        failedDriverList = qosService
            .applyIoLimitations(Long.valueOf(account.getAccountId()), Long.valueOf(limitationId),
                driversList);
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      } catch (ApplyFailedDueToVolumeIsReadOnlyExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_ApplyFailedDueToVolumeIsReadOnly");
      } catch (VolumeBeingDeletedExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0029_VolumHasBeenDeleted");
      } catch (VolumeNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0011_VolumeNotFound");
      } catch (ServiceIsNotAvailableThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
      } catch (FailedToTellDriverAboutAccessRulesExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_FailedToTellDriverAboutAccessRules");
      } catch (PermissionNotGrantExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_PermissionNotGrantException");
      } catch (ServiceHavingBeenShutdownThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
      } catch (AccountNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0003_AccountNotExists");
      } catch (TooManyEndPointFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
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
    } else {
      logger.error("Invalid input ");
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    }
    dataMap.put("failedDriverList", failedDriverList);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * cancel Io Limitations.
   *
   * @return ACTION_RETURN_STRING
   */
  public String cancelIoLimitations() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    if (!StringUtils.isEmpty(limitationId) && !StringUtils.isEmpty(driverKeysJson)) {
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
        qosService.cancelIoLimitations(Long.valueOf(account.getAccountId()),
            Long.valueOf(limitationId),
            driversList);
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      } catch (AccessRuleNotAppliedThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0058_AccessRuleNotApplied");
      } catch (ServiceIsNotAvailableThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
      } catch (FailedToTellDriverAboutAccessRulesExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_FailedToTellDriverAboutAccessRules");
      } catch (PermissionNotGrantExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_PermissionNotGrantException");
      } catch (ServiceHavingBeenShutdownThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
      } catch (AccountNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0003_AccountNotExists");
      } catch (TooManyEndPointFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
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

  public Map<String, Object> getDataMap() {
    return dataMap;
  }

  public void setDataMap(Map<String, Object> dataMap) {
    this.dataMap = dataMap;
  }

  public ResultMessage getResultMessage() {
    return resultMessage;
  }

  public void setResultMessage(ResultMessage resultMessage) {
    this.resultMessage = resultMessage;
  }

  public AccountSessionService getAccountSessionService() {
    return accountSessionService;
  }

  public void setAccountSessionService(AccountSessionService accountSessionService) {
    this.accountSessionService = accountSessionService;
  }

  public QosService getQosService() {
    return qosService;
  }

  public void setQosService(QosService qosService) {
    this.qosService = qosService;
  }

  public String getMinMigrationSpeed() {
    return minMigrationSpeed;
  }

  public void setMinMigrationSpeed(String minMigrationSpeed) {
    this.minMigrationSpeed = minMigrationSpeed;
  }

  public String getMaxMigrationSpeed() {
    return maxMigrationSpeed;
  }

  public void setMaxMigrationSpeed(String maxMigrationSpeed) {
    this.maxMigrationSpeed = maxMigrationSpeed;
  }

  public String getRuleName() {
    return ruleName;
  }

  public void setRuleName(String ruleName) {
    this.ruleName = ruleName;
  }

  public String getRuleId() {
    return ruleId;
  }

  public void setRuleId(String ruleId) {
    this.ruleId = ruleId;
  }

  public String getRulesJson() {
    return rulesJson;
  }

  public void setRulesJson(String rulesJson) {
    this.rulesJson = rulesJson;
  }

  public String getCommit() {
    return commit;
  }

  public void setCommit(String commit) {
    this.commit = commit;
  }

  public String getPoolIdsJson() {
    return poolIdsJson;
  }

  public void setPoolIdsJson(String poolIdsJson) {
    this.poolIdsJson = poolIdsJson;
  }

  public String getLimitationId() {
    return limitationId;
  }

  public void setLimitationId(String limitationId) {
    this.limitationId = limitationId;
  }

  public String getLimitationName() {
    return limitationName;
  }

  public void setLimitationName(String limitationName) {
    this.limitationName = limitationName;
  }

  public String getLimitType() {
    return limitType;
  }

  public void setLimitType(String limitType) {
    this.limitType = limitType;
  }

  public String getEntriesJson() {
    return entriesJson;
  }

  public void setEntriesJson(String entriesJson) {
    this.entriesJson = entriesJson;
  }

  public String getIoLimitationsJson() {
    return ioLimitationsJson;
  }

  public void setIoLimitationsJson(String ioLimitationsJson) {
    this.ioLimitationsJson = ioLimitationsJson;
  }

  public String getDriverKeysJson() {
    return driverKeysJson;
  }

  public void setDriverKeysJson(String driverKeysJson) {
    this.driverKeysJson = driverKeysJson;
  }

  public String getMode() {
    return mode;
  }

  public void setMode(String mode) {
    this.mode = mode;
  }

  public String getStartTime() {
    return startTime;
  }

  public void setStartTime(String startTime) {
    this.startTime = startTime;
  }

  public String getEndTime() {
    return endTime;
  }

  public void setEndTime(String endTime) {
    this.endTime = endTime;
  }

  public String getWaitTime() {
    return waitTime;
  }

  public void setWaitTime(String waitTime) {
    this.waitTime = waitTime;
  }

  public String getIgnoreMissPagesAndLogs() {
    return ignoreMissPagesAndLogs;
  }

  public void setIgnoreMissPagesAndLogs(String ignoreMissPagesAndLogs) {
    this.ignoreMissPagesAndLogs = ignoreMissPagesAndLogs;
  }

  public String getStrategy() {
    return strategy;
  }

  public void setStrategy(String strategy) {
    this.strategy = strategy;
  }
}
