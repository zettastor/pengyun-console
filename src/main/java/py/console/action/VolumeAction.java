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

import static py.console.utils.ErrorCode2.ERROR_0004_NoEnoughSpace;
import static py.console.utils.ErrorCode2.ERROR_0011_VolumeNotFound;
import static py.console.utils.ErrorCode2.ERROR_0012_VolumeNotAvailable;
import static py.console.utils.ErrorCode2.ERROR_0016_NoPermission;
import static py.console.utils.ErrorCode2.ERROR_0019_SessionOut;
import static py.console.utils.ErrorCode2.ERROR_0023_VolumeSizeNotMultipleOfSegmentSize;
import static py.console.utils.ErrorCode2.ERROR_0029_VolumHasBeenDeleted;
import static py.console.utils.ErrorCode2.ERROR_0030_RootVolumeHasBeenDeleted;
import static py.console.utils.ErrorCode2.ERROR_0031_RootVolumeNotFound;
import static py.console.utils.ErrorCode2.ERROR_0032_VolumeIsExtending;
import static py.console.utils.ErrorCode2.ERROR_0037_TooManyDrivers;
import static py.console.utils.ErrorCode2.ERROR_0038_NotRootVolume;
import static py.console.utils.ErrorCode2.ERROR_0039_ServiceHavingBeenShutdown;
import static py.console.utils.ErrorCode2.ERROR_0040_InvalidInput;
import static py.console.utils.ErrorCode2.ERROR_0042_DriverTypeConflict;
import static py.console.utils.ErrorCode2.ERROR_0080_VolumeWasRollbacking;
import static py.console.utils.ErrorCode2.ERROR_PermissionNotGrantException;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.opensymphony.xwork2.ActionContext;
import com.opensymphony.xwork2.ActionSupport;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import javax.servlet.http.HttpServletRequest;
import net.sf.json.JSONArray;
import org.apache.commons.lang.StringUtils;
import org.apache.struts2.ServletActionContext;
import org.apache.thrift.TException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import py.console.bean.Account;
import py.console.bean.FixVolumeResponse;
import py.console.bean.ResultMessage;
import py.console.bean.SegmentCompute;
import py.console.bean.SimpleArchive;
import py.console.bean.SimpleDriverMetadata;
import py.console.bean.SimpleInstance;
import py.console.bean.SimpleIoLimitation;
import py.console.bean.SimpleSegUnit;
import py.console.bean.SimpleSegmentMetadata;
import py.console.bean.SimpleVolumeAccessRule;
import py.console.bean.SimpleVolumeMetadata;
import py.console.service.account.AccountSessionService;
import py.console.service.domain.DomainService;
import py.console.service.instance.InstanceService;
import py.console.service.volume.VolumeService;
import py.console.utils.Constants;
import py.console.utils.ErrorCode2;
import py.console.utils.Utils;
import py.exception.EndPointNotFoundException;
import py.exception.GenericThriftClientFactoryException;
import py.exception.TooManyEndPointFoundException;
import py.io.qos.IoLimitation;
import py.thrift.share.AccessDeniedExceptionThrift;
import py.thrift.share.AccountNotFoundExceptionThrift;
import py.thrift.share.AlreadyExistStaticLimitationExceptionThrift;
import py.thrift.share.BadLicenseTokenExceptionThrift;
import py.thrift.share.ConnectPydDeviceOperationExceptionThrift;
import py.thrift.share.CreateBackstoresOperationExceptionThrift;
import py.thrift.share.CreateLoopbackLunsOperationExceptionThrift;
import py.thrift.share.CreateLoopbackOperationExceptionThrift;
import py.thrift.share.DomainIsDeletingExceptionThrift;
import py.thrift.share.DomainNotExistedExceptionThrift;
import py.thrift.share.DriverAmountAndHostNotFitThrift;
import py.thrift.share.DriverContainerIsIncExceptionThrift;
import py.thrift.share.DriverHostCannotUseThrift;
import py.thrift.share.DriverIpTargetThrift;
import py.thrift.share.DriverIsLaunchingExceptionThrift;
import py.thrift.share.DriverIsUpgradingExceptionThrift;
import py.thrift.share.DriverLaunchingExceptionThrift;
import py.thrift.share.DriverNameExistsExceptionThrift;
import py.thrift.share.DriverNotFoundExceptionThrift;
import py.thrift.share.DriverStillReportExceptionThrift;
import py.thrift.share.DriverTypeConflictExceptionThrift;
import py.thrift.share.DriverTypeIsConflictExceptionThrift;
import py.thrift.share.DriverUnmountingExceptionThrift;
import py.thrift.share.DynamicIoLimitationTimeInterleavingExceptionThrift;
import py.thrift.share.EndPointNotFoundExceptionThrift;
import py.thrift.share.ExistsClientExceptionThrift;
import py.thrift.share.ExistsDriverExceptionThrift;
import py.thrift.share.FailedToUmountDriverExceptionThrift;
import py.thrift.share.FrequentFixVolumeRequestThrift;
import py.thrift.share.GetScsiDeviceOperationExceptionThrift;
import py.thrift.share.InvalidInputExceptionThrift;
import py.thrift.share.LackDatanodeExceptionThrift;
import py.thrift.share.LaunchedVolumeCannotBeDeletedExceptionThrift;
import py.thrift.share.LicenseExceptionThrift;
import py.thrift.share.NetworkErrorExceptionThrift;
import py.thrift.share.NoDriverLaunchExceptionThrift;
import py.thrift.share.NoEnoughPydDeviceExceptionThrift;
import py.thrift.share.NotEnoughGroupExceptionThrift;
import py.thrift.share.NotEnoughLicenseTokenExceptionThrift;
import py.thrift.share.NotEnoughNormalGroupExceptionThrift;
import py.thrift.share.NotEnoughSpaceExceptionThrift;
import py.thrift.share.NotRootVolumeExceptionThrift;
import py.thrift.share.PermissionNotGrantExceptionThrift;
import py.thrift.share.ResourceNotExistsExceptionThrift;
import py.thrift.share.RootVolumeBeingDeletedExceptionThrift;
import py.thrift.share.RootVolumeNotFoundExceptionThrift;
import py.thrift.share.ScsiDeviceIsLaunchExceptionThrift;
import py.thrift.share.ServiceHavingBeenShutdownThrift;
import py.thrift.share.ServiceIsNotAvailableThrift;
import py.thrift.share.SnapshotRollingBackExceptionThrift;
import py.thrift.share.StoragePoolIsDeletingExceptionThrift;
import py.thrift.share.StoragePoolNotExistInDoaminExceptionThrift;
import py.thrift.share.StoragePoolNotExistedExceptionThrift;
import py.thrift.share.SystemCpuIsNotEnoughThrift;
import py.thrift.share.SystemMemoryIsNotEnoughThrift;
import py.thrift.share.TooManyDriversExceptionThrift;
import py.thrift.share.TooManyEndPointFoundExceptionThrift;
import py.thrift.share.TransportExceptionThrift;
import py.thrift.share.UnknownIpv4HostExceptionThrift;
import py.thrift.share.UnknownIpv6HostExceptionThrift;
import py.thrift.share.UselessLicenseExceptionThrift;
import py.thrift.share.VolumeBeingDeletedExceptionThrift;
import py.thrift.share.VolumeCannotBeRecycledExceptionThrift;
import py.thrift.share.VolumeDeletingExceptionThrift;
import py.thrift.share.VolumeExistingExceptionThrift;
import py.thrift.share.VolumeFixingOperationExceptionThrift;
import py.thrift.share.VolumeInExtendingExceptionThrift;
import py.thrift.share.VolumeInMoveOnlineDoNotHaveOperationExceptionThrift;
import py.thrift.share.VolumeIsBeginMovedExceptionThrift;
import py.thrift.share.VolumeIsCloningExceptionThrift;
import py.thrift.share.VolumeIsCopingExceptionThrift;
import py.thrift.share.VolumeIsMovingExceptionThrift;
import py.thrift.share.VolumeLaunchMultiDriversExceptionThrift;
import py.thrift.share.VolumeNameExistedExceptionThrift;
import py.thrift.share.VolumeNotAvailableExceptionThrift;
import py.thrift.share.VolumeNotFoundExceptionThrift;
import py.thrift.share.VolumeOriginalSizeNotMatchExceptionThrift;
import py.thrift.share.VolumeSizeIllegalExceptionThrift;
import py.thrift.share.VolumeSizeNotMultipleOfSegmentSizeThrift;
import py.thrift.share.VolumeUnderOperationExceptionThrift;
import py.thrift.share.VolumeWasRollbackingExceptionThrift;
import py.volume.VolumeMetadata;
import py.volume.VolumeStatus;
import py.volume.VolumeType;
import py.volume.special.purpose.SpecialVolumeIdGenerator;

/**
 * VolumeAction.
 */
@SuppressWarnings("serial")
public class VolumeAction extends ActionSupport {

  private static final Logger logger = LoggerFactory.getLogger(VolumeAction.class);

  private AccountSessionService accountSessionService;

  private VolumeService volumeService;

  private InstanceService instanceService;

  private String sortBy;

  private String sortOrder;

  private String volumeId;

  private String volumeName;

  private String volumeSize;

  private String volumeType;

  private String volumeDomainId;

  private String volumeStoragepoolId;

  private String driverType;

  private String driverAmount;

  private String hosts;

  private String extendSize;

  private String upperLimitedIoPs;

  private String upperLimitedThroughput;

  private String lowerLimitedIoPs;

  private String lowerLimitedThroughput;

  private String startTime;

  private String endTime;

  private String forceUmount;

  private String limitType;

  private String getVolumeWithSegmentList;

  private String startSegmentIndex;

  private String endSegmentIndex;

  private long segmentSizeBytes;

  private String segmentStatus = "ALL";

  private String snapshotName;

  private String snapshotDesp;

  private String snapshotId;

  private String srcVolumeId;

  private String epoch;

  private String generation;

  private String hostName;

  private String cloneType;

  private String forCsi;

  private String nodeId;

  private String updateCsiLaunchCount;

  private List<SimpleDriverMetadata> simpleDriverMetadataList;

  private List<SimpleVolumeAccessRule> volumeAccessRuleList;

  private List<String> toApplyAccessRuleList;

  private List<String> toCancleAccessRuleList;

  private List<SimpleVolumeMetadata> volumeList;

  private List<SimpleVolumeMetadata> orphanVolumeList;

  private List<SimpleSegmentMetadata> segmentList;

  private SimpleVolumeMetadata simpleVolumeMetadata;

  private SimpleDriverMetadata simpleDriverMetadata;

  private ResultMessage resultMessage;

  private DomainService domainService;

  private Map<String, Object> dataMap;

  private String orderDir;

  private String diskName;

  private String unitStatus;

  private String lostDatanodesJson;

  private String idsJson;

  private String readWrite;

  private String description;
  private String driverContainerId;

  private String limitId;
  private String oriVolumeId;

  private String destVolumeId;

  private String statusLevel;

  private String driverName;

  private String domainId;

  private String poolId;

  private String enableLaunchMultiDrivers;
  private String scsiIp;
  private String isOpen;

  private String delaydate;

  /**
   * VolumeAction.
   */
  public VolumeAction() {
    super();
    this.dataMap = new HashMap<String, Object>();
    resultMessage = new ResultMessage();
  }

  /**
   * create Volume.
   *
   * @return ACTION_RETURN_STRING
   */
  public String createVolume() {
    logger.debug("VolumeAction createVolume(),current domain id is {}", volumeDomainId);
    Account account = accountSessionService.getAccount();
    simpleVolumeMetadata = new SimpleVolumeMetadata();
    if (account == null) {
      simpleVolumeMetadata.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("simpleVolumeMetadata", simpleVolumeMetadata);
      return Constants.ACTION_RETURN_STRING;
    }

    // check the volume name if exist in DB, if so, deny to create volumn
    SimpleVolumeMetadata simpleVolumeMetadataInDb = null;
    try {
      simpleVolumeMetadataInDb = volumeService
          .getVolumeNotDeadByName(this.volumeName, Long.valueOf(account.getAccountId()));
    } catch (VolumeNotFoundExceptionThrift e) {
      // empty
    }

    if (null != simpleVolumeMetadataInDb) {
      simpleVolumeMetadata.setMessage(ErrorCode2.ERROR_0028_SameVolumeNameExist);
      dataMap.put("simpleVolumeMetadata", simpleVolumeMetadata);
      return Constants.ACTION_RETURN_STRING;
    }

    VolumeMetadata volume;
    try {
      volume = buildVolumeFromRequest(Long.parseLong(account.getAccountId()));
    } catch (NumberFormatException e) {
      logger.error("Exception catch ", e);
      simpleVolumeMetadata.setMessage("ERROR_NumberFormat");
      dataMap.put("simpleVolumeMetadata", simpleVolumeMetadata);
      return Constants.ACTION_RETURN_STRING;
    }
    try {
      VolumeMetadata volumeMetadata = volumeService.createVolume(volume);
      if (volumeMetadata != null) {
        simpleVolumeMetadata.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
        simpleVolumeMetadata.setVolumeId(String.valueOf(volumeMetadata.getVolumeId()));
        simpleVolumeMetadata.setVolumeName(volumeMetadata.getName());
        simpleVolumeMetadata.setVolumeSize(Utils.volumeSizeBuilder(volumeMetadata.getVolumeSize()));
        simpleVolumeMetadata.setVolumeStatus(VolumeStatus.ToBeCreated.name());
        simpleVolumeMetadata.setVolumeDomain(volumeDomainId);
        simpleVolumeMetadata.setVolumeStoragePoolId(volumeStoragepoolId);

        dataMap.put("simpleVolumeMetadata", simpleVolumeMetadata);
        return Constants.ACTION_RETURN_STRING;
      }
    } catch (VolumeNameExistedExceptionThrift e) {
      logger.error("Exception catch ", e);
      simpleVolumeMetadata.setMessage(ErrorCode2.ERROR_0028_SameVolumeNameExist);
    } catch (NotEnoughSpaceExceptionThrift e) {
      logger.error("Exception catch ", e);
      simpleVolumeMetadata.setMessage(ErrorCode2.ERROR_0004_NoEnoughSpace);
    } catch (InvalidInputExceptionThrift e) {
      logger.error("Exception catch ", e);
      simpleVolumeMetadata.setMessage(ErrorCode2.ERROR_0040_InvalidInput);
    } catch (VolumeSizeNotMultipleOfSegmentSizeThrift e) {
      logger.error("Exception catch ", e);
      simpleVolumeMetadata.setMessage(ErrorCode2.ERROR_0023_VolumeSizeNotMultipleOfSegmentSize);
    } catch (AccessDeniedExceptionThrift e) { // ////////////////////////remark
      logger.error("Exception catch ", e);
      simpleVolumeMetadata.setMessage("ERROR_0051_AccessDenied");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("Exception catch ", e);
      simpleVolumeMetadata.setMessage(ErrorCode2.ERROR_0039_ServiceHavingBeenShutdown);
    } catch (VolumeExistingExceptionThrift e) {
      logger.error("Exception catch ", e);
      simpleVolumeMetadata.setMessage("ERROR_0051_VolumeIsExisted");
    } catch (BadLicenseTokenExceptionThrift e) {
      logger.error("Exception catch ", e);
      simpleVolumeMetadata.setMessage("ERROR_0052_BadLicenseToken");
    } catch (UselessLicenseExceptionThrift e) {
      logger.error("Exception catch ", e);
      simpleVolumeMetadata.setMessage("ERROR_0053_UselessLicense");
    } catch (NotEnoughLicenseTokenExceptionThrift e) {
      logger.error("Exception catch ", e);
      simpleVolumeMetadata.setMessage("ERROR_0054_NotEnoughLicenseToken");
    } catch (DomainNotExistedExceptionThrift e) {
      logger.error("Exception catch ", e);
      simpleVolumeMetadata.setMessage("ERROR_0046_DomainNotExisted");
    } catch (StoragePoolNotExistedExceptionThrift e) {
      logger.error("Exception catch ", e);
      simpleVolumeMetadata.setMessage("ERROR_0071_StoragePoolNotExisted");
    } catch (DomainIsDeletingExceptionThrift e) {
      logger.error("Exception catch ", e);
      simpleVolumeMetadata.setMessage("ERROR_0059_DomainIsDeleting");
    } catch (StoragePoolIsDeletingExceptionThrift e) {
      logger.error("Exception catch ", e);
      simpleVolumeMetadata.setMessage("ERROR_0072_StoragePoolIsDeleting");
    } catch (NotEnoughGroupExceptionThrift e) {
      logger.error("Exception catch ", e);
      if (e.getMinGroupsNumber() == 3) {
        simpleVolumeMetadata.setMessage("ERROR_NotEnoughGroupException3");
      } else {
        simpleVolumeMetadata.setMessage("ERROR_NotEnoughGroupException5");
      }
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("Exception catch ", e);
      simpleVolumeMetadata.setMessage(ERROR_PermissionNotGrantException);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("Exception catch ", e);
      simpleVolumeMetadata.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (VolumeNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      simpleVolumeMetadata.setMessage("ERROR_0011_VolumeNotFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("Exception catch ", e);
      simpleVolumeMetadata.setMessage("ERROR_NetworkErrorException");
    } catch (StoragePoolNotExistInDoaminExceptionThrift e) {
      logger.error("Exception catch ", e);
      simpleVolumeMetadata.setMessage("ERROR_StoragePoolNotExistInDomainException");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      simpleVolumeMetadata.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      simpleVolumeMetadata.setMessage("ERROR_EndPointNotFound");
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      simpleVolumeMetadata.setMessage("ERROR_0003_AccountNotExists");
    } catch (LicenseExceptionThrift e) {
      logger.error("Exception catch ", e);
      simpleVolumeMetadata.setMessage("ERROR_LicenseException");
    } catch (NotEnoughNormalGroupExceptionThrift e) {
      logger.error("Exception catch ", e);
      simpleVolumeMetadata.setMessage("ERROR_NotEnoughNormalGroupException");
    } catch (VolumeSizeIllegalExceptionThrift e) {
      logger.error("Exception catch ", e);
      simpleVolumeMetadata.setMessage("ERROR_VolumeSizeIllegalException");
    } catch (TException e) {
      logger.error("Exception catch ", e);
      simpleVolumeMetadata.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("simpleVolumeMetadata", simpleVolumeMetadata);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * pull Segment Size.
   *
   * @return ACTION_RETURN_STRING
   */
  public String pullSegmentSize() {
    segmentSizeBytes = volumeService.getStorageConfiguration().getSegmentSizeByte();
    dataMap.put("segmentSizeBytes", segmentSizeBytes);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * list Volume. param idsJSON(volumeId json list) param domainId param poolId
   *
   * @return ACTION_RETURN_STRING
   */
  public String listVolume() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      return ERROR;
    }
    volumeList = new ArrayList<SimpleVolumeMetadata>();
    List<SimpleVolumeMetadata> volumeTmpList = new ArrayList<SimpleVolumeMetadata>();
    List<Long> idsList = null;
    Set<Long> idsSet = null;
    if (idsJson != null && !idsJson.equals("")) {
      logger.debug("idsJSON is {}", idsJson);
      JSONArray idsJsonArray = JSONArray.fromObject(idsJson);
      idsList = (List<Long>) JSONArray.toList(idsJsonArray, Long.class);
      logger.debug("idsList is {}", idsList);
      idsSet = new HashSet<>();
      idsSet.addAll(idsList);
      logger.debug("idsSet is {}", idsSet);
    }

    try {
      volumeList = volumeService.getMultipleVolumes(Long.parseLong(account.getAccountId()), idsSet);
      if (!StringUtils.isEmpty(domainId)) {
        volumeTmpList.clear();
        volumeTmpList.addAll(volumeList);
        volumeList.clear();
        for (SimpleVolumeMetadata volume : volumeTmpList) {
          if (volume.getDomainId().equals(domainId)) {
            volumeList.add(volume);
          }
        }
      }
      if (!StringUtils.isEmpty(poolId)) {
        volumeTmpList.clear();
        volumeTmpList.addAll(volumeList);
        volumeList.clear();
        for (SimpleVolumeMetadata volume : volumeTmpList) {
          if (volume.getVolumeStoragePoolId().equals(poolId)) {
            volumeList.add(volume);
          }
        }
      }
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      dataMap.put("resultMessage", resultMessage);

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
    // add catche type in to every volume in volumeList
    orderDir = "asc";
    Collections.sort(volumeList, new SortByName());
    dataMap.put("volumeList", volumeList);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * list Volume DT.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listVolumeDt() {
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
    String[] cols = {"volumeId", "null", "volumeName", "description", "null", "totalSpaceFroCsi",
        "usedSpaceForCsi", "volumeSize",
        "usedSize", "readOnlyForCsi",
        "volumeStatus", "volumeDomain", "storagePoolName", "freeSpaceRatio", "simpleConfiguration",
        "cacheType", "createTime", "migrationSpeed", "rebalanceRatio",
        "volumeBuildType", "clientLastConnectTime", "null"};

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
    // search
    volumeList = new ArrayList<SimpleVolumeMetadata>();
    List<SimpleVolumeMetadata> volumeTmpList = new ArrayList<>();
    try {
      volumeList = volumeService.getMultipleVolumes(Long.parseLong(account.getAccountId()), null);
      recordsTotal = String.valueOf(volumeList.size());

      if (!searchValue.equals("")) {
        for (SimpleVolumeMetadata volume : volumeList) {
          if (volume.getVolumeName().toLowerCase().contains(searchValue.toLowerCase())) {
            volumeTmpList.add(volume);
          }
        }
      } else {
        volumeTmpList.addAll(volumeList);
      }
      if (!StringUtils.isEmpty(statusLevel)) {
        volumeList.clear();
        volumeList.addAll(volumeTmpList);
        volumeTmpList.clear();
        for (int i = 0; i < volumeList.size(); i++) {
          if (statusLevel.equals("HEALTHY")) {
            if (!volumeList.get(i).getVolumeStatus().equals("Unavailable")) {
              volumeTmpList.add(volumeList.get(i));
            }
          } else if (statusLevel.equals("WRONG")) {
            if (volumeList.get(i).getVolumeStatus().equals("Unavailable")) {
              volumeTmpList.add(volumeList.get(i));
            }
          }
        }
      }

      recordsFiltered = String.valueOf(volumeTmpList.size());

      // sort
      logger.debug("orderColumn is {}", orderColumn);
      switch (orderColumn) {
        case "volumeId":
          Collections.sort(volumeTmpList, new SortById());
          break;
        case "volumeName":
          Collections.sort(volumeTmpList, new SortByName());
          break;
        case "description":
          Collections.sort(volumeTmpList, new SortByDescription());
          break;
        case "volumeSize":
          Collections.sort(volumeTmpList, new SortBySize());
          break;
        case "freeSize":
          Collections.sort(volumeTmpList, new SortByFreeSpace());
          break;
        case "usedSize":
          Collections.sort(volumeTmpList, new SortByUsedSize());
          break;
        case "totalSpaceFroCsi":
          Collections.sort(volumeTmpList, new SortByTotalSpaceCsi());
          break;
        case "usedSpaceForCsi":
          Collections.sort(volumeTmpList, new SortByUsedSpaceCsi());
          break;
        case "readOnlyForCsi":
          Collections.sort(volumeTmpList, new SortByReadOnly());
          break;
        case "volumeStatus":
          Collections.sort(volumeTmpList, new SortByStatus());
          break;
        case "volumeDomain":
          Collections.sort(volumeTmpList, new SortByDomain());
          break;
        case "storagePoolName":
          Collections.sort(volumeTmpList, new SortByPool());
          break;
        case "freeSpaceRatio":
          Collections.sort(volumeTmpList, new SortByFreeSpaceRatio());
          break;
        case "simpleConfiguration":
          Collections.sort(volumeTmpList, new SortBySimpleConfiguration());
          break;
        case "createTime":
          Collections.sort(volumeTmpList, new SortByCreateTime());
          break;

        case "clientLastConnectTime":
          Collections.sort(volumeTmpList, new SortByClientLastConnectTime());
          break;
        case "volumeBuildType":
          Collections.sort(volumeTmpList, new SortByVolumeBuildType());
          break;
        case "readWrite":
          Collections.sort(volumeTmpList, new SortByVolumeReadWrite());
          break;
        default:
          Collections.sort(volumeTmpList, new SortByName());
      }
      logger.debug("volumeTmpList is {}", volumeTmpList);
      // pagination
      volumeList.clear();
      int size = Integer.parseInt(start) + Integer.parseInt(length);
      if (size > volumeTmpList.size()) {
        size = volumeTmpList.size();
      }
      for (int i = Integer.parseInt(start); i < size; i++) {
        volumeList.add(volumeTmpList.get(i));
      }
      logger.debug("volumeList is {}", volumeList);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      dataMap.put("resultMessage", resultMessage);
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
    dataMap.put("data", volumeList);
    dataMap.put("recordsTotal", recordsTotal);
    dataMap.put("recordsFiltered", recordsFiltered);
    dataMap.put("draw", draw);
    dataMap.put("resultMessage", resultMessage);

    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * list Recycle Volume Info.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listRecycleVolumeInfo() {
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
    String[] cols = {"volumeId", "null", "volumeName", "description", "null", "totalSpaceFroCsi",
        "usedSpaceForCsi",
        "volumeSize", "usedSize", "readOnlyForCsi",
        "volumeStatus", "volumeDomain", "storagePoolName", "freeSpaceRatio", "simpleConfiguration",
        "cacheType", "timeForRecycle", "migrationSpeed", "rebalanceRatio",
        "volumeBuildType", "clientLastConnectTime", "null"};

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
    // search
    volumeList = new ArrayList<SimpleVolumeMetadata>();
    List<SimpleVolumeMetadata> volumeTmpList = new ArrayList<>();
    try {
      volumeList = volumeService.listRecycleVolumeInfo(Long.parseLong(account.getAccountId()));
      recordsTotal = String.valueOf(volumeList.size());

      if (!searchValue.equals("")) {
        for (SimpleVolumeMetadata volume : volumeList) {
          if (volume.getVolumeName().toLowerCase().contains(searchValue.toLowerCase())) {
            volumeTmpList.add(volume);
          }
        }
      } else {
        volumeTmpList.addAll(volumeList);
      }
      if (!StringUtils.isEmpty(statusLevel)) {
        volumeList.clear();
        volumeList.addAll(volumeTmpList);
        volumeTmpList.clear();
        for (int i = 0; i < volumeList.size(); i++) {
          if (statusLevel.equals("HEALTHY")) {
            if (!volumeList.get(i).getVolumeStatus().equals("Unavailable")) {
              volumeTmpList.add(volumeList.get(i));
            }
          } else if (statusLevel.equals("WRONG")) {
            if (volumeList.get(i).getVolumeStatus().equals("Unavailable")) {
              volumeTmpList.add(volumeList.get(i));
            }
          }
        }
      }

      recordsFiltered = String.valueOf(volumeTmpList.size());

      // sort
      logger.debug("orderColumn is {}", orderColumn);
      switch (orderColumn) {
        case "volumeId":
          Collections.sort(volumeTmpList, new SortById());
          break;
        case "volumeName":
          Collections.sort(volumeTmpList, new SortByName());
          break;
        case "description":
          Collections.sort(volumeTmpList, new SortByDescription());
          break;
        case "volumeSize":
          Collections.sort(volumeTmpList, new SortBySize());
          break;
        case "freeSize":
          Collections.sort(volumeTmpList, new SortByFreeSpace());
          break;
        case "usedSize":
          Collections.sort(volumeTmpList, new SortByUsedSize());
          break;
        case "totalSpaceFroCsi":
          Collections.sort(volumeTmpList, new SortByTotalSpaceCsi());
          break;
        case "usedSpaceForCsi":
          Collections.sort(volumeTmpList, new SortByUsedSpaceCsi());
          break;
        case "readOnlyForCsi":
          Collections.sort(volumeTmpList, new SortByReadOnly());
          break;
        case "volumeStatus":
          Collections.sort(volumeTmpList, new SortByStatus());
          break;
        case "volumeDomain":
          Collections.sort(volumeTmpList, new SortByDomain());
          break;
        case "storagePoolName":
          Collections.sort(volumeTmpList, new SortByPool());
          break;
        case "freeSpaceRatio":
          Collections.sort(volumeTmpList, new SortByFreeSpaceRatio());
          break;
        case "simpleConfiguration":
          Collections.sort(volumeTmpList, new SortBySimpleConfiguration());
          break;
        case "createTime":
          Collections.sort(volumeTmpList, new SortByCreateTime());
          break;
        case "timeForRecycle":
          Collections.sort(volumeTmpList, new SortByRecycleTime());
          break;
        case "clientLastConnectTime":
          Collections.sort(volumeTmpList, new SortByClientLastConnectTime());
          break;
        case "volumeBuildType":
          Collections.sort(volumeTmpList, new SortByVolumeBuildType());
          break;
        case "readWrite":
          Collections.sort(volumeTmpList, new SortByVolumeReadWrite());
          break;
        default:
          Collections.sort(volumeTmpList, new SortByName());
      }
      logger.debug("volumeTmpList is {}", volumeTmpList);
      // pagination
      volumeList.clear();
      int size = Integer.parseInt(start) + Integer.parseInt(length);
      if (size > volumeTmpList.size()) {
        size = volumeTmpList.size();
      }
      for (int i = Integer.parseInt(start); i < size; i++) {
        volumeList.add(volumeTmpList.get(i));
      }
      logger.debug("volumeList is {}", volumeList);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      dataMap.put("resultMessage", resultMessage);
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
    dataMap.put("data", volumeList);
    dataMap.put("recordsTotal", recordsTotal);
    dataMap.put("recordsFiltered", recordsFiltered);
    dataMap.put("draw", draw);
    dataMap.put("resultMessage", resultMessage);

    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * get Volume Detail.
   *
   * @return ACTION_RETURN_STRING
   */
  public String getVolumeDetail() {

    simpleVolumeMetadata = new SimpleVolumeMetadata();
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }

    try {

      simpleVolumeMetadata = volumeService
          .getVolumeById(Long.parseLong(volumeId), Long.parseLong(account.getAccountId()), false);
      logger.debug("SimpleVolumeMetadata: {}", simpleVolumeMetadata);
      if (simpleVolumeMetadata != null) {
        int availableUnits = 0;
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
        List<SimpleSegmentMetadata> segList = new ArrayList<SimpleSegmentMetadata>();
        simpleVolumeMetadata.setSegmentStatus(segmentStatus);

        Boolean isInRollbackProcess = false;
        int snapshotIdInRollback = 0;

        if (simpleVolumeMetadata.getInSnapshotRollback() != null) {
          try {
            isInRollbackProcess = Boolean
                .parseBoolean(simpleVolumeMetadata.getInSnapshotRollback());
          } catch (NullPointerException e) {
            isInRollbackProcess = false;
          }
        }
        if (simpleVolumeMetadata.getSnapshotIdRollbacking() != null) {
          try {
            snapshotIdInRollback = Integer
                .parseInt(simpleVolumeMetadata.getSnapshotIdRollbacking());
          } catch (NullPointerException e) {
            snapshotIdInRollback = 0;
          }
        }

        int rollbackOk = 0;
        int rollbackBegin = 0;

        logger.debug("view volume simpleVolumeMetadata is {}", simpleVolumeMetadata);

        dataMap.put("resultMessage", resultMessage);

      }
    } catch (VolumeNotFoundExceptionThrift e) {
      logger.error("volume not found for volumeid {}", volumeId, e);
      resultMessage.setMessage(ErrorCode2.ERROR_0011_VolumeNotFound);
    } catch (Exception e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("simpleVolumeMetadata", simpleVolumeMetadata);
    Map<String, Integer> statisticsMap = new HashMap<>();
    dataMap.put("statisticsMap", statisticsMap);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * view Volume.
   *
   * @return ACTION_RETURN_STRING
   */
  public String viewVolume() {

    simpleVolumeMetadata = new SimpleVolumeMetadata();
    Map<String, Integer> statisticsMap = new HashMap<>();
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    // abtain epoch and generation
    int epochInt;
    if (epoch == null || epoch.equals("")) {
      epochInt = 0;
    } else {
      epochInt = Integer.parseInt(epoch);
    }
    int generationInt;
    if (generation == null || generation.equals("")) {
      generationInt = 0;
    } else {
      generationInt = Integer.parseInt(generation);
    }

    try {
      boolean withSegmentList = true;
      if (getVolumeWithSegmentList != null && getVolumeWithSegmentList.equals("0")) {
        logger.info("now to get volume without segment list");
        withSegmentList = false;
      }
      simpleVolumeMetadata = volumeService
          .viewVolume(Long.parseLong(volumeId), Long.parseLong(account.getAccountId()));
      logger.debug("SimpleVolumeM etadata: {}", simpleVolumeMetadata);
      if (simpleVolumeMetadata != null) {
        int availableUnits = 0;
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
        List<SimpleSegmentMetadata> segList = new ArrayList<SimpleSegmentMetadata>();
        simpleVolumeMetadata.setSegmentStatus(segmentStatus);

        Boolean isInRollbackProcess = false;
        int snapshotIdInRollback = 0;

        if (simpleVolumeMetadata.getInSnapshotRollback() != null) {
          try {
            isInRollbackProcess = Boolean
                .parseBoolean(simpleVolumeMetadata.getInSnapshotRollback());
          } catch (NullPointerException e) {
            isInRollbackProcess = false;
          }
        }
        if (simpleVolumeMetadata.getSnapshotIdRollbacking() != null) {
          try {
            snapshotIdInRollback = Integer
                .parseInt(simpleVolumeMetadata.getSnapshotIdRollbacking());
          } catch (NullPointerException e) {
            snapshotIdInRollback = 0;
          }
        }

        int rollbackOk = 0;
        int rollbackBegin = 0;

        for (SimpleSegmentMetadata simpleSegmentMetadata : simpleVolumeMetadata.getSegmentList()) {

          int okUnits = 0;
          // availableUnits = 0;
          for (SimpleSegUnit simpleSegUnit : simpleSegmentMetadata.getUnitList()) {

            String instanceId = simpleSegUnit.getInstanceId();
            SimpleInstance simpleInstance = instanceService
                .getInstances(Long.parseLong(instanceId));
            simpleSegUnit.setInstanceIp(simpleInstance.getHost());
            if (simpleSegUnit.getUnitType().equals("Primary")) {
              String host = simpleSegUnit.getInstanceIp();
              if (!statisticsMap.containsKey(host)) {
                statisticsMap.put(host, 1);
              } else {
                statisticsMap.put(host, statisticsMap.get(host) + 1);
              }
            }
            availableUnits++;
            if (simpleSegUnit.getStatusDisplay().equals("OK") || simpleSegUnit.getStatusDisplay()
                .equals("Arbiter")) {
              okUnits++;
            }
            if (isInRollbackProcess == true && snapshotIdInRollback != 0) {
              if (Integer.parseInt(simpleSegUnit.getSnapshotIdOfRollback())
                  == snapshotIdInRollback) {
                if (Boolean.parseBoolean(simpleSegUnit.getInRollbackProgress()) == false) {
                  rollbackOk++;
                } else {
                  rollbackBegin++;
                }
              }
            }
          }
          if (simpleVolumeMetadata.getVolumeType().equals("LARGE")) {
            if (segmentStatus.equals("STABLE")) {
              if (okUnits < 5) {
                segList.add(simpleSegmentMetadata);
                continue;
              }
            }
            if (segmentStatus.equals("AVAILABLE")) {
              if (okUnits != 3 && okUnits != 4) {
                segList.add(simpleSegmentMetadata);
                continue;
              }
            }
            if (segmentStatus.equals("UNAVAILABLE")) {
              if (okUnits >= 3) {
                segList.add(simpleSegmentMetadata);
                continue;
              }
            }
          } else {
            if (segmentStatus.equals("STABLE")) {
              if (okUnits < 3) {
                segList.add(simpleSegmentMetadata);
                continue;
              }
            }
            if (segmentStatus.equals("AVAILABLE")) {
              if (okUnits != 2) {
                segList.add(simpleSegmentMetadata);
                continue;
              }
            }
            if (segmentStatus.equals("UNAVAILABLE")) {
              if (okUnits >= 2) {
                segList.add(simpleSegmentMetadata);
                continue;
              }
            }
          }

          if (epochInt != 0) {
            List<SimpleSegUnit> unitListTmp = simpleSegmentMetadata.getUnitList();
            boolean addFlag = true;
            for (SimpleSegUnit unitTmp : unitListTmp) {
              if (unitTmp.getSimpleSegmentVersion().getEpoch() >= epochInt
                  && unitTmp.getSimpleSegmentVersion().getGeneration() >= generationInt) {
                addFlag = false;
                logger.debug("add this segment");
              }

            }
            if (addFlag) {
              segList.add(simpleSegmentMetadata);
            }
          }

        }

        for (SimpleSegmentMetadata simpleSegmentMetadata : segList) {
          simpleVolumeMetadata.getSegmentList().remove(simpleSegmentMetadata);
        }
        logger.debug("view volume simpleVolumeMetadata is {}", simpleVolumeMetadata);

        dataMap.put("resultMessage", resultMessage);

      }
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (VolumeNotFoundExceptionThrift e) {
      logger.error("volume not found for volumeid {}", volumeId, e);
      resultMessage.setMessage(ErrorCode2.ERROR_0011_VolumeNotFound);
    } catch (Exception e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("simpleVolumeMetadata", simpleVolumeMetadata);
    dataMap.put("statisticsMap", statisticsMap);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * compute Segment Unit.
   *
   * @return ACTION_RETURN_STRING
   */
  public String computeSegmentUnit() {

    simpleVolumeMetadata = new SimpleVolumeMetadata();
    Map<SimpleArchive, SegmentCompute> statisticsMap = new HashMap<>();
    Map<SimpleArchive, SegmentCompute> datanodeMap = new HashMap<>();
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    // abtain epoch and generation
    List<SimpleArchive> simpleArchivesList = new ArrayList<>();
    List<SimpleArchive> simpleDatanodesList = new ArrayList<>();
    try {
      simpleVolumeMetadata = volumeService
          .viewVolume(Long.parseLong(volumeId), Long.parseLong(account.getAccountId()));
      logger.debug("SimpleVolumeMetadata: {}", simpleVolumeMetadata);
      if (simpleVolumeMetadata != null) {
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
        List<SimpleSegmentMetadata> segList = new ArrayList<SimpleSegmentMetadata>();

        for (SimpleSegmentMetadata simpleSegmentMetadata : simpleVolumeMetadata.getSegmentList()) {

          for (SimpleSegUnit simpleSegUnit : simpleSegmentMetadata.getUnitList()) {

            String instanceId = simpleSegUnit.getInstanceId();
            SimpleInstance simpleInstance = instanceService
                .getInstances(Long.parseLong(instanceId));

            SimpleArchive archiveTmp = new SimpleArchive();
            archiveTmp.setDatanodeHost(simpleInstance.getHost());
            archiveTmp.setDiskName(simpleSegUnit.getDiskName());
            archiveTmp.setDatanodeId(instanceId);
            SimpleArchive datanodeTmp = new SimpleArchive();
            datanodeTmp.setDatanodeHost(simpleInstance.getHost());
            datanodeTmp.setDatanodeId(instanceId);
            SegmentCompute computeTmp = new SegmentCompute();
            SegmentCompute datanodeComputeTmp = new SegmentCompute();
            logger.debug("arvhiveTmp is {}", archiveTmp);

            if (simpleSegUnit.getUnitType().equals("Primary")) {

              if (!datanodeMap.containsKey(datanodeTmp)) {
                datanodeComputeTmp.setPcount(1);
                datanodeMap.put(datanodeTmp, datanodeComputeTmp);
              } else {
                datanodeComputeTmp = datanodeMap.get(datanodeTmp);
                datanodeComputeTmp.setPcount(datanodeComputeTmp.getPcount() + 1);
                datanodeMap.put(datanodeTmp, datanodeComputeTmp);
              }
              if (!statisticsMap.containsKey(archiveTmp)) {
                computeTmp.setPcount(1);
                statisticsMap.put(archiveTmp, computeTmp);
              } else {
                computeTmp = statisticsMap.get(archiveTmp);
                computeTmp.setPcount(computeTmp.getPcount() + 1);
                statisticsMap.put(archiveTmp, computeTmp);
              }

            } else if (simpleSegUnit.getUnitType().equals("Secondary") && simpleSegUnit
                .getStatusDisplay()
                .equals("Arbiter")) {
              if (!statisticsMap.containsKey(archiveTmp)) {
                computeTmp.setAcount(1);
                statisticsMap.put(archiveTmp, computeTmp);
              } else {
                computeTmp = statisticsMap.get(archiveTmp);
                computeTmp.setAcount(computeTmp.getAcount() + 1);
                statisticsMap.put(archiveTmp, computeTmp);
              }
              if (!datanodeMap.containsKey(datanodeTmp)) {
                datanodeComputeTmp.setAcount(1);
                datanodeMap.put(datanodeTmp, datanodeComputeTmp);
              } else {
                datanodeComputeTmp = datanodeMap.get(datanodeTmp);
                datanodeComputeTmp.setAcount(datanodeComputeTmp.getAcount() + 1);
                datanodeMap.put(datanodeTmp, datanodeComputeTmp);
              }
            } else if (simpleSegUnit.getUnitType().equals("Secondary")) {
              if (!statisticsMap.containsKey(archiveTmp)) {
                computeTmp.setScount(1);
                statisticsMap.put(archiveTmp, computeTmp);
              } else {
                computeTmp = statisticsMap.get(archiveTmp);
                computeTmp.setScount(computeTmp.getScount() + 1);
                statisticsMap.put(archiveTmp, computeTmp);
              }
              if (!datanodeMap.containsKey(datanodeTmp)) {
                datanodeComputeTmp.setScount(1);
                datanodeMap.put(datanodeTmp, datanodeComputeTmp);
              } else {
                datanodeComputeTmp = datanodeMap.get(datanodeTmp);
                datanodeComputeTmp.setScount(datanodeComputeTmp.getScount() + 1);
                datanodeMap.put(datanodeTmp, datanodeComputeTmp);
              }
            }
            logger.debug("statisticsMap is {}", statisticsMap);
          }

          // simpleVolumeMetadata.setVolumeName(Integer.toString(simpleSegmentMetadata
          //     .getUnitSize()));
        }

        for (Map.Entry<SimpleArchive, SegmentCompute> entry : statisticsMap.entrySet()) {
          SimpleArchive archive = new SimpleArchive();
          archive.setDatanodeId(entry.getKey().getDatanodeId());
          archive.setDatanodeHost(entry.getKey().getDatanodeHost());
          archive.setDiskName(entry.getKey().getDiskName());
          archive.setPrimaryCount(entry.getValue().getPcount());
          archive.setAbiterCount(entry.getValue().getAcount());
          archive.setSecondCount(entry.getValue().getScount());
          simpleArchivesList.add(archive);
        }

        for (Map.Entry<SimpleArchive, SegmentCompute> entry : datanodeMap.entrySet()) {
          SimpleArchive datanode = new SimpleArchive();
          datanode.setDatanodeId(entry.getKey().getDatanodeId());
          datanode.setDatanodeHost(entry.getKey().getDatanodeHost());
          datanode.setPrimaryCount(entry.getValue().getPcount());
          datanode.setAbiterCount(entry.getValue().getAcount());
          datanode.setSecondCount(entry.getValue().getScount());
          simpleDatanodesList.add(datanode);
        }

        dataMap.put("resultMessage", resultMessage);

      }
    } catch (NumberFormatException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NumberFormat");
    } catch (VolumeNotFoundExceptionThrift e) {
      logger.error("volume not found for volumeid {}", volumeId, e);
      resultMessage.setMessage(ErrorCode2.ERROR_0011_VolumeNotFound);
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

    dataMap.put("simpleArchivesList", simpleArchivesList);
    dataMap.put("simpleDatanodesList", simpleDatanodesList);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * view Volume For Search.
   *
   * @return ACTION_RETURN_STRING
   */
  // for liuxin about segmentUnit search
  public String viewVolumeForSearch() {
    simpleVolumeMetadata = new SimpleVolumeMetadata();
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }

    // abtain epoch and generation
    int epochInt;
    int generationInt;
    if (epoch == null || epoch.equals("")) {
      epochInt = 0;
    } else {
      epochInt = Integer.parseInt(epoch);
    }
    if (generation == null || generation.equals("")) {
      generationInt = 0;
    } else {
      generationInt = Integer.parseInt(generation);
    }
    logger
        .debug("epoch is {},generation is {},epochInt is {},generationInt is {}", epoch, generation,
            epochInt,
            generationInt);
    try {
      boolean withSegmentList = true;
      if (getVolumeWithSegmentList != null && getVolumeWithSegmentList.equals("0")) {
        logger.warn("now to get volume without segment list");
        withSegmentList = false;
      }
      simpleVolumeMetadata = volumeService
          .getVolumeById(Long.parseLong(volumeId), Long.parseLong(account.getAccountId()),
              withSegmentList);
      logger.debug("SimpleVolumeMetadata: {}", simpleVolumeMetadata);
      if (simpleVolumeMetadata != null) {
        int availableUnits = 0;
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
        List<SimpleSegmentMetadata> segList = new ArrayList<SimpleSegmentMetadata>();
        simpleVolumeMetadata.setSegmentStatus(segmentStatus);

        Boolean isInRollbackProcess = false;
        int snapshotIdInRollback = 0;

        if (simpleVolumeMetadata.getInSnapshotRollback() != null) {
          try {
            isInRollbackProcess = Boolean
                .parseBoolean(simpleVolumeMetadata.getInSnapshotRollback());
          } catch (NullPointerException e) {
            isInRollbackProcess = false;
          }
        }
        if (simpleVolumeMetadata.getSnapshotIdRollbacking() != null) {
          try {
            snapshotIdInRollback = Integer
                .parseInt(simpleVolumeMetadata.getSnapshotIdRollbacking());
          } catch (NullPointerException e) {
            snapshotIdInRollback = 0;
          }
        }

        int rollbackOk = 0;
        int rollbackBegin = 0;

        for (SimpleSegmentMetadata simpleSegmentMetadata : simpleVolumeMetadata.getSegmentList()) {
          int okUnits = 0;
          // availableUnits = 0;
          for (SimpleSegUnit simpleSegUnit : simpleSegmentMetadata.getUnitList()) {
            String instanceId = simpleSegUnit.getInstanceId();
            SimpleInstance simpleInstance = instanceService
                .getInstances(Long.parseLong(instanceId));
            simpleSegUnit.setInstanceIp(simpleInstance.getHost());
            availableUnits++;
            if (simpleSegUnit.getStatusDisplay().equals("OK")) {
              okUnits++;
            }
            if (isInRollbackProcess == true && snapshotIdInRollback != 0) {
              if (Integer.parseInt(simpleSegUnit.getSnapshotIdOfRollback())
                  == snapshotIdInRollback) {
                if (Boolean.parseBoolean(simpleSegUnit.getInRollbackProgress()) == false) {
                  rollbackOk++;
                } else {
                  rollbackBegin++;
                }
              }
            }
          }
          if (segmentStatus.equals("STABLE")) {
            if (okUnits < 3) {
              segList.add(simpleSegmentMetadata);
              continue;
            }
          }
          if (segmentStatus.equals("AVAILABLE")) {
            if (okUnits != 2) {
              segList.add(simpleSegmentMetadata);
              continue;
            }
          }
          if (segmentStatus.equals("UNAVAILABLE")) {
            if (okUnits >= 2) {
              segList.add(simpleSegmentMetadata);
              continue;
            }
          }
          if (segmentStatus.equals("OTHER")) {
            if (okUnits == 3) {
              segList.add(simpleSegmentMetadata);
              continue;
            }
          }
          // Screening with epoch and generation
          List<SimpleSegUnit> unitListTmp = simpleSegmentMetadata.getUnitList();
          boolean addFlag = true;
          for (SimpleSegUnit unitTmp : unitListTmp) {
            if (unitTmp.getSimpleSegmentVersion().getEpoch() >= epochInt
                && unitTmp.getSimpleSegmentVersion().getGeneration() >= generationInt) {
              if (unitTmp.getDiskName().contains(diskName) && unitTmp.getInstanceIp()
                  .contains(hosts)
                  && unitTmp.getStatus().contains(unitStatus)) {

                addFlag = false;

                logger.debug("add this segment");

              }
            }

          }
          if (addFlag) {
            segList.add(simpleSegmentMetadata);
          }

          // simpleVolumeMetadata.setVolumeName(Integer.toString(simpleSegmentMetadata
          // .getUnitSize()));
        }

        for (SimpleSegmentMetadata simpleSegmentMetadata : segList) {
          simpleVolumeMetadata.getSegmentList().remove(simpleSegmentMetadata);
        }

        long volumeSizeByte = (long) Double.parseDouble(simpleVolumeMetadata.getVolumeSize());
        volumeSizeByte = volumeSizeByte * 1024 * 1024;
        long segmentSizeByte = volumeService.getStorageConfiguration().getSegmentSizeByte();
        int segmentNumber = (int) (volumeSizeByte / segmentSizeByte);

        VolumeType volumeType = VolumeType.valueOf(simpleVolumeMetadata.getVolumeType());
        int progress = (int) (availableUnits * 100 / segmentNumber / volumeType.getNumMembers());
        if (simpleVolumeMetadata.getVolumeStatus().equals("Available")) {
          progress = 100;
        } else if (progress > 90) {
          progress = 90;
        }
        simpleVolumeMetadata.setCreatingProgress((int) (progress));

        int totalSegmentUnitCount = segmentNumber * volumeType.getNumMembers();
        // for begin , count 0.3, for end , count 1
        int rollbackProgress = (int) ((rollbackOk + (rollbackBegin * 0.3)) * 100
            / totalSegmentUnitCount);

        simpleVolumeMetadata.setRollbackingProgress((int) (rollbackProgress));
        dataMap.put("resultMessage", resultMessage);
        dataMap.put("simpleVolumeMetadata", simpleVolumeMetadata);
      }
    } catch (NumberFormatException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NumberFormat");
    } catch (VolumeNotFoundExceptionThrift e) {
      logger.error("volume not found for volumeid {}", volumeId, e);
      resultMessage.setMessage(ErrorCode2.ERROR_0011_VolumeNotFound);
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * view Segment List.
   *
   * @return ACTION_RETURN_STRING
   */
  public String viewSegmentList() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    try {
      segmentList = volumeService
          .getSegmentList(Long.parseLong(volumeId), Long.parseLong(account.getAccountId()),
              Integer.parseInt(startSegmentIndex), Integer.parseInt(endSegmentIndex));
      dataMap.put("segmentList", segmentList);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (Exception e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    // return ERROR;
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * delete Volume.
   *
   * @return ACTION_RETURN_STRING
   */
  public String deleteVolume() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    try {
      if (volumeService
          .deleteVolume(Long.parseLong(volumeId), volumeName,
              Long.parseLong(account.getAccountId()))) {
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);

      }
    } catch (NumberFormatException e) {
      logger.debug("exception catch ", e);
    } catch (VolumeNotFoundExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0011_VolumeNotFound);
    } catch (VolumeBeingDeletedExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0029_VolumHasBeenDeleted);
    } catch (VolumeInExtendingExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0032_VolumeIsExtending);
    } catch (VolumeWasRollbackingExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0080_VolumeWasRollbacking);
    } catch (VolumeIsCloningExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_VolumeIsCloning");
    } catch (DriverUnmountingExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_DriverUnmountingException");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (LaunchedVolumeCannotBeDeletedExceptionThrift e) {
      logger.error("Exception catch", e);
      if (e.isDriverUnknown) {
        resultMessage
            .setMessage(ErrorCode2.ERROR_0057_LaunchedVolumeCannotBeDeletedAndDriverUnknown);
      } else {
        resultMessage.setMessage(ErrorCode2.ERROR_0056_LaunchedVolumeCannotBeDeleted);
      }
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (VolumeUnderOperationExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_VolumeUnderOperationException");
    } catch (ResourceNotExistsExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_ResourceNotExistsException");
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (VolumeDeletingExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_VolumeDeletingException");
    } catch (VolumeIsCopingExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_DestVolumeIsCopyingException");
    } catch (AccessDeniedExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_0050_AccessDenied");
    } catch (DriverLaunchingExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_DriverLaunchingException");
    } catch (InvalidInputExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    } catch (NotEnoughSpaceExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_NotEnoughSpaceException");
    } catch (ExistsDriverExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_ExistsDriverException");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (SnapshotRollingBackExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_SnapshotRollingBackException");
    } catch (VolumeInMoveOnlineDoNotHaveOperationExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_VolumeInMoveOnlineDoNotHaveOperationException");
    } catch (VolumeIsBeginMovedExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_VolumeIsBeginMovedException");
    } catch (VolumeIsMovingExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_VolumeIsMovingException");
    } catch (TException e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * recycle Volume.
   *
   * @return ACTION_RETURN_STRING
   */
  public String recycleVolume() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    try {
      if (volumeService
          .recycleVolume(Long.parseLong(volumeId), Long.parseLong(account.getAccountId()))) {
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      }
    } catch (NumberFormatException e) {
      logger.debug("exception catch ", e);
    } catch (VolumeNotFoundExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0011_VolumeNotFound);
    } catch (VolumeInExtendingExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage(ERROR_0032_VolumeIsExtending);
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (VolumeCannotBeRecycledExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0055_VolumeCannotBeRecycled);
    } catch (ExistsDriverExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_ExistsDriverException");
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (VolumeWasRollbackingExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_SnapshotRollingBackException");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (NotEnoughSpaceExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_NotEnoughSpaceException");
    } catch (AccessDeniedExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_0050_AccessDenied");
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (TException e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * launch Volume.
   *
   * @return ACTION_RETURN_STRING
   */
  public String launchVolume() {
    Account account = accountSessionService.getAccount();
    simpleVolumeMetadata = new SimpleVolumeMetadata();
    if (account == null) {
      simpleVolumeMetadata.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }

    int snapshot = 0;
    if (!StringUtils.isEmpty(snapshotId)) {
      snapshot = Integer.parseInt(snapshotId);
    }
    int driverNum = 1;
    if (!StringUtils.isEmpty(driverAmount)) {
      driverNum = Integer.parseInt(driverAmount);
    }
    boolean forCsi = false;
    if (!StringUtils.isEmpty(this.forCsi)) {
      forCsi = Boolean.valueOf(this.forCsi);
    }
    try {
      logger.debug("amount of driver container instances is {}", driverAmount);
      volumeService
          .launchVolume(driverName, Long.parseLong(volumeId), snapshot, driverType, driverNum,
              Long.parseLong(account.getAccountId()), hostName, scsiIp, false,
              forCsi, nodeId, false);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (NumberFormatException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ERROR_0040_InvalidInput);
    } catch (VolumeNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ERROR_0011_VolumeNotFound);
    } catch (VolumeNotAvailableExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ERROR_0012_VolumeNotAvailable);
    } catch (VolumeBeingDeletedExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ERROR_0029_VolumHasBeenDeleted);
    } catch (TooManyDriversExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ERROR_0037_TooManyDrivers);
    } catch (NotRootVolumeExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ERROR_0038_NotRootVolume);
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ERROR_0039_ServiceHavingBeenShutdown);
    } catch (DriverTypeConflictExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ERROR_0042_DriverTypeConflict);
    } catch (VolumeWasRollbackingExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ERROR_0080_VolumeWasRollbacking);
    } catch (SystemMemoryIsNotEnoughThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_SystemMemoryIsNotEnoughThrift");
    } catch (DriverIsUpgradingExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_DriverIsUpgradingException");
    } catch (ExistsDriverExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_ExistsDriverException");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (DriverTypeIsConflictExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_DriverTypeIsConflictException");
    } catch (DriverUnmountingExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_DriverUnmountingException");
    } catch (DriverNameExistsExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_DriverNameExistsException");
    } catch (VolumeLaunchMultiDriversExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_VolumeLaunchMultiDriversException");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (DriverAmountAndHostNotFitThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_DriverAmountAndHostNotFit");
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (SnapshotRollingBackExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_SnapshotRollingBackException");
    } catch (VolumeUnderOperationExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_VolumeUnderOperationException");
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (VolumeDeletingExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_VolumeDeletingException");
    } catch (DriverHostCannotUseThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_DriverHostCannotUse");
    } catch (InvalidInputExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    } catch (AccessDeniedExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_AccessDeniedException");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (DriverLaunchingExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_DriverLaunchingException");
    } catch (VolumeInMoveOnlineDoNotHaveOperationExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_VolumeInMoveOnlineDoNotHaveOperationException");
    } catch (UnknownIpv4HostExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_UnknownIPV4HostException");
    } catch (UnknownIpv6HostExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_UnknownIPV6HostException");
    } catch (ConnectPydDeviceOperationExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_LaunchSCSIDriverError");
    } catch (SystemCpuIsNotEnoughThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_SystemCpuIsNotEnough");
    } catch (CreateLoopbackOperationExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_LaunchSCSIDriverError");
    } catch (GetScsiDeviceOperationExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_LaunchSCSIDriverError");
    } catch (ScsiDeviceIsLaunchExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_ScsiClientIsExistException");
    } catch (CreateBackstoresOperationExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_LaunchSCSIDriverError");
    } catch (NoEnoughPydDeviceExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_LaunchSCSIDriverError");
    } catch (CreateLoopbackLunsOperationExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_LaunchSCSIDriverError");
    } catch (TException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * umount Volume.
   *
   * @return ACTION_RETURN_STRING
   */
  public String umountVolume() {
    logger.debug("Begin to umount driver: {}", hosts);
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    boolean forceFlag = false;
    if (!StringUtils.isEmpty(forceUmount)) {
      forceFlag = Boolean.valueOf(forceUmount);
    }
    try {
      List<DriverIpTargetThrift> umountHostNames = new ArrayList<>();
      if (hosts != null) {
        ObjectMapper mapper = new ObjectMapper();
        TypeReference<List<DriverIpTargetThrift>> typeRef =
            new TypeReference<List<DriverIpTargetThrift>>() {
            };
        List<DriverIpTargetThrift> driverList = mapper.readValue(hosts, typeRef);
        for (DriverIpTargetThrift host : driverList) {
          umountHostNames.add(host);
        }
      } else {
        logger.error("No driver launched for volume {}", volumeId);
      }
      if (volumeService
          .umountVolume(Long.parseLong(volumeId), Long.parseLong(account.getAccountId()),
              umountHostNames,
              scsiIp, nodeId, 0, forceFlag)) {
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
        dataMap.put("resultMessage", resultMessage);
        return Constants.ACTION_RETURN_STRING;
      }
    } catch (NumberFormatException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0040_InvalidInput);
    } catch (VolumeNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0011_VolumeNotFound);
    } catch (FailedToUmountDriverExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0035_FailedToUmountDriver);
    } catch (ExistsClientExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0036_ExistsClient);
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0039_ServiceHavingBeenShutdown);
    } catch (DriverIsLaunchingExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0041_DriverIsLaunching);
    } catch (DriverIsUpgradingExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_DriverIsUpgradingException");
    } catch (DriverContainerIsIncExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_DriverContainerIsINCException");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (TransportExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_TTransportException");
    } catch (SnapshotRollingBackExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_SnapshotRollingBackException");
    } catch (DriverStillReportExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("DriverStillReportExceptionThrift");
    } catch (DriverUnmountingExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_DriverUnmountingException");
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0002_AccountExists");
    } catch (VolumeUnderOperationExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_VolumeUnderOperationException");
    } catch (VolumeDeletingExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_VolumeDeletingException");
    } catch (AccessDeniedExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_AccessDeniedException");
    } catch (InvalidInputExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    } catch (DriverLaunchingExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_DriverLaunchingException");
    } catch (IOException e) {
      logger.error("exception catch ", e);
      resultMessage.setMessage("InvalidInputExceptionThrift");
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NoDriverLaunchExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_DriverLaunchingException");
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

  private VolumeMetadata buildVolumeFromRequest(long accountId) throws NumberFormatException {
    long volumeSizeFromRequest;
    try {
      volumeSizeFromRequest = Long.parseLong(volumeSize) * Constants.MB_SIZE;
    } catch (NumberFormatException e) {
      throw e;
    }
    VolumeMetadata volume = new VolumeMetadata();
    volume.setVolumeId(SpecialVolumeIdGenerator.generateVolumeId(volumeName));
    volume.setAccountId(accountId);
    volume.setName(volumeName);
    volume.setVolumeDescription(description);
    volume.setVolumeSize(volumeSizeFromRequest);
    volume.setVolumeType(VolumeType.valueOf(volumeType));
    volume.setEnableLaunchMultiDrivers(Boolean.valueOf(enableLaunchMultiDrivers));

    if (volumeDomainId != null && volumeDomainId.length() != 0) {
      volume.setDomainId(Long.parseLong(volumeDomainId));
    }
    if (volumeStoragepoolId != null && volumeStoragepoolId.length() != 0) {
      volume.setStoragePoolId(Long.parseLong(volumeStoragepoolId));
    }

    return volume;
  }

  /**
   * extend Volume.
   *
   * @return ACTION_RETURN_STRING
   */
  public String extendVolume() {
    logger.debug("extend volume id {}", volumeId);
    logger.debug("extend volume size {}", extendSize);
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    try {
      if (volumeService
          .extendVolume(Long.parseLong(volumeId),
              Long.parseLong(extendSize) * Constants.MB_SIZE,
              Long.parseLong(volumeSize) * Constants.MB_SIZE,
              Long.parseLong(account.getAccountId()))) {
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
        dataMap.put("resultMessage", resultMessage);
        return Constants.ACTION_RETURN_STRING;
      }
    } catch (NumberFormatException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ERROR_0023_VolumeSizeNotMultipleOfSegmentSize);
    } catch (AccessDeniedExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ERROR_0016_NoPermission);
    } catch (NotEnoughSpaceExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ERROR_0004_NoEnoughSpace);
    } catch (VolumeSizeNotMultipleOfSegmentSizeThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage(ERROR_0023_VolumeSizeNotMultipleOfSegmentSize);
    } catch (RootVolumeBeingDeletedExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage(ERROR_0030_RootVolumeHasBeenDeleted);
    } catch (RootVolumeNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage(ERROR_0031_RootVolumeNotFound);
    } catch (NotEnoughGroupExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NotEnoughGroupException");
    } catch (VolumeIsCloningExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_VolumeIsCloning");
    } catch (VolumeWasRollbackingExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage(ERROR_0080_VolumeWasRollbacking);
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (StoragePoolNotExistInDoaminExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_StoragePoolNotExistInDomainException");
    } catch (VolumeIsCopingExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_DestVolumeIsCopyingException");
    } catch (VolumeExistingExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0051_VolumeIsExisted");
    } catch (LicenseExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_LicenseException");
    } catch (StoragePoolNotExistedExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0071_StoragePoolNotExisted");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (UselessLicenseExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0053_UselessLicense");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (VolumeNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0011_VolumeNotFound");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (DomainIsDeletingExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0059_DomainIsDeleting");
    } catch (InvalidInputExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (DomainNotExistedExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0046_DomainNotExisted");
    } catch (StoragePoolIsDeletingExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0072_StoragePoolIsDeleting");
    } catch (BadLicenseTokenExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0052_BadLicenseToken");
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (NotEnoughLicenseTokenExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0054_NotEnoughLicenseToken");
    } catch (VolumeInMoveOnlineDoNotHaveOperationExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_VolumeInMoveOnlineDoNotHaveOperationException");
    } catch (NotEnoughNormalGroupExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NotEnoughNormalGroupException");
    } catch (VolumeSizeIllegalExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_VolumeSizeIllegalException");
    } catch (VolumeOriginalSizeNotMatchExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_VolumeOriginalSizeNotMatchException");
    } catch (TException e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * Required :.
   *
   * <p>volumeId : the volume to add the io limit to
   * limitType : the limit type of the limitation (Static or Dynamic) startTime : start time stamp
   * endTime : end time stamp limitedIOPS : upper limit limitedThroughput : upper limit
   * lowerLimitedIOPS : lower limit lowerLimitedThroughput : lower limit
   */
  @Deprecated
  public String addOrModifyIoLimit() {
    long accountId = 0;
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    accountId = Long.parseLong(account.getAccountId());
    SimpleDriverMetadata driver = new SimpleDriverMetadata();
    driver.setVolumeId(volumeId);
    driver.setDriverContainerId(driverContainerId);
    driver.setSnapshotId(snapshotId);
    driver.setDriverType(driverType);

    try {
      volumeService.addOrModifyIoLimit(accountId, buildIoLimitation(), driver);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (EndPointNotFoundException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TooManyEndPointFoundException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_TooManyEndPointFoundException");
    } catch (GenericThriftClientFactoryException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_GenericThriftClientFactoryException");
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (DynamicIoLimitationTimeInterleavingExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_DynamicIOLimitationTimeInterleavingException");
    } catch (NumberFormatException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0002_AccountExists");
    } catch (DriverNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_DriverNotFoundException");
    } catch (AccessDeniedExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_AccessDeniedException");
    } catch (AlreadyExistStaticLimitationExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_AlreadyExistStaticLimitationException");
    } catch (InvalidInputExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_PermissionNotGrantException");
    } catch (TException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0010_InternalError);
    }

    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  private IoLimitation buildIoLimitation() throws NumberFormatException {
    IoLimitation limit = new IoLimitation();
    limit.setId(generateId());

    // TODO ioLimitationEntry
    //        try {
    //            limit.setUpperLimitedIOPS(Integer.valueOf(this.upperLimitedIOPS));
    //            limit.setLowerLimitedIOPS(Integer.valueOf(this.lowerLimitedIOPS));
    //            limit.setUpperLimitedThroughput(Long.valueOf(this.upperLimitedThroughput) * 1000);
    //            limit.setLowerLimitedThroughput(Long.valueOf(this.lowerLimitedThroughput) * 1000);
    //        } catch (NumberFormatException e) {
    //            logger.error("exception catch", e);
    //            throw e;
    //        }
    //        if (!StringUtils.isEmpty(limitId)) {
    //            limit.setId(Long.valueOf(limitId));
    //        }
    //        if (this.limitType.equals(LimitType.Dynamic.name())) {
    //            limit.setStartTime(this.startTime);
    //            limit.setEndTime(this.endTime);
    //            limit.setLimitType(LimitType.Dynamic);
    //        } else if (limitType.equals(LimitType.Static.name())) {
    //            limit.setLimitType(LimitType.Static);
    //        }
    logger.debug("limit is {}", limit);
    return limit;
  }

  /**
   * list Io Limit.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listIoLimit() {
    long accountId = 0;
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    accountId = Long.parseLong(account.getAccountId());

    List<SimpleIoLimitation> limitList = new ArrayList<>();
    SimpleDriverMetadata driver = new SimpleDriverMetadata();
    driver.setVolumeId(volumeId);
    driver.setDriverContainerId(driverContainerId);
    driver.setSnapshotId(snapshotId);
    driver.setDriverType(driverType);

    try {
      limitList = volumeService.listIoLimits(accountId, driver);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (EndPointNotFoundException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TooManyEndPointFoundException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_TooManyEndPointFoundException");
    } catch (GenericThriftClientFactoryException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_GenericThriftClientFactoryException");
    } catch (DriverNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_DriverNotFoundException");
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (TException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0010_InternalError);
    }

    dataMap.put("limitList", limitList);
    return Constants.ACTION_RETURN_STRING;

  }

  /**
   * Required :.
   *
   * <p>volumeId : the volume to add the IO limit to ioLimitIndex : the index of the IO limit
   * item to delete
   */
  public String deleteIoLimit() {
    long accountId = 0;
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    accountId = Long.parseLong(account.getAccountId());
    SimpleDriverMetadata driver = new SimpleDriverMetadata();
    driver.setVolumeId(volumeId);
    driver.setDriverContainerId(driverContainerId);
    driver.setSnapshotId(snapshotId);
    driver.setDriverType(driverType);

    try {
      volumeService.deleteIoLimit(accountId, Long.parseLong(limitId), driver);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (EndPointNotFoundException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TooManyEndPointFoundException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_TooManyEndPointFoundException");
    } catch (GenericThriftClientFactoryException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_GenericThriftClientFactoryException");
    } catch (InvalidInputExceptionThrift invalidInputExceptionThrift) {
      logger.error("exception catch", invalidInputExceptionThrift);
      resultMessage.setMessage("InvalidInputExceptionThrift");
    } catch (ServiceIsNotAvailableThrift serviceIsNotAvailableThrift) {
      logger.error("exception catch", serviceIsNotAvailableThrift);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (TException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0010_InternalError);
    }

    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * fix Volume.
   *
   * @return ACTION_RETURN_STRING
   */
  public String fixVolume() {
    long accountId;
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    accountId = Long.parseLong(account.getAccountId());
    FixVolumeResponse response = new FixVolumeResponse();
    try {
      response = volumeService.fixvolume(Long.valueOf(volumeId), accountId);
      dataMap.put("needFixVolume", response.isNeedFixVolume());
      dataMap.put("fixVolumeCompletely", response.isFixVolumeCompletely());
      dataMap.put("lostDatanodes", response.getLostDatanodes());
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (NumberFormatException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NumberFormatException");
    } catch (VolumeNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_VolumeNotFoundException");
    } catch (AccessDeniedExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_AccessDeniedException");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_ServiceHavingBeenShutdown");
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
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
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (VolumeInMoveOnlineDoNotHaveOperationExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_VolumeInMoveOnlineDoNotHaveOperationException");
    } catch (TException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * confirm Fix Volume.
   *
   * @return ACTION_RETURN_STRING
   */
  public String confirmFixVolume() {
    long accountId;
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    accountId = Long.parseLong(account.getAccountId());
    boolean confirmFixVolumeResult;
    List<Long> lostDatanodesList = null;
    if (lostDatanodesJson != null && !lostDatanodesJson.equals("")) {
      logger.debug("lostDatanodesJson is {}", lostDatanodesJson);
      JSONArray lostDatanodeIdsJsonArray = JSONArray.fromObject(lostDatanodesJson);
      lostDatanodesList = (List<Long>) JSONArray.toList(lostDatanodeIdsJsonArray, Long.class);
      logger.debug("lostDatanodesList is {}", lostDatanodesList);
    }

    try {
      confirmFixVolumeResult = volumeService
          .confirmFixVolume(accountId, Long.valueOf(volumeId), lostDatanodesList);
      dataMap.put("confirmFixVolumeResult", confirmFixVolumeResult);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (VolumeNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_VolumeNotFoundException");
    } catch (AccessDeniedExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_AccessDeniedException");
    } catch (LackDatanodeExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_LackDatanodeException");
    } catch (NotEnoughSpaceExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NotEnoughSpaceException");
    } catch (InvalidInputExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_InvalidInputException");
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (VolumeFixingOperationExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_VolumeFixingOperationException");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_ServiceHavingBeenShutdown");
    } catch (FrequentFixVolumeRequestThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_FrequentFixVolumeRequest");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
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
   * mark Volumes Read Write.
   *
   * @return ACTION_RETURN_STRING
   */
  public String markVolumesReadWrite() {
    long accountId = 0;
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    accountId = Long.parseLong(account.getAccountId());
    List<Long> idsList = new ArrayList<>();
    if (idsJson != null && !idsJson.equals("")) {
      logger.debug("idsJSON is {}", idsJson);
      JSONArray volumeIdsJsonArray = JSONArray.fromObject(idsJson);
      idsList = (List<Long>) JSONArray.toList(volumeIdsJsonArray, Long.class);
      logger.debug("idsList is {}", idsList);
    }
    try {
      volumeService.markVolumesReadWrite(idsList, accountId, readWrite);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_ServiceHavingBeenShutdown");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (VolumeNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0011_VolumeNotFound");
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
   * delete Volume Delay.
   *
   * @return ACTION_RETURN_STRING
   */
  public String deleteVolumeDelay() {
    long accountId = 0;
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    accountId = Long.parseLong(account.getAccountId());
    try {
      volumeService.deleteVolumeDelay(accountId, Long.valueOf(volumeId), volumeName,
          Integer.valueOf(delaydate));
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_ServiceHavingBeenShutdown");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (VolumeNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0011_VolumeNotFound");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (VolumeBeingDeletedExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0029_VolumHasBeenDeleted);
    } catch (TException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * stop Delete Volume Delay.
   *
   * @return ACTION_RETURN_STRING
   */
  public String stopDeleteVolumeDelay() {
    long accountId = 0;
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    accountId = Long.parseLong(account.getAccountId());
    try {
      volumeService.stopDeleteVolumeDelay(accountId, Long.valueOf(volumeId));
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_ServiceHavingBeenShutdown");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (VolumeNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0011_VolumeNotFound");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (VolumeBeingDeletedExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0029_VolumHasBeenDeleted);
    } catch (TException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * start Delete Volume Delay.
   *
   * @return ACTION_RETURN_STRING
   */
  public String startDeleteVolumeDelay() {
    long accountId = 0;
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    accountId = Long.parseLong(account.getAccountId());
    try {
      volumeService.startDeleteVolumeDelay(accountId, Long.valueOf(volumeId));
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_ServiceHavingBeenShutdown");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (VolumeNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0011_VolumeNotFound");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (VolumeBeingDeletedExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0029_VolumHasBeenDeleted);
    } catch (TException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * cancel Delete Volume Delay.
   *
   * @return ACTION_RETURN_STRING
   */
  public String cancelDeleteVolumeDelay() {
    long accountId = 0;
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    accountId = Long.parseLong(account.getAccountId());
    try {
      volumeService.cancelDeleteVolumeDelay(accountId, Long.valueOf(volumeId));
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_ServiceHavingBeenShutdown");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (VolumeNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0011_VolumeNotFound");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (VolumeBeingDeletedExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0029_VolumHasBeenDeleted);
    } catch (TException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * move Volume To Recycle.
   *
   * @return ACTION_RETURN_STRING
   */
  public String moveVolumeToRecycle() {
    long accountId = 0;
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    accountId = Long.parseLong(account.getAccountId());
    try {
      volumeService.moveVolumeToRecycle(accountId, Long.valueOf(volumeId));
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_ServiceHavingBeenShutdown");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (VolumeNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0011_VolumeNotFound");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (VolumeDeletingExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0029_VolumHasBeenDeleted);
    } catch (VolumeBeingDeletedExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0029_VolumHasBeenDeleted);
    } catch (VolumeIsMovingExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_VolumeIsMovingException");
    } catch (VolumeIsCopingExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_DestVolumeIsCopyingException");
    } catch (AccessDeniedExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0050_AccessDenied");
    } catch (VolumeIsCloningExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_VolumeIsCloning");
    } catch (DriverLaunchingExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_DriverLaunchingException");
    } catch (VolumeInExtendingExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0032_VolumeIsExtending);
    } catch (DriverUnmountingExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_DriverUnmountingException");
    } catch (VolumeIsBeginMovedExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_VolumeIsBeginMovedException");
    } catch (VolumeWasRollbackingExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0080_VolumeWasRollbacking);
    } catch (LaunchedVolumeCannotBeDeletedExceptionThrift e) {
      logger.error("Exception catch", e);
      if (e.isDriverUnknown) {
        resultMessage
            .setMessage(ErrorCode2.ERROR_0057_LaunchedVolumeCannotBeDeletedAndDriverUnknown);
      } else {
        resultMessage.setMessage(ErrorCode2.ERROR_0056_LaunchedVolumeCannotBeDeleted);
      }
    } catch (VolumeInMoveOnlineDoNotHaveOperationExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage("ERROR_VolumeInMoveOnlineDoNotHaveOperationException");
    } catch (TException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * recycle Volume To Normal.
   *
   * @return ACTION_RETURN_STRING
   */
  public String recycleVolumeToNormal() {
    long accountId = 0;
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    accountId = Long.parseLong(account.getAccountId());
    try {
      volumeService.recycleVolumeToNormal(accountId, Long.valueOf(volumeId));
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_ServiceHavingBeenShutdown");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (VolumeNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0011_VolumeNotFound");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (VolumeBeingDeletedExceptionThrift e) {
      logger.error("Exception catch", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0029_VolumHasBeenDeleted);
    } catch (AccessDeniedExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0050_AccessDenied");
    } catch (TException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * obtain Volume Detail Show Flag.
   *
   * @return ACTION_RETURN_STRING
   */
  public String obtainVolumeDetailShowFlag() {

    String volumeDetailShowFlag = volumeService.obtainVolumeDetailShowFlag();
    dataMap.put("volumeDetailShowFlag", volumeDetailShowFlag);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * generate Id.
   *
   * @return ACTION_RETURN_STRING
   */
  public long generateId() {
    long id = UUID.randomUUID().getLeastSignificantBits();
    if (id < 0) {
      id = id + Long.MAX_VALUE;
    }

    return id;
  }

  /**
   * get Volume Id.
   *
   */

  public String getVolumeId() {
    return volumeId;
  }

  public void setVolumeId(String volumeId) {
    this.volumeId = volumeId;
  }

  public AccountSessionService getAccountSessionService() {
    return accountSessionService;
  }

  public void setAccountSessionService(AccountSessionService accountSessionService) {
    this.accountSessionService = accountSessionService;
  }

  public VolumeService getVolumeService() {
    return volumeService;
  }

  public void setVolumeService(VolumeService volumeService) {
    this.volumeService = volumeService;
  }

  public InstanceService getInstanceService() {
    return instanceService;
  }

  public void setInstanceService(InstanceService instanceService) {
    this.instanceService = instanceService;
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

  public String getVolumeName() {
    return volumeName;
  }

  public void setVolumeName(String volumeName) {
    this.volumeName = volumeName;
  }

  public String getVolumeSize() {
    return volumeSize;
  }

  public void setVolumeSize(String volumeSize) {
    this.volumeSize = volumeSize;
  }

  public String getVolumeType() {
    return volumeType;
  }

  public void setVolumeType(String volumeType) {
    this.volumeType = volumeType;
  }

  public String getDriverType() {
    return driverType;
  }

  public void setDriverType(String driverType) {
    this.driverType = driverType;
  }

  public String getDriverAmount() {
    return driverAmount;
  }

  public void setDriverAmount(String driverAmount) {
    this.driverAmount = driverAmount;
  }

  public ResultMessage getResultMessage() {
    return resultMessage;
  }

  public void setResultMessage(ResultMessage resultMessage) {
    this.resultMessage = resultMessage;
  }

  public List<SimpleVolumeMetadata> getVolumeList() {
    return volumeList;
  }

  public void setVolumeList(List<SimpleVolumeMetadata> volumeList) {
    this.volumeList = volumeList;
  }

  public List<SimpleVolumeMetadata> getOrphanVolumeList() {
    return orphanVolumeList;
  }

  public void setOrphanVolumeList(List<SimpleVolumeMetadata> orphanVolumeList) {
    this.orphanVolumeList = orphanVolumeList;
  }

  public SimpleVolumeMetadata getSimpleVolumeMetadata() {
    return simpleVolumeMetadata;
  }

  public void setSimpleVolumeMetadata(SimpleVolumeMetadata simpleVolumeMetadata) {
    this.simpleVolumeMetadata = simpleVolumeMetadata;
  }

  public SimpleDriverMetadata getSimpleDriverMetadata() {
    return simpleDriverMetadata;
  }

  public void setSimpleDriverMetadata(SimpleDriverMetadata simpleDriverMetadata) {
    this.simpleDriverMetadata = simpleDriverMetadata;
  }

  public String getHosts() {
    return hosts;
  }

  public void setHosts(String hosts) {
    this.hosts = hosts;
  }

  public String getExtendSize() {
    return extendSize;
  }

  public void setExtendSize(String extendSize) {
    this.extendSize = extendSize;
  }

  public long getSegmentSizeBytes() {
    return segmentSizeBytes;
  }

  public void setSegmentSizeBytes(long segmentSizeBytes) {
    this.segmentSizeBytes = segmentSizeBytes;
  }

  public String getDelaydate() {
    return delaydate;
  }

  public void setDelaydate(String delaydate) {
    this.delaydate = delaydate;
  }

  public String getSegmentStatus() {
    return segmentStatus;
  }

  public void setSegmentStatus(String segmentStatus) {
    this.segmentStatus = segmentStatus;
  }

  public DomainService getDomainService() {
    return domainService;
  }

  public void setDomainService(DomainService domainService) {
    this.domainService = domainService;
  }

  public String getIsOpen() {
    return isOpen;
  }

  public void setIsOpen(String isOpen) {
    this.isOpen = isOpen;
  }

  public String getGetVolumeWithSegmentList() {
    return getVolumeWithSegmentList;
  }

  public void setGetVolumeWithSegmentList(String getVolumeWithSegmentList) {
    this.getVolumeWithSegmentList = getVolumeWithSegmentList;
  }

  public String getStartSegmentIndex() {
    return startSegmentIndex;
  }

  public void setStartSegmentIndex(String startSegmentIndex) {
    this.startSegmentIndex = startSegmentIndex;
  }

  public String getEndSegmentIndex() {
    return endSegmentIndex;
  }

  public void setEndSegmentIndex(String endSegmentIndex) {
    this.endSegmentIndex = endSegmentIndex;
  }

  public String getSnapshotName() {
    return snapshotName;
  }

  public void setSnapshotName(String snapshotName) {
    this.snapshotName = snapshotName;
  }

  public String getSnapshotDesp() {
    return snapshotDesp;
  }

  public void setSnapshotDesp(String snapshotDesp) {
    this.snapshotDesp = snapshotDesp;
  }

  public String getSnapshotId() {
    return snapshotId;
  }

  public void setSnapshotId(String snapshotId) {
    this.snapshotId = snapshotId;
  }

  public List<SimpleSegmentMetadata> getSegmentList() {
    return segmentList;
  }

  public void setSegmentList(List<SimpleSegmentMetadata> segmentList) {
    this.segmentList = segmentList;
  }

  public Map<String, Object> getDataMap() {
    return dataMap;
  }

  public void setDataMap(Map<String, Object> dataMap) {
    this.dataMap = dataMap;
  }

  public String getUpperLimitedIoPs() {
    return upperLimitedIoPs;
  }

  public void setUpperLimitedIoPs(String upperLimitedIoPs) {
    this.upperLimitedIoPs = upperLimitedIoPs;
  }

  public String getUpperLimitedThroughput() {
    return upperLimitedThroughput;
  }

  public void setUpperLimitedThroughput(String upperLimitedThroughput) {
    this.upperLimitedThroughput = upperLimitedThroughput;
  }

  public String getLowerLimitedIoPs() {
    return lowerLimitedIoPs;
  }

  public void setLowerLimitedIoPs(String lowerLimitedIoPs) {
    this.lowerLimitedIoPs = lowerLimitedIoPs;
  }

  public String getLowerLimitedThroughput() {
    return lowerLimitedThroughput;
  }

  public void setLowerLimitedThroughput(String lowerLimitedThroughput) {
    this.lowerLimitedThroughput = lowerLimitedThroughput;
  }

  public String getSrcVolumeId() {
    return srcVolumeId;
  }

  public void setSrcVolumeId(String srcVolumeId) {
    this.srcVolumeId = srcVolumeId;
  }

  public String getVolumeDomainId() {
    return volumeDomainId;
  }

  public void setVolumeDomainId(String volumeDomainId) {
    this.volumeDomainId = volumeDomainId;
  }

  public String getVolumeStoragepoolId() {
    return volumeStoragepoolId;
  }

  public void setVolumeStoragepoolId(String volumeStoragepoolId) {
    this.volumeStoragepoolId = volumeStoragepoolId;
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

  public String getLimitType() {
    return limitType;
  }

  public void setLimitType(String limitType) {
    this.limitType = limitType;
  }

  public String getEpoch() {
    return epoch;
  }

  public void setEpoch(String epoch) {
    this.epoch = epoch;
  }

  public String getGeneration() {
    return generation;
  }

  public void setGeneration(String generation) {
    this.generation = generation;
  }

  public String getDiskName() {
    return diskName;
  }

  public void setDiskName(String diskName) {
    this.diskName = diskName;
  }

  public String getForCsi() {
    return forCsi;
  }

  public void setForCsi(String forCsi) {
    this.forCsi = forCsi;
  }

  public String getNodeId() {
    return nodeId;
  }

  public void setNodeId(String nodeId) {
    this.nodeId = nodeId;
  }

  public String getUnitStatus() {
    return unitStatus;
  }

  public void setUnitStatus(String unitStatus) {
    this.unitStatus = unitStatus;
  }

  public String getLostDatanodesJson() {
    return lostDatanodesJson;
  }

  public void setLostDatanodesJson(String lostDatanodesJson) {
    this.lostDatanodesJson = lostDatanodesJson;
  }

  public String getHostName() {
    return hostName;
  }

  public void setHostName(String hostName) {
    this.hostName = hostName;
  }

  public String getOrderDir() {
    return orderDir;
  }

  public void setOrderDir(String orderDir) {
    this.orderDir = orderDir;
  }

  public String getIdsJson() {
    return idsJson;
  }

  public void setIdsJson(String idsJson) {
    this.idsJson = idsJson;
  }

  public String getCloneType() {
    return cloneType;
  }

  public void setCloneType(String cloneType) {
    this.cloneType = cloneType;
  }

  public String getReadWrite() {
    return readWrite;
  }

  public void setReadWrite(String readWrite) {
    this.readWrite = readWrite;

  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getDriverContainerId() {
    return driverContainerId;
  }

  public void setDriverContainerId(String driverContainerId) {
    this.driverContainerId = driverContainerId;
  }

  public String getLimitId() {
    return limitId;
  }

  public void setLimitId(String limitId) {
    this.limitId = limitId;
  }

  public String getForceUmount() {
    return forceUmount;
  }

  public void setForceUmount(String forceUmount) {
    this.forceUmount = forceUmount;
  }

  public String getOriVolumeId() {
    return oriVolumeId;
  }

  public void setOriVolumeId(String oriVolumeId) {
    this.oriVolumeId = oriVolumeId;
  }

  public String getDestVolumeId() {
    return destVolumeId;
  }

  public void setDestVolumeId(String destVolumeId) {
    this.destVolumeId = destVolumeId;
  }

  public String getStatusLevel() {
    return statusLevel;
  }

  public void setStatusLevel(String statusLevel) {
    this.statusLevel = statusLevel;
  }

  public String getDriverName() {
    return driverName;
  }

  public void setDriverName(String driverName) {
    this.driverName = driverName;
  }

  public String getDomainId() {
    return domainId;
  }

  public void setDomainId(String domainId) {
    this.domainId = domainId;
  }

  public String getPoolId() {
    return poolId;
  }

  public void setPoolId(String poolId) {
    this.poolId = poolId;
  }

  public String getEnableLaunchMultiDrivers() {
    return enableLaunchMultiDrivers;
  }

  public void setEnableLaunchMultiDrivers(String enableLaunchMultiDrivers) {
    this.enableLaunchMultiDrivers = enableLaunchMultiDrivers;
  }

  public String getUpdateCsiLaunchCount() {
    return updateCsiLaunchCount;
  }

  public void setUpdateCsiLaunchCount(String updateCsiLaunchCount) {
    this.updateCsiLaunchCount = updateCsiLaunchCount;
  }


  public String getScsiIp() {
    return scsiIp;
  }

  public void setScsiIp(String scsiIp) {
    this.scsiIp = scsiIp;
  }

  class SortById implements Comparator<SimpleVolumeMetadata> {

    public int compare(SimpleVolumeMetadata s1, SimpleVolumeMetadata s2) {
      if (s2.getVolumeId() == s1.getVolumeId()) {
        return 0;
      }
      if (s1.getVolumeId().compareToIgnoreCase(s2.getVolumeId()) > 0) {
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

  class SortByName implements Comparator<SimpleVolumeMetadata> {

    public int compare(SimpleVolumeMetadata s1, SimpleVolumeMetadata s2) {
      if (s1.getVolumeName().equals(s2.getVolumeName())) {
        return 0;
      }
      if (s1.getVolumeName().compareToIgnoreCase(s2.getVolumeName()) > 0) {
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

  class SortByDescription implements Comparator<SimpleVolumeMetadata> {

    public int compare(SimpleVolumeMetadata s1, SimpleVolumeMetadata s2) {
      if (s1.getDescription().equals(s2.getDescription())) {
        return 0;
      }
      if (s1.getDescription().compareToIgnoreCase(s2.getDescription()) > 0) {
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

  class SortBySize implements Comparator<SimpleVolumeMetadata> {

    public int compare(SimpleVolumeMetadata s1, SimpleVolumeMetadata s2) {
      if (orderDir.equals("asc")) {
        return (int) (Double.parseDouble(s1.getVolumeSize()) - Double
            .parseDouble(s2.getVolumeSize()));
      } else {
        return (int) (Double.parseDouble(s2.getVolumeSize()) - Double
            .parseDouble(s1.getVolumeSize()));
      }
    }
  }

  class SortByUsedSpaceCsi implements Comparator<SimpleVolumeMetadata> {

    public int compare(SimpleVolumeMetadata s1, SimpleVolumeMetadata s2) {
      if (orderDir.equals("asc")) {
        return (int) (Double.parseDouble(s1.getUsedSpaceForCsi()) - Double
            .parseDouble(s2.getUsedSpaceForCsi()));
      } else {
        return (int) (Double.parseDouble(s2.getUsedSpaceForCsi()) - Double
            .parseDouble(s1.getUsedSpaceForCsi()));
      }
    }
  }

  class SortByTotalSpaceCsi implements Comparator<SimpleVolumeMetadata> {

    public int compare(SimpleVolumeMetadata s1, SimpleVolumeMetadata s2) {
      if (orderDir.equals("asc")) {
        return (int) (Double.parseDouble(s1.getTotalSpaceFroCsi()) - Double
            .parseDouble(s2.getTotalSpaceFroCsi()));
      } else {
        return (int) (Double.parseDouble(s2.getTotalSpaceFroCsi()) - Double
            .parseDouble(s1.getTotalSpaceFroCsi()));
      }
    }
  }

  class SortByDomain implements Comparator<SimpleVolumeMetadata> {

    public int compare(SimpleVolumeMetadata s1, SimpleVolumeMetadata s2) {
      if (s1.getVolumeDomain().equals(s2.getVolumeDomain())) {
        return 0;
      }
      if (s1.getVolumeDomain().compareToIgnoreCase(s2.getVolumeDomain()) > 0) {
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

  class SortByStatus implements Comparator<SimpleVolumeMetadata> {

    public int compare(SimpleVolumeMetadata s1, SimpleVolumeMetadata s2) {
      if (s1.getVolumeStatus().equals(s2.getVolumeStatus())) {
        return 0;
      }
      if (s1.getVolumeStatus().compareToIgnoreCase(s2.getVolumeStatus()) > 0) {
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

  class SortByVolumeBuildType implements Comparator<SimpleVolumeMetadata> {

    public int compare(SimpleVolumeMetadata s1, SimpleVolumeMetadata s2) {
      if (s1.getVolumeBuildType().equals(s2.getVolumeBuildType())) {
        return 0;
      }
      if (s1.getVolumeBuildType().compareToIgnoreCase(s2.getVolumeBuildType()) > 0) {
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

  class SortByVolumeReadWrite implements Comparator<SimpleVolumeMetadata> {

    public int compare(SimpleVolumeMetadata s1, SimpleVolumeMetadata s2) {
      if (s1.getReadWrite().equals(s2.getReadWrite())) {
        return 0;
      }
      if (s1.getReadWrite().compareToIgnoreCase(s2.getReadWrite()) > 0) {
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

  class SortByPool implements Comparator<SimpleVolumeMetadata> {

    public int compare(SimpleVolumeMetadata s1, SimpleVolumeMetadata s2) {
      if (s1.getStoragePoolName().equals(s2.getStoragePoolName())) {
        return 0;
      }
      if (s1.getStoragePoolName().compareToIgnoreCase(s2.getStoragePoolName()) > 0) {
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

  class SortByFreeSpace implements Comparator<SimpleVolumeMetadata> {

    public int compare(SimpleVolumeMetadata s1, SimpleVolumeMetadata s2) {
      if (orderDir.equals("asc")) {
        return (int) (Double.parseDouble(s1.getVolumeSize()) * s1.getFreeSpaceRatio() - Double
            .parseDouble(s2.getVolumeSize()) * s2.getFreeSpaceRatio());
      } else {
        return (int) (Double.parseDouble(s2.getVolumeSize()) * s2.getFreeSpaceRatio() - Double
            .parseDouble(s1.getVolumeSize()) * s1.getFreeSpaceRatio());
      }
    }
  }


  class SortByFreeSpaceRatio implements Comparator<SimpleVolumeMetadata> {

    public int compare(SimpleVolumeMetadata s1, SimpleVolumeMetadata s2) {
      if (orderDir.equals("asc")) {
        return (int) (s1.getFreeSpaceRatio() - s2.getFreeSpaceRatio());
      } else {
        return (int) (s2.getFreeSpaceRatio() - s1.getFreeSpaceRatio());
      }
    }
  }


  class SortByUsedSize implements Comparator<SimpleVolumeMetadata> {

    public int compare(SimpleVolumeMetadata s1, SimpleVolumeMetadata s2) {
      if (orderDir.equals("asc")) {
        return (int) (Double.parseDouble(s1.getVolumeSize()) * (1 - s1.getFreeSpaceRatio()) - Double
            .parseDouble(s2.getVolumeSize()) * (1 - s2.getFreeSpaceRatio()));
      } else {
        return (int) (Double.parseDouble(s2.getVolumeSize()) * (1 - s2.getFreeSpaceRatio()) - Double
            .parseDouble(s1.getVolumeSize()) * (1 - s1.getFreeSpaceRatio()));
      }
    }
  }

  class SortByCreateTime implements Comparator<SimpleVolumeMetadata> {

    public int compare(SimpleVolumeMetadata s1, SimpleVolumeMetadata s2) {
      if (s1.getCreateTime() == s2.getCreateTime()) {
        return 0;
      }
      if (s1.getCreateTime() > s2.getCreateTime()) {
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

  class SortByRecycleTime implements Comparator<SimpleVolumeMetadata> {

    public int compare(SimpleVolumeMetadata s1, SimpleVolumeMetadata s2) {
      if (Long.valueOf(s1.getTimeForRecycle()) == Long.valueOf(s2.getTimeForRecycle())) {
        return 0;
      }
      if (Long.valueOf(s1.getTimeForRecycle()) > Long.valueOf(s2.getTimeForRecycle())) {
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

  class SortByClientLastConnectTime implements Comparator<SimpleVolumeMetadata> {

    public int compare(SimpleVolumeMetadata s1, SimpleVolumeMetadata s2) {
      if (s1.getClientLastConnectTime() == s2.getClientLastConnectTime()) {
        return 0;
      }
      if (s1.getCreateTime() > s2.getCreateTime()) {
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

  class SortBySimpleConfiguration implements Comparator<SimpleVolumeMetadata> {

    public int compare(SimpleVolumeMetadata s1, SimpleVolumeMetadata s2) {
      if (s1.getSimpleConfiguration().equals(s2.getSimpleConfiguration())) {
        return 0;
      }
      if (s1.getSimpleConfiguration().compareToIgnoreCase(s2.getSimpleConfiguration()) > 0) {
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

  class SortByReadOnly implements Comparator<SimpleVolumeMetadata> {

    public int compare(SimpleVolumeMetadata s1, SimpleVolumeMetadata s2) {
      if (s1.getReadOnlyForCsi().equals(s2.getReadOnlyForCsi())) {
        return 0;
      }
      if (s1.getReadOnlyForCsi().compareToIgnoreCase(s2.getReadOnlyForCsi()) > 0) {
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
}
