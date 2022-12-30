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

import static py.console.utils.ErrorCode2.ERROR_PermissionNotGrantException;

import com.opensymphony.xwork2.ActionSupport;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import net.sf.json.JSONArray;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import py.console.bean.Account;
import py.console.bean.ResultMessage;
import py.console.bean.ScsiClient;
import py.console.bean.SimpleDriverMetadata;
import py.console.bean.SimpleInstance;
import py.console.bean.SimpleVolumeMetadata;
import py.console.bean.VolumeForDriverClient;
import py.console.service.account.AccountSessionService;
import py.console.service.driver.DriverService;
import py.console.service.instance.InstanceService;
import py.console.utils.Constants;
import py.console.utils.ErrorCode2;
import py.thrift.share.AccountNotFoundExceptionThrift;
import py.thrift.share.EndPointNotFoundExceptionThrift;
import py.thrift.share.NetworkErrorExceptionThrift;
import py.thrift.share.PermissionNotGrantExceptionThrift;
import py.thrift.share.ScsiClientIsExistExceptionThrift;
import py.thrift.share.ScsiClientIsNotOkExceptionThrift;
import py.thrift.share.ScsiClientOperationExceptionThrift;
import py.thrift.share.ServiceHavingBeenShutdownThrift;
import py.thrift.share.ServiceIsNotAvailableThrift;
import py.thrift.share.TooManyEndPointFoundExceptionThrift;

public class DriverAction extends ActionSupport {

  private static final long serialVersionUID = 1L;
  private static final Logger logger = LoggerFactory.getLogger(DriverAction.class);

  private ResultMessage resultMessage;
  private Map<String, Object> dataMap;
  private AccountSessionService accountSessionService;
  private InstanceService instanceService;
  private DriverService driverService;
  private String volumeId;
  private String snapshotId;
  private String drivercontainerHost;
  private String driverHost;
  private String driverType;
  private String chapControl;
  private String driverContainerId;

  private String ip;
  private String ipsJson;

  private String volumeIdsJson;
  private String scsiIp;

  /**
   * DriverAction.
   */
  public DriverAction() {
    super();
    resultMessage = new ResultMessage();
    this.dataMap = new HashMap<String, Object>();
  }

  /**
   * list All Drivers.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listAllDrivers() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }

    List<SimpleDriverMetadata> driverMetadataList = new ArrayList<>();
    SimpleDriverMetadata driverCondition = new SimpleDriverMetadata();
    try {
      if (!StringUtils.isEmpty(volumeId)) {
        driverCondition.setVolumeId(volumeId);
      }
      if (!StringUtils.isEmpty(snapshotId)) {
        driverCondition.setSnapshotId(snapshotId);
      }
      if (!StringUtils.isEmpty(drivercontainerHost)) {
        driverCondition.setDriverContainerIp(drivercontainerHost);
      }
      if (!StringUtils.isEmpty(driverHost)) {
        driverCondition.setHost(driverHost);
      }
      if (!StringUtils.isEmpty(driverType)) {
        driverCondition.setDriverType(driverType);
      }
      driverMetadataList = driverService.listAllDrivers(driverCondition);

      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("caught an exception ", e);
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
    dataMap.put("driverMetadataList", driverMetadataList);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * set Iscsi Chap Control.
   *
   * @return ACTION_RETURN_STRING
   */
  public String setIscsiChapControl() {

    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    if (!StringUtils.isEmpty(chapControl) && !StringUtils.isEmpty(driverContainerId) && !StringUtils
        .isEmpty(volumeId) && !StringUtils.isEmpty(snapshotId) && !StringUtils.isEmpty(
        driverType)) {

      SimpleDriverMetadata driver = new SimpleDriverMetadata();
      driver.setDriverContainerId(driverContainerId);
      driver.setVolumeId(volumeId);
      driver.setSnapshotId(snapshotId);
      driver.setDriverType(driverType);
      driver.setChapControl(chapControl);
      try {
        driverService.setIscsiChapControl(driver);
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      } catch (ServiceIsNotAvailableThrift e) {
        logger.error("caught an exception ", e);
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
    } else {
      logger.error("Invalid input ");
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    }

    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * create Scsi Client.
   *
   * @return ACTION_RETURN_STRING
   */
  public String createScsiClient() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    if (StringUtils.isEmpty(ip)) {
      resultMessage.setMessage("ERROR_0040_InvalidInput");
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }

    try {
      driverService.createScsiClient(Long.valueOf(account.getAccountId()), ip,
          Long.valueOf(driverContainerId));
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("caught an exception ", e);
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
    } catch (ScsiClientIsExistExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_ScsiClientIsExistException");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (Exception e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");

    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * delete Scsi Client.
   *
   * @return ACTION_RETURN_STRING
   */
  public String deleteScsiClient() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    if (StringUtils.isEmpty(ipsJson)) {
      resultMessage.setMessage("ERROR_0040_InvalidInput");
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }

    List<String> ipsList = new ArrayList<>();
    logger.debug("ipsJson is {}", ipsJson);
    JSONArray idsJsonArray = JSONArray.fromObject(ipsJson);
    ipsList = (List<String>) JSONArray.toList(idsJsonArray, String.class);
    logger.debug("ipsList is {}", ipsList);
    Map<String, ScsiClientOperationExceptionThrift> failedError = new HashMap<>();

    try {
      failedError = driverService.deleteScsiClient(Long.valueOf(account.getAccountId()),
          ipsList);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("caught an exception ", e);
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
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (Exception e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");

    }
    dataMap.put("failedError", failedError);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * list Scsi Client.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listScsiClient() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    Map<String, Object> result = new HashMap<>();

    try {
      result = driverService.listScsiClient(Long.valueOf(account.getAccountId()), ip);
      if (StringUtils.isEmpty(ip)) {
        List<ScsiClient> scsiClientsList = (List<ScsiClient>) result.get("scsiClientsList");
        dataMap.put("scsiClientsList", scsiClientsList);
        logger.debug("scsiClientsList is", scsiClientsList);
      } else {
        List<VolumeForDriverClient> launchedVolume = new ArrayList<>();
        List<SimpleVolumeMetadata> unlaunchedVolume = new ArrayList<>();
        launchedVolume = (List<VolumeForDriverClient>) result.get("launchedVolume");
        unlaunchedVolume = (List<SimpleVolumeMetadata>) result.get("unlaunchedVolume");
        dataMap.put("launchedVolume", launchedVolume);
        dataMap.put("unlaunchedVolume", unlaunchedVolume);
        logger.debug("launchedVolume is", launchedVolume);
        logger.debug("unlaunchedVolume is", unlaunchedVolume);
      }

      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("caught an exception ", e);
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
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (Exception e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");

    }

    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * available Driver Container For Client.
   *
   * @return ACTION_RETURN_STRING
   */
  public String availableDriverContainerForClient() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    Map<String, Object> result = new HashMap<>();
    List<SimpleInstance> driverContainersList = new ArrayList<SimpleInstance>();
    try {
      driverContainersList = driverService.availableDriverContainerForClient();
      dataMap.put("driverContainersList", driverContainersList);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("caught an exception ", e);
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

    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * launch Driver For Scsi.
   *
   * @return ACTION_RETURN_STRING
   */
  public String launchDriverForScsi() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    if (StringUtils.isEmpty(volumeIdsJson) || StringUtils.isEmpty(driverType)
        || StringUtils.isEmpty(scsiIp)) {
      resultMessage.setMessage("ERROR_0040_InvalidInput");
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<Long> volumeIdsList = new ArrayList<>();
    logger.debug("volumeIdsJson is {}", volumeIdsJson);
    JSONArray idsJsonArray = JSONArray.fromObject(volumeIdsJson);
    volumeIdsList = (List<Long>) JSONArray.toList(idsJsonArray, Long.class);
    logger.debug("volumeIdsList is {}", volumeIdsList);
    try {

      driverService
          .launchDriverForScsi(Long.valueOf(account.getAccountId()), volumeIdsList, driverType,
              scsiIp, 0);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("caught an exception ", e);
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
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (ScsiClientIsNotOkExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_ScsiClientIsNotOkException");
    } catch (Exception e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");

    }

    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * umount Driver For Scsi.
   *
   * @return ACTION_RETURN_STRING
   */
  public String umountDriverForScsi() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    if (StringUtils.isEmpty(volumeIdsJson) || StringUtils.isEmpty(scsiIp)) {
      resultMessage.setMessage("ERROR_0040_InvalidInput");
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<Long> volumeIdsList = new ArrayList<>();
    logger.debug("volumeIdsJson is {}", volumeIdsJson);
    JSONArray idsJsonArray = JSONArray.fromObject(volumeIdsJson);
    volumeIdsList = (List<Long>) JSONArray.toList(idsJsonArray, Long.class);
    logger.debug("volumeIdsList is {}", volumeIdsList);
    Map<String, ScsiClientOperationExceptionThrift> failedError = new HashMap<>();
    try {

      failedError = driverService
          .umountDriverForScsi(Long.valueOf(account.getAccountId()), volumeIdsList, scsiIp);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("caught an exception ", e);
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
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (ScsiClientIsNotOkExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_ScsiClientIsNotOkException");
    } catch (Exception e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");

    }
    dataMap.put("failedError", failedError);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  public AccountSessionService getAccountSessionService() {
    return accountSessionService;
  }

  public void setAccountSessionService(AccountSessionService accountSessionService) {
    this.accountSessionService = accountSessionService;
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

  public String getVolumeId() {
    return volumeId;
  }

  public void setVolumeId(String volumeId) {
    this.volumeId = volumeId;
  }

  public String getSnapshotId() {
    return snapshotId;
  }

  public void setSnapshotId(String snapshotId) {
    this.snapshotId = snapshotId;
  }

  public String getDrivercontainerHost() {
    return drivercontainerHost;
  }

  public void setDrivercontainerHost(String drivercontainerHost) {
    this.drivercontainerHost = drivercontainerHost;
  }

  public String getDriverHost() {
    return driverHost;
  }

  public void setDriverHost(String driverHost) {
    this.driverHost = driverHost;
  }

  public DriverService getDriverService() {
    return driverService;
  }

  public void setDriverService(DriverService driverService) {
    this.driverService = driverService;
  }

  public String getDriverType() {
    return driverType;
  }

  public void setDriverType(String driverType) {
    this.driverType = driverType;
  }

  public String getChapControl() {
    return chapControl;
  }

  public void setChapControl(String chapControl) {
    this.chapControl = chapControl;
  }

  public String getDriverContainerId() {
    return driverContainerId;
  }

  public void setDriverContainerId(String driverContainerId) {
    this.driverContainerId = driverContainerId;
  }

  public String getIp() {
    return ip;
  }

  public void setIp(String ip) {
    this.ip = ip;
  }

  public String getIpsJson() {
    return ipsJson;
  }

  public void setIpsJson(String ipsJson) {
    this.ipsJson = ipsJson;
  }

  public InstanceService getInstanceService() {
    return instanceService;
  }

  public void setInstanceService(InstanceService instanceService) {
    this.instanceService = instanceService;
  }

  public String getVolumeIdsJson() {
    return volumeIdsJson;
  }

  public void setVolumeIdsJson(String volumeIdsJson) {
    this.volumeIdsJson = volumeIdsJson;
  }

  public String getScsiIp() {
    return scsiIp;
  }

  public void setScsiIp(String scsiIp) {
    this.scsiIp = scsiIp;
  }
}
