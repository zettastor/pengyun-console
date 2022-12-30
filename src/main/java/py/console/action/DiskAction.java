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

import static py.console.utils.ErrorCode2.ERROR_0039_ServiceHavingBeenShutdown;
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
import org.apache.thrift.transport.TTransportException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import py.archive.ArchiveStatus;
import py.console.bean.Account;
import py.console.bean.ResultMessage;
import py.console.bean.ServerNode;
import py.console.bean.SimpleArchiveMetadata;
import py.console.bean.SimpleInstance;
import py.console.bean.SimpleInstanceMetadata;
import py.console.bean.SmartInfo;
import py.console.service.account.AccountSessionService;
import py.console.service.disk.DiskService;
import py.console.service.instance.InstanceService;
import py.console.utils.Constants;
import py.console.utils.ErrorCode2;
import py.exception.EndPointNotFoundException;
import py.exception.GenericThriftClientFactoryException;
import py.exception.TooManyEndPointFoundException;
import py.thrift.share.AccessDeniedExceptionThrift;
import py.thrift.share.AccountNotFoundExceptionThrift;
import py.thrift.share.ArchiveManagerNotSupportExceptionThrift;
import py.thrift.share.ArchiveMetadataThrift;
import py.thrift.share.ArchiveTypeThrift;
import py.thrift.share.DiskHasBeenOfflineThrift;
import py.thrift.share.DiskHasBeenOnlineThrift;
import py.thrift.share.DiskIsBusyThrift;
import py.thrift.share.DiskNameIllegalExceptionThrift;
import py.thrift.share.DiskNotBrokenThrift;
import py.thrift.share.DiskNotFoundExceptionThrift;
import py.thrift.share.DiskNotMismatchConfigThrift;
import py.thrift.share.DiskSizeCanNotSupportArchiveTypesThrift;
import py.thrift.share.EndPointNotFoundExceptionThrift;
import py.thrift.share.InstanceMetadataThrift;
import py.thrift.share.InternalErrorThrift;
import py.thrift.share.NetworkErrorExceptionThrift;
import py.thrift.share.NotEnoughSpaceExceptionThrift;
import py.thrift.share.PermissionNotGrantExceptionThrift;
import py.thrift.share.ServerNodeIsUnknownThrift;
import py.thrift.share.ServerNodeNotExistExceptionThrift;
import py.thrift.share.ServerNodePositionIsRepeatExceptionThrift;
import py.thrift.share.ServiceHavingBeenShutdownThrift;
import py.thrift.share.ServiceIsNotAvailableThrift;
import py.thrift.share.TooManyEndPointFoundExceptionThrift;

/**
 * DiskAction.
 */
@SuppressWarnings("serial")
public class DiskAction extends ActionSupport {

  private static final Logger logger = LoggerFactory.getLogger(DiskAction.class);

  private AccountSessionService accountSessionService;

  private InstanceService instanceService;

  private DiskService diskService;

  private ResultMessage resultMessage;

  private List<SimpleInstanceMetadata> instanceMetadataList;

  private List<SimpleArchiveMetadata> archiveMetadataList;

  private String endPoint;

  private String instanceId;

  private String archiveId;

  private String sortBy;

  private String sortOrder;

  private String orderDir;

  private String archiveType;

  private String diskName;

  private String diskType;

  private String serverId;

  private String manageIp;

  private String rackNo;

  private String slotNo;

  private String storeIp;

  private String diskInfo;
  private String cpuInfo;
  private String gatewayIp;
  private String modelInfo;
  private String networkCardInfo;
  private String memoryInfo;
  private String childFramNo;
  private String hostName;
  private String diskLightStatus;

  private String idsJson;

  private String ip;

  private String storageType;
  private String statusLevel;
  private String serverStatus;
  private String diskIds;
  private String durationInMinutes;
  private String archiveTypesJson;
  private String instanceIp;
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

  public AccountSessionService getAccountSessionService() {
    return accountSessionService;
  }

  public void setAccountSessionService(AccountSessionService accountSessionService) {
    this.accountSessionService = accountSessionService;
  }

  public DiskService getDiskService() {
    return diskService;
  }

  public void setDiskService(DiskService diskService) {
    this.diskService = diskService;
  }

  public List<SimpleInstanceMetadata> getInstanceMetadataList() {
    return instanceMetadataList;
  }

  public void setInstanceMetadataList(List<SimpleInstanceMetadata> instanceMetadataList) {
    this.instanceMetadataList = instanceMetadataList;
  }

  public List<SimpleArchiveMetadata> getArchiveMetadataList() {
    return archiveMetadataList;
  }

  public void setArchiveMetadataList(List<SimpleArchiveMetadata> archiveMetadataList) {
    this.archiveMetadataList = archiveMetadataList;
  }

  public ResultMessage getResultMessage() {
    return resultMessage;
  }

  public void setResultMessage(ResultMessage resultMessage) {
    this.resultMessage = resultMessage;
  }

  public String getSortBy() {
    return sortBy;
  }

  public void setSortBy(String sortBy) {
    this.sortBy = sortBy;
  }

  public String getSortOrder() {
    return sortOrder;
  }

  public void setSortOrder(String sortOrder) {
    this.sortOrder = sortOrder;
  }

  /**
   * DiskAction.
   */
  public DiskAction() {
    super();
    this.dataMap = new HashMap<String, Object>();
    resultMessage = new ResultMessage();
  }

  /**
   * restore Current Datanode Instance ID.
   *
   * @return ACTION_RETURN_STRING
   */
  public String restoreCurrentDatanodeInstanceId() {
    logger.debug("current datanode instance id is {}", instanceId);
    Account account = accountSessionService.getAccount();

    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * online Disk.
   *
   * @return ACTION_RETURN_STRING
   */
  public String onlineDisk() {
    logger.debug("DiskAction launchDisk()");
    Account account = accountSessionService.getAccount();

    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }

    InstanceMetadataThrift instanceMetaData = new InstanceMetadataThrift();
    ArchiveMetadataThrift archiveMetadata = new ArchiveMetadataThrift();
    try {
      logger.debug("instanceId:[{}] endPoint:[{}] archiveId:[{}] diskName:[{}]", this.instanceId,
          this.endPoint,
          this.archiveId, this.diskName);
      instanceMetaData.setInstanceId(Long.parseLong(this.instanceId));
      instanceMetaData.setEndpoint(this.endPoint);
      archiveMetadata.setType(ArchiveTypeThrift.valueOf(archiveType));
      archiveMetadata.setArchiveId(Long.valueOf(archiveId));
      archiveMetadata.setDevName(diskName);
      diskService.onlineDisk(instanceMetaData, archiveMetadata,
          Long.parseLong(account.getAccountId()));
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    } catch (DiskNotFoundExceptionThrift e) {
      resultMessage.setMessage(ErrorCode2.ERROR_0035_DiskNotFound);
    } catch (NumberFormatException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    } catch (DiskHasBeenOnlineThrift e) {
      resultMessage.setMessage(ErrorCode2.ERROR_0036_DiskHasBeenLaunched);
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (AccessDeniedExceptionThrift e) {
      resultMessage.setMessage(ErrorCode2.ERROR_0016_NoPermission);
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (InternalErrorThrift e) {
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
   * online Disk With Settle Archive Type.
   *
   * @return ACTION_RETURN_STRING
   */
  public String onlineDiskWithSettleArchiveType() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    logger.debug("instanceId:[{}] endPoint:[{}] archiveId:[{}] archiveTypesJson:[{}]",
        this.instanceId,
        this.endPoint, this.archiveId, archiveTypesJson);
    if (!StringUtils.isEmpty(instanceId) && !StringUtils.isEmpty(endPoint) && !StringUtils.isEmpty(
        diskName)
        && !StringUtils.isEmpty(archiveId) && !StringUtils.isEmpty(archiveTypesJson)) {
      InstanceMetadataThrift instance = new InstanceMetadataThrift();
      instance.setInstanceId(Long.valueOf(instanceId));
      instance.setEndpoint(endPoint);
      logger.debug("archiveTypesJson is {}", archiveTypesJson);
      JSONArray typesJsonArray = JSONArray.fromObject(archiveTypesJson);
      List<ArchiveTypeThrift> archiveTypes = new ArrayList<>();
      for (int i = 0; i < typesJsonArray.size(); i++) {
        archiveTypes.add(ArchiveTypeThrift.valueOf((String) typesJsonArray.get(i)));
      }
      try {
        diskService.settleArchiveType(Long.valueOf(account.getAccountId()), Long.valueOf(archiveId),
            diskName,
            instance, archiveTypes);
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      } catch (EndPointNotFoundException e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_EndPointNotFound");
      } catch (DiskNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage(ErrorCode2.ERROR_0035_DiskNotFound);
      } catch (InternalErrorThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_NetworkErrorException");
      } catch (ArchiveManagerNotSupportExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_ArchiveManagerNotSupportException");
      } catch (ServiceIsNotAvailableThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
      } catch (ServiceHavingBeenShutdownThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
      } catch (PermissionNotGrantExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_PermissionNotGrantException");
      } catch (DiskSizeCanNotSupportArchiveTypesThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_DiskSizeCanNotSupportArchiveTypes");
      } catch (NetworkErrorExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_NetworkErrorException");
      } catch (DiskHasBeenOfflineThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_DiskHasBeenOffline");
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
   * offline Disk.
   *
   * @return ACTION_RETURN_STRING
   */
  public String offlineDisk() {
    logger.debug("DiskAction unlaunchDisk()");
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }

    InstanceMetadataThrift instanceMetaData = new InstanceMetadataThrift();
    ArchiveMetadataThrift archiveMetadata = new ArchiveMetadataThrift();
    try {
      logger.debug("instanceId:[{}] endPoint:[{}] archiveId:[{}] diskName:[{}]", this.instanceId,
          this.endPoint,
          this.archiveId, this.diskName);
      instanceMetaData.setInstanceId(Long.parseLong(this.instanceId));
      instanceMetaData.setEndpoint(this.endPoint);
      archiveMetadata.setType(ArchiveTypeThrift.valueOf(archiveType));
      archiveMetadata.setArchiveId(Long.valueOf(archiveId));
      archiveMetadata.setDevName(diskName);
      diskService.offlineDisk(instanceMetaData, archiveMetadata,
          Long.parseLong(account.getAccountId()));
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    } catch (DiskNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0035_DiskNotFound);
    } catch (NumberFormatException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    } catch (DiskHasBeenOfflineThrift e) {
      resultMessage.setMessage(ErrorCode2.ERROR_0037_DiskHasBeenUnlaunched);
    } catch (DiskIsBusyThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0040_DiskBusy);
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (AccessDeniedExceptionThrift e) {
      resultMessage.setMessage(ErrorCode2.ERROR_0016_NoPermission);
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
      ;
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
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
   * fix Broken Disk.
   *
   * @return ACTION_RETURN_STRING
   */
  public String fixBrokenDisk() {
    logger.debug("DiskAction reuseBrokenDisk()");
    Account account = accountSessionService.getAccount();

    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }

    InstanceMetadataThrift instanceMetaData = new InstanceMetadataThrift();
    try {
      logger.debug("instanceId:[{}] endPoint:[{}] archiveId:[{}]", this.instanceId, this.endPoint,
          this.archiveId);
      instanceMetaData.setInstanceId(Long.parseLong(this.instanceId));
      ArchiveMetadataThrift archiveMetadata = new ArchiveMetadataThrift();
      instanceMetaData.setInstanceId(Long.parseLong(this.instanceId));
      instanceMetaData.setEndpoint(this.endPoint);
      archiveMetadata.setType(ArchiveTypeThrift.valueOf(archiveType));
      archiveMetadata.setArchiveId(Long.valueOf(archiveId));
      archiveMetadata.setDevName(diskName);
      diskService.fixBrokenDisk(instanceMetaData, archiveMetadata,
          Long.parseLong(account.getAccountId()));
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    } catch (DiskNotFoundExceptionThrift e) {
      resultMessage.setMessage(ErrorCode2.ERROR_0035_DiskNotFound);
    } catch (NumberFormatException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    } catch (DiskNotBrokenThrift e) {
      resultMessage.setMessage(ErrorCode2.ERROR_0036_DiskHasBeenLaunched);
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (AccessDeniedExceptionThrift e) {
      resultMessage.setMessage(ErrorCode2.ERROR_0016_NoPermission);
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
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
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * fix Config Mismatch Disk.
   *
   * @return ACTION_RETURN_STRING
   */
  public String fixConfigMismatchDisk() {
    logger.debug("DiskAction reuseConfigMismatchDisk");
    Account account = accountSessionService.getAccount();

    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }

    InstanceMetadataThrift instanceMetaData = new InstanceMetadataThrift();
    ArchiveMetadataThrift archiveMetadata = new ArchiveMetadataThrift();
    try {
      logger.debug("instanceId:[{}] endPoint:[{}] archiveId:[{}]", this.instanceId, this.endPoint,
          this.archiveId);
      instanceMetaData.setInstanceId(Long.parseLong(this.instanceId));
      instanceMetaData.setEndpoint(this.endPoint);
      archiveMetadata.setType(ArchiveTypeThrift.valueOf(archiveType));
      archiveMetadata.setArchiveId(Long.valueOf(archiveId));
      archiveMetadata.setDevName(diskName);
      diskService
          .fixConfigMismatchedDisk(instanceMetaData, archiveMetadata,
              Long.parseLong(account.getAccountId()));
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    } catch (DiskNotFoundExceptionThrift e) {
      resultMessage.setMessage(ErrorCode2.ERROR_0035_DiskNotFound);
    } catch (NumberFormatException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    } catch (DiskNotMismatchConfigThrift e) {
      resultMessage.setMessage(ErrorCode2.ERROR_0039_DiskNotConfigMismatch);
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (AccessDeniedExceptionThrift e) {
      resultMessage.setMessage(ErrorCode2.ERROR_0016_NoPermission);
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
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
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * list Instance MetaData.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listInstanceMetaData() {
    logger.debug("listInstanceMetaData begin");
    Account account = accountSessionService.getAccount();
    if (account == null) {
      return ERROR;
    }
    try {
      instanceMetadataList = diskService.listInstanceMetadata();
      orderDir = "asc";
      Collections.sort(instanceMetadataList, new SortByEndpoint());
      dataMap.put("instanceMetadataList", instanceMetadataList);
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
    } catch (TException e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * list Instance MetaData DT.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listInstanceMetaDataDt() {
    logger.debug("listInstanceMetaData begin");
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
    String[] cols = {"null", "instanceId", "endPoint", "capacity", "logicalCapacity", "freeSpace"};
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
    try {
      instanceMetadataList = diskService.listInstanceMetadata();
      List<SimpleInstanceMetadata> instanceMetadataTmpList = new ArrayList<>();

      // search
      recordsTotal = String.valueOf(instanceMetadataList.size());

      if (!searchValue.equals("")) {
        for (SimpleInstanceMetadata instance : instanceMetadataList) {
          if (instance.getEndPoint().toLowerCase().contains(searchValue.toLowerCase())) {
            instanceMetadataTmpList.add(instance);
          }
        }
      } else {
        instanceMetadataTmpList.addAll(instanceMetadataList);
      }
      recordsFiltered = String.valueOf(instanceMetadataTmpList.size());

      switch (orderColumn) {
        case "id":
          Collections.sort(instanceMetadataTmpList, new SortById());
          break;
        case "endPoint":
          Collections.sort(instanceMetadataTmpList, new SortByEndpoint());
          break;
        case "capacity":
          Collections.sort(instanceMetadataTmpList, new SortByCapacity());
          break;
        case "logicCapacity":
          Collections.sort(instanceMetadataTmpList, new SortByLogicCapacity());
          break;
        case "freeSpace":
          Collections.sort(instanceMetadataTmpList, new SortByFreeSpace());
          break;
        default:
          Collections.sort(instanceMetadataTmpList, new SortByEndpoint());
      }
      // pagination
      instanceMetadataList.clear();
      int size = Integer.parseInt(start) + Integer.parseInt(length);
      if (size > instanceMetadataTmpList.size()) {
        size = instanceMetadataTmpList.size();
      }
      for (int i = Integer.parseInt(start); i < size; i++) {
        instanceMetadataList.add(instanceMetadataTmpList.get(i));
      }
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
    } catch (TException e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }

    dataMap.put("data", instanceMetadataList);
    dataMap.put("recordsTotal", recordsTotal);
    dataMap.put("recordsFiltered", recordsFiltered);
    dataMap.put("draw", draw);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * list All Disk.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listAllDisk() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<SimpleArchiveMetadata> diskList = new ArrayList<>();
    try {
      List<SimpleArchiveMetadata> diskListTmp = new ArrayList<>();
      diskList = diskService.listAllDisks(Long.valueOf(account.getAccountId()));
      logger.debug("diskList is {}", diskList);
      logger.debug("storageType is {}", storageType);
      if (!StringUtils.isEmpty(storageType)) {
        for (SimpleArchiveMetadata disk : diskList) {
          if (disk.getStorageType().equals(storageType)) {
            diskListTmp.add(disk);
          }
        }
        diskList.clear();
        diskList.addAll(diskListTmp);
        diskListTmp.clear();
      }
      if (!StringUtils.isEmpty(statusLevel)) {
        if ("GOOD".equals(statusLevel)) {
          for (SimpleArchiveMetadata disk : diskList) {
            if (disk.getStatus().equals(ArchiveStatus.OFFLINING) || disk.getStatus()
                .equals(ArchiveStatus.GOOD) || disk.getStatus().equals(ArchiveStatus.OFFLINED)) {
              diskListTmp.add(disk);
            }
          }
        } else if ("BAD".equals(statusLevel)) {
          for (SimpleArchiveMetadata disk : diskList) {
            if (!(disk.getStatus().equals(ArchiveStatus.OFFLINING) || disk.getStatus()
                .equals(ArchiveStatus.GOOD) || disk.getStatus().equals(ArchiveStatus.OFFLINED))) {
              diskListTmp.add(disk);
            }
          }
        }
        diskList.clear();
        diskList.addAll(diskListTmp);
        diskListTmp.clear();

      }
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
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage(ERROR_0039_ServiceHavingBeenShutdown);
    } catch (TException e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("diskList", diskList);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * get Disk.
   *
   * @return ACTION_RETURN_STRING
   */
  public String getDisk() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<SimpleArchiveMetadata> diskList = new ArrayList<>();
    List<Long> diskIdsList = null;
    try {
      if (diskIds != null && diskIds.length() != 0) {
        JSONArray pooIdsJsonArray = JSONArray.fromObject(diskIds);
        diskIdsList = (List<Long>) JSONArray.toList(pooIdsJsonArray, Long.class);
        logger.debug("diskIdsList is {}", diskIdsList);
      }
      diskList = diskService.getDiskDetail(diskIdsList, Long.valueOf(account.getAccountId()));

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
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage(ERROR_0039_ServiceHavingBeenShutdown);
    } catch (TException e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("diskList", diskList);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * get Servernode By Id.
   *
   * @return ACTION_RETURN_STRING
   */
  public String getServernodeById() {
    Account account = accountSessionService.getAccount();

    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    ServerNode node = new ServerNode();

    try {
      node = diskService.getServerNode(Long.valueOf(account.getAccountId()), serverId);
      dataMap.put("node", node);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage(ERROR_0039_ServiceHavingBeenShutdown);
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (Exception e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }

    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * list Servernodes.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listServernodes() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<ServerNode> nodeList = new ArrayList<>();
    try {
      nodeList = diskService.listServernodes(Long.valueOf(account.getAccountId()));
      List<ServerNode> nodeListTmp = new ArrayList<>();
      logger.debug("rackNo is{}", rackNo);
      logger.debug("ip is {}", ip);
      logger.debug("serverStatus is {}", serverStatus);
      if (!StringUtils.isEmpty(rackNo)) {
        for (ServerNode list : nodeList) {
          // when rackNo is null
          if (rackNo.equals("searchNull")) {
            if (list.getRackNo() == null) {
              nodeListTmp.add(list);
            }
          } else {
            if (rackNo.equals(list.getRackNo())) {
              nodeListTmp.add(list);
            }
          }

        }
        logger.debug("nodeListTmp is {}", nodeListTmp);
        nodeList.clear();
        nodeList.addAll(nodeListTmp);
        nodeListTmp.clear();
      }

      if (!StringUtils.isEmpty(serverStatus)) {
        for (ServerNode list : nodeList) {
          if (list.getStatus().equals(serverStatus)) {
            nodeListTmp.add(list);
          }
        }
        logger.debug("nodeListTmp is {}", nodeListTmp);
        nodeList.clear();
        nodeList.addAll(nodeListTmp);
        nodeListTmp.clear();
      }
      if (!StringUtils.isEmpty(ip)) {
        for (ServerNode list : nodeList) {
          if (list.getNetworkCardInfo().contains(ip)) {
            nodeListTmp.add(list);
          }
        }
        logger.debug("nodeListTmp is {}", nodeListTmp);
        nodeList.clear();
        nodeList.addAll(nodeListTmp);
        nodeListTmp.clear();
      }

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
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (NotEnoughSpaceExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NotEnoughSpaceException");
    } catch (TTransportException e) {
      logger.error("exception catch ", e);
      resultMessage.setMessage("ERROR_TTransportException");
    } catch (InternalErrorThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage(ERROR_0039_ServiceHavingBeenShutdown);
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_PermissionNotGrantException");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_PermissionNotGrantException");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_PermissionNotGrantException");
    } catch (Exception e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("nodeList", nodeList);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;

  }

  public String makeRandom() {
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * list ServerNodes Format Layer.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listServerNodesFormatLayer() {
    Account account = accountSessionService.getAccount();

    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<ServerNode> nodeList = new ArrayList<>();
    Map<String, List<ServerNode>> serverNodeMap = new HashMap<>();
    try {
      nodeList = diskService.listServernodes(Long.valueOf(account.getAccountId()));

      for (ServerNode node : nodeList) {
        String nodeRackNo = "null";
        if (node.getRackNo() != null) {
          nodeRackNo = node.getRackNo();
        }
        if (serverNodeMap.containsKey(nodeRackNo)) {
          serverNodeMap.get(nodeRackNo).add(node);
        } else {
          List<ServerNode> serverNodeList = new ArrayList<>();
          serverNodeList.add(node);
          serverNodeMap.put(nodeRackNo, serverNodeList);
        }
      }

      if (!StringUtils.isEmpty(rackNo)) {
        if (serverNodeMap.containsKey(rackNo)) {
          List<ServerNode> serverNodeListTmp = serverNodeMap.get(rackNo);
          serverNodeMap.clear();
          serverNodeMap.put(rackNo, serverNodeListTmp);
        } else {
          serverNodeMap.clear();
        }

      }

      if (!StringUtils.isEmpty(serverStatus)) {
        Map<String, List<ServerNode>> tmpMap = new HashMap<>();
        for (Map.Entry<String, List<ServerNode>> entry : serverNodeMap.entrySet()) {
          List<ServerNode> list = entry.getValue();
          List<ServerNode> listTmp = new ArrayList<>();
          for (ServerNode node : list) {
            logger.debug("node.getStatus() is {},status is {} ", node.getStatus(), serverStatus);
            if (node.getStatus().equals(serverStatus)) {
              listTmp.add(node);
            }

          }
          if (listTmp.size() != 0) {
            String rackNo = entry.getKey();
            logger.debug("listTmp is {}", listTmp);
            tmpMap.put(rackNo, listTmp);
          }
        }

        serverNodeMap.clear();
        logger.debug("tmpMap is {}", tmpMap);
        serverNodeMap.putAll(tmpMap);
        logger.debug("serverNodeMap1 is {}", serverNodeMap);
      }

      logger.debug("ip is {}", ip);
      if (!StringUtils.isEmpty(ip)) {
        Map<String, List<ServerNode>> mapTmp = new HashMap<>();
        for (Map.Entry<String, List<ServerNode>> entry : serverNodeMap.entrySet()) {
          List<ServerNode> serverNodeListTmp = entry.getValue();
          List<ServerNode> listTmp = new ArrayList<>();
          for (ServerNode node : serverNodeListTmp) {
            if (node.getNetworkCardInfo().contains(ip)) {
              logger.debug("node.getNetworkCardInfo() is {},ip is {} ", node.getNetworkCardInfo(),
                  ip);
              listTmp.add(node);

            }

          }
          if (listTmp.size() != 0) {
            String rackNoTmp = entry.getKey();
            logger.debug("listTmp is {}", listTmp);
            mapTmp.put(rackNoTmp, listTmp);
          }

        }
        serverNodeMap.clear();
        serverNodeMap.putAll(mapTmp);

      }
      logger.debug("serverNodeMap is {}", serverNodeMap);
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
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (NotEnoughSpaceExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NotEnoughSpaceException");
    } catch (TTransportException e) {
      logger.error("exception catch ", e);
      resultMessage.setMessage("ERROR_TTransportException");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage(ERROR_0039_ServiceHavingBeenShutdown);
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_PermissionNotGrantException");
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
    dataMap.put("serverNodeMap", serverNodeMap);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;

  }

  /**
   * delete Server Nodes.
   *
   * @return ACTION_RETURN_STRING
   */
  public String deleteServerNodes() {
    Account account = accountSessionService.getAccount();

    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }

    logger.debug("idsJson is {}", idsJson);
    JSONArray idsJsonArray = JSONArray.fromObject(idsJson);
    List<String> idsList = (List<String>) JSONArray.toList(idsJsonArray, String.class);
    try {
      diskService.deleteServerNodes(Long.valueOf(account.getAccountId()), idsList);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ERROR_0039_ServiceHavingBeenShutdown);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_PermissionNotGrantException");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (ServerNodeIsUnknownThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_ServerNodeIsUnknown");
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
   * update Servernode.
   *
   * @return ACTION_RETURN_STRING
   */
  public String updateServernode() {
    Account account = accountSessionService.getAccount();

    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    ServerNode node = new ServerNode();

    if (!StringUtils.isEmpty(serverId)) {
      node.setServerId(serverId);
    }
    if (!StringUtils.isEmpty(hostName)) {
      node.setHostName(hostName);
    }
    if (!StringUtils.isEmpty(manageIp)) {
      node.setManageIp(manageIp);
    }
    if (!StringUtils.isEmpty(rackNo)) {
      node.setRackNo(rackNo);
    }
    if (!StringUtils.isEmpty(slotNo)) {
      node.setSlotNo(slotNo);
    }
    if (!StringUtils.isEmpty(storeIp)) {
      node.setStoreIp(storeIp);
    }
    if (!StringUtils.isEmpty(childFramNo)) {
      node.setChildFramNo(childFramNo);
    }

    if (!StringUtils.isEmpty(diskInfo)) {
      node.setDiskInfo(diskInfo);
    }
    if (!StringUtils.isEmpty(cpuInfo)) {
      node.setCpuInfo(cpuInfo);
    }
    if (!StringUtils.isEmpty(gatewayIp)) {
      node.setGatewayIp(gatewayIp);
    }
    if (!StringUtils.isEmpty(modelInfo)) {
      node.setModelInfo(modelInfo);
    }
    if (!StringUtils.isEmpty(networkCardInfo)) {
      node.setNetworkCardInfo(networkCardInfo);
    }
    if (!StringUtils.isEmpty(memoryInfo)) {
      node.setMemoryInfo(memoryInfo);
    }

    try {
      diskService.updateServernode(node, Long.valueOf(account.getAccountId()));
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ERROR_0039_ServiceHavingBeenShutdown);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (ServerNodePositionIsRepeatExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_ServerNodePositionIsRepeatException");
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_PermissionNotGrantException");
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

    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * mark Instance Maintenance.
   *
   * @return ACTION_RETURN_STRING
   */
  public String markInstanceMaintenance() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    if (!StringUtils.isEmpty(durationInMinutes) && !StringUtils.isEmpty(instanceId) && !StringUtils
        .isEmpty(instanceIp)) {
      try {
        diskService.markInstanceMaintenance(Long.valueOf(account.getAccountId()),
            Long.valueOf(instanceId),
            instanceIp, Long.valueOf(durationInMinutes));
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      } catch (ServiceIsNotAvailableThrift e) {
        logger.error("caught an exception ", e);
        resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
      } catch (ServiceHavingBeenShutdownThrift e) {
        logger.error("caught an exception ", e);
        resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
      } catch (PermissionNotGrantExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_PermissionNotGrantException");
      } catch (AccountNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage(ErrorCode2.ERROR_0003_AccountNotExists);
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
   * obtain Disk Smart Info.
   *
   * @return ACTION_RETURN_STRING
   */
  public String obtainDiskSmartInfo() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<SmartInfo> smartInfoList = new ArrayList<>();
    if (StringUtils.isEmpty(serverId) || StringUtils.isEmpty(diskName)) {
      logger.error("Invalid input ");
      resultMessage.setMessage("ERROR_0040_InvalidInput");
      dataMap.put("smartInfoList", smartInfoList);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }

    try {
      smartInfoList = diskService.obtainDiskSmartInfo(serverId, diskName);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_PermissionNotGrantException");
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0003_AccountNotExists);
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (DiskNameIllegalExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_DiskNameIllegalException");
    } catch (ServerNodeNotExistExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_ServerNodeNotExistException");
    } catch (TException e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("smartInfoList", smartInfoList);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * param instanceId.
   *
   * @return ACTION_RETURN_STRING
   */
  public String cancelInstanceMaintenance() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    if (!StringUtils.isEmpty(instanceId)) {
      try {
        diskService.cancelInstanceMaintenance(Long.valueOf(account.getAccountId()),
            Long.valueOf(instanceId));
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      } catch (ServiceIsNotAvailableThrift e) {
        logger.error("caught an exception ", e);
        resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
      } catch (ServiceHavingBeenShutdownThrift e) {
        logger.error("caught an exception ", e);
        resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
      } catch (PermissionNotGrantExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage("ERROR_PermissionNotGrantException");
      } catch (AccountNotFoundExceptionThrift e) {
        logger.error("Exception catch ", e);
        resultMessage.setMessage(ErrorCode2.ERROR_0003_AccountNotExists);
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

  class SortById implements Comparator<SimpleInstanceMetadata> {

    public int compare(SimpleInstanceMetadata s1, SimpleInstanceMetadata s2) {
      if (s1.getInstanceId().equals(s2.getInstanceId())) {
        return 0;
      }
      if (s1.getInstanceId().compareTo(s2.getInstanceId()) > 0) {
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

  class SortByEndpoint implements Comparator<SimpleInstanceMetadata> {

    public int compare(SimpleInstanceMetadata s1, SimpleInstanceMetadata s2) {
      if (s1.getEndPoint().equals(s2.getEndPoint())) {
        return 0;
      }
      if (s1.getEndPoint().compareToIgnoreCase(s2.getEndPoint()) > 0) {
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

  class SortByCapacity implements Comparator<SimpleInstanceMetadata> {

    public int compare(SimpleInstanceMetadata s1, SimpleInstanceMetadata s2) {
      if (s1.getCapacity() == s2.getCapacity()) {
        return 0;
      }
      if (s1.getCapacity() > s2.getCapacity()) {
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

  class SortByLogicCapacity implements Comparator<SimpleInstanceMetadata> {

    public int compare(SimpleInstanceMetadata s1, SimpleInstanceMetadata s2) {
      if (s1.getLogicalCapacity() == s2.getLogicalCapacity()) {
        return 0;
      }

      if (s1.getLogicalCapacity() > s2.getLogicalCapacity()) {
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

  class SortByFreeSpace implements Comparator<SimpleInstanceMetadata> {

    public int compare(SimpleInstanceMetadata s1, SimpleInstanceMetadata s2) {
      if (s1.getFreeSpace() == s2.getFreeSpace()) {
        return 0;
      }
      if (s1.getFreeSpace() > s2.getFreeSpace()) {
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
   * list Disk.
   *
   * @return ACTION_RETURN_STRING
   */
  // diskType:GOOD,BAD,ALL
  public String listDisk() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    HashMap<SimpleInstance, List<SimpleArchiveMetadata>> diskMap = new HashMap<SimpleInstance,
        List<SimpleArchiveMetadata>>();

    try {
      List<SimpleInstanceMetadata> allDatanode = diskService.listInstanceMetadata();
      if (allDatanode != null && allDatanode.size() != 0) {
        for (SimpleInstanceMetadata datanode : allDatanode) {
          List<SimpleArchiveMetadata> diskList = new ArrayList<>();
          diskList = diskService.getArchives(Long.valueOf(datanode.getInstanceId()));
          SimpleInstance simpleInstance = instanceService
              .getInstances(Long.parseLong(datanode.getInstanceId()));
          if (StringUtils.isEmpty(diskType) || "ALL".equals(diskType)) {
            diskMap.put(simpleInstance, diskList);
          }
          if ("GOOD".equals(diskType)) {
            List<SimpleArchiveMetadata> diskListTmp = new ArrayList<>();
            for (SimpleArchiveMetadata disk : diskList) {
              if (disk.getStatus().equals(ArchiveStatus.OFFLINING) || disk.getStatus()
                  .equals(ArchiveStatus.GOOD) || disk.getStatus().equals(ArchiveStatus.OFFLINED)) {
                diskListTmp.add(disk);
                diskMap.put(simpleInstance, diskListTmp);
              }
            }

          }
          if ("BAD".equals(diskType)) {
            List<SimpleArchiveMetadata> diskListTmp = new ArrayList<>();
            for (SimpleArchiveMetadata disk : diskList) {
              if (!(disk.getStatus().equals(ArchiveStatus.OFFLINING) || disk.getStatus()
                  .equals(ArchiveStatus.GOOD) || disk.getStatus().equals(ArchiveStatus.OFFLINED))) {
                diskListTmp.add(disk);
                diskMap.put(simpleInstance, diskListTmp);
              }
            }
          }

        }
      }
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (EndPointNotFoundException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TooManyEndPointFoundException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_TooManyEndPointFoundException");
    } catch (GenericThriftClientFactoryException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_GenericThriftClientFactoryException");
    } catch (TException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resultMessage", resultMessage);
    dataMap.put("diskMap", diskMap);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * get Disk Count.
   *
   * @return ACTION_RETURN_STRING
   */
  public String getDiskCount() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    int goodDiskCount = 0;
    long badDiskCount = 0;
    long allDiskCount = 0;

    try {
      List<SimpleInstanceMetadata> allDatanode = diskService.listInstanceMetadata();
      if (allDatanode != null && allDatanode.size() != 0) {
        for (SimpleInstanceMetadata datanode : allDatanode) {
          List<SimpleArchiveMetadata> diskList = new ArrayList<>();
          diskList = diskService.getArchives(Long.valueOf(datanode.getInstanceId()));

          for (SimpleArchiveMetadata disk : diskList) {
            allDiskCount++;
            if (disk.getStatus().equals(ArchiveStatus.OFFLINING) || disk.getStatus()
                .equals(ArchiveStatus.GOOD) || disk.getStatus().equals(ArchiveStatus.OFFLINED)) {
              goodDiskCount++;
            } else {
              badDiskCount++;
            }
          }

        }
      }
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (EndPointNotFoundException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TooManyEndPointFoundException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_TooManyEndPointFoundException");
    } catch (GenericThriftClientFactoryException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_GenericThriftClientFactoryException");
    } catch (TException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resultMessage", resultMessage);
    dataMap.put("goodDiskCount", goodDiskCount);
    dataMap.put("badDiskCount", badDiskCount);
    dataMap.put("allDiskCount", allDiskCount);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * list Archive MetaData.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listArchiveMetaData() {
    logger.debug("listArchiveMetaData begin");
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }

    logger.debug("current instance id is {}", this.instanceId);
    try {
      archiveMetadataList = diskService.getArchives(Long.parseLong(this.instanceId));

      logger.debug("archiveMetadataList is {}", archiveMetadataList);

      if (sortBy != null) {
        switch (sortBy) {
          case "id":
            Collections.sort(archiveMetadataList, new SortByArchiveId());
            break;
          case "serialNumber":
            Collections.sort(archiveMetadataList, new SortBySerialNumber());
            break;
          case "name":
            Collections.sort(archiveMetadataList, new SortByDiskName());
            break;
          default:
            Collections.sort(archiveMetadataList, new SortByDiskName());
        }
      }
    } catch (EndPointNotFoundException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TooManyEndPointFoundException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_TooManyEndPointFoundException");
    } catch (GenericThriftClientFactoryException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_GenericThriftClientFactoryException");
    } catch (TException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resultMessage", resultMessage);
    dataMap.put("archiveMetadataList", archiveMetadataList);
    return Constants.ACTION_RETURN_STRING;
  }

  class SortByArchiveId implements Comparator<SimpleArchiveMetadata> {

    public int compare(SimpleArchiveMetadata s1, SimpleArchiveMetadata s2) {
      if (s1.getArchiveId().compareToIgnoreCase(s2.getArchiveId()) > 0) {
        if (sortOrder.equals("up")) {
          return 1;
        }
        return -1;
      }
      if (sortOrder.equals("up")) {
        return -1;
      }
      return 1;
    }
  }

  class SortBySerialNumber implements Comparator<SimpleArchiveMetadata> {

    public int compare(SimpleArchiveMetadata s1, SimpleArchiveMetadata s2) {
      if (s1.getSerialNumber().compareToIgnoreCase(s2.getSerialNumber()) > 0) {
        if (sortOrder.equals("up")) {
          return 1;
        }
        return -1;
      }
      if (sortOrder.equals("up")) {
        return -1;
      }
      return 1;
    }
  }

  class SortByDiskName implements Comparator<SimpleArchiveMetadata> {

    public int compare(SimpleArchiveMetadata s1, SimpleArchiveMetadata s2) {
      if (s1.getDeviceName().equals(s2.getDeviceName())) {
        return 0;
      }
      if (s1.getDeviceName().compareToIgnoreCase(s2.getDeviceName()) > 0) {
        if (sortOrder.equals("up")) {
          return 1;
        }
        return -1;
      }
      if (sortOrder.equals("up")) {
        return -1;
      }
      return 1;
    }
  }

  public String getInstanceId() {
    return instanceId;
  }

  public void setInstanceId(String instanceId) {
    this.instanceId = instanceId;
  }

  public String getEndPoint() {
    return endPoint;
  }

  public void setEndPoint(String endPoint) {
    this.endPoint = endPoint;
  }

  public String getArchiveId() {
    return archiveId;
  }

  public void setArchiveId(String archiveId) {
    this.archiveId = archiveId;
  }

  public String getArchiveType() {
    return archiveType;
  }

  public void setArchiveType(String archiveType) {
    this.archiveType = archiveType;
  }

  public String getDiskType() {
    return diskType;
  }

  public void setDiskType(String diskType) {
    this.diskType = diskType;
  }

  public InstanceService getInstanceService() {
    return instanceService;
  }

  public void setInstanceService(InstanceService instanceService) {
    this.instanceService = instanceService;
  }

  public String getServerId() {
    return serverId;
  }

  public void setServerId(String serverId) {
    this.serverId = serverId;
  }

  public String getManageIp() {
    return manageIp;
  }

  public void setManageIp(String manageIp) {
    this.manageIp = manageIp;
  }

  public String getRackNo() {
    return rackNo;
  }

  public void setRackNo(String rackNo) {
    this.rackNo = rackNo;
  }

  public String getSlotNo() {
    return slotNo;
  }

  public void setSlotNo(String slotNo) {
    this.slotNo = slotNo;
  }

  public String getStoreIp() {
    return storeIp;
  }

  public void setStoreIp(String storeIp) {
    this.storeIp = storeIp;
  }

  public String getDiskInfo() {
    return diskInfo;
  }

  public void setDiskInfo(String diskInfo) {
    this.diskInfo = diskInfo;
  }

  public String getCpuInfo() {
    return cpuInfo;
  }

  public void setCpuInfo(String cpuInfo) {
    this.cpuInfo = cpuInfo;
  }

  public String getGatewayIp() {
    return gatewayIp;
  }

  public void setGatewayIp(String gatewayIp) {
    this.gatewayIp = gatewayIp;
  }

  public String getModelInfo() {
    return modelInfo;
  }

  public void setModelInfo(String modelInfo) {
    this.modelInfo = modelInfo;
  }

  public String getNetworkCardInfo() {
    return networkCardInfo;
  }

  public void setNetworkCardInfo(String networkCardInfo) {
    this.networkCardInfo = networkCardInfo;
  }

  public String getMemoryInfo() {
    return memoryInfo;
  }

  public void setMemoryInfo(String memoryInfo) {
    this.memoryInfo = memoryInfo;
  }

  public String getDiskName() {
    return diskName;
  }

  public void setDiskName(String diskName) {
    this.diskName = diskName;
  }

  public String getIdsJson() {
    return idsJson;
  }

  public void setIdsJson(String idsJson) {
    this.idsJson = idsJson;
  }

  public String getIp() {
    return ip;
  }

  public void setIp(String ip) {
    this.ip = ip;

  }

  public String getHostName() {
    return hostName;
  }

  public void setHostName(String hostName) {
    this.hostName = hostName;
  }

  public String getChildFramNo() {
    return childFramNo;
  }

  public void setChildFramNo(String childFramNo) {
    this.childFramNo = childFramNo;
  }

  public String getDiskLightStatus() {
    return diskLightStatus;
  }

  public void setDiskLightStatus(String diskLightStatus) {
    this.diskLightStatus = diskLightStatus;
  }

  public String getStorageType() {
    return storageType;
  }

  public void setStorageType(String storageType) {
    this.storageType = storageType;
  }

  public String getStatusLevel() {
    return statusLevel;
  }

  public void setStatusLevel(String statusLevel) {
    this.statusLevel = statusLevel;
  }

  public String getServerStatus() {
    return serverStatus;
  }

  public void setServerStatus(String serverStatus) {
    this.serverStatus = serverStatus;
  }

  public String getDiskIds() {
    return diskIds;
  }

  public void setDiskIds(String diskIds) {
    this.diskIds = diskIds;
  }

  public String getDurationInMinutes() {
    return durationInMinutes;
  }

  public void setDurationInMinutes(String durationInMinutes) {
    this.durationInMinutes = durationInMinutes;
  }

  public String getArchiveTypesJson() {
    return archiveTypesJson;
  }

  public void setArchiveTypesJson(String archiveTypesJson) {
    this.archiveTypesJson = archiveTypesJson;
  }

  public String getInstanceIp() {
    return instanceIp;
  }

  public void setInstanceIp(String instanceIp) {
    this.instanceIp = instanceIp;
  }
}
