
package py.console.action;

import com.opensymphony.xwork2.ActionSupport;

/**
 * this action used to change the page language support two languages, English and Chinese.
 *
 */
@SuppressWarnings("serial")
public class LangAction extends ActionSupport {

  public String execute() {
    return SUCCESS;
  }

}
