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
