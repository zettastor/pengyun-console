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
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import py.console.bean.ResultMessage;
import py.console.service.account.AccountSessionService;
import py.console.service.license.LicenseService;

/**
 * LicenseAction.
 */
@SuppressWarnings("serial")
public class LicenseAction extends ActionSupport {

  private static final Logger logger = LoggerFactory.getLogger(LicenseAction.class);

  private AccountSessionService accountSessionService;

  private LicenseService licenseService;

  private ResultMessage resultMessage;

  private String serializedLicense;

  private String sequenceNumber;

  private String licensePath;
  private String content;
  private String licenseInner;
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

  public String getSequenceNumber() {
    return sequenceNumber;
  }

  public void setSequenceNumber(String sequenceNumber) {
    this.sequenceNumber = sequenceNumber;
  }

  public String getLicensePath() {
    return licensePath;
  }

  public void setLicensePath(String licensePath) {
    this.licensePath = licensePath;
  }

  public String getSerializedLicense() {
    return serializedLicense;
  }

  public void setSerializedLicense(String serializedLicense) {
    this.serializedLicense = serializedLicense;
  }

  public static Logger getLogger() {
    return logger;
  }

  public AccountSessionService getAccountSessionService() {
    return accountSessionService;
  }

  public void setAccountSessionService(AccountSessionService accountSessionService) {
    this.accountSessionService = accountSessionService;
  }

  public LicenseService getLicenseService() {
    return licenseService;
  }

  public void setLicenseService(LicenseService licenseService) {
    this.licenseService = licenseService;
  }

  public ResultMessage getResultMessage() {
    return resultMessage;
  }

  public void setResultMessage(ResultMessage resultMessage) {
    this.resultMessage = resultMessage;
  }

  public LicenseAction() {
    super();
    this.dataMap = new HashMap<String, Object>();
  }

}
