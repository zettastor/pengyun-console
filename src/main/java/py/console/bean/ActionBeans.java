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

package py.console.bean;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.PropertySource;
import org.springframework.scheduling.annotation.EnableScheduling;
import py.console.action.AccountAction;
import py.console.action.AlarmAction;
import py.console.action.AlertAction;
import py.console.action.BackupAppPidAction;
import py.console.action.CapacityAction;
import py.console.action.ConfigurationAction;
import py.console.action.DiskAction;
import py.console.action.DomainAction;
import py.console.action.DriverAction;
import py.console.action.DtoLogAction;
import py.console.action.DtoUserAction;
import py.console.action.InstanceAction;
import py.console.action.LicenseAction;
import py.console.action.LoginAction;
import py.console.action.OperationAction;
import py.console.action.PerformanceAction;
import py.console.action.PerformanceTaskAction;
import py.console.action.QosAction;
import py.console.action.StoragePoolAction;
import py.console.action.VolumeAccessRuleAction;
import py.console.action.VolumeAction;
import py.console.action.ZookeeperStatusAction;
import py.console.config.ServiceBeans;
import py.console.service.access.rule.impl.VolumeAccessRuleServiceImpl;
import py.console.service.account.impl.AccountServiceImpl;
import py.console.service.account.impl.AccountSessionServiceImpl;
import py.console.service.alarm.impl.AlarmServiceImpl;
import py.console.service.alert.imp.AlertServiceImpl;
import py.console.service.alert.imp.DtoLogServiceImpl;
import py.console.service.alert.imp.DtoUserServiceImpl;
import py.console.service.checkservice.impl.CheckStatusServiceImpl;
import py.console.service.configuration.impl.ConfigurationServiceImpl;
import py.console.service.disk.impl.DiskServiceImpl;
import py.console.service.domain.impl.DomainServiceImpl;
import py.console.service.driver.impl.DriverServiceImpl;
import py.console.service.instance.impl.InstanceServiceImpl;
import py.console.service.license.impl.LicenseServiceImpl;
import py.console.service.operation.impl.OperationServiceImpl;
import py.console.service.performance.impl.PerformanceServiceImpl;
import py.console.service.qos.impl.QosServiceImpl;
import py.console.service.storagepool.impl.StoragePoolServiceImpl;
import py.console.service.system.impl.SystemServiceImpl;
import py.console.service.volume.impl.VolumeServiceImpl;

/**
 * ActionBeans.
 */
@Configuration
@EnableScheduling
@PropertySource({"classpath:config/console.properties"})
@Import({ServiceBeans.class})
public class ActionBeans {

  private static final Logger logger = LoggerFactory.getLogger(ActionBeans.class);
  @Autowired
  private AccountSessionServiceImpl accountSessionService;

  @Autowired
  private AccountServiceImpl accountService;

  @Autowired
  private InstanceServiceImpl instanceService;

  @Autowired
  private PerformanceServiceImpl performanceService;

  @Autowired
  private VolumeServiceImpl volumeService;

  @Autowired
  private SystemServiceImpl systemService;

  @Autowired
  private VolumeAccessRuleServiceImpl volumeAccessRuleService;

  @Autowired
  private LicenseServiceImpl licenseService;

  @Autowired
  private DiskServiceImpl diskService;

  @Autowired
  private DomainServiceImpl domainService;

  @Autowired
  private StoragePoolServiceImpl storagePoolService;

  @Autowired
  private AlarmServiceImpl alarmService;

  @Autowired
  private ConfigurationServiceImpl configService;

  @Autowired
  private OperationServiceImpl operationService;

  @Autowired
  private AlertServiceImpl alertService;

  @Autowired
  private QosServiceImpl qosService;

  @Autowired
  private DriverServiceImpl driverService;


  @Autowired
  private DtoUserServiceImpl dtoUserService;

  @Autowired
  private DtoLogServiceImpl dtoLogService;

  @Autowired
  private CheckStatusServiceImpl checkStatusService;

  /**
   * backup App PidAction.
   *
   * @return BackupAppPidAction
   */
  @Bean
  public BackupAppPidAction backupAppPidAction() {
    BackupAppPidAction backupAppPidAction = new BackupAppPidAction();
    backupAppPidAction.backup();
    return backupAppPidAction;
  }

  /**
   * login Action.
   *
   * @return LoginAction
   */
  @Bean
  public LoginAction loginAction() {
    LoginAction loginAction = new LoginAction();
    loginAction.setAccountSessionService(accountSessionService);
    loginAction.setAccountService(accountService);
    return loginAction;
  }

  /**
   * account Action.
   *
   * @return AccountAction
   */
  @Bean
  public AccountAction accountAction() {
    AccountAction accountAction = new AccountAction();
    accountAction.setAccountSessionService(accountSessionService);
    accountAction.setAccountService(accountService);
    return accountAction;
  }

  /**
   * instance Action.
   *
   * @return InstanceAction
   */
  @Bean
  public InstanceAction instanceAction() {
    InstanceAction instanceAction = new InstanceAction();
    instanceAction.setInstanceService(instanceService);
    instanceAction.setAccountSessionService(accountSessionService);
    return instanceAction;
  }

  /**
   * performance Action.
   *
   * @return PerformanceAction
   */
  @Bean
  public PerformanceAction performanceAction() {
    PerformanceAction performanceAction = new PerformanceAction();
    performanceAction.setPerformanceService(performanceService);
    performanceAction.setAccountSessionService(accountSessionService);
    return performanceAction;
  }

  /**
   * volume Action.
   *
   * @return VolumeAction
   */
  @Bean
  public VolumeAction volumeAction() {
    VolumeAction volumeAction = new VolumeAction();
    volumeAction.setVolumeService(volumeService);
    volumeAction.setInstanceService(instanceService);
    volumeAction.setAccountSessionService(accountSessionService);
    volumeAction.setDomainService(domainService);
    return volumeAction;
  }

  /**
   * alarm Action.
   *
   * @return AlarmAction
   */
  @Bean
  public AlarmAction alarmAction() {
    AlarmAction alarmAction = new AlarmAction();
    alarmAction.setAccountSessionService(accountSessionService);
    alarmAction.setAlarmService(alarmService);
    return alarmAction;
  }

  /**
   * configuration Action.
   *
   * @return ConfigurationAction
   */
  @Bean
  public ConfigurationAction configurationAction() {
    ConfigurationAction configurationAction = new ConfigurationAction();
    configurationAction.setConfigurationService(configService);
    configurationAction.setInstanceService(instanceService);
    return configurationAction;
  }

  /**
   * capacity Action.
   *
   * @return CapacityAction
   */
  @Bean
  public CapacityAction capacityAction() {
    CapacityAction capacityAction = new CapacityAction();
    capacityAction.setSystemService(systemService);
    capacityAction.setAccountSessionService(accountSessionService);
    capacityAction.setDiskService(diskService);
    capacityAction.setAlertService(alertService);
    capacityAction.setStoragePoolService(storagePoolService);
    capacityAction.setInstanceService(instanceService);
    capacityAction.setVolumeAccessRuleService(volumeAccessRuleService);
    return capacityAction;
  }

  /**
   * volume Access Rule Action.
   *
   * @return VolumeAccessRuleAction
   */
  @Bean
  public VolumeAccessRuleAction volumeAccessRuleAction() {
    VolumeAccessRuleAction volumeAccessRuleAction = new VolumeAccessRuleAction();
    volumeAccessRuleAction.setVolumeAccessRuleService(volumeAccessRuleService);
    volumeAccessRuleAction.setAccountSessionService(accountSessionService);
    return volumeAccessRuleAction;
  }

  /**
   * license Action.
   *
   * @return LicenseAction
   */
  @Bean
  public LicenseAction licenseAction() {
    LicenseAction licenseAction = new LicenseAction();
    licenseAction.setLicenseService(licenseService);
    licenseAction.setAccountSessionService(accountSessionService);
    return licenseAction;
  }

  /**
   * domain Action.
   *
   * @return DomainAction
   */
  @Bean
  public DomainAction domainAction() {
    DomainAction domainAction = new DomainAction();
    domainAction.setDomainService(domainService);
    domainAction.setAccountSessionService(accountSessionService);
    return domainAction;
  }

  /**
   * storage Pool Action.
   *
   * @return StoragePoolAction
   */
  @Bean
  public StoragePoolAction storagePoolAction() {
    StoragePoolAction storagePoolAction = new StoragePoolAction();
    storagePoolAction.setStoragePoolService(storagePoolService);
    storagePoolAction.setDiskService(diskService);
    storagePoolAction.setAccountSessionService(accountSessionService);
    storagePoolAction.setInstanceService(instanceService);
    return storagePoolAction;
  }

  @Bean
  OperationAction operationAction() {
    OperationAction operationAction = new OperationAction();
    operationAction.setOperationService(operationService);
    operationAction.setAccountSessionService(accountSessionService);
    return operationAction;
  }

  /**
   * disk Action.
   *
   * @return DiskAction
   */
  @Bean
  public DiskAction diskAction() {
    DiskAction diskAction = new DiskAction();
    diskAction.setDiskService(diskService);
    diskAction.setAccountSessionService(accountSessionService);
    diskAction.setInstanceService(instanceService);
    return diskAction;
  }

  /**
   * alert Action.
   *
   * @return AlertAction
   */
  @Bean
  public AlertAction alertAction() {
    AlertAction alertAction = new AlertAction();
    alertAction.setAccountSessionService(accountSessionService);
    alertAction.setAlertService(alertService);
    return alertAction;
  }

  /**
   * performance Task Action.
   *
   * @return PerformanceTaskAction
   */
  @Bean
  public PerformanceTaskAction performanceTaskAction() {
    PerformanceTaskAction performanceTaskAction = new PerformanceTaskAction();
    performanceTaskAction.setAccountSessionService(accountSessionService);
    performanceTaskAction.setAlertService(alertService);
    performanceTaskAction.setInstanceService(instanceService);
    return performanceTaskAction;
  }

  /**
   * qos Action.
   *
   * @return QosAction
   */
  @Bean
  public QosAction qosAction() {
    QosAction qosAction = new QosAction();
    qosAction.setAccountSessionService(accountSessionService);
    qosAction.setQosService(qosService);
    return qosAction;
  }

  /**
   * driver Action.
   *
   * @return DriverAction
   */
  @Bean
  public DriverAction driverAction() {
    DriverAction driverAction = new DriverAction();
    driverAction.setDriverService(driverService);
    driverAction.setAccountSessionService(accountSessionService);
    driverAction.setInstanceService(instanceService);
    return driverAction;
  }

  /**
   * dto User Action.
   *
   * @return DtoUserAction
   */
  @Bean
  public DtoUserAction dtoUserAction() {
    DtoUserAction dtoUserAction = new DtoUserAction();
    dtoUserAction.setAccountSessionService(accountSessionService);
    dtoUserAction.setDtoUserService(dtoUserService);
    return dtoUserAction;
  }

  /**
   * dto Log Action.
   *
   * @return DtoLogAction
   */
  @Bean
  public DtoLogAction dtoLogAction() {
    DtoLogAction dtoLogAction = new DtoLogAction();
    dtoLogAction.setAccountSessionService(accountSessionService);
    dtoLogAction.setDtoLogService(dtoLogService);
    return dtoLogAction;
  }

  /**
   * zookeeper Status Action.
   *
   * @return ZookeeperStatusAction
   */
  @Bean
  public ZookeeperStatusAction zookeeperStatusAction() {
    ZookeeperStatusAction zookeeperStatusAction = new ZookeeperStatusAction();
    zookeeperStatusAction.setAccountSessionService(accountSessionService);
    zookeeperStatusAction.setCheckStatusService(checkStatusService);
    logger.warn("get the zookeeperStatusAction:{}", checkStatusService);
    return zookeeperStatusAction;
  }
}