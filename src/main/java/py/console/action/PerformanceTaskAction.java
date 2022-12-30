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
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang3.NotImplementedException;
import org.apache.thrift.TException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import py.common.PyService;
import py.console.bean.Account;
import py.console.bean.PerformanceSearchTemplate;
import py.console.bean.ResourceItem;
import py.console.bean.ResultMessage;
import py.console.bean.SimpleArchiveMetadata;
import py.console.bean.SimpleDomain;
import py.console.bean.SimpleInstance;
import py.console.bean.SimpleStoragePool;
import py.console.bean.SimpleVolumeMetadata;
import py.console.service.account.AccountSessionService;
import py.console.service.alert.AlertService;
import py.console.service.disk.DiskService;
import py.console.service.domain.DomainService;
import py.console.service.instance.InstanceService;
import py.console.service.storagepool.StoragePoolService;
import py.console.service.volume.VolumeService;
import py.console.utils.Constants;
import py.console.utils.ErrorCode2;
import py.exception.EndPointNotFoundException;
import py.exception.GenericThriftClientFactoryException;
import py.exception.TooManyEndPointFoundException;
import py.monitor.common.CounterName;
import py.monitor.common.OperationName;
import py.thrift.monitorserver.service.IllegalParameterExceptionThrift;
import py.thrift.monitorserver.service.PerformanceDataTimeCrossBorderExceptionThrift;
import py.thrift.monitorserver.service.PerformanceDataTimeSpanIsBigExceptionThrift;
import py.thrift.share.AccountNotFoundExceptionThrift;
import py.thrift.share.EndPointNotFoundExceptionThrift;
import py.thrift.share.NetworkErrorExceptionThrift;
import py.thrift.share.PermissionNotGrantExceptionThrift;
import py.thrift.share.ServiceHavingBeenShutdownThrift;
import py.thrift.share.ServiceIsNotAvailableThrift;
import py.thrift.share.TooManyEndPointFoundExceptionThrift;

public class PerformanceTaskAction extends ActionSupport {

  private static final long serialVersionUID = 1L;
  private static final Logger logger = LoggerFactory.getLogger(PerformanceTaskAction.class);
  private AccountSessionService accountSessionService;
  private AlertService alertService;
  private InstanceService instanceService;
  private VolumeService volumeService;

  private DiskService diskService;

  private StoragePoolService storagePoolService;

  private DomainService domainService;

  private ResultMessage resultMessage;

  private Map<String, Object> dataMap;


  private String counterKey;
  private String id;
  private String sourceId;
  private String sourceName;
  private String idsJson;

  private String count;
  private String endTime;
  private String startTime;

  private String resourceType;
  private String sourcesJson;
  private String counterKeysJson;
  private String performanceDataTimeUnit;
  private String time;
  private String timeUnit;
  private String period;
  private String objectType;
  private InputStream fileStream;

  private String name;

  public PerformanceTaskAction() {
    super();
    this.dataMap = new HashMap<String, Object>();
  }

  /**
   * get Resource.
   *
   * @return ACTION_RETURN_STRING
   */
  public String getResource() {
    resultMessage = new ResultMessage();
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<ResourceItem> resourceList = new ArrayList<>();
    try {
      if (!StringUtils.isEmpty(counterKey) || !StringUtils.isEmpty(resourceType)) {
        OperationName operationName = null;
        if (!StringUtils.isEmpty(resourceType)) {
          operationName = OperationName.valueOf(resourceType);
        } else {
          operationName = CounterName.valueOf(counterKey).getOperationName();
        }
        switch (operationName) {
          case Equipment: {
            List<SimpleInstance> instanceList = new ArrayList<>();
            //instanceList = instanceService.getInstances(PyService.SYSTEMDAEMON.getServiceName());
            for (SimpleInstance instance : instanceList) {
              if (instance.getStatus().equals("OK")) {
                ResourceItem resource = new ResourceItem();
                resource.setId(instance.getHost());
                resource.setName(instance.getHost());
                resourceList.add(resource);

              }
            }
          }
          break;
          case Volume: {
            List<SimpleVolumeMetadata> volumeList = new ArrayList<SimpleVolumeMetadata>();
            volumeList = volumeService.getMultipleVolumes(Long.valueOf(account.getAccountId()),
                null);
            for (SimpleVolumeMetadata volume : volumeList) {
              ResourceItem resource = new ResourceItem();
              resource.setId(volume.getVolumeId());
              resource.setName(volume.getVolumeName());
              resourceList.add(resource);
            }

          }
          break;
          case StoragePool: {
            List<SimpleDomain> domainList = new ArrayList<SimpleDomain>();
            domainList = domainService.listDomains(null, Long.valueOf(account.getAccountId()));
            List<SimpleStoragePool> storagepoolList = new ArrayList<SimpleStoragePool>();
            for (SimpleDomain domain : domainList) {
              Set<SimpleStoragePool> storagepoolSet = new HashSet<>();
              storagepoolSet = storagePoolService
                  .listStoragePools(domain.getDomainId(), null,
                      Long.valueOf(account.getAccountId()));
              storagepoolList.addAll(storagepoolSet);
            }
            for (SimpleStoragePool pool : storagepoolList) {
              ResourceItem resource = new ResourceItem();
              resource.setId(pool.getPoolId());
              resource.setName(pool.getPoolName());
              resourceList.add(resource);
            }

          }
          break;
          case DiskPerformance: {
            List<SimpleArchiveMetadata> diskList = new ArrayList<>();
            diskList = diskService.listAllDisks(Constants.SUPER_ADMIN_ACCOUNT_ID);
            for (SimpleArchiveMetadata disk : diskList) {
              ResourceItem resource = new ResourceItem();
              String host = disk.getDataNodeEndPoint().split(":")[0];
              resource.setId(host + ":" + disk.getDeviceName());
              resource.setName(host + ":" + disk.getDeviceName());
              resourceList.add(resource);
            }
          }
          break;
          case SYSTEM: {
            // 系统无资源
          }
          break;
          default:
        }

      }
      Collections.sort(resourceList, new SortByName());
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (EndPointNotFoundException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TooManyEndPointFoundException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (GenericThriftClientFactoryException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_GenericThriftClientFactory");
    } catch (TException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resourceList", resourceList);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  class SortByName implements Comparator<ResourceItem> {

    public int compare(ResourceItem s1, ResourceItem s2) {
      if (s1.getName().equals(s2.getName())) {
        return 0;
      }
      if (s1.getName().compareToIgnoreCase(s2.getName()) > 0) {
        return 1;

      } else {
        return -1;
      }

    }
  }

  /**
   * get Monior Server.
   *
   * @return ACTION_RETURN_STRING
   */
  public String getMoniorServer() {
    resultMessage = new ResultMessage();
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    SimpleInstance monitorServer = new SimpleInstance();
    List<SimpleInstance> instanceList = new ArrayList<>();

    dataMap.put("monitorServer", monitorServer);
    resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);

    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;

  }

  /**
   * save Or Update Performance Search Template.
   *
   * @return ACTION_RETURN_STRING
   */
  public String saveOrUpdatePerformanceSearchTemplate() {
    resultMessage = new ResultMessage();
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    PerformanceSearchTemplate performanceSearchTemplate = new PerformanceSearchTemplate();
    performanceSearchTemplate.setAccountId(account.getAccountId());
    performanceSearchTemplate.setName(name);
    performanceSearchTemplate.setStartTime(startTime);
    performanceSearchTemplate.setEndTime(endTime);
    performanceSearchTemplate.setObjectType(objectType);
    if (!StringUtils.isEmpty(period)) {
      performanceSearchTemplate.setPeriod(period);
    }

    String timeUnit = "FIVE_MINUTES";
    if (!StringUtils.isEmpty(performanceDataTimeUnit)) {

      timeUnit = performanceDataTimeUnit;
    }
    performanceSearchTemplate.setTimeUnit(timeUnit);
    performanceSearchTemplate.setCounterKeyJson(counterKeysJson);
    performanceSearchTemplate.setSourcesJson(sourcesJson);
    try {
      alertService.saveOrUpdatePerformanceSearchTemplate(performanceSearchTemplate);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (IllegalParameterExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    } catch (PerformanceDataTimeSpanIsBigExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_PerformanceDataTimeSpanIsBigException");
    } catch (PerformanceDataTimeCrossBorderExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_PerformanceDataTimeCrossBorderException");
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

    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * delete Performance Search Template.
   *
   * @return ACTION_RETURN_STRING
   */
  public String deletePerformanceSearchTemplate() {
    resultMessage = new ResultMessage();
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }

    try {
      alertService.deletePerformanceSearchTemplate(Long.valueOf(account.getAccountId()),
          Long.valueOf(id));
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (IllegalParameterExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
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

    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * list Performance Search Template.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listPerformanceSearchTemplate() {
    resultMessage = new ResultMessage();
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<PerformanceSearchTemplate> performanceSearchTemplateList = new ArrayList<>();
    try {
      performanceSearchTemplateList = alertService.listPerformanceSearchTemplate(
          Long.valueOf(account.getAccountId()));
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (IllegalParameterExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
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

    dataMap.put("performanceSearchTemplateList", performanceSearchTemplateList);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * test Hello.
   *
   * @return SUCCESS
   */
  public String testHello() {

    String xx = "hello";
    byte[] srtbyte = xx.getBytes();
    fileStream = new ByteArrayInputStream(srtbyte);

    return SUCCESS;

  }

  /**
   * get Performance Data Time Span.
   *
   * @return ACTION_RETURN_STRING
   */
  public String getPerformanceDataTimeSpan() {
    resultMessage = new ResultMessage();
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    Map<String, Map<String, Integer>> performanceDataTimeData = new HashMap<>();
    try {
      performanceDataTimeData = alertService.getPerformanceDataTimeSpan();
      dataMap.put("performanceDataTimeData", performanceDataTimeData);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (EndPointNotFoundException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TooManyEndPointFoundException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (GenericThriftClientFactoryException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_GenericThriftClientFactory");
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (IllegalParameterExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    } catch (TException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  public AccountSessionService getAccountSessionService() {
    return accountSessionService;
  }

  public void setAccountSessionService(AccountSessionService accountSessionService) {
    this.accountSessionService = accountSessionService;
  }

  public AlertService getAlertService() {
    return alertService;
  }

  public void setAlertService(AlertService alertService) {
    this.alertService = alertService;
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

  public String getCounterKey() {
    return counterKey;
  }

  public void setCounterKey(String counterKey) {
    this.counterKey = counterKey;
  }

  public InstanceService getInstanceService() {
    return instanceService;
  }

  public void setInstanceService(InstanceService instanceService) {
    this.instanceService = instanceService;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getSourceId() {
    return sourceId;
  }

  public void setSourceId(String sourceId) {
    this.sourceId = sourceId;
  }

  public String getIdsJson() {
    return idsJson;
  }

  public void setIdsJson(String idsJson) {
    this.idsJson = idsJson;
  }

  public String getCount() {
    return count;
  }

  public void setCount(String count) {
    this.count = count;
  }

  public String getEndTime() {
    return endTime;
  }

  public void setEndTime(String endTime) {
    this.endTime = endTime;
  }

  public String getStartTime() {
    return startTime;
  }

  public void setStartTime(String startTime) {
    this.startTime = startTime;
  }

  public VolumeService getVolumeService() {
    return volumeService;
  }

  public void setVolumeService(VolumeService volumeService) {
    this.volumeService = volumeService;
  }

  public DiskService getDiskService() {
    return diskService;
  }

  public void setDiskService(DiskService diskService) {
    this.diskService = diskService;
  }

  public StoragePoolService getStoragePoolService() {
    return storagePoolService;
  }

  public void setStoragePoolService(StoragePoolService storagePoolService) {
    this.storagePoolService = storagePoolService;
  }

  public DomainService getDomainService() {
    return domainService;
  }

  public void setDomainService(DomainService domainService) {
    this.domainService = domainService;
  }

  public String getSourceName() {
    return sourceName;
  }

  public void setSourceName(String sourceName) {
    this.sourceName = sourceName;
  }

  public String getSourcesJson() {
    return sourcesJson;
  }

  public void setSourcesJson(String sourcesJson) {
    this.sourcesJson = sourcesJson;
  }

  public String getCounterKeysJson() {
    return counterKeysJson;
  }

  public void setCounterKeysJson(String counterKeysJson) {
    this.counterKeysJson = counterKeysJson;
  }

  public String getResourceType() {
    return resourceType;
  }

  public void setResourceType(String resourceType) {
    this.resourceType = resourceType;
  }

  public String getPerformanceDataTimeUnit() {
    return performanceDataTimeUnit;
  }

  public void setPerformanceDataTimeUnit(String performanceDataTimeUnit) {
    this.performanceDataTimeUnit = performanceDataTimeUnit;
  }

  public String getTime() {
    return time;
  }

  public void setTime(String time) {
    this.time = time;
  }

  public String getTimeUnit() {
    return timeUnit;
  }

  public void setTimeUnit(String timeUnit) {
    this.timeUnit = timeUnit;
  }

  public InputStream getFileStream() {
    return fileStream;
  }

  public void setFileStream(InputStream fileStream) {
    this.fileStream = fileStream;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getPeriod() {
    return period;
  }

  public void setPeriod(String period) {
    this.period = period;
  }

  public String getObjectType() {
    return objectType;
  }

  public void setObjectType(String objectType) {
    this.objectType = objectType;
  }
}
