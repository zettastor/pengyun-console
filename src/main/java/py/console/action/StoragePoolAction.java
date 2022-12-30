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

import static py.common.Constants.SUPERADMIN_ACCOUNT_ID;
import static py.console.utils.ErrorCode2.ERROR_PermissionNotGrantException;

import com.opensymphony.xwork2.ActionContext;
import com.opensymphony.xwork2.ActionSupport;
import java.io.File;
import java.io.FileWriter;
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
import org.apache.thrift.transport.TTransportException;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;
import org.jdom.output.Format;
import org.jdom.output.XMLOutputter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import py.console.bean.Account;
import py.console.bean.ResultMessage;
import py.console.bean.SimpleArchiveMetadata;
import py.console.bean.SimpleInstance;
import py.console.bean.SimpleInstanceMetadata;
import py.console.bean.SimpleStoragePool;
import py.console.service.account.AccountSessionService;
import py.console.service.disk.DiskService;
import py.console.service.instance.InstanceService;
import py.console.service.storagepool.StoragePoolService;
import py.console.utils.Constants;
import py.console.utils.ErrorCode2;
import py.exception.EndPointNotFoundException;
import py.exception.GenericThriftClientFactoryException;
import py.exception.TooManyEndPointFoundException;
import py.thrift.share.AccessDeniedExceptionThrift;
import py.thrift.share.AccountNotFoundExceptionThrift;
import py.thrift.share.ArchiveIsUsingExceptionThrift;
import py.thrift.share.ArchiveNotFoundExceptionThrift;
import py.thrift.share.ArchiveNotFreeToUseExceptionThrift;
import py.thrift.share.DomainIsDeletingExceptionThrift;
import py.thrift.share.DomainNotExistedExceptionThrift;
import py.thrift.share.EndPointNotFoundExceptionThrift;
import py.thrift.share.FailToRemoveArchiveFromStoragePoolExceptionThrift;
import py.thrift.share.InvalidInputExceptionThrift;
import py.thrift.share.NetworkErrorExceptionThrift;
import py.thrift.share.PermissionNotGrantExceptionThrift;
import py.thrift.share.ResourceNotExistsExceptionThrift;
import py.thrift.share.ServiceHavingBeenShutdownThrift;
import py.thrift.share.ServiceIsNotAvailableThrift;
import py.thrift.share.StillHaveVolumeExceptionThrift;
import py.thrift.share.StoragePoolExistedExceptionThrift;
import py.thrift.share.StoragePoolIsDeletingExceptionThrift;
import py.thrift.share.StoragePoolNameExistedExceptionThrift;
import py.thrift.share.StoragePoolNotExistedExceptionThrift;
import py.thrift.share.TooManyEndPointFoundExceptionThrift;

/**
 * StoragePoolAction.
 */
public class StoragePoolAction extends ActionSupport {

  private static final Logger logger = LoggerFactory.getLogger(StoragePoolAction.class);

  private AccountSessionService accountSessionService;
  private StoragePoolService storagePoolService;
  private InstanceService instanceService;
  private DiskService diskService;
  private ResultMessage resultMessage;
  private String poolId;
  private String domainId;
  private String poolName;
  private String description;
  private String strategy;
  private String diskMapString;

  private String storagePoolId;
  private String storagePoolName;
  private String datanodeId;
  private String archiveId;
  private String configFile = "../config.xml";
  private String securityLevel;
  private String poolIds;

  private String minMigrationSpeed;
  private String maxMigrationSpeed;
  private String migrationStrategy;
  private String statusLevel;

  private Set<SimpleStoragePool> simpleStoragePoolsSet;
  private Map<String, Set<SimpleArchiveMetadata>> archiveMap;
  // <DatanodeId, archives>
  private Map<SimpleInstance, Set<SimpleArchiveMetadata>> unusedDiskMap;

  private Map<String, Object> dataMap;
  private String orderDir = "asc";

  /**
   * StoragePoolAction.
   */
  public StoragePoolAction() {
    super();
    this.dataMap = new HashMap<String, Object>();
    resultMessage = new ResultMessage();
  }

  public AccountSessionService getAccountSessionService() {
    return accountSessionService;
  }

  public void setAccountSessionService(AccountSessionService accountSessionService) {
    this.accountSessionService = accountSessionService;
  }

  public StoragePoolService getStoragePoolService() {
    return storagePoolService;
  }

  public void setStoragePoolService(StoragePoolService storagePoolService) {
    this.storagePoolService = storagePoolService;
  }

  public String getStatusLevel() {
    return statusLevel;
  }

  public void setStatusLevel(String statusLevel) {
    this.statusLevel = statusLevel;
  }

  public InstanceService getInstanceService() {
    return instanceService;
  }

  public void setInstanceService(InstanceService instanceService) {
    this.instanceService = instanceService;
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

  public void setResultMessage(ResultMessage resultMessage) {
    this.resultMessage = resultMessage;
  }

  public String getPoolId() {
    return poolId;
  }

  public void setPoolId(String poolId) {
    this.poolId = poolId;
  }

  public String getDomainId() {
    return domainId;
  }

  public void setDomainId(String domainId) {
    this.domainId = domainId;
  }

  public String getPoolName() {
    return poolName;
  }

  public void setPoolName(String poolName) {
    this.poolName = poolName;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getStrategy() {
    return strategy;
  }

  public void setStrategy(String strategy) {
    this.strategy = strategy;
  }

  public String getStoragePoolId() {
    return storagePoolId;
  }

  public void setStoragePoolId(String storagePoolId) {
    this.storagePoolId = storagePoolId;
  }

  public String getDatanodeId() {
    return datanodeId;
  }

  public void setDatanodeId(String datanodeId) {
    this.datanodeId = datanodeId;
  }

  public String getArchiveId() {
    return archiveId;
  }

  public void setArchiveId(String archiveId) {
    this.archiveId = archiveId;
  }

  public Set<SimpleStoragePool> getSimpleStoragePoolsSet() {
    return simpleStoragePoolsSet;
  }

  public void setSimpleStoragePoolsSet(Set<SimpleStoragePool> simpleStoragePoolsSet) {
    this.simpleStoragePoolsSet = simpleStoragePoolsSet;
  }

  public Map<String, Set<SimpleArchiveMetadata>> getArchiveMap() {
    return archiveMap;
  }

  public void setArchiveMap(Map<String, Set<SimpleArchiveMetadata>> archiveMap) {
    this.archiveMap = archiveMap;
  }

  public String getDiskMapString() {
    return diskMapString;
  }

  public void setDiskMapString(String diskString) {
    this.diskMapString = diskString;
  }

  public String getStoragePoolName() {
    return storagePoolName;
  }

  public void setStoragePoolName(String storagePoolName) {
    this.storagePoolName = storagePoolName;
  }

  public Map<SimpleInstance, Set<SimpleArchiveMetadata>> getUnusedDiskMap() {
    return unusedDiskMap;
  }

  public void setUnusedDiskMap(Map<SimpleInstance, Set<SimpleArchiveMetadata>> unusedDiskMap) {
    this.unusedDiskMap = unusedDiskMap;
  }

  /**
   * create Storage Pool.
   *
   * @return ACTION_RETURN_STRING
   */
  // params:domainId,poolName,description,strategy
  public String createStoragePool() {
    logger.debug("Creating a new storage pool...");
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }

    SimpleStoragePool simpleStoragePool = new SimpleStoragePool();
    simpleStoragePool.setPoolId(String.valueOf(generatePoolId()));
    simpleStoragePool.setDomainId(domainId);
    simpleStoragePool.setPoolName(poolName);
    simpleStoragePool.setDescription(description);
    simpleStoragePool.setStrategy(strategy);
    logger.warn("StoragePool will be created:{}", simpleStoragePool);
    // add security level into config.xml
    File file = new File(configFile);
    if (!file.exists()) {
      createAndAddToXml(simpleStoragePool.getPoolId(), securityLevel);
    } else {
      addToXml(simpleStoragePool.getPoolId(), securityLevel);
    }
    SimpleStoragePool createPool = new SimpleStoragePool();
    try {
      createPool = storagePoolService.createStoragePool(simpleStoragePool,
          Long.valueOf(account.getAccountId()));
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (InvalidInputExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (StoragePoolExistedExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0066_StoragePoolExisted");
    } catch (StoragePoolNameExistedExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0067_StoragePoolNameExisted");
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (ArchiveNotFreeToUseExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0068_ArchiveNotFreeToUse");
    } catch (ArchiveNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0069_ArchiveNotFound");
    } catch (DomainNotExistedExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0046_DomainNotExisted");
    } catch (ArchiveIsUsingExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0070_ArchiveIsUsing");
    } catch (DomainIsDeletingExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0059_DomainIsDeleting");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (AccessDeniedExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0050_AccessDenied");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("pool", createPool);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * generate Pool Id.
   *
   * @return ACTION_RETURN_STRING
   */
  public long generatePoolId() {
    long id = UUID.randomUUID().getLeastSignificantBits();
    if (id < 0) {
      id = id + Long.MAX_VALUE;
    }

    return id;
  }

  /**
   * create And Add To Xml.
   *
   * @param id pool id
   * @param securityLevel security level
   */
  // first add volume cache type into xml
  public void createAndAddToXml(String id, String securityLevel) {
    Element poolElement = new Element("pool");
    poolElement.setAttribute("id", id);
    poolElement.addContent(new Element("id").setText(id));
    poolElement.addContent(new Element("securityLevel").setText(securityLevel));
    Element root = new Element("CONFIG");
    root.addContent(poolElement);
    Document document = new Document();
    document.setRootElement(root);
    saveXml(document);
  }

  /**
   * addToXml.
   *
   * @param id pool id
   * @param securityLevel security level
   */
  public void addToXml(String id, String securityLevel) {
    SAXBuilder sb = new SAXBuilder();
    Document doc = null;
    try {
      doc = sb.build(configFile);
    } catch (JDOMException | IOException e) {
      logger.error("exception catch", e);
    }
    // List<Element> list = root.getChildren("volume");
    Element poolElement = new Element("pool");
    poolElement.setAttribute("id", id);
    poolElement.addContent(new Element("id").setText(id));
    poolElement.addContent(new Element("securityLevel").setText(securityLevel));
    Element root = doc.getRootElement();
    root.addContent(poolElement);
    saveXml(doc);
  }

  /**
   * modified Security Level.
   *
   * @param id pool id
   * @param securityLevel security level
   */
  public void modifiedSecurityLevel(String id, String securityLevel) {
    SAXBuilder sb = new SAXBuilder();
    Document doc = null;
    try {
      doc = sb.build(configFile);
    } catch (JDOMException | IOException e) {
      logger.error("exception catch", e);
    }
    Element root = doc.getRootElement();
    List<Element> list = root.getChildren("pool");
    for (Element el : list) {
      if (el.getAttributeValue("id").equals(id)) {
        Element name = el.getChild("securityLevel");
        name.setText(securityLevel);
      }
    }
    saveXml(doc);

  }

  /**
   * save Xml.
   *
   * @param doc Document
   */
  public void saveXml(Document doc) {
    // 将doc对象输出到文件
    try {
      // 创建xml文件输出流
      XMLOutputter xmlopt = new XMLOutputter();

      // 创建文件输出流
      FileWriter writer = new FileWriter(configFile);

      // 指定文档格式
      Format fm = Format.getPrettyFormat();
      // fm.setEncoding("GB2312");
      xmlopt.setFormat(fm);

      // 将doc写入到指定的文件中
      xmlopt.output(doc, writer);
      writer.close();
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  /**
   * setting Security Level.
   *
   * @param poolList simple storage pool list
   * @return pool List
   */
  public List<SimpleStoragePool> settingSecurityLevel(List<SimpleStoragePool> poolList) {
    SAXBuilder sb = new SAXBuilder();
    Document doc = null;
    File file = new File(configFile);
    if (!file.exists()) {
      return poolList;
    }
    try {
      doc = sb.build(configFile);
    } catch (JDOMException e) {
      logger.error("exception catch", e);
    } catch (IOException e) {
      logger.error("exception catch", e);
    }
    Element root = doc.getRootElement();
    List<Element> elements = root.getChildren("pool");
    for (SimpleStoragePool pool : poolList) {
      for (Element el : elements) {

        if ((el.getChildText("id")).equals(pool.getPoolId())) {
          pool.setSecurityLevel(el.getChildText("securityLevel"));

        }
      }
    }
    return poolList;
  }

  /**
   * list Unused Archives.
   *
   * @return ACTION_RETURN_STRING
   */
  // params:storagePoolId,domainId
  public String listUnusedArchives() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    logger.debug("List disk not in the storage pool");

    if (unusedDiskMap == null) {
      unusedDiskMap = new HashMap<SimpleInstance, Set<SimpleArchiveMetadata>>();
    }
    try {
      List<SimpleInstanceMetadata> allDatanode = diskService.listInstanceMetadata();
      logger.info("allDatanode:[{}]", allDatanode);
      List<SimpleInstanceMetadata> datanodeInDomain = new ArrayList<>();
      for (SimpleInstanceMetadata simpleInstanceMetadata : allDatanode) {
        if (simpleInstanceMetadata.getDomainId() != null && simpleInstanceMetadata.getDomainId()
            .equals(Long.parseLong(domainId))) {
          datanodeInDomain.add(simpleInstanceMetadata);
        }
      }

      // logger.warn("datanodeList:[{}]", datanodeList);
      unusedDiskMap.clear();

      Set<SimpleStoragePool> simpleStoragePoolSet;

      // get all archives in all storagepool use superadmin account
      simpleStoragePoolSet = storagePoolService.listStoragePools(domainId, null,
          SUPERADMIN_ACCOUNT_ID);
      Map<String, SimpleArchiveMetadata> archivesUsedByAllPools = new HashMap<>();
      for (SimpleStoragePool pool : simpleStoragePoolSet) {
        if (pool.getArchivesInDatanode() != null && !pool.getArchivesInDatanode().isEmpty()) {
          for (Map.Entry<SimpleInstance, Set<SimpleArchiveMetadata>> entry :
              pool.getArchivesInDatanode()
                  .entrySet()) {
            for (SimpleArchiveMetadata archive : entry.getValue()) {
              archivesUsedByAllPools.put(archive.getArchiveId(), archive);
            }
          }
        }
      }
      for (SimpleInstanceMetadata datanode : datanodeInDomain) {
        Set<SimpleArchiveMetadata> unusedDisksSet = new HashSet<SimpleArchiveMetadata>();
        List<SimpleArchiveMetadata> archivesInOneDatanode = datanode.getArchives();
        if (archivesInOneDatanode != null && archivesInOneDatanode.size() != 0) {
          for (SimpleArchiveMetadata simpleArchiveMetadata : archivesInOneDatanode) {
            if (simpleArchiveMetadata.getStoragePool() == null) {
              unusedDisksSet.add(simpleArchiveMetadata);
              logger.debug("simplearchiveMeta pool is null");
            } else {
              // if this archive's pool is not null:ergod all archive in all storagepool,if both
              // pool id are equal then the archive is used
              boolean found = archivesUsedByAllPools.containsKey(
                  simpleArchiveMetadata.getArchiveId());
              logger.debug("flag is {}", found);
              if (!found && simpleArchiveMetadata.getStatus().name().equals("GOOD")
                  && simpleArchiveMetadata.getArchiveType().equals("RAW_DISK")) {
                logger.warn(" simpleArchiveMetadata.getArchiveType().name() is {}", unusedDisksSet);
                unusedDisksSet.add(simpleArchiveMetadata);
              }
              logger.debug("unusedDisksSet is {}", unusedDisksSet);
            }
          }
        }
        if (unusedDisksSet.size() != 0) {
          SimpleInstance simpleInstance = instanceService
              .getInstances(Long.parseLong(datanode.getInstanceId()));
          unusedDiskMap.put(simpleInstance, unusedDisksSet);
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

    // logger.warn("unusedDiskMap:[{}]", unusedDiskMap);
    dataMap.put("unusedDiskMap", unusedDiskMap);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * list Storage Pool.
   *
   * @return ACTION_RETURN_STRING
   */
  // params:domainId,storagepool name
  public String listStoragePool() {
    logger.debug("Begin to list the all storage pool...");

    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<SimpleStoragePool> simpleStoragePoolsList = new ArrayList<>();
    logger.info("domianId:{}", domainId);
    List<Long> poolIdsList = null;
    try {

      if (poolIds != null && poolIds.length() != 0) {
        JSONArray pooIdsJsonArray = JSONArray.fromObject(poolIds);
        poolIdsList = (List<Long>) JSONArray.toList(pooIdsJsonArray, Long.class);
        logger.debug("poolIdsList is {}", poolIdsList);
      }
      simpleStoragePoolsSet = storagePoolService
          .listStoragePools(domainId, poolIdsList, Long.valueOf(account.getAccountId()));

      simpleStoragePoolsList.addAll(simpleStoragePoolsSet);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (InvalidInputExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (ResourceNotExistsExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_ResourceNotExistsException");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    Collections.sort(simpleStoragePoolsList, new SortByName());
    dataMap.put("simpleStoragePoolsList", simpleStoragePoolsList);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * list Storage Pool Capacity.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listStoragePoolCapacity() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    logger.debug("domianId:{}", domainId);
    List<SimpleStoragePool> simpleStoragePoolsList = new ArrayList<>();
    try {
      if (poolIds == null || poolIds.length() == 0) {
        simpleStoragePoolsList = storagePoolService
            .listStoragePoolCapacity(domainId, null, Long.valueOf(account.getAccountId()));
      } else {
        JSONArray pooIdsJsonArray = JSONArray.fromObject(poolIds);
        List<Long> poolIdsList = (List<Long>) JSONArray.toList(pooIdsJsonArray, Long.class);
        logger.debug("poolIdsList is {}", poolIdsList);
        simpleStoragePoolsList = storagePoolService
            .listStoragePoolCapacity(domainId, poolIdsList, Long.valueOf(account.getAccountId()));
      }
      logger.debug("simpleStoragePoolsList:[{}]", simpleStoragePoolsList);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_ServiceHavingBeenShutdownThrift");
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_ServiceIsNotAvailableThrift");
    } catch (InvalidInputExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_InvalidInputExceptionThrift");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (TException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    orderDir = "asc";
    Collections.sort(simpleStoragePoolsList, new SortByName());
    dataMap.put("simpleStoragePoolsList", simpleStoragePoolsList);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;

  }

  /**
   * list Storage Pool DT.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listStoragePoolDt() {
    logger.debug("Begin to list the all storage pool...");
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
    String[] cols = {"poolId", "null", "null", "domainId", "poolName", "strategy", "status"};
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
    List<SimpleStoragePool> simpleStoragePoolsList = new ArrayList<>();
    List<SimpleStoragePool> simpleStoragePoolsTmpList = new ArrayList<>();
    logger.info("domianId:{}", domainId);
    try {
      simpleStoragePoolsSet = storagePoolService
          .listStoragePools(domainId, null, Long.valueOf(account.getAccountId()));

      simpleStoragePoolsList.addAll(simpleStoragePoolsSet);

      // search
      recordsTotal = String.valueOf(simpleStoragePoolsList.size());

      if (!searchValue.equals("")) {
        for (SimpleStoragePool pool : simpleStoragePoolsList) {
          if (pool.getPoolName().toLowerCase().contains(searchValue.toLowerCase())) {
            simpleStoragePoolsTmpList.add(pool);
          }
        }
      } else {
        simpleStoragePoolsTmpList.addAll(simpleStoragePoolsList);
      }
      if (!StringUtils.isEmpty(statusLevel)) {
        simpleStoragePoolsList.clear();
        simpleStoragePoolsList.addAll(simpleStoragePoolsTmpList);
        simpleStoragePoolsTmpList.clear();
        for (int i = 0; i < simpleStoragePoolsList.size(); i++) {
          if (statusLevel.equals("HIGH")) {
            if (simpleStoragePoolsList.get(i).getStoragePoolLevel().equals("HIGH")) {
              simpleStoragePoolsTmpList.add(simpleStoragePoolsList.get(i));
            }
          } else if (statusLevel.equals("OTHER")) {
            if (!simpleStoragePoolsList.get(i).getStoragePoolLevel().equals("HIGH")) {
              simpleStoragePoolsTmpList.add(simpleStoragePoolsList.get(i));
            }
          }
        }
      }

      recordsFiltered = String.valueOf(simpleStoragePoolsTmpList.size());
      // sort
      logger.debug("orderColumn is {}", orderColumn);
      switch (orderColumn) {
        case "poolName":
          Collections.sort(simpleStoragePoolsTmpList, new SortByName());
          break;
        case "strategy":
          Collections.sort(simpleStoragePoolsTmpList, new SortByStrategy());
          break;
        case "status":
          Collections.sort(simpleStoragePoolsTmpList, new SortByStatus());
          break;

        default:
          Collections.sort(simpleStoragePoolsTmpList, new SortByName());
      }
      // pagination
      simpleStoragePoolsList.clear();
      int size = Integer.parseInt(start) + Integer.parseInt(length);
      if (size > simpleStoragePoolsTmpList.size()) {
        size = simpleStoragePoolsTmpList.size();
      }
      for (int i = Integer.parseInt(start); i < size; i++) {
        simpleStoragePoolsList.add(simpleStoragePoolsTmpList.get(i));
      }

      // add security level into list
      simpleStoragePoolsList = settingSecurityLevel(simpleStoragePoolsList);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (InvalidInputExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (ResourceNotExistsExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_ResourceNotExistsException");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("data", simpleStoragePoolsList);
    dataMap.put("recordsTotal", recordsTotal);
    dataMap.put("recordsFiltered", recordsFiltered);
    dataMap.put("draw", draw);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * is Pool Has Performance Data.
   *
   * @return ACTION_RETURN_STRING
   */
  public String isPoolHasPerformanceData() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    try {
      Boolean hasPerformanceData = storagePoolService.isPoolHasPerformanceData(poolId);
      dataMap.put("hasPerformanceData", hasPerformanceData);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (InvalidInputExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_PermissionNotGrantException");
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (ResourceNotExistsExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_ResourceNotExistsException");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (Exception e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * SortByName.
   */
  public class SortByName implements Comparator<SimpleStoragePool> {

    /**
     * compare.
     *
     * @param s1 the first object to be compared.
     * @param s2 the second object to be compared.
     * @return int
     */
    public int compare(SimpleStoragePool s1, SimpleStoragePool s2) {
      if (s1.getPoolName().equals(s2.getPoolName())) {
        return 0;
      }
      if (s1.getPoolName().compareToIgnoreCase(s2.getPoolName()) > 0) {
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

  class SortByStrategy implements Comparator<SimpleStoragePool> {

    public int compare(SimpleStoragePool s1, SimpleStoragePool s2) {
      if (s1.getStrategy().equals(s2.getStrategy())) {
        return 0;
      }
      if (s1.getStrategy().compareToIgnoreCase(s2.getStrategy()) > 0) {
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

  class SortByStatus implements Comparator<SimpleStoragePool> {

    public int compare(SimpleStoragePool s1, SimpleStoragePool s2) {
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
   * update Storage Pool.
   *
   * @return ACTION_RETURN_STRING
   */
  public String updateStoragePool() {
    logger.debug("Begin to update a storage pool...");
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    if (securityLevel != null && securityLevel.length() != 0) {
      modifiedSecurityLevel(poolId, securityLevel);
    }

    SimpleStoragePool simpleStoragePool = new SimpleStoragePool();
    simpleStoragePool.setPoolId(poolId);
    simpleStoragePool.setPoolName(poolName);
    simpleStoragePool.setDescription(description);
    simpleStoragePool.setStrategy(strategy);
    simpleStoragePool.setDomainId(domainId);
    logger.info("diskMapString:[{}]", diskMapString);
    simpleStoragePool.setArchivesInDatanode(parseObjectListFromJsonStr(diskMapString));
    try {
      storagePoolService.updateStoragePool(simpleStoragePool, Long.valueOf(account.getAccountId()));
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (InvalidInputExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (ArchiveNotFreeToUseExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0068_ArchiveNotFreeToUse");
    } catch (ArchiveNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0069_ArchiveNotFound");
    } catch (StoragePoolNotExistedExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0071_StoragePoolNotExisted");
    } catch (DomainNotExistedExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0046_DomainNotExisted");
    } catch (ArchiveIsUsingExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0070_ArchiveIsUsing");
    } catch (StoragePoolIsDeletingExceptionThrift e) {
      logger.error("caught an exception", e);
      resultMessage.setMessage("ERROR_0072_StoragePoolIsDeleting");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("caught an exception", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("caught an exception", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("caught an exception", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("caught an exception", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (AccessDeniedExceptionThrift e) {
      logger.error("caught an exception", e);
      resultMessage.setMessage("ERROR_0050_AccessDenied");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("caught an exception", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TException e) {
      logger.error("caught an exception", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;

  }

  /**
   * parse Object List From Json Str.
   *
   * @param jsonStr json string
   * @return Map
   */
  public Map<SimpleInstance, Set<SimpleArchiveMetadata>> parseObjectListFromJsonStr(
      String jsonStr) {
    if (jsonStr == null) {
      logger.warn("jsonStr is null, do not need to process any more");
      return null;
    }
    Map<SimpleInstance, Set<SimpleArchiveMetadata>> map = new HashMap<SimpleInstance,
        Set<SimpleArchiveMetadata>>();
    Map<String, Set<SimpleArchiveMetadata>> mapTmp = new HashMap<String,
        Set<SimpleArchiveMetadata>>();
    JSONArray archiveIdsJson = JSONArray.fromObject(jsonStr);
    logger.info("archiveIdsJson is {}", archiveIdsJson);
    for (int i = 0; i < archiveIdsJson.size(); i++) {
      String datanodeIdTmp = archiveIdsJson.getJSONObject(i).getString("datanodeId");
      String archiveId = archiveIdsJson.getJSONObject(i).getString("archiveId");
      SimpleArchiveMetadata simpleArchiveMetadata = new SimpleArchiveMetadata();
      simpleArchiveMetadata.setArchiveId(archiveId);

      Set<SimpleArchiveMetadata> archiveIdsSet = null;
      if (!mapTmp.containsKey(datanodeIdTmp)) {
        archiveIdsSet = new HashSet<SimpleArchiveMetadata>();
        mapTmp.put(datanodeIdTmp, archiveIdsSet);
      } else {
        archiveIdsSet = mapTmp.get(datanodeIdTmp);
      }
      archiveIdsSet.add(simpleArchiveMetadata);
    }
    for (Map.Entry<String, Set<SimpleArchiveMetadata>> entry : mapTmp.entrySet()) {
      SimpleInstance simpleInstance = new SimpleInstance();
      simpleInstance.setInstanceId(entry.getKey());
      map.put(simpleInstance, entry.getValue());
    }
    return map;
  }

  /**
   * remove Archive from Storage Pool.
   *
   * @return ACTION_RETURN_STRING
   */
  public String removeArchivefromStoragePool() {
    logger.debug("Begin to remove one archive from the storage pool...");
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    logger.warn("poolId: {},domainId: {},datanodeId: {},archiveId: {}", poolId, domainId,
        datanodeId, archiveId);
    try {
      storagePoolService.removeArchiveFormStoragePool(poolId, domainId, datanodeId, archiveId,
          Long.valueOf(account.getAccountId()));
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (InvalidInputExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (FailToRemoveArchiveFromStoragePoolExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0073_FailToRemoveArchiveFromStoragePool");
    } catch (ArchiveNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0069_ArchiveNotFound");
    } catch (StoragePoolNotExistedExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0071_StoragePoolNotExisted");
    } catch (DomainNotExistedExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0046_DomainNotExisted");
    } catch (StoragePoolIsDeletingExceptionThrift e) {
      logger.error("caught an exception", e);
      resultMessage.setMessage("ERROR_0072_StoragePoolIsDeleting");
    } catch (TTransportException e) {
      logger.error("caught an exception", e);
      resultMessage.setMessage("ERROR_TTransportException");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("caught an exception", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("caught an exception", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("caught an exception", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (AccessDeniedExceptionThrift e) {
      logger.error("caught an exception", e);
      resultMessage.setMessage("ERROR_AccessDeniedException");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("caught an exception", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TException e) {
      logger.error("caught an exception", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }

    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * delete Storage Pool.
   *
   * @return ACTION_RETURN_STRING
   */
  public String deleteStoragePool() {
    logger.debug("Begin to delete one storage pool...");

    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    logger.warn("domainId:{},storagepoolId:{}", domainId, poolId);
    try {
      storagePoolService.deleteStoragePool(domainId, poolId, Long.valueOf(account.getAccountId()));
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (InvalidInputExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (StoragePoolNotExistedExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0071_StoragePoolNotExisted");
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (StillHaveVolumeExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0074_StillHaveVolume");
    } catch (DomainNotExistedExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0046_DomainNotExisted");
    } catch (StoragePoolIsDeletingExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0072_StoragePoolIsDeleting");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0003_AccountNotExists");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (AccessDeniedExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0050_AccessDenied");
    } catch (ResourceNotExistsExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_ResourceNotExistsException");
    } catch (TException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
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

  public String getSecurityLevel() {
    return securityLevel;
  }

  public void setSecurityLevel(String securityLevel) {
    this.securityLevel = securityLevel;
  }

  public String getPoolIds() {
    return poolIds;
  }

  public void setPoolIds(String poolIds) {
    this.poolIds = poolIds;
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

  public String getMigrationStrategy() {
    return migrationStrategy;
  }

  public void setMigrationStrategy(String migrationStrategy) {
    this.migrationStrategy = migrationStrategy;
  }
}
