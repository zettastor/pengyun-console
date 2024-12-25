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

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import py.processmanager.Pmdb;
import py.processmanager.exception.PmdbPathNotExist;
import py.processmanager.utils.PmUtils;

/**
 * BackupAppPidAction.
 */
public class BackupAppPidAction {

  private String serviceRunningPath = System.getProperty("user.dir");

  /**
   * backup.
   */
  public void backup() {
    // backup service process pid
    int currentProcessPid = PmUtils.getCurrentProcessPid();
    String backupStatusFileStr = serviceRunningPath + "/" + Pmdb.SERVICE_PID_NAME;

    try {
      Files.deleteIfExists(Paths.get(backupStatusFileStr));
    } catch (IOException e) {
      System.out.println("Failed to delete service status file when backup service status");
      System.exit(0);
    }

    try {
      Pmdb pmdb = Pmdb.build(Paths.get(serviceRunningPath));
      pmdb.save(Pmdb.SERVICE_PID_NAME, String.valueOf(currentProcessPid));
    } catch (PmdbPathNotExist e) {
      System.out.println("fail to backup service process pid");

      try {
        Files.deleteIfExists(Paths.get(backupStatusFileStr));
      } catch (IOException e1) {
        System.out.println("Failed to delete service status file when fail to start service");
      }
      System.exit(0);
    }
  }
}
