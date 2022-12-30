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
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import py.console.bean.Account;
import py.console.bean.Performance;
import py.console.bean.PerformanceRealTime;
import py.console.bean.Performances;
import py.console.service.account.AccountSessionService;
import py.console.service.performance.PerformanceService;
import py.console.utils.Constants;

/**
 * PerformanceAction.
 *
 */
@SuppressWarnings("serial")
public class PerformanceAction extends ActionSupport {

  private static final Logger logger = LoggerFactory.getLogger(PerformanceAction.class);

  private AccountSessionService accountSessionService;

  private PerformanceService performanceService;

  private String volumeId;

  private String volumeName;

  private String sortBy;

  private String sortOrder;

  private Map<String, Object> dataMap;

  public Map<String, Object> getDataMap() {
    return dataMap;
  }

  public void setDataMap(Map<String, Object> dataMap) {
    this.dataMap = dataMap;
  }

  public String getVolumeId() {
    return volumeId;
  }

  public void setVolumeId(String volumeId) {
    this.volumeId = volumeId;
  }

  public String getSortBy() {
    return sortBy;
  }

  public void setSortBy(String sortBy) {
    this.sortBy = sortBy;
  }

  public String getSortOrder() {
    return sortOrder;
  }

  public void setSortOrder(String sortOrder) {
    this.sortOrder = sortOrder;
  }

  private List<Performance> performanceList;

  private Performances performances;

  private PerformanceRealTime performanceRealTime;

  public AccountSessionService getAccountSessionService() {
    return accountSessionService;
  }

  public void setAccountSessionService(AccountSessionService accountSessionService) {
    this.accountSessionService = accountSessionService;
  }

  public PerformanceService getPerformanceService() {
    return performanceService;
  }

  /**
   * set Performance Service.
   *
   * @param performanceServcie Performance Service
   */
  public void setPerformanceService(PerformanceService performanceServcie) {
    if (performanceServcie == null) {
      logger.error("performanceService is null");
    }
    this.performanceService = performanceServcie;
  }

  public List<Performance> getPerformanceList() {
    return performanceList;
  }

  public void setPerformanceList(List<Performance> performanceList) {
    this.performanceList = performanceList;
  }

  public Performances getPerformances() {
    return performances;
  }

  public void setPerformances(Performances performances) {
    this.performances = performances;
  }

  public PerformanceRealTime getPerformanceRealTime() {
    return performanceRealTime;
  }

  public void setPerformanceRealTime(PerformanceRealTime performanceRealTime) {
    this.performanceRealTime = performanceRealTime;
  }

  public String getVolumeName() {
    return volumeName;
  }

  public void setVolumeName(String volumeName) {
    this.volumeName = volumeName;
  }

  public PerformanceAction() {
    super();
    this.dataMap = new HashMap<String, Object>();
  }

  /**
   * get the IOPS and Throughput in the past one hour for the selected volume.
   *
   * @return ACTION_RETURN_STRING
   */
  public String pullPerformances() {
    Account accountFromSession = accountSessionService.getAccount();
    if (accountFromSession == null) {
      logger.error("Failed to get account session");
    }
    String account = accountFromSession.getAccountId();

    if (account != null) {
      if (performanceService == null) {
        logger.error("performanceService is null");
        return ERROR;
      }
      try {
        performances = performanceService.pullPerformances(Long.parseLong(volumeId),
            Long.parseLong(volumeId));
      } catch (Exception e) {
        logger.error("pull performance failed ", e);
        return ERROR;
      }
    }
    dataMap.put("performances", performances);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * get the real time read/write latency and health status for the selected volume.
   *
   * @return ACTION_RETURN_STRING
   */
  public String pullPerformanceRealTime() {
    Account accountFromSession = accountSessionService.getAccount();
    if (accountFromSession == null) {
      logger.error("Failed to get account session");
      return ERROR;
    }
    String account = accountFromSession.getAccountId();

    if (account != null) {

      if (performanceService == null) {
        logger.error("performanceService is null");
        return ERROR;
      }
      try {
        performanceRealTime = performanceService.pullPerformanceRealTime(Long.parseLong(account),
            Long.parseLong(volumeId));
      } catch (Exception e) {
        logger.error("get performance failed ", e);
        return ERROR;
      }
    }
    dataMap.put("performanceRealTime", performanceRealTime);
    return Constants.ACTION_RETURN_STRING;
  }

  /**
   * list.
   *
   * @return ACTION_RETURN_STRING
   */
  public String list() {
    Account accountFromSession = accountSessionService.getAccount();
    if (accountFromSession == null) {
      logger.error("Failed to get account session");
      return ERROR;
    }
    String account = accountFromSession.getAccountId();

    if (account != null) {
      List<Performance> performanceListOri = new ArrayList<Performance>();
      if (performanceService == null) {
        logger.error("performanceService is null");
        return ERROR;
      }
      try {
        performanceListOri = performanceService.getAll(Long.parseLong(account));
      } catch (Exception e) {
        logger.error("get performanceListOri failed ", e);
        return ERROR;
      }
      // got a available filter parameter
      if ((volumeName != null) && (!volumeName.equals(""))) {
        List<Performance> performanceListSub = new ArrayList<Performance>();
        for (Performance performance : performanceListOri) {
          logger.debug("begin to match volumeName[{}] performance.volumeName [{}]@{}", volumeName,
              performance.getVolumeName(), performance.toString());
          if (volumeName.equals(performance.getVolumeName())) {
            performanceListSub.add(performance);
            logger.debug("add performance to subList {}", performance.toString());
            break;
          }
        }
        performanceList = performanceListSub;
      } else {
        // got nothing and return the whole list to jsp
        performanceList = performanceListOri;
      }
    } else {
      logger.error("can't get account id");
      return ERROR;
    }
    if (sortBy != null) {
      switch (sortBy) {
        case "name":
          Collections.sort(performanceList, new SortByName());
          break;
        case "writeThroughput":
          Collections.sort(performanceList, new SortByWriteThroughput());
          break;
        case "readThroughput":
          Collections.sort(performanceList, new SortByReadThroughput());
          break;
        case "writeIOPS":
          Collections.sort(performanceList, new SortByWriteIoPs());
          break;
        case "readIOPS":
          Collections.sort(performanceList, new SortByReadIoPs());
          break;
        case "readLatency":
          Collections.sort(performanceList, new SortByReadLatency());
          break;
        case "writeLatency":
          Collections.sort(performanceList, new SortByWriteLatency());
          break;
        default:
          Collections.sort(performanceList, new SortByName());
      }
    }
    dataMap.put("performanceList", performanceList);
    return Constants.ACTION_RETURN_STRING;
  }

  class SortByName implements Comparator<Performance> {

    public int compare(Performance s1, Performance s2) {
      if (s1.getVolumeName().compareToIgnoreCase(s2.getVolumeName()) > 0) {
        if (sortOrder.equals("up")) {
          return 1;
        }
        return -1;
      }
      if (sortOrder.equals("up")) {
        return -1;
      }
      return 1;
    }
  }

  class SortByWriteThroughput implements Comparator<Performance> {

    public int compare(Performance s1, Performance s2) {
      if (s1.getWriteThroughput() > s2.getWriteThroughput()) {
        if (sortOrder.equals("up")) {
          return 1;
        }
        return -1;
      }
      if (sortOrder.equals("up")) {
        return -1;
      }
      return 1;
    }
  }

  class SortByReadThroughput implements Comparator<Performance> {

    public int compare(Performance s1, Performance s2) {
      if (s1.getReadThroughput() > s2.getReadThroughput()) {
        if (sortOrder.equals("up")) {
          return 1;
        }
        return -1;
      }
      if (sortOrder.equals("up")) {
        return -1;
      }
      return 1;
    }
  }

  class SortByWriteLatency implements Comparator<Performance> {

    public int compare(Performance s1, Performance s2) {
      if (s1.getWriteLatency() > s2.getWriteLatency()) {
        if (sortOrder.equals("up")) {
          return 1;
        }
        return -1;
      }
      if (sortOrder.equals("up")) {
        return -1;
      }
      return 1;
    }
  }

  class SortByReadLatency implements Comparator<Performance> {

    public int compare(Performance s1, Performance s2) {
      if (s1.getReadLatency() > s2.getReadLatency()) {
        if (sortOrder.equals("up")) {
          return 1;
        }
        return -1;
      }
      if (sortOrder.equals("up")) {
        return -1;
      }
      return 1;
    }
  }

  class SortByWriteIoPs implements Comparator<Performance> {

    public int compare(Performance s1, Performance s2) {
      if (s1.getWriteIoPs() > s2.getWriteIoPs()) {
        if (sortOrder.equals("up")) {
          return 1;
        }
        return -1;
      }
      if (sortOrder.equals("up")) {
        return -1;
      }
      return 1;
    }
  }

  class SortByReadIoPs implements Comparator<Performance> {

    public int compare(Performance s1, Performance s2) {
      if (s1.getReadIoPs() > s2.getReadIoPs()) {
        if (sortOrder.equals("up")) {
          return 1;
        }
        return -1;
      }
      if (sortOrder.equals("up")) {
        return -1;
      }
      return 1;
    }
  }

}
