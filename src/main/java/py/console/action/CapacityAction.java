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
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeoutException;
import net.sf.json.JSONArray;
import org.apache.commons.lang3.StringUtils;
import org.apache.thrift.TException;
import org.jdom.Element;
import org.jdom.input.SAXBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import py.console.bean.Account;
import py.console.bean.Capacity;
import py.console.bean.DashboardInfo;
import py.console.bean.NodeCounts;
import py.console.bean.RebalanceAbsoluteTime;
import py.console.bean.RebalanceRule;
import py.console.bean.ResultMessage;
import py.console.bean.SimpleCapacityRecord;
import py.console.bean.SimpleStoragePool;
import py.console.bean.TotalIoPsAndThroughput;
import py.console.bean.VolumeCounts;
import py.console.service.access.rule.VolumeAccessRuleService;
import py.console.service.account.AccountSessionService;
import py.console.service.alert.AlertService;
import py.console.service.disk.DiskService;
import py.console.service.instance.InstanceService;
import py.console.service.storagepool.StoragePoolService;
import py.console.service.system.SystemService;
import py.console.utils.Constants;
import py.console.utils.ErrorCode2;
import py.exception.EndPointNotFoundException;
import py.exception.GenericThriftClientFactoryException;
import py.exception.TooManyEndPointFoundException;
import py.thrift.share.AccountNotFoundExceptionThrift;
import py.thrift.share.EndPointNotFoundExceptionThrift;
import py.thrift.share.NetworkErrorExceptionThrift;
import py.thrift.share.PermissionNotGrantExceptionThrift;
import py.thrift.share.PoolAlreadyAppliedRebalanceRuleExceptionThrift;
import py.thrift.share.RebalanceRuleExistingExceptionThrift;
import py.thrift.share.RebalanceRuleNotExistExceptionThrift;
import py.thrift.share.ServiceHavingBeenShutdownThrift;
import py.thrift.share.ServiceIsNotAvailableThrift;
import py.thrift.share.StoragePoolNotExistedExceptionThrift;
import py.thrift.share.TooManyEndPointFoundExceptionThrift;

/**
 * this action used to get system capacity information.
 *
 */
public class CapacityAction extends ActionSupport {

  private static final long serialVersionUID = 1L;

  @SuppressWarnings("unused")
  private static final Logger logger = LoggerFactory.getLogger(CapacityAction.class);

  private AccountSessionService accountSessionService;

  private AlertService alertService;

  private DiskService diskService;

  private SystemService systemService;

  private StoragePoolService storagePoolService;

  private InstanceService instanceService;

  private VolumeAccessRuleService volumeAccessRuleService;

  private Capacity capacity;

  private SimpleCapacityRecord capacityRecord;

  private VolumeCounts volumeCounts;

  private TotalIoPsAndThroughput tit;

  private NodeCounts nodeCounts;

  private final ResultMessage resultMessage;

  private String ruleId;
  private String ruleName;
  private String waitTime;
  private String absoluteTimeJson;
  private String idsJson;

  private String configFile = "version.xml";

  private String timeoutMs = "50000";
  private boolean drop = false;

  /**
   * The name of this variable should never be changed -tyr.
   */
  private Map<String, Object> dataMap;

  private static final long MB_SIZE = 1024L * 1024L;
  private static final long GB_SIZE = MB_SIZE * 1024L;

  public AccountSessionService getAccountSessionService() {
    return accountSessionService;
  }

  public void setAccountSessionService(AccountSessionService accountSessionService) {
    this.accountSessionService = accountSessionService;
  }

  public Capacity getCapacity() {
    return capacity;
  }

  public void setCapacity(Capacity capacity) {
    this.capacity = capacity;
  }

  public SimpleCapacityRecord getCapacityRecord() {
    return capacityRecord;
  }

  public void setCapacityRecord(SimpleCapacityRecord capacityRecord) {
    this.capacityRecord = capacityRecord;
  }

  public SystemService getSystemService() {
    return systemService;
  }

  public void setSystemService(SystemService systemService) {
    this.systemService = systemService;
  }

  public VolumeCounts getVolumeCounts() {
    return volumeCounts;
  }

  public void setVolumeCounts(VolumeCounts volumeCounts) {
    this.volumeCounts = volumeCounts;
  }

  public TotalIoPsAndThroughput getTit() {
    return tit;
  }

  public void setTit(TotalIoPsAndThroughput tit) {
    this.tit = tit;
  }

  public NodeCounts getNodeCounts() {
    return nodeCounts;
  }

  public void setNodeCounts(NodeCounts nodeCounts) {
    this.nodeCounts = nodeCounts;
  }

  public Map<String, Object> getDataMap() {
    return dataMap;
  }

  public void setDataMap(Map<String, Object> dataMap) {
    this.dataMap = dataMap;
  }

  public DiskService getDiskService() {
    return diskService;
  }

  public void setDiskService(DiskService diskService) {
    this.diskService = diskService;
  }

  public ResultMessage getResultMessage() {
    return resultMessage;
  }

  public AlertService getAlertService() {
    return alertService;
  }

  public void setAlertService(AlertService alertService) {
    this.alertService = alertService;
  }

  public StoragePoolService getStoragePoolService() {
    return storagePoolService;
  }

  public void setStoragePoolService(StoragePoolService storagePoolService) {
    this.storagePoolService = storagePoolService;
  }

  public String getRuleId() {
    return ruleId;
  }

  public void setRuleId(String ruleId) {
    this.ruleId = ruleId;
  }

  public String getRuleName() {
    return ruleName;
  }

  public void setRuleName(String ruleName) {
    this.ruleName = ruleName;
  }

  public String getWaitTime() {
    return waitTime;
  }

  public void setWaitTime(String waitTime) {
    this.waitTime = waitTime;
  }

  public String getIdsJson() {
    return idsJson;
  }

  public void setIdsJson(String idsJson) {
    this.idsJson = idsJson;
  }

  public VolumeAccessRuleService getVolumeAccessRuleService() {
    return volumeAccessRuleService;
  }

  public void setVolumeAccessRuleService(VolumeAccessRuleService volumeAccessRuleService) {
    this.volumeAccessRuleService = volumeAccessRuleService;
  }

  public String getTimeoutMs() {
    return timeoutMs;
  }

  public void setTimeoutMs(String timeoutMs) {
    this.timeoutMs = timeoutMs;
  }

  public boolean isDrop() {
    return drop;
  }

  public void setDrop(boolean drop) {
    this.drop = drop;
  }

  /**
   * set Drop.
   *
   * @return ACTION_RETURN_STRING
   */
  public String setDrop() {
    String color;
    logger.warn("drop is {}", drop);
    try {
      color = py.volume.special.purpose.DropCache.setDrop(Integer.valueOf(timeoutMs), drop).name();
    } catch (TimeoutException e) {
      color = "Grey";
    }
    dataMap.put("color", color);
    resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;

  }

  public String getAbsoluteTimeJson() {
    return absoluteTimeJson;
  }

  public void setAbsoluteTimeJson(String absoluteTimeJson) {
    this.absoluteTimeJson = absoluteTimeJson;
  }

  public InstanceService getInstanceService() {
    return instanceService;
  }

  public void setInstanceService(InstanceService instanceService) {
    this.instanceService = instanceService;
  }

  /**
   * CapacityAction.
   */
  public CapacityAction() {
    super();
    this.dataMap = new HashMap<String, Object>();
    resultMessage = new ResultMessage();
  }

  /**
   * get the node number in the system.
   *
   * @return ACTION_RETURN_STRING
   */
  public String retrieveNodeCounts() {
    Account account = accountSessionService.getAccount();
    nodeCounts = new NodeCounts();
    if (account == null) {
      capacity.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("nodeCounts", nodeCounts);
      return Constants.ACTION_RETURN_STRING;
    }

    try {
      NodeCounts returnNodeCounts = systemService.retrieveNodeCounts(
          Long.parseLong(account.getAccountId()));
      if (returnNodeCounts != null) {
        nodeCounts.setOkCounts(returnNodeCounts.getOkCounts());
        nodeCounts.setIncCounts(returnNodeCounts.getIncCounts());
        nodeCounts.setFailedCounts(returnNodeCounts.getFailedCounts());
      } else {
        nodeCounts.setMessage("ERROR_NetworkErrorException");
        dataMap.put("nodeCounts", nodeCounts);
        return Constants.ACTION_RETURN_STRING;
      }
    } catch (Exception e) {
      nodeCounts.setMessage("ERROR_NetworkErrorException");
      dataMap.put("nodeCounts", nodeCounts);
      return Constants.ACTION_RETURN_STRING;
    }
    nodeCounts.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    dataMap.put("nodeCounts", nodeCounts);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * get the volume counts in the system.
   *
   * @return ACTION_RETURN_STRING
   */
  public String retrieveVolumeCounts() {
    Account account = accountSessionService.getAccount();
    volumeCounts = new VolumeCounts();
    if (account == null) {
      capacity.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("volumeCounts", volumeCounts);
      return Constants.ACTION_RETURN_STRING;
    }

    try {
      VolumeCounts returnVolumeCounts = systemService
          .retrieveVolumeCounts(Long.parseLong(account.getAccountId()));
      if (returnVolumeCounts != null) {
        volumeCounts.setOkCounts(returnVolumeCounts.getOkCounts());
        volumeCounts.setDegreeCounts(returnVolumeCounts.getDegreeCounts());
        volumeCounts.setUnavailableCounts(returnVolumeCounts.getUnavailableCounts());
        volumeCounts.setTotalClients(returnVolumeCounts.getTotalClients());
        volumeCounts.setConnectedClients(returnVolumeCounts.getConnectedClients());
      } else {
        volumeCounts.setMessage("ERROR_NetworkErrorException");
        dataMap.put("volumeCounts", volumeCounts);
        return Constants.ACTION_RETURN_STRING;
      }
    } catch (Exception e) {
      volumeCounts.setMessage("ERROR_NetworkErrorException");
      dataMap.put("volumeCounts", volumeCounts);
      return Constants.ACTION_RETURN_STRING;
    }
    volumeCounts.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    dataMap.put("volumeCounts", volumeCounts);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * get the total IOPS and throughput of the system.
   *
   * @return ACTION_RETURN_STRING
   */
  public String retrieveTotalIoPsAndThroughput() {
    Account account = accountSessionService.getAccount();
    tit = new TotalIoPsAndThroughput();
    if (account == null) {
      capacity.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("tit", tit);
      return Constants.ACTION_RETURN_STRING;
    }

    try {
      TotalIoPsAndThroughput returnTotalIoPsAndThroughput = systemService
          .retrieveTotalIoPsAndThroughput(Long.parseLong(account.getAccountId()));
      if (returnTotalIoPsAndThroughput != null) {
        tit.setReadIoPs(returnTotalIoPsAndThroughput.getReadIoPs());
        tit.setWriteIoPs(returnTotalIoPsAndThroughput.getWriteIoPs());
        tit.setReadThroughput(returnTotalIoPsAndThroughput.getReadThroughput());
        tit.setWriteThroughput(returnTotalIoPsAndThroughput.getWriteThroughput());
      } else {
        tit.setMessage("ERROR_NetworkErrorException");
        dataMap.put("tit", tit);
        return Constants.ACTION_RETURN_STRING;
      }
    } catch (Exception e) {
      tit.setMessage("ERROR_NetworkErrorException");
      dataMap.put("tit", tit);
      return Constants.ACTION_RETURN_STRING;
    }
    tit.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    dataMap.put("tit", tit);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * retrieve System Capacity.
   *
   * @return ACTION_RETURN_STRING
   */
  public String retrieveSystemCapacity() {
    Account account = accountSessionService.getAccount();
    capacity = new Capacity();
    if (account == null) {
      capacity.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("capacity", capacity);
      return Constants.ACTION_RETURN_STRING;
    }

    try {
      Capacity reutrnCapacity = systemService.getSystemCapacity(
          Long.valueOf(account.getAccountId()));
      if (reutrnCapacity != null) {
        capacity.setTotalCapacity(reutrnCapacity.getTotalCapacity());
        capacity.setAvailableCapacity(reutrnCapacity.getAvailableCapacity());
        capacity.setFreeSpace(reutrnCapacity.getFreeSpace());
      } else {
        capacity.setMessage("ERROR_NetworkErrorException");
        dataMap.put("capacity", capacity);
        return Constants.ACTION_RETURN_STRING;
      }
    } catch (Exception e) {
      capacity.setMessage("ERROR_NetworkErrorException");
      dataMap.put("capacity", capacity);
      return Constants.ACTION_RETURN_STRING;
    }

    DecimalFormat df = new DecimalFormat(".###");

    double totalAvailableCapacity =
        ((double) Long.parseLong(capacity.getAvailableCapacity())) / GB_SIZE;
    double freeSpace = ((double) Long.parseLong(capacity.getFreeSpace())) / GB_SIZE;

    totalAvailableCapacity = Double.parseDouble(df.format(totalAvailableCapacity));
    freeSpace = Double.parseDouble(df.format(freeSpace));
    double usedSpace = Double.parseDouble(df.format(totalAvailableCapacity - freeSpace));

    capacity.setTotalCapacity(String.valueOf(totalAvailableCapacity));
    capacity.setFreeSpace(String.valueOf(freeSpace));
    capacity.setUsedCapacity(String.valueOf(usedSpace));

    double freePer = ((double) Long.parseLong(capacity.getFreeSpace()) * 100) / Long
        .parseLong(capacity.getAvailableCapacity());
    double usedPer = 100 - freePer;
    String freePerStr = df.format(freePer) + "%";
    String usedPerStr = df.format(usedPer) + "%";
    capacity.setAvailableCapacityPer(freePerStr);
    capacity.setUsedCapacityPer(usedPerStr);

    capacity.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    dataMap.put("capacity", capacity);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * retrieve Capacity Record.
   *
   * @return ACTION_RETURN_STRING
   */
  public String retrieveCapacityRecord() {
    Account account = accountSessionService.getAccount();
    capacityRecord = new SimpleCapacityRecord();
    if (account == null) {
      capacityRecord.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("capacityRecord", capacityRecord);
      return Constants.ACTION_RETURN_STRING;
    }
    try {
      SimpleCapacityRecord returnCapacityRecord = systemService
          .getCapacityRecord(Long.valueOf(account.getAccountId()));
      if (returnCapacityRecord != null) {
        capacityRecord.setCapacityRecord(returnCapacityRecord.getCapacityRecord());
      } else {
        capacityRecord.setMessage("ERROR_NetworkErrorException");
        dataMap.put("capacityRecord", capacityRecord);
        return Constants.ACTION_RETURN_STRING;
      }
    } catch (Exception e) {
      capacityRecord.setMessage("ERROR_NetworkErrorException");
      dataMap.put("capacityRecord", capacityRecord);
      return Constants.ACTION_RETURN_STRING;
    }

    capacityRecord.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    dataMap.put("capacityRecord", capacityRecord);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * start Auto Rebalance.
   *
   * @return ACTION_RETURN_STRING
   */
  public String startAutoRebalance() {
    Account accountFromSession = accountSessionService.getAccount();
    if (accountFromSession == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    try {
      systemService.startAutoRebalance();
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (EndPointNotFoundException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("EndPointNotFoundException");
    } catch (TooManyEndPointFoundException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("TooManyEndPointFoundException");
    } catch (GenericThriftClientFactoryException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("GenericThriftClientFactoryException");
    } catch (TException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("TException");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * pause Auto Rebalance.
   *
   * @return ACTION_RETURN_STRING
   */
  public String pauseAutoRebalance() {
    Account accountFromSession = accountSessionService.getAccount();
    if (accountFromSession == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    try {
      systemService.pauseAutoRebalance();
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (EndPointNotFoundException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("EndPointNotFoundException");
    } catch (TooManyEndPointFoundException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("TooManyEndPointFoundException");
    } catch (GenericThriftClientFactoryException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("GenericThriftClientFactoryException");
    } catch (TException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("TException");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * rebalance Started.
   *
   * @return ACTION_RETURN_STRING
   */
  public String rebalanceStarted() {
    Account accountFromSession = accountSessionService.getAccount();
    if (accountFromSession == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    boolean rebalanceStarted;
    try {
      rebalanceStarted = systemService.rebalanceStarted();
      dataMap.put("rebalanceStarted", rebalanceStarted);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (EndPointNotFoundException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("EndPointNotFoundException");
    } catch (TooManyEndPointFoundException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("TooManyEndPointFoundException");
    } catch (GenericThriftClientFactoryException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("GenericThriftClientFactoryException");
    } catch (TException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("TException");
    }

    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * get Dashboard Info.
   *
   * @return ACTION_RETURN_STRING
   */
  public String getDashboardInfo() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }

    DashboardInfo dashboardInfo = new DashboardInfo();

    try {
      dashboardInfo = systemService.getDashboardInfo(Long.valueOf(account.getAccountId()));
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
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("dashboardInfo", dashboardInfo);

    //        try {
    //            //获取所有的磁盘
    //            List<SimpleArchiveMetadata> diskList = new ArrayList<>();
    //            diskList = diskService.listAllDisks(Long.valueOf(account.getAccountId()));
    //            int sataDiskCount = 0;
    //            int sasDiskCount = 0;
    //            int ssdDiskCount = 0;
    //            int nvmeDiskCount = 0;
    //            int otherDiskCount = 0;
    //            for (SimpleArchiveMetadata disk : diskList) {
    //                switch (disk.getStorageType()) {
    //                case "SATA":
    //                    sataDiskCount++;
    //                    break;
    //                case "SAS":
    //                    sasDiskCount++;
    //                    break;
    //                case "SSD":
    //                    ssdDiskCount++;
    //                    break;
    //                case "NVME":
    //                    nvmeDiskCount++;
    //                    break;
    //                default:
    //                    otherDiskCount++;
    //                }
    //            }
    //            dataMap.put("sataDiskCount", sataDiskCount);
    //            dataMap.put("sasDiskCount", sasDiskCount);
    //            dataMap.put("ssdDiskCount", ssdDiskCount);
    //            dataMap.put("nvmeDiskCount", nvmeDiskCount);
    //            dataMap.put("otherDiskCount", otherDiskCount);
    //
    //        } catch (Exception e) {
    //            logger.error("caught an exception ", e);
    //            resultMessage.setMessage(ErrorCode2.ERROR_0010_InternalError);
    //        }
    if (dataMap.get("resulMessage") == null || StringUtils
        .isEmpty(((ResultMessage) dataMap.get("resultMessage")).getMessage())) {
      resultMessage.setMessage("get info error");
    }

    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * query State.
   *
   * @return ACTION_RETURN_STRING
   */
  public String queryState() {
    String color;
    try {
      color = py.volume.special.purpose.DropCache.queryState(Integer.valueOf(timeoutMs)).name();
    } catch (TimeoutException e) {
      color = "Grey";
    }
    dataMap.put("color", color);
    resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * apply Rebalance Rule.
   *
   * @return ACTION_RETURN_STRING
   */
  public String applyRebalanceRule() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }

    logger.debug("idsJSON is {}", idsJson);
    JSONArray poolIdArr = JSONArray.fromObject(idsJson);
    List<Long> poolIdList = (List<Long>) JSONArray.toList(poolIdArr, Long.class);
    logger.debug("poolIdList is {}", poolIdList);
    try {
      systemService.applyRebalanceRule(Long.valueOf(account.getAccountId()), Long.valueOf(ruleId),
          poolIdList);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (RebalanceRuleNotExistExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_RebalanceRuleNotExist");
    } catch (StoragePoolNotExistedExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_StoragePoolNotExisted");
    } catch (PoolAlreadyAppliedRebalanceRuleExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_PoolAlreadyAppliedRebalanceRule");
    } catch (TException e) {
      e.printStackTrace();
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;

  }

  /**
   * un Apply Rebalance Rule.
   *
   * @return ACTION_RETURN_STRING
   */
  public String unApplyRebalanceRule() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }

    logger.debug("idsJSON is {}", idsJson);
    JSONArray poolIdArr = JSONArray.fromObject(idsJson);
    List<Long> poolIdList = (List<Long>) JSONArray.toList(poolIdArr, Long.class);
    logger.debug("poolIdList is {}", poolIdList);
    try {
      systemService.unApplyRebalanceRule(Long.valueOf(account.getAccountId()), Long.valueOf(ruleId),
          poolIdList);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (RebalanceRuleNotExistExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_RebalanceRuleNotExist");
    } catch (StoragePoolNotExistedExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_StoragePoolNotExisted");
    } catch (GenericThriftClientFactoryException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("GenericThriftClientFactoryException");
    } catch (TException e) {
      e.printStackTrace();
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;

  }

  /**
   * get Applied Rebalance Rule Pool.
   *
   * @return ACTION_RETURN_STRING
   */
  public String getAppliedRebalanceRulePool() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<SimpleStoragePool> poolList = new ArrayList<>();

    try {
      poolList = systemService
          .getAppliedRebalanceRulePool(Long.valueOf(account.getAccountId()), Long.valueOf(ruleId));
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (RebalanceRuleNotExistExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_RebalanceRuleNotExist");
    } catch (StoragePoolNotExistedExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_StoragePoolNotExisted");
    } catch (TException e) {
      e.printStackTrace();
    }
    dataMap.put("poolList", poolList);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * get Un Applied Rebalance Rule Pool.
   *
   * @return ACTION_RETURN_STRING
   */
  public String getUnAppliedRebalanceRulePool() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<SimpleStoragePool> poolList = new ArrayList<>();
    try {
      poolList = systemService.getUnAppliedRebalanceRulePool(Long.valueOf(account.getAccountId()));
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (RebalanceRuleNotExistExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_RebalanceRuleNotExist");
    } catch (StoragePoolNotExistedExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_StoragePoolNotExisted");
    } catch (TException e) {
      e.printStackTrace();
    }
    dataMap.put("poolList", poolList);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * get System Info.
   *
   * @return ACTION_RETURN_STRING
   */
  public String getSystemInfo() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    // 使用SAXBuilder解析器解析xml文件
    SAXBuilder sb = new SAXBuilder();
    org.jdom.Document doc = null;
    try {
      doc = sb.build(configFile);
      Element root = doc.getRootElement();
      // get new feature
      List<Element> newFeaturesList = root.getChild("NewFeature").getChildren();
      List<String> newFeaturesStringList = new ArrayList<>();
      for (Element property : newFeaturesList) {
        String propertyString = property.getAttributeValue("value");
        newFeaturesStringList.add(propertyString);
      }
      // get new feature
      List<Element> fixedIssuesList = root.getChild("FixedIssues").getChildren();
      List<String> fixedIssuesStringList = new ArrayList<>();
      for (Element property : fixedIssuesList) {
        String propertyString = property.getAttributeValue("value");
        fixedIssuesStringList.add(propertyString);
      }
      // get new feature
      List<Element> knownIssuesList = root.getChild("KnownIssues").getChildren();
      List<String> knownIssuesStringList = new ArrayList<>();
      for (Element property : knownIssuesList) {
        String propertyString = property.getAttributeValue("value");
        knownIssuesStringList.add(propertyString);
      }

      // support csi
      Element csiElement = root.getChild("SupportCsi");
      if (csiElement != null) {
        List<Element> supportCsiList = csiElement.getChildren();
        for (Element property : supportCsiList) {
          if (property.getAttributeValue("name").equals("csi")) {
            String csiStatus = property.getAttributeValue("value");
            dataMap.put("csi", csiStatus);
          }
        }
      }

      List<Element> supportsList = root.getChild("support").getChildren();
      for (Element support : supportsList) {
        if (support.getAttributeValue("name").equals("telephone")) {
          String tel = support.getAttributeValue("value");
          dataMap.put("tel", tel);
        } else if (support.getAttributeValue("name").equals("email")) {
          String email = support.getAttributeValue("value");
          dataMap.put("email", email);
        }
      }
      String corporation = root.getChild("copyright").getChild("property")
          .getAttributeValue("value");
      String name = root.getChildText("name");
      String version = root.getChildText("branch");
      String timeStamp = root.getChildText("timestamp");
      dataMap.put("name", name);
      dataMap.put("version", version);
      dataMap.put("timeStamp", timeStamp);
      dataMap.put("newFeaturesStringList", newFeaturesStringList);
      dataMap.put("fixedIssuesStringList", fixedIssuesStringList);
      dataMap.put("knownIssuesStringList", knownIssuesStringList);
      dataMap.put("corporation", corporation);
      logger.debug("dataMap is {}", dataMap);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (Exception e) {
      e.printStackTrace();
      logger.error("caught an exception ", e);
      resultMessage.setMessage("读取配置文件失败");
    }

    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * add Rebalance Rule.
   *
   * @return ACTION_RETURN_STRING
   */
  public String addRebalanceRule() {

    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }

    RebalanceRule rule = new RebalanceRule();
    if (StringUtils.isEmpty(ruleName)) {
      logger.error("Invalid input ");
      resultMessage.setMessage("ERROR_0040_InvalidInput");
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    } else {
      rule.setRuleName(ruleName);
    }
    rule.setWaitTime(waitTime);
    List<RebalanceAbsoluteTime> timeList = new ArrayList<>();
    if (!StringUtils.isEmpty(absoluteTimeJson)) {
      logger.debug("absoluteTimeJSON is {}", absoluteTimeJson);
      JSONArray timeJsonArray = JSONArray.fromObject(absoluteTimeJson);
      timeList = (List<RebalanceAbsoluteTime>) JSONArray.toList(timeJsonArray,
          RebalanceAbsoluteTime.class);
      logger.debug("timeList is {}", timeList);
    }
    rule.setAbsoluteTimeList(timeList);
    try {
      systemService.addRebalanceRule(Long.valueOf(account.getAccountId()), rule);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (RebalanceRuleExistingExceptionThrift e) {
      logger.error("Rebalance Rule Existing Exception catch in create:", e);
      resultMessage.setMessage(ErrorCode2.ERROR_RebalanceRuleExistingException);
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
   * update Rebalance Rule.
   *
   * @return ACTION_RETURN_STRING
   */
  public String updateRebalanceRule() {

    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }

    RebalanceRule rule = new RebalanceRule();
    if (StringUtils.isEmpty(ruleName)) {
      logger.error("Invalid input ");
      resultMessage.setMessage("ERROR_0040_InvalidInput");
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    } else {
      rule.setRuleName(ruleName);
    }
    rule.setWaitTime(waitTime);
    rule.setRuleId(ruleId);
    List<RebalanceAbsoluteTime> timeList = new ArrayList<>();
    if (!StringUtils.isEmpty(absoluteTimeJson)) {
      logger.debug("absoluteTimeJSON is {}", absoluteTimeJson);
      JSONArray timeJsonArray = JSONArray.fromObject(absoluteTimeJson);
      timeList = (List<RebalanceAbsoluteTime>) JSONArray.toList(timeJsonArray,
          RebalanceAbsoluteTime.class);
      logger.debug("timeList is {}", timeList);
    }
    rule.setAbsoluteTimeList(timeList);
    try {
      systemService.updateRebalanceRule(Long.valueOf(account.getAccountId()), rule);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (RebalanceRuleExistingExceptionThrift e) {
      logger.error("Rebalance Rule Existing Exception catch in update:", e);
      resultMessage.setMessage(ErrorCode2.ERROR_RebalanceRuleExistingException);
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
   * list Rebalance Rule.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listRebalanceRule() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<RebalanceRule> rebalanceRules = new ArrayList<>();
    List<Long> idsList = new ArrayList<>();
    if (!StringUtils.isEmpty(idsJson)) {
      logger.debug("idsJSON is {}", idsJson);
      JSONArray volumeIdsJsonArray = JSONArray.fromObject(idsJson);
      idsList = (List<Long>) JSONArray.toList(volumeIdsJsonArray, Long.class);
      logger.debug("idsList is {}", idsList);
    }

    try {
      rebalanceRules = systemService.listRebalanceRule(Long.valueOf(account.getAccountId()),
          idsList);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);

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
    dataMap.put("rebalanceRules", rebalanceRules);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;

  }

  /**
   * delete Rebalance Rule.
   *
   * @return ACTION_RETURN_STRING
   */
  public String deleteRebalanceRule() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<Long> idsList = new ArrayList<>();
    if (!StringUtils.isEmpty(idsJson)) {
      logger.debug("idsJSON is {}", idsJson);
      JSONArray volumeIdsJsonArray = JSONArray.fromObject(idsJson);
      idsList = (List<Long>) JSONArray.toList(volumeIdsJsonArray, Long.class);
      logger.debug("idsList is {}", idsList);
    } else {
      logger.error("Invalid input ");
      resultMessage.setMessage("ERROR_0040_InvalidInput");
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }

    try {
      systemService.deleteRebalanceRule(Long.valueOf(account.getAccountId()), idsList);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (RebalanceRuleNotExistExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_RebalanceRuleNotExist");
    } catch (TException e) {
      e.printStackTrace();
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

}
