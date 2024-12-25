/**
* Copyright (C) 2013-2024 Nanjing Pengyun Network Technology Co., Ltd.
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
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
