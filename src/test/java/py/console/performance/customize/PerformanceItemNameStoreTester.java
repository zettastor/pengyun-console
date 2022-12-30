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
