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

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import py.console.bean.ResultMessage;
import py.console.bean.SimpleConfiguration;
import py.console.bean.SimpleConfigurationResult;
import py.console.service.configuration.impl.ConfigurationServiceImpl;
import py.console.service.instance.impl.InstanceServiceImpl;
import py.console.utils.ErrorCode2;
import py.thrift.share.InvalidInputExceptionThrift;

/**
 * ConfigurationAction.
 */
public class ConfigurationAction {

  private static final Logger logger = LoggerFactory.getLogger(ConfigurationAction.class);

  private List<SimpleConfiguration> resultOfGetConfiguration;
  private List<SimpleConfigurationResult> resultOfSetConfiguration;
  private ResultMessage resultMessage;
  private String configurationsOfSet;
  private String conditionsOfGet;

  private InstanceServiceImpl instanceService;
  private ConfigurationServiceImpl configurationService;

  // public String getConfiguration() {
  // try {
  // resultOfGetConfiguration = configurationService.getConfiguration(conditionsOfGet);
  // logger.error("All formatted conditions are : {}", resultOfGetConfiguration);
  // return "resultOfGetConfiguration";
  // } catch (InvalidInputExceptionThrift e) {
  // logger.error("Caught an exception", e);
  // resultMessage.setMessage(ErrorCode2.ERROR_0040_InvalidInput);
  // return "resultMessage";
  // } catch (Exception e) {
  // logger.error("Caught an exception", e);
  // resultMessage.setMessage(ErrorCode2.ERROR_0010_InternalError);
  // return "resultMessage";
  // }
  // }

  /**
   * set Configuration.
   *
   * @return "resultMessage"
   */
  public String setConfiguration() {
    try {
      logger.error("unformatted configurations from browser is : {}", configurationsOfSet);
      configurationService.setInstanceService(instanceService);
      resultOfSetConfiguration = configurationService.setConfiguration(configurationsOfSet);
      logger.error("All formatted configurations are : {}", resultOfSetConfiguration);
      return "resultOfSetConfiguration";
    } catch (InvalidInputExceptionThrift e) {
      logger.error("Caught an exception", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0040_InvalidInput);
      return "resultMessage";
    } catch (Exception e) {
      logger.error("Caught an exception", e);
      resultMessage.setMessage(ErrorCode2.ERROR_0010_InternalError);
      return "resultMessage";
    }
  }

  public String getConfigurationsOfSet() {
    return configurationsOfSet;
  }

  public void setConfigurationsOfSet(String configurationsOfSet) {
    this.configurationsOfSet = configurationsOfSet;
  }

  public List<SimpleConfiguration> getResultOfGetConfiguration() {
    return resultOfGetConfiguration;
  }

  public void setResultOfGetConfiguration(List<SimpleConfiguration> resultOfGetConfiguration) {
    this.resultOfGetConfiguration = resultOfGetConfiguration;
  }

  public List<SimpleConfigurationResult> getResultOfSetConfiguration() {
    return resultOfSetConfiguration;
  }

  public void setResultOfSetConfiguration(
      List<SimpleConfigurationResult> resultOfSetConfiguration) {
    this.resultOfSetConfiguration = resultOfSetConfiguration;
  }

  public String getConditionsOfGet() {
    return conditionsOfGet;
  }

  public void setConditionsOfGet(String conditionsOfGet) {
    this.conditionsOfGet = conditionsOfGet;
  }

  public ConfigurationServiceImpl getConfigurationService() {
    return configurationService;
  }

  public void setConfigurationService(ConfigurationServiceImpl configurationService) {
    this.configurationService = configurationService;
  }

  public ResultMessage getResultMessage() {
    return resultMessage;
  }

  public void setResultMessage(ResultMessage resultMessage) {
    this.resultMessage = resultMessage;
  }

  public InstanceServiceImpl getInstanceService() {
    return instanceService;
  }

  public void setInstanceService(InstanceServiceImpl instanceService) {
    this.instanceService = instanceService;
  }

}
