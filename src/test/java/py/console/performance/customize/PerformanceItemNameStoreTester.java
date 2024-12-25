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

package py.console.performance.customize;

import java.util.UUID;
import javax.management.ObjectName;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.testng.Assert;
import py.monitor.exception.AlreadyExistedException;
import py.test.TestBase;

/**
 * PerformanceItemNameStoreTester.
 *
 */
public class PerformanceItemNameStoreTester extends TestBase {

  private static final Logger logger = LoggerFactory.getLogger(
      PerformanceItemNameStoreTester.class);


  @Test
  public void testCommitData() throws Exception {
    String path = System.getProperty("user.dir")
        + "/src/main/resources/config/PerformanceItemCustormNames.xml";
    PerformanceItemNameStore store = new PerformanceItemNameStore(path);
    store.load();
    logger.debug("Current store data is : {}", store);
    store.setName("testing performance item name store");

    try {
      PerformanceItemName item1 = new PerformanceItemName();
      item1.setId(UUID.randomUUID());
      item1.setBeanName("pojo-agent-JVM:name=MemoryTask.used");
      item1.setCustomName("performance.item.jvm.memory.used");
      store.add(item1);
      logger.debug("Current store is {}", store);
    } catch (AlreadyExistedException e) {
      logger.warn("Caught an exception", e);
    }

    logger.debug("After add testing item, the store data is : {}", store);
    store.commit();
  }

  @Test
  public void testLoadData() throws Exception {
    PerformanceItemNameStore store = createStore();
    logger.debug("{}", store);
  }

  @Test
  public void testGetCustomizedNameByBeanName() throws Exception {
    PerformanceItemNameStore store = createStore();

    String customizedName = store.getCustomizedNameByBeanName(
        "NOTpojo-agent-JVM:name=CPUTask.cpuUsage");
    Assert.assertEquals(customizedName, "performance.item.jvm.cpu.usage");
  }

  @Test
  public void testGetIdByBeanName() throws Exception {
    PerformanceItemNameStore store = createStore();

    UUID id = store.getIdByBeanName("NOTpojo-agent-JVM:name=CPUTask.cpuUsage");
    Assert.assertEquals(id, UUID.fromString("c2fa2bf5-4e3d-49e0-bc24-7b5047bc44d7"));
  }

  @Test
  public void testObjectName() throws Exception {
    ObjectName objectName = new ObjectName("TestDomain:name=testName");
    String name = objectName.getKeyProperty("name");
    logger.debug("{}", name);
    Assert.assertEquals(name, "testName");
  }

  @Test
  public void testGenerateUuid() {
    for (int i = 0; i < 20; ++i) {
      UUID id = UUID.randomUUID();
      logger.debug("{}", id);
    }
  }

  private PerformanceItemNameStore createStore() throws Exception {
    String path = System.getProperty("user.dir")
        + "/src/main/resources/config/PerformanceItemCustormNames.xml";
    PerformanceItemNameStore store = new PerformanceItemNameStore(path);
    store.load();

    return store;
  }
}
