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

'use strict';

angular.module('app.storage').service('goPage', function(translate) {
   	$.extend(true, $.fn.dataTable.defaults, {
		"dom": "<'row'<'col-md-6 col-sm-6'l><'col-md-6 col-sm-6'f>r><'table-scrollable't><'row'<'col-md-5 col-sm-5'i><'col-md-7 col-sm-7'p>>", 
		"language": {
			"lengthMenu": " _MENU_ records ",
			"paginate": {
				"previous": '<i class="fa fa-angle-left"></i>',
				"next": '<i class="fa fa-angle-right"></i>'
			}
		}
	});

	$.extend($.fn.dataTableExt.oStdClasses, {
		"sWrapper": "dataTables_wrapper",
		"sFilterInput": "form-control input-small input-inline",
		"sLengthSelect": "form-control input-xsmall input-inline"
	});

	$.fn.dataTable.defaults.renderer = 'bootstrap';
	$.fn.dataTable.ext.renderer.pageButton.bootstrap = function (settings, host, idx, buttons, page, pages) {
		var api = new $.fn.dataTable.Api(settings);
		var classes = settings.oClasses;
		var lang = settings.oLanguage.oPaginate;
		var btnDisplay, btnClass;

		var attach = function (container, buttons) {
			var i, ien, node, button;
			var clickHandler = function (e) {
				e.preventDefault();
				if (e.data.action !== 'ellipsis') {
					api.page(e.data.action).draw(false);
				}
			};

			for (i = 0, ien = buttons.length; i < ien; i++) {
				button = buttons[i];

				if ($.isArray(button)) {
					attach(container, button);
				} else {
					btnDisplay = '';
					btnClass = '';

					switch (button) {
					case 'ellipsis':
						btnDisplay = '&hellip;';
						btnClass = 'disabled';
						break;

					case 'first':
						btnDisplay = lang.sFirst;
						btnClass = button + (page > 0 ?
							'' : ' disabled');
						break;

					case 'previous':
						btnDisplay = lang.sPrevious;
						btnClass = button + (page > 0 ?
							'' : ' disabled');
						break;

					case 'next':
						btnDisplay = lang.sNext;
						btnClass = button + (page < pages - 1 ?
							'' : ' disabled');
						break;

					case 'last':
						btnDisplay = lang.sLast;
						btnClass = button + (page < pages - 1 ?
							'' : ' disabled');
						break;

					default:
						btnDisplay = button + 1;
						btnClass = page === button ?
							'active' : '';
						break;
					}

					if (btnDisplay) {
						node = $('<li>', {
							'class': classes.sPageButton + ' ' + btnClass,
							'aria-controls': settings.sTableId,
							'tabindex': settings.iTabIndex,
							'id': idx === 0 && typeof button === 'string' ?
								settings.sTableId + '_' + button : null
						})
							.append($('<a>', {
									'href': '#'
								})
								.html(btnDisplay)
						)
							.appendTo(container);

						settings.oApi._fnBindAction(
							node, {
								action: button
							}, clickHandler
						);
					}
					if($("#redirect")!=null)
					$(".gotoPage").remove();
					var pageHtml="<li class=\"gotoPage\" style=\"display:none\">" 
					+"<span style='border-radius:0 4px 4px 0;'>"+translate.getWord("jumpPage.left")+"<input type=\"text\" style='border-radius:2px;width: 20px;height: 16px;margin:-1px 5px;text-align: center;border:1px solid #ccc;' id=\"redirect\" class=\"redirect\">"+translate.getWord("jumpPage.right")+"</span></li>";
					$(pageHtml).appendTo(container); 

				}
			}
		};

		attach(
			$(host).empty().html('<ul class="pagination"/>').children('ul'),
			buttons
		);
	}

	if ($.fn.DataTable.TableTools) {
		// Set the classes that TableTools uses to something suitable for Bootstrap
		$.extend(true, $.fn.DataTable.TableTools.classes, {
			"container": "DTTT btn-group",
			"buttons": {
				"normal": "btn btn-default",
				"disabled": "disabled"
			},
			"collection": {
				"container": "DTTT_dropdown dropdown-menu",
				"buttons": {
					"normal": "",
					"disabled": "disabled"
				}
			},
			"print": {
				"info": "DTTT_Print_Info"  
			},
			"select": {
				"row": "active"
			}
		});

		// Have the collection use a bootstrap compatible dropdown
		$.extend(true, $.fn.DataTable.TableTools.DEFAULTS.oTags, {
			"collection": {
				"container": "ul",
				"button": "li",
				"liner": "a"
			}
		});
	}

	$.fn.dataTableExt.oApi.fnPagingInfo = function (oSettings) {
		return {
			"iStart": oSettings._iDisplayStart,
			"iEnd": oSettings.fnDisplayEnd(),
			"iLength": oSettings._iDisplayLength,
			"iTotal": oSettings.fnRecordsTotal(),
			"iFilteredTotal": oSettings.fnRecordsDisplay(),
			"iPage": oSettings._iDisplayLength === -1 ?
				0 : Math.ceil(oSettings._iDisplayStart / oSettings._iDisplayLength),
			"iTotalPages": oSettings._iDisplayLength === -1 ?
				0 : Math.ceil(oSettings.fnRecordsDisplay() / oSettings._iDisplayLength)
		};
	};

	
	
	this.goTo=function(id){
		var oTable = $("#"+id).dataTable();
		$(".gotoPage").css("display","inline")
		$('#redirect').keyup(function(e){
			if(e.keyCode==13){
				if($(this).val() && $(this).val()>0){
					var redirectpage = $(this).val()-1;
				}else{
					var redirectpage = 0;
				}
				oTable.fnPageChange( redirectpage );
			}
		});
	}

});


