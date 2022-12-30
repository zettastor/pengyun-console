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

import com.opensymphony.xwork2.ActionContext;
import com.opensymphony.xwork2.ActionSupport;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import org.apache.commons.lang.StringUtils;
import org.apache.struts2.ServletActionContext;
import org.apache.thrift.TException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import py.console.bean.Account;
import py.console.bean.InstanceFormat;
import py.console.bean.ResultMessage;
import py.console.bean.SimpleInstance;
import py.console.service.account.AccountSessionService;
import py.console.service.instance.InstanceService;
import py.console.utils.Constants;
import py.console.utils.ErrorCode2;
import py.dd.client.exception.FailedToStartServiceException;
import py.exception.GenericThriftClientFactoryException;
import py.exception.InternalErrorException;
import py.instance.InstanceStatus;
import py.thrift.deploymentdaemon.FailedToStartServiceExceptionThrift;
import py.thrift.deploymentdaemon.ServiceIsBusyExceptionThrift;
import py.thrift.share.InstanceHasFailedAleadyExceptionThrift;
import py.thrift.share.InstanceNotExistsExceptionThrift;

/**
 * InstanceAction.
 */
public class InstanceAction extends ActionSupport {

  private static final long serialVersionUID = 1L;

  private static final Logger logger = LoggerFactory.getLogger(InstanceAction.class);

  private AccountSessionService accountSessionService;

  private InstanceService instanceService;

  private String instanceId;

  private String groupId;

  private String instanceName;

  private String sortBy;

  private String sortOrder;

  private List<SimpleInstance> instanceList;

  private ResultMessage resultMessage;

  private String orderDir;
  private String serverStatus;

  private String durationInMinutes;

  /**
   * The name of this instance should never be changed -tyr.
   */
  private Map<String, Object> dataMap;

  /**
   * InstanceAction.
   */
  public InstanceAction() {
    super();
    this.dataMap = new HashMap<String, Object>();
    resultMessage = new ResultMessage();
  }

  /**
   * list.
   *
   * @return ACTION_RETURN_STRING
   */
  public String list() {
    Account accountFromSession = accountSessionService.getAccount();
    if (accountFromSession == null) {
      return ERROR;
    }
    instanceList = new ArrayList<SimpleInstance>();
    List<SimpleInstance> allInstance = new ArrayList<>();
    try {
      allInstance = instanceService.getAll(Long.valueOf(accountFromSession.getAccountId()));

      for (SimpleInstance instance : allInstance) {
        boolean isExpectedInstance = false;

        isExpectedInstance =
            instanceId == null || instanceId.isEmpty() || instanceId.equals(
                instance.getInstanceId());
        isExpectedInstance =
            isExpectedInstance && (instanceName == null || instanceName.isEmpty() || instance
                .getInstanceName().contains(instanceName));
        isExpectedInstance = isExpectedInstance && (groupId == null || groupId.isEmpty() || groupId
            .equals(instance.getGroupId()));

        if (isExpectedInstance) {
          instanceList.add(instance);
        }

      }
      orderDir = "asc";
      Collections.sort(instanceList, new SortByName());
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (Exception e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("instanceList", instanceList);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * get Ip2 service Info.
   *
   * @return ACTION_RETURN_STRING
   */
  public String getIp2serviceInfo() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    Map<String, List<SimpleInstance>> ip2serviceMap = new HashMap<>();
    List<SimpleInstance> allInstance = new ArrayList<>();

    try {
      allInstance = instanceService.getAll(Constants.SUPER_ADMIN_ACCOUNT_ID);
      for (SimpleInstance instance : allInstance) {
        if (ip2serviceMap.containsKey(instance.getHost())) {
          ip2serviceMap.get(instance.getHost()).add(instance);
        } else {
          List<SimpleInstance> instanceList = new ArrayList<>();
          instanceList.add(instance);
          ip2serviceMap.put(instance.getHost(), instanceList);
        }
        logger.debug("ip2serviceMap is {}", ip2serviceMap);
      }
      dataMap.put("ip2serviceMap", ip2serviceMap);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (Exception e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }

    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * list Driver Container.
   */
  public String listDriverContainer() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<SimpleInstance> driverContainersList = new ArrayList<SimpleInstance>();
    List<SimpleInstance> allInstance = new ArrayList<>();
    try {
      allInstance = instanceService.getAll(Long.valueOf(account.getAccountId()));
      for (SimpleInstance instance : allInstance) {
        if (instance.getInstanceName().equals("DriverContainer") && instance.getStatus()
            .equals(InstanceStatus.HEALTHY.name())) {
          driverContainersList.add(instance);
        }
      }
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (Exception e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("driverContainersList", driverContainersList);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * list DT.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listDt() {
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
    String[] cols = {"null", "instanceId", "instanceName", "status", "groupId", "host", "port",
        "statusInDD"};
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
    instanceList = new ArrayList<SimpleInstance>();
    List<SimpleInstance> instanceTmpList = new ArrayList<>();
    try {

      instanceList = instanceService.getAll(Long.valueOf(account.getAccountId()));
      recordsTotal = String.valueOf(instanceList.size());

      if (!searchValue.equals("")) {
        for (SimpleInstance instance : instanceList) {
          if (instance.getInstanceName().toLowerCase().contains(searchValue.toLowerCase())) {
            instanceTmpList.add(instance);
          }
        }
        instanceList.clear();
        instanceList.addAll(instanceTmpList);

      } else {
        instanceTmpList.addAll(instanceList);

      }
      if (!StringUtils.isEmpty(serverStatus)) {
        instanceTmpList.clear();
        for (SimpleInstance instance : instanceList) {
          if ("ok".equals(serverStatus)) {
            if (instance.getStatus().equals(InstanceStatus.HEALTHY.name())
                || instance.getStatus().equals(InstanceStatus.SUSPEND.name())) {
              instanceTmpList.add(instance);
            }

          } else if ("error".equals(serverStatus)) {
            if (instance.getStatus().equals(InstanceStatus.SICK.name())) {
              instanceTmpList.add(instance);
            }
          } else if ("alarm".equals(serverStatus)) {
            if (!instance.getStatus().equals(InstanceStatus.SICK.name())
                && !instance.getStatus().equals(InstanceStatus.HEALTHY.name())
                && !instance.getStatus().equals(InstanceStatus.SUSPEND.name())) {
              instanceTmpList.add(instance);
            }

          }
        }

        logger.debug("list is{},status is{}", instanceTmpList, serverStatus);
      }

      recordsFiltered = String.valueOf(instanceTmpList.size());

      // sort
      switch (orderColumn) {
        case "id":
          Collections.sort(instanceTmpList, new SortById());
          break;
        case "instanceName":
          Collections.sort(instanceTmpList, new SortByName());
          break;
        case "groupId":
          Collections.sort(instanceTmpList, new SortByGroup());
          break;
        case "host":
          Collections.sort(instanceTmpList, new SortByHost());
          break;
        case "port":
          Collections.sort(instanceTmpList, new SortByPort());
          break;
        case "status":
          Collections.sort(instanceTmpList, new SortByStatus());
          break;
        case "statusInDD":
          Collections.sort(instanceTmpList, new SortByStatusInDd());
          break;
        default:
          Collections.sort(instanceTmpList, new SortByName());
      }
      // pagination
      instanceList.clear();
      int size = Integer.parseInt(start) + Integer.parseInt(length);
      if (size > instanceTmpList.size()) {
        size = instanceTmpList.size();
      }
      for (int i = Integer.parseInt(start); i < size; i++) {
        instanceList.add(instanceTmpList.get(i));

      }
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (Exception e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }

    dataMap.put("data", instanceList);
    dataMap.put("recordsTotal", recordsTotal);
    dataMap.put("recordsFiltered", recordsFiltered);
    dataMap.put("draw", draw);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * list Instance By Ip.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listInstanceByIp() {
    Account accountFromSession = accountSessionService.getAccount();
    if (accountFromSession == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<SimpleInstance> allInstance = new ArrayList<>();
    List<InstanceFormat> instanceFormatList = new ArrayList<>();
    try {
      allInstance = instanceService.getAll(Long.valueOf(accountFromSession.getAccountId()));
      Map<String, List<SimpleInstance>> ipToInstance = new HashMap<>();
      for (SimpleInstance instance : allInstance) {
        if (ipToInstance.containsKey(instance.getHost())) {
          ipToInstance.get(instance.getHost()).add(instance);
        } else {
          List<SimpleInstance> instanceList = new ArrayList<>();
          instanceList.add(instance);
          ipToInstance.put(instance.getHost(), instanceList);
        }
      }

      for (Map.Entry<String, List<SimpleInstance>> entry : ipToInstance.entrySet()) {
        InstanceFormat instanceFormat = new InstanceFormat();
        instanceFormat.setIp(entry.getKey());
        Collections.sort(entry.getValue(), new Comparator<SimpleInstance>() {
          @Override
          public int compare(SimpleInstance o1, SimpleInstance o2) {
            return o1.getInstanceName().compareToIgnoreCase(o2.getInstanceName());
          }
        });
        instanceFormat.setInstances(entry.getValue());
        instanceFormatList.add(instanceFormat);
      }

      logger.debug("instanceFormatList is {}", instanceFormatList);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);

    } catch (Exception e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("instanceFormatList", instanceFormatList);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * kill.
   *
   * @return ACTION_RETURN_STRING
   */
  public String kill() {
    logger.debug("kill instance id {}", instanceId);
    Account accountFromSession = accountSessionService.getAccount();
    if (accountFromSession == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    try {
      if (instanceService.kill(Long.parseLong(instanceId))) {
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
        dataMap.put("resultMessage", resultMessage);
        return Constants.ACTION_RETURN_STRING;
      }
    } catch (NumberFormatException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    } catch (InstanceNotExistsExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0017_InstanceNotExist);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    } catch (InstanceHasFailedAleadyExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0018_InstanceFailedAleady);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * start.
   *
   * @return ACTION_RETURN_STRING
   */
  public String start() {
    logger.debug("start instance id {}", instanceId);
    Account accountFromSession = accountSessionService.getAccount();
    if (accountFromSession == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    try {
      if (instanceService.start(Long.parseLong(instanceId))) {
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
        dataMap.put("resultMessage", resultMessage);
        return Constants.ACTION_RETURN_STRING;
      }
    } catch (NumberFormatException e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NumberFormat");
    } catch (FailedToStartServiceExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_FailedToStartServiceException");
    } catch (ServiceIsBusyExceptionThrift e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_ServiceIsBusyException");
    } catch (InternalErrorException e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (FailedToStartServiceException e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_FailedToStartServiceException");
    } catch (GenericThriftClientFactoryException e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_GenericThriftClientFactory");
    } catch (TException e) {
      logger.error("Exception catch ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }

    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * stop.
   *
   * @return ACTION_RETURN_STRING
   */
  public String stop() {
    logger.debug("stop instance id {}", instanceId);
    Account accountFromSession = accountSessionService.getAccount();
    if (accountFromSession == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    try {
      if (instanceService.stop(Long.parseLong(instanceId))) {
        resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
        dataMap.put("resultMessage", resultMessage);
        return Constants.ACTION_RETURN_STRING;
      }
    } catch (NumberFormatException e) {
      logger.error("exception catch", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    } catch (InstanceNotExistsExceptionThrift e) {
      logger.error("exception catch", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0017_InstanceNotExist);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  class SortById implements Comparator<SimpleInstance> {

    public int compare(SimpleInstance s1, SimpleInstance s2) {
      if (s1.getInstanceId().equals(s2.getInstanceId())) {
        return 0;
      }
      if (s1.getInstanceId().compareToIgnoreCase(s2.getInstanceId()) > 0) {
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

  class SortByName implements Comparator<SimpleInstance> {

    public int compare(SimpleInstance s1, SimpleInstance s2) {
      if (s1.getInstanceName().equals(s2.getInstanceName())) {
        return 0;
      }
      if (s1.getInstanceName().compareToIgnoreCase(s2.getInstanceName()) > 0) {
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

  class SortByGroup implements Comparator<SimpleInstance> {

    public int compare(SimpleInstance s1, SimpleInstance s2) {
      if (s1.getGroupId().equals(s2.getGroupId())) {
        return 0;
      }
      if (s1.getGroupId().compareToIgnoreCase(s2.getGroupId()) > 0) {
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

  class SortByHost implements Comparator<SimpleInstance> {

    public int compare(SimpleInstance s1, SimpleInstance s2) {
      if (s1.getHost().equals(s2.getHost())) {
        return 0;
      }
      if (s1.getHost().compareToIgnoreCase(s2.getHost()) > 0) {
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

  class SortByPort implements Comparator<SimpleInstance> {

    public int compare(SimpleInstance s1, SimpleInstance s2) {
      if (s1.getPort() == s2.getPort()) {
        return 0;
      }
      if (s1.getPort() > s2.getPort()) {
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

  class SortByStatus implements Comparator<SimpleInstance> {

    public int compare(SimpleInstance s1, SimpleInstance s2) {
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

  class SortByStatusInDd implements Comparator<SimpleInstance> {

    public int compare(SimpleInstance s1, SimpleInstance s2) {
      if (s1.getStatusInDd().equals(s2.getStatusInDd())) {
        return 0;
      }
      if (s1.getStatusInDd().compareToIgnoreCase(s2.getStatusInDd()) > 0) {
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

  public AccountSessionService getAccountSessionService() {
    return accountSessionService;
  }

  public void setAccountSessionService(AccountSessionService accountSessionService) {
    this.accountSessionService = accountSessionService;
  }

  public InstanceService getInstanceService() {
    return instanceService;
  }

  public void setInstanceService(InstanceService instanceService) {
    this.instanceService = instanceService;
  }

  public String getInstanceId() {
    return instanceId;
  }

  public void setInstanceId(String instanceId) {
    this.instanceId = instanceId;
  }

  public String getInstanceName() {
    return instanceName;
  }

  public void setInstanceName(String instanceName) {
    this.instanceName = instanceName;
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

  public List<SimpleInstance> getInstanceList() {
    return instanceList;
  }

  public void setInstanceList(List<SimpleInstance> instanceList) {
    this.instanceList = instanceList;
  }

  public ResultMessage getResultMessage() {
    return resultMessage;
  }

  public void setResultMessage(ResultMessage resultMessage) {
    this.resultMessage = resultMessage;
  }

  public String getGroupId() {
    return groupId;
  }

  public void setGroupId(String groupId) {
    this.groupId = groupId;
  }

  public Map<String, Object> getDataMap() {
    return dataMap;
  }

  public void setDataMap(Map<String, Object> dataMap) {
    this.dataMap = dataMap;
  }

  public String getServerStatus() {
    return serverStatus;
  }

  public void setServerStatus(String serverStatus) {
    this.serverStatus = serverStatus;
  }

  public String getDurationInMinutes() {
    return durationInMinutes;
  }

  public void setDurationInMinutes(String durationInMinutes) {
    this.durationInMinutes = durationInMinutes;
  }
}
