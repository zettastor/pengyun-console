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

import com.opensymphony.xwork2.ActionContext;
import com.opensymphony.xwork2.ActionSupport;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
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
import py.console.bean.DriverLinkedLogTimeFormat;
import py.console.bean.OperationLogFormat;
import py.console.bean.ResultMessage;
import py.console.bean.SimpleDriverLinkedLog;
import py.console.bean.SimpleOperation;
import py.console.service.account.AccountSessionService;
import py.console.service.operation.OperationService;
import py.console.utils.Constants;
import py.console.utils.ErrorCode2;
import py.thrift.share.AccountNotFoundExceptionThrift;
import py.thrift.share.EndPointNotFoundExceptionThrift;
import py.thrift.share.NetworkErrorExceptionThrift;
import py.thrift.share.OperationNotFoundExceptionThrift;
import py.thrift.share.ParametersIsErrorExceptionThrift;
import py.thrift.share.PermissionNotGrantExceptionThrift;
import py.thrift.share.ServiceHavingBeenShutdownThrift;
import py.thrift.share.ServiceIsNotAvailableThrift;
import py.thrift.share.TooManyEndPointFoundExceptionThrift;
import py.thrift.share.UnsupportedEncodingExceptionThrift;

/**
 * OperationAction.
 */
public class OperationAction extends ActionSupport {

  private static final Logger logger = LoggerFactory.getLogger(OperationAction.class);
  private AccountSessionService accountSessionService;
  private OperationService operationService;
  private ResultMessage resultMessage;
  private String operationIds;
  private Map<String, Object> dataMap;
  private String orderDir;
  private String statusLevel;

  private String accountName;
  private String operationType;
  private String targetType;
  private String targetName;
  private String status;
  private String startTime;
  private String endTime;
  private InputStream fileStream;
  private String start;
  private String length;

  private String driverName;
  private String volumeName;
  private String volumeDesc;

  /**
   * OperationAction.
   */
  public OperationAction() {
    super();
    this.dataMap = new HashMap<String, Object>();
    resultMessage = new ResultMessage();
  }

  public String getStart() {
    return start;
  }

  public void setStart(String start) {
    this.start = start;
  }

  public String getLength() {
    return length;
  }

  public void setLength(String length) {
    this.length = length;
  }

  public InputStream getFileStream() {
    return fileStream;
  }

  public void setFileStream(InputStream fileStream) {
    this.fileStream = fileStream;
  }

  public Map<String, Object> getDataMap() {
    return dataMap;
  }

  public void setDataMap(Map<String, Object> dataMap) {
    this.dataMap = dataMap;
  }

  public String getOperationIds() {
    return operationIds;
  }

  public void setOperationIds(String operationIds) {
    this.operationIds = operationIds;
  }

  public AccountSessionService getAccountSessionService() {
    return accountSessionService;
  }

  public void setAccountSessionService(AccountSessionService accountSessionService) {
    this.accountSessionService = accountSessionService;
  }

  public OperationService getOperationService() {
    return operationService;
  }

  public void setOperationService(OperationService operationService) {
    this.operationService = operationService;
  }

  public ResultMessage getResultMessage() {
    return resultMessage;
  }

  public void setResultMessage(ResultMessage resultMessage) {
    this.resultMessage = resultMessage;
  }

  public String getStatusLevel() {
    return statusLevel;
  }

  public void setStatusLevel(String statusLevel) {
    this.statusLevel = statusLevel;
  }

  public String getAccountName() {
    return accountName;
  }

  public void setAccountName(String accountName) {
    this.accountName = accountName;
  }

  public String getOperationType() {
    return operationType;
  }

  public void setOperationType(String operationType) {
    this.operationType = operationType;
  }

  public String getTargetType() {
    return targetType;
  }

  public void setTargetType(String targetType) {
    this.targetType = targetType;
  }

  public String getTargetName() {
    return targetName;
  }

  public void setTargetName(String targetName) {
    this.targetName = targetName;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
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

  public String getDriverName() {
    return driverName;
  }

  public void setDriverName(String driverName) {
    this.driverName = driverName;
  }

  public String getVolumeName() {
    return volumeName;
  }

  public void setVolumeName(String volumeName) {
    this.volumeName = volumeName;
  }

  public String getVolumeDesc() {
    return volumeDesc;
  }

  public void setVolumeDesc(String volumeDesc) {
    this.volumeDesc = volumeDesc;
  }

  /**
   * list Operation.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listOperation() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<SimpleOperation> operationsList = new ArrayList<>();
    List<Long> operationIds = new ArrayList<>();
    SimpleOperation operationCondition = new SimpleOperation();
    if (!StringUtils.isEmpty(accountName)) {
      operationCondition.setAccountName(accountName);
    }
    if (!StringUtils.isEmpty(operationType)) {
      operationCondition.setType(operationType);
    }
    if (!StringUtils.isEmpty(targetType)) {
      operationCondition.setTargetType(targetType);
    }
    if (!StringUtils.isEmpty(targetName)) {
      operationCondition.setTargetName(targetName);
    }
    if (!StringUtils.isEmpty(status)) {
      operationCondition.setStatus(status);
    }
    if (!StringUtils.isEmpty(startTime)) {
      operationCondition.setStartTime(startTime);
    }
    if (!StringUtils.isEmpty(endTime)) {
      operationCondition.setEndTime(endTime);
    }
    try {
      operationsList = operationService
          .listOperations(operationIds, Long.valueOf(account.getAccountId()), operationCondition);
      orderDir = "desc";
      Collections.sort(operationsList, new SortByStartTime());
      logger.debug("operationsList is {}", operationsList);
      dataMap.put("operationsList", operationsList);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ServiceHavingBeenShutdownThrift");
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ServiceIsNotAvailableThrift");
    } catch (OperationNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("OperationNotFoundExceptionThrift");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("OperationNotFoundExceptionThrift");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (TException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;

  }

  /**
   * list Operation DT.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listOperationDt() {
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

    // 定义列名type
    String[] cols = {"operationId", "targetId", "accountName", "type", "targetType",
        "operationObject",
        "description", "progress", "status", "startTime", "endTime", "errorMessage"};
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
    List<SimpleOperation> operationsList = new ArrayList<>();
    List<Long> operationIds = new ArrayList<>();
    SimpleOperation operationCondition = new SimpleOperation();
    if (!StringUtils.isEmpty(accountName)) {
      operationCondition.setAccountName(accountName);
    }
    if (!StringUtils.isEmpty(operationType)) {
      operationCondition.setType(operationType);
    }
    if (!StringUtils.isEmpty(targetType)) {
      operationCondition.setTargetType(targetType);
    }
    if (!StringUtils.isEmpty(targetName)) {
      operationCondition.setTargetName(targetName);
    }
    if (!StringUtils.isEmpty(status)) {
      operationCondition.setStatus(status);
    }
    if (!StringUtils.isEmpty(startTime)) {
      operationCondition.setStartTime(startTime);
    }
    if (!StringUtils.isEmpty(endTime)) {
      operationCondition.setEndTime(endTime);
    }
    try {
      operationsList = operationService
          .listOperations(operationIds, Long.valueOf(account.getAccountId()), operationCondition);
      logger.debug("operationsList is {}", operationsList);
      recordsTotal = String.valueOf(operationsList.size());
      List<SimpleOperation> operationsTmpList = new ArrayList<>();
      // search
      if (!searchValue.equals("")) {
        for (SimpleOperation operation : operationsList) {
          String targetString =
              operation.getOperationObject() + "(" + operation.getTargetName() + ")";
          if (targetString.toLowerCase().contains(searchValue.toLowerCase())) {
            operationsTmpList.add(operation);
          }
        }
      } else {
        operationsTmpList.addAll(operationsList);
      }
      if (!StringUtils.isEmpty(statusLevel)) {
        operationsList.clear();
        operationsList.addAll(operationsTmpList);
        operationsTmpList.clear();
        for (SimpleOperation operation : operationsList) {
          if (operation.getStatus().equals(statusLevel)) {
            operationsTmpList.add(operation);
          }
        }
      }
      recordsFiltered = String.valueOf(operationsTmpList.size());

      // sort
      switch (orderColumn) {
        case "type":
          Collections.sort(operationsTmpList, new SortByType());
          break;
        case "targetName":
          Collections.sort(operationsTmpList, new SortByTargetName());
          break;
        case "startTime":
          Collections.sort(operationsTmpList, new SortByStartTime());
          break;
        case "targetType":
          Collections.sort(operationsTmpList, new SortByTargetObject());
          break;
        default:
          Collections.sort(operationsTmpList, new SortByStartTime());
      }

      // pagination
      operationsList.clear();
      int size = Integer.parseInt(start) + Integer.parseInt(length);
      if (size > operationsTmpList.size()) {
        size = operationsTmpList.size();
      }
      for (int i = Integer.parseInt(start); i < size; i++) {
        operationsList.add(operationsTmpList.get(i));
      }

      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ServiceHavingBeenShutdownThrift");
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ServiceIsNotAvailableThrift");
    } catch (OperationNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("OperationNotFoundExceptionThrift");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("OperationNotFoundExceptionThrift");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (TException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }
    dataMap.put("resultMessage", resultMessage);
    dataMap.put("data", operationsList);
    dataMap.put("recordsTotal", recordsTotal);
    dataMap.put("recordsFiltered", recordsFiltered);
    dataMap.put("draw", draw);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * list Operation Log By Time.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listOperationLogByTime() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<SimpleOperation> operationsList = new ArrayList<>();
    int totalRecord = 0;
    List<OperationLogFormat> operationLogFormatList = new ArrayList<>();
    SimpleOperation operationCondition = new SimpleOperation();
    if (!StringUtils.isEmpty(accountName)) {
      operationCondition.setAccountName(accountName);
    }
    if (!StringUtils.isEmpty(operationType)) {
      operationCondition.setType(operationType);
    }
    if (!StringUtils.isEmpty(targetType)) {
      operationCondition.setTargetType(targetType);
    }
    if (!StringUtils.isEmpty(targetName)) {
      operationCondition.setTargetName(targetName);
    }
    if (!StringUtils.isEmpty(status)) {
      operationCondition.setStatus(status);
    }
    if (!StringUtils.isEmpty(startTime)) {
      operationCondition.setStartTime(startTime);
    }
    if (!StringUtils.isEmpty(endTime)) {
      operationCondition.setEndTime(endTime);
    }
    Map<String, List<SimpleOperation>> timeToOperationLogMap = new HashMap<>();

    try {
      operationsList = operationService
          .listOperations(null, Long.valueOf(account.getAccountId()), operationCondition);
      totalRecord = operationsList.size();
      orderDir = "desc";
      Collections.sort(operationsList, new SortByStartTime());
      // pagination
      List<SimpleOperation> operationListResult = new ArrayList<>();
      int size = Integer.parseInt(start) + Integer.parseInt(length);
      if (size > operationsList.size()) {
        size = operationsList.size();
      }
      for (int i = Integer.parseInt(start); i < size; i++) {
        operationListResult.add(operationsList.get(i));
      }

      long time = 0;
      if (operationListResult.size() > 0) {
        time = Long.valueOf(operationListResult.get(0).getStartTime());
      }
      time = (time / 86400000) * 86400000 - 28800000;
      logger.debug("time is {}", time);
      for (SimpleOperation operation : operationListResult) {
        logger.debug("time is {}, current time is {}", time, operation.getStartTime());
        while (Long.valueOf(operation.getStartTime()) < time) {
          time = time - 86400000;
        }
        if (timeToOperationLogMap.containsKey(String.valueOf(time))) {
          timeToOperationLogMap.get(String.valueOf(time)).add(operation);
        } else {
          List<SimpleOperation> operationListTmp = new ArrayList<>();
          operationListTmp.add(operation);
          timeToOperationLogMap.put(String.valueOf(time), operationListTmp);
        }

      }

      for (Map.Entry<String, List<SimpleOperation>> entry : timeToOperationLogMap.entrySet()) {
        OperationLogFormat operationLogFormat = new OperationLogFormat();
        operationLogFormat.setDayTime(entry.getKey());
        operationLogFormat.setOperationList(entry.getValue());
        operationLogFormatList.add(operationLogFormat);
      }
      Collections.sort(operationLogFormatList, new Comparator<OperationLogFormat>() {
        @Override
        public int compare(OperationLogFormat o1, OperationLogFormat o2) {

          return (int) (Long.valueOf(o2.getDayTime()) - Long.valueOf(o1.getDayTime()));
        }
      });

      logger.debug("timeToOperationLog is {}", timeToOperationLogMap);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);

    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ServiceHavingBeenShutdownThrift");
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ServiceIsNotAvailableThrift");
    } catch (OperationNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("OperationNotFoundExceptionThrift");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("OperationNotFoundExceptionThrift");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (TException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }

    dataMap.put("totalRecord", totalRecord);
    dataMap.put("operationLogFormatList", operationLogFormatList);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * list Driver Linked Log By Time.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listDriverLinkedLogByTime() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<SimpleDriverLinkedLog> driverLinkedLogList = new ArrayList<>();
    int totalRecord = 0;
    List<DriverLinkedLogTimeFormat> driverLinkedLogTimeFormatList = new ArrayList<>();

    Map<String, List<SimpleDriverLinkedLog>> timeToDriverLinkedInfoMap = new HashMap<>();

    try {
      driverLinkedLogList = operationService
          .listDriverLinkedLog(Long.valueOf(account.getAccountId()), driverName, volumeName,
              volumeDesc);
      totalRecord = driverLinkedLogList.size();
      orderDir = "desc";
      Collections.sort(driverLinkedLogList, new ClientLinkedLogSortByStartTime());
      // pagination
      List<SimpleDriverLinkedLog> driverLinkedLogsResult = new ArrayList<>();
      int size = Integer.parseInt(start) + Integer.parseInt(length);
      if (size > driverLinkedLogList.size()) {
        size = driverLinkedLogList.size();
      }
      for (int i = Integer.parseInt(start); i < size; i++) {
        driverLinkedLogsResult.add(driverLinkedLogList.get(i));
      }

      long time = 0;
      if (driverLinkedLogsResult.size() > 0) {
        time = Long.valueOf(driverLinkedLogsResult.get(0).getTime());
      }
      time = (time / 86400000) * 86400000 - 28800000;
      logger.debug("time is {}", time);
      for (SimpleDriverLinkedLog driverLinkedLog : driverLinkedLogsResult) {
        logger.debug("time is {}, current time is {}", time, driverLinkedLog.getTime());
        while (Long.valueOf(driverLinkedLog.getTime()) < time) {
          time = time - 86400000;
        }
        if (timeToDriverLinkedInfoMap.containsKey(String.valueOf(time))) {
          timeToDriverLinkedInfoMap.get(String.valueOf(time)).add(driverLinkedLog);
        } else {
          List<SimpleDriverLinkedLog> driverLinkedLogsTmp = new ArrayList<>();
          driverLinkedLogsTmp.add(driverLinkedLog);
          timeToDriverLinkedInfoMap.put(String.valueOf(time), driverLinkedLogsTmp);
        }

      }

      for (Map.Entry<String, List<SimpleDriverLinkedLog>> entry :
          timeToDriverLinkedInfoMap.entrySet()) {
        DriverLinkedLogTimeFormat linkedLogTimeFormat = new DriverLinkedLogTimeFormat();
        linkedLogTimeFormat.setDayTime(entry.getKey());
        linkedLogTimeFormat.setDriverLinkedLogs(entry.getValue());
        driverLinkedLogTimeFormatList.add(linkedLogTimeFormat);
      }
      Collections.sort(driverLinkedLogTimeFormatList, new Comparator<DriverLinkedLogTimeFormat>() {
        @Override
        public int compare(DriverLinkedLogTimeFormat o1, DriverLinkedLogTimeFormat o2) {

          return (int) (Long.valueOf(o2.getDayTime()) - Long.valueOf(o1.getDayTime()));
        }
      });

      logger.debug("timeToDriverLinkedInfoMap is {}", timeToDriverLinkedInfoMap);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);

    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ServiceHavingBeenShutdownThrift");
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ServiceIsNotAvailableThrift");
    } catch (ParametersIsErrorExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("OperationNotFoundExceptionThrift");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (TException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }

    dataMap.put("totalRecord", totalRecord);
    dataMap.put("driverLinkedLogTimeFormatList", driverLinkedLogTimeFormatList);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * get Ftp Info.
   *
   * @return ACTION_RETURN_STRING
   */
  public String getFtpInfo() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    Map<String, String> ftpInfo = operationService.getFtpInfo();
    String ftpUsername = ftpInfo.get("ftpUsername");
    String ftpPwd = ftpInfo.get("ftpPwd");
    resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    dataMap.put("ftpUsername", ftpUsername);
    dataMap.put("ftpPwd", ftpPwd);
    String deployPath = ftpInfo.get("deployPath");
    dataMap.put("deployPath", deployPath);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * save Operation Logs To Csv.
   *
   * @return ACTION_RETURN_STRING
   */
  public String saveOperationLogsToCsv() {
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;

    }
    SimpleOperation operationCondition = new SimpleOperation();
    if (!StringUtils.isEmpty(accountName)) {
      operationCondition.setAccountName(accountName);
    }
    if (!StringUtils.isEmpty(operationType)) {
      operationCondition.setType(operationType);
    }
    if (!StringUtils.isEmpty(targetType)) {
      operationCondition.setTargetType(targetType);
    }
    if (!StringUtils.isEmpty(targetName)) {
      operationCondition.setTargetName(targetName);
    }
    if (!StringUtils.isEmpty(status)) {
      operationCondition.setStatus(status);
    }
    if (!StringUtils.isEmpty(startTime)) {
      operationCondition.setStartTime(startTime);
    }
    if (!StringUtils.isEmpty(endTime)) {
      operationCondition.setEndTime(endTime);
    }

    try {
      byte[] csvFile = operationService
          .saveOperationLogsToCsv(Long.valueOf(account.getAccountId()),
              operationCondition);
      fileStream = new ByteArrayInputStream(csvFile);
      dataMap.put("fileStream", fileStream);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    } catch (ServiceHavingBeenShutdownThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ServiceHavingBeenShutdownThrift");
    } catch (ServiceIsNotAvailableThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ServiceIsNotAvailableThrift");
    } catch (PermissionNotGrantExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage(ERROR_PermissionNotGrantException);
    } catch (AccountNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ServiceIsNotAvailableThrift");
    } catch (TooManyEndPointFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_0049_TooManyEndPointFound");
    } catch (EndPointNotFoundExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_EndPointNotFound");
    } catch (NetworkErrorExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    } catch (UnsupportedEncodingExceptionThrift e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_UnsupportedEncodingException");
    } catch (TException e) {
      logger.error("caught an exception ", e);
      resultMessage.setMessage("ERROR_NetworkErrorException");
    }

    if (!resultMessage.getMessage().equals("success")) {
      dataMap.put("resultMessage", resultMessage);
      return ERROR;
    }
    return SUCCESS;
  }

  class SortByTargetName implements Comparator<SimpleOperation> {

    public int compare(SimpleOperation s1, SimpleOperation s2) {
      if (s1.getTargetName().equals(s2.getTargetName())) {
        return 0;
      }
      if (s1.getTargetName().compareToIgnoreCase(s2.getTargetName()) > 0) {
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

  class SortByType implements Comparator<SimpleOperation> {

    public int compare(SimpleOperation s1, SimpleOperation s2) {
      if (s1.getType().equals(s2.getType())) {
        return 0;
      }
      if (s1.getType().compareToIgnoreCase(s2.getType()) > 0) {
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

  class SortByStatus implements Comparator<SimpleOperation> {

    public int compare(SimpleOperation s1, SimpleOperation s2) {
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

  class SortByTargetObject implements Comparator<SimpleOperation> {

    public int compare(SimpleOperation s1, SimpleOperation s2) {
      if (s1.getTargetType().equals(s2.getTargetType())) {
        return 0;
      }
      if (s1.getTargetType().compareToIgnoreCase(s2.getTargetType()) > 0) {
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

  class SortByStartTime implements Comparator<SimpleOperation> {

    public int compare(SimpleOperation s1, SimpleOperation s2) {
      if (Long.valueOf(s1.getStartTime()) == Long.valueOf(s2.getStartTime())) {
        return 0;
      }
      if (Long.valueOf(s1.getStartTime()) > Long.valueOf(s2.getStartTime())) {
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

  class ClientLinkedLogSortByStartTime implements Comparator<SimpleDriverLinkedLog> {

    public int compare(SimpleDriverLinkedLog s1, SimpleDriverLinkedLog s2) {
      if (Long.valueOf(s1.getTime()) == Long.valueOf(s2.getTime())) {
        return 0;
      }
      if (Long.valueOf(s1.getTime()) > Long.valueOf(s2.getTime())) {
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