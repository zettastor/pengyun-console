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
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import net.sf.json.JSONArray;
import org.apache.commons.lang.StringUtils;
import org.apache.thrift.TException;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;
import org.jdom.output.Format;
import org.jdom.output.XMLOutputter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import py.console.MessageForwardItem;
import py.console.bean.Account;
import py.console.bean.DataTables;
import py.console.bean.PerformanceItem;
import py.console.bean.ResultMessage;
import py.console.bean.ZtreeDataFormat;
import py.console.service.account.AccountSessionService;
import py.console.service.alert.AlertService;
import py.console.utils.Constants;
import py.console.utils.ErrorCode2;
import py.exception.EndPointNotFoundException;
import py.exception.GenericThriftClientFactoryException;
import py.exception.TooManyEndPointFoundException;
import py.thrift.monitorserver.service.IllegalParameterExceptionThrift;
import py.thrift.share.ServiceHavingBeenShutdownThrift;
import py.thrift.share.ServiceIsNotAvailableThrift;

/**
 * AlertAction.
 */
public class AlertAction extends ActionSupport {

  private static final long serialVersionUID = 1L;
  private static final Logger logger = LoggerFactory.getLogger(AlertAction.class);

  private AccountSessionService accountSessionService;
  private AlertService alertService;

  private DataTables dataTables;
  private ResultMessage resultMessage;

  private Map<String, Object> dataMap;
  private String alertObject;
  private String ipAddress;
  private String alertRuleName;
  private String startTime;
  private String endTime;
  private String alertLevel;
  private String alertClass;
  private String acknowledge;
  private String alertClear;
  private String idsJson;

  private String baseAlertTemplateKey;
  private String performanceItem;
  private String expressOperator;
  private String isDiscardTimeFilter;
  private String name;
  private String description;
  private String levelOne;
  private String levelTwo;
  private String levelOneThreshold;
  private String levelTwoThreshold;
  private String numberOfOccurrenceThreshold;
  private String ruleType;
  private String recoveryThreshold;
  private String recoveryEventContinuousOccurTimes;
  private String recoveryRelationOperator;

  private String id;
  private String ruleId1;
  private String ruleId2;
  private String logicalOperator;
  private String configFile = "../config1.xml";
  private String resources;
  private String relayType;

  private String trapServerip;
  private String trapServerport;
  private String enable;
  private String email;
  private String phoneNum;
  private String snmpVersion;
  private String community;
  private String securityLevel;
  private String securityName;
  private String authProtocol;
  private String authKey;
  private String privProtocol;
  private String privkey;

  private String userName;
  private String pwd;
  private String port;
  private String encryptType;
  private String contentType;
  private String subject;
  private String smtpServer;
  private String alertId;
  private String timeout;
  private boolean showCsi;
  String recordsTotal = "0";

  String recordsFiltered = "0";

  public AlertAction() {
    super();
    this.dataMap = new HashMap<String, Object>();
  }

  /**
   * test Datatables.
   *
   * @return "dataMap"
   */
  public String testDatatables() {
    DataTables dataTables = new DataTables();
    logger.debug("datatables is {}", dataTables);
    if (!dataTables.isEnabled()) {
      dataMap.put("result", "wrong");
      return "dataMap";
    }
    dataMap.put("result", "ok");
    return "dataMap";

  }

  class SortByName implements Comparator<ZtreeDataFormat> {

    public int compare(ZtreeDataFormat s1, ZtreeDataFormat s2) {
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
   * save Alert Forwarding Configuration.
   *
   * @return ACTION_RETURN_STRING
   */
  // fake
  public String saveAlertForwardingConfiguration() {
    resultMessage = new ResultMessage();
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    File file = new File(configFile);
    if (!file.exists()) {
      createXml();
    }
    SAXBuilder sb = new SAXBuilder();
    Document doc = null;
    try {
      doc = sb.build(configFile);
    } catch (JDOMException | IOException e) {
      logger.error("exception catch", e);
    }
    Element root = doc.getRootElement();
    Element element = root.getChild(relayType);
    element.getChild("level").setText(alertLevel);
    element.getChild("resource").setText(resources);
    saveXml(doc);

    resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;

  }

  /**
   * get Alert Forwarding Config.
   *
   * @return ACTION_RETURN_STRING
   */
  public String getAlertForwardingConfig() {
    resultMessage = new ResultMessage();
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    File file = new File(configFile);
    if (!file.exists()) {
      createXml();
    }
    SAXBuilder sb = new SAXBuilder();
    Document doc = null;

    try {
      doc = sb.build(configFile);
      Element root = doc.getRootElement();
      Element element = root.getChild(relayType);
      String level = element.getChildText("level");
      String resource = element.getChildText("resource");
      dataMap.put("level", level);
      dataMap.put("resource", resource);
      resultMessage.setMessage(ErrorCode2.ERROR_0000_SUCCESS);

    } catch (JDOMException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }

    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;

  }

  /**
   * save Message Forward Item.
   *
   * @return ACTION_RETURN_STRING
   */
  public String saveMessageForwardItem() {
    resultMessage = new ResultMessage();
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    if (!StringUtils.isEmpty(phoneNum) && !StringUtils.isEmpty(name) && !StringUtils.isEmpty(
        enable)) {
      try {
        alertService.saveMessageForwardItem(phoneNum, name, description, Boolean.valueOf(enable));
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
        resultMessage.setMessage("ERROR_0010_InternalError");
      }
    } else {
      logger.error("Invalid input ");
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * update Message Forward Item.
   *
   * @return ACTION_RETURN_STRING
   */
  public String updateMessageForwardItem() {
    resultMessage = new ResultMessage();
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    if (!StringUtils.isEmpty(id) && !StringUtils.isEmpty(phoneNum) && !StringUtils.isEmpty(name)
        && !StringUtils
        .isEmpty(enable)) {
      try {
        alertService.updateMessageForwardItem(Long.valueOf(id), phoneNum, name, description,
            Boolean.valueOf(enable));
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
        resultMessage.setMessage("ERROR_0010_InternalError");
      }
    } else {
      logger.error("Invalid input ");
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * delete Message Forward Item.
   *
   * @return ACTION_RETURN_STRING
   */
  public String deleteMessageForwardItem() {
    resultMessage = new ResultMessage();
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<Long> idsList = new ArrayList<>();
    if (!StringUtils.isEmpty(idsJson)) {
      logger.debug("idsJson is {}", idsJson);
      JSONArray idsJsonArray = JSONArray.fromObject(idsJson);
      idsList = (List<Long>) JSONArray.toList(idsJsonArray, Long.class);
      logger.debug("idsList is {}", idsList);
      try {
        alertService.deleteMessageForwardItem(idsList);
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
        resultMessage.setMessage("ERROR_0010_InternalError");
      }
    } else {
      logger.error("Invalid input ");
      resultMessage.setMessage("ERROR_0040_InvalidInput");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * list Message Forward Item.
   *
   * @return ACTION_RETURN_STRING
   */
  public String listMessageForwardItem() {
    resultMessage = new ResultMessage();
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    List<MessageForwardItem> itemList = new ArrayList<>();

    try {
      itemList = alertService.listMessageForwardItem();
      dataMap.put("itemList", itemList);
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
      resultMessage.setMessage("ERROR_0010_InternalError");
    }
    dataMap.put("resultMessage", resultMessage);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * create Xml.
   */
  // first add volume cache type into xml
  public void createXml() {
    Element mailElement = new Element("mail");
    Element mail1 = new Element("level");
    Element mail2 = new Element("resource");
    mailElement.addContent(mail1);
    mailElement.addContent(mail2);
    Element snmpElement = new Element("snmp");
    Element snmp1 = new Element("level");
    Element snmp2 = new Element("resource");
    snmpElement.addContent(snmp1);
    snmpElement.addContent(snmp2);
    Element messageElement = new Element("message");
    Element message1 = new Element("level");
    Element message2 = new Element("resource");
    messageElement.addContent(message1);
    messageElement.addContent(message2);

    Element root = new Element("CONFIG");
    root.addContent(mailElement);
    root.addContent(snmpElement);
    root.addContent(messageElement);

    Document document = new Document();
    document.setRootElement(root);
    saveXml(document);
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
   * obtain Performance Item.
   *
   * @return ACTION_RETURN_STRING
   */
  public String obtainPerformanceItem() {
    resultMessage = new ResultMessage();
    Account account = accountSessionService.getAccount();
    if (account == null) {
      resultMessage.setMessage(ErrorCode2.ERROR_0019_SessionOut);
      dataMap.put("resultMessage", resultMessage);
      return Constants.ACTION_RETURN_STRING;
    }
    Map<String, List<PerformanceItem>> result = alertService.getPerformanceItem();
    List<PerformanceItem> simpleItem = result.get("simpleItem");
    List<PerformanceItem> baseItem = result.get("baseItem");

    dataMap.put("baseItem", baseItem);
    dataMap.put("simpleItem", simpleItem);
    return Constants.ACTION_RETURN_STRING;
  }

  public DataTables getDataTables() {
    return dataTables;
  }

  public void setDataTables(DataTables dataTables) {
    this.dataTables = dataTables;
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

  public String getAlertObject() {
    return alertObject;
  }

  public void setAlertObject(String alertObject) {
    this.alertObject = alertObject;
  }

  public String getIpAddress() {
    return ipAddress;
  }

  public void setIpAddress(String ipAddress) {
    this.ipAddress = ipAddress;
  }

  public String getAlertRuleName() {
    return alertRuleName;
  }

  public void setAlertRuleName(String alertRuleName) {
    this.alertRuleName = alertRuleName;
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

  public String getAlertLevel() {
    return alertLevel;
  }

  public void setAlertLevel(String alertLevel) {
    this.alertLevel = alertLevel;
  }

  public String getAlertClass() {
    return alertClass;
  }

  public void setAlertClass(String alertClass) {
    this.alertClass = alertClass;
  }

  public String getAcknowledge() {
    return acknowledge;
  }

  public void setAcknowledge(String acknowledge) {
    this.acknowledge = acknowledge;
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

  public String getIdsJson() {
    return idsJson;
  }

  public void setIdsJson(String idsJson) {
    this.idsJson = idsJson;
  }

  public String getBaseAlertTemplateKey() {
    return baseAlertTemplateKey;
  }

  public void setBaseAlertTemplateKey(String baseAlertTemplateKey) {
    this.baseAlertTemplateKey = baseAlertTemplateKey;
  }

  public String getPerformanceItem() {
    return performanceItem;
  }

  public void setPerformanceItem(String performanceItem) {
    this.performanceItem = performanceItem;
  }

  public String getExpressOperator() {
    return expressOperator;
  }

  public void setExpressOperator(String expressOperator) {
    this.expressOperator = expressOperator;
  }

  public String getIsDiscardTimeFilter() {
    return isDiscardTimeFilter;
  }

  public void setIsDiscardTimeFilter(String isDiscardTimeFilter) {
    this.isDiscardTimeFilter = isDiscardTimeFilter;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getLevelOne() {
    return levelOne;
  }

  public void setLevelOne(String levelOne) {
    this.levelOne = levelOne;
  }

  public String getLevelTwo() {
    return levelTwo;
  }

  public void setLevelTwo(String levelTwo) {
    this.levelTwo = levelTwo;
  }

  public String getLevelOneThreshold() {
    return levelOneThreshold;
  }

  public void setLevelOneThreshold(String levelOneThreshold) {
    this.levelOneThreshold = levelOneThreshold;
  }

  public String getLevelTwoThreshold() {
    return levelTwoThreshold;
  }

  public void setLevelTwoThreshold(String levelTwoThreshold) {
    this.levelTwoThreshold = levelTwoThreshold;
  }

  public String getNumberOfOccurrenceThreshold() {
    return numberOfOccurrenceThreshold;
  }

  public void setNumberOfOccurrenceThreshold(String numberOfOccurrenceThreshold) {
    this.numberOfOccurrenceThreshold = numberOfOccurrenceThreshold;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getRuleId1() {
    return ruleId1;
  }

  public void setRuleId1(String ruleId1) {
    this.ruleId1 = ruleId1;
  }

  public String getRuleId2() {
    return ruleId2;
  }

  public void setRuleId2(String ruleId2) {
    this.ruleId2 = ruleId2;
  }

  public String getLogicalOperator() {
    return logicalOperator;
  }

  public void setLogicalOperator(String logicalOperator) {
    this.logicalOperator = logicalOperator;
  }

  public String getRuleType() {
    return ruleType;
  }

  public void setRuleType(String ruleType) {
    this.ruleType = ruleType;
  }

  public String getResources() {
    return resources;
  }

  public void setResources(String resources) {
    this.resources = resources;

  }

  public String getRelayType() {
    return relayType;
  }

  public void setRelayType(String relayType) {
    this.relayType = relayType;
  }

  public String getTrapServerip() {
    return trapServerip;
  }

  public void setTrapServerip(String trapServerip) {
    this.trapServerip = trapServerip;
  }

  public String getTrapServerport() {
    return trapServerport;
  }

  public void setTrapServerport(String trapServerport) {
    this.trapServerport = trapServerport;
  }

  public String getEnable() {
    return enable;
  }

  public void setEnable(String enable) {
    this.enable = enable;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPhoneNum() {
    return phoneNum;
  }

  public void setPhoneNum(String phoneNum) {
    this.phoneNum = phoneNum;
  }

  public String getSnmpVersion() {
    return snmpVersion;
  }

  public void setSnmpVersion(String snmpVersion) {
    this.snmpVersion = snmpVersion;
  }

  public String getCommunity() {
    return community;
  }

  public void setCommunity(String community) {
    this.community = community;
  }

  public String getSecurityLevel() {
    return securityLevel;
  }

  public void setSecurityLevel(String securityLevel) {
    this.securityLevel = securityLevel;
  }

  public String getSecurityName() {
    return securityName;
  }

  public void setSecurityName(String securityName) {
    this.securityName = securityName;
  }

  public String getAuthProtocol() {
    return authProtocol;
  }

  public void setAuthProtocol(String authProtocol) {
    this.authProtocol = authProtocol;
  }

  public String getAuthKey() {
    return authKey;
  }

  public void setAuthKey(String authKey) {
    this.authKey = authKey;
  }

  public String getPrivProtocol() {
    return privProtocol;
  }

  public void setPrivProtocol(String privProtocol) {
    this.privProtocol = privProtocol;
  }

  public String getPrivkey() {
    return privkey;
  }

  public void setPrivkey(String privkey) {
    this.privkey = privkey;
  }

  public String getUserName() {
    return userName;
  }

  public void setUserName(String userName) {
    this.userName = userName;
  }

  public String getPwd() {
    return pwd;
  }

  public void setPwd(String pwd) {
    this.pwd = pwd;
  }

  public String getPort() {
    return port;
  }

  public void setPort(String port) {
    this.port = port;
  }

  public String getEncryptType() {
    return encryptType;
  }

  public void setEncryptType(String encryptType) {
    this.encryptType = encryptType;
  }

  public String getContentType() {
    return contentType;
  }

  public void setContentType(String contentType) {
    this.contentType = contentType;
  }

  public String getSubject() {
    return subject;
  }

  public void setSubject(String subject) {
    this.subject = subject;
  }

  public String getSmtpServer() {
    return smtpServer;
  }

  public void setSmtpServer(String smtpServer) {
    this.smtpServer = smtpServer;
  }

  public String getAlertId() {
    return alertId;
  }

  public void setAlertId(String alertId) {
    this.alertId = alertId;
  }

  public String getTimeout() {
    return timeout;
  }

  public void setTimeout(String timeout) {
    this.timeout = timeout;
  }

  public String getRecoveryThreshold() {
    return recoveryThreshold;
  }

  public void setRecoveryThreshold(String recoveryThreshold) {
    this.recoveryThreshold = recoveryThreshold;
  }


  public String getRecoveryEventContinuousOccurTimes() {
    return recoveryEventContinuousOccurTimes;
  }

  public void setRecoveryEventContinuousOccurTimes(String recoveryEventContinuousOccurTimes) {
    this.recoveryEventContinuousOccurTimes = recoveryEventContinuousOccurTimes;
  }

  public String getRecoveryRelationOperator() {
    return recoveryRelationOperator;
  }

  public void setRecoveryRelationOperator(String recoveryRelationOperator) {
    this.recoveryRelationOperator = recoveryRelationOperator;
  }

  public String getAlertClear() {
    return alertClear;
  }

  public void setAlertClear(String alertClear) {
    this.alertClear = alertClear;
  }

  public boolean isShowCsi() {
    return showCsi;
  }

  public void setShowCsi(boolean showCsi) {
    this.showCsi = showCsi;
  }
}
