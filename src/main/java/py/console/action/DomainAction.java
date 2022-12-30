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

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.opensymphony.xwork2.ActionContext;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import net.sf.json.JSONArray;
import org.apache.struts2.ServletActionContext;
import org.apache.thrift.TException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import py.common.struct.EndPoint;
import py.console.bean.Account;
import py.console.bean.ResultMessage;
import py.console.bean.SimpleDomain;
import py.console.bean.SimpleInstance;
import py.console.service.account.AccountSessionService;
import py.console.service.disk.DiskService;
import py.console.service.domain.DomainService;
import py.console.utils.Constants;
import py.console.utils.ErrorCode2;
import py.thrift.share.AccessDeniedExceptionThrift;
import py.thrift.share.AccountNotFoundExceptionThrift;
import py.thrift.share.DatanodeIsUsingExceptionThrift;
import py.thrift.share.DatanodeNotFoundExceptionThrift;
import py.thrift.share.DatanodeNotFreeToUseExceptionThrift;
import py.thrift.share.DomainExistedExceptionThrift;
import py.thrift.share.DomainIsDeletingExceptionThrift;
import py.thrift.share.DomainNameExistedExceptionThrift;
import py.thrift.share.DomainNotExistedExceptionThrift;
import py.thrift.share.EndPointNotFoundExceptionThrift;
import py.thrift.share.FailToRemoveDatanodeFromDomainExceptionThrift;
import py.thrift.share.InstanceIsSubHealthExceptionThrift;
import py.thrift.share.InstanceMetadataThrift;
import py.thrift.share.InvalidInputExceptionThrift;
import py.thrift.share.NetworkErrorExceptionThrift;
import py.thrift.share.PermissionNotGrantExceptionThrift;
import py.thrift.share.ResourceNotExistsExceptionThrift;
import py.thrift.share.ServiceHavingBeenShutdownThrift;
import py.thrift.share.ServiceIsNotAvailableThrift;
import py.thrift.share.StillHaveStoragePoolExceptionThrift;
import py.thrift.share.TooManyEndPointFoundExceptionThrift;

/**
 * DomainAction.
 */
public class DomainAction {

  private static final Logger logger = LoggerFactory.getLogger(DomainAction.class);

  private AccountSessionService accountSessionService;

  private DomainService domainService;
  private String domainId;
  private String domainName;
  private String domainDescription;
  private String datanodes;
  private String datanodeId;

  // list domains by listDomainIds
  private List<String> listDomainIds;
  // store save or update instanceIds to saveOrUpdateInstanceIds
  private List<String> saveOrUpdateInstanceIds;
  private List<SimpleDomain> domainList;
  private List<SimpleInstance> instanceList;
  private List<SimpleInstance> beenUsedDatanodes;
  private List<SimpleInstance> unusedDatanodes;
  private ResultMessage resultMessage;
  private DiskService diskService;

  private List<String> listinstanceId;
  private long domainTotalFreeSpace;
  private String orderDir;
  private String write;
  private String configValue;
  private String shadowPageFlag;
  private String endPointsString;
  private String discard;
  private String higher;
  private String idsJson;

  public String getHigher() {
    return higher;
  }

  public void setHigher(String higher) {
    this.higher = higher;
  }

  /**
   * The name of this instance should never be changed -tyr.
   */
  private Map<String, Object> dataMap;

  /**
   * DomainAction.
   */
  public DomainAction() {
    super();
    this.dataMap = new HashMap<String, Object>();
    resultMessage = new ResultMessage();
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

  public AccountSessionService getAccountSessionService() {
    return accountSessionService;
  }

  public void setAccountSessionService(AccountSessionService accountSessionService) {
    this.accountSessionService = accountSessionService;
  }

  public DomainService getDomainService() {
    return domainService;
  }

  public void setDomainService(DomainService domainService) {
    this.domainService = domainService;
  }

  public List<SimpleDomain> getDomainList() {
    return domainList;
  }

  public void setDomainList(List<SimpleDomain> domainList) {
    this.domainList = domainList;
  }

  public List<SimpleInstance> getBeenUsedDatanodes() {
    return beenUsedDatanodes;
  }

  public void setBeenUsedDatanodes(List<SimpleInstance> beenUsedDatanodes) {
    this.beenUsedDatanodes = beenUsedDatanodes;
  }

  public List<SimpleInstance> getUnusedDatanodes() {
    return unusedDatanodes;
  }

  public void setUnusedDatanodes(List<SimpleInstance> unusedDatanodes) {
    this.unusedDatanodes = unusedDatanodes;
  }

  public ResultMessage getResultMessage() {
    return resultMessage;
  }

  public void setResultMessage(ResultMessage resultMessage) {
    this.resultMessage = resultMessage;
  }

  /**
   * list Domains.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listDomains() {

    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    domainList = new ArrayList<SimpleDomain>();
    List<Long> idsList = null;
    if (idsJson != null && !idsJson.equals("")) {
      logger.debug("idsJSON is {}", idsJson);
      JSONArray idsJsonArray = JSONArray.fromObject(idsJson);
      idsList = (List<Long>) JSONArray.toList(idsJsonArray, Long.class);
      logger.debug("idsList is {}", idsList);
    }
    try {
      List<SimpleDomain> domainTempList = domainService
          .listDomains(idsList, Long.valueOf(account.getAccountId()));
      if (domainName != null && !domainName.equals("")) {
        for (SimpleDomain domain : domainTempList) {
          if (domain.getDomainName().contains(domainName)) {
            domainList.add(domain);
          }
        }
      } else {
        domainList = domainTempList;
      }

      /*if (domainList != null && domainList.size() != 0) {
           TODO: get whole instanceId
          listinstanceId = new ArrayList<String>();
          for (SimpleDomain simpleDomain : domainList) {
              for (SimpleInstance simpleInstance : simpleDomain.getDataNodes()) {
                  listinstanceId.add(String.valueOf(simpleInstance.getInstanceId()));
              }
              domainTotalFreeSpace = 0;
              for (SimpleInstanceMetadata simpleInstanceMetadata : diskService
              .listInstanceMetadata()) {
                  if (listinstanceId.contains(simpleInstanceMetadata.getInstanceId())) {
                      domainTotalFreeSpace += simpleInstanceMetadata.getFreeSpace();
                  }
              }
              listinstanceId.clear();
              simpleDomain.setDomainfreeSpace(String.valueOf(domainTotalFreeSpace));
          }
      }*/
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
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resultMessage", resultMessage);
    dataMap.put("domainList", domainList);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * list Domains Dt.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listDomainsDt() {
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
    String[] cols = {"null", "domainId", "domainName", "domainDescription", "status",
        "logicalSpace", "freeSpace",
        "useSpace"};
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
    domainList = new ArrayList<SimpleDomain>();
    ArrayList<SimpleDomain> domainTmpList = new ArrayList<>();
    try {
      domainList = domainService.listDomains(null, Long.valueOf(account.getAccountId()));
      // search
      recordsTotal = String.valueOf(domainList.size());

      if (!searchValue.equals("")) {
        for (SimpleDomain domain : domainList) {
          if (domain.getDomainName().toLowerCase().contains(searchValue.toLowerCase())) {
            domainTmpList.add(domain);
          }
        }
      } else {
        domainTmpList.addAll(domainList);
      }
      recordsFiltered = String.valueOf(domainTmpList.size());

      /*if (domainTmpList != null && domainTmpList.size() != 0) {

          listinstanceId = new ArrayList<String>();
          for (SimpleDomain simpleDomain : domainTmpList) {
              for (SimpleInstance simpleInstance : simpleDomain.getDataNodes()) {
                  listinstanceId.add(String.valueOf(simpleInstance.getInstanceId()));
              }
              domainTotalFreeSpace = 0;
              for (SimpleInstanceMetadata simpleInstanceMetadata : diskService
              .listInstanceMetadata()) {
                  if (listinstanceId.contains(simpleInstanceMetadata.getInstanceId())) {
                      domainTotalFreeSpace += simpleInstanceMetadata.getFreeSpace();
                  }
              }
              listinstanceId.clear();
              simpleDomain.setDomainfreeSpace(String.valueOf(domainTotalFreeSpace));
          }
      }*/

      // sort
      switch (orderColumn) {
        case "domainName":
          Collections.sort(domainTmpList, new SortByName());
          break;
        case "status":
          Collections.sort(domainTmpList, new SortByStatus());
          break;
        case "freeSpace":
          Collections.sort(domainTmpList, new SortByFreeSpace());
          break;
        case "useSpace":
          Collections.sort(domainTmpList, new SortByUseSpace());
          break;
        case "logicalSpace":
          Collections.sort(domainTmpList, new SortByLogicalSpace());
          break;
        default:
          Collections.sort(domainTmpList, new SortByName());
      }
      // pagination
      domainList.clear();
      int size = Integer.parseInt(start) + Integer.parseInt(length);
      if (size > domainTmpList.size()) {
        size = domainTmpList.size();
      }
      for (int i = Integer.parseInt(start); i < size; i++) {
        domainList.add(domainTmpList.get(i));
      }
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
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("data", domainList);
    dataMap.put("recordsTotal", recordsTotal);
    dataMap.put("recordsFiltered", recordsFiltered);
    dataMap.put("draw", draw);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  class SortByName implements Comparator<SimpleDomain> {

    public int compare(SimpleDomain s1, SimpleDomain s2) {
      if (s1.getDomainName().equals(s2.getDomainName())) {
        return 0;
      }
      if (s1.getDomainName().compareToIgnoreCase(s2.getDomainName()) > 0) {
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

  class SortByStatus implements Comparator<SimpleDomain> {

    public int compare(SimpleDomain s1, SimpleDomain s2) {
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

  class SortByFreeSpace implements Comparator<SimpleDomain> {

    public int compare(SimpleDomain s1, SimpleDomain s2) {
      if (Long.valueOf(s1.getFreeSpace()) == Long.valueOf(s2.getFreeSpace())) {
        return 0;
      }
      if (Long.valueOf(s1.getFreeSpace()) > Long.valueOf(s2.getFreeSpace())) {
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

  class SortByLogicalSpace implements Comparator<SimpleDomain> {

    public int compare(SimpleDomain s1, SimpleDomain s2) {
      if (Long.valueOf(s1.getLogicalSpace()) == Long.valueOf(s2.getLogicalSpace())) {
        return 0;
      }
      if (Long.valueOf(s1.getLogicalSpace()) > Long.valueOf(s2.getLogicalSpace())) {
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

  class SortByUseSpace implements Comparator<SimpleDomain> {

    public int compare(SimpleDomain s1, SimpleDomain s2) {
      if (Long.valueOf(s1.getUseSpace()) == Long.valueOf(s2.getUseSpace())) {
        return 0;
      }
      if (Long.valueOf(s1.getUseSpace()) > Long.valueOf(s2.getUseSpace())) {
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

  /**=
   * list Used Datanodes By Domain Id.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listUsedDatanodesByDomainId() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    beenUsedDatanodes = new ArrayList<SimpleInstance>();
    try {
      List<Long> listDomainIds = new ArrayList<Long>();
      logger.debug("current domain id is : [{}]", this.domainId);
      listDomainIds.add(Long.valueOf(this.domainId));
      domainList = domainService.listDomains(listDomainIds, Long.valueOf(account.getAccountId()));
      logger.debug("current domainList id is : [{}]", domainList);

      // there must be only 1 element

      beenUsedDatanodes = domainList.get(0).getDataNodes();
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
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resultMessage", resultMessage);
    dataMap.put("beenUsedDatanodes", beenUsedDatanodes);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * list Unused Datanodes By Domain Id.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listUnusedDatanodesByDomainId() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    if (unusedDatanodes == null) {
      unusedDatanodes = new ArrayList<>();
    }
    try {
      List<Long> listDomainIds = new ArrayList<Long>();
      logger.debug("current domain id is : [{}]", this.domainId);
      listDomainIds.add(Long.parseLong(this.domainId));
      domainList = domainService.listDomains(listDomainIds, Long.valueOf(account.getAccountId()));
      logger.debug("current domainList id is : [{}]", domainList);

      unusedDatanodes.clear();
      // get all datanodes
      List<SimpleInstance> allDatanodesTmp = domainService.listInstances();
      logger.debug("total datanode is[{}]", allDatanodesTmp);

      // get all datanode in all domain
      List<SimpleInstance> usedDatanode = new ArrayList<>();
      List<Long> instanceIds = new ArrayList<Long>();
      List<SimpleDomain> domainList = domainService.listDomains(null,
          Long.valueOf(account.getAccountId()));

      // filter been used datanode out
      for (SimpleInstance tmpInstance : allDatanodesTmp) {
        logger.debug("current datanode is {}", tmpInstance);
        if (tmpInstance.getDomainId() == null) {
          logger.debug("current datanode:{} is free", tmpInstance);
          unusedDatanodes.add(tmpInstance);

        }

      }
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
      logger.debug("unused datanode is [{}]", unusedDatanodes);
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0039_ServiceHavingBeenShutdown");
    } catch (InvalidInputExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0065_ServiceIsNotAvailable");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resultMessage", resultMessage);
    dataMap.put("unusedDatanodes", unusedDatanodes);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * create Domain.
   *
   * @return ACTION_RETURN_STRING
   */
  public String createDomain() {
    logger.debug("DomainAction saveOrUpdateDomain()");

    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    SimpleDomain simpleDomain = new SimpleDomain();
    simpleDomain.setDomainName(domainName);
    simpleDomain.setDomainDescription(domainDescription);
    beenUsedDatanodes = parseObjectListFromJsonStr(this.datanodes);
    simpleDomain.setDataNodes(beenUsedDatanodes);
    logger.debug(
        "DomainAction params are: domainId:[{}],domainName:[{}],domainDescription:[{}],"
            + "beenUsedDatanodes:[{}]",
        this.domainId, this.domainName, this.domainDescription, this.beenUsedDatanodes);

    logger.debug("simpleDomain:[{}]", simpleDomain);
    resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    SimpleDomain createDomain = new SimpleDomain();
    try {
      createDomain = domainService.createDomain(simpleDomain, Long.valueOf(account.getAccountId()));
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
    } catch (DomainExistedExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0043_DomainExisted");
    } catch (DomainNameExistedExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0044_DomainNameExisted");
    } catch (DatanodeNotFreeToUseExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0061_DatanodeNotFreeToUse");
    } catch (DatanodeNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0062_DatanodeNotFound");
    } catch (DatanodeIsUsingExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0063_DatanodeIsUsing");
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
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (TException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("domain", createDomain);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * update Domain.
   *
   * @return ACTION_RETURN_STRING
   */
  public String updateDomain() {
    logger.debug("DomainAction saveOrUpdateDomain()");

    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<SimpleInstance> failedInstanceList = new ArrayList<>();
    SimpleDomain simpleDomain = new SimpleDomain();
    simpleDomain.setDomainId(domainId);
    simpleDomain.setDomainName(domainName);
    simpleDomain.setDomainDescription(domainDescription);
    logger.debug("current datanode list string is {}", datanodes);
    beenUsedDatanodes = parseObjectListFromJsonStr(this.datanodes);
    simpleDomain.setDataNodes(beenUsedDatanodes);
    logger.debug(
        "DomainAction params are: domainId:[{}],domainName:[{}],domainDescription:[{}],"
            + "beenUsedDatanodes:[{}]",
        this.domainId, this.domainName, this.domainDescription, this.beenUsedDatanodes);

    logger.debug("simpleDomain:[{}]", simpleDomain);
    try {
      domainService.updateDomain(simpleDomain, Long.valueOf(account.getAccountId()));
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
    } catch (DomainIsDeletingExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0059_DomainIsDeleting");
    } catch (DatanodeNotFreeToUseExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0061_DatanodeNotFreeToUse");
    } catch (DatanodeNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0062_DatanodeNotFound");
    } catch (DomainNotExistedExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0046_DomainNotExisted");
    } catch (DatanodeIsUsingExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0063_DatanodeIsUsing");
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
    } catch (InstanceIsSubHealthExceptionThrift e) {

      if (e.getInstanceMetadata() != null) {
        for (InstanceMetadataThrift instance : e.getInstanceMetadata()) {
          SimpleInstance simpleInstance = new SimpleInstance();
          simpleInstance.setHost(instance.getEndpoint());
          simpleInstance.setInstanceName("DataNode");
          simpleInstance.setInstanceId(String.valueOf(instance.getInstanceId()));
          failedInstanceList.add(simpleInstance);
        }
      }
      logger.error("Exception catch", e);
      logger.error("failedInstanceList is ", failedInstanceList);
      resultMessage.setMessage("InstanceIsSubHealthExceptionThrift");
    } catch (TException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("failedInstanceList", failedInstanceList);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * delete Domain.
   *
   * @return ACTION_RETURN_STRING
   */
  public String deleteDomain() {
    logger.debug("DomainAction deleteDomain()");
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    try {
      logger.debug("current domain id is : [{}]", this.domainId);
      domainService.deleteDomain(domainId, Long.valueOf(account.getAccountId()));
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
    } catch (DomainNotExistedExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0046_DomainNotExisted");
    } catch (DomainIsDeletingExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0059_DomainIsDeleting");
    } catch (StillHaveStoragePoolExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0060_StillHaveStoragePool");
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
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * dynamic Config Coordinator.
   *
   * @return ACTION_RETURN_STRING
   */
  public String dynamicConfigCoordinator() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    try {
      domainService.dynamicConfigCoordinator(Boolean.valueOf(write), configValue);
    } catch (TException e) {
      logger.error("caught an exception ", e);
    }
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * dynamic Config Datanode Shadow Page.
   *
   * @return ACTION_RETURN_STRING
   */
  public String dynamicConfigDatanodeShadowPage() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    try {
      domainService.dynamicConfigDatanodeShadowPage(Boolean.valueOf(shadowPageFlag));
    } catch (TException e) {
      logger.error("caught an exception ", e);
    }

    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * dynamic Config Coordinators Binding One Volume.
   *
   * @return ACTION_RETURN_STRING
   */
  public String dynamicConfigCoordinatorsBindingOneVolume() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    JSONArray endpointsJson = JSONArray.fromObject(endPointsString);
    List<EndPoint> endpointsList = new ArrayList<>();
    EndPoint endPoint = new EndPoint();
    for (int i = 0; i < endpointsJson.size(); i++) {
      String hostTmp = endpointsJson.getJSONObject(i).getString("hostName");
      String portTmp = endpointsJson.getJSONObject(i).getString("port");

      endPoint.setHostName(hostTmp);
      endPoint.setPort(Integer.valueOf(portTmp));
      endpointsList.add(endPoint);
    }
    logger.debug("endpointsList is {}", endpointsList);
    try {
      domainService.dynamicConfigCoordinatorsBindingOneVolume(endpointsList,
          Boolean.valueOf(discard),
          Boolean.valueOf(higher));
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (TException e) {
      logger.error("caught an exception ", e);
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * get Discard Config Status.
   *
   * @return ACTION_RETURN_STRING
   */
  public String getDiscardConfigStatus() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    JSONArray endpointsJson = JSONArray.fromObject(endPointsString);
    List<EndPoint> endpointsList = new ArrayList<>();
    EndPoint endPoint = new EndPoint();
    for (int i = 0; i < endpointsJson.size(); i++) {
      String hostTmp = endpointsJson.getJSONObject(i).getString("hostName");
      String portTmp = endpointsJson.getJSONObject(i).getString("port");

      endPoint.setHostName(hostTmp);
      endPoint.setPort(Integer.valueOf(portTmp));
      endpointsList.add(endPoint);
    }
    logger.debug("endpointsList is {}", endpointsList);
    try {
      boolean configStatus = domainService.getDiscardConfigStatus(endpointsList);
      dataMap.put("configStatus", configStatus);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (TException e) {
      logger.error("caught an exception ", e);
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * get Shadow Page Config Status.
   *
   * @return ACTION_RETURN_STRING
   */
  public String getShadowPageConfigStatus() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    boolean shadowPageStatus;
    try {
      shadowPageStatus = domainService.getShadowPageConfigStatus();
      dataMap.put("shadowPageStatus", shadowPageStatus);
    } catch (TException e) {
      logger.error("caught an exception ", e);
    }

    resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);

    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * disable All Discard Config Coordinator.
   *
   * @return ACTION_RETURN_STRING
   */
  public String disableAllDiscardConfigCoordinator() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    try {
      domainService.disableAllDiscardConfigCoordinator();
    } catch (TException e) {
      logger.error("caught an exception ", e);
    }

    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * remove Datanode From Domain.
   *
   * @return ACTION_RETURN_STRING
   */
  public String removeDatanodeFromDomain() {
    logger.debug("DomainAction removeDatanodeFromDomain()");
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    try {
      domainService.removeDatanodeFromDomain(domainId, datanodeId,
          Long.valueOf(account.getAccountId()));
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
    } catch (FailToRemoveDatanodeFromDomainExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0064_FailToRemoveDatanodeFromDomain");
    } catch (DatanodeNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0062_DatanodeNotFound");
    } catch (DomainNotExistedExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0046_DomainNotExisted");
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

    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * list Instances.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listInstances() {
    instanceList = domainService.listInstances();
    dataMap.put("instanceList", instanceList);
    return Constants.ACTION_RETURN_STRING;
  }

  public String getDomainId() {
    return domainId;
  }

  public void setDomainId(String domainId) {
    this.domainId = domainId;
  }

  public String getDomainName() {
    return domainName;
  }

  public void setDomainName(String domainName) {
    this.domainName = domainName;
  }

  public String getDomainDescription() {
    return domainDescription;
  }

  public void setDomainDescription(String domainDescription) {
    this.domainDescription = domainDescription;
  }

  public String getDatanodes() {
    return datanodes;
  }

  public void setDatanodes(String datanodes) {
    this.datanodes = datanodes;
  }

  public List<String> getListDomainIds() {
    return listDomainIds;
  }

  public void setListDomainIds(List<String> listDomainIds) {
    this.listDomainIds = listDomainIds;
  }

  public List<String> getSaveOrUpdateInstanceIds() {
    return saveOrUpdateInstanceIds;
  }

  public void setSaveOrUpdateInstanceIds(List<String> saveOrUpdateInstanceIds) {
    this.saveOrUpdateInstanceIds = saveOrUpdateInstanceIds;
  }

  public List<SimpleInstance> getInstanceList() {
    return instanceList;
  }

  public void setInstanceList(List<SimpleInstance> instanceList) {
    this.instanceList = instanceList;
  }

  /**
   * parse Object List From Json Str.
   *
   * @param jsonStr json string
   * @return ACTION_RETURN_STRING
   */
  public List<SimpleInstance> parseObjectListFromJsonStr(String jsonStr) {
    if (jsonStr == null) {
      logger.warn("jsonStr is null, do not need to process any more");
      return null;
    }
    logger.warn("jsonStr: {}", jsonStr);
    ObjectMapper objectMapper = new ObjectMapper();
    TypeReference<List<String>> typeRef = new TypeReference<List<String>>() {
    };
    List<String> listT = null;
    try {
      listT = objectMapper.readValue(jsonStr, typeRef);
    } catch (Exception e) {
      logger.error("convert json string to list, caught an exception", e);
    }

    logger.debug("listT: {}", listT);
    List<SimpleInstance> instanceList = new ArrayList<>();
    for (String datanodeId : listT) {
      SimpleInstance instance = new SimpleInstance();
      instance.setInstanceId(datanodeId);
      instanceList.add(instance);
    }
    logger.warn("instanceList:[{}]", instanceList);
    return instanceList;
  }

  public String getDatanodeId() {
    return datanodeId;
  }

  public void setDatanodeId(String datanodeId) {
    this.datanodeId = datanodeId;
  }

  public String getWrite() {
    return write;
  }

  public void setWrite(String write) {
    this.write = write;
  }

  public String getConfigValue() {
    return configValue;
  }

  public void setConfigValue(String configValue) {
    this.configValue = configValue;
  }

  public String getShadowPageFlag() {
    return shadowPageFlag;
  }

  public void setShadowPageFlag(String shadowPageFlag) {
    this.shadowPageFlag = shadowPageFlag;
  }

  public String getEndPointsString() {
    return endPointsString;
  }

  public void setEndPointsString(String endPointsString) {
    this.endPointsString = endPointsString;
  }

  public String getDiscard() {
    return discard;
  }

  public void setDiscard(String discard) {
    this.discard = discard;
  }

  public String getIdsJson() {
    return idsJson;
  }

  public void setIdsJson(String idsJson) {
    this.idsJson = idsJson;
  }

}
