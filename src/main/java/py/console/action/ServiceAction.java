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
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import py.console.bean.ResultMessage;
import py.console.bean.SimpleServiceMetadata;
import py.console.bean.SimpleServicesMetadata;
import py.console.service.account.AccountSessionService;
import py.console.service.system.ServiceService;

/**
 * ServiceAction.
 */
public class ServiceAction extends ActionSupport {

  private static final Logger logger = LoggerFactory.getLogger(ServiceAction.class);

  private AccountSessionService accountSessionService;

  private ServiceService serviceService;

  private String serviceName;

  private String hostName;

  // all type service list
  private List<SimpleServicesMetadata> servicesList;

  // list all instance of the same service
  private List<SimpleServiceMetadata> serviceList;

  private ResultMessage resultMessage;

  public ResultMessage getResultMessage() {
    return resultMessage;
  }

  public void setResultMessage(ResultMessage resultMessage) {
    this.resultMessage = resultMessage;
  }

  public String getServiceName() {
    return serviceName;
  }

  public void setServiceName(String serviceName) {
    this.serviceName = serviceName;
  }

  public String getHostName() {
    return hostName;
  }

  public void setHostName(String hostName) {
    this.hostName = hostName;
  }

  public List<SimpleServicesMetadata> getServicesList() {
    return servicesList;
  }

  public void setServicesList(List<SimpleServicesMetadata> servicesList) {
    this.servicesList = servicesList;
  }

  public List<SimpleServiceMetadata> getServiceList() {
    return serviceList;
  }

  public void setServiceList(List<SimpleServiceMetadata> serviceList) {
    this.serviceList = serviceList;
  }

  public AccountSessionService getAccountSessionService() {
    return accountSessionService;
  }

  public void setAccountSessionService(AccountSessionService accountSessionService) {
    this.accountSessionService = accountSessionService;
  }

  public ServiceService getServiceService() {
    return serviceService;
  }

  public void setServiceService(ServiceService serviceService) {
    this.serviceService = serviceService;
  }

  /**
   * activate a service.
   *
   * @return SUCCESS
   */
  public String activate() {
    logger.debug(serviceName);
    serviceService.startup(serviceName, hostName);
    return SUCCESS;
  }

  /**
   * deactivate.
   *
   * @return SUCCESS
   */
  public String deactivate() {
    serviceService.shutdown(serviceName, hostName);
    return SUCCESS;
  }

  /**
   * startup a type service.
   *
   * <p>that means activate all service with the same service name
   *
   * @return SUCCESS
   */
  public String startup() {
    serviceService.startup(serviceName);
    return SUCCESS;
  }

  /**
   * shutdown a type service.
   *
   * <p>that means deactivate all service with the same service name
   *
   * @return SUCCESS
   */
  public String shutdown() {
    serviceService.shutdown(serviceName);
    return SUCCESS;
  }

  /**
   * list all type services.
   *
   * @return "servicesList"
   */
  public String listServices() {
    servicesList = serviceService.listServices();
    if (servicesList == null || servicesList.size() == 0) {
      servicesList = new ArrayList<SimpleServicesMetadata>();
    }
    return "servicesList";
  }

  /**
   * list all instance of the same service.
   *
   * @return "serviceList"
   */
  public String listService() {
    serviceList = serviceService.listService(serviceName);
    return "serviceList";
  }

}
